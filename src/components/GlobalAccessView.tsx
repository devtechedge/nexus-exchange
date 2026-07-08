import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Sparkles, 
  Languages, 
  Volume2, 
  VolumeX, 
  Palette, 
  Smile, 
  Clock, 
  HelpCircle, 
  Check, 
  Info, 
  ArrowLeftRight, 
  ShieldCheck, 
  BookOpen, 
  Moon, 
  Sun, 
  Award, 
  Minimize2, 
  Plus, 
  Minus,
  Eye,
  Heart
} from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  price: number;
}

interface GlobalAccessViewProps {
  assets: Asset[];
  balances: { [key: string]: number };
  setBalances: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
  activeAccentColor: string;
  setActiveAccentColor: React.Dispatch<React.SetStateAction<string>>;
  selectedAvatar: string;
  setSelectedAvatar: React.Dispatch<React.SetStateAction<string>>;
}

// Cascaded, simplified explanations for multi-generational users
const CULTURAL_GLOSSARY = [
  {
    term: 'Smart Contract',
    jargon: 'A self-executing contract with terms directly written into code lines on a decentralized ledger.',
    casual: '🤝 Digital Handshake Agreement. A magic vending machine that gives you your snack automatically once you put in the correct coins, with no cashier needed.',
    analogies: {
      en: 'Vending Machine',
      es: 'Máquina Expendedora',
      hi: 'ऑटोमेटिक वेंडिंग मशीन',
      ja: '自動販売機',
      fr: 'Distributeur Automatique',
      de: 'Verkaufsautomat'
    }
  },
  {
    term: 'Liquidity Pool',
    jargon: 'Crowdsourced pools of cryptocurrencies locked in a smart contract to facilitate decentralized trading.',
    casual: '🌾 Community Seed Pot. A shared market table where everyone pools their fruits so anyone can swap an apple for an orange instantly without waiting for a buyer.',
    analogies: {
      en: 'Community Fruit Table',
      es: 'Mesa de Intercambio Vecinal',
      hi: 'साझा अनाज मंडी',
      ja: '共同の果物市場',
      fr: 'Table de Troc Communautaire',
      de: 'Gemeinschaftlicher Marktplatz'
    }
  },
  {
    term: 'Volatility',
    jargon: 'A statistical measure of the dispersion of returns for a given security or market index.',
    casual: '🎢 Price Rollercoaster. When a coin goes up to the sky and drops to the grass within a single hour. Perfect for thrill-seekers, but requires seatbelts!',
    analogies: {
      en: 'Rollercoaster Ride',
      es: 'Montaña Rusa Financiera',
      hi: 'मूल्य का झूला (ऊतार-चढ़ाव)',
      ja: '価格の乱高下ジェットコースター',
      fr: 'Montagnes Russes',
      de: 'Preise-Achterbahn'
    }
  },
  {
    term: 'Gas Fee',
    jargon: 'Payments made by users to compensate for the computing energy required to process transactions.',
    casual: '✉️ Digital Postage Stamp. A tiny toll fee you pay to the internet highway miners to carry your letter from your wallet safely to your friend.',
    analogies: {
      en: 'Postage Stamp / Bus Fare',
      es: 'Sello Postal Digital',
      hi: 'डिजिटल डाक टिकट / बस किराया',
      ja: 'デジタルの切手代',
      fr: 'Timbre Poste Électronique',
      de: 'Digitale Briefmarke'
    }
  }
];

