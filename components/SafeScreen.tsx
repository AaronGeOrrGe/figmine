import React from 'react';
import { SafeAreaView, View, StyleSheet, Platform, StatusBar, ViewProps } from 'react-native';

interface SafeScreenProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

const SafeScreen: React.FC<SafeScreenProps> = ({ children, style, ...rest }) => {
  return (
    <SafeAreaView style={[styles.safe, style]} {...rest}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default SafeScreen;
