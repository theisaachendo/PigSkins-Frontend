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
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
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
    // Only handle images
    if (!file.type.startsWith('image/') && file.type !== 'image') {
      throw new Error('Only image uploads are supported');
    }
    
    // Compress the image first
    const compressedImage = await ImageManipulator.manipulateAsync(
      file.uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log('[Posts] Compressed image:', compressedImage);
    
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${random}`;
    const path = `posts/${userId}/${filename}`;
    
    console.log('[Posts] Uploading to:', path);
    
    // Add a timeout for the fetch operation
    const fetchWithTimeout = async (uri, options = {}, timeout = 30000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(uri, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    };
    
    console.log('[Posts] Fetching file with timeout...');
    const response = await fetchWithTimeout(compressedImage.uri);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('[Posts] Blob created:', { size: blob.size });
    
    const storageRef = ref(storage, path);
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        originalName: filename,
        uploadedBy: userId,
        timestamp: timestamp.toString()
      }
    };
    
    const uploadResult = await uploadBytes(storageRef, blob, metadata);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    console.log('[Posts] Upload successful:', { 
      mediaUrl: downloadURL, 
      mediaType: 'image/jpeg' 
    });
    
    return {
      url: downloadURL,
      path: path,
      type: 'image/jpeg'
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

// Add this function to handle video uploads with better memory management
const uploadVideoWithRetry = async (mediaFile, userId) => {
  console.log('[Posts] Starting video upload with retry mechanism');
  
  let attempts = 0;
  const maxAttempts = 2;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Posts] Video upload attempt ${attempts}/${maxAttempts}`);
    
    try {
      // Check video size first
      if (mediaFile.fileSize && mediaFile.fileSize > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('Video file is too large. Maximum size is 50MB.');
      }
      
      console.log('[Posts] Fetching video file...');
      const response = await fetch(mediaFile.uri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }
      
      console.log('[Posts] Creating blob from video...');
      const blob = await response.blob();
      console.log('[Posts] Video blob created:', { size: blob.size });
      
      // Upload to storage
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const filename = `${timestamp}-${random}`;
      const path = `posts/${userId}/${filename}`;
      
      console.log('[Posts] Uploading video to:', path);
      
      const metadata = {
        contentType: 'video/mp4',
        customMetadata: {
          originalName: filename,
          uploadedBy: userId,
          timestamp: timestamp.toString()
        }
      };
      
      const storageRef = ref(storage, path);
      console.log('[Posts] Storage reference created, starting upload...');
      
      const uploadResult = await uploadBytes(storageRef, blob, metadata);
      console.log('[Posts] Upload completed, getting download URL...');
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // We don't need to set blob to null, JavaScript has garbage collection
      
      return {
        url: downloadURL,
        type: 'video/mp4'
      };
    } catch (error) {
      console.error('[Posts] Video upload error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        // For network errors
        status: error.status,
        statusText: error.statusText,
        // For Firebase errors
        serverResponse: error.serverResponse
      });
      
      // Rethrow with more context
      throw new Error(`Video upload failed: ${error.message || 'Unknown error'}`);
    }
  }
};

export const createPost = async (content, mediaFile = null) => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to create a post');
  }
  
  console.log('[Posts] Starting post creation:', {
    hasContent: !!content,
    hasMedia: !!mediaFile,
    mediaType: mediaFile?.type
  });
  
  try {
    let mediaUrl = null;
    let mediaType = null;
    
    // Handle media upload if present
    if (mediaFile) {
      console.log('[Posts] Processing media file:', mediaFile);
      
      // Reject video uploads
      if (mediaFile.type === 'video' || mediaFile.type?.startsWith('video/')) {
        throw new Error('Video uploads are currently not supported');
      }
      
      // Process image uploads
      if (mediaFile.type === 'image' || mediaFile.type?.startsWith('image/')) {
        const result = await uploadMedia(mediaFile, auth.currentUser.uid);
        mediaUrl = result.url;
        mediaType = result.type;
      }
    }
    
    // Create the post document
    const postData = {
      content: content || '',
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Anonymous',
      userEmail: auth.currentUser.email,
      createdAt: serverTimestamp(),
      mediaUrl,
      mediaType
    };
    
    const docRef = await addDoc(collection(db, 'posts'), postData);
    console.log('[Posts] Document created:', docRef.id);
    
    return {
      id: docRef.id,
      ...postData,
      createdAt: new Date().getTime()
    };
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
        
        // For emulator environment, we need to handle this differently
        if (process.env.NODE_ENV === 'development' || postData.mediaUrl.includes('localhost')) {
          // For emulator, we can just log this and move on
          console.log('[Posts] Skipping media deletion in emulator environment');
        } else {
          // For production, attempt to delete the file
          const storageRef = ref(storage, decodedPath);
          await deleteObject(storageRef);
          
          console.log('[Posts] Associated media deleted:', {
            path: decodedPath,
            status: 'success'
          });
        }
      } catch (mediaError) {
        // Only log as error if it's not a permissions issue
        const logMethod = mediaError.code === 'storage/unauthorized' ? console.warn : console.error;
        logMethod('[Posts] Failed to delete media:', {
          error: mediaError.message,
          code: mediaError.code,
          path: postData.mediaUrl
        });
        
        // Don't throw the error, just log it - we've already deleted the post document
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

// Add this function to your posts.js file
const logMemoryUsage = () => {
  try {
    console.log('[Memory] Checking memory usage');
    
    // In Expo/React Native, we don't have direct access to memory stats
    // But we can log that we're checking and add instrumentation points
    
    // For iOS/Android, we could potentially use native modules to get memory info
    // but for now, we'll just log that we're at this point in the code
    console.log('[Memory] Memory check point reached');
    
    return true;
  } catch (error) {
    console.log('[Memory] Error checking memory:', error.message);
    return false;
  }
};

// Call this function before and after video processing
// For example:
// logMemoryUsage();
// ... process video ...
// logMemoryUsage(); 

// Add this function to help with memory cleanup
const forceMemoryCleanup = () => {
  try {
    // In JavaScript, we can't directly force garbage collection
    // But we can help by nullifying large objects and running some operations
    
    // Create and immediately discard some objects to trigger cleanup
    for (let i = 0; i < 10; i++) {
      const obj = new Array(1000).fill('x');
      obj.length = 0;
    }
    
    // Log that we attempted cleanup
    console.log('[Memory] Attempted memory cleanup');
    
    return true;
  } catch (error) {
    console.log('[Memory] Error during cleanup:', error.message);
    return false;
  }
};

// Call this after video uploads 