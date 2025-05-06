// screens/ProfileScreen.js
import React, { useState, useEffect } from "react";
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
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import SubmitButton from "../components/SignupPage/SubmitButton";
import { Colors } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const { authState, onLogout, setAuthState } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA setup state
  const [enabling, setEnabling] = useState(false);
  const [activationCode, setActivationCode] = useState(null);

  // 2FA verify state
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // disable state
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    if (authState.user?.name) {
      setName(authState.user.name);
    }
  }, [authState.user]);

  // A) Update display name
  const handleUpdateName = async () => {
    if (!name.trim()) {
      return Alert.alert("Validation error", "Name cannot be empty.");
    }
    setLoading(true);
    try {
      const { data } = await axios.patch(
        `${API_URL}/user/me`,
        { name },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setAuthState({ ...authState, user: data });
      Alert.alert("Success", "Name updated successfully.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not update name.");
    } finally {
      setLoading(false);
    }
  };

  // B) Kick off 2FA: get activation code (no QR)
  const handleEnable2fa = async () => {
    setEnabling(true);
    try {
      const res = await axios.get(
        `${API_URL}/user/2fa/enable/`,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setActivationCode(res.data.activation_code);
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Could not generate activation code.");
    } finally {
      setEnabling(false);
    }
  };

  // C) Verify the 6-digit code
  const handleVerify2fa = async () => {
    if (!verifyCode.trim()) {
      return setVerifyError("Code is required");
    }
    setVerifyError("");
    setVerifying(true);
    try {
      await axios.post(
        `${API_URL}/user/2fa/verify/`,
        { token: verifyCode.trim() },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setAuthState({
        ...authState,
        user: { ...authState.user, two_factor_enabled: true },
      });
      Alert.alert("Success", "Two-Factor Authentication is now enabled!");
      // clear setup UI
      setActivationCode(null);
      setVerifyCode("");
    } catch (err) {
      console.warn(err);
      setVerifyError(err.response?.data?.detail || "Invalid code.");
    } finally {
      setVerifying(false);
    }
  };

  // D) Disable 2FA
  const handleDisable2fa = async () => {
    setDisabling(true);
    try {
      await axios.post(
        `${API_URL}/user/2fa/disable/`,
        {},
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setAuthState({
        ...authState,
        user: { ...authState.user, two_factor_enabled: false },
      });
      Alert.alert("Success", "Two-Factor Authentication has been disabled.");
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Could not disable 2FA.");
    } finally {
      setDisabling(false);
    }
  };

  const has2fa = authState.user?.two_factor_enabled;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>

          {/* — Name update — */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>
          <SubmitButton
            text={loading ? "Saving…" : "Update Name"}
            onPress={handleUpdateName}
            style={{ backgroundColor: Colors.primary600 }}
            disabled={loading}
          />

          {/* — Log out — */}
          <SubmitButton
            text="Log Out"
            onPress={onLogout}
            style={{ backgroundColor: Colors.primary800, marginTop: 10 }}
          />

          {/* — 2FA Section — */}
          <View style={{ marginTop: 30 }}>
            {has2fa ? (
              // already on → allow disable
              <SubmitButton
                text={disabling ? "Disabling…" : "Disable 2FA"}
                onPress={handleDisable2fa}
                style={{ backgroundColor: Colors.error || "#b00" }}
                disabled={disabling}
              />
            ) : activationCode ? (
              // show manual activation code + verify input
              <>
                <Text style={styles.instruction}>
                  Enter this code into your authenticator app:
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    await Clipboard.setStringAsync(activationCode);
                    Alert.alert("Copied!", "Activation code copied to clipboard.");
                  }}
                >
                  <Text style={styles.activationCode}>
                    {activationCode}
                  </Text>
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    placeholder="123456"
                    value={verifyCode}
                    onChangeText={setVerifyCode}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      verifyError && styles.inputInvalid,
                    ]}
                  />
                  {verifyError ? (
                    <Text style={styles.errorText}>{verifyError}</Text>
                  ) : null}
                </View>
                <SubmitButton
                  text={verifying ? "Verifying…" : "Verify 2FA"}
                  onPress={handleVerify2fa}
                  style={{ backgroundColor: Colors.primary800 }}
                  disabled={verifying}
                />
              </>
            ) : (
              // initial “Enable 2FA” button
              <SubmitButton
                text={enabling ? "Generating…" : "Enable 2FA"}
                onPress={handleEnable2fa}
                style={{ backgroundColor: Colors.primary800 }}
                disabled={enabling}
              />
            )}

            {(enabling || disabling) && (
              <ActivityIndicator style={{ marginTop: 10 }} />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  card: {
    width: width * 0.9,
    alignSelf: "center",
    borderRadius: 28,
    padding: 24,
    backgroundColor: "#fff",
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary800,
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: Colors.primary600, marginBottom: 4 },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  inputInvalid: {
    borderColor: "red",
    backgroundColor: "#fee",
  },
  errorText: { color: "red", marginTop: 4, fontSize: 12 },
  instruction: {
    textAlign: "center",
    marginVertical: 12,
    color: Colors.primary800,
  },
  activationCode: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
    color: Colors.primary800,
    marginBottom: 16,
  },
});
