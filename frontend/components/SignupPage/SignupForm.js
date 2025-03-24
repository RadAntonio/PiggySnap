import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Button,
  Text,
} from "react-native";
import { Colors } from "../../constants/Colors";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";

const { width } = Dimensions.get("window");

function SignupForm() {
  const translateX = useRef(new Animated.Value(0)).current;

  const goToLogin = () => {
    Animated.spring(translateX, {
      toValue: -width,
      useNativeDriver: true,
    }).start();
  };

  const goToRegister = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.sliderWrapper}>
      <Animated.View
        style={[
          styles.slider,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <RegisterForm orLogin={goToLogin} />
        <LoginForm orRegister={goToRegister} />
      </Animated.View>
    </View>
  );
}

export default SignupForm;

const styles = StyleSheet.create({
  sliderWrapper: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    flex: 9,
  },
  slider: {
    flexDirection: "row",
    width: width * 0.2,
    flex: 1,
  },
});
