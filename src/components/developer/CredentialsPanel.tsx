import React from 'react';
import { motion } from 'motion/react';
import { Key, Plus, Trash2, Copy, Check, Clock, Terminal, Play, RefreshCw } from 'lucide-react';
import { ApiKey } from '../../types';

interface CredentialsPanelProps {
  apiKeys: ApiKey[];
  onCreateKey: (name: string, perms: { read: boolean; trade: boolean; withdraw: boolean }) => void;
  onRevokeKey: (id: string) => void;
  keyName: string;
  setKeyName: (val: string) => void;
  perms: { read: boolean; trade: boolean; withdraw: boolean };
  setPerms: React.Dispatch<React.SetStateAction<{ read: boolean; trade: boolean; withdraw: boolean }>>;
  isLeaseEnabled: boolean;
  setIsLeaseEnabled: (val: boolean) => void;
  leaseDurationMin: number;
  setLeaseDurationMin: (val: number) => void;
  leaseMaxTrades: number;
  setLeaseMaxTrades: (val: number) => void;
  copiedId: string | null;
  handleCopy: (text: string, id: string) => void;
  getKeyLeaseState: (keyId: string) => {
    isLease: boolean;
    expired: boolean;
    timerStr: string;
    remainingTrades: number;
    expiredByTime?: boolean;
    expiredByTrades?: boolean;
  };
  playgroundLang: 'typescript' | 'python' | 'rust' | 'go';
  setPlaygroundLang: (lang: 'typescript' | 'python' | 'rust' | 'go') => void;
  playgroundEndpoint: string;
  setPlaygroundEndpoint: (ep: string) => void;
  playgroundMethod: 'GET' | 'POST' | 'DELETE';
  playgroundAsset: string;
  setPlaygroundAsset: (a: string) => void;
  playgroundAmount: number;
  setPlaygroundAmount: (val: number) => void;
  playgroundPrice: number;
  setPlaygroundPrice: (val: number) => void;
  selectedApiKeyId: string;
  setSelectedApiKeyId: (id: string) => void;
  generatedCode: string;
  handleExecutePlaygroundCall: () => void;
  playgroundLoading: boolean;
  playgroundResponse: string | null;
}

