import React, { useRef, useEffect } from "react";
import { Pressable, Text, StyleSheet, Animated } from "react-native";
import { Colors } from "../../constants/Colors";

const GetStartedButton = ({ onPress, disabled, show }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (show) {
      Animated.spring(scaleAnim, {
        toValue: 1.25,
        friction: 2,
        tension: 100,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 10,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [show]);

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1.07,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: disabled ? "#ccc" : Colors.primary600,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.text, { color: disabled ? "#888" : Colors.primary100 }]}>
          Get Started
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export default GetStartedButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
