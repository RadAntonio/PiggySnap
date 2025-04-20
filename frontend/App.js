import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";

import GetStartedScreen from "./screens/GetStartedScreen";
import SignupScreen from "./screens/SignupScreen";
import { AuthProvider, useAuth } from "./context/AuthContext";
import WelcomeScreen from "./screens/WelcomeScreen";
import LoadingScreen from "./components/LoadingScree";
import BottomTabNavigator from "./components/BottomTabNavigator";
import FilterScreen from "./screens/FilterScreen";
import ReceiptDetailsScreen from "./screens/ReceiptDetailsScreen";

const TOKEN_KEY = "user-token";
export const API_URL = "http://192.168.1.128:8000/api/user";

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <AuthProvider>
      <Layout></Layout>
    </AuthProvider>
  );
}

export const Layout = () => {
  const { authState, setAuthState } = useAuth();
  const [isAppReady, setIsAppReady] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/me`);
      return res.data;
    } catch (e) {
      console.log("fetchUser failed:");
      return null;
    }
  };

  useEffect(() => {
    const prepare = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        console.log("Loaded token:", token);

        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const user = await fetchUser();

          if (user) {
            setAuthState({
              token,
              authenticated: true,
              user,
            });
          } else {
            console.log("Invalid token or user fetch failed.");
            setAuthState({
              token: null,
              authenticated: false,
              user: null,
            });
            await SecureStore.deleteItemAsync(TOKEN_KEY);
          }
        } else {
          console.log("No token found");
          setAuthState({
            token: null,
            authenticated: false,
            user: null,
          });
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!isAppReady) return <LoadingScreen />;

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator>
          {authState?.authenticated ? (
            <>
              <Stack.Screen
                name="MainApp"
                component={BottomTabNavigator}
                options={{ headerShown: false }}
              />
              {/* Modal screens accessible from any tab */}
              <Stack.Screen
                name="FilterScreen"
                component={FilterScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="ReceiptDetailsScreen"
                component={ReceiptDetailsScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                  headerShown: false,
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="GetStartedScreen"
                component={GetStartedScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SignupScreen"
                component={SignupScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};
