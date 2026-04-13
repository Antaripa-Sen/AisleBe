import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useUser } from '../context/UserContext';
import { ChevronRight, Plus, Minus, ShoppingCart, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { id: 'm1', name: 'Premium Stadium Burger', price: 14.50, type: 'non-veg', icon: '🍔', desc: 'Double patty, aged cheddar, truffle aioli.' },
  { id: 'm2', name: 'Beyond Truffle Wrap', price: 12.50, type: 'veg', icon: '🌯', desc: 'Plant-based protein, crisp greens, balsamic.' },
  { id: 'm3', name: 'Loaded Queso Nachos', price: 9.50, type: 'snacks', icon: '🌮', desc: 'Jalapenos, pico de gallo, fresh guac.' },
  { id: 'm4', name: 'Craft IPA Draft', price: 11.00, type: 'drinks', icon: '🍺', desc: 'Locally brewed, served ice cold.' },
  { id: 'm5', name: 'Artisan Lemonade', price: 5.50, type: 'drinks', icon: '🥤', desc: 'Fresh squeezed with mint.' }
];

export default function Orders() {
  const { gameState } = useSimulation();
  const { userState } = useUser();
  const { concessions } = gameState.venue;
  
  const [cart, setCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState('idle'); // idle, checking_out, success
  const [activeTab, setActiveTab] = useState('menu');

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty - 1) } : i).filter(i => i.qty > 0));
  };

  const total = cart.reduce((acc, current) => acc + (current.price * current.qty), 0);
  const queueTime = concessions.north_stand.waitMins;

  const handleCheckout = () => {
    setOrderStatus('checking_out');
    setTimeout(() => {
      setOrderStatus('success');
      setCart([]);
    }, 2000);
  };

  if (orderStatus === 'success') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center lg:w-[600px] lg:mx-auto">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-32 h-32 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
        >
          <ShoppingCart size={48} />
        </motion.div>
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">Confirmed!</h2>
        <p className="text-slate-400 mb-10 text-lg">
          Your order was dispatched to <strong>{concessions.north_stand.name}</strong>. Anticipated wait time: <strong>~{queueTime} mins</strong>.
        </p>
        
        {/* Visual Timeline */}
        <div className="w-full bg-dark-800/80 p-8 rounded-3xl border border-white/5 shadow-2xl space-y-8 text-left mb-8">
          <div className="flex gap-4 items-start relative opacity-100">
            <div className="w-4 h-4 bg-emerald-500 rounded-full mt-1.5 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
            <div className="absolute left-2 top-6 bottom-[-24px] w-0.5 bg-white/10"></div>
            <div>
              <p className="text-lg font-bold text-white leading-tight">Order Placed</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Processed successfully</p>
            </div>
          </div>
          <div className="flex gap-4 items-start relative opacity-50">
            <div className="w-4 h-4 bg-slate-600 rounded-full mt-1.5 border-2 border-white/10"></div>
            <div className="absolute left-2 top-6 bottom-[-24px] w-0.5 bg-white/10"></div>
            <div>
              <p className="text-lg font-bold text-white leading-tight">Preparing</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Culinary team assembling</p>
            </div>
          </div>
          <div className="flex gap-4 items-start opacity-50">
             <div className="w-4 h-4 bg-slate-600 rounded-full mt-1.5 border-2 border-white/10"></div>
            <div>
              <p className="text-lg font-bold text-white leading-tight">Pickup Ready</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Locker Bay 4</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => { setOrderStatus('idle'); setActiveTab('history'); }}
          className="w-full bg-white hover:bg-slate-200 text-dark-900 font-bold py-5 rounded-[2rem] transition-colors text-lg shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
        >
          Track Progression
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col hide-scrollbar relative lg:flex-row">
      
      {/* Left Menu Section */}
      <div className="flex-1 flex flex-col h-full lg:border-r lg:border-white/5">
         <div className="pt-10 pb-6 px-6 lg:px-12 sticky top-0 bg-dark-900/90 z-10 backdrop-blur-md">
            <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight">Provisions</h1>
            
            <div className="flex gap-6 mt-8 border-b border-white/10">
               <button 
                  className={`pb-3 text-sm lg:text-base font-bold transition-colors border-b-4 ${activeTab === 'menu' ? 'border-primary-500 text-white' : 'border-transparent text-slate-500'}`}
                  onClick={() => setActiveTab('menu')}
               >
                  Menu Selection
               </button>
               <button 
                  className={`pb-3 text-sm lg:text-base font-bold transition-colors border-b-4 ${activeTab === 'history' ? 'border-primary-500 text-white' : 'border-transparent text-slate-500'}`}
                  onClick={() => setActiveTab('history')}
               >
                  Order History
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto pb-40 lg:pb-12 px-6 lg:px-12 mt-4">
            {activeTab === 'menu' ? (
               <>
                  <div className="mb-8 p-6 rounded-[2rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-between shadow-[0_10px_30px_rgba(249,115,22,0.1)]">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                           <Clock size={24} className="text-orange-400" />
                        </div>
                        <div>
                           <h4 className="text-base font-black text-white">Express Pickup</h4>
                           <p className="text-sm text-orange-200 mt-1">{concessions.north_stand.name}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-3xl font-black text-orange-400">{queueTime}<span className="text-lg">m</span></div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-orange-200/50">Wait</div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                     {MENU_ITEMS.map((item) => {
                        const isPreferred = userState?.foodPref === item.type;
                        const cartQty = cart.find(i => i.id === item.id)?.qty || 0;

                        return (
                           <div key={item.id} className={`p-6 rounded-[2rem] border transition-all ${isPreferred ? 'bg-primary-500/5 border-primary-500/30' : 'bg-white/5 border-white/5'} flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl`}>
                              <div className="flex justify-between items-start mb-6">
                                 <div className="text-4xl">{item.icon}</div>
                                 {isPreferred && <span className="text-[10px] px-2 py-1 rounded bg-primary-500 text-white font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(14,165,233,0.5)]">Recommended</span>}
                              </div>
                              
                              <div>
                                 <h3 className="font-black text-white text-lg">{item.name}</h3>
                                 <p className="text-slate-400 text-sm mt-1 mb-4 leading-relaxed line-clamp-2 min-h-10">{item.desc}</p>
                              </div>

                              <div className="flex items-center justify-between mt-auto">
                                 <span className="text-xl font-bold text-white">${item.price.toFixed(2)}</span>
                                 <div className="flex items-center gap-4 bg-dark-900 rounded-full p-1 border border-white/10 shadow-sm">
                                    <button onClick={() => removeFromCart(item.id)} disabled={cartQty === 0} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-white/10 disabled:opacity-30 transition-colors">
                                       <Minus size={16} />
                                    </button>
                                    <span className="w-4 text-center font-bold text-white">{cartQty}</span>
                                    <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center rounded-full text-dark-900 bg-white hover:bg-slate-200 transition-colors">
                                       <Plus size={16} />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </>
            ) : (
               <div className="text-center text-slate-500 py-20 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center text-slate-600 mb-6">
                     <ShoppingCart size={48} />
                  </div>
                  <p className="text-lg font-bold">No historical transactions.</p>
               </div>
            )}
         </div>
      </div>

      {/* Right Desktop Cart / Mobile Bottom Overlay */}
      <AnimatePresence>
        {cart.length > 0 && activeTab === 'menu' && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed lg:static bottom-20 lg:bottom-auto inset-x-4 lg:inset-x-auto lg:w-[400px] bg-dark-800 lg:bg-dark-900/50 rounded-t-[2.5rem] lg:rounded-none p-6 lg:p-10 shadow-[0_-15px_40px_rgba(0,0,0,0.5)] lg:shadow-none border-t lg:border-t-0 lg:border-l border-white/10 z-20 flex flex-col h-auto lg:h-full justify-between"
          >
            <div className="hidden lg:block mb-8">
               <h2 className="text-2xl font-black text-white">Current Order</h2>
               <p className="text-slate-400 text-sm mt-2">{cart.reduce((a,c)=>a+c.qty,0)} items selected</p>
               
               <div className="mt-8 space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                  {cart.map(i => (
                     <div key={i.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                        <div className="flex gap-3 items-center">
                           <span>{i.icon}</span>
                           <span className="font-bold text-white text-sm">{i.qty}x {i.name}</span>
                        </div>
                        <span className="text-slate-400 font-bold">${(i.price*i.qty).toFixed(2)}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex lg:flex-col items-center lg:items-stretch justify-between lg:justify-end gap-6 mt-auto">
              <div className="lg:border-t lg:border-white/10 lg:pt-6">
                <p className="text-xs lg:text-sm text-slate-400 font-bold uppercase tracking-widest mb-1 lg:mb-2">Total Payable</p>
                <h3 className="font-black text-white text-3xl lg:text-5xl">${total.toFixed(2)}</h3>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={orderStatus === 'checking_out'}
                className="flex items-center justify-center gap-3 bg-white text-dark-900 px-8 py-4 lg:py-6 rounded-3xl font-black text-lg hover:bg-slate-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:-translate-y-1"
              >
                {orderStatus === 'checking_out' ? 'Processing...' : 'Pay with GPay'}
                <ChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
