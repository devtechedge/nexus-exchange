import React from 'react';
import { motion } from 'motion/react';
import { LineChart, Flame, ShieldCheck, CheckCircle } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';

interface BacktestPanelProps {
  backtestAsset: string;
  setBacktestAsset: (asset: string) => void;
  backtestStrategy: string;
  setBacktestStrategy: (strat: string) => void;
  backtestYears: number;
  setBacktestYears: (years: number) => void;
  backtestRisk: 'low' | 'medium' | 'high';
  setBacktestRisk: (risk: 'low' | 'medium' | 'high') => void;
  isBacktesting: boolean;
  backtestProgress: number;
  backtestResults: {
    roi: number;
    maxDrawdown: number;
    sharpe: number;
    winRate: number;
    tradesCount: number;
    chartData: { date: string; strategy: number; holder: number }[];
  } | null;
  runBacktest: () => void;
  sentimentValue: number;
  coupleSentiment: boolean;
  setCoupleSentiment: (val: boolean) => void;
  forumChatter: { id: string; source: string; text: string; sentiment: string; time: string }[];
}

export default function BacktestPanel({
  backtestAsset,
  setBacktestAsset,
  backtestStrategy,
  setBacktestStrategy,
  backtestYears,
  setBacktestYears,
  backtestRisk,
  setBacktestRisk,
  isBacktesting,
  backtestProgress,
  backtestResults,
  runBacktest,
  sentimentValue,
  coupleSentiment,
  setCoupleSentiment,
  forumChatter
}: BacktestPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Strategy Backtest Simulator */}
      <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <LineChart className="w-4 h-4 text-cyan-400" />
              Strategy Time-Machine Simulator
            </h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
              RUN DESIGNS AGAINST PAST DATA
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Choose a coin and a smart ruleset below, then fire up the time machine to simulate how much money you would have earned or lost using this strategy over past price history!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/20 p-4 border border-slate-900 rounded-xl mb-6">
            <div>
              <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Choose Crypto</label>
              <select
                id="select-backtest-asset"
                value={backtestAsset}
                onChange={(e) => setBacktestAsset(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="SOL">Solana (SOL)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="LINK">Chainlink (LINK)</option>
                <option value="DOT">Polkadot (DOT)</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Trading Strategy</label>
              <select
                id="select-backtest-strategy"
                value={backtestStrategy}
                onChange={(e) => setBacktestStrategy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="EMA-Cross">Trend-Seeker Rules</option>
                <option value="Mean-Reversion">Rubber-Band Bounce Back</option>
                <option value="Grid-Arbitrage">Auto Price-Grid Harvester</option>
                <option value="Momentum">Momentum Swing Rules</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Test Period</label>
              <select
                id="select-backtest-years"
                value={backtestYears}
                onChange={(e) => setBacktestYears(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value={1}>1 Year (Recent Vibe)</option>
                <option value={3}>3 Years (Medium Cycle)</option>
                <option value={5}>5 Years (Long-term Macro)</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Risk Buffer</label>
              <select
                id="select-backtest-risk"
                value={backtestRisk}
                onChange={(e) => setBacktestRisk(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="low">Conservative (Safe)</option>
                <option value="medium">Balanced (Standard)</option>
                <option value="high">Aggressive (High-Octane)</option>
              </select>
            </div>
          </div>

          {isBacktesting ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 font-mono text-xs">
              <span className="animate-spin text-cyan-400 text-xl">⚡</span>
              <span className="text-slate-400 text-center">Consulting the historical scrolls & running strategy math over past prices...</span>
              <div className="w-48 h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${backtestProgress}%` }} className="bg-cyan-500 h-full transition-all duration-150" />
              </div>
            </div>
          ) : backtestResults ? (
            <div className="space-y-6">
              {/* Performance metrics dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 block leading-none">SIMULATED GROWTH</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 block mt-1">+{backtestResults.roi}%</span>
                </div>
                <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 block leading-none">MAXIMUM DIP</span>
                  <span className="text-sm font-bold font-mono text-red-400 block mt-1">-{backtestResults.maxDrawdown}%</span>
                </div>
                <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 block leading-none">EFFICIENCY (SHARPE)</span>
                  <span className="text-sm font-bold font-mono text-cyan-400 block mt-1">{backtestResults.sharpe}</span>
                </div>
                <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 block leading-none">WINNING TRADES</span>
                  <span className="text-sm font-bold font-mono text-slate-200 block mt-1">{backtestResults.winRate}%</span>
                </div>
                <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl col-span-2 md:col-span-1">
                  <span className="text-[9px] font-mono text-slate-500 block leading-none">TOTAL TRADES</span>
                  <span className="text-sm font-bold font-mono text-slate-200 block mt-1">{backtestResults.tradesCount} rounds</span>
                </div>
              </div>

              {/* Backtest curve Recharts visualization */}
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={backtestResults.chartData}>
                    <defs>
                      <linearGradient id="backtestGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#334155" fontSize={9} fontStyle="italic" />
                    <YAxis stroke="#334155" fontSize={9} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
                      labelClassName="text-slate-400 font-mono text-[9px]"
                    />
                    <Area type="monotone" dataKey="strategy" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#backtestGrad)" name="Time-Machine Strategy Return" />
                    <Area type="monotone" dataKey="holder" stroke="#64748b" strokeWidth={1} fillOpacity={0} name="Just Holding Baseline" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Green consensus validation certificate stamp */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 block">MATHEMATICALLY GUARANTEED HISTORY LOGS</span>
                  <span className="text-[9px] font-sans text-slate-400">
                    This simulation is certified by historical price streams archived securely on our decentralized database nodes.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-900 rounded-xl px-4 text-center">
              <LineChart className="w-8 h-8 mb-2 text-slate-600 animate-bounce" />
              <span className="text-xs font-mono max-w-sm">Simulator database is ready! Configure the strategy options above and press the button below to start.</span>
            </div>
          )}
        </div>

        <div className="pt-6">
          <button
            id="btn-run-backtest"
            onClick={runBacktest}
            disabled={isBacktesting}
            className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-mono font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {isBacktesting ? 'Time Machine Processing...' : 'Fire Up the Time Machine! 🚀'}
          </button>
        </div>
      </div>

      {/* Social Sentiment Crowd Mood Gauge */}
      <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400 animate-pulse" />
            Social Mood Ingestion Gauge
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Our automated web-crawlers scan public chatrooms, forums, and crypto headlines in real-time to check if the public mood is happy (bullish) or scared (bearish).
          </p>
        </div>

        {/* Sentiment Dial Gauge */}
        <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Composite Vibe Index</span>
          <span className="text-3xl font-extrabold font-mono text-cyan-400 mt-2">{sentimentValue} / 100</span>
          
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded mt-2.5 border ${
            sentimentValue >= 70 ? 'bg-emerald-950 text-emerald-400 border-emerald-900/40' :
            sentimentValue >= 50 ? 'bg-cyan-950 text-cyan-400 border-cyan-900/40' :
            'bg-red-950 text-red-400 border-red-900/40'
          }`}>
            {sentimentValue >= 70 ? 'OVERWHELMINGLY HAPPY (Strong Bullish Vibes)' :
             sentimentValue >= 50 ? 'NEUTRAL AND CALM (Sideways)' :
             'PANICKED AND SCARED (Bearish Dip Alert)'}
          </span>

          {/* Simulated Gauge needle */}
          <div className="w-full h-1.5 bg-slate-950 border border-slate-900 rounded-full mt-6 relative">
            <div 
              style={{ left: `${sentimentValue}%` }}
              className="absolute w-3.5 h-3.5 bg-cyan-400 border border-white rounded-full -top-[5px] shadow-lg transition-all duration-300 transform -translate-x-1/2"
            />
          </div>
        </div>

        {/* Coupling Control Switch */}
        <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 block">Connect Crowd Mood to My Safety Net</span>
            <button
              id="toggle-couple-sentiment"
              onClick={() => setCoupleSentiment(!coupleSentiment)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                coupleSentiment ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  coupleSentiment ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            When turned on, if the community goes into panic-mode (Mood Score &lt; 50), your Safety Emergency Net (Stop-Loss) will automatically tighten by 0.5% to protect your wallet from sudden market crashes!
          </p>
        </div>

        {/* Live social feed ingestion */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Live Ingested Vibe Streams:</span>
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {forumChatter.map((chat) => (
              <div key={chat.id} className="p-2.5 bg-slate-900/20 border border-slate-900/40 rounded-lg text-[10px] space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-mono font-bold text-cyan-400">{chat.source}</span>
                  <span className="text-slate-500 font-mono text-[9px]">{chat.time}</span>
                </div>
                <p className="font-sans text-slate-300 leading-normal">{chat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
