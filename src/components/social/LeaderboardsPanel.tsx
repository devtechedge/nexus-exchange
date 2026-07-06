import React from 'react';
import { motion } from 'motion/react';
import { Compass, ShieldCheck, RefreshCw, Check, TrendingUp, HelpCircle } from 'lucide-react';
import { LeaderboardTrader } from '../../types';

interface LeaderboardsPanelProps {
  traders: LeaderboardTrader[];
  balances: { [key: string]: number };
  copyAllocations: { [key: string]: number };
  allocationInput: { [key: string]: string };
  setAllocationInput: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  zkProving: boolean;
  zkProvenTraderId: string | null;
  zkProofSteps: string[];
  handleCopyAllocate: (traderId: string) => void;
  handleCopyWithdraw: (traderId: string) => void;
  executeZkProof: (traderId: string) => void;
}

export default function LeaderboardsPanel({
  traders,
  balances,
  copyAllocations,
  allocationInput,
  setAllocationInput,
  zkProving,
  zkProvenTraderId,
  zkProofSteps,
  handleCopyAllocate,
  handleCopyWithdraw,
  executeZkProof
}: LeaderboardsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Secret High-Score Leaderboards */}
      <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400 animate-pulse" />
              Secret High-Score Leaderboard
              <span className="text-[10px] text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/30">
                ZK-Proven Returns
              </span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">REAL-TIME MATHEMATICALLY GUARANTEED</span>
          </div>

          <p className="text-xs text-slate-400 mb-5 leading-relaxed font-sans">
            Here are our top traders proving their growth scores using magic cryptography. They don't have to show their full bank accounts or identity to prove they are winners!
          </p>

          <div className="space-y-4">
            {traders.map((trader, i) => (
              <div 
                key={trader.id}
                className="p-4 bg-slate-900/30 hover:bg-slate-900/50 border border-slate-900 rounded-xl transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-400">#{i + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-white">{trader.alias}</span>
                      {trader.isZkVerified ? (
                        <span className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/45 border border-emerald-900/50 px-1.5 py-0.5 rounded">
                          <Check className="w-2.5 h-2.5" />
                          ZK MAGIC PROVEN
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-950/40 border border-slate-900/40 px-1.5 py-0.5 rounded">
                          NOT PROVEN YET
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-sans text-slate-400 mt-1">
                      Rank Status: <span className="text-slate-300 font-mono">{trader.level}</span> • Followers Copying: <span className="text-cyan-400 font-bold">{trader.copiersCount}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-900 pt-3.5 md:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">Verified Growth</p>
                    <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">+{trader.verifiedRoi}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!trader.isZkVerified ? (
                      <button
                        id={`btn-zk-verify-${trader.id}`}
                        onClick={() => executeZkProof(trader.id)}
                        className="px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-900/50 hover:border-cyan-400 text-cyan-400 text-[10px] font-mono rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Prove with Math
                      </button>
                    ) : (
                      <div className="px-2 py-1.5 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 text-[10px] rounded-lg font-mono">
                        Verified ✓
                      </div>
                    )}
                    <button
                      id={`btn-copy-allocate-trigger-${trader.id}`}
                      onClick={() => {
                        const input = document.getElementById(`copy-alloc-input-${trader.id}`);
                        if (input) {
                          input.scrollIntoView({ behavior: 'smooth' });
                          input.focus();
                        }
                      }}
                      className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-[10px] font-mono rounded-lg transition cursor-pointer shrink-0"
                    >
                      Copy Setup
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zero-Knowledge Proof Demonstrator Console */}
        {zkProvenTraderId && (
          <div className="mt-6 p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[10px] space-y-2">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-cyan-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ZK-SNARK PROVING MACHINE ACTIVE
              </span>
              <span className="text-slate-500">STATUS: {zkProving ? 'CRUNCHING NUMBERS...' : 'COMPLETED SUCCESSFULLY'}</span>
            </div>
            <div className="space-y-1 text-slate-400 max-h-40 overflow-y-auto">
              {zkProofSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="text-cyan-500">❯</span>
                  <span>{step}</span>
                </div>
              ))}
              {zkProving && (
                <div className="flex items-center gap-1 text-cyan-400 animate-pulse mt-1">
                  <span className="animate-spin mr-1">⚡</span>
                  Generating mathematical magic proof over BN254 Elliptic Curve...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Copy-Allocation Pool Control */}
      <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Set-and-Forget Copy-Trading
          </h3>
          <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
            Copy verified traders automatically. Your funds are split proportionally based on their personal portfolio setup (weights) instantly!
          </p>
        </div>

        <div className="space-y-5">
          {traders.map((trader) => {
            const currentAlloc = copyAllocations[trader.id] || 0;
            return (
              <div key={trader.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{trader.alias}</span>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block">MY COPIED FUNDS</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">${currentAlloc.toFixed(2)} USDC</span>
                  </div>
                </div>

                {/* Proportional asset weights visualization */}
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">Portfolio Setup Weights:</span>
                  <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-950 mt-1.5 border border-slate-900">
                    {Object.entries(trader.portfolioDistribution).map(([symbol, pct], idx) => {
                      const colors = ['bg-cyan-500', 'bg-blue-500', 'bg-emerald-500', 'bg-pink-500', 'bg-indigo-500'];
                      return (
                        <div 
                          key={symbol}
                          style={{ width: `${pct}%` }}
                          className={`${colors[idx % colors.length]} h-full relative group`}
                        >
                          <div className="absolute hidden group-hover:block bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-950 border border-slate-800 text-[8px] font-mono px-1 py-0.5 rounded text-white z-20">
                            {symbol}: {pct}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {Object.entries(trader.portfolioDistribution).map(([symbol, pct]) => (
                      <span key={symbol} className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        {symbol}: {pct}%
                      </span>
                    ))}
                  </div>
                </div>

                {/* Investment interface */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      id={`copy-alloc-input-${trader.id}`}
                      type="number"
                      placeholder="Amount to copy"
                      value={allocationInput[trader.id] || ''}
                      onChange={(e) => setAllocationInput(prev => ({ ...prev, [trader.id]: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-900/80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2.5 top-2 text-[9px] font-mono text-slate-500">USDC</span>
                  </div>
                  <button
                    id={`btn-copy-alloc-execute-${trader.id}`}
                    onClick={() => handleCopyAllocate(trader.id)}
                    className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                  >
                    Start Copying
                  </button>
                  {currentAlloc > 0 && (
                    <button
                      id={`btn-copy-alloc-liquidate-${trader.id}`}
                      onClick={() => handleCopyWithdraw(trader.id)}
                      className="px-2.5 py-1.5 bg-red-950/20 border border-red-900/40 hover:border-red-500 text-red-400 text-xs font-mono rounded-lg transition cursor-pointer"
                    >
                      Stop & Refund
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