const MULTILINGUAL_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', greeting: 'Welcome, friend!' },
  { code: 'es', name: 'Spanish', native: 'Español', greeting: '¡Bienvenido, amigo!' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', greeting: 'स्वागत है, मित्र!' },
  { code: 'ja', name: 'Japanese', native: '日本語', greeting: 'ようこそ、友よ！' },
  { code: 'fr', name: 'French', native: 'Français', greeting: 'Bienvenue, mon ami !' },
  { code: 'de', name: 'German', native: 'Deutsch', greeting: 'Willkommen, Freund!' },
  { code: 'pt', name: 'Portuguese', native: 'Português', greeting: 'Bem-vindo, amigo!' },
  { code: 'zh', name: 'Chinese', native: '中文', greeting: '欢迎，朋友！' },
  { code: 'ar', name: 'Arabic', native: 'العربية', greeting: 'أهلاً بك يا صديقي!' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', greeting: 'Karibu, rafiki!' },
  { code: 'tl', name: 'Tagalog', native: 'Tagalog', greeting: 'Mabuhay, kaibigan!' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', greeting: 'Chào mừng, bạn!' }
];

const COSTUMES = [
  { id: 'original', name: 'Classic Hamster', emoji: '🐹', desc: 'Clara’s original cozy design.', accessory: 'None' },
  { id: 'lunar_robe', name: 'Lunar New Year Robe', emoji: '🏮🐹✨', desc: 'Elegant crimson silk robe with gold embroidery representing wealth.', accessory: 'Silk Lantern' },
  { id: 'diwali_sherwani', name: 'Diwali Sherwani', emoji: '🪔🐹🌟', desc: 'Bright golden ceremonial tunic celebrating the triumph of light.', accessory: 'Clay Diya Lamp' },
  { id: 'festive_scarf', name: 'Cozy Alpine Scarf', emoji: '🧣🐹❄️', desc: 'Thick hand-knit wool muffler to stay warm during winter trading hours.', accessory: 'Knitted Hat' },
  { id: 'clover_cap', name: 'Lucky Emerald Cap', emoji: '🍀🐹🎩', desc: 'A stylish dark green top-hat carrying a four-leaf clover for yield luck.', accessory: 'Golden Pipe' },
  { id: 'feather_band', name: 'Celestial Feather Band', emoji: '🪶🐹☀️', desc: 'Nature inspired organic headband symbolizing sky high growth.', accessory: 'Sun Medallion' },
  { id: 'royal_cape', name: 'Royal Crown & Cape', emoji: '👑🐹🍷', desc: 'Deep purple velvet cape and crown celebrating sovereign coin holdings.', accessory: 'Gold Scepter' }
];

const HOLIDAYS = [
  { id: 'default', name: 'Cyber Space (Default)', emoji: '🌌', accent: 'cyan', decoration: 'Standard neon lines' },
  { id: 'lunar_new_year', name: 'Lunar New Year Festival', emoji: '🏮', accent: 'rose', decoration: 'Crimson paper lanterns & golden cherry blossoms 🌸' },
  { id: 'diwali', name: 'Diwali Lights Festival', emoji: '🪔', accent: 'amber', decoration: 'Rows of burning clay lamps & marigold flower arches 🌻' },
  { id: 'eid', name: 'Eid Mubarak Festival', emoji: '🌙', accent: 'emerald', decoration: 'Crescent moons, green lanterns & glittering cosmic stars ⭐' },
  { id: 'pride', name: 'Pride Celebration', emoji: '🏳️‍🌈', accent: 'pink', decoration: 'Flowing rainbow glitter ribbon trails across pages 🌈' },
  { id: 'hanukkah', name: 'Hanukkah Festival', emoji: '🕎', accent: 'cyan', decoration: 'Silver star grids & glowing nine-branch menorah candles 🕯️' },
  { id: 'halloween', name: 'Halloween Carnival', emoji: '🎃', accent: 'orange', decoration: 'Spooky carved jack-o-lanterns & glowing purple cobwebs 🕷️' }
];

const COLORBLIND_PALETTES = [
  { id: 'normal', name: 'Cyber Dark (Default)', desc: 'High contrast neon blue and greens' },
  { id: 'deuteranopia', name: 'Deuteranopia Assist (Red-Green)', desc: 'Optimized high contrast using safe royal blues and deep golds' },
  { id: 'protanopia', name: 'Protanopia Assist (Red-Blind)', desc: 'Violet-pink markers paired with high intensity cadmium yellow indicators' },
  { id: 'monochrome', name: 'Stark Monochrome', desc: 'Pure black, dark slate, and stark white. Perfect for low vision and glare' }
];

const GLOBE_COUNTRIES = [
  { name: 'United States', symbol: '$', rate: 1.0, code: 'USD', x: '50%', y: '35%', color: 'bg-cyan-400' },
  { name: 'Japan', symbol: '¥', rate: 158.20, code: 'JPY', x: '82%', y: '40%', color: 'bg-rose-400' },
  { name: 'Eurozone', symbol: '€', rate: 0.92, code: 'EUR', x: '62%', y: '28%', color: 'bg-emerald-400' },
  { name: 'United Kingdom', symbol: '£', rate: 0.78, code: 'GBP', x: '58%', y: '24%', color: 'bg-indigo-400' },
  { name: 'India', symbol: '₹', rate: 83.50, code: 'INR', x: '73%', y: '48%', color: 'bg-amber-400' },
  { name: 'Australia', symbol: 'A$', rate: 1.49, code: 'AUD', x: '85%', y: '75%', color: 'bg-purple-400' },
  { name: 'Brazil', symbol: 'R$', rate: 5.42, code: 'BRL', x: '42%', y: '68%', color: 'bg-pink-400' }
];

export default function GlobalAccessView({
  assets,
  balances,
  setBalances,
  onNotification,
  activeAccentColor,
  setActiveAccentColor,
  selectedAvatar,
  setSelectedAvatar
}: GlobalAccessViewProps) {
  // --- ROOT ACCESSIBILITY STATES ---
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');
  const [currencyRate, setCurrencyRate] = useState<number>(1.0);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [activeLang, setActiveLang] = useState<string>('en');
  const [activeCostume, setActiveCostume] = useState<string>('original');
  const [activeHoliday, setActiveHoliday] = useState<string>('default');
  const [colorBlindPal, setColorBlindPal] = useState<string>('normal');
  const [voiceNarrator, setVoiceNarrator] = useState<boolean>(false);
  const [spokenSubtitle, setSpokenSubtitle] = useState<string>('');

  // Interactive Simple Mode Trading Simulation State (for demoing simple buttons instead of sliders)
  const [simpleTradeAmount, setSimpleTradeAmount] = useState<number>(10);
  const [selectedSimpleAsset, setSelectedSimpleAsset] = useState<string>('SOL');

  // Interactive Globe Rotation index
  const [globeAngle, setGlobeAngle] = useState<number>(0);

  // Sign Language Interpreter overlay simulation
  const [activeAslWord, setActiveAslWord] = useState<string | null>(null);
  const [aslInterpreting, setAslInterpreting] = useState<boolean>(false);

  // Abstract Avatar Customizer Elements
  const [abstractShape, setAbstractShape] = useState<'sun' | 'moon' | 'mountain' | 'hexagon' | 'crystal' | 'wave'>('sun');
  const [abstractColor, setAbstractColor] = useState<'cyan' | 'amber' | 'rose' | 'emerald' | 'violet'>('cyan');
  const [abstractSpin, setAbstractSpin] = useState<boolean>(false);

  // Rotate the globe visually every few seconds to keep it interactive
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobeAngle(prev => (prev + 1) % 360);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Native Web Speech Narrator trigger
  const triggerSpeech = (text: string) => {
    setSpokenSubtitle(text);
    if (!voiceNarrator) return;
    
    // Check if SpeechSynthesis is supported
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel current speaking
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a warm, friendly voice
      const voices = window.speechSynthesis.getVoices();
      const elegantVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural') || v.lang.startsWith('en'));
      if (elegantVoice) {
        utterance.voice = elegantVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Friendly higher pitch
      window.speechSynthesis.speak(utterance);
    }
  };

  // Triggers visual narration text when active costumer shifts
  const handleCostumeChange = (cid: string) => {
    setActiveCostume(cid);
    const costume = COSTUMES.find(c => c.id === cid);
    if (costume) {
      triggerSpeech(`Squeak! I am now wearing my beautiful ${costume.name}! I look absolutely marvelous! This outfit gives me so much joy.`);
      onNotification('success', `Dressed Clara the Hamster in the ${costume.name}! 🐹👗`);
    }
  };

  // Convert USD into current selected nation symbol
  const convertCash = (amountUSD: number) => {
    const val = amountUSD * currencyRate;
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`;
  };

  // Multi-generational Simple Mode math adjusters
  const adjustSimpleAmount = (dir: 'up' | 'down') => {
    if (dir === 'up') {
      setSimpleTradeAmount(prev => prev + 10);
    } else {
      setSimpleTradeAmount(prev => Math.max(10, prev - 10));
    }
    triggerSpeech(`Adjusted practice trade size to ${simpleTradeAmount + (dir === 'up' ? 10 : -10)} dollars.`);
  };

  // Simple Mode buy simulator
  const handleSimpleExecuteTrade = () => {
    const assetObj = assets.find(a => a.symbol === selectedSimpleAsset);
    if (!assetObj) return;

    const totalCost = simpleTradeAmount;
    const currentCashBalance = balances['USDC'] || 0;

    if (totalCost > currentCashBalance) {
      triggerSpeech("Hold on! You do not have enough practice dollars in your piggy bank to perform this trade. Try decreasing the amount first.");
      onNotification('error', 'Insufficient spot funds! Earn more mock wheat bushels first.');
      return;
    }

    // Process mock trade
    const coinQty = totalCost / assetObj.price;
    setBalances(prev => ({
      ...prev,
      USDC: prev['USDC'] - totalCost,
      [selectedSimpleAsset]: (prev[selectedSimpleAsset] || 0) + coinQty
    }));

    triggerSpeech(`Hooray! Successfully exchanged ${totalCost} practice dollars for ${coinQty.toFixed(4)} ${selectedSimpleAsset} coins!`);
    onNotification('success', `Exchanged $${totalCost} USDC for ${coinQty.toFixed(4)} ${selectedSimpleAsset}! 💵🔄`);
  };

  // Sign language video overlay trigger
  const triggerAslInterpretation = (word: string) => {
    setActiveAslWord(word);
    setAslInterpreting(true);
    triggerSpeech(`Triggering sign language interpreter visual for ${word}.`);
    
    // Auto-timeout translation loop simulation
    setTimeout(() => {
      setAslInterpreting(false);
    }, 4500);
  };

  // Abstract Profile Maker applier
  const applyAbstractAvatar = () => {
    setSelectedAvatar(`abstract_${abstractShape}_${abstractColor}`);
    triggerSpeech("Successfully created and saved your gender-neutral abstract profile icon!");
    onNotification('success', 'Saved your geometric abstract profile icon successfully! ☀️🎨');
  };

  // Holiday theme switcher
  const handleHolidayChange = (hid: string) => {
    setActiveHoliday(hid);
    const holiday = HOLIDAYS.find(h => h.id === hid);
    if (holiday) {
      setActiveAccentColor(holiday.accent);
      triggerSpeech(`Visual theme shifted to celebrate ${holiday.name}! Custom banners have been decorated.`);
      onNotification('success', `Applied the ${holiday.name} decorative color profile! 🎆`);
    }
  };

  return (
    <div className={`space-y-8 ${simpleMode ? 'text-lg' : 'text-sm'} transition-all duration-300`}>
      
      {/* NARRATOR SUBTITLE POPUP SUB BAR */}
      <AnimatePresence>
        {spokenSubtitle && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3 bg-indigo-950/90 border-b border-indigo-500/40 text-indigo-300 flex items-center justify-between text-xs font-mono rounded-xl gap-4 shadow-xl z-20"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🗣️</span>
              <p className="font-semibold italic">"{spokenSubtitle}"</p>
            </div>
            <button
              onClick={() => setSpokenSubtitle('')}
              className="text-indigo-400 hover:text-white cursor-pointer font-bold text-xs shrink-0"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP INCLUSIVE ACCESS MASTER PANEL */}
      <div className={`p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20 border border-slate-900 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl`}>
        {/* Absolute Glowing rays */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10 text-left">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              🌎 Global & Multi-Generational Access
            </span>
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              Batch 8 Live
            </span>
          </div>
          
          <h2 className="text-xl md:text-2xl font-sans font-extrabold text-white tracking-tight">
            Universal Usability & Inclusion Suite
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-sans">
            We believe blockchain education should be welcoming to everyone! This workspace is custom-engineered to adapt for elderly grandparents, curious children, physical-access needs, and diverse global cultures. Use the controls below to transform your interface seamlessly.
          </p>
        </div>

        {/* VOICE-GUIDED READER TOGGLER */}
        <div className="flex flex-col items-center bg-slate-900/60 border border-slate-800 p-4 rounded-2xl shrink-0 gap-3 text-center min-w-[180px] relative z-10">
          <div className="flex items-center justify-between w-full border-b border-slate-800/60 pb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Voice Companion</span>
            <span className={`w-2 h-2 rounded-full ${voiceNarrator ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          </div>

          <button
            onClick={() => {
              const next = !voiceNarrator;
              setVoiceNarrator(next);
              if (next) {
                setTimeout(() => {
                  triggerSpeech("Hello! I am your companion reader voice. Squeak! I will now speak out key actions, prices, and guide you through security settings!");
                }, 100);
              } else {
                setSpokenSubtitle('');
              }
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
              voiceNarrator ? 'bg-indigo-500 text-slate-950 shadow-lg shadow-indigo-500/20' : 'bg-slate-850 text-slate-400 hover:text-white'
            }`}
          >
            {voiceNarrator ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-wider font-extrabold">
            {voiceNarrator ? 'Narrator Active' : 'Narrator Muted'}
          </span>
        </div>
      </div>

      {/* QUICK MULTI-GENERATIONAL SIMPLE MODE TOGGLE BANNER */}
      <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h3 className="text-sm font-sans font-extrabold text-white flex items-center gap-2">
            <span className="text-xl">👴👵👶</span>
            Multi-Generational Simple Mode
          </h3>
          <p className="text-xs text-slate-400 max-w-xl font-sans">
            Instantly scales up fonts, increases visual color contrasts, and translates sliders/complex variables into large, physical clicker buttons. Ideal for senior citizens and young students!
          </p>
        </div>

        <button
          onClick={() => {
            const next = !simpleMode;
            setSimpleMode(next);
            triggerSpeech(next ? "Simple mode active. Font sizes increased. Sliders replaced with buttons." : "Simple mode deactivated. Standard layouts restored.");
            onNotification('info', next ? 'Activated Simple Mode interface!' : 'Returned to standard layout.');
          }}
          className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition cursor-pointer flex items-center gap-2 ${
            simpleMode 
              ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20' 
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          {simpleMode ? '🌟 Simple Mode ON' : '⚙️ Turn Simple Mode ON'}
        </button>
      </div>

      {/* TWO COLUMN GRID OF SPECIAL INCLUSIVE CAPABILITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMN LEFT: 3D GLOBE & SIMULATORS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* GLOBAL CURRENCY GLOBE */}
          <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-6 text-left relative overflow-hidden">
            <div>
              <h3 className="text-sm font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-400" />
                Global Currency Converter Globe
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Click on a Country Node on the spinning sphere below. Instantly converts all mock balances and asset prices into that local currency!
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* STYLIZED SPINNING GLOBE DISPLAY */}
              <div className="relative w-48 h-48 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900/10 shrink-0 shadow-inner overflow-hidden">
                {/* 3D Circular Gradients and Grid Lines */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-transparent to-indigo-950/30 rounded-full" />
                <div className="absolute inset-2 border border-slate-800/40 rounded-full animate-pulse" />
                
                {/* Animated longitude line rotation inside SVG */}
                <svg className="absolute w-full h-full text-indigo-500/5" viewBox="0 0 100 100">
                  <ellipse cx="50" cy="50" rx={Math.abs(Math.sin(globeAngle * Math.PI / 180) * 45)} ry="45" stroke="currentColor" fill="none" strokeWidth="0.5" />
                  <ellipse cx="50" cy="50" rx={Math.abs(Math.cos(globeAngle * Math.PI / 180) * 45)} ry="45" stroke="currentColor" fill="none" strokeWidth="0.5" />
                  <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" />
                </svg>

                {/* Country Node Spots overlaid */}
                {GLOBE_COUNTRIES.map((country) => {
                  const isActive = currencyCode === country.code;
                  return (
                    <button
                      key={country.code}
                      onClick={() => {
                        setCurrencySymbol(country.symbol);
                        setCurrencyRate(country.rate);
                        setCurrencyCode(country.code);
                        triggerSpeech(`Wallet base currency translated to ${country.name} ${country.code}. Multiplier exchange rate set to ${country.rate}.`);
                        onNotification('success', `Exchanged presentation currency to ${country.symbol} ${country.code}! 🌎`);
                      }}
                      style={{ left: country.x, top: country.y }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold cursor-pointer transition-all duration-300 ${
                        isActive 
                          ? 'bg-emerald-500 border-white scale-125 z-10 shadow-[0_0_10px_#10b981]' 
                          : 'bg-slate-850 border-slate-700 hover:border-slate-500 hover:scale-110'
                      }`}
                      title={country.name}
                    >
                      <span className="text-slate-100">{country.symbol.substring(0, 1)}</span>
                    </button>
                  );
                })}

                {/* Rotating Earth core icon */}
                <div className="text-5xl select-none animate-spin" style={{ animationDuration: '60s' }}>🌍</div>
              </div>

              {/* ACTIVE CONVERTED VALUES DEMONSTRATOR */}
              <div className="flex-1 w-full space-y-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Current Presentation Ledger</span>

                <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-3 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Selected Region:</span>
                    <span className="text-white font-bold">
                      {GLOBE_COUNTRIES.find(c => c.code === currencyCode)?.name || 'United States'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-900/80 pt-2">
                    <span className="text-slate-400">Vegas Piggy Bank Cash:</span>
                    <span className="text-emerald-400 font-extrabold">{convertCash(balances['USDC'] || 15420.50)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Solana Spot Price:</span>
                    <span className="text-indigo-300 font-bold">{convertCash(145.25)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Ethereum Spot Price:</span>
                    <span className="text-indigo-300 font-bold">{convertCash(3240.10)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {GLOBE_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrencySymbol(c.symbol);
                        setCurrencyRate(c.rate);
                        setCurrencyCode(c.code);
                        triggerSpeech(`Presenting in ${c.name} ${c.code}.`);
                      }}
                      className={`px-2 py-1 text-[10px] font-mono rounded border transition cursor-pointer ${
                        currencyCode === c.code 
                          ? 'bg-slate-800 border-indigo-500 text-indigo-400 font-bold' 
                          : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {c.code} ({c.symbol})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC INTERACTIVE TRADING: STANDARD SLIDER VS SIMPLE MODE BUTTONS */}
          <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
            <div>
              <h3 className="text-sm font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                Inclusive Practice Exchange Panel
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Experience how Simple Mode transforms complex decimal fields and sliders into friendly, bold tactile click buttons!
              </p>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-5">
              
              {/* Asset Selector */}
              <div className="flex items-center justify-between">
                <span className={`${simpleMode ? 'text-sm font-bold text-slate-200' : 'text-xs text-slate-400'}`}>Select Practice Coin:</span>
                <div className="flex gap-1.5">
                  {['SOL', 'ETH', 'LINK'].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => {
                        setSelectedSimpleAsset(sym);
                        triggerSpeech(`Swapped active trading seed to ${sym}`);
                      }}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border cursor-pointer ${
                        selectedSimpleAsset === sym 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUANTITY CHANGER: TRANSFORMS BASED ON SIMPLE MODE STATE */}
              <div className="space-y-2">
                <span className={`${simpleMode ? 'text-sm font-bold text-slate-200 block' : 'text-xs text-slate-400 block'}`}>
                  Trade Size Amount:
                </span>

                {simpleMode ? (
                  /* SIMPLIFIED CLICKER SYSTEM */
                  <div className="flex items-center justify-between gap-4 p-2 bg-slate-950 rounded-2xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => adjustSimpleAmount('down')}
                      className="w-12 h-12 rounded-xl bg-red-950/40 hover:bg-red-900/20 text-red-400 text-2xl font-bold flex items-center justify-center cursor-pointer select-none active:scale-95"
                    >
                      <Minus className="w-6 h-6" />
                    </button>

                    <div className="text-center">
                      <span className="text-2xl font-mono font-black text-emerald-400">
                        {currencySymbol}{(simpleTradeAmount * currencyRate).toFixed(0)}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-mono uppercase font-bold tracking-wider">
                        {currencyCode} value
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustSimpleAmount('up')}
                      className="w-12 h-12 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/20 text-emerald-400 text-2xl font-bold flex items-center justify-center cursor-pointer select-none active:scale-95"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  /* STANDARD SLIDER CONTROL */
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500">Min: $10</span>
                      <span className="text-emerald-400 font-bold">${simpleTradeAmount} USDC</span>
                      <span className="text-slate-500">Max: $200</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={simpleTradeAmount}
                      onChange={(e) => setSimpleTradeAmount(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <span className="text-[9px] text-slate-500 block italic">Drag range slider slider bar to adjust size</span>
                  </div>
                )}
              </div>

              {/* TRANSACTION PREVIEW IN LOCAL CURRENCY */}
              <div className="p-3.5 bg-slate-950 rounded-xl space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Unit Cost:</span>
                  <span className="text-slate-300">
                    1 {selectedSimpleAsset} = {convertCash(assets.find(a => a.symbol === selectedSimpleAsset)?.price || 145)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 border-t border-slate-900/80 pt-1.5 mt-1">
                  <span>Est. Output:</span>
                  <span className="text-emerald-400 font-bold">
                    +{(simpleTradeAmount / (assets.find(a => a.symbol === selectedSimpleAsset)?.price || 145)).toFixed(4)} {selectedSimpleAsset}
                  </span>
                </div>
              </div>

              <button
                id="btn-simple-trade-buy"
                onClick={handleSimpleExecuteTrade}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-sans font-extrabold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/10"
              >
                <span>EXECUTE PRACTICE SWAP</span>
                <Check className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          {/* GLOBAL DAYLIGHT TRADING HOURS (SUN AND MOON CLOCKS) */}
          <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
            <div>
              <h3 className="text-sm font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Global Daylight Trading Clocks
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing active daylight banking hours for major global financial centers. Markets operate on distinct planetary sun cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { city: 'Tokyo (TSE)', zone: 'UTC+9', hours: '09:00 - 15:00', icon: '🇯🇵', isDay: false, color: 'border-purple-900/40 bg-purple-950/10' },
                { city: 'London (LSE)', zone: 'UTC+1', hours: '08:00 - 16:30', icon: '🇬🇧', isDay: true, color: 'border-amber-900/40 bg-amber-950/10' },
                { city: 'New York (NYSE)', zone: 'UTC-5', hours: '09:30 - 16:00', icon: '🇺🇸', isDay: true, color: 'border-cyan-900/40 bg-cyan-950/10' }
              ].map((clock, i) => (
                <div key={i} className={`p-4 rounded-2xl border text-center space-y-2.5 ${clock.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{clock.icon}</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{clock.zone}</span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-white block">{clock.city}</span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{clock.hours}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-900/60 flex items-center justify-center gap-1.5">
                    {clock.isDay ? (
                      <span className="text-xs text-amber-400 flex items-center gap-1 font-sans font-bold text-[9px]">
                        <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
                        DAYTIME ACTIVE
                      </span>
                    ) : (
                      <span className="text-xs text-purple-400 flex items-center gap-1 font-sans font-bold text-[9px]">
                        <Moon className="w-3.5 h-3.5 text-purple-400" />
                        OVERNIGHT REST
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN RIGHT: TRANSLATED GLOSSARY, ACCENT THEMES & COSTUMES (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CULTURAL MASCOT COSTUMES FOR CLARA */}
          <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-400" />
                Clara’s Cultural Costumes
              </h3>
              <span className="text-[9px] font-mono text-slate-500">Mascot Closet</span>
            </div>

            {/* Render selected Clara preview dress */}
            <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-center gap-4 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/10 to-indigo-500/10 border border-slate-800 flex items-center justify-center text-4xl shrink-0 select-none relative animate-bounce" style={{ animationDuration: '3s' }}>
                <span>
                  {COSTUMES.find(c => c.id === activeCostume)?.emoji.substring(0, 2) || '🐹'}
                </span>
                <span className="absolute -bottom-1 -right-1 text-xs">
                  {COSTUMES.find(c => c.id === activeCostume)?.emoji.substring(2) || ''}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-100 block">
                  Wearing: {COSTUMES.find(c => c.id === activeCostume)?.name || 'Classic'}
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {COSTUMES.find(c => c.id === activeCostume)?.desc || 'Clara’s classic helper robe.'}
                </p>
                <div className="text-[9px] text-amber-400 font-mono">
                  Accessory item: <strong className="font-bold underline">{COSTUMES.find(c => c.id === activeCostume)?.accessory || 'Seeds'}</strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {COSTUMES.map((cos) => (
                <button
                  key={cos.id}
                  onClick={() => handleCostumeChange(cos.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between space-y-1 cursor-pointer transition ${
                    activeCostume === cos.id 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                      : 'bg-slate-900 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{cos.emoji.substring(0, 2)}</span>
                    {activeCostume === cos.id && <Check className="w-3 h-3 text-amber-400" />}
                  </div>
                  <span className="text-[10px] font-bold text-white truncate block">{cos.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MULTILINGUAL CASUAL TRANSLATED GLOSSARY */}
          <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-indigo-400" />
                Casually Translated Glossary
              </h3>
              <span className="text-[9px] font-mono text-slate-500">Multilingual Analogies</span>
            </div>

            {/* Language buttons bar */}
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
              {MULTILINGUAL_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setActiveLang(lang.code);
                    triggerSpeech(lang.greeting);
                    onNotification('info', `Swapped glossary translator to ${lang.name}! 📚`);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border shrink-0 transition cursor-pointer ${
                    activeLang === lang.code 
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {lang.native}
                </button>
              ))}
            </div>

            {/* Render Translated list */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {CULTURAL_GLOSSARY.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-white">{item.term}</span>
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded">
                      Analogy: {item.analogies[activeLang as keyof typeof item.analogies] || item.analogies['en']}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 italic leading-snug">
                    Standard Jargon: "{item.jargon}"
                  </p>

                  <div className="p-2.5 bg-slate-950/80 rounded-lg text-[10px] font-sans border border-slate-900 text-slate-300 leading-relaxed font-semibold">
                    {item.casual}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FESTIVE HOLIDAY ACCENT DECORATOR CALENDAR */}
          <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-400" />
                Festive Holiday Calendar Accents
              </h3>
              <span className="text-[9px] font-mono text-slate-500">Color Profiles</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              We automatically dress the exchange dashboard in thematic decorations to celebrate global multi-cultural holiday schedules! Try applying them manually:
            </p>

            <div className="space-y-1.5">
              {HOLIDAYS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleHolidayChange(h.id)}
                  className={`w-full p-2.5 rounded-xl border text-xs text-left flex items-center justify-between cursor-pointer transition ${
                    activeHoliday === h.id 
                      ? 'bg-slate-900 border-indigo-500 text-white font-bold' 
                      : 'bg-slate-900/40 border-slate-900/60 text-slate-400 hover:text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{h.emoji}</span>
                    <div>
                      <span className="block font-sans font-bold text-[11px] text-slate-200">{h.name}</span>
                      <span className="text-[9px] text-slate-500 block">{h.decoration}</span>
                    </div>
                  </div>

                  <span className={`w-3 h-3 rounded-full bg-${h.accent}-400`} />
                </button>
              ))}
            </div>
          </div>

          {/* EYE-FRIENDLY COLOR BLIND OPTIMIZATIONS */}
          <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400 animate-pulse" />
                Eye-Friendly Color Palettes
              </h3>
              <span className="text-[9px] font-mono text-slate-500">A11Y Standard</span>
            </div>

            <div className="space-y-2">
              {COLORBLIND_PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => {
                    setColorBlindPal(pal.id);
                    triggerSpeech(`Applied colorblind assist profile: ${pal.name}`);
                    onNotification('info', `Swapped palette assist to ${pal.name}! 👁️`);
                  }}
                  className={`w-full p-3 rounded-xl border text-xs text-left flex flex-col justify-between cursor-pointer transition ${
                    colorBlindPal === pal.id 
                      ? 'bg-slate-900 border-cyan-500 text-white font-bold' 
                      : 'bg-slate-900/20 border-slate-900 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span className="block font-bold text-slate-200">{pal.name}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5 leading-snug">{pal.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SIGN LANGUAGE VIDEO GUIDES INTERPRETER OVERLAY */}
          <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
                Sign Language (ASL) Interpreters
              </h3>
              <span className="text-[9px] font-mono text-slate-500">Visual Signing</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Click any security or blockchain term below. Our animated visual signing overlay will show the hand signs explaining the concepts:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {['Private Key', 'Blockchain Ledger', 'Staking Seed', 'Digital Wallet'].map((word) => (
                <button
                  key={word}
                  onClick={() => triggerAslInterpretation(word)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-sans font-bold text-slate-200 rounded-lg cursor-pointer transition flex items-center gap-1"
                >
                  <span>🎥 {word}</span>
                </button>
              ))}
            </div>

            {/* VISUAL ASL FLOATING PLAYBACK POPUP */}
            <AnimatePresence>
              {aslInterpreting && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-[#0a0f1d] border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-mono text-emerald-400 animate-pulse bg-emerald-950 border border-emerald-900/60 px-1.5 py-0.5 rounded uppercase font-bold">
                    <span>LIVE ASL INTERPRETATION</span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">Signing: <strong className="text-white underline">{activeAslWord}</strong></span>

                  {/* Animated stylized hands vector representing signing */}
                  <div className="w-24 h-24 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center relative overflow-hidden">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 0.9, 1.1, 1],
                        rotate: [0, 15, -15, 10, 0],
                        y: [0, -5, 5, -2, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-4xl select-none"
                    >
                      🙌
                    </motion.div>
                    
                    {/* Animated waves around the hands */}
                    <div className="absolute inset-2 border-2 border-dashed border-indigo-500/20 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                  </div>

                  <span className="text-[9px] text-slate-500 italic text-center leading-relaxed">
                    Stylized interpreter hand coordinates representing sign pathways.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ABSTRACT GENDER-NEUTRAL PROFILE AVATARS */}
          <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Minimize2 className="w-4 h-4 text-indigo-400" />
                Abstract Profile Avatars
              </h3>
              <span className="text-[9px] font-mono text-slate-500">Gender Neutral</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Ditch old gendering. Build an elegant, organic celestial avatar using geometric nature shapes and cosmic alignment:
            </p>

            {/* Preview Box */}
            <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <motion.div
                  animate={abstractSpin ? { rotate: 360 } : {}}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className={`text-3xl select-none ${
                    abstractColor === 'cyan' ? 'text-cyan-400' :
                    abstractColor === 'amber' ? 'text-amber-400' :
                    abstractColor === 'rose' ? 'text-rose-400' :
                    abstractColor === 'emerald' ? 'text-emerald-400' : 'text-violet-400'
                  }`}
                >
                  {abstractShape === 'sun' && '☀️'}
                  {abstractShape === 'moon' && '🌙'}
                  {abstractShape === 'mountain' && '🏔️'}
                  {abstractShape === 'hexagon' && '⬡'}
                  {abstractShape === 'crystal' && '💎'}
                  {abstractShape === 'wave' && '🌊'}
                </motion.div>

                {/* Sub-halo */}
                <div className={`absolute inset-3 border border-dashed rounded-full opacity-20 ${
                  abstractColor === 'cyan' ? 'border-cyan-500' :
                  abstractColor === 'amber' ? 'border-amber-500' :
                  abstractColor === 'rose' ? 'border-rose-500' :
                  abstractColor === 'emerald' ? 'border-emerald-500' : 'border-violet-500'
                }`} />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[10px] text-slate-400">Shape:</span>
                {['sun', 'moon', 'mountain', 'hexagon', 'crystal', 'wave'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setAbstractShape(s as any)}
                    className={`px-1.5 py-0.5 text-[9px] font-mono rounded border capitalize cursor-pointer ${
                      abstractShape === s ? 'bg-slate-800 border-indigo-500 text-white' : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[10px] text-slate-400">Color:</span>
                {['cyan', 'amber', 'rose', 'emerald', 'violet'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setAbstractColor(c as any)}
                    className={`w-3.5 h-3.5 rounded-full border cursor-pointer ${
                      c === 'cyan' ? 'bg-cyan-500' :
                      c === 'amber' ? 'bg-amber-500' :
                      c === 'rose' ? 'bg-rose-500' :
                      c === 'emerald' ? 'bg-emerald-500' : 'bg-violet-500'
                    } ${abstractColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[10px] font-mono text-slate-500 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={abstractSpin}
                    onChange={(e) => setAbstractSpin(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-indigo-500"
                  />
                  <span>Orbit Rotation Spin</span>
                </label>
              </div>

              <button
                onClick={applyAbstractAvatar}
                className="w-full py-1.5 bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-sans font-bold text-[10px] rounded-lg transition cursor-pointer"
              >
                SAVE ABSTRACT PROFILE EMBLEM
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
