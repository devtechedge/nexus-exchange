import React from 'react';
import { motion } from 'motion/react';
import { Database, Activity, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface LogItem {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  subsystem: 'Vercel Edge' | 'API Gateway' | 'Database Core' | 'Hydration';
  msg: string;
}

interface AnalyticsPanelProps {
  canvasSource: string;
  setCanvasSource: (val: string) => void;
  canvasPeriod: string;
  setCanvasPeriod: (val: string) => void;
  canvasOperator: string;
  setCanvasOperator: (val: string) => void;
  canvasFormat: string;
  setCanvasFormat: (val: string) => void;
  isQueryingCanvas: boolean;
  canvasResultsJson: string | null;
  generatedDbQuery: string;
  handleExecuteCanvasQuery: () => void;
  isLogStreamActive: boolean;
  setIsLogStreamActive: (val: boolean) => void;
  logFilter: 'ALL' | 'INFO' | 'WARN' | 'ERROR';
  setLogFilter: (val: 'ALL' | 'INFO' | 'WARN' | 'ERROR') => void;
  filteredLogs: LogItem[];
  setLogs: React.Dispatch<React.SetStateAction<LogItem[]>>;
}

const RATE_LIMIT_CHART_DATA = [
  { hour: '12:00', requests: 120, limit: 1000 },
  { hour: '13:00', requests: 240, limit: 1000 },
  { hour: '14:00', requests: 890, limit: 1000 },
  { hour: '15:00', requests: 450, limit: 1000 },
  { hour: '16:00', requests: 180, limit: 1000 },
  { hour: '17:00', requests: 210, limit: 1000 },
  { hour: '18:00', requests: 310, limit: 1000 },
  { hour: '19:00', requests: 950, limit: 1000 },
  { hour: '20:00', requests: 420, limit: 1000 },
  { hour: '21:00', requests: 150, limit: 1000 },
  { hour: '22:00', requests: 110, limit: 1000 },
  { hour: '23:00', requests: 95,  limit: 1000 },
];

export default function AnalyticsPanel({
  canvasSource,
  setCanvasSource,
  canvasPeriod,
  setCanvasPeriod,
  canvasOperator,
  setCanvasOperator,
  canvasFormat,
  setCanvasFormat,
  isQueryingCanvas,
  canvasResultsJson,
  generatedDbQuery,
  handleExecuteCanvasQuery,
  isLogStreamActive,
  setIsLogStreamActive,
  logFilter,
  setLogFilter,
  filteredLogs,
  setLogs
}: AnalyticsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Rate Limits & Historical DB query canvas (Left) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Rate limits monitor */}
        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3 border-b border-slate-900 pb-1.5">Passcode Request Rate Monitors</span>
          
          <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-4">
            <div className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl">
              <span className="text-[9px] text-slate-500 block">BANDWIDTH SPENT</span>
              <span className="text-sm font-bold text-white block mt-1">1.22 GB / 5.00 GB</span>
              <div className="w-full bg-slate-900 h-1 rounded mt-2 overflow-hidden">
                <div className="bg-cyan-500 h-full rounded" style={{ width: '24.4%' }}></div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl">
              <span className="text-[9px] text-slate-500 block">HOURLY REQUEST QUOTA</span>
              <span className="text-sm font-bold text-white block mt-1">1,432 / 5,000 requests</span>
              <div className="w-full bg-slate-900 h-1 rounded mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded" style={{ width: '28.6%' }}></div>
              </div>
            </div>
          </div>

          <div className="h-40 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RATE_LIMIT_CHART_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                <XAxis dataKey="hour" stroke="#475569" fontSize={9} />
                <YAxis stroke="#475569" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: 10, fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Database query canvas */}
        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div>
            <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-400" />
              Historical Vibe-Query Canvas (Past Prices DB)
            </h3>
            <p className="text-[10px] font-sans text-slate-400 mt-1">
              Assemble visual database blocks to automatically generate query recipes and pull old transaction logs.
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono text-[9px]">
            <div className="p-2 bg-slate-900/20 border border-slate-900 rounded-xl">
              <span className="text-[8px] text-slate-500 uppercase block mb-1">Source Stream</span>
              <select
                value={canvasSource}
                onChange={(e) => setCanvasSource(e.target.value)}
                className="bg-slate-950 text-slate-300 w-full rounded p-1 border border-slate-900"
              >
                <option value="SOL_SPOT_OHLCV">SOL Prices</option>
                <option value="ETH_SPOT_OHLCV">ETH Prices</option>
                <option value="NEX_REWARD_LEDGER">NEX Yield</option>
              </select>
            </div>

            <div className="p-2 bg-slate-900/20 border border-slate-900 rounded-xl">
              <span className="text-[8px] text-slate-500 uppercase block mb-1">Time Bucket</span>
              <select
                value={canvasPeriod}
                onChange={(e) => setCanvasPeriod(e.target.value)}
                className="bg-slate-950 text-slate-300 w-full rounded p-1 border border-slate-900"
              >
                <option value="5m">5 Min</option>
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
              </select>
            </div>

            <div className="p-2 bg-slate-900/20 border border-slate-900 rounded-xl">
              <span className="text-[8px] text-slate-500 uppercase block mb-1">Calculation</span>
              <select
                value={canvasOperator}
                onChange={(e) => setCanvasOperator(e.target.value)}
                className="bg-slate-950 text-slate-300 w-full rounded p-1 border border-slate-900"
              >
                <option value="ROLLING_VOLATILITY">Volatility</option>
                <option value="MEAN_AVERAGE">Average Price</option>
                <option value="ROLLING_SHARPE_RATIO">Sharpe Ratio</option>
              </select>
            </div>

            <div className="p-2 bg-slate-900/20 border border-slate-900 rounded-xl">
              <span className="text-[8px] text-slate-500 uppercase block mb-1">Format</span>
              <select
                value={canvasFormat}
                onChange={(e) => setCanvasFormat(e.target.value)}
                className="bg-slate-950 text-slate-300 w-full rounded p-1 border border-slate-900"
              >
                <option value="JSON_ARRAY">JSON</option>
                <option value="CSV_STREAM">CSV</option>
              </select>
            </div>
          </div>

          <pre className="p-3 bg-slate-950 text-[9px] font-mono text-cyan-400 overflow-x-auto rounded-xl border border-slate-900 mt-4 leading-relaxed">
            <code>{generatedDbQuery}</code>
          </pre>

          <div className="mt-3 flex justify-between items-center flex-wrap gap-2">
            <button
              id="btn-execute-canvas-query"
              onClick={handleExecuteCanvasQuery}
              disabled={isQueryingCanvas}
              className="px-4 py-2 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-400 font-mono font-bold text-[10px] rounded-lg cursor-pointer transition disabled:opacity-50"
            >
              {isQueryingCanvas ? <RefreshCw className="w-3 h-3 animate-spin mr-1 inline" /> : null}
              Run Database Query 🔍
            </button>

            <span className="text-[10px] font-mono text-slate-500">Query Engine: TimescaleDB</span>
          </div>

          {canvasResultsJson && (
            <pre className="p-3 bg-slate-950 text-[9px] font-mono text-slate-400 rounded-xl border border-slate-900 mt-3 max-h-[140px] overflow-y-auto leading-relaxed">
              <code>{canvasResultsJson}</code>
            </pre>
          )}
        </div>
      </div>

      {/* Live trace logs console (Right) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                Platform Diagnostics Live Monitor (Telemetry Logs)
              </h3>
              <p className="text-[10px] font-sans text-slate-400 mt-1">Check real-time system messages detailing serverless performance and loads.</p>
            </div>

            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[8px] font-mono">
              {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(lev => (
                <button
                  key={lev}
                  onClick={() => setLogFilter(lev)}
                  className={`px-1.5 py-0.5 font-mono rounded cursor-pointer ${
                    logFilter === lev ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {lev}
                </button>
              ))}
            </div>
          </div>

          {/* Logs controls */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLogStreamActive ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLogStreamActive ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                </span>
                <span className="text-slate-400">{isLogStreamActive ? 'STREAMING INTERCEPT ACTIVE' : 'DIAGNOSTICS STREAM PAUSED'}</span>
              </div>

              <div className="flex gap-2 text-[10px]">
                <button
                  onClick={() => setIsLogStreamActive(!isLogStreamActive)}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {isLogStreamActive ? '[Pause Logs]' : '[Resume Logs]'}
                </button>
                <button
                  onClick={() => setLogs([])}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  [Clear Screen]
                </button>
              </div>
            </div>

            {/* Log Terminal codebox */}
            <pre className="p-4 bg-slate-950 text-[10px] font-mono rounded-xl border border-slate-900/80 leading-relaxed max-h-[340px] overflow-y-auto space-y-1 text-left select-none">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-600 text-center italic py-4">Trace buffer empty. Polling diagnostics...</div>
              ) : (
                filteredLogs.map((log) => {
                  let colClass = 'text-slate-400';
                  if (log.level === 'SUCCESS') colClass = 'text-emerald-400 font-semibold';
                  if (log.level === 'WARN') colClass = 'text-amber-400 font-semibold';
                  if (log.level === 'ERROR') colClass = 'text-red-400 font-semibold';
                  
                  return (
                    <div key={log.id} className="hover:bg-slate-900/40 p-0.5 rounded transition">
                      <span className="text-slate-600">[{log.time}] </span>
                      <span className={colClass}>[{log.level}] </span>
                      <span className="text-cyan-600 font-bold">[{log.subsystem}] </span>
                      <span className="text-slate-300">{log.msg}</span>
                    </div>
                  );
                })
              )}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
