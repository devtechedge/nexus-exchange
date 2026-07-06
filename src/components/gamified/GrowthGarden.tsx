import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Sprout, Leaf } from 'lucide-react';

interface GrowthGardenProps {
  stakedBalances: { [key: string]: number };
}

interface PlantType {
  symbol: string;
  name: string;
  sproutEmoji: string;
  flowerEmoji: string;
  treeEmoji: string;
  colorClass: string;
  bgClass: string;
}

const PLANT_TYPES: PlantType[] = [
  { symbol: 'SOL', name: 'Cyan Clover', sproutEmoji: '🌱', flowerEmoji: '🍀', treeEmoji: '🌲', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-950/20 border-cyan-900/30' },
  { symbol: 'ETH', name: 'Ether Orchid', sproutEmoji: '🌱', flowerEmoji: '🌸', treeEmoji: '🌳', colorClass: 'text-purple-400', bgClass: 'bg-purple-950/20 border-purple-900/30' },
  { symbol: 'LINK', name: 'Oracle Vine', sproutEmoji: '🌱', flowerEmoji: '🌿', treeEmoji: '🎋', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-950/20 border-emerald-900/30' },
  { symbol: 'DOT', name: 'Polka-Lotus', sproutEmoji: '🌱', flowerEmoji: '🌷', treeEmoji: '🍄', colorClass: 'text-rose-400', bgClass: 'bg-rose-950/20 border-rose-900/30' },
];

export default function GrowthGarden({ stakedBalances }: GrowthGardenProps) {
  return (
    <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-900/80 pb-3">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <h4 className="text-xs font-sans font-bold text-slate-200">My Staking Growth Garden 🌱</h4>
            <p className="text-[10px] text-slate-400 font-sans">Lock your coins into rewards pools to grow virtual seeds into compounding profit trees!</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-900/30 rounded-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 animate-spin" />
            Photosynthesis Compounding: ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {PLANT_TYPES.map((plant) => {
          const staked = stakedBalances[plant.symbol] || 0;
          
          let growthStage: 'empty' | 'sprout' | 'bloom' | 'forest' = 'empty';
          let displayEmoji = '🫘';
          let statusText = 'Planting Bed';

          if (staked > 0 && staked < 1) {
            growthStage = 'sprout';
            displayEmoji = plant.sproutEmoji;
            statusText = 'Baby Sprout';
          } else if (staked >= 1 && staked <= 10) {
            growthStage = 'bloom';
            displayEmoji = plant.flowerEmoji;
            statusText = 'Blooming Flower';
          } else if (staked > 10) {
            growthStage = 'forest';
            displayEmoji = plant.treeEmoji;
            statusText = 'Golden Legend Tree';
          }

          return (
            <div
              key={plant.symbol}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-between text-center relative overflow-hidden transition-all duration-300 ${
                growthStage !== 'empty'
                  ? `${plant.bgClass} shadow-inner`
                  : 'bg-slate-900/10 border-slate-900/50'
              }`}
            >
              {/* Decorative soil plot ring */}
              <div className="absolute bottom-2 w-16 h-4 bg-amber-950/20 rounded-full border border-amber-900/10 blur-xs" />

              <div className="w-full flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-slate-500 font-bold">{plant.symbol} Plot</span>
                <span className={`text-[8px] font-sans font-bold uppercase px-1.5 py-0.5 rounded ${
                  growthStage === 'forest'
                    ? 'bg-amber-900/30 text-amber-400'
                    : growthStage === 'bloom'
                    ? 'bg-emerald-900/30 text-emerald-400'
                    : growthStage === 'sprout'
                    ? 'bg-cyan-900/30 text-cyan-400'
                    : 'bg-slate-950 text-slate-500'
                }`}>
                  {statusText}
                </span>
              </div>

              {/* Plant visual sway animation using Framer Motion */}
              <div className="my-3.5 h-16 flex items-center justify-center relative">
                {growthStage === 'empty' ? (
                  <div className="flex flex-col items-center gap-1 select-none">
                    <span className="text-2xl opacity-60">🫘</span>
                    <span className="text-[8px] font-sans text-slate-500">Seeds in bag</span>
                  </div>
                ) : (
                  <motion.div
                    animate={{ 
                      rotate: [-2, 2, -2],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 4, 
                      ease: 'easeInOut' 
                    }}
                    className="text-4xl filter drop-shadow-md select-none relative flex items-center justify-center"
                  >
                    <span>{displayEmoji}</span>
                    {growthStage === 'forest' && (
                      <div className="absolute inset-[-6px] rounded-full bg-amber-400/5 animate-pulse" />
                    )}
                  </motion.div>
                )}

                {/* Floating sparkles for active growing trees */}
                {growthStage === 'forest' && (
                  <motion.div
                    animate={{ y: [-10, -25], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                    className="absolute text-[10px] text-amber-400"
                  >
                    ✨
                  </motion.div>
                )}
              </div>

              <div className="w-full space-y-0.5 z-10">
                {growthStage === 'empty' ? (
                  <>
                    <span className="text-[10px] font-sans font-medium text-slate-400 block">No staked seeds</span>
                    <span className="text-[8px] font-sans text-slate-500 leading-tight block">Deposit {plant.symbol} to grow rewards</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-mono font-bold text-white block">
                      {staked.toFixed(4)} {plant.symbol}
                    </span>
                    <span className="text-[8px] font-sans text-slate-400 block">
                      compounding daily 🌱
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
