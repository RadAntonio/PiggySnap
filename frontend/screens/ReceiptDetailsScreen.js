import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFonts } from "expo-font";
import { Colors } from "../constants/Colors";

export default function ReceiptDetailsScreen({ route }) {
    const [fontsLoaded] = useFonts({
        "Frankfurt-Am6": require("../assets/fonts/Frankfurt-Am6.ttf"),
      });
    const { receipt } = route.params;

    console.log("RECEIPT ITEMS:", receipt.items);

    let items = [];
    if (Array.isArray(receipt.items)) {
      items = receipt.items;
    }

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{receipt.store}</Text>
        <Text style={styles.amount}>{receipt.amount} RON</Text>
        <Text style={styles.date}>{receipt.date}</Text>


        <Text style={styles.section}>Tags:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
          {receipt.tags?.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.section}>Items:</Text>
        {items?.length > 0 ? (
          items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetail}>Quantity: {item.quantity}</Text>
              <Text style={styles.itemDetail}>Unit Price: {item.unit_price} RON</Text>
              <Text style={styles.itemPrice}>Price: {item.price} RON</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: "#888" }}>No items found.</Text>
        )}
      </ScrollView>
    );
  }



const styles = StyleSheet.create({
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
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
    fontSize: 16,
    color: Colors.primary800,
  },
  amount: {
    textAlign: "center",
    fontSize: 30,
    color: Colors.primary800,
  },
  section: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
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
});
