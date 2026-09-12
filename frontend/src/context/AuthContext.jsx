import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, clearToken } from "../api/client";
import { getDeviceFingerprint } from "../utils/deviceFingerprint";

const AuthContext = createContext(null);

// Fire-and-forget: device recording is a background fraud-signal, never a
// user-facing feature, so failures here should never surface as an error.
function recordDeviceSilently() {
  getDeviceFingerprint()
    .then((fp) => api.registerDevice(fp))
    .catch(() => {});
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("aksmp_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    recordDeviceSilently();
    return data.user;
  }

  async function register(payload) {
    const data = await api.register(payload);
    setToken(data.token);
    setUser(data.user);
    recordDeviceSilently();
    return data.user;
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}