import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userState, setUserState] = useState(() => {
    const savedInfo = localStorage.getItem('aislebe_user');
    return savedInfo ? JSON.parse(savedInfo) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('aislebe_user');
  });

  const login = async (email, password) => {
    // Simulate login - in real app, call Firebase auth
    const userData = {
      email,
      name: email.split('@')[0],
      isLoggedIn: true,
      loginTime: new Date().toISOString()
    };
    setUserState(userData);
    setIsAuthenticated(true);
    localStorage.setItem('aislebe_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUserState(null);
    setIsAuthenticated(false);
    localStorage.removeItem('aislebe_user');
  };

  const saveUser = (data) => {
    const newUserData = { ...userState, ...data };
    setUserState(newUserData);
    localStorage.setItem('aislebe_user', JSON.stringify(newUserData));
  };

  const clearUser = () => {
    logout();
  };

  return (
    <UserContext.Provider value={{ userState, isAuthenticated, login, logout, saveUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};
