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

import { User, Asset, Transaction, ActiveOrder, ApiKey } from './types';
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
let idCounter = 100;
const generateId = () => {
  idCounter++;
  return `tx-${idCounter}`;
};

export default function App() {
  // Global Session state
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<{ id: string; type: 'success' | 'error' | 'info'; text: string }[]>([]);

  // Balances
  const [balances, setBalances] = useState<{ [key: string]: number }>({
    USDC: 15420.50,
    SOL: 45.22,
    ETH: 1.84,
    LINK: 110.00,
    DOT: 240.00,
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
    USDC: 1.00,
  });

  // 24h change %
  const [change24h, setChange24h] = useState<{ [key: string]: number }>({
    SOL: 4.32,
    ETH: -1.15,
    LINK: 0.45,
    DOT: 11.40,
    USDC: 0.00,
  });

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

  // Active orders
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

  // Simulation of live price ticking (fluctuate prices slightly every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotPrices((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((symbol) => {
          if (symbol !== 'USDC') {
            const pct = (Math.random() - 0.5) * 0.002; // ±0.1% fluctuation
            next[symbol] = parseFloat((next[symbol] * (1 + pct)).toFixed(4));
          }
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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

      // Add to transactions ledger
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
      // Limit order logic (add to active queue)
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
      
      // Lock funds in escrow if buying
      if (side === 'buy') {
        setBalances(prev => ({ ...prev, USDC: prev['USDC'] - totalCost }));
      } else {
        setBalances(prev => ({ ...prev, [symbol]: prev[symbol] - amount }));
      }

      setActiveOrders(prev => [newOrder, ...prev]);
      triggerNotification('info', `Limit order queue updated: ${side.toUpperCase()} ${amount} ${symbol} @ $${price.toFixed(2)}`);
    }
  };

  const handleCancelOrder = (id: string) => {
    const order = activeOrders.find(o => o.id === id);
    if (!order) return;

    // Refund locked escrow funds
    const refundCost = order.amount * order.price;
    const fee = refundCost * 0.005;
    if (order.side === 'buy') {
      setBalances(prev => ({ ...prev, USDC: prev['USDC'] + refundCost + fee }));
    } else {
      setBalances(prev => ({ ...prev, [order.symbol]: prev[order.symbol] + order.amount }));
    }

    setActiveOrders(prev => prev.filter(o => o.id !== id));
    triggerNotification('info', 'Limit order cancelled and escrow refunded.');
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
    // We can pass quick trade details by updating internal state or letting user use the preselected tab
    triggerNotification('info', `Switched to Trade Desk for ${symbol}`);
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
