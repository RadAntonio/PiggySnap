import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Colors } from "../../constants/Colors";

export default function GetStartedItem({ item }) {

  const { width } = useWindowDimensions();
  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.card}>
        <Image
          source={item.image}
          style={[styles.image, { width: width * 0.6, height: width * 0.6 }]}
        />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: Colors.primary100,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    width: "90%",
    height: "85%",
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
    fontSize: 24,
    marginBottom: 10,
    color: Colors.primary800,
    textAlign: "center",
    fontSize: 25
  },
  description: {
    fontWeight: "300",
    color: Colors.primary800,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 100,
    marginTop: 100,
  },
});
