// components/HomePage/StatsCardList.js
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";



export default function StatsCardList({ total, receiptCount }) {
  const safeTotal = typeof total === "number" ? total : 0;
  const safeCount = typeof receiptCount === "number" ? receiptCount : 0;
  const average = safeCount > 0 ? (safeTotal / safeCount).toFixed(2) : "0.00";
  const data = [
    { key: "Total", value: `${safeTotal.toFixed(2)}`, icon: "cash-outline" },
    { key: "Receipts", value: `${safeCount}`, icon: "document-text-outline" },
    { key: "Avg/Recip", value: `${average}`, icon: "stats-chart-outline" },
  ];

  return (
    <FlatList
      horizontal
      data={data}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Ionicons name={item.icon} size={20} color={Colors.primary800} />
          <Text style={styles.label}>{item.key}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.primary800,
  },
  value: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 4,
    color: "black",
  },
});
