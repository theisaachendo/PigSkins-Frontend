import { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Text,
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { createPost } from '../../services/posts';

const CreatePost = ({ onSuccess }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  // Request permissions when the component mounts
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your media library.');
      }
    };

    requestPermissions();
  }, []);

  const pickMedia = async () => {
    console.log('[CreatePost] Picking image');
    
    try {
      // Only allow images
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      };
      
      const result = await ImagePicker.launchImageLibraryAsync(options);

      console.log('[CreatePost] Media selection result:', result);

      if (!result.canceled) {
        const assetType = result.assets[0].type || 'image/jpeg';
        
        setMedia({
          uri: result.assets[0].uri,
          type: assetType,
          fileSize: result.assets[0].fileSize,
        });
        console.log('[CreatePost] Media set:', { 
          uri: result.assets[0].uri, 
          type: assetType,
          fileSize: result.assets[0].fileSize
        });
      } else {
        console.log('[CreatePost] Media selection was canceled');
      }
    } catch (error) {
      console.error('[CreatePost] Error picking media:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !media) {
      Alert.alert('Error', 'Please add some content or an image to your post');
      return;
    }

    setLoading(true);
    
    try {
      await createPost(content, media);
      
      // Reset form
      setContent('');
      setMedia(null);
      setLoading(false);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      Alert.alert('Success', 'Your post has been created!');
    } catch (error) {
      console.error('[CreatePost] Error creating post:', error);
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to create post');
    }
  };

  const renderMediaPreview = () => {
    if (!media) return null;
    
    return (
      <View style={styles.mediaPreviewContainer}>
        <Image
          source={{ uri: media.uri }}
          style={styles.mediaPreview}
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={styles.removeMedia}
          onPress={() => setMedia(null)}
        >
          <Ionicons name="close-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        placeholderTextColor="#94a3b8"
        multiline
        value={content}
        onChangeText={setContent}
      />
      
      {renderMediaPreview()}

      <View style={styles.actions}>
        <View style={styles.mediaButtons}>
          <TouchableOpacity 
            style={styles.mediaButton}
            onPress={pickMedia}
          >
            <Ionicons name="image-outline" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    fontSize: 16,
    color: '#1e293b',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  mediaPreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  removeMedia: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaButtons: {
    flexDirection: 'row',
  },
  mediaButton: {
    marginRight: 16,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CreatePost; 