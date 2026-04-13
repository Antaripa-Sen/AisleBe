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
  const { userState } = useUser();
  const { gameState } = useSimulation();
  const currentGate = userState?.gate || "Gate 4";
  const [viewMode, setViewMode] = useState('arrival'); // arrival, heatmap
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        setLocationError(error.message || 'Unable to access location.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
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
          'line-cap': 'round'
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

      new maptilersdk.Marker({ color: '#f97316' })
        .setLngLat(gateCoords)
        .setPopup(new maptilersdk.Popup({ offset: 25 }).setText(`${currentGate} entry`))
        .addTo(map.current);
    });
  }, [userLocation, locationError, currentGate, userState?.accessibility]);

  // Handle live toggle switches for layers
  useEffect(() => {
     if (!map.current || !map.current.isStyleLoaded()) return;

     if (viewMode === 'arrival') {
        map.current.setLayoutProperty('route-layer', 'visibility', 'visible');
        map.current.setLayoutProperty('crowd-heatmap', 'visibility', 'none');
     } else {
        map.current.setLayoutProperty('route-layer', 'visibility', 'none');
        map.current.setLayoutProperty('crowd-heatmap', 'visibility', 'visible');
        
        const features = Object.entries(gameState.venue.gates).flatMap(([gateName, gate]) => {
          const gateCoords = GATE_COORDS[gateName] || [-0.2795, 51.5560];
          const count = gate.crowdLevel === 'high' ? 20 : gate.crowdLevel === 'medium' ? 12 : 6;
          return Array.from({ length: count }, (_, index) => ({
            type: 'Feature',
            properties: {
              density: gate.crowdLevel === 'high' ? 1 : gate.crowdLevel === 'medium' ? 0.6 : 0.25
            },
            geometry: {
              type: 'Point',
              coordinates: [
                gateCoords[0] + ((index % 3) - 1) * 0.00005,
                gateCoords[1] + (Math.floor(index / 3) - 1) * 0.00005
              ]
            }
          }));
        });

        map.current.getSource('heatmap-points').setData({ type: 'FeatureCollection', features });
     }
  }, [viewMode, gameState.venue.gates]);

  return (
    <div className="h-full w-full flex flex-col relative bg-dark-900 overflow-hidden">
      
      {/* Live Map Layer */}
      <div className="absolute inset-0 z-0">
         <div ref={mapContainer} className="w-full h-full absolute inset-0 mix-blend-luminosity filter saturate-50" />
         <div className="absolute inset-x-0 bottom-0 top-2/3 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none"></div>
      </div>

      {/* Floating Header */}
      <div className="absolute top-0 inset-x-0 pt-6 px-6 lg:pt-10 lg:px-12 z-20 pointer-events-none flex justify-between items-start">
        <div>
           <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-2xl">Venue Tracker</h1>
           <p className="text-slate-300 font-bold tracking-widest mt-1 text-sm md:text-base drop-shadow-md">LIVE MAPTILER ENGINE</p>
        </div>
        
        {/* Toggle Switch */}
        <div className="pointer-events-auto bg-dark-800/80 backdrop-blur-2xl p-1.5 rounded-full border border-white/10 flex items-center shadow-2xl">
          <button 
             onClick={() => setViewMode('arrival')}
             className={`px-4 lg:px-6 py-2.5 rounded-full text-xs lg:text-sm font-bold transition-all ${viewMode === 'arrival' ? 'bg-white text-dark-900 shadow-[0_5px_15px_rgba(255,255,255,0.2)]' : 'text-slate-400 hover:text-white'}`}
          >
             Routing
          </button>
          <button 
             onClick={() => setViewMode('heatmap')}
             className={`px-4 lg:px-6 py-2.5 rounded-full text-xs lg:text-sm font-bold transition-all ${viewMode === 'heatmap' ? 'bg-primary-600 text-white shadow-[0_5px_15px_rgba(14,165,233,0.4)]' : 'text-slate-400 hover:text-white'}`}
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
            <div className="bg-dark-800/90 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border border-white/10 ${userState?.accessibility ? 'bg-blue-500/20 text-blue-400' : 'bg-primary-500/20 text-primary-400'}`}>
                  {userState?.accessibility ? <Layers size={24} /> : <Navigation size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                     <h3 className="text-white font-black text-lg lg:text-xl">Target: {userState?.seat}</h3>
                     {userState?.accessibility && <span className="bg-blue-500 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded">ADA Active</span>}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{currentGate} • Dynamic Route Active</p>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-[0.2em]">
                    {userLocation
                      ? `Live coordinates: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
                      : locationError || 'Requesting real device location...'}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block text-right border-l border-white/10 pl-6">
                 <div className="text-2xl font-black text-white">Live</div>
                 <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mt-1">MapTiler</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
