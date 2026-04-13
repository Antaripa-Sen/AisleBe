import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userState, setUserState] = useState(() => {
    const savedInfo = localStorage.getItem('aislebe_user');
    return savedInfo ? JSON.parse(savedInfo) : null;
  });

  const saveUser = (data) => {
    const newUserData = { ...userState, ...data };
    setUserState(newUserData);
    localStorage.setItem('aislebe_user', JSON.stringify(newUserData));
  };

  const clearUser = () => {
    setUserState(null);
    localStorage.removeItem('aislebe_user');
  };

  return (
    <UserContext.Provider value={{ userState, saveUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};
