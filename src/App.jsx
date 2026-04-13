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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-8 flex-col text-center">
          <h1 className="text-rose-500 text-3xl font-black mb-4">Something went wrong</h1>
          <p className="text-slate-400 max-w-md mb-4">An error occurred while rendering the app. Please refresh if you see this page again.</p>
          <div className="text-left bg-slate-800 p-4 rounded max-w-md w-full">
            <p className="text-sm text-slate-300 font-semibold mb-2">Error message</p>
            <pre className="text-red-400 text-sm whitespace-pre-wrap break-words">{this.state.error?.toString()}</pre>
            <p className="text-sm text-slate-400 font-semibold mt-4 mb-2">Stack trace</p>
            <pre className="text-slate-300 text-xs whitespace-pre-wrap break-words max-h-64 overflow-auto">{this.state.error?.stack}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-primary-500 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <UserProvider>
        <SimulationProvider>
          <AppContent />
        </SimulationProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;
