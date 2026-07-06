import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeftRight, 
  ChevronDown, 
  HelpCircle, 
  RefreshCw, 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Info,
  DollarSign,
  Cpu,
  Zap,
  Shield,
  ShieldAlert,
  Play,
  Square,
  Flame,
  Activity,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
  Percent
} from 'lucide-react';
import { Asset, Transaction, ActiveOrder, GridBot, ArbitragePath } from '../types';

interface TradingViewProps {
  assets: Asset[];
  balances: { [key: string]: number };
  onExecuteTrade: (
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit',
    amount: number,
    price: number
  ) => void;
  onExecuteSwap: (fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number) => void;
  activeOrders: ActiveOrder[];
  onCancelOrder: (id: string) => void;
  // Algorithmic Trading Extensions
  onExecuteAlgoOrder: (order: Partial<ActiveOrder>) => void;
  gridBots: GridBot[];
  onStartGridBot: (bot: Omit<GridBot, 'id' | 'createdAt' | 'profitEarned'>) => void;
  onStopGridBot: (id: string) => void;
  circuitBreakerArmed: boolean;
  circuitBreakerPercent: number;
  onToggleCircuitBreaker: (armed: boolean, percent: number) => void;
  onTriggerPanic: () => void;
}

// Generate order book bids/asks
function generateOrderBook(basePrice: number, seed: number = 0) {
  const bids: { price: number; size: number; total: number }[] = [];
  const asks: { price: number; size: number; total: number }[] = [];

  // Generate 8 asks (sell orders) starting slightly above basePrice
  let askSum = 0;
  for (let i = 1; i <= 8; i++) {
    const p = basePrice * (1 + (i * 0.0008) + (Math.sin(seed + i) * 0.0003));
    const s = 1.2 * i * (1.1 + Math.cos(seed - i) * 0.5) + 0.1;
    askSum += s;
    asks.push({ price: p, size: s, total: askSum });
  }

  // Generate 8 bids (buy orders) starting slightly below basePrice
  let bidSum = 0;
  for (let i = 1; i <= 8; i++) {
    const p = basePrice * (1 - (i * 0.0008) - (Math.cos(seed + i) * 0.0003));
    const s = 1.5 * i * (1.1 + Math.sin(seed + i) * 0.6) + 0.2;
    bidSum += s;
    bids.push({ price: p, size: s, total: bidSum });
  }

  // Sort asks in ascending (lowest asks first) and bids descending (highest bids first)
  asks.sort((a, b) => b.price - a.price); // Higher prices on top
  bids.sort((a, b) => b.price - a.price);

  return { bids, asks };
}

