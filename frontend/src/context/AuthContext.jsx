import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useApi } from "./ApiContext.jsx";

const AuthContext = createContext();
const STORAGE_KEY = "aurora-token";
const USER_KEY = "aurora-user"; // store minimal user info

export const AuthProvider = ({ children }) => {
  const { client, setToken, clearToken } = useApi();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem(USER_KEY)) || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [setToken]);

  const login = async (credentials) => {
    // ✅ Matches backend: POST /api/Auth/login
    const response = await client.post("/Auth/login", credentials);
    const { token, email, role } = response.data;

    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify({ email, role }));
    setToken(token);
    setUser({ email, role });

    return response.data;
  };

  const register = async (payload) => {
    // ✅ Matches backend: POST /api/Auth/register
    const response = await client.post("/Auth/register", payload);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
