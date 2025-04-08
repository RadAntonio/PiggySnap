import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Title from "../components/HomePage/Title";
import TimeRangeFilter from "../components/HomePage/TimeFilterList";
import StatsCardList from "../components/HomePage/StatsCardsList";
import { useState } from "react";
import ReceiptList from "../components/HomePage/ReceiptList";
import { useEffect } from "react";
import axios from "axios";
import { API_URL } from "../context/AuthContext";
import dayjs from "dayjs";

export default function HomeScreen() {
  const [selectedRange, setSelectedRange] = useState("Today");
  const [receipts, setReceipts] = useState([]);

  const fetchReceipts = async (range = "Today") => {
    try {
      const today = dayjs();
      const params = {};

      switch (range) {
        case "Today":
          params.start_date = today.format("YYYY-MM-DD");
          params.end_date = today.format("YYYY-MM-DD");
          break;

        case "This Week":
          params.start_date = today.startOf("week").format("YYYY-MM-DD");
          params.end_date = today.endOf("week").format("YYYY-MM-DD");
          break;

        case "This Month":
          params.month = today.month() + 1;
          break;

        case "All Time":
        default:
          break;
      }

      const res = await axios.get(`${API_URL}/receipt/list`, { params });

      const mappedReceipts = res.data.map((r) => ({
        id: r.id,
        store: r.shop_name,
        date: r.date,
        amount: parseFloat(r.total),
        tags: r.tags.map((tag) => tag.name),
      }));

      setReceipts(mappedReceipts);
    } catch (error) {
      console.error("Error fetching receipts:", error.message);
      setReceipts([]);
    }
  };

  useEffect(() => {
    fetchReceipts(selectedRange);
  }, []);

  const handleFilterChange = (range) => {
    setSelectedRange(range);
    fetchReceipts(range);
  };

  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);
  return (
    <View style={{ backgroundColor: "#F9F9FB", flex: 1 }}>
      <Title />
      <TimeRangeFilter onSelect={handleFilterChange} />
      <StatsCardList total={totalAmount} receiptCount={receipts.length} />
      <Text style={styles.sectionTitle}>{selectedRange}'s Receipts</Text>
      <View style={{ flex: 200 }}>
        <ReceiptList data={receipts} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    color: "#1E1E1E",
  },
});
