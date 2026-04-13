import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useSimulation } from '../context/SimulationContext';
import { MapPin, Utensils, Train, Accessibility, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveUser, isAuthenticated } = useUser();
  const { gameState } = useSimulation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    seat: '',
    foodPref: 'snacks',
    transport: 'metro',
    accessibility: false,
    loyaltyPoints: 120,
    orders: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSeat = formData.seat.trim() || 'GUEST';
    
    // Get available gates from real-time data
    const availableGates = Object.keys(gameState?.venue?.gates || {});
    const assignedGate = availableGates.length > 0 ? availableGates[Math.floor(Math.random() * availableGates.length)] : 'Gate 4';
    
    saveUser({ ...formData, seat: finalSeat, gate: assignedGate });
    navigate('/home');
  };

  const OptionCard = ({ icon: Icon, label, selected, onClick }) => (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer py-4 px-2 lg:p-6 rounded-3xl border transition-all duration-500 overflow-hidden group flex flex-col items-center gap-3 ${
        selected 
        ? 'border-primary-500 bg-primary-500/10 text-primary-400 shadow-[0_10px_30px_rgba(14,165,233,0.3)] scale-[1.02]' 
        : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selected ? 'bg-primary-500 text-white' : 'bg-dark-800 text-slate-400 group-hover:bg-white/10 group-hover:text-white'}`}>
        <Icon size={24} />
      </div>
      <span className="text-sm lg:text-base font-bold whitespace-nowrap">{label}</span>
      {selected && (
        <motion.div layoutId="outline" className="absolute inset-0 border-2 border-primary-500 rounded-3xl z-10" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-dark-900 selection:bg-primary-500/30">
      
      {/* Background Graphic Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-sky-900/40 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-5xl px-6 py-12 lg:px-12 z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
      >
        
        {/* Left Intro Panel */}
        <div className="flex flex-col text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 w-fit mx-auto lg:mx-0 tracking-widest uppercase mb-6 shadow-sm backdrop-blur-md">
            <ShieldCheck size={16} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
            Secure Encrypted Entry
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
            AisleBe <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-sky-300 to-primary-600 drop-shadow-sm text-3xl lg:text-5xl">Your Hub</span>
          </h1>
          
          <p className="text-slate-400 text-lg lg:text-xl font-light leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8 lg:mb-12">
            AisleBe orchestrates your stadium experience invisibly. Zero queues, intelligent routing, and frictionless food delivery.
          </p>

          <div className="hidden lg:flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 max-w-md w-full backdrop-blur-md">
             <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-primary-600 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                <Ticket className="text-white" size={28} />
             </div>
             <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Upcoming Event</p>
                <h3 className="text-white font-bold text-lg mt-0.5">
                  {gameState?.venue?.matchInfo?.homeTeam && gameState?.venue?.matchInfo?.awayTeam
                    ? `${gameState.venue.matchInfo.homeTeam} vs ${gameState.venue.matchInfo.awayTeam}`
                    : 'Live match unavailable'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">{gameState?.venue?.matchInfo?.minute ? `Live now — ${gameState.venue.matchInfo.minute} min` : 'Fetching current game details...'}</p>
             </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="bg-dark-800/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 lg:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wide">
                <MapPin size={18} className="text-primary-400" /> 
                Stadium Seat ID
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="e.g. B14 (Optional)"
                  value={formData.seat}
                  onChange={(e) => setFormData({ ...formData, seat: e.target.value.toUpperCase() })}
                  className="w-full bg-dark-900 border border-white/10 rounded-2xl px-6 py-5 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all uppercase tracking-widest shadow-inner group-hover:border-white/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wide">
                <Utensils size={18} className="text-orange-400" /> 
                Gastronomy Profile
              </label>
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <OptionCard icon={Utensils} label="Veg" selected={formData.foodPref === 'veg'} onClick={() => setFormData({...formData, foodPref: 'veg'})} />
                <OptionCard icon={Utensils} label="Non-Veg" selected={formData.foodPref === 'non-veg'} onClick={() => setFormData({...formData, foodPref: 'non-veg'})} />
                <OptionCard icon={Utensils} label="Snacks" selected={formData.foodPref === 'snacks'} onClick={() => setFormData({...formData, foodPref: 'snacks'})} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wide">
                <Train size={18} className="text-violet-400" /> 
                Arrival Vector
              </label>
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <OptionCard icon={Train} label="Metro" selected={formData.transport === 'metro'} onClick={() => setFormData({...formData, transport: 'metro'})} />
                <OptionCard icon={Train} label="Drive" selected={formData.transport === 'car'} onClick={() => setFormData({...formData, transport: 'car'})} />
                <OptionCard icon={Train} label="Ride" selected={formData.transport === 'rideshare'} onClick={() => setFormData({...formData, transport: 'rideshare'})} />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-dark-900 flex items-center justify-between group hover:border-white/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${formData.accessibility ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-dark-800 text-slate-500 group-hover:text-slate-400'}`}>
                  <Accessibility size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-200">ADA Route Priority</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">Elevators and ramp access mapping</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, accessibility: !formData.accessibility})}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${formData.accessibility ? 'bg-primary-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${formData.accessibility ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-200 text-dark-900 font-black text-lg py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:-translate-y-1"
              >
                Launch Experience
                <ArrowRight size={24} strokeWidth={3} />
              </button>
            </div>
            
          </form>
        </div>
      </motion.div>
    </div>
  );
}
