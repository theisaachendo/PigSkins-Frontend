import { useState, useCallback } from 'react';
import { socialService } from '../services';
import { FollowStatus } from '../types';

export const useFollow = (initialIsFollowing = false) => {
  const [followStatus, setFollowStatus] = useState(
    initialIsFollowing ? FollowStatus.FOLLOWING : FollowStatus.NOT_FOLLOWING
  );
  const [error, setError] = useState(null);

  const toggleFollow = useCallback(async (userId) => {
    console.log('[Follow] Starting toggle follow:', {
      userId,
      currentStatus: followStatus,
      timestamp: new Date().toISOString()
    });

    try {
      setFollowStatus(FollowStatus.LOADING);
      setError(null);

      if (followStatus === FollowStatus.FOLLOWING) {
        console.log('[Follow] Attempting to unfollow user:', userId);
        const result = await socialService.unfollowUser({ userId });
        console.log('[Follow] Unfollow successful:', {
          userId,
          result,
          timestamp: new Date().toISOString()
        });
        setFollowStatus(FollowStatus.NOT_FOLLOWING);
      } else {
        console.log('[Follow] Attempting to follow user:', userId);
        const result = await socialService.followUser({ userId });
        console.log('[Follow] Follow successful:', {
          userId,
          result,
          timestamp: new Date().toISOString()
        });
        setFollowStatus(FollowStatus.FOLLOWING);
      }
    } catch (err) {
      console.error('[Follow] Operation failed:', {
        userId,
        error: err.message,
        code: err.code,
        status: followStatus,
        timestamp: new Date().toISOString()
      });
      setError(err.message);
      setFollowStatus(followStatus); // Revert to previous state
    }
  }, [followStatus]);

  return { followStatus, error, toggleFollow };
}; 