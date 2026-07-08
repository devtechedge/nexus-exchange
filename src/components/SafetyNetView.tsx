import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  AlertOctagon, 
  Zap, 
  HelpCircle, 
  Key, 
  Skull, 
  Compass, 
  Play, 
  Award, 
  Check, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Flame, 
  Hourglass,
  Sliders,
  ShieldCheck,
  Power,
  RotateCcw
} from 'lucide-react';
import { ApiKey, GridBot, User } from '../types';

interface SafetyNetViewProps {
  user: User;
  apiKeys: ApiKey[];
  setApiKeys: React.Dispatch<React.SetStateAction<ApiKey[]>>;
  gridBots: GridBot[];
  setGridBots: React.Dispatch<React.SetStateAction<GridBot[]>>;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
  balances: { [key: string]: number };
  setBalances: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  spendingLimit: number;
  setSpendingLimit: (val: number) => void;
  spendingLimitLocked: boolean;
  setSpendingLimitLocked: (val: boolean) => void;
  doubleCheckSliderEnabled: boolean;
  setDoubleCheckSliderEnabled: (val: boolean) => void;
  assetsLocked: boolean;
  setAssetsLocked: (val: boolean) => void;
  kycStatus: string;
  twoFactorEnabled: boolean;
}

// Simulated scambaiting inbox scenarios for students
const SCAM_SCENARIOS = [
  {
    id: 'scam_1',
    sender: 'Metamusk Official Support <support@metamusk-claims-airdrop.xyz>',
    title: '⚠️ CRITICAL: Revoke your digital keys to verify your profile immediately!',
    body: 'Greetings Customer! An exploit was detected in your wallet contract. To avoid losing all your funds, you MUST urgently click this unverified portal link and type in your 12-word seed phrase. The automatic smart contract cleaner will verify your balance within 3 minutes.',
    isScam: true,
    hint: 'Look closely at the email sender address domain (.xyz instead of official domains) and the direct request for your 12-word recovery seed phrase. Real support groups NEVER ask for your seed phrase!'
  },
  {
    id: 'safe_2',
    sender: 'Solana Foundation <alerts@solana.org>',
    title: 'Updates regarding RPC Endpoint Node Network Maintenance next Tuesday',
    body: 'We are updating the public testnet devnet validators to patch security performance. No action is required by end users. Your assets are stored on the public sovereign ledger; do not transfer assets or share credentials with third parties.',
    isScam: false,
    hint: 'This message comes from an official organization, describes general network operations, and explicitly warns you NOT to share your security credentials.'
  },
  {
    id: 'scam_3',
    sender: 'Crypto-Whale-Alfredo via Telegram DM',
    title: '🚀 EXCLUSIVE 300% YIELD GUARANTEE (Secret Launch Pool!)',
    body: 'Hey bro! I saw you in the trading group. Send just 5 SOL to my verified contract address 0x981A7b... and my high-frequency bot system will automatically return 20 SOL back to your wallet instantly in 15 seconds! Only 4 slots remaining!',
    isScam: true,
    hint: 'Promises of guaranteed "300% immediate returns" or "send coins to get more coins" are classic doubling scams. Real yield farms operate on transparent decentralized protocols.'
  },
  {
    id: 'scam_4',
    sender: 'Nexus Exchange Security <alerts@nexus-exchange.com>',
    title: 'Action Required: Verify your email to complete security check',
    body: 'Hi trader, please log in to your official Nexus control panel under the secure user profile section and verify your recovery settings. We have sent an authentication link to your mobile device. Remember: we will never ask you to send tokens to an external address.',
    isScam: false,
    hint: 'This email is from the correct server domain, prompts you to complete your security check inside the secure app control panel, and warns against sending tokens.'
  }
];

// Recovery Phrase sequence maze words
const SECRET_SEED_WORDS = ["bacon", "mango", "harvest", "planet", "guitar", "crystal"];

