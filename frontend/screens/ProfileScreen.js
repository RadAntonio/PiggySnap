import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { onLogout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Screen</Text>
      <Button title="Log Out" onPress={onLogout} />
    </View>
  );
}
