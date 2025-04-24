import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFonts } from "expo-font";
import { Colors } from "../constants/Colors";
import { API_URL, useAuth } from "../context/AuthContext";
import SubmitButton from "../components/SignupPage/SubmitButton";
import { useFocusEffect } from "@react-navigation/native";

export default function ReceiptDetailsScreen({ route, navigation }) {
  const { receipt } = route.params;
  const {
    authState: { token },
  } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const [fontsLoaded] = useFonts({
    "Frankfurt-Am6": require("../assets/fonts/Frankfurt-Am6.ttf"),
  });
  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary600} />
      </View>
    );
  }

  const items = Array.isArray(receipt.items) ? receipt.items : [];

  const handleDelete = () => {
    Alert.alert(
      "Confirm delete",
      "Are you sure you want to delete this receipt?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!token) {
              return Alert.alert(
                "Not authenticated",
                "Please log in before deleting."
              );
            }
            setDeleting(true);
            try {
              const res = await fetch(
                `${API_URL}/receipt/delete/${receipt.id}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const body = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(body.message || res.statusText);
              Alert.alert("Deleted", "Receipt deleted successfully.", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (err) {
              Alert.alert("Error", err.message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate("EditReceiptScreen", { receipt });
  };



  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{receipt.store}</Text>
      <Text style={styles.amount}>{receipt.amount} RON</Text>
      <Text style={styles.date}>{receipt.date}</Text>

      <Text style={styles.section}>Tags:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsRow}
      >
        {receipt.tags?.map((tag, idx) => (
          <View key={idx} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.section}>Items:</Text>
      {items.length > 0 ? (
        items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetail}>Quantity: {item.quantity}</Text>
            <Text style={styles.itemDetail}>
              Unit Price: {item.unit_price} RON
            </Text>
            <Text style={styles.itemPrice}>Price: {item.price} RON</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noItems}>No items found.</Text>
      )}

      <SubmitButton
        onPress={handleDelete}
        text="Delete Receipt"
        style={{ backgroundColor: Colors.primary600, height: 50 }}
        textStyle={{
          color: "white",
          fontSize: 18,
          marginVertical: -10,
          marginHorizontal: -14,
        }}
      />
      <SubmitButton
        onPress={handleEdit}
        text="Edit Receipt"
        style={{
          backgroundColor: Colors.primary800,
          height: 50,
          marginTop: 10,
          marginBottom: 50,
        }}
        textStyle={{
          color: "white",
          fontSize: 18,
          marginVertical: -10,
          marginHorizontal: -14,
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    backgroundColor: "#fff",
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 50,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "Frankfurt-Am6",
    color: Colors.primary600,
  },
  date: {
    color: Colors.primary800,
    marginBottom: 4,
    textAlign: "center",
    fontSize: 16,
  },
  amount: {
    textAlign: "center",
    fontSize: 30,
    color: Colors.primary800,
    fontWeight: "700",
  },
  section: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 20,
    marginBottom: 6,
    borderBlockColor: "#E0E0E0",
    borderBottomWidth: 6,
    paddingBottom: 4,
    width: "20%",
    borderBottomEndRadius: 20,
    textTransform: "uppercase",
    color: Colors.primary800,
  },
  tagsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tag: {
    backgroundColor: "#E5D9FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    color: "#6C63FF",
    fontWeight: "500",
  },
  itemRow: {
    marginBottom: 12,
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 12,
    borderColor: "#E0E0E0",
    borderWidth: 4,
  },
  itemName: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 13,
    color: "#555",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
    color: "#1E1E1E",
  },
  noItems: {
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
    borderBottomWidth: 6,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 4,
    borderBottomEndRadius: 20,
    textTransform: "uppercase",
    color: Colors.primary800,
    opacity: 0.5,
    textAlign: "center",
  },
});
