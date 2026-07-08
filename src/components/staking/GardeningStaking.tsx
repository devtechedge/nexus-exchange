import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Sparkles, 
  Droplet, 
  HelpCircle, 
  Coins, 
  Award, 
  Flame, 
  TrendingUp, 
  Sliders, 
  Lock, 
  BookOpen, 
  Info, 
  Check, 
  ChevronRight, 
  User, 
  Play, 
  Volume2, 
  VolumeX, 
  Star,
  RefreshCw,
  Gift
} from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  price: number;
}

interface GardeningStakingProps {
  stakedBalances: { [key: string]: number };
  setStakedBalances: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  balances: { [key: string]: number };
  setBalances: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
  assets: Asset[];
}

const GREENHOUSE_ASSETS = [
  { 
    symbol: 'SOL', 
    name: 'Cyan Clover', 
    apy: 6.85, 
    growthCondition: 'Hydroponic Quartz UV Tube', 
    glowingColor: 'shadow-cyan-500/20 text-cyan-400 border-cyan-500/20', 
    riverSpeedClass: 'animate-[dash_1.5s_linear_infinite]',
    riverColor: 'text-cyan-400',
    lightType: 'Neon Purple LED',
    emoji: '🍀'
  },
  { 
    symbol: 'ETH', 
    name: 'Ether Orchid', 
    apy: 4.25, 
    growthCondition: 'Solar Nebula Dome Glass', 
    glowingColor: 'shadow-purple-500/20 text-purple-400 border-purple-500/20', 
    riverSpeedClass: 'animate-[dash_2.5s_linear_infinite]',
    riverColor: 'text-purple-400',
    lightType: 'Warm Ambient Solar',
    emoji: '🌸'
  },
  { 
    symbol: 'LINK', 
    name: 'Oracle Vine', 
    apy: 5.50, 
    growthCondition: 'Vapor Mist Geothermal Bed', 
    glowingColor: 'shadow-emerald-500/20 text-emerald-400 border-emerald-500/20', 
    riverSpeedClass: 'animate-[dash_2s_linear_infinite]',
    riverColor: 'text-emerald-400',
    lightType: 'Humid Moss Spectrum',
    emoji: '🌿'
  },
  { 
    symbol: 'DOT', 
    name: 'Polka-Lotus', 
    apy: 11.40, 
    growthCondition: 'Cosmic Pulsar Chamber', 
    glowingColor: 'shadow-rose-500/20 text-rose-400 border-rose-500/20', 
    riverSpeedClass: 'animate-[dash_0.8s_linear_infinite]',
    riverColor: 'text-rose-400',
    lightType: 'High-Intensity UV-B',
    emoji: '🌷'
  }
];

