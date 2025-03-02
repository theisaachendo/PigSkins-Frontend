import { useState } from 'react';
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

  const pickMedia = async (type = 'image') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'image' 
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setMedia({
          uri: result.assets[0].uri,
          type: result.assets[0].type,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    setLoading(true);
    try {
      await createPost(content, media);
      setContent('');
      setMedia(null);
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
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
      
      {media && (
        <View style={styles.mediaPreview}>
          {media.type === 'image' ? (
            <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
          ) : (
            <Video
              source={{ uri: media.uri }}
              style={styles.mediaPreview}
              useNativeControls
            />
          )}
          <TouchableOpacity 
            style={styles.removeMedia}
            onPress={() => setMedia(null)}
          >
            <Ionicons name="close-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actions}>
        <View style={styles.mediaButtons}>
          <TouchableOpacity 
            style={styles.mediaButton}
            onPress={() => pickMedia('image')}
          >
            <Ionicons name="image-outline" size={24} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mediaButton}
            onPress={() => pickMedia('video')}
          >
            <Ionicons name="videocam-outline" size={24} color="#94a3b8" />
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
    backgroundColor: '#171717',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 12,
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
    marginTop: 12,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    padding: 8,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CreatePost; 