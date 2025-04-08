// components/HomePage/ReceiptList.js
import React from "react";
import { FlatList, View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ReceiptList({ data }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No receipts found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      scrollEnabled={true}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.left}>
            <View style={styles.iconBox}>

              <Ionicons
                name={
                  item.category === "Electronics"
                    ? "laptop-outline"
                    : "cart-outline"
                }
                size={20}
                color="#6C63FF"
              />
            </View>
            <View>
              <Text style={styles.title}>{item.store}</Text>
              <Text style={styles.date}>{item.date}</Text>
              <View style={styles.tagScrollWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {item.tags.map((tag, index) => (
                    <View key={index} style={styles.tagBubble}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
          <Text style={styles.price}>{item.amount} RON </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    backgroundColor: "#EFEFFD",
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    color: "#1E1E1E",
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginVertical: 2,
  },
  tagScrollWrapper: {
    marginTop: 6,
    maxWidth: 220,
  },

  tagBubble: {
    backgroundColor: '#E5D9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },

  tagText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },

  price: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1E1E1E",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
  },
});
