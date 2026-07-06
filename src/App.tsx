import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Sparkles, 
  Menu, 
  X, 
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bell
} from 'lucide-react';

import { User, Asset, Transaction, ActiveOrder, ApiKey, GridBot } from './types';
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TradingView from './components/TradingView';
import EarnView from './components/EarnView';
import SecurityView from './components/SecurityView';
import DeveloperDocs from './components/DeveloperDocs';

// Helper to generate initial sparklines
const makeSparkline = (base: number, length: number = 10, variance: number = 0.05) => {
  const arr = [];
  let curr = base;
  for (let i = 0; i < length; i++) {
    curr = curr * (1 + (Math.sin(i * 1.5) * variance) - (variance * 0.4));
    arr.push(curr);
  }
  return arr;
};

// Simple ID Generator
let idCounter = 1000;
const generateId = () => {
  idCounter++;
  return `tx-${idCounter}`;
};

export default function App() {
  // Global Session state
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<{ id: string; type: 'success' | 'error' | 'info'; text: string }[]>([]);

  // Balances including fractional dust and native token NEX
  const [balances, setBalances] = useState<{ [key: string]: number }>({
    USDC: 15420.50,
    SOL: 45.22,
    ETH: 1.84,
    LINK: 110.00,
    DOT: 240.00,
    DOGE: 2.50, // Dust token 1 (<$1.00 USD)
    ADA: 1.20,  // Dust token 2 (<$1.00 USD)
    UNI: 0.05,  // Dust token 3 (<$1.00 USD)
    NEX: 0.00,  // Native token (pre-sweep)
  });

  // Staked balances
  const [stakedBalances, setStakedBalances] = useState<{ [key: string]: number }>({
    SOL: 10.00,
    ETH: 0.50,
    LINK: 0.00,
    DOT: 120.00,
  });

  // Base spot prices that fluctuate slightly
  const [spotPrices, setSpotPrices] = useState<{ [key: string]: number }>({
    SOL: 145.25,
    ETH: 3240.10,
    LINK: 16.85,
    DOT: 6.45,
    DOGE: 0.1524,
    ADA: 0.4182,
    UNI: 7.1420,
    NEX: 0.5000,
    USDC: 1.00,
  });

  // 24h change %
  const [change24h, setChange24h] = useState<{ [key: string]: number }>({
    SOL: 4.32,
    ETH: -1.15,
    LINK: 0.45,
    DOT: 11.40,
    DOGE: 1.25,
    ADA: -2.14,
    UNI: 0.95,
    NEX: 12.44,
    USDC: 0.00,
  });

  // Active Grid Trading Bots
  const [gridBots, setGridBots] = useState<GridBot[]>([
    {
      id: 'grid-1',
      symbol: 'SOL',
      lowerPrice: 130.00,
      upperPrice: 160.00,
      gridCount: 8,
      investmentAmount: 1000.00,
      active: true,
      profitEarned: 24.50,
      createdAt: new Date(Date.now() - 3600 * 24 * 1000).toLocaleDateString(),
      gridLevels: [],
    }
  ]);

  // Risk & Volatility state
  const [circuitBreakerArmed, setCircuitBreakerArmed] = useState(true);
  const [circuitBreakerPercent, setCircuitBreakerPercent] = useState(2.5);

  // Transactions ledger
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-101',
      type: 'deposit',
      asset: 'USDC',
      amount: 15000,
      status: 'completed',
      timestamp: new Date(Date.now() - 3600 * 24 * 1000 * 2).toLocaleTimeString(),
    },
    {
      id: 'tx-102',
      type: 'buy',
      asset: 'SOL',
      amount: 15,
      price: 140.50,
      status: 'completed',
      timestamp: new Date(Date.now() - 3600 * 12 * 1000).toLocaleTimeString(),
    },
    {
      id: 'tx-103',
      type: 'stake',
      asset: 'DOT',
      amount: 120,
      status: 'completed',
      timestamp: new Date(Date.now() - 3600 * 4 * 1000).toLocaleTimeString(),
    }
  ]);

  // Active orders queue
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([
    {
      id: 'order-1',
      symbol: 'SOL',
      type: 'limit',
      side: 'buy',
      amount: 5,
      price: 138.00,
      filled: 0,
      status: 'open',
      timestamp: new Date(Date.now() - 600 * 1000).toLocaleTimeString(),
    }
  ]);

  // Api Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  // Simulation of live price ticking & algorithmic order execution engine
  useEffect(() => {
    const interval = setInterval(() => {
      let solDropDetected = false;
      let lastSolPrice = 0;
      let nextSolPrice = 0;

      // 1. Tick Prices
      setSpotPrices((prev) => {
        const next = { ...prev };
        lastSolPrice = prev['SOL'];

        Object.keys(next).forEach((symbol) => {
          if (symbol !== 'USDC') {
            const pct = (Math.random() - 0.5) * 0.003; // ±0.15% fluctuation
            next[symbol] = parseFloat((next[symbol] * (1 + pct)).toFixed(4));
          }
        });

        nextSolPrice = next['SOL'];
        // Detect sudden crash
        if (nextSolPrice < lastSolPrice * 0.96) {
          solDropDetected = true;
        }

        return next;
      });

      // 2. Scan and Match Active Orders using high-fidelity rules
      setActiveOrders((prevOrders) => {
        if (prevOrders.length === 0) return prevOrders;

        const updatedOrders: ActiveOrder[] = [];

        prevOrders.forEach((order) => {
          const currentPrice = spotPrices[order.symbol] || order.price;

          // A. Volatility Circuit Breaker Trigger
          if (circuitBreakerArmed && order.symbol === 'SOL' && solDropDetected) {
            // Cancel and refund
            const refundCost = order.amount * order.price;
            const fee = refundCost * 0.005;
            if (order.side === 'buy') {
              setBalances(b => ({ ...b, USDC: b['USDC'] + refundCost + fee }));
            } else {
              setBalances(b => ({ ...b, [order.symbol]: b[order.symbol] + order.amount }));
            }
            triggerNotification('error', `⚡ CIRCUIT BREAKER TRIPPED! Drops exceeded ${circuitBreakerPercent}%. Order ${order.id} cancelled safely.`);
            return; // Order removed
          }

          // B. Normal Limit matching
          if (order.type === 'limit') {
            const isMatch = order.side === 'buy' ? currentPrice <= order.price : currentPrice >= order.price;
            if (isMatch) {
              if (order.side === 'buy') {
                setBalances(b => ({ ...b, [order.symbol]: (b[order.symbol] || 0) + order.amount }));
              } else {
                const proceeds = order.amount * order.price - (order.amount * order.price * 0.005);
                setBalances(b => ({ ...b, USDC: b['USDC'] + proceeds }));
              }

              setTransactions(txs => [
                {
                  id: generateId(),
                  type: order.side,
                  asset: order.symbol,
                  amount: order.amount,
                  price: order.price,
                  status: 'completed',
                  timestamp: new Date().toLocaleTimeString(),
                },
                ...txs
              ]);

              triggerNotification('success', `Limit order filled: ${order.side.toUpperCase()} ${order.amount} ${order.symbol} at $${order.price.toFixed(2)}`);
              return;
            }
          }

          // C. TWAP & Iceberg incremental slice execution
          if (order.type === 'twap' || order.type === 'iceberg') {
            const totalChunks = order.twapTotalChunks || 5;
            const filledChunks = (order.twapFilledChunks || 0) + 1;
            const chunkAmount = order.amount / totalChunks;
            const chunkCost = chunkAmount * currentPrice;
            const chunkFee = chunkCost * 0.005;

            // Execute single slice
            if (order.side === 'buy') {
              setBalances(b => ({
                ...b,
                [order.symbol]: (b[order.symbol] || 0) + chunkAmount
              }));
            } else {
              const proceeds = chunkCost - chunkFee;
              setBalances(b => ({
                ...b,
                USDC: b['USDC'] + proceeds
              }));
            }

            // Post slice trade in ledger
            setTransactions(txs => [
              {
                id: generateId(),
                type: order.side,
                asset: order.symbol,
                amount: chunkAmount,
                price: currentPrice,
                status: 'completed',
                timestamp: new Date().toLocaleTimeString(),
                note: `Algorithmic ${order.type.toUpperCase()} slice execution ${filledChunks}/${totalChunks}`,
              },
              ...txs
            ]);

            if (filledChunks >= totalChunks) {
              triggerNotification('success', `🎉 Algorithmic ${order.type.toUpperCase()} fully filled: ${order.amount} ${order.symbol} consolidated.`);
              return; // Removed
            } else {
              updatedOrders.push({
                ...order,
                twapFilledChunks: filledChunks,
              });
              triggerNotification('info', `Executed ${order.type.toUpperCase()} chunk ${filledChunks}/${totalChunks} for ${chunkAmount.toFixed(4)} ${order.symbol}`);
              return;
            }
          }

          // D. VWAP Target Depth execution
          if (order.type === 'vwap') {
            if (Math.random() > 0.7) { // Simulated volume sweep match
              if (order.side === 'buy') {
                setBalances(b => ({ ...b, [order.symbol]: (b[order.symbol] || 0) + order.amount }));
              } else {
                const proceeds = order.amount * currentPrice - (order.amount * currentPrice * 0.005);
                setBalances(b => ({ ...b, USDC: b['USDC'] + proceeds }));
              }

              setTransactions(txs => [
                {
                  id: generateId(),
                  type: order.side,
                  asset: order.symbol,
                  amount: order.amount,
                  price: currentPrice,
                  status: 'completed',
                  timestamp: new Date().toLocaleTimeString(),
                  note: 'VWAP Institutional Liquidity Wave',
                },
                ...txs
              ]);

              triggerNotification('success', `VWAP execution succeeded: Consolidated ${order.amount} ${order.symbol} at optimal volume depth.`);
              return;
            }
          }

          // E. Trailing Stop-Loss Protection
          if (order.type === 'trailing-stop') {
            const stopPct = order.trailingStopPercent || 2.5;
            let highest = order.trailingHighestPrice || currentPrice;

            if (currentPrice > highest) {
              highest = currentPrice;
            }

            const stopLevel = highest * (1 - stopPct / 100);
            if (currentPrice <= stopLevel) {
              // Volatility protected stop level reached! Trigger market Sell
              const proceeds = order.amount * currentPrice - (order.amount * currentPrice * 0.005);
              setBalances(b => ({
                ...b,
                USDC: b['USDC'] + proceeds
              }));

              setTransactions(txs => [
                {
                  id: generateId(),
                  type: 'sell',
                  asset: order.symbol,
                  amount: order.amount,
                  price: currentPrice,
                  status: 'completed',
                  timestamp: new Date().toLocaleTimeString(),
                  note: `Trailing Stop-Loss Executed (ATR cushion adjusted)`,
                },
                ...txs
              ]);

              triggerNotification('error', `🚨 Trailing Stop-Loss triggered! Protected position. Sold ${order.amount} ${order.symbol} @ $${currentPrice.toFixed(2)}`);
              return;
            } else {
              updatedOrders.push({
                ...order,
                trailingHighestPrice: highest,
              });
              return;
            }
          }

          // F. Bracket (OCO) Take-Profit & Stop-Loss triggers
          if (order.type === 'bracket') {
            const tp = order.bracketTakeProfit || 999999;
            const sl = order.bracketStopLoss || 0;

            if (currentPrice >= tp) {
              const proceeds = order.amount * tp - (order.amount * tp * 0.005);
              setBalances(b => ({
                ...b,
                [order.symbol]: (b[order.symbol] || 0) + (order.side === 'buy' ? order.amount : 0),
                USDC: b['USDC'] + (order.side === 'sell' ? proceeds : 0),
              }));

              setTransactions(txs => [
                {
                  id: generateId(),
                  type: order.side,
                  asset: order.symbol,
                  amount: order.amount,
                  price: tp,
                  status: 'completed',
                  timestamp: new Date().toLocaleTimeString(),
                  note: 'Bracket Take Profit Leg Filled (OCO)',
                },
                ...txs
              ]);

              triggerNotification('success', `📈 Bracket OCO: Take Profit filled @ $${tp.toFixed(2)}! SL cancelled.`);
              return;
            } else if (currentPrice <= sl) {
              const proceeds = order.amount * sl - (order.amount * sl * 0.005);
              setBalances(b => ({
                ...b,
                [order.symbol]: (b[order.symbol] || 0) + (order.side === 'buy' ? order.amount : 0),
                USDC: b['USDC'] + (order.side === 'sell' ? proceeds : 0),
              }));

              setTransactions(txs => [
                {
                  id: generateId(),
                  type: order.side,
                  asset: order.symbol,
                  amount: order.amount,
                  price: sl,
                  status: 'completed',
                  timestamp: new Date().toLocaleTimeString(),
                  note: 'Bracket Stop Loss Leg Filled (OCO)',
                },
                ...txs
              ]);

              triggerNotification('error', `📉 Bracket OCO: Stop Loss executed @ $${sl.toFixed(2)}! TP cancelled.`);
              return;
            }
          }

          // Default
          updatedOrders.push(order);
        });

        return updatedOrders;
      });

      // 3. Tick active Grid Bot positions and compound simulated yields
      setGridBots((prevBots) => {
        return prevBots.map((bot) => {
          if (!bot.active) return bot;

          // 25% chance of volatility trigger inside range bounds
          if (Math.random() > 0.75) {
            const yieldGained = 1.80 + Math.random() * 2.20;
            setBalances(b => ({ ...b, USDC: b['USDC'] + yieldGained }));

            setTransactions(txs => [
              {
                id: generateId(),
                type: 'buy',
                asset: bot.symbol,
                amount: bot.investmentAmount / bot.gridCount / (spotPrices[bot.symbol] || 100),
                price: spotPrices[bot.symbol] || 100,
                status: 'completed',
                timestamp: new Date().toLocaleTimeString(),
                note: `Grid Level Arbitrage Match • +$${yieldGained.toFixed(2)} USDC profit`,
              },
              ...txs
            ]);

            return {
              ...bot,
              profitEarned: bot.profitEarned + yieldGained
            };
          }

          return bot;
        });
      });

    }, 3000);

    return () => clearInterval(interval);
  }, [spotPrices, circuitBreakerArmed, circuitBreakerPercent]);

  // Sync balances and prices to get dynamic USD Valuation
  const assets: Asset[] = useMemo(() => {
    return [
      {
        symbol: 'SOL',
        name: 'Solana',
        price: spotPrices['SOL'],
        change24h: change24h['SOL'],
        balance: balances['SOL'] || 0,
        staked: stakedBalances['SOL'] || 0,
        sparkline: makeSparkline(spotPrices['SOL'], 12, 0.03),
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: spotPrices['ETH'],
        change24h: change24h['ETH'],
        balance: balances['ETH'] || 0,
        staked: stakedBalances['ETH'] || 0,
        sparkline: makeSparkline(spotPrices['ETH'], 12, 0.025),
      },
      {
        symbol: 'LINK',
        name: 'Chainlink',
        price: spotPrices['LINK'],
        change24h: change24h['LINK'],
        balance: balances['LINK'] || 0,
        staked: stakedBalances['LINK'] || 0,
        sparkline: makeSparkline(spotPrices['LINK'], 12, 0.04),
      },
      {
        symbol: 'DOT',
        name: 'Polkadot',
        price: spotPrices['DOT'],
        change24h: change24h['DOT'],
        balance: balances['DOT'] || 0,
        staked: stakedBalances['DOT'] || 0,
        sparkline: makeSparkline(spotPrices['DOT'], 12, 0.06),
      },
      // Dust Tokens
      {
        symbol: 'DOGE',
        name: 'Dogecoin',
        price: spotPrices['DOGE'],
        change24h: change24h['DOGE'],
        balance: balances['DOGE'] || 0,
        staked: 0,
        sparkline: makeSparkline(spotPrices['DOGE'], 12, 0.08),
      },
      {
        symbol: 'ADA',
        name: 'Cardano',
        price: spotPrices['ADA'],
        change24h: change24h['ADA'],
        balance: balances['ADA'] || 0,
        staked: 0,
        sparkline: makeSparkline(spotPrices['ADA'], 12, 0.05),
      },
      {
        symbol: 'UNI',
        name: 'Uniswap',
        price: spotPrices['UNI'],
        change24h: change24h['UNI'],
        balance: balances['UNI'] || 0,
        staked: 0,
        sparkline: makeSparkline(spotPrices['UNI'], 12, 0.04),
      },
      // Native Platform Token
      {
        symbol: 'NEX',
        name: 'Nexus Native',
        price: spotPrices['NEX'],
        change24h: change24h['NEX'],
        balance: balances['NEX'] || 0,
        staked: 0,
        sparkline: makeSparkline(spotPrices['NEX'], 12, 0.09),
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        price: 1.00,
        change24h: 0.00,
        balance: balances['USDC'] || 0,
        staked: 0,
        sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      }
    ];
  }, [spotPrices, balances, stakedBalances, change24h]);

  const totalUsdBalance = useMemo(() => {
    let total = 0;
    assets.forEach((asset) => {
      total += (asset.balance + asset.staked) * asset.price;
    });
    return total;
  }, [assets]);

  // Notifications handler
  const triggerNotification = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Math.random().toString();
    setNotifications(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // State update actions
  const handleLoginSuccess = (signedUser: User) => {
    setUser(signedUser);
    triggerNotification('success', `Session established. Welcoming back, ${signedUser.username}!`);
  };

  const handleSignOut = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleUpdateKyc = (status: 'unverified' | 'pending' | 'verified') => {
    if (user) {
      setUser({ ...user, kycStatus: status });
      triggerNotification('success', 'Automated KYC identity verification passed.');
    }
  };

  const handleToggle2FA = (enabled: boolean) => {
    if (user) {
      setUser({ ...user, twoFactorEnabled: enabled });
      triggerNotification('success', enabled ? 'Two-Factor verification matrix secured.' : 'Two-Factor auth disabled.');
    }
  };

  const handleCreateApiKey = (name: string, perms: { read: boolean; trade: boolean; withdraw: boolean }) => {
    const keyId = `key-${Math.floor(Math.random() * 10000)}`;
    const newKey: ApiKey = {
      id: keyId,
      name,
      key: `nx_live_pk_${Math.floor(Math.random() * 1e10)}cba`,
      secret: `nx_live_sk_${Math.floor(Math.random() * 1e12)}abcde••••••••`,
      permissions: perms,
      createdAt: new Date().toLocaleDateString(),
    };

    setApiKeys(prev => [newKey, ...prev]);
    triggerNotification('success', `Minted API access key: ${name}`);
  };

  const handleRevokeApiKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    triggerNotification('info', 'API key credentials revoked.');
  };

  const handleTriggerQuickTrade = (symbol: string, action: 'buy' | 'sell') => {
    setActiveTab('trade');
    triggerNotification('info', `Switched to Trade Desk for ${symbol}`);
  };

  // Trade Executor
  const handleExecuteTrade = (
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit',
    amount: number,
    price: number
  ) => {
    const cost = amount * price;
    const fee = cost * 0.005;
    const totalCost = cost + fee;

    if (type === 'market') {
      if (side === 'buy') {
        setBalances(prev => ({
          ...prev,
          USDC: prev['USDC'] - totalCost,
          [symbol]: (prev[symbol] || 0) + amount,
        }));
        triggerNotification('success', `Successfully purchased ${amount} ${symbol} for $${totalCost.toFixed(2)}`);
      } else {
        const proceeds = cost - fee;
        setBalances(prev => ({
          ...prev,
          USDC: prev['USDC'] + proceeds,
          [symbol]: prev[symbol] - amount,
        }));
        triggerNotification('success', `Successfully sold ${amount} ${symbol} for $${proceeds.toFixed(2)}`);
      }

      setTransactions(prev => [
        {
          id: generateId(),
          type: side,
          asset: symbol,
          amount,
          price,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev
      ]);
    } else {
      const newOrder: ActiveOrder = {
        id: `limit-${Math.floor(Math.random() * 10000)}`,
        symbol,
        type: 'limit',
        side,
        amount,
        price,
        filled: 0,
        status: 'open',
        timestamp: new Date().toLocaleTimeString(),
      };
      
      if (side === 'buy') {
        setBalances(prev => ({ ...prev, USDC: prev['USDC'] - totalCost }));
      } else {
        setBalances(prev => ({ ...prev, [symbol]: prev[symbol] - amount }));
      }

      setActiveOrders(prev => [newOrder, ...prev]);
      triggerNotification('info', `Limit order queue updated: ${side.toUpperCase()} ${amount} ${symbol} @ $${price.toFixed(2)}`);
    }
  };

  // Algorithmic order creation handler
  const handleExecuteAlgoOrder = (orderData: Partial<ActiveOrder>) => {
    const newOrder: ActiveOrder = {
      id: `algo-${Math.floor(Math.random() * 10000)}`,
      symbol: orderData.symbol!,
      type: orderData.type!,
      side: orderData.side!,
      amount: orderData.amount!,
      price: orderData.price!,
      filled: 0,
      status: 'open',
      timestamp: new Date().toLocaleTimeString(),
      twapTotalChunks: orderData.twapTotalChunks,
      twapFilledChunks: orderData.twapFilledChunks,
      twapIntervalSeconds: orderData.twapIntervalSeconds,
      twapLastTriggerTime: orderData.twapLastTriggerTime,
      icebergDisclosedPercent: orderData.icebergDisclosedPercent,
      vwapTargetVolumeDepth: orderData.vwapTargetVolumeDepth,
      trailingStopPercent: orderData.trailingStopPercent,
      trailingHighestPrice: orderData.trailingHighestPrice,
      trailingActivationPrice: orderData.trailingActivationPrice,
      bracketTakeProfit: orderData.bracketTakeProfit,
      bracketStopLoss: orderData.bracketStopLoss,
    };

    const totalCost = orderData.amount! * orderData.price!;
    const fee = totalCost * 0.005;

    if (orderData.side === 'buy') {
      setBalances(prev => ({ ...prev, USDC: prev['USDC'] - (totalCost + fee) }));
    } else {
      setBalances(prev => ({ ...prev, [orderData.symbol!]: prev[orderData.symbol!] - orderData.amount! }));
    }

    setActiveOrders(prev => [newOrder, ...prev]);
    triggerNotification('success', `Locked strategy in algorithmic pipeline: ${orderData.type?.toUpperCase()} on ${orderData.symbol}`);
  };

  // Grid bot operations
  const handleStartGridBot = (botData: Omit<GridBot, 'id' | 'createdAt' | 'profitEarned'>) => {
    setBalances(prev => ({
      ...prev,
      USDC: prev['USDC'] - botData.investmentAmount
    }));

    const newBot: GridBot = {
      ...botData,
      id: `grid-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toLocaleDateString(),
      profitEarned: 0,
    };

    setGridBots(prev => [newBot, ...prev]);
    triggerNotification('success', `Initialized ${botData.symbol} High-Frequency Grid Trading Bot!`);
  };

  const handleStopGridBot = (id: string) => {
    const bot = gridBots.find(b => b.id === id);
    if (!bot) return;

    const totalRefund = bot.investmentAmount + bot.profitEarned;
    setBalances(prev => ({
      ...prev,
      USDC: prev['USDC'] + totalRefund
    }));

    setGridBots(prev => prev.map(b => b.id === id ? { ...b, active: false } : b));
    triggerNotification('info', `Grid bot stopped. Liquidated range positions. Refunded $${totalRefund.toFixed(2)} to wallet.`);
  };

  // Micro-Asset Dust Sweeper execution handler
  const handleSweepDust = (symbols: string[]) => {
    let totalValue = 0;
    const nextBalances = { ...balances };

    symbols.forEach(symbol => {
      const balance = nextBalances[symbol] || 0;
      const price = spotPrices[symbol] || 0;
      totalValue += balance * price;
      nextBalances[symbol] = 0; // Swept
    });

    const nexOutput = totalValue / 0.50; // NEX price is $0.50
    nextBalances['NEX'] = (nextBalances['NEX'] || 0) + nexOutput;

    setBalances(nextBalances);

    setTransactions(prev => [
      {
        id: generateId(),
        type: 'swap',
        asset: symbols.join('+'),
        amount: 1,
        targetAsset: 'NEX',
        targetAmount: nexOutput,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev
    ]);

    triggerNotification('success', `Micro-Asset dust swept! Minted +${nexOutput.toFixed(4)} NEX tokens into primary wallet.`);
  };

  const handleCancelOrder = (id: string) => {
    const order = activeOrders.find(o => o.id === id);
    if (!order) return;

    const refundCost = order.amount * order.price;
    const fee = refundCost * 0.005;
    if (order.side === 'buy') {
      setBalances(prev => ({ ...prev, USDC: prev['USDC'] + refundCost + fee }));
    } else {
      setBalances(prev => ({ ...prev, [order.symbol]: prev[order.symbol] + order.amount }));
    }

    setActiveOrders(prev => prev.filter(o => o.id !== id));
    triggerNotification('info', 'Active order cancelled and escrow fully refunded.');
  };

  const handleExecuteSwap = (fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number) => {
    setBalances(prev => ({
      ...prev,
      [fromSymbol]: prev[fromSymbol] - fromAmount,
      [toSymbol]: (prev[toSymbol] || 0) + toAmount,
    }));

    setTransactions(prev => [
      {
        id: generateId(),
        type: 'swap',
        asset: fromSymbol,
        amount: fromAmount,
        targetAsset: toSymbol,
        targetAmount: toAmount,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev
    ]);

    triggerNotification('success', `Swapped ${fromAmount} ${fromSymbol} to ${toAmount.toFixed(4)} ${toSymbol}`);
  };

  const handleStake = (symbol: string, amount: number) => {
    setBalances(prev => ({ ...prev, [symbol]: prev[symbol] - amount }));
    setStakedBalances(prev => ({ ...prev, [symbol]: (prev[symbol] || 0) + amount }));

    setTransactions(prev => [
      {
        id: generateId(),
        type: 'stake',
        asset: symbol,
        amount,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev
    ]);

    triggerNotification('success', `Locked ${amount} ${symbol} into high-yield staking pool.`);
  };

  const handleUnstake = (symbol: string, amount: number) => {
    setStakedBalances(prev => ({ ...prev, [symbol]: prev[symbol] - amount }));
    setBalances(prev => ({ ...prev, [symbol]: (prev[symbol] || 0) + amount }));

    setTransactions(prev => [
      {
        id: generateId(),
        type: 'unstake',
        asset: symbol,
        amount,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev
    ]);

    triggerNotification('success', `Unstaked ${amount} ${symbol} liquid tokens back to wallet.`);
  };

  const handleToggleCircuitBreaker = (armed: boolean, percent: number) => {
    setCircuitBreakerArmed(armed);
    setCircuitBreakerPercent(percent);
    triggerNotification('info', armed 
      ? `Volatility Circuit Breaker ARMED at ${percent}% threshold.` 
      : 'Volatility Circuit Breaker DISARMED. Warning: Downside unprotected.'
    );
  };

  const handleTriggerPanic = () => {
    triggerNotification('error', '⚠️ PANIC MODE ACTIVATED: Simulated high-frequency price drop initiated!');
    
    // Simulate high volatility tick on SOL (drop by 15% rapidly)
    setSpotPrices(prev => ({
      ...prev,
      SOL: parseFloat((prev['SOL'] * 0.82).toFixed(4))
    }));
  };

  // If user is not logged in, render the Auth Page
  if (!user) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans antialiased overflow-x-hidden">
      
      {/* Sidebar Layout */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onSignOut={handleSignOut}
        usdBalance={totalUsdBalance}
      />

      {/* Main Content Layout Container */}
      <main className="pl-64 min-h-screen flex flex-col justify-between relative">
        
        {/* Glowing Ambient Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-20 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Global Floating Toast Alert Center */}
        <div id="alert-center" className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 50, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="pointer-events-auto p-4 rounded-xl border flex items-start gap-3 bg-slate-950/90 border-slate-900 shadow-2xl backdrop-blur-md"
              >
                {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                {notif.type === 'error' && <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                {notif.type === 'info' && <Bell className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    {notif.type === 'success' ? 'Transaction Complete' : 'System Notice'}
                  </span>
                  <span className="text-xs font-sans text-slate-200">{notif.text}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Top bar header */}
        <header className="px-8 py-5 border-b border-slate-900/60 flex items-center justify-between relative z-10 bg-slate-950/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-medium text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-900/30">
              {activeTab.toUpperCase()} DESK
            </span>
            <div className="h-4 w-px bg-slate-900" />
            <span className="text-xs font-mono text-slate-500">UTC CLOCK: {new Date().toUTCString().slice(17, 25)}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/40 border border-slate-900 rounded-xl">
              <span className={`w-1.5 h-1.5 rounded-full ${user.kycStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-mono text-slate-400">
                KYC: {user.kycStatus.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/40 border border-slate-900 rounded-xl">
              <span className={`w-1.5 h-1.5 rounded-full ${user.twoFactorEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-mono text-slate-400">
                2FA: {user.twoFactorEnabled ? 'ACTIVE' : 'DEACTIVATED'}
              </span>
            </div>
          </div>
        </header>

        {/* Active Tab View Body */}
        <section className="flex-1 p-8 relative z-10 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView 
                  assets={assets} 
                  transactions={transactions} 
                  onTriggerQuickTrade={handleTriggerQuickTrade}
                  usdBalance={totalUsdBalance}
                  onSweepDust={handleSweepDust}
                />
              )}

              {activeTab === 'trade' && (
                <TradingView
                  assets={assets}
                  balances={balances}
                  onExecuteTrade={handleExecuteTrade}
                  onExecuteSwap={handleExecuteSwap}
                  activeOrders={activeOrders}
                  onCancelOrder={handleCancelOrder}
                  onExecuteAlgoOrder={handleExecuteAlgoOrder}
                  gridBots={gridBots}
                  onStartGridBot={handleStartGridBot}
                  onStopGridBot={handleStopGridBot}
                  circuitBreakerArmed={circuitBreakerArmed}
                  circuitBreakerPercent={circuitBreakerPercent}
                  onToggleCircuitBreaker={handleToggleCircuitBreaker}
                  onTriggerPanic={handleTriggerPanic}
                />
              )}

              {activeTab === 'earn' && (
                <EarnView
                  assets={assets}
                  balances={balances}
                  stakedBalances={stakedBalances}
                  onStake={handleStake}
                  onUnstake={handleUnstake}
                />
              )}

              {activeTab === 'security' && (
                <SecurityView
                  user={user}
                  onUpdateKyc={handleUpdateKyc}
                  onToggle2FA={handleToggle2FA}
                />
              )}

              {activeTab === 'developer' && (
                <DeveloperDocs
                  apiKeys={apiKeys}
                  onCreateKey={handleCreateApiKey}
                  onRevokeKey={handleRevokeApiKey}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Humble Footer */}
        <footer className="px-8 py-5 border-t border-slate-900/60 relative z-10 bg-slate-950/10 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <span className="text-[10px] font-mono">© 2026 Nexus Exchange Corp. All clearing balances secured by cold-storage multisig.</span>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Privacy Protocols</a>
            <a href="#" className="hover:text-slate-300">Audit Status</a>
          </div>
        </footer>

      </main>
    </div>
  );
}
