import React, { useState, useCallback } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Text
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { socialService } from '../services/socialService';
import { UserListItem } from '../components/UserListItem';
import { useDebounce } from '../hooks/useDebounce';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedSearch = useDebounce(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[Search] Searching for users:', { query: searchQuery });
      
      const result = await socialService.searchUsers({ query: searchQuery });
      console.log('[Search] Found users:', { 
        count: result.users.length,
        users: result.users.map(u => u.displayName)
      });
      
      setUsers(result.users);
    } catch (err) {
      console.error('[Search] Search failed:', err);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleSearch = useCallback((text) => {
    setQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={query}
        onChangeText={handleSearch}
        autoCapitalize="none"
      />
      
      {loading && (
        <ActivityIndicator style={styles.loader} color="#6366f1" />
      )}
      
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <UserListItem user={item} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && query && (
            <Text style={styles.emptyText}>
              No users found
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchInput: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  loader: {
    marginTop: 20,
  },
  error: {
    margin: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
  },
}); 