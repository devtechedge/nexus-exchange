import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  ThumbsUp, 
  Sparkles, 
  Check, 
  Users, 
  Zap, 
  Bell, 
  Send, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  Sliders, 
  MessageSquare, 
  Wifi, 
  ExternalLink,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import { TradeSignalStrategy, SovereignGuild } from '../../types';

interface SignalsPanelProps {
  strategies: TradeSignalStrategy[];
  balances: { [key: string]: number };
  setBalances: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  onNotification: (type: 'success' | 'error' | 'info', text: string) => void;
  guilds: SovereignGuild[];
  guildDepositInput: { [key: string]: string };
  setGuildDepositInput: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleSubscribeSignal: (stratId: string) => void;
  handleUpvoteStrategy: (stratId: string) => void;
  handleGuildDeposit: (guildId: string) => void;
  handleVoteProposal: (guildId: string, vote: 'yes' | 'no') => void;
}

export default function SignalsPanel({
  strategies,
  balances,
  setBalances,
  onNotification,
  guilds,
  guildDepositInput,
  setGuildDepositInput,
  handleSubscribeSignal,
  handleUpvoteStrategy,
  handleGuildDeposit,
  handleVoteProposal
}: SignalsPanelProps) {
  // --- SUB-TABS MANAGER ---
  // Toggles between original shop, outbound notification channels, and live broadcasts feed
  const [activeTab, setActiveTab] = useState<'shop' | 'outbound' | 'feed'>('shop');

  // --- OUTBOUND CHANNELS STATE ---
  const [discordStatus, setDiscordStatus] = useState<'unlinked' | 'connecting' | 'linked'>('unlinked');
  const [telegramStatus, setTelegramStatus] = useState<'unlinked' | 'connecting' | 'linked'>('unlinked');
  const [slackStatus, setSlackStatus] = useState<'unlinked' | 'connecting' | 'linked'>('unlinked');

  const [discordWebhook, setDiscordWebhook] = useState('https://discord.com/api/webhooks/983172031/aBcDeFg12345');
  const [telegramChatId, setTelegramChatId] = useState('@nexus_exchange_alerts');
  const [telegramBotToken, setTelegramBotToken] = useState('718290314:AAH_zkP93_NExUsPlAyEr_87acb');
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX');

  const [activeHandshakeChannel, setActiveHandshakeChannel] = useState<'telegram' | 'discord' | 'slack' | null>(null);
  const [handshakeSteps, setHandshakeSteps] = useState<string[]>([]);

  // --- MOCK OUTBOUND TELEMETRY CONSOLE & MESSENGER VIEWER ---
  const [telemetryTrace, setTelemetryTrace] = useState<string | null>(null);
  const [socialBubblePreview, setSocialBubblePreview] = useState<{
    channel: 'telegram' | 'discord' | 'slack';
    title: string;
    body: string;
    timestamp: string;
  } | null>(null);

  // --- ALERT TRIGGER RULES STATE ---
  const [rules, setRules] = useState([
    { id: 'rule-1', asset: 'SOL', eventType: 'Price Drift > 3%', channels: ['telegram', 'discord'], isEnabled: true, dispatchCount: 4 },
    { id: 'rule-2', asset: 'ETH', eventType: 'Strategy Alert Signal', channels: ['discord'], isEnabled: true, dispatchCount: 9 },
    { id: 'rule-3', asset: 'NEX', eventType: 'Copy-Trading Liquidations', channels: ['telegram'], isEnabled: false, dispatchCount: 0 }
  ]);

  const [newRuleAsset, setNewRuleAsset] = useState('SOL');
  const [newRuleEvent, setNewRuleEvent] = useState('Price Drift > 3%');
  const [newRuleTelegram, setNewRuleTelegram] = useState(true);
  const [newRuleDiscord, setNewRuleDiscord] = useState(true);
  const [newRuleSlack, setNewRuleSlack] = useState(false);

  // --- LIVE BROADCAST SIGNALS FEED STATE ---
  const [signalsList, setSignalsList] = useState([
    {
      id: 'broadcast-1',
      asset: 'SOL',
      type: 'BUY' as const,
      price: 145.25,
      accuracy: 84.1,
      provider: 'SovereignTrader #481',
      strategy: 'ATR-Cushioned Breakout Bot',
      time: 'Just now',
      reason: 'Upper Volatility Band crossed with high momentum. Confirmed by 14 validator nodes.',
      upvotes: 42,
      hasUpvoted: false,
      confidence: 91
    },
    {
      id: 'broadcast-2',
      asset: 'LINK',
      type: 'SELL' as const,
      price: 15.40,
      accuracy: 78.4,
      provider: 'ShadowPool #99',
      strategy: 'Bollinger Band Squeeze v3',
      time: '8m ago',
      reason: 'Volume Compression breakdown. Support levels breached under high volume sell orders.',
      upvotes: 18,
      hasUpvoted: false,
      confidence: 76
    },
    {
      id: 'broadcast-3',
      asset: 'ETH',
      type: 'BUY' as const,
      price: 3240.10,
      accuracy: 69.8,
      provider: 'AlchemicViper #102',
      strategy: 'EMA Cross-over Golden Gate',
      time: '19m ago',
      reason: 'Daily 50 EMA and 200 EMA golden cross forming on secondary liquidity maps.',
      upvotes: 27,
      hasUpvoted: false,
      confidence: 83
    }
  ]);

  // Mirror Trades modal states
  const [mirroringSignalId, setMirroringSignalId] = useState<string | null>(null);
  const [mirrorAmount, setMirrorAmount] = useState('100');
  const [mirrorProgress, setMirrorProgress] = useState(0);
  const [isMirroring, setIsMirroring] = useState(false);

  // --- OUTBOUND INTEGRATION HANDSHAKE PIPELINE ---
  const handleConnectChannel = (channel: 'telegram' | 'discord' | 'slack') => {
    setActiveHandshakeChannel(channel);
    setHandshakeSteps([]);
    setTelemetryTrace(null);
    setSocialBubblePreview(null);

    const setStatus = channel === 'telegram' ? setTelegramStatus : channel === 'discord' ? setDiscordStatus : setSlackStatus;
    setStatus('connecting');

    const steps = [
      `Initializing secure outbound TLS handshake...`,
      `Validating receiver credentials & webhook layout schema...`,
      `Pinging API endpoint to audit request latency...`,
      `Success! Verification token signature approved. Outbound socket linked.`
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setHandshakeSteps(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setStatus('linked');
          setActiveHandshakeChannel(null);
          onNotification('success', `${channel.charAt(0).toUpperCase() + channel.slice(1)} notification channel registered successfully!`);
        }
      }, (idx + 1) * 600);
    });
  };

  const handleDisconnectChannel = (channel: 'telegram' | 'discord' | 'slack') => {
    const setStatus = channel === 'telegram' ? setTelegramStatus : channel === 'discord' ? setDiscordStatus : setSlackStatus;
    setStatus('unlinked');
    setTelemetryTrace(null);
    setSocialBubblePreview(null);
    onNotification('info', `Disconnected ${channel.charAt(0).toUpperCase() + channel.slice(1)} alerts channel.`);
  };

  // --- OUTBOUND TELEMETRY TEST DISPATCHER ---
  const handleTestDispatch = (channel: 'telegram' | 'discord' | 'slack') => {
    onNotification('info', `Simulating outbound dispatch to ${channel.toUpperCase()}...`);
    setTelemetryTrace(`[ATTEMPT] Broadcasting encrypted webhook payload to verified gateway...\n➔ Receiver Channel: ${channel.toUpperCase()}\n`);

    setTimeout(() => {
      const signature = `0x${Math.random().toString(16).substr(2, 40)}`;
      const payload = {
        app: "Nexus Exchange Alerts",
        network: "Mainnet-Consensus",
        timestamp: new Date().toISOString(),
        payload: {
          event: "VOLATILITY_BREACH",
          asset: "SOL",
          trigger_condition: "Price Drift > 3%",
          current_value: "$145.25",
          source: "Dynamic Social Engine",
          attestation_node: signature
        }
      };

      setTelemetryTrace(prev => 
        (prev || '') + 
        `HTTP/1.1 200 OK\n` +
        `Content-Type: application/json\n` +
        `X-Signature-Attestation: HMAC-SHA256-${signature.substr(0, 10)}\n\n` +
        `PAYLOAD SENT:\n${JSON.stringify(payload, null, 2)}`
      );

      setSocialBubblePreview({
        channel,
        title: channel === 'discord' ? "🚨 NEXUS DYNAMIC SIGNAL ALERT" : "📢 NEXUS VOLATILITY SIGNAL",
        body: `Asset SOL has triggered your alert condition: "Price Drift > 3%". Current Spot Index: $145.25. Verification Hash: ${signature.substr(0, 12)}...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Increment Rule Counter of rules matching the asset
      setRules(prev => prev.map(r => r.asset === 'SOL' ? { ...r, dispatchCount: r.dispatchCount + 1 } : r));

      onNotification('success', `Test alert successfully pushed to ${channel.toUpperCase()} mock sandbox!`);
    }, 800);
  };

  // --- CREATE NEW ALERT TRIGGER RULE ---
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const channelsArr: string[] = [];
    if (newRuleTelegram) channelsArr.push('telegram');
    if (newRuleDiscord) channelsArr.push('discord');
    if (newRuleSlack) channelsArr.push('slack');

    if (channelsArr.length === 0) {
      onNotification('error', 'Please select at least one active destination channel.');
      return;
    }

    const newRule = {
      id: `rule-${Math.floor(Math.random() * 9000 + 1000)}`,
      asset: newRuleAsset,
      eventType: newRuleEvent,
      channels: channelsArr,
      isEnabled: true,
      dispatchCount: 0
    };

    setRules(prev => [newRule, ...prev]);
    onNotification('success', `Dynamic alert rule created! Monitoring spot data feeds for ${newRuleAsset}.`);
    
    // Reset inputs
    setNewRuleTelegram(true);
    setNewRuleDiscord(true);
    setNewRuleSlack(false);
  };

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
    const rule = rules.find(r => r.id === id);
    if (rule) {
      onNotification('info', `Rule monitoring for ${rule.asset} has been ${rule.isEnabled ? 'PAUSED' : 'RESUMED'}.`);
    }
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    onNotification('success', 'Alert rule deleted.');
  };

  // --- UPVOTE LIVE SOCIAL BROADCAST ---
  const handleUpvoteBroadcast = (id: string) => {
    setSignalsList(prev => prev.map(sig => {
      if (sig.id === id) {
        const nextUpvotes = sig.hasUpvoted ? sig.upvotes - 1 : sig.upvotes + 1;
        onNotification('success', sig.hasUpvoted ? 'Upvote retracted.' : 'Signal upvoted! Re-calculating global trust score.');
        return {
          ...sig,
          upvotes: nextUpvotes,
          hasUpvoted: !sig.hasUpvoted
        };
      }
      return sig;
    }));
  };

  // --- INSTANT MIRROR TRADE EXECUTION FLOW ---
  const handleInitiateMirror = (id: string) => {
    setMirroringSignalId(id);
    setMirrorProgress(0);
    setIsMirroring(false);
  };

  const handleConfirmMirror = () => {
    const amountFloat = parseFloat(mirrorAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      onNotification('error', 'Enter a valid positive number to execute mirror swap.');
      return;
    }

    const currentUsdc = balances['USDC'] || 0;
    const signal = signalsList.find(s => s.id === mirroringSignalId);
    if (!signal) return;

    if (signal.type === 'BUY') {
      // Mirroring BUY: We buy signal.asset using USDC
      if (amountFloat > currentUsdc) {
        onNotification('error', `Insufficient USDC balance. You have: $${currentUsdc.toFixed(2)} USDC.`);
        return;
      }

      setIsMirroring(true);
      const interval = setInterval(() => {
        setMirrorProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setIsMirroring(false);

            // Execute the trade (Deduct USDC, Add Asset)
            const unitsBought = amountFloat / signal.price;
            setBalances(prev => ({
              ...prev,
              USDC: prev['USDC'] - amountFloat,
              [signal.asset]: (prev[signal.asset] || 0) + unitsBought
            }));

            onNotification('success', `Mirror Trade Cleared! Deducted $${amountFloat.toFixed(2)} USDC, credited +${unitsBought.toFixed(4)} ${signal.asset} into exchange balance.`);
            setMirroringSignalId(null);
            return 100;
          }
          return p + 25;
        });
      }, 200);

    } else {
      // Mirroring SELL: We sell signal.asset to receive USDC
      const currentAssetBalance = balances[signal.asset] || 0;
      const unitsToSell = amountFloat / signal.price;

      if (unitsToSell > currentAssetBalance) {
        onNotification('error', `Insufficient ${signal.asset} balance. Required: ${unitsToSell.toFixed(4)} ${signal.asset}. Available: ${currentAssetBalance.toFixed(4)} ${signal.asset}.`);
        return;
      }

      setIsMirroring(true);
      const interval = setInterval(() => {
        setMirrorProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setIsMirroring(false);

            // Execute the trade (Deduct Asset, Add USDC)
            setBalances(prev => ({
              ...prev,
              [signal.asset]: prev[signal.asset] - unitsToSell,
              USDC: (prev['USDC'] || 0) + amountFloat
            }));

            onNotification('success', `Mirror Trade Cleared! Liquidated -${unitsToSell.toFixed(4)} ${signal.asset}, credited +$${amountFloat.toFixed(2)} USDC into exchange balance.`);
            setMirroringSignalId(null);
            return 100;
          }
          return p + 25;
        });
      }, 200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation Hub for Signals & Alerts Batch 6 */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-900 rounded-xl w-full max-w-md mx-auto sm:mx-0">
        <button
          onClick={() => { setActiveTab('shop'); setTelemetryTrace(null); setSocialBubblePreview(null); }}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
            activeTab === 'shop' 
              ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Idea Shop & Guilds</span>
        </button>
        <button
          id="tab-outbound-alerts"
          onClick={() => { setActiveTab('outbound'); setTelemetryTrace(null); setSocialBubblePreview(null); }}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
            activeTab === 'outbound' 
              ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Outbound Alerts</span>
        </button>
        <button
          id="tab-live-feed"
          onClick={() => { setActiveTab('feed'); setTelemetryTrace(null); setSocialBubblePreview(null); }}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
            activeTab === 'feed' 
              ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Live Broadcast Feed</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: ORIGINAL IDEA SHOP & CO-OP GUILDS */}
        {activeTab === 'shop' && (
          <motion.div
            key="shop-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Recipe Alert Shop */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  Trading Idea & Recipe Shop (Alert Subscriptions)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Subscribe to automatic alerts and clever technical recipes built by experienced analysts. Paid safely and easily using native exchange utility tokens (<strong>NEX</strong>).
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {strategies.map((strat) => (
                  <div key={strat.id} className="p-5 bg-slate-900/30 border border-slate-900 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-white">{strat.title}</span>
                          <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-900">
                            Vibe Accuracy: {strat.accuracy}%
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 font-sans">
                          Created by: <span className="font-mono text-slate-400">{strat.provider}</span> • Trust Score: <span className="text-cyan-400 font-mono font-bold">{strat.reputationLevel}</span>
                        </p>
                      </div>

                      {/* Reputational upvoting tracker */}
                      <div className="flex items-center gap-2.5">
                        <button
                          id={`btn-upvote-${strat.id}`}
                          onClick={() => handleUpvoteStrategy(strat.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-lg text-[10px] font-mono text-slate-300 transition cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{strat.upvotes} Upvotes</span>
                        </button>
                        <div className="px-2 py-1 bg-slate-950 border border-slate-900 rounded-lg text-right">
                          <span className="text-[8px] text-slate-500 block leading-none font-mono">TRUST GRADE</span>
                          <span className="text-[10px] font-mono font-bold text-cyan-400">{strat.reputationScore.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 border border-transparent border-l-cyan-500/30 pl-3 py-1 font-sans">
                      {strat.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500">Alert Fee:</span>
                        <span className="text-xs font-bold font-mono text-cyan-400">{strat.priceNex} NEX</span>
                        <span className="text-[9px] text-slate-500 font-sans">/ month</span>
                      </div>

                      <button
                        id={`btn-sub-signal-${strat.id}`}
                        onClick={() => handleSubscribeSignal(strat.id)}
                        disabled={strat.isSubscribed}
                        className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                          strat.isSubscribed
                            ? 'bg-emerald-950/30 border border-emerald-900/60 text-emerald-400 cursor-not-allowed'
                            : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950'
                        }`}
                      >
                        {strat.isSubscribed ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Alerts Active ✓
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Subscribe to Alerts
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Guild Co-Op Portfolios */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Shared Co-Op Accounts (Guilds)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pool cash together with friends or online co-ops to manage a combined group treasury. All decisions are approved democratically by voting circles!
                </p>
              </div>

              <div className="space-y-6">
                {guilds.map((guild) => (
                  <div key={guild.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{guild.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">Members: {guild.membersCount}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">MY POOLED FUNDS</span>
                        <span className="text-xs font-bold font-mono text-cyan-400">${guild.userShare.toFixed(2)} USDC</span>
                      </div>
                    </div>

                    {/* Proportional asset weights */}
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Group Investment Split:</span>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {Object.entries(guild.consensusDistribution).map(([symbol, pct]) => (
                          <span key={symbol} className="text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded">
                            {symbol}: {pct}%
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Deposit controller */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-900/80">
                      <div className="relative flex-1">
                        <input
                          id={`guild-dep-input-${guild.id}`}
                          type="number"
                          placeholder="Add USDC to Group"
                          value={guildDepositInput[guild.id] || ''}
                          onChange={(e) => setGuildDepositInput(prev => ({ ...prev, [guild.id]: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-900/80"
                        />
                        <span className="absolute right-2.5 top-2 text-[9px] font-mono text-slate-500">USDC</span>
                      </div>
                      <button
                        id={`btn-guild-dep-${guild.id}`}
                        onClick={() => handleGuildDeposit(guild.id)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-white font-mono rounded-lg transition cursor-pointer"
                      >
                        Deposit
                      </button>
                    </div>

                    {/* Consensus allocation proposals */}
                    {guild.activeProposal && (
                      <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
                          <Zap className="w-3.5 h-3.5 animate-pulse" />
                          <span>PENDING GROUP ALLOCATION DECISION</span>
                        </div>
                        <p className="text-xs font-semibold text-white">{guild.activeProposal.title}</p>
                        <p className="text-[10px] font-sans text-slate-400 leading-relaxed">
                          <strong>What we want to do:</strong> {guild.activeProposal.proposedAction}
                        </p>

                        <div className="flex items-center justify-between border-t border-slate-900/80 pt-2 text-[9px] font-mono">
                          <span className="text-slate-500">Time Left to Vote: {guild.activeProposal.expiresAt}</span>
                          <span className="text-slate-300">
                            Yes Votes: {guild.activeProposal.votesYes} • No Votes: {guild.activeProposal.votesNo}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-vote-yes-${guild.id}`}
                            onClick={() => handleVoteProposal(guild.id, 'yes')}
                            disabled={!!guild.activeProposal.userVoted}
                            className={`flex-1 py-1 text-[10px] font-mono rounded transition cursor-pointer ${
                              guild.activeProposal.userVoted === 'yes'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                                : 'bg-slate-900 hover:bg-emerald-950/40 hover:text-emerald-400 text-slate-300 border border-slate-800'
                            }`}
                          >
                            Vote YES (Approve)
                          </button>
                          <button
                            id={`btn-vote-no-${guild.id}`}
                            onClick={() => handleVoteProposal(guild.id, 'no')}
                            disabled={!!guild.activeProposal.userVoted}
                            className={`flex-1 py-1 text-[10px] font-mono rounded transition cursor-pointer ${
                              guild.activeProposal.userVoted === 'no'
                                ? 'bg-red-950 text-red-400 border border-red-900'
                                : 'bg-slate-900 hover:bg-red-950/40 hover:text-red-400 text-slate-300 border border-slate-800'
                            }`}
                          >
                            Vote NO (Reject)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: OUTBOUND CHANNELS & TRIGGER RULES */}
        {activeTab === 'outbound' && (
          <motion.div
            key="outbound-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
            {/* Outbound Channel Connectors (Left Panel - 7 columns) */}
            <div className="xl:col-span-7 space-y-6">
              <div className="bg-slate-950/40 border border-slate-900/60 p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Secure Social Alert Receivers (Outbound)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Link Discord Webhooks, Telegram Bots, or Slack incoming streams. Receive real-time alerts whenever price shifts, copy-trades trigger, or group consensus completes!
                  </p>
                </div>

                {/* Handshake Progress Indicator */}
                {activeHandshakeChannel && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-cyan-950/30 border border-cyan-800/50 rounded-xl space-y-3 font-mono"
                  >
                    <div className="flex items-center justify-between text-xs text-cyan-400">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        AUDITING SOCIAL API SIGNATURE HANDSHAKE...
                      </span>
                      <span>{Math.round((handshakeSteps.length / 4) * 100)}%</span>
                    </div>
                    <div className="space-y-1">
                      {handshakeSteps.map((step, idx) => (
                        <div key={idx} className="text-[10px] text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Channel Grid */}
                <div className="space-y-4">
                  {/* Discord Channel Card */}
                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                          <span className="text-xs font-bold text-blue-400 font-mono">DC</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Discord Webhook Channel</span>
                          <span className="text-[9px] text-slate-500 font-mono">Gateway Protocol: HTTP POST API</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        discordStatus === 'linked' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                          : 'bg-slate-950 text-slate-500 border border-slate-900'
                      }`}>
                        {discordStatus === 'linked' ? '● Connected' : 'Disconnected'}
                      </span>
                    </div>

                    {discordStatus === 'unlinked' ? (
                      <div className="flex gap-2">
                        <input
                          id="discord-webhook-input"
                          type="text"
                          placeholder="Enter Discord Webhook URL"
                          value={discordWebhook}
                          onChange={(e) => setDiscordWebhook(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                        />
                        <button
                          id="btn-connect-discord"
                          onClick={() => handleConnectChannel('discord')}
                          className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-lg cursor-pointer transition"
                        >
                          Connect
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4 bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[280px]">{discordWebhook}</span>
                        <div className="flex gap-2">
                          <button
                            id="btn-test-discord"
                            onClick={() => handleTestDispatch('discord')}
                            className="px-2.5 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono font-bold rounded hover:bg-cyan-900 cursor-pointer transition"
                          >
                            Test Alert
                          </button>
                          <button
                            id="btn-disconnect-discord"
                            onClick={() => handleDisconnectChannel('discord')}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono rounded hover:bg-red-950 hover:text-red-400 cursor-pointer transition"
                          >
                            Unlink
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Telegram Channel Card */}
                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-600/20 flex items-center justify-center border border-sky-500/30">
                          <span className="text-xs font-bold text-sky-400 font-mono">TG</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Telegram Chat Bot (Direct-to-User)</span>
                          <span className="text-[9px] text-slate-500 font-mono">Gateway Protocol: API MTProto</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        telegramStatus === 'linked' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                          : 'bg-slate-950 text-slate-500 border border-slate-900'
                      }`}>
                        {telegramStatus === 'linked' ? '● Connected' : 'Disconnected'}
                      </span>
                    </div>

                    {telegramStatus === 'unlinked' ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-500 uppercase">Chat ID / Channel Name</label>
                            <input
                              id="tg-chat-id-input"
                              type="text"
                              placeholder="@my_channel"
                              value={telegramChatId}
                              onChange={(e) => setTelegramChatId(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-500 uppercase">Custom Bot Token</label>
                            <input
                              id="tg-bot-token-input"
                              type="password"
                              placeholder="718290314:AAH..."
                              value={telegramBotToken}
                              onChange={(e) => setTelegramBotToken(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          id="btn-connect-telegram"
                          onClick={() => handleConnectChannel('telegram')}
                          className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-lg cursor-pointer transition"
                        >
                          Establish Tele-Gateway Handshake
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4 bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                        <div className="truncate text-[10px] font-mono text-slate-400 max-w-[280px]">
                          Chat: <span className="text-cyan-400">{telegramChatId}</span> • Token: <span className="text-slate-600">••••••••</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            id="btn-test-telegram"
                            onClick={() => handleTestDispatch('telegram')}
                            className="px-2.5 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono font-bold rounded hover:bg-cyan-900 cursor-pointer transition"
                          >
                            Test Alert
                          </button>
                          <button
                            id="btn-disconnect-telegram"
                            onClick={() => handleDisconnectChannel('telegram')}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono rounded hover:bg-red-950 hover:text-red-400 cursor-pointer transition"
                          >
                            Unlink
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slack Channel Card */}
                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-600/20 flex items-center justify-center border border-orange-500/30">
                          <span className="text-xs font-bold text-orange-400 font-mono">SL</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Slack Ingress Channel App</span>
                          <span className="text-[9px] text-slate-500 font-mono">Gateway Protocol: Webhook Inbound Integration</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        slackStatus === 'linked' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                          : 'bg-slate-950 text-slate-500 border border-slate-900'
                      }`}>
                        {slackStatus === 'linked' ? '● Connected' : 'Disconnected'}
                      </span>
                    </div>

                    {slackStatus === 'unlinked' ? (
                      <div className="flex gap-2">
                        <input
                          id="slack-webhook-input"
                          type="text"
                          placeholder="Enter Slack Incoming Webhook URL"
                          value={slackWebhook}
                          onChange={(e) => setSlackWebhook(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                        />
                        <button
                          id="btn-connect-slack"
                          onClick={() => handleConnectChannel('slack')}
                          className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-lg cursor-pointer transition"
                        >
                          Connect
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4 bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[280px]">{slackWebhook}</span>
                        <div className="flex gap-2">
                          <button
                            id="btn-test-slack"
                            onClick={() => handleTestDispatch('slack')}
                            className="px-2.5 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono font-bold rounded hover:bg-cyan-900 cursor-pointer transition"
                          >
                            Test Alert
                          </button>
                          <button
                            id="btn-disconnect-slack"
                            onClick={() => handleDisconnectChannel('slack')}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono rounded hover:bg-red-950 hover:text-red-400 cursor-pointer transition"
                          >
                            Unlink
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* OUTBOUND TELEMETRY TRACE LOGS CONSOLE */}
              {(telemetryTrace || socialBubblePreview) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {telemetryTrace && (
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500 font-bold uppercase">OUTBOUND TELEMETRY TRACE</span>
                        <button 
                          onClick={() => setTelemetryTrace(null)} 
                          className="text-slate-500 hover:text-slate-300 font-mono text-[9px] cursor-pointer"
                        >
                          [Close]
                        </button>
                      </div>
                      <pre className="text-[9px] font-mono text-cyan-400 overflow-auto max-h-[160px] leading-relaxed">
                        <code>{telemetryTrace}</code>
                      </pre>
                    </div>
                  )}

                  {socialBubblePreview && (
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-900 pb-1.5 mb-2">
                        <span className="text-slate-500 font-bold uppercase">SOCIAL RECEIVER PREVIEW ({socialBubblePreview.channel.toUpperCase()})</span>
                        <button 
                          onClick={() => setSocialBubblePreview(null)} 
                          className="text-slate-500 hover:text-slate-300 font-mono text-[9px] cursor-pointer"
                        >
                          [Clear]
                        </button>
                      </div>

                      {/* Mock UI Bubble */}
                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex gap-2.5">
                        <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white ${
                          socialBubblePreview.channel === 'telegram' ? 'bg-sky-500' : socialBubblePreview.channel === 'discord' ? 'bg-blue-600' : 'bg-orange-500'
                        }`}>
                          N
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-200">Nexus Guard bot</span>
                            <span className="text-[8px] font-mono bg-blue-950 text-blue-400 border border-blue-900 px-1 rounded leading-none py-0.5">BOT</span>
                            <span className="text-[8px] text-slate-500 font-mono ml-auto">{socialBubblePreview.timestamp}</span>
                          </div>
                          <div className="text-[10px] text-slate-300 font-sans leading-relaxed">
                            <span className="font-bold text-cyan-400 block mb-0.5">{socialBubblePreview.title}</span>
                            {socialBubblePreview.body}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rules Trigger Configurator (Right Panel - 5 columns) */}
            <div className="xl:col-span-5 space-y-6">
              {/* Add New Rule */}
              <div className="bg-slate-950/40 border border-slate-900/60 p-6 rounded-2xl space-y-4">
                <div className="border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Configure New Alert Rule
                  </h3>
                  <p className="text-[10px] font-sans text-slate-400 mt-1">Configure automation variables to route trigger packets into linked channels.</p>
                </div>

                <form onSubmit={handleCreateRule} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-500 uppercase">Monitor Asset</label>
                      <select
                        id="rule-asset-select"
                        value={newRuleAsset}
                        onChange={(e) => setNewRuleAsset(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="SOL">SOL (Solana)</option>
                        <option value="ETH">ETH (Ethereum)</option>
                        <option value="LINK">LINK (Chainlink)</option>
                        <option value="NEX">NEX (Nexus Token)</option>
                        <option value="USDC">USDC (Dollar Stable)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-500 uppercase">Trigger Event</label>
                      <select
                        id="rule-event-select"
                        value={newRuleEvent}
                        onChange={(e) => setNewRuleEvent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="Price Drift > 3%">Price Drift &gt; 3%</option>
                        <option value="Price Drift > 5%">Price Drift &gt; 5%</option>
                        <option value="Strategy Alert Signal">Strategy Alert Signal</option>
                        <option value="Copy-Trading Liquidations">Copy-Trading Liquidations</option>
                        <option value="Group Proposal Finalized">Group Proposal Finalized</option>
                      </select>
                    </div>
                  </div>

                  {/* Destination Toggles */}
                  <div className="p-3 bg-slate-900/15 border border-slate-900 rounded-xl space-y-2">
                    <span className="block text-[9px] font-mono text-slate-500 uppercase">Forward Broadcast Payload To:</span>
                    <div className="space-y-1.5 text-xs font-mono">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRuleTelegram}
                          onChange={(e) => setNewRuleTelegram(e.target.checked)}
                          className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                        />
                        <span className={telegramStatus === 'linked' ? 'text-slate-300' : 'text-slate-600 line-through'}>
                          Telegram Channel {telegramStatus !== 'linked' && '(Unlinked)'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRuleDiscord}
                          onChange={(e) => setNewRuleDiscord(e.target.checked)}
                          className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                        />
                        <span className={discordStatus === 'linked' ? 'text-slate-300' : 'text-slate-600 line-through'}>
                          Discord Webhook {discordStatus !== 'linked' && '(Unlinked)'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRuleSlack}
                          onChange={(e) => setNewRuleSlack(e.target.checked)}
                          className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                        />
                        <span className={slackStatus === 'linked' ? 'text-slate-300' : 'text-slate-600 line-through'}>
                          Slack Integration {slackStatus !== 'linked' && '(Unlinked)'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    id="btn-create-rule"
                    type="submit"
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Arm Alert Trigger Rule
                  </button>
                </form>
              </div>

              {/* Rules List */}
              <div className="bg-slate-950/40 border border-slate-900/60 p-6 rounded-2xl space-y-4 font-mono">
                <span className="text-xs font-bold text-slate-200 block border-b border-slate-900 pb-2">Active Alert Monitors ({rules.length})</span>
                {rules.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No alert rules armed. Set one up above!</p>
                ) : (
                  <div className="space-y-2.5">
                    {rules.map((rule) => (
                      <div key={rule.id} className={`p-3 border rounded-xl flex flex-col gap-2 transition ${
                        rule.isEnabled 
                          ? 'bg-slate-900/30 border-slate-900' 
                          : 'bg-slate-900/5 border-slate-950 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{rule.asset}</span>
                            <span className="text-[9px] text-slate-500">•</span>
                            <span className="text-[10px] text-slate-300">{rule.eventType}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              id={`btn-toggle-rule-${rule.id}`}
                              onClick={() => handleToggleRule(rule.id)}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition cursor-pointer ${
                                rule.isEnabled 
                                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/20' 
                                  : 'bg-slate-950 text-slate-500 border-slate-900 hover:bg-slate-900'
                              }`}
                            >
                              {rule.isEnabled ? 'ACTIVE' : 'PAUSED'}
                            </button>
                            <button
                              id={`btn-delete-rule-${rule.id}`}
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-500">
                          <div className="flex items-center gap-1">
                            <span>Destinations:</span>
                            {rule.channels.map(ch => (
                              <span key={ch} className="px-1 bg-slate-950 text-cyan-500 rounded font-bold uppercase text-[8px]">
                                {ch.substr(0, 2)}
                              </span>
                            ))}
                          </div>
                          <span>Pushed: <span className="text-cyan-400 font-bold">{rule.dispatchCount}</span> times</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: LIVE BROADCAST SIGNALS & INSTANT MIRROR TRADE */}
        {activeTab === 'feed' && (
          <motion.div
            key="feed-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Intro Header */}
            <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  Live Cryptographic Broadcast Signals
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Traders and automatic bot recipes publish instant buy/sell alerts with consensus-backed details. You can vote, upvote, or perform a fast <strong>Instant Mirror Trade</strong> instantly adjusting your real portfolio balances!
                </p>
              </div>

              {/* Balance Summary Box */}
              <div className="px-4 py-2 bg-slate-950/80 border border-slate-900 rounded-xl text-right shrink-0">
                <span className="text-[9px] font-mono text-slate-500 block leading-none">AVAILABLE WALLET</span>
                <span className="text-xs font-mono font-bold text-cyan-400 block mt-0.5">${(balances['USDC'] || 0).toFixed(2)} USDC</span>
                <span className="text-[9px] font-mono text-slate-400 block text-slate-500">SOL: {(balances['SOL'] || 0).toFixed(2)} • ETH: {(balances['ETH'] || 0).toFixed(2)} • LINK: {(balances['LINK'] || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Mirror trade settings overlay */}
            <AnimatePresence>
              {mirroringSignalId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-cyan-950/20 border border-cyan-800/40 p-5 rounded-2xl space-y-4 overflow-hidden"
                >
                  {(() => {
                    const signal = signalsList.find(s => s.id === mirroringSignalId);
                    if (!signal) return null;
                    const isBuy = signal.type === 'BUY';
                    const targetCost = parseFloat(mirrorAmount) || 0;
                    const currentUsdc = balances['USDC'] || 0;
                    const currentAsset = balances[signal.asset] || 0;
                    const requiredAsset = targetCost / signal.price;

                    return (
                      <div className="space-y-3 font-mono">
                        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
                          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                            INSTANT PORTFOLIO MIRROR TRADE ENGINE
                          </span>
                          <button 
                            onClick={() => setMirroringSignalId(null)}
                            className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                          >
                            [Cancel]
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="bg-slate-950/60 p-3 rounded-lg space-y-1 border border-slate-900">
                            <span className="text-[10px] text-slate-500 block">SOURCE PROMPT</span>
                            <span className="text-white font-bold">{signal.provider}</span>
                            <span className="text-slate-400 block text-[10px]">{signal.strategy}</span>
                          </div>

                          <div className="bg-slate-950/60 p-3 rounded-lg space-y-1 border border-slate-900">
                            <span className="text-[10px] text-slate-500 block">SIGNAL PARAMS</span>
                            <span className={`font-bold ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>{signal.type} {signal.asset}</span>
                            <span className="text-slate-400 block text-[10px]">Spot Reference Price: ${signal.price.toFixed(2)}</span>
                          </div>

                          <div className="bg-slate-950/60 p-3 rounded-lg space-y-1 border border-slate-900">
                            <span className="text-[10px] text-slate-500 block">PORTFOLIO IMPACT</span>
                            {isBuy ? (
                              <span className="text-slate-300 font-bold">
                                Deduct: <span className="text-red-400">${targetCost.toFixed(2)} USDC</span>
                                <span className="block text-[10px] font-normal text-slate-400">Receive: +{requiredAsset.toFixed(4)} {signal.asset}</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold">
                                Deduct: <span className="text-red-400">-{requiredAsset.toFixed(4)} {signal.asset}</span>
                                <span className="block text-[10px] font-normal text-slate-400">Receive: +${targetCost.toFixed(2)} USDC</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Interactive Inputs */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                          <div className="relative flex-1 w-full">
                            <span className="absolute left-3 top-2.5 text-[10px] text-slate-500 uppercase">SWAP ALLOCATION</span>
                            <input
                              id="mirror-amount-input"
                              type="number"
                              value={mirrorAmount}
                              onChange={(e) => setMirrorAmount(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2.5 pl-36 text-sm font-bold text-white focus:outline-none"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400">USDC</span>
                          </div>

                          <button
                            id="btn-confirm-mirror"
                            onClick={handleConfirmMirror}
                            disabled={isMirroring}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition flex items-center justify-center gap-2 shrink-0 ${
                              isBuy 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' 
                                : 'bg-red-500 hover:bg-red-600 text-slate-950'
                            }`}
                          >
                            {isMirroring ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing Mirror Swap {mirrorProgress}%
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4" />
                                Confirm Instant Mirror Swap
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Signals Feed Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {signalsList.map((sig) => {
                const isBuy = sig.type === 'BUY';
                return (
                  <div key={sig.id} className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Top Row header */}
                      <div className="flex items-center justify-between border-b border-slate-900/50 pb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold border ${
                            isBuy 
                              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
                              : 'bg-red-950/20 text-red-400 border-red-900/30'
                          }`}>
                            {sig.asset}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white block leading-none">{sig.provider}</span>
                            <span className="text-[9px] text-slate-500 font-mono mt-1 block">{sig.strategy}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded leading-none ${
                          isBuy 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' 
                            : 'bg-red-950 text-red-400 border-red-900/40'
                        }`}>
                          {sig.type}
                        </span>
                      </div>

                      {/* Signal Details */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900/60">
                          <span className="text-slate-500 block text-[8px] uppercase">Spot Price</span>
                          <span className="text-slate-200 font-bold text-xs">${sig.price.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900/60">
                          <span className="text-slate-500 block text-[8px] uppercase">Confidence</span>
                          <span className="text-cyan-400 font-bold text-xs">{sig.confidence}%</span>
                        </div>
                      </div>

                      {/* Strategy Rational */}
                      <p className="text-[11px] text-slate-300 leading-relaxed pl-2 border-l border-cyan-500/20 py-1 font-sans">
                        {sig.reason}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between border-t border-slate-900/50 pt-3">
                      <span className="text-[9px] text-slate-500 font-mono">{sig.time} ago</span>

                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-signal-upvote-${sig.id}`}
                          onClick={() => handleUpvoteBroadcast(sig.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 border rounded-lg text-[10px] font-mono transition cursor-pointer ${
                            sig.hasUpvoted
                              ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                              : 'bg-slate-950 hover:bg-slate-900 border-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{sig.upvotes}</span>
                        </button>

                        <button
                          id={`btn-signal-mirror-${sig.id}`}
                          onClick={() => handleInitiateMirror(sig.id)}
                          className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-[10px] font-mono font-bold rounded-lg cursor-pointer transition flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 animate-pulse" />
                          <span>Mirror</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
