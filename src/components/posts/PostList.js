import { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, RefreshControl, Text, TouchableOpacity, Image } from 'react-native';
import { subscribeToPosts, deletePost } from '../../services/posts';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { Ionicons } from '@expo/vector-icons';
import { getFirebaseAuth } from '../../config/initializeFirebase';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get the current user ID directly from Firebase Auth
  const auth = getFirebaseAuth();
  const currentUserId = auth.currentUser?.uid;
  
  useEffect(() => {
    console.log('[PostList] Current user ID:', currentUserId);
    
    let mounted = true;
    
    const loadPosts = () => {
      setLoading(true);
      const unsubscribe = subscribeToPosts((updatedPosts) => {
        if (!mounted) return;
        setPosts(updatedPosts);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      });
      return unsubscribe;
    };

    const unsubscribe = loadPosts();
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setPosts([]); // Clear existing posts
    setError(null);
    // The subscription will automatically refresh
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load posts</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!posts.length) {
    return (
      <View style={styles.container}>
        <CreatePost />
        <View style={styles.centerContainer}>
          <Ionicons name="newspaper-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubText}>Be the first to share something!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            currentUserId={currentUserId} 
            onDelete={handleDelete} 
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
          />
        }
        ListHeaderComponent={<CreatePost onSuccess={handleRefresh} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet. Be the first to post!</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const Post = ({ post }) => {
  const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/pigskins-72811.appspot.com/o/defaults%2Fdefault-avatar.png?alt=media';

  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Image 
          source={{ 
            uri: post.userPhoto || defaultAvatar,
            cache: 'force-cache',
          }}
          style={styles.userAvatar}
        />
        <View style={styles.postHeaderText}>
          <Text style={styles.userName}>{post.userName || 'Anonymous'}</Text>
          <Text style={styles.timestamp}>
            {new Date(post.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.mediaUrl && (
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  emptySubText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  post: {
    backgroundColor: '#1f2937',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#374151', // Placeholder color while loading
  },
  postHeaderText: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: '#94a3b8',
    fontSize: 13,
  },
  content: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#374151', // Placeholder color while loading
  }
});

export default PostList; 