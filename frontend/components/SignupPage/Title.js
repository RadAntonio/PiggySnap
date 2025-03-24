import { View, StyleSheet, Text } from "react-native";
import { useFonts } from "expo-font";
import { Colors } from "../../constants/Colors";


function Title() {
  const [fontsLoaded] = useFonts({
    "Frankfurt-Am6": require("../../assets/fonts/Frankfurt-Am6.ttf"),
  });

  return (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>PiggySnap</Text>
    </View>
  );
}

export default Title;

const styles = StyleSheet.create({
  titleContainer: {
    flex: 2,
    marginTop: 90,
  },
  title: {
    fontFamily: "Frankfurt-Am6",
    fontSize: 70,
    color: Colors.primary600,
  },
});
