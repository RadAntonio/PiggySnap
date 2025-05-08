// screens/ProfileScreen.js
import React, { useState, useEffect, useLayoutEffect } from "react";
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
  Pressable,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import SubmitButton from "../components/SignupPage/SubmitButton";
import { Colors } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function ProfileScreen({ navigation }) {
  const { authState, onLogout, setAuthState } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── New loading states for export buttons ────────────────────────
  const [sendingPdf, setSendingPdf] = useState(false);
  const [sendingCsv, setSendingCsv] = useState(false);
  // ────────────────────────────────────────────────────────────────────────

  // overlay states
  const [showPdfOverlay, setShowPdfOverlay] = useState(false);
  const [showCsvOverlay, setShowCsvOverlay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // inject logout icon button into header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onLogout} style={{ marginRight: 16 }}>
          <Ionicons
            name="log-out-outline"
            size={24}
            color={Colors.primary800}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, onLogout]);

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
      const res = await axios.get(`${API_URL}/user/2fa/enable/`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
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

  // open overlay
  const openPdfOverlay = () => {
    setShowPdfOverlay(true);
  };
  const openCsvOverlay = () => {
    setShowCsvOverlay(true);
  };

  // Confirm and send PDF with date params as query params
  const handleConfirmPdf = async () => {
    setShowPdfOverlay(false);
    setSendingPdf(true);
    try {
      await axios.post(
        `${API_URL}/receipt/send-pdf/`,
        {}, // empty body
        {
          headers: { Authorization: `Bearer ${authState.token}` },
          params: { start_date: startDate, end_date: endDate },
        }
      );
      Alert.alert("Success", "Encrypted PDF emailed!");
    } catch {
      Alert.alert("Error", "Could not send PDF.");
    } finally {
      setSendingPdf(false);
    }
  };

  // Confirm and send CSV with date params as query params
  const handleConfirmCsv = async () => {
    setShowCsvOverlay(false);
    setSendingCsv(true);
    try {
      await axios.post(
        `${API_URL}/receipt/send-csv/`,
        {},
        {
          headers: { Authorization: `Bearer ${authState.token}` },
          params: { start_date: startDate, end_date: endDate },
        }
      );
      Alert.alert("Success", "Encrypted CSV emailed!");
    } catch {
      Alert.alert("Error", "Could not send CSV.");
    } finally {
      setSendingCsv(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.card}>
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
            style={[styles.button, { backgroundColor: Colors.primary600 }]}
            disabled={loading}
          />
          {/* — Export Buttons — */}
          <SubmitButton
            text={sendingPdf ? "Sending PDF…" : "Export PDF"}
            onPress={openPdfOverlay}
            style={[styles.button, { backgroundColor: Colors.primary800 }]}
            disabled={sendingPdf}
          />
          <SubmitButton
            text={sendingCsv ? "Sending CSV…" : "Export CSV"}
            onPress={openCsvOverlay}
            style={[styles.button, { backgroundColor: Colors.primary800 }]}
            disabled={sendingCsv}
          />

          {/* — 2FA Section — */}
          <View style={styles.twoFaGroup}>
            {has2fa ? (
              // already on → allow disable
              <SubmitButton
                text={disabling ? "Disabling…" : "Disable 2FA"}
                onPress={handleDisable2fa}
                style={[
                  styles.button,
                  { backgroundColor: Colors.error || "#b00" },
                ]}
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
                    Alert.alert(
                      "Copied!",
                      "Activation code copied to clipboard."
                    );
                  }}
                >
                  <Text style={styles.activationCode}>{activationCode}</Text>
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    placeholder="123456"
                    value={verifyCode}
                    onChangeText={setVerifyCode}
                    keyboardType="numeric"
                    style={[styles.input, verifyError && styles.inputInvalid]}
                  />
                  {verifyError ? (
                    <Text style={styles.errorText}>{verifyError}</Text>
                  ) : null}
                </View>
                <SubmitButton
                  text={verifying ? "Verifying…" : "Verify 2FA"}
                  onPress={handleVerify2fa}
                  style={[
                    styles.button,
                    { backgroundColor: Colors.primary800 },
                  ]}
                  disabled={verifying}
                />
              </>
            ) : (
              // initial “Enable 2FA” button with updated layout styling
              <SubmitButton
                text={enabling ? "Generating…" : "Enable 2FA"}
                onPress={handleEnable2fa}
                style={[styles.button, { backgroundColor: Colors.primary800 }]}
                disabled={enabling}
              />
            )}

            {(enabling || disabling) && (
              <ActivityIndicator style={{ marginTop: 10 }} />
            )}
          </View>
          {/* — PDF Overlay — */}
          {showPdfOverlay && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Select Interval</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Start Date (YYYY-MM-DD)"
                  value={startDate}
                  onChangeText={setStartDate}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="End Date (YYYY-MM-DD)"
                  value={endDate}
                  onChangeText={setEndDate}
                />
                <View style={styles.modalButtons}>
                  <Pressable
                    style={[
                      styles.modalButton,
                      { backgroundColor: Colors.primary600 },
                    ]}
                    onPress={() => setShowPdfOverlay(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.modalButton,
                      { backgroundColor: Colors.primary800 },
                    ]}
                    onPress={handleConfirmPdf}
                  >
                    <Text style={styles.modalButtonText}>Confirm</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* — CSV Overlay — */}
          {showCsvOverlay && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Select Interval</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Start Date (YYYY-MM-DD)"
                  value={startDate}
                  onChangeText={setStartDate}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="End Date (YYYY-MM-DD)"
                  value={endDate}
                  onChangeText={setEndDate}
                />
                <View style={styles.modalButtons}>
                  <Pressable
                    style={[
                      styles.modalButton,
                      { backgroundColor: Colors.primary600 },
                    ]}
                    onPress={() => setShowCsvOverlay(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.modalButton,
                      { backgroundColor: Colors.primary800 },
                    ]}
                    onPress={handleConfirmCsv}
                  >
                    <Text style={styles.modalButtonText}>Confirm</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  card: {
    width: width * 0.9,
    alignSelf: "center",
    borderRadius: 28,
    padding: 24,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary800,
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: Colors.primary600, marginBottom: 6 },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary800,
    fontSize: 16,
  },
  inputInvalid: {
    borderColor: "red",
    backgroundColor: "#fee",
  },
  errorText: { color: "red", marginTop: 4, fontSize: 12 },
  twoFaGroup: { marginTop: 30, alignItems: "center" },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 12,
  },
  instruction: {
    textAlign: "center",
    marginVertical: 12,
    color: Colors.primary800,
    fontSize: 16,
  },
  activationCode: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 2,
    color: Colors.primary800,
    marginBottom: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginVertical: 6,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalButtonText: { color: "#fff", fontWeight: "600" },
});
