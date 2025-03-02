import { View, ActivityIndicator, StyleSheet } from 'react-native';

const AuthLoading = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#6366f1" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
});

export default AuthLoading; 