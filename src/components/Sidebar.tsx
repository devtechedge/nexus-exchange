import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  Users,
  Fingerprint, 
  Code, 
  LogOut, 
  Shield, 
  User as UserIcon,
  CheckCircle,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onSignOut: () => void;
  usdBalance: number;
  userLevel?: number;
  userXp?: number;
  selectedAvatar?: string;
  streakDays?: number;
  isSandboxActive?: boolean;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onSignOut, 
  usdBalance,
  userLevel = 1,
  userXp = 150,
  selectedAvatar = 'piggy',
  streakDays = 3,
  isSandboxActive = false
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'My Home Dashboard', icon: LayoutDashboard },
    { id: 'trade', label: 'Buy, Sell & Swap Center', icon: ArrowLeftRight },
    { id: 'earn', label: 'Rewards Center', icon: TrendingUp },
    { id: 'social', label: 'Community & Friends', icon: Users },
    { id: 'security', label: 'Identity & Security Check', icon: Fingerprint },
    { id: 'global', label: 'Global & Inclusive Access', icon: Globe },
    { id: 'developer', label: 'Developer Tools', icon: Code },
  ];

  return (
    <aside id="app-sidebar" className="hidden md:flex w-64 bg-slate-950/80 border-r border-slate-900 flex-col justify-between h-screen fixed top-0 left-0 z-30 backdrop-blur-md">
      {/* Top Brand Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold text-sm tracking-wider text-white">NEXUS</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Exchange v4.0</span>
          </div>
        </div>

        {/* User Balance card */}
        <div className={`p-4 border rounded-2xl mb-6 transition-all duration-300 ${isSandboxActive ? 'bg-indigo-950/25 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.12)]' : 'bg-slate-900/40 border-slate-900'}`}>
          <p className="text-[10px] font-sans text-slate-400 uppercase tracking-wider flex items-center gap-1">
            {isSandboxActive ? '🧪 Sandbox Practice Funds' : 'My Crypto Piggy Bank 🐷'}
          </p>
          <p className={`text-xl font-sans font-bold tracking-tight mt-1 transition-colors ${isSandboxActive ? 'text-indigo-300' : 'text-white'}`}>
            ${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {isSandboxActive ? (
            <div className="mt-2.5 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[9px] font-mono text-indigo-400 flex items-center justify-center gap-1">
              <span>SANDBOX ISOLATION ACTIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className={`w-1.5 h-1.5 rounded-full ${user.kycStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-sans text-slate-400">
                {user.kycStatus === 'verified' ? 'Safe & Verified Account' : 'Limited Profile (Verify ID below)'}
              </span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`sidebar-tab-${item.id}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="text-xs font-sans font-medium">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-auto"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Sign Out */}
      <div className="p-4 border-t border-slate-900">
        
        {/* Dynamic Levels & Streak Status */}
        <div className="px-3 py-2.5 mb-3 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-2 text-left">
          <div className="flex justify-between items-center text-[10px] font-sans font-bold text-slate-400">
            <span className="text-cyan-400 flex items-center gap-1">Level {userLevel} Practicer</span>
            <span className="text-amber-400">🔥 {streakDays}-Day!</span>
          </div>
          
          {/* Level progress bar */}
          <div className="relative w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900/50">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${(userXp / (userLevel * 500)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-slate-500">
            <span>{userXp} / {userLevel * 500} XP</span>
            <span>Next Mascot at L{userLevel + 1}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 mb-3 bg-slate-900/20 border border-transparent hover:border-slate-900 rounded-xl transition duration-150">
          <div className="w-8 h-8 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-base shrink-0 select-none relative group">
            <span>{
              selectedAvatar === 'piggy' ? '🐷' :
              selectedAvatar === 'bunny' ? '🐰' :
              selectedAvatar === 'shiba' ? '🐕' :
              selectedAvatar === 'kitten' ? '🐱' :
              selectedAvatar === 'hamster' ? '🐹' : '🐷'
            }</span>
            {/* Little level tag on the mascot */}
            <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 text-[7px] font-mono font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-950">
              L{userLevel}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-sans font-semibold text-slate-300 truncate">{user.username}</span>
            <span className="text-[9px] font-mono text-slate-500 truncate">{user.email}</span>
          </div>
        </div>

        <button
          id="sidebar-signout-btn"
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-mono text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all duration-150 cursor-pointer border border-transparent hover:border-red-900/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out / Safe Exit
        </button>
      </div>
    </aside>
  );
}
