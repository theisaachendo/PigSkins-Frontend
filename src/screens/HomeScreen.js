import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { auth } from '../config/firebase';
import { subscribeToFeed } from '../services/posts';
import PostCard from '../components/posts/PostCard';
import CreatePost from '../components/posts/CreatePost';

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const currentUserId = auth.currentUser?.uid;
  
  useEffect(() => {
    console.log('[Home] Rendering Home screen');
    console.log('Current user:', auth.currentUser);
    
    // Subscribe to feed updates
    const unsubscribe = subscribeToFeed(setPosts);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // This will trigger a re-fetch via the subscription
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} currentUserId={currentUserId} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={<CreatePost />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 