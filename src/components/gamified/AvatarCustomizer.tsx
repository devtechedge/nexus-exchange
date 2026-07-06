import React from 'react';
import { motion } from 'motion/react';
import { Lock, Check, Sparkles } from 'lucide-react';

interface Avatar {
  id: string;
  name: string;
  emoji: string;
  bgClass: string;
  unlockLevel: number;
}

interface AvatarCustomizerProps {
  currentAvatar: string;
  userLevel: number;
  onSelectAvatar: (avatarId: string) => void;
}

export const AVATARS: Avatar[] = [
  { id: 'piggy', name: 'Pixel Piggy', emoji: '🐷', bgClass: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-300', unlockLevel: 1 },
  { id: 'bunny', name: 'Astra Bunny', emoji: '🐰', bgClass: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300', unlockLevel: 2 },
  { id: 'shiba', name: 'Sovereign Shiba', emoji: '🐕', bgClass: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-300', unlockLevel: 3 },
  { id: 'kitten', name: 'Robo-Kitten', emoji: '🐱', bgClass: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300', unlockLevel: 4 },
  { id: 'hamster', name: 'Quantum Hamster', emoji: '🐹', bgClass: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300', unlockLevel: 5 },
];

export default function AvatarCustomizer({ currentAvatar, userLevel, onSelectAvatar }: AvatarCustomizerProps) {
  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-sans font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            My Mascot Avatar Customizer 🎨
          </span>
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Level Unlocks</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-normal mb-4 font-sans">
          Select an adorable mascot avatar to represent your profile on the sidebar and leaderboards! Gain XP to unlock higher level pets.
        </p>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5 gap-3">
          {AVATARS.map((av) => {
            const isUnlocked = userLevel >= av.unlockLevel;
            const isSelected = currentAvatar === av.id;

            return (
              <button
                key={av.id}
                disabled={!isUnlocked}
                onClick={() => onSelectAvatar(av.id)}
                className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 text-center select-none ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-950/40 to-slate-950 border-cyan-400 text-cyan-100 shadow-lg shadow-cyan-950/30 scale-102 ring-1 ring-cyan-500/20'
                    : isUnlocked
                    ? 'bg-slate-900/20 border-slate-900/60 text-slate-300 hover:border-slate-700/60 hover:bg-slate-900/45 cursor-pointer'
                    : 'bg-slate-950/10 border-slate-950/40 text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                {/* Emoji badge */}
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${av.bgClass} flex items-center justify-center text-xl`}>
                  {av.emoji}
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold font-sans tracking-wide leading-none">{av.name}</span>
                  {!isUnlocked && (
                    <span className="text-[8px] font-mono text-amber-500 flex items-center gap-0.5 mt-1">
                      <Lock className="w-2 h-2" />
                      Lvl {av.unlockLevel}
                    </span>
                  )}
                </div>

                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute top-1 right-1 p-0.5 bg-cyan-400 rounded-full text-slate-950">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
