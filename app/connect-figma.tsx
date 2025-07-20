import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button, ActivityIndicator, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function ConnectFigmaScreen() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Fetch the dynamic Figma OAuth URL from backend
      const userToken = await AsyncStorage.getItem('token');
      const res = await fetch('https://forge-deploy-42u1.onrender.com/api/figma/connect', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await res.json();
      const oauthUrl = data.url || data.oauthUrl || data.redirectUrl || '';
      if (oauthUrl) {
        if (Platform.OS === 'web') {
          window.location.href = oauthUrl;
        } else {
          Linking.openURL(oauthUrl);
        }
      } else {
        alert('Could not get Figma OAuth URL.');
      }
    } catch (e) {
      alert('Failed to connect to Figma.');
    }
    setTimeout(() => setLoading(false), 1500); // fallback
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Connect your Figma Account</Text>
      <Text style={{ fontSize: 16, color: '#555', marginBottom: 32, textAlign: 'center' }}>
        To access your Figma files, you need to connect your Figma account.
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3478F6" />
      ) : (
        <Button title="Connect to Figma" color="#3478F6" onPress={handleConnect} />
      )}
    </View>
  );
}
