import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Compass, 
  MessageSquare, 
  LineChart, 
  Scale, 
  Flame, 
  Award, 
  ShieldCheck, 
  Coins, 
  Zap 
} from 'lucide-react';
import { 
  Asset, 
  LeaderboardTrader, 
  TradeSignalStrategy, 
  SovereignGuild, 
  P2PLoan 
} from '../types';

// Import sub-panels
import ExplorersHub from './social/ExplorersHub';
import LeaderboardsPanel from './social/LeaderboardsPanel';
import SignalsPanel from './social/SignalsPanel';
import BacktestPanel from './social/BacktestPanel';
import LendingPanel from './social/LendingPanel';
import MacroPanel from './social/MacroPanel';
import AchievementsPanel from './social/AchievementsPanel';

interface SocialViewProps {
  assets: Asset[];
  balances: { [key: string]: number };
  setBalances: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
  feeDiscount: number;
  setFeeDiscount: React.Dispatch<React.SetStateAction<number>>;
  activeAccentColor: string;
  setActiveAccentColor: (color: string) => void;
  triggerQuestCompletion?: (questId: string) => void;
}

export default function SocialView({
  assets,
  balances,
  setBalances,
  onNotification,
  feeDiscount,
  setFeeDiscount,
  activeAccentColor,
  setActiveAccentColor,
  triggerQuestCompletion
}: SocialViewProps) {
  // --- SUB-TAB SECTIONS ---
  const [activeSubTab, setActiveSubTab] = useState<'leaderboards' | 'signals' | 'backtest' | 'lending' | 'macro' | 'achievements'>('leaderboards');

  // --- FEATURE STATE 11: Secret Leaderboard (ZK Verification) ---
  const [zkProving, setZkProving] = useState(false);
  const [zkProvenTraderId, setZkProvenTraderId] = useState<string | null>(null);
  const [zkProofSteps, setZkProofSteps] = useState<string[]>([]);
  const [zkSuccess, setZkSuccess] = useState(false);

  const [traders, setTraders] = useState<LeaderboardTrader[]>([
    {
      id: 'trader-1',
      alias: 'SovereignTrader #481',
      verifiedRoi: 248.35,
      level: 'Elite Savings Guild Leader',
      copiersCount: 142,
      riskScore: 3,
      isZkVerified: true,
      portfolioDistribution: { SOL: 40, ETH: 30, LINK: 20, NEX: 10 }
    },
    {
      id: 'trader-2',
      alias: 'AlchemicViper #102',
      verifiedRoi: 189.42,
      level: 'Speed-Bot Commander',
      copiersCount: 89,
      riskScore: 5,
      isZkVerified: false,
      portfolioDistribution: { SOL: 50, DOT: 30, DOGE: 20 }
    },
    {
      id: 'trader-3',
      alias: 'ShadowPool #99',
      verifiedRoi: 135.18,
      level: 'Macro Market Wave-Rider',
      copiersCount: 64,
      riskScore: 2,
      isZkVerified: true,
      portfolioDistribution: { ETH: 60, USDC: 30, LINK: 10 }
    }
  ]);

  // --- FEATURE STATE 12: Proportional Copy Pools ---
  const [copyAllocations, setCopyAllocations] = useState<{ [key: string]: number }>({
    'trader-1': 500, // Copied with $500 USDC
    'trader-2': 0,
    'trader-3': 0
  });
  const [allocationInput, setAllocationInput] = useState<{ [key: string]: string }>({});

  const handleCopyAllocate = (traderId: string) => {
    const amount = parseFloat(allocationInput[traderId] || '');
    if (isNaN(amount) || amount <= 0) {
      onNotification('error', 'Please enter a valid amount of USDC to copy allocate.');
      return;
    }
    const currentUsdc = balances['USDC'] || 0;
    if (amount > currentUsdc) {
      onNotification('error', `Insufficient USDC balance. Available: $${currentUsdc.toFixed(2)}`);
      return;
    }

    // Deduct USDC, add to copy state
    setBalances(prev => ({
      ...prev,
      USDC: prev['USDC'] - amount
    }));
    setCopyAllocations(prev => ({
      ...prev,
      [traderId]: (prev[traderId] || 0) + amount
    }));
    setAllocationInput(prev => ({ ...prev, [traderId]: '' }));
    
    // Update copiers count of trader
    setTraders(prev => prev.map(t => t.id === traderId ? { ...t, copiersCount: t.copiersCount + 1 } : t));

    onNotification('success', `Proportional portfolio copy-allocation of $${amount.toFixed(2)} USDC locked!`);
  };

  const handleCopyWithdraw = (traderId: string) => {
    const activeAlloc = copyAllocations[traderId] || 0;
    if (activeAlloc <= 0) {
      onNotification('error', 'No active copy allocation for this trader.');
      return;
    }

    setBalances(prev => ({
      ...prev,
      USDC: (prev['USDC'] || 0) + activeAlloc
    }));
    setCopyAllocations(prev => ({
      ...prev,
      [traderId]: 0
    }));

    setTraders(prev => prev.map(t => t.id === traderId ? { ...t, copiersCount: Math.max(0, t.copiersCount - 1) } : t));
    onNotification('info', `Successfully liquidated copy pool. Refunded $${activeAlloc.toFixed(2)} USDC to wallet.`);
  };

  const executeZkProof = (traderId: string) => {
    setZkProvenTraderId(traderId);
    setZkProving(true);
    setZkSuccess(false);
    setZkProofSteps([]);

    const steps = [
      'Establishing connections with secure network validators...',
      'Deriving ephemeral math verification keys (Elliptic curve points)...',
      'Hiding your true wallet address and net worth behind magic group signatures...',
      'Solving complex algebraic formula proofs...',
      'Generating highly secure, lightweight math proof (Groth16 ZK-SNARK)...',
      'Broadcasting cryptographic proof to secure network checkers...',
      'Consensus verified! Your gains are proven authentic without revealing your balance or identity!'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setZkProofSteps(prev => [...prev, step]);
        if (index === steps.length - 1) {
          setZkProving(false);
          setZkSuccess(true);
          setTraders(prev => prev.map(t => t.id === traderId ? { ...t, isZkVerified: true } : t));
          onNotification('success', `ZK Proof completed! Verified ROI authenticity.`);
          unlockBadge('zk-sovereign');
          if (triggerQuestCompletion) {
            triggerQuestCompletion('zk-proof');
          }
        }
      }, (index + 1) * 750);
    });
  };

  // --- FEATURE STATE 13 & 18: Trade Signal Marketplace ---
  const [strategies, setStrategies] = useState<TradeSignalStrategy[]>([
    {
      id: 'sig-1',
      title: 'Bollinger Band Squeeze v3',
      provider: 'ShadowPool #99',
      description: 'Captures low-volatility compression structures on high-liquidity assets, scaling positions into breakouts.',
      priceNex: 15.00,
      upvotes: 84,
      reputationScore: 92.5,
      reputationLevel: 'Pristine Consistency',
      accuracy: 78.4,
      isSubscribed: false
    },
    {
      id: 'sig-2',
      title: 'ATR-Cushioned Breakout Bot',
      provider: 'SovereignTrader #481',
      description: 'Uses Average True Range metrics to establish trailing dynamic stops, filtering noise during macro expansions.',
      priceNex: 25.00,
      upvotes: 112,
      reputationScore: 97.1,
      reputationLevel: 'Ascending Elite',
      accuracy: 84.1,
      isSubscribed: false
    },
    {
      id: 'sig-3',
      title: 'EMA Cross-over Golden Gate',
      provider: 'AlchemicViper #102',
      description: 'Robust trend-following engine designed for high-duration swing trading on SOL/ETH pairs.',
      priceNex: 10.00,
      upvotes: 41,
      reputationScore: 81.0,
      reputationLevel: 'High Consistency',
      accuracy: 69.8,
      isSubscribed: false
    }
  ]);

  const handleSubscribeSignal = (stratId: string) => {
    const strat = strategies.find(s => s.id === stratId);
    if (!strat) return;

    if (strat.isSubscribed) {
      onNotification('info', `You are already subscribed to ${strat.title}.`);
      return;
    }

    const price = strat.priceNex;
    const nexBalance = balances['NEX'] || 0;

    if (nexBalance < price) {
      onNotification('error', `Insufficient NEX balance. Required: ${price} NEX. Available: ${nexBalance.toFixed(2)} NEX.`);
      return;
    }

    setBalances(prev => ({
      ...prev,
      NEX: prev['NEX'] - price
    }));

    setStrategies(prev => prev.map(s => s.id === stratId ? { ...s, isSubscribed: true } : s));
    onNotification('success', `Subscribed to ${strat.title}! -${price} NEX deducted. Real-time programmatic signals enabled.`);
  };

  const handleUpvoteStrategy = (stratId: string) => {
    setStrategies(prev => prev.map(s => {
      if (s.id === stratId) {
        const nextUpvotes = s.upvotes + 1;
        const nextRepScore = Math.min(100, s.reputationScore + 0.5);
        let level = s.reputationLevel;
        if (nextRepScore >= 95) level = 'Pristine Consistency';
        else if (nextRepScore >= 90) level = 'Ascending Elite';
        else if (nextRepScore >= 80) level = 'High Consistency';

        onNotification('success', `Upvote registered! ${s.title} reputation adjusted to ${nextRepScore.toFixed(1)}%`);
        return {
          ...s,
          upvotes: nextUpvotes,
          reputationScore: nextRepScore,
          reputationLevel: level
        };
      }
      return s;
    }));
  };

  // --- FEATURE STATE 14: Shared Guild Co-Op Portfolios ---
  const [guilds, setGuilds] = useState<SovereignGuild[]>([
    {
      id: 'guild-1',
      name: 'DAO Alpha Syndicate',
      membersCount: 8,
      totalCapital: 24500,
      userShare: 1200,
      consensusDistribution: { SOL: 40, ETH: 30, LINK: 20, USDC: 10 },
      activeProposal: {
        id: 'prop-1',
        title: 'Reallocate USDC Escrow into Staked DOT Pool',
        proposedAction: 'Transfer 10% USDC treasury to high-yield DOT staking pool (estimated APY increase +1.5%)',
        votesYes: 5,
        votesNo: 2,
        userVoted: undefined,
        expiresAt: '7 hours'
      }
    },
    {
      id: 'guild-2',
      name: 'Nexus Arbitrage Co-op',
      membersCount: 4,
      totalCapital: 8200,
      userShare: 0,
      consensusDistribution: { USDC: 80, NEX: 20 },
      activeProposal: undefined
    }
  ]);

  const [guildDepositInput, setGuildDepositInput] = useState<{ [key: string]: string }>({});

  const handleGuildDeposit = (guildId: string) => {
    const amount = parseFloat(guildDepositInput[guildId] || '');
    if (isNaN(amount) || amount <= 0) {
      onNotification('error', 'Enter a valid amount to pool into the guild.');
      return;
    }
    const currentUsdc = balances['USDC'] || 0;
    if (amount > currentUsdc) {
      onNotification('error', `Insufficient USDC available. You have: $${currentUsdc.toFixed(2)}`);
      return;
    }

    setBalances(prev => ({
      ...prev,
      USDC: prev['USDC'] - amount
    }));

    setGuilds(prev => prev.map(g => {
      if (g.id === guildId) {
        return {
          ...g,
          totalCapital: g.totalCapital + amount,
          userShare: g.userShare + amount
        };
      }
      return g;
    }));

    setGuildDepositInput(prev => ({ ...prev, [guildId]: '' }));
    onNotification('success', `Pooled $${amount.toFixed(2)} USDC directly into Sovereign Guild treasury.`);
  };

  const handleVoteProposal = (guildId: string, vote: 'yes' | 'no') => {
    setGuilds(prev => prev.map(g => {
      if (g.id === guildId && g.activeProposal) {
        const prop = g.activeProposal;
        if (prop.userVoted) {
          onNotification('error', 'You have already voted on this active consensus proposal.');
          return g;
        }

        const nextYes = vote === 'yes' ? prop.votesYes + 1 : prop.votesYes;
        const nextNo = vote === 'no' ? prop.votesNo + 1 : prop.votesNo;
        
        // If yes votes win consensus, automatically update split representation slightly
        let nextConsensus = { ...g.consensusDistribution };
        if (vote === 'yes' && nextYes >= 6) {
          nextConsensus = { ...g.consensusDistribution, DOT: 10, USDC: 0 };
          onNotification('success', 'Consensus achieved! Guild split modified dynamically.');
        } else {
          onNotification('success', `Co-op consensus vote registered: ${vote.toUpperCase()}`);
        }

        return {
          ...g,
          consensusDistribution: nextConsensus,
          activeProposal: {
            ...prop,
            votesYes: nextYes,
            votesNo: nextNo,
            userVoted: vote
          }
        };
      }
      return g;
    }));
  };

  // --- FEATURE STATE 15: Strategy Backtester Sandbox ---
  const [backtestAsset, setBacktestAsset] = useState('SOL');
  const [backtestStrategy, setBacktestStrategy] = useState('EMA-Cross');
  const [backtestYears, setBacktestYears] = useState(3);
  const [backtestRisk, setBacktestRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestProgress, setBacktestProgress] = useState(0);
  const [backtestResults, setBacktestResults] = useState<{
    roi: number;
    maxDrawdown: number;
    sharpe: number;
    winRate: number;
    tradesCount: number;
    chartData: { date: string; strategy: number; holder: number }[];
  } | null>(null);

  const runBacktest = () => {
    setIsBacktesting(true);
    setBacktestProgress(0);
    setBacktestResults(null);

    const timer = setInterval(() => {
      setBacktestProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setIsBacktesting(false);

          // Generate simulated backtest stats
          let roiMultiplier = 1;
          let drawMultiplier = 1;
          if (backtestStrategy === 'EMA-Cross') { roiMultiplier = 1.6; drawMultiplier = 0.8; }
          else if (backtestStrategy === 'Mean-Reversion') { roiMultiplier = 1.25; drawMultiplier = 1.1; }
          else if (backtestStrategy === 'Grid-Arbitrage') { roiMultiplier = 2.1; drawMultiplier = 0.5; }
          else { roiMultiplier = 1.45; drawMultiplier = 1.2; }

          if (backtestRisk === 'high') { roiMultiplier *= 1.8; drawMultiplier *= 2.0; }
          else if (backtestRisk === 'low') { roiMultiplier *= 0.6; drawMultiplier *= 0.4; }

          const roi = parseFloat((15.4 * backtestYears * roiMultiplier).toFixed(2));
          const maxDrawdown = parseFloat((18.5 * drawMultiplier).toFixed(2));
          const sharpe = parseFloat((1.42 * (roiMultiplier / drawMultiplier)).toFixed(2));
          const winRate = parseFloat((55 + (Math.random() * 15)).toFixed(1));
          const tradesCount = backtestYears * 24 + Math.floor(Math.random() * 20);

          // Generate timeline chart data
          const chartData = [];
          let currentStrategyVal = 10000;
          let currentHolderVal = 10000;
          const points = 12 * backtestYears;

          for (let i = 0; i <= points; i++) {
            const date = `M-${i}`;
            const holderPct = (Math.sin(i * 0.8) * 4) + (i * 0.8); // Steady hold line
            const stratPct = (Math.sin(i * 1.1) * 3) + (i * 1.6 * roiMultiplier) - (Math.cos(i * 0.5) * 2);

            chartData.push({
              date,
              strategy: Math.round(currentStrategyVal * (1 + stratPct / 100)),
              holder: Math.round(currentHolderVal * (1 + holderPct / 100))
            });
          }

          setBacktestResults({
            roi,
            maxDrawdown,
            sharpe,
            winRate,
            tradesCount,
            chartData
          });
          onNotification('success', `Historical simulation sandbox run verified by validator nodes.`);
          return 100;
        }
        return p + 10;
      });
    }, 150);
  };

  // --- FEATURE STATE 16: Social Sentiment Ingestion Engine ---
  const [sentimentValue, setSentimentValue] = useState(68); // 0-100 gauge
  const [coupleSentiment, setCoupleSentiment] = useState(false);
  const [forumChatter, setForumChatter] = useState([
    { id: 'chat-1', source: 'Reddit /r/solana', text: 'Staking yields hit a new peak, locking positions.', sentiment: 'bullish', time: '1m ago' },
    { id: 'chat-2', source: 'Coindesk Headline', text: 'Consensus parameters upgraded safely on mainnet.', sentiment: 'bullish', time: '5m ago' },
    { id: 'chat-3', source: 'Twitter/X Tech Analyst', text: 'Volatility indices expanding; suggest tightening stops.', sentiment: 'bearish', time: '12m ago' }
  ]);

  // Periodically tick or fluctuate sentiment slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setSentimentValue(prev => {
        const next = Math.max(10, Math.min(95, prev + (Math.floor(Math.random() * 5) - 2)));
        // Couple logic
        if (coupleSentiment && next < 50) {
          onNotification('info', `Sentiment decoupled buffer: Live gauge drops to ${next}. Core stops automatically tightened by 0.5%`);
        }
        return next;
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [coupleSentiment]);

  // --- FEATURE STATE 17: Peer-to-Peer Pawn Shop Lending Desk ---
  const [lendingActiveTab, setLendingActiveTab] = useState<'lend' | 'borrow'>('lend');
  const [loans, setLoans] = useState<P2PLoan[]>([
    { id: 'loan-1', borrower: 'ShadowPool #99', amount: 3000, collateralAsset: 'SOL', collateralAmount: 32, collateralRatio: 155, apy: 8.5, status: 'available', marginCallThreshold: 125, durationDays: 30 },
    { id: 'loan-2', borrower: 'AlchemicViper #102', amount: 1500, collateralAsset: 'ETH', collateralAmount: 0.8, collateralRatio: 172, apy: 9.2, status: 'active', lender: 'You', marginCallThreshold: 130, durationDays: 14 }
  ]);

  const [borrowCollateralSymbol, setBorrowCollateralSymbol] = useState('SOL');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [borrowCollateralAmount, setBorrowCollateralAmount] = useState('');

  const handleFundLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const currentUsdc = balances['USDC'] || 0;
    if (currentUsdc < loan.amount) {
      onNotification('error', `Insufficient USDC balance to fund this escrow. Required: $${loan.amount.toFixed(2)}`);
      return;
    }

    setBalances(prev => ({ ...prev, USDC: prev['USDC'] - loan.amount }));
    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: 'active', lender: 'You' } : l));
    onNotification('success', `Funded loan of $${loan.amount.toFixed(2)} USDC safely via Escrow Contract!`);
  };

  const handleCreateBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(borrowAmount);
    const colAmt = parseFloat(borrowCollateralAmount);

    if (isNaN(amt) || amt <= 0 || isNaN(colAmt) || colAmt <= 0) {
      onNotification('error', 'Please enter valid numbers for borrow and collateral amount.');
      return;
    }

    const colBalance = balances[borrowCollateralSymbol] || 0;
    if (colAmt > colBalance) {
      onNotification('error', `Insufficient collateral balance. Available: ${colBalance.toFixed(4)} ${borrowCollateralSymbol}`);
      return;
    }

    // Propose borrow position
    const mockRate = borrowCollateralSymbol === 'SOL' ? 145.25 : 3240.10;
    const colValueUsd = colAmt * mockRate;
    const computedRatio = Math.round((colValueUsd / amt) * 100);

    if (computedRatio < 130) {
      onNotification('error', `Collateral ratio of ${computedRatio}% is below safety limit. Must be at least 130% to secure positions.`);
      return;
    }

    // Deduct collateral and add loan
    setBalances(prev => ({
      ...prev,
      [borrowCollateralSymbol]: prev[borrowCollateralSymbol] - colAmt,
      USDC: (prev['USDC'] || 0) + amt
    }));

    const newLoan: P2PLoan = {
      id: `loan-${Math.floor(Math.random() * 10000)}`,
      borrower: 'You',
      amount: amt,
      collateralAsset: borrowCollateralSymbol,
      collateralAmount: colAmt,
      collateralRatio: computedRatio,
      apy: 9.5,
      status: 'active',
      lender: 'Platform Pool',
      marginCallThreshold: 120,
      durationDays: 30
    };

    setLoans(prev => [newLoan, ...prev]);
    setBorrowAmount('');
    setBorrowCollateralAmount('');
    onNotification('success', `Created Escrowed Position! Deposited collateral and received $${amt.toFixed(2)} USDC into wallet.`);
  };

  const handleRepayLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan || loan.borrower !== 'You') return;

    const currentUsdc = balances['USDC'] || 0;
    const repaymentCost = loan.amount * (1 + (loan.apy / 100) * (loan.durationDays / 365));

    if (currentUsdc < repaymentCost) {
      onNotification('error', `Insufficient USDC to repay loan. Total needed: $${repaymentCost.toFixed(2)}`);
      return;
    }

    // Return collateral and deduct USDC
    setBalances(prev => ({
      ...prev,
      USDC: prev['USDC'] - repaymentCost,
      [loan.collateralAsset]: (prev[loan.collateralAsset] || 0) + loan.collateralAmount
    }));

    setLoans(prev => prev.filter(l => l.id !== loanId));
    onNotification('success', `Fully repaid position of $${loan.amount.toFixed(2)} USDC + accrued interest. Collateral unlocked safely.`);
  };

  // --- FEATURE STATE 19: Gamified Achievements ---
  const [achievements, setAchievements] = useState([
    { id: 'multisig', title: 'Piggy Bank Bodyguard (Multisig Guard)', desc: 'Secure clearing operations via a multi-signature coin deposit.', unlocked: true, icon: ShieldCheck },
    { id: 'dust-sweep', title: 'Penny-Coin Sweeper (Dust Sweep)', desc: 'Combine several tiny, leftover fractions of coins into native NEX tokens.', unlocked: true, icon: Coins },
    { id: 'high-frequency', title: 'Auto-Bot Commander (Grid Bot)', desc: 'Configure and launch a high-frequency grid harvesting bot.', unlocked: true, icon: Zap },
    { id: 'zk-sovereign', title: 'Math Wizard (ZK Proof Champion)', desc: 'Generate compact cryptographic proof of high trading ROI gains.', unlocked: false, icon: Award }
  ]);

  const [activeTheme, setActiveTheme] = useState<'cyan' | 'green'>('cyan');

  const unlockBadge = (badgeId: string) => {
    setAchievements(prev => prev.map(ach => ach.id === badgeId ? { ...ach, unlocked: true } : ach));
  };

  const isZkUnlocked = useMemo(() => {
    return achievements.find(a => a.id === 'zk-sovereign')?.unlocked || false;
  }, [achievements]);

  // Custom theme toggle
  const toggleTheme = (theme: 'cyan' | 'green') => {
    if (theme === 'green' && !isZkUnlocked) {
      onNotification('error', 'Glowy Cyber-Green is locked! Complete the "Math Wizard" (ZK Prove) badge to unlock.');
      return;
    }
    setActiveTheme(theme);
    setActiveAccentColor(theme === 'green' ? 'emerald' : 'cyan');
    onNotification('success', `Theme switched to: ${theme === 'green' ? 'Glowy Cyber-Green' : 'Cool Hyper Cyan'}`);
  };

  // Fee Discount trigger
  const applyFeeCoupon = () => {
    setFeeDiscount(20);
    onNotification('success', 'Fee-discount ticket activated! -20% exchange delivery fees applied globally.');
  };

  // --- FEATURE STATE 20: Aggregated Platform Heatmaps ---
  const [heatmapMetric, setHeatmapMetric] = useState<'positions' | 'liquidations'>('positions');
  const [macroHeatmapData, setMacroHeatmapData] = useState([
    { symbol: 'SOL', longPct: 68, shortPct: 32, exposureUsd: 14500000, color: '#06b6d4' },
    { symbol: 'ETH', longPct: 54, shortPct: 46, exposureUsd: 42000000, color: '#3b82f6' },
    { symbol: 'LINK', longPct: 74, shortPct: 26, exposureUsd: 6800000, color: '#10b981' },
    { symbol: 'DOT', longPct: 35, shortPct: 65, exposureUsd: 9100000, color: '#f43f5e' }
  ]);

  const [activePoolAnalysis, setActivePoolAnalysis] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Social View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Friendly Copy-Trading & Co-Op Pools
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Leverage our safe copy-trading arena, cryptographic high-score proofs, friendly group co-op accounts, safe P2P pawn-shop lending desks, and strategy time-machine simulators!
          </p>
        </div>
        
        {/* Sub-Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-900 rounded-xl">
          {[
            { id: 'leaderboards', label: 'Leaderboard Arena', icon: Compass },
            { id: 'signals', label: 'Idea Shop & Groups', icon: MessageSquare },
            { id: 'backtest', label: 'Time-Machine Simulator', icon: LineChart },
            { id: 'lending', label: 'Safe P2P Lending', icon: Scale },
            { id: 'macro', label: "Traders' Mood Heatmaps", icon: Flame },
            { id: 'achievements', label: 'Achievements & Themes', icon: Award }
          ].map((subTab) => {
            const Icon = subTab.icon;
            const isActive = activeSubTab === subTab.id;
            return (
              <button
                id={`social-subtab-${subTab.id}`}
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-cyan-400 shadow-md border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {subTab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explorers Cheat-Sheet Hub */}
      <ExplorersHub />

      {/* --- SUB-TAB CONTENTS --- */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: LEADERBOARD ARENA */}
        {activeSubTab === 'leaderboards' && (
          <LeaderboardsPanel 
            key="leaderboards"
            traders={traders}
            balances={balances}
            copyAllocations={copyAllocations}
            allocationInput={allocationInput}
            setAllocationInput={setAllocationInput}
            zkProving={zkProving}
            zkProvenTraderId={zkProvenTraderId}
            zkProofSteps={zkProofSteps}
            handleCopyAllocate={handleCopyAllocate}
            handleCopyWithdraw={handleCopyWithdraw}
            executeZkProof={executeZkProof}
          />
        )}

        {/* TAB 2: IDEA SHOP & GROUPS */}
        {activeSubTab === 'signals' && (
          <SignalsPanel 
            key="signals"
            strategies={strategies}
            balances={balances}
            setBalances={setBalances}
            onNotification={onNotification}
            guilds={guilds}
            guildDepositInput={guildDepositInput}
            setGuildDepositInput={setGuildDepositInput}
            handleSubscribeSignal={handleSubscribeSignal}
            handleUpvoteStrategy={handleUpvoteStrategy}
            handleGuildDeposit={handleGuildDeposit}
            handleVoteProposal={handleVoteProposal}
          />
        )}

        {/* TAB 3: TIME-MACHINE SIMULATOR */}
        {activeSubTab === 'backtest' && (
          <BacktestPanel 
            key="backtest"
            backtestAsset={backtestAsset}
            setBacktestAsset={setBacktestAsset}
            backtestStrategy={backtestStrategy}
            setBacktestStrategy={setBacktestStrategy}
            backtestYears={backtestYears}
            setBacktestYears={setBacktestYears}
            backtestRisk={backtestRisk}
            setBacktestRisk={setBacktestRisk}
            isBacktesting={isBacktesting}
            backtestProgress={backtestProgress}
            backtestResults={backtestResults}
            runBacktest={runBacktest}
            sentimentValue={sentimentValue}
            coupleSentiment={coupleSentiment}
            setCoupleSentiment={setCoupleSentiment}
            forumChatter={forumChatter}
          />
        )}

        {/* TAB 4: SAFE P2P LENDING */}
        {activeSubTab === 'lending' && (
          <LendingPanel 
            key="lending"
            lendingActiveTab={lendingActiveTab}
            setLendingActiveTab={setLendingActiveTab}
            loans={loans}
            borrowAmount={borrowAmount}
            setBorrowAmount={setBorrowAmount}
            borrowCollateralSymbol={borrowCollateralSymbol}
            setBorrowCollateralSymbol={setBorrowCollateralSymbol}
            borrowCollateralAmount={borrowCollateralAmount}
            setBorrowCollateralAmount={setBorrowCollateralAmount}
            handleFundLoan={handleFundLoan}
            handleCreateBorrow={handleCreateBorrow}
            handleRepayLoan={handleRepayLoan}
            balances={balances}
          />
        )}

        {/* TAB 5: TRADERS' MOOD HEATMAPS */}
        {activeSubTab === 'macro' && (
          <MacroPanel 
            key="macro"
            heatmapMetric={heatmapMetric}
            setHeatmapMetric={setHeatmapMetric}
            macroHeatmapData={macroHeatmapData}
            activePoolAnalysis={activePoolAnalysis}
            setActivePoolAnalysis={setActivePoolAnalysis}
            onNotification={onNotification}
          />
        )}

        {/* TAB 6: ACHIEVEMENTS & THEMES */}
        {activeSubTab === 'achievements' && (
          <AchievementsPanel 
            key="achievements"
            achievements={achievements}
            activeTheme={activeTheme}
            toggleTheme={toggleTheme}
            isZkUnlocked={isZkUnlocked}
            feeDiscount={feeDiscount}
            applyFeeCoupon={applyFeeCoupon}
          />
        )}

      </AnimatePresence>
    </div>
  );
}
