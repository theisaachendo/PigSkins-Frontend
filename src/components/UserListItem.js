import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const UserListItem = ({ user }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => navigation.navigate('Profile', { userId: user.id })}
    >
      <Image 
        source={{ uri: user.photoURL || 'https://via.placeholder.com/100' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username || user.displayName}</Text>
      </View>
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