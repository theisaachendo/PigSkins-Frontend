import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { deletePost } from '../../services/posts';

const PostCard = ({ post, currentUserId }) => {
  const [deleting, setDeleting] = useState(false);
  
  const isOwnPost = post.userId === currentUserId;
  
  // Add logging when component mounts
  useEffect(() => {
    console.log('[PostCard] Rendering post:', { 
      postId: post.id,
      postUserId: post.userId,
      currentUserId,
      isOwnPost,
      content: post.content?.substring(0, 20) + (post.content?.length > 20 ? '...' : '')
    });
  }, []);
  
  const handleDelete = async () => {
    if (deleting) return;
    
    console.log('[PostCard] Delete button pressed for post:', post.id);
    
    // Add confirmation dialog
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('[PostCard] Delete cancelled')
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[PostCard] Confirmed delete for post:', post.id);
              setDeleting(true);
              await deletePost(post.id);
              console.log('[PostCard] Delete successful for post:', post.id);
              // The post will be removed from the UI via the posts subscription
            } catch (error) {
              console.error('[PostCard] Error deleting post:', error);
              setDeleting(false);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };
  
  const renderMedia = () => {
    if (!post.mediaUrl) return null;
    
    // Only handle images
    return (
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.media}
          resizeMode="cover"
        />
      </View>
    );
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      // Simple timestamp formatting without date-fns
      const now = new Date();
      const postDate = new Date(timestamp);
      const diffMs = now - postDate;
      
      // Convert to seconds, minutes, hours, days
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 0) {
        return diffDay === 1 ? 'yesterday' : `${diffDay} days ago`;
      } else if (diffHour > 0) {
        return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffMin > 0) {
        return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
      } else {
        return 'just now';
      }
    } catch (error) {
      console.error('[PostCard] Error formatting timestamp:', error);
      return 'Recently';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.userName?.[0] || '?'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{post.userName || 'Anonymous'}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(post.createdAt)}</Text>
          </View>
        </View>
        
        {isOwnPost && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
      
      {post.content && (
        <Text style={styles.content}>{post.content}</Text>
      )}
      
      {renderMedia()}
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color="#64748b" />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#64748b" />
          <Text style={styles.actionText}>Share</Text>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  mediaContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#64748b',
    fontSize: 16,
    marginLeft: 8,
  },
  timestamp: {
    color: '#94a3b8',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 'auto',
    opacity: 0.8,
  },
});

export default PostCard; 