export default function GardeningStaking({
  stakedBalances,
  setStakedBalances,
  balances,
  setBalances,
  onNotification,
  assets
}: GardeningStakingProps) {
  // --- SUB-VIEWS OR INTERACTIVE STATES ---
  const [activeGardenView, setActiveGardenView] = useState<'simulator' | 'greenhouse' | 'campfire' | 'scratch'>('greenhouse');
  
  // No-Risk Yield Walkthrough State
  const [walkthroughStep, setWalkthroughStep] = useState<number | null>(null);
  const walkthroughStages = [
    {
      title: "Welcome to your Greenhouse! 🧑‍🌾",
      text: "Staking sounds complex, but it's just like planting seeds! On a real blockchain, you lock your crypto coins to support and validate the ledger. In return, the network rewards you with fresh coins."
    },
    {
      title: "No-Risk Practice Ground 🛡️",
      text: "Nexus Staking runs on 100% Mock Practice Coins. This means you get to experience the magical snowball effect of compounding interest and APY yields with absolutely zero real-world risk!"
    },
    {
      title: "Dynamic Greenhouse Light & Flow 🌊",
      text: "Different assets grow under unique conditions. Watch the 'APY Speed Stream' (the blue/pink neon rivers) next to the growth meters. Fast-moving streams represent higher APY interest rates!"
    },
    {
      title: "Daily Watering & Yield Harvesting 💧🌾",
      text: "Use the magic daily watering can to water your crops! This triggers photosynthesis, harvesting your accrued interest as Golden Wheat Bushels inside the Harvest Barn. You can then sell bushels back to cash anytime!"
    }
  ];

  // Compound Slider Projection
  const [sliderPrincipal, setSliderPrincipal] = useState<number>(100);
  const [sliderYears, setSliderYears] = useState<number>(10);
  const [sliderApy, setSliderApy] = useState<number>(8.5);

  // Daily Watering Can State
  const [lastWateredTime, setLastWateredTime] = useState<string | null>(null);
  const [wateringActive, setWateringActive] = useState(false);
  const [pendingDailyYield, setPendingDailyYield] = useState<number>(0.152); // mockup starting pending
  
  // Barn state
  const [wheatBushels, setWheatBushels] = useState<number>(2.45);

  // Sandbox Scratch Card
  const [hasScratchedCircle, setHasScratchedCircle] = useState<boolean[]>([false, false, false, false, false, false]);
  const [scratchRewards, setScratchRewards] = useState<string[]>(['🌾', '🍀', '🌾', '💎', '🌾', '🌾']); // 4 matching wheat is a win!
  const [hasWonScratch, setHasWonScratch] = useState<boolean | null>(null);
  const [scratchUnlocked, setScratchUnlocked] = useState<boolean>(false);
  const [scratchesRemaining, setScratchesRemaining] = useState<number>(3);

  // Campfire Pool Sharing State
  const [campfirePoolStaked, setCampfirePoolStaked] = useState<number>(8420);
  const [userCampfireContribution, setUserCampfireContribution] = useState<number>(0);
  const [campfireStakeInput, setCampfireStakeInput] = useState<string>('50');
  const [activeCampfireMates, setActiveCampfireMates] = useState([
    { name: 'YieldFarmer_Bob', avatar: '🧑‍🌾', amount: 1250, badge: 'Pro Gardener' },
    { name: 'SproutQueen', avatar: '🧝‍♀️', amount: 3400, badge: 'Locker Legend' },
    { name: 'CryptoOak', avatar: '🧙‍♂️', amount: 2100, badge: 'Redwood Titan' },
    { name: 'SolShine', avatar: '👩‍🎤', amount: 1670, badge: 'Daily Waterer' },
  ]);

  // Seed Planting Simulator Selection
  const [simulatorSymbol, setSimulatorSymbol] = useState<string>('SOL');
  const [simulatorWeeks, setSimulatorWeeks] = useState<number>(12); // weeks locked
  const [simulatorAmount, setSimulatorAmount] = useState<string>('5');
  const [plantedSeedsList, setPlantedSeedsList] = useState<Array<{
    id: string;
    symbol: string;
    amount: number;
    weeksLocked: number;
    plantedAt: string;
    harvestableFruits: number;
    progressPercent: number;
  }>>([
    { id: 'seed-1', symbol: 'SOL', amount: 10, weeksLocked: 24, plantedAt: 'July 1st', harvestableFruits: 4, progressPercent: 65 },
    { id: 'seed-2', symbol: 'DOT', amount: 25, weeksLocked: 48, plantedAt: 'June 15th', harvestableFruits: 9, progressPercent: 88 }
  ]);

  // Audio simulation toggler
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // Ignored if audio context not permitted
    }
  };

  const playWaterSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Simulating a water trickle
      const osc = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.5);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc2.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc2.start();
      osc.stop(audioCtx.currentTime + 0.5);
      osc2.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

  const playScratchSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, audioCtx.currentTime);
      osc.frequency.setValueAtTime(250, audioCtx.currentTime + 0.05);
      osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  // --- ACTIONS ---

  // Interactive daily watering can clicker
  const handleWaterCrops = () => {
    if (wateringActive) return;
    playWaterSound();
    setWateringActive(true);

    onNotification('info', 'Watering your Greenhouse plants with the magic watering can! 💧🌱');

    // Simulate water drop splash animation duration
    setTimeout(() => {
      setWateringActive(false);
      // Move pending daily yield into harvested wheat bushels in the Barn!
      const collectedYield = pendingDailyYield;
      setWheatBushels(prev => prev + collectedYield * 8.5); // Convert yield coins to wheat multiplier
      setPendingDailyYield(0.02); // reset to tiny baseline
      setLastWateredTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      onNotification('success', `Crops fully hydrated! Transferred daily accumulated crop interest into golden wheat bushels in your Harvest Barn! 🌾✨`);
    }, 2000);
  };

  // Sell bushels to cash conversion
  const handleSellWheatToCash = () => {
    if (wheatBushels <= 0) {
      onNotification('error', 'No wheat bushels in your Barn to sell! Wait for your next daily watering can harvest.');
      return;
    }
    playClickSound();
    
    // Each golden bushel of wheat is worth $12.50 USDC mock money!
    const bushelPrice = 12.50;
    const payout = parseFloat((wheatBushels * bushelPrice).toFixed(2));

    setBalances(prev => ({
      ...prev,
      USDC: (prev['USDC'] || 0) + payout
    }));
    
    setWheatBushels(0);
    onNotification('success', `Sold all golden wheat bushels! Credited +$${payout.toFixed(2)} USDC to your Spot Wallet! 🌾💵`);
  };

  // Seed locking simulation planting tool
  const handlePlantSeeds = (e: React.FormEvent) => {
    e.preventDefault();
    const amountFloat = parseFloat(simulatorAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      onNotification('error', 'Please enter a valid positive number of seeds to plant.');
      return;
    }

    const availableBal = balances[simulatorSymbol] || 0;
    if (amountFloat > availableBal) {
      onNotification('error', `Insufficient ${simulatorSymbol} in spot wallet. You have: ${availableBal.toFixed(4)} ${simulatorSymbol}`);
      return;
    }

    playClickSound();

    // Deduct from balances
    setBalances(prev => ({
      ...prev,
      [simulatorSymbol]: prev[simulatorSymbol] - amountFloat
    }));

    // Add to staked balances
    setStakedBalances(prev => ({
      ...prev,
      [simulatorSymbol]: (prev[simulatorSymbol] || 0) + amountFloat
    }));

    // Fruit yields scale with lock duration
    const computedFruits = Math.max(1, Math.round(amountFloat * (simulatorWeeks / 12)));

    const newPlantedSeed = {
      id: `seed-${Math.floor(Math.random() * 90000 + 10000)}`,
      symbol: simulatorSymbol,
      amount: amountFloat,
      weeksLocked: simulatorWeeks,
      plantedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      harvestableFruits: computedFruits,
      progressPercent: 5 // newly planted sprout
    };

    setPlantedSeedsList(prev => [newPlantedSeed, ...prev]);
    onNotification('success', `Success! Planted ${amountFloat.toFixed(2)} ${simulatorSymbol} seeds. Locked duration: ${simulatorWeeks} weeks. Virtual fruits are now growing! 🍊🌳`);
  };

  // Claim simulation fruits (unstake)
  const handleClaimFruits = (seedId: string) => {
    const seed = plantedSeedsList.find(s => s.id === seedId);
    if (!seed) return;

    playClickSound();
    
    // Credit original amount back to user's wallet
    setBalances(prev => ({
      ...prev,
      [seed.symbol]: (prev[seed.symbol] || 0) + seed.amount
    }));

    // Remove from staked balance
    setStakedBalances(prev => ({
      ...prev,
      [seed.symbol]: Math.max(0, (prev[seed.symbol] || 0) - seed.amount)
    }));

    // Reward bonus cash for harvesting fruits (mock cash: $15 per fruit!)
    const fruitBonus = seed.harvestableFruits * 15;
    setBalances(prev => ({
      ...prev,
      USDC: (prev['USDC'] || 0) + fruitBonus
    }));

    setPlantedSeedsList(prev => prev.filter(s => s.id !== seedId));
    onNotification('success', `Harvested! Reclaimed your ${seed.amount} ${seed.symbol} seeds and sold ${seed.harvestableFruits} virtual fruits for +$${fruitBonus} USDC bonus! 🍎💵`);
  };

  // Campfire Pool Contribution
  const handleCampfireDeposit = () => {
    const amountFloat = parseFloat(campfireStakeInput);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      onNotification('error', 'Please enter a valid amount of seeds to contribute.');
      return;
    }

    const availableNex = balances['NEX'] || 0;
    if (amountFloat > availableNex) {
      onNotification('error', `Insufficient NEX in wallet to pool. Available: ${availableNex.toFixed(2)} NEX.`);
      return;
    }

    playClickSound();

    setBalances(prev => ({
      ...prev,
      NEX: prev['NEX'] - amountFloat
    }));

    setCampfirePoolStaked(prev => prev + amountFloat);
    setUserCampfireContribution(prev => prev + amountFloat);
    onNotification('success', `Contributed ${amountFloat} NEX seeds to the campfire community tree! The shared oak grows higher! 🏕️🌳`);
  };

  // Educational article unlocking scratch card
  const handleReadArticle = () => {
    playClickSound();
    setScratchUnlocked(true);
    // Shuffle the scratch rewards
    const rewards = ['🌾', '🍀', '🌾', '💎', '🌾', '🌾'].sort(() => Math.random() - 0.5);
    setScratchRewards(rewards);
    setHasScratchedCircle([false, false, false, false, false, false]);
    setHasWonScratch(null);
    onNotification('success', `Completed Educational Article on Compound Interest! You have unlocked a Sandbox Scratch-Card game! 🎫`);
  };

  const handleScratchIndex = (idx: number) => {
    if (!scratchUnlocked || hasScratchedCircle[idx] || scratchesRemaining <= 0) return;
    
    playScratchSound();
    const nextScratched = [...hasScratchedCircle];
    nextScratched[idx] = true;
    setHasScratchedCircle(nextScratched);

    // Check if user has scratched at least 3 cards
    const scratchedCount = nextScratched.filter(Boolean).length;
    if (scratchedCount >= 5) {
      // Find what elements were revealed
      const revealed = scratchRewards.filter((_, i) => nextScratched[i]);
      // Count frequency of revealed rewards
      const counts: { [key: string]: number } = {};
      revealed.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
      
      // If 3 or more '🌾' are found, they win!
      if (counts['🌾'] >= 3) {
        setHasWonScratch(true);
        setBalances(prev => ({
          ...prev,
          USDC: (prev['USDC'] || 0) + 25.00
        }));
        onNotification('success', `Scratch-Card Winner! Matched 3 Golden Wheat Bushels! Earned +$25.00 USDC mock cash! 🌾💵`);
      } else {
        setHasWonScratch(false);
        onNotification('info', `Nice scratch! Better luck next time. Read another article to unlock another card!`);
      }
      setScratchUnlocked(false);
      setScratchesRemaining(r => Math.max(0, r - 1));
    }
  };

  // Compound slider calculations
  const futureValue = sliderPrincipal * Math.pow(1 + (sliderApy / 100), sliderYears);

  // Growth Stage image renderer based on Years locked
  const getGrowthStageDetails = (years: number) => {
    if (years <= 5) return { label: 'Seedling Sprout', emoji: '🌱', size: 'text-2xl', color: 'text-emerald-400', desc: 'A young delicate seedling. Taking its first sips of daily compounding soil.' };
    if (years <= 15) return { label: 'Active Sapling', emoji: '🌿', size: 'text-3xl', color: 'text-emerald-500', desc: 'Sturdy root framework established. Interest loops are starting to accelerate.' };
    if (years <= 30) return { label: 'Mighty Oak', emoji: '🌳', size: 'text-5xl', color: 'text-teal-400', desc: 'Massive woody canopy. The branches are dripping with multiple yield cycles.' };
    return { label: 'Giant Redwood Tree', emoji: '🌲✨', size: 'text-7xl', color: 'text-amber-400 animate-pulse', desc: 'Colossal elder matrix. Compound interest is cascading in towering loops!' };
  };

  const currentTree = getGrowthStageDetails(sliderYears);

  // --- REPORT CARD CALCS ---
  const totalAccruedMock = Object.values(stakedBalances).reduce((a, b) => a + b, 0);
  const getStakerGrade = () => {
    if (totalAccruedMock > 50) return { grade: 'A+', title: 'Master Forester', comment: 'Spectacular forest canopy! Dr. Clara is incredibly proud of your photosynthesis routing!' };
    if (totalAccruedMock > 10) return { grade: 'B', title: 'Advanced Botanist', comment: 'Healthy roots! You understand the massive leverage of compound interest.' };
    if (totalAccruedMock > 0) return { grade: 'C', title: 'Sprouting Apprentice', comment: 'Nice start! Keep daily watering to grow your seedling into an oak.' };
    return { grade: 'D', title: 'Garden Enthusiast', comment: 'Empty fields. Deposit digital seeds to begin compiling your passive crypto fruits!' };
  };
  const reportGrade = getStakerGrade();

  return (
    <div className="space-y-6">
      
      {/* WALKTHROUGH POPUP OVERLAY */}
      <AnimatePresence>
        {walkthroughStep !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold">
                <Sprout className="w-4 h-4" />
                <span>Greenhouse Walkthrough • Step {walkthroughStep + 1}/4</span>
              </div>
              <h3 className="text-lg font-sans font-extrabold text-white">
                {walkthroughStages[walkthroughStep].title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {walkthroughStages[walkthroughStep].text}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setWalkthroughStep(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer font-mono"
                >
                  Skip Guide
                </button>
                <div className="flex gap-2">
                  {walkthroughStep > 0 && (
                    <button
                      onClick={() => setWalkthroughStep(p => p !== null ? p - 1 : null)}
                      className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (walkthroughStep === walkthroughStages.length - 1) {
                        setWalkthroughStep(null);
                        onNotification('success', 'Walkthrough complete! Go claim your garden yield!');
                      } else {
                        setWalkthroughStep(p => p !== null ? p + 1 : null);
                      }
                    }}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs font-mono cursor-pointer flex items-center gap-1"
                  >
                    <span>{walkthroughStep === walkthroughStages.length - 1 ? 'Start Practice' : 'Next'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-TAB NAV FOR BATCH 7 FEATURES */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-sans font-bold text-slate-200">Staking Greenhouse & Rewards Barn 🧑‍🌾</h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Learn APY compounding growth cycles safely using classic organic farming metaphors!</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-850">
          <button
            onClick={() => { setActiveGardenView('greenhouse'); playClickSound(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer ${
              activeGardenView === 'greenhouse' ? 'bg-slate-800 text-emerald-400 border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏡 Greenhouse Dome
          </button>
          <button
            onClick={() => { setActiveGardenView('simulator'); playClickSound(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer ${
              activeGardenView === 'simulator' ? 'bg-slate-800 text-emerald-400 border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🌳 Seed Simulator
          </button>
          <button
            onClick={() => { setActiveGardenView('campfire'); playClickSound(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer ${
              activeGardenView === 'campfire' ? 'bg-slate-800 text-emerald-400 border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏕️ Campfire Pools
          </button>
          <button
            onClick={() => { setActiveGardenView('scratch'); playClickSound(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer ${
              activeGardenView === 'scratch' ? 'bg-slate-800 text-emerald-400 border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎰 Reward Scratchers
          </button>
        </div>

        {/* Audio / Help buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg transition cursor-pointer"
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { setWalkthroughStep(0); playClickSound(); }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-sans font-bold cursor-pointer transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Walkthrough</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: THE STAKING GREENHOUSE & WATERING CAN */}
        {activeGardenView === 'greenhouse' && (
          <motion.div
            key="greenhouse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Greenhouse Enclosure Enclosures */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Daily Watering Can Station */}
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 border border-slate-900 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 relative z-10 text-center sm:text-left">
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider">
                    🚿 Daily Hydration Station
                  </span>
                  <h3 className="text-lg font-sans font-extrabold text-white">Daily Yield Watering Can</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-md">
                    Water your crops once a day to accelerate photosynthesis! Hydrating triggers the accumulation of mock daily yield, transferring it securely to your Harvest Barn.
                  </p>
                  {lastWateredTime && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Last Hydrated Today at: <span className="text-emerald-400 font-bold">{lastWateredTime}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-3 relative z-10 shrink-0">
                  <motion.button
                    id="btn-water-crops"
                    onClick={handleWaterCrops}
                    disabled={wateringActive}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-28 h-28 rounded-full border flex flex-col items-center justify-center gap-1 transition cursor-pointer relative ${
                      wateringActive 
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <motion.div
                      animate={wateringActive ? { rotate: [-15, 15, -15, 15, 0], y: [-2, 2, -2] } : {}}
                      transition={{ duration: 1.5, repeat: wateringActive ? Infinity : 0 }}
                      className="text-4xl"
                    >
                      {wateringActive ? '🚿' : '🫗'}
                    </motion.div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                      {wateringActive ? 'Watering...' : 'Water Pool'}
                    </span>
                  </motion.button>

                  <span className="text-[9px] text-slate-500 font-sans italic">Click to harvest daily compound</span>
                </div>
              </div>

              {/* Greenhouse Grid */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="text-left">
                    <h4 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-emerald-400" />
                      Greenhouse Glass Conservatories
                    </h4>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">Observe current light sources, hydration levels, and dynamic APY River Speeds.</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Interactive Enclosures</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GREENHOUSE_ASSETS.map((gh) => {
                    const stakedVal = stakedBalances[gh.symbol] || 0;
                    
                    return (
                      <div 
                        key={gh.symbol}
                        className={`p-5 rounded-2xl bg-slate-900/30 border border-slate-900 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-850 transition relative overflow-hidden`}
                      >
                        {/* Decorative background light rays */}
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full filter blur-3xl opacity-10 ${
                          gh.symbol === 'SOL' ? 'bg-cyan-500' : gh.symbol === 'ETH' ? 'bg-purple-500' : gh.symbol === 'LINK' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />

                        <div className="flex items-center justify-between border-b border-slate-900 pb-2 relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{gh.emoji}</span>
                            <div className="text-left">
                              <span className="text-xs font-bold text-white block">{gh.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{gh.symbol} Flora</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">Compounding APY</span>
                            <span className="text-sm font-mono font-bold text-emerald-400">+{gh.apy.toFixed(2)}%</span>
                          </div>
                        </div>

                        {/* APY Stream Speedometer Animation */}
                        <div className="space-y-1 relative z-10">
                          <div className="flex items-center justify-between text-[9px] font-sans text-slate-400">
                            <span>APY Speed Stream:</span>
                            <span className="font-mono font-bold text-slate-300">
                              {gh.apy > 10 ? 'Torrential Fast' : gh.apy > 6 ? 'Rapid Flow' : 'Steady Flow'}
                            </span>
                          </div>
                          
                          {/* RIVER SPEED STREAM ANIMATION */}
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900 relative">
                            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                              <line 
                                x1="0" y1="4" x2="100%" y2="4" 
                                stroke={gh.symbol === 'SOL' ? '#22d3ee' : gh.symbol === 'ETH' ? '#c084fc' : gh.symbol === 'LINK' ? '#34d399' : '#fb7185'} 
                                strokeWidth="3" 
                                strokeDasharray={gh.apy > 10 ? '8, 12' : gh.apy > 6 ? '12, 18' : '20, 30'}
                                className={gh.riverSpeedClass}
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950/80 border border-slate-900/60 rounded-xl space-y-1 text-[10px] font-sans relative z-10">
                          <div className="flex justify-between text-slate-500">
                            <span>Enclosure Setup:</span>
                            <span className="text-slate-300 font-semibold">{gh.growthCondition}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Photosynthesis Light:</span>
                            <span className="text-slate-300 font-semibold">{gh.lightType}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 border-t border-slate-900/60 pt-1.5 mt-1">
                            <span>Staked Flora Seeds:</span>
                            <span className="text-emerald-400 font-bold font-mono">{stakedVal.toFixed(4)} {gh.symbol}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right side desk: Barn + Walkthrough + Scratch triggers */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* THE YIELD HARVEST BARN */}
              <div className="p-6 bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-900/60 border border-slate-900 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-5 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌾🏠</span>
                    <div className="text-left">
                      <h4 className="text-xs font-sans font-bold text-amber-400 uppercase tracking-wider">The Yield Harvest Barn</h4>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5 font-medium">Rustic storage barn for crop interest accumulated</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-950/10 border border-amber-900/20 rounded-2xl text-center my-4 space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Your Wheat Bushel Silo</span>
                    <div className="text-3xl font-mono font-extrabold text-amber-400 flex items-center justify-center gap-1.5">
                      <span>{wheatBushels.toFixed(4)}</span>
                      <span className="text-xl">🌾</span>
                    </div>
                    <span className="text-[9px] font-sans text-slate-400 block leading-relaxed">
                      Each bushel sells for <strong className="text-emerald-400">$12.50 USDC</strong> mock cash!
                    </span>
                  </div>
                </div>

                <button
                  id="btn-sell-wheat"
                  onClick={handleSellWheatToCash}
                  disabled={wheatBushels <= 0}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-mono font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                >
                  <span>Sell Bushels to Spot Wallet</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              </div>

              {/* NO-RISK YIELD EXPLAINER WALKTHROUGH TRIG */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-3 text-left">
                <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-slate-200 border-b border-slate-900 pb-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Staking Wisdom Walkthrough</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                  Confused about how crypto staking generates money? Let's break down the mechanics using simple gardening logic. Zero math, pure visualization!
                </p>
                <button
                  onClick={() => { setWalkthroughStep(0); playClickSound(); }}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-lg text-[10px] font-mono transition cursor-pointer"
                >
                  Start Dynamic Walking Tour ❯
                </button>
              </div>

              {/* FIRST STAKING REPORT CARD */}
              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-sans font-bold text-slate-200 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400 animate-pulse" />
                    My Staking Report Card
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                    Term 1
                  </span>
                </div>

                {/* Hand-made looking report layout */}
                <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3 relative overflow-hidden">
                  {/* Big Sticker Grade */}
                  <div className="absolute top-2 right-2 w-12 h-12 rounded-full border-2 border-emerald-500/30 flex flex-col items-center justify-center bg-slate-950 text-emerald-400 font-mono font-bold text-lg select-none shadow-md rotate-12">
                    <span className="text-xs text-slate-500 leading-none">GRADE</span>
                    <span className="leading-none">{reportGrade.grade}</span>
                  </div>

                  <div className="space-y-1 text-[10px] font-mono text-slate-400">
                    <div>
                      Student: <span className="text-slate-200">Practicing Botanist</span>
                    </div>
                    <div>
                      Total Staked: <span className="text-emerald-400 font-bold">{totalAccruedMock.toFixed(2)} mock coins</span>
                    </div>
                    <div>
                      Silo Crops Sold: <span className="text-amber-400 font-bold">Active Silo Feed</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-900/80 pt-2 text-[10px] font-sans">
                    <span className="text-slate-500 font-bold block uppercase">Botanist Comments:</span>
                    <p className="text-slate-300 italic mt-0.5 leading-relaxed font-medium">
                      "{reportGrade.comment}"
                    </p>
                  </div>

                  <div className="flex items-center gap-1 border-t border-slate-900/80 pt-2 text-[9px] text-slate-500">
                    <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400" />
                    <span>Signed: Dr. Clara Sprout, Head Botanist</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: THE SEED PLANTING SIMULATOR & TIME-SLIDER */}
        {activeGardenView === 'simulator' && (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Lock Staking Panel */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Seed Planting Simulator tool */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Plant Practice Coin Seeds
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose an asset seed to plant and lock away. Longer lock times apply high sunlight multipliers, producing exponentially more virtual fruits!
                  </p>
                </div>

                <form onSubmit={handlePlantSeeds} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Select Asset Seed</label>
                      <select
                        value={simulatorSymbol}
                        onChange={(e) => setSimulatorSymbol(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="SOL">SOL Seeds (Cyan Clover)</option>
                        <option value="ETH">ETH Seeds (Ether Orchid)</option>
                        <option value="LINK">LINK Seeds (Oracle Vine)</option>
                        <option value="DOT">DOT Seeds (Polka-Lotus)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Lock Duration (Weeks)</label>
                      <select
                        value={simulatorWeeks}
                        onChange={(e) => setSimulatorWeeks(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="4">4 Weeks Sprout (1x fruits)</option>
                        <option value="12">12 Weeks Bush (1.5x fruits)</option>
                        <option value="24">24 Weeks Sapling (2x fruits)</option>
                        <option value="48">48 Weeks Giant Oak (3.5x fruits)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Amount to Plant</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="e.g. 5"
                          value={simulatorAmount}
                          onChange={(e) => setSimulatorAmount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                        />
                        <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">{simulatorSymbol}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-mono font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                  >
                    <span>Plant & Lock Staked Seeds</span>
                    <Sprout className="w-4 h-4 shrink-0" />
                  </button>
                </form>

                {/* Active planted garden plot map */}
                <div className="pt-4 border-t border-slate-900/60 space-y-3 text-left">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Active Planted Plots</span>
                  
                  {plantedSeedsList.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/10 border border-slate-900/50 rounded-2xl text-slate-500 text-xs font-sans">
                      No active planted plots. Fill out the form above to lock practice seeds!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {plantedSeedsList.map((seed) => (
                        <div key={seed.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
                          <div className="flex items-center justify-between border-b border-slate-900/80 pb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl">🌳</span>
                              <div className="text-left">
                                <span className="text-xs font-extrabold text-white block">{seed.amount} {seed.symbol}</span>
                                <span className="text-[9px] text-slate-500 font-mono">Planted: {seed.plantedAt}</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono bg-emerald-950 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">
                              {seed.weeksLocked}w lock
                            </span>
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-400">
                              <span>Soil Hydro-Progress:</span>
                              <span className="font-mono text-emerald-400 font-bold">{seed.progressPercent}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${seed.progressPercent}%` }} />
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-900/80 pt-2.5">
                            <div className="flex items-center gap-1">
                              <span className="text-xs">🍊</span>
                              <span className="text-[10px] font-mono font-bold text-amber-400">
                                {seed.harvestableFruits} fruits ready
                              </span>
                            </div>

                            <button
                              id={`btn-claim-fruits-${seed.id}`}
                              onClick={() => handleClaimFruits(seed.id)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-extrabold text-[10px] rounded-lg transition cursor-pointer"
                            >
                              Harvest Fruit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compound Interest Time-Slider Panel (5 columns) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-5 text-left shadow-xl">
                <div>
                  <h4 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                    Compound Interest Time-Slider
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Drag the timeline below to watch your tiny seedling compound into a giant redwood forest matrix.</p>
                </div>

                <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center min-h-[160px] relative overflow-hidden">
                  <motion.div 
                    key={sliderYears}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`filter drop-shadow-md select-none font-sans ${currentTree.size}`}
                  >
                    {currentTree.emoji}
                  </motion.div>
                  <div>
                    <span className="text-xs font-extrabold text-white block">{currentTree.label}</span>
                    <span className="text-[9px] text-slate-400 block font-medium mt-1 leading-normal">
                      {currentTree.desc}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Slider Parameters */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
                      <span>Years Compounding</span>
                      <span className="text-emerald-400 font-extrabold">{sliderYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={sliderYears}
                      onChange={(e) => setSliderYears(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-900 rounded-lg h-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
                      <span>Initial Seed Capital</span>
                      <span className="text-cyan-400 font-extrabold">${sliderPrincipal} USDC</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={sliderPrincipal}
                      onChange={(e) => setSliderPrincipal(parseInt(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-900 rounded-lg h-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
                      <span>Greenhouse APY Sunlight</span>
                      <span className="text-purple-400 font-extrabold">{sliderApy.toFixed(1)}% APY</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={sliderApy}
                      onChange={(e) => setSliderApy(parseFloat(e.target.value))}
                      className="w-full accent-purple-500 bg-slate-900 rounded-lg h-1"
                    />
                  </div>
                </div>

                {/* Mathematical compounding projection readout */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold uppercase">
                    <span>Projected Future Value</span>
                    <span className="text-emerald-400 font-extrabold">Formula: A = P(1+r)^t</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-sans">Compounded Yield:</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      ${futureValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="text-[8px] text-slate-500 leading-normal italic font-sans mt-1">
                    Compound interest is the 8th wonder of the world. It means earning bonuses on top of previous bonuses. The longer the timeline, the steeper the redwood climb!
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: POOL SHARING CAMPFIRE (CO-OP CAMPSITE) */}
        {activeGardenView === 'campfire' && (
          <motion.div
            key="campfire"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Campfire animation scene */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-6 text-left">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                    The Pool Sharing Campfire
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sit back and pool your seeds together with nearby mock traders! Staking pools consolidate funds to secure validator nodes, allowing even small seedlings to grow a massive communal Redwood.
                  </p>
                </div>

                {/* COZY CAMPSITE STAGE ANIMATION */}
                <div className="h-64 w-full bg-slate-950 border border-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                  {/* Glowing background star matrix */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950" />
                  
                  {/* Floating sparks */}
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-32 h-32 pointer-events-none z-10">
                    <motion.div
                      animate={{ y: [-20, -100], x: [-10, 10, -5], opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeOut' }}
                      className="absolute left-6 text-orange-400 text-xs"
                    >
                      🔥
                    </motion.div>
                    <motion.div
                      animate={{ y: [-10, -80], x: [10, -10, 5], opacity: [0, 0.8, 0] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
                      className="absolute left-16 text-amber-500 text-[10px]"
                    >
                      ✨
                    </motion.div>
                    <motion.div
                      animate={{ y: [-30, -120], x: [0, 15, -15], opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'easeOut' }}
                      className="absolute left-24 text-red-500 text-xs"
                    >
                      ✨
                    </motion.div>
                  </div>

                  {/* Communal Tree growing based on pooled seeds */}
                  <div className="absolute top-4 left-12 flex flex-col items-center">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-900/60 px-2 py-0.5 rounded uppercase block mb-1">
                      Communal Tree Grow Spot
                    </span>
                    <motion.div 
                      animate={{ scale: [1, 1.01, 1], rotate: [-1, 1, -1] }}
                      transition={{ repeat: Infinity, duration: 5 }}
                      className="text-8xl filter drop-shadow-md"
                    >
                      🌳✨
                    </motion.div>
                  </div>

                  {/* Centered Campfire */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
                    <motion.span 
                      animate={{ scale: [0.9, 1.1, 0.9] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-5xl select-none"
                    >
                      🔥
                    </motion.span>
                    <span className="text-xl select-none leading-none mt-[-10px]">🪵</span>
                    <span className="text-[8px] font-mono text-amber-400 mt-1 uppercase font-bold tracking-wider">CAMPFIRE POOL ACTIVE</span>
                  </div>

                  {/* Avatars sitting around campfire */}
                  <div className="absolute bottom-6 left-6 flex items-center gap-1.5 z-20">
                    <span className="text-2xl filter drop-shadow-sm select-none">🧑‍🌾</span>
                    <div className="p-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-left">
                      <span className="text-[8px] text-emerald-400 font-bold block leading-none">Bob</span>
                      <span className="text-[8px] text-slate-400 font-mono">1.2K seeds</span>
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-6 flex items-center gap-1.5 z-20">
                    <div className="p-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-left">
                      <span className="text-[8px] text-purple-400 font-bold block leading-none">SproutQueen</span>
                      <span className="text-[8px] text-slate-400 font-mono">3.4K seeds</span>
                    </div>
                    <span className="text-2xl filter drop-shadow-sm select-none">🧝‍♀️</span>
                  </div>

                  {/* Status Overlay */}
                  <div className="flex justify-between items-center w-full z-20">
                    <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-xl text-left">
                      <span className="text-[8px] text-slate-500 uppercase block">Total Campfire Stake</span>
                      <span className="text-xs font-mono font-bold text-amber-400">{campfirePoolStaked} NEX Seeds</span>
                    </div>
                    <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-xl text-right">
                      <span className="text-[8px] text-slate-500 uppercase block">My Active Contribution</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{userCampfireContribution} NEX</span>
                    </div>
                  </div>
                </div>

                {/* Pool Staking Interaction Form */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-900">
                  <div className="relative flex-1 w-full">
                    <input
                      type="number"
                      placeholder="NEX Seeds to add"
                      value={campfireStakeInput}
                      onChange={(e) => setCampfireStakeInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">NEX</span>
                  </div>
                  <button
                    id="btn-campfire-deposit"
                    onClick={handleCampfireDeposit}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-mono font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
                  >
                    Throw Seeds in Campfire
                  </button>
                </div>
              </div>
            </div>

            {/* Campfire Mates roster list */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-4 text-left shadow-xl">
                <div>
                  <h4 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-400" />
                    Staking Campmates
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Active co-op members supporting photosynthesis channels on this node.</p>
                </div>

                <div className="space-y-3">
                  {activeCampfireMates.map((mate, i) => (
                    <div key={i} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{mate.avatar}</span>
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block">{mate.name}</span>
                          <span className="text-[9px] text-emerald-400 font-semibold">{mate.badge}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold text-slate-300">{mate.amount} NEX</span>
                        <span className="text-[8px] text-slate-500 block">Pooled seeds</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: SANDBOX SCRATCH CARD GAMES */}
        {activeGardenView === 'scratch' && (
          <motion.div
            key="scratch"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* The Scratch Card Sandbox */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-6 text-left">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-emerald-400 animate-bounce" />
                    Educational Sandbox Scratch-Card
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete quick lessons to unlock premium scratch cards! Match 3 <strong>🌾 Golden Wheat Bushel</strong> symbols to harvest an instant mock bonus of <strong>$25.00 USDC</strong>!
                  </p>
                </div>

                {/* THE SCRATCH CONTAINER */}
                <div className="p-6 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col items-center justify-center space-y-5">
                  {!scratchUnlocked && hasWonScratch === null && (
                    <div className="p-8 text-center bg-slate-950/80 border border-slate-900 rounded-2xl max-w-sm w-full space-y-4">
                      <span className="text-4xl block animate-pulse">🎫 LOCK</span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Scratch Card Sealed</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                        Read our botanist study course on Compound Interest to unlock your complimentary sandbox scratch game. You currently have <strong className="text-amber-400">{scratchesRemaining} remaining games</strong>!
                      </p>
                      <button
                        onClick={handleReadArticle}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-extrabold text-xs rounded-xl cursor-pointer transition shadow-lg shadow-emerald-500/10"
                      >
                        Read Study Article & Unlock Card
                      </button>
                    </div>
                  )}

                  {scratchUnlocked && (
                    <div className="p-6 bg-gradient-to-br from-purple-950/30 to-slate-950 border-2 border-purple-500/30 rounded-3xl max-w-sm w-full space-y-4 relative shadow-xl">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">🌟 Premium Scratch Box</span>
                        <span className="text-[9px] text-slate-500 font-sans">Reveal all 6 zones!</span>
                      </div>

                      {/* Six clickable scratch circle points */}
                      <div className="grid grid-cols-3 gap-4 py-2">
                        {hasScratchedCircle.map((scratched, idx) => (
                          <button
                            id={`scratch-box-${idx}`}
                            key={idx}
                            onClick={() => handleScratchIndex(idx)}
                            className={`h-20 rounded-2xl flex items-center justify-center text-3xl font-bold select-none cursor-pointer border transition-all ${
                              scratched 
                                ? 'bg-slate-900 border-slate-800 text-slate-100 scale-95 shadow-inner' 
                                : 'bg-slate-950 hover:bg-slate-850 border-purple-500/20 text-purple-400 hover:scale-105'
                            }`}
                          >
                            {scratched ? scratchRewards[idx] : '❓'}
                          </button>
                        ))}
                      </div>

                      <div className="text-[9px] text-slate-500 font-sans text-center italic">
                        Match 3 🌾 Wheat bushels to win a $25 mock-cash bonus!
                      </div>
                    </div>
                  )}

                  {hasWonScratch !== null && (
                    <div className="p-8 text-center bg-slate-950/80 border border-slate-900 rounded-2xl max-w-sm w-full space-y-4">
                      <div className="text-5xl animate-bounce">
                        {hasWonScratch ? '🎉🌾🏆' : '😿🌿'}
                      </div>
                      <h4 className="text-sm font-extrabold text-white">
                        {hasWonScratch ? 'WINNER!' : 'No match this time'}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        {hasWonScratch 
                          ? 'You successfully uncovered 3 golden wheat bushels on your ticket! Your spot balance has been credited with +$25.00 USDC mock cash.' 
                          : 'You uncovered some beautiful weeds, but didn\'t get enough matching wheat silos. Ready to read another article to refresh?'
                        }
                      </p>
                      <button
                        onClick={() => { setHasWonScratch(null); setScratchUnlocked(false); }}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono transition cursor-pointer"
                      >
                        Reset & Try Again ({scratchesRemaining} left)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Educational Study Article to read */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-4 text-left shadow-xl">
                <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-slate-200 border-b border-slate-900 pb-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Staking Quick-Study Lesson</span>
                </div>
                
                <div className="space-y-3 font-sans text-xs">
                  <h4 className="font-extrabold text-white">Why Staking is not a "Free Lunch"</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Blockchains like Solana and Ethereum don't have centralized banks. Instead, they rely on computers called <strong>validators</strong> to process transfers safely.
                  </p>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    To prove they aren't cheating, validators must lock down some collateral. This is called <strong>Proof of Stake</strong>. When you stake your seeds, you lend weight to these honest nodes, and the system rewards you for keeping it safe!
                  </p>
                  
                  <div className="p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl text-[10px] text-emerald-400 leading-normal">
                    💡 <strong>Pro Botanist Rule:</strong> Accruing interest builds an automatic wealth snowball because your earned yield goes right back to grow even more fruit!
                  </div>

                  <button
                    onClick={handleReadArticle}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-lg text-[10px] font-mono transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Confirm Lesson Completed</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
