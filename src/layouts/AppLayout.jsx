import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Map, MessageSquare, ShoppingBag, DoorOpen, Wallet as WalletIcon, User, Sun, Moon } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function AppLayout() {
  const { theme, toggleTheme } = useUser();
  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/map', icon: Map, label: 'Map' },
    { to: '/assistant', icon: MessageSquare, label: 'Assistant' },
    { to: '/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/exit', icon: DoorOpen, label: 'Exit' },
    { to: '/wallet', icon: WalletIcon, label: 'Wallet' },
  ];

  return (
    <div className={`flex-1 flex flex-col md:flex-row h-full w-full relative overflow-hidden ${theme === 'light' ? 'bg-[radial-gradient(ellipse_at_top_right,_rgba(226,232,240,0.8),_rgba(148,163,184,0.12))]' : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-black`} `}>
      
      {/* Desktop/Tablet Sidebar */}
      <nav className={`hidden md:flex flex-col w-24 lg:w-64 h-full border-r ${theme === 'light' ? 'border-slate-200 bg-slate-50/90 text-slate-900' : 'border-white/5 bg-dark-900/60 text-slate-400'} backdrop-blur-2xl z-50 shrink-0`}>
        <div className="p-6 lg:p-8 flex items-center justify-center lg:justify-start">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.4)]">
             <span className="text-white font-bold text-xl leading-none">A</span>
          </div>
          <span className="hidden lg:block ml-4 text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AisleBe</span>
        </div>

        <div className="flex-1 px-4 lg:px-6 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                    isActive 
                    ? 'bg-primary-500/10 border border-primary-500/20 text-primary-400 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)]' 
                    : theme === 'light' ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={24} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]' : 'group-hover:scale-110'}`} />
                    <span className={`hidden lg:block font-medium ${isActive ? 'text-primary-300' : ''}`}>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
        <div className="px-4 lg:px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-full rounded-2xl py-3 font-bold transition-colors ${theme === 'light' ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {theme === 'light' ? <Moon size={18} className="inline-block mr-2" /> : <Sun size={18} className="inline-block mr-2" />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth pb-24 md:pb-0 hide-scrollbar">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar */}
      <div className={`md:hidden absolute bottom-0 inset-x-0 pb-safe pt-2 px-2 ${theme === 'light' ? 'bg-slate-100/90 border-slate-200 text-slate-900' : 'bg-dark-900/90 border-t border-white/10 text-slate-400'} backdrop-blur-2xl z-50 rounded-t-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.4)] flex justify-between`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.to} 
              to={item.to}
              className={({ isActive }) => 
                `relative flex-1 flex flex-col items-center justify-center py-3 px-1 transition-all duration-300 ${
                  isActive ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative z-10 transition-transform duration-500 ${isActive ? '-translate-y-2 scale-110' : ''}`}>
                    <Icon size={22} className={isActive ? "drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" : ""} />
                  </div>
                  {isActive && (
                    <div className="absolute top-1 w-10 h-10 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
                  )}
                  {isActive && (
                    <span className="absolute bottom-2 text-[9px] font-bold tracking-wider uppercase opacity-100 animate-[fade-in_0.3s_ease-out]">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={toggleTheme}
          className="ml-2 rounded-2xl p-3 bg-white/10 text-slate-200 hover:bg-white/20 transition-colors"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </div>
  );
}
