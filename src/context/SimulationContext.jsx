import React, { createContext, useState, useContext, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [gameState, setGameState] = useState({
    venue: {
      matchInfo: { homeTeam: "Loading", awayTeam: "Loading", homeScore: 0, awayScore: 0, minute: 0 },
      gates: { "Gate 4": { crowdLevel: "low" } },
      concessions: { north_stand: { waitMins: 0, crowdLevel: "low", name: "North Stand Bites" } },
      restrooms: { r1: { waitMins: 0, crowdLevel: "low" } }
    },
    alerts: []
  });
  
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    if (!database) {
      console.warn("Realtime Database not initialized. UI is frozen until Firebase Config is valid.");
      setDbError(true);
      return;
    }

    const stateRef = ref(database, 'venueState');
    
    const unsubscribe = onValue(stateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(prevState => ({
          ...prevState,
          venue: data.venue || prevState.venue,
          alerts: data.alerts || []
        }));
      }
    }, (error) => {
      console.error("Firebase read failure:", error);
      setDbError(true);
    });

    return () => unsubscribe();
  }, []);

  const dismissAlert = (id) => {
    setGameState(prev => ({
       ...prev,
       alerts: prev.alerts.filter(a => a.id !== id)
    }));
  };

  if (dbError) {
     return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-8 flex-col text-center">
           <h1 className="text-rose-500 text-3xl font-black mb-4">API Configuration Missing</h1>
           <p className="text-slate-400 max-w-md">The strict real-time integration requires valid Firebase credentials. Please populate your <code className="bg-slate-800 px-2 py-1 rounded text-white text-sm">.env.local</code> file and restart the server.</p>
        </div>
     );
  }

  return (
    <SimulationContext.Provider value={{ gameState, dismissAlert }}>
      {children}
    </SimulationContext.Provider>
  );
}

export const useSimulation = () => useContext(SimulationContext);
