import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useFonts } from "expo-font";

function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
      "Frankfurt-Am6": require("../assets/fonts/Frankfurt-Am6.ttf"),
    });
  const { authState } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome, {authState.user.name}</Text>
      </View>
    </View>
  );
}

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeContainer: {
    paddingTop: 20,
    paddingHorizontal: 24,
    alignItems: "flex-start",
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: "600",
    color: "#333",
    fontFamily: 'Frankfurt-Am6'
  },
  nameText: {
    fontSize: 20,
    color: "#666",
  },
});
