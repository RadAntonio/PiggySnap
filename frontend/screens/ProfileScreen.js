import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
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

  useEffect(() => {
    if (authState.user?.name) {
      setName(authState.user.name);
    }
  }, [authState.user]);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      Alert.alert("Validation error", "Name cannot be empty.");
      return;
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
      console.log("Update name error", err.response || err.message);
      Alert.alert("Error", "Could not update name.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
          </View>

          <View style={styles.buttonContainer}>
            <SubmitButton
              text="Update Name"
              onPress={handleUpdateName}
              style={{ backgroundColor: Colors.primary600 }}
              textStyle={{ color: Colors.primary100 }}
              disabled={loading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <SubmitButton
              text="Log Out"
              onPress={onLogout}
              style={{ backgroundColor: Colors.primary800 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    width: width * 0.9,
    alignSelf: "center",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary800,
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.primary600,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  buttonContainer: {
    marginBottom: 15,
  },
});
