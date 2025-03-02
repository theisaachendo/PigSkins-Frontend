import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileScreen } from '../features/social/screens/ProfileScreen';
import { FollowersScreen } from '../features/social/screens/FollowersScreen';
import { FollowingScreen } from '../features/social/screens/FollowingScreen';
import { FeedScreen } from '../features/social/screens/FeedScreen';

const Stack = createStackNavigator();

export const SocialStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Feed" 
        component={FeedScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Search')}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="search" size={24} color="#374151" />
            </TouchableOpacity>
          )
        })}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          headerTitle: 'Search Users'
        }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Followers" component={FollowersScreen} />
      <Stack.Screen name="Following" component={FollowingScreen} />
    </Stack.Navigator>
  );
}; 