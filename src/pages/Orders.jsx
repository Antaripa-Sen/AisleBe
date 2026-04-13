import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useUser } from '../context/UserContext';
import { ExternalLink, Clock } from 'lucide-react';

const FOOD_PARTNERS = [
  {
    id: 'zomato',
    name: 'Zomato',
    url: 'https://www.zomato.com',
    tagline: 'Explore nearby restaurants, delivery, and pickup.',
    accent: 'from-red-500 to-pink-500',
    icon: '🍽️'
  },
  {
    id: 'kfc',
    name: 'KFC',
    url: 'https://www.kfc.com',
    tagline: 'Order buckets, wings and fast fried chicken.',
    accent: 'from-orange-500 to-yellow-400',
    icon: '🍗'
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    url: 'https://www.swiggy.com',
    tagline: 'Delivery from local favourites across cuisines.',
    accent: 'from-emerald-500 to-teal-400',
    icon: '🚴'
  },
  {
    id: 'dominos',
    name: "Domino's",
    url: 'https://www.dominos.com',
    tagline: 'Fresh pizzas, sides and desserts to your seat.',
    accent: 'from-sky-500 to-indigo-500',
    icon: '🍕'
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    url: 'https://www.ubereats.com',
    tagline: 'Order from cafes and fast food in minutes.',
    accent: 'from-slate-500 to-slate-700',
    icon: '🚗'
  }
];

export default function Orders() {
  const { gameState } = useSimulation();
  const { userState } = useUser();
  const queueTime = gameState?.venue?.concessions?.north_stand?.waitMins ?? 0;
  const currentGate = userState?.gate || 'Gate 4';
  const foodPref = userState?.foodPref ? userState.foodPref.toUpperCase() : 'GENERAL';

  return (
    <div className="h-full w-full overflow-y-auto pb-24 px-6 py-8 lg:px-12 lg:py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="rounded-[2.5rem] border border-white/10 bg-dark-900/90 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 font-bold">Live food order</p>
              <h1 className="mt-4 text-4xl lg:text-5xl font-black text-white">Redirect to trusted food apps</h1>
              <p className="mt-4 max-w-2xl text-slate-400 text-base leading-relaxed">Select a provider below to open the official ordering website or app. This ensures you get real menus and genuine food delivery options instead of local simulated food items.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Recommended cuisine</p>
                <p className="mt-3 text-xl font-black text-white">{foodPref}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Local gate</p>
                <p className="mt-3 text-xl font-black text-white">{currentGate}</p>
                <p className="text-slate-400 text-sm mt-1">Concession wait ~{queueTime} mins</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {FOOD_PARTNERS.map((partner) => (
              <a
                key={partner.id}
                href={partner.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group rounded-[2rem] border border-white/10 bg-dark-800/90 p-6 transition-all duration-300 hover:border-primary-500/40 hover:bg-white/5"
              >
                <div className={`inline-flex items-center justify-center rounded-3xl bg-gradient-to-br ${partner.accent} p-4 text-2xl shadow-lg shadow-white/5`}>{partner.icon}</div>
                <div className="mt-6">
                  <h2 className="text-xl font-black text-white">{partner.name}</h2>
                  <p className="mt-2 text-slate-400 text-sm leading-6">{partner.tagline}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-primary-300 font-bold">
                  <span>Open provider</span>
                  <ExternalLink size={18} />
                </div>
              </a>
            ))}
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-dark-900/90 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-bold">How it works</p>
            <h2 className="mt-4 text-3xl font-black text-white">Real redirects to real apps</h2>
            <p className="mt-5 text-slate-400 leading-relaxed">Each card sends you to the verified official website for that partner. Use the app or website to place a genuine order, then share your seat details for accurate delivery.</p>

            <div className="mt-8 space-y-5 text-slate-400">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold text-white">1. Tap a provider</p>
                <p className="mt-2 text-sm">Open Zomato, KFC, Swiggy, Domino&apos;s or Uber Eats to see live menus and checkout.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold text-white">2. Enter your gate/seat</p>
                <p className="mt-2 text-sm">Pre-fill your stadium/seat information in the delivery address for faster drop-off.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold text-white">3. Order outside the simulation</p>
                <p className="mt-2 text-sm">The links here are live external services, not the app's fake menu interface.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
