import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Coins, 
  ArrowUpRight, 
  Lock, 
  Unlock, 
  Info,
  Award,
  Zap,
  Sparkles,
  Calendar,
  Flame,
  ShieldAlert,
  Hourglass,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Plus,
  Percent,
  Layers,
  Compass,
  HelpCircle,
  Activity,
  ArrowRightLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { Asset } from '../types';

interface EarnViewProps {
  assets: Asset[];
  balances: { [key: string]: number };
  setBalances: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  stakedBalances: { [key: string]: number };
  setStakedBalances: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  onStake: (symbol: string, amount: number) => void;
  onUnstake: (symbol: string, amount: number) => void;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
  feeDiscount: number;
  setFeeDiscount: React.Dispatch<React.SetStateAction<number>>;
}

const BASE_APY_RATES: { [key: string]: number } = {
  SOL: 6.85,
  ETH: 4.25,
  LINK: 5.50,
  DOT: 11.40,
};

// 26. Artifact Definition
interface Artifact {
  id: string;
  name: string;
  boost: number;
  description: string;
  targetAsset: string; // 'GLOBAL' or specific symbol
  equipped: boolean;
  tier: 'Epic' | 'Relic' | 'Cosmic';
}

// 28. Academy Course Quiz
interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  rewardNex: number;
  durationMin: number;
  questions: QuizQuestion[];
  completed: boolean;
}

