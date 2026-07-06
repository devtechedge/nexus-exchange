import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function DevelopersHelpHub() {
  const [isOpen, setIsOpen] = useState(false);

  const entries = [
    {
      term: 'Secret Algorithmic Access Passcodes (API Keys)',
      meaning: 'A unique username and password combo that computer programs (bots) use to log in and talk directly to our exchange, allowing you to trade automatically without clicking buttons in the UI.'
    },
    {
      term: 'Self-Destructing Keys (Timed Session Leases)',
      meaning: 'An ultra-safe security guard feature. You can make an access key that automatically gets deleted and stops working after a few minutes, or after it places a specific number of trades, so no one can steal your funds!'
    },
    {
      term: 'Automatic Code-Recipe Generator (SDK Code-Gen)',
      meaning: 'A clever visual playground that writes ready-to-run computer code in languages like TypeScript, Python, Rust, and Go as you adjust settings on your screen. Just copy, paste, and run your automated bot!'
    },
    {
      term: 'Instant Outbound Auto-Alerts (Webhooks)',
      meaning: 'A system where our exchange immediately "knocks on your computer\'s door" the microsecond a price drifts or a trade fills, so your automated algorithms know what happened instantly.'
    },
    {
      term: 'Practice Playground (Isolated Sandbox)',
      meaning: 'A safe, simulated clone of the entire exchange where you get fake test capital to test your automated bots without risk of losing real money.'
    },
    {
      term: 'Artificial Lag Sliders (Network Latency Injector)',
      meaning: 'Sliders that let you simulate a bad internet connection or network traffic jams, helping you test if your automated software stays robust and handles hiccups gracefully.'
    },
    {
      term: 'Decentralized Public Math Audit (Merkle Proof of Reserves)',
      meaning: 'A mathematical guarantee. By combining hashes of all account balances into a "tree" structure, we prove publicly that we hold exactly enough coins to back every user\'s cash 1:1, verified with bulletproof cryptography.'
    }
  ];

  return (
    <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl overflow-hidden">
      <button
        id="btn-toggle-dev-help"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-900/35 transition cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 rounded-lg">
            <HelpCircle className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <span className="text-xs font-bold font-mono text-cyan-400 tracking-wider block">CURIOUS DEVELOPER CHEAT-SHEET</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Demystifying technical terms & bot instructions in simple English</span>
          </div>
        </div>

        <div className="text-slate-500">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-900 overflow-hidden"
          >
            <div className="p-5 bg-slate-950/20 grid grid-cols-1 md:grid-cols-2 gap-4">
              {entries.map((entry, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{entry.term}</span>
                  </div>
                  <p className="text-[10px] font-sans text-slate-400 leading-relaxed">
                    {entry.meaning}
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
