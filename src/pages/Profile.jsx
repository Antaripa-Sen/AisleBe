import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useSimulation } from '../context/SimulationContext';
import { User, Mail, MapPin, Ticket, Star, Settings, LogOut, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const navigate = useNavigate();
  const { userState, logout, deleteAccount, saveUser } = useUser();
  const { gameState } = useSimulation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: userState?.name || '',
    email: userState?.email || '',
    phone: userState?.phone || ''
  });

  const nextMatchName = gameState?.venue?.matchInfo?.homeTeam && gameState?.venue?.matchInfo?.awayTeam
    ? `${gameState.venue.matchInfo.homeTeam} vs ${gameState.venue.matchInfo.awayTeam}`
    : 'Upcoming stadium event';

  const handleSave = () => {
    saveUser(editData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your account permanently? This cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteAccount(userState?.email);
      navigate('/login');
    } catch (error) {
      console.error(error);
      window.alert(error.message || 'Unable to delete account.');
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto pb-24 px-6 py-8 lg:px-12 lg:py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] border border-white/10 bg-dark-900/90 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-3xl flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">{userState?.name || 'Fan User'}</h1>
                <p className="text-slate-400 mt-1">AisleBe Member</p>
              </div>
            </div>
            <div className="flex gap-3 flex-col sm:flex-row">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 flex items-center gap-2"
              >
                <Edit size={16} />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/30 flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 md:p-8 rounded-[2rem]"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <User size={24} className="text-primary-400" />
              Personal Information
            </h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <User className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Name</p>
                    <p className="text-white font-bold">{userState?.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <Mail className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-white font-bold">{userState?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <MapPin className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Phone</p>
                    <p className="text-white font-bold">{userState?.phone || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 md:p-8 rounded-[2rem]"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Ticket size={24} className="text-primary-400" />
              Current Ticket
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-primary-600 to-indigo-800 rounded-2xl">
                <h4 className="text-white font-bold text-lg">{nextMatchName}</h4>
                <p className="text-primary-200 text-sm mt-1">Live match in progress</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Gate</p>
                  <p className="text-white font-bold text-xl">{userState?.gate || 'Not assigned'}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Seat</p>
                  <p className="text-white font-bold text-xl">{userState?.seat || 'A1'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Loyalty & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 md:p-8 rounded-[2rem]"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Star size={24} className="text-yellow-400" />
            Loyalty & Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl">
              <Star className="text-yellow-400 fill-yellow-400 mx-auto mb-3" size={32} />
              <p className="text-3xl font-black text-white">{userState?.loyaltyPoints ?? 120}</p>
              <p className="text-slate-400 text-sm">Loyalty Points</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-2xl">
              <Ticket className="text-primary-400 mx-auto mb-3" size={32} />
              <p className="text-3xl font-black text-white">{userState?.matchesAttended ?? 0}</p>
              <p className="text-slate-400 text-sm">Matches Attended</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-2xl">
              <MapPin className="text-green-400 mx-auto mb-3" size={32} />
              <p className="text-3xl font-black text-white">{userState?.ridesBooked ?? 0}</p>
              <p className="text-slate-400 text-sm">Rides Booked</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6 md:p-8 rounded-[2rem] border border-red-500/10 bg-red-500/5"
        >
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                <Trash2 size={24} className="text-red-400" />
                Account Security
              </h3>
              <p className="text-slate-400 text-sm">Permanently delete your account and remove all saved user data from this device.</p>
            </div>

            {userState?.isGuest ? (
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                Guest sessions cannot be deleted. Use logout to end this session.
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full rounded-2xl bg-red-500 text-white py-4 font-bold hover:bg-red-600 transition-all"
              >
                Delete Account
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}