export default function CredentialsPanel({
  apiKeys,
  onCreateKey,
  onRevokeKey,
  keyName,
  setKeyName,
  perms,
  setPerms,
  isLeaseEnabled,
  setIsLeaseEnabled,
  leaseDurationMin,
  setLeaseDurationMin,
  leaseMaxTrades,
  setLeaseMaxTrades,
  copiedId,
  handleCopy,
  getKeyLeaseState,
  playgroundLang,
  setPlaygroundLang,
  playgroundEndpoint,
  setPlaygroundEndpoint,
  playgroundMethod,
  playgroundAsset,
  setPlaygroundAsset,
  playgroundAmount,
  setPlaygroundAmount,
  playgroundPrice,
  setPlaygroundPrice,
  selectedApiKeyId,
  setSelectedApiKeyId,
  generatedCode,
  handleExecutePlaygroundCall,
  playgroundLoading,
  playgroundResponse
}: CredentialsPanelProps) {

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    onCreateKey(keyName.trim(), perms);
    setKeyName('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Access Keys and Timed Leases (Left) */}
      <div className="lg:col-span-6 space-y-6">
        <div id="api-management" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                <Key className="w-4 h-4 text-cyan-400" />
                Sovereign Algorithmic Passcodes (API Keys)
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Generate password keys for your auto-trading software algorithms.</p>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4 mb-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-slate-500 uppercase">Passcode Label (Display Name)</label>
              <div className="flex gap-2">
                <input
                  id="api-key-name-input"
                  type="text"
                  placeholder="e.g. hedge-bot-safeguard"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors font-mono"
                />
                <button
                  id="api-key-create-btn"
                  type="submit"
                  className="px-4 py-2 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900/40 text-cyan-400 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Passcode
                </button>
              </div>
            </div>

            {/* Permissions Box */}
            <div className="p-3.5 bg-slate-900/10 border border-slate-900/60 rounded-xl space-y-3">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">What is this passcode allowed to do?</p>
              <div className="flex flex-wrap gap-4 text-xs font-mono">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perms.read}
                    disabled
                    className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  <span>VIEW MY WALLET (READ)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    id="api-scope-trade"
                    type="checkbox"
                    checked={perms.trade}
                    onChange={(e) => setPerms(p => ({ ...p, trade: e.target.checked }))}
                    className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  <span>PLACE TRADES (TRADE)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    id="api-scope-withdraw"
                    type="checkbox"
                    checked={perms.withdraw}
                    onChange={(e) => setPerms(p => ({ ...p, withdraw: e.target.checked }))}
                    className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  <span>WITHDRAW COINS (WITHDRAW)</span>
                </label>
              </div>
            </div>

            {/* Leases configuration */}
            <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">Self-Destructing Timed Lease Policy</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    id="toggle-lease-policy"
                    type="checkbox" 
                    checked={isLeaseEnabled}
                    onChange={(e) => setIsLeaseEnabled(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4 bg-slate-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <p className="text-[10px] font-sans text-slate-400">
                Turn this on to make a passcode that automatically self-destructs after a specified number of minutes or transactions to protect your capital.
              </p>

              {isLeaseEnabled && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-2 border-t border-slate-900/60 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>LEASE TIME LIMIT</span>
                      <span className="text-amber-400 font-bold">{leaseDurationMin} Minutes</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="60" 
                      value={leaseDurationMin}
                      onChange={(e) => setLeaseDurationMin(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>MAX ALLOWED TRANSACTION FILLS</span>
                      <span className="text-amber-400 font-bold">{leaseMaxTrades} Trades</span>
                    </div>
                    <input 
                      type="number" 
                      min="1" 
                      max="50"
                      value={leaseMaxTrades}
                      onChange={(e) => setLeaseMaxTrades(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </form>

          {/* List of active keys */}
          <div className="space-y-3">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-900/50 pb-1.5">My Passcodes & Timed Leases</p>
            
            {apiKeys.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-900/60 rounded-xl">
                <p className="text-[11px] font-mono text-slate-500">You don't have any access keys yet. Generate one above!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[210px] overflow-y-auto pr-1">
                {apiKeys.map((item) => {
                  const lease = getKeyLeaseState(item.id);
                  return (
                    <div key={item.id} className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl flex flex-col gap-2 relative">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-sans font-bold text-slate-200">{item.name}</span>
                          <span className="text-[9px] font-mono text-slate-500 block">Minted: {item.createdAt}</span>
                        </div>
                        <button
                          id={`api-revoke-${item.id}`}
                          onClick={() => onRevokeKey(item.id)}
                          className="p-1 bg-red-950/25 border border-red-950 hover:bg-red-900 text-red-400 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex items-center justify-between p-1 bg-slate-950 border border-slate-900/50 rounded-lg">
                          <span className="text-slate-500 text-[10px] ml-1">KEY CODE:</span>
                          <span className="text-slate-300 font-mono truncate max-w-[120px]">{item.key}</span>
                          <button
                            id={`copy-pk-${item.id}`}
                            onClick={() => handleCopy(item.key, `${item.id}-pk`)}
                            className="text-slate-500 hover:text-cyan-400 p-0.5 cursor-pointer"
                          >
                            {copiedId === `${item.id}-pk` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {lease.isLease && (
                        <div className="flex items-center justify-between p-2 rounded bg-amber-950/20 border border-amber-900/30 text-[10px] font-mono mt-1">
                          <div className="flex items-center gap-1.5 text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Self-Destruct in:</span>
                            <span className={lease.expiredByTime ? 'text-red-400 font-bold' : 'text-amber-200 font-bold'}>
                              {lease.timerStr}
                            </span>
                          </div>

                          <div className="text-amber-400 flex items-center gap-1">
                            <span>Trades left:</span>
                            <span className={lease.expiredByTrades ? 'text-red-400 font-bold' : 'text-amber-200 font-bold'}>
                              {lease.remainingTrades}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-1">
                        <div className="flex gap-1.5">
                          {item.permissions.read && <span className="px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded text-[8px] font-mono font-bold">VIEW ONLY</span>}
                          {item.permissions.trade && <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 rounded text-[8px] font-mono font-bold">CAN TRADE</span>}
                          {item.permissions.withdraw && <span className="px-1.5 py-0.5 bg-red-950 text-red-400 rounded text-[8px] font-mono font-bold">CAN WITHDRAW</span>}
                        </div>

                        {lease.isLease && lease.expired && (
                          <span className="px-1.5 py-0.5 bg-red-950 text-red-400 border border-red-900 rounded text-[8px] font-mono font-bold">
                            LEASE SELF-DESTRUCTED 🪦
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code recipe terminal (Right) */}
      <div className="lg:col-span-6 space-y-6">
        <div id="sdk-playground" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase">Automatic Code-Recipe Generator</span>
            </div>

            {/* Language selectors */}
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[9px]">
              {(['typescript', 'python', 'rust', 'go'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setPlaygroundLang(lang)}
                  className={`px-2 py-0.5 font-mono rounded-md cursor-pointer transition uppercase ${
                    playgroundLang === lang ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Configure parameters below to generate a clean, copy-pasteable trading script in your language of choice.
          </p>

          <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-slate-900/10 border border-slate-900/80 rounded-xl font-mono text-[10px]">
            <div>
              <label className="text-slate-500 block mb-1">CHOOSE PASSCODE</label>
              <select
                id="playground-api-key-select"
                value={selectedApiKeyId}
                onChange={(e) => setSelectedApiKeyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
              >
                <option value="">-- Sandbox Default Passcode --</option>
                {apiKeys.map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">API ROUTE</label>
              <select
                id="playground-endpoint-select"
                value={playgroundEndpoint}
                onChange={(e) => setPlaygroundEndpoint(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
              >
                <option value="/v4/trade/place">POST /v4/trade/place (Place Trade)</option>
                <option value="/v4/wallet/balances">GET /v4/wallet/balances (Check Wallet)</option>
                <option value="/v4/reserves/verify">GET /v4/reserves/verify (Solvency Check)</option>
              </select>
            </div>

            {playgroundMethod === 'POST' && (
              <>
                <div>
                  <label className="text-slate-500 block mb-1">CRYPTO SYMBOL</label>
                  <select
                    id="playground-asset-select"
                    value={playgroundAsset}
                    onChange={(e) => setPlaygroundAsset(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
                  >
                    <option value="SOL">SOL</option>
                    <option value="ETH">ETH</option>
                    <option value="USDC">USDC</option>
                    <option value="NEX">NEX</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">ORDER SIZE ({playgroundAsset})</label>
                  <input
                    id="playground-amount-input"
                    type="number"
                    value={playgroundAmount}
                    onChange={(e) => setPlaygroundAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Generated Code Codeblock */}
          <div className="relative">
            <button
              id="copy-code-playground"
              onClick={() => handleCopy(generatedCode, 'playground')}
              className="absolute top-3.5 right-3.5 p-1.5 bg-slate-950/80 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg cursor-pointer transition z-10"
            >
              {copiedId === 'playground' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <pre className="p-4 bg-slate-950 text-[10px] font-mono text-cyan-300 overflow-x-auto rounded-xl border border-slate-900 leading-relaxed max-h-[180px]">
              <code>{generatedCode}</code>
            </pre>
          </div>

          {/* Simulate Action Endpoint */}
          <div className="space-y-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <button
                id="btn-simulate-sdk-call"
                onClick={handleExecutePlaygroundCall}
                disabled={playgroundLoading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {playgroundLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                Test Fire Script Endpoint 🚀
              </button>
              <span className="text-[10px] font-mono text-slate-500">SIMULATED INGRESS RUN</span>
            </div>

            {playgroundResponse && (
              <pre className="p-3.5 bg-slate-950/90 text-[10px] font-mono text-slate-300 overflow-x-auto rounded-xl border border-slate-900 max-h-[160px]">
                <code>{playgroundResponse}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
