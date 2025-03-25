import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

function WelcomeScreen() {
  const { authState } = useAuth();

  return (
    <View style={styles.container}>
      <Text>hello {authState?.user?.name || "firend"}</Text>
    </View>
  );
}

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
