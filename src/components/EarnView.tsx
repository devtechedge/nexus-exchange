import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Coins, 
  ArrowUpRight, 
  Lock, 
  Unlock, 
  Info,
  Award,
  Zap,
  Sparkles
} from 'lucide-react';
import { Asset, Transaction } from '../types';

interface EarnViewProps {
  assets: Asset[];
  balances: { [key: string]: number };
  stakedBalances: { [key: string]: number };
  onStake: (symbol: string, amount: number) => void;
  onUnstake: (symbol: string, amount: number) => void;
}

const APY_RATES: { [key: string]: number } = {
  SOL: 6.85,
  ETH: 4.25,
  LINK: 5.50,
  DOT: 11.40,
};

export default function EarnView({ assets, balances, stakedBalances, onStake, onUnstake }: EarnViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('SOL');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakeAction, setStakeAction] = useState<'stake' | 'unstake'>('stake');
  const [error, setError] = useState('');

  // Local storage of simulated accrued rewards
  const [accruedRewards, setAccruedRewards] = useState<{ [key: string]: number }>({
    SOL: 0.002841,
    ETH: 0.000724,
    LINK: 0.014291,
    DOT: 0.185293,
  });

  // Selected asset
  const selectedAsset = useMemo(() => {
    return assets.find(a => a.symbol === selectedSymbol) || assets[0];
  }, [assets, selectedSymbol]);

  const selectedAPY = APY_RATES[selectedSymbol] || 0;

  // Real-time ticking rewards logic
  // Update accrued rewards every 100ms based on staked amount
  useEffect(() => {
    const interval = setInterval(() => {
      setAccruedRewards((prev) => {
        const next = { ...prev };
        Object.keys(APY_RATES).forEach((symbol) => {
          const staked = stakedBalances[symbol] || 0;
          if (staked > 0) {
            // APY per second = APY / 100 / (365 * 24 * 3600)
            const rewardPerSecond = staked * (APY_RATES[symbol] / 100) / (365 * 24 * 3600);
            const rewardIn100ms = rewardPerSecond * 0.1;
            next[symbol] = (next[symbol] || 0) + rewardIn100ms;
          }
        });
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stakedBalances]);

  // Form submission handlers
  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (stakeAction === 'stake') {
      const amt = parseFloat(stakeAmount);
      if (!amt || amt <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const available = balances[selectedSymbol] || 0;
      if (amt > available) {
        setError(`Insufficient available balance. You have ${available.toFixed(4)} ${selectedSymbol}`);
        return;
      }

      onStake(selectedSymbol, amt);
      setStakeAmount('');
    } else {
      const amt = parseFloat(unstakeAmount);
      if (!amt || amt <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const staked = stakedBalances[selectedSymbol] || 0;
      if (amt > staked) {
        setError(`Insufficient staked balance. You only have ${staked.toFixed(4)} ${selectedSymbol} staked`);
        return;
      }

      onUnstake(selectedSymbol, amt);
      setUnstakeAmount('');
    }
  };

  const handleMaxClick = () => {
    if (stakeAction === 'stake') {
      const val = balances[selectedSymbol] || 0;
      setStakeAmount(val.toString());
    } else {
      const val = stakedBalances[selectedSymbol] || 0;
      setUnstakeAmount(val.toString());
    }
  };

  // Total staked USD valuation
  const totalStakedValuation = useMemo(() => {
    let sum = 0;
    Object.keys(stakedBalances).forEach((symbol) => {
      const asset = assets.find(a => a.symbol === symbol);
      if (asset) {
        sum += stakedBalances[symbol] * asset.price;
      }
    });
    return sum;
  }, [stakedBalances, assets]);

  return (
    <div className="space-y-6">
      {/* Dynamic Staking Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Staked Valuation */}
        <div id="earn-stat-staked" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Active Stake</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-sans font-bold text-white tracking-tight">
              ${totalStakedValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-mono text-slate-500 mt-1.5">Compounding yields passively</p>
          </div>
        </div>

        {/* Global Average APY */}
        <div id="earn-stat-apy" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Average Protocol APY</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-sans font-bold text-slate-200 tracking-tight">
              6.99% APY
            </h3>
            <p className="text-[10px] font-mono text-slate-500 mt-1.5">Max yields up to 11.40% (DOT)</p>
          </div>
        </div>

        {/* Real-time Accumulated Rewards Ticker */}
        <div id="earn-stat-ticker" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md border-cyan-900/30 shadow-lg shadow-cyan-950/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Accrued Rewards Ledger</span>
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="mt-4 relative z-10">
            <div className="space-y-1">
              {Object.keys(accruedRewards).map((symbol) => {
                const isEarning = (stakedBalances[symbol] || 0) > 0;
                return (
                  <div key={symbol} className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">{symbol} Earned</span>
                    <span className={`font-semibold ${isEarning ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {accruedRewards[symbol].toFixed(8)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pools & Interactive Forms Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Available Pools (7 cols) */}
        <div className="lg:col-span-7 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-5">
            <span className="text-xs font-sans font-semibold text-slate-300">Flexible Yield Staking Pools</span>
            <Coins className="w-4 h-4 text-slate-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(APY_RATES).map((symbol) => {
              const asset = assets.find(a => a.symbol === symbol);
              const apy = APY_RATES[symbol];
              const isSelected = selectedSymbol === symbol;
              const stakedAmount = stakedBalances[symbol] || 0;
              const isStaked = stakedAmount > 0;

              if (!asset) return null;

              return (
                <button
                  id={`stake-pool-${symbol}`}
                  key={symbol}
                  onClick={() => { setSelectedSymbol(symbol); setError(''); }}
                  className={`p-4 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-900 border-cyan-500/50 shadow-md' 
                      : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-sans font-bold text-white tracking-wider">{symbol}</span>
                      <span className="text-[10px] font-sans text-slate-500">{asset.name}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 rounded-lg text-[10px] font-mono font-bold">
                      {apy.toFixed(2)}% APY
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>In Wallet:</span>
                      <span className="text-slate-300">{(balances[symbol] || 0).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Currently Staked:</span>
                      <span className={`${isStaked ? 'text-teal-400 font-bold' : 'text-slate-500'}`}>
                        {stakedAmount.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {isStaked && (
                    <div className="mt-3 pt-2 border-t border-slate-900 flex items-center gap-1.5 text-[10px] font-mono text-emerald-500">
                      <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                      Yield compounding live
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex items-start gap-3 text-xs text-slate-400 font-sans leading-relaxed">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300">Dynamic Instant Unstaking</p>
              <p className="mt-1 font-mono text-[11px] text-slate-400">All Nexus staking pools support 100% liquid withdrawals with no locking epoch thresholds. Unstake your funds anytime instantly without paying transaction clawback fees.</p>
            </div>
          </div>
        </div>

        {/* Right: Stake/Unstake Form (5 cols) */}
        <div id="staking-form-card" className="lg:col-span-5 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <form onSubmit={handleStakeSubmit} className="space-y-4">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-900">
              <button
                id="stake-action-lock"
                type="button"
                onClick={() => { setStakeAction('stake'); setError(''); }}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  stakeAction === 'stake' ? 'bg-slate-800 text-cyan-400 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                STAKE {selectedSymbol}
              </button>
              <button
                id="stake-action-unlock"
                type="button"
                onClick={() => { setStakeAction('unstake'); setError(''); }}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  stakeAction === 'unstake' ? 'bg-slate-800 text-cyan-400 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                UNSTAKE {selectedSymbol}
              </button>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-500 uppercase">Selected Asset</span>
                <span className="font-sans font-bold text-white tracking-wider">{selectedSymbol} Pool</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-900/50 pt-2">
                <span className="font-mono text-slate-500 uppercase">Current APY</span>
                <span className="font-mono font-bold text-emerald-400">{selectedAPY.toFixed(2)}% APY</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-900/50 pt-2">
                <span className="font-mono text-slate-500 uppercase">Available Liquid</span>
                <span className="font-mono text-slate-300">{(balances[selectedSymbol] || 0).toFixed(4)} {selectedSymbol}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-900/50 pt-2">
                <span className="font-mono text-slate-500 uppercase">Currently Staked</span>
                <span className="font-mono text-teal-400">{(stakedBalances[selectedSymbol] || 0).toFixed(4)} {selectedSymbol}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <label className="text-slate-400">{stakeAction === 'stake' ? 'Staking Amount' : 'Withdraw Staked'}</label>
                <button
                  id="stake-max-btn"
                  type="button"
                  onClick={handleMaxClick}
                  className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  Use Max
                </button>
              </div>
              <div className="relative">
                <input
                  id="stake-amount-input"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={stakeAction === 'stake' ? stakeAmount : unstakeAmount}
                  onChange={(e) => {
                    if (stakeAction === 'stake') {
                      setStakeAmount(e.target.value);
                    } else {
                      setUnstakeAmount(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-500">{selectedSymbol}</span>
              </div>
            </div>

            {error && (
              <p className="text-xs font-mono text-red-400">{error}</p>
            )}

            <button
              id="stake-submit-btn"
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-lg transition tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Award className="w-4 h-4 text-slate-950" />
              {stakeAction === 'stake' ? 'CONFIRM STAKE DEPOSIT' : 'CONFIRM STAKE WITHDRAWAL'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
