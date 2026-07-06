import React from 'react';
import { motion } from 'motion/react';
import { Flame, ShieldCheck, CheckCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface MacroPanelProps {
  heatmapMetric: 'positions' | 'liquidations';
  setHeatmapMetric: (metric: 'positions' | 'liquidations') => void;
  macroHeatmapData: { symbol: string; longPct: number; shortPct: number; exposureUsd: number; color: string }[];
  activePoolAnalysis: boolean;
  setActivePoolAnalysis: (val: boolean) => void;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
}

export default function MacroPanel({
  heatmapMetric,
  setHeatmapMetric,
  macroHeatmapData,
  activePoolAnalysis,
  setActivePoolAnalysis,
  onNotification
}: MacroPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Macro Mood Position Heatmaps */}
      <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
          <div>
            <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Flame className="w-4 h-4 text-cyan-400" />
              Traders' Crowd Mood Heatmaps
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Find out where other traders are placing their bets! This visual ledger aggregates long bets (pricing goes up) versus short bets (pricing goes down) anonymously.
            </p>
          </div>

          <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
            <button
              id="heatmap-btn-positions"
              onClick={() => setHeatmapMetric('positions')}
              className={`px-3 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                heatmapMetric === 'positions' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400'
              }`}
            >
              Betting Sizes
            </button>
            <button
              id="heatmap-btn-liquidations"
              onClick={() => setHeatmapMetric('liquidations')}
              className={`px-3 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                heatmapMetric === 'liquidations' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400'
              }`}
            >
              Panic Price Zones
            </button>
          </div>
        </div>

        {heatmapMetric === 'positions' ? (
          <div className="space-y-6">
            {/* Aggregated distribution bars */}
            <div className="space-y-5">
              {macroHeatmapData.map((data) => (
                <div key={data.symbol} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{data.symbol} Combined Betting Stance</span>
                    <span className="text-slate-400">Total Bets: ${(data.exposureUsd / 1000000).toFixed(1)}M USDC</span>
                  </div>

                  {/* Dual bar representing long/short exposure % */}
                  <div className="flex h-5 w-full rounded-lg overflow-hidden border border-slate-900 font-mono text-[9px] font-bold">
                    <div 
                      style={{ width: `${data.longPct}%` }}
                      className="bg-cyan-500 text-slate-950 flex items-center justify-start pl-3 shadow-inner"
                    >
                      BETS UP (Long) {data.longPct}%
                    </div>
                    <div 
                      style={{ width: `${data.shortPct}%` }}
                      className="bg-rose-500 text-slate-950 flex items-center justify-end pr-3 shadow-inner"
                    >
                      {data.shortPct}% BETS DOWN (Short)
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Horizontal Bar Chart representation */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macroHeatmapData} layout="vertical">
                  <XAxis type="number" stroke="#334155" fontSize={9} />
                  <YAxis dataKey="symbol" type="category" stroke="#334155" fontSize={9} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelClassName="text-slate-400 font-mono text-[9px]"
                  />
                  <Bar dataKey="exposureUsd" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Total Active Bets" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-xs text-slate-400 leading-relaxed">
              A high-precision visual radar scanning open emergency exit orders and coin trigger levels to point out key price marks where massive chain liquidations (forced sell-offs) could occur.
            </p>

            {/* Visual coordinate-density heatmap blocks */}
            <div className="p-6 bg-slate-950/80 border border-slate-900 rounded-xl relative overflow-hidden h-64 flex items-center justify-center">
              <div className="absolute inset-0 bg-slate-950 grid grid-cols-10 grid-rows-10 gap-0.5 opacity-30">
                {Array.from({ length: 100 }).map((_, i) => {
                  const density = (Math.sin(i * 0.15) * 50) + 50;
                  const colorClass = 
                    density > 80 ? 'bg-rose-500/30' :
                    density > 60 ? 'bg-amber-500/20' :
                    density > 40 ? 'bg-cyan-500/10' : 'bg-transparent';
                  return <div key={i} className={`h-full w-full ${colorClass}`} />;
                })}
              </div>

              <div className="z-10 text-center space-y-3 max-w-sm">
                <Flame className="w-8 h-8 text-rose-500 mx-auto animate-bounce" />
                <span className="text-xs font-mono font-bold text-white block">VOLATILITY PANIC CHAINS LOCATED</span>
                <p className="text-[10px] font-sans text-slate-400 leading-normal">
                  Heavy crowds are parked near Solana $138.50 and Ethereum $3,180. If prices slide to these zones, severe price cascades might trigger!
                </p>
                <button
                  id="btn-trigger-pool-analysis"
                  onClick={() => {
                    setActivePoolAnalysis(true);
                    onNotification('info', 'Analyzing price density... High-density short clusters scanned.');
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 font-mono rounded-lg transition"
                >
                  Deep Scan Clustered Densities
                </button>
              </div>
            </div>

            {activePoolAnalysis && (
              <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl font-mono text-[9px] text-slate-400 space-y-1">
                <div className="text-cyan-400 font-bold mb-1 uppercase tracking-wider">CROWD PANIC TELEMETRY MATRIX ACTIVE</div>
                <div>❯ Segment SOL-Spot: Dense cluster found at price $135.50 (85% betting UP / support)</div>
                <div>❯ Segment SOL-Spot: Dense cluster found at price $146.80 (91% betting DOWN / resistance)</div>
                <div>❯ Segment ETH-Spot: Dense cluster found at price $3,180.00 (74% betting UP / support)</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick platform privacy facts panel */}
      <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Decentralized Privacy Rules
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Privacy is our absolute prime directive. All community charts and numbers represent pooled anonymous metrics to shield your personal balance.
          </p>
        </div>

        <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3 text-xs font-sans">
          <div className="flex items-start gap-2 text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Combined metrics are delayed by exactly 3 minutes to stop malicious bots from copy-frontrunning you.</span>
          </div>
          <div className="flex items-start gap-2 text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Compiled safely using off-chain cryptography across independent network validator computers.</span>
          </div>
          <div className="flex items-start gap-2 text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Unlock advanced panic zones once you achieve the ZK-Sovereign math badge.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
