// screens/StatsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { Colors } from "../constants/Colors";
import dayjs from "dayjs";
import TimeFilterList from "../components/StatsPage/TimeRamgeFilter";
import ChartPicker from "../components/StatsPage/ChartPicker";
import axios from "axios";
import CalendarHeat from "../components/StatsPage/CalendarHeat";
import { API_URL } from "../context/AuthContext";

export default function StatsScreen() {
  const [selectedRange, setSelectedRange] = useState("This Week");
  const [receipts, setReceipts] = useState([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const fetchReceipts = async (range = "This Week", rangeParams = {}) => {
    try {
      const today = dayjs();
      const params = { ...rangeParams };
      switch (range) {
        case "This Week":
          params.start_date = today.startOf("week").format("YYYY-MM-DD");
          params.end_date = today.endOf("week").format("YYYY-MM-DD");
          break;
        case "This Month":
          params.month = today.month() + 1;
          break;
        case "Custom Range":
          // params provided by rangeParams
          break;
      }
      const res = await axios.get(`${API_URL}/receipt/list`, { params });
      const mapped = res.data.map((r) => ({
        id: r.id,
        store: r.shop_name,
        date: r.date,
        amount: parseFloat(r.total),
        tags: r.tags.map((t) => t.name),
        items: r.items,
      }));
      setReceipts(mapped);
    } catch (err) {
      console.error("Error fetching receipts:", err);
      setReceipts([]);
    }
  };

  useEffect(() => {
    if (selectedRange !== "Custom Range") {
      fetchReceipts(selectedRange);
    }
  }, [selectedRange]);

  const handleFilterChange = (range) => {
    if (range === "Custom Range") {
      setShowCustomModal(true);
    } else {
      setSelectedRange(range);
    }
  };

  const applyCustomRange = () => {
    if (!customStart || !customEnd) return;
    setShowCustomModal(false);
    setSelectedRange("Custom Range");
    fetchReceipts("Custom Range", {
      start_date: customStart,
      end_date: customEnd,
    });
  };

  // find the receipt with the max amount
  const highestReceipt = receipts.reduce(
    (prev, curr) => (curr.amount > prev.amount ? curr : prev),
    { amount: 0 }
  );

  const mostVisited = receipts.reduce(
    (prev, { store }) => {
      // how many times have we visited `prev.store` so far?
      const prevCount = receipts.filter((r) => r.store === prev.store).length;
      // how many times have we visited this receipt's store?
      const currCount = receipts.filter((r) => r.store === store).length;
      // pick whichever is higher
      return currCount > prevCount ? { store, count: currCount } : prev;
    },
    { store: "", count: 0 }
  );
  const highestSpentTag = receipts.reduce(
    (prev, { tags, amount }) => {
      // pick the primary tag (or fallback)
      const tag = tags[0] || "Uncategorized";

      // total spent so far on prev.tag
      const prevTotal = receipts
        .filter((r) => (r.tags[0] || "Uncategorized") === prev.tag)
        .reduce((sum, r) => sum + r.amount, 0);

      // total spent so far on this receipt’s tag
      const currTotal = receipts
        .filter((r) => (r.tags[0] || "Uncategorized") === tag)
        .reduce((sum, r) => sum + r.amount, 0);

      // pick whichever has the larger running total
      return currTotal > prevTotal ? { tag, total: currTotal } : prev;
    },
    { tag: "", total: 0 }
  );

  return (
    <View style={{ backgroundColor: "#F9F9FB", flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Your Expenses Overview</Text>
        </View>
        <TimeFilterList
          selected={selectedRange}
          onSelect={handleFilterChange}
        />
        <ChartPicker data={receipts} />

        {highestReceipt.amount > 0 && (
          <View style={styles.expensiveCardContainer}>
            <Text style={styles.expensiveCardTitle}>
              Highest Single Receipt
            </Text>
            <Text style={styles.expensiveCardDate}>
              {dayjs(highestReceipt.date).format("MMMM D, YYYY")}
            </Text>
            <Text style={styles.expensiveCardAmount}>
              RON {highestReceipt.amount.toFixed(2)}
            </Text>
          </View>
        )}

        {mostVisited.count > 0 && (
          <View style={styles.visitedCardContainer}>
            <Text style={styles.visitedCardTitle}>Most Visited Store</Text>
            <Text style={styles.visitedCardSubtitle}>{mostVisited.store}</Text>
            <Text style={styles.visitedCardValue}>
              {mostVisited.count} visits
            </Text>
          </View>
        )}
      </View>

      {/* Overlay for custom date range */}
      {showCustomModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Custom Range</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Start Date (YYYY-MM-DD)"
              value={customStart}
              onChangeText={setCustomStart}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="End Date (YYYY-MM-DD)"
              value={customEnd}
              onChangeText={setCustomEnd}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: Colors.primary800 },
                ]}
                onPress={applyCustomRange}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: Colors.primary600 },
                ]}
                onPress={() => setShowCustomModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9FB",
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E1E1E",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginVertical: 6,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  expensiveCardContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  expensiveCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary600,
    marginBottom: 4,
  },
  expensiveCardDate: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  expensiveCardAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary800,
  },
  visitedCardContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  visitedCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary600,
    marginBottom: 4,
  },
  visitedCardSubtitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  visitedCardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary800,
  },
  spentCardContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  spentCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary600,
    marginBottom: 4,
  },
  spentCardSubtitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  spentCardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary800,
  },
});
