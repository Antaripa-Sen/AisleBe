import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { SimulationProvider } from './context/SimulationContext';
import AppLayout from './layouts/AppLayout';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Home from './pages/Home';
import MapView from './pages/MapScreen';
import Assistant from './pages/Assistant';
import Orders from './pages/Orders';
import Exit from './pages/Exit';
import Wallet from './pages/Wallet';

function AppContent() {
  const { theme, isAuthenticated } = useUser();

  return (
    <BrowserRouter>
      <div className={`h-[100dvh] w-[100vw] overflow-hidden flex relative font-sans selection:bg-primary-500/30 ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-dark-900 text-slate-100'}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
          <Route path="/onboarding" element={isAuthenticated ? <Navigate to="/home" replace /> : <Onboarding />} />

          <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/exit" element={<Exit />} />
            <Route path="/wallet" element={<Wallet />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <UserProvider>
      <SimulationProvider>
        <AppContent />
      </SimulationProvider>
    </UserProvider>
  );
}

export default App;
