import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Trophy, 
  Sparkles, 
  BookOpen, 
  FolderHeart, 
  Award, 
  Flame, 
  MessageSquare, 
  Grid, 
  Zap, 
  FileText, 
  Heart, 
  TrendingUp, 
  Download, 
  Check, 
  Gamepad2, 
  ChevronRight, 
  Plus, 
  Compass, 
  Share2, 
  Play,
  RotateCcw,
  Sun
} from 'lucide-react';
import { Asset, GridBot } from '../types';
import DailyStreakGarden from './gamified/DailyStreakGarden';

interface ClassroomViewProps {
  user: { username: string; email: string; kycStatus: string };
  balances: { [key: string]: number };
  setBalances: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  gridBots: GridBot[];
  setGridBots: React.Dispatch<React.SetStateAction<GridBot[]>>;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
  streakDays: number;
  onWaterStreakGarden: (xpAward: number) => void;
  awardXp?: (amount: number, reason: string) => void;
  addTransaction?: (tx: any) => void;
}

// Flashcard definitions
interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

const FLASHCARDS: Flashcard[] = [
  { id: 'fc-1', term: 'Private Key', definition: 'The cryptographic secret password that proves ownership and grants complete access to your crypto funds.' },
  { id: 'fc-2', term: 'Phishing', definition: 'Deceptive trickery where hackers impersonate official services (via fake websites or emails) to steal passwords or keys.' },
  { id: 'fc-3', term: 'Slippage', definition: 'The price difference between the moment you submit a trade order and the moment it gets filled.' },
  { id: 'fc-4', term: 'Hardware Wallet', definition: 'A specialized offline physical USB device that keeps your private keys isolated from internet threats.' },
  { id: 'fc-5', term: 'Smart Contract Audit', definition: 'A professional security review of a programs code to check for vulnerabilities and potential exploits.' }
];

