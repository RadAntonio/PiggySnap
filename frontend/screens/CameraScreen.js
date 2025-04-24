import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  Image,
  FlatList,
  Pressable,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useAuth, API_URL } from "../context/AuthContext";
import { Colors } from "../constants/Colors";

export default function CameraScreen() {
  const { authState } = useAuth();
  const token = authState?.token;
  const { width } = useWindowDimensions();

  const [selectedImage, setSelectedImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  async function uploadImageAsync(uri) {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", { uri, name: "photo.jpg", type: "image/jpeg" });

      const resp = await fetch(`${API_URL}/ocr/extraction`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await resp.text();
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
      const json = JSON.parse(text);
      setOcrResult(json);

      Alert.alert(
        "Extraction Complete",
        "Your image has been processed and the OCR results are ready.",
        [{ text: "OK" }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Upload failed", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openCameraHandler() {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permission Denied", "Camera access is required.");
    }
    Alert.alert(
      "Photo Instructions",
      "1. Ensure that the receipt is well-lit.\n2. Use a dark background.\n3. Capture the entire receipt in the frame.",
      [
        {
          text: "OK",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: false,
              quality: 0.5,
            });

            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setSelectedImage(uri);
              await uploadImageAsync(uri);
            }
          },
        },
      ]
    );
  }

  async function chooseFromGalleryHandler() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert(
        "Permission Denied",
        "Gallery access is required to choose a photo."
      );
    }
    Alert.alert(
      "Photo Instructions",
      "1. Ensure that the receipt is well-lit.\n2. Use a dark background.\n3. Capture the entire receipt in the frame.",
      [
        {
          text: "OK",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: false,
              quality: 0.5,
            });

            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setSelectedImage(uri);
              await uploadImageAsync(uri);
            }
          },
        },
      ]
    );
  }

  const data = [
    {
      key: "1",
      title: "Take a Photo",
      image: require("../assets/images/folder-line-chart-svgrepo-com.png"),
      onPress: openCameraHandler,
    },
    {
      key: "2",
      title: "Choose from Gallery",
      image: require("../assets/images/folder-line-chart-svgrepo-com.png"),
      onPress: chooseFromGalleryHandler,
    },
    {
      key: "3",
      title: "Introduce Manually",
      image: require("../assets/images/folder-line-chart-svgrepo-com.png"),
      onPress: () => navigation.navigate("ManualInputScreen"),
    },
  ];

  function renderCard({ item }) {
    return (
      <Pressable
        onPress={item.onPress}
        style={[styles.card, { width: width * 0.9 }]}
      >
        <Image
          source={item.image}
          style={[styles.image, { width: width * 0.2, height: width * 0.2 }]}
        />
        <Text style={styles.title}>{item.title}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderCard}
        scrollEnabled={false}
        contentContainerStyle={{ alignItems: "center", paddingTop: 100 }}
      />
      {loading && <ActivityIndicator size="large" style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 220,
    backgroundColor: "rgba(239, 90, 111, 0.8)",
  },
  image: {
    resizeMode: "contain",
    marginRight: 20,
  },
  title: {
    fontWeight: "800",
    fontSize: 20,
    color: Colors.primary100,
  },
  loader: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
  },
});
