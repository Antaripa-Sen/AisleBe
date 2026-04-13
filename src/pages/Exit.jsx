import React, { useState, useEffect, useRef } from 'react';
import { Navigation2, MapPin, Car } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSimulation } from '../context/SimulationContext';
import { motion, AnimatePresence } from 'framer-motion';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

const MAPTILER_KEY = "7FIIPceVDt9GG4LY3oxW";
maptilersdk.config.apiKey = MAPTILER_KEY;

export default function Exit() {
  const { userState } = useUser();
  const { gameState } = useSimulation();
  
  const currentGate = userState?.gate || "Gate 4";
  const crowdLevel = gameState.venue.gates[currentGate]?.crowdLevel || 'high';
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const [selectedPlan, setSelectedPlan] = useState(0);
  const mapContainer = useRef(null);
  const map = useRef(null);

  const plans = [
     { id: 0, title: "Immediate Extraction", wait: "0 mins", eta: "14 mins", crowd: crowdLevel, carEta: "9 mins", routeColor: '#0ea5e9' },
     { id: 1, title: "Delayed Departure", wait: "8 mins", eta: "9 mins", crowd: "moderate", carEta: "5 mins", routeColor: '#facc15' },
     { id: 2, title: "Optimal Clearance", wait: "15 mins", eta: "6 mins", crowd: "low", carEta: "2 mins", routeColor: '#10b981' }
  ];

  const GATE_COORDS = {
    'Gate 1': [-0.2760, 51.5568],
    'Gate 2': [-0.2812, 51.5568],
    'Gate 3': [-0.2812, 51.5552],
    'Gate 4': [-0.2760, 51.5552],
  };

  const EXIT_COORD = [-0.2700, 51.5520];

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation unsupported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => setLocationError(error.message || 'Unable to access location.'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  useEffect(() => {
     const gateCoords = GATE_COORDS[currentGate] || [-0.2795, 51.5560];
     const origin = userLocation ? [userLocation.lng, userLocation.lat] : gateCoords;

     if (!map.current) {
       map.current = new maptilersdk.Map({
          container: mapContainer.current,
          style: maptilersdk.MapStyle.STREETS,
          center: origin,
          zoom: 15.5,
          interactive: true
       });

       map.current.on('style.load', () => {
           map.current.addSource('escape-route', {
              'type': 'geojson',
              'data': {
                 'type': 'Feature',
                 'geometry': {
                    'type': 'LineString',
                    'coordinates': [origin, EXIT_COORD]
                 }
              }
           });
           map.current.addLayer({
              'id': 'escape-layer',
              'type': 'line',
              'source': 'escape-route',
              'layout': { 'line-join': 'round', 'line-cap': 'round' },
              'paint': { 'line-color': plans[0].routeColor, 'line-width': 8, 'line-opacity': 0.8 }
           });

           if (userLocation) {
             new maptilersdk.Marker({ color: '#38bdf8' })
               .setLngLat(origin)
               .setPopup(new maptilersdk.Popup({ offset: 25 }).setText('Your current location'))
               .addTo(map.current);
           }

           new maptilersdk.Marker({ color: '#f97316' })
             .setLngLat(gateCoords)
             .setPopup(new maptilersdk.Popup({ offset: 25 }).setText(`${currentGate} entry`))
             .addTo(map.current);

           new maptilersdk.Marker({ color: '#22c55e' })
             .setLngLat(EXIT_COORD)
             .setPopup(new maptilersdk.Popup({ offset: 25 }).setText('Recommended exit'))
             .addTo(map.current);
       });
     } else if (userLocation && map.current.getSource('escape-route')) {
       map.current.getSource('escape-route').setData({
         type: 'Feature',
         geometry: {
           type: 'LineString',
           coordinates: [origin, EXIT_COORD]
         }
       });
     }
  }, [currentGate, userLocation]);

  // Update line color based on selected plan
  useEffect(() => {
     if (map.current && map.current.getLayer('escape-layer')) {
         map.current.setPaintProperty('escape-layer', 'line-color', plans[selectedPlan].routeColor);
     }
  }, [selectedPlan]);

  return (
    <div className="h-full flex flex-col hide-scrollbar relative bg-dark-900 lg:p-12">
      
      <div className="pt-10 pb-6 px-6 lg:px-0 z-10 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl md:text-5xl font-black text-white">Egress Strategy</h1>
        <p className="text-slate-400 text-sm md:text-base mt-2">Dynamic routing via {currentGate}</p>
      </div>

      <div className="flex-1 px-6 lg:px-0 pb-32 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-max">
        
        {/* Plans Column */}
        <div className="lg:col-span-1 space-y-4">
           {plans.map((plan) => (
             <motion.div 
               whileHover={{ scale: 1.02 }}
               key={plan.id}
               onClick={() => setSelectedPlan(plan.id)}
               className={`rounded-[2rem] p-6 lg:p-8 border transition-all cursor-pointer shadow-lg ${
                 selectedPlan === plan.id 
                   ? 'bg-primary-500/10 border-primary-500/50 shadow-[0_0_30px_rgba(14,165,233,0.15)]' 
                   : 'bg-white/5 border-white/5 hover:bg-white/10'
               }`}
             >
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className={`text-xl lg:text-2xl font-black ${selectedPlan === plan.id ? 'text-primary-400' : 'text-white'}`}>
                     {plan.title}
                   </h3>
                   <div className="flex items-center gap-3 mt-3 text-xs lg:text-sm font-bold">
                     <span className={`px-2 py-1 flex items-center justify-center rounded uppercase tracking-widest border ${
                       plan.crowd === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                       plan.crowd === 'moderate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                     }`}>
                       <span className={`w-2 h-2 rounded-full mr-1.5 ${
                          plan.crowd === 'high' ? 'bg-rose-500 animate-pulse' : 
                          plan.crowd === 'moderate' ? 'bg-yellow-500' : 'bg-emerald-500'
                       }`}></span>
                       {plan.crowd} Status
                     </span>
                   </div>
                 </div>
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${selectedPlan === plan.id ? 'border-primary-500 bg-primary-500' : 'border-slate-600'}`}>
                   {selectedPlan === plan.id && <div className="w-2 h-2 bg-white rounded-full" />}
                 </div>
               </div>
               
               <div className="flex items-center gap-6 mt-4">
                  <div>
                     <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Wait Time</p>
                     <p className="text-xl font-black text-white">{plan.wait}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Walk ETA</p>
                     <p className="text-xl font-black text-white">{plan.eta}</p>
                  </div>
               </div>
             </motion.div>
           ))}
        </div>

        {/* Map Preview & Action Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           <AnimatePresence mode="wait">
             <motion.div 
               key="map-container"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="flex-1 min-h-[300px] border border-white/10 rounded-[2.5rem] relative overflow-hidden bg-dark-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-end p-6 lg:p-8"
             >
                <div ref={mapContainer} className="absolute inset-0 mix-blend-luminosity filter saturate-50 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none"></div>
                
                <div className="relative text-white flex items-center gap-3 bg-dark-900/90 px-5 py-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                  <MapPin size={24} className="text-primary-400 animate-bounce" />
                  <div>
                     <p className="text-sm font-black">Route Confirmed</p>
                     <p className="text-xs text-slate-400 font-medium">Head towards {currentGate}</p>
                  </div>
                </div>
             </motion.div>
           </AnimatePresence>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                     <Car size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">{plans[selectedPlan].carEta} Arrival</h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Rideshare Target Zone</p>
                  </div>
                </div>
                <button className="bg-white text-dark-900 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors">Book</button>
              </div>

              <button className="w-full h-full bg-primary-600 hover:bg-primary-500 text-white font-black text-xl py-6 rounded-[2rem] shadow-[0_15px_40px_rgba(14,165,233,0.3)] flex items-center justify-center gap-3 transition-transform hover:-translate-y-1">
                <Navigation2 size={24} /> Execute Route
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
