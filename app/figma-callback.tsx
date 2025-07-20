import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function FigmaCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleOAuth = async () => {
      const code = params.code;
      if (!code) {
        setStatus('error');
        setTimeout(() => router.replace('/(tabs)/recents'), 1500);
        return;
      }
      try {
        // Exchange code for Figma token via backend
        const userToken = await AsyncStorage.getItem('token');
        await axios.get(`https://forge-deploy-42u1.onrender.com/api/figma/callback?code=${code}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        setStatus('success');
        setTimeout(() => router.replace('/(tabs)/recents'), 1500);
      } catch (e) {
        setStatus('error');
        setTimeout(() => router.replace('/(tabs)/recents'), 2000);
      }
    };
    handleOAuth();
  }, [params, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      {status === 'loading' && <><ActivityIndicator size="large" color="#3478F6" />
        <Text style={{ marginTop: 16 }}>Connecting your Figma account...</Text></>}
      {status === 'success' && <Text style={{ color: '#3478F6', fontWeight: 'bold', fontSize: 18 }}>Figma account connected! Redirecting…</Text>}
      {status === 'error' && <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 18 }}>Failed to connect Figma. Please try again.</Text>}
    </View>
  );
}
