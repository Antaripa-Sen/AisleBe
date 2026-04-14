import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useSimulation } from '../context/SimulationContext';
import { Navigation, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

const MAPTILER_KEY = "7FIIPceVDt9GG4LY3oxW";
maptilersdk.config.apiKey = MAPTILER_KEY;

const GATE_COORDS = {
  'Gate 1': [-0.2760, 51.5568],
  'Gate 2': [-0.2812, 51.5568],
  'Gate 3': [-0.2812, 51.5552],
  'Gate 4': [-0.2760, 51.5552],
};

const EXIT_COORD = [-0.2700, 51.5520];

export default function MapScreen() {
  const { userState, theme } = useUser();
  const { gameState } = useSimulation();
  const currentGate = userState?.gate || "Unknown";
  const [viewMode, setViewMode] = useState('arrival'); // arrival, heatmap
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const mapContainer = useRef(null);
  const map = useRef(null);
  const mapMarkers = useRef([]);

  const getGateColor = (level) => {
    if (level === 'high') return '#ef4444';
    if (level === 'medium') return '#f97316';
    return '#22c55e';
  };

  const getCrowdDensity = (level) => {
    if (level === 'high') return 1;
    if (level === 'medium') return 0.6;
    return 0.25;
  };

  const calculateDistance = (location, coords) => {
    const dx = (location.lng - coords[0]) * 111320;
    const dy = (location.lat - coords[1]) * 111320;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getNearbyGateNames = () => {
    const allGates = Object.keys(gameState.venue.gates || {});
    if (!userLocation) return allGates;
    return allGates.filter((gateName) => {
      const coords = GATE_COORDS[gateName];
      return coords ? calculateDistance(userLocation, coords) <= 200 : false;
    });
  };

  const buildHeatmapFeatures = (gateNames) =>
    gateNames.flatMap((gateName) => {
      const gate = gameState.venue.gates?.[gateName] || {};
      const gateCoords = GATE_COORDS[gateName] || [-0.2795, 51.5560];
      const count = gate.crowdLevel === 'high' ? 24 : gate.crowdLevel === 'medium' ? 14 : 8;
      const density = getCrowdDensity(gate.crowdLevel);
      return Array.from({ length: count }, (_, index) => ({
        type: 'Feature',
        properties: { density },
        geometry: {
          type: 'Point',
          coordinates: [
            gateCoords[0] + ((index % 4) - 1.5) * 0.00004,
            gateCoords[1] + (Math.floor(index / 4) - 1.5) * 0.00004
          ]
        }
      }));
    });

  const getRouteSource = () => {
    const gateCoords = GATE_COORDS[currentGate] || [-0.2795, 51.5560];
    return userLocation ? [[userLocation.lng, userLocation.lat], gateCoords] : [gateCoords, EXIT_COORD];
  };

  const getPopupHtml = (gateName, gate) => {
    const status = gate.status || 'Open';
    return `
      <div style="font-family: system-ui, sans-serif; color: #f8fafc; background: rgba(15,23,42,0.96); border-radius: 1rem; padding: 14px; min-width: 180px;">
        <div style="font-size: 1rem; font-weight: 800; margin-bottom: 6px;">${gateName}</div>
        <div style="font-size: 0.92rem; margin-bottom: 6px;">Crowd level: <strong>${gate.crowdLevel}</strong></div>
        <div style="font-size: 0.83rem; color: #cbd5e1;">Status: ${status}</div>
      </div>
    `;
  };

  const clearGateMarkers = () => {
    mapMarkers.current.forEach((marker) => marker.remove());
    mapMarkers.current = [];
  };

  const createGateMarkers = () => {
    clearGateMarkers();
    Object.entries(gameState.venue.gates || {}).forEach(([gateName, gate]) => {
      const coords = GATE_COORDS[gateName];
      if (!coords || !map.current) return;
      const marker = new maptilersdk.Marker({ color: getGateColor(gate.crowdLevel) })
        .setLngLat(coords)
        .setPopup(new maptilersdk.Popup({ offset: 25 }).setHTML(getPopupHtml(gateName, gate)))
        .addTo(map.current);
      mapMarkers.current.push(marker);
    });
  };

  const refreshRoute = () => {
    if (!map.current || !map.current.getSource('route')) return;
    map.current.getSource('route').setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: getRouteSource()
      }
    });
  };

  const refreshHeatmap = () => {
    if (!map.current || !map.current.getSource('heatmap-points')) return;
    const nearbyGateNames = getNearbyGateNames();
    const heatmapGates = nearbyGateNames.length ? nearbyGateNames : Object.keys(gameState.venue.gates || {});
    map.current.getSource('heatmap-points').setData({
      type: 'FeatureCollection',
      features: buildHeatmapFeatures(heatmapGates)
    });
  };

  const setViewVisibility = () => {
    if (!map.current) return;
    if (viewMode === 'arrival') {
      map.current.setLayoutProperty('route-layer', 'visibility', 'visible');
      map.current.setLayoutProperty('crowd-heatmap', 'visibility', 'none');
    } else {
      map.current.setLayoutProperty('route-layer', 'visibility', 'none');
      map.current.setLayoutProperty('crowd-heatmap', 'visibility', 'visible');
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        setLocationError(error.message || 'Unable to access location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => {
      if (watcher) navigator.geolocation.clearWatch(watcher);
    };
  }, []);

  useEffect(() => {
    if (map.current) return;
    if (!userLocation && !locationError) return;

    const gateCoords = GATE_COORDS[currentGate] || [-0.2795, 51.5560];
    const center = userLocation ? [userLocation.lng, userLocation.lat] : gateCoords;
    const routeSource = userLocation
      ? [center, gateCoords]
      : [gateCoords, EXIT_COORD];

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center,
      zoom: 16.5,
      pitch: 45,
    });

    map.current.on('style.load', () => {
      const initialRouteVisibility = viewMode === 'heatmap' ? 'none' : 'visible';
      const initialHeatmapVisibility = viewMode === 'heatmap' ? 'visible' : 'none';

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeSource
          }
        }
      });

      map.current.addLayer({
        id: 'route-layer',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': initialRouteVisibility
        },
        paint: {
          'line-color': userState?.accessibility ? '#3b82f6' : '#0ea5e9',
          'line-width': 8,
          'line-opacity': 0.8
        }
      });

      map.current.addSource('heatmap-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.current.addLayer({
        id: 'crowd-heatmap',
        type: 'heatmap',
        source: 'heatmap-points',
        layout: {
          'visibility': initialHeatmapVisibility
        },
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20, 16, 80],
          'heatmap-opacity': 0.8
        }
      });

      if (userLocation) {
        new maptilersdk.Marker({ color: '#38bdf8' })
          .setLngLat(center)
          .setPopup(new maptilersdk.Popup({ offset: 25 }).setText('Your current location'))
          .addTo(map.current);
      }

      createGateMarkers();
      refreshHeatmap();

      new maptilersdk.Marker({ color: '#f97316' })
        .setLngLat(gateCoords)
        .setPopup(new maptilersdk.Popup({ offset: 25 }).setText(`${currentGate} entry`))
        .addTo(map.current);
    });
  }, [userLocation, locationError, currentGate, userState?.accessibility]);

  // Handle live toggle switches and realtime updates
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    setViewVisibility();
    refreshRoute();
    refreshHeatmap();
    createGateMarkers();
  }, [viewMode, userLocation, gameState.venue.gates, currentGate]);

  const nearbyCrowdedGates = Object.entries(gameState.venue.gates || {})
    .map(([name, gate]) => ({ name, ...gate }))
    .sort((a, b) => {
      const score = { high: 3, medium: 2, low: 1 };
      return score[b.crowdLevel] - score[a.crowdLevel];
    });

  const pageBg = theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-dark-900 text-slate-100';
  const mapContainerClass = theme === 'light' ? 'w-full h-full absolute inset-0' : 'w-full h-full absolute inset-0 mix-blend-luminosity filter saturate-50';
  const overlayGradient = theme === 'light' ? 'bg-gradient-to-t from-slate-100 to-transparent' : 'bg-gradient-to-t from-dark-900 to-transparent';
  const panelBg = theme === 'light' ? 'bg-white/90 text-slate-900 border-slate-200/40' : 'bg-dark-800/80 text-white border-white/10';

  return (
    <div className={`h-full w-full flex flex-col relative overflow-hidden ${pageBg}`}>
      
      {/* Live Map Layer */}
      <div className="absolute inset-0 z-0">
         <div ref={mapContainer} className={mapContainerClass} />
         <div className={`absolute inset-x-0 bottom-0 top-2/3 ${overlayGradient} pointer-events-none`} />
      </div>

      {/* Floating Header */}
      <div className="absolute top-0 inset-x-0 pt-6 px-6 lg:pt-10 lg:px-12 z-20 pointer-events-none flex justify-between items-start">
        <div>
           <h1 className={`text-3xl md:text-5xl font-black drop-shadow-2xl ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Venue Tracker</h1>
           <p className={`font-bold tracking-widest mt-1 text-sm md:text-base drop-shadow-md ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>LIVE MAPTILER ENGINE</p>
        </div>
        
        {/* Toggle Switch */}
        <div className={`pointer-events-auto ${panelBg} backdrop-blur-2xl p-1.5 rounded-full border flex items-center shadow-2xl`}>
          <button 
             onClick={() => setViewMode('arrival')}
             className={`px-4 lg:px-6 py-2.5 rounded-full text-xs lg:text-sm font-bold transition-all ${viewMode === 'arrival' ? `${theme === 'light' ? 'bg-white text-slate-900 shadow-[0_5px_15px_rgba(15,23,42,0.18)]' : 'bg-slate-900 text-white shadow-[0_5px_15px_rgba(255,255,255,0.12)]'}` : `${theme === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}`}
          >
             Routing
          </button>
          <button 
             onClick={() => setViewMode('heatmap')}
             className={`px-4 lg:px-6 py-2.5 rounded-full text-xs lg:text-sm font-bold transition-all ${viewMode === 'heatmap' ? 'bg-primary-600 text-white shadow-[0_5px_15px_rgba(14,165,233,0.4)]' : `${theme === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}`}
          >
             Heatmap
          </button>
        </div>
      </div>

      {/* Floating Bottom Card */}
      <AnimatePresence>
        {viewMode === 'arrival' && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-24 lg:bottom-12 inset-x-4 max-w-xl mx-auto z-30 pointer-events-auto"
          >
            <div className={`backdrop-blur-2xl p-6 rounded-[2rem] border shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center justify-between ${panelBg}`}>
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border border-white/10 ${userState?.accessibility ? 'bg-blue-500/20 text-blue-400' : 'bg-primary-500/20 text-primary-400'}`}>
                  {userState?.accessibility ? <Layers size={24} /> : <Navigation size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                     <h3 className={`font-black text-lg lg:text-xl ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Target: {userState?.seat}</h3>
                     {userState?.accessibility && <span className={`bg-blue-500 ${theme === 'light' ? 'text-white' : 'text-white'} text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded`}>ADA Active</span>}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{currentGate} • Dynamic Route Active</p>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-[0.2em]">
                    {userLocation
                      ? `Live coordinates: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
                      : locationError || 'Requesting real device location...'}
                  </p>
                </div>
              </div>
              <div className={`hidden sm:block text-right border-l ${theme === 'light' ? 'border-slate-200/70' : 'border-white/10'} pl-6`}>
                 <div className={`text-2xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Live</div>
                 <p className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-emerald-400'}`}>MapTiler</p>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'heatmap' && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-24 lg:bottom-12 inset-x-4 max-w-xl mx-auto z-30 pointer-events-auto"
          >
            <div className={`backdrop-blur-2xl p-6 rounded-[2rem] border shadow-[0_30px_60px_rgba(0,0,0,0.6)] space-y-4 ${theme === 'light' ? 'bg-white/95 border-slate-200/50 text-slate-900' : 'bg-dark-800/95 border-white/10 text-white'}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Nearby crowded zones</p>
                  <h3 className={`text-xl lg:text-2xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Live crowd heatmap</h3>
                </div>
                <span className="inline-flex items-center rounded-full bg-rose-500/10 text-rose-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">Updated in real time</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {nearbyCrowdedGates.slice(0, 2).map((gate) => (
                  <div key={gate.name} className={`rounded-3xl border p-4 ${theme === 'light' ? 'border-slate-200/60 bg-slate-100/80' : 'border-white/10 bg-white/5'}`}>
                    <p className={`text-sm uppercase tracking-[0.2em] mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{gate.name}</p>
                    <div className="flex items-center justify-between gap-4">
                      <p className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{gate.crowdLevel}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${gate.crowdLevel === 'high' ? 'bg-rose-500/20 text-rose-200' : gate.crowdLevel === 'medium' ? 'bg-amber-500/20 text-amber-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
                        {gate.crowdLevel.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Realtime crowd reading from stadium sensors.</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-400">Tap the route toggle to compare your arrival route with the heatmap of busy gates. This reflects the current venue crowd state.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
