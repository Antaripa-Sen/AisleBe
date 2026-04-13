import React, { createContext, useState, useContext, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [gameState, setGameState] = useState({
    venue: {
      matchInfo: { homeTeam: "Loading", awayTeam: "Loading", homeScore: 0, awayScore: 0, minute: 0 },
      gates: {},
      concessions: {},
      restrooms: {}
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
      // Don't set dbError to true, just log and continue with default data
    });

    return () => unsubscribe();
  }, []);

  const dismissAlert = (id) => {
    setGameState(prev => ({
       ...prev,
       alerts: prev.alerts.filter(a => a.id !== id)
    }));
  };

  return (
    <SimulationContext.Provider value={{ gameState, dismissAlert }}>
      {children}
    </SimulationContext.Provider>
  );
}

export const useSimulation = () => useContext(SimulationContext);
