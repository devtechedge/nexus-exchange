import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  Fingerprint, 
  Code, 
  LogOut, 
  Shield, 
  User as UserIcon,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onSignOut: () => void;
  usdBalance: number;
}

export default function Sidebar({ activeTab, setActiveTab, user, onSignOut, usdBalance }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Terminal Dashboard', icon: LayoutDashboard },
    { id: 'trade', label: 'Advanced Trade Desk', icon: ArrowLeftRight },
    { id: 'earn', label: 'Staking & Yields', icon: TrendingUp },
    { id: 'security', label: 'KYC & 2FA Security', icon: Fingerprint },
    { id: 'developer', label: 'Developer Gateway', icon: Code },
  ];

  return (
    <aside id="app-sidebar" className="w-64 bg-slate-950/80 border-r border-slate-900 flex flex-col justify-between h-screen fixed top-0 left-0 z-30 backdrop-blur-md">
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
        <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl mb-6">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Estimated Balance</p>
          <p className="text-xl font-sans font-bold text-white tracking-tight mt-1">
            ${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className={`w-1.5 h-1.5 rounded-full ${user.kycStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-mono text-slate-400">
              {user.kycStatus === 'verified' ? 'Verified Account' : 'Limited Profile'}
            </span>
          </div>
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
        <div className="flex items-center gap-2.5 p-2 mb-3 bg-slate-900/20 border border-transparent hover:border-slate-900 rounded-xl transition duration-150">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-mono font-bold text-slate-300 border border-slate-800">
            {user.username.substring(0, 2).toUpperCase()}
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
          Terminate Session
        </button>
      </div>
    </aside>
  );
}