export default function TradingView({ 
  assets, 
  balances, 
  onExecuteTrade, 
  onExecuteSwap,
  activeOrders, 
  onCancelOrder,
  onExecuteAlgoOrder,
  gridBots,
  onStartGridBot,
  onStopGridBot,
  circuitBreakerArmed,
  circuitBreakerPercent,
  onToggleCircuitBreaker,
  onTriggerPanic
}: TradingViewProps) {
  // Top level Order tab: 'spot' | 'algo' | 'grid'
  const [activeTerminalTab, setActiveTerminalTab] = useState<'spot' | 'algo' | 'grid'>('spot');

  // Order Form State
  const [tradeAsset, setTradeAsset] = useState('SOL');
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [tradeType, setTradeType] = useState<'market' | 'limit'>('market');
  const [amountInput, setAmountInput] = useState('');
  const [limitPriceInput, setLimitPriceInput] = useState('');
  const [tradeError, setTradeError] = useState('');

  // Algorithmic strategy type: 'twap' | 'vwap' | 'trailing-stop' | 'bracket'
  const [algoStrategy, setAlgoStrategy] = useState<'twap' | 'vwap' | 'trailing-stop' | 'bracket'>('twap');
  
  // Strategy specific configurations
  const [twapSlices, setTwapSlices] = useState('5');
  const [twapInterval, setTwapInterval] = useState('15'); // 15s interval for high-fidelity demo
  const [icebergEnabled, setIcebergEnabled] = useState(false);
  const [icebergPercent, setIcebergPercent] = useState('20');
  
  const [vwapTargetDepth, setVwapTargetDepth] = useState('120'); // SOL volume benchmark
  
  const [trailingStopPct, setTrailingStopPct] = useState('2.5');
  const [atrMultiplier, setAtrMultiplier] = useState('2.0'); // Volatility Buffer ATR mult

  const [bracketTP, setBracketTP] = useState('');
  const [bracketSL, setBracketSL] = useState('');

  // Grid Bot inputs
  const [gridLower, setGridLower] = useState('');
  const [gridUpper, setGridUpper] = useState('');
  const [gridCount, setGridCount] = useState('8');
  const [gridInvestment, setGridInvestment] = useState('1000');

  // Swap Form State
  const [swapFrom, setSwapFrom] = useState('USDC');
  const [swapTo, setSwapTo] = useState('SOL');
  const [swapFromAmount, setSwapFromAmount] = useState('');
  const [swapRate, setSwapRate] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);
  const [swapError, setSwapError] = useState('');

  // Active book seed simulation
  const [bookSeed, setBookSeed] = useState(0);

  // Slippage mitigation settings
  const [slippagePercent, setSlippagePercent] = useState(0.5);
  const [autoSlippage, setAutoSlippage] = useState(true);

  // Selected Asset Info
  const selectedAsset = useMemo(() => {
    return assets.find(a => a.symbol === tradeAsset) || assets[0];
  }, [assets, tradeAsset]);

  // Set default limit/bracket values when asset or type changes
  useEffect(() => {
    if (selectedAsset) {
      setLimitPriceInput(selectedAsset.price.toFixed(2));
      setGridLower((selectedAsset.price * 0.90).toFixed(2));
      setGridUpper((selectedAsset.price * 1.10).toFixed(2));
      setBracketTP((selectedAsset.price * 1.05).toFixed(2));
      setBracketSL((selectedAsset.price * 0.95).toFixed(2));
    }
  }, [selectedAsset, tradeAsset]);

  // Live simulation of Order Book depth updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBookSeed(prev => prev + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const orderBook = useMemo(() => {
    return generateOrderBook(selectedAsset.price, bookSeed);
  }, [selectedAsset, bookSeed]);

  // Dynamic book liquidity calculations for Slippage Auto-mitigation
  const liquidityDepthIndex = useMemo(() => {
    // Simulated liquidity depth based on book seed and selected price
    const base = 85.4;
    const flux = Math.sin(bookSeed * 0.5) * 6.5;
    return parseFloat((base + flux).toFixed(1));
  }, [bookSeed]);

  const dynamicImpactSlippage = useMemo(() => {
    const baseSlippage = 0.06;
    const multiplier = 100 / liquidityDepthIndex;
    const quantityFactor = (parseFloat(amountInput) || 0) * 0.002;
    return parseFloat((baseSlippage * multiplier + quantityFactor).toFixed(4));
  }, [liquidityDepthIndex, amountInput]);

  useEffect(() => {
    if (autoSlippage) {
      // Auto-set slippage threshold based on liquidity depth
      const optimal = Math.max(0.1, dynamicImpactSlippage * 1.5);
      setSlippagePercent(parseFloat(optimal.toFixed(2)));
    }
  }, [dynamicImpactSlippage, autoSlippage]);

  // Max bid/ask size for relative depth bars
  const maxDepthSize = useMemo(() => {
    const allSizes = [...orderBook.bids, ...orderBook.asks].map(item => item.total);
    return Math.max(...allSizes, 1);
  }, [orderBook]);

  // Calculations for Order Form
  const executionPrice = tradeType === 'market' ? selectedAsset.price : parseFloat(limitPriceInput) || selectedAsset.price;
  const quantity = parseFloat(amountInput) || 0;
  const subtotal = quantity * executionPrice;
  const protocolFee = subtotal * 0.005; // 0.5%
  const grandTotal = subtotal + protocolFee;

  // Swap rate calculation
  const fromAsset = useMemo(() => assets.find(a => a.symbol === swapFrom), [assets, swapFrom]);
  const toAsset = useMemo(() => assets.find(a => a.symbol === swapTo), [assets, swapTo]);

  useEffect(() => {
    if (fromAsset && toAsset) {
      setSwapRate(fromAsset.price / toAsset.price);
    }
  }, [fromAsset, toAsset]);

  // Swap Live rate lock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Reset rate and countdown
          setBookSeed(s => s + 1); // trigger rate fluctuation slightly
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const swapToAmount = useMemo(() => {
    const amt = parseFloat(swapFromAmount) || 0;
    return amt * swapRate;
  }, [swapFromAmount, swapRate]);

  // Arbitrage Paths state
  const [arbitrageCaptured, setArbitrageCaptured] = useState<string | null>(null);
  const [arbTick, setArbTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setArbTick(t => t + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const arbitragePaths: ArbitragePath[] = useMemo(() => {
    const solPrice = assets.find(a => a.symbol === 'SOL')?.price || 145;
    const ethPrice = assets.find(a => a.symbol === 'ETH')?.price || 3240;
    const deviation1 = 0.12 + Math.sin(arbTick * 0.8) * 0.08;
    const deviation2 = 0.05 + Math.cos(arbTick * 0.5) * 0.06;

    return [
      {
        id: 'arb-path-1',
        route: ['USDC', 'SOL', 'ETH', 'USDC'],
        anomalousReturnPercent: parseFloat(Math.max(0.02, deviation1).toFixed(2)),
        liquidityDepthUsd: 145000 + (arbTick % 5) * 12000,
      },
      {
        id: 'arb-path-2',
        route: ['USDC', 'LINK', 'DOT', 'USDC'],
        anomalousReturnPercent: parseFloat(Math.max(0.01, deviation2).toFixed(2)),
        liquidityDepthUsd: 82000 - (arbTick % 3) * 6000,
      }
    ];
  }, [assets, arbTick]);

  // Handlers
  const handlePercentClick = (percent: number) => {
    if (tradeSide === 'buy') {
      const availableUsd = balances['USDC'] || 0;
      const targetSpend = availableUsd * (percent / 100);
      const totalCostPerUnit = executionPrice + (executionPrice * 0.005);
      const calculatedAmt = targetSpend / totalCostPerUnit;
      setAmountInput(calculatedAmt.toFixed(4));
    } else {
      const availableTokens = balances[tradeAsset] || 0;
      const calculatedAmt = availableTokens * (percent / 100);
      setAmountInput(calculatedAmt.toFixed(4));
    }
  };

  const handleExecuteTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError('');

    const amt = parseFloat(amountInput);
    if (!amt || amt <= 0) {
      setTradeError('Please enter a valid amount');
      return;
    }

    if (tradeSide === 'buy') {
      const usdNeeded = grandTotal;
      const usdAvailable = balances['USDC'] || 0;
      if (usdNeeded > usdAvailable) {
        setTradeError(`Insufficient USDC balance. Needs $${usdNeeded.toFixed(2)} but only has $${usdAvailable.toFixed(2)}`);
        return;
      }
    } else {
      const tokensAvailable = balances[tradeAsset] || 0;
      if (amt > tokensAvailable) {
        setTradeError(`Insufficient ${tradeAsset} balance. Has ${tokensAvailable} ${tradeAsset}`);
        return;
      }
    }

    onExecuteTrade(tradeAsset, tradeSide, tradeType, amt, executionPrice);
    setAmountInput('');
  };

  const handleExecuteAlgoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError('');

    const amt = parseFloat(amountInput);
    if (!amt || amt <= 0) {
      setTradeError('Please enter a valid amount');
      return;
    }

    // Balance checks
    if (tradeSide === 'buy') {
      const usdNeeded = grandTotal;
      const usdAvailable = balances['USDC'] || 0;
      if (usdNeeded > usdAvailable) {
        setTradeError(`Insufficient USDC balance. Needs $${usdNeeded.toFixed(2)} but only has $${usdAvailable.toFixed(2)}`);
        return;
      }
    } else {
      const tokensAvailable = balances[tradeAsset] || 0;
      if (amt > tokensAvailable) {
        setTradeError(`Insufficient ${tradeAsset} balance. Has ${tokensAvailable} ${tradeAsset}`);
        return;
      }
    }

    // Build the Algorithmic Order Payload
    const algoOrderPayload: Partial<ActiveOrder> = {
      symbol: tradeAsset,
      side: tradeSide,
      amount: amt,
      price: selectedAsset.price,
      filled: 0,
      status: 'open',
    };

    if (algoStrategy === 'twap') {
      const slices = parseInt(twapSlices) || 5;
      const intervalSec = parseInt(twapInterval) || 15;
      algoOrderPayload.type = 'twap';
      algoOrderPayload.twapTotalChunks = slices;
      algoOrderPayload.twapFilledChunks = 0;
      algoOrderPayload.twapIntervalSeconds = intervalSec;
      algoOrderPayload.twapLastTriggerTime = Date.now();
      if (icebergEnabled) {
        algoOrderPayload.type = 'iceberg';
        algoOrderPayload.icebergDisclosedPercent = parseInt(icebergPercent) || 20;
      }
    } else if (algoStrategy === 'vwap') {
      algoOrderPayload.type = 'vwap';
      algoOrderPayload.vwapTargetVolumeDepth = parseInt(vwapTargetDepth) || 100;
    } else if (algoStrategy === 'trailing-stop') {
      algoOrderPayload.type = 'trailing-stop';
      algoOrderPayload.trailingStopPercent = parseFloat(trailingStopPct) || 2;
      algoOrderPayload.trailingHighestPrice = selectedAsset.price;
      algoOrderPayload.trailingActivationPrice = selectedAsset.price;
    } else if (algoStrategy === 'bracket') {
      algoOrderPayload.type = 'bracket';
      algoOrderPayload.price = selectedAsset.price; // Limit order execution trigger
      algoOrderPayload.bracketTakeProfit = parseFloat(bracketTP) || (selectedAsset.price * 1.05);
      algoOrderPayload.bracketStopLoss = parseFloat(bracketSL) || (selectedAsset.price * 0.95);
    }

    onExecuteAlgoOrder(algoOrderPayload);
    setAmountInput('');
    setTradeError('');
  };

  const handleStartGridBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError('');

    const lower = parseFloat(gridLower);
    const upper = parseFloat(gridUpper);
    const count = parseInt(gridCount);
    const invest = parseFloat(gridInvestment);

    if (!lower || lower <= 0 || !upper || upper <= 0 || lower >= upper) {
      setTradeError('Invalid price range boundaries');
      return;
    }
    if (!count || count < 2 || count > 15) {
      setTradeError('Grid density must be between 2 and 15 lines');
      return;
    }
    const usdcAvail = balances['USDC'] || 0;
    if (invest > usdcAvail) {
      setTradeError(`Insufficient USDC to fund grid bot. Available: $${usdcAvail.toFixed(2)}`);
      return;
    }

    onStartGridBot({
      symbol: tradeAsset,
      lowerPrice: lower,
      upperPrice: upper,
      gridCount: count,
      investmentAmount: invest,
      active: true,
      gridLevels: [], // App.tsx will initialize actual levels evenly
    });

    setTradeError('');
  };

  const handleExecuteSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSwapError('');

    const amt = parseFloat(swapFromAmount);
    if (!amt || amt <= 0) {
      setSwapError('Please enter a valid swap amount');
      return;
    }

    const available = balances[swapFrom] || 0;
    if (amt > available) {
      setSwapError(`Insufficient ${swapFrom} balance. Has ${available.toLocaleString()} ${swapFrom}`);
      return;
    }

    onExecuteSwap(swapFrom, swapTo, amt, swapToAmount);
    setSwapFromAmount('');
  };

  const handleTriggerArbitrage = (path: ArbitragePath) => {
    setArbitrageCaptured(path.id);
    const totalInput = 10000; // Arbitrage standard amount
    const gain = totalInput * (path.anomalousReturnPercent / 100);
    
    setTimeout(() => {
      // Execute Swap in the background and credit user
      onExecuteSwap('USDC', 'USDC', totalInput, totalInput + gain);
      setArbitrageCaptured(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Asset Overview Ticker */}
      <div id="trade-ticker" className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        {circuitBreakerArmed && (
          <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-500" title="Volatility Shield Armed" />
        )}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-sans font-bold text-white tracking-wide">{selectedAsset.symbol} / USDC</span>
              <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                selectedAsset.change24h >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
              }`}>
                {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h.toFixed(2)}%
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Nexus Asset spot feed • ATR: {(selectedAsset.price * 0.015).toFixed(4)} SOL</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Spot Value</span>
            <span className="text-sm font-mono font-bold text-white">
              ${selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 uppercase">24h Spread High</span>
            <span className="text-sm font-mono font-semibold text-slate-300">
              ${(selectedAsset.price * 1.034).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 uppercase">24h Spread Low</span>
            <span className="text-sm font-mono font-semibold text-slate-300">
              ${(selectedAsset.price * 0.971).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Volatility Guard</span>
            <span className={`text-xs font-mono font-bold ${circuitBreakerArmed ? 'text-emerald-400' : 'text-slate-500'}`}>
              {circuitBreakerArmed ? 'ARMED (SHIELD ON)' : 'DISARMED'}
            </span>
          </div>
        </div>
      </div>

      {/* Trading Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Order Form with Tabs (4 cols) */}
        <div id="order-form-card" className="lg:col-span-4 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            {/* Multi-Terminal Tab Navigation */}
            <div className="grid grid-cols-3 bg-slate-950 border border-slate-900/80 p-1 rounded-xl mb-4">
              <button
                onClick={() => { setActiveTerminalTab('spot'); setTradeError(''); }}
                className={`py-1 text-[10px] font-mono font-bold rounded-lg transition-all ${
                  activeTerminalTab === 'spot' ? 'bg-slate-900 text-cyan-400 border border-slate-800' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                SPOT
              </button>
              <button
                onClick={() => { setActiveTerminalTab('algo'); setTradeError(''); }}
                className={`py-1 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTerminalTab === 'algo' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Cpu className="w-3 h-3" />
                ALGO
              </button>
              <button
                onClick={() => { setActiveTerminalTab('grid'); setTradeError(''); }}
                className={`py-1 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTerminalTab === 'grid' ? 'bg-slate-900 text-purple-400 border border-slate-800' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Layers className="w-3 h-3" />
                GRID BOT
              </button>
            </div>

            {/* SHARED BUY/SELL & ASSET SECTOR */}
            {activeTerminalTab !== 'grid' && (
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 bg-slate-900/60 p-1 rounded-xl border border-slate-900">
                  <button
                    id="trade-side-buy"
                    type="button"
                    onClick={() => { setTradeSide('buy'); setTradeError(''); }}
                    className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                      tradeSide === 'buy' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    id="trade-side-sell"
                    type="button"
                    onClick={() => { setTradeSide('sell'); setTradeError(''); }}
                    className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                      tradeSide === 'sell' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    SELL
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <label className="text-slate-400 font-bold uppercase text-[9px]">Target Asset</label>
                    <span className="text-slate-500">
                      Avail: {tradeSide === 'buy' 
                        ? `$${(balances['USDC'] || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`
                        : `${(balances[tradeAsset] || 0).toLocaleString('en-US', { maximumFractionDigits: 4 })} ${tradeAsset}`
                      }
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      id="trade-asset-select"
                      value={tradeAsset}
                      onChange={(e) => { setTradeAsset(e.target.value); setTradeError(''); }}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors appearance-none cursor-pointer font-sans font-semibold"
                    >
                      {assets.filter(a => a.symbol !== 'USDC').map((asset) => (
                        <option key={asset.symbol} value={asset.symbol}>{asset.symbol} ({asset.name})</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 1. SPOT */}
            {activeTerminalTab === 'spot' && (
              <form onSubmit={handleExecuteTradeSubmit} className="space-y-4">
                {/* Order Type Tabs */}
                <div className="grid grid-cols-2 bg-slate-900/40 p-0.5 rounded-lg border border-slate-900">
                  <button
                    id="trade-type-market"
                    type="button"
                    onClick={() => { setTradeType('market'); setTradeError(''); }}
                    className={`py-1 text-[10px] font-mono font-medium rounded-md transition-all ${
                      tradeType === 'market' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    MARKET
                  </button>
                  <button
                    id="trade-type-limit"
                    type="button"
                    onClick={() => { setTradeType('limit'); setTradeError(''); }}
                    className={`py-1 text-[10px] font-mono font-medium rounded-md transition-all ${
                      tradeType === 'limit' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    LIMIT
                  </button>
                </div>

                {tradeType === 'limit' && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">Limit Price (USDC)</label>
                    <div className="relative">
                      <input
                        id="trade-price-input"
                        type="number"
                        step="any"
                        value={limitPriceInput}
                        onChange={(e) => setLimitPriceInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-500">USDC</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Order Amount</label>
                  <div className="relative">
                    <input
                      id="trade-amount-input"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-500">{tradeAsset}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {['25', '50', '75', '100'].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentClick(parseInt(pct))}
                      className="py-1 bg-slate-900 hover:bg-slate-850 text-[10px] font-mono text-slate-400 hover:text-slate-200 border border-slate-850 rounded-lg transition-colors cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Costs Summary */}
                <div className="p-3 bg-slate-900/30 border border-slate-900/60 rounded-xl space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="text-slate-200">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Fee (0.5%):</span>
                    <span className="text-slate-200">${protocolFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-900/80 my-1"></div>
                  <div className="flex justify-between font-bold text-white">
                    <span>Grand Total:</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {tradeError && <p className="text-xs font-mono text-red-400 mt-1">{tradeError}</p>}

                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-sans font-bold text-xs shadow-lg cursor-pointer text-slate-950 tracking-wider transition duration-150 ${
                    tradeSide === 'buy' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-red-400 hover:bg-red-300'
                  }`}
                >
                  EXECUTE {tradeSide.toUpperCase()} ORDER
                </button>
              </form>
            )}

            {/* TAB CONTENT: 2. ALGORITHMIC ENGINE */}
            {activeTerminalTab === 'algo' && (
              <form onSubmit={handleExecuteAlgoSubmit} className="space-y-4">
                {/* Algo Strategies Tab Selector */}
                <div className="grid grid-cols-4 gap-1 bg-slate-950 border border-slate-900/60 p-1 rounded-xl">
                  {['twap', 'vwap', 'trailing-stop', 'bracket'].map((strat) => (
                    <button
                      key={strat}
                      type="button"
                      onClick={() => setAlgoStrategy(strat as any)}
                      className={`py-1 text-[9px] font-mono font-bold rounded-lg transition-all ${
                        algoStrategy === strat ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-500'
                      }`}
                    >
                      {strat.replace('-', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Strategy Form Fields */}
                {algoStrategy === 'twap' && (
                  <div className="space-y-3.5 p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" /> Time-Weighted Average (TWAP)
                      </span>
                      <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" title="Slices order into intervals to minimize slippage." />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400 uppercase">Modular Slices</label>
                        <input
                          type="number"
                          value={twapSlices}
                          onChange={(e) => setTwapSlices(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400 uppercase">Interval (Secs)</label>
                        <input
                          type="number"
                          value={twapInterval}
                          onChange={(e) => setTwapInterval(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Iceberg Order Fragmenter Toggle */}
                    <div className="border-t border-slate-900/60 pt-3 flex flex-col gap-2.5">
                      <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={icebergEnabled}
                          onChange={(e) => setIcebergEnabled(e.target.checked)}
                          className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0"
                        />
                        <span className="flex items-center gap-1.5 font-bold">
                          <Layers className="w-3 h-3 text-cyan-400" />
                          ICEBERG FRAGMENTATION
                        </span>
                      </label>
                      {icebergEnabled && (
                        <div className="space-y-1 p-2 bg-slate-900/40 border border-slate-900 rounded-lg">
                          <div className="flex justify-between text-[9px] font-mono text-slate-500">
                            <span>PUBLIC DISCLOSED VOLUME %</span>
                            <span className="text-cyan-400">{icebergPercent}%</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="80"
                            step="5"
                            value={icebergPercent}
                            onChange={(e) => setIcebergPercent(e.target.value)}
                            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                          <p className="text-[8px] text-slate-500 font-mono leading-relaxed mt-1">
                            Only {icebergPercent}% will sit in the public book depth. {100 - parseInt(icebergPercent)}% remains hidden.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {algoStrategy === 'vwap' && (
                  <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl">
                    <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" /> Volume-Weighted Average (VWAP)
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Calculates real-time market depth and dynamically fills allocations only when local momentum supports low slippage benchmarks.
                    </p>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">Target Depth (Asset Vol)</label>
                      <input
                        type="number"
                        value={vwapTargetDepth}
                        onChange={(e) => setVwapTargetDepth(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        placeholder="SOL volume"
                      />
                    </div>
                  </div>
                )}

                {algoStrategy === 'trailing-stop' && (
                  <div className="space-y-3.5 p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl">
                    <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" /> Trailing Stop & ATR Buffer
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400 uppercase">Stop Offset %</label>
                        <input
                          type="number"
                          step="0.1"
                          value={trailingStopPct}
                          onChange={(e) => setTrailingStopPct(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400 uppercase">ATR Multiplier</label>
                        <input
                          type="number"
                          step="0.1"
                          value={atrMultiplier}
                          onChange={(e) => setAtrMultiplier(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="p-2 bg-slate-900/40 border border-slate-900 rounded-lg text-[9px] font-mono text-slate-500 leading-relaxed flex items-start gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Volatility Buffer is ACTIVE. Offset will widen during high ATR periods to prevent premature trigger.</span>
                    </div>
                  </div>
                )}

                {algoStrategy === 'bracket' && (
                  <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl">
                    <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 animate-pulse" /> Bracket OCO Interface
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                      Concurrently places dual target levels. When either is reached, the state machine kills the orphan order immediately.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-emerald-500 uppercase font-bold">Take Profit (USD)</label>
                        <input
                          type="number"
                          step="any"
                          value={bracketTP}
                          onChange={(e) => setBracketTP(e.target.value)}
                          className="w-full bg-slate-950 border border-emerald-900 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-red-500 uppercase font-bold">Stop Loss (USD)</label>
                        <input
                          type="number"
                          step="any"
                          value={bracketSL}
                          onChange={(e) => setBracketSL(e.target.value)}
                          className="w-full bg-slate-950 border border-red-900 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Entry */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Strategy Investment Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-500">{tradeAsset}</span>
                  </div>
                </div>

                {tradeError && <p className="text-xs font-mono text-red-400 mt-1">{tradeError}</p>}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-lg transition tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Cpu className="w-4 h-4 text-slate-950" />
                  LAUNCH ALGORITHMIC COUPLING
                </button>
              </form>
            )}

            {/* TAB CONTENT: 3. DECENTRALIZED GRID TRADING */}
            {activeTerminalTab === 'grid' && (
              <form onSubmit={handleStartGridBotSubmit} className="space-y-4">
                <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-400 font-sans flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> High-Frequency Grid Bot
                    </span>
                    <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" title="Configures dense buy/sell thresholds to trade volatility." />
                  </div>

                  {/* Range bounds */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">Lower Boundary (USD)</label>
                      <input
                        type="number"
                        step="any"
                        value={gridLower}
                        onChange={(e) => setGridLower(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">Upper Boundary (USD)</label>
                      <input
                        type="number"
                        step="any"
                        value={gridUpper}
                        onChange={(e) => setGridUpper(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Density and Capital allocation */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">Grid Density (Lines)</label>
                      <input
                        type="number"
                        min="3"
                        max="12"
                        value={gridCount}
                        onChange={(e) => setGridCount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">Allocation (USDC)</label>
                      <input
                        type="number"
                        value={gridInvestment}
                        onChange={(e) => setGridInvestment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Underlying Asset</label>
                  <select
                    value={tradeAsset}
                    onChange={(e) => setTradeAsset(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                  >
                    {assets.filter(a => a.symbol !== 'USDC').map((asset) => (
                      <option key={asset.symbol} value={asset.symbol}>{asset.symbol} ({asset.name})</option>
                    ))}
                  </select>
                </div>

                {tradeError && <p className="text-xs font-mono text-red-400 mt-1">{tradeError}</p>}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-lg transition tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 text-slate-950" />
                  INITIALIZE GRID MATRIX BOT
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Center: Live Order Book with visual overlays (4 cols) */}
        <div id="order-book-card" className="lg:col-span-4 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans font-semibold text-slate-300">Live Depth Order Book</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{tradeAsset} Matcher</span>
            </div>

            {/* Asks (Sells) */}
            <div className="space-y-1 mb-2.5">
              {orderBook.asks.map((ask, idx) => (
                <div key={`ask-${idx}`} className="relative h-5 flex items-center justify-between text-[11px] font-mono">
                  {/* Depth Bar */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-red-950/15 border-r-2 border-red-500/25 transition-all duration-300"
                    style={{ width: `${(ask.total / maxDepthSize) * 100}%` }}
                  />
                  <span className="text-red-400 z-10 font-bold">${ask.price.toFixed(2)}</span>
                  <span className="text-slate-300 z-10">{ask.size.toFixed(3)}</span>
                  <span className="text-slate-500 z-10 mr-1">{ask.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Live Spread Row */}
            <div className="py-2 border-y border-slate-900/80 my-2 flex items-center justify-between px-1">
              <span className="text-xs font-mono text-slate-400">Spread Offset</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-white">${selectedAsset.price.toFixed(2)}</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/50 px-1 py-0.25 rounded">0.02%</span>
              </div>
            </div>

            {/* Bids (Buys) */}
            <div className="space-y-1">
              {orderBook.bids.map((bid, idx) => (
                <div key={`bid-${idx}`} className="relative h-5 flex items-center justify-between text-[11px] font-mono">
                  {/* Depth Bar */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-emerald-950/15 border-r-2 border-emerald-500/25 transition-all duration-300"
                    style={{ width: `${(bid.total / maxDepthSize) * 100}%` }}
                  />
                  <span className="text-emerald-400 z-10 font-bold">${bid.price.toFixed(2)}</span>
                  <span className="text-slate-300 z-10">{bid.size.toFixed(3)}</span>
                  <span className="text-slate-500 z-10 mr-1">{bid.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Swap Widget & Active Limit Orders (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Swap Widget */}
          <div id="swap-widget-card" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
            <form onSubmit={handleExecuteSwapSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-xs font-sans font-semibold text-slate-300">Frictionless Swap Widget</span>
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  Rate lock: {timeLeft}s
                </div>
              </div>

              {/* FROM field */}
              <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>Pay From</span>
                  <span>Avail: {(balances[swapFrom] || 0).toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="swap-amount-input"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={swapFromAmount}
                    onChange={(e) => setSwapFromAmount(e.target.value)}
                    className="w-full bg-transparent text-sm font-mono text-white focus:outline-none placeholder-slate-700"
                  />
                  <select
                    id="swap-from-select"
                    value={swapFrom}
                    onChange={(e) => { setSwapFrom(e.target.value); setSwapError(''); }}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1 font-sans font-semibold focus:outline-none cursor-pointer"
                  >
                    {assets.map((asset) => (
                      <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SWAP icon bridge */}
              <div className="flex justify-center -my-2.5 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    const temp = swapFrom;
                    setSwapFrom(swapTo);
                    setSwapTo(temp);
                    setSwapFromAmount('');
                  }}
                  className="p-1.5 bg-slate-900 hover:bg-slate-850 text-cyan-400 border border-slate-800 hover:border-slate-700 rounded-lg shadow-md hover:shadow-cyan-500/5 transition-all cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
                </button>
              </div>

              {/* TO field */}
              <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>Receive Target</span>
                  <span>Avail: {(balances[swapTo] || 0).toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-slate-300">
                    {swapToAmount > 0 ? swapToAmount.toLocaleString('en-US', { maximumFractionDigits: 6 }) : '0.00'}
                  </span>
                  <select
                    id="swap-to-select"
                    value={swapTo}
                    onChange={(e) => { setSwapTo(e.target.value); setSwapError(''); }}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1 font-sans font-semibold focus:outline-none cursor-pointer"
                  >
                    {assets.map((asset) => (
                      <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
                <span>Direct rate index:</span>
                <span>1 {swapFrom} ≈ {swapRate.toFixed(6)} {swapTo}</span>
              </div>

              {swapError && (
                <p className="text-xs font-mono text-red-400 mt-1">{swapError}</p>
              )}

              <button
                id="swap-execute-btn"
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                SWAP ASSETS INSTANTLY
              </button>
            </form>
          </div>

          {/* Active Order Queue (Spot & Algorithmic & Grid levels) */}
          <div id="active-orders-card" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex-1">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
              <span className="text-xs font-sans font-semibold text-slate-300">Active Queue</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Pending / Algorithmic</span>
            </div>

            {activeOrders.length === 0 && gridBots.filter(b => b.active).length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-900/60 rounded-xl">
                <p className="text-[11px] font-mono text-slate-500">No active limit or algo orders in queue</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {/* Active Grid Bots */}
                {gridBots.filter(bot => bot.active).map(bot => (
                  <div key={bot.id} className="p-3 bg-purple-950/15 border border-purple-900/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="font-sans font-bold text-slate-200">GRID BOT • {bot.symbol}</span>
                      </div>
                      <button
                        onClick={() => onStopGridBot(bot.id)}
                        className="px-1.5 py-0.5 bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-400 rounded text-[9px] font-mono cursor-pointer"
                      >
                        STOP
                      </button>
                    </div>
                    <div className="grid grid-cols-2 text-[10px] font-mono text-slate-500">
                      <div>Range: <span className="text-slate-300">${bot.lowerPrice} - ${bot.upperPrice}</span></div>
                      <div className="text-right">Earnings: <span className="text-emerald-400 font-bold">+${bot.profitEarned.toFixed(2)}</span></div>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-900">
                      <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{ width: '100%' }} />
                    </div>
                  </div>
                ))}

                {/* Normal / Algo Orders */}
                {activeOrders.map((order) => {
                  const isAlgo = ['twap', 'vwap', 'trailing-stop', 'bracket', 'iceberg'].includes(order.type);
                  return (
                    <div key={order.id} className={`p-3 border rounded-xl flex items-center justify-between text-xs ${
                      isAlgo ? 'bg-emerald-950/10 border-emerald-900/30' : 'bg-slate-900/20 border-slate-900'
                    }`}>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold ${order.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {order.side.toUpperCase()}
                          </span>
                          <span className="font-sans font-semibold text-slate-200">{order.symbol}</span>
                          {isAlgo && (
                            <span className="px-1 bg-emerald-950 text-emerald-400 border border-emerald-900/40 rounded text-[8px] font-mono uppercase font-bold">
                              {order.type}
                            </span>
                          )}
                        </div>

                        {/* Custom order specific details */}
                        {order.type === 'limit' && (
                          <span className="text-[10px] font-mono text-slate-500">Price: ${order.price.toFixed(2)}</span>
                        )}
                        {order.type === 'twap' && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Slices: {order.twapFilledChunks}/{order.twapTotalChunks} • Int: {order.twapIntervalSeconds}s
                          </span>
                        )}
                        {order.type === 'iceberg' && (
                          <span className="text-[10px] font-mono text-cyan-400">
                            Iceberg ({order.icebergDisclosedPercent}% disclosed) • {order.twapFilledChunks}/{order.twapTotalChunks} filled
                          </span>
                        )}
                        {order.type === 'trailing-stop' && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Trailing Dist: {order.trailingStopPercent}% • High: ${order.trailingHighestPrice?.toFixed(2)}
                          </span>
                        )}
                        {order.type === 'bracket' && (
                          <div className="flex flex-col text-[9px] font-mono text-slate-500">
                            <span className="text-emerald-500">TP: ${order.bracketTakeProfit?.toFixed(2)}</span>
                            <span className="text-red-500">SL: ${order.bracketStopLoss?.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right flex items-center gap-2.5">
                        <div className="flex flex-col">
                          <span className="font-mono text-slate-300">{order.amount} {order.symbol}</span>
                          <span className="text-[9px] font-mono text-cyan-400">
                            {order.type === 'twap' || order.type === 'iceberg' 
                              ? `${((order.twapFilledChunks || 0) / (order.twapTotalChunks || 1) * 100).toFixed(0)}% Filled` 
                              : '0% Filled'}
                          </span>
                        </div>
                        <button
                          id={`cancel-order-${order.id}`}
                          onClick={() => onCancelOrder(order.id)}
                          className="px-2 py-1 bg-red-950/40 hover:bg-red-900 text-red-400 rounded-lg text-[10px] font-mono transition cursor-pointer border border-red-900/30"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: Algorithmic Arbitrage Path Optimizer & Volatility Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols: Multi-Hop Arbitrage Path Optimizer (Features 5) */}
        <div id="arbitrage-optimizer" className="lg:col-span-7 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-sans font-semibold text-slate-300">Multi-Hop Arbitrage Path Optimizer</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Cross-Pair Deviation Scanner</span>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
            Real-time atomic scanner analyzing microscopic pricing anomalies across linked pools. Execute atomic loops instantly to capture risk-free spreads.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {arbitragePaths.map((path) => {
              const isCapturing = arbitrageCaptured === path.id;
              
              return (
                <div key={path.id} className="p-4 bg-slate-950/60 border border-slate-900 hover:border-slate-800 rounded-xl space-y-4 transition-colors">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/40 rounded-lg font-bold">
                      +{path.anomalousReturnPercent}% Spread
                    </span>
                    <span className="text-slate-500">Depth: ${path.liquidityDepthUsd.toLocaleString()}</span>
                  </div>

                  {/* Node loop visualizer */}
                  <div className="flex items-center justify-between px-2 py-2 bg-slate-900/30 border border-slate-900 rounded-lg">
                    {path.route.map((token, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono font-bold text-white px-2 py-1 bg-slate-950 border border-slate-800 rounded">
                            {token}
                          </span>
                        </div>
                        {idx < path.route.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-cyan-500/50 animate-pulse" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <button
                    onClick={() => handleTriggerArbitrage(path)}
                    disabled={isCapturing}
                    className={`w-full py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      isCapturing 
                        ? 'bg-emerald-900 text-emerald-100 border border-emerald-700' 
                        : 'bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-900/60'
                    }`}
                  >
                    {isCapturing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        SWEEPING LOOP ESCROW...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        CAPTURE ARBITRAGE
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Volatility Controls & Slippage Auto-Mitigation Console (Features 6 & 9) */}
        <div id="volatility-control-console" className="lg:col-span-5 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-sans font-semibold text-slate-300">Volatility & Slippage Sentinel</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Risk Guard</span>
            </div>

            {/* Part A: Dynamic Slippage Auto-Mitigation Engine */}
            <div className="space-y-3.5 pb-4 border-b border-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-sans flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" /> Slippage Auto-Mitigation
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  dynamicImpactSlippage < 0.1 ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400 animate-pulse'
                }`}>
                  {dynamicImpactSlippage < 0.1 ? 'OPTIMAL DEPTH' : 'SLIPPAGE EXPOSURE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-slate-900/20 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase block">Impact Slippage</span>
                  <span className="text-white font-bold text-xs mt-0.5">{(dynamicImpactSlippage * 100).toFixed(3)}%</span>
                </div>
                <div className="p-2.5 bg-slate-900/20 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase block">Book Thickness Index</span>
                  <span className="text-cyan-400 font-bold text-xs mt-0.5">{liquidityDepthIndex} / 100</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <label className="text-slate-400">Slippage Tolerance Threshold</label>
                  <span className="text-cyan-400 font-bold">{slippagePercent}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    disabled={autoSlippage}
                    value={slippagePercent}
                    onChange={(e) => setSlippagePercent(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
                  />
                  <button
                    onClick={() => setAutoSlippage(!autoSlippage)}
                    className={`px-2 py-1 text-[9px] font-mono font-bold rounded border shrink-0 cursor-pointer transition ${
                      autoSlippage 
                        ? 'bg-cyan-950 border-cyan-800 text-cyan-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {autoSlippage ? 'AUTO' : 'MANUAL'}
                  </button>
                </div>
              </div>
            </div>

            {/* Part B: Flash-Crash Volatility Circuit Breaker */}
            <div className="space-y-3.5 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-sans flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-400 animate-pulse" /> Volatility Circuit Breaker
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  circuitBreakerArmed ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-slate-500'
                }`}>
                  {circuitBreakerArmed ? 'ARMED & SHIELDED' : 'STANDBY'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase">Panic Percent Threshold</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      disabled={!circuitBreakerArmed}
                      value={circuitBreakerPercent}
                      onChange={(e) => onToggleCircuitBreaker(circuitBreakerArmed, parseFloat(e.target.value) || 2.0)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1.5 text-xs font-mono text-slate-500">%</span>
                  </div>
                </div>
                <button
                  onClick={() => onToggleCircuitBreaker(!circuitBreakerArmed, circuitBreakerPercent)}
                  className={`px-4 py-3 text-xs font-mono font-bold rounded-xl border cursor-pointer transition shrink-0 ${
                    circuitBreakerArmed 
                      ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400' 
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                  }`}
                >
                  {circuitBreakerArmed ? 'DISARM SHIELD' : 'ARM SHIELD'}
                </button>
              </div>

              <button
                onClick={onTriggerPanic}
                className="w-full py-2.5 bg-red-950/40 border border-red-900/50 hover:bg-red-900 text-red-400 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg transition"
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                TRIGGER DEFENSIVE EMERGENCY STOP (PANIC BUTTON)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
