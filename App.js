import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, TouchableOpacity, LogBox } from 'react-native';
import { getFirebaseAuth } from './src/config/initializeFirebase';
import { onAuthStateChanged } from 'firebase/auth';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initializeFirebase } from './src/config/initializeFirebase';
import { Ionicons } from '@expo/vector-icons';

// Import all screens
import AuthLoading from './src/screens/auth/AuthLoading';
import Login from './src/screens/auth/Login';
import SignUp from './src/screens/auth/SignUp';
import ForgotPassword from './src/screens/auth/ForgotPassword';
import Home from './src/screens/Home';
import Profile from './src/screens/Profile';
import Search from './src/screens/SearchScreen';

const Stack = createNativeStackNavigator();

// Set up a global error handler that works in Expo
const setupErrorHandler = () => {
  // Ignore specific warnings that might be noisy
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]);

  // Set up error logging
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log the error with a timestamp
    const timestamp = new Date().toISOString();
    originalConsoleError(`[${timestamp}] ERROR:`, ...args);
    
    // You could add additional error reporting here
    // For example, sending to a service like Sentry
  };
  
  // Handle promise rejections
  const handlePromiseRejection = (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
  };
  
  // Add event listener for unhandled promise rejections
  if (global.addEventListener) {
    global.addEventListener('unhandledrejection', handlePromiseRejection);
  }
};

// Call the setup function
setupErrorHandler();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[App] Starting auth initialization...');
    const auth = getFirebaseAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[App] Auth state changed:', user ? 'User logged in' : 'No user');
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('[App] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Initialize Firebase services once at app startup
    initializeFirebase();
  }, []);

  if (loading) {
    return <AuthLoading />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false
            }}
          >
            {!user ? (
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="SignUp" component={SignUp} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
              </>
            ) : (
              <>
                <Stack.Screen 
                  name="Home" 
                  component={Home}
                  options={({ navigation }) => ({
                    headerShown: true,
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
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen 
                  name="Search" 
                  component={Search}
                  options={{
                    headerShown: true,
                    headerTitle: 'Search Users'
                  }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
} 