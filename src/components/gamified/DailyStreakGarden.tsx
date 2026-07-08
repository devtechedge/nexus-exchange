import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sprout, Droplets, Sun, Award, RefreshCw, CheckCircle2 } from 'lucide-react';

interface DailyStreakGardenProps {
  streakDays: number;
  onWaterGarden: (xpAward: number) => void;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
}

interface Flower {
  id: number;
  color: string;
  type: string;
  emoji: string;
  scale: number;
  rotation: number;
  isBloomed: boolean;
}

const DAILY_QUESTIONS = [
  {
    id: 'q-1',
    question: "What is the safest way to store your private seed phrase?",
    options: [
      "Write it on paper and keep it in a safe offline location",
      "Take a screenshot and save it in your mobile photo gallery",
      "Save it in a Google Doc with a strong password",
      "Send it to your email address as a backup"
    ],
    correctIdx: 0,
    hint: "Keep it completely offline where digital hackers can't reach."
  },
  {
    id: 'q-2',
    question: "An exchange support representative asks you for your password to 'fix' a transaction. What do you do?",
    options: [
      "Give them the password, but change it immediately afterward",
      "Provide only the first half of the password to verify identity",
      "Never share passwords; official support will never ask for them",
      "Ask them to verify their employee badge first"
    ],
    correctIdx: 2,
    hint: "Official representatives NEVER ask for your password under any circumstance."
  },
  {
    id: 'q-3',
    question: "What does 'Slippage' mean in decentralized token trading?",
    options: [
      "The delay in processing transactions on-chain",
      "The price difference between order submission and execution",
      "Losing your seed phrase due to device corruption",
      "The security check for dual-factor authentication"
    ],
    correctIdx: 1,
    hint: "It measures the movement of market price between trade start and fill."
  },
  {
    id: 'q-4',
    question: "What is the primary function of a Hardware Wallet?",
    options: [
      "To mine proof-of-work block rewards rapidly",
      "To keep your private cryptographic keys isolated from the internet",
      "To display real-time live trading candles on a small screen",
      "To double your staking yields automatically"
    ],
    correctIdx: 1,
    hint: "Isolation is key. Hardware wallets never expose your keys online."
  }
];

