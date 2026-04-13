import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSimulation } from '../context/SimulationContext';
import { motion } from 'framer-motion';

export default function Assistant() {
  const { userState } = useUser();
  const { gameState } = useSimulation();
  
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome back! I am VenueIQ. I'm actively monitoring the stadium index. How can I augment your experience today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const quickReplies = [
    "Fastest exit route?",
    `Order ${userState?.foodPref} food`,
    "Restroom queue status"
  ];

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    const conversationHistory = [...messages, userMessage];
    setMessages(conversationHistory);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = "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";
      
      const systemPrompt = `You are VenueIQ, a hyper-intelligent, concise AI concierge for a premium stadium experience called AisleBe.
      Always adhere strictly to this factual live context:
      - User: Seat ${userState?.seat}, Gate ${userState?.gate}, Accessibility Mode: ${userState?.accessibility ? 'ON' : 'OFF'}. Food Pref: ${userState?.foodPref}. Transport: ${userState?.transport}.
      - Match State: ${gameState.venue.matchInfo.homeTeam} vs ${gameState.venue.matchInfo.awayTeam}. Score is ${gameState.venue.matchInfo.homeScore}-${gameState.venue.matchInfo.awayScore}. Minute ${gameState.venue.matchInfo.minute}.
      - North Stand Bites Queue: ${gameState.venue.concessions.north_stand.waitMins} min wait.
      - Restroom R1 Queue: ${gameState.venue.restrooms.r1.waitMins} min wait.
      Keep answers under 3 sentences. Be extraordinarily concise, premium, and intelligent.`;

      const claudeMessages = conversationHistory.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          content: m.content
      }));

      // Use native fetch to bypass SDK browser un-compatibility errors
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 1000,
          system: systemPrompt,
          messages: claudeMessages
        })
      });

      if (!res.ok) {
         throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `API Error: ${error.message || 'System disruption detected.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-dark-900 relative rounded-none md:p-6 lg:p-12">
       
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-dark-900 to-black z-0"></div>

       <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="w-full max-w-3xl flex flex-col h-full bg-dark-800/60 md:rounded-[2.5rem] md:border border-white/10 md:shadow-[0_40px_80px_rgba(0,0,0,0.6)] backdrop-blur-3xl overflow-hidden relative z-10"
       >
         {/* Premium Header */}
         <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white text-dark-900 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0">
               <Bot size={32} />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white tracking-tight">VenueIQ Core</h2>
               <div className="flex items-center gap-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Link</p>
               </div>
            </div>
         </div>

         {/* Chat Stream */}
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

         {/* Input Matrix */}
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
                placeholder="Initialize query..."
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
