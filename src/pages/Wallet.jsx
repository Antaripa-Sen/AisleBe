import React from 'react';
import { useUser } from '../context/UserContext';
import { useSimulation } from '../context/SimulationContext';
import { QrCode, Ticket, Star, History, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Wallet() {
  const { userState } = useUser();
  const { gameState } = useSimulation();

  return (
    <div className="h-full flex flex-col p-4 md:p-8 lg:p-12 xl:max-w-[1200px] xl:mx-auto w-full relative z-10">
      <div className="mb-8">
         <h1 className="text-3xl md:text-5xl font-black text-white">Digital Wallet</h1>
         <p className="text-slate-400 mt-2 text-sm md:text-base">Your loyalty points, tickets, and history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Ticket Pass */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="bg-gradient-to-br from-primary-600 to-indigo-800 rounded-3xl p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(14,165,233,0.3)]">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="flex justify-between items-start relative z-10">
                <div>
                   <p className="text-primary-200 text-sm tracking-widest uppercase font-bold">Event Ticket</p>
                   <h2 className="text-3xl font-black text-white mt-1">Championship Final</h2>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                   <Ticket className="text-white" />
                </div>
             </div>

             <div className="mt-12 grid grid-cols-2 gap-6 relative z-10 border-t border-dashed border-white/30 pt-6">
                <div>
                   <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider">Gate</p>
                   <p className="text-2xl font-bold text-white">{userState?.gate || '4'}</p>
                </div>
                <div>
                   <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider">Seat</p>
                   <p className="text-2xl font-bold text-white">{userState?.seat || 'B14'}</p>
                </div>
             </div>

             <div className="mt-8 bg-white p-4 rounded-2xl flex items-center justify-center relative z-10">
                <QrCode size={120} className="text-dark-900" />
             </div>
          </div>
        </motion.div>

        {/* Loyalty & History */}
        <div className="flex flex-col gap-6">
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 md:p-8 rounded-[2rem] flex items-center justify-between">
              <div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Venue Points</p>
                 <div className="flex items-center gap-3 mt-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={32} />
                    <span className="text-4xl lg:text-5xl font-black text-white">{userState?.loyaltyPoints || 120}</span>
                 </div>
              </div>
              <button className="bg-white text-dark-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
                 <Gift size={18} /> Redeem
              </button>
           </motion.div>

           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 md:p-8 rounded-[2rem] flex-1">
              <div className="flex items-center gap-2 mb-6">
                 <History className="text-primary-400" />
                 <h3 className="text-xl font-bold text-white">Past Events</h3>
              </div>

              <div className="space-y-4">
                 {[
                   { name: "City vs Rovers", date: "Oct 12, 2025", pts: "+85" },
                   { name: "Summer Concert", date: "Aug 04, 2025", pts: "+120" },
                   { name: "Derby Match", date: "Mar 22, 2025", pts: "+45" },
                 ].map((event, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div>
                          <h4 className="font-bold text-white">{event.name}</h4>
                          <p className="text-slate-400 text-sm mt-0.5">{event.date}</p>
                       </div>
                       <span className="text-emerald-400 font-bold">{event.pts} pts</span>
                    </div>
                 ))}
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
}