export default function DailyStreakGarden({
  streakDays,
  onWaterGarden,
  onNotification
}: DailyStreakGardenProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [gardenWateredToday, setGardenWateredToday] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Derive flowers based on streak days (up to 6 flowers max for a full flower patch)
  const flowers: Flower[] = Array.from({ length: Math.min(6, Math.max(1, streakDays)) }).map((_, i) => {
    const types = ['Rose', 'Tulip', 'Sunflower', 'Orchid', 'Lavender', 'Lotus'];
    const emojis = ['🌹', '🌷', '🌻', '🌸', '🪻', '🪷'];
    const colors = ['text-rose-400', 'text-pink-400', 'text-yellow-400', 'text-purple-400', 'text-indigo-400', 'text-teal-400'];
    
    return {
      id: i,
      type: types[i % types.length],
      emoji: emojis[i % emojis.length],
      color: colors[i % colors.length],
      scale: 0.8 + (i * 0.1) % 0.4,
      rotation: (i * 12 - 30) % 45,
      isBloomed: i < streakDays || gardenWateredToday
    };
  });

  const currentQuestion = DAILY_QUESTIONS[currentQuestionIdx];

  const handleOptionSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || hasAnswered) return;
    setHasAnswered(true);

    if (selectedOption === currentQuestion.correctIdx) {
      onNotification('success', 'Correct answer! You have unlocked fresh spring water.');
      // Launch watering can animation
      setIsWatering(true);
      setTimeout(() => {
        setIsWatering(false);
        setGardenWateredToday(true);
        onWaterGarden(30); // Award 30 XP
        onNotification('success', '🏆 Garden watered successfully! +30 Learning XP and flowers bloomed.');
      }, 2000);
    } else {
      onNotification('error', 'That was incorrect. Review the hint and try again!');
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowHint(false);
    setGardenWateredToday(false);
    setCurrentQuestionIdx((prev) => (prev + 1) % DAILY_QUESTIONS.length);
  };

  return (
    <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-3xl backdrop-blur-md text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/80 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-950/30 border border-emerald-900/30 rounded-xl">
            <Sprout className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-sans font-bold text-slate-200">The Daily Streak Garden 🌱</h4>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Complete your daily educational challenge to water your sandbox patch and grow colorful blooms!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-[11px] font-sans text-slate-300 font-bold">
            Daily Streak: <strong className="text-emerald-400">{streakDays} Days</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Soil Patch representation (Visual Garden) */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[360px]">
          {/* Sky background accent */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/10 via-slate-950/5 to-slate-950 pointer-events-none" />

          {/* Sun & Clouds */}
          <div className="flex justify-between items-start z-10">
            <Sun className="w-7 h-7 text-amber-500/20" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Streak Soil Plot #1
            </span>
          </div>

          {/* Interactive Watering Can Animation Overlay */}
          <AnimatePresence>
            {isWatering && (
              <motion.div
                initial={{ opacity: 0, x: 40, y: -20, rotate: -10 }}
                animate={{ opacity: 1, x: 0, y: 0, rotate: -25 }}
                exit={{ opacity: 0, x: -40, y: 20 }}
                transition={{ duration: 0.5 }}
                className="absolute right-10 top-12 z-30 flex flex-col items-center"
              >
                <div className="text-4xl filter drop-shadow-lg select-none">
                  🚿
                </div>
                {/* Water Droplets Falling */}
                <div className="flex gap-1 mt-2">
                  <motion.div
                    animate={{ y: [0, 40], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  >
                    <Droplets className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 40], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  >
                    <Droplets className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 40], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  >
                    <Droplets className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Middle Space: Plot & Grown Flowers */}
          <div className="flex-1 flex items-end justify-center pb-8 z-10 relative">
            <div className="w-full max-w-[280px] h-20 bg-amber-950/25 border-t-4 border-amber-900 rounded-b-2xl relative flex items-center justify-around px-4">
              {/* Soil layer name label */}
              <div className="absolute inset-x-0 bottom-2 text-center text-[9px] font-sans font-bold text-amber-800 tracking-wider">
                RICH SANDBOX HUMUS
              </div>

              {/* Render Flowers */}
              {flowers.map((flower) => (
                <div
                  key={flower.id}
                  className="relative flex flex-col items-center bottom-4"
                  style={{ transform: `scale(${flower.scale}) rotate(${flower.rotation}deg)` }}
                >
                  {flower.isBloomed ? (
                    <motion.div
                      initial={{ scale: 0, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      className="flex flex-col items-center"
                    >
                      {/* Flower Bloom */}
                      <span className="text-3xl filter drop-shadow-md cursor-help" title={flower.type}>
                        {flower.emoji}
                      </span>
                      {/* Leaf Stem */}
                      <div className="w-1 h-6 bg-emerald-500/80 rounded-full" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.7 }}
                      animate={{ scale: [0.7, 0.8, 0.7] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="flex flex-col items-center opacity-65"
                    >
                      {/* Unbloomed Sprout */}
                      <span className="text-xl">🌱</span>
                      <div className="w-1 h-3 bg-emerald-700/60 rounded-full" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status Overlay Footer inside Visual Garden */}
          <div className="z-10 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs font-sans">
            <span className="text-slate-400">Soil Hydration:</span>
            <span className={`font-bold flex items-center gap-1 ${gardenWateredToday ? 'text-cyan-400' : 'text-amber-400'}`}>
              <Droplets className="w-3.5 h-3.5 shrink-0" />
              {gardenWateredToday ? '100% (Watered Today)' : '45% (Needs Watering)'}
            </span>
          </div>
        </div>

        {/* Challenge Desk (Question & Educational Widget) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Educational challenge
              </span>
              <span className="text-[10px] font-sans text-slate-400">
                Question {currentQuestionIdx + 1} of {DAILY_QUESTIONS.length}
              </span>
            </div>

            <h5 className="text-sm font-sans font-bold text-slate-200 leading-normal">
              {currentQuestion.question}
            </h5>

            {/* Hint Toggler */}
            <div>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-[10px] font-sans font-bold text-emerald-400 hover:text-emerald-300 transition uppercase tracking-wider"
              >
                {showHint ? 'Hide Hint 💡' : 'Need a Hint? 💡'}
              </button>
              {showHint && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs text-slate-400 bg-slate-950/40 border border-slate-900 p-3 rounded-xl mt-1.5 font-sans leading-relaxed"
                >
                  {currentQuestion.hint}
                </motion.p>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIdx;
                let optBorder = 'border-slate-850 bg-slate-950/20';
                let optText = 'text-slate-300';

                if (isSelected) {
                  optBorder = 'border-emerald-500/50 bg-emerald-950/10 text-emerald-300';
                }

                if (hasAnswered) {
                  if (isCorrect) {
                    optBorder = 'border-emerald-500 bg-emerald-950/30';
                    optText = 'text-emerald-300 font-bold';
                  } else if (isSelected) {
                    optBorder = 'border-red-500/50 bg-red-950/20';
                    optText = 'text-red-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-3.5 text-xs text-left rounded-xl border transition-all flex items-start gap-3 select-none ${optBorder} ${optText} ${!hasAnswered ? 'hover:bg-slate-900/40 cursor-pointer' : ''}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-sans leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex gap-3 pt-2">
              {hasAnswered ? (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-sans font-bold rounded-xl border border-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <RefreshCw className="w-4 h-4" />
                  Next Challenge Task
                </button>
              ) : (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-transparent text-slate-950 text-xs font-sans font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-widest"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  Submit Answer & Water Garden
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
