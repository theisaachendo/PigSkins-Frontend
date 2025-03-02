import React, { useEffect } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useFollow } from '../hooks/useFollow';
import { FollowStatus } from '../types';

export const FollowButton = ({ userId, initialIsFollowing = false, onStatusChange }) => {
  const { followStatus, error, toggleFollow } = useFollow(initialIsFollowing);

  useEffect(() => {
    if (error) {
      console.warn('[FollowButton] Error occurred:', {
        userId,
        error,
        timestamp: new Date().toISOString()
      });
      
      Alert.alert(
        'Follow Error',
        'Unable to update follow status. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [error, userId]);

  const handlePress = async () => {
    console.log('[FollowButton] Button pressed:', {
      userId,
      currentStatus: followStatus,
      timestamp: new Date().toISOString()
    });

    await toggleFollow(userId);
    
    console.log('[FollowButton] Status updated:', {
      userId,
      newStatus: followStatus,
      hasError: !!error,
      timestamp: new Date().toISOString()
    });

    if (onStatusChange) {
      onStatusChange(followStatus);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button,
        followStatus === FollowStatus.FOLLOWING && styles.followingButton
      ]}
      onPress={handlePress}
      disabled={followStatus === FollowStatus.LOADING}
    >
      {followStatus === FollowStatus.LOADING ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.buttonText}>
          {followStatus === FollowStatus.FOLLOWING ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
  },
  followingButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 