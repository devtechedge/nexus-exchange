import React from 'react';
import { motion } from 'motion/react';
import { Scale, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { P2PLoan } from '../../types';

interface LendingPanelProps {
  lendingActiveTab: 'lend' | 'borrow';
  setLendingActiveTab: (tab: 'lend' | 'borrow') => void;
  loans: P2PLoan[];
  borrowAmount: string;
  setBorrowAmount: (val: string) => void;
  borrowCollateralSymbol: string;
  setBorrowCollateralSymbol: (symbol: string) => void;
  borrowCollateralAmount: string;
  setBorrowCollateralAmount: (val: string) => void;
  handleFundLoan: (loanId: string) => void;
  handleCreateBorrow: (e: React.FormEvent) => void;
  handleRepayLoan: (loanId: string) => void;
  balances: { [key: string]: number };
}

export default function LendingPanel({
  lendingActiveTab,
  setLendingActiveTab,
  loans,
  borrowAmount,
  setBorrowAmount,
  borrowCollateralSymbol,
  setBorrowCollateralSymbol,
  borrowCollateralAmount,
  setBorrowCollateralAmount,
  handleFundLoan,
  handleCreateBorrow,
  handleRepayLoan,
  balances
}: LendingPanelProps) {
  const myObligations = loans.filter(l => l.borrower === 'You');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Pawn Shop Escrow Desk */}
      <div className="lg:col-span-2 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3 flex-wrap gap-2">
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            Blockchain Pawn Shop (P2P Safe Lending)
          </h3>
          
          {/* Lending Subtab Toggle */}
          <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
            <button
              id="lending-subtab-lend"
              onClick={() => setLendingActiveTab('lend')}
              className={`px-3 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                lendingActiveTab === 'lend' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400'
              }`}
            >
              Lend USDC (Earn Interest)
            </button>
            <button
              id="lending-subtab-borrow"
              onClick={() => setLendingActiveTab('borrow')}
              className={`px-3 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                lendingActiveTab === 'borrow' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400'
              }`}
            >
              Borrow USDC (Deposit Coins)
            </button>
          </div>
        </div>

        {lendingActiveTab === 'lend' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Fund other users' cash requests and earn attractive interest! Every loan is held inside a secure blockchain safe-box (escrow) backed by real SOL or ETH coins as a safety guarantee deposit (collateral) at a minimum 130% safety limit.
            </p>

            <div className="space-y-3 pt-1">
              {loans.map((loan) => (
                <div key={loan.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-sans text-white">${loan.amount.toLocaleString()} USDC</span>
                      <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/30">
                        APY Earn Rate: {loan.apy}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Borrower Alias: <span className="font-mono text-slate-300">{loan.borrower}</span> • Guarantee Deposit: <span className="text-cyan-400 font-mono">{loan.collateralAmount} {loan.collateralAsset}</span> ({loan.collateralRatio}% safe ratio)
                    </p>
                    <p className="text-[9px] font-mono text-slate-500">
                      Loan Duration: {loan.durationDays} Days • Safety Limit Buffer: &lt;{loan.marginCallThreshold}%
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {loan.status === 'available' ? (
                      <button
                        id={`btn-fund-loan-${loan.id}`}
                        onClick={() => handleFundLoan(loan.id)}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                      >
                        Lend & Earn ✓
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 px-3 py-1.5 rounded bg-slate-950 border border-slate-900">
                        ACTIVE Escrow (Lended by: {loan.lender})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateBorrow} className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Need instant spending money? Put up your SOL or ETH coins as a safety guarantee deposit (collateral) inside our secure safe-box, and walk away with instant USDC spending cash. Make sure your deposit size is at least 130% of the cash you borrow!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5">Amount to Borrow</label>
                <div className="relative">
                  <input
                    id="borrow-amount-input"
                    type="number"
                    placeholder="USDC Cash"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none"
                    required
                  />
                  <span className="absolute right-2.5 top-2 text-[9px] font-mono text-slate-500">USDC</span>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5">My Safety Deposit Coin</label>
                <select
                  id="select-borrow-collateral"
                  value={borrowCollateralSymbol}
                  onChange={(e) => setBorrowCollateralSymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="SOL">Solana (SOL)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5">Deposit Amount (Collateral)</label>
                <div className="relative">
                  <input
                    id="borrow-collateral-input"
                    type="number"
                    placeholder="0.00"
                    value={borrowCollateralAmount}
                    onChange={(e) => setBorrowCollateralAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none"
                    required
                  />
                  <span className="absolute right-2.5 top-2 text-[9px] font-mono text-slate-500">{borrowCollateralSymbol}</span>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                id="btn-create-escrow-borrow"
                type="submit"
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-mono font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Deposit Coins & Borrow USDC Cash! 💰
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Active Borrow Obligations Panel */}
      <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
            My Active IOUs & Safe-Boxes
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            See the cash you've borrowed and pay it back to instantly unlock your locked coins and bring them back to your wallet!
          </p>
        </div>

        <div className="space-y-4">
          {myObligations.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center text-slate-600 border border-dashed border-slate-900 rounded-xl">
              <CheckCircle className="w-6 h-6 mb-1.5 text-slate-700" />
              <span className="text-[10px] font-mono uppercase tracking-wider">No borrowed debts active</span>
              <p className="text-[10px] text-slate-500 px-3 mt-1">You don't owe any borrowed cash right now. Looking clean!</p>
            </div>
          ) : (
            myObligations.map((loan) => {
              const nextValPrice = loan.collateralAsset === 'SOL' ? 145.25 : 3240.10;
              const computedRatio = Math.round(((loan.collateralAmount * nextValPrice) / loan.amount) * 100);
              const isRisk = computedRatio < loan.marginCallThreshold;

              return (
                <div key={loan.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 font-mono">Safe Box ID: {loan.id}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                      isRisk ? 'bg-red-950 text-red-400 border-red-900 animate-pulse' : 'bg-cyan-950 text-cyan-400 border-cyan-900'
                    }`}>
                      Safety Ratio: {computedRatio}%
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-sans text-slate-400">
                      <span>Amount I Borrowed:</span>
                      <span className="font-mono text-white">${loan.amount.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-sans text-slate-400">
                      <span>Locked Safety Deposit:</span>
                      <span className="font-mono text-white">{loan.collateralAmount} {loan.collateralAsset}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-sans text-slate-400">
                      <span>Total to Pay Back:</span>
                      <span className="font-mono text-white">${(loan.amount * 1.01).toFixed(2)} USDC</span>
                    </div>
                  </div>

                  {isRisk && (
                    <div className="p-2.5 bg-red-950/20 border border-red-900/40 rounded-lg text-[9px] font-mono text-red-400 flex items-start gap-1.5">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>CRITICAL DANGER: Collateral backing ratio is below the safe limit! Pay back cash or deposit more coins to prevent liquidation!</span>
                    </div>
                  )}

                  <button
                    id={`btn-repay-loan-${loan.id}`}
                    onClick={() => handleRepayLoan(loan.id)}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-white font-mono rounded-lg transition cursor-pointer"
                  >
                    Pay Back & Unlock My Coins!
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
