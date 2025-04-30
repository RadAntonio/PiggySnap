import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../context/AuthContext";
import SubmitButton from "../components/SignupPage/SubmitButton";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");

function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Validation error", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/user/forgot-password`,
        { email }
      );
      Alert.alert(
        "Success",
        data.detail || "If that email is registered, you’ll receive a reset link."
      );
      navigation.navigate("SignupScreen");
    } catch (err) {
      console.log("Forgot password error", err.response || err.message);
      const msg = err.response?.data?.email || err.response?.data?.detail;
      Alert.alert(
        "Error",
        Array.isArray(msg) ? msg[0] : msg || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonContainer}>
            <SubmitButton
              text={loading ? "Sending..." : "Send Reset Link"}
              onPress={handleForgotPassword}
              style={{ backgroundColor: Colors.primary800 }}
            />
          </View>

          <View style={styles.inlineRow}>
            <Text style={styles.inlineText}>Remembered your password? </Text>
            <SubmitButton
              text="Login"
              onPress={() => navigation.navigate("SignupScreen")}
              style={{ backgroundColor: Colors.primary600 }}
              textStyle={{
                color: "white",
                fontSize: 12,
                marginVertical: -10,
                marginHorizontal: -14,
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: width * 0.9,
    marginHorizontal: width * 0.05,
    borderRadius: 28,
    padding: 24,
    justifyContent: "center",
    marginBottom: 80,

  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary800,
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    width: "100%",
    alignItems: "flex-start",
  },
  label: {
    fontSize: 14,
    color: "#536493",
    fontWeight: "600",
    marginBottom: 3,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    width: "100%",
    justifyContent: "center",
  },
  inlineText: {
    fontSize: 16,
    color: Colors.primary800,
  },
});