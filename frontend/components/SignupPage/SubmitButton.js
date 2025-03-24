import React, { useRef, useEffect } from "react";
import { Pressable, Text, StyleSheet, Animated } from "react-native";
import { Colors } from "../../constants/Colors";

const SubmitButton = ({ onPress, text, style, textStyle }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.17,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.button,
          {
            transform: [{ scale: scaleAnim }],
          },
          style
        ]}
      >
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </Animated.View>
    </Pressable>
  );
};

export default SubmitButton;

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
    width: "100%"
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    color: Colors.primary100,
  },
});
