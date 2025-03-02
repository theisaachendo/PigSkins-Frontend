import { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const SignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    console.log('Sign up attempt:', { email, displayName });

    if (!email || !password || !confirmPassword || !displayName) {
      console.log('Validation failed: Missing fields');
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating user account...');
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log('User created:', {
        uid: user.uid,
        email: user.email,
      });

      console.log('Updating user profile...');
      await updateProfile(user, { displayName });
      
      console.log('Profile updated successfully:', {
        displayName: user.displayName,
        email: user.email,
      });

      navigation.replace('Home');
    } catch (error) {
      console.error('Sign up error:', {
        code: error.code,
        message: error.message,
      });
      setError(error.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          autoComplete="name"
        />

        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="password-new"
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1f2937',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  linkButton: {
    marginTop: 15,
    padding: 10,
  },
  linkText: {
    color: '#4f46e5',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default SignUp; 