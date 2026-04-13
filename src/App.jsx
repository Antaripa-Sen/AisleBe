import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { SimulationProvider } from './context/SimulationContext';
import AppLayout from './layouts/AppLayout';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import MapView from './pages/MapScreen';
import Assistant from './pages/Assistant';
import Orders from './pages/Orders';
import Exit from './pages/Exit';
import Wallet from './pages/Wallet';

function App() {
  return (
    <UserProvider>
      <SimulationProvider>
        <BrowserRouter>
          <div className="h-[100dvh] w-[100vw] bg-dark-900 overflow-hidden flex relative font-sans text-slate-100 selection:bg-primary-500/30">
            <Routes>
              <Route path="/" element={<Navigate to="/onboarding" replace />} />
              <Route path="/onboarding" element={<Onboarding />} />
              
              <Route element={<AppLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/exit" element={<Exit />} />
                <Route path="/wallet" element={<Wallet />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </SimulationProvider>
    </UserProvider>
  );
}

export default App;
