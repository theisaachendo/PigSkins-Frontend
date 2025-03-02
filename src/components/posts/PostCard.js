import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';

const PostCard = ({ post, onDelete }) => {
  const isOwner = auth.currentUser?.uid === post.userId;
  
  const renderMedia = () => {
    if (!post.mediaUrl) return null;

    if (post.mediaType?.startsWith('image')) {
      return (
        <Image 
          source={{ uri: post.mediaUrl }}
          style={styles.media}
          resizeMode="cover"
        />
      );
    }

    if (post.mediaType?.startsWith('video')) {
      return (
        <Video
          source={{ uri: post.mediaUrl }}
          style={styles.media}
          useNativeControls
          resizeMode="cover"
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: post.userAvatar || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.username}>{post.userName}</Text>
          <Text style={styles.timestamp}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {isOwner && (
          <TouchableOpacity 
            onPress={() => onDelete(post.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.content}>{post.content}</Text>
      {renderMedia()}
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="#94a3b8" />
          <Text style={styles.actionText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#94a3b8" />
          <Text style={styles.actionText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#171717',
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: '#94a3b8',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});

export default PostCard; 