import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const navigation = useNavigation();
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>Forgot Password</Text>
            <Text style={{ fontSize: 16, marginTop: 10 }}>Please enter your email to reset your password.</Text>
            <TextInput
                style={{
                    width: "80%",
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 5,
                    marginTop: 20,
                }}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(text) => setEmail(text)}
            />
            <TouchableOpacity
                style={{
                    backgroundColor: "#007BFF",
                    padding: 15,
                    borderRadius: 5,
                    marginTop: 20,
                }}
                //onPress={handleForgotPassword}
            >
                <Text style={{ color: "#fff", fontSize: 16 }}>Send Reset Link</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ marginTop: 20 }}
                onPress={() => navigation.navigate("Login")}
            >
                <Text style={{ color: "#007BFF" }}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
}

export default ForgotPasswordScreen;