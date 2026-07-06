import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, AlertTriangle, Check, RefreshCw } from 'lucide-react';

interface MerkleNode {
  label: string;
  hash: string;
  direction: 'left' | 'right' | 'root';
  verified: boolean;
}

interface ReservesPanelProps {
  reserveUserUid: string;
  setReserveUserUid: (val: string) => void;
  reserveUserBalance: number;
  setReserveUserBalance: (val: number) => void;
  isVerifyingReserves: boolean;
  handleVerifyReserves: () => void;
  verifiedMerkleNodePath: MerkleNode[];
  verificationProgress: number;
  proofHistoryLogs: string[];
}

export default function ReservesPanel({
  reserveUserUid,
  setReserveUserUid,
  reserveUserBalance,
  setReserveUserBalance,
  isVerifyingReserves,
  handleVerifyReserves,
  verifiedMerkleNodePath,
  verificationProgress,
  proofHistoryLogs
}: ReservesPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Merkle Node path render widget (Left) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="border-b border-slate-900 pb-3 mb-5 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Decentralized Public Math Audit (Proof of Solvency)
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Verify cryptographically that your balance is accounted for and that we hold 1:1 backing in cold vaults for every dollar on the exchange.
              </p>
            </div>

            <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded text-[9px] font-mono font-bold animate-pulse">
              100% SOLVENT ATTESTED ✓
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 bg-slate-900/10 border border-slate-900 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>GLOBAL MERKLE AUDIT ROOT</span>
                <span>STATE HEIGHT: AUDITED AT SECURE LAYER</span>
              </div>
              <span className="text-xs font-bold text-white block truncate select-all">
                0x7b23cf9e8da39b9dfa32eef014298fa39e0811e921dcbabf7d29bc0efc280ac2
              </span>
            </div>

            {/* Interactive Merkle Node path widget */}
            <div className="relative border border-slate-900 bg-slate-950 p-5 rounded-2xl min-h-[220px] flex flex-col justify-center">
              <div className="absolute top-3 right-3 text-[8px] text-slate-500 uppercase">Interactive Merkle Solvency Path</div>
              
              {verifiedMerkleNodePath.length === 0 ? (
                <div className="text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-[11px] text-slate-500 italic font-sans leading-normal">
                    Select your User ID on the right panel and press "Verify Ledger Solvency" to audit the cryptographic proof path.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  {verifiedMerkleNodePath.map((node, i) => (
                    <div key={i} className="flex flex-col items-center w-full">
                      {i > 0 && <div className="h-4 w-0.5 bg-emerald-500/50 my-1 animate-pulse"></div>}
                      
                      <div className="p-3 bg-slate-900/30 border border-emerald-500/30 text-[10px] rounded-xl flex items-center justify-between w-full max-w-md gap-3">
                        <div className="truncate">
                          <span className="text-emerald-400 font-bold block">{node.label}</span>
                          <span className="text-slate-400 font-mono text-[9px] block truncate">{node.hash}</span>
                        </div>
                        <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 text-[8px] font-bold rounded flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" /> VERIFIED
                        </span>
                      </div>
                    </div>
                  ))}

                  {verificationProgress === 100 && (
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-center max-w-md mt-2 font-sans">
                      <span className="text-xs text-emerald-400 font-bold block uppercase tracking-wider">Audit Solvency Attestation Passed!</span>
                      <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                        This proof trace verifies perfectly up to the core Merkle Root. Your ledger balance of <strong>${reserveUserBalance.toLocaleString()} USDC</strong> is 100% backed and secure inside the cold storage custody vaults.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verification inputs (Right) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md space-y-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase block border-b border-slate-900 pb-1.5">Verify Ledger Solvency</span>
          
          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Your Account ID (UID)</label>
              <input
                type="text"
                value={reserveUserUid}
                onChange={(e) => setReserveUserUid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">My Balance to Verify</label>
              <input
                type="number"
                value={reserveUserBalance}
                onChange={(e) => setReserveUserBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-slate-300"
              />
            </div>

            <button
              id="btn-execute-por-verify"
              onClick={handleVerifyReserves}
              disabled={isVerifyingReserves}
              className="w-full py-2.5 bg-emerald-950/60 border border-emerald-900 hover:bg-emerald-900 text-emerald-300 text-xs font-mono font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isVerifyingReserves ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Audit solvency path ✓
            </button>
          </div>

          {/* Audit Log list */}
          <div className="space-y-2 pt-2 border-t border-slate-900">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Local Audit Trace Records</span>
            <pre className="p-3 bg-slate-950 text-[10px] font-mono text-slate-400 rounded-xl border border-slate-900 max-h-[140px] overflow-y-auto leading-relaxed">
              {proofHistoryLogs.length === 0 ? (
                <span className="text-slate-600 italic">No solvency paths audited in current session...</span>
              ) : (
                proofHistoryLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))
              )}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
