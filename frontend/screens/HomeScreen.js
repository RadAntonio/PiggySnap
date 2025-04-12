import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Title from "../components/HomePage/Title";
import TimeRangeFilter from "../components/HomePage/TimeFilterList";
import StatsCardList from "../components/HomePage/StatsCardsList";
import { useState } from "react";
import ReceiptList from "../components/HomePage/ReceiptList";
import { useEffect } from "react";
import axios from "axios";
import { API_URL } from "../context/AuthContext";
import dayjs from "dayjs";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

export default function HomeScreen() {
  const [selectedRange, setSelectedRange] = useState("Today");
  const [filters, setFilters] = useState({});
  const [receipts, setReceipts] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const filterParams = route.params || {};

  const fetchReceipts = async (range = "Today", filters = {}) => {
    try {
      const today = dayjs();
      const params = { ...filters };

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
          if (!params.month) {
            params.month = today.month() + 1;
          }
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
    fetchReceipts(selectedRange, filters);
  }, [selectedRange, filters]);

  const resetFilters = () => {
    setFilters({});
    fetchReceipts(selectedRange, {}); // re-fetch with no filters
  };

  const handleFilterChange = (range) => {
    setSelectedRange(range);
    fetchReceipts(range, filters);
  };

  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);
  return (
    <View style={{ backgroundColor: "#F9F9FB", flex: 1 }}>
      <Title />
      <TimeRangeFilter onSelect={handleFilterChange} />
      <StatsCardList total={totalAmount} receiptCount={receipts.length} />
      <View style={styles.sectionHeader}>
        <View style={styles.filterRow}>
          <Text style={styles.sectionTitle}>{selectedRange}'s Receipts</Text>

          {Object.keys(filters).length > 0 && (
            <Pressable onPress={resetFilters}>
              <Text style={styles.resetButton}>Reset</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() =>
            navigation.navigate("FilterScreen", {
              currentFilters: filters, // 👈 pass current filters
              onApply: (appliedFilters) => {
                setFilters(appliedFilters);
              },
            })
          }
        >
          <Text style={styles.moreButton}>⋯</Text>
        </Pressable>
      </View>

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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E1E1E",
  },

  moreButton: {
    fontSize: 26,
    color: "#888",
    paddingHorizontal: 10,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
  },

  resetButton: {
    fontSize: 14,
    color: "#6C63FF",
    fontWeight: "600",
    paddingHorizontal: 8,
  },
});
