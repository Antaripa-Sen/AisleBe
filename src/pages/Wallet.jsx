import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useSimulation } from '../context/SimulationContext';
import { QrCode, Ticket, Star, History, Gift, Car, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const RIDE_PROVIDERS = [
  { id: 'uber', name: 'Uber', url: 'https://m.uber.com', accent: 'from-slate-700 to-black', icon: '🚗' },
  { id: 'ola', name: 'Ola', url: 'https://www.olacabs.com', accent: 'from-emerald-500 to-teal-400', icon: '🛺' },
  { id: 'bolt', name: 'Bolt', url: 'https://bolt.eu', accent: 'from-sky-500 to-cyan-400', icon: '⚡' }
];

const RECENT_EVENTS = [
  { name: 'City vs Rovers', date: 'Oct 12, 2026', pts: '+85' },
  { name: 'Summer Concert', date: 'Aug 04, 2026', pts: '+120' },
  { name: 'Derby Match', date: 'Mar 22, 2026', pts: '+45' }
];

export default function Wallet() {
  const { userState } = useUser();
  const { gameState } = useSimulation();

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemedItems, setRedeemedItems] = useState([]);
  const [isDark, setIsDark] = useState(true);

  const nextMatchName = gameState?.venue?.matchInfo?.homeTeam && gameState?.venue?.matchInfo?.awayTeam
    ? `${gameState.venue.matchInfo.homeTeam} vs ${gameState.venue.matchInfo.awayTeam}`
    : 'Upcoming stadium event';
  const nextMatchTime = gameState?.venue?.matchInfo?.minute ? `Live — ${gameState.venue.matchInfo.minute} min` : 'Live status unavailable';

  const ticketData = `Ticket: ${nextMatchName} | Gate: ${userState?.gate || 'Gate 4'} | Seat: ${userState?.seat || 'A1'} | User: ${userState?.seat || 'GUEST'}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(ticketData)}`;

  const handleRedeem = (item) => {
    setRedeemedItems([...redeemedItems, item]);
    setShowRedeemModal(false);
    // Optionally update userState or save to Firebase
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 lg:p-12 xl:max-w-[1200px] xl:mx-auto w-full relative z-10">
      <div className="mb-8 flex justify-between items-center">
         <div>
           <h1 className="text-3xl md:text-5xl font-black text-white">Digital Wallet</h1>
           <p className="text-slate-400 mt-2 text-sm md:text-base">Live tickets, loyalty rewards, and ride bookings.</p>
         </div>
         <button 
           onClick={() => setIsDark(!isDark)}
           className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
         >
           {isDark ? <Sun className="text-yellow-400" size={24} /> : <Moon className="text-slate-400" size={24} />}
         </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.85fr] gap-8">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary-600 to-indigo-800 rounded-3xl p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(14,165,233,0.3)]"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="relative z-10 flex justify-between items-start">
                <div>
                   <p className="text-primary-200 text-sm tracking-widest uppercase font-bold">Current match</p>
                   <h2 className="text-3xl font-black text-white mt-1">{nextMatchName}</h2>
                   <p className="text-slate-300 text-sm mt-2">{nextMatchTime}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                   <Ticket className="text-white" />
                </div>
             </div>

             <div className="mt-12 grid grid-cols-2 gap-6 border-t border-dashed border-white/30 pt-6">
                <div>
                   <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider">Gate</p>
                   <p className="text-2xl font-bold text-white">{userState?.gate || 'Gate 4'}</p>
                </div>
                <div>
                   <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider">Seat</p>
                   <p className="text-2xl font-bold text-white">{userState?.seat || 'A1'}</p>
                </div>
             </div>

             <div className="mt-8 bg-white p-4 rounded-2xl flex items-center justify-center relative z-10">
                <img src={qrUrl} alt="Ticket QR Code" className="w-30 h-30" />
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-6 md:p-8 rounded-[2rem]"
          >
            <div className="flex items-center justify-between mb-6 gap-4">
               <div>
                 <p className="text-slate-400 uppercase tracking-[0.35em] font-bold text-xs">Ride booking</p>
                 <h3 className="text-2xl font-black text-white mt-3">Book an Uber or Ola</h3>
               </div>
               <Car className="text-primary-400" size={28} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {RIDE_PROVIDERS.map((provider) => (
                <a
                  key={provider.id}
                  href={provider.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`rounded-3xl p-5 bg-gradient-to-br ${provider.accent} text-white shadow-lg shadow-white/5 transition-all hover:-translate-y-1`}
                >
                  <div className="text-3xl mb-4">{provider.icon}</div>
                  <p className="font-bold text-lg">{provider.name}</p>
                  <p className="text-sm text-white/80 mt-2">Tap to open the provider and book a ride from your gate.</p>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 md:p-8 rounded-[2rem]"
          >
            <div className="flex items-center gap-3 mb-6">
               <History className="text-primary-400" />
               <h3 className="text-xl font-bold text-white">Recent activity</h3>
            </div>
            <div className="space-y-4">
               {RECENT_EVENTS.map((event, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                       <h4 className="font-bold text-white">{event.name}</h4>
                       <p className="text-slate-400 text-sm mt-0.5">{event.date}</p>
                    </div>
                    <span className="text-emerald-400 font-bold">{event.pts}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 md:p-8 rounded-[2rem] flex items-center justify-between"
           >
              <div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loyalty balance</p>
                 <div className="flex items-center gap-3 mt-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={32} />
                    <span className="text-4xl lg:text-5xl font-black text-white">{userState?.loyaltyPoints ?? 120}</span>
                 </div>
              </div>
              <button 
                onClick={() => setShowRedeemModal(true)} 
                disabled={redeemedItems.length > 0}
                className={`px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 ${redeemedItems.length > 0 ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-white text-dark-900 hover:bg-slate-200'}`}
              >
                 <Gift size={18} /> {redeemedItems.length > 0 ? 'Redeemed' : 'Redeem'}
              </button>
           </motion.div>

           {redeemedItems.length > 0 && (
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-card p-6 md:p-8 rounded-[2rem]"
             >
               <p className="text-slate-400 uppercase tracking-[0.35em] font-bold text-xs">Redeemed rewards</p>
               <div className="mt-4 space-y-3">
                 {redeemedItems.map((item, i) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                     <span className="text-white font-bold">{item.name}</span>
                     <span className="text-emerald-400">{item.points} pts</span>
                   </div>
                 ))}
               </div>
             </motion.div>
           )}

           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.05 }}
             className="glass-card p-6 md:p-8 rounded-[2rem]"
           >
              <p className="text-slate-400 uppercase tracking-[0.35em] font-bold text-xs">Ticket summary</p>
              <h3 className="text-2xl font-black text-white mt-4">{nextMatchName}</h3>
              <p className="text-slate-400 mt-3">Gate {userState?.gate || '4'} • Seat {userState?.seat || 'A1'}</p>
              <div className="mt-8 bg-white/5 p-5 rounded-3xl border border-white/10">
                 <div className="flex items-center justify-between gap-4">
                   <span className="text-xs uppercase tracking-[0.35em] text-slate-400 font-bold">Ticket status</span>
                   <span className="text-emerald-400 font-bold">Active</span>
                 </div>
                 <div className="mt-4 flex items-center gap-4 text-slate-300 text-sm">
                   <QrCode size={28} />
                   <span>Scan at the gate on arrival.</span>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>

      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 p-8 rounded-3xl border border-white/10 max-w-md w-full mx-4">
            <h3 className="text-2xl font-black text-white mb-4">Redeem Loyalty Points</h3>
            <p className="text-slate-400 mb-6">Exchange your {userState?.loyaltyPoints ?? 120} points for rewards:</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10" onClick={() => handleRedeem({ name: 'Free Snack', points: 50 })}>
                <span className="text-white">Free Snack</span>
                <span className="text-primary-400">50 pts</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10" onClick={() => handleRedeem({ name: 'VIP Access', points: 100 })}>
                <span className="text-white">VIP Access</span>
                <span className="text-primary-400">100 pts</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10" onClick={() => handleRedeem({ name: 'Merchandise Discount', points: 75 })}>
                <span className="text-white">Merchandise Discount</span>
                <span className="text-primary-400">75 pts</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRedeemModal(false)} className="flex-1 bg-slate-600 text-white py-3 rounded-xl font-bold hover:bg-slate-500">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
