import { View, Text, StyleSheet } from "react-native";

function SignupScreen() {
  return (
    <View style={styles.container}>
      <Text>SIGNUP PAGE</Text>
    </View>
  );
}

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontSize: "30",
  },
});
