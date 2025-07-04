import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MirrorScreen() {
  // Mock user data
  const avatarUrl = null; // Replace with a real URL to test image avatar
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mirror</Text>
        <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/settings')}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={32} color="#00C853" />
          )}
        </TouchableOpacity>
      </View>

      {/* Body Content */}
      <View style={styles.body}>
        {/* Placeholder image - replace with a real one later */}
        <Image
          source={require('../../assets/images/mirror-placeholder.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
        <Text style={styles.title}>Select a frame or component</Text>
        <Text style={styles.subtitle}>
          Click a top-level frame or component on{"\n"}your computer to get started.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  avatarButton: {
    padding: 0,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    resizeMode: 'cover',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustration: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});
