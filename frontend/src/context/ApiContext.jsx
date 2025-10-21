import axios from "axios";
import { createContext, useContext, useMemo, useState } from "react";

const ApiContext = createContext();
const STORAGE_KEY = "aurora-token";

export const ApiProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEY) || null);

  // Create Axios instance with base URL
  const client = useMemo(() => {
    const instance = axios.create({
      baseURL: "http://localhost:5002/api",
    });

    // ✅ Automatically attach Authorization header if token exists
    instance.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem(STORAGE_KEY);
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    return instance;
  }, []);

  const clearToken = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  };

  return (
    <ApiContext.Provider value={{ client, setToken, clearToken }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
