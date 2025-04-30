// components/StatsPage/CalendarHeatmap.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";

// Color buckets from light to dark for 5 quantiles
const THRESHOLDS = [0.0, 0.25, 0.5, 0.75, 1.0];
const COLORS     = [
  "#edf8e9",
  "#bae4b3",
  "#74c476",
  "#31a354",
  "#006d2c",
];

export default function CalendarHeat({ receipts }) {
  // 1) Aggregate spend by date
  const totals = receipts.reduce((acc, { date, amount }) => {
    acc[date] = (acc[date] || 0) + amount;
    return acc;
  }, {});

  // 2) Find max spend to normalize
  const maxSpend = Math.max(...Object.values(totals), 0);

  // 3) Build markedDates with customStyles
  const markedDates = {};
  Object.entries(totals).forEach(([date, amt]) => {
    const pct = maxSpend > 0 ? amt / maxSpend : 0;
    // find first threshold ≥ pct
    const idx = THRESHOLDS.findIndex((t) => pct <= t);
    const color = COLORS[idx === -1 ? COLORS.length - 1 : idx];
    markedDates[date] = {
      customStyles: {
        container: { backgroundColor: color },
        text:      { color: "#000" },
      },
    };
  });

  return (
    <View style={styles.wrapper}>
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        theme={{
          todayTextColor: "#dd4b39",
          arrowColor:     "#666",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden", // ensure rounded corners
  },
});
