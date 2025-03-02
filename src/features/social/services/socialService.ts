import { functions } from '../../../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { User, FollowRelation } from '../types';

export const socialService = {
  followUser: httpsCallable<{ userId: string }, { success: boolean }>(
    functions, 
    'followUser'
  ),
  
  unfollowUser: httpsCallable<{ userId: string }, { success: boolean }>(
    functions, 
    'unfollowUser'
  ),
  
  getFollowers: httpsCallable<
    { userId: string, lastId?: string, limit?: number },
    { users: User[], hasMore: boolean }
  >(functions, 'getFollowers'),
  
  getFollowing: httpsCallable<
    { userId: string, lastId?: string, limit?: number },
    { users: User[], hasMore: boolean }
  >(functions, 'getFollowing'),
  
  getFeed: httpsCallable<
    { lastId?: string, limit?: number },
    { posts: SocialPost[], hasMore: boolean }
  >(functions, 'getFeed'),
}; 