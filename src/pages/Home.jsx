import React, { useState, useEffect } from 'react';
import { Navigation, Coffee, DoorOpen, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useSimulation } from '../context/SimulationContext';
import { motion, AnimatePresence } from 'framer-motion';

const GATE_COORDS = {
  'Gate 1': [-0.2760, 51.5568],
  'Gate 2': [-0.2812, 51.5568],
  'Gate 3': [-0.2812, 51.5552],
  'Gate 4': [-0.2760, 51.5552],
};

export default function Home() {
  const { userState, saveUser, theme } = useUser();
  const { gameState, dismissAlert } = useSimulation();
  const navigate = useNavigate();

  const [detectedGate, setDetectedGate] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const calculateDistance = (point, coords) => {
    const dx = (point.lng - coords[0]) * 111320;
    const dy = (point.lat - coords[1]) * 111320;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getNearbyGates = () => {
    if (!userLocation || !gatesList.length) return [];
    return gatesList.filter((gate) => {
      const coords = GATE_COORDS[gate.name];
      return coords ? calculateDistance(userLocation, coords) <= 200 : false;
    });
  };

  const mapCrowdLevelToValue = (level) => {
    if (level === 'high') return 85;
    if (level === 'medium') return 55;
    return 30;
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => {
      if (watcher) navigator.geolocation.clearWatch(watcher);
    };
  }, []);

  const { matchInfo, gates } = gameState?.venue || {
    matchInfo: { homeTeam: 'Loading', awayTeam: 'Loading', homeScore: 0, awayScore: 0, minute: 0 },
    gates: {},
  };

  const alerts = gameState?.alerts || [];
  const pageBg = theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-dark-900 text-slate-100';
  const cardBg = theme === 'light' ? 'bg-white/90 border-slate-200/40 text-slate-900' : 'bg-dark-900/80 border-white/10 text-white';
  const panelBg = theme === 'light' ? 'bg-white/90 border-slate-200/40 text-slate-900' : 'bg-dark-800/80 border-white/10 text-white';
  const textPrimary = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-slate-600' : 'text-slate-400';

  const gatesList = Object.entries(gates || {}).reduce((acc, [name, gate]) => {
    if (gate && typeof gate === 'object') {
      acc.push({ name, ...gate });
    }
    return acc;
  }, []);

  const nearbyGates = getNearbyGates();

  // Detect nearest gate from geolocation and save to user state
  useEffect(() => {
    if (userState?.gate || !gatesList.length || !userLocation) return;

    const nearestGate = gatesList.reduce((closest, gate) => {
      const coords = GATE_COORDS[gate.name];
      if (!coords) return closest;
      const distance = calculateDistance(userLocation, coords);
      if (!closest || distance < closest.distance) {
        return { name: gate.name, distance };
      }
      return closest;
    }, null);

    if (nearestGate?.name) {
      saveUser({ gate: nearestGate.name });
      setDetectedGate(nearestGate.name);
    }
  }, [gatesList, saveUser, userLocation, userState?.gate]);

  const gateLevels = gatesList.map((gate) => mapCrowdLevelToValue(gate?.crowdLevel));

  // Crowd percentage — uses nearby gates if location available, else falls back to all gates
  const crowdPercentage = (() => {
    if (nearbyGates.length > 0) {
      const nearbyLevels = nearbyGates.map((gate) => mapCrowdLevelToValue(gate?.crowdLevel));
      return Math.round(
        nearbyLevels.reduce((sum, value) => sum + value, 0) / nearbyLevels.length
      );
    }

    if (gateLevels.length) {
      return Math.round(gateLevels.reduce((sum, value) => sum + value, 0) / gateLevels.length);
    }

    return 0;
  })();

  const crowdLabel = crowdPercentage > 75 ? 'Busy' : crowdPercentage > 45 ? 'Moderate' : 'Light';
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (crowdPercentage / 100) * circumference;

  // Best (lowest crowd) gate
  const lowCrowdGate = gatesList.length
    ? gatesList.reduce((best, gate) => {
        const score = { low: 3, medium: 2, high: 1 };
        return score[gate?.crowdLevel || 'low'] > score[best?.crowdLevel || 'low'] ? gate : best;
      })
    : null;

  const smartSuggestionGate = userState?.gate || detectedGate || lowCrowdGate?.name || null;
  const smartSuggestionData = smartSuggestionGate
    ? gates?.[smartSuggestionGate] || { crowdLevel: 'low' }
    : null;
  const smartSuggestionText =
    smartSuggestionData?.crowdLevel === 'high'
      ? 'This gate is currently busy, but still your best available route.'
      : smartSuggestionData?.crowdLevel === 'medium'
        ? 'This gate has moderate waiting, and it is still the fastest entry for your seat.'
        : 'This gate has light flow and is the fastest entry for your seat.';

  const nearbyCrowdedGates = [...gatesList].sort((a, b) => {
    const score = { high: 3, medium: 2, low: 1 };
    return score[b.crowdLevel] - score[a.crowdLevel];
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className={`h-full flex flex-col p-4 md:p-8 lg:p-12 xl:max-w-[1600px] xl:mx-auto w-full relative z-10 ${pageBg}`}>

      {/* Alerts Overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`bg-primary-600/90 backdrop-blur-xl border border-primary-400/30 ${theme === 'light' ? 'text-slate-900' : 'text-white'} p-4 rounded-2xl shadow-[0_20px_40px_rgba(14,165,233,0.3)] flex gap-4 items-start cursor-pointer pointer-events-auto`}
              onClick={() => {
                dismissAlert(alert.id);
                if (alert.type === 'food_alert') navigate('/orders');
                if (alert.type === 'exit_alert') navigate('/exit');
              }}
            >
              <div className="mt-1 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Bell size={20} className="animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold tracking-tight">{alert.title}</h4>
                <p className="text-sm text-primary-100 leading-snug mt-1 font-medium">{alert.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]"
      >

        {/* Welcome Card (Hero) */}
        <motion.div
          variants={itemVariants}
          className={`md:col-span-2 lg:col-span-2 row-span-2 rounded-[2rem] p-8 flex flex-col relative overflow-hidden group ${cardBg}`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-primary-500/20 transition-all duration-700" />

          <div className="flex-1">
            <p className={`font-semibold tracking-widest uppercase text-xs mb-2 ${theme === 'light' ? 'text-primary-600' : 'text-primary-300'}`}>Welcome Back</p>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-2 ${textPrimary}`}>
              Seat{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-sky-300">
                {userState?.seat || 'Guest'}
              </span>
            </h1>
            <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} md:text-lg max-w-sm hidden md:block`}>
              Your personalized stadium experience is active. Enjoy the match.
            </p>
          </div>

          <div className="mt-auto pt-8">
            <div className={`p-4 md:p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden border ${theme === 'light' ? 'bg-white/90 border-slate-200/40 text-slate-900' : 'bg-primary-500/5 border-primary-500/30 text-white'}`}>
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 border border-primary-400/50">
                <Navigation size={24} className="text-primary-400 animate-pulse" />
              </div>
              <div>
                <h3 className={`text-sm md:text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Smart Suggestion Active</h3>
                {smartSuggestionGate ? (
                  <>
                    <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
                      Enter via <strong>{smartSuggestionGate}</strong> for the fastest route to your seat right now.
                    </p>
                    <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
                      {smartSuggestionText}
                    </p>
                  </>
                ) : (
                  <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
                    Waiting for live gate data to suggest the best entry point.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Nearby Crowded Places */}
        <motion.div
          variants={itemVariants}
          className={`rounded-[2rem] p-6 flex flex-col justify-between ${cardBg}`}
        >
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.3em] mb-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Nearby Crowded Places</p>
            {nearbyCrowdedGates.length ? (
              <div className="space-y-3">
                {nearbyCrowdedGates.slice(0, 3).map((gate) => (
                  <div
                    key={gate.name}
                    className={`rounded-3xl p-4 ${theme === 'light' ? 'bg-slate-100/80 border-slate-200/60' : 'bg-white/5 border-white/10'} flex items-center justify-between gap-4`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{gate.name}</p>
                      <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Current flow: {gate.crowdLevel}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                        gate.crowdLevel === 'high'
                          ? 'bg-rose-500/20 text-rose-300'
                          : gate.crowdLevel === 'medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {gate.crowdLevel.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Crowd data is loading from the stadium sensors.</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/map')}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-primary-500 to-sky-500 px-5 py-4 text-sm font-bold text-white hover:from-primary-600 hover:to-sky-600 transition-all"
          >
            View live crowd map
          </button>
        </motion.div>

        {/* Live Score Bento */}
        <motion.div
          variants={itemVariants}
          className={`md:col-span-2 lg:col-span-2 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden bento-hover cursor-pointer group ${cardBg}`}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-500 z-0" />
          <div className="relative z-10 flex justify-between items-center w-full">
            <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Live Match</p>
            <div className="flex items-center gap-2 bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {matchInfo.minute}' MIN
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-6">
            <div className="flex flex-col items-center">
              <span className={`text-5xl md:text-6xl lg:text-7xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{matchInfo.homeScore}</span>
              <span className={`text-sm md:text-base font-bold ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} mt-2`}>{matchInfo.homeTeam}</span>
            </div>
            <span className={`text-3xl font-light ${theme === 'light' ? 'text-slate-900/20' : 'text-white/20'}`}>-</span>
            <div className="flex flex-col items-center">
              <span className={`text-5xl md:text-6xl lg:text-7xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{matchInfo.awayScore}</span>
              <span className={`text-sm md:text-base font-bold ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} mt-2`}>{matchInfo.awayTeam}</span>
            </div>
          </div>
        </motion.div>

        {/* Crowd Density Bento */}
        <motion.div
          variants={itemVariants}
          className={`md:col-span-1 lg:col-span-1 h-full rounded-[2rem] p-6 flex flex-col items-center justify-center bento-hover ${cardBg}`}
        >
          <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 w-full text-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Crowd Index
          </h3>
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%" cy="50%" r={radius}
                stroke="currentColor" strokeWidth="12" fill="transparent"
                className={theme === 'light' ? 'text-slate-300/50' : 'text-white/5'}
              />
              <circle
                cx="50%" cy="50%" r={radius}
                stroke="currentColor" strokeWidth="12" fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-3xl md:text-4xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {crowdPercentage}<span className="text-xl">%</span>
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-full">
            <span className="text-sm font-bold">{crowdLabel}</span>
          </div>
        </motion.div>

        {/* Quick Action: Order */}
        <motion.div
          variants={itemVariants}
          onClick={() => navigate('/orders')}
          className="md:col-span-1 lg:col-span-1 h-full bg-orange-500/10 border border-orange-500/20 rounded-[2rem] p-6 flex flex-col relative overflow-hidden bento-hover cursor-pointer group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-auto relative z-10">
            <Coffee size={28} />
          </div>
          <div className="relative z-10 mt-8">
            <h4 className={`text-2xl font-bold leading-none ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Order Provisions</h4>
            <p className={`text-sm mt-2 font-medium ${theme === 'light' ? 'text-orange-600' : 'text-orange-200'}`}>Skip the line and order to seat.</p>
          </div>
        </motion.div>

        {/* Quick Action: Exit */}
        <motion.div
          variants={itemVariants}
          onClick={() => navigate('/exit')}
          className="md:col-span-2 lg:col-span-2 glass-card rounded-[2rem] p-6 lg:p-8 flex items-center justify-between bento-hover cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-500">
              <DoorOpen size={30} />
            </div>
            <div>
              <h4 className={`text-2xl lg:text-3xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Exit Navigator</h4>
              <p className={`font-medium text-sm lg:text-base mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Plan a seamless departure route.</p>
            </div>
          </div>
          <div className={`relative z-10 hidden md:flex h-12 px-6 rounded-full ${theme === 'light' ? 'bg-slate-900 text-white' : 'bg-white text-dark-900'} items-center justify-center font-bold xl:text-lg group-hover:bg-emerald-400 transition-colors`}>
            Evaluate
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
