import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "user-token";
const REFRESH_TOKEN_KEY = "refresh-token";
export const API_URL = "http://192.168.1.136:8000/api/user";
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    authenticated: null,
    user: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      console.log("token", token);

      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setAuthState({
          token: token,
          authenticated: true,
          user,
        });
      }
    };
    loadToken();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/me`);
      return res.data;
    } catch (e) {
      console.log("Failed to fetch user", e.response?.data || e.message);
      return null;
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await axios.post(`${API_URL}/create`, {
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
      return response;
    } catch (error) {
      const data = error?.response?.data;
      console.log("Backend error:", data);
      return {
        error: true,
        msg: data, // 👈 return the full object!
      };
    }
  };

  const login = async (email, password) => {
  try {
    const result = await axios.post(`${API_URL}/token`, { email, password });

    const token = result.data.access;
    const refreshToken = result.data.refresh;

    if (!token || !refreshToken) {
      return { error: true, msg: "No token received." };
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const user = await fetchUser()

    setAuthState({
      token,
      authenticated: true,
      user,
    });

    return result;
  } catch (e) {
    console.log("Login error:", e?.response?.data); // ✅ keep this!

    return {
      error: true,
      msg: e?.response?.data ?? "Login failed.", // ✅ use actual backend errors
    };
  }
};


  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

    axios.defaults.headers.common["Authorization"] = "";

    setAuthState({
      token: null,
      authenticated: false,
      user: null,
    });
  };

  const refreshAccesToken = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
      if(!refreshToken) throw new Error("No refresh Token found")

      const response = await axios.post(`${API_URL}/token/refresh`, {
        refresh: refreshToken
      });
      const newAccessToken = response.data.access

      await SecureStore.setItemAsync(TOKEN_KEY, newAccessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`

      setAuthState[{token: newAccessToken, authenticated: true}]

      return newAccessToken
    } catch(error) {
      logout();
      return null;
    }
  }

  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 && !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const newAccessToken = await refreshAccesToken();

        if(newAccessToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`
          return axios(originalRequest)
        }
      }
      return Promise.reject(error)
    }
  )

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState,
    setAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
