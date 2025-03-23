import { StyleSheet, Text, View } from "react-native";
import GetStarted from "../components/GetStartedPage/GetStarted";

function GetStartedScreen() {
  return (
    <View style={styles.container}>
      <GetStarted />
    </View>
  );
}

export default GetStartedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
