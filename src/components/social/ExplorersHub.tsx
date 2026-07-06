import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';

export default function ExplorersHub() {
  const [isOpen, setIsOpen] = useState(false);

  const glossary = [
    {
      term: "Zero-Knowledge Proof (ZK-Proof)",
      analogy: "Proof without snooping",
      definition: "A magical mathematical method that lets you prove you have high trading scores or a certain amount of cash without revealing your identity, your actual wallet address, or your total balances."
    },
    {
      term: "Proportional Copy-Trading",
      analogy: "Automatic portfolio mimicry",
      definition: "Instead of guessing what to buy, you follow a master trader. If you copy them with $100, and they hold 40% Solana and 60% Ethereum, the system automatically buys $40 of Solana and $60 of Ethereum for you!"
    },
    {
      term: "Decentralized Group Piggy Bank (Guild)",
      analogy: "Co-op voting circles",
      definition: "A shared wallet you create with friends or other investors. You pool your money together into one big balance, and anyone can suggest what coins to buy. The group then votes democratically to approve or reject the trade!"
    },
    {
      term: "Strategy Time-Machine (Backtesting)",
      analogy: "Retroactive simulation",
      definition: "Running your trading rules against historical price logs from 1, 3, or 5 years ago to see if your plan would have made you a fortune or cost you money before you risk real cash."
    },
    {
      term: "Social Sentiment (Crowd Mood)",
      analogy: "The internet vibe check",
      definition: "An automated web-crawler that monitors chatrooms, news headline trends, and social posts to calculate if investors are ecstatic (bullish) or panicking (bearish)."
    },
    {
      term: "Safety Guarantee Deposit (Collateral)",
      analogy: "Blockchain pawn shop",
      definition: "Locking up your valuable coins (like SOL or ETH) in a digital vault as a security promise so you can borrow spendable cash (USDC) instantly. Once you pay back the cash plus tiny interest, you get your coins back!"
    }
  ];

  return (
    <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-900/50 transition duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/40 rounded-xl text-cyan-400 border border-cyan-900/30">
            <HelpCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              Curious Explorers' Panel: Community & Social Terms Decoded!
              <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-900/30">Beginner Friendly</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click to unfold a quick, 15-year-old friendly cheat sheet explaining the advanced tech behind our community.
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-slate-900/80 bg-slate-950/30"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {glossary.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-900/25 border border-slate-900/50 rounded-xl space-y-2 hover:border-slate-800/80 transition duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">{item.term}</span>
                    <span className="text-[8px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900 uppercase">
                      {item.analogy}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
