// components/SignupPage/LoginForm.js
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
  TouchableOpacity,
  Keyboard,
} from "react-native";

import SubmitButton from "./SubmitButton";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function LoginForm({ orRegister }) {
  const [stage, setStage] = useState("credentials"); // or "2fa"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [preToken, setPreToken] = useState("");
  const [inputErrors, setInputErrors] = useState({});

  const { onLogin, onVerify2fa } = useAuth();
  const navigation = useNavigation();

  // STEP 1: credentials
  const handleLogin = async () => {
    // reset errors
    setInputErrors({});

    // client‐side checks
    const errs = {};
    if (!email.trim())    errs.email    = "Email is required";
    if (!password)        errs.password = "Password is required";
    if (Object.keys(errs).length) {
      setInputErrors(errs);
      return;
    }

    const result = await onLogin(email.trim(), password);
    if (result.twoFactorRequired) {
      setPreToken(result.preToken);
      setStage("2fa");
    } else if (result.error) {
      // map backend errors
      const msg = result.msg || {};
      const apiErrs = {};
      if (msg.email)            apiErrs.email    = msg.email[0];
      if (msg.password)         apiErrs.password = msg.password[0];
      if (msg.non_field_errors) apiErrs.email = apiErrs.password = msg.non_field_errors[0];
      // fallback generic detail
      if (msg.detail && !apiErrs.email && !apiErrs.password) {
        apiErrs.email = apiErrs.password = msg.detail;
      }
      setInputErrors(apiErrs);
    } else {
      navigation.getParent()?.replace("MainApp");
    }
  };

  // STEP 2: 2FA
  const handleVerify2fa = async () => {
    // reset
    setInputErrors({});

    // client‐side check
    if (!code.trim()) {
      setInputErrors({ code: "Code is required" });
      return;
    }

    const result = await onVerify2fa(preToken, code.trim());
    if (result.error) {
      setInputErrors({ code: result.msg.detail || "Invalid code" });
    } else {
      navigation.getParent()?.replace("MainApp");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            {stage === "credentials" ? "Log In" : "Enter 2FA Code"}
          </Text>

          {stage === "credentials" ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[
                    styles.input,
                    inputErrors.email && styles.inputInvalid,
                  ]}
                />
                {!!inputErrors.email && (
                  <Text style={styles.errorText}>{inputErrors.email}</Text>
                )}
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
                    inputErrors.password && styles.inputInvalid,
                  ]}
                />
                {!!inputErrors.password && (
                  <Text style={styles.errorText}>{inputErrors.password}</Text>
                )}
              </View>

              <SubmitButton
                text="Log In"
                onPress={handleLogin}
                style={styles.loginButton}
              />

              <View style={styles.inlineRow}>
                <Text style={styles.inlineText}>Not registered? </Text>
                <SubmitButton
                  text="Sign Up"
                  onPress={orRegister}
                  style={styles.signupButton}
                  textStyle={styles.signupText}
                />
              </View>

              <TouchableOpacity
                style={styles.forgotContainer}
                onPress={() => navigation.navigate("ForgotPasswordScreen")}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>2FA Code</Text>
                <TextInput
                  placeholder="123456"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    inputErrors.code && styles.inputInvalid,
                  ]}
                />
                {!!inputErrors.code && (
                  <Text style={styles.errorText}>{inputErrors.code}</Text>
                )}
              </View>

              <SubmitButton
                text="Verify Code"
                onPress={handleVerify2fa}
                style={styles.loginButton}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    marginHorizontal: width * 0.05,
    borderRadius: 28,
    padding: 24,
    marginBottom: 150,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary800,
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: { marginBottom: 12 },
  label: {
    fontSize: 14,
    color: "#536493",
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  inputInvalid: {
    backgroundColor: "#ffe6e6",
    borderColor: "red",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontStyle: "italic",
    color: Colors.primary600,
  },
  loginButton: {
    backgroundColor: Colors.primary800,
    marginVertical: 10,
  },
  inlineRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  inlineText: {
    fontSize: 16,
    color: Colors.primary800,
  },
  signupButton: {
    backgroundColor: Colors.primary600,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 4,
  },
  signupText: {
    fontSize: 12,
    color: "white",
  },
  forgotContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  forgotText: {
    fontSize: 14,
    color: Colors.primary600,
    fontWeight: "500",
  },
});
