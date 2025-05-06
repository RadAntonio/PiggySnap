import React from "react";
import { View, Text, StyleSheet} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Title() {
  const { authState } = useAuth();
  const name = authState?.user?.name || "User";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, {name}!</Text>
          <Text style={styles.subtitle}>Smart spending leads to better living</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F9F9FB",
  },
  header: {
    flexDirection: "row",
    marginTop: 60,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E1E1E",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 10,
    marginBottom: -20,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
});
