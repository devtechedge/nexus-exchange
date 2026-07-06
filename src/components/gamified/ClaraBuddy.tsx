import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, MessageSquare, X, Send, Sparkles } from 'lucide-react';

interface ClaraBuddyProps {
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
  onTriggerQuestCompletion: (questId: string) => void;
}

interface ChatMessage {
  sender: 'clara' | 'user';
  text: string;
  emote: 'happy' | 'thinking' | 'excited' | 'sleepy' | 'nerd';
}

const PRESET_TOPICS = [
  { q: "What is Staking? 🌸", trigger: "staking" },
  { q: "How do I buy/sell? 💰", trigger: "trade" },
  { q: "What are Circuit Breakers? ⚡", trigger: "circuit" },
  { q: "Is my Piggy Bank safe? 🛡️", trigger: "safety" },
];

export default function ClaraBuddy({ onNotification, onTriggerQuestCompletion }: ClaraBuddyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'clara',
      text: 'Hi there! I am Clara, your helper hamster! 🐹 I can explain complicated crypto stuff in simple terms that make sense! Ask me anything, or pick one of my favorite topics below!',
      emote: 'happy',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto show a speech bubble hint after 3 seconds so beginners are invited to click
  const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleTopicClick = (trigger: string, question: string) => {
    // Add user message
    const userMsg: ChatMessage = { sender: 'user', text: question, emote: 'happy' };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    onTriggerQuestCompletion('clara'); // completes the quest!

    setTimeout(() => {
      let responseText = '';
      let emote: 'happy' | 'thinking' | 'excited' | 'sleepy' | 'nerd' = 'happy';

      if (trigger === 'staking') {
        responseText = "Staking is like planting a virtual digital seed! 🌸 Instead of just letting your coins sit in your wallet, you 'lock' them in our high-yield safety garden. This helps secure the ledger, and in return, the network rewards you by growing brand-new fraction tokens every second! It is like earning interest, but cooler.";
        emote = 'excited';
      } else if (trigger === 'trade') {
        responseText = "To trade, click the 'Buy, Sell & Swap Center' on the sidebar! 💰 Pick any coin, type how much USDC (which is our practice digital cash) you want to exchange, and click BUY. To make it super easy, we also have quick BUY/SELL buttons right on the home dashboard next to each coin!";
        emote = 'happy';
      } else if (trigger === 'circuit') {
        responseText = "Circuit Breakers are like magical safety nets! ⚡ Price changes can sometimes feel like a crazy rollercoaster. If you turn on our circuit breaker and set a threshold (like 2%), our systems will automatically freeze and cancel your orders if the price drops too fast in seconds, saving your pocket change!";
        emote = 'nerd';
      } else if (trigger === 'safety') {
        responseText = "Oh absolutely! 🛡️ All your funds are 100% simulated play-money (no real credit cards or cash needed!), secured behind simulated state-of-the-art cold multi-signature vault guards. No hacker can take your virtual piggy bank change, so feel free to experiment safely!";
        emote = 'excited';
      }

      setMessages(prev => [...prev, { sender: 'clara', text: responseText, emote }]);
      setIsTyping(false);
    }, 8000 / 8); // nice 1s delay
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const query = inputValue.trim();
    setMessages(prev => [...prev, { sender: 'user', text: query, emote: 'happy' }]);
    setInputValue('');
    setIsTyping(true);
    onTriggerQuestCompletion('clara'); // completes the quest!

    setTimeout(() => {
      let responseText = '';
      let emote: 'happy' | 'thinking' | 'excited' | 'sleepy' | 'nerd' = 'thinking';

      const text = query.toLowerCase();
      if (text.includes('hi') || text.includes('hello')) {
        responseText = "Hello friend! Squeak! 🐹 Hope you are having a wonderful time practicing trading today! What can I explain for you?";
        emote = 'happy';
      } else if (text.includes('buy') || text.includes('sell') || text.includes('trade')) {
        responseText = "Buying and selling is just exchanging one card for another! You use your digital practice dollars (USDC) to buy coins like Bitcoin (BTC) or Solana (SOL). If you think the coin value will rise, you buy! If you want to secure your gains, you sell back to USDC!";
        emote = 'happy';
      } else if (text.includes('risk') || text.includes('lose') || text.includes('scared')) {
        responseText = "Don't worry, squeak! 🐹 This is a risk-free playground. None of the money is real, so you can practice as many crazy strategies or bots as you want without losing any real cash! It's like playing monopoly.";
        emote = 'excited';
      } else if (text.includes('bot') || text.includes('grid')) {
        responseText = "Our Grid Bots are automated little helper hamsters! 🤖 They automatically place a grid of buy and sell orders. When a coin fluctuates up and down, the bot buys low and sells high automatically while you sleep! You can set one up in the Trade tab.";
        emote = 'nerd';
      } else if (text.includes('zk') || text.includes('proof')) {
        responseText = "Zero-Knowledge Proofs are like mathematical magic! 🔮 It allows you to prove to a friend that you made high-score profits, without actually showing them how much money you have in your account. Math is used to encrypt and verify your gains!";
        emote = 'nerd';
      } else if (text.includes('hamster') || text.includes('clara')) {
        responseText = "Aww, yes, that is me! 🐹 I live inside your browser sandbox to help keep financial systems super simple and accessible. I love sunflower seeds, blockchain math, and helping beginners grow their confidence!";
        emote = 'excited';
      } else {
        responseText = "Squeak! 🐹 I am not 100% sure about that specific term, but I suggest trying out our simple 'Buy, Sell & Swap' tab, locking some coins into 'Rewards Center' (Staking), or checking out my predefined help topics below!";
        emote = 'happy';
      }

      setMessages(prev => [...prev, { sender: 'clara', text: responseText, emote }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Clara Avatar Trigger in bottom right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Tooltip bubble */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-sans font-bold px-3 py-1.5 rounded-xl shadow-xl border border-amber-400 relative mr-1 flex items-center gap-1.5"
            >
              <span>Stuck? Let Clara help! 🐹</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-slate-950/70 hover:text-slate-950 cursor-pointer text-xs"
              >
                ×
              </button>
              <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-orange-500 rotate-45 border-r border-b border-amber-400" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          id="clara-trigger-btn"
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-3xl shadow-2xl transition-all duration-300 relative group cursor-pointer ${
            isOpen
              ? 'bg-slate-900 border-slate-700 text-white rotate-90'
              : 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 hover:scale-105 active:scale-95 shadow-amber-500/20'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-slate-300" />
          ) : (
            <span className="group-hover:animate-bounce">🐹</span>
          )}

          {/* Glowing pulse aura when closed */}
          {!isOpen && (
            <div className="absolute inset-[-4px] rounded-full border-2 border-amber-400/30 animate-ping pointer-events-none" />
          )}
        </button>
      </div>

      {/* Clara Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-80 md:w-96 bg-[#0c1224] border border-slate-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[420px]"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-2xl">🐹</div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white font-sans flex items-center gap-1">
                    Clara the Help-Buddy
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400">● ALWAYS ACTIVE & READY</span>
                </div>
              </div>
              <button
                id="close-clara-btn"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Feed area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {messages.map((msg, idx) => {
                const isClara = msg.sender === 'clara';

                return (
                  <div key={idx} className={`flex ${isClara ? 'justify-start' : 'justify-end'} items-start gap-2 text-left`}>
                    {isClara && (
                      <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0">
                        {msg.emote === 'happy' && '🐹'}
                        {msg.emote === 'thinking' && '🤔'}
                        {msg.emote === 'excited' && '🤩'}
                        {msg.emote === 'sleepy' && '💤'}
                        {msg.emote === 'nerd' && '🤓'}
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-xl max-w-[80%] text-[11px] leading-relaxed font-sans ${
                        isClara
                          ? 'bg-slate-900/60 text-slate-200 border border-slate-900/40 rounded-tl-none'
                          : 'bg-amber-400 text-slate-950 font-medium rounded-tr-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm">
                    🐹
                  </div>
                  <div className="bg-slate-900/40 border border-slate-900/30 p-2 px-3 rounded-xl flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick helper buttons */}
            <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-900/50 flex flex-wrap gap-1.5">
              {PRESET_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleTopicClick(topic.trigger, topic.q)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-900 text-[10px] font-sans text-slate-300 rounded-lg cursor-pointer transition hover:text-white"
                >
                  {topic.q}
                </button>
              ))}
            </div>

            {/* Text input form */}
            <form onSubmit={handleSendMessage} className="p-3.5 bg-slate-950 border-t border-slate-900/80 flex gap-2">
              <input
                id="clara-input-text"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Clara: e.g. 'What is a bot?'"
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 font-sans"
              />
              <button
                id="send-clara-msg-btn"
                type="submit"
                className="p-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl cursor-pointer transition flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
