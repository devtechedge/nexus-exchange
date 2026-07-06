import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Code, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Key, 
  ShieldCheck, 
  Terminal,
  Info
} from 'lucide-react';
import { ApiKey } from '../types';

interface DeveloperDocsProps {
  apiKeys: ApiKey[];
  onCreateKey: (name: string, perms: { read: boolean; trade: boolean; withdraw: boolean }) => void;
  onRevokeKey: (id: string) => void;
}

export default function DeveloperDocs({ apiKeys, onCreateKey, onRevokeKey }: DeveloperDocsProps) {
  const [keyName, setKeyName] = useState('');
  const [perms, setPerms] = useState({ read: true, trade: false, withdraw: false });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'node' | 'python'>('node');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    onCreateKey(keyName.trim(), perms);
    setKeyName('');
    setPerms({ read: true, trade: false, withdraw: false });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Node.js Snippet
  const nodeSnippet = `const axios = require('axios');
const crypto = require('crypto');

const NEXUS_API_KEY = "nx_live_pk_87acbe89420";
const NEXUS_API_SECRET = "nx_live_sk_3943fef893a9";

function getSignature(timestamp, method, path, body = "") {
  return crypto
    .createHmac('sha256', NEXUS_API_SECRET)
    .update(timestamp + method + path + body)
    .digest('hex');
}

async function fetchBalances() {
  const timestamp = Date.now().toString();
  const path = '/api/v4/wallet/balances';
  const signature = getSignature(timestamp, 'GET', path);

  try {
    const res = await axios.get('https://api.nexus.exchange' + path, {
      headers: {
        'X-NX-APIKEY': NEXUS_API_KEY,
        'X-NX-SIGNATURE': signature,
        'X-NX-TIMESTAMP': timestamp
      }
    });
    console.log("Account balances:", res.data);
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

fetchBalances();`;

  // Python Snippet
  const pythonSnippet = `import time
import requests
import hmac
import hashlib

NEXUS_API_KEY = "nx_live_pk_87acbe89420"
NEXUS_API_SECRET = "nx_live_sk_3943fef893a9"

def get_signature(timestamp, method, path, body=""):
    message = f"{timestamp}{method}{path}{body}".encode('utf-8')
    secret = NEXUS_API_SECRET.encode('utf-8')
    return hmac.new(secret, message, hashlib.sha256).hexdigest()

def fetch_balances():
    timestamp = str(int(time.time() * 1000))
    path = '/api/v4/wallet/balances'
    signature = get_signature(timestamp, 'GET', path)
    
    headers = {
        'X-NX-APIKEY': NEXUS_API_KEY,
        'X-NX-SIGNATURE': signature,
        'X-NX-TIMESTAMP': timestamp
    }
    
    url = f"https://api.nexus.exchange{path}"
    try:
        res = requests.get(url, headers=headers)
        print("Account balances:", res.json())
    except Exception as e:
        print("Connection failed:", e)

fetch_balances()`;

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Token Management (Left Side) */}
        <div id="api-management" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <span className="text-xs font-sans font-semibold text-slate-300">API Access Credentials</span>
              <Key className="w-4 h-4 text-slate-500" />
            </div>

            {/* Create form */}
            <form onSubmit={handleCreateSubmit} className="space-y-3.5 mb-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400">Token Display Name</label>
                <div className="flex gap-2">
                  <input
                    id="api-key-name-input"
                    type="text"
                    placeholder="e.g. trading-bot-main"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors font-mono"
                  />
                  <button
                    id="api-key-create-btn"
                    type="submit"
                    className="px-4 py-2 bg-cyan-900 hover:bg-cyan-850 text-cyan-100 border border-cyan-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Mint Key
                  </button>
                </div>
              </div>

              {/* Permission checkboxes */}
              <div className="space-y-2 p-3.5 bg-slate-900/20 border border-slate-900 rounded-xl">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Scope Permissions</p>
                <div className="flex flex-wrap gap-4 text-xs font-mono">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={perms.read}
                      disabled
                      className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                    />
                    READ
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      id="api-scope-trade"
                      type="checkbox"
                      checked={perms.trade}
                      onChange={(e) => setPerms(p => ({ ...p, trade: e.target.checked }))}
                      className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                    />
                    TRADE
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      id="api-scope-withdraw"
                      type="checkbox"
                      checked={perms.withdraw}
                      onChange={(e) => setPerms(p => ({ ...p, withdraw: e.target.checked }))}
                      className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                    />
                    WITHDRAW
                  </label>
                </div>
              </div>
            </form>

            {/* List of minted tokens */}
            <div className="space-y-3">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-900/50 pb-1.5">Minted API Gateways</p>
              
              {apiKeys.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-slate-900/60 rounded-xl">
                  <p className="text-[11px] font-mono text-slate-500">No active API keys created yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {apiKeys.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl flex flex-col gap-2 relative">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-sans font-bold text-slate-200">{item.name}</span>
                          <span className="text-[9px] font-mono text-slate-500 block">Created: {item.createdAt}</span>
                        </div>
                        <button
                          id={`api-revoke-${item.id}`}
                          onClick={() => onRevokeKey(item.id)}
                          className="p-1 bg-red-950/25 border border-red-950 hover:bg-red-900 text-red-400 rounded-lg cursor-pointer transition-colors"
                          title="Revoke key credentials"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex items-center justify-between p-1.5 bg-slate-950 border border-slate-900/50 rounded-lg">
                          <span className="text-slate-500 text-[10px]">PK:</span>
                          <span className="text-slate-300 font-mono truncate max-w-[180px]">{item.key}</span>
                          <button
                            id={`copy-pk-${item.id}`}
                            onClick={() => handleCopy(item.key, `${item.id}-pk`)}
                            className="text-slate-500 hover:text-cyan-400 p-0.5"
                          >
                            {copiedId === `${item.id}-pk` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-slate-950 border border-slate-900/50 rounded-lg">
                          <span className="text-slate-500 text-[10px]">SK:</span>
                          <span className="text-slate-300 font-mono truncate max-w-[180px]">{item.secret}</span>
                          <button
                            id={`copy-sk-${item.id}`}
                            onClick={() => handleCopy(item.secret, `${item.id}-sk`)}
                            className="text-slate-500 hover:text-cyan-400 p-0.5"
                          >
                            {copiedId === `${item.id}-sk` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-1.5 mt-1">
                        {item.permissions.read && <span className="px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded text-[9px] font-mono font-bold">READ</span>}
                        {item.permissions.trade && <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 rounded text-[9px] font-mono font-bold">TRADE</span>}
                        {item.permissions.withdraw && <span className="px-1.5 py-0.5 bg-red-950 text-red-400 rounded text-[9px] font-mono font-bold">WITHDRAW</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* REST API Snippet Documentation (Right Side) */}
        <div id="api-documentation" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-sans font-semibold text-slate-300">REST Connection Documentation</span>
              </div>
              
              {/* Language switcher */}
              <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setSelectedLanguage('node')}
                  className={`px-2.5 py-0.5 text-[10px] font-mono rounded-md ${
                    selectedLanguage === 'node' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'
                  }`}
                >
                  Node.js
                </button>
                <button
                  onClick={() => setSelectedLanguage('python')}
                  className={`px-2.5 py-0.5 text-[10px] font-mono rounded-md ${
                    selectedLanguage === 'python' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'
                  }`}
                >
                  Python
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
              Authenticate requests by hashing parameters with standard SHA256 HMAC protocols, passing signature payloads via custom headers.
            </p>

            {/* Code Snippet Box */}
            <div className="relative">
              <button
                id="copy-snippet-btn"
                onClick={() => handleCopy(selectedLanguage === 'node' ? nodeSnippet : pythonSnippet, 'snippet')}
                className="absolute top-3 right-3 p-1.5 bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer transition-all z-10"
              >
                {copiedId === 'snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              
              <pre className="p-4 bg-slate-950 text-[11px] font-mono text-slate-300 overflow-x-auto rounded-xl border border-slate-900/80 leading-relaxed max-h-[290px]">
                <code>{selectedLanguage === 'node' ? nodeSnippet : pythonSnippet}</code>
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
