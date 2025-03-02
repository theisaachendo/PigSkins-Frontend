import React, { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { ProfileHeader } from '../components/ProfileHeader';
import { PostGrid } from '../components/PostGrid';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { useProfile } from '../hooks/useProfile';

export const ProfileScreen = () => {
  const { 
    profile, 
    posts, 
    loading, 
    error, 
    refresh 
  } = useProfile();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <ErrorBoundary>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <ProfileHeader 
          user={profile} 
          loading={loading}
          onFollowersPress={() => {/* Navigate */}}
          onFollowingPress={() => {/* Navigate */}}
        />
        <PostGrid 
          posts={posts}
          loading={loading}
          onPostPress={(post) => {/* Navigate */}}
        />
      </ScrollView>
    </ErrorBoundary>
  );
}; 