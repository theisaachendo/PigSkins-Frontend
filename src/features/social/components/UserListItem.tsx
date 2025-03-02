import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User } from '../types';
import { FollowButton } from './FollowButton';

interface UserListItemProps {
  user: User;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => navigation.navigate('Profile', { userId: user.id })}
    >
      <Image 
        source={{ uri: user.photoURL || 'default_avatar_url' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>
      <FollowButton 
        userId={user.id}
        initialIsFollowing={user.isFollowing}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  username: {
    fontSize: 14,
    color: '#6b7280',
  },
}); 