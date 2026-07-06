import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Coins, 
  MessageSquare, 
  ArrowUpRight, 
  Lock, 
  Unlock, 
  LineChart, 
  Flame, 
  ThumbsUp, 
  Check, 
  CheckCircle, 
  XCircle, 
  Compass, 
  DollarSign, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Sparkles,
  HelpCircle,
  FileText,
  Bookmark,
  Bell,
  Scale
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Asset, 
  LeaderboardTrader, 
  TradeSignalStrategy, 
  SovereignGuild, 
  P2PLoan 
} from '../types';

interface SocialViewProps {
  assets: Asset[];
  balances: { [key: string]: number };
  setBalances: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
  feeDiscount: number;
  setFeeDiscount: React.Dispatch<React.SetStateAction<number>>;
  activeAccentColor: string;
  setActiveAccentColor: (color: string) => void;
}

export default function SocialView({
  assets,
  balances,
  setBalances,
  onNotification,
  feeDiscount,
  setFeeDiscount,
  activeAccentColor,
  setActiveAccentColor
}: SocialViewProps) {
  // --- SUB-TAB SECTIONS ---
  const [activeSubTab, setActiveSubTab] = useState<'leaderboards' | 'signals' | 'backtest' | 'lending' | 'macro' | 'achievements'>('leaderboards');

  // --- FEATURE STATE 11: Pseudonymous Leaderboards via ZK Verification ---
  const [zkProving, setZkProving] = useState(false);
  const [zkProvenTraderId, setZkProvenTraderId] = useState<string | null>(null);
  const [zkProofSteps, setZkProofSteps] = useState<string[]>([]);
  const [zkSuccess, setZkSuccess] = useState(false);

  const [traders, setTraders] = useState<LeaderboardTrader[]>([
    {
      id: 'trader-1',
      alias: 'SovereignTrader #481',
      verifiedRoi: 248.35,
      level: 'Elite Vault Holder',
      copiersCount: 142,
      riskScore: 3,
      isZkVerified: true,
      portfolioDistribution: { SOL: 40, ETH: 30, LINK: 20, NEX: 10 }
    },
    {
      id: 'trader-2',
      alias: 'AlchemicViper #102',
      verifiedRoi: 189.42,
      level: 'High-Frequency Maven',
      copiersCount: 89,
      riskScore: 5,
      isZkVerified: false,
      portfolioDistribution: { SOL: 50, DOT: 30, DOGE: 20 }
    },
    {
      id: 'trader-3',
      alias: 'ShadowPool #99',
      verifiedRoi: 135.18,
      level: 'Macro Hedger',
      copiersCount: 64,
      riskScore: 2,
      isZkVerified: true,
      portfolioDistribution: { ETH: 60, USDC: 30, LINK: 10 }
    }
  ]);

  // --- FEATURE STATE 12: Fractional Copy-Allocation Pools ---
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
      'Establishing connection to historical Nexus consensus validators...',
      'Deriving ephemeral public verification keys (G1/G2 generator points)...',
      'Generating localized ring-signature parameters to hide wallet hash identity...',
      'Synthesizing polynomial coefficients over BN254 elliptic curve...',
      'Generating non-interactive zero-knowledge proof (Groth16 SNARK structure)...',
      'Broadcasting ZK-proof payload to off-chain zero-knowledge light client...',
      'Consensus verified! ROI proof validated without exposing exact balances.'
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
        }
      }, (index + 1) * 750);
    });
  };

  // --- FEATURE STATE 13 & 18: Trade Signal Marketplace & Reputation ---
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

  // --- FEATURE STATE 14: Sovereign Guild Shared Co-Op Portfolios ---
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

  // --- FEATURE STATE 15: Verified Strategy Backtester Sandbox ---
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
          onNotification('success', `Historical telemetry sandbox run verified by validator nodes.`);
          return 100;
        }
        return p + 10;
      });
    }, 150);
  };

  // --- FEATURE STATE 16: Social Sentiment-Weighted Core Strategy Tester ---
  const [sentimentValue, setSentimentValue] = useState(68); // 0-100 gauge
  const [coupleSentiment, setCoupleSentiment] = useState(false);
  const [forumChatter, setForumChatter] = useState([
    { id: 'chat-1', source: 'Reddit /r/solana', text: 'Staking yields hit new peak, locking positions.', sentiment: 'bullish', time: '1m ago' },
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

  // --- FEATURE STATE 17: Peer-to-Peer Smart Escrow Micro-Lending Desk ---
  const [lendingActiveTab, setLendingActiveTab] = useState<'lend' | 'borrow'>('lend');
  const [loans, setLoans] = useState<P2PLoan[]>([
    { id: 'loan-1', borrower: 'ShadowPool #99', amount: 3000, collateralAsset: 'SOL', collateralAmount: 32, collateralRatio: 155, apy: 8.5, status: 'available', marginCallThreshold: 125, durationDays: 30 },
    { id: 'loan-2', borrower: 'AlchemicViper #102', amount: 1500, collateralAsset: 'ETH', collateralAmount: 0.8, collateralRatio: 172, apy: 9.2, status: 'active', lender: 'You', marginCallThreshold: 130, durationDays: 14 }
  ]);

  const [loanAmountInput, setLoanAmountInput] = useState('');
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
    onNotification('success', `Funded loan of $${loan.amount.toFixed(2)} USDC to ${loan.borrower} safely via Smart Escrow Contract!`);
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

  // --- FEATURE STATE 19: Gamified Achievement Badges & Milestones Portal ---
  const [achievements, setAchievements] = useState([
    { id: 'multisig', title: 'Multisig Pioneer', desc: 'Secure clearing operations via multisig gateway.', unlocked: true, icon: ShieldCheck },
    { id: 'dust-sweep', title: 'Dust Sweeper Elite', desc: 'Consolidate multiple micro-fractional balances into NEX.', unlocked: true, icon: Coins },
    { id: 'high-frequency', title: 'High-Frequency Maestro', desc: 'Configure and start a High-Frequency Grid Bot.', unlocked: true, icon: Zap },
    { id: 'zk-sovereign', title: 'Zero-Knowledge Sovereign', desc: 'Generate compact cryptographic proof of high ROI.', unlocked: false, icon: Award }
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
    setActiveTheme(theme);
    setActiveAccentColor(theme === 'green' ? 'emerald' : 'cyan');
    onNotification('success', `Accent theme set to: ${theme === 'green' ? 'Cybernetic Emerald' : 'Hyper Cyan'}`);
  };

  // Fee Discount trigger
  const applyFeeCoupon = () => {
    setFeeDiscount(20);
    onNotification('success', 'Fee reduction coupon activated! -20% trading commission applied globally.');
  };

  // --- FEATURE STATE 20: Aggregated Platform Positioning Heatmaps ---
  const [heatmapMetric, setHeatmapMetric] = useState<'positions' | 'liquidations'>('positions');
  const [macroHeatmapData, setMacroHeatmapData] = useState([
    { symbol: 'SOL', longPct: 68, shortPct: 32, exposureUsd: 14500000, color: '#06b6d4' },
    { symbol: 'ETH', longPct: 54, shortPct: 46, exposureUsd: 42000000, color: '#3b82f6' },
    { symbol: 'LINK', longPct: 74, shortPct: 26, exposureUsd: 6800000, color: '#10b981' },
    { symbol: 'DOT', longPct: 35, shortPct: 65, exposureUsd: 9100000, color: '#f43f5e' }
  ]);

  const [activePoolAnalysis, setActivePoolAnalysis] = useState(false);
  const [heatmapCoordinates, setHeatmapCoordinates] = useState<{ x: number; y: number; density: number; price: number }[]>([
    { x: 10, y: 15, density: 85, price: 135.5 },
    { x: 30, y: 45, density: 42, price: 141.0 },
    { x: 55, y: 72, density: 91, price: 146.8 },
    { x: 80, y: 35, density: 63, price: 152.2 }
  ]);

  return (
    <div className="space-y-6">
      
      {/* Social View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Sovereign Social & Copy Trading Protocols
          </h2>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Leverage collective consensus guilds, zero-knowledge verification leaderboards, P2P escrow lending, and historical strategy backtesters.
          </p>
        </div>
        
        {/* Sub-Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-900 rounded-xl">
          {[
            { id: 'leaderboards', label: 'Competitive Arena', icon: Compass },
            { id: 'signals', label: 'Signals & Guilds', icon: MessageSquare },
            { id: 'backtest', label: 'Sandbox Lab', icon: LineChart },
            { id: 'lending', label: 'Escrow Lending', icon: Scale },
            { id: 'macro', label: 'Position Heatmaps', icon: Flame },
            { id: 'achievements', label: 'Achievements', icon: Award }
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

      {/* --- SUB-TAB CONTENTS --- */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: COMPETITIVE ARENA */}
        {activeSubTab === 'leaderboards' && (
          <motion.div
            key="leaderboards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Pseudonymous Leaderboard */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    ZK-Proven Return Leaderboard
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">REAL-TIME CONSENSUS VERIFIED</span>
                </div>
                
                <div className="space-y-4">
                  {traders.map((trader, i) => (
                    <div 
                      key={trader.id}
                      className="p-4 bg-slate-900/30 hover:bg-slate-900/50 border border-slate-900 rounded-xl transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
                          <span className="text-xs font-mono font-bold text-slate-400">#{i + 1}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold font-sans text-white">{trader.alias}</span>
                            {trader.isZkVerified ? (
                              <span className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded">
                                <Check className="w-2.5 h-2.5" />
                                ZK PROVEN
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-950/40 border border-slate-900/40 px-1.5 py-0.5 rounded">
                                UNVERIFIED SIGNATURE
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 mt-1">
                            Role: {trader.level} • Copiers: {trader.copiersCount}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-900 pt-3.5 md:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-slate-500">Verified ROI</p>
                          <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">+{trader.verifiedRoi}%</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!trader.isZkVerified && (
                            <button
                              id={`btn-zk-verify-${trader.id}`}
                              onClick={() => executeZkProof(trader.id)}
                              className="px-2.5 py-1.5 bg-cyan-950/30 border border-cyan-900/50 hover:border-cyan-500 text-cyan-400 text-[10px] font-mono rounded-lg transition cursor-pointer flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              ZK-Verify
                            </button>
                          )}
                          <button
                            id={`btn-copy-allocate-${trader.id}`}
                            onClick={() => {
                              const input = document.getElementById(`copy-alloc-input-${trader.id}`);
                              if (input) input.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-[10px] font-mono rounded-lg transition cursor-pointer"
                          >
                            Allocate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zero-Knowledge Ring-Signature Demonstrator */}
              {zkProvenTraderId && (
                <div className="mt-6 p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[10px] space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-cyan-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      ZK-SNARKS RING-SIGNATURE PIPELINE
                    </span>
                    <span className="text-slate-500">STATUS: {zkProving ? 'PROVING' : 'SUCCESS'}</span>
                  </div>
                  <div className="space-y-1 text-slate-400 max-h-40 overflow-y-auto">
                    {zkProofSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span className="text-cyan-500">❯</span>
                        <span>{step}</span>
                      </div>
                    ))}
                    {zkProving && (
                      <div className="flex items-center gap-1 text-cyan-400 animate-pulse mt-1">
                        <span className="animate-spin mr-1">⚡</span>
                        Hashing keys and performing modular exponentiations...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Copy-Allocation Pool Control */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Fractional Copy-Allocation
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Securely copy top-tier, ZK-proven traders. Funds are automatically distributed proportionally across their portfolio structure.
                </p>
              </div>

              <div className="space-y-5">
                {traders.map((trader) => {
                  const currentAlloc = copyAllocations[trader.id] || 0;
                  return (
                    <div key={trader.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold font-sans text-slate-200">{trader.alias}</span>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-500 block">ACTIVE COPY ALLOCATION</span>
                          <span className="text-xs font-bold text-white font-mono">${currentAlloc.toFixed(2)} USDC</span>
                        </div>
                      </div>

                      {/* Proportional asset allocation visualization */}
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Allocation Weights:</span>
                        <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-950 mt-1.5 border border-slate-900">
                          {Object.entries(trader.portfolioDistribution).map(([symbol, pct], idx) => {
                            const colors = ['bg-cyan-500', 'bg-blue-500', 'bg-emerald-500', 'bg-pink-500', 'bg-indigo-500'];
                            return (
                              <div 
                                key={symbol}
                                style={{ width: `${pct}%` }}
                                className={`${colors[idx % colors.length]} h-full relative group`}
                              >
                                <div className="absolute hidden group-hover:block bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-950 border border-slate-800 text-[8px] font-mono px-1 py-0.5 rounded text-white z-20">
                                  {symbol}: {pct}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          {Object.entries(trader.portfolioDistribution).map(([symbol, pct]) => (
                            <span key={symbol} className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              {symbol}: {pct}%
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Investment interface */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="relative flex-1">
                          <input
                            id={`copy-alloc-input-${trader.id}`}
                            type="number"
                            placeholder="0.00"
                            value={allocationInput[trader.id] || ''}
                            onChange={(e) => setAllocationInput(prev => ({ ...prev, [trader.id]: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-900/80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-2.5 top-2 text-[9px] font-mono text-slate-500">USDC</span>
                        </div>
                        <button
                          id={`btn-copy-alloc-execute-${trader.id}`}
                          onClick={() => handleCopyAllocate(trader.id)}
                          className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                        >
                          Lock Copy
                        </button>
                        {currentAlloc > 0 && (
                          <button
                            id={`btn-copy-alloc-liquidate-${trader.id}`}
                            onClick={() => handleCopyWithdraw(trader.id)}
                            className="px-2.5 py-1.5 bg-red-950/20 border border-red-900/40 hover:border-red-500 text-red-400 text-xs font-mono rounded-lg transition cursor-pointer"
                          >
                            Liquidate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SIGNALS & GUILDS */}
        {activeSubTab === 'signals' && (
          <motion.div
            key="signals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Trade Signal Marketplace */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  Tokenized Trade Signal Marketplace
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Subscribe to premium algorithmic trading modules created by master managers. Paid securely in native exchange utility tokens (**NEX**).
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {strategies.map((strat) => (
                  <div key={strat.id} className="p-5 bg-slate-900/30 border border-slate-900 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{strat.title}</span>
                          <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-900">
                            Accuracy: {strat.accuracy}%
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 mt-1">
                          Created by: {strat.provider} • Reputation Level: {strat.reputationLevel}
                        </p>
                      </div>

                      {/* Reputational upvoting tracker */}
                      <div className="flex items-center gap-2.5">
                        <button
                          id={`btn-upvote-${strat.id}`}
                          onClick={() => handleUpvoteStrategy(strat.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-lg text-[10px] font-mono text-slate-300 transition cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{strat.upvotes} Upvotes</span>
                        </button>
                        <div className="px-2 py-1 bg-slate-950 border border-slate-900 rounded-lg text-right">
                          <span className="text-[8px] font-mono text-slate-500 block leading-none">REPUTATION</span>
                          <span className="text-[10px] font-mono font-bold text-cyan-400">{strat.reputationScore.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs font-sans text-slate-300 leading-relaxed bg-slate-950/20 border border-transparent border-l-cyan-500/30 pl-3 py-1">
                      {strat.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">Subscription Cost:</span>
                        <span className="text-xs font-bold font-mono text-cyan-400">{strat.priceNex} NEX</span>
                        <span className="text-[9px] font-mono text-slate-500">/mo</span>
                      </div>

                      <button
                        id={`btn-sub-signal-${strat.id}`}
                        onClick={() => handleSubscribeSignal(strat.id)}
                        disabled={strat.isSubscribed}
                        className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                          strat.isSubscribed
                            ? 'bg-emerald-950/30 border border-emerald-900/60 text-emerald-400 cursor-not-allowed'
                            : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950'
                        }`}
                      >
                        {strat.isSubscribed ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Active Signal Stream
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Subscribe Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Guild Co-Op Portfolios */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Sovereign Consensus Guilds
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Pool capital together with decentralized groups, governed by multi-user voting consensus protocols.
                </p>
              </div>

              <div className="space-y-6">
                {guilds.map((guild) => (
                  <div key={guild.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{guild.name}</span>
                        <span className="text-[9px] font-mono text-slate-400">Members: {guild.membersCount}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 block">YOUR POOLED FUNDS</span>
                        <span className="text-xs font-bold font-mono text-cyan-400">${guild.userShare.toFixed(2)} USDC</span>
                      </div>
                    </div>

                    {/* Proportional asset weights */}
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Treasury Portfolio Splits:</span>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {Object.entries(guild.consensusDistribution).map(([symbol, pct]) => (
                          <span key={symbol} className="text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-900/80 px-1.5 py-0.5 rounded">
                            {symbol}: {pct}%
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Deposit controller */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-900/80">
                      <div className="relative flex-1">
                        <input
                          id={`guild-dep-input-${guild.id}`}
                          type="number"
                          placeholder="Deposit USDC"
                          value={guildDepositInput[guild.id] || ''}
                          onChange={(e) => setGuildDepositInput(prev => ({ ...prev, [guild.id]: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-900/80"
                        />
                      </div>
                      <button
                        id={`btn-guild-dep-${guild.id}`}
                        onClick={() => handleGuildDeposit(guild.id)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-white font-mono rounded-lg transition cursor-pointer"
                      >
                        Pool USDC
                      </button>
                    </div>

                    {/* Consensus allocation proposals */}
                    {guild.activeProposal && (
                      <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
                          <Zap className="w-3.5 h-3.5 animate-pulse" />
                          <span>ACTIVE ALLOCATION VOTE</span>
                        </div>
                        <p className="text-xs font-semibold text-white">{guild.activeProposal.title}</p>
                        <p className="text-[10px] font-sans text-slate-400 leading-relaxed">
                          {guild.activeProposal.proposedAction}
                        </p>

                        <div className="flex items-center justify-between border-t border-slate-900/80 pt-2 text-[9px] font-mono">
                          <span className="text-slate-500">Expires: {guild.activeProposal.expiresAt}</span>
                          <span className="text-slate-300">
                            Yes: {guild.activeProposal.votesYes} • No: {guild.activeProposal.votesNo}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-vote-yes-${guild.id}`}
                            onClick={() => handleVoteProposal(guild.id, 'yes')}
                            disabled={!!guild.activeProposal.userVoted}
                            className={`flex-1 py-1 text-[10px] font-mono rounded transition cursor-pointer ${
                              guild.activeProposal.userVoted === 'yes'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                                : 'bg-slate-900 hover:bg-emerald-950/40 hover:text-emerald-400 text-slate-300 border border-slate-800'
                            }`}
                          >
                            Yes / Approve
                          </button>
                          <button
                            id={`btn-vote-no-${guild.id}`}
                            onClick={() => handleVoteProposal(guild.id, 'no')}
                            disabled={!!guild.activeProposal.userVoted}
                            className={`flex-1 py-1 text-[10px] font-mono rounded transition cursor-pointer ${
                              guild.activeProposal.userVoted === 'no'
                                ? 'bg-red-950 text-red-400 border border-red-900'
                                : 'bg-slate-900 hover:bg-red-950/40 hover:text-red-400 text-slate-300 border border-slate-800'
                            }`}
                          >
                            No / Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: BACKTEST & SENTIMENT */}
        {activeSubTab === 'backtest' && (
          <motion.div
            key="backtest"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Strategy Backtester Sandbox */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-cyan-400" />
                    Verified Strategy Backtester Sandbox
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">5-YEAR HISTORICAL TELEMETRY</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/20 p-4 border border-slate-900 rounded-xl mb-6">
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Select Asset</label>
                    <select
                      id="select-backtest-asset"
                      value={backtestAsset}
                      onChange={(e) => setBacktestAsset(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="SOL">Solana (SOL)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="LINK">Chainlink (LINK)</option>
                      <option value="DOT">Polkadot (DOT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Core Strategy</label>
                    <select
                      id="select-backtest-strategy"
                      value={backtestStrategy}
                      onChange={(e) => setBacktestStrategy(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="EMA-Cross">EMA Cross Gold</option>
                      <option value="Mean-Reversion">Mean Reversion</option>
                      <option value="Grid-Arbitrage">High-Freq Grid</option>
                      <option value="Momentum">Momentum Swing</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Time Horizon</label>
                    <select
                      id="select-backtest-years"
                      value={backtestYears}
                      onChange={(e) => setBacktestYears(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value={1}>1 Year (Recent)</option>
                      <option value={3}>3 Years (Medium)</option>
                      <option value={5}>5 Years (Macro)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Risk Bounds</label>
                    <select
                      id="select-backtest-risk"
                      value={backtestRisk}
                      onChange={(e) => setBacktestRisk(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="low">Conservative</option>
                      <option value="medium">Balanced</option>
                      <option value="high">Aggressive</option>
                    </select>
                  </div>
                </div>

                {isBacktesting ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-3 font-mono text-xs">
                    <span className="animate-spin text-cyan-400 text-xl">⚡</span>
                    <span className="text-slate-400">Syncing node records & testing historical tick streams...</span>
                    <div className="w-48 h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                      <div style={{ width: `${backtestProgress}%` }} className="bg-cyan-500 h-full transition-all duration-150" />
                    </div>
                  </div>
                ) : backtestResults ? (
                  <div className="space-y-6">
                    {/* Performance metrics dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                        <span className="text-[9px] font-mono text-slate-500 block leading-none">TOTAL RETURN</span>
                        <span className="text-sm font-bold font-mono text-emerald-400 block mt-1">+{backtestResults.roi}%</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                        <span className="text-[9px] font-mono text-slate-500 block leading-none">MAX DRAWDOWN</span>
                        <span className="text-sm font-bold font-mono text-red-400 block mt-1">-{backtestResults.maxDrawdown}%</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                        <span className="text-[9px] font-mono text-slate-500 block leading-none">SHARPE RATIO</span>
                        <span className="text-sm font-bold font-mono text-cyan-400 block mt-1">{backtestResults.sharpe}</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                        <span className="text-[9px] font-mono text-slate-500 block leading-none">WIN RATE</span>
                        <span className="text-sm font-bold font-mono text-slate-200 block mt-1">{backtestResults.winRate}%</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl col-span-2 md:col-span-1">
                        <span className="text-[9px] font-mono text-slate-500 block leading-none">TRADES</span>
                        <span className="text-sm font-bold font-mono text-slate-200 block mt-1">{backtestResults.tradesCount} matches</span>
                      </div>
                    </div>

                    {/* Backtest curve Recharts visualization */}
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={backtestResults.chartData}>
                          <defs>
                            <linearGradient id="backtestGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="#334155" fontSize={9} fontStyle="italic" />
                          <YAxis stroke="#334155" fontSize={9} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
                            labelClassName="text-slate-400 font-mono text-[9px]"
                          />
                          <Area type="monotone" dataKey="strategy" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#backtestGrad)" name="Backtested Strategy" />
                          <Area type="monotone" dataKey="holder" stroke="#64748b" strokeWidth={1} fillOpacity={0} name="Asset Hodl Baseline" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Green consensus validation certificate stamp */}
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 block">CRYPTOGRAPHICALLY SIGNED BY VALIDATOR CONSENSUS</span>
                        <span className="text-[9px] font-sans text-slate-400">
                          This historical retro-run has been cross-compiled and signed via compact zk-Ring attestations of verified node streams.
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-900 rounded-xl">
                    <LineChart className="w-8 h-8 mb-2" />
                    <span className="text-xs font-mono">Telemetry database hydrated. Configure strategy options above to initiate retro-analysis.</span>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  id="btn-run-backtest"
                  onClick={runBacktest}
                  disabled={isBacktesting}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-mono font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {isBacktesting ? 'Backtest Simulating...' : 'Run Historical Backtest Sandbox'}
                </button>
              </div>
            </div>

            {/* Social Sentiment Gauge */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <Flame className="w-4 h-4 text-cyan-400" />
                  Social Sentiment Ingestion Engine
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Automated scraping engine monitoring open forum chatter and real-time social news to drive programmatic stop modifications.
                </p>
              </div>

              {/* Sentiment Dial Gauge */}
              <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Composite Index</span>
                <span className="text-3xl font-extrabold font-mono text-cyan-400 mt-2">{sentimentValue} / 100</span>
                
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded mt-2.5 ${
                  sentimentValue >= 70 ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' :
                  sentimentValue >= 50 ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' :
                  'bg-red-950 text-red-400 border border-red-900/40'
                }`}>
                  {sentimentValue >= 70 ? 'STRONG ACCUMULATION BULLISH' :
                   sentimentValue >= 50 ? 'MODERATELY CONSOLIDATING' :
                   'CAPITULATION BEARISH SQUEEZE'}
                </span>

                {/* Simulated Gauge needle */}
                <div className="w-full h-1 bg-slate-950 border border-slate-900 rounded-full mt-6 relative">
                  <div 
                    style={{ left: `${sentimentValue}%` }}
                    className="absolute w-2.5 h-2.5 bg-cyan-400 border border-white rounded-full -top-[3px] shadow-lg transition-all duration-300 transform -translate-x-1/2"
                  />
                </div>
              </div>

              {/* Coupling Control Switch */}
              <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 block">Couple Sentiment to Stop-Loss</span>
                  <button
                    id="toggle-couple-sentiment"
                    onClick={() => setCoupleSentiment(!coupleSentiment)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      coupleSentiment ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                        coupleSentiment ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] font-sans text-slate-400 leading-relaxed">
                  When enabled, extreme drops in the composite social sentiment index (&lt;45) trigger automated stops to tighten instantly, insulating portfolios from high-volatility flash cascades.
                </p>
              </div>

              {/* Live social feed ingestion */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Live Ingested Chat Streams:</span>
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {forumChatter.map((chat) => (
                    <div key={chat.id} className="p-2.5 bg-slate-900/20 border border-slate-900/40 rounded-lg text-[10px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-400">{chat.source}</span>
                        <span className="text-slate-500 font-mono">{chat.time}</span>
                      </div>
                      <p className="font-sans text-slate-300 leading-normal">{chat.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: LENDING DESK */}
        {activeSubTab === 'lending' && (
          <motion.div
            key="lending"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Escrow Pool Management */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  P2P Collateralized Smart Escrow Lending Desk
                </h3>
                
                {/* Lending Subtab Toggle */}
                <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
                  <button
                    id="lending-subtab-lend"
                    onClick={() => setLendingActiveTab('lend')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                      lendingActiveTab === 'lend' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400'
                    }`}
                  >
                    Lend USDC
                  </button>
                  <button
                    id="lending-subtab-borrow"
                    onClick={() => setLendingActiveTab('borrow')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                      lendingActiveTab === 'borrow' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400'
                    }`}
                  >
                    Borrow Assets
                  </button>
                </div>
              </div>

              {lendingActiveTab === 'lend' ? (
                <div className="space-y-4">
                  <p className="text-xs font-sans text-slate-400">
                    Fund collateralized stablecoin lending requests from other platform users. All loans are held inside smart escrows backed by SOL/ETH at a minimum 130% liquidation threshold.
                  </p>

                  <div className="space-y-3 pt-1">
                    {loans.map((loan) => (
                      <div key={loan.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-sans text-white">${loan.amount.toLocaleString()} USDC</span>
                            <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/30">
                              APY: {loan.apy}%
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400">
                            Borrower: {loan.borrower} • Collateral: {loan.collateralAmount} {loan.collateralAsset} ({loan.collateralRatio}% CR)
                          </p>
                          <p className="text-[9px] font-mono text-slate-500">
                            Duration: {loan.durationDays} Days • Margin Call Threshold: &lt;{loan.marginCallThreshold}%
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {loan.status === 'available' ? (
                            <button
                              id={`btn-fund-loan-${loan.id}`}
                              onClick={() => handleFundLoan(loan.id)}
                              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                            >
                              Fund Safe Loan
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500 px-3 py-1.5 rounded bg-slate-950 border border-slate-900">
                              ACTIVE Escrow (Lended by: {loan.lender})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateBorrow} className="space-y-4">
                  <p className="text-xs font-sans text-slate-400">
                    Acquire instant USDC liquidity by locking your SOL or ETH into secure decentralized escrows. Safety guidelines require a minimum 130% collateral backing ratio.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5">Borrow Asset</label>
                      <div className="relative">
                        <input
                          id="borrow-amount-input"
                          type="number"
                          placeholder="USDC Amount"
                          value={borrowAmount}
                          onChange={(e) => setBorrowAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none"
                          required
                        />
                        <span className="absolute right-2.5 top-2 text-[9px] font-mono text-slate-500">USDC</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5">Lock Collateral</label>
                      <select
                        id="select-borrow-collateral"
                        value={borrowCollateralSymbol}
                        onChange={(e) => setBorrowCollateralSymbol(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none"
                      >
                        <option value="SOL">Solana (SOL)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5">Collateral Deposit</label>
                      <div className="relative">
                        <input
                          id="borrow-collateral-input"
                          type="number"
                          placeholder="0.00"
                          value={borrowCollateralAmount}
                          onChange={(e) => setBorrowCollateralAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none"
                          required
                        />
                        <span className="absolute right-2.5 top-2 text-[9px] font-mono text-slate-500">{borrowCollateralSymbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      id="btn-create-escrow-borrow"
                      type="submit"
                      className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-mono font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Establish Collateralized Escrow Borrow
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Repay Control Panel */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Your Active Debt Obligations
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Manage and repay your outstanding loans to unlock locked wallet collateral assets.
                </p>
              </div>

              <div className="space-y-4">
                {loans.filter(l => l.borrower === 'You').length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center text-slate-600 border border-dashed border-slate-900 rounded-xl">
                    <CheckCircle className="w-6 h-6 mb-1.5 text-slate-700" />
                    <span className="text-[10px] font-mono uppercase">No active debt obligations</span>
                  </div>
                ) : (
                  loans.filter(l => l.borrower === 'You').map((loan) => {
                    const nextValPrice = loan.collateralAsset === 'SOL' ? 145.25 : 3240.10;
                    const computedRatio = Math.round(((loan.collateralAmount * nextValPrice) / loan.amount) * 100);
                    const isRisk = computedRatio < loan.marginCallThreshold;

                    return (
                      <div key={loan.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Escrow Id: {loan.id}</span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                            isRisk ? 'bg-red-950 text-red-400 border border-red-900 animate-pulse' : 'bg-cyan-950 text-cyan-400 border border-cyan-900'
                          }`}>
                            LTV Ratio: {computedRatio}%
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-sans text-slate-400">
                            <span>Borrowed Principal:</span>
                            <span className="font-mono text-white">${loan.amount.toFixed(2)} USDC</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-sans text-slate-400">
                            <span>Collateral Locked:</span>
                            <span className="font-mono text-white">{loan.collateralAmount} {loan.collateralAsset}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-sans text-slate-400">
                            <span>Total Repayment Due:</span>
                            <span className="font-mono text-white">${(loan.amount * 1.01).toFixed(2)} USDC</span>
                          </div>
                        </div>

                        {isRisk && (
                          <div className="p-2 bg-red-950/20 border border-red-900/40 rounded-lg text-[9px] font-mono text-red-400 flex items-start gap-1.5">
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>CRITICAL RISK: Position below {loan.marginCallThreshold}% safety index. Repay debt or inject collateral to secure buffer!</span>
                          </div>
                        )}

                        <button
                          id={`btn-repay-loan-${loan.id}`}
                          onClick={() => handleRepayLoan(loan.id)}
                          className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-white font-mono rounded-lg transition cursor-pointer"
                        >
                          Repay & Unlock Collateral
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: MACRO ANALYTICS */}
        {activeSubTab === 'macro' && (
          <motion.div
            key="macro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Macro positioning chart */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <Flame className="w-4 h-4 text-cyan-400" />
                    Macro Platform Positioning Heatmaps
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1">
                    Anonymized aggregated long versus short distribution explicit exposure indexes across all active Nexus traders.
                  </p>
                </div>

                <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
                  <button
                    id="heatmap-btn-positions"
                    onClick={() => setHeatmapMetric('positions')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                      heatmapMetric === 'positions' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400'
                    }`}
                  >
                    Exposures
                  </button>
                  <button
                    id="heatmap-btn-liquidations"
                    onClick={() => setHeatmapMetric('liquidations')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                      heatmapMetric === 'liquidations' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400'
                    }`}
                  >
                    Liquidation Clusters
                  </button>
                </div>
              </div>

              {heatmapMetric === 'positions' ? (
                <div className="space-y-6">
                  {/* Aggregated distribution bars */}
                  <div className="space-y-5">
                    {macroHeatmapData.map((data) => (
                      <div key={data.symbol} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white">{data.symbol} Platform Interest</span>
                          <span className="text-slate-400">Exposure: ${(data.exposureUsd / 1000000).toFixed(1)}M USDC</span>
                        </div>

                        {/* Dual bar representing long/short exposure % */}
                        <div className="flex h-5 w-full rounded-lg overflow-hidden border border-slate-900 font-mono text-[9px] font-bold">
                          <div 
                            style={{ width: `${data.longPct}%` }}
                            className="bg-cyan-500 text-slate-950 flex items-center justify-start pl-3 shadow-inner"
                          >
                            LONG {data.longPct}%
                          </div>
                          <div 
                            style={{ width: `${data.shortPct}%` }}
                            className="bg-rose-500 text-slate-950 flex items-center justify-end pr-3 shadow-inner"
                          >
                            {data.shortPct}% SHORT
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Horizontal Bar Chart representation */}
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={macroHeatmapData} layout="vertical">
                        <XAxis type="number" stroke="#334155" fontSize={9} />
                        <YAxis dataKey="symbol" type="category" stroke="#334155" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} />
                        <Bar dataKey="exposureUsd" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Total Aggregated Exposure" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <p className="text-xs font-sans text-slate-400">
                    Aggregate visual density mappings of open stop triggers and leverage concentration clusters across standard asset price thresholds.
                  </p>

                  {/* Visual coordinate-density heatmap blocks */}
                  <div className="p-6 bg-slate-950/80 border border-slate-900 rounded-xl relative overflow-hidden h-64 flex items-center justify-center">
                    <div className="absolute inset-0 bg-slate-950 grid grid-cols-10 grid-rows-10 gap-0.5 opacity-30">
                      {Array.from({ length: 100 }).map((_, i) => {
                        const density = (Math.sin(i * 0.15) * 50) + 50;
                        const colorClass = 
                          density > 80 ? 'bg-rose-500/30' :
                          density > 60 ? 'bg-amber-500/20' :
                          density > 40 ? 'bg-cyan-500/10' : 'bg-transparent';
                        return <div key={i} className={`h-full w-full ${colorClass}`} />;
                      })}
                    </div>

                    <div className="z-10 text-center space-y-3 max-w-sm">
                      <Flame className="w-8 h-8 text-rose-500 mx-auto animate-bounce" />
                      <span className="text-xs font-mono font-bold text-white block">LIQUIDATION POOL SQUEEZE DETECTED</span>
                      <p className="text-[10px] font-sans text-slate-400 leading-normal">
                        Aggregated cluster concentration is highly concentrated near SOL $138.50 and ETH $3180. These metrics updates continuously based on off-chain validator telemetry.
                      </p>
                      <button
                        id="btn-trigger-pool-analysis"
                        onClick={() => {
                          setActivePoolAnalysis(true);
                          onNotification('info', 'Analyzing pool depth: High density short clusters located.');
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 font-mono rounded-lg transition"
                      >
                        Deep Scan Clustered Densities
                      </button>
                    </div>
                  </div>

                  {activePoolAnalysis && (
                    <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl font-mono text-[9px] text-slate-400 space-y-1">
                      <div className="text-cyan-400 font-bold mb-1">AGGREGATED CLUSTERING TELEMETRY MATRIX</div>
                      <div>❯ Segment SOL-Spot: Cluster found at price $135.5 (Density 85% LONG)</div>
                      <div>❯ Segment SOL-Spot: Cluster found at price $146.8 (Density 91% SHORT)</div>
                      <div>❯ Segment ETH-Spot: Cluster found at price $3180.0 (Density 74% LONG)</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick platform facts panel */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Sovereignty Guidelines
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Privacy is non-negotiable. All positioning metrics represent unified composite metrics to isolate personal identities and capital balances.
                </p>
              </div>

              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3 text-xs font-sans">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Aggregated metrics are delayed by exactly 3 minutes to avoid frontrunning actions.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Compiles off-chain state signatures securely across multiple distributed exchange nodes.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlocks deep heatmap features upon acquiring the ZK-Sovereign certification.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 6: ACHIEVEMENT REWARDS */}
        {activeSubTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Achievement Milestones Grid */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  Gamified Achievement Badges & Milestones Portal
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Complete advanced trading operations to unlock visual system rewards, fee reduction incentives, and customizable UI accents.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((ach) => {
                  const Icon = ach.icon;
                  return (
                    <div 
                      key={ach.id}
                      className={`p-4 border rounded-xl transition flex gap-3.5 items-start ${
                        ach.unlocked 
                          ? 'bg-slate-900/40 border-slate-800' 
                          : 'bg-slate-950/20 border-slate-900/40 opacity-50'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border shrink-0 ${
                        ach.unlocked 
                          ? 'bg-slate-950 border-cyan-500/30 text-cyan-400' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{ach.title}</span>
                          {ach.unlocked ? (
                            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-1 py-0.5 rounded leading-none">UNLOCKED</span>
                          ) : (
                            <span className="text-[8px] font-mono text-slate-500 bg-slate-950/40 border border-slate-900/40 px-1 py-0.5 rounded leading-none">LOCKED</span>
                          )}
                        </div>
                        <p className="text-[10px] font-sans text-slate-400 leading-relaxed">{ach.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual theme customizer & reward lockers */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Your Unlocked Rewards Vault
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Redeem and customize unlocked terminal attributes secured during milestone progressions.
                </p>
              </div>

              <div className="space-y-4">
                {/* Accent customization */}
                <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">UNLOCKED PORTFOLIO UI THEMES</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="theme-btn-cyan"
                      onClick={() => toggleTheme('cyan')}
                      className={`py-2 px-3 rounded-lg border text-xs font-mono transition cursor-pointer text-center ${
                        activeTheme === 'cyan' 
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400' 
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Hyper Cyan (Default)
                    </button>
                    <button
                      id="theme-btn-green"
                      onClick={() => {
                        if (!isZkUnlocked) {
                          onNotification('error', 'Cyber-Green mode is locked! Complete ZK Leaderboard verification to unlock.');
                        } else {
                          toggleTheme('green');
                        }
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-mono transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                        activeTheme === 'green' 
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' 
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {!isZkUnlocked && <Lock className="w-3 h-3 text-slate-600" />}
                      Cyber-Green Accent
                    </button>
                  </div>
                </div>

                {/* Global Fee Discount coupon unlocker */}
                <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">FEE-REDUCTION SYSTEM</span>
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">20% Global Fee Discount Coupon</span>
                      <span className="text-[9px] font-sans text-slate-400">Available to redeem instantly upon high-frequency deployments.</span>
                    </div>

                    <button
                      id="btn-apply-fee-discount"
                      onClick={applyFeeCoupon}
                      disabled={feeDiscount > 0}
                      className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${
                        feeDiscount > 0
                          ? 'bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950'
                      }`}
                    >
                      {feeDiscount > 0 ? 'Activated' : 'Redeem'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
