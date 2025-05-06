// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "user-token";
const REFRESH_TOKEN_KEY = "refresh-token";
export const API_URL = "http://192.168.1.130:8000/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    authenticated: false,
    user: null,
  });

  // 1) on mount, load any stored token & fetch user
  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const user = await fetchUser();
        setAuthState({ token, authenticated: true, user });
      }
    })();
  }, []);

  // helper to GET /user/me
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/me`);
      return res.data;
    } catch (e) {
      console.warn("fetchUser failed", e.response?.data || e.message);
      return null;
    }
  };

  // REGISTER (unchanged)
  const register = async (name, email, password, confirmPassword) => {
    try {
      return await axios.post(`${API_URL}/user/create`, {
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
    } catch (e) {
      return { error: true, msg: e.response?.data };
    }
  };

  // 1️⃣ STEP 1: login credentials
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/user/token`, { email, password });

      // if your DRF view returned require2fa + pre_token:
      if (res.data.require2fa) {
        return {
          twoFactorRequired: true,
          preToken: res.data.pre_token,
        };
      }

      // otherwise we got immediate access/refresh
      const { access, refresh } = res.data;
      await SecureStore.setItemAsync(TOKEN_KEY, access);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      const user = await fetchUser();
      setAuthState({ token: access, authenticated: true, user });
      return { error: false };
    } catch (e) {
      console.warn("login error:", e.response?.data || e.message);
      return { error: true, msg: e.response?.data || "Login failed." };
    }
  };

  // 2️⃣ STEP 2: verify 2FA
  const verify2fa = async (preToken, code) => {
    try {
      const res = await axios.post(`${API_URL}/user/token/verify-2fa`, {
        pre_token: preToken,
        token: code,         // must be named `token` in the payload
      });

      const { access, refresh } = res.data;
      await SecureStore.setItemAsync(TOKEN_KEY, access);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      const user = await fetchUser();
      setAuthState({ token: access, authenticated: true, user });
      return { error: false };
    } catch (e) {
      console.warn("2fa verify error:", e.response?.data || e.message);
      return { error: true, msg: e.response?.data || "2FA verification failed." };
    }
  };

  // LOGOUT (unchanged)
  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
    setAuthState({ token: null, authenticated: false, user: null });
  };

  // OPTIONAL: refresh‐token interceptor
  axios.interceptors.response.use(
    (r) => r,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refresh) return logout() && Promise.reject(error);

        try {
          const { data } = await axios.post(`${API_URL}/user/token/refresh`, {
            refresh,
          });
          await SecureStore.setItemAsync(TOKEN_KEY, data.access);
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
          return axios(originalRequest);
        } catch {
          await logout();
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );

  const enable2fa = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/user/2fa/enable`);
      return { error: false, data };
    } catch (e) {
      console.warn("enable2fa error:", e.response?.data || e.message);
      return { error: true, msg: e.response?.data || e.message };
    }
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onVerify2fa: verify2fa,
    onLogout: logout,
    onEnable2fa: enable2fa,
    authState,
    setAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
