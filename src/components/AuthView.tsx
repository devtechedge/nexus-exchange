import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { User } from '../types';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
    } else {
      if (!username || !email || !password) {
        setError('Please fill in all fields');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        username: isLogin ? email.split('@')[0] : username,
        email: email,
        isLoggedIn: true,
        kycStatus: 'unverified',
        twoFactorEnabled: false,
      });
      setLoading(false);
    }, 800);
  };

  const handleInstantSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        username: 'nexus_explorer',
        email: 'explorer@nexus.exchange',
        isLoggedIn: true,
        kycStatus: 'verified', // Pre-verified to give them an awesome initial experience
        twoFactorEnabled: true,
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div id="auth-container" className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden px-4">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo and Tagline */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl mb-4 shadow-xl shadow-cyan-950/20"
          >
            <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span className="font-mono font-bold text-lg bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent tracking-wider">
              NEXUS
            </span>
          </motion.div>
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-white mb-2">
            Secure Digital Asset Portal
          </h1>
          <p className="text-sm font-mono text-slate-400">
            Institutional-grade crypto trading & yield
          </p>
        </div>

        {/* Form Card */}
        <div id="auth-card" className="bg-slate-950/40 backdrop-blur-md border border-slate-900 rounded-3xl p-8 shadow-2xl relative">
          
          {/* Quick-sign-in banner */}
          <div className="mb-6 p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Sandbox Preview Mode</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">Bypass login and test the exchange instantly with simulated premium settings.</p>
              </div>
            </div>
            <button
              id="sandbox-signin-btn"
              type="button"
              onClick={handleInstantSignIn}
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-sans font-bold text-xs rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
            >
              <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
              Sandbox Instant Sign-In
            </button>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-900 w-full"></div>
            <span className="bg-slate-950 px-3 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-widest absolute">Or regular sign in</span>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-slate-900/50 p-1 rounded-xl mb-6 border border-slate-900/80">
            <button
              id="tab-login"
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${isLogin ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </span>
            </button>
            <button
              id="tab-signup"
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${!isLogin ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </span>
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Username</label>
                <input
                  id="auth-username-input"
                  type="text"
                  placeholder="e.g. explorer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Email Address</label>
              <input
                id="auth-email-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Password</label>
              <input
                id="auth-password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 hover:border-slate-700 font-sans font-semibold text-xs rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{isLogin ? 'Sign In to Account' : 'Create Secure Wallet'}</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
