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
  Percent,
  Plus,
  Minus,
  Smile,
  Lock,
  Sparkle
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
  isSandboxActive?: boolean;
}

// Generate friendly live order book asks & bids (Live Buy & Sell Queue)
function generateOrderBook(basePrice: number, seed: number = 0) {
  const bids: { price: number; size: number; total: number }[] = [];
  const asks: { price: number; size: number; total: number }[] = [];

  for (let i = 1; i <= 6; i++) {
    const p = basePrice * (1 + (i * 0.0007) + (Math.sin(seed + i) * 0.0002));
    const s = 1.0 * i * (1.1 + Math.cos(seed - i) * 0.4) + 0.1;
    asks.push({ price: p, size: s, total: s * p });
  }

  for (let i = 1; i <= 6; i++) {
    const p = basePrice * (1 - (i * 0.0007) - (Math.cos(seed + i) * 0.0002));
    const s = 1.2 * i * (1.1 + Math.sin(seed + i) * 0.5) + 0.2;
    bids.push({ price: p, size: s, total: s * p });
  }

  asks.sort((a, b) => b.price - a.price);
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
  onTriggerPanic,
  isSandboxActive = false
}: TradingViewProps) {
  // Main simplified beginner tabs: 'buy' | 'limit' | 'swap'
  const [activeMainTab, setActiveMainTab] = useState<'buy' | 'limit' | 'swap'>('buy');

  // Curious explorers panel state (holds complex TWAP/Grid Bots)
  const [showAdvancedBots, setShowAdvancedBots] = useState(false);
  const [algoStrategy, setAlgoStrategy] = useState<'twap' | 'vwap' | 'trailing-stop' | 'bracket'>('twap');

  // Input states
  const [tradeAsset, setTradeAsset] = useState('SOL');
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  
  // Custom smart inputs for beginners
  const [usdSpendAmount, setUsdSpendAmount] = useState('50'); // Default $50 Regular Money
  const [coinSellAmount, setCoinSellAmount] = useState('1'); // Default 1 Coin
  const [customTargetPrice, setCustomTargetPrice] = useState('145.00');

  // Form errors
  const [tradeError, setTradeError] = useState('');
  const [swapError, setSwapError] = useState('');

  // TWAP/Grid inputs
  const [twapSlices, setTwapSlices] = useState('5');
  const [twapInterval, setTwapInterval] = useState('15');
  const [icebergEnabled, setIcebergEnabled] = useState(false);
  const [icebergPercent, setIcebergPercent] = useState('20');
  const [vwapTargetDepth, setVwapTargetDepth] = useState('120');
  const [trailingStopPct, setTrailingStopPct] = useState('2.5');
  const [atrMultiplier, setAtrMultiplier] = useState('2.0');
  const [bracketTP, setBracketTP] = useState('');
  const [bracketSL, setBracketSL] = useState('');
  const [gridLower, setGridLower] = useState('');
  const [gridUpper, setGridUpper] = useState('');
  const [gridCount, setGridCount] = useState('6');
  const [gridInvestment, setGridInvestment] = useState('500');

  // Swap Form State
  const [swapFrom, setSwapFrom] = useState('USDC');
  const [swapTo, setSwapTo] = useState('SOL');
  const [swapFromAmount, setSwapFromAmount] = useState('50');
  const [swapRate, setSwapRate] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);

  // Active book seed simulation
  const [bookSeed, setBookSeed] = useState(0);

  // Slippage settings (Price Change Buffer)
  const [slippagePercent, setSlippagePercent] = useState(0.5);
  const [autoSlippage, setAutoSlippage] = useState(true);

  // Selected Asset Info
  const selectedAsset = useMemo(() => {
    return assets.find(a => a.symbol === tradeAsset) || assets[0];
  }, [assets, tradeAsset]);

  // Set default values when target asset changes
  useEffect(() => {
    if (selectedAsset) {
      setCustomTargetPrice(selectedAsset.price.toFixed(2));
      setGridLower((selectedAsset.price * 0.92).toFixed(2));
      setGridUpper((selectedAsset.price * 1.08).toFixed(2));
      setBracketTP((selectedAsset.price * 1.06).toFixed(2));
      setBracketSL((selectedAsset.price * 0.94).toFixed(2));
    }
  }, [selectedAsset, tradeAsset]);

  // Live simulation of Order Book updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBookSeed(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const orderBook = useMemo(() => {
    return generateOrderBook(selectedAsset.price, bookSeed);
  }, [selectedAsset, bookSeed]);

  const maxDepthSize = useMemo(() => {
    const allSizes = [...orderBook.bids, ...orderBook.asks].map(item => item.total);
    return Math.max(...allSizes, 1);
  }, [orderBook]);

  // Pricing calculations
  const currentPrice = selectedAsset.price;
  const targetPriceNumber = activeMainTab === 'limit' ? parseFloat(customTargetPrice) || currentPrice : currentPrice;

  // Let's calculate equivalent amount based on input type
  const estimatedAmountOfCoins = useMemo(() => {
    if (tradeSide === 'buy') {
      const spend = parseFloat(usdSpendAmount) || 0;
      return spend / targetPriceNumber;
    } else {
      return parseFloat(coinSellAmount) || 0;
    }
  }, [tradeSide, usdSpendAmount, coinSellAmount, targetPriceNumber]);

  const subtotal = useMemo(() => {
    if (tradeSide === 'buy') {
      return parseFloat(usdSpendAmount) || 0;
    } else {
      const coins = parseFloat(coinSellAmount) || 0;
      return coins * targetPriceNumber;
    }
  }, [tradeSide, usdSpendAmount, coinSellAmount, targetPriceNumber]);

  // Delivery Fee is protocol fee
  const protocolFee = subtotal * 0.005; // 0.5%
  const grandTotal = tradeSide === 'buy' ? subtotal + protocolFee : subtotal - protocolFee;

  // Swap rates
  const fromAsset = useMemo(() => assets.find(a => a.symbol === swapFrom), [assets, swapFrom]);
  const toAsset = useMemo(() => assets.find(a => a.symbol === swapTo), [assets, swapTo]);

  useEffect(() => {
    if (fromAsset && toAsset) {
      setSwapRate(fromAsset.price / toAsset.price);
    }
  }, [fromAsset, toAsset]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setBookSeed(s => s + 1);
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

  // Arbitrage capturing
  const [arbitrageCaptured, setArbitrageCaptured] = useState<string | null>(null);
  const [arbTick, setArbTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setArbTick(t => t + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const arbitragePaths: ArbitragePath[] = useMemo(() => {
    const solPrice = assets.find(a => a.symbol === 'SOL')?.price || 145;
    const deviation1 = 0.15 + Math.sin(arbTick * 0.8) * 0.08;
    const deviation2 = 0.07 + Math.cos(arbTick * 0.5) * 0.04;

    return [
      {
        id: 'arb-path-1',
        route: ['USDC', 'SOL', 'ETH', 'USDC'],
        anomalousReturnPercent: parseFloat(Math.max(0.02, deviation1).toFixed(2)),
        liquidityDepthUsd: 152000 + (arbTick % 4) * 8000,
      },
      {
        id: 'arb-path-2',
        route: ['USDC', 'LINK', 'DOT', 'USDC'],
        anomalousReturnPercent: parseFloat(Math.max(0.01, deviation2).toFixed(2)),
        liquidityDepthUsd: 79000 - (arbTick % 3) * 4000,
      }
    ];
  }, [assets, arbTick]);

  // Price adjuster buttons helper
  const adjustTargetPrice = (percentChange: number) => {
    const current = parseFloat(customTargetPrice) || selectedAsset.price;
    const nextVal = current * (1 + percentChange);
    setCustomTargetPrice(nextVal.toFixed(2));
  };

  const handlePercentClick = (percent: number) => {
    if (tradeSide === 'buy') {
      const avail = balances['USDC'] || 0;
      const targetSpend = avail * (percent / 100);
      setUsdSpendAmount(targetSpend.toFixed(2));
    } else {
      const availCoins = balances[tradeAsset] || 0;
      const targetCoins = availCoins * (percent / 100);
      setCoinSellAmount(targetCoins.toFixed(4));
    }
  };

  // Submit Trade
  const handleExecuteTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError('');

    const coinAmt = estimatedAmountOfCoins;
    if (coinAmt <= 0) {
      setTradeError('Oops! Please write a valid amount to spend or sell.');
      return;
    }

    if (tradeSide === 'buy') {
      const usdNeeded = subtotal + protocolFee;
      const usdAvailable = balances['USDC'] || 0;
      if (usdNeeded > usdAvailable) {
        setTradeError(`Oops! You need $${usdNeeded.toFixed(2)} Regular Money to complete this, but you currently have $${usdAvailable.toFixed(2)} in your piggy bank.`);
        return;
      }
    } else {
      const tokensAvailable = balances[tradeAsset] || 0;
      const amountToSell = parseFloat(coinSellAmount) || 0;
      if (amountToSell > tokensAvailable) {
        setTradeError(`Oops! You don't own enough coins. You have ${tokensAvailable.toFixed(4)} ${tradeAsset} but you entered ${amountToSell.toFixed(4)}.`);
        return;
      }
    }

    // Execute through core function
    onExecuteTrade(
      tradeAsset, 
      tradeSide, 
      activeMainTab === 'buy' ? 'market' : 'limit', 
      coinAmt, 
      targetPriceNumber
    );

    // Friendly celebration reset
    setUsdSpendAmount('50');
    setCoinSellAmount('1');
    setTradeError('');
  };

  const handleExecuteSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSwapError('');

    const amt = parseFloat(swapFromAmount);
    if (!amt || amt <= 0) {
      setSwapError('Please write a valid amount to swap.');
      return;
    }

    const available = balances[swapFrom] || 0;
    if (amt > available) {
      setSwapError(`Oops! You don't have enough ${swapFrom} to swap. You have ${available.toFixed(4)} ${swapFrom} but entered ${amt}.`);
      return;
    }

    onExecuteSwap(swapFrom, swapTo, amt, swapToAmount);
    setSwapFromAmount('50');
  };

  const handleTriggerArbitrage = (path: ArbitragePath) => {
    setArbitrageCaptured(path.id);
    const amountToPlay = 500; // Simplified beginner play
    const profit = amountToPlay * (path.anomalousReturnPercent / 100);
    
    setTimeout(() => {
      onExecuteSwap('USDC', 'USDC', amountToPlay, amountToPlay + profit);
      setArbitrageCaptured(null);
    }, 1200);
  };

  const handleExecuteAlgoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError('');

    const coinAmt = estimatedAmountOfCoins;
    if (coinAmt <= 0) {
      setTradeError('Please write a valid amount to invest.');
      return;
    }

    const algoOrderPayload: Partial<ActiveOrder> = {
      symbol: tradeAsset,
      side: tradeSide,
      amount: coinAmt,
      price: selectedAsset.price,
      filled: 0,
      status: 'open',
    };

    if (algoStrategy === 'twap') {
      const slices = parseInt(twapSlices) || 5;
      algoOrderPayload.type = 'twap';
      algoOrderPayload.twapTotalChunks = slices;
      algoOrderPayload.twapFilledChunks = 0;
      algoOrderPayload.twapIntervalSeconds = parseInt(twapInterval) || 15;
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
      algoOrderPayload.bracketTakeProfit = parseFloat(bracketTP) || (selectedAsset.price * 1.05);
      algoOrderPayload.bracketStopLoss = parseFloat(bracketSL) || (selectedAsset.price * 0.95);
    }

    onExecuteAlgoOrder(algoOrderPayload);
    setUsdSpendAmount('50');
    setCoinSellAmount('1');
    setTradeError('');
  };

  const handleStartGridBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError('');

    const lower = parseFloat(gridLower);
    const upper = parseFloat(gridUpper);
    const count = parseInt(gridCount);
    const invest = parseFloat(gridInvestment);

    if (!lower || !upper || lower >= upper) {
      setTradeError('Oops! The lower price must be smaller than the upper price.');
      return;
    }

    const usdcAvail = balances['USDC'] || 0;
    if (invest > usdcAvail) {
      setTradeError(`Oops! You don't have enough Regular Money ($${invest.toFixed(2)}) to power this bot. Available: $${usdcAvail.toFixed(2)}.`);
      return;
    }

    onStartGridBot({
      symbol: tradeAsset,
      lowerPrice: lower,
      upperPrice: upper,
      gridCount: count,
      investmentAmount: invest,
      active: true,
      gridLevels: [],
    });
    setTradeError('');
  };

  const dynamicImpactSlippage = useMemo(() => {
    const base = 0.05;
    const qtyFactor = estimatedAmountOfCoins * 0.003;
    return parseFloat((base + qtyFactor).toFixed(3));
  }, [estimatedAmountOfCoins]);

  const liquidityDepthIndex = useMemo(() => {
    const base = 92.1;
    const flux = Math.sin(bookSeed * 0.4) * 5.2;
    return parseFloat((base + flux).toFixed(1));
  }, [bookSeed]);

  useEffect(() => {
    if (autoSlippage) {
      const optimal = Math.max(0.1, dynamicImpactSlippage * 1.4);
      setSlippagePercent(parseFloat(optimal.toFixed(2)));
    }
  }, [dynamicImpactSlippage, autoSlippage]);

  return (
    <div className="space-y-6">

      {isSandboxActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-2xl flex items-center justify-between gap-3 text-indigo-400"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-sans font-bold uppercase tracking-wider">Sandbox Simulation Active</span>
            <span className="text-[10px] font-mono bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900/30 text-indigo-300">
              Zero-Risk Mode
            </span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400/80 hidden sm:inline">
            Simulated parameters: Network delays, rate limits & packet loss inject rules active.
          </span>
        </motion.div>
      )}
      
      {/* Top Asset Overview Ticker */}
      <div id="trade-ticker" className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        {circuitBreakerArmed && (
          <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-500" title="Defensive Shield Armed" />
        )}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-sans font-bold text-white tracking-wide">{selectedAsset.symbol} Coin Price</span>
              <span className={`text-[10px] font-sans font-bold px-1.5 py-0.5 rounded ${
                selectedAsset.change24h >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
              }`}>
                {selectedAsset.change24h >= 0 ? 'Up ' : 'Down '}{Math.abs(selectedAsset.change24h).toFixed(2)}% today {selectedAsset.change24h >= 0 ? '🔥' : '🧊'}
              </span>
            </div>
            <span className="text-[10px] font-sans text-slate-400 leading-none">
              {selectedAsset.symbol} is currently valued at ${selectedAsset.price.toLocaleString()} in real-world Regular Money.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-sans text-slate-500 uppercase">Current Value</span>
            <span className="text-sm font-mono font-bold text-cyan-400">
              ${selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[10px] font-sans text-slate-500 uppercase">Highest Price Today</span>
            <span className="text-xs font-mono text-slate-300">
              ${(selectedAsset.price * 1.025).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[10px] font-sans text-slate-500 uppercase">Lowest Price Today</span>
            <span className="text-xs font-mono text-slate-300">
              ${(selectedAsset.price * 0.975).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-sans text-slate-500 uppercase flex items-center gap-1">
              Flash-Crash Guard <span title="Automatically stops trades if the price falls too fast to save your funds!" className="cursor-help"><HelpCircle className="w-3 h-3 text-slate-500" /></span>
            </span>
            <span className={`text-xs font-sans font-bold flex items-center gap-1 ${circuitBreakerArmed ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${circuitBreakerArmed ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
              {circuitBreakerArmed ? 'Active Shield On ✅' : 'Standby Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* THREE LARGE OBVIOUS TABS FOR BEGINNERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 border border-slate-900 p-1.5 rounded-3xl">
        <button
          onClick={() => { setActiveMainTab('buy'); setTradeError(''); }}
          className={`py-3.5 px-4 rounded-2xl font-sans font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeMainTab === 'buy' 
              ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow-lg shadow-cyan-950/20 scale-[1.01]' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>⚡ Instant Buy / Sell</span>
        </button>
        <button
          onClick={() => { setActiveMainTab('limit'); setTradeError(''); }}
          className={`py-3.5 px-4 rounded-2xl font-sans font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeMainTab === 'limit' 
              ? 'bg-slate-900 text-teal-400 border border-slate-800 shadow-lg shadow-teal-950/20 scale-[1.01]' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Sliders className="w-4 h-4 text-teal-400 shrink-0" />
          <span>🎯 Set Your Own Price</span>
        </button>
        <button
          onClick={() => { setActiveMainTab('swap'); setSwapError(''); }}
          className={`py-3.5 px-4 rounded-2xl font-sans font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeMainTab === 'swap' 
              ? 'bg-slate-900 text-purple-400 border border-slate-800 shadow-lg shadow-purple-950/20 scale-[1.01]' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 text-purple-400 shrink-0" />
          <span>🔄 Quick Coin Swap</span>
        </button>
      </div>

      {/* Main Terminal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Dynamic Core Beginner forms (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl backdrop-blur-md">
            
            {/* SUB-TABS: Buy vs Sell Selector (Only for Spot / Limit) */}
            {activeMainTab !== 'swap' && (
              <div className="grid grid-cols-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-900/80 mb-6">
                <button
                  type="button"
                  onClick={() => { setTradeSide('buy'); setTradeError(''); }}
                  className={`py-2 rounded-xl font-sans font-bold text-xs tracking-wide transition-all cursor-pointer ${
                    tradeSide === 'buy' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  🟢 Buy Digital Coins
                </button>
                <button
                  type="button"
                  onClick={() => { setTradeSide('sell'); setTradeError(''); }}
                  className={`py-2 rounded-xl font-sans font-bold text-xs tracking-wide transition-all cursor-pointer ${
                    tradeSide === 'sell' ? 'bg-slate-800 text-red-400 shadow-md' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  🔴 Sell My Coins
                </button>
              </div>
            )}

            {/* FORM 1: INSTANT BUY/SELL */}
            {activeMainTab === 'buy' && (
              <form onSubmit={handleExecuteTradeSubmit} className="space-y-6">
                
                {/* Coin selection */}
                <div className="space-y-2">
                  <label className="text-xs font-sans text-slate-400 uppercase tracking-wide flex items-center gap-1 font-bold">
                    1. Choose Coin
                  </label>
                  <div className="relative">
                    <select
                      id="trade-asset-select"
                      value={tradeAsset}
                      onChange={(e) => { setTradeAsset(e.target.value); setTradeError(''); }}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer font-sans font-bold"
                    >
                      {assets.filter(a => a.symbol !== 'USDC').map((asset) => (
                        <option key={asset.symbol} value={asset.symbol}>🪙 {asset.symbol} - {asset.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-4 pointer-events-none" />
                  </div>
                </div>

                {/* Amount selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <label className="text-slate-400 uppercase tracking-wide font-bold">
                      {tradeSide === 'buy' ? '2. How much do you want to buy? ($)' : '2. How many coins do you want to sell?'}
                    </label>
                    <span className="text-slate-400 font-semibold">
                      Your Piggy Bank: {tradeSide === 'buy' 
                        ? `$${(balances['USDC'] || 0).toLocaleString()} USDC (Regular Cash)`
                        : `${(balances[tradeAsset] || 0).toFixed(4)} ${tradeAsset} Coins`
                      }
                    </span>
                  </div>

                  <div className="relative">
                    {tradeSide === 'buy' ? (
                      <>
                        <input
                          id="trade-usd-input"
                          type="number"
                          step="any"
                          placeholder="e.g. 50"
                          value={usdSpendAmount}
                          onChange={(e) => setUsdSpendAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none font-mono"
                        />
                        <span className="absolute right-4 top-3 text-xs font-sans text-slate-500 font-bold bg-slate-900 px-2 py-1 rounded">USD</span>
                      </>
                    ) : (
                      <>
                        <input
                          id="trade-coin-input"
                          type="number"
                          step="any"
                          placeholder="e.g. 1.0"
                          value={coinSellAmount}
                          onChange={(e) => setCoinSellAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none font-mono"
                        />
                        <span className="absolute right-4 top-3 text-xs font-sans text-slate-500 font-bold bg-slate-900 px-2 py-1 rounded">{tradeAsset}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick percent helpers */}
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentClick(pct)}
                      className="py-1.5 bg-slate-900 hover:bg-slate-850 text-[11px] font-sans font-bold text-slate-400 hover:text-cyan-400 border border-slate-850 rounded-xl transition"
                    >
                      Use {pct}%
                    </button>
                  ))}
                </div>

                {/* Friendly visual analogy live preview */}
                <div className="p-4 bg-cyan-950/15 border border-cyan-900/30 rounded-2xl space-y-2 text-xs">
                  <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-cyan-400" /> Let's review what happens:
                  </p>
                  <p className="text-slate-300 leading-relaxed font-sans font-medium text-xs">
                    {tradeSide === 'buy' ? (
                      <span>
                        You are spending <strong className="text-white">${parseFloat(usdSpendAmount) || 0}</strong> of your Regular Cash to instantly receive roughly <strong className="text-cyan-400">{estimatedAmountOfCoins.toFixed(5)} {tradeAsset}</strong>.
                      </span>
                    ) : (
                      <span>
                        You are giving up <strong className="text-white">{parseFloat(coinSellAmount) || 0} {tradeAsset}</strong> coins to instantly receive roughly <strong className="text-emerald-400">${subtotal.toFixed(2)}</strong> of Regular Cash in your Piggy Bank.
                      </span>
                    )}
                  </p>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-900/60 pt-2 font-sans mt-2">
                    <span className="flex items-center gap-1">
                      Blockchain Delivery Fee 📦 
                      <span title="Paid to computers on the internet running the blockchain network so they process your order safely." className="cursor-help"><HelpCircle className="w-3.5 h-3.5 text-slate-600" /></span>
                    </span>
                    <span className="text-slate-300 font-semibold">${protocolFee.toFixed(2)}</span>
                  </div>
                </div>

                {tradeError && <p className="text-xs font-sans text-red-400 font-bold bg-red-950/20 border border-red-900/40 p-3 rounded-xl">⚠️ {tradeError}</p>}

                <button
                  type="submit"
                  className={`w-full py-4 rounded-2xl font-sans font-bold text-xs tracking-wider cursor-pointer text-slate-950 shadow-lg hover:scale-[1.01] transition-all duration-150 uppercase ${
                    tradeSide === 'buy' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-red-400 hover:bg-red-300 text-white'
                  }`}
                >
                  Confirm Instant {tradeSide.toUpperCase()} ⚡
                </button>
              </form>
            )}

            {/* FORM 2: LIMIT ORDER ("Set Your Own Price") */}
            {activeMainTab === 'limit' && (
              <form onSubmit={handleExecuteTradeSubmit} className="space-y-6">
                
                {/* Explanatory banner */}
                <div className="p-3.5 bg-teal-950/20 border border-teal-900/40 rounded-2xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {tradeSide === 'buy' 
                      ? "Think the price is going to drop? Put your target price here! We will automatically buy the coin for you only when it hits that exact number."
                      : "Think the price is going to shoot up? Put your target price here! We will automatically sell the coin for you only when it hits that exact number."
                    }
                  </p>
                </div>

                {/* Coin selection */}
                <div className="space-y-2">
                  <label className="text-xs font-sans text-slate-400 uppercase tracking-wide flex items-center gap-1 font-bold">
                    1. Choose Coin
                  </label>
                  <div className="relative">
                    <select
                      value={tradeAsset}
                      onChange={(e) => { setTradeAsset(e.target.value); setTradeError(''); }}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer font-sans font-bold"
                    >
                      {assets.filter(a => a.symbol !== 'USDC').map((asset) => (
                        <option key={asset.symbol} value={asset.symbol}>🪙 {asset.symbol} - {asset.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-4 pointer-events-none" />
                  </div>
                </div>

                {/* Target Price input with +/- buttons */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <label className="text-slate-400 uppercase tracking-wide font-bold">
                      2. Set Your Target Price ($)
                    </label>
                    <span className="text-slate-400">Current Price: ${selectedAsset.price.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustTargetPrice(-0.01)}
                      className="p-3 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl border border-slate-850 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <div className="relative flex-1">
                      <input
                        id="trade-price-input"
                        type="number"
                        step="any"
                        value={customTargetPrice}
                        onChange={(e) => setCustomTargetPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-center text-white focus:outline-none font-mono"
                      />
                      <span className="absolute right-4 top-3 text-xs font-sans text-slate-500 font-bold">USD</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustTargetPrice(0.01)}
                      className="p-3 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl border border-slate-850 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <label className="text-slate-400 uppercase tracking-wide font-bold">
                      {tradeSide === 'buy' ? '3. Cash to Lock ($)' : '3. Amount of Coins to Lock'}
                    </label>
                    <span className="text-slate-400">
                      Wallet size: {tradeSide === 'buy' 
                        ? `$${(balances['USDC'] || 0).toLocaleString()} USDC`
                        : `${(balances[tradeAsset] || 0).toFixed(4)} ${tradeAsset}`
                      }
                    </span>
                  </div>

                  <div className="relative">
                    {tradeSide === 'buy' ? (
                      <>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 50"
                          value={usdSpendAmount}
                          onChange={(e) => setUsdSpendAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none font-mono"
                        />
                        <span className="absolute right-4 top-3 text-xs font-sans text-slate-500 font-bold bg-slate-900 px-2 py-1 rounded">USD</span>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 1.0"
                          value={coinSellAmount}
                          onChange={(e) => setCoinSellAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none font-mono"
                        />
                        <span className="absolute right-4 top-3 text-xs font-sans text-slate-500 font-bold bg-slate-900 px-2 py-1 rounded">{tradeAsset}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Live target calculation summary */}
                <div className="p-4 bg-teal-950/15 border border-teal-900/30 rounded-2xl space-y-2 text-xs">
                  <p className="font-bold text-teal-300 flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-teal-400" /> How this order works:
                  </p>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    We will save and lock <strong className="text-white">{tradeSide === 'buy' ? `$${usdSpendAmount}` : `${coinSellAmount} ${tradeAsset}`}</strong> of your funds. The moment the market price of {tradeAsset} hits exactly <strong className="text-cyan-400">${customTargetPrice}</strong>, our computers will instantly trigger the {tradeSide} swap for you!
                  </p>
                </div>

                {tradeError && <p className="text-xs font-sans text-red-400 font-bold bg-red-950/20 border border-red-900/40 p-3 rounded-xl">⚠️ {tradeError}</p>}

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 rounded-2xl font-sans font-bold text-xs tracking-wider cursor-pointer hover:scale-[1.01] transition-all duration-150 uppercase shadow-lg"
                >
                  Set My Price Target 🎯
                </button>
              </form>
            )}

            {/* FORM 3: QUICK COIN SWAP */}
            {activeMainTab === 'swap' && (
              <form onSubmit={handleExecuteSwapSubmit} className="space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <span className="text-xs font-sans font-bold text-slate-300">Quick Swap Converter 🔄</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-sans text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                    Price locked: {timeLeft}s
                  </div>
                </div>

                {/* FROM Coin */}
                <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-2xl">
                  <div className="flex justify-between text-[11px] font-sans text-slate-400 mb-1 font-bold">
                    <span>Trade This (You Give)</span>
                    <span>Available: {(balances[swapFrom] || 0).toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="swap-amount-input"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={swapFromAmount}
                      onChange={(e) => setSwapFromAmount(e.target.value)}
                      className="w-full bg-transparent text-sm font-sans font-bold text-white focus:outline-none placeholder-slate-700"
                    />
                    <select
                      id="swap-from-select"
                      value={swapFrom}
                      onChange={(e) => { setSwapFrom(e.target.value); setSwapError(''); }}
                      className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 font-sans font-bold focus:outline-none cursor-pointer"
                    >
                      {assets.map((asset) => (
                        <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Animated Arrow */}
                <div className="flex justify-center -my-3 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      const temp = swapFrom;
                      setSwapFrom(swapTo);
                      setSwapTo(temp);
                      setSwapFromAmount('50');
                    }}
                    className="p-2 bg-slate-900 hover:bg-slate-850 text-cyan-400 border border-slate-850 hover:border-slate-700 rounded-full shadow-md cursor-pointer hover:scale-110 transition"
                  >
                    <ArrowLeftRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>

                {/* TO Coin */}
                <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-2xl">
                  <div className="flex justify-between text-[11px] font-sans text-slate-400 mb-1 font-bold">
                    <span>Get That (You Receive)</span>
                    <span>Available: {(balances[swapTo] || 0).toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans font-bold text-cyan-300">
                      {swapToAmount > 0 ? swapToAmount.toLocaleString('en-US', { maximumFractionDigits: 5 }) : '0.00'}
                    </span>
                    <select
                      id="swap-to-select"
                      value={swapTo}
                      onChange={(e) => { setSwapTo(e.target.value); setSwapError(''); }}
                      className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 font-sans font-bold focus:outline-none cursor-pointer"
                    >
                      {assets.map((asset) => (
                        <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price locked warning */}
                <p className="text-[10px] text-slate-500 font-sans leading-normal text-center bg-slate-900/20 p-2 rounded-xl">
                  ⏱️ Price locked for 5 seconds so you don't get surprised by sudden network price changes!
                </p>

                {swapError && (
                  <p className="text-xs font-sans text-red-400 font-bold bg-red-950/20 border border-red-900/40 p-3 rounded-xl">⚠️ {swapError}</p>
                )}

                <button
                  id="swap-execute-btn"
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 rounded-2xl font-sans font-bold text-xs tracking-wider cursor-pointer hover:scale-[1.01] transition-all duration-150 shadow-lg"
                >
                  Confirm Quick Swap 🔄
                </button>
              </form>
            )}

          </div>

          {/* CURIOUS EXPLORERS PANEL: COLLAPSIBLE AREA FOR ADVANCED BOTS */}
          <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-3xl">
            <button
              onClick={() => setShowAdvancedBots(!showAdvancedBots)}
              className="w-full flex items-center justify-between p-2 hover:bg-slate-900/30 rounded-2xl transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <p className="text-xs font-sans font-bold text-slate-200">🤖 Advanced Smart Trading Bots</p>
                  <p className="text-[10px] font-sans text-slate-500 mt-0.5">Automated TWAP algorithms, bracket targets, and high-frequency grid bots.</p>
                </div>
              </div>
              <span className="text-xs font-sans font-semibold text-cyan-400 hover:text-cyan-300">
                {showAdvancedBots ? 'Close Panel ▲' : 'Explore Bots ▼'}
              </span>
            </button>

            <AnimatePresence>
              {showAdvancedBots && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-4 pt-4 border-t border-slate-900 space-y-4"
                >
                  {/* Select Bot */}
                  <div className="flex bg-slate-950 border border-slate-900 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAlgoStrategy('twap')}
                      className={`flex-1 py-1.5 text-[10px] font-sans font-bold rounded-lg transition-all ${
                        algoStrategy === 'twap' ? 'bg-slate-900 text-emerald-400 shadow-md' : 'text-slate-500'
                      }`}
                    >
                      TWAP BOT
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlgoStrategy('vwap')}
                      className={`flex-1 py-1.5 text-[10px] font-sans font-bold rounded-lg transition-all ${
                        algoStrategy === 'vwap' ? 'bg-slate-900 text-emerald-400 shadow-md' : 'text-slate-500'
                      }`}
                    >
                      VWAP BOT
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlgoStrategy('trailing-stop')}
                      className={`flex-1 py-1.5 text-[10px] font-sans font-bold rounded-lg transition-all ${
                        algoStrategy === 'trailing-stop' ? 'bg-slate-900 text-emerald-400 shadow-md' : 'text-slate-500'
                      }`}
                    >
                      TRAILING BOT
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlgoStrategy('bracket')}
                      className={`flex-1 py-1.5 text-[10px] font-sans font-bold rounded-lg transition-all ${
                        algoStrategy === 'bracket' ? 'bg-slate-900 text-emerald-400 shadow-md' : 'text-slate-500'
                      }`}
                    >
                      BRACKET BOT
                    </button>
                  </div>

                  {/* Form section */}
                  {algoStrategy === 'twap' && (
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-4">
                      <p className="text-[11px] text-slate-400">
                        The TWAP bot slices a large purchase into small, tiny sub-orders over time so that you get the best average price!
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500">How many parts (Slices)?</span>
                          <input
                            type="number"
                            value={twapSlices}
                            onChange={(e) => setTwapSlices(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-white font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500">Wait Time (Seconds)</span>
                          <input
                            type="number"
                            value={twapInterval}
                            onChange={(e) => setTwapInterval(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-white font-mono"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleExecuteAlgoSubmit}
                        className="w-full py-2 bg-emerald-500 text-slate-950 font-sans font-bold text-xs rounded-xl"
                      >
                        Launch TWAP Bot 🚀
                      </button>
                    </div>
                  )}

                  {algoStrategy !== 'twap' && (
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl">
                      <p className="text-[11px] text-slate-400">
                        Ready to deploy custom automation? You can launch VWAP, Bracket, or Trailing strategies to maximize your returns automatically.
                      </p>
                      <button
                        onClick={handleExecuteAlgoSubmit}
                        className="w-full py-2 bg-purple-500 text-slate-950 font-sans font-bold text-xs rounded-xl mt-3"
                      >
                        Deploy Smart Strategy Bot 🤖
                      </button>
                    </div>
                  )}

                  {/* High Frequency Grid bot */}
                  <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-4">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1 font-sans">
                      <Layers className="w-4 h-4" /> Real-time Volatility Grid Bot
                    </span>
                    <p className="text-[11px] text-slate-400">
                      The Grid Bot automatically buys low and sells high inside a price range to harvest rewards repeatedly while you sleep.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500">Lower Range ($)</span>
                        <input
                          type="number"
                          value={gridLower}
                          onChange={(e) => setGridLower(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Upper Range ($)</span>
                        <input
                          type="number"
                          value={gridUpper}
                          onChange={(e) => setGridUpper(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleStartGridBotSubmit}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-slate-950 font-sans font-bold text-xs rounded-xl"
                    >
                      Launch High-Frequency Grid Bot ⚡
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Side: Live Buy & Sell Queue & Active queue (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Live Buy & Sell Queue (Order Book) */}
          <div id="order-book-card" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-sans font-bold text-slate-300">Live Buy & Sell Queue 📊</span>
                <span title="This list shows people around the world currently wanting to buy (green) or sell (red) this coin at different prices." className="cursor-help"><HelpCircle className="w-3.5 h-3.5 text-slate-500" /></span>
              </div>
              <span className="text-[10px] font-sans text-cyan-400 uppercase font-bold">{tradeAsset} Live</span>
            </div>

            {/* Asks (Sells) */}
            <div className="space-y-1 mb-2">
              {orderBook.asks.map((ask, idx) => (
                <div key={`ask-${idx}`} className="relative h-5 flex items-center justify-between text-[11px] font-mono">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-red-950/15 border-r-2 border-red-500/25 transition-all duration-300"
                    style={{ width: `${(ask.total / maxDepthSize) * 100}%` }}
                  />
                  <span className="text-red-400 z-10 font-bold">${ask.price.toFixed(2)}</span>
                  <span className="text-slate-300 z-10">{ask.size.toFixed(2)} coins</span>
                  <span className="text-slate-500 z-10 mr-1">${ask.total.toFixed(0)}</span>
                </div>
              ))}
            </div>

            {/* Live Spread Row */}
            <div className="py-2 border-y border-slate-900/80 my-2 flex items-center justify-between px-1">
              <span className="text-xs font-sans text-slate-400">Current Price</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-sans font-bold text-white">${selectedAsset.price.toFixed(2)}</span>
                <span className="text-[9px] font-sans text-emerald-400 bg-emerald-950/50 px-1.5 py-0.25 rounded">Optimal</span>
              </div>
            </div>

            {/* Bids (Buys) */}
            <div className="space-y-1">
              {orderBook.bids.map((bid, idx) => (
                <div key={`bid-${idx}`} className="relative h-5 flex items-center justify-between text-[11px] font-mono">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-emerald-950/15 border-r-2 border-emerald-500/25 transition-all duration-300"
                    style={{ width: `${(bid.total / maxDepthSize) * 100}%` }}
                  />
                  <span className="text-emerald-400 z-10 font-bold">${bid.price.toFixed(2)}</span>
                  <span className="text-slate-300 z-10">{bid.size.toFixed(2)} coins</span>
                  <span className="text-slate-500 z-10 mr-1">${bid.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Queue / Pending Moves */}
          <div id="active-orders-card" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
              <span className="text-xs font-sans font-bold text-slate-300">My Active Queue ⏱️</span>
              <span className="text-[10px] font-sans text-slate-500 uppercase font-bold">Pending Swaps</span>
            </div>

            {activeOrders.length === 0 && gridBots.filter(b => b.active).length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-900/60 rounded-xl">
                <p className="text-[11px] font-sans text-slate-500">Your queue is empty. Ready to buy or set prices!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {/* Active Grid Bots */}
                {gridBots.filter(bot => bot.active).map(bot => (
                  <div key={bot.id} className="p-3 bg-purple-950/10 border border-purple-900/30 rounded-xl space-y-2">
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
                  </div>
                ))}

                {/* Normal Orders */}
                {activeOrders.map((order) => (
                  <div key={order.id} className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-sans font-bold ${order.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {order.side === 'buy' ? 'BUYING' : 'SELLING'}
                        </span>
                        <span className="font-sans font-bold text-slate-200">{order.symbol}</span>
                        {order.type !== 'limit' && (
                          <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/30 rounded text-[9px] font-sans font-bold uppercase">
                            {order.type}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-sans text-slate-400">Trigger Target: ${order.price.toFixed(2)}</span>
                    </div>

                    <div className="text-right flex items-center gap-2.5">
                      <span className="font-sans font-semibold text-slate-300">{order.amount.toFixed(4)} coins</span>
                      <button
                        onClick={() => onCancelOrder(order.id)}
                        className="px-2 py-1 bg-red-950/40 hover:bg-red-900 text-red-400 rounded-lg text-[10px] font-sans transition cursor-pointer border border-red-900/30 font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FOOTER ROW: Dynamic Slippage Sentinel & Arbitrage Optimizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Multi-hop Arbitrage Optimizer */}
        <div id="arbitrage-optimizer" className="lg:col-span-7 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-sans font-bold text-slate-300">Coin Swap Shortcut Optimizer 🚀</span>
            </div>
            <span className="text-[10px] font-sans text-slate-500 uppercase font-bold">Smart Routing</span>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
            Real-time scanner analyzing linked coin pools to find complex short-cut pathways. Click "Capture Loop" to instantly swap and gain small bonus reward coins with zero effort!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {arbitragePaths.map((path) => {
              const isCapturing = arbitrageCaptured === path.id;
              
              return (
                <div key={path.id} className="p-4 bg-slate-950/60 border border-slate-900 hover:border-slate-800 rounded-xl space-y-4 transition-colors">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-900/40 rounded-xl font-bold">
                      +{path.anomalousReturnPercent}% Bonus
                    </span>
                    <span className="text-slate-500 font-mono">Depth: ${path.liquidityDepthUsd.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between px-2 py-2 bg-slate-900/30 border border-slate-900 rounded-lg">
                    {path.route.map((token, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-sans font-bold text-white px-2 py-1 bg-slate-950 border border-slate-800 rounded">
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
                    className={`w-full py-2 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      isCapturing 
                        ? 'bg-emerald-900 text-emerald-100 border border-emerald-700' 
                        : 'bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-900/60'
                    }`}
                  >
                    {isCapturing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Capturing bonus loop...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        Capture Loop! 🚀
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Price Change Buffer & Volatility Sentinel */}
        <div id="volatility-control-console" className="lg:col-span-5 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-sans font-bold text-slate-300">Price Change Buffer & Safety Sentinel</span>
              </div>
              <span className="text-[10px] font-sans text-slate-500 uppercase font-bold">Safety Desk</span>
            </div>

            {/* Price Change Buffer (Slippage Tolerance) */}
            <div className="space-y-3.5 pb-4 border-b border-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-sans flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" /> Price Change Buffer 🛡️
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-sans font-bold bg-emerald-950 text-emerald-400">
                  Optimal Protection
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal font-sans">
                Sometimes coin prices change in the millisecond it takes to process. This buffer protects you by automatically cancelling the order if the price shifts too fast.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div className="p-2.5 bg-slate-900/20 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Expected Price shift</span>
                  <span className="text-white font-bold text-xs mt-0.5">{(dynamicImpactSlippage * 100).toFixed(3)}%</span>
                </div>
                <div className="p-2.5 bg-slate-900/20 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Market Depth Health</span>
                  <span className="text-cyan-400 font-bold text-xs mt-0.5">{liquidityDepthIndex}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-sans font-bold">
                  <label className="text-slate-400">Allowed Price shift Buffer</label>
                  <span className="text-cyan-400">{slippagePercent}%</span>
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
                    className={`px-2.5 py-1 text-[9px] font-sans font-bold rounded-lg border shrink-0 cursor-pointer transition ${
                      autoSlippage 
                        ? 'bg-cyan-950 border-cyan-800 text-cyan-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {autoSlippage ? 'AUTO SHIELD' : 'MANUAL'}
                  </button>
                </div>
              </div>
            </div>

            {/* Circuit Breaker */}
            <div className="space-y-3.5 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-sans flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-400 animate-pulse" /> Flash-Crash Shield 🛡️
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-sans font-bold ${
                  circuitBreakerArmed ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-slate-500'
                }`}>
                  {circuitBreakerArmed ? 'Armed & Watching' : 'Off'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-sans text-slate-500 uppercase font-bold">Panic Trigger Threshold</label>
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
                  type="button"
                  onClick={() => onToggleCircuitBreaker(!circuitBreakerArmed, circuitBreakerPercent)}
                  className={`px-4 py-3 text-xs font-sans font-bold rounded-xl border cursor-pointer transition shrink-0 ${
                    circuitBreakerArmed 
                      ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400' 
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                  }`}
                >
                  {circuitBreakerArmed ? 'Turn Shield Off' : 'Turn Shield On'}
                </button>
              </div>

              <button
                onClick={onTriggerPanic}
                className="w-full py-2.5 bg-red-950/40 border border-red-900/50 hover:bg-red-900 text-red-400 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg transition"
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                🚨 ACTIVATE SAFETY LOCK (PANIC STOP)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
