import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSimulation } from '../context/SimulationContext';
import { motion } from 'framer-motion';

const getAssistantReply = (text, { userState, gameState }) => {
  const lower = text.toLowerCase();
  const matchInfo = gameState?.venue?.matchInfo || {};
  const restroomWait = gameState?.venue?.restrooms?.r1?.waitMins ?? 'unknown';
  const foodPref = userState?.foodPref || 'any';

  if (/(exit|egress|leave|route|depart|out of here)/i.test(lower)) {
    return `The fastest exit path is through ${userState?.gate || 'your assigned gate'}. Use the Exit screen for live ride bookings and optimized routes.`;
  }

  if (/(food|order|eat|meal|delivery)/i.test(lower)) {
    return `Open Orders to redirect to real food apps like Zomato, KFC, Swiggy, Domino's, and Uber Eats for current menus, or shop sports merchandise from Nike, Adidas, Fanatics, and Amazon.`;
  }

  if (/(restroom|bathroom|loo|washroom)/i.test(lower)) {
    return `Restroom R1 wait is currently ${restroomWait} minutes. I recommend the nearest alternate entrance if you want a faster option.`;
  }

  if (/(score|match|minute|home team|away team|goal)/i.test(lower)) {
    return `Live match: ${matchInfo.homeTeam || 'Home'} vs ${matchInfo.awayTeam || 'Away'}. Score ${matchInfo.homeScore || 0}–${matchInfo.awayScore || 0}, ${matchInfo.minute || 0} minute.`;
  }

  if (/(merchandise|merch|gear|jersey|shop|buy)/i.test(lower)) {
    return `Order official team merchandise from Nike, Adidas, Fanatics, or Amazon Sports in the Orders section. Get jerseys, caps, and fan gear delivered to your door.`;
  }

  if (/(parking|park|car)/i.test(lower)) {
    return `Book parking spots near the stadium using Parkopedia or JustPark in the Orders section.`;
  }

  if (/(ticket|seat|gate|wallet)/i.test(lower)) {
    return `Your seat is ${userState?.seat || 'GUEST'} at ${userState?.gate || 'Gate 4'}. Wallet shows your ticket, loyalty points, and ride booking options.`;
  }

  return `I can help with live routing, ride booking, restroom wait times, food ordering, merchandise shopping, parking, and match updates. Ask me anything about your stadium experience.`;
};

export default function Assistant() {
  const { userState } = useUser();
  const { gameState } = useSimulation();
  
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome back! I am AisleBe Assistant. How can I help your stadium experience today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const quickReplies = [
    'Fastest exit route?',
    `Order ${userState?.foodPref || 'food'}`,
    'Restroom queue status'
  ];

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const reply = getAssistantReply(text, { userState, gameState });
    await new Promise((resolve) => setTimeout(resolve, 450));
    setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-dark-900 relative rounded-none md:p-6 lg:p-12">
       
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-dark-900 to-black z-0"></div>

       <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="w-full max-w-3xl flex flex-col h-full bg-dark-800/60 md:rounded-[2.5rem] md:border border-white/10 md:shadow-[0_40px_80px_rgba(0,0,0,0.6)] backdrop-blur-3xl overflow-hidden relative z-10"
       >
         <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white text-dark-900 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0">
               <Bot size={32} />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white tracking-tight">AisleBe Assistant</h2>
               <div className="flex items-center gap-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Concierge</p>
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8 hide-scrollbar">
            {messages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] lg:max-w-[70%] p-5 md:p-6 text-base md:text-lg leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-3xl rounded-tr-sm shadow-[0_10px_20px_rgba(14,165,233,0.3)] font-medium' 
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-3xl rounded-tl-sm shadow-xl font-light'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white/5 border border-white/10 p-6 rounded-3xl rounded-tl-sm flex gap-3 shadow-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500 animate-bounce delay-75"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-bounce delay-300"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         <div className="p-6 md:p-8 bg-black/20 border-t border-white/5 flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
               {quickReplies.map((qr, i) => (
                 <button 
                   key={i} onClick={() => handleSend(qr)}
                   className="whitespace-nowrap px-5 py-2.5 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-full text-xs font-bold uppercase tracking-wide text-slate-300 transition-all font-sans shrink-0 hover:-translate-y-0.5"
                 >
                   {qr}
                 </button>
               ))}
            </div>

            <div className="relative group">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(input);
                }}
                placeholder="Ask me about routes, rides, tickets, or food"
                className="w-full bg-dark-900/50 border border-white/10 rounded-[2rem] pl-6 pr-16 py-5 text-lg font-medium text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:bg-dark-900 transition-all shadow-inner group-hover:border-white/20"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-full text-white transition-all w-12 h-12 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:shadow-none"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} className="ml-1" />}
              </button>
            </div>
         </div>
       </motion.div>
    </div>
  );
}
