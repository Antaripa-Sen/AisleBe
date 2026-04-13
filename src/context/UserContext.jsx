import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();
const USER_KEY = 'aislebe_user';
const ACCOUNTS_KEY = 'aislebe_accounts';
const THEME_KEY = 'aislebe_theme';

export const useUser = () => useContext(UserContext);

const loadAccounts = () => {
  const saved = localStorage.getItem(ACCOUNTS_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn('Unable to parse saved accounts, resetting storage.', error);
    localStorage.removeItem(ACCOUNTS_KEY);
    return [];
  }
};

const loadUserState = () => {
  const savedInfo = localStorage.getItem(USER_KEY);
  if (!savedInfo) return null;
  try {
    return JSON.parse(savedInfo);
  } catch (error) {
    console.warn('Unable to parse saved user state, resetting storage.', error);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

const saveAccounts = (accounts) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const UserProvider = ({ children }) => {
  const [userState, setUserState] = useState(() => loadUserState());

  const [accounts, setAccounts] = useState(() => loadAccounts());
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem(USER_KEY);
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const persistUser = (userData) => {
    setUserState(userData);
    setIsAuthenticated(true);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const register = async (email, password, name) => {
    const existing = accounts.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with that email already exists. Please log in or use a different email.');
    }

    const newAccount = {
      email: email.toLowerCase(),
      password,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
      loyaltyPoints: 120,
      matchesAttended: 0,
      ridesBooked: 0,
      theme
    };

    const nextAccounts = [...accounts, newAccount];
    setAccounts(nextAccounts);
    saveAccounts(nextAccounts);
    persistUser({
      ...newAccount,
      isLoggedIn: true,
      loginTime: new Date().toISOString()
    });
    return newAccount;
  };

  const login = async (email, password) => {
    const account = accounts.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      throw new Error('No account found. Please register first or continue as guest.');
    }
    if (account.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }

    const userData = {
      ...account,
      isLoggedIn: true,
      loginTime: new Date().toISOString(),
      theme
    };
    persistUser(userData);
  };

  const guestLogin = async () => {
    const guestUser = {
      email: 'guest@aislebe.local',
      name: 'Guest User',
      isGuest: true,
      isLoggedIn: true,
      loginTime: new Date().toISOString(),
      loyaltyPoints: 0,
      matchesAttended: 0,
      ridesBooked: 0,
      theme
    };
    persistUser(guestUser);
  };

  const logout = () => {
    setUserState(null);
    setIsAuthenticated(false);
    localStorage.removeItem(USER_KEY);
  };

  const saveUser = (data) => {
    const oldEmail = userState?.email?.toLowerCase();
    const newUserData = { ...userState, ...data };
    setUserState(newUserData);
    localStorage.setItem(USER_KEY, JSON.stringify(newUserData));

    if (oldEmail) {
      const nextAccounts = accounts.map((account) => {
        if (account.email.toLowerCase() === oldEmail) {
          return { ...account, ...data, email: newUserData.email.toLowerCase() };
        }
        return account;
      });
      setAccounts(nextAccounts);
      saveAccounts(nextAccounts);
    }
  };

  const deleteAccount = async (email) => {
    if (!email) {
      throw new Error('Unable to delete account without a valid email.');
    }

    const normalizedEmail = email.toLowerCase();
    const nextAccounts = accounts.filter((item) => item.email.toLowerCase() !== normalizedEmail);

    if (nextAccounts.length === accounts.length) {
      throw new Error('Account not found.');
    }

    setAccounts(nextAccounts);
    saveAccounts(nextAccounts);

    if (userState?.email?.toLowerCase() === normalizedEmail) {
      logout();
    }
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const clearUser = () => {
    logout();
  };

  return (
    <UserContext.Provider value={{
      userState,
      accounts,
      theme,
      isAuthenticated,
      register,
      login,
      guestLogin,
      logout,
      deleteAccount,
      saveUser,
      clearUser,
      toggleTheme,
      setTheme
    }}>
      {children}
    </UserContext.Provider>
  );
};
