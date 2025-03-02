import { getFirebaseAuth, getFirebaseDB, getFirebaseStorage } from '../config/initializeFirebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import * as ImageManipulator from 'expo-image-manipulator';

console.log('[Posts] Initializing Firebase services...');
const auth = getFirebaseAuth();
const db = getFirebaseDB();
const storage = getFirebaseStorage();

console.log('[Posts] Firebase services initialized with:', { 
  hasAuth: !!auth, 
  hasDB: !!db, 
  hasStorage: !!storage 
});

const uploadMedia = async (file, userId) => {
  console.log('[Posts] Starting media upload:', { type: file.type });
  
  try {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${random}`;
    const path = `posts/${userId}/${filename}`;
    
    console.log('[Posts] Uploading to:', path);
    
    const response = await fetch(file.uri);
    const blob = await response.blob();
    console.log('[Posts] Blob created:', { 
      size: blob.size, 
      type: blob.type 
    });

    const storageRef = ref(storage, path);
    const metadata = {
      contentType: file.type || 'image/jpeg',
      customMetadata: {
        originalName: filename,
        uploadedBy: userId,
        timestamp: timestamp.toString()
      }
    };

    console.log('[Posts] Starting upload with metadata:', metadata);
    const uploadResult = await uploadBytes(storageRef, blob, metadata);
    console.log('[Posts] Upload complete:', uploadResult);

    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('[Posts] Got download URL:', downloadURL);

    return {
      url: downloadURL,
      path: path,
      type: file.type || 'image/jpeg'
    };
  } catch (error) {
    console.error('[Posts] Media upload failed:', {
      code: error.code,
      message: error.message,
      serverResponse: error.serverResponse
    });
    throw new Error(`Upload failed: ${error.message}`);
  }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const createPost = async (content, mediaFile) => {
  console.log('[Posts] Starting post creation:', { 
    hasContent: !!content, 
    hasMedia: !!mediaFile,
    mediaSize: mediaFile?.size,
    mediaType: mediaFile?.type
  });

  if (!auth.currentUser) {
    throw new Error('Must be logged in to create posts');
  }

  try {
    let mediaUrl = null;
    let mediaType = null;

    if (mediaFile) {
      // Validate file type
      if (!mediaFile.type?.startsWith('image/') && !mediaFile.type?.startsWith('video/')) {
        throw new Error('Only images and videos are allowed');
      }

      try {
        // Compress image if needed
        const compressedImage = await ImageManipulator.manipulateAsync(
          mediaFile.uri,
          [{ resize: { width: 1080 } }],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG
          }
        );

        // Check file size after compression
        const response = await fetch(compressedImage.uri);
        const blob = await response.blob();
        if (blob.size > MAX_FILE_SIZE) {
          throw new Error('File size too large (max 5MB)');
        }

        // Upload to storage
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const filename = `${timestamp}-${random}`;
        const path = `posts/${auth.currentUser.uid}/${filename}`;
        
        console.log('[Posts] Uploading to:', path);

        const metadata = {
          contentType: 'image/jpeg',
          customMetadata: {
            originalName: filename,
            uploadedBy: auth.currentUser.uid,
            timestamp: timestamp.toString()
          }
        };

        const storageRef = ref(storage, path);
        const uploadResult = await uploadBytes(storageRef, blob, metadata);
        mediaUrl = await getDownloadURL(uploadResult.ref);
        mediaType = 'image/jpeg';

        console.log('[Posts] Upload successful:', { mediaUrl, mediaType });

      } catch (error) {
        console.error('[Posts] Media upload failed:', error);
        throw new Error(`Media upload failed: ${error.message}`);
      }
    }

    // Create post document
    const postData = {
      content,
      mediaUrl,
      mediaType,
      createdAt: serverTimestamp(),
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Anonymous',
      userPhoto: auth.currentUser.photoURL || 'https://firebasestorage.googleapis.com/v0/b/pigskins-72811.appspot.com/o/defaults%2Fdefault-avatar.png?alt=media'
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);
    console.log('[Posts] Document created:', docRef.id);
    return docRef.id;

  } catch (error) {
    console.error('[Posts] Post creation failed:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  console.log('[Posts] Attempting to delete post:', postId);
  
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      console.warn('[Posts] Delete failed: Post not found:', postId);
      throw new Error('Post not found');
    }

    const postData = postSnap.data();
    
    // Delete the document first
    await deleteDoc(postRef);
    console.log('[Posts] Post deleted successfully:', {
      postId,
      status: 'success',
      timestamp: new Date().toISOString()
    });

    // If post had media, delete it from storage too
    if (postData.mediaUrl && postData.userId === auth.currentUser.uid) {
      try {
        // Extract the path from the full URL
        const urlPath = postData.mediaUrl.split('?')[0];
        const storagePath = urlPath.split('/o/')[1];
        const decodedPath = decodeURIComponent(storagePath);
        
        console.log('[Posts] Attempting to delete media at path:', decodedPath);
        
        const storageRef = ref(storage, decodedPath);
        await deleteObject(storageRef);
        
        console.log('[Posts] Associated media deleted:', {
          path: decodedPath,
          status: 'success'
        });
      } catch (mediaError) {
        // Only log as error if it's not a permissions issue
        const logMethod = mediaError.code === 'storage/unauthorized' ? console.warn : console.error;
        logMethod('[Posts] Failed to delete media:', {
          error: mediaError.message,
          code: mediaError.code,
          path: postData.mediaUrl
        });
      }
    }

    return { success: true, postId };
  } catch (error) {
    console.error('[Posts] Delete failed:', {
      postId,
      error: error.message,
      code: error.code
    });
    throw error;
  }
};

const loadingTimeout = 60000; // 1 minute instead of 30 seconds

export const subscribeToPosts = (onPostsUpdate) => {
  console.log('[Posts] Setting up feed subscription');
  
  const q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    // limit(50) // Uncomment this if you want to limit how many posts load at once
  );

  return onSnapshot(q, {
    next: (snapshot) => {
      // Convert Firestore documents to app-friendly format
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.getTime() || Date.now()
      }));
      
      // Update the UI with new posts
      onPostsUpdate(posts);
      
      // Log only if there are actual changes
      if (snapshot.docChanges().length > 0) {
        console.log('[Posts] Feed updated:', {
          total: posts.length,
          changes: snapshot.docChanges().length
        });
      }
    },
    error: (error) => {
      console.error('[Posts] Feed subscription error:', error);
      onPostsUpdate([]); // Clear posts on error
    }
  });
}; 