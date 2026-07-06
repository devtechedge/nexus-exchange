import React from 'react';
import { motion } from 'motion/react';
import { Coins, ThumbsUp, Sparkles, Check, Users, Zap } from 'lucide-react';
import { TradeSignalStrategy, SovereignGuild } from '../../types';

interface SignalsPanelProps {
  strategies: TradeSignalStrategy[];
  balances: { [key: string]: number };
  guilds: SovereignGuild[];
  guildDepositInput: { [key: string]: string };
  setGuildDepositInput: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleSubscribeSignal: (stratId: string) => void;
  handleUpvoteStrategy: (stratId: string) => void;
  handleGuildDeposit: (guildId: string) => void;
  handleVoteProposal: (guildId: string, vote: 'yes' | 'no') => void;
}

export default function SignalsPanel({
  strategies,
  balances,
  guilds,
  guildDepositInput,
  setGuildDepositInput,
  handleSubscribeSignal,
  handleUpvoteStrategy,
  handleGuildDeposit,
  handleVoteProposal
}: SignalsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Recipe Alert Shop */}
      <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Coins className="w-4 h-4 text-cyan-400" />
            Trading Idea & Recipe Shop (Alert Subscriptions)
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Subscribe to automatic alerts and clever technical recipes built by experienced analysts. Paid safely and easily using native exchange utility tokens (<strong>NEX</strong>).
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {strategies.map((strat) => (
            <div key={strat.id} className="p-5 bg-slate-900/30 border border-slate-900 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white">{strat.title}</span>
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-900">
                      Vibe Accuracy: {strat.accuracy}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">
                    Created by: <span className="font-mono text-slate-400">{strat.provider}</span> • Trust Score: <span className="text-cyan-400 font-mono font-bold">{strat.reputationLevel}</span>
                  </p>
                </div>

                {/* Reputational upvoting tracker */}
                <div className="flex items-center gap-2.5">
                  <button
                    id={`btn-upvote-${strat.id}`}
                    onClick={() => handleUpvoteStrategy(strat.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-lg text-[10px] font-mono text-slate-300 transition cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{strat.upvotes} Upvotes</span>
                  </button>
                  <div className="px-2 py-1 bg-slate-950 border border-slate-900 rounded-lg text-right">
                    <span className="text-[8px] text-slate-500 block leading-none font-mono">TRUST GRADE</span>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">{strat.reputationScore.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 border border-transparent border-l-cyan-500/30 pl-3 py-1 font-sans">
                {strat.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Alert Fee:</span>
                  <span className="text-xs font-bold font-mono text-cyan-400">{strat.priceNex} NEX</span>
                  <span className="text-[9px] text-slate-500 font-sans">/ month</span>
                </div>

                <button
                  id={`btn-sub-signal-${strat.id}`}
                  onClick={() => handleSubscribeSignal(strat.id)}
                  disabled={strat.isSubscribed}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    strat.isSubscribed
                      ? 'bg-emerald-950/30 border border-emerald-900/60 text-emerald-400 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950'
                  }`}
                >
                  {strat.isSubscribed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Alerts Active ✓
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Subscribe to Alerts
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Guild Co-Op Portfolios */}
      <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400 animate-pulse" />
            Shared Co-Op Accounts (Guilds)
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Pool cash together with friends or online co-ops to manage a combined group treasury. All decisions are approved democratically by voting circles!
          </p>
        </div>

        <div className="space-y-6">
          {guilds.map((guild) => (
            <div key={guild.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{guild.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">Members: {guild.membersCount}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">MY POOLED FUNDS</span>
                  <span className="text-xs font-bold font-mono text-cyan-400">${guild.userShare.toFixed(2)} USDC</span>
                </div>
              </div>

              {/* Proportional asset weights */}
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Group Investment Split:</span>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {Object.entries(guild.consensusDistribution).map(([symbol, pct]) => (
                    <span key={symbol} className="text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded">
                      {symbol}: {pct}%
                    </span>
                  ))}
                </div>
              </div>

              {/* Deposit controller */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-900/80">
                <div className="relative flex-1">
                  <input
                    id={`guild-dep-input-${guild.id}`}
                    type="number"
                    placeholder="Add USDC to Group"
                    value={guildDepositInput[guild.id] || ''}
                    onChange={(e) => setGuildDepositInput(prev => ({ ...prev, [guild.id]: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-900/80"
                  />
                  <span className="absolute right-2.5 top-2 text-[9px] font-mono text-slate-500">USDC</span>
                </div>
                <button
                  id={`btn-guild-dep-${guild.id}`}
                  onClick={() => handleGuildDeposit(guild.id)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-white font-mono rounded-lg transition cursor-pointer"
                >
                  Deposit
                </button>
              </div>

              {/* Consensus allocation proposals */}
              {guild.activeProposal && (
                <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
                    <Zap className="w-3.5 h-3.5 animate-pulse" />
                    <span>PENDING GROUP ALLOCATION DECISION</span>
                  </div>
                  <p className="text-xs font-semibold text-white">{guild.activeProposal.title}</p>
                  <p className="text-[10px] font-sans text-slate-400 leading-relaxed">
                    <strong>What we want to do:</strong> {guild.activeProposal.proposedAction}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-900/80 pt-2 text-[9px] font-mono">
                    <span className="text-slate-500">Time Left to Vote: {guild.activeProposal.expiresAt}</span>
                    <span className="text-slate-300">
                      Yes Votes: {guild.activeProposal.votesYes} • No Votes: {guild.activeProposal.votesNo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-vote-yes-${guild.id}`}
                      onClick={() => handleVoteProposal(guild.id, 'yes')}
                      disabled={!!guild.activeProposal.userVoted}
                      className={`flex-1 py-1 text-[10px] font-mono rounded transition cursor-pointer ${
                        guild.activeProposal.userVoted === 'yes'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                          : 'bg-slate-900 hover:bg-emerald-950/40 hover:text-emerald-400 text-slate-300 border border-slate-800'
                      }`}
                    >
                      Vote YES (Approve)
                    </button>
                    <button
                      id={`btn-vote-no-${guild.id}`}
                      onClick={() => handleVoteProposal(guild.id, 'no')}
                      disabled={!!guild.activeProposal.userVoted}
                      className={`flex-1 py-1 text-[10px] font-mono rounded transition cursor-pointer ${
                        guild.activeProposal.userVoted === 'no'
                          ? 'bg-red-950 text-red-400 border border-red-900'
                          : 'bg-slate-900 hover:bg-red-950/40 hover:text-red-400 text-slate-300 border border-slate-800'
                      }`}
                    >
                      Vote NO (Reject)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