export default function SafetyNetView({
  user,
  apiKeys,
  setApiKeys,
  gridBots,
  setGridBots,
  onNotification,
  balances,
  setBalances,
  spendingLimit,
  setSpendingLimit,
  spendingLimitLocked,
  setSpendingLimitLocked,
  doubleCheckSliderEnabled,
  setDoubleCheckSliderEnabled,
  assetsLocked,
  setAssetsLocked,
  kycStatus,
  twoFactorEnabled
}: SafetyNetViewProps) {
  // --- BASE STATES ---
  const [activeTab, setActiveTab] = useState<'scorecard' | 'scam-arena' | 'maze' | 'locks'>('scorecard');
  const [spendingInput, setSpendingInput] = useState<string>(spendingLimit.toString());
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Turning Gears overlay state (cold vault simulation)
  const [showGearsOverlay, setShowGearsOverlay] = useState<boolean>(false);
  const [gearsStatusText, setGearsStatusText] = useState<string>('');

  // Flash-Crash siren state
  const [sirenPlaying, setSirenPlaying] = useState<boolean>(false);
  const [volatilityPercent, setVolatilityPercent] = useState<number>(1.2);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [sirenOscillators, setSirenOscillators] = useState<any[]>([]);

  // Self-Destruct Timed lease keys states
  const [timedKeyName, setTimedKeyName] = useState<string>('Practice Trading Bot Token');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(45);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Scam Arena game states
  const [currentScamIdx, setCurrentScamIdx] = useState<number>(0);
  const [scamCorrectAnswers, setScamCorrectAnswers] = useState<number>(0);
  const [showScamExplanation, setShowScamExplanation] = useState<boolean>(false);
  const [userSelectedScam, setUserSelectedScam] = useState<boolean | null>(null);

  // Recovery maze states
  const [selectedMazeWords, setSelectedMazeWords] = useState<string[]>([]);
  const [mazeCompleted, setMazeCompleted] = useState<boolean>(false);
  const [mazeError, setMazeError] = useState<string>('');

  // --- AUDIO SYNTHESIS FOR THE SIREN (PLAYFUL & COGNITIVE) ---
  const playSirenSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioCtx(ctx);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Set sound frequency
      osc1.frequency.setValueAtTime(350, ctx.currentTime);
      osc2.frequency.setValueAtTime(450, ctx.currentTime);

      // Program the classic rolling siren wave
      osc1.frequency.linearRampToValueAtTime(650, ctx.currentTime + 1);
      osc1.frequency.linearRampToValueAtTime(350, ctx.currentTime + 2);
      osc2.frequency.linearRampToValueAtTime(750, ctx.currentTime + 1);
      osc2.frequency.linearRampToValueAtTime(450, ctx.currentTime + 2);

      // Repeat the sweeping pitch loop
      const interval = setInterval(() => {
        if (!ctx || ctx.state === 'closed') {
          clearInterval(interval);
          return;
        }
        osc1.frequency.setValueAtTime(350, ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(650, ctx.currentTime + 1);
        osc1.frequency.linearRampToValueAtTime(350, ctx.currentTime + 2);

        osc2.frequency.setValueAtTime(450, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(750, ctx.currentTime + 1);
        osc2.frequency.linearRampToValueAtTime(450, ctx.currentTime + 2);
      }, 2000);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime); // Safe playful low volume

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      setSirenOscillators([osc1, osc2, gainNode, interval]);
      setSirenPlaying(true);
    } catch (e) {
      console.warn("Audio Context is blocked by browser interaction restrictions.", e);
    }
  };

  const stopSirenSound = () => {
    if (sirenOscillators.length > 0) {
      try {
        const [osc1, osc2, , interval] = sirenOscillators;
        clearInterval(interval);
        osc1.stop();
        osc2.stop();
      } catch (e) {}
    }
    if (audioCtx) {
      audioCtx.close();
      setAudioCtx(null);
    }
    setSirenOscillators([]);
    setSirenPlaying(false);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sirenPlaying) {
        stopSirenSound();
      }
    };
  }, [sirenPlaying, sirenOscillators]);

  // Timed lease self-destruction stopwatch countdown
  useEffect(() => {
    let timer: any;
    if (timerRunning && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            onNotification('info', '⚠️ Timed API Lease has expired! Your connection key was safely deleted to prevent leaks.');
            setApiKeys(keys => keys.filter(k => k.name !== 'Simulated Timed Lease'));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerRunning, timeLeftSeconds]);

  // --- SCORECARD CALCULATOR ---
  const securityScoreDetails = React.useMemo(() => {
    let score = 20; // base score
    const activeItems = [];

    if (kycStatus === 'verified') {
      score += 20;
      activeItems.push('Profile KYC Verified (+20)');
    }
    if (twoFactorEnabled) {
      score += 20;
      activeItems.push('Two-Factor Authentication Active (+20)');
    }
    if (spendingLimitLocked) {
      score += 20;
      activeItems.push('Spending Limit Padlock Locked (+20)');
    }
    if (doubleCheckSliderEnabled) {
      score += 20;
      activeItems.push('Double-Check Slider Shield On (+20)');
    }

    let rank = 'Fragile Egg 🥚';
    let rankColor = 'text-red-400 bg-red-950/20 border-red-900/30';
    let progressColor = 'bg-red-500';

    if (score >= 100) {
      rank = 'Iron Fortress 🏰';
      rankColor = 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30';
      progressColor = 'bg-emerald-400';
    } else if (score >= 60) {
      rank = 'Steel Shield 🛡️';
      rankColor = 'text-cyan-400 bg-cyan-950/20 border-cyan-900/30';
      progressColor = 'bg-cyan-400';
    } else if (score >= 40) {
      rank = 'Wooden Shield 🪵';
      rankColor = 'text-amber-400 bg-amber-950/20 border-amber-900/30';
      progressColor = 'bg-amber-400';
    }

    return { score, rank, rankColor, progressColor, activeItems };
  }, [kycStatus, twoFactorEnabled, spendingLimitLocked, doubleCheckSliderEnabled]);

  // --- ACTION HANDLERS ---

  // Trigger Gears rotation overlay (cold vault locking simulator)
  const triggerVaultGearsLock = (text: string) => {
    setGearsStatusText(text);
    setShowGearsOverlay(true);
    
    // Simulate mechanical grinding sound pitch or just visual duration
    setTimeout(() => {
      setShowGearsOverlay(false);
      onNotification('success', 'Operation completed securely! Safe vault locked. ⚙️🔒');
    }, 3200);
  };

  // Spending limits controls
  const handleLockSpendingLimit = () => {
    setPinError('');
    if (pinInput.length < 4) {
      setPinError('Please create a secure 4-digit parent/teacher PIN.');
      return;
    }
    const val = parseFloat(spendingInput);
    if (isNaN(val) || val <= 0) {
      setPinError('Please enter a valid spending amount.');
      return;
    }

    setSpendingLimit(val);
    setSpendingLimitLocked(true);
    setPinInput('');
    onNotification('success', `Locked daily trade spending cap at $${val.toLocaleString()} USDC! 🔒`);
    triggerVaultGearsLock(`Engaging heavy metallic spending lock at $${val.toLocaleString()}...`);
  };

  const handleUnlockSpendingLimit = () => {
    setPinError('');
    if (pinInput !== '1234' && pinInput !== '0000') {
      setPinError('Incorrect PIN! Try "1234" to simulate parent/teacher unlock.');
      return;
    }
    setSpendingLimitLocked(false);
    setPinInput('');
    onNotification('info', 'Spending limit padlock unlocked. 🔓');
  };

  // Red Emergency Button (Instant-kill switch)
  const handleTriggerEmergencyKillSwitch = () => {
    // Revoke all API credentials
    setApiKeys([]);
    // Stop all active grid bots
    setGridBots([]);
    // Lock all mock assets
    setAssetsLocked(true);
    
    onNotification('error', '🚨 RED ALERT ACTIVE! Instant emergency revocation successful. All API connections destroyed. Mock assets locked! 🛡️');
    triggerVaultGearsLock('ACTIVATING RED EMERGENCY ESCAPE PROTOCOL! REVOKING ALL BOT LEASED KEYS IMMEDIATELY...');
  };

  // Volatility Flash-Crash test trigger
  const triggerVolatilityFlashCrash = () => {
    setVolatilityPercent(14.8); // excessive spike
    playSirenSound();
    onNotification('error', '🚨 Warning! Flash-Crash Volatility spike detected (+14.8%)! Revoking bot leases recommended.');
  };

  // Scam Arena game answers
  const handleScamAnswer = (votedScam: boolean) => {
    setUserSelectedScam(votedScam);
    const correct = SCAM_SCENARIOS[currentScamIdx].isScam === votedScam;
    if (correct) {
      setScamCorrectAnswers(prev => prev + 1);
      onNotification('success', 'Spot on! Correctly identified the security risk assessment! 🎉');
    } else {
      onNotification('error', 'Incorrect! Study the threat vectors carefully.');
    }
    setShowScamExplanation(true);
  };

  const advanceScamScenario = () => {
    setShowScamExplanation(false);
    setUserSelectedScam(null);
    if (currentScamIdx < SCAM_SCENARIOS.length - 1) {
      setCurrentScamIdx(prev => prev + 1);
    } else {
      setCurrentScamIdx(0); // wrap around
    }
  };

  // Recovery phrase maze words clickers
  const handleMazeWordClick = (word: string) => {
    if (selectedMazeWords.includes(word)) {
      setSelectedMazeWords(prev => prev.filter(w => w !== word));
    } else {
      setSelectedMazeWords(prev => [...prev, word]);
    }
  };

  const checkMazeSequence = () => {
    setMazeError('');
    const matches = selectedMazeWords.length === SECRET_SEED_WORDS.length &&
      selectedMazeWords.every((w, idx) => w === SECRET_SEED_WORDS[idx]);

    if (matches) {
      setMazeCompleted(true);
      onNotification('success', '🏆 Congratulations! You guided the character safely out of the threat maze! Sequence correct.');
    } else {
      setMazeError('Wrong sequence! Try again. The correct order must match your original seed recovery card.');
      setSelectedMazeWords([]);
    }
  };

  return (
    <div className="space-y-8 text-left relative">
      
      {/* HEAVY METAL VAULT LOCKING turning gears OVERLAY */}
      <AnimatePresence>
        {showGearsOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Spinning Gears Vectors */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              {/* Gear 1 - Master Center */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                className="absolute w-32 h-32 text-amber-500/80 flex items-center justify-center"
              >
                <Settings className="w-full h-full stroke-[1.5]" />
              </motion.div>

              {/* Gear 2 - Top Right Counter Rotation */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="absolute top-0 right-0 w-20 h-20 text-cyan-500/80 flex items-center justify-center"
              >
                <Settings className="w-full h-full stroke-[1.5]" />
              </motion.div>

              {/* Gear 3 - Bottom Left */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                className="absolute bottom-2 left-2 w-16 h-16 text-emerald-500/80 flex items-center justify-center"
              >
                <Settings className="w-full h-full stroke-[2]" />
              </motion.div>

              {/* Lock Center Icon */}
              <div className="absolute w-12 h-12 bg-slate-900 border-2 border-slate-700 rounded-full flex items-center justify-center text-white shadow-2xl z-10">
                <Lock className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-3 max-w-lg">
              <h3 className="text-xl font-mono font-black text-white uppercase tracking-wider animate-pulse">
                Engaging Cryptographic Vault Seals...
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {gearsStatusText || 'Aligning heavy tumblers, cold wallets offline keys, and secure network firewalls.'}
              </p>
              <span className="text-[10px] bg-slate-900 border border-slate-800 px-3 py-1 rounded text-cyan-400 font-mono inline-block">
                PROTOCOL LEVEL SECURE LOCKOUT ACTIVE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLASH-CRASH SIREN FULL PAGE FLASHING BANNER */}
      {sirenPlaying && (
        <motion.div
          animate={{ backgroundColor: ['rgba(239, 68, 68, 0.25)', 'rgba(30, 41, 59, 0.4)', 'rgba(239, 68, 68, 0.25)'] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="p-5 border-2 border-red-500 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-red-950/20 text-red-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-950/80 border border-red-500 rounded-full flex items-center justify-center shrink-0 animate-ping">
              <AlertOctagon className="w-5 h-5 text-red-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-white">
                🔊 Playful Market Flash-Crash Warning Active!
              </h3>
              <p className="text-xs text-slate-300">
                Mock Volatility exceeds critical threshold (+{volatilityPercent}%)! Playful security training siren is sounding. Practice locking your vaults!
              </p>
            </div>
          </div>

          <button
            onClick={stopSirenSound}
            className="px-4 py-2 bg-white text-red-950 font-bold text-xs rounded-lg hover:bg-slate-200 uppercase tracking-wider cursor-pointer"
          >
            Deactivate Siren & Calibrate
          </button>
        </motion.div>
      )}

      {/* TOP INTEGRATED SAFETY NET TITLE CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20 border border-slate-900 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10 text-left">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              🛡️ Sandbox Safety Net & Guardrails
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              Batch 9 Live
            </span>
          </div>
          
          <h2 className="text-xl md:text-2xl font-sans font-extrabold text-white tracking-tight">
            Crypto Error-Prevention Center
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            The playground sandbox is built to let you make mistakes safely. Explore threat detection, establish protective padlocks, play the anti-scam review arena, and trigger the red emergency kill switch if things ever get too fast!
          </p>
        </div>

        {/* Emergency Stop Button on Sidebar Header */}
        <button
          onClick={handleTriggerEmergencyKillSwitch}
          className="px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white font-sans font-extrabold text-xs rounded-2xl transition-all transform hover:scale-[1.03] flex items-center gap-2.5 shadow-lg shadow-red-950/40 cursor-pointer border border-red-500 relative z-10 animate-pulse"
        >
          <Skull className="w-4 h-4 text-white" />
          <span>RED EMERGENCY BUTTON</span>
        </button>
      </div>

      {/* ACCORDION/TAB SWITCHER */}
      <div className="flex flex-wrap border-b border-slate-900/60 p-1 bg-slate-950/60 rounded-xl gap-1">
        {[
          { id: 'scorecard', label: 'Security Scorecard & Limits', icon: ShieldCheck },
          { id: 'scam-arena', label: 'Anti-Scam Threat Arena', icon: Flame },
          { id: 'maze', label: 'Recovery Phrase Maze', icon: Compass },
          { id: 'locks', label: 'API Timed Leases & Volatility', icon: Hourglass }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20 border border-transparent'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ACTIVE SECTION CARDS */}
      <AnimatePresence mode="wait">
        {activeTab === 'scorecard' && (
          <motion.div
            key="scorecard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* COLUMN LEFT: SECURITY SCORECARD RATINGS (5 COLS) */}
            <div className="lg:col-span-5 p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-6 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Account Security Scorecard
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Gamified level rating showing how strong your defensive shield is against virtual attacks.
                </p>
              </div>

              {/* STYLIZED SCORE METER */}
              <div className="text-center p-5 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Your Armor Rating</span>
                
                <div className="space-y-1">
                  <span className={`text-2xl font-black block tracking-tight ${securityScoreDetails.score >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {securityScoreDetails.score}/100 Points
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${securityScoreDetails.rankColor}`}>
                    {securityScoreDetails.rank}
                  </span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-900">
                  <div className={`h-full transition-all duration-500 ${securityScoreDetails.progressColor}`} style={{ width: `${securityScoreDetails.score}%` }} />
                </div>
              </div>

              {/* LIST OF DETECTED SHIELDS */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Defensive Elements Checked</span>
                
                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 bg-slate-900/30 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400">KYC Verification Check</span>
                    <span className={kycStatus === 'verified' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {kycStatus === 'verified' ? '✓ Verified (+20)' : 'Unverified'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900/30 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400">Two-Factor Auth Lock</span>
                    <span className={twoFactorEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {twoFactorEnabled ? '✓ Enabled (+20)' : 'Disabled'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900/30 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400">Spending Limit Padlock</span>
                    <span className={spendingLimitLocked ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {spendingLimitLocked ? '✓ Locked (+20)' : 'No limit set'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900/30 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400">Double-Check Trade Slider</span>
                    <span className={doubleCheckSliderEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {doubleCheckSliderEnabled ? '✓ Armed (+20)' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed font-sans italic">
                  *Pro tip: Reach 100 points to unlock the "Iron Fortress" sovereign trader badge!
                </p>
              </div>
            </div>

            {/* COLUMN RIGHT: SPENDING LIMIT PADLOCK & CONFIRM SLIDER TOGGLE (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* MY SPENDING LIMIT PADLOCK */}
              <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    My Spending Limit Padlock
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500">Teenager & Family Guard</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Establish a daily maximum size cap for single trades in practice pools. If a junior trader attempts to exceed this cap, the transaction blocks with a secure lock alert until a supervisor unlocks it.
                </p>

                <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {/* Lock Screen status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${spendingLimitLocked ? 'bg-red-500/10 text-red-400' : 'bg-slate-900 text-slate-500'}`}>
                      {spendingLimitLocked ? <Lock className="w-7 h-7" /> : <Unlock className="w-7 h-7" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider block">Lock Status</span>
                      <span className="text-xs text-white font-extrabold block">
                        {spendingLimitLocked ? 'ACTIVE SPENDING GUARD' : 'NO ACTIVE LIMIT'}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono block mt-0.5">
                        Max Cap: ${spendingLimit.toLocaleString()} USDC
                      </span>
                    </div>
                  </div>

                  {/* Lock configuration panels */}
                  <div className="flex-1 w-full space-y-3">
                    {spendingLimitLocked ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Enter Supervisor PIN to Unlock</span>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="PIN (try 1234)"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            className="flex-1 p-2 bg-slate-950 border border-slate-900 rounded-xl text-center text-xs font-mono text-white"
                          />
                          <button
                            onClick={handleUnlockSpendingLimit}
                            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                          >
                            Unlock
                          </button>
                        </div>
                        {pinError && <p className="text-[10px] text-red-400 font-mono">{pinError}</p>}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Max Trade Size ($)</span>
                            <input
                              type="number"
                              value={spendingInput}
                              onChange={(e) => setSpendingInput(e.target.value)}
                              className="w-full p-2 bg-slate-950 border border-slate-900 rounded-xl text-xs font-mono text-white"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Create Supervisor PIN</span>
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="e.g. 1234"
                              value={pinInput}
                              onChange={(e) => setPinInput(e.target.value)}
                              className="w-full p-2 bg-slate-950 border border-slate-900 rounded-xl text-xs font-mono text-white text-center"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleLockSpendingLimit}
                          className="w-full py-2 bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer uppercase tracking-wider"
                        >
                          Engage Padlock Secure Cap
                        </button>
                        {pinError && <p className="text-[10px] text-red-400 font-mono text-center">{pinError}</p>}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* DOUBLE-CHECK SLIDER INTERACTIVE CONTROLS */}
              <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Accidental Order Prevention Toggles
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500">UX Shield</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/10 border border-slate-900 rounded-2xl gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-200 block">Require Confirmation Slider Shield</span>
                    <p className="text-[10px] text-slate-400">
                      When enabled, users must swipe a mechanical-looking virtual bar before executing swaps, saving them from clicking errors!
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const next = !doubleCheckSliderEnabled;
                      setDoubleCheckSliderEnabled(next);
                      onNotification('info', next ? 'Double-Check Confirmation Slider Armed! 🛡️' : 'Accidental order shield disabled.');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold border transition shrink-0 cursor-pointer ${
                      doubleCheckSliderEnabled 
                        ? 'bg-emerald-400/10 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    {doubleCheckSliderEnabled ? '🟢 Armed' : '⚪ Disabled'}
                  </button>
                </div>

                {/* Simulated confirmation slider practice */}
                {doubleCheckSliderEnabled && (
                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Practice Swipe Confirmation Slider</span>
                    
                    <div className="relative h-12 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-center overflow-hidden">
                      {/* Swipe Progress Bar */}
                      <span className="text-[10px] text-slate-400 font-mono font-bold select-none relative z-10 animate-pulse">
                        SLIDE TO THE RIGHT TO TEST SWIPE
                      </span>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="0"
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val >= 98) {
                            onNotification('success', 'Slide verified! Accident prevention shield simulated successfully!');
                            e.target.value = "0"; // snap back
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-30 cursor-ew-resize accent-emerald-400"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block italic text-center">Swipe slider handle completely to 100% to simulate trade confirmations</span>
                  </div>
                )}

              </div>

            </div>
          </motion.div>
        )}

        {/* ANTI-SCAM ARENA GAME */}
        {activeTab === 'scam-arena' && (
          <motion.div
            key="scam-arena"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-6 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full filter blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                  The Anti-Scam Arena Game
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Score: {scamCorrectAnswers} / {SCAM_SCENARIOS.length}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Evaluate the messages in your mock Web3 digital inbox. Click <strong className="text-emerald-400 font-bold">SAFE</strong> if the mail is legitimate, or <strong className="text-red-400 font-bold">SCAM!</strong> if it threatens your secret seed phrase. Protect your assets!
              </p>
            </div>

            {/* Simulated Inbox Letter Header */}
            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-4">
              <div className="border-b border-slate-900 pb-3 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between text-xs font-mono">
                  <span className="text-slate-400">Sender ID: <strong className="text-white font-bold select-all">{SCAM_SCENARIOS[currentScamIdx].sender}</strong></span>
                  <span className="text-slate-500 shrink-0">Priority: Secure Inbox</span>
                </div>
                <h4 className="text-sm font-sans font-extrabold text-white">
                  {SCAM_SCENARIOS[currentScamIdx].title}
                </h4>
              </div>

              {/* Message body */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900">
                <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line">
                  {SCAM_SCENARIOS[currentScamIdx].body}
                </p>
              </div>

              {/* Selection button actions */}
              <div className="flex gap-4">
                <button
                  disabled={userSelectedScam !== null}
                  onClick={() => handleScamAnswer(false)}
                  className={`flex-1 py-3 text-xs font-bold font-sans rounded-xl transition uppercase cursor-pointer ${
                    userSelectedScam !== null && !SCAM_SCENARIOS[currentScamIdx].isScam
                      ? 'bg-emerald-500 text-slate-950 font-black scale-[1.02]'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-850'
                  }`}
                >
                  🟢 This looks SAFE
                </button>

                <button
                  disabled={userSelectedScam !== null}
                  onClick={() => handleScamAnswer(true)}
                  className={`flex-1 py-3 text-xs font-bold font-sans rounded-xl transition uppercase cursor-pointer ${
                    userSelectedScam !== null && SCAM_SCENARIOS[currentScamIdx].isScam
                      ? 'bg-red-500 text-white font-black scale-[1.02]'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-850'
                  }`}
                >
                  🚨 WARNING: THIS IS A SCAM!
                </button>
              </div>
            </div>

            {/* Explanation card */}
            <AnimatePresence>
              {showScamExplanation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-3"
                >
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs font-sans">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Scam Analyst Feedback Report</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {SCAM_SCENARIOS[currentScamIdx].isScam 
                      ? '🎯 Great catch! This message has strong signals of phishing activity.' 
                      : '👍 Perfect! This is a secure network service update that requires no private disclosures.'}
                  </p>

                  <div className="p-3 bg-slate-950 rounded-xl text-[10px] font-mono text-slate-400 leading-relaxed border border-slate-900">
                    <strong className="text-amber-400 font-bold">Threat Indicator Hint:</strong> {SCAM_SCENARIOS[currentScamIdx].hint}
                  </div>

                  <button
                    onClick={advanceScamScenario}
                    className="px-4 py-2 bg-indigo-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-indigo-400 transition cursor-pointer"
                  >
                    Next Threat Analysis Scenario →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* RECOVERY PHRASE MAZE MINI-GAME */}
        {activeTab === 'maze' && (
          <motion.div
            key="maze"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-6 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />

            <div>
              <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                The Recovery Phrase Maze Game
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Help Clara the Hamster guide her exploratory mining kart out of the cyber-threat labyrinth! To open the heavy blast doors, click on your secret seed words in the **EXACT** sequential order they were written on your safe card.
              </p>
            </div>

            {/* SEED SEQUENCING WORKSPACE */}
            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-5">
              
              {/* Labyrinth door locked representation */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-xl border border-slate-900 space-y-3 relative overflow-hidden">
                <div className="text-4xl animate-bounce">🐹🚀</div>
                
                {mazeCompleted ? (
                  <div className="text-center space-y-1">
                    <span className="text-emerald-400 text-sm font-sans font-bold block">✓ LABYRINTH DOOR UNLOCKED!</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Clara has safely deposited her crop seeds inside deep cold vaults!</span>
                  </div>
                ) : (
                  <div className="text-center space-y-1.5">
                    <span className="text-amber-500 text-xs font-sans font-bold block uppercase tracking-wider">Blast Doors Sealed 🔒</span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Path ordered: {selectedMazeWords.length}/{SECRET_SEED_WORDS.length} words entered.
                    </span>
                  </div>
                )}

                {/* Entered words sequence list */}
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {selectedMazeWords.map((word, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-indigo-950 border border-indigo-900 text-indigo-400 font-mono text-[10px] rounded-lg">
                      {idx + 1}. {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Jumbled clicker chips */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Target Recovery Cards (Click to order)</span>
                
                {/* Correct order: bacon, mango, harvest, planet, guitar, crystal */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {["harvest", "mango", "crystal", "bacon", "guitar", "planet"].map((word) => {
                    const idxInSelection = selectedMazeWords.indexOf(word);
                    const isSelected = idxInSelection !== -1;
                    return (
                      <button
                        key={word}
                        onClick={() => handleMazeWordClick(word)}
                        className={`px-4 py-2.5 rounded-xl border font-mono text-xs cursor-pointer transition ${
                          isSelected 
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold' 
                            : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {word} {isSelected && `(#${idxInSelection + 1})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {mazeError && <p className="text-xs text-red-400 text-center font-mono">{mazeError}</p>}

              {/* Trigger evaluation */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedMazeWords([]);
                    setMazeCompleted(false);
                    setMazeError('');
                  }}
                  className="px-4 py-2 bg-slate-900 border border-slate-850 hover:text-white text-xs font-bold text-slate-400 rounded-lg cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                
                <button
                  disabled={mazeCompleted}
                  onClick={checkMazeSequence}
                  className="flex-1 py-3 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-sans font-extrabold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Verify Cryptographic Path Key
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* API LEASES & VOLATILITY WARNINGS */}
        {activeTab === 'locks' && (
          <motion.div
            key="locks"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* VOLATILITY SIREN TESTING CONTAINER */}
            <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-red-400" />
                  Flash-Crash Volatility Siren
                </h3>
                <span className="text-[9px] font-mono text-slate-500">Audio Alerts</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Experience simulated high-stress trading situations! Triggering this alert will sound a synthesized warning tone, representing flash crash conditions where we recommend pausing developer bots.
              </p>

              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white block">Siren Test status:</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${sirenPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-950 text-slate-500'}`}>
                    {sirenPlaying ? 'SOUNDING ALIVE' : 'SILENT'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={triggerVolatilityFlashCrash}
                    className="flex-1 py-2.5 bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    ⚡ Simulate Flash Volatility Spike
                  </button>

                  {sirenPlaying && (
                    <button
                      onClick={stopSirenSound}
                      className="px-4 bg-slate-900 hover:text-white border border-slate-850 text-xs text-slate-400 rounded-xl cursor-pointer"
                    >
                      Mute
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TIMED API KEY LEASE WITH SECURE TIMER */}
            <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Hourglass className="w-4 h-4 text-cyan-400" />
                  Self-Destruct Key Countdown
                </h3>
                <span className="text-[9px] font-mono text-slate-500">Credential Lifespan</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Leasing credentials to third-party high-frequency bots is a risk. Timed self-destruction keys automatically revoke themselves after a few seconds, limiting exploit opportunities.
              </p>

              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-900/60 pb-2">
                  <span>Simulated leased key:</span>
                  <span className="text-slate-100 font-bold">{timedKeyName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Lease Countdown:</span>
                  <span className="text-xl font-black text-amber-400 animate-pulse">
                    00:{timeLeftSeconds < 10 ? `0${timeLeftSeconds}` : timeLeftSeconds} s
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTimeLeftSeconds(45);
                      setTimerRunning(true);
                      onNotification('success', 'Refreshed credentials lease timer to 45 seconds!');
                    }}
                    className="flex-1 py-2 bg-slate-900 hover:text-white border border-slate-800 text-[10px] font-bold rounded-lg cursor-pointer uppercase"
                  >
                    Refresh Lease
                  </button>

                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="px-3 py-2 bg-slate-900 hover:text-white border border-slate-800 text-[10px] font-bold rounded-lg cursor-pointer uppercase"
                  >
                    {timerRunning ? 'Pause' : 'Resume'}
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
