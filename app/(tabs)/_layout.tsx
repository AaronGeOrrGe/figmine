import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ccc',
          paddingTop: 6,
          paddingBottom: 10 + insets.bottom,
          height: 60 + insets.bottom,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'recents') {
            iconName = 'time-outline';
          } else if (route.name === 'templates') {
            iconName = 'grid-outline';
          } else if (route.name === 'search') {
            iconName = 'search-outline';
          } else if (route.name === 'mirror') {
            iconName = 'phone-portrait-outline';
          }
          return <Ionicons name={iconName as any} size={20} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="recents" options={{ title: 'Recents' }} />
<Tabs.Screen name="templates" options={{ title: 'Templates' }} />
<Tabs.Screen name="search" options={{ title: 'Search' }} />
<Tabs.Screen name="mirror" options={{ title: 'Mirror' }} />

    </Tabs>
  );
}
