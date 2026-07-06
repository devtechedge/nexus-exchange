import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  Square, 
  Sparkles, 
  Award, 
  HelpCircle, 
  BookOpen, 
  Check, 
  ArrowRight, 
  Coins, 
  DollarSign 
} from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  desc: string;
  xpReward: number;
  tokenReward: number;
  isCompleted: boolean;
}

interface Lesson {
  id: string;
  title: string;
  desc: string;
  content: string;
  quizQuestion: string;
  quizOptions: string[];
  correctAnswerIdx: number;
  rewardType: 'USDC' | 'NEX';
  rewardAmount: number;
  xpReward: number;
}

interface QuestLogProps {
  userXp: number;
  userLevel: number;
  quests: Quest[];
  completedLessons: string[];
  onCompleteLesson: (lessonId: string, rewardType: 'USDC' | 'NEX', rewardAmt: number, xpReward: number) => void;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
}

const LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Blockchain: The Digital Ledger ⛓️',
    desc: 'Understand how decentralized networks work in 60 seconds.',
    content: 'Think of a blockchain as a gigantic, shared digital notebook. Every time someone sends coins to another person, it is written down in this notebook. Instead of being kept by a single bank, copies of this notebook are shared with thousands of computers around the world. These computers constantly check each other to make sure no one cheats or edits past pages. Because everyone has to agree on what is written, it is virtually impossible to hack!',
    quizQuestion: 'Who keeps copies of the shared blockchain notebook?',
    quizOptions: [
      'A single CEO in an office building',
      'Thousands of independent computers globally',
      'No one, it is completely anonymous and saved nowhere',
      'A top secret satellite'
    ],
    correctAnswerIdx: 1,
    rewardType: 'USDC',
    rewardAmount: 50,
    xpReward: 100,
  },
  {
    id: 'l2',
    title: 'Staking: Digital Piggy Banks 🌸',
    desc: 'How locking coins helps secure networks and earns rewards.',
    content: 'In Proof-of-Stake blockchains, computers secure the network by locking up their coins as collateral (called "Staking"). By locking coins, they prove they are committed to keeping the ledger honest. If they process transactions honestly, the network mints brand new coins as a thank-you reward! If they cheat, they lose their locked coins. Staking is a safe way for beginners to deposit their coins and watch them grow like interest in a bank.',
    quizQuestion: 'What is the main benefit of "Staking" your coins?',
    quizOptions: [
      'It instantly burns the coins forever',
      'It lets you play video games with them',
      'It helps secure the network and rewards you with extra growth tokens',
      'It makes the price drop rapidly'
    ],
    correctAnswerIdx: 2,
    rewardType: 'USDC',
    rewardAmount: 100,
    xpReward: 150,
  },
  {
    id: 'l3',
    title: 'Volatility Circuit Breakers ⚡',
    desc: 'How our guard protects novice traders from lightning crashes.',
    content: 'Cryptocurrencies fluctuate in price very rapidly. If a coin price drops too fast in a matter of seconds, it is called a "flash crash". A Volatility Circuit Breaker or "Flash-Crash Guard" acts like an automatic safety fuse. It monitors the coin price continuously. If it detects a rapid crash exceeding a specific percentage (e.g. 2.5%), it instantly freezes pending transactions and cancels your trade, returning your escrow safely to your wallet!',
    quizQuestion: 'What does a Volatility Circuit Breaker do during a rapid flash crash?',
    quizOptions: [
      'It forces you to borrow more money',
      'It doubles the price of the coin',
      'It automatically freezes and cancels pending orders to save your funds',
      'It logs you out of the application'
    ],
    correctAnswerIdx: 2,
    rewardType: 'NEX',
    rewardAmount: 10,
    xpReward: 200,
  }
];

