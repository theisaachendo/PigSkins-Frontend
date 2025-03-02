import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const Home = ({ navigation }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home</Text>
      <Text style={styles.email}>{auth.currentUser?.email}</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 5,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Home; 