import { createContext, useContext, useState } from "react";
import { login as loginApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [email, setEmail] = useState(() => localStorage.getItem("adminEmail"));

  const login = async (emailInput, password) => {
    const result = await loginApi(emailInput, password);
    localStorage.setItem("adminToken", result.token);
    localStorage.setItem("adminEmail", result.email);
    setToken(result.token);
    setEmail(result.email);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