export default function ClassroomView({
  user,
  balances,
  setBalances,
  gridBots,
  setGridBots,
  onNotification,
  streakDays,
  onWaterStreakGarden,
  awardXp,
  addTransaction
}: ClassroomViewProps) {
  // Main sub-tabs for classroom tools
  const [activeTab, setActiveTab] = useState<'tournaments' | 'pizza' | 'garden' | 'redwood' | 'cabins' | 'flashcards' | 'gallery' | 'certificate'>('tournaments');

  // --- 1. CLASSROOM TRADING TOURNAMENTS STATE ---
  const [tournaments, setTournaments] = useState([
    { id: 'tour-1', name: '💼 Finance 101 - Spring Sandbox League', creator: 'Mrs. Gable (Teacher)', ruleBalance: 50000, code: 'STUDY-SOL-99', participants: 18, active: true, startTime: 'Started' },
    { id: 'tour-2', name: '🚀 Summer Coding & Trading Hackathon', creator: 'Professor Lucas', ruleBalance: 100000, code: 'CODE-NEX-44', participants: 12, active: false, startTime: 'In 2 hours' }
  ]);
  const [newTourName, setNewTourName] = useState('');
  const [newTourBalance, setNewTourBalance] = useState(50000);
  const [newTourCode, setNewTourCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<string>('tour-1');

  // Simulated tournament classmates
  const [classmates, setClassmates] = useState([
    { rank: 1, name: 'Clara Hamster', balance: 54120.50, tradeCount: 14, badge: '🌸 Quick Learner' },
    { rank: 2, name: `${user.username || 'You'} (Sandbox)`, balance: 50000.00, tradeCount: 8, badge: '🛡️ Shielded Explorer' },
    { rank: 3, name: 'Toby Pup', balance: 49810.00, tradeCount: 22, badge: '🥩 Risk-Taker' },
    { rank: 4, name: 'Chloe Owl', balance: 49450.10, tradeCount: 6, badge: '🦉 Safe Guardian' },
    { rank: 5, name: 'Lucas Cat', balance: 48900.00, tradeCount: 11, badge: '🐟 Arbitrage Seeker' }
  ]);

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourName.trim()) {
      onNotification('error', 'Please enter a valid tournament name.');
      return;
    }
    const code = newTourCode.toUpperCase() || `TOUR-${Math.floor(Math.random() * 900 + 100)}`;
    const newTour = {
      id: `tour-${Date.now()}`,
      name: newTourName,
      creator: 'You (Teacher Mode)',
      ruleBalance: newTourBalance,
      code: code,
      participants: 1,
      active: true,
      startTime: 'Starts Now'
    };
    setTournaments([newTour, ...tournaments]);
    setSelectedTournament(newTour.id);
    setNewTourName('');
    setNewTourCode('');
    onNotification('success', `Created Classroom League: ${newTour.name}! Class Code: ${code}`);
    if (awardXp) awardXp(50, 'Created Private Sandbox League');
  };

  const handleJoinTournament = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    const found = tournaments.find(t => t.code === cleanCode);
    if (!found) {
      onNotification('error', 'Invalid tournament invite code. Try "CODE-NEX-44"!');
      return;
    }
    onNotification('success', `Joined Private Tournament: ${found.name}! Active with $${found.ruleBalance.toLocaleString()} mock sandbox funds!`);
    setJoinCodeInput('');
    setSelectedTournament(found.id);
    if (awardXp) awardXp(40, 'Joined private classroom tournament');
  };

  // --- 2. FRIEND REFERRAL STICKER PACKS & SKINS STATE ---
  const [referralInput, setReferralInput] = useState('');
  const [unlockedStickers, setUnlockedStickers] = useState<string[]>(['st-1']); // First one unlocked by default
  const [selectedDashboardSkin, setSelectedDashboardSkin] = useState('cyan'); // cyan, amber, forest

  const STICKER_PACKS = [
    { id: 'st-1', name: 'Sovereign Owl', emoji: '🦉', desc: 'Symbol of security and safe storage guidelines.', tip: 'A wise guardian keeps private keys safe offline!', codeRequired: 'DEFAULT' },
    { id: 'st-2', name: 'Gas-Fee Deflector', emoji: '🛡️', desc: 'Unlocks dynamic slippage buffer defenses.', tip: 'Deflect unfavorable price volatility swings!', codeRequired: 'NEON-EDU-77' },
    { id: 'st-3', name: 'Merkle Seed Sprout', emoji: '🌱', desc: 'Symbol of cryptographic integrity verification.', tip: 'Merkle roots sprout dynamic proofs!', codeRequired: 'REDWOOD-GROW-12' },
    { id: 'st-4', name: 'Pizza Master Slice', emoji: '🍕', desc: 'Symbol of balanced portfolio toppings.', tip: 'Slice and balance SOL, ETH and USDC holdings!', codeRequired: 'PIZZA-SPLIT-99' }
  ];

  const handleApplyReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const code = referralInput.trim().toUpperCase();
    const matchingSticker = STICKER_PACKS.find(s => s.codeRequired === code);
    if (!matchingSticker) {
      onNotification('error', 'Unknown invitation code. Try "NEON-EDU-77" or "REDWOOD-GROW-12"!');
      return;
    }
    if (unlockedStickers.includes(matchingSticker.id)) {
      onNotification('info', `You already unlocked the "${matchingSticker.name}" sticker!`);
      return;
    }
    setUnlockedStickers([...unlockedStickers, matchingSticker.id]);
    setReferralInput('');
    onNotification('success', `🎉 Unlocked Exclusive Sticker: "${matchingSticker.name}" ${matchingSticker.emoji}!`);
    if (awardXp) awardXp(45, `Unlocked friend referral sticker: ${matchingSticker.name}`);
  };

  // --- 3. THE FRIENDSHIP LEADERBOARD ---
  // A clean, friendly ranks of quizzes completed & stickers earned
  const friendlyFriends = [
    { rank: 1, name: 'Clara Hamster', avatar: '🐹', quizzes: 12, stickers: 4, class: 'A+ Mentor' },
    { rank: 2, name: `${user.username || 'You'} (Sandbox)`, avatar: '🐷', quizzes: 9, stickers: unlockedStickers.length, class: 'Active Explorer' },
    { rank: 3, name: 'Toby Pup', avatar: '🐶', quizzes: 8, stickers: 2, class: 'Active Explorer' },
    { rank: 4, name: 'Chloe Owl', avatar: '🦉', quizzes: 7, stickers: 3, class: 'Safety Guard' },
    { rank: 5, name: 'Lucas Cat', avatar: '🐱', quizzes: 5, stickers: 1, class: 'Novice Sweeper' }
  ];

  const [cheeredFriends, setCheeredFriends] = useState<string[]>([]);
  const handleCheerFriend = (name: string) => {
    if (cheeredFriends.includes(name)) return;
    setCheeredFriends([...cheeredFriends, name]);
    onNotification('success', `Sent dynamic sparkles & encouragement to ${name}! ✨`);
    if (awardXp) awardXp(15, `Cheered friend: ${name}`);
  };

  // --- 4. COOPERATIVE MARKET GOALS (COMMUNITY REDWOOD) ---
  const [coopPooledUsdc, setCoopPooledUsdc] = useState(8420);
  const targetCoopGoal = 10000;
  
  const redwoodStage = useMemo(() => {
    const pct = (coopPooledUsdc / targetCoopGoal) * 100;
    if (pct < 20) return { name: 'Tiny Sprout', emoji: '🌱', scale: 0.5, desc: 'A young sprout taking in sandbox nutrients!' };
    if (pct < 50) return { name: 'Sapling Bush', emoji: '🌿', scale: 1.0, desc: 'Developing strong branches to filter market storms!' };
    if (pct < 80) return { name: 'Young Redwood', emoji: '🌲', scale: 1.5, desc: 'Trunk is widening as sandbox savings pool grows!' };
    if (pct < 100) return { name: 'Community Elder Tree', emoji: '🌳', scale: 2.0, desc: 'Beautiful green canopy shading the entire sandbox!' };
    return { name: 'Cosmic Giant Redwood', emoji: '🌴', scale: 2.6, desc: 'Mighty Elderwood reaching cryptographic space!' };
  }, [coopPooledUsdc]);

  const [coopLogs, setCoopLogs] = useState([
    { user: 'Clara Hamster', action: 'pooled $250 USDC', time: '10m ago' },
    { user: 'Toby Pup', action: 'completed security lesson', time: '1h ago' },
    { user: 'Chloe Owl', action: 'pooled $100 USDC', time: '3h ago' }
  ]);

  const handlePoolUsdc = () => {
    const usdcBal = balances['USDC'] || 0;
    if (usdcBal < 100) {
      onNotification('error', 'Insufficient USDC balance. Claim from faucet to pool funds.');
      return;
    }
    // Deduct $100, add to coop
    setBalances(prev => ({ ...prev, USDC: prev['USDC'] - 100 }));
    setCoopPooledUsdc(prev => prev + 100);
    setCoopLogs([{ user: 'You (Sandbox)', action: 'pooled $100 USDC', time: 'Just Now' }, ...coopLogs]);
    onNotification('success', 'Pooled $100 USDC to community Redwood garden! Growing together...');
    if (awardXp) awardXp(35, 'Pooled funds into cooperative market goal');
  };

  // --- 5. MOCK INVESTMENT CABINS STATE ---
  const [cabinMessages, setCabinMessages] = useState([
    { id: 'm-1', user: 'Toby Pup', text: 'Checkout my dynamic grid bot settings for SOL. It harvests swings nicely!', isRecipe: true, botConfig: { lower: 130, upper: 160, grids: 8 } },
    { id: 'm-2', user: 'Clara Hamster', text: 'Remember, private keys stay offline! Safety check is green.', isRecipe: false },
    { id: 'm-3', user: 'Chloe Owl', text: 'I am forecasting a calm sideways consolidation on ETH, good for grid staking.', isRecipe: false }
  ]);
  const [newCabinMsg, setNewCabinMsg] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCabinMsg.trim()) return;
    const isBotRecipe = newCabinMsg.toLowerCase().includes('recipe') || newCabinMsg.toLowerCase().includes('bot');
    const newMsg = {
      id: `m-${Date.now()}`,
      user: 'You (Sandbox)',
      text: newCabinMsg,
      isRecipe: isBotRecipe,
      botConfig: isBotRecipe ? { lower: 135, upper: 155, grids: 10 } : undefined
    };
    setCabinMessages([...cabinMessages, newMsg]);
    setNewCabinMsg('');
    onNotification('success', 'Chat posted in cozy investment cabin!');
    if (awardXp) awardXp(20, 'Contributed to Investment Cabin');
  };

  const handleDeploySharedRecipe = (recipe: { lower: number; upper: number; grids: number }) => {
    const mockBot: GridBot = {
      id: `bot-${Date.now()}`,
      symbol: 'SOL',
      lowerPrice: recipe.lower,
      upperPrice: recipe.upper,
      gridCount: recipe.grids,
      investmentAmount: 1000,
      active: true,
      gridLevels: [],
      profitEarned: 0,
      createdAt: new Date().toLocaleDateString(),
      isSandbox: true
    };
    setGridBots([mockBot, ...gridBots]);
    onNotification('success', `Bot recipe imported & safely deployed! Running SOL grid $${recipe.lower}-$${recipe.upper}`);
    if (awardXp) awardXp(30, 'Deployed shared bot recipe');
  };

  // --- 6. THE SANDBOX SHOWCASE GALLERY ---
  const [galleryUploads, setGalleryUploads] = useState([
    { id: 'g-1', title: 'Perfect Circle SOL Staking', category: 'Growth Garden', author: 'Clara Hamster', likes: 14, remixed: false, image: '🌸' },
    { id: 'g-2', title: 'Unbreakable Merkle Tree Verification', category: 'Merkle Path', author: 'Chloe Owl', likes: 22, remixed: true, image: '🌱' },
    { id: 'g-3', title: '50-50 Balanced Pizza Allocation', category: 'Pizza Splitter', author: 'Toby Pup', likes: 8, remixed: false, image: '🍕' }
  ]);
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState('Growth Garden');

  const handleUploadShowcase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryTitle.trim()) return;
    const emojis = { 'Growth Garden': '🌸', 'Merkle Path': '🌱', 'Pizza Splitter': '🍕' };
    const newUpload = {
      id: `g-${Date.now()}`,
      title: newGalleryTitle,
      category: newGalleryCategory,
      author: 'You (Sandbox)',
      likes: 1,
      remixed: false,
      image: emojis[newGalleryCategory as keyof typeof emojis] || '🏆'
    };
    setGalleryUploads([newUpload, ...galleryUploads]);
    setNewGalleryTitle('');
    onNotification('success', `Uploaded screenshot to public showcase wall!: ${newUpload.title}`);
    if (awardXp) awardXp(40, 'Contributed screenshot to Sandbox Showcase Gallery');
  };

  const handleLikeUpload = (id: string) => {
    setGalleryUploads(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));
    onNotification('success', 'Liked student showcase post! 👍');
  };

  // --- 7. INTERACTIVE EXPLORER CERTIFICATE ---
  const [studentName, setStudentName] = useState(user.username || 'Sandbox Cadet');
  const totalQuestsNeeded = 4;
  const currentQuestsCompleted = streakDays >= 3 ? 4 : Math.min(3, streakDays + 1);

  const handlePrintCertificate = () => {
    window.print();
    onNotification('success', 'Generating high-fidelity Explorer Diploma print job...');
  };

  // --- 8. THE MOCK PORTFOLIO PIZZA SPLITTER ---
  const [pizzaSol, setPizzaSol] = useState(40);
  const [pizzaEth, setPizzaEth] = useState(30);
  const [pizzaUsdc, setPizzaUsdc] = useState(30);

  // Normalize percentages on change
  const handlePizzaChange = (asset: 'SOL' | 'ETH' | 'USDC', val: number) => {
    if (asset === 'SOL') {
      const remaining = 100 - val;
      const ratio = remaining / (pizzaEth + pizzaUsdc || 1);
      setPizzaSol(val);
      setPizzaEth(Math.round(pizzaEth * ratio));
      setPizzaUsdc(Math.round(pizzaUsdc * ratio));
    } else if (asset === 'ETH') {
      const remaining = 100 - val;
      const ratio = remaining / (pizzaSol + pizzaUsdc || 1);
      setPizzaEth(val);
      setPizzaSol(Math.round(pizzaSol * ratio));
      setPizzaUsdc(Math.round(pizzaUsdc * ratio));
    } else {
      const remaining = 100 - val;
      const ratio = remaining / (pizzaSol + pizzaEth || 1);
      setPizzaUsdc(val);
      setPizzaSol(Math.round(pizzaSol * ratio));
      setPizzaEth(Math.round(pizzaEth * ratio));
    }
  };

  const pizzaSum = pizzaSol + pizzaEth + pizzaUsdc;

  // --- 9. THE FLASHCARD BATTLE ARENA ---
  const [gameStarted, setGameStarted] = useState(false);
  const [shuffledTerms, setShuffledTerms] = useState<{ id: string; term: string }[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<{ id: string; definition: string }[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedDefId, setSelectedDefId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [gameTimeLeft, setGameTimeLeft] = useState(35);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameScore, setGameScore] = useState(0);

  // Timer loop
  useEffect(() => {
    let timer: any;
    if (gameStarted && gameTimeLeft > 0 && !isGameOver) {
      timer = setInterval(() => {
        setGameTimeLeft(prev => {
          if (prev <= 1) {
            setIsGameOver(true);
            clearInterval(timer);
            onNotification('info', `Time is up! Battle Arena concluded. Matched: ${matchedIds.length} cards.`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameTimeLeft, isGameOver, matchedIds]);

  const startFlashcardGame = () => {
    // Shuffle lists
    const terms = FLASHCARDS.map(f => ({ id: f.id, term: f.term })).sort(() => Math.random() - 0.5);
    const defs = FLASHCARDS.map(f => ({ id: f.id, definition: f.definition })).sort(() => Math.random() - 0.5);
    setShuffledTerms(terms);
    setShuffledDefs(defs);
    setMatchedIds([]);
    setSelectedTermId(null);
    setSelectedDefId(null);
    setGameTimeLeft(35);
    setIsGameOver(false);
    setGameScore(0);
    setGameStarted(true);
    onNotification('info', '⚔️ Quick-fire Flashcard Duel started! Match terms with definitions before timer expires.');
  };

  const handleMatchSelect = (type: 'term' | 'def', id: string) => {
    if (type === 'term') {
      setSelectedTermId(id);
      if (selectedDefId) {
        if (id === selectedDefId) {
          // Match!
          setMatchedIds([...matchedIds, id]);
          setGameScore(prev => prev + 20);
          onNotification('success', 'Correct Match! +20 points');
          setSelectedTermId(null);
          setSelectedDefId(null);
          if (matchedIds.length + 1 === FLASHCARDS.length) {
            setIsGameOver(true);
            onNotification('success', '🏆 Perfect Match! Arena complete! Master Security rank achieved.');
            if (awardXp) awardXp(60, 'Completed Flashcard Battle Arena');
          }
        } else {
          onNotification('error', 'Mismatch! Keep searching.');
          setSelectedTermId(null);
          setSelectedDefId(null);
        }
      }
    } else {
      setSelectedDefId(id);
      if (selectedTermId) {
        if (id === selectedTermId) {
          // Match!
          setMatchedIds([...matchedIds, id]);
          setGameScore(prev => prev + 20);
          onNotification('success', 'Correct Match! +20 points');
          setSelectedTermId(null);
          setSelectedDefId(null);
          if (matchedIds.length + 1 === FLASHCARDS.length) {
            setIsGameOver(true);
            onNotification('success', '🏆 Perfect Match! Arena complete! Master Security rank achieved.');
            if (awardXp) awardXp(60, 'Completed Flashcard Battle Arena');
          }
        } else {
          onNotification('error', 'Mismatch! Keep searching.');
          setSelectedTermId(null);
          setSelectedDefId(null);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl backdrop-blur-md text-left">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Classroom & Group Tournament Tools 🏫
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Secure collaborative sandboxes designed for schools, academies, friend clubs, and cooperative learning modules.
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/60 border border-slate-900 rounded-xl">
          {[
            { id: 'tournaments', label: 'Classroom Leagues', icon: Trophy },
            { id: 'pizza', label: 'Pizza Splitter', icon: FolderHeart },
            { id: 'garden', label: 'Streak Garden', icon: Flame },
            { id: 'redwood', label: 'Cooperative redwood', icon: BookOpen },
            { id: 'cabins', label: 'Cozy Cabins', icon: MessageSquare },
            { id: 'flashcards', label: 'Flashcard Arena', icon: Gamepad2 },
            { id: 'gallery', label: 'Showcase Wall', icon: Grid },
            { id: 'certificate', label: 'Explorer Diploma', icon: Award }
          ].map((subTab) => {
            const Icon = subTab.icon;
            const isActive = activeTab === subTab.id;
            return (
              <button
                key={subTab.id}
                onClick={() => setActiveTab(subTab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
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

      {/* Main interactive tabs */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: CLASSROOM TRADING TOURNAMENTS */}
        {activeTab === 'tournaments' && (
          <motion.div
            key="tournaments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
          >
            {/* Left side: Create or Join leagues */}
            <div className="lg:col-span-4 space-y-4">
              {/* Create Tournament Card */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  Launch Student League
                </h4>
                <form onSubmit={handleCreateTournament} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-sans font-bold">Tournament Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Cryptography 101 Sandbox"
                      value={newTourName}
                      onChange={(e) => setNewTourName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-sans font-bold">Rule Balance (Mock Funds)</label>
                    <select
                      value={newTourBalance}
                      onChange={(e) => setNewTourBalance(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={10000}>$10,000 Sandbox Cash</option>
                      <option value={50000}>$50,000 Sandbox Cash</option>
                      <option value={100000}>$100,000 Sandbox Cash</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-sans font-bold">Custom Invite Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., GABLE-SOL-1"
                      value={newTourCode}
                      onChange={(e) => setNewTourCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-indigo-500 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-sans font-bold rounded-xl transition shadow-lg cursor-pointer"
                  >
                    Create League Match
                  </button>
                </form>
              </div>

              {/* Join Tournament Code Input */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Join Private League
                </h4>
                <form onSubmit={handleJoinTournament} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-sans font-bold">League Pin / Invite Code</label>
                    <input
                      type="text"
                      placeholder="STUDY-SOL-99"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs font-sans text-white text-center tracking-widest focus:outline-none focus:border-emerald-500 uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-sans font-bold rounded-xl border border-slate-800 transition cursor-pointer"
                  >
                    Enter Private Classroom
                  </button>
                </form>
              </div>
            </div>

            {/* Right side: Active Tournaments lists & Class Leaderboard */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h4 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-indigo-400" />
                    Classroom Leagues & Sandbox Matches
                  </h4>
                  <span className="text-[10px] text-slate-500">Active matches: {tournaments.length}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tournaments.map(t => {
                    const isSelected = selectedTournament === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTournament(t.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between h-36 ${isSelected ? 'bg-indigo-950/20 border-indigo-500/50' : 'bg-slate-900/10 border-slate-900 hover:bg-slate-900/30'}`}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded">
                              Code: {t.code}
                            </span>
                            <span className={`text-[8px] font-sans font-bold px-1.5 py-0.5 rounded ${t.active ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' : 'bg-amber-950/50 text-amber-400 border border-amber-900/30'}`}>
                              {t.startTime}
                            </span>
                          </div>
                          <h5 className="text-xs font-sans font-bold text-white mt-2 leading-snug">{t.name}</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">By {t.creator}</p>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-900/60 pt-2">
                          <span>👤 {t.participants} Students</span>
                          <span>💰 ${t.ruleBalance.toLocaleString()} Starter</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Class Leaderboard */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                  <h4 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Sandbox Student rankings
                  </h4>
                  <span className="text-[10px] font-mono text-indigo-400">Class Match In-Progress</span>
                </div>

                <div className="divide-y divide-slate-900/50">
                  {classmates.map(c => {
                    const isUser = c.name.includes('(Sandbox)');
                    return (
                      <div key={c.rank} className={`p-3 flex items-center justify-between transition ${isUser ? 'bg-indigo-950/10 border-y border-indigo-500/20' : 'hover:bg-slate-900/10'}`}>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs font-mono font-bold w-5 text-center ${c.rank === 1 ? 'text-yellow-400' : c.rank === 2 ? 'text-slate-300' : 'text-slate-500'}`}>
                            #{c.rank}
                          </span>
                          <div className="flex flex-col text-left">
                            <span className={`text-xs font-sans font-bold ${isUser ? 'text-indigo-300' : 'text-slate-200'}`}>{c.name}</span>
                            <span className="text-[9px] text-slate-500 font-sans">{c.badge}</span>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-4">
                          <div className="flex flex-col text-right">
                            <span className="text-xs font-mono font-bold text-white">${c.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="text-[9px] text-slate-400 font-sans">{c.tradeCount} trades submitted</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: PORTFOLIO PIZZA SPLITTER */}
        {activeTab === 'pizza' && (
          <motion.div
            key="pizza"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left"
          >
            {/* Left side: Pizza Sliders */}
            <div className="lg:col-span-5 space-y-5 bg-slate-950/40 border border-slate-900 p-5 rounded-2xl">
              <div>
                <h4 className="text-sm font-sans font-bold text-white uppercase flex items-center gap-2">
                  <FolderHeart className="w-4 h-4 text-rose-400" />
                  Portfolio Pizza Slicer 🍕
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Distributing your portfolio holdings is like topping a pizza! Adjust sliders below to slice asset allocations and distribute ingredients beautifully.
                </p>
              </div>

              {/* Pizza Controls */}
              <div className="space-y-4">
                <div className="space-y-1.5 bg-slate-900/30 p-3.5 border border-slate-900 rounded-xl">
                  <div className="flex justify-between items-center text-xs font-sans font-bold">
                    <span className="text-cyan-400">🔵 SOL Slice (Pepperoni topping)</span>
                    <span className="font-mono">{pizzaSol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pizzaSol}
                    onChange={(e) => handlePizzaChange('SOL', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1.5 bg-slate-900/30 p-3.5 border border-slate-900 rounded-xl">
                  <div className="flex justify-between items-center text-xs font-sans font-bold">
                    <span className="text-purple-400">🟣 ETH Slice (Olives topping)</span>
                    <span className="font-mono">{pizzaEth}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pizzaEth}
                    onChange={(e) => handlePizzaChange('ETH', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-1.5 bg-slate-900/30 p-3.5 border border-slate-900 rounded-xl">
                  <div className="flex justify-between items-center text-xs font-sans font-bold">
                    <span className="text-emerald-400">🟢 USDC Slice (Pineapple topping)</span>
                    <span className="font-mono">{pizzaUsdc}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pizzaUsdc}
                    onChange={(e) => handlePizzaChange('USDC', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs font-sans font-bold">
                  <span className="text-slate-400">Total Slices Sum:</span>
                  <span className={pizzaSum === 100 ? 'text-emerald-400' : 'text-red-400'}>
                    {pizzaSum}% {pizzaSum === 100 ? '✓ Balanced Pizza!' : '⚠️ Needs balancing (100% total)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Beautiful Interactive Pizza SVG/Toppings representation */}
            <div className="lg:col-span-7 bg-slate-950/60 border border-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center h-[420px] relative">
              <span className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Dynamic visual allocation
              </span>

              {/* Render Pizza Container */}
              <div className="w-64 h-64 rounded-full bg-[#eab308]/20 border-8 border-amber-900 flex items-center justify-center relative overflow-hidden shadow-inner">
                {/* Visual wedges styled dynamically */}
                <div 
                  className="absolute inset-0 bg-cyan-950/40 border-r-2 border-dashed border-amber-900"
                  style={{ clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((pizzaSol / 100) * 2 * Math.PI - Math.PI / 2)}% ${50 + 50 * Math.sin((pizzaSol / 100) * 2 * Math.PI - Math.PI / 2)}%, 50% 50%)` }}
                />

                <div 
                  className="absolute inset-0 bg-purple-950/40 border-r-2 border-dashed border-amber-900"
                  style={{ clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((pizzaSol / 100) * 2 * Math.PI - Math.PI / 2)}% ${50 + 50 * Math.sin((pizzaSol / 100) * 2 * Math.PI - Math.PI / 2)}%, ${50 + 50 * Math.cos(((pizzaSol + pizzaEth) / 100) * 2 * Math.PI - Math.PI / 2)}% ${50 + 50 * Math.sin(((pizzaSol + pizzaEth) / 100) * 2 * Math.PI - Math.PI / 2)}%, 50% 50%)` }}
                />

                <div 
                  className="absolute inset-0 bg-emerald-950/40"
                  style={{ clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(((pizzaSol + pizzaEth) / 100) * 2 * Math.PI - Math.PI / 2)}% ${50 + 50 * Math.sin(((pizzaSol + pizzaEth) / 100) * 2 * Math.PI - Math.PI / 2)}%, 50% 100%, 0% 100%, 0% 0%, 50% 0%)` }}
                />

                {/* Draw Pepperonis (SOL) */}
                {Array.from({ length: Math.min(10, Math.floor(pizzaSol / 5)) }).map((_, i) => (
                  <motion.div
                    key={`pep-${i}`}
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.2 }}
                    className="absolute text-base select-none z-10"
                    style={{
                      left: `${40 + 35 * Math.cos((i * 36 * Math.PI) / 180)}%`,
                      top: `${40 + 35 * Math.sin((i * 36 * Math.PI) / 180)}%`,
                    }}
                  >
                    🍕
                  </motion.div>
                ))}

                {/* Draw Olives (ETH) */}
                {Array.from({ length: Math.min(10, Math.floor(pizzaEth / 5)) }).map((_, i) => (
                  <motion.div
                    key={`ol-${i}`}
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 4, delay: i * 0.3 }}
                    className="absolute text-sm select-none z-10"
                    style={{
                      left: `${45 + 30 * Math.cos((i * 45 * Math.PI + 120) / 180)}%`,
                      top: `${45 + 30 * Math.sin((i * 45 * Math.PI + 120) / 180)}%`,
                    }}
                  >
                    🫒
                  </motion.div>
                ))}

                {/* Draw Pineapples (USDC) */}
                {Array.from({ length: Math.min(10, Math.floor(pizzaUsdc / 5)) }).map((_, i) => (
                  <motion.div
                    key={`pa-${i}`}
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 3.5, delay: i * 0.15 }}
                    className="absolute text-base select-none z-10"
                    style={{
                      left: `${50 + 25 * Math.cos((i * 40 * Math.PI + 240) / 180)}%`,
                      top: `${50 + 25 * Math.sin((i * 40 * Math.PI + 240) / 180)}%`,
                    }}
                  >
                    🍍
                  </motion.div>
                ))}

                {/* Pizza Crust Outer Ring lines */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#854d0e]/30 pointer-events-none" />
                
                {/* Center of pizza */}
                <div className="w-4 h-4 bg-amber-950 rounded-full border border-amber-900 z-20 flex items-center justify-center text-[7px] text-white font-mono shadow-md" />
              </div>

              {/* Pizza Splitting descriptive legend cards */}
              <div className="flex gap-4 mt-6 text-xs font-sans">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-full" /> SOL ({pizzaSol}%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full" /> ETH ({pizzaEth}%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> USDC ({pizzaUsdc}%)</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: DAILY STREAK GARDEN */}
        {activeTab === 'garden' && (
          <motion.div
            key="garden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <DailyStreakGarden
              streakDays={streakDays}
              onWaterGarden={onWaterStreakGarden}
              onNotification={onNotification}
            />
          </motion.div>
        )}

        {/* TAB 4: COOPERATIVE REDWOOD GOALS */}
        {activeTab === 'redwood' && (
          <motion.div
            key="redwood"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left"
          >
            {/* Left side: Goal and pool controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-sm font-sans font-bold text-white uppercase flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    Cooperative Market Goals
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    Combine your sandbox deposits, quizzes solved, and streaks with classmates to grow a giant **Community Redwood**! Every single savings goal met is water for the roots.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-sans font-bold text-slate-300">
                    <span>Pooled Sandbox Funds:</span>
                    <span className="font-mono text-emerald-400">${coopPooledUsdc.toLocaleString()} / $10,000 USDC</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${(coopPooledUsdc / targetCoopGoal) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Sprout stage (0%)</span>
                    <span>Redwood forest achieved (100%)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handlePoolUsdc}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs rounded-xl shadow-lg transition uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Pool $100 USDC to Redwood Roots 🌱
                  </button>
                </div>
              </div>

              {/* Logs */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                <h5 className="text-xs font-sans font-bold text-slate-300 uppercase tracking-wider mb-3.5">
                  Redwood logs & contributions
                </h5>
                <div className="space-y-3">
                  {coopLogs.map((log, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-sans bg-slate-900/10 border border-slate-900/40 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🌲</span>
                        <span>
                          <strong className="text-slate-300">{log.user}</strong> <span className="text-slate-400">{log.action}</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Giant growing redwood SVG tree layout */}
            <div className="lg:col-span-7 bg-slate-950/60 border border-slate-900 rounded-2xl p-6 h-[460px] flex flex-col items-center justify-between relative overflow-hidden">
              <span className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Cooperative growth visualization
              </span>

              {/* Sun graphic top right */}
              <Sun className="w-8 h-8 text-amber-500/20 absolute right-8 top-8 animate-pulse" />

              {/* Central Redwood Stage rendering */}
              <div className="flex-1 flex flex-col items-center justify-center relative mt-8">
                {/* Beautiful dynamic scaling tree */}
                <motion.div
                  key={redwoodStage.name}
                  initial={{ scale: 0.8, y: 15 }}
                  animate={{ scale: redwoodStage.scale, y: 0 }}
                  className="filter drop-shadow-md relative select-none"
                >
                  {/* Outer circle soft halo glow */}
                  <div className="absolute inset-[-12px] bg-emerald-500/5 rounded-full blur-md animate-pulse" />
                  <span className="text-7xl filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
                    {redwoodStage.emoji}
                  </span>
                </motion.div>

                {/* Dynamic sparkles of community efforts floating up */}
                {coopPooledUsdc > 5000 && (
                  <motion.div
                    animate={{ y: [-15, -45], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, delay: 0.2 }}
                    className="absolute text-xs text-emerald-400"
                  >
                    ✨
                  </motion.div>
                )}
                {coopPooledUsdc > 8000 && (
                  <motion.div
                    animate={{ y: [-20, -55], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: 0.8 }}
                    className="absolute right-10 text-xs text-amber-400"
                  >
                    ✨
                  </motion.div>
                )}
              </div>

              {/* Soil layer base */}
              <div className="w-full max-w-[280px] h-3 bg-amber-900 rounded-full border border-amber-950 shadow-inner mt-4" />

              {/* Stage label card */}
              <div className="w-full p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1 text-center mt-4">
                <h5 className="text-xs font-sans font-bold text-white uppercase tracking-wider">
                  Active Stage: <strong className="text-emerald-400">{redwoodStage.name}</strong>
                </h5>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {redwoodStage.desc} Keep pooling sandbox coins to trigger the elder cosmic phase!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: MOCK INVESTMENT CABINS */}
        {activeTab === 'cabins' && (
          <motion.div
            key="cabins"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left"
          >
            {/* Left side: Cabin room index */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider mb-4">
                  Cozy Digital Cabins 🪵
                </h4>
                <p className="text-xs text-slate-400 leading-normal mb-4">
                  Investment cabins represent private micro-forums where friends chat, evaluate market forecasts, and share their sandbox **Grid Bot recipes** with simple one-click copy deployments.
                </p>

                <div className="space-y-2">
                  <button className="w-full p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-xs font-sans font-bold text-amber-400 text-left flex items-center gap-2">
                    🏠 Cabin #101: Solana Wave Miners
                  </button>
                  <button className="w-full p-3 bg-slate-900/30 border border-transparent hover:bg-slate-900/40 rounded-xl text-xs font-sans text-slate-400 text-left flex items-center gap-2">
                    🏠 Cabin #102: Stable Yield Guild
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Active chat + recipes board */}
            <div className="lg:col-span-8 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h4 className="text-xs font-sans font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏠</span> Solana Wave Miners Cabin
                </h4>
                <span className="text-[10px] font-mono text-slate-500">4 friends inside</span>
              </div>

              {/* Chat Stream */}
              <div className="space-y-3.5 h-[280px] overflow-y-auto pr-1">
                {cabinMessages.map(msg => (
                  <div key={msg.id} className="p-3.5 bg-slate-900/20 border border-slate-900/50 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="font-bold text-slate-300">🐾 {msg.user}</span>
                      <span className="text-[10px] text-slate-500">Just Now</span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{msg.text}</p>

                    {/* Render visual shared bot recipe */}
                    {msg.isRecipe && msg.botConfig && (
                      <div className="mt-2.5 p-3.5 bg-indigo-950/15 border border-indigo-900/30 rounded-lg flex items-center justify-between gap-4">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[9px] font-sans font-bold text-indigo-400 uppercase tracking-wider block">Grid Bot Recipe shared ⚙️</span>
                          <span className="text-xs font-bold text-white font-mono block">SOL Spot Range: ${msg.botConfig.lower} - ${msg.botConfig.upper}</span>
                          <span className="text-[10px] text-slate-400 block">{msg.botConfig.grids} grid levels configured</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeploySharedRecipe(msg.botConfig!)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-sans font-bold rounded-lg transition shrink-0 cursor-pointer"
                        >
                          Deploy Recipe
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input sender */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or share a bot 'recipe'..."
                  value={newCabinMsg}
                  onChange={(e) => setNewCabinMsg(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* TAB 6: FLASHCARD ARENA */}
        {activeTab === 'flashcards' && (
          <motion.div
            key="flashcards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl text-left space-y-6"
          >
            <div>
              <h4 className="text-sm font-sans font-bold text-white uppercase flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-indigo-400" />
                Security Flashcard Battle Arena ⚔️
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Duel against the clock (or classmates) to pair security terminology with their corresponding plain-English descriptions! Strengthen your cyber hygiene skills.
              </p>
            </div>

            {/* Game Panel */}
            {!gameStarted ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-indigo-950/30 border border-indigo-900 rounded-2xl flex items-center justify-center text-3xl">
                  ⚔️
                </div>
                <div>
                  <h5 className="text-sm font-sans font-bold text-white">Duel Student Toby Pup!</h5>
                  <p className="text-xs text-slate-400 mt-1">Toby has set a record of matching 4 cards in 30 seconds. Can you outmatch him?</p>
                </div>
                <button
                  onClick={startFlashcardGame}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs rounded-xl shadow-lg transition uppercase tracking-wider cursor-pointer"
                >
                  Start Flashcard Battle Duel
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* HUD Header */}
                <div className="flex justify-between items-center bg-slate-950/60 border border-slate-900 p-4 rounded-xl">
                  <span className={`text-xs font-sans font-bold ${gameTimeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                    ⏱ Timer: {gameTimeLeft} seconds remaining
                  </span>
                  <span className="text-xs font-sans font-bold text-emerald-400">
                    🏆 Score: {gameScore} points
                  </span>
                  <button
                    onClick={() => setGameStarted(false)}
                    className="text-[10px] text-slate-500 font-sans uppercase hover:text-slate-300"
                  >
                    Give Up
                  </button>
                </div>

                {isGameOver ? (
                  <div className="py-10 text-center space-y-4 bg-slate-900/20 rounded-2xl border border-slate-900">
                    <div className="mx-auto w-14 h-14 bg-emerald-950/30 border border-emerald-900 rounded-full flex items-center justify-center text-2xl">
                      🏆
                    </div>
                    <div>
                      <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider">Duel Completed!</h4>
                      <p className="text-xs text-slate-400 mt-1">Matched {matchedIds.length} cards correctly. Your total score: <strong className="text-emerald-400">{gameScore} points</strong></p>
                    </div>
                    <button
                      onClick={startFlashcardGame}
                      className="px-5 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-sans font-bold rounded-lg border border-slate-800 transition"
                    >
                      Rematch Toby Pup ⚔️
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left side: Term cards */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Terminologies</span>
                      {shuffledTerms.map(t => {
                        const isMatched = matchedIds.includes(t.id);
                        const isSelected = selectedTermId === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            disabled={isMatched}
                            onClick={() => handleMatchSelect('term', t.id)}
                            className={`w-full p-4 text-xs text-left font-sans rounded-xl border transition ${
                              isMatched 
                                ? 'bg-emerald-950/10 border-emerald-950/40 text-emerald-500/40 line-through cursor-not-allowed' 
                                : isSelected 
                                ? 'bg-indigo-950/30 border-indigo-500 text-indigo-300' 
                                : 'bg-slate-900/10 border-slate-850 hover:bg-slate-900/30 hover:border-slate-800 cursor-pointer text-slate-200'
                            }`}
                          >
                            <span className="font-bold">{t.term}</span>
                            {isMatched && <span className="float-right text-[10px] uppercase font-bold text-emerald-500 font-sans">Matched ✔</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right side: Definition cards */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Definitions</span>
                      {shuffledDefs.map(d => {
                        const isMatched = matchedIds.includes(d.id);
                        const isSelected = selectedDefId === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            disabled={isMatched}
                            onClick={() => handleMatchSelect('def', d.id)}
                            className={`w-full p-4 text-xs text-left font-sans rounded-xl border transition ${
                              isMatched 
                                ? 'bg-emerald-950/10 border-emerald-950/40 text-emerald-500/40 line-through cursor-not-allowed' 
                                : isSelected 
                                ? 'bg-indigo-950/30 border-indigo-500 text-indigo-300' 
                                : 'bg-slate-900/10 border-slate-850 hover:bg-slate-900/30 hover:border-slate-800 cursor-pointer text-slate-300'
                            }`}
                          >
                            <span className="leading-relaxed">{d.definition}</span>
                            {isMatched && <span className="float-right text-[10px] uppercase font-bold text-emerald-500 font-sans">Matched ✔</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 7: SANDBOX SHOWCASE GALLERY */}
        {activeTab === 'gallery' && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left"
          >
            {/* Left Column: Upload visual screenshots */}
            <div className="lg:col-span-4 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-4">
              <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-400" />
                Upload to Gallery
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Solved your first **Merkle tree** or bloomed a rare **Golden Lotus** flower in your streak garden? Post your screenshot to the showcase gallery for peer review!
              </p>

              <form onSubmit={handleUploadShowcase} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-sans font-bold uppercase">Artifact Title</label>
                  <input
                    type="text"
                    placeholder="e.g., My 7-Day Streaks"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-sans font-bold uppercase">Artifact Type</label>
                  <select
                    value={newGalleryCategory}
                    onChange={(e) => setNewGalleryCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Growth Garden">Growth Garden Screenshot</option>
                    <option value="Merkle Path">Merkle Path Verification</option>
                    <option value="Pizza Splitter">Pizza Allocation Splitter</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-sans font-bold rounded-xl shadow-lg transition"
                >
                  Publish Artifact
                </button>
              </form>
            </div>

            {/* Right Column: Public wall display */}
            <div className="lg:col-span-8 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-4">
              <div className="border-b border-slate-900 pb-3">
                <h4 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider">
                  Public Sandbox Showcase Wall
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {galleryUploads.map(upload => (
                  <div key={upload.id} className="p-4 bg-slate-900/10 border border-slate-900 rounded-xl flex items-center justify-between gap-4 transition hover:bg-slate-900/20">
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-2xl select-none shrink-0 shadow-inner">
                        {upload.image}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-sans font-bold text-indigo-400 uppercase tracking-wider block">{upload.category}</span>
                        <h5 className="text-xs font-sans font-bold text-white leading-normal">{upload.title}</h5>
                        <p className="text-[10px] text-slate-400 font-sans">By {upload.author}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleLikeUpload(upload.id)}
                        className="p-1.5 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded-lg text-slate-400 hover:text-rose-400 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        👍 {upload.likes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 8: INTERACTIVE EXPLORER CERTIFICATE */}
        {activeTab === 'certificate' && (
          <motion.div
            key="certificate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left"
          >
            {/* Left: Input student details */}
            <div className="lg:col-span-4 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-4">
              <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Customize Diploma
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                As you master security quizzes, compound staking seeds, and test algorithms, your diploma automatically populates. Enter your legal or sandbox alias name to display below.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Student Name on Certificate</label>
                <input
                  type="text"
                  placeholder="e.g., Sandbox Cadet"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Checklist */}
              <div className="space-y-2 bg-slate-900/10 border border-slate-900/50 p-3.5 rounded-xl text-xs font-sans">
                <span className="font-bold text-slate-300">Milestone Requirements:</span>
                <div className="space-y-1.5 mt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Private keys safety quiz solved</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Balanced pizza split formulated</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>First sandbox streak garden bloomed</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePrintCertificate}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download / Print Diploma (PDF)
              </button>
            </div>

            {/* Right: Gorgeous Certificate visualization */}
            <div className="lg:col-span-8 bg-slate-900/10 border border-slate-900 p-6 rounded-3xl relative overflow-hidden flex items-center justify-center min-h-[420px]">
              {/* Outer decorative borders representing premium diploma */}
              <div className="w-full max-w-xl bg-slate-950 border-8 border-double border-amber-500/40 p-8 rounded-2xl relative text-center space-y-6 shadow-inner">
                {/* Gold Seal top watermarks */}
                <div className="absolute top-4 left-4 text-xs font-mono text-amber-500/20">NEXUS ACADEMY</div>
                <div className="absolute top-4 right-4 text-xs font-mono text-amber-500/20">VERIFIED NO: #A94-981</div>

                <div className="space-y-2">
                  <span className="text-3xl select-none">🏆</span>
                  <h3 className="text-sm font-mono tracking-widest text-amber-500 font-extrabold uppercase">
                    Diploma of Sandbox Cryptography
                  </h3>
                  <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-sans text-slate-400 italic">This highly secure credential certifies that</p>
                  <h4 className="text-xl font-sans font-black text-white tracking-wide py-2 uppercase">
                    {studentName}
                  </h4>
                  <p className="text-[11px] font-sans text-slate-400 leading-relaxed max-w-md mx-auto">
                    has successfully navigated our isolated trading sandboxes, formulated balanced portfolio pizzas, and mastered the fundamental cryptographic safety guidelines of decentralized finance.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900/80 pt-6 text-xs font-sans">
                  <div className="flex flex-col items-center">
                    <span className="text-white font-mono font-bold">Clara Hamster</span>
                    <span className="text-[9px] text-slate-500 uppercase">Sandbox Dean Signature</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-white font-mono font-bold">Chloe Owl</span>
                    <span className="text-[9px] text-slate-500 uppercase">Security Chancellor</span>
                  </div>
                </div>

                {/* Decorative gold seal stamp */}
                <div className="absolute bottom-4 right-8 w-14 h-14 bg-amber-500/10 rounded-full border border-dashed border-amber-500/30 flex items-center justify-center animate-spin" style={{ animationDuration: '30s' }}>
                  <span className="text-[8px] font-mono font-bold text-amber-500 uppercase">OFFICIAL SEAL</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Referral sticker codes checklist helper */}
      <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <h4 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Referral Code Sticker packs
          </h4>
          <span className="text-[10px] font-sans text-slate-400">Codes cracked: {unlockedStickers.length} of {STICKER_PACKS.length}</span>
        </div>

        <form onSubmit={handleApplyReferral} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter invitation code (e.g. NEON-EDU-77)..."
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
          >
            Unlock Sticker
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-2">
          {STICKER_PACKS.map(pack => {
            const isUnlocked = unlockedStickers.includes(pack.id);
            return (
              <div 
                key={pack.id} 
                className={`p-3.5 rounded-xl border flex flex-col items-center text-center justify-between h-40 relative overflow-hidden transition-all duration-300 ${isUnlocked ? 'bg-indigo-950/15 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.08)]' : 'bg-slate-900/10 border-slate-900 opacity-60'}`}
              >
                <div className="text-3xl filter drop-shadow-md select-none">{isUnlocked ? pack.emoji : '🔒'}</div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-sans font-bold text-white leading-tight">{pack.name}</h5>
                  <p className="text-[9px] text-slate-400 leading-normal line-clamp-2">{pack.desc}</p>
                </div>
                <span className="text-[8px] font-mono uppercase bg-slate-950/40 text-slate-400 border border-slate-850/50 px-1.5 py-0.5 rounded">
                  {isUnlocked ? 'Unlocked ✔' : `Code: ${pack.codeRequired}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
