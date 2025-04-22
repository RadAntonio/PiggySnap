import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFonts } from "expo-font";
import { Colors } from "../constants/Colors";
import Title from "../components/HomePage/Title";

export default function ManualInputScreen({}) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Manual Input Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
