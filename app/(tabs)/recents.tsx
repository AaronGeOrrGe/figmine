import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

const mockData = [
  {
    id: '1',
    title: 'Landing Page',
    description: 'Website prototype',
    date: 'June 5, 2025',
    type: 'Prototype',
    thumbnails: [
      require('../../assets/images/thumbnail1.png'),
    ],
    favorite: false,
  },
  {
    id: '2',
    title: 'Figma Redesign',
    description: 'Mobile app UI',
    date: 'June 4, 2025',
    type: 'Design File',
    thumbnails: [
      require('../../assets/images/thumbnail2.png'),
    ],
    favorite: false,
  },
  {
    id: '3',
    title: 'Marketing Banner',
    description: 'Promotional design',
    date: 'June 3, 2025',
    type: 'Design File',
    thumbnails: [
      require('../../assets/images/thumbnail3.png'),
    ],
    favorite: false,
  },
  {
    id: '4',
    title: 'App Icon Concepts',
    description: 'Icon set for new app',
    date: 'June 2, 2025',
    type: 'Design File',
    thumbnails: [
      require('../../assets/images/thumbnail4.png'),
    ],
    favorite: false,
  },
  {
    id: '5',
    title: 'New File',
    description: 'Some description',
    date: 'June 1, 2025',
    type: 'Design File',
    thumbnails: [],
    favorite: false,
  },
  // Add as many items as you want!
].map(item => ({ ...item, favorite: false }));

function Header() {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.push('/settings')}>
        <Ionicons name="person-circle-outline" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Recents</Text>
      <TouchableOpacity onPress={() => {}}>
        <Ionicons name="search-outline" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const SkeletonItem = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonThumbnail} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonMeta} />
      </View>
    </Animated.View>
  );
};

const RecentsSkeletonLoader = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', marginTop: StatusBar.currentHeight || 0 }}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonCircle} />
        <View style={styles.skeletonHeaderTitle} />
        <View style={styles.skeletonCircle} />
      </View>
      
      <View style={styles.skeletonSectionHeader} />
      
      {[1, 2, 3].map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkFigmaToken } from '../../api/figma';

export default function RecentsScreen() {
  const [data, setData] = useState(mockData);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingFigma, setCheckingFigma] = useState(true);
  const [hasFigma, setHasFigma] = useState<boolean|null>(null);
  const router = useRouter();

  React.useEffect(() => {
    // Check for Figma connection on mount
    (async () => {
      setCheckingFigma(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const connected = await checkFigmaToken(token);
          setHasFigma(connected);
        } else {
          setHasFigma(false);
        }
      } catch (e) {
        setHasFigma(false);
      }
      setCheckingFigma(false);
    })();
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false);
    }, 1500);
  }, []);

  const toggleFavorite = (id: string) => {
    setData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/file-details/${item.id}`)}
    >
      <Image
        source={item.thumbnails[0]}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={{ marginLeft: 8 }}>
            <Ionicons
              name={item.favorite ? 'star' : 'star-outline'}
              size={20}
              color={item.favorite ? '#FFD600' : '#888'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.meta} numberOfLines={1}>{item.description} • {item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item.id}>
          {renderItem({ item })}
        </View>
      ))}
    </View>
  );

  const favorites = data.filter(item => item.favorite);
  const prototypes = data.filter(item => item.type === 'Prototype' && !item.favorite);
  const designFiles = data.filter(item => item.type === 'Design File' && !item.favorite);

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <RecentsSkeletonLoader />
      ) : (
        <>
          <Header />
          {checkingFigma ? (
            <View style={{ alignItems: 'center', margin: 24 }}>
              <ActivityIndicator size="large" color="#3478F6" />
              <Text style={{ marginTop: 8, color: '#3478F6' }}>Checking Figma connection...</Text>
            </View>
          ) : hasFigma === false ? (
            <View style={{ alignItems: 'center', margin: 24 }}>
              <Text style={{ color: '#d32f2f', marginBottom: 8, fontWeight: 'bold' }}>Not connected to Figma</Text>
              <TouchableOpacity
                style={{ backgroundColor: '#3478F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
                onPress={() => router.push('/connect-figma')}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Connect your Figma account</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {favorites.length > 0 && renderSection('Favorites', favorites)}
            {prototypes.length > 0 && renderSection('Recent Prototypes', prototypes)}
            {designFiles.length > 0 && renderSection('Recent Files', designFiles)}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  emptyPadding: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: StatusBar.currentHeight || 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  skeletonThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  skeletonContent: {
    marginLeft: 12,
    flex: 1,
  },
  skeletonTitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonMeta: {
    width: '60%',
    height: 13,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skeletonCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  skeletonHeaderTitle: {
    width: 80,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonSectionHeader: {
    width: 150,
    height: 18,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    margin: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
});
