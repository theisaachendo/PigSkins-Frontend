import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  SafeAreaView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirebaseAuth } from '../config/initializeFirebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

const Search = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [noMoreResults, setNoMoreResults] = useState(false);

  const auth = getFirebaseAuth();
  const currentUserId = auth.currentUser?.uid;
  
  const functions = getFunctions();
  const searchUsersFunction = httpsCallable(functions, 'searchUsers');
  const getSuggestedUsersFunction = httpsCallable(functions, 'getSuggestedUsers');

  // Load suggested users when the screen mounts
  useEffect(() => {
    getSuggestedUsers();
  }, []);

  // Search for users when the search query changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchUsers();
    } else {
      setUsers([]);
      setLastVisible(null);
      setNoMoreResults(false);
    }
  }, [searchQuery]);

  const searchUsers = async (loadMore = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log('[Search] Searching for users:', searchQuery);
      
      const response = await searchUsersFunction({
        query: searchQuery,
        limit: 10,
        lastUserId: loadMore ? lastVisible?.id : null
      });
      
      const result = response.data;
      
      if (!result.users || result.users.length === 0) {
        if (loadMore) {
          setNoMoreResults(true);
        }
        setLoading(false);
        return;
      }
      
      const lastUser = result.users[result.users.length - 1];
      setLastVisible(lastUser);
      
      if (loadMore) {
        setUsers(prevUsers => [...prevUsers, ...result.users]);
      } else {
        setUsers(result.users);
      }
    } catch (error) {
      console.error('[Search] Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedUsers = async () => {
    try {
      setSuggestionsLoading(true);
      console.log('[Search] Getting suggested users');
      
      const response = await getSuggestedUsersFunction({
        limit: 10
      });
      
      const result = response.data;
      setSuggestedUsers(result.users || []);
    } catch (error) {
      console.error('[Search] Error getting suggested users:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !noMoreResults && users.length > 0) {
      searchUsers(true);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => navigation.navigate('UserProfile', { userId: item.uid })}
    >
      <View style={styles.userAvatar}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{item.displayName?.[0] || '?'}</Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userFollowers}>
          {item.followerCount || 0} followers
        </Text>
      </View>
      {!item.isCurrentUser && (
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  };

  const renderEmptySearch = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color="#64748b" />
        <Text style={styles.emptyText}>
          {searchQuery.trim().length > 0
            ? 'No users found'
            : 'Search for users by name'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
      
      {searchQuery.trim().length > 0 ? (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptySearch}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      ) : (
        <>
          <View style={styles.suggestedHeader}>
            <Text style={styles.suggestedTitle}>Suggested Users</Text>
          </View>
          
          {suggestionsLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : (
            <FlatList
              data={suggestedUsers}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No suggested users found</Text>
                </View>
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  suggestedHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userFollowers: {
    color: '#94a3b8',
    fontSize: 14,
  },
  followButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loaderContainer: {
    paddingVertical: 20,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default Search; 