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

const { width } = Dimensions.get("window");

function RegisterForm({ orRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Log In</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
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
              style={styles.input}
            />
          </View>

          <View style={styles.buttonContainer}>
            <SubmitButton
              text="Log In"
              onPress={() => {
                console.log("submit");
              }}
              style={{ backgroundColor: Colors.primary800 }}
            />
          </View>
          <View style={styles.inlineRow}>
            <Text style={styles.inlineText}>Not registered? </Text>
            <SubmitButton
              onPress={orRegister}
              text="Sign Up"
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
    color: Colors.primary800,
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
});
