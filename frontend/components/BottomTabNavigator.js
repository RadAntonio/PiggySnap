import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import StatsScreen from "../screens/StatsScreen";
import CameraScreen from "../screens/CameraScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { Colors } from "../constants/Colors";

const BottomTab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Stats") iconName = "stats-chart";
          else if (route.name === "Camera") iconName = "camera";
          else if (route.name === "Profile") iconName = "person-circle-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary600,
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <BottomTab.Screen name="Home" component={HomeScreen} />
      <BottomTab.Screen name="Stats" component={StatsScreen} />
      <BottomTab.Screen name="Camera" component={CameraScreen} />
      <BottomTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerTitleStyle: {
            fontSize: 24,
            color: Colors.primary800,
            fontWeight: "bold",
          },
        }}
      />
    </BottomTab.Navigator>
  );
}
