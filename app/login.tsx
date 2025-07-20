// app/login.tsx
// import SafeScreen from '@/figmine/components/SafeScreen';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function LoginScreen() {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const isStrongPassword = (password: string) => password.length >= 8;

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://forge-deploy-42u1.onrender.com/api/auth/login', {
        email,
        password,
      });

      const token = response.data.token;
      if (token) {
        // Navigate immediately for better UX
        router.replace('/(tabs)/recents');
        // Save token in background
        AsyncStorage.setItem('token', token).then(() => {
          console.log('Token saved:', token);
        });
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err: any) {
      console.error('Login error:', err?.response?.data?.message || err.message);
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
    >
      <View>
        <View style={styles.container}>
          {loading && (
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="reload" size={32} color="#3478F6" style={{ marginBottom: 8, transform: [{ rotate: '90deg' }] }} />
              <Text style={{ color: '#3478F6' }}>Logging in...</Text>
            </View>
          )}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.header}>Welcome Back</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Ionicons
              name="mail-outline"
              color="#888"
              size={15}
              style={{ marginRight: 10 }}
            />
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#767676"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              style={{ padding: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => alert('Password recovery coming soon!')}
            style={styles.forgotPasswordLink}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.switchText}>
              Don't have an account?{' '}
              <Text style={styles.link}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontFamily: 'JetBrainsMono-Medium',
    fontWeight: 'light',
    marginBottom: 50,
    color: 'blue',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 8,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 8,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: 'blue',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 15,
  },
  forgotPasswordLink: {
    marginBottom: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 15,
  },
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

