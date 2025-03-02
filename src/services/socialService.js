import { functions } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';

export const socialService = {
  searchUsers: httpsCallable(functions, 'searchUsers'),
  followUser: httpsCallable(functions, 'followUser'),
  unfollowUser: httpsCallable(functions, 'unfollowUser'),
}; 