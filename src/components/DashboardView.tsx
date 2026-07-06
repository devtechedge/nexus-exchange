import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ArrowRight,
  Sparkles,
  Check,
  CheckSquare,
  Square,
  RefreshCw,
  Info,
  ShieldAlert,
  Star,
  Coins
} from 'lucide-react';
import { Asset, Transaction } from '../types';

interface DashboardViewProps {
  assets: Asset[];
  transactions: Transaction[];
  onTriggerQuickTrade: (symbol: string, action: 'buy' | 'sell') => void;
  usdBalance: number;
  onSweepDust: (symbols: string[]) => void;
}

type Timeframe = '1H' | '1D' | '1W' | '1M' | '1Y' | 'ALL';

export default function DashboardView({ assets, transactions, onTriggerQuickTrade, usdBalance, onSweepDust }: DashboardViewProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1W');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; label: string } | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Sparkly Starred Watchlist Favorites State
  const [starredCoins, setStarredCoins] = useState<string[]>(['BTC', 'ETH', 'SOL']);

  const handleToggleStar = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredCoins(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  // Dust Sweeper State
  const [showDustModal, setShowDustModal] = useState(false);
  const [selectedDustSymbols, setSelectedDustSymbols] = useState<string[]>([]);
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepSuccess, setSweepSuccess] = useState(false);

  // Identify dust assets: balance > 0 and valuation < $1.00 USD, and NOT USDC/NEX
  const dustAssets = useMemo(() => {
    return assets.filter(asset => {
      const val = asset.balance * asset.price;
      return asset.balance > 0 && val < 1.00 && asset.symbol !== 'USDC' && asset.symbol !== 'NEX';
    });
  }, [assets]);

  // Sync selected dust checkbox list on modal open
  useEffect(() => {
    if (showDustModal) {
      setSelectedDustSymbols(dustAssets.map(a => a.symbol));
      setSweepSuccess(false);
    }
  }, [showDustModal, dustAssets]);

  const totalDustValue = useMemo(() => {
    return dustAssets
      .filter(a => selectedDustSymbols.includes(a.symbol))
      .reduce((sum, a) => sum + (a.balance * a.price), 0);
  }, [dustAssets, selectedDustSymbols]);

  // Standard rate: $0.50 per NEXUS (NEX)
  const nexOutputAmount = totalDustValue / 0.50;

  const handleToggleDust = (symbol: string) => {
    setSelectedDustSymbols(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const handleSweepAction = () => {
    if (selectedDustSymbols.length === 0) return;
    setIsSweeping(true);

    // Simulate matrix sweeping delay
    setTimeout(() => {
      onSweepDust(selectedDustSymbols);
      setIsSweeping(false);
      setSweepSuccess(true);
      setTimeout(() => {
        setShowDustModal(false);
        setSweepSuccess(false);
      }, 1500);
    }, 2000);
  };

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

  const timeframeLabels: Record<Timeframe, string> = {
    '1H': 'Past Hour',
    '1D': 'Today',
    '1W': 'Past Week',
    '1M': 'Past Month',
    '1Y': 'Past Year',
    'ALL': 'All Time'
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Dynamic Net Worth card */}
        <div id="stat-networth" className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/20 rounded-2xl backdrop-blur-md flex flex-col justify-between shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans text-cyan-400 uppercase tracking-wider font-bold">My Crypto Piggy Bank 🐷</span>
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
              <span className={`text-[11px] font-sans font-semibold ${stats.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.change >= 0 ? 'Won ' : 'Down '}
                {stats.changePercent.toFixed(2)}% ({timeframeLabels[selectedTimeframe]})
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">
              {stats.change >= 0 ? '📈 You made some rewards recently!' : '🧊 Coins are cooling down! Good time to learn.'}
            </p>
          </div>
        </div>

        {/* High Watermark */}
        <div id="stat-high" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider">Period High-Watermark 📈</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-sans font-bold text-slate-200 tracking-tight">
              ${stats.high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-sans text-slate-500 mt-1.5">Your peak piggy bank size in this period</p>
          </div>
        </div>

        {/* Period Low */}
        <div id="stat-low" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider">Period Floor 📉</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-sans font-bold text-slate-200 tracking-tight">
              ${stats.low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-sans text-slate-500 mt-1.5">The lowest value hit recently</p>
          </div>
        </div>

        {/* Smart Indicators */}
        <div id="stat-activity" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider">Active Digital Coins 🪙</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-sans font-bold text-slate-200 tracking-tight">
              {assets.filter(a => a.balance > 0 || a.staked > 0).length} Coins
            </h3>
            <p className="text-[10px] font-sans text-slate-500 mt-1.5">Coins actively growing or saved</p>
          </div>
        </div>
      </div>

      {/* Main Performance Chart */}
      <div id="performance-chart-card" className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-sans font-bold text-white">My Growth Chart 📈</h2>
            </div>
            <p className="text-xs font-sans text-slate-400 mt-1">
              {hoveredPoint 
                ? `On ${hoveredPoint.label}, your coins were worth $${hoveredPoint.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                : 'Hover or slide over the chart lines below to see how your balance grew!'}
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-slate-900">
            {(['1H', '1D', '1W', '1M', '1Y', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1 text-[10px] font-sans font-semibold rounded-md transition-all duration-150 cursor-pointer ${
                  selectedTimeframe === tf 
                    ? 'bg-slate-800 text-cyan-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {timeframeLabels[tf]}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart Frame */}
        <div ref={chartContainerRef} className="w-full relative overflow-hidden bg-slate-950/20 rounded-xl py-3">
          {/* Hover state tooltip display inside the canvas */}
          {hoveredPoint && (
            <div 
              className="absolute pointer-events-none bg-slate-950/95 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-sans shadow-2xl z-20 flex flex-col gap-0.5 backdrop-blur-sm"
              style={{
                left: `${(hoveredPoint.x / svgDimensions.width) * 100}%`,
                transform: 'translateX(-50%)',
                top: '12px'
              }}
            >
              <span className="text-[9px] text-cyan-400 uppercase font-bold">On {hoveredPoint.label}</span>
              <span className="text-white font-bold text-sm">${hoveredPoint.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
              <span className="text-xs font-sans font-bold text-slate-300">My Favorite Coins watchlist ⭐</span>
              <span className="text-[10px] font-sans text-slate-500 uppercase">Trend Indicators</span>
            </div>

            <div className="space-y-3">
              {assets.map((asset) => {
                const isPositive = asset.change24h >= 0;
                const isStarred = starredCoins.includes(asset.symbol);
                
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
                  <div key={asset.symbol} className="p-3 bg-slate-900/20 hover:bg-slate-900/35 border border-slate-900/50 rounded-xl flex items-center justify-between transition-colors">
                    {/* Star / Symbol / Name */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleToggleStar(asset.symbol, e)}
                        className="p-1 hover:bg-slate-800 rounded transition cursor-pointer text-slate-500 hover:text-amber-400"
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                      </button>
                      <div className="flex flex-col">
                        <span className="text-xs font-sans font-bold text-white tracking-wider flex items-center gap-1">
                          {asset.symbol}
                        </span>
                        <span className="text-[9px] font-sans text-slate-400">{asset.name}</span>
                      </div>
                    </div>

                    {/* Sparkline Visual */}
                    <div className="hidden sm:block">
                      <svg className="w-14 h-5 overflow-visible">
                        <polyline
                          fill="none"
                          stroke={isPositive ? '#10b981' : '#ef4444'}
                          strokeWidth="1.2"
                          points={sparkPoints}
                        />
                      </svg>
                    </div>

                    {/* Pricing details & Quick-actions */}
                    <div className="text-right flex items-center gap-2.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-semibold text-slate-200">
                          ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[10px] font-sans font-bold flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? 'Up ' : 'Down '}
                          {Math.abs(asset.change24h).toFixed(1)}% {isPositive ? '🔥' : '🧊'}
                        </span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          id={`quick-buy-${asset.symbol}`}
                          onClick={() => onTriggerQuickTrade(asset.symbol, 'buy')}
                          className="px-1.5 py-0.5 bg-cyan-950 text-cyan-400 hover:bg-cyan-900 rounded text-[9px] font-sans font-semibold cursor-pointer"
                        >
                          BUY
                        </button>
                        <button
                          id={`quick-sell-${asset.symbol}`}
                          onClick={() => onTriggerQuickTrade(asset.symbol, 'sell')}
                          className="px-1.5 py-0.5 bg-slate-900 text-slate-400 hover:bg-slate-800 rounded text-[9px] font-sans font-semibold cursor-pointer"
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
              <span className="text-xs font-sans font-bold text-slate-300">How My Balance is Distributed 🍰</span>
              <div className="flex items-center gap-2">
                {dustAssets.length > 0 && (
                  <button
                    id="dust-sweeper-trigger"
                    onClick={() => setShowDustModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/35 hover:to-orange-500/35 border border-amber-500/40 text-amber-400 rounded-xl text-[10px] font-sans font-bold transition-all cursor-pointer animate-pulse"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    🧹 Sweep Spare Change ({dustAssets.length})
                  </button>
                )}
                <span className="text-[10px] font-sans text-slate-500 uppercase">My Coins</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900/80">
                    <th className="py-2.5 text-[10px] font-sans text-slate-400 uppercase font-bold">Coin Name</th>
                    <th className="py-2.5 text-right text-[10px] font-sans text-slate-400 uppercase font-bold">Current Value per Coin</th>
                    <th className="py-2.5 text-right text-[10px] font-sans text-slate-400 uppercase font-bold">Amount Owned</th>
                    <th className="py-2.5 text-right text-[10px] font-sans text-slate-400 uppercase font-bold">Coins Saved & Growing</th>
                    <th className="py-2.5 text-right text-[10px] font-sans text-slate-400 uppercase font-bold">Total Value</th>
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
                          <div className="flex items-center gap-1.5">
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
                            <span className="text-teal-400 font-bold">
                              {asset.staked.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                            </span>
                          ) : (
                            <span className="text-slate-600">0.00</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-sans text-xs font-bold text-white">
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
            <span className="text-xs font-sans font-bold text-slate-300">My Activity Log (History of moves) 📜</span>
          </div>
          <span className="text-[10px] font-sans text-slate-500 uppercase">Completed Moves</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center bg-slate-900/10 border border-dashed border-slate-900 rounded-xl">
            <p className="text-xs font-sans text-slate-500">No transactions recorded yet in this session</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transactions.slice(0, 6).map((tx) => {
              // Create friendly text descriptions
              let textDescription = '';
              let valueLabel = '';
              
              if (tx.type === 'buy') {
                textDescription = `You instantly bought ${tx.amount.toFixed(4)} ${tx.asset}`;
                valueLabel = `Spent $${(tx.amount * (tx.price || 0)).toFixed(2)}`;
              } else if (tx.type === 'sell') {
                textDescription = `You instantly sold ${tx.amount.toFixed(4)} ${tx.asset}`;
                valueLabel = `Received $${(tx.amount * (tx.price || 0)).toFixed(2)}`;
              } else if (tx.type === 'deposit') {
                textDescription = `You loaded Regular Money ($${tx.amount.toFixed(2)}) into your piggy bank`;
                valueLabel = 'Added Cash';
              } else if (tx.type === 'stake') {
                textDescription = `You put ${tx.amount.toFixed(4)} ${tx.asset} to work to grow bonus rewards 🚀`;
                valueLabel = 'Saving & Growing';
              } else if (tx.type === 'unstake') {
                textDescription = `You withdrew ${tx.amount.toFixed(4)} ${tx.asset} back to your wallet`;
                valueLabel = 'Moved to Wallet';
              } else if (tx.type === 'swap') {
                textDescription = `You swapped ${tx.amount.toFixed(4)} ${tx.asset} directly for ${tx.targetAmount?.toFixed(4)} ${tx.targetAsset}`;
                valueLabel = 'Direct Swap';
              }

              return (
                <div key={tx.id} className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-start gap-2.5 hover:border-slate-800 transition-colors">
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-900 shrink-0">
                    {tx.type === 'buy' && <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
                    {tx.type === 'sell' && <ArrowDownLeft className="w-4 h-4 text-red-400" />}
                    {tx.type === 'deposit' && <PlusCircle className="w-4 h-4 text-blue-400" />}
                    {tx.type === 'stake' && <Activity className="w-4 h-4 text-teal-400" />}
                    {tx.type === 'unstake' && <ArrowDownLeft className="w-4 h-4 text-amber-400" />}
                    {tx.type === 'swap' && <ArrowRight className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-sans font-semibold text-slate-100 leading-tight">
                      {textDescription}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-sans text-slate-400">
                      <span>{tx.timestamp}</span>
                      <span className="font-semibold text-cyan-400">{valueLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Micro-Asset Dust Sweeper Matrix Modal Overlay */}
      <AnimatePresence>
        {showDustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-lg bg-[#030712] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-5 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <h3 className="text-sm font-sans font-bold text-white tracking-wide">🧹 Piggy Bank Spare Change Sweeper</h3>
                </div>
                <button
                  onClick={() => setShowDustModal(false)}
                  className="p-1 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <Clock className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Got tiny bits of spare change left over from trades? This sweeper gathers all fractional coins worth less than <span className="text-white font-mono">$1.00 valuation</span> and swaps them into **NEX** coins (Nexus Rewards Tokens) with zero fees!
                </p>

                {sweepSuccess ? (
                  <div className="py-8 text-center space-y-3.5">
                    <div className="mx-auto w-12 h-12 bg-emerald-950/40 border border-emerald-900 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider">All Change Swept! 🎉</h4>
                      <p className="text-[11px] font-sans text-slate-400 mt-1">Gained +{nexOutputAmount.toFixed(4)} NEX tokens into your primary rewards piggy bank.</p>
                    </div>
                  </div>
                ) : isSweeping ? (
                  <div className="py-10 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <div>
                      <p className="text-xs font-sans text-slate-300">Sweeping {selectedDustSymbols.length} tiny coins into rewards...</p>
                      <p className="text-[10px] font-sans text-slate-500 mt-1">Combining balances safely with zero blockchain delivery fees...</p>
                    </div>
                  </div>
                ) : dustAssets.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs font-sans">
                    No tiny spare change balances found right now!
                  </div>
                ) : (
                  <>
                    <div className="border border-slate-900 bg-slate-950/40 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-900/50">
                      {dustAssets.map(asset => {
                        const val = asset.balance * asset.price;
                        const isSelected = selectedDustSymbols.includes(asset.symbol);

                        return (
                          <div
                            key={asset.symbol}
                            onClick={() => handleToggleDust(asset.symbol)}
                            className="p-3 flex items-center justify-between hover:bg-slate-900/30 transition-all cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-700 shrink-0" />
                              )}
                              <div className="flex flex-col">
                                <span className="text-xs font-sans font-bold text-white tracking-wider">{asset.symbol}</span>
                                <span className="text-[9px] font-sans text-slate-400">{asset.name}</span>
                              </div>
                            </div>

                            <div className="text-right flex flex-col font-sans text-[11px]">
                              <span className="text-slate-300 font-mono">{asset.balance.toFixed(4)}</span>
                              <span className="text-[9px] text-slate-500">${val.toFixed(2)} Regular Money</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950/60 border border-slate-900 rounded-xl text-xs font-sans">
                      <div>
                        <span className="text-slate-500 uppercase text-[9px]">Total Value Swept</span>
                        <p className="text-sm font-bold text-white mt-0.5">${totalDustValue.toFixed(2)} Regular Money</p>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[9px]">My Reward NEX Output</span>
                        <p className="text-sm font-bold text-amber-400 mt-0.5">+{nexOutputAmount.toFixed(4)} NEX</p>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/10 border border-amber-900/30 rounded-xl flex gap-2 text-[10px] leading-relaxed font-sans text-amber-400">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Zero-Fee Liquidation SLA</span>
                        <p className="mt-0.5 font-sans text-[9px] text-amber-400/80">
                          This is 100% free! Zero slippage or delivery fee is taken on spare change consolidations.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleSweepAction}
                      disabled={selectedDustSymbols.length === 0}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-sans font-bold text-xs rounded-xl transition tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      SWEEP {selectedDustSymbols.length} SPARE COINS TO NEXUS (NEX)
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
