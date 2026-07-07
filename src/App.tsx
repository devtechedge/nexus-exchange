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
  Bell,
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Fingerprint,
  Code,
  LogOut,
  MoreHorizontal
} from 'lucide-react';

import { User, Asset, Transaction, ActiveOrder, ApiKey, GridBot } from './types';
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TradingView from './components/TradingView';
import EarnView from './components/EarnView';
import SecurityView from './components/SecurityView';
import DeveloperDocs from './components/DeveloperDocs';
import SocialView from './components/SocialView';
import Confetti from './components/gamified/Confetti';
import ClaraBuddy from './components/gamified/ClaraBuddy';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Fee discount & Theme accent states
  const [feeDiscount, setFeeDiscount] = useState(0);
  const [activeAccentColor, setActiveAccentColor] = useState('cyan');

  // --- BATCH 1: GAMIFIED LEARNING & ONBOARDING GLOBAL STATES ---
  const [userXp, setUserXp] = useState<number>(150);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [streakDays, setStreakDays] = useState<number>(3); // Fun 3-day starting streak!
  const [selectedAvatar, setSelectedAvatar] = useState<string>('piggy');
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // --- BATCH 2: INTERACTIVE SANDBOX & ALGORITHMIC PRACTICE STATES ---
  const [isSandboxActive, setIsSandboxActive] = useState<boolean>(false);
  const [isForkingProgress, setIsForkingProgress] = useState<boolean>(false);
  const [forkLogs, setForkLogs] = useState<string[]>([]);
  const [sandboxBalances, setSandboxBalances] = useState<{ [key: string]: number }>({
    USDC: 50000,
    SOL: 100,
    ETH: 10,
    LINK: 250,
    DOT: 500,
    DOGE: 1000,
    ADA: 2000,
    UNI: 150,
    NEX: 1000,
  });
  const [latencyMs, setLatencyMs] = useState<number>(120);
  const [rateLimitProb, setRateLimitProb] = useState<number>(0);
  const [packetLossPct, setPacketLossPct] = useState<number>(0);

  // Helper function to award XP with beautiful leveling checks and sparkles
  const awardXp = (amount: number, reason: string) => {
    setUserXp((prevXp) => {
      const nextXp = prevXp + amount;
      const targetXp = userLevel * 500;
      if (nextXp >= targetXp) {
        setUserLevel((prevLvl) => {
          const nextLvl = prevLvl + 1;
          setConfettiActive(true);
          // Let's defer triggerNotification inside a set timeout to avoid render-cycle alerts
          setTimeout(() => {
            triggerNotification('success', `🌟 LEVEL UP! You reached Level ${nextLvl}! Unlocked new custom mascot avatars!`);
          }, 100);
          return nextLvl;
        });
        return nextXp - targetXp;
      }
      setTimeout(() => {
        triggerNotification('success', `✨ +${amount} XP: ${reason}`);
      }, 100);
      return nextXp;
    });
  };

  // Helper function to trigger quest completion
  const triggerQuestCompletion = (questId: string) => {
    setCompletedQuests((prev) => {
      if (prev.includes(questId)) return prev;
      
      let xpReward = 50;
      let reason = '';
      if (questId === 'deposit') { xpReward = 100; reason = 'Completed Quest: Top up your Piggy Bank!'; }
      else if (questId === 'star') { xpReward = 50; reason = 'Completed Quest: Explore different Coins (Star Watchlist)!'; }
      else if (questId === 'trade') { xpReward = 150; reason = 'Completed Quest: Acquire your first Coin!'; }
      else if (questId === 'stake') { xpReward = 125; reason = 'Completed Quest: Save & Grow!'; }
      else if (questId === 'dev-key') { xpReward = 80; reason = 'Completed Quest: Enter Developer Mode!'; }
      else if (questId === 'zk-proof') { xpReward = 200; reason = 'Completed Quest: Cryptographic Sovereign ROI Verification!'; }
      else if (questId === 'clara') { xpReward = 50; reason = 'Completed Quest: Chat with Clara the Mascot Hamster!'; }

      awardXp(xpReward, reason);
      return [...prev, questId];
    });
  };

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

  // Automated reactive hooks for Quest completion check
  useEffect(() => {
    if (balances.USDC > 0) {
      triggerQuestCompletion('deposit');
    }
  }, [balances.USDC]);

  useEffect(() => {
    if (apiKeys.length > 0) {
      triggerQuestCompletion('dev-key');
    }
  }, [apiKeys]);

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
          const orderIsSandbox = !!order.isSandbox;
          const setTargetBalances = orderIsSandbox ? setSandboxBalances : setBalances;

          // A. Volatility Circuit Breaker Trigger
          if (circuitBreakerArmed && order.symbol === 'SOL' && solDropDetected) {
            // Cancel and refund
            const refundCost = order.amount * order.price;
            const fee = refundCost * 0.005;
            if (order.side === 'buy') {
              setTargetBalances(b => ({ ...b, USDC: b['USDC'] + refundCost + fee }));
            } else {
              setTargetBalances(b => ({ ...b, [order.symbol]: b[order.symbol] + order.amount }));
            }
            triggerNotification('error', `⚡ CIRCUIT BREAKER TRIPPED! Drops exceeded ${circuitBreakerPercent}%. Order ${order.id} cancelled safely.`);
            return; // Order removed
          }

          // B. Normal Limit matching
          if (order.type === 'limit') {
            const isMatch = order.side === 'buy' ? currentPrice <= order.price : currentPrice >= order.price;
            if (isMatch) {
              if (order.side === 'buy') {
                setTargetBalances(b => ({ ...b, [order.symbol]: (b[order.symbol] || 0) + order.amount }));
              } else {
                const proceeds = order.amount * order.price - (order.amount * order.price * 0.005);
                setTargetBalances(b => ({ ...b, USDC: b['USDC'] + proceeds }));
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
                  isSandbox: orderIsSandbox,
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
              setTargetBalances(b => ({
                ...b,
                [order.symbol]: (b[order.symbol] || 0) + chunkAmount
              }));
            } else {
              const proceeds = chunkCost - chunkFee;
              setTargetBalances(b => ({
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
                isSandbox: orderIsSandbox,
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
                setTargetBalances(b => ({ ...b, [order.symbol]: (b[order.symbol] || 0) + order.amount }));
              } else {
                const proceeds = order.amount * currentPrice - (order.amount * currentPrice * 0.005);
                setTargetBalances(b => ({ ...b, USDC: b['USDC'] + proceeds }));
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
                  isSandbox: orderIsSandbox,
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
              setTargetBalances(b => ({
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
                  isSandbox: orderIsSandbox,
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
              setTargetBalances(b => ({
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
                  isSandbox: orderIsSandbox,
                },
                ...txs
              ]);

              triggerNotification('success', `📈 Bracket OCO: Take Profit filled @ $${tp.toFixed(2)}! SL cancelled.`);
              return;
            } else if (currentPrice <= sl) {
              const proceeds = order.amount * sl - (order.amount * sl * 0.005);
              setTargetBalances(b => ({
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
                  isSandbox: orderIsSandbox,
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
            const botIsSandbox = !!bot.isSandbox;
            const setTargetBalances = botIsSandbox ? setSandboxBalances : setBalances;
            setTargetBalances(b => ({ ...b, USDC: b['USDC'] + yieldGained }));

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
                isSandbox: botIsSandbox,
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

  // Switch between live and sandbox balances dynamically based on sandbox active state
  const currentBalances = useMemo(() => {
    return isSandboxActive ? sandboxBalances : balances;
  }, [isSandboxActive, balances, sandboxBalances]);

  // Sync balances and prices to get dynamic USD Valuation
  const assets: Asset[] = useMemo(() => {
    return [
      {
        symbol: 'SOL',
        name: 'Solana',
        price: spotPrices['SOL'],
        change24h: change24h['SOL'],
        balance: currentBalances['SOL'] || 0,
        staked: stakedBalances['SOL'] || 0,
        sparkline: makeSparkline(spotPrices['SOL'], 12, 0.03),
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: spotPrices['ETH'],
        change24h: change24h['ETH'],
        balance: currentBalances['ETH'] || 0,
        staked: stakedBalances['ETH'] || 0,
        sparkline: makeSparkline(spotPrices['ETH'], 12, 0.025),
      },
      {
        symbol: 'LINK',
        name: 'Chainlink',
        price: spotPrices['LINK'],
        change24h: change24h['LINK'],
        balance: currentBalances['LINK'] || 0,
        staked: stakedBalances['LINK'] || 0,
        sparkline: makeSparkline(spotPrices['LINK'], 12, 0.04),
      },
      {
        symbol: 'DOT',
        name: 'Polkadot',
        price: spotPrices['DOT'],
        change24h: change24h['DOT'],
        balance: currentBalances['DOT'] || 0,
        staked: stakedBalances['DOT'] || 0,
        sparkline: makeSparkline(spotPrices['DOT'], 12, 0.06),
      },
      // Dust Tokens
      {
        symbol: 'DOGE',
        name: 'Dogecoin',
        price: spotPrices['DOGE'],
        change24h: change24h['DOGE'],
        balance: currentBalances['DOGE'] || 0,
        staked: 0,
        sparkline: makeSparkline(spotPrices['DOGE'], 12, 0.08),
      },
      {
        symbol: 'ADA',
        name: 'Cardano',
        price: spotPrices['ADA'],
        change24h: change24h['ADA'],
        balance: currentBalances['ADA'] || 0,
        staked: 0,
        sparkline: makeSparkline(spotPrices['ADA'], 12, 0.05),
      },
      {
        symbol: 'UNI',
        name: 'Uniswap',
        price: spotPrices['UNI'],
        change24h: change24h['UNI'],
        balance: currentBalances['UNI'] || 0,
        staked: 0,
        sparkline: makeSparkline(spotPrices['UNI'], 12, 0.04),
      },
      // Native Platform Token
      {
        symbol: 'NEX',
        name: 'Nexus Native',
        price: spotPrices['NEX'],
        change24h: change24h['NEX'],
        balance: currentBalances['NEX'] || 0,
        staked: 0,
        sparkline: makeSparkline(spotPrices['NEX'], 12, 0.09),
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        price: 1.00,
        change24h: 0.00,
        balance: currentBalances['USDC'] || 0,
        staked: 0,
        sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      }
    ];
  }, [spotPrices, currentBalances, stakedBalances, change24h]);

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

  // Sandbox execution helper with network latency, rate limit, and packet loss simulation
  const executeSandboxWithSim = (action: () => void, actionName: string) => {
    if (isSandboxActive) {
      // 1. Rate Limit check
      if (rateLimitProb > 0 && Math.random() * 100 < rateLimitProb) {
        triggerNotification('error', `🛑 HTTP 429: Too Many Requests. Your action for [${actionName}] was rate-limited!`);
        return;
      }
      // 2. Packet Loss check
      if (packetLossPct > 0 && Math.random() * 100 < packetLossPct) {
        triggerNotification('error', `📡 Network Packet Loss. Connection timed out trying to reach API endpoint for [${actionName}].`);
        return;
      }
      // 3. Latency simulation
      if (latencyMs > 0) {
        triggerNotification('info', `⏳ Network Delay: Simulating ${latencyMs}ms latency for [${actionName}]...`);
        setTimeout(() => {
          action();
          triggerNotification('success', `⚡ Execution success: [${actionName}] completed after ${latencyMs}ms roundtrip.`);
        }, latencyMs);
        return;
      }
    }
    // Default synchronous execution
    action();
  };

  // Trade Executor
  const handleExecuteTrade = (
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit',
    amount: number,
    price: number
  ) => {
    const orderIsSandbox = isSandboxActive;
    const setTargetBalances = orderIsSandbox ? setSandboxBalances : setBalances;

    const action = () => {
      const cost = amount * price;
      const baseFee = cost * 0.005;
      const discountFactor = 1 - (feeDiscount / 100);
      const fee = baseFee * discountFactor;
      const totalCost = cost + fee;

      if (type === 'market') {
        if (side === 'buy') {
          setTargetBalances(prev => ({
            ...prev,
            USDC: prev['USDC'] - totalCost,
            [symbol]: (prev[symbol] || 0) + amount,
          }));
          triggerNotification('success', `Successfully purchased ${amount} ${symbol} for $${totalCost.toFixed(2)}`);
        } else {
          const proceeds = cost - fee;
          setTargetBalances(prev => ({
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
            isSandbox: orderIsSandbox,
          },
          ...prev
        ]);
        triggerQuestCompletion('trade');
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
          isSandbox: orderIsSandbox,
        };
        
        if (side === 'buy') {
          setTargetBalances(prev => ({ ...prev, USDC: prev['USDC'] - totalCost }));
        } else {
          setTargetBalances(prev => ({ ...prev, [symbol]: prev[symbol] - amount }));
        }

        setActiveOrders(prev => [newOrder, ...prev]);
        triggerNotification('info', `Limit order queue updated: ${side.toUpperCase()} ${amount} ${symbol} @ $${price.toFixed(2)}`);
        triggerQuestCompletion('trade');
      }
    };

    executeSandboxWithSim(action, `${side.toUpperCase()} ${amount} ${symbol} (${type.toUpperCase()})`);
  };

  // Algorithmic order creation handler
  const handleExecuteAlgoOrder = (orderData: Partial<ActiveOrder>) => {
    const orderIsSandbox = isSandboxActive;
    const setTargetBalances = orderIsSandbox ? setSandboxBalances : setBalances;

    const action = () => {
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
        isSandbox: orderIsSandbox,
      };

      const totalCost = orderData.amount! * orderData.price!;
      const baseFee = totalCost * 0.005;
      const discountFactor = 1 - (feeDiscount / 100);
      const fee = baseFee * discountFactor;

      if (orderData.side === 'buy') {
        setTargetBalances(prev => ({ ...prev, USDC: prev['USDC'] - (totalCost + fee) }));
      } else {
        setTargetBalances(prev => ({ ...prev, [orderData.symbol!]: prev[orderData.symbol!] - orderData.amount! }));
      }

      setActiveOrders(prev => [newOrder, ...prev]);
      triggerNotification('success', `Locked strategy in algorithmic pipeline: ${orderData.type?.toUpperCase()} on ${orderData.symbol}`);
    };

    executeSandboxWithSim(action, `ALGO ${orderData.type?.toUpperCase()} ${orderData.symbol}`);
  };

  // Grid bot operations
  const handleStartGridBot = (botData: Omit<GridBot, 'id' | 'createdAt' | 'profitEarned'>) => {
    const orderIsSandbox = isSandboxActive;
    const setTargetBalances = orderIsSandbox ? setSandboxBalances : setBalances;

    const action = () => {
      setTargetBalances(prev => ({
        ...prev,
        USDC: prev['USDC'] - botData.investmentAmount
      }));

      const newBot: GridBot = {
        ...botData,
        id: `grid-${Math.floor(Math.random() * 10000)}`,
        createdAt: new Date().toLocaleDateString(),
        profitEarned: 0,
        isSandbox: orderIsSandbox,
      };

      setGridBots(prev => [newBot, ...prev]);
      triggerNotification('success', `Initialized ${botData.symbol} High-Frequency Grid Trading Bot!`);
    };

    executeSandboxWithSim(action, `GRID BOT ${botData.symbol}`);
  };

  const handleStopGridBot = (id: string) => {
    const bot = gridBots.find(b => b.id === id);
    if (!bot) return;

    const orderIsSandbox = !!bot.isSandbox;
    const setTargetBalances = orderIsSandbox ? setSandboxBalances : setBalances;

    const action = () => {
      const totalRefund = bot.investmentAmount + bot.profitEarned;
      setTargetBalances(prev => ({
        ...prev,
        USDC: prev['USDC'] + totalRefund
      }));

      setGridBots(prev => prev.map(b => b.id === id ? { ...b, active: false } : b));
      triggerNotification('info', `Grid bot stopped. Liquidated range positions. Refunded $${totalRefund.toFixed(2)} to wallet.`);
    };

    executeSandboxWithSim(action, `STOP GRID BOT ${bot.symbol}`);
  };

  // Micro-Asset Dust Sweeper execution handler
  const handleSweepDust = (symbols: string[]) => {
    const orderIsSandbox = isSandboxActive;
    const setTargetBalances = orderIsSandbox ? setSandboxBalances : setBalances;

    const action = () => {
      let totalValue = 0;
      const currentB = orderIsSandbox ? sandboxBalances : balances;
      const nextBalances = { ...currentB };

      symbols.forEach(symbol => {
        const balance = nextBalances[symbol] || 0;
        const price = spotPrices[symbol] || 0;
        totalValue += balance * price;
        nextBalances[symbol] = 0; // Swept
      });

      const nexOutput = totalValue / 0.50; // NEX price is $0.50
      nextBalances['NEX'] = (nextBalances['NEX'] || 0) + nexOutput;

      setTargetBalances(nextBalances);

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
          isSandbox: orderIsSandbox,
        },
        ...prev
      ]);

      triggerNotification('success', `Micro-Asset dust swept! Minted +${nexOutput.toFixed(4)} NEX tokens into primary wallet.`);
    };

    executeSandboxWithSim(action, `DUST SWEEP (${symbols.length} assets)`);
  };

  // Deposit Money into Crypto Piggy Bank (Cash or Faucet)
  const handleDeposit = (asset: string, amount: number, method: string = 'Simulated Wire') => {
    const isSandbox = isSandboxActive;
    const setTargetBalances = isSandbox ? setSandboxBalances : setBalances;

    const action = () => {
      setTargetBalances(prev => ({
        ...prev,
        [asset]: (prev[asset] || 0) + amount,
      }));

      setTransactions(prev => [
        {
          id: generateId(),
          type: 'deposit',
          asset,
          amount,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          isSandbox,
        },
        ...prev
      ]);

      if (asset === 'USDC') {
        triggerQuestCompletion('deposit');
      }
    };

    executeSandboxWithSim(action, `DEPOSIT ${amount} ${asset} (${method})`);
  };

  // Withdraw Money from Crypto Piggy Bank (Cash or Send crypto)
  const handleWithdraw = (asset: string, amount: number, address: string) => {
    const isSandbox = isSandboxActive;
    const setTargetBalances = isSandbox ? setSandboxBalances : setBalances;
    const currentB = isSandbox ? sandboxBalances : balances;

    if ((currentB[asset] || 0) < amount) {
      triggerNotification('error', `Insufficient ${asset} balance to withdraw ${amount}`);
      return false;
    }

    const action = () => {
      setTargetBalances(prev => ({
        ...prev,
        [asset]: (prev[asset] || 0) - amount,
      }));

      setTransactions(prev => [
        {
          id: generateId(),
          type: 'withdraw',
          asset,
          amount,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString(),
          isSandbox,
        },
        ...prev
      ]);
    };

    executeSandboxWithSim(action, `WITHDRAW ${amount} ${asset} TO ${address.slice(0, 8)}...`);
    return true;
  };

  const handleCancelOrder = (id: string) => {
    const order = activeOrders.find(o => o.id === id);
    if (!order) return;

    const orderIsSandbox = !!order.isSandbox;
    const setTargetBalances = orderIsSandbox ? setSandboxBalances : setBalances;

    const action = () => {
      const refundCost = order.amount * order.price;
      const fee = refundCost * 0.005;
      if (order.side === 'buy') {
        setTargetBalances(prev => ({ ...prev, USDC: prev['USDC'] + refundCost + fee }));
      } else {
        setTargetBalances(prev => ({ ...prev, [order.symbol]: prev[order.symbol] + order.amount }));
      }

      setActiveOrders(prev => prev.filter(o => o.id !== id));
      triggerNotification('info', 'Active order cancelled and escrow fully refunded.');
    };

    executeSandboxWithSim(action, `CANCEL LIMIT ORDER ${order.symbol}`);
  };

  const handleExecuteSwap = (fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number) => {
    const orderIsSandbox = isSandboxActive;
    const setTargetBalances = orderIsSandbox ? setSandboxBalances : setBalances;

    const action = () => {
      setTargetBalances(prev => ({
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
          isSandbox: orderIsSandbox,
        },
        ...prev
      ]);

      triggerNotification('success', `Swapped ${fromAmount} ${fromSymbol} to ${toAmount.toFixed(4)} ${toSymbol}`);
      triggerQuestCompletion('trade');
    };

    executeSandboxWithSim(action, `SWAP ${fromSymbol}➔${toSymbol}`);
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
    triggerQuestCompletion('stake');
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
      
      {/* Level-Up Celebration Sparkles Confetti */}
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* Clara the helpful crypto hamster mascot chatbot */}
      <ClaraBuddy onNotification={triggerNotification} onTriggerQuestCompletion={triggerQuestCompletion} />
      
      {/* Sidebar Layout */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onSignOut={handleSignOut}
        usdBalance={totalUsdBalance}
        userLevel={userLevel}
        userXp={userXp}
        selectedAvatar={selectedAvatar}
        streakDays={streakDays}
      />

      {/* Main Content Layout Container */}
      <main className="pl-0 md:pl-64 min-h-screen flex flex-col justify-between relative">
        
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
        <header className="sticky top-0 z-40 px-4 md:px-8 py-3.5 md:py-4 border-b border-slate-900/60 flex items-center justify-between bg-[#0B0F19]/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {/* Mobile Logo: visible only on mobile */}
            <div className="flex md:hidden items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold tracking-tight text-xs text-slate-200">NEXUS <span className="text-[9px] text-cyan-400 font-mono">V4.0</span></span>
            </div>
            
            <div className="hidden md:block text-[10px] font-mono font-medium text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-900/30">
              {activeTab.toUpperCase()} DESK
            </div>
            <div className="md:hidden text-[9px] font-mono font-medium text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-900/30">
              {activeTab.toUpperCase()}
            </div>
            <div className="hidden sm:block h-4 w-px bg-slate-900/60" />
            <span className="hidden sm:inline text-xs font-mono text-slate-500">UTC CLOCK: {new Date().toUTCString().slice(17, 25)}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/40 border border-slate-900 rounded-xl">
              <span className={`w-1.5 h-1.5 rounded-full ${user.kycStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-mono text-slate-400">
                KYC: {user.kycStatus.toUpperCase()}
              </span>
            </div>
            
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/40 border border-slate-900 rounded-xl">
              <span className={`w-1.5 h-1.5 rounded-full ${user.twoFactorEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-mono text-slate-400">
                2FA: {user.twoFactorEnabled ? 'ACTIVE' : 'DEACTIVATED'}
              </span>
            </div>
          </div>
        </header>

        {/* Active Tab View Body */}
        <section className="flex-1 p-4 md:p-8 pb-24 md:pb-8 relative z-10 max-w-7xl w-full mx-auto overflow-x-hidden">
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
                  userXp={userXp}
                  userLevel={userLevel}
                  streakDays={streakDays}
                  selectedAvatar={selectedAvatar}
                  setSelectedAvatar={setSelectedAvatar}
                  completedQuests={completedQuests}
                  triggerQuestCompletion={triggerQuestCompletion}
                  completedLessons={completedLessons}
                  onCompleteLesson={(lessonId, rewardType, rewardAmt, xpReward) => {
                    setCompletedLessons((prev) => [...prev, lessonId]);
                    const setTargetBalances = isSandboxActive ? setSandboxBalances : setBalances;
                    setTargetBalances((prev) => ({
                      ...prev,
                      [rewardType]: (prev[rewardType] || 0) + rewardAmt,
                    }));
                    awardXp(xpReward, `Completed Lesson Quiz!`);
                  }}
                  onNotification={triggerNotification}
                  onWinReward={(type, amount, label) => {
                    if (type === 'XP') {
                      awardXp(amount, `Practice Wheel of Fortune!`);
                    } else {
                      const setTargetBalances = isSandboxActive ? setSandboxBalances : setBalances;
                      setTargetBalances((prev) => ({
                        ...prev,
                        [type]: (prev[type] || 0) + amount,
                      }));
                      awardXp(50, `Won ${label} on Wheel!`);
                    }
                  }}
                  isSandboxActive={isSandboxActive}
                  onDeposit={handleDeposit}
                  onWithdraw={handleWithdraw}
                />
              )}

              {activeTab === 'trade' && (
                <TradingView
                  assets={assets}
                  balances={currentBalances}
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
                  isSandboxActive={isSandboxActive}
                />
              )}

              {activeTab === 'earn' && (
                <EarnView
                  assets={assets}
                  balances={balances}
                  setBalances={setBalances}
                  stakedBalances={stakedBalances}
                  setStakedBalances={setStakedBalances}
                  onStake={handleStake}
                  onUnstake={handleUnstake}
                  onNotification={triggerNotification}
                  feeDiscount={feeDiscount}
                  setFeeDiscount={setFeeDiscount}
                />
              )}

              {activeTab === 'security' && (
                <SecurityView
                  user={user}
                  onUpdateKyc={handleUpdateKyc}
                  onToggle2FA={handleToggle2FA}
                  balances={balances}
                  spotPrices={spotPrices}
                  onNotification={triggerNotification}
                />
              )}

              {activeTab === 'developer' && (
                <DeveloperDocs
                  apiKeys={apiKeys}
                  onCreateKey={handleCreateApiKey}
                  onRevokeKey={handleRevokeApiKey}
                  isSandboxActive={isSandboxActive}
                  setIsSandboxActive={setIsSandboxActive}
                  isForkingProgress={isForkingProgress}
                  setIsForkingProgress={setIsForkingProgress}
                  forkLogs={forkLogs}
                  setForkLogs={setForkLogs}
                  sandboxBalances={sandboxBalances}
                  setSandboxBalances={setSandboxBalances}
                  latencyMs={latencyMs}
                  setLatencyMs={setLatencyMs}
                  rateLimitProb={rateLimitProb}
                  setRateLimitProb={setRateLimitProb}
                  packetLossPct={packetLossPct}
                  setPacketLossPct={setPacketLossPct}
                  triggerQuestCompletion={triggerQuestCompletion}
                />
              )}

              {activeTab === 'social' && (
                <SocialView
                  assets={assets}
                  balances={balances}
                  setBalances={setBalances}
                  onNotification={triggerNotification}
                  feeDiscount={feeDiscount}
                  setFeeDiscount={setFeeDiscount}
                  activeAccentColor={activeAccentColor}
                  setActiveAccentColor={setActiveAccentColor}
                  triggerQuestCompletion={triggerQuestCompletion}
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

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-slate-900/80 bg-slate-950/95 backdrop-blur-md px-2 flex items-center justify-around pb-safe">
        <button
          onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Dashboard</span>
        </button>
        <button
          onClick={() => { setActiveTab('trade'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${activeTab === 'trade' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Swap</span>
        </button>
        <button
          onClick={() => { setActiveTab('earn'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${activeTab === 'earn' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Rewards</span>
        </button>
        <button
          onClick={() => { setActiveTab('social'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${activeTab === 'social' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Social</span>
        </button>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${mobileMenuOpen ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">More</span>
        </button>
      </nav>

      {/* MOBILE OVERFLOW DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-50"
            />
            {/* Fullscreen bottom-sheet Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-900 rounded-t-3xl p-6 pb-12 max-h-[75vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="font-mono font-bold text-sm text-white">NEXUS TOOLS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User overview inside the mobile drawer */}
              <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shrink-0 relative">
                  <span>{
                    selectedAvatar === 'piggy' ? '🐷' :
                    selectedAvatar === 'bunny' ? '🐰' :
                    selectedAvatar === 'shiba' ? '🐕' :
                    selectedAvatar === 'kitten' ? '🐱' :
                    selectedAvatar === 'hamster' ? '🐹' : '🐷'
                  }</span>
                  <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 text-[7px] font-mono font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-950">
                    L{userLevel}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-200 truncate">{user.username}</span>
                  <span className="text-[10px] font-mono text-slate-500 truncate">{user.email}</span>
                </div>
              </div>

              {/* Drawer Links */}
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => { setActiveTab('security'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    activeTab === 'security'
                      ? 'bg-slate-900 text-cyan-400 border-slate-800'
                      : 'bg-slate-900/20 text-slate-300 border-transparent hover:bg-slate-900/40'
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  <span className="text-xs font-medium">Identity & Security Check</span>
                </button>
                <button
                  onClick={() => { setActiveTab('developer'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    activeTab === 'developer'
                      ? 'bg-slate-900 text-cyan-400 border-slate-800'
                      : 'bg-slate-900/20 text-slate-300 border-transparent hover:bg-slate-900/40'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span className="text-xs font-medium">Developer Tools</span>
                </button>
              </div>

              {/* Progress status in Drawer */}
              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl mb-6 space-y-2 text-left">
                <div className="flex justify-between items-center text-[10px] font-sans font-bold text-slate-400">
                  <span className="text-cyan-400 flex items-center gap-1">Level {userLevel} Practicer</span>
                  <span className="text-amber-400">🔥 {streakDays}-Day!</span>
                </div>
                <div className="relative w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900/50">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(userXp / (userLevel * 500)) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-mono text-slate-400 hover:text-red-400 bg-red-950/10 hover:bg-red-950/25 rounded-xl border border-red-900/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Log Out / Safe Exit
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