export default function QuestLog({
  userXp,
  userLevel,
  quests,
  completedLessons,
  onCompleteLesson,
  onNotification,
}: QuestLogProps) {
  const [activeMode, setActiveMode] = useState<'quests' | 'learn'>('quests');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizAnswerIdx, setQuizAnswerIdx] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState(false);

  const completedQuestsCount = quests.filter(q => q.isCompleted).length;

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setQuizAnswerIdx(null);
    setQuizSubmitted(false);
    setQuizError(false);
  };

  const handleSubmitQuiz = () => {
    if (!selectedLesson || quizAnswerIdx === null) return;

    if (quizAnswerIdx === selectedLesson.correctAnswerIdx) {
      setQuizSubmitted(true);
      setQuizError(false);
      onCompleteLesson(
        selectedLesson.id,
        selectedLesson.rewardType,
        selectedLesson.rewardAmount,
        selectedLesson.xpReward
      );
      onNotification('success', `🎉 Correct! You completed the lesson and won $${selectedLesson.rewardAmount} ${selectedLesson.rewardType}!`);
    } else {
      setQuizError(true);
      onNotification('error', '❌ Incorrect answer, review the lesson text and try again!');
    }
  };

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-sans font-bold text-slate-200">Novice Training & Quests Log 🏆</span>
          </div>

          {/* Mini navigation switches */}
          <div className="flex items-center p-0.5 bg-slate-900/60 border border-slate-900 rounded-lg shrink-0">
            <button
              onClick={() => setActiveMode('quests')}
              className={`px-2.5 py-1 text-[10px] font-sans font-bold rounded-md transition cursor-pointer ${
                activeMode === 'quests'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Quests ({completedQuestsCount}/{quests.length})
            </button>
            <button
              onClick={() => setActiveMode('learn')}
              className={`px-2.5 py-1 text-[10px] font-sans font-bold rounded-md transition cursor-pointer ${
                activeMode === 'learn'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Learn to Earn ({completedLessons.length}/{LESSONS.length})
            </button>
          </div>
        </div>

        {/* MODE 1: QUEST CHECKLIST */}
        {activeMode === 'quests' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                Try out different components on the exchange to complete training checklists and unlock your hidden potential!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              {quests.map((q) => (
                <div
                  key={q.id}
                  className={`p-3 border rounded-xl flex gap-3 items-start transition-all ${
                    q.isCompleted
                      ? 'bg-slate-900/20 border-emerald-500/20 opacity-80'
                      : 'bg-slate-900/10 border-slate-900'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {q.isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-sans font-bold ${q.isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {q.title}
                      </span>
                      {q.isCompleted && (
                        <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-1 rounded">
                          +XP AWARDED
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal font-sans">{q.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] font-mono text-cyan-400">🎁 Rewards:</span>
                      <span className="text-[8px] font-mono text-slate-400">+{q.xpReward} XP</span>
                      {q.tokenReward > 0 && (
                        <span className="text-[8px] font-mono text-purple-400">+{q.tokenReward} NEX</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE 2: LEARN TO EARN DECK */}
        {activeMode === 'learn' && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 leading-normal font-sans">
              Complete beautiful bite-sized lessons, answer a simple quiz, and claim real practice cash and experience boosts!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {LESSONS.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className={`p-3.5 border rounded-xl flex flex-col justify-between text-left transition-all ${
                      isCompleted
                        ? 'bg-slate-900/20 border-emerald-500/10 opacity-75'
                        : 'bg-slate-900/10 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <BookOpen className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`} />
                        {isCompleted ? (
                          <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-1 rounded">
                            PASSED 🎉
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono text-amber-500 font-bold bg-amber-950/40 border border-amber-900/30 px-1 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 block truncate">{lesson.title}</span>
                      <p className="text-[9px] text-slate-400 leading-normal mt-1 font-sans">{lesson.desc}</p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-900/50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-slate-500 uppercase">REWARD</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                          {lesson.rewardType === 'USDC' ? <DollarSign className="w-2.5 h-2.5" /> : <Coins className="w-2.5 h-2.5" />}
                          {lesson.rewardAmount} {lesson.rewardType}
                        </span>
                      </div>

                      <button
                        id={`btn-open-lesson-${lesson.id}`}
                        onClick={() => handleOpenLesson(lesson)}
                        className={`px-2 py-1 rounded text-[9px] font-sans font-bold flex items-center gap-1 cursor-pointer transition ${
                          isCompleted
                            ? 'bg-slate-900 text-slate-500 hover:text-slate-300'
                            : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                        }`}
                      >
                        {isCompleted ? 'Review' : 'Start Lesson'}
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DETAILED LESSON & QUIZ DIALOGUE BOX */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0b1329] border border-slate-800/80 rounded-2xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-3.5 mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="text-sm font-bold text-white font-sans">{selectedLesson.title}</span>
                  </div>
                  <button
                    id="close-lesson-btn"
                    onClick={() => setSelectedLesson(null)}
                    className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* Lesson Description */}
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900/50 text-slate-300 text-xs leading-relaxed space-y-3 font-sans">
                  {selectedLesson.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Interactive Quiz Segment */}
                <div className="mt-5 space-y-3">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                    🎓 Interactive mini-quiz
                  </span>
                  <p className="text-xs font-bold text-slate-200 font-sans">{selectedLesson.quizQuestion}</p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {selectedLesson.quizOptions.map((opt, idx) => {
                      const isSelected = quizAnswerIdx === idx;
                      const isCompleted = completedLessons.includes(selectedLesson.id);

                      return (
                        <button
                          key={idx}
                          disabled={isCompleted || quizSubmitted}
                          onClick={() => setQuizAnswerIdx(idx)}
                          className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer flex justify-between items-center ${
                            isSelected
                              ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 font-semibold'
                              : isCompleted && idx === selectedLesson.correctAnswerIdx
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400 font-semibold'
                              : 'bg-slate-950/40 border-slate-900 text-slate-300 hover:border-slate-800'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                          {isCompleted && idx === selectedLesson.correctAnswerIdx && (
                            <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-1 rounded shrink-0">
                              CORRECT
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quiz Submission Area */}
              <div className="mt-6 pt-4 border-t border-slate-900/80 flex items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">REWARDS TO BE WON</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    +{selectedLesson.rewardAmount} {selectedLesson.rewardType} & +{selectedLesson.xpReward} XP
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    id="cancel-lesson-action-btn"
                    onClick={() => setSelectedLesson(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-sans text-slate-300 cursor-pointer"
                  >
                    Close
                  </button>

                  {!completedLessons.includes(selectedLesson.id) && (
                    <button
                      id="submit-lesson-quiz-btn"
                      onClick={handleSubmitQuiz}
                      disabled={quizAnswerIdx === null || quizSubmitted}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl text-xs font-sans font-bold text-slate-950 transition cursor-pointer"
                    >
                      {quizSubmitted ? 'Completed' : 'Submit Quiz Answer'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
