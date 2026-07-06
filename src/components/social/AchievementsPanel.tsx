import React from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles, Lock } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  icon: React.ComponentType<any>;
}

interface AchievementsPanelProps {
  achievements: Achievement[];
  activeTheme: 'cyan' | 'green';
  toggleTheme: (theme: 'cyan' | 'green') => void;
  isZkUnlocked: boolean;
  feeDiscount: number;
  applyFeeCoupon: () => void;
}

export default function AchievementsPanel({
  achievements,
  activeTheme,
  toggleTheme,
  isZkUnlocked,
  feeDiscount,
  applyFeeCoupon
}: AchievementsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Achievements Milestones Grid */}
      <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Super-Cool Achievement Badges & Milestones
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Try out different advanced features on the exchange to claim cute digital badges, unlock colorful app themes, and earn global trading discount coupons!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div 
                key={ach.id}
                className={`p-4 border rounded-xl transition flex gap-3.5 items-start ${
                  ach.unlocked 
                    ? 'bg-slate-900/40 border-slate-800' 
                    : 'bg-slate-950/20 border-slate-900/40 opacity-50'
                }`}
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  ach.unlocked 
                    ? 'bg-slate-950 border-cyan-500/30 text-cyan-400' 
                    : 'bg-slate-950/40 border-slate-900 text-slate-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{ach.title}</span>
                    {ach.unlocked ? (
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/45 px-1.5 py-0.5 rounded leading-none">
                        UNLOCKED! 🎉
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono text-slate-500 bg-slate-950/40 border border-slate-900/40 px-1.5 py-0.5 rounded leading-none">
                        LOCKED 🔒
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{ach.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secret Treasure Vault */}
      <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            My Secret Treasure Vault
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Redeem rewards, toggle customized visual themes, and activate coupon discounts secured during your trading journey.
          </p>
        </div>

        <div className="space-y-4">
          {/* Accent customization */}
          <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">EXCLUSIVE APP COLOR THEMES</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="theme-btn-cyan"
                onClick={() => toggleTheme('cyan')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition cursor-pointer text-center ${
                  activeTheme === 'cyan' 
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400' 
                    : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Cool Hyper Cyan (Default)
              </button>
              <button
                id="theme-btn-green"
                onClick={() => toggleTheme('green')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                  activeTheme === 'green' 
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' 
                    : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {!isZkUnlocked && <Lock className="w-3 h-3 text-slate-600" />}
                Glowy Cyber-Green
              </button>
            </div>
            {!isZkUnlocked && (
              <span className="text-[9px] font-sans text-amber-500/80 block leading-normal">
                💡 Glowy Cyber-Green requires completing the "Math Wizard (ZK Proof Champion)" badge to unlock!
              </span>
            )}
          </div>

          {/* Global Fee Discount coupon unlocker */}
          <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">MY FEE CUTTERS</span>
            <div className="flex items-center justify-between gap-3">
              <div className="text-left flex-1">
                <span className="text-xs font-bold text-white block">Super 20% Fee-Discount Ticket</span>
                <span className="text-[9px] text-slate-400 leading-normal block mt-0.5">Redeem to shave 20% off all exchange delivery fees instantly!</span>
              </div>

              <button
                id="btn-apply-fee-discount"
                onClick={applyFeeCoupon}
                disabled={feeDiscount > 0}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer shrink-0 ${
                  feeDiscount > 0
                    ? 'bg-emerald-950/20 border border-emerald-900/45 text-emerald-400 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950'
                }`}
              >
                {feeDiscount > 0 ? 'Ticket Activated! 🎟️' : 'Claim My 20% Discount'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
