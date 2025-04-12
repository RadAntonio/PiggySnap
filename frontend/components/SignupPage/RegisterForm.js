import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  Button,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState } from "react";
import SubmitButton from "./SubmitButton";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

function RegisterForm({ orLogin }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { onRegister, onLogin } = useAuth();

  const [inputErrors, setInputErrors] = useState({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
  });

  const login = async () => {
    const result = await onLogin(email, password);
    console.log("Login result", result);
    if (result && result.error) {
      alert(result.msg);
    }
  };

  const register = async () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "* Name is required.";
    if (!email.trim()) newErrors.email = "* Email is required.";

    if (!password) newErrors.password = "* Password is required.";
    else if (password.length < 8)
      newErrors.password = "* Password must be at least 8 characters.";
    else if (/^\d+$/.test(password))
      newErrors.password = "* Password cannot be numbers only.";

    if (!confirmPassword) {
      newErrors.confirmPassword = "* Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "* Passwords do not match.";
    }

    setInputErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // Backend call
    const result = await onRegister(name, email, password, confirmPassword);

    if (result?.error) {
      const backendErrors = result.msg;

      if (backendErrors?.password) {
        setInputErrors((prev) => ({
          ...prev,
          password: backendErrors.password[0],
        }));
      }

      if (backendErrors?.email) {
        setInputErrors((prev) => ({
          ...prev,
          email: backendErrors.email[0],
        }));
      }

      if (backendErrors?.confirm_password) {
        setInputErrors((prev) => ({
          ...prev,
          confirmPassword: backendErrors.confirm_password[0],
        }));
      }

      return;
    }

    // If all good, log in
    login();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              style={[styles.input, inputErrors.name && styles.inputInvalid]}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={[styles.input, inputErrors.email && styles.inputInvalid]}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[
                styles.input,
                inputErrors.password ||
                  (inputErrors.passwordNumeric && styles.inputInvalid),
              ]}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={[
                styles.input,
                inputErrors.confirmPassword && styles.inputInvalid,
              ]}
            />
          </View>
          {inputErrors.password && (
            <Text style={styles.errorText}>{inputErrors.password}</Text>
          )}
          {inputErrors.email && (
            <Text style={styles.errorText}>{inputErrors.email}</Text>
          )}
          {inputErrors.name && (
            <Text style={styles.errorText}>{inputErrors.name}</Text>
          )}
          {inputErrors.confirmPassword && (
            <Text style={styles.errorText}>{inputErrors.confirmPassword}</Text>
          )}
          <View style={styles.buttonContainer}>
            <SubmitButton
              text="Sign Up"
              onPress={register}
              style={{ backgroundColor: Colors.primary800 }}
            />
          </View>
          <View style={styles.inlineRow}>
            <Text style={styles.inlineText}>Have an account? </Text>
            <SubmitButton
              onPress={orLogin}
              text="Log in"
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

export default RegisterForm;

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    marginHorizontal: width * 0.05,
    borderRadius: 28,
    padding: 24,
    justifyContent: "center",
    //alignItems: "center",
    marginBottom: 150,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#536493",
    marginBottom: 20,
    textAlign: "center",
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
    borderColor: "#D4BDAC",
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

  inlineLink: {
    fontSize: 16,
    color: Colors.primary800,
    fontWeight: "bold",
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
  inputInvalid: {
    backgroundColor: "#ffe6e6",
    borderColor: "red",
  },
  errorText: {
    opacity: 0.8,
    fontStyle: "italic",
    fontSize: 12,
    color: Colors.primary600,
  },
});
