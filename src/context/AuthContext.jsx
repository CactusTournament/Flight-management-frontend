import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Load from localStorage if available
  const [auth, setAuthState] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : { user: null, password: null, role: null };
  });

  // Update localStorage when auth changes
  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify(auth));
  }, [auth]);

  // setAuth returns {success, error} for login feedback
  const setAuth = async (value) => {
    if (value && value.user && value.password) {
      try {
        const headers = {
          'Authorization': 'Basic ' + btoa(`${value.user}:${value.password}`),
          'Content-Type': 'application/json'
        };
        const res = await fetch('http://localhost:8080/me', { headers });
        if (res.ok) {
          const data = await res.json();
          const roles = Array.isArray(data.roles) ? data.roles.map(r => r.authority) : [];
          setAuthState({ ...value, role: roles.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER' });
          return { success: true };
        } else {
          setAuthState({ user: null, password: null, role: null });
          return { success: false, error: 'Invalid username or password' };
        }
      } catch {
        setAuthState({ user: null, password: null, role: null });
        return { success: false, error: 'Login failed. Please try again.' };
      }
    } else {
      setAuthState({ user: null, password: null, role: null });
      return { success: false, error: 'Please enter username and password' };
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
