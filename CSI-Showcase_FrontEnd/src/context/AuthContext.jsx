import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthCookie, removeAuthCookie } from "../lib/cookie"; // Import authentication functions

// Create an authentication context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Use `null` for loading state

  useEffect(() => {
    // Check if auth token exists in cookies
    const authToken = getAuthCookie();
    setIsAuthenticated(!!authToken);
  }, []);

  // Logout function
  const logout = () => {
    removeAuthCookie(); // Remove authentication cookie
    setIsAuthenticated(false); // Update state to reflect logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access authentication context
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
