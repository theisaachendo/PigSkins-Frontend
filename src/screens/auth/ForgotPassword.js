import { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { auth } from '../../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async () => {
    console.log('Password reset attempt:', { email });

    if (!email) {
      console.log('Validation failed: Missing email');
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      console.log('Sending password reset email...');
      await sendPasswordResetEmail(auth, email);
      
      console.log('Password reset email sent successfully');
      setIsSuccess(true);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', {
        code: error.code,
        message: error.message,
      });
      setIsSuccess(false);
      setMessage(error.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Reset Password</Text>

        {message ? (
          <Text style={[styles.messageText, isSuccess && styles.successText]}>
            {message}
          </Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>Back to Sign In</Text>
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
  messageText: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#ef4444',
  },
  successText: {
    color: '#10b981',
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

export default ForgotPassword; 