import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, LogIn, UserPlus, KeyRound, CheckCircle, Lock, Smile } from 'lucide-react';
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
  
  // Fun interactive state for step progress visualization
  const [activeStep, setActiveStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      if (!email || !password) {
        setError('Oops! Please write both your email and password to continue.');
        return;
      }
    } else {
      if (!username || !email || !password) {
        setError('Oops! Please fill out all three boxes so we can welcome you.');
        return;
      }
    }

    setLoading(true);
    setActiveStep(2); // Secure It
    
    setTimeout(() => {
      setActiveStep(3); // Say Hello!
      setTimeout(() => {
        onLoginSuccess({
          username: isLogin ? email.split('@')[0] : username,
          email: email,
          isLoggedIn: true,
          kycStatus: 'unverified',
          twoFactorEnabled: false,
        });
        setLoading(false);
      }, 600);
    }, 800);
  };

  const handleInstantSignIn = () => {
    setLoading(true);
    setActiveStep(2);
    setTimeout(() => {
      setActiveStep(3);
      setTimeout(() => {
        onLoginSuccess({
          username: 'happy_crypto_learner',
          email: 'hello@nexus-exchange.io',
          isLoggedIn: true,
          kycStatus: 'verified', // Pre-verified for instant fun
          twoFactorEnabled: true,
        });
        setLoading(false);
      }, 400);
    }, 400);
  };

  return (
    <div id="auth-container" className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden px-4 py-8">
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
        {/* Onboarding Wizard Progress Header */}
        <div className="mb-6 bg-slate-950/80 border border-slate-900 rounded-2xl p-4 flex justify-between items-center text-[11px] font-sans">
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeStep >= 1 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-500'}`}>
              {activeStep > 1 ? '✓' : '1'}
            </div>
            <span className={activeStep === 1 ? 'text-cyan-400 font-bold' : 'text-slate-400'}>1. Start Account</span>
          </div>
          <div className="w-6 h-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeStep >= 2 ? 'bg-teal-500 text-slate-950' : 'bg-slate-900 text-slate-500'}`}>
              {activeStep > 2 ? '✓' : '2'}
            </div>
            <span className={activeStep === 2 ? 'text-teal-400 font-bold' : 'text-slate-400'}>2. Secure It 🔒</span>
          </div>
          <div className="w-6 h-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeStep >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500'}`}>
              3
            </div>
            <span className={activeStep === 3 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>3. Say Hello! 👋</span>
          </div>
        </div>

        {/* Logo and Tagline */}
        <div className="text-center mb-6">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl mb-3 shadow-xl"
          >
            <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="font-mono font-bold text-sm bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent tracking-wider">
              NEXUS EXCHANGE
            </span>
          </motion.div>
          <h1 className="text-xl font-sans font-bold tracking-tight text-white mb-1">
            My Friendly Crypto Space
          </h1>
          <p className="text-xs font-sans text-slate-400">
            A super simple way to learn, buy, and grow your digital coins! 🪙
          </p>
        </div>

        {/* Form Card */}
        <div id="auth-card" className="bg-slate-950/40 backdrop-blur-md border border-slate-900 rounded-3xl p-6 shadow-2xl relative">
          
          {/* Quick-sign-in banner */}
          <div className="mb-5 p-4 bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-900/30 rounded-2xl flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-slate-200">🌟 Magical Sandbox Sandbox Mode</p>
                <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                  Skip the typing! Go straight inside with free test money and pre-verified settings to play around safely.
                </p>
              </div>
            </div>
            <button
              id="sandbox-signin-btn"
              type="button"
              onClick={handleInstantSignIn}
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-sans font-bold text-xs rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02]"
            >
              <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
              Magical Instant Entry! 🚀
            </button>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-900/80 w-full"></div>
            <span className="bg-slate-950 px-3 py-1 text-[10px] font-sans text-slate-500 uppercase tracking-widest absolute">Or use your own credentials</span>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-slate-900/50 p-1 rounded-xl mb-4 border border-slate-900/80">
            <button
              id="tab-login"
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${isLogin ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                Log In
              </span>
            </button>
            <button
              id="tab-signup"
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${!isLogin ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                Join / Create Account
              </span>
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-xs font-sans">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-sans text-slate-400 mb-1">Pick a Fun Username</label>
                <input
                  id="auth-username-input"
                  type="text"
                  placeholder="e.g. coin_explorer15"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-sans text-slate-400 mb-1">Your Email Address</label>
              <input
                id="auth-email-input"
                type="email"
                placeholder="you@yourmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-sans text-slate-400 mb-1">Your Password</label>
              <input
                id="auth-password-input"
                type="password"
                placeholder="Make it super strong! ••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Reassuring encryption message */}
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed text-center mt-2">
              🔒 We keep your account safe using top-tier encryption. Your data belongs to you.
            </p>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 hover:border-slate-700 font-sans font-semibold text-xs rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{isLogin ? 'Let\'s Go! Log In 🚪' : 'Create My Safe Wallet 🎒'}</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
