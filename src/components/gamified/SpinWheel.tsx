import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface SpinWheelProps {
  onWinReward: (type: 'USDC' | 'NEX' | 'XP', amount: number, label: string) => void;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
}

interface WheelSegment {
  label: string;
  color: string;
  value: number;
  type: 'USDC' | 'NEX' | 'XP';
}

const SEGMENTS: WheelSegment[] = [
  { label: '+$100 USDC 💰', color: '#06b6d4', value: 100, type: 'USDC' },
  { label: '+10 NEX Tokens 🔮', color: '#10b981', value: 10, type: 'NEX' },
  { label: '+150 XP Boost ✨', color: '#8b5cf6', value: 150, type: 'XP' },
  { label: '+$50 USDC 💵', color: '#3b82f6', value: 50, type: 'USDC' },
  { label: '+5 NEX Tokens 🌀', color: '#f59e0b', value: 5, type: 'NEX' },
  { label: '+50 XP Mini Boost ⭐', color: '#ec4899', value: 50, type: 'XP' },
  { label: '+$200 USDC Jackpot! 🎰', color: '#10b981', value: 200, type: 'USDC' },
  { label: '+20 NEX Epic Tokens 💎', color: '#06b6d4', value: 20, type: 'NEX' },
];

export default function SpinWheel({ onWinReward, onNotification }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [winnerLabel, setWinnerLabel] = useState<string | null>(null);

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setWinnerLabel(null);

    // Generate random full spins (5 to 10) + a random slice offset
    const randomSpins = 5 + Math.floor(Math.random() * 5);
    const sliceCount = SEGMENTS.length;
    const sliceAngle = 360 / sliceCount;
    const winningSliceIndex = Math.floor(Math.random() * sliceCount);

    // Calculate rotation angle. To align the winner at the top (0 or 360 deg), 
    // we need to rotate backwards from the selection index
    const winningAngle = winningSliceIndex * sliceAngle;
    const finalRotation = rotation + (randomSpins * 360) - winningAngle + (Math.random() * (sliceAngle - 4) + 2);

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      
      const winningSegment = SEGMENTS[winningSliceIndex];
      setWinnerLabel(winningSegment.label);

      // Trigger reward callback
      onWinReward(winningSegment.type, winningSegment.value, winningSegment.label);
      onNotification('success', `🎉 Practice Wheel of Fortune: You won ${winningSegment.label}!`);
    }, 4000); // 4 seconds spin animation
  };

  const resetWheel = () => {
    setHasSpun(false);
    setWinnerLabel(null);
  };

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between h-full relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-sans font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Spin the Practice Wheel of Fortune 🎰
          </span>
          <span className="text-[10px] font-sans text-slate-500 uppercase">Once Per Session</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-normal mb-6 font-sans">
          Test your luck on our safe practicing wheel to instantly top up your virtual balances or gain major experience boosts!
        </p>

        {/* Wheel Display Wrapper */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          
          {/* Wheel pointer (Arrow at the top) */}
          <div className="absolute top-[4px] z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-amber-400 drop-shadow-md" />

          {/* Rotating Wheel Graphic */}
          <div className="w-48 h-48 rounded-full border-4 border-slate-900 relative shadow-2xl flex items-center justify-center overflow-hidden bg-slate-950">
            <motion.div
              animate={{ rotate: rotation }}
              transition={isSpinning ? { duration: 4, ease: [0.15, 0.85, 0.35, 1.0] } : { duration: 0 }}
              className="w-full h-full rounded-full relative"
              style={{ transformOrigin: 'center' }}
            >
              {SEGMENTS.map((seg, idx) => {
                const angle = 360 / SEGMENTS.length;
                const rotateDeg = idx * angle;

                return (
                  <div
                    key={idx}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      transform: `rotate(${rotateDeg}deg)`,
                      clipPath: 'polygon(50% 50%, 30% 0%, 70% 0%)',
                    }}
                  >
                    {/* Background color block */}
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: seg.color, opacity: 0.15 }}
                    />
                    {/* Divider line */}
                    <div
                      className="absolute top-0 left-[50%] w-0.5 h-[50%] bg-slate-900/40"
                      style={{ transform: 'translateX(-50%)' }}
                    />
                    {/* Emoji or text identifier */}
                    <span
                      className="absolute top-4 left-[50%] text-[8px] font-bold font-mono text-slate-200 select-none tracking-tight"
                      style={{
                        transform: 'translateX(-50%) rotate(0deg)',
                        writingMode: 'vertical-rl',
                      }}
                    >
                      {seg.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </motion.div>

            {/* Central Pin Button */}
            <button
              id="spin-wheel-btn"
              disabled={isSpinning || hasSpun}
              onClick={handleSpin}
              className={`absolute w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold shadow-xl transition-all duration-200 select-none z-10 ${
                isSpinning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed scale-95'
                  : hasSpun
                  ? 'bg-slate-900 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95 cursor-pointer hover:shadow-amber-500/10'
              }`}
            >
              {isSpinning ? '...' : hasSpun ? 'Done' : 'SPIN!'}
            </button>
          </div>

          {/* Reward Status Banner */}
          <div className="mt-4 h-6 flex items-center justify-center">
            {winnerLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-bold text-center bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 px-3 py-1 rounded-full flex items-center gap-1.5"
              >
                <span>You Won:</span>
                <span className="text-white font-mono">{winnerLabel}</span>
              </motion.div>
            )}

            {hasSpun && !isSpinning && (
              <button
                onClick={resetWheel}
                className="text-[9px] font-sans text-slate-500 hover:text-slate-300 underline cursor-pointer ml-3"
              >
                Reset for new Practice Spin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
