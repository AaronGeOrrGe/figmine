import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';

const imageMap: Record<string, any> = {
  '1': require('../assets/images/inspiration.png'),
  '2': require('../assets/images/inspiration2.png'),
  '3': require('../assets/images/inspiration3.png'),
  '4': require('../assets/images/inspiration4.png'),
};

export default function TemplateDetailsScreen() {
  const { id } = useLocalSearchParams();
  const imageSource = id && imageMap[id as string];
  // Zoom logic
  const scale = useSharedValue(1);
  const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive: (event) => {
      scale.value = event.scale;
    },
    onEnd: () => {
      scale.value = withTiming(1, { duration: 200 });
    },
  });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <View style={styles.container}>
      {imageSource && (
        <PinchGestureHandler onGestureEvent={pinchHandler}>
          <Animated.View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, animatedStyle]}>
            <Image source={imageSource} style={styles.image} resizeMode="contain" />
          </Animated.View>
        </PinchGestureHandler>
      )}
      <Text style={styles.zoomHint}>Pinch to zoom</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  image: { width: Dimensions.get('window').width - 40, height: Dimensions.get('window').height / 2, borderRadius: 12 },
  zoomHint: { position: 'absolute', bottom: 20, color: '#888', fontSize: 13 }
});
