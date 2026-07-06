import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
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
  DollarSign
} from 'lucide-react';
import { Asset, Transaction, ActiveOrder } from '../types';

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
  onCancelOrder 
}: TradingViewProps) {
  // Order Form State
  const [tradeAsset, setTradeAsset] = useState('SOL');
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [tradeType, setTradeType] = useState<'market' | 'limit'>('market');
  const [amountInput, setAmountInput] = useState('');
  const [limitPriceInput, setLimitPriceInput] = useState('');
  const [tradeError, setTradeError] = useState('');

  // Swap Form State
  const [swapFrom, setSwapFrom] = useState('USDC');
  const [swapTo, setSwapTo] = useState('SOL');
  const [swapFromAmount, setSwapFromAmount] = useState('');
  const [swapRate, setSwapRate] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);
  const [swapError, setSwapError] = useState('');

  // Active book seed simulation
  const [bookSeed, setBookSeed] = useState(0);

  // Selected Asset Info
  const selectedAsset = useMemo(() => {
    return assets.find(a => a.symbol === tradeAsset) || assets[0];
  }, [assets, tradeAsset]);

  // Set default limit price when asset or type changes
  useEffect(() => {
    if (selectedAsset) {
      setLimitPriceInput(selectedAsset.price.toFixed(2));
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

  return (
    <div className="space-y-6">
      {/* Top Asset Overview Ticker */}
      <div id="trade-ticker" className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
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
            <span className="text-[10px] font-mono text-slate-500">{selectedAsset.name} Core Spot Index</span>
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
        </div>
      </div>

      {/* Trading Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Order Form (6 cols) */}
        <div id="order-form-card" className="lg:col-span-4 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <form onSubmit={handleExecuteTradeSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-2">
              <span className="text-xs font-sans font-semibold text-slate-300">Sovereign Order Form</span>
              <Sliders className="w-4 h-4 text-slate-500" />
            </div>

            {/* Buy / Sell Tabs */}
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

            {/* Asset Picker & Available Balance */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="text-slate-400">Target Asset</label>
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

            {/* Limit Price Input if Limit Order */}
            {tradeType === 'limit' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400">Limit Price (USDC)</label>
                <div className="relative">
                  <input
                    id="trade-price-input"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={limitPriceInput}
                    onChange={(e) => setLimitPriceInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-500">USDC</span>
                </div>
              </div>
            )}

            {/* Order Amount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-400">Order Amount</label>
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

            {/* Percent quick-triggers */}
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

            {/* Cost Summary Ledger */}
            <div className="p-3 bg-slate-900/30 border border-slate-900/60 rounded-xl space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal cost:</span>
                <span className="text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  Protocol Fee (0.5%):
                  <Info className="w-3 h-3 text-slate-500 cursor-help" title="Standard exchange fee" />
                </span>
                <span className="text-slate-200">${protocolFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-900/80 my-1"></div>
              <div className="flex justify-between font-bold text-white">
                <span>Estimated total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {tradeError && (
              <p className="text-xs font-mono text-red-400 mt-1">{tradeError}</p>
            )}

            <button
              id="trade-execute-btn"
              type="submit"
              className={`w-full py-3 rounded-xl font-sans font-bold text-xs shadow-lg cursor-pointer text-slate-950 tracking-wider transition duration-150 ${
                tradeSide === 'buy'
                  ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-900/10'
                  : 'bg-red-400 hover:bg-red-300 text-slate-950 shadow-red-900/10'
              }`}
            >
              EXECUTE {tradeSide.toUpperCase()} ORDER
            </button>
          </form>
        </div>

        {/* Center: Order Book (4 cols) */}
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

          {/* Active Limit Orders */}
          <div id="active-orders-card" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex-1">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
              <span className="text-xs font-sans font-semibold text-slate-300">Active Limit Queue</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Pending Execution</span>
            </div>

            {activeOrders.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-900/60 rounded-xl">
                <p className="text-[11px] font-mono text-slate-500">No active limit orders in queue</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeOrders.map((order) => (
                  <div key={order.id} className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold ${order.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {order.side.toUpperCase()}
                        </span>
                        <span className="font-sans font-semibold text-slate-200">{order.symbol}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Price: ${order.price.toFixed(2)}</span>
                    </div>

                    <div className="text-right flex items-center gap-2.5">
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-300">{order.amount} {order.symbol}</span>
                        <span className="text-[9px] font-mono text-cyan-400">0% Filled</span>
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
