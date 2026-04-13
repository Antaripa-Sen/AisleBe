import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, guestLogin } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    return email.includes('@') && email.includes('.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address with @ symbol' });
      return;
    }

    if (formData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);
    console.log('Starting sign in process for:', formData.email);

    try {
      console.log('Attempting login...');
      await login(formData.email, formData.password);
      console.log('Login successful, navigating to home');
      navigate('/home');
    } catch (error) {
      console.log('Login failed:', error.message);
      if (error.message.includes('No account found')) {
        try {
          console.log('Creating new account...');
          await register(formData.email, formData.password);
          console.log('Account created, navigating to home');
          navigate('/home');
        } catch (registerError) {
          console.error('Registration failed:', registerError);
          setErrors({ general: registerError.message });
        }
      } else {
        console.error('Login error:', error);
        setErrors({ general: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-dark-900 selection:bg-primary-500/30 py-8">
      
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-sky-900/40 rounded-full blur-[150px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md px-6 z-10"
      >
        
        <div className="text-center mb-6 max-w-xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-3">
            Welcome back to AisleBe
          </h1>
          <p className="text-slate-400 text-lg">Sign in to access your stadium experience or continue as guest.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-dark-800/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        >
          {errors.general && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm"
            >
              {errors.general}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-colors ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:from-primary-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              {!isLoading && <ArrowRight size={20} />}
            </motion.button>
          </form>

          <div className="mt-6 space-y-4 text-center">
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                setErrors({});
                try {
                  await guestLogin();
                  navigate('/home');
                } catch (error) {
                  setErrors({ general: error.message });
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-white font-semibold hover:border-primary-400 hover:text-primary-300 transition-colors"
            >
              Continue as Guest
            </button>
            <p className="text-slate-400 text-sm">
              Or <button 
                onClick={() => navigate('/onboarding')}
                className="text-primary-400 hover:text-primary-300 ml-1 font-bold"
              >
                explore onboarding
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}