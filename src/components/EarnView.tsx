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
  DollarSign,
  Smile,
  Check
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

interface Artifact {
  id: string;
  name: string;
  boost: number;
  description: string;
  targetAsset: string;
  equipped: boolean;
  tier: 'Epic' | 'Relic' | 'Cosmic';
}

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
  // Main Sub-tabs with simple friendly labels
  const [activeTab, setActiveTab] = useState<'flexible' | 'optimizers' | 'lockers' | 'structured' | 'academy'>('flexible');

  // Staking selection
  const [selectedSymbol, setSelectedSymbol] = useState('SOL');
  const [stakeAmount, setStakeAmount] = useState('1');
  const [unstakeAmount, setUnstakeAmount] = useState('1');
  const [stakeAction, setStakeAction] = useState<'stake' | 'unstake'>('stake');
  const [stakingError, setStakingError] = useState('');

  // Auto-compounding boosters
  const [autoCompoundEnabled, setAutoCompoundEnabled] = useState<{ [key: string]: boolean }>({
    SOL: false,
    ETH: false,
    LINK: false,
    DOT: false
  });
  const [compoundLogs, setCompoundLogs] = useState<string[]>([
    'Growth nodes initialized. Let\'s make your crypto multiply!',
    'Ready to supercharge compounding cycles.'
  ]);

  // Liquid Staking derivatives
  const [mintAmount, setMintAmount] = useState('1');
  const [mintAsset, setMintAsset] = useState('SOL');
  const [stBalances, setStBalances] = useState<{ [key: string]: number }>({
    stSOL: 0,
    stETH: 0
  });

  // Dual Investment
  const [dualSelectedProduct, setDualSelectedProduct] = useState<'SOL-LOW' | 'ETH-HIGH'>('SOL-LOW');
  const [dualSubAmount, setDualSubAmount] = useState('50');
  const [dualActiveSub, setDualActiveSub] = useState<{
    asset: string;
    type: 'low' | 'high';
    strikePrice: number;
    amount: number;
    apy: number;
    underlying: string;
  } | null>(null);
  const [dualSimulationOutcome, setDualSimulationOutcome] = useState<string | null>(null);

  // Micro-DCA Spare Change Sweeper
  const [dcaEnabled, setDcaEnabled] = useState(true);
  const [dcaMultiplier, setDcaMultiplier] = useState(1);
  const [dcaTargetAsset, setDcaTargetAsset] = useState('SOL');
  const [accumulatedDcaUsdc, setAccumulatedDcaUsdc] = useState(12.45);
  const [simTransactions, setSimTransactions] = useState([
    { id: 'tx-dca-1', merchant: 'Cyber Cafe Express', cost: 4.20, roundup: 0.80 },
    { id: 'tx-dca-2', merchant: 'Synth Grid Subscriptions', cost: 14.50, roundup: 0.50 },
    { id: 'tx-dca-3', merchant: 'Quantum Gas Depot', cost: 32.15, roundup: 0.85 }
  ]);

  // Yield Boosting Artifact socket boosters
  const [artifacts, setArtifacts] = useState<Artifact[]>([
    { id: 'art-1', name: 'Sovereign Chronograph', boost: 1.25, description: 'Accelerates global validator clockspeed by +1.25% APY.', targetAsset: 'GLOBAL', equipped: false, tier: 'Epic' },
    { id: 'art-2', name: 'Prism Flare Core', boost: 2.10, description: 'Enhances Solana pipeline transactions by +2.10% SOL APY.', targetAsset: 'SOL', equipped: false, tier: 'Relic' },
    { id: 'art-3', name: 'Quantum Ledger Seal', boost: 2.85, description: 'Locks down DOT staking telemetry by +2.85% DOT APY.', targetAsset: 'DOT', equipped: false, tier: 'Cosmic' }
  ]);

  // Cross-Asset Yield Router
  const [routingInProcess, setRoutingInProcess] = useState(false);
  const [routeSteps, setRouteSteps] = useState<string[]>([]);
  const [routerSelectedPool, setRouterSelectedPool] = useState('Lido');

  // Crypto Academy Courses
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 'course-1',
      title: 'How does earning rewards (Staking) work?',
      description: 'Learn the super simple concept of locking coins to keep the crypto world safe, and getting bonus coins as a thank-you!',
      rewardNex: 15,
      durationMin: 3,
      completed: false,
      questions: [
        {
          question: 'What is Staking in plain English?',
          options: ['Lending your laptop to someone', 'Temporarily locking your digital coins to help keep the network safe', 'Playing computer games to mine blocks'],
          correctIdx: 1
        },
        {
          question: 'Why do you get rewarded with free coins when you stake?',
          options: ['Because you won a lottery', 'As a thank-you gift for helping run the network secure', 'Because of a glitch in the code'],
          correctIdx: 1
        },
        {
          question: 'Can you unlock your coins back to your normal wallet?',
          options: ['No, they are gone forever', 'Yes, you can request them back anytime', 'Only if you pay a huge cash fine'],
          correctIdx: 1
        }
      ]
    },
    {
      id: 'course-2',
      title: 'What is "Auto-Compounding"?',
      description: 'Learn how reinvesting your daily bonuses automatically makes your crypto pile grow way faster over time!',
      rewardNex: 25,
      durationMin: 4,
      completed: false,
      questions: [
        {
          question: 'What is the secret trick of Compound Interest?',
          options: ['Earning bonuses on top of bonuses you already earned', 'Hiding your coins in an offshore bank', 'Waiting 10 years without looking'],
          correctIdx: 0
        },
        {
          question: 'What does our "Auto-Compounding Booster" do for you?',
          options: ['Locks you out of the platform', 'Harvests and reinvests your rewards automatically so you do zero work', 'Buys random meme coins for you'],
          correctIdx: 1
        },
        {
          question: 'Why does compound growth start slow but end massive?',
          options: ['Because of blockchain delivery speeds', 'Because it behaves like a snowball rolling down a hill, gaining size on every turn', 'Because it only works at night'],
          correctIdx: 1
        }
      ]
    }
  ]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // Tax Loss Harvesting
  const [underwaterPositions, setUnderwaterPositions] = useState([
    { id: 'pos-1', asset: 'DOT', buyPrice: 13.80, currentPrice: 9.12, amount: 80, lossUsd: -374.40 },
    { id: 'pos-2', asset: 'LINK', buyPrice: 18.50, currentPrice: 14.20, amount: 45, lossUsd: -193.50 }
  ]);
  const [taxHarvestLogs, setTaxHarvestLogs] = useState<string[]>([]);
  const [taxHarvestComplete, setTaxHarvestComplete] = useState(false);

  // Decay-Protected Safes
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
  const [safeAmount, setSafeAmount] = useState('2');
  const [safeMonths, setSafeMonths] = useState(3);

  // REWARD ACCRUAL LEDGER
  const [accruedRewards, setAccruedRewards] = useState<{ [key: string]: number }>({
    SOL: 0.002841,
    ETH: 0.000724,
    LINK: 0.014291,
    DOT: 0.185293,
  });

  // Calculate APY rates
  const computedAPYRates = useMemo(() => {
    const rates = { ...BASE_APY_RATES };
    
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

    Object.keys(rates).forEach(sym => {
      if (autoCompoundEnabled[sym]) {
        rates[sym] += 1.50; // +1.50% APY boost
      }
    });

    return rates;
  }, [artifacts, autoCompoundEnabled]);

  const selectedAPY = computedAPYRates[selectedSymbol] || 0;

  // Millisecond ticker simulation for Piggy Bank Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setAccruedRewards((prev) => {
        const next = { ...prev };
        Object.keys(computedAPYRates).forEach((symbol) => {
          const staked = stakedBalances[symbol] || 0;
          if (staked > 0) {
            // dynamic reward accumulation ticker
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

  // Combined rewards ticking value in USD
  const totalAccruedUsd = useMemo(() => {
    let totalUsd = 0;
    Object.keys(accruedRewards).forEach(symbol => {
      const asset = assets.find(a => a.symbol === symbol);
      if (asset) {
        totalUsd += accruedRewards[symbol] * asset.price;
      }
    });
    return totalUsd;
  }, [accruedRewards, assets]);

  // Auto-compounding logs ticking simulation
  useEffect(() => {
    if (activeTab !== 'optimizers') return;
    const interval = setInterval(() => {
      const activeSymbols = Object.keys(autoCompoundEnabled).filter(sym => autoCompoundEnabled[sym]);
      if (activeSymbols.length > 0) {
        const randomSym = activeSymbols[Math.floor(Math.random() * activeSymbols.length)];
        const bonusAmt = (Math.random() * 0.0003 + 0.00002).toFixed(6);
        setCompoundLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Booster triggered! Automatically harvested ${randomSym} and reinvested (+${bonusAmt} ${randomSym} compound added).`,
          ...prev.slice(0, 5)
        ]);
        setStakedBalances(prev => ({
          ...prev,
          [randomSym]: prev[randomSym] + parseFloat(bonusAmt)
        }));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [autoCompoundEnabled, activeTab]);

  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStakingError('');

    if (stakeAction === 'stake') {
      const amt = parseFloat(stakeAmount);
      if (isNaN(amt) || amt <= 0) {
        setStakingError('Write a valid number of coins to grow.');
        return;
      }

      const available = balances[selectedSymbol] || 0;
      if (amt > available) {
        setStakingError(`Oops! You only have ${available.toFixed(4)} ${selectedSymbol} in your active wallet.`);
        return;
      }

      onStake(selectedSymbol, amt);
      setStakeAmount('1');
      onNotification('success', `Deposited ${amt.toFixed(4)} ${selectedSymbol} into your growing Piggy Bank! APY is now active.`);
    } else {
      const amt = parseFloat(unstakeAmount);
      if (isNaN(amt) || amt <= 0) {
        setStakingError('Write a valid number of coins to reclaim.');
        return;
      }

      const staked = stakedBalances[selectedSymbol] || 0;
      if (amt > staked) {
        setStakingError(`Oops! You only have ${staked.toFixed(4)} ${selectedSymbol} growing inside the Piggy Bank.`);
        return;
      }

      onUnstake(selectedSymbol, amt);
      setUnstakeAmount('1');
      onNotification('info', `Successfully moved ${amt.toFixed(4)} ${selectedSymbol} back into your normal active wallet.`);
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

  const toggleAutoCompound = (sym: string) => {
    setAutoCompoundEnabled(prev => {
      const isActivating = !prev[sym];
      if (isActivating) {
        onNotification('success', `Smart Auto-Compounding activated on ${sym} Piggy Bank!`);
        setCompoundLogs(l => [`[${new Date().toLocaleTimeString()}] Auto-Reinvestment active on ${sym} (+1.50% APY booster applied!).`, ...l]);
      } else {
        onNotification('info', `Turned off auto-compounding on ${sym}.`);
      }
      return { ...prev, [sym]: isActivating };
    });
  };

  const handleMintstAsset = () => {
    const amt = parseFloat(mintAmount);
    if (isNaN(amt) || amt <= 0) {
      onNotification('error', 'Enter a valid amount to mint.');
      return;
    }

    const staked = stakedBalances[mintAsset] || 0;
    if (amt > staked) {
      onNotification('error', `You don't have enough staked ${mintAsset} to mint a tradeable helper asset.`);
      return;
    }

    setStakedBalances(prev => ({ ...prev, [mintAsset]: prev[mintAsset] - amt }));
    const syntheticName = `st${mintAsset}`;
    setStBalances(prev => ({ ...prev, [syntheticName]: (prev[syntheticName] || 0) + amt }));
    setBalances(prev => ({ ...prev, [syntheticName]: (prev[syntheticName] || 0) + amt }));

    setMintAmount('1');
    onNotification('success', `Created ${amt.toFixed(4)} ${syntheticName} Tradeable Helper! Your staking growth rewards continue safely.`);
  };

  const handleBurnstAsset = (stAsset: string) => {
    const amt = stBalances[stAsset] || 0;
    if (amt <= 0) {
      onNotification('error', `You don't own any tradeable ${stAsset}.`);
      return;
    }

    const baseAsset = stAsset.replace('st', '');
    setStBalances(prev => ({ ...prev, [stAsset]: 0 }));
    setBalances(prev => ({ ...prev, [stAsset]: 0 }));
    setStakedBalances(prev => ({ ...prev, [baseAsset]: (prev[baseAsset] || 0) + amt }));
    
    onNotification('info', `Redeemed ${amt.toFixed(4)} ${stAsset} helper! Coins returned to main growing pool.`);
  };

  const handleLockVault = (tierId: string, durationDays: number, rebatePercent: number) => {
    const amountToLock = tierId === 'bronze' ? 100 : tierId === 'silver' ? 500 : 2000;
    const nexBalance = balances['NEX'] || 0;

    if (nexBalance < amountToLock) {
      onNotification('error', `Oops! You need ${amountToLock} NEX tokens. You currently have ${nexBalance.toFixed(2)} NEX.`);
      return;
    }

    setBalances(prev => ({ ...prev, NEX: prev['NEX'] - amountToLock }));
    setFeeDiscount(rebatePercent);

    const newSafe = {
      id: `lock-${Math.random().toString(36).substr(2, 5)}`,
      asset: 'NEX',
      amount: amountToLock,
      unlockDate: new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString().split('T')[0],
      timeRemaining: `${durationDays} Days`,
      status: 'locked' as const
    };
    setSafes(prev => [...prev, newSafe]);

    onNotification('success', `Locked! Activated a permanent ${rebatePercent}% discount on platform fee buffers!`);
  };

  const handleSubscribeDual = () => {
    const amt = parseFloat(dualSubAmount);
    if (isNaN(amt) || amt <= 0) {
      onNotification('error', 'Please write a valid amount to invest.');
      return;
    }

    const fundingAsset = dualSelectedProduct === 'SOL-LOW' ? 'USDC' : 'ETH';
    const fundingBalance = balances[fundingAsset] || 0;

    if (amt > fundingBalance) {
      onNotification('error', `You don't have enough ${fundingAsset} in your active wallet.`);
      return;
    }

    setBalances(prev => ({ ...prev, [fundingAsset]: prev[fundingAsset] - amt }));

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

    setDualSubAmount('50');
    setDualSimulationOutcome(null);
    onNotification('success', `Position locked. Contract will settle depending on expiry thresholds!`);
  };

  const handleSimulateDualExpiry = (forceOutcome: 'STRIKE_HIT' | 'STRIKE_MISSED') => {
    if (!dualActiveSub) return;

    const principal = dualActiveSub.amount;
    const interest = principal * (dualActiveSub.apy / 100) * (3 / 365);
    const totalPayoutUsdc = principal + interest;

    if (dualActiveSub.type === 'low') {
      if (forceOutcome === 'STRIKE_HIT') {
        const solQty = totalPayoutUsdc / dualActiveSub.strikePrice;
        setBalances(prev => ({ ...prev, SOL: (prev['SOL'] || 0) + solQty }));
        setDualSimulationOutcome(`Settle result: SOL Price hit your trigger. Converted your USDC into ${solQty.toFixed(4)} SOL with a high APY bonus!`);
      } else {
        setBalances(prev => ({ ...prev, USDC: (prev['USDC'] || 0) + totalPayoutUsdc }));
        setDualSimulationOutcome(`Settle result: SOL stayed above target. Returned your USDC principal + bonus rewards totaling $${totalPayoutUsdc.toFixed(2)} USDC!`);
      }
    } else {
      if (forceOutcome === 'STRIKE_HIT') {
        const ethQty = principal * (1 + (dualActiveSub.apy / 100) * (3 / 365));
        const payoutUsdc = ethQty * dualActiveSub.strikePrice;
        setBalances(prev => ({ ...prev, USDC: (prev['USDC'] || 0) + payoutUsdc }));
        setDualSimulationOutcome(`Settle result: ETH shot up past strike. Auto-sold your ETH into $${payoutUsdc.toFixed(2)} USDC with top-tier profit APY!`);
      } else {
        const totalEthPayout = principal * (1 + (dualActiveSub.apy / 100) * (3 / 365));
        setBalances(prev => ({ ...prev, ETH: (prev['ETH'] || 0) + totalEthPayout }));
        setDualSimulationOutcome(`Settle result: ETH stayed low. You keep your ETH coins plus high-yield bonus payout of ${totalEthPayout.toFixed(5)} ETH!`);
      }
    }

    setDualActiveSub(null);
    onNotification('success', 'Position cleared and assets paid back!');
  };

  const triggerSimulatedCardSpend = () => {
    const merchants = ['Starbucks Coffee', 'Retro Cinema', 'Steam Games', 'Tesla Charger', 'Cyber Diner'];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const cost = parseFloat((Math.random() * 15 + 2).toFixed(2));
    const nextWhole = Math.ceil(cost);
    const roundup = parseFloat((nextWhole - cost).toFixed(2));
    const finalRoundup = roundup === 0 ? 1.00 : roundup;

    const addition = finalRoundup * dcaMultiplier;

    const currentUsdc = balances['USDC'] || 0;
    if (currentUsdc < addition) {
      onNotification('error', 'Spare Change collection failed: You need more USDC cash in wallet.');
      return;
    }

    setBalances(prev => ({ ...prev, USDC: prev['USDC'] - addition }));
    setAccumulatedDcaUsdc(prev => prev + addition);

    const newTx = {
      id: `tx-dca-${Math.floor(Math.random() * 10000)}`,
      merchant,
      cost,
      roundup: finalRoundup
    };

    setSimTransactions(prev => [newTx, ...prev.slice(0, 3)]);
    onNotification('success', `DCA Rounded up! Collected $${finalRoundup.toFixed(2)} from your $${cost.toFixed(2)} spend at ${merchant}!`);
  };

  const executeDcaPurchase = () => {
    if (accumulatedDcaUsdc <= 0) return;
    const currentSaved = accumulatedDcaUsdc;
    const rate = dcaTargetAsset === 'SOL' ? 145.25 : dcaTargetAsset === 'NEX' ? 2.50 : 3240.00;
    const bought = currentSaved / rate;

    setBalances(prev => ({
      ...prev,
      [dcaTargetAsset]: (prev[dcaTargetAsset] || 0) + bought
    }));

    setAccumulatedDcaUsdc(0);
    onNotification('success', `Executed! Converted your accumulated $${currentSaved.toFixed(2)} spare change into ${bought.toFixed(4)} ${dcaTargetAsset}!`);
  };

  const toggleArtifact = (artId: string) => {
    setArtifacts(prev => prev.map(art => {
      if (art.id === artId) {
        const nextState = !art.equipped;
        if (nextState) {
          onNotification('success', `Socketed ${art.name}! Growth APY speed boosted by +${art.boost}%!`);
        } else {
          onNotification('info', `Removed ${art.name} from booster slot.`);
        }
        return { ...art, equipped: nextState };
      }
      return art;
    }));
  };

  const handleCrossAssetRoute = () => {
    setRoutingInProcess(true);
    setRouteSteps([]);

    const steps = [
      `Scanning other decentralized staking networks for optimal rewards...`,
      `Liquidating old, slow rewards elsewhere to merge into Nexus...`,
      `Bridging and routing assets via gas-optimized shortcuts...`,
      `Locked into Nexus smart compounding vault! Boosted your yield APY safely.`
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setRouteSteps(prev => [...prev, step]);
        if (index === steps.length - 1) {
          setRoutingInProcess(false);
          onNotification('success', `Re-routing done! Coins migrated to Nexus for maximized compounding returns.`);
          setAutoCompoundEnabled(prev => ({ ...prev, [selectedSymbol]: true }));
        }
      }, (index + 1) * 800);
    });
  };

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
      const finalScore = quizScore + (isCorrect ? 1 : 0);
      const passed = finalScore === course.questions.length;

      if (passed) {
        setBalances(prev => ({ ...prev, NEX: (prev['NEX'] || 0) + course.rewardNex }));
        setCourses(prev => prev.map(c => c.id === course.id ? { ...c, completed: true } : c));
        onNotification('success', `Perfect Score! You passed! Grab your learn-and-earn grant of ${course.rewardNex} NEX! 🎉`);
      } else {
        onNotification('error', `You got ${finalScore}/${course.questions.length} correct. Take a quick review and try again, you can do it!`);
      }
      setActiveCourseId(null);
    }
  };

  const handleExecuteTaxHarvest = () => {
    if (underwaterPositions.length === 0) return;
    setTaxHarvestLogs([]);
    setTaxHarvestComplete(false);

    const steps = [
      'Scanning for underperforming coin positions to swap out...',
      'Identified eligible positions (DOT, LINK) sitting on paper losses.',
      'Crystallizing $567.90 of capital tax savings with one click...',
      'Proceeds instantly re-deployed back into corresponding stAssets so you keep 100% market exposure!',
      'Tax savings locked! Your capital gain liability reduced by $567.90 while you hold the position.'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setTaxHarvestLogs(prev => [...prev, step]);
        if (index === steps.length - 1) {
          setBalances(prev => ({
            ...prev,
            stSOL: (prev['stSOL'] || 0) + 12,
            USDC: (prev['USDC'] || 0) + 1200
          }));
          setUnderwaterPositions([]);
          setTaxHarvestComplete(true);
          onNotification('success', 'Tax Savings Harvester done! Loss registered and stAssets re-staked.');
        }
      }, (index + 1) * 700);
    });
  };

  const handleLockSafeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(safeAmount);

    if (isNaN(amt) || amt <= 0) {
      onNotification('error', 'Enter a valid number of coins to lock.');
      return;
    }

    const available = balances[safeAsset] || 0;
    if (amt > available) {
      onNotification('error', `Oops! You only have ${available.toFixed(4)} ${safeAsset} in your active wallet.`);
      return;
    }

    setBalances(prev => ({ ...prev, [safeAsset]: prev[safeAsset] - amt }));

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
    setSafeAmount('1');
    onNotification('success', `Coins locked away securely in decentralized Time-Lock Safe! They will return on ${dateStr}.`);
  };

  const handleUnlockSafe = (safeId: string) => {
    const safe = safes.find(s => s.id === safeId);
    if (!safe) return;

    if (safe.status === 'locked') {
      onNotification('error', `⚠️ Decay Protection Active! Safe is physically locked until ${safe.unlockDate} to help you avoid emotional panic-selling.`);
      return;
    }

    setBalances(prev => ({ ...prev, [safe.asset]: (prev[safe.asset] || 0) + safe.amount }));
    setSafes(prev => prev.filter(s => s.id !== safeId));
    onNotification('success', `Unlocked safe! Restored ${safe.amount} ${safe.asset} to spot wallet.`);
  };

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
    if (feeDiscount >= 60) return '🏅 Gold Vault Master (-60% Fees)';
    if (feeDiscount >= 35) return '🥈 Silver Vault Guardian (-35% Fees)';
    if (feeDiscount >= 15) return '🥉 Bronze Locker Advocate (-15% Fees)';
    return 'Standard Level (0% Discount)';
  }, [feeDiscount]);

  return (
    <div className="space-y-6">
      
      {/* MONSTER LIVE PIGGY BANK TICKER BANNER */}
      <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 border border-slate-900 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Smile className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="space-y-3 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-900/50 px-3.5 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-sans font-bold text-emerald-400">My Growing Piggy Bank Live 🐷</span>
          </div>
          <h2 className="text-2xl font-sans font-extrabold text-white tracking-tight">
            Earn Free Bonus Coins While You Hold!
          </h2>
          <p className="text-xs text-slate-300 font-sans max-w-xl leading-relaxed">
            Staking is like a digital savings account for crypto. Lock your coins to support the network, and watch your balance grow automatically every single second!
          </p>
        </div>

        {/* Live Millisecond Ticker Card */}
        <div className="p-6 bg-slate-950/80 border border-slate-850 rounded-2xl text-center min-w-[260px] relative z-10 shadow-lg flex flex-col items-center">
          <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider font-bold">Accumulated Growth Rewards</span>
          <div className="text-2xl font-mono font-bold text-emerald-400 my-2 tracking-wide flex items-center justify-center gap-1.5">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
            <span>${totalAccruedUsd.toFixed(6)}</span>
          </div>
          <span className="text-[9px] font-sans text-slate-500 animate-pulse font-medium">Ticking up live by the millisecond...</span>
        </div>
      </div>

      {/* BIG ACCESSIBLE TAB SWITCHERS */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950/40 border border-slate-900 rounded-2xl">
        {[
          { id: 'flexible', label: '🌱 Grow My Coins (Staking)', icon: Coins },
          { id: 'optimizers', label: '🚀 Auto-Compounding Boosters', icon: Zap },
          { id: 'lockers', label: '🔒 Time-Locked Piggy Banks', icon: Lock },
          { id: 'structured', label: '⚖️ Tax Savings & Dual Contracts', icon: Layers },
          { id: 'academy', label: '🎓 Crypto Academy & Spare Change', icon: GraduationCap }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`earn-tab-${tab.id}`}
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setStakingError(''); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-sans font-bold transition cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-cyan-400 border border-slate-850 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* GENERAL SAVINGS CARD METRICS PASSBOOK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
          <span className="text-[10px] font-sans text-slate-500 block font-bold uppercase">My Total Staked Balance</span>
          <span className="text-xl font-mono font-bold text-white mt-1 block">
            ${totalStakedValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1.5">This crypto is safely isolated and earning yield!</span>
        </div>

        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
          <span className="text-[10px] font-sans text-slate-500 block font-bold uppercase">Transaction Fee Rebate Tier</span>
          <span className="text-xs font-sans font-bold text-emerald-400 mt-2 block">{activeRebateTier}</span>
          <span className="text-[10px] text-slate-400 block mt-1.5">You enjoy scaled reductions across all order desks!</span>
        </div>

        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
          <span className="text-[10px] font-sans text-slate-500 block font-bold uppercase">Spare Change Sweep Cache</span>
          <span className="text-xl font-mono font-bold text-cyan-400 mt-1 block">${accumulatedDcaUsdc.toFixed(2)} USDC</span>
          <button 
            id="btn-execute-dca-buy"
            onClick={executeDcaPurchase}
            disabled={accumulatedDcaUsdc <= 0}
            className="text-[10px] font-sans text-cyan-400 hover:text-cyan-300 font-bold transition mt-1.5 block cursor-pointer disabled:opacity-50"
          >
            Convert cache into coins now ❯
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: CORE STAKING (GROW COINS) */}
        {activeTab === 'flexible' && (
          <motion.div
            key="flexible"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-8 space-y-6">
              
              <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-5">
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    Available Growth Pools
                  </h3>
                  <span className="text-[10px] font-sans text-slate-400 font-bold">CHOOSE COIN TO GROW</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(BASE_APY_RATES).map((symbol) => {
                    const asset = assets.find(a => a.symbol === symbol);
                    const apy = computedAPYRates[symbol];
                    const isSelected = selectedSymbol === symbol;
                    const stakedAmount = stakedBalances[symbol] || 0;

                    if (!asset) return null;

                    return (
                      <button
                        id={`stake-pool-${symbol}`}
                        key={symbol}
                        onClick={() => { setSelectedSymbol(symbol); setStakingError(''); }}
                        className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/15' 
                            : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-sans font-extrabold text-white">{symbol}</span>
                            <span className="text-[10px] font-sans text-slate-500">{asset.name}</span>
                          </div>
                          <span className="px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-900/40 text-emerald-400 rounded-xl text-[10px] font-sans font-bold">
                            Grow +{apy.toFixed(2)}% yearly
                          </span>
                        </div>

                        <div className="space-y-1 text-xs font-sans">
                          <div className="flex justify-between text-slate-400">
                            <span>Ready in wallet:</span>
                            <span className="text-slate-300 font-mono">{(balances[symbol] || 0).toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Staked growing balance:</span>
                            <span className={`${stakedAmount > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'} font-mono`}>
                              {stakedAmount.toFixed(4)}
                            </span>
                          </div>
                        </div>

                        {artifacts.some(a => a.equipped && (a.targetAsset === 'GLOBAL' || a.targetAsset === symbol)) && (
                          <div className="mt-2.5 pt-2 border-t border-slate-900/40 flex items-center gap-1.5 text-[9px] font-sans text-cyan-400 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            Active Socket Booster Equipped!
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Socket Boosters */}
              <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                    Secure Validator Growth Boosters
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
                    Obtained some rare platform boosters? Place them in your validator socket slots to instantly speed up your daily staking compound rate!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                  {artifacts.map((art) => (
                    <div 
                      key={art.id} 
                      className={`p-4 rounded-2xl border flex flex-col justify-between ${
                        art.equipped 
                          ? 'bg-cyan-950/20 border-cyan-500/50' 
                          : 'bg-slate-900/40 border-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">{art.name}</span>
                          <span className={`text-[9px] font-sans px-2 py-0.5 rounded-full ${
                            art.tier === 'Cosmic' 
                              ? 'bg-purple-950 text-purple-400 border border-purple-900/40' 
                              : art.tier === 'Relic' 
                              ? 'bg-amber-950 text-amber-400 border border-amber-900/40' 
                              : 'bg-cyan-950 text-cyan-400 border border-cyan-900/40'
                          }`}>
                            {art.tier}
                          </span>
                        </div>
                        <p className="text-[10px] font-sans text-slate-300 leading-normal">
                          {art.description}
                        </p>
                        <div className="mt-3 text-[10px] font-sans font-bold text-emerald-400">
                          Speed Boost: +{art.boost.toFixed(2)}% APY
                        </div>
                      </div>

                      <button
                        id={`btn-equip-artifact-${art.id}`}
                        onClick={() => toggleArtifact(art.id)}
                        className={`w-full py-2 text-[10px] font-sans font-bold rounded-xl mt-4 cursor-pointer transition ${
                          art.equipped 
                            ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800' 
                            : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-850'
                        }`}
                      >
                        {art.equipped ? '⚡ Socketed (On)' : 'Equip Booster'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side desk: deposit/withdrawal */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                <form onSubmit={handleStakeSubmit} className="space-y-4">
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-900">
                    <button
                      id="stake-action-deposit"
                      type="button"
                      onClick={() => { setStakeAction('stake'); setStakingError(''); }}
                      className={`flex-1 py-2 text-xs font-sans font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        stakeAction === 'stake' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Grow Coins
                    </button>
                    <button
                      id="stake-action-withdraw"
                      type="button"
                      onClick={() => { setStakeAction('unstake'); setStakingError(''); }}
                      className={`flex-1 py-2 text-xs font-sans font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        stakeAction === 'unstake' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Unlock className="w-3.5 h-3.5 text-slate-400" />
                      Reclaim Coins
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-sans text-slate-500 font-bold uppercase">Coin Chosen</span>
                      <span className="font-sans font-extrabold text-white">{selectedSymbol} Pool</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-900/50 pt-2">
                      <span className="font-sans text-slate-500 font-bold uppercase">Growth Speed</span>
                      <span className="font-mono font-bold text-emerald-400">+{selectedAPY.toFixed(2)}% Yearly APY</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-900/50 pt-2">
                      <span className="font-sans text-slate-500 font-bold uppercase">Active Wallet</span>
                      <span className="font-mono text-slate-300">{(balances[selectedSymbol] || 0).toFixed(4)} {selectedSymbol}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-900/50 pt-2">
                      <span className="font-sans text-slate-500 font-bold uppercase">Staked growing</span>
                      <span className="font-mono text-emerald-400 font-extrabold">{(stakedBalances[selectedSymbol] || 0).toFixed(4)} {selectedSymbol}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-sans">
                      <label className="text-slate-400 font-bold">{stakeAction === 'stake' ? 'Coins to Grow' : 'Coins to Reclaim'}</label>
                      <button
                        id="stake-max-btn"
                        type="button"
                        onClick={handleMaxClick}
                        className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-bold"
                      >
                        Use Max
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="stake-amount-input"
                        type="number"
                        step="any"
                        placeholder="e.g. 1.0"
                        value={stakeAction === 'stake' ? stakeAmount : unstakeAmount}
                        onChange={(e) => {
                          if (stakeAction === 'stake') {
                            setStakeAmount(e.target.value);
                          } else {
                            setUnstakeAmount(e.target.value);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-sans text-slate-500 font-bold">{selectedSymbol}</span>
                    </div>
                  </div>

                  {stakingError && (
                    <p className="text-xs font-sans text-red-400 font-bold bg-red-950/25 border border-red-900/40 p-2.5 rounded-lg">⚠️ {stakingError}</p>
                  )}

                  <button
                    id="stake-submit-btn"
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-lg transition tracking-wide cursor-pointer uppercase"
                  >
                    {stakeAction === 'stake' ? 'Confirm Grow Order 🌱' : 'Confirm Reclaim Order 🔓'}
                  </button>
                </form>
              </div>

              {/* Liquid Staking derivatives */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-xs font-bold font-sans tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Liquid Tradeable Helper Coins
                  </h4>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">
                    Want to keep tradeability? Mint representative helper assets 1:1 against your staked coins. You earn growth bonuses silently while holding a highly liquid token!
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-900 text-xs">
                    <button
                      id="mint-tab-sol"
                      type="button"
                      onClick={() => setMintAsset('SOL')}
                      className={`flex-1 py-1.5 font-sans font-bold rounded-lg transition-all cursor-pointer ${
                        mintAsset === 'SOL' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      SOL ➔ stSOL helper
                    </button>
                    <button
                      id="mint-tab-eth"
                      type="button"
                      onClick={() => setMintAsset('ETH')}
                      className={`flex-1 py-1.5 font-sans font-bold rounded-lg transition-all cursor-pointer ${
                        mintAsset === 'ETH' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      ETH ➔ stETH helper
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2 text-[11px] font-sans">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Staked {mintAsset}:</span>
                      <span className="text-slate-300 font-mono">{(stakedBalances[mintAsset] || 0).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Helper Coin Balance:</span>
                      <span className="text-cyan-400 font-bold font-mono">{(stBalances[`st${mintAsset}`] || 0).toFixed(4)} st{mintAsset}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id="mint-derivative-input"
                        type="number"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-500 font-bold">{mintAsset}</span>
                    </div>
                    <button
                      id="btn-mint-derivative"
                      onClick={handleMintstAsset}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-sans font-bold rounded-lg transition cursor-pointer"
                    >
                      Mint Helper
                    </button>
                  </div>

                  {stBalances[`st${mintAsset}`] > 0 && (
                    <button
                      id="btn-burn-derivative"
                      onClick={() => handleBurnstAsset(`st${mintAsset}`)}
                      className="w-full py-2 bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 text-xs font-sans font-bold rounded-xl transition cursor-pointer"
                    >
                      Redeem st{mintAsset} back to normal staking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: YIELD OPTIMIZERS (AUTO-COMPOUND BOOSTERS) */}
        {activeTab === 'optimizers' && (
          <motion.div
            key="optimizers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Auto-Compounding Piggy Bank Boosters 🚀
                  </h3>
                  <span className="text-[10px] font-sans text-slate-500 bg-slate-900 px-2.5 py-1 rounded-full font-bold">AUTOMATED MAGIC</span>
                </div>

                <p className="text-xs font-sans text-slate-400 mb-6 leading-relaxed">
                  Normally, you have to claim your growth rewards and lock them back in yourself. Our background scripts do this for you at peak mathematical intervals, multiplying your returns automatically without you lifting a finger!
                </p>

                <div className="space-y-4">
                  {Object.keys(BASE_APY_RATES).map((sym) => {
                    const isEnabled = autoCompoundEnabled[sym];
                    const baseApy = computedAPYRates[sym];
                    const activeStake = stakedBalances[sym] || 0;

                    return (
                      <div 
                        key={sym} 
                        className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                            <span className="text-xs font-sans font-bold text-cyan-400">🪙 {sym}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-sans font-bold text-white">{sym} Auto-Compounder</span>
                              <span className="text-[9px] font-sans px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 font-bold">
                                APY Speeded up! +1.50%
                              </span>
                            </div>
                            <p className="text-[10px] font-sans text-slate-400 mt-1">
                              My active growing coins: {activeStake.toFixed(4)} {sym} • Growth speed: {baseApy.toFixed(2)}% APY
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block font-sans">
                            <span className="text-[9px] text-slate-500 uppercase block font-bold">Reinvestment frequency</span>
                            <span className="text-xs font-bold text-slate-300 font-mono">Every 4.2 hours</span>
                          </div>

                          <button
                            id={`btn-toggle-compound-${sym}`}
                            onClick={() => toggleAutoCompound(sym)}
                            className={`px-3 py-1.5 text-xs font-sans font-bold rounded-lg transition cursor-pointer ${
                              isEnabled 
                                ? 'bg-emerald-500 text-slate-950' 
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850'
                            }`}
                          >
                            {isEnabled ? 'ON ✅' : 'ACTIVATE'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live compounder logs */}
              <div className="mt-6 p-4 bg-slate-950 border border-slate-900 rounded-2xl font-sans text-[10px]">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 text-emerald-400">
                  <span className="flex items-center gap-1.5 font-bold uppercase">
                    <Activity className="w-3.5 h-3.5" />
                    Automated Growth Bot Log feed
                  </span>
                  <span className="text-slate-500 animate-pulse font-bold">● ACTIVE AGENT RUNNING</span>
                </div>
                <div className="space-y-1 text-slate-400 max-h-36 overflow-y-auto">
                  {compoundLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-1 font-mono text-[9px]">
                      <span className="text-emerald-500">❯</span>
                      <span className="leading-normal">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* One click relocation */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-3xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-cyan-400 animate-pulse" />
                    One-Click Yield Relocation Optimizer
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
                    Tired of manual deposits across external staking services like Lido or Aave? Our scanner compares rates and moves your deposits to Nexus in 1-click for maximum speed rewards!
                  </p>
                </div>

                <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-3">
                  <label className="text-xs font-sans text-slate-400 uppercase font-bold">Staked asset to optimize:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['SOL', 'ETH', 'LINK', 'DOT'].map(sym => (
                      <button
                        id={`btn-router-sym-${sym}`}
                        key={sym}
                        onClick={() => setSelectedSymbol(sym)}
                        className={`py-1.5 text-xs font-sans font-bold rounded-lg transition cursor-pointer ${
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
                    <label className="text-[10px] font-sans text-slate-500 uppercase font-bold">Select external site to pull from:</label>
                    <select
                      id="select-router-source"
                      value={routerSelectedPool}
                      onChange={(e) => setRouterSelectedPool(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl p-2.5 text-xs font-sans font-bold text-white mt-1"
                    >
                      <option value="Lido">Lido Finance Pool ({selectedSymbol === 'ETH' ? '3.85%' : '5.10%'} APY)</option>
                      <option value="Aave">Aave Lending Vault ({selectedSymbol === 'ETH' ? '2.90%' : '4.20%'} APY)</option>
                      <option value="RocketPool">RocketPool Validator ({selectedSymbol === 'ETH' ? '4.05%' : '5.30%'} APY)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl space-y-2 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-400">External Pool yield:</span>
                    <span className="text-slate-400 font-semibold">{routerSelectedPool === 'Lido' ? '3.85%' : '2.90%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nexus Optimizing yield:</span>
                    <span className="text-emerald-400 font-bold">+{computedAPYRates[selectedSymbol].toFixed(2)}% APY</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-1.5">
                    <span className="text-cyan-400 font-bold">Speed Improvement:</span>
                    <span className="text-cyan-400 font-bold">+{Math.max(0.5, computedAPYRates[selectedSymbol] - 4).toFixed(2)}% APY</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button
                  id="btn-trigger-cross-route"
                  onClick={handleCrossAssetRoute}
                  disabled={routingInProcess}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-xs font-sans font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                >
                  {routingInProcess ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Optimizing routes...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      Migrate to Nexus & Boost APY! 🚀
                    </>
                  )}
                </button>

                {routeSteps.length > 0 && (
                  <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl text-[10px] font-sans text-slate-400 space-y-1">
                    {routeSteps.map((step, i) => (
                      <div key={i} className="flex gap-1.5">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: LOCKS & SAFES (TIME-LOCKED PIGGY BANKS) */}
        {activeTab === 'lockers' && (
          <motion.div
            key="lockers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-cyan-400" />
                    NEX Token Locks & Global Fee reductions!
                  </h3>
                  <span className="text-[10px] font-sans text-slate-400 font-bold uppercase">Reward center</span>
                </div>

                <p className="text-xs font-sans text-slate-400 mb-6 leading-relaxed">
                  Support the platform by locking **NEX** utility tokens for a few months. In return, we will scale down your transaction fee buffer rates globally! It is a win-win gamified growth engine.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'bronze', name: 'Bronze Locker', amount: 100, days: 30, rebate: 15, bg: 'from-amber-950/20 to-amber-900/10', border: 'border-amber-900/40', text: 'text-amber-400' },
                    { id: 'silver', name: 'Silver Guardian', amount: 500, days: 90, rebate: 35, bg: 'from-slate-900/30 to-slate-800/10', border: 'border-slate-800/60', text: 'text-slate-300' },
                    { id: 'gold', name: 'Gold Vault Master', amount: 2000, days: 365, rebate: 60, bg: 'from-cyan-950/30 to-teal-950/20', border: 'border-cyan-800/40', text: 'text-cyan-400' }
                  ].map((tier) => (
                    <div 
                      key={tier.id} 
                      className={`p-5 rounded-2xl border bg-gradient-to-b ${tier.bg} ${tier.border} flex flex-col justify-between space-y-4 shadow-md`}
                    >
                      <div>
                        <span className={`text-xs font-sans font-bold uppercase block ${tier.text}`}>{tier.name}</span>
                        <div className="mt-2">
                          <span className="text-xl font-mono font-bold text-white">{tier.amount} NEX</span>
                          <span className="text-[9px] font-sans text-slate-500 block">Balance to freeze</span>
                        </div>
                        <div className="mt-3 space-y-1 text-[11px] font-sans text-slate-300">
                          <div>• Lock duration: <strong>{tier.days} Days</strong></div>
                          <div>• Fee reduction: <strong className="text-emerald-400">-{tier.rebate}% globally</strong></div>
                        </div>
                      </div>

                      <button
                        id={`btn-lock-tier-${tier.id}`}
                        onClick={() => handleLockVault(tier.id, tier.days, tier.rebate)}
                        className={`w-full py-2 text-[10px] font-sans font-bold rounded-xl cursor-pointer transition ${
                          feeDiscount >= tier.rebate 
                            ? 'bg-emerald-500 text-slate-950' 
                            : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-850'
                        }`}
                      >
                        {feeDiscount >= tier.rebate ? 'Active Lock ✅' : 'Freeze & Lock NEX'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3 mt-6 text-xs text-slate-400">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-300 font-sans">Sovereign locked custody info</p>
                  <p className="mt-1 font-sans text-[10px] text-slate-400">
                    Your locked tokens stay 100% yours, they are just frozen safely. Your current active fee buffer discount is: <strong className="text-emerald-400">{feeDiscount}% Global Reduction</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Impulse lock safe */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-3xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    Decay-Protected Impulse Safes 🔒
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
                    Need self-discipline? Lock some coins in this smart-contract lockbox. It physically blocks withdrawals until your target milestone date. The perfect tool to prevent emotional panic selling!
                  </p>
                </div>

                <form onSubmit={handleLockSafeSubmit} className="space-y-4 p-4 bg-slate-900/20 border border-slate-900 rounded-2xl">
                  <span className="text-[10px] font-sans text-slate-500 block font-bold uppercase">Setup lockbox</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                    <div>
                      <label className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Coin to lock</label>
                      <select
                        id="select-safe-asset"
                        value={safeAsset}
                        onChange={(e) => setSafeAsset(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-white"
                      >
                        <option value="SOL">SOL</option>
                        <option value="ETH">ETH</option>
                        <option value="LINK">LINK</option>
                        <option value="DOT">DOT</option>
                        <option value="NEX">NEX</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Lock time</label>
                      <select
                        id="select-safe-months"
                        value={safeMonths}
                        onChange={(e) => setSafeMonths(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-white"
                      >
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">1 Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block uppercase font-bold">Amount to lock</label>
                    <div className="relative">
                      <input
                        id="input-safe-amount"
                        type="number"
                        placeholder="0.0"
                        value={safeAmount}
                        onChange={(e) => setSafeAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-500 font-bold">{safeAsset}</span>
                    </div>
                  </div>

                  <button
                    id="btn-confirm-safe-lock"
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-xs font-sans font-bold rounded-xl transition"
                  >
                    Lock coins securely 🔒
                  </button>
                </form>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-sans text-slate-500 uppercase font-bold block">My active safes</span>
                  {safes.map(safe => (
                    <div key={safe.id} className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-sans font-extrabold text-white">{safe.amount} {safe.asset}</span>
                        <div className="flex items-center gap-1 text-[9px] font-sans text-slate-500 mt-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Release date: {safe.unlockDate}</span>
                        </div>
                      </div>

                      <button
                        id={`btn-unlock-safe-${safe.id}`}
                        onClick={() => handleUnlockSafe(safe.id)}
                        className={`px-3 py-1 text-[9px] font-sans font-bold rounded-lg transition cursor-pointer ${
                          safe.status === 'locked' 
                            ? 'bg-red-950/25 text-red-400 border border-red-900/40 hover:border-red-500' 
                            : 'bg-emerald-500 text-slate-950'
                        }`}
                      >
                        {safe.status === 'locked' ? 'TRY TO UNLOCK' : 'RECLAIM NOW'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: STRUCTURED DUALS & TAX-LOSS */}
        {activeTab === 'structured' && (
          <motion.div
            key="structured"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Dual-Payout Growth Contracts ⚖️
                  </h3>
                  <span className="text-[10px] font-sans text-slate-400 font-bold uppercase">Hedged options</span>
                </div>

                <p className="text-xs font-sans text-slate-400 mb-6 leading-relaxed">
                  Dual growth contracts let you earn giant bonus APY rates. You deposit one asset, and at settlement, you receive your principal plus massive interest paid out in either USD cash or crypto, depending on price action. It is a fantastic win-win strategy for stable growth!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    id="btn-dual-sol-low"
                    onClick={() => setDualSelectedProduct('SOL-LOW')}
                    className={`p-4 rounded-2xl text-left border cursor-pointer transition ${
                      dualSelectedProduct === 'SOL-LOW' 
                        ? 'bg-slate-900 border-cyan-500/50' 
                        : 'bg-slate-950/60 border-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2 font-sans">
                      <span className="text-xs font-bold text-white">SOL Buy-Low Contract</span>
                      <span className="text-[10px] text-emerald-400 font-bold">68.2% APY</span>
                    </div>
                    <div className="space-y-1 text-[11px] font-sans text-slate-400">
                      <div>• Price limit: <strong>$135.00 USDC</strong></div>
                      <div>• Lock duration: <strong>3 Days</strong></div>
                      <div>• You fund with: <strong>USDC Cash</strong></div>
                    </div>
                  </button>

                  <button
                    id="btn-dual-eth-high"
                    onClick={() => setDualSelectedProduct('ETH-HIGH')}
                    className={`p-4 rounded-2xl text-left border cursor-pointer transition ${
                      dualSelectedProduct === 'ETH-HIGH' 
                        ? 'bg-slate-900 border-cyan-500/50' 
                        : 'bg-slate-950/60 border-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2 font-sans">
                      <span className="text-xs font-bold text-white">ETH Sell-High Contract</span>
                      <span className="text-[10px] text-emerald-400 font-bold">84.5% APY</span>
                    </div>
                    <div className="space-y-1 text-[11px] font-sans text-slate-400">
                      <div>• Price limit: <strong>$3,450.00 USDC</strong></div>
                      <div>• Lock duration: <strong>3 Days</strong></div>
                      <div>• You fund with: <strong>ETH Coins</strong></div>
                    </div>
                  </button>
                </div>

                <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl mt-6 space-y-4">
                  <div className="flex justify-between items-center text-xs font-sans font-bold">
                    <span className="text-slate-400">Locked Capital investment:</span>
                    <span className="text-slate-500">From wallet: {dualSelectedProduct === 'SOL-LOW' ? 'USDC' : 'ETH'}</span>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        id="input-dual-amount"
                        type="number"
                        value={dualSubAmount}
                        onChange={(e) => setDualSubAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-500 font-bold">
                        {dualSelectedProduct === 'SOL-LOW' ? 'USDC' : 'ETH'}
                      </span>
                    </div>
                    <button
                      id="btn-submit-dual"
                      onClick={handleSubscribeDual}
                      className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-sans font-bold rounded-lg transition"
                    >
                      Subscribe & Lock
                    </button>
                  </div>
                </div>
              </div>

              {/* Settlement simulation lab */}
              {dualActiveSub && (
                <div className="mt-6 p-4 bg-slate-950 border border-cyan-900/30 rounded-2xl space-y-3">
                  <span className="text-[10px] font-sans text-cyan-400 font-bold uppercase block">Dual contract settlement simulator</span>
                  <p className="text-xs text-slate-300 font-sans leading-normal">
                    You have locked **{dualActiveSub.amount} {dualActiveSub.underlying}** in the {dualActiveSub.asset} contract. Settle now to simulate price action:
                  </p>

                  <div className="flex gap-2">
                    <button
                      id="btn-settle-strike-hit"
                      onClick={() => handleSimulateDualExpiry('STRIKE_HIT')}
                      className="flex-1 py-1.5 bg-red-950/30 border border-red-900/40 text-red-400 text-[10px] font-sans font-bold rounded-lg"
                    >
                      Trigger Target hit (Convert asset!)
                    </button>
                    <button
                      id="btn-settle-strike-missed"
                      onClick={() => handleSimulateDualExpiry('STRIKE_MISSED')}
                      className="flex-1 py-1.5 bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 text-[10px] font-sans font-bold rounded-lg"
                    >
                      Trigger Target missed (Keep principal + high APY)
                    </button>
                  </div>
                </div>
              )}

              {dualSimulationOutcome && (
                <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-sans text-slate-300 leading-normal">
                  <div className="text-emerald-400 font-bold mb-1">✓ Contract settles back to your Piggy bank:</div>
                  {dualSimulationOutcome}
                </div>
              )}
            </div>

            {/* Tax loss harvester */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-3xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-sans font-bold text-rose-400 uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Tax-Savings Loss Harvester ⚖️
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
                    Have some coins currently sitting on a paper loss? Our smart diagnostic closes those positions to register tax savings, then instantly moves them into corresponding liquid stAssets so you hold the exact same position with zero market loss!
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-sans text-slate-500 uppercase font-bold block">Paper Loss Diagnostics</span>
                  {underwaterPositions.map(pos => (
                    <div key={pos.id} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-xs font-sans font-bold text-white">{pos.asset} Coin</span>
                        <div className="text-[9px] font-sans text-slate-500 mt-0.5">
                          Buy price: ${pos.buyPrice} • Now: ${pos.currentPrice}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-400 font-mono">${Math.abs(pos.lossUsd).toFixed(2)} savings</span>
                        <span className="text-[9px] font-sans text-slate-500 block">AVAILABLE HARVEST</span>
                      </div>
                    </div>
                  ))}

                  {underwaterPositions.length === 0 && (
                    <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 text-emerald-400 text-center rounded-xl text-xs font-sans">
                      Perfect state! No paper losses eligible for harvesting.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {underwaterPositions.length > 0 && (
                  <button
                    id="btn-harvest-tax-losses"
                    onClick={handleExecuteTaxHarvest}
                    className="w-full py-2 bg-rose-950/45 border border-rose-900/50 hover:border-rose-500 text-rose-400 text-xs font-sans font-bold rounded-xl"
                  >
                    Claim $567.90 Tax Loss Offsets Now! ⚖️
                  </button>
                )}

                {taxHarvestLogs.length > 0 && (
                  <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl text-[10px] font-sans text-slate-400 space-y-1.5 max-h-40 overflow-y-auto">
                    {taxHarvestLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-1">
                        <span className="text-rose-400 font-bold">❯</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: ACADEMY & DCA (LEARN & EARN & SPARE CHANGE) */}
        {activeTab === 'academy' && (
          <motion.div
            key="academy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Proof of Learn Academy */}
            <div className="lg:col-span-7 bg-slate-950/40 border border-slate-900/60 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-400 animate-bounce" />
                    Crypto Academy: Learn & Earn free Coins! 🎓
                  </h3>
                  <span className="text-[10px] font-sans text-slate-400 font-bold">EDUCATION CENTER</span>
                </div>

                <p className="text-xs font-sans text-slate-400 mb-6 leading-relaxed">
                  Who said learning is dry? Review the mini-lessons below on how crypto and staking operate, take our simple multiple-choice quizzes, and grab free native **NEX** coins credited to your wallet instantly!
                </p>

                {activeCourseId === null ? (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div 
                        key={course.id} 
                        className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-sans font-bold text-white">{course.title}</span>
                            {course.completed ? (
                              <span className="text-[9px] font-sans px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900/30 font-bold">
                                CLAIMED ✅
                              </span>
                            ) : (
                              <span className="text-[9px] font-sans px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-900/30 font-bold">
                                UNCLAIMED 🎁
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-sans text-slate-400 mt-1">
                            {course.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 border-slate-900 pt-3 md:pt-0">
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 block font-bold">REWARD</span>
                            <span className="text-xs font-sans font-bold text-cyan-400">{course.rewardNex} NEX Coins</span>
                          </div>

                          <button
                            id={`btn-start-course-${course.id}`}
                            onClick={() => handleStartCourse(course.id)}
                            disabled={course.completed}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-xs font-sans font-bold rounded-xl transition disabled:opacity-50"
                          >
                            {course.completed ? 'Claimed' : 'Start Quiz!'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Quiz form
                  <div className="p-5 bg-slate-900/30 border border-slate-850 rounded-2xl space-y-4">
                    {(() => {
                      const course = courses.find(c => c.id === activeCourseId);
                      if (!course) return null;
                      const currentQ = course.questions[currentQuestionIdx];

                      return (
                        <>
                          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                            <span className="text-[11px] font-sans text-cyan-400 font-bold">Lesson: {course.title}</span>
                            <span className="text-[10px] text-slate-400">Question {currentQuestionIdx + 1} of {course.questions.length}</span>
                          </div>

                          <p className="text-sm font-sans font-bold text-white leading-relaxed mt-2">
                            {currentQ.question}
                          </p>

                          <div className="space-y-2 mt-4">
                            {currentQ.options.map((opt, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleSelectOption(i)}
                                className={`w-full p-3 text-left text-xs font-sans font-semibold rounded-xl border transition ${
                                  selectedQuizOption === i 
                                    ? 'bg-cyan-950/40 border-cyan-500/70 text-cyan-300' 
                                    : 'bg-slate-950 hover:bg-slate-900 border-slate-900 text-slate-300'
                                }`}
                              >
                                {i + 1}. {opt}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={handleNextQuizQuestion}
                            disabled={selectedQuizOption === null}
                            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-sans font-bold text-xs rounded-xl mt-4 disabled:opacity-30"
                          >
                            {currentQuestionIdx === course.questions.length - 1 ? 'Finish Lesson & Claim 🎓' : 'Next Question'}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Micro-DCA spare change rounded up */}
            <div className="lg:col-span-5 bg-slate-950/40 border border-slate-900/60 rounded-3xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    Spare Change Sweeper (Micro-DCA) 🧹
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
                    Automatically round up your small virtual transactions (like coffee or gas) to the nearest dollar, and pool the spare change into buying a crypto coin of your choice!
                  </p>
                </div>

                <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">Activate Sweeper:</span>
                    <button
                      onClick={() => setDcaEnabled(!dcaEnabled)}
                      className={`px-3 py-1 text-[10px] font-sans font-bold rounded-lg transition ${
                        dcaEnabled ? 'bg-cyan-950 border border-cyan-800 text-cyan-400' : 'bg-slate-950 text-slate-500 border border-slate-900'
                      }`}
                    >
                      {dcaEnabled ? 'Sweeper Active' : 'Off'}
                    </button>
                  </div>

                  {dcaEnabled && (
                    <div className="space-y-3 pt-2 border-t border-slate-900/60">
                      <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                        <div>
                          <label className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Target coin</label>
                          <select
                            id="select-dca-asset"
                            value={dcaTargetAsset}
                            onChange={(e) => setDcaTargetAsset(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-white"
                          >
                            <option value="SOL">SOL</option>
                            <option value="ETH">ETH</option>
                            <option value="NEX">NEX</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Multiplier multiplier</label>
                          <select
                            id="select-dca-mult"
                            value={dcaMultiplier}
                            onChange={(e) => setDcaMultiplier(parseInt(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-white"
                          >
                            <option value="1">1x (Normal spare change)</option>
                            <option value="2">2x (Double change)</option>
                            <option value="5">5x (Mega-Multiplier!)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={triggerSimulatedCardSpend}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-sans font-bold rounded-xl transition border border-slate-850"
                        >
                          Simulate Cafe debit Card Spend ☕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-sans text-slate-500 uppercase font-bold block">Recent Rounded Up spends</span>
                  <div className="space-y-1.5">
                    {simTransactions.map(tx => (
                      <div key={tx.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex justify-between items-center text-xs font-sans">
                        <div>
                          <span className="font-bold text-white">{tx.merchant}</span>
                          <span className="text-[10px] text-slate-500 block">Transaction cost: ${tx.cost.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-cyan-400 font-bold font-mono">+${(tx.roundup * dcaMultiplier).toFixed(2)}</span>
                          <span className="text-[9px] text-slate-500 block uppercase font-bold">Swept to DCA</span>
                        </div>
                      </div>
                    ))}
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
