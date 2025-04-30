// components/HomePage/TimeFilterList.js
import React, { useState } from "react";
import { View, FlatList, Pressable, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

const RANGES = ["This Week", "This Month", "Custom Range"];

export default function TimeRamgeList({ onSelect }) {
  const [selected, setSelected] = useState("This Week");

  return (
    <FlatList
      horizontal
      data={RANGES}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
      bounces={false}
      renderItem={({ item }) => {
        const isActive = item === selected;
        return (
          <Pressable
            onPress={() => {
              setSelected(item);
              onSelect?.(item);
            }}
            style={[
              styles.button,
              isActive && styles.activeButton,
            ]}
          >
            <Text
              style={[
                styles.text,
                isActive && styles.activeText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EDEDED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: Colors.primary600,
    transform: [{ scale: 1.08 }],
  },
  text: {
    color: "#333",
    fontWeight: "500",
    fontSize: 14,
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  },
});
