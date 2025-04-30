import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-gifted-charts";
import { Calendar } from "react-native-calendars";
import { Colors } from "../../constants/Colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_TYPES = ["Spending", "Stores", "Calendar"];
const THRESHOLDS = [0.2, 0.4, 0.6, 0.8, 1.0];
const COLORS = [
  "#FFF5F6",
  "#F9D7DB",
  "#F3B0B8",
  "#EE8A95",
  "#E96372",
  "#EF5A6F",
];

export default function ChartPicker({ data = [] }) {
  const [selectedType, setSelectedType] = useState("Spending");

  const totalsByDate = data.reduce((acc, { date, amount }) => {
    acc[date] = (acc[date] || 0) + amount;
    return acc;
  }, {});

  const maxSpend = Math.max(...Object.values(totalsByDate), 0);

  const markedDates = {};
  Object.entries(totalsByDate).forEach(([date, amt]) => {
    const pct = maxSpend > 0 ? amt / maxSpend : 0;

    const idx = THRESHOLDS.findIndex((t) => pct <= t);

    const color = COLORS[idx === -1 ? COLORS.length - 1 : idx];
    markedDates[date] = {
      customStyles: {
        container: { backgroundColor: color },
        text: { color: "#000" },
      },
    };
  });

  const lineData = data.map(({ date, amount }) => ({
    value: amount,
    label: date.slice(5),
  }));

  const countsByStore = data.reduce((acc, { store }) => {
    const key = store || "Unknown Store";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const barDataStores = Object.entries(countsByStore).map(
    ([storeName, count]) => ({
      value: count,
      label: storeName,
      frontColor: Colors.primary800,
    })
  );

  const renderChart = () => {
    switch (selectedType) {
      case "Spending":
        return (
          <LineChart
            data={lineData}
            width={SCREEN_WIDTH - 90}
            height={270}
            spacing={50}
            initialSpacing={20}
            hideRules={false}
            hideXAxisAndYAxis={false}
            componentWidth={8}
            curved
            noOfSections={7}
            adjustToWidth
            color={Colors.primary600}
            areaChart
            startFillColor={Colors.primary600}
            endFillColor={Colors.primary600}
            startOpacity={0.9}
            endOpacity={0.2}
          />
        );
      case "Stores":
        return (
          <BarChart
            data={barDataStores}
            width={SCREEN_WIDTH - 130}
            height={270}
            spacing={40}
            initialSpacing={20}
            barWidth={24}
            barBorderRadius={4}
            hideRules={false}
            xAxisTextStyle={{ fontSize: 10, rotation: 45 }}
            frontColor={Colors.primary800}
            noOfSections={7}
            adjustToWidth
          />
        );
      case "Calendar":
        return (
          <View style={styles.calendarWrapper}>
            <Calendar
              markingType="custom"
              markedDates={markedDates}
              theme={{
                todayTextColor: Colors.primary600,
                arrowColor: Colors.primary800,
              }}
            />
          </View>
        );

      default:
        return <Text style={styles.noDataText}>Select a chart type</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {CHART_TYPES.map((type) => {
          const isActive = type === selectedType;
          return (
            <Pressable
              key={type}
              onPress={() => setSelectedType(type)}
              style={[styles.button, isActive && styles.activeButton]}
            >
              <Text style={[styles.buttonText, isActive && styles.activeText]}>
                {" "}
                {type}{" "}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chartContainer}>{renderChart()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    paddingBottom: 8,
    height: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "center",
  },
  activeButton: {
    backgroundColor: Colors.primary800,
    transform: [{ scale: 1.05 }],
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
    marginTop: 0,
  },
  calendarWrapper: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 8,
  },
  noDataText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
});
