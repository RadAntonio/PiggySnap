import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { Colors } from '../constants/Colors';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/loading.json')}
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={styles.text}>Getting things ready...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF1DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 50,
    height: 50,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.primary800,
    fontWeight: '600',
  },
});
