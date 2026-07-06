import React from 'react';
import { motion } from 'motion/react';
import { GitFork, Sliders, Play, RefreshCw } from 'lucide-react';

interface PingResult {
  endpoint: string;
  latency: number;
  status: number;
  message: string;
  state: 'success' | 'warn' | 'error';
}

interface SandboxPanelProps {
  isSandboxActive: boolean;
  isForkingProgress: boolean;
  forkLogs: string[];
  sandboxBalances: { SOL: number; ETH: number; USDC: number };
  handleTriggerFork: () => void;
  handleUpdateSandboxBalance: (asset: 'SOL' | 'ETH' | 'USDC', delta: number) => void;
  setSandboxBalances: React.Dispatch<React.SetStateAction<{ SOL: number; ETH: number; USDC: number }>>;
  latencyMs: number;
  setLatencyMs: (val: number) => void;
  rateLimitProb: number;
  setRateLimitProb: (val: number) => void;
  packetLossPct: number;
  setPacketLossPct: (val: number) => void;
  isPingTesting: boolean;
  handleRunPingSpeedTest: () => void;
  pingTestResults: PingResult[];
}

export default function SandboxPanel({
  isSandboxActive,
  isForkingProgress,
  forkLogs,
  sandboxBalances,
  handleTriggerFork,
  handleUpdateSandboxBalance,
  setSandboxBalances,
  latencyMs,
  setLatencyMs,
  rateLimitProb,
  setRateLimitProb,
  packetLossPct,
  setPacketLossPct,
  isPingTesting,
  handleRunPingSpeedTest,
  pingTestResults
}: SandboxPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Sandbox forking (Left) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="border-b border-slate-900 pb-3 mb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                <GitFork className="w-4 h-4 text-cyan-400 animate-pulse" />
                Practice Safe Sandbox (Simulated Cloning)
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Clone a private copy of the exchange to run bot trading practice sessions safely.</p>
            </div>

            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${
              isSandboxActive ? 'bg-cyan-950 text-cyan-400 border-cyan-800' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              {isSandboxActive ? 'SANDBOX ACTIVE' : 'REAL MONEY MODE'}
            </span>
          </div>

          {/* Ledger balances comparison */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 bg-slate-900/10 border border-slate-900 rounded-2xl mb-5">
            <div className="space-y-2">
              <span className="text-[9px] text-slate-500 block uppercase">My Real Coins</span>
              <div className="space-y-1">
                <div className="flex justify-between"><span>SOL:</span><span className="text-slate-400">12.00</span></div>
                <div className="flex justify-between"><span>ETH:</span><span className="text-slate-400">1.45</span></div>
                <div className="flex justify-between"><span>USDC:</span><span className="text-slate-400">14,842</span></div>
              </div>
            </div>

            <div className="space-y-2 border-l border-slate-900 pl-4">
              <span className="text-[9px] text-cyan-400 block uppercase">My Simulated Practice Coins</span>
              {isSandboxActive ? (
                <div className="space-y-1">
                  <div className="flex justify-between"><span>SOL:</span><span className="text-cyan-400">{sandboxBalances.SOL}</span></div>
                  <div className="flex justify-between"><span>ETH:</span><span className="text-cyan-400">{sandboxBalances.ETH}</span></div>
                  <div className="flex justify-between"><span>USDC:</span><span className="text-cyan-400">{sandboxBalances.USDC.toLocaleString()}</span></div>
                </div>
              ) : (
                <p className="text-[9px] text-slate-500 italic mt-3 leading-normal">
                  Press the button below to initialize your playground balance.
                </p>
              )}
            </div>
          </div>

          {/* Inject Capital Controls */}
          {isSandboxActive && (
            <div className="mb-5 p-4 bg-cyan-950/10 border border-cyan-900/40 rounded-xl space-y-3 font-mono text-xs">
              <span className="text-[9px] text-cyan-400 uppercase font-bold block">Add Fake Sandbox Practice Cash</span>
              <div className="flex gap-2">
                <button
                  id="btn-sandbox-usdc-plus"
                  onClick={() => handleUpdateSandboxBalance('USDC', 10000)}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] border border-slate-800 text-slate-300 rounded cursor-pointer transition"
                >
                  +$10,000 USDC
                </button>
                <button
                  id="btn-sandbox-sol-plus"
                  onClick={() => handleUpdateSandboxBalance('SOL', 100)}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] border border-slate-800 text-slate-300 rounded cursor-pointer transition"
                >
                  +100 SOL
                </button>
                <button
                  id="btn-reset-sandbox"
                  onClick={() => setSandboxBalances({ SOL: 100, ETH: 10, USDC: 50000 })}
                  className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-900/30 text-[10px] border border-red-900 text-red-400 rounded cursor-pointer transition"
                >
                  RESET
                </button>
              </div>
            </div>
          )}

          <button
            id="btn-fork-production"
            onClick={handleTriggerFork}
            disabled={isForkingProgress}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg transition tracking-wider cursor-pointer disabled:opacity-50"
          >
            {isForkingProgress ? 'CLONING AND FORKING REALTIME BALANCES...' : 'Fork & Launch Simulated Sandbox Playground! 🚀'}
          </button>

          {/* Fork logs */}
          {forkLogs.length > 0 && (
            <pre className="p-3 bg-slate-950 text-[9px] font-mono text-cyan-300 rounded-xl border border-slate-900 max-h-[140px] overflow-y-auto leading-relaxed mt-4">
              {forkLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </pre>
          )}
        </div>
      </div>

      {/* Latency simulation (Right) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400 animate-pulse" />
              Internet Traffic-Jam Simulator (Lag Injector)
            </h3>
            <p className="text-[10px] font-sans text-slate-400 mt-1">
              Simulate internet latency spikes, packet loss drops, and hourly transaction limits to verify that your auto-trading software stays robust during network hiccups.
            </p>
          </div>

          {/* Sliders */}
          <div className="space-y-4 p-4 bg-slate-900/10 border border-slate-900 rounded-xl font-mono text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>SIMULATED NETWORK LAG DELAY</span>
                <span className="text-indigo-400 font-bold">{latencyMs} ms</span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                value={latencyMs}
                onChange={(e) => setLatencyMs(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>API RATE-LIMIT BLOCKS (ERROR 429 PROBABILITY)</span>
                <span className="text-indigo-400 font-bold">{rateLimitProb}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={rateLimitProb}
                onChange={(e) => setRateLimitProb(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>SIMULATED PACKET CONNECTION LOSS</span>
                <span className="text-indigo-400 font-bold">{packetLossPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={packetLossPct}
                onChange={(e) => setPacketLossPct(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Test latency triggers */}
          <div className="space-y-3">
            <button
              id="btn-speed-ping-test"
              onClick={handleRunPingSpeedTest}
              disabled={isPingTesting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-mono font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              {isPingTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              Run Lag Diagnostic Speedtest ⚡
            </button>

            {/* Results Table */}
            {pingTestResults.length > 0 && (
              <div className="border border-slate-900 rounded-xl overflow-hidden font-mono text-[9px]">
                <div className="grid grid-cols-12 bg-slate-950 p-2 text-slate-500 font-bold uppercase border-b border-slate-900">
                  <span className="col-span-5">API Endpoint</span>
                  <span className="col-span-3 text-right">Injected Delay</span>
                  <span className="col-span-4 text-right">Diagnostic Feedback</span>
                </div>

                <div className="divide-y divide-slate-900">
                  {pingTestResults.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-12 p-2 items-center">
                      <span className="col-span-5 text-slate-300 font-bold">{p.endpoint}</span>
                      <span className="col-span-3 text-right text-indigo-400">{p.latency} ms</span>
                      <span className={`col-span-4 text-right font-bold ${
                        p.state === 'success' ? 'text-emerald-400' : p.state === 'warn' ? 'text-amber-400' : 'text-red-400'
                      }`}>{p.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
