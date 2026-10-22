import { useState, useEffect } from "react";
import { loginUser, registerUser, logoutUser } from "../api/auth";
import { AuthContext } from "./authContextInstance";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const persistSession = (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      persistSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      persistSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googlePayload) => {
    setLoading(true);
    try {
      const { googleLoginUser } = await import("../api/auth");
      const data = await googleLoginUser(googlePayload);
      persistSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore network errors on logout, still clear local session
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