export default function EarnView({ 
  assets, 
  balances, 
  setBalances,
  stakedBalances, 
  setStakedBalances,
  onStake, 
  onUnstake,
  onNotification,
  feeDiscount,
  setFeeDiscount
}: EarnViewProps) {
  // --- SUB-TABS STATE ---
  const [activeTab, setActiveTab] = useState<'flexible' | 'optimizers' | 'lockers' | 'structured' | 'academy'>('flexible');

  // Staking selection state
  const [selectedSymbol, setSelectedSymbol] = useState('SOL');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakeAction, setStakeAction] = useState<'stake' | 'unstake'>('stake');
  const [stakingError, setStakingError] = useState('');

  // --- 21. AUTO-COMPOUNDING STATE ---
  const [autoCompoundEnabled, setAutoCompoundEnabled] = useState<{ [key: string]: boolean }>({
    SOL: false,
    ETH: false,
    LINK: false,
    DOT: false
  });
  const [compoundLogs, setCompoundLogs] = useState<string[]>([
    'System initialized. Dual-consensus harvesting node active.',
    'Ready to lock compounding allocations.'
  ]);

  // --- 22. LIQUID STAKING STATE (stAssets) ---
  const [mintAmount, setMintAmount] = useState('');
  const [mintAsset, setMintAsset] = useState('SOL'); // SOL or ETH
  const [stBalances, setStBalances] = useState<{ [key: string]: number }>({
    stSOL: 0,
    stETH: 0
  });

  // --- 24. DUAL INVESTMENT STATE ---
  const [dualSelectedProduct, setDualSelectedProduct] = useState<'SOL-LOW' | 'ETH-HIGH'>('SOL-LOW');
  const [dualSubAmount, setDualSubAmount] = useState('');
  const [dualActiveSub, setDualActiveSub] = useState<{
    asset: string;
    type: 'low' | 'high';
    strikePrice: number;
    amount: number;
    apy: number;
    underlying: string;
  } | null>(null);
  const [dualSimulationOutcome, setDualSimulationOutcome] = useState<string | null>(null);

  // --- 25. MICRO-DCA ROUNDUPS ---
  const [dcaEnabled, setDcaEnabled] = useState(false);
  const [dcaMultiplier, setDcaMultiplier] = useState(1); // 1x, 2x, 5x
  const [dcaTargetAsset, setDcaTargetAsset] = useState('SOL');
  const [accumulatedDcaUsdc, setAccumulatedDcaUsdc] = useState(12.45);
  const [simTransactions, setSimTransactions] = useState([
    { id: 'tx-dca-1', merchant: 'Cyber Cafe Express', cost: 4.20, roundup: 0.80 },
    { id: 'tx-dca-2', merchant: 'Synth Grid Subscriptions', cost: 14.50, roundup: 0.50 },
    { id: 'tx-dca-3', merchant: 'Quantum Gas Depot', cost: 32.15, roundup: 0.85 }
  ]);

  // --- 26. YIELD BOOSTING ARTIFACT LOCKERS ---
  const [artifacts, setArtifacts] = useState<Artifact[]>([
    { id: 'art-1', name: 'Sovereign Chronograph', boost: 1.25, description: 'Accelerates global validator clockspeed by +1.25% APY.', targetAsset: 'GLOBAL', equipped: false, tier: 'Epic' },
    { id: 'art-2', name: 'Prism Flare Core', boost: 2.10, description: 'Enhances Solana pipeline transactions by +2.10% SOL APY.', targetAsset: 'SOL', equipped: false, tier: 'Relic' },
    { id: 'art-3', name: 'Quantum Ledger Seal', boost: 2.85, description: 'Locks down DOT staking telemetry by +2.85% DOT APY.', targetAsset: 'DOT', equipped: false, tier: 'Cosmic' }
  ]);

  // --- 27. CROSS-ASSET YIELD ROUTER ---
  const [routingInProcess, setRoutingInProcess] = useState(false);
  const [routeSteps, setRouteSteps] = useState<string[]>([]);
  const [routerSelectedPool, setRouterSelectedPool] = useState('Lido'); // 'Lido' | 'Aave' | 'RocketPool'

  // --- 28. ACADEMY GRANTS PORTAL ---
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 'course-1',
      title: 'Layer-1 Consensus Paradigms',
      description: 'Analyze Proof-of-Stake validator nodes, consensus finality epochs, and slashing game theory.',
      rewardNex: 15,
      durationMin: 5,
      completed: false,
      questions: [
        {
          question: 'What is the primary role of a validator signature in Proof-of-Stake?',
          options: ['To prove computer hardware capacity', 'To sign blocks and attest to valid ledger history', 'To solve SHA-256 cryptographic hashes'],
          correctIdx: 1
        },
        {
          question: 'What happens to a staked validator that signs two blocks in the same slot?',
          options: ['They get rewarded extra block fees', 'They receive a "Slashing" penalty and lose staked capital', 'The validator is automatically converted to proof-of-work'],
          correctIdx: 1
        },
        {
          question: 'How is network finality typically defined?',
          options: ['The total size of the downloaded blockchain', 'A guarantee that a transaction block cannot be altered or reverted', 'The speed at which transactions are typed'],
          correctIdx: 1
        }
      ]
    },
    {
      id: 'course-2',
      title: 'Zero-Knowledge Privacy Architectures',
      description: 'Deconstruct polynomial commitments over elliptic curves and non-interactive proof systems.',
      rewardNex: 25,
      durationMin: 8,
      completed: false,
      questions: [
        {
          question: 'What does the "Non-Interactive" part of zk-SNARK stand for?',
          options: ['The prover and verifier require zero real-time back-and-forth communication', 'The user cannot play computer games during proving', 'Validators do not use internet cables'],
          correctIdx: 0
        },
        {
          question: 'In Zero-Knowledge, what is the "prover" attempting to accomplish?',
          options: ['Show proof of large mining servers', 'Prove a statement is true without revealing any actual data content', 'Steal funds from smart contracts'],
          correctIdx: 1
        },
        {
          question: 'Why are elliptic curves useful in ZK systems?',
          options: ['They are easy to draw with HTML5 tools', 'They provide mathematical structures for homomorphic hidden evaluation', 'They have high transaction block capacities'],
          correctIdx: 1
        }
      ]
    }
  ]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // --- 29. TAX-LOSS HARVESTING DIAGNOSTIC ---
  const [underwaterPositions, setUnderwaterPositions] = useState([
    { id: 'pos-1', asset: 'DOT', buyPrice: 13.80, currentPrice: 9.12, amount: 80, lossUsd: -374.40 },
    { id: 'pos-2', asset: 'LINK', buyPrice: 18.50, currentPrice: 14.20, amount: 45, lossUsd: -193.50 }
  ]);
  const [taxHarvestLogs, setTaxHarvestLogs] = useState<string[]>([]);
  const [taxHarvestComplete, setTaxHarvestComplete] = useState(false);

  // --- 30. DECAY-PROTECTED TIME-LOCK SAFES ---
  const [safes, setSafes] = useState<{
    id: string;
    asset: string;
    amount: number;
    unlockDate: string;
    timeRemaining: string;
    status: 'locked' | 'unlocked';
  }[]>([
    { id: 'safe-1', asset: 'NEX', amount: 500, unlockDate: '2026-12-31', timeRemaining: '178 Days', status: 'locked' }
  ]);
  const [safeAsset, setSafeAsset] = useState('SOL');
  const [safeAmount, setSafeAmount] = useState('');
  const [safeMonths, setSafeMonths] = useState(3);

  // --- REWARD ACCRUAL LEDGER ---
  const [accruedRewards, setAccruedRewards] = useState<{ [key: string]: number }>({
    SOL: 0.002841,
    ETH: 0.000724,
    LINK: 0.014291,
    DOT: 0.185293,
  });

  // Calculate dynamic APY rates incorporating Artifact Boosts & Auto-compounding
  const computedAPYRates = useMemo(() => {
    const rates = { ...BASE_APY_RATES };
    
    // 1. Artifact global or asset-specific boosts
    artifacts.forEach(art => {
      if (art.equipped) {
        if (art.targetAsset === 'GLOBAL') {
          Object.keys(rates).forEach(sym => {
            rates[sym] += art.boost;
          });
        } else if (rates[art.targetAsset] !== undefined) {
          rates[art.targetAsset] += art.boost;
        }
      }
    });

    // 2. Auto-compounding boost
    Object.keys(rates).forEach(sym => {
      if (autoCompoundEnabled[sym]) {
        rates[sym] += 1.50; // +1.50% APY boost for auto-compounding optimization
      }
    });

    return rates;
  }, [artifacts, autoCompoundEnabled]);

  const selectedAPY = computedAPYRates[selectedSymbol] || 0;

  // Real-time ticking rewards logic
  useEffect(() => {
    const interval = setInterval(() => {
      setAccruedRewards((prev) => {
        const next = { ...prev };
        Object.keys(computedAPYRates).forEach((symbol) => {
          const staked = stakedBalances[symbol] || 0;
          if (staked > 0) {
            // APY per second = APY / 100 / (365 * 24 * 3600)
            const rewardPerSecond = staked * (computedAPYRates[symbol] / 100) / (365 * 24 * 3600);
            const rewardIn100ms = rewardPerSecond * 0.1;
            next[symbol] = (next[symbol] || 0) + rewardIn100ms;
          }
        });
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stakedBalances, computedAPYRates]);

  // Dynamic logs tick for Auto-compounding
  useEffect(() => {
    if (activeTab !== 'optimizers') return;
    const interval = setInterval(() => {
      const symbolsWithCompounding = Object.keys(autoCompoundEnabled).filter(sym => autoCompoundEnabled[sym]);
      if (symbolsWithCompounding.length > 0) {
        const randomSym = symbolsWithCompounding[Math.floor(Math.random() * symbolsWithCompounding.length)];
        const harvestAmt = (Math.random() * 0.0025 + 0.0001).toFixed(6);
        setCompoundLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Dynamic peak hit. Harvesting ${randomSym} rewards and compounding back to main pool (+${harvestAmt} ${randomSym} added).`,
          ...prev.slice(0, 6)
        ]);
        // Update reward balance slightly to simulate compounding deposit
        setStakedBalances(prev => ({
          ...prev,
          [randomSym]: prev[randomSym] + parseFloat(harvestAmt)
        }));
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [autoCompoundEnabled, activeTab]);

  // --- ACTIONS ---

  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStakingError('');

    if (stakeAction === 'stake') {
      const amt = parseFloat(stakeAmount);
      if (isNaN(amt) || amt <= 0) {
        setStakingError('Please enter a valid amount');
        return;
      }

      const available = balances[selectedSymbol] || 0;
      if (amt > available) {
        setStakingError(`Insufficient available balance. You have ${available.toFixed(4)} ${selectedSymbol}`);
        return;
      }

      onStake(selectedSymbol, amt);
      setStakeAmount('');
      onNotification('success', `Deposited ${amt.toFixed(4)} ${selectedSymbol} into decentralized staking pool.`);
    } else {
      const amt = parseFloat(unstakeAmount);
      if (isNaN(amt) || amt <= 0) {
        setStakingError('Please enter a valid amount');
        return;
      }

      const staked = stakedBalances[selectedSymbol] || 0;
      if (amt > staked) {
        setStakingError(`Insufficient staked balance. You only have ${staked.toFixed(4)} ${selectedSymbol} staked`);
        return;
      }

      onUnstake(selectedSymbol, amt);
      setUnstakeAmount('');
      onNotification('info', `Withdrew ${amt.toFixed(4)} ${selectedSymbol} from pool back to spot wallet.`);
    }
  };

  const handleMaxClick = () => {
    if (stakeAction === 'stake') {
      const val = balances[selectedSymbol] || 0;
      setStakeAmount(val.toString());
    } else {
      const val = stakedBalances[selectedSymbol] || 0;
      setUnstakeAmount(val.toString());
    }
  };

  // --- 21. Toggle Compound State ---
  const toggleAutoCompound = (sym: string) => {
    setAutoCompoundEnabled(prev => {
      const isActivating = !prev[sym];
      if (isActivating) {
        onNotification('success', `Smart Auto-Compounding activated on ${sym} Vault. Reinvesting peak-yield cycles dynamically.`);
        setCompoundLogs(l => [`[${new Date().toLocaleTimeString()}] Automated Smart-Harvesting online for ${sym} (Epoch boost applied +1.50% APY).`, ...l]);
      } else {
        onNotification('info', `Deactivated auto-compounding on ${sym}. Harvest returns now accumulate in standard ledger.`);
      }
      return { ...prev, [sym]: isActivating };
    });
  };

  // --- 22. Liquid Staking Tokenization Derivatives (stSOL, stETH) ---
  const handleMintstAsset = () => {
    const amt = parseFloat(mintAmount);
    if (isNaN(amt) || amt <= 0) {
      onNotification('error', 'Enter a valid amount to mint stAsset.');
      return;
    }

    const staked = stakedBalances[mintAsset] || 0;
    if (amt > staked) {
      onNotification('error', `Insufficient staked ${mintAsset}. You need active staking to mint synthetic representations.`);
      return;
    }

    // Deduct from staked, mint stAsset
    setStakedBalances(prev => ({ ...prev, [mintAsset]: prev[mintAsset] - amt }));
    const syntheticName = `st${mintAsset}`;
    setStBalances(prev => ({ ...prev, [syntheticName]: (prev[syntheticName] || 0) + amt }));
    // Also add to spot balances so they can trade it!
    setBalances(prev => ({ ...prev, [syntheticName]: (prev[syntheticName] || 0) + amt }));

    setMintAmount('');
    onNotification('success', `Successfully minted ${amt.toFixed(4)} ${syntheticName} derivative! Base staking rewards continue compounding.`);
  };

  const handleBurnstAsset = (stAsset: string) => {
    const amt = stBalances[stAsset] || 0;
    if (amt <= 0) {
      onNotification('error', `No active ${stAsset} derivative to redeem.`);
      return;
    }

    const baseAsset = stAsset.replace('st', '');
    setStBalances(prev => ({ ...prev, [stAsset]: 0 }));
    setBalances(prev => ({ ...prev, [stAsset]: 0 }));
    setStakedBalances(prev => ({ ...prev, [baseAsset]: (prev[baseAsset] || 0) + amt }));
    
    onNotification('info', `Redeemed ${amt.toFixed(4)} ${stAsset}! Restored back into sovereign core staking pool.`);
  };

  // --- 23. Vault Lock Tiers with Fee Rebates ---
  const handleLockVault = (tierId: string, durationDays: number, rebatePercent: number) => {
    const amountToLock = tierId === 'bronze' ? 100 : tierId === 'silver' ? 500 : 2000;
    const nexBalance = balances['NEX'] || 0;

    if (nexBalance < amountToLock) {
      onNotification('error', `Insufficient NEX balance to subscribe. Requires ${amountToLock} NEX. Your balance: ${nexBalance.toFixed(2)} NEX.`);
      return;
    }

    // Deduct NEX
    setBalances(prev => ({ ...prev, NEX: prev['NEX'] - amountToLock }));
    // Update permanent fee discount state
    setFeeDiscount(rebatePercent);

    // Add safe/lock
    const newSafe = {
      id: `lock-${Math.random().toString(36).substr(2, 5)}`,
      asset: 'NEX',
      amount: amountToLock,
      unlockDate: new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString().split('T')[0],
      timeRemaining: `${durationDays} Days`,
      status: 'locked' as const
    };
    setSafes(prev => [...prev, newSafe]);

    onNotification('success', `Unlocked ${rebatePercent}% global fee reduction rebate! Staked ${amountToLock} NEX inside dynamic locking vault.`);
  };

  // --- 24. Volatility-Hedging Dual Investment Vehicles ---
  const handleSubscribeDual = () => {
    const amt = parseFloat(dualSubAmount);
    if (isNaN(amt) || amt <= 0) {
      onNotification('error', 'Please enter a valid subscription capital amount.');
      return;
    }

    const fundingAsset = dualSelectedProduct === 'SOL-LOW' ? 'USDC' : 'ETH';
    const fundingBalance = balances[fundingAsset] || 0;

    if (amt > fundingBalance) {
      onNotification('error', `Insufficient ${fundingAsset} balance to lock dual investment.`);
      return;
    }

    // Deduct
    setBalances(prev => ({ ...prev, [fundingAsset]: prev[fundingAsset] - amt }));

    // Create active subscription
    if (dualSelectedProduct === 'SOL-LOW') {
      setDualActiveSub({
        asset: 'SOL',
        type: 'low',
        strikePrice: 135.00,
        amount: amt,
        apy: 68.2,
        underlying: 'USDC'
      });
    } else {
      setDualActiveSub({
        asset: 'ETH',
        type: 'high',
        strikePrice: 3450.00,
        amount: amt,
        apy: 84.5,
        underlying: 'ETH'
      });
    }

    setDualSubAmount('');
    setDualSimulationOutcome(null);
    onNotification('success', `Dual investment contract locked. Settling at expiration based on strike boundaries.`);
  };

  const handleSimulateDualExpiry = (forceOutcome: 'STRIKE_HIT' | 'STRIKE_MISSED') => {
    if (!dualActiveSub) return;

    const principal = dualActiveSub.amount;
    const interest = principal * (dualActiveSub.apy / 100) * (3 / 365); // 3-day short-duration APY
    const totalPayoutUsdc = principal + interest;

    if (dualActiveSub.type === 'low') {
      // SOL Buy Low - if strike hit, payouts converted to SOL. Else USDC.
      if (forceOutcome === 'STRIKE_HIT') {
        const solQty = totalPayoutUsdc / dualActiveSub.strikePrice;
        setBalances(prev => ({ ...prev, SOL: (prev['SOL'] || 0) + solQty }));
        setDualSimulationOutcome(`SOL Price at expiry settled BELOW strike ($132.40). Purchase triggered. Received ${solQty.toFixed(4)} SOL (USDC principal + ${dualActiveSub.apy}% APY compound converted).`);
      } else {
        setBalances(prev => ({ ...prev, USDC: (prev['USDC'] || 0) + totalPayoutUsdc }));
        setDualSimulationOutcome(`SOL Price at expiry settled ABOVE strike ($141.20). No purchase triggered. Returned principal + high-yield compounding payout of $${totalPayoutUsdc.toFixed(2)} USDC.`);
      }
    } else {
      // ETH Sell High - if strike hit, payouts converted to USDC. Else ETH.
      if (forceOutcome === 'STRIKE_HIT') {
        const ethQty = principal * (1 + (dualActiveSub.apy / 100) * (3 / 365));
        const payoutUsdc = ethQty * dualActiveSub.strikePrice;
        setBalances(prev => ({ ...prev, USDC: (prev['USDC'] || 0) + payoutUsdc }));
        setDualSimulationOutcome(`ETH Price at expiry settled ABOVE strike ($3550.00). Portfolio auto-sold. Received $${payoutUsdc.toFixed(2)} USDC (Principal ETH converted at Strike + High APY).`);
      } else {
        const totalEthPayout = principal * (1 + (dualActiveSub.apy / 100) * (3 / 365));
        setBalances(prev => ({ ...prev, ETH: (prev['ETH'] || 0) + totalEthPayout }));
        setDualSimulationOutcome(`ETH Price at expiry settled BELOW strike ($3380.00). Hold maintained. Returned your principal + yield payout of ${totalEthPayout.toFixed(5)} ETH.`);
      }
    }

    setDualActiveSub(null);
    onNotification('success', 'Structured investment cleared. Assets distributed.');
  };

  // --- 25. Micro-DCA Fiat Round-Ups Dashboard ---
  const triggerSimulatedCardSpend = () => {
    const merchants = ['Starbucks Grind', 'Node Cloud Host', 'Retro Synthesizers', 'Steam Games', 'Tesla Charging'];
    const chosenMerchant = merchants[Math.floor(Math.random() * merchants.length)];
    const cost = parseFloat((Math.random() * 20 + 2).toFixed(2));
    const nextDollar = Math.ceil(cost);
    const roundup = parseFloat((nextDollar - cost).toFixed(2));
    const finalRoundup = roundup === 0 ? 1.00 : roundup;

    const addition = finalRoundup * dcaMultiplier;

    // Deduct USDC from wallet, save it into the DCA fund
    const currentUsdc = balances['USDC'] || 0;
    if (currentUsdc < addition) {
      onNotification('error', 'DCA Round-up failed: Insufficient USDC balance.');
      return;
    }

    setBalances(prev => ({ ...prev, USDC: prev['USDC'] - addition }));
    setAccumulatedDcaUsdc(prev => prev + addition);

    const newTx = {
      id: `tx-dca-${Math.floor(Math.random() * 10000)}`,
      merchant: chosenMerchant,
      cost,
      roundup: finalRoundup
    };

    setSimTransactions(prev => [newTx, ...prev.slice(0, 4)]);
    onNotification('success', `Virtual debit swipe simulated at ${chosenMerchant}! Rounded up $${finalRoundup.toFixed(2)} x ${dcaMultiplier} to DCA.`);
  };

  const executeDcaPurchase = () => {
    if (accumulatedDcaUsdc <= 0) {
      onNotification('error', 'No accumulated savings to DCA purchase.');
      return;
    }

    const currentSaved = accumulatedDcaUsdc;
    // Spot rate simulation
    const rate = dcaTargetAsset === 'SOL' ? 145.25 : dcaTargetAsset === 'NEX' ? 2.50 : 3240.00;
    const boughtAmount = currentSaved / rate;

    setBalances(prev => ({
      ...prev,
      [dcaTargetAsset]: (prev[dcaTargetAsset] || 0) + boughtAmount
    }));

    setAccumulatedDcaUsdc(0);
    onNotification('success', `Automated DCA executed! Rounded-up $${currentSaved.toFixed(2)} converted to ${boughtAmount.toFixed(4)} ${dcaTargetAsset}.`);
  };

  // --- 26. Artifact Locker Boosters ---
  const toggleArtifact = (artId: string) => {
    setArtifacts(prev => prev.map(art => {
      if (art.id === artId) {
        const nextState = !art.equipped;
        if (nextState) {
          onNotification('success', `Equipped ${art.name}! Boosting yield APY by +${art.boost}% on matching validator slots.`);
        } else {
          onNotification('info', `Unequipped ${art.name}. Staking reverted to baseline APY rates.`);
        }
        return { ...art, equipped: nextState };
      }
      return art;
    }));
  };

  // --- 27. Cross-Asset Yield Router ---
  const handleCrossAssetRoute = () => {
    setRoutingInProcess(true);
    setRouteSteps([]);

    const steps = [
      `Initiating secure cross-protocol bridge check for ${selectedSymbol}...`,
      `Scanning optimal liquidity path from ${routerSelectedPool} to Nexus Smart Optimizers...`,
      `Liquidating fractional yield-lockers at ${routerSelectedPool}...`,
      `Re-routing capital reserves through gas-optimized aggregators...`,
      `Depositing and initializing compounding pools on Nexus (boosting yields up to ${computedAPYRates[selectedSymbol].toFixed(2)}% APY).`
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setRouteSteps(prev => [...prev, step]);
        if (index === steps.length - 1) {
          setRoutingInProcess(false);
          onNotification('success', `Sovereign liquidity re-routed! Assets now enjoy maximized compounding multipliers.`);
          // Auto compound enabled on that asset as result
          setAutoCompoundEnabled(prev => ({ ...prev, [selectedSymbol]: true }));
        }
      }, (index + 1) * 800);
    });
  };

  // --- 28. Proof-of-Learn Knowledge Micro-Grants Portal ---
  const handleStartCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    setCurrentQuestionIdx(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
  };

  const handleSelectOption = (idx: number) => {
    setSelectedQuizOption(idx);
  };

  const handleNextQuizQuestion = () => {
    if (selectedQuizOption === null) return;

    const course = courses.find(c => c.id === activeCourseId);
    if (!course) return;

    const isCorrect = selectedQuizOption === course.questions[currentQuestionIdx].correctIdx;
    if (isCorrect) {
      setQuizScore(s => s + 1);
    }

    if (currentQuestionIdx < course.questions.length - 1) {
      setCurrentQuestionIdx(idx => idx + 1);
      setSelectedQuizOption(null);
    } else {
      // Quiz complete!
      const finalScore = quizScore + (isCorrect ? 1 : 0);
      const passed = finalScore === course.questions.length;

      if (passed) {
        // Payout micro-grant in NEX
        setBalances(prev => ({ ...prev, NEX: (prev['NEX'] || 0) + course.rewardNex }));
        setCourses(prev => prev.map(c => c.id === course.id ? { ...c, completed: true } : c));
        onNotification('success', `Passed Course! Received Proof-of-Learn Micro-Grant of ${course.rewardNex} NEX.`);
      } else {
        onNotification('error', `Score: ${finalScore}/${course.questions.length}. Proof of knowledge rejected. Please review blockchain architecture and try again!`);
      }
      setActiveCourseId(null);
    }
  };

  // --- 29. Tax-Loss Harvesting Diagnostic Panel ---
  const handleExecuteTaxHarvest = () => {
    if (underwaterPositions.length === 0) {
      onNotification('error', 'No underwater positions identified in current portfolio diagnostics.');
      return;
    }

    setTaxHarvestLogs([]);
    setTaxHarvestComplete(false);

    const steps = [
      'Scanning portfolio positions for crystallizable capital losses...',
      'Identified underperforming spot ledger assets (DOT, LINK).',
      'Closing out position offsets at current market thresholds to crystallize $567.90 short-term losses...',
      'Tax-Loss offsets locked. Instantly re-deploying liquid cash into staking equivalent Nexus stAssets...',
      'Staking exposure maintained 100% while capturing $567.90 capital loss offset against annual liabilities!'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setTaxHarvestLogs(prev => [...prev, step]);
        if (index === steps.length - 1) {
          // Add stAssets corresponding to liquidated spot
          setBalances(prev => ({
            ...prev,
            stSOL: (prev['stSOL'] || 0) + 12, // reinvested safely
            USDC: (prev['USDC'] || 0) + 1200
          }));
          setUnderwaterPositions([]);
          setTaxHarvestComplete(true);
          onNotification('success', 'Tax Loss Harvesting complete! Capital loss registered and proceeds re-staked.');
        }
      }, (index + 1) * 700);
    });
  };

  // --- 30. Decay-Protected Crypto Time-Lock Safes ---
  const handleLockSafeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(safeAmount);

    if (isNaN(amt) || amt <= 0) {
      onNotification('error', 'Please enter a valid amount to lock down.');
      return;
    }

    const available = balances[safeAsset] || 0;
    if (amt > available) {
      onNotification('error', `Insufficient spot balance. You only have ${available.toFixed(4)} ${safeAsset}.`);
      return;
    }

    // Deduct from spot
    setBalances(prev => ({ ...prev, [safeAsset]: prev[safeAsset] - amt }));

    // Create safe
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + safeMonths);
    const dateStr = targetDate.toISOString().split('T')[0];

    const newSafe = {
      id: `safe-${Math.floor(Math.random() * 10000)}`,
      asset: safeAsset,
      amount: amt,
      unlockDate: dateStr,
      timeRemaining: `${safeMonths * 30} Days`,
      status: 'locked' as const
    };

    setSafes(prev => [newSafe, ...prev]);
    setSafeAmount('');
    onNotification('success', `Funds physically isolated! Stored ${amt} ${safeAsset} in decentralized Safe locked until ${dateStr}.`);
  };

  const handleUnlockSafe = (safeId: string) => {
    const safe = safes.find(s => s.id === safeId);
    if (!safe) return;

    if (safe.status === 'locked') {
      onNotification('error', `Decay Protection Active! Safe is physically locked until ${safe.unlockDate}. Unlocking before that date is prohibited by smart contract rules.`);
      return;
    }

    // Restore to spot
    setBalances(prev => ({ ...prev, [safe.asset]: (prev[safe.asset] || 0) + safe.amount }));
    setSafes(prev => prev.filter(s => s.id !== safeId));
    onNotification('success', `Unlocked safe! Restored ${safe.amount} ${safe.asset} to spot wallet.`);
  };

  // Helper valuation math
  const totalStakedValuation = useMemo(() => {
    let sum = 0;
    Object.keys(stakedBalances).forEach((symbol) => {
      const asset = assets.find(a => a.symbol === symbol);
      if (asset) {
        sum += stakedBalances[symbol] * asset.price;
      }
    });
    return sum;
  }, [stakedBalances, assets]);

  const activeRebateTier = useMemo(() => {
    if (feeDiscount >= 60) return 'Gold Vault Master (-60% Fees)';
    if (feeDiscount >= 35) return 'Silver Vault Guardian (-35% Fees)';
    if (feeDiscount >= 15) return 'Bronze Locker Advocate (-15% Fees)';
    return 'Standard Level (0% Discount)';
  }, [feeDiscount]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION WITH KEY ACCRUAL METRICS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400 animate-pulse" />
            Game-Theoretic Asset Growth & Yield Mechanization
          </h2>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Leverage peak auto-compounding algorithms, liquid synthetic derivatives, gamified booster artifacts, and structured options hedging desks.
          </p>
        </div>

        {/* SUB-TABS NAVIGATION CONTROLLERS */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-900 rounded-xl">
          {[
            { id: 'flexible', label: 'Core Staking & LSD', icon: Coins },
            { id: 'optimizers', label: 'Yield Optimizers', icon: Zap },
            { id: 'lockers', label: 'Locks & Safes', icon: Lock },
            { id: 'structured', label: 'Structured duals & Tax', icon: Layers },
            { id: 'academy', label: 'Academy & DCA', icon: GraduationCap }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                id={`earn-tab-${tab.id}`}
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setStakingError(''); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-emerald-400 shadow-md border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
          <span className="text-[9px] font-mono text-slate-500 uppercase block">Total Active Stake</span>
          <span className="text-lg font-bold text-white font-mono mt-1 block">
            ${totalStakedValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] font-sans text-slate-400 mt-1 block">Compounding live via validator epochs</span>
        </div>

        <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
          <span className="text-[9px] font-mono text-slate-500 uppercase block">Fee Rebate Lock Status</span>
          <span className="text-xs font-bold text-emerald-400 font-mono mt-1.5 block">{activeRebateTier}</span>
          <span className="text-[10px] font-sans text-slate-500 block mt-1">Locks unlock globally on expiration</span>
        </div>

        <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
          <span className="text-[9px] font-mono text-slate-500 uppercase block">DCA Roundup Cache</span>
          <span className="text-lg font-bold text-cyan-400 font-mono mt-1 block">${accumulatedDcaUsdc.toFixed(2)} USDC</span>
          <button 
            id="btn-execute-dca-buy"
            onClick={executeDcaPurchase}
            disabled={accumulatedDcaUsdc <= 0}
            className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 transition mt-1 block cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Execute micro-purchase ❯
          </button>
        </div>

        {/* Real-time rewards ticker */}
        <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl relative overflow-hidden">
          <span className="text-[9px] font-mono text-slate-500 uppercase block">Live Staking Yields Ticker</span>
          <div className="space-y-0.5 mt-1.5 font-mono text-[10px]">
            {Object.keys(BASE_APY_RATES).map((sym) => {
              const staked = stakedBalances[sym] || 0;
              return (
                <div key={sym} className="flex justify-between items-center">
                  <span className="text-slate-400">{sym} Earned</span>
                  <span className={staked > 0 ? 'text-emerald-400 font-bold animate-pulse' : 'text-slate-500'}>
                    {accruedRewards[sym].toFixed(6)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- TAB 1: CORE STAKING & LSD --- */}
        {activeTab === 'flexible' && (
          <motion.div
            key="flexible"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Staking Pools and Artifact Boosters */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-5">
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    Flexible Validator Pools
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">LIQUID APY CONFIGURATIONS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(BASE_APY_RATES).map((symbol) => {
                    const asset = assets.find(a => a.symbol === symbol);
                    const apy = computedAPYRates[symbol];
                    const isSelected = selectedSymbol === symbol;
                    const stakedAmount = stakedBalances[symbol] || 0;
                    const isStaked = stakedAmount > 0;

                    if (!asset) return null;

                    return (
                      <button
                        id={`stake-pool-${symbol}`}
                        key={symbol}
                        onClick={() => { setSelectedSymbol(symbol); setStakingError(''); }}
                        className={`p-4 rounded-xl text-left transition-all border cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-900 border-emerald-500/50 shadow-md' 
                            : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-sans font-bold text-white tracking-wider">{symbol}</span>
                            <span className="text-[10px] font-sans text-slate-500">{asset.name}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 rounded-lg text-[10px] font-mono font-bold">
                            {apy.toFixed(2)}% APY
                          </span>
                        </div>

                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between text-slate-500">
                            <span>In Wallet:</span>
                            <span className="text-slate-300">{(balances[symbol] || 0).toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Staked Amount:</span>
                            <span className={`${isStaked ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                              {stakedAmount.toFixed(4)}
                            </span>
                          </div>
                        </div>

                        {/* Artifact boosted flag */}
                        {artifacts.some(a => a.equipped && (a.targetAsset === 'GLOBAL' || a.targetAsset === symbol)) && (
                          <div className="mt-2.5 pt-2 border-t border-slate-900/80 flex items-center gap-1 text-[9px] font-mono text-cyan-400">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            Equipped Artifact boosting APY
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 26. Visual Yield Boosting Artifact Lockers */}
              <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl">
                <div>
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Consensus Yield Boosting Artifacts
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1">
                    Socket rare cryptographic artifacts acquired through platform loyalty directly to the validator interface to permanently boost active pool rates.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                  {artifacts.map((art) => (
                    <div 
                      key={art.id} 
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        art.equipped 
                          ? 'bg-cyan-950/20 border-cyan-500/50' 
                          : 'bg-slate-900/40 border-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">{art.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            art.tier === 'Cosmic' 
                              ? 'bg-purple-950 text-purple-400 border border-purple-900/40' 
                              : art.tier === 'Relic' 
                              ? 'bg-amber-950 text-amber-400 border border-amber-900/40' 
                              : 'bg-cyan-950 text-cyan-400 border border-cyan-900/40'
                          }`}>
                            {art.tier}
                          </span>
                        </div>
                        <p className="text-[10px] font-sans text-slate-300 leading-relaxed">
                          {art.description}
                        </p>
                        <div className="mt-3 text-[10px] font-mono text-emerald-400">
                          Yield Multiplier: +{art.boost.toFixed(2)}% APY
                        </div>
                      </div>

                      <button
                        id={`btn-equip-artifact-${art.id}`}
                        onClick={() => toggleArtifact(art.id)}
                        className={`w-full py-1.5 text-[10px] font-mono font-bold rounded-lg mt-4 cursor-pointer transition ${
                          art.equipped 
                            ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800' 
                            : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {art.equipped ? 'UNEQUIP FROM SOCKET' : 'EQUIP TO SLOT'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Form Desk: Interactive Stake & Minting */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Core Staking Form */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                <form onSubmit={handleStakeSubmit} className="space-y-4">
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-900">
                    <button
                      id="stake-action-deposit"
                      type="button"
                      onClick={() => { setStakeAction('stake'); setStakingError(''); }}
                      className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        stakeAction === 'stake' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      STAKE {selectedSymbol}
                    </button>
                    <button
                      id="stake-action-withdraw"
                      type="button"
                      onClick={() => { setStakeAction('unstake'); setStakingError(''); }}
                      className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        stakeAction === 'unstake' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      UNSTAKE {selectedSymbol}
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-500 uppercase">Selected Pool</span>
                      <span className="font-sans font-bold text-white tracking-wider">{selectedSymbol} Pool</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-900/50 pt-2">
                      <span className="font-mono text-slate-500 uppercase">Active Yield Rate</span>
                      <span className="font-mono font-bold text-emerald-400">{selectedAPY.toFixed(2)}% APY</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-900/50 pt-2">
                      <span className="font-mono text-slate-500 uppercase">Liquid Wallet</span>
                      <span className="font-mono text-slate-300">{(balances[selectedSymbol] || 0).toFixed(4)} {selectedSymbol}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-900/50 pt-2">
                      <span className="font-mono text-slate-500 uppercase">Staked Balance</span>
                      <span className="font-mono text-emerald-400">{(stakedBalances[selectedSymbol] || 0).toFixed(4)} {selectedSymbol}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <label className="text-slate-400">{stakeAction === 'stake' ? 'Deposit Capital' : 'Withdraw Staked'}</label>
                      <button
                        id="stake-max-btn"
                        type="button"
                        onClick={handleMaxClick}
                        className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        Use Max
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="stake-amount-input"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={stakeAction === 'stake' ? stakeAmount : unstakeAmount}
                        onChange={(e) => {
                          if (stakeAction === 'stake') {
                            setStakeAmount(e.target.value);
                          } else {
                            setUnstakeAmount(e.target.value);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-500">{selectedSymbol}</span>
                    </div>
                  </div>

                  {stakingError && (
                    <p className="text-xs font-mono text-red-400">{stakingError}</p>
                  )}

                  <button
                    id="stake-submit-btn"
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-lg transition tracking-wide cursor-pointer"
                  >
                    {stakeAction === 'stake' ? 'CONFIRM DEPOSIT' : 'CONFIRM WITHDRAWAL'}
                  </button>
                </form>
              </div>

              {/* 22. Liquid Staking Tokenization Derivatives (Nexus stAssets) */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Liquid Staking Derivatives
                  </h4>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">
                    Mint representative synthetic stAssets (stSOL / stETH) 1:1 against active staking. Earn validation rewards while maintaining perfect liquidity to trade or exit.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-900 text-xs">
                    <button
                      id="mint-tab-sol"
                      type="button"
                      onClick={() => setMintAsset('SOL')}
                      className={`flex-1 py-1.5 font-mono rounded-lg transition-all cursor-pointer ${
                        mintAsset === 'SOL' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      SOL ➔ stSOL
                    </button>
                    <button
                      id="mint-tab-eth"
                      type="button"
                      onClick={() => setMintAsset('ETH')}
                      className={`flex-1 py-1.5 font-mono rounded-lg transition-all cursor-pointer ${
                        mintAsset === 'ETH' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      ETH ➔ stETH
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Staked {mintAsset}:</span>
                      <span className="text-slate-300">{(stakedBalances[mintAsset] || 0).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Derivative Balance:</span>
                      <span className="text-cyan-400 font-semibold">{(stBalances[`st${mintAsset}`] || 0).toFixed(4)} st{mintAsset}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id="mint-derivative-input"
                        type="number"
                        placeholder="0.00"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs font-mono text-white focus:outline-none"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-500">{mintAsset}</span>
                    </div>
                    <button
                      id="btn-mint-derivative"
                      onClick={handleMintstAsset}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                    >
                      Mint 1:1
                    </button>
                  </div>

                  {stBalances[`st${mintAsset}`] > 0 && (
                    <button
                      id="btn-burn-derivative"
                      onClick={() => handleBurnstAsset(`st${mintAsset}`)}
                      className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono rounded-lg transition cursor-pointer"
                    >
                      Redeem st{mintAsset} to Base Staking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 2: YIELD OPTIMIZERS --- */}
        {activeTab === 'optimizers' && (
          <motion.div
            key="optimizers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* 21. Auto-Compounding Smart Yield Optimizers */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Auto-Compounding Smart Yield Lockers
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">GAS-OPTIMIZED RE-STAKING</span>
                </div>

                <p className="text-xs font-sans text-slate-400 mb-6 leading-relaxed">
                  Automated scripts scan validator block intervals, harvesting staking payouts precisely at peak mathematical thresholds, and rolling rewards back into staked principal to maximize compound metrics.
                </p>

                <div className="space-y-4">
                  {Object.keys(BASE_APY_RATES).map((sym) => {
                    const isEnabled = autoCompoundEnabled[sym];
                    const baseApy = computedAPYRates[sym];
                    const activeStake = stakedBalances[sym] || 0;

                    return (
                      <div 
                        key={sym} 
                        className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                            <span className="text-xs font-mono font-bold text-white">{sym}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{sym} Compounder</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/30 text-emerald-400 border border-emerald-900/40">
                                +1.50% APY Boost
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 mt-1">
                              Active Stake: {activeStake.toFixed(4)} {sym} • Compounding APY: {baseApy.toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <span className="text-[9px] font-mono text-slate-500 uppercase block">OPTIMAL INTERVAL</span>
                            <span className="text-xs font-bold text-slate-300 font-mono">Every 4.2 Hours</span>
                          </div>

                          <button
                            id={`btn-toggle-compound-${sym}`}
                            onClick={() => toggleAutoCompound(sym)}
                            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition cursor-pointer ${
                              isEnabled 
                                ? 'bg-emerald-500 text-slate-950 font-bold' 
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                            }`}
                          >
                            {isEnabled ? 'ACTIVE' : 'ACTIVATE'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time optimizer log feed */}
              <div className="mt-6 p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[10px]">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    PEAK YIELD HARVESTER DIAGNOSTIC LOGS
                  </span>
                  <span className="text-slate-500 animate-pulse">● LIVE TELEMETRY</span>
                </div>
                <div className="space-y-1.5 text-slate-400 max-h-36 overflow-y-auto">
                  {compoundLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-emerald-500">❯</span>
                      <span className="leading-normal">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 27. Cross-Asset Yield Optimization Router */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                    Cross-Asset Yield Router
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
                    Instantly identify maximum APY positions across external decentralized protocols (Lido, RocketPool, Aave) and automatically migrate active deposits into optimized positions with one button.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
                  <label className="text-xs font-mono text-slate-400 uppercase">Target Staking Asset to Route:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['SOL', 'ETH', 'LINK', 'DOT'].map(sym => (
                      <button
                        id={`btn-router-sym-${sym}`}
                        key={sym}
                        onClick={() => setSelectedSymbol(sym)}
                        className={`py-1.5 text-xs font-mono rounded transition cursor-pointer ${
                          selectedSymbol === sym 
                            ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                            : 'bg-slate-950 text-slate-400 border border-slate-900'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Select Source Protocol to Migrate:</label>
                    <select
                      id="select-router-source"
                      value={routerSelectedPool}
                      onChange={(e) => setRouterSelectedPool(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-lg p-2 text-xs font-sans text-white mt-1"
                    >
                      <option value="Lido">Lido Finance Staking Pool ({selectedSymbol === 'ETH' ? '3.85%' : '5.10%'} APY)</option>
                      <option value="Aave">Aave V3 Lending Vaults ({selectedSymbol === 'ETH' ? '2.90%' : '4.20%'} APY)</option>
                      <option value="RocketPool">RocketPool Validator Nodes ({selectedSymbol === 'ETH' ? '4.05%' : '5.30%'} APY)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source Pool APY:</span>
                    <span className="text-slate-400">{routerSelectedPool === 'Lido' ? '3.85%' : '2.90%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nexus Optimizing APY:</span>
                    <span className="text-emerald-400 font-semibold">{computedAPYRates[selectedSymbol].toFixed(2)}% APY</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-1.5">
                    <span className="text-cyan-400 font-bold">Estimated Yield Bump:</span>
                    <span className="text-cyan-400 font-bold font-mono">+{Math.max(0.5, computedAPYRates[selectedSymbol] - 4).toFixed(2)}% APY</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button
                  id="btn-trigger-cross-route"
                  onClick={handleCrossAssetRoute}
                  disabled={routingInProcess}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {routingInProcess ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      RE-ROUTING CAPITALS...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      EXECUTE ROUTE & BOOST
                    </>
                  )}
                </button>

                {routeSteps.length > 0 && (
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-[9px] font-mono text-slate-400 space-y-1">
                    {routeSteps.map((step, i) => (
                      <div key={i} className="flex gap-1.5">
                        <span className="text-cyan-500">✓</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 3: LOCKS & SAFES --- */}
        {activeTab === 'lockers' && (
          <motion.div
            key="lockers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* 23. Gamified Vault Locking Tiers */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    Gamified Vault Locking Tiers & Fee Rebates
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">PERMANENT PLATFORM BOOSTS</span>
                </div>

                <p className="text-xs font-sans text-slate-400 mb-6 leading-relaxed">
                  Lock your native **NEX** exchange tokens into smart non-custodial custody vaults for predetermined periods. Tiered locks instantly activate global trading fee rebate multipliers on all spot and limit desks.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'bronze', name: 'Bronze Locker', amount: 100, days: 30, rebate: 15, bg: 'from-amber-900/20 to-amber-950/20', border: 'border-amber-900/40', text: 'text-amber-400' },
                    { id: 'silver', name: 'Silver Guardian', amount: 500, days: 90, rebate: 35, bg: 'from-slate-800/30 to-slate-900/30', border: 'border-slate-700/40', text: 'text-slate-300' },
                    { id: 'gold', name: 'Gold Vault Master', amount: 2000, days: 365, rebate: 60, bg: 'from-cyan-950/30 to-teal-950/30', border: 'border-cyan-800/40', text: 'text-cyan-400' }
                  ].map((tier) => (
                    <div 
                      key={tier.id} 
                      className={`p-5 rounded-xl border bg-gradient-to-b ${tier.bg} ${tier.border} flex flex-col justify-between space-y-4`}
                    >
                      <div>
                        <span className={`text-xs font-mono font-bold uppercase block ${tier.text}`}>{tier.name}</span>
                        <div className="mt-2">
                          <span className="text-xl font-mono font-bold text-white">{tier.amount} NEX</span>
                          <span className="text-[10px] font-mono text-slate-500 block">Required balance lock</span>
                        </div>
                        <div className="mt-3 space-y-1 text-[11px] font-sans text-slate-300">
                          <div>• Duration: **{tier.days} Days**</div>
                          <div>• Global Rebate: <strong className="text-emerald-400">-{tier.rebate}% Fees</strong></div>
                        </div>
                      </div>

                      <button
                        id={`btn-lock-tier-${tier.id}`}
                        onClick={() => handleLockVault(tier.id, tier.days, tier.rebate)}
                        className={`w-full py-1.5 text-[10px] font-mono font-bold rounded-lg cursor-pointer transition ${
                          feeDiscount >= tier.rebate 
                            ? 'bg-emerald-500 text-slate-950' 
                            : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {feeDiscount >= tier.rebate ? 'ACTIVE LOCK' : 'DEPOSIT & LOCK'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex items-start gap-3 mt-6 text-xs text-slate-400">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">Non-Custodial Fee Scaling Mathematics</p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    Once locked, tokens are mathematically frozen by on-chain consensus. You can check expiration countdowns. Your current active rebate is: <strong className="text-emerald-400">{feeDiscount}% Global Reduction</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* 30. Decay-Protected Crypto Time-Lock Safes */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    Decay-Protected Safes
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
                    Unbreachable cold storage safes designed to enforce strict self-discipline. Deposits remain physically unmovable until designated calendar milestones are hit.
                  </p>
                </div>

                <form onSubmit={handleLockSafeSubmit} className="space-y-4 p-4 bg-slate-900/30 border border-slate-900 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">CREATE IMPULSE LOCKBOX</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-mono text-slate-500 block uppercase">ASSET</label>
                      <select
                        id="select-safe-asset"
                        value={safeAsset}
                        onChange={(e) => setSafeAsset(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="SOL">SOL</option>
                        <option value="ETH">ETH</option>
                        <option value="LINK">LINK</option>
                        <option value="DOT">DOT</option>
                        <option value="NEX">NEX</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-500 block uppercase">LOCK INTERVAL</label>
                      <select
                        id="select-safe-months"
                        value={safeMonths}
                        onChange={(e) => setSafeMonths(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">1 Year</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-500 block uppercase">AMOUNT</label>
                    <div className="relative">
                      <input
                        id="input-safe-amount"
                        type="number"
                        placeholder="0.0"
                        value={safeAmount}
                        onChange={(e) => setSafeAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-500">{safeAsset}</span>
                    </div>
                  </div>

                  <button
                    id="btn-confirm-safe-lock"
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-xs font-mono font-bold rounded-lg transition"
                  >
                    LOCK IN DECAY SAFE 🔒
                  </button>
                </form>

                {/* Render active safes */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">ACTIVE SAFE CRYPTS</span>
                  {safes.map(safe => (
                    <div key={safe.id} className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{safe.amount} {safe.asset}</span>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 mt-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Unlocks: {safe.unlockDate}</span>
                        </div>
                      </div>

                      <button
                        id={`btn-unlock-safe-${safe.id}`}
                        onClick={() => handleUnlockSafe(safe.id)}
                        className={`px-2.5 py-1 text-[9px] font-mono rounded-md transition cursor-pointer ${
                          safe.status === 'locked' 
                            ? 'bg-red-950/20 text-red-400 border border-red-900/40 hover:border-red-500' 
                            : 'bg-emerald-500 text-slate-950'
                        }`}
                      >
                        {safe.status === 'locked' ? 'FORCE UNSTAKE' : 'CLAIM SPOT'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 4: STRUCTURED DUALS & TAX-LOSS --- */}
        {activeTab === 'structured' && (
          <motion.div
            key="structured"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* 24. Volatility-Hedging Dual Investment */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Volatility-Hedging Dual Investment Vehicles
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">STRUCTURED EXOTIC CONTRACTS</span>
                </div>

                <p className="text-xs font-sans text-slate-400 mb-6 leading-relaxed">
                  Earn elevated interest products paid out in one of two separate assets depending on strike boundary settle prices at expiration. Hedging tools allow users to gain yield while locking spot boundaries.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    id="btn-dual-sol-low"
                    onClick={() => setDualSelectedProduct('SOL-LOW')}
                    className={`p-4 rounded-xl text-left border cursor-pointer transition ${
                      dualSelectedProduct === 'SOL-LOW' 
                        ? 'bg-slate-900 border-cyan-500/50' 
                        : 'bg-slate-950/60 border-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">SOL Buy Low Strike</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">68.2% APY</span>
                    </div>
                    <div className="space-y-1 text-[11px] font-mono text-slate-400">
                      <div>• Strike Price: **$135.00 USDC**</div>
                      <div>• Duration: **3 Days**</div>
                      <div>• Principal Asset: **USDC**</div>
                    </div>
                  </button>

                  <button
                    id="btn-dual-eth-high"
                    onClick={() => setDualSelectedProduct('ETH-HIGH')}
                    className={`p-4 rounded-xl text-left border cursor-pointer transition ${
                      dualSelectedProduct === 'ETH-HIGH' 
                        ? 'bg-slate-900 border-cyan-500/50' 
                        : 'bg-slate-950/60 border-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">ETH Sell High Strike</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">84.5% APY</span>
                    </div>
                    <div className="space-y-1 text-[11px] font-mono text-slate-400">
                      <div>• Strike Price: **$3,450.00 USDC**</div>
                      <div>• Duration: **3 Days**</div>
                      <div>• Principal Asset: **ETH**</div>
                    </div>
                  </button>
                </div>

                <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400">CAPITAL SUBSCRIPTION AMOUNT:</span>
                    <span className="text-[10px] font-mono text-slate-500">Funding Source: {dualSelectedProduct === 'SOL-LOW' ? 'USDC' : 'ETH'}</span>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        id="input-dual-amount"
                        type="number"
                        placeholder="0.00"
                        value={dualSubAmount}
                        onChange={(e) => setDualSubAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-500 font-mono">
                        {dualSelectedProduct === 'SOL-LOW' ? 'USDC' : 'ETH'}
                      </span>
                    </div>
                    <button
                      id="btn-submit-dual"
                      onClick={handleSubscribeDual}
                      className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-lg transition"
                    >
                      Lock Dual Position
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation outcomes */}
              {dualActiveSub && (
                <div className="mt-6 p-4 bg-slate-950 border border-cyan-900/30 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase block">ACTIVE DUAL INVESTMENT SETTLEMENT LAB</span>
                  <p className="text-xs text-slate-300 font-sans">
                    You have staked **{dualActiveSub.amount} {dualActiveSub.underlying}** in the {dualActiveSub.asset} {dualActiveSub.type === 'low' ? 'Buy-Low' : 'Sell-High'} Pool. Fast-forward and settle:
                  </p>

                  <div className="flex gap-2">
                    <button
                      id="btn-settle-strike-hit"
                      onClick={() => handleSimulateDualExpiry('STRIKE_HIT')}
                      className="flex-1 py-1.5 bg-red-950/40 border border-red-900/40 hover:border-red-500 text-red-400 text-[10px] font-mono rounded"
                    >
                      Settle Inside Strike (Asset Converted)
                    </button>
                    <button
                      id="btn-settle-strike-missed"
                      onClick={() => handleSimulateDualExpiry('STRIKE_MISSED')}
                      className="flex-1 py-1.5 bg-emerald-950/40 border border-emerald-900/40 hover:border-emerald-500 text-emerald-400 text-[10px] font-mono rounded"
                    >
                      Settle Outside Strike (Keep Principal)
                    </button>
                  </div>
                </div>
              )}

              {dualSimulationOutcome && (
                <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                  <div className="text-emerald-400 font-bold mb-1">✓ CONTRACT CLEARED & ASSETS DISTRIBUTED:</div>
                  {dualSimulationOutcome}
                </div>
              )}
            </div>

            {/* 29. Tax-Loss Harvesting Diagnostic Panel */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Tax-Loss Harvesting
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
                    Auto-scan open spots for underwater positions. Re-route liquid capital offset immediately to harvest tax deductions while preserving 100% exposure in derivative formats.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">UNDERWATER LEDGER DIAGNOSIS</span>
                  {underwaterPositions.map(pos => (
                    <div key={pos.id} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-white">{pos.asset} Spot Position</span>
                        <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                          Buy: ${pos.buyPrice} • Current: ${pos.currentPrice}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-400 font-mono">{pos.lossUsd.toFixed(2)} USD</span>
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Unrealized Loss</span>
                      </div>
                    </div>
                  ))}

                  {underwaterPositions.length === 0 && (
                    <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 text-emerald-400 text-center rounded-xl text-xs font-mono">
                      All positions aligned! No capital losses available to offset.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {underwaterPositions.length > 0 && (
                  <button
                    id="btn-harvest-tax-losses"
                    onClick={handleExecuteTaxHarvest}
                    className="w-full py-2 bg-rose-950/40 border border-rose-900/60 hover:border-rose-500 text-rose-400 text-xs font-mono rounded-lg transition"
                  >
                    CRYSTALLIZE TAX LOSSES & STAKE DERIVATIVES
                  </button>
                )}

                {taxHarvestLogs.length > 0 && (
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-[9px] font-mono text-slate-400 space-y-1 max-h-40 overflow-y-auto">
                    {taxHarvestLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-1.5">
                        <span className="text-rose-500">❯</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 5: ACADEMY & MICRO-DCA --- */}
        {activeTab === 'academy' && (
          <motion.div
            key="academy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* 28. Proof-of-Learn Knowledge Micro-Grants Portal */}
            <div className="lg:col-span-7 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    Proof-of-Learn Knowledge Micro-Grants
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">EARN WHILE YOU DIGEST RULES</span>
                </div>

                <p className="text-xs font-sans text-slate-400 mb-6 leading-relaxed">
                  Earn micro-distributions of native platform exchange utility tokens (**NEX**) by reading curriculum material on blockchain finality, elliptic curves, and mathematical hedging models. Complete full-score quizzes to claim grant keys.
                </p>

                {activeCourseId === null ? (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div 
                        key={course.id} 
                        className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{course.title}</span>
                            {course.completed ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30">
                                COMPLETED
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-900/30">
                                ACTIVE REWARD
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-sans text-slate-400 mt-1">
                            {course.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 border-slate-900 pt-3 md:pt-0">
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-slate-500 block">GRANT</span>
                            <span className="text-xs font-bold text-cyan-400 font-mono">{course.rewardNex} NEX</span>
                          </div>

                          <button
                            id={`btn-start-course-${course.id}`}
                            onClick={() => handleStartCourse(course.id)}
                            disabled={course.completed}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {course.completed ? 'CLAIMED' : 'START LESSON'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Quiz Form UI
                  <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-4">
                    {(() => {
                      const activeCourse = courses.find(c => c.id === activeCourseId)!;
                      const q = activeCourse.questions[currentQuestionIdx];
                      return (
                        <>
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pb-2 border-b border-slate-900">
                            <span>LESSON {currentQuestionIdx + 1} OF {activeCourse.questions.length}</span>
                            <span>COURSE: {activeCourse.title}</span>
                          </div>

                          <h4 className="text-sm font-semibold text-white pt-1">
                            {q.question}
                          </h4>

                          <div className="space-y-2 mt-4">
                            {q.options.map((option, idx) => (
                              <button
                                id={`quiz-option-${idx}`}
                                key={idx}
                                onClick={() => handleSelectOption(idx)}
                                className={`w-full text-left p-3 rounded-lg border text-xs font-sans transition cursor-pointer ${
                                  selectedQuizOption === idx 
                                    ? 'bg-cyan-950/30 border-cyan-500/60 text-cyan-300' 
                                    : 'bg-slate-950 border-slate-900 hover:border-slate-850 text-slate-400'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-2 justify-end mt-6">
                            <button
                              id="btn-quit-quiz"
                              onClick={() => setActiveCourseId(null)}
                              className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 text-xs font-mono rounded-lg transition"
                            >
                              Quit Lessons
                            </button>
                            <button
                              id="btn-next-question"
                              onClick={handleNextQuizQuestion}
                              disabled={selectedQuizOption === null}
                              className="px-5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-lg transition disabled:opacity-50"
                            >
                              {currentQuestionIdx === activeCourse.questions.length - 1 ? 'SUBMIT & GRAB GRANT' : 'NEXT STEP'}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center gap-3 mt-6 text-xs text-slate-400">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Micro-grants are distributed directly from the Platform Ecosystem Growth Vault and settle in NEX immediately.</span>
              </div>
            </div>

            {/* 25. Micro-DCA Fiat Round-Ups */}
            <div className="lg:col-span-5 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-cyan-400" />
                    Micro-DCA Debit Round-Ups
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
                    Toggle automatic round-up rules mapping simulated daily payments. Transaction odd changes round up to the nearest dollar, automatically executing DCA purchases into selected asset pools.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300">ROUND-UP SAVINGS PIPELINE</span>
                    <button
                      id="btn-toggle-dca"
                      onClick={() => setDcaEnabled(!dcaEnabled)}
                      className={`px-3 py-1 rounded text-[10px] font-mono cursor-pointer ${
                        dcaEnabled ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-900'
                      }`}
                    >
                      {dcaEnabled ? 'ACTIVE' : 'DEACTIVATED'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[9px] font-mono text-slate-500 uppercase block">Purchase Target Asset</label>
                      <select
                        id="select-dca-target"
                        value={dcaTargetAsset}
                        onChange={(e) => setDcaTargetAsset(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-white mt-1"
                      >
                        <option value="SOL">SOL</option>
                        <option value="ETH">ETH</option>
                        <option value="NEX">NEX</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-500 uppercase block">Multiplier Scale</label>
                      <select
                        id="select-dca-multiplier"
                        value={dcaMultiplier}
                        onChange={(e) => setDcaMultiplier(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-white mt-1"
                      >
                        <option value="1">1x (Standard)</option>
                        <option value="2">2x Boost</option>
                        <option value="5">5x Max speed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Simulated debit card panel */}
                <div className="border border-slate-900 bg-slate-950/60 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-[10px] font-mono text-slate-500">
                    <span>SIMULATED PAYMENT STREAM</span>
                    <button 
                      id="btn-swipe-debit-card"
                      onClick={triggerSimulatedCardSpend}
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      Swipe Simulated Card ❯
                    </button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {simTransactions.map(tx => (
                      <div key={tx.id} className="flex justify-between items-center text-[11px] font-mono">
                        <div>
                          <span className="text-slate-300 block">{tx.merchant}</span>
                          <span className="text-slate-500">${tx.cost.toFixed(2)} cost</span>
                        </div>
                        <div className="text-right">
                          <span className="text-cyan-400 font-bold block">+${(tx.roundup * dcaMultiplier).toFixed(2)}</span>
                          <span className="text-[9px] text-slate-500">DCA amount</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  id="btn-dca-convert"
                  onClick={executeDcaPurchase}
                  disabled={accumulatedDcaUsdc <= 0}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-xl transition disabled:opacity-50"
                >
                  EXECUTE DCA PURCHASE (${accumulatedDcaUsdc.toFixed(2)} USDC) ⚡
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
