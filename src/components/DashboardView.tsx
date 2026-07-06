import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Clock, 
  Layers, 
  Wallet,
  Activity,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { Asset, Transaction } from '../types';

interface DashboardViewProps {
  assets: Asset[];
  transactions: Transaction[];
  onTriggerQuickTrade: (symbol: string, action: 'buy' | 'sell') => void;
  usdBalance: number;
}

type Timeframe = '1H' | '1D' | '1W' | '1M' | '1Y' | 'ALL';

export default function DashboardView({ assets, transactions, onTriggerQuickTrade, usdBalance }: DashboardViewProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1W');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; label: string } | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Generate mock chart data based on timeframe
  const chartData = useMemo(() => {
    let dataPoints = 20;
    let baseValue = usdBalance * 0.95;
    let trend = 0.002;
    let volatility = 0.015;

    switch (selectedTimeframe) {
      case '1H':
        dataPoints = 30;
        volatility = 0.004;
        break;
      case '1D':
        dataPoints = 24;
        volatility = 0.008;
        break;
      case '1W':
        dataPoints = 28;
        volatility = 0.012;
        break;
      case '1M':
        dataPoints = 30;
        volatility = 0.02;
        break;
      case '1Y':
        dataPoints = 40;
        volatility = 0.06;
        trend = 0.005;
        break;
      case 'ALL':
        dataPoints = 50;
        volatility = 0.12;
        trend = 0.01;
        break;
    }

    // Deterministic random walk generation so it looks nice and doesn't change wildly on re-renders
    const points: { value: number; label: string }[] = [];
    let currentVal = baseValue;

    for (let i = 0; i < dataPoints; i++) {
      const stepFactor = Math.sin(i / 3) * 0.3 + (i / dataPoints) * trend;
      const noise = (Math.cos(i * 1.7) * volatility);
      currentVal = currentVal * (1 + stepFactor * volatility + noise);
      
      // Enforce realistic bounds
      if (currentVal < baseValue * 0.5) currentVal = baseValue * 0.5;

      let dateLabel = '';
      const date = new Date();
      if (selectedTimeframe === '1H') {
        date.setMinutes(date.getMinutes() - (dataPoints - i) * 2);
        dateLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (selectedTimeframe === '1D') {
        date.setHours(date.getHours() - (dataPoints - i));
        dateLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (selectedTimeframe === '1W') {
        date.setDate(date.getDate() - (dataPoints - i) * 0.25);
        dateLabel = date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
      } else if (selectedTimeframe === '1M') {
        date.setDate(date.getDate() - (dataPoints - i));
        dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        date.setDate(date.getDate() - (dataPoints - i) * 7);
        dateLabel = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      }

      points.push({ value: currentVal, label: dateLabel });
    }

    // Force last point to match exact current balance
    if (points.length > 0) {
      points[points.length - 1].value = usdBalance;
    }

    return points;
  }, [selectedTimeframe, usdBalance]);

  // Calculate high, low, change %
  const stats = useMemo(() => {
    if (chartData.length === 0) return { high: 0, low: 0, change: 0, changePercent: 0 };
    const values = chartData.map(p => p.value);
    const high = Math.max(...values);
    const low = Math.min(...values);
    const start = values[0];
    const end = values[values.length - 1];
    const change = end - start;
    const changePercent = (change / start) * 100;
    return { high, low, change, changePercent };
  }, [chartData]);

  // Handle custom SVG dimensions on sizing
  const svgDimensions = { width: 800, height: 260 };

  // Calculate SVG Points path
  const svgPathData = useMemo(() => {
    if (chartData.length === 0) return { path: '', area: '', points: [] };
    const values = chartData.map(p => p.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal - minVal || 1;

    const paddingX = 40;
    const paddingY = 20;
    const usableW = svgDimensions.width - paddingX * 2;
    const usableH = svgDimensions.height - paddingY * 2;

    const points = chartData.map((d, i) => {
      const x = paddingX + (i / (chartData.length - 1)) * usableW;
      const y = paddingY + usableH - ((d.value - minVal) / valRange) * usableH;
      return { x, y, value: d.value, label: d.label };
    });

    const pathString = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area string closing to the bottom
    const areaString = `${pathString} L ${points[points.length - 1].x} ${svgDimensions.height - paddingY} L ${points[0].x} ${svgDimensions.height - paddingY} Z`;

    return { path: pathString, area: areaString, points };
  }, [chartData, svgDimensions.width, svgDimensions.height]);

  // Mouse handling for crosshair interaction
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!chartContainerRef.current || svgPathData.points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xMouse = ((e.clientX - rect.left) / rect.width) * svgDimensions.width;

    // Find closest point
    let closest = svgPathData.points[0];
    let minDist = Math.abs(svgPathData.points[0].x - xMouse);

    for (let i = 1; i < svgPathData.points.length; i++) {
      const dist = Math.abs(svgPathData.points[i].x - xMouse);
      if (dist < minDist) {
        minDist = dist;
        closest = svgPathData.points[i];
      }
    }

    setHoveredPoint(closest);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Dynamic Net Worth card */}
        <div id="stat-networth" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Net Wallet Valuation</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-sans font-bold text-white tracking-tight">
              ${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              {stats.change >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={`text-[11px] font-mono font-medium ${stats.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {stats.change >= 0 ? '+' : ''}
                {stats.changePercent.toFixed(2)}% ({selectedTimeframe})
              </span>
            </div>
          </div>
        </div>

        {/* High Watermark */}
        <div id="stat-high" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Watermark High</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-sans font-bold text-slate-200 tracking-tight">
              ${stats.high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-mono text-slate-500 mt-1.5">Highest point in period</p>
          </div>
        </div>

        {/* Period Low */}
        <div id="stat-low" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Period Floor</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-sans font-bold text-slate-200 tracking-tight">
              ${stats.low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-mono text-slate-500 mt-1.5">Lowest point in period</p>
          </div>
        </div>

        {/* Smart Indicators */}
        <div id="stat-activity" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active Assets</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-sans font-bold text-slate-200 tracking-tight">
              {assets.filter(a => a.balance > 0 || a.staked > 0).length} Assets
            </h3>
            <p className="text-[10px] font-mono text-slate-500 mt-1.5">Across Wallet & Staking pools</p>
          </div>
        </div>
      </div>

      {/* Main Performance Chart */}
      <div id="performance-chart-card" className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-sans font-semibold text-white">Dynamic Asset Performance</h2>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">
              {hoveredPoint 
                ? `Value tracked at: ${hoveredPoint.label}` 
                : 'Interactive performance index over time'}
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-slate-900">
            {(['1H', '1D', '1W', '1M', '1Y', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 text-[10px] font-mono font-medium rounded-md transition-all duration-150 ${
                  selectedTimeframe === tf 
                    ? 'bg-slate-800 text-cyan-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart Frame */}
        <div ref={chartContainerRef} className="w-full relative overflow-hidden bg-slate-950/20 rounded-xl py-3">
          {/* Hover state tooltip display inside the canvas */}
          {hoveredPoint && (
            <div 
              className="absolute pointer-events-none bg-slate-950/90 border border-slate-800/80 rounded-xl px-3 py-2 text-xs font-mono shadow-2xl z-20 flex flex-col gap-0.5 backdrop-blur-sm"
              style={{
                left: `${(hoveredPoint.x / svgDimensions.width) * 100}%`,
                transform: 'translateX(-50%)',
                top: '12px'
              }}
            >
              <span className="text-[9px] text-slate-500 uppercase">{hoveredPoint.label}</span>
              <span className="text-white font-bold">${hoveredPoint.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          <svg
            viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
            className="w-full h-auto select-none overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Definitions for Gradients */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="40" y1="20" x2="760" y2="20" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="80" x2="760" y2="80" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="140" x2="760" y2="140" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="200" x2="760" y2="200" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="240" x2="760" y2="240" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4" />

            {/* Gradient Fill under Path */}
            {svgPathData.area && (
              <path d={svgPathData.area} fill="url(#chartGradient)" />
            )}

            {/* Line Path */}
            {svgPathData.path && (
              <path
                d={svgPathData.path}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Gradient definition for the line stroke */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Crosshair lines on Hover */}
            {hoveredPoint && (
              <>
                {/* Vertical line */}
                <line
                  x1={hoveredPoint.x}
                  y1={20}
                  x2={hoveredPoint.x}
                  y2={240}
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Horizontal line */}
                <line
                  x1={40}
                  y1={hoveredPoint.y}
                  x2={760}
                  y2={hoveredPoint.y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Dot at intersection */}
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="5"
                  fill="#22d3ee"
                  stroke="#020617"
                  strokeWidth="2.5"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="10"
                  fill="#22d3ee"
                  fillOpacity="0.2"
                />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Bottom Grid: Watchlist & Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Watchlist card */}
        <div id="dashboard-watchlist" className="lg:col-span-1 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between h-fit">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-sans font-semibold text-slate-300">Market Watchlist</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Live Sparklines</span>
            </div>

            <div className="space-y-3.5">
              {assets.map((asset) => {
                const isPositive = asset.change24h >= 0;
                
                // SVG Sparkline path builder
                const minPrice = Math.min(...asset.sparkline);
                const maxPrice = Math.max(...asset.sparkline);
                const priceRange = maxPrice - minPrice || 1;
                const sparkPoints = asset.sparkline.map((price, idx) => {
                  const x = (idx / (asset.sparkline.length - 1)) * 60;
                  const y = 20 - ((price - minPrice) / priceRange) * 16;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <div key={asset.symbol} className="p-3 bg-slate-900/10 hover:bg-slate-900/35 border border-slate-900/50 rounded-xl flex items-center justify-between transition-colors">
                    {/* Symbol / Name */}
                    <div className="flex flex-col">
                      <span className="text-xs font-sans font-bold text-white tracking-wider">{asset.symbol}</span>
                      <span className="text-[10px] font-mono text-slate-500">{asset.name}</span>
                    </div>

                    {/* Sparkline Visual */}
                    <svg className="w-16 h-6 overflow-visible">
                      <polyline
                        fill="none"
                        stroke={isPositive ? '#10b981' : '#ef4444'}
                        strokeWidth="1.5"
                        points={sparkPoints}
                      />
                    </svg>

                    {/* Pricing details & Quick-actions */}
                    <div className="text-right flex items-center gap-2.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-semibold text-slate-200">
                          ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[10px] font-mono flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}
                          {asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          id={`quick-buy-${asset.symbol}`}
                          onClick={() => onTriggerQuickTrade(asset.symbol, 'buy')}
                          className="px-1.5 py-0.5 bg-cyan-950 text-cyan-400 hover:bg-cyan-900 rounded text-[9px] font-mono cursor-pointer"
                        >
                          BUY
                        </button>
                        <button
                          id={`quick-sell-${asset.symbol}`}
                          onClick={() => onTriggerQuickTrade(asset.symbol, 'sell')}
                          className="px-1.5 py-0.5 bg-slate-900 text-slate-400 hover:bg-slate-800 rounded text-[9px] font-mono cursor-pointer"
                        >
                          SELL
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div id="asset-allocation" className="lg:col-span-2 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-sans font-semibold text-slate-300">Portfolio Distribution</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Available Assets</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900">
                    <th className="py-2.5 text-[10px] font-mono text-slate-500 uppercase">Asset</th>
                    <th className="py-2.5 text-right text-[10px] font-mono text-slate-500 uppercase">Price</th>
                    <th className="py-2.5 text-right text-[10px] font-mono text-slate-500 uppercase">Balance</th>
                    <th className="py-2.5 text-right text-[10px] font-mono text-slate-500 uppercase">Staked Balance</th>
                    <th className="py-2.5 text-right text-[10px] font-mono text-slate-500 uppercase">Total Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40">
                  {assets.map((asset) => {
                    const totalTokens = asset.balance + asset.staked;
                    const valuation = totalTokens * asset.price;
                    if (totalTokens === 0) return null;

                    return (
                      <tr key={asset.symbol} className="hover:bg-slate-900/10">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-sans font-bold text-white tracking-wider">{asset.symbol}</span>
                            <span className="text-[10px] font-sans text-slate-500">{asset.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-mono text-xs text-slate-300">
                          ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right font-mono text-xs text-slate-300">
                          {asset.balance > 0 ? asset.balance.toLocaleString('en-US', { maximumFractionDigits: 4 }) : '0.00'}
                        </td>
                        <td className="py-3 text-right font-mono text-xs text-slate-300">
                          {asset.staked > 0 ? (
                            <span className="text-teal-400">
                              {asset.staked.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                            </span>
                          ) : (
                            <span className="text-slate-500">0.00</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono text-xs font-semibold text-white">
                          ${valuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Feed */}
      <div id="transaction-feed" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-sans font-semibold text-slate-300">Recent Transactions Ledger</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Audit Records</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center bg-slate-900/10 border border-dashed border-slate-900 rounded-xl">
            <p className="text-xs font-mono text-slate-500">No transactions recorded yet in this session</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900">
                  <th className="py-2 text-[10px] font-mono text-slate-500 uppercase">Tx Type</th>
                  <th className="py-2 text-[10px] font-mono text-slate-500 uppercase">Asset</th>
                  <th className="py-2 text-right text-[10px] font-mono text-slate-500 uppercase">Quantity</th>
                  <th className="py-2 text-right text-[10px] font-mono text-slate-500 uppercase">Rate</th>
                  <th className="py-2 text-right text-[10px] font-mono text-slate-500 uppercase">Status</th>
                  <th className="py-2 text-right text-[10px] font-mono text-slate-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/30">
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/5">
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        {tx.type === 'buy' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />}
                        {tx.type === 'sell' && <ArrowDownLeft className="w-3.5 h-3.5 text-red-500" />}
                        {tx.type === 'deposit' && <PlusCircle className="w-3.5 h-3.5 text-blue-500" />}
                        {tx.type === 'stake' && <Activity className="w-3.5 h-3.5 text-teal-500" />}
                        {tx.type === 'unstake' && <ArrowDownLeft className="w-3.5 h-3.5 text-amber-500" />}
                        {tx.type === 'swap' && <ArrowRight className="w-3.5 h-3.5 text-purple-500" />}
                        <span className="text-xs font-mono uppercase text-slate-300">{tx.type}</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className="text-xs font-sans font-semibold text-slate-200">
                        {tx.targetAsset ? `${tx.asset} → ${tx.targetAsset}` : tx.asset}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs text-slate-300">
                      {tx.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })} {tx.asset}
                      {tx.targetAmount && (
                        <span className="text-slate-500"> / {tx.targetAmount.toLocaleString('en-US', { maximumFractionDigits: 6 })} {tx.targetAsset}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs text-slate-400">
                      {tx.price ? `$${tx.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-emerald-400 rounded-full text-[9px] font-mono">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-[10px] text-slate-500">
                      {tx.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
