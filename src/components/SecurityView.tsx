import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  UploadCloud, 
  CheckCircle, 
  Smartphone, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Fingerprint, 
  AlertTriangle,
  Info,
  Camera,
  Smile,
  Lock,
  Sparkles,
  TrendingUp,
  Cpu,
  Server,
  Key,
  Copy,
  Check,
  FileText,
  Globe,
  ArrowRight,
  Award,
  ChevronRight,
  Database
} from 'lucide-react';
import { User } from '../types';

interface SecurityViewProps {
  user: User;
  onUpdateKyc: (status: 'unverified' | 'pending' | 'verified') => void;
  onToggle2FA: (enabled: boolean) => void;
  balances?: { [key: string]: number };
  spotPrices?: { [key: string]: number };
  onNotification?: (type: 'success' | 'error' | 'info', text: string) => void;
}

export default function SecurityView({ 
  user, 
  onUpdateKyc, 
  onToggle2FA, 
  balances = {}, 
  spotPrices = {}, 
  onNotification 
}: SecurityViewProps) {
  // Sub-tab Navigation: 'solvency' (Batch 5) vs 'access' (KYC/2FA)
  const [activeSubTab, setActiveSubTab] = useState<'solvency' | 'access'>('solvency');

  // KYC Upload States
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState('');
  const [kycError, setKycError] = useState('');

  // 2FA Setup States
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [success2FA, setSuccess2FA] = useState(false);

  // Copy states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Solvency & Proof of Reserves states
  const [verificationStep, setVerificationStep] = useState<'idle' | 'hashing' | 'sibhashing' | 'parenthashing' | 'comparing' | 'success'>('idle');
  const [verificationProgress, setVerificationProgress] = useState(0);

  // Custom mock secret seed for 2FA
  const secretSeed = "NXEX CORE FH76 J982 9ALK";

  // Calculate dynamic total portfolio value for the inclusion check
  const portfolioValue = Object.entries(balances).reduce((sum, [symbol, amount]) => {
    const price = spotPrices[symbol] || 0;
    return sum + (amount * price);
  }, 0);

  // Format portfolio value
  const formattedPortfolioValue = portfolioValue > 0 
    ? portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "35,282.90"; // sensible fallback

  // Consistent dynamic hash representing user's account and portfolio value
  const userAccountHash = "0x" + (user?.username ? Array.from(user.username).reduce((acc, char) => acc + char.charCodeAt(0).toString(16), "") : "4f1ac") + "89b7e4c2";
  const userLeafHash = "0xa8b42f" + (user?.kycStatus === 'verified' ? '7c' : '1a') + "9e";

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    if (onNotification) {
      onNotification('success', `${label} copied to clipboard!`);
    }
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // KYC file interaction triggers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const startKycProcess = (name: string) => {
    setFileName(name);
    setIsUploading(true);
    setUploadProgress(0);
    setKycError('');

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsScanning(true);
          
          // Simulate simple automated identification parsing
          setTimeout(() => {
            setIsScanning(false);
            onUpdateKyc('verified');
            if (onNotification) {
              onNotification('success', 'Your identity check was approved securely!');
            }
          }, 2000);

          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        startKycProcess(file.name);
      } else {
        setKycError('Oops! That type of file doesn\'t work. Please upload a clear picture of your ID (JPEG, PNG or PDF).');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startKycProcess(e.target.files[0].name);
    }
  };

  // 2FA Code confirmation
  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError('');

    if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
      setTwoFactorError('Oops! That looks incorrect. Please type a valid 6-digit number.');
      return;
    }

    // Success simulation
    setSuccess2FA(true);
    setTimeout(() => {
      onToggle2FA(true);
      setTwoFactorCode('');
      setSuccess2FA(false);
      if (onNotification) {
        onNotification('success', 'Extra security armor active! 2FA enabled.');
      }
    }, 1000);
  };

  const handleDisable2FA = () => {
    onToggle2FA(false);
    if (onNotification) {
      onNotification('info', 'Double security lock disabled.');
    }
  };

  // Run the interactive Merkle Tree Inclusion verification
  const runMerkleVerification = () => {
    setVerificationStep('hashing');
    setVerificationProgress(0);

    const steps: ('hashing' | 'sibhashing' | 'parenthashing' | 'comparing' | 'success')[] = [
      'hashing',
      'sibhashing',
      'parenthashing',
      'comparing',
      'success'
    ];

    let currentStepIndex = 0;
    
    const interval = setInterval(() => {
      setVerificationProgress(prev => {
        if (prev >= 100) {
          currentStepIndex++;
          if (currentStepIndex < steps.length) {
            setVerificationStep(steps[currentStepIndex]);
            // If going to success, notify
            if (steps[currentStepIndex] === 'success') {
              clearInterval(interval);
              if (onNotification) {
                onNotification('success', 'Solvency inclusion check 100% verified against published root!');
              }
              return 100;
            }
            return 0;
          } else {
            clearInterval(interval);
            return 100;
          }
        }
        return prev + 12.5; // slow enough to see each step's logic
      });
    }, 250);
  };

  return (
    <div className="space-y-6">
      
      {/* Friendly general info banner */}
      <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-white">Advanced Cryptographic Trust Protocol</p>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Nexus operates with extreme security parameters. Here you can double-lock your account, prove your real identity, or audit our public reserves to verify that every single coin in your wallet is fully backed and stored in secure custodial vaults.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation Switcher */}
      <div className="flex border-b border-slate-900/60 p-1 bg-slate-950/60 rounded-xl max-w-md">
        <button
          onClick={() => setActiveSubTab('solvency')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeSubTab === 'solvency'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20 border border-transparent'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Solvency & Proof of Reserves
        </button>
        <button
          onClick={() => setActiveSubTab('access')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeSubTab === 'access'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20 border border-transparent'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          Compliance & Access Locks
        </button>
      </div>

      {/* AnimatePresence for tab switches */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'solvency' ? (
          <motion.div
            key="solvency-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Bento Section 1: Solvency Ratio & Custody Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Solvency Ratio Card */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
                    <span className="text-xs font-sans font-bold text-slate-300">Live Solvency Ratio 📊</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono font-medium text-emerald-400">
                      <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" /> 100% BACKED
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1 mt-2">
                    <span className="text-3xl font-bold text-white tracking-tight">106.24%</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">+6.24% Surplus</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                    This ratio demonstrates that Nexus holds more custodial assets than the total of all customer deposits combined.
                  </p>

                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Total Customer Assets:</span>
                      <span className="text-slate-200">$150,284,912.40</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Total Verified Reserves:</span>
                      <span className="text-slate-200 text-emerald-400 font-semibold">$159,662,810.15</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Total Surplus Cushion:</span>
                      <span className="text-slate-200 text-cyan-400">$9,377,897.75</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-900/60 flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                  <Database className="w-3 h-3 text-cyan-500" />
                  <span>On-Chain Attestation: Root published every 24h</span>
                </div>
              </div>

              {/* Your Inclusion Status Card */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
                    <span className="text-xs font-sans font-bold text-slate-300">Your Inclusion Status 🛡️</span>
                    <span className="text-[10px] font-mono text-cyan-400">Self-Audit</span>
                  </div>

                  <div className="space-y-1 mt-2">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Your Registered Balance</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-white">${formattedPortfolioValue}</span>
                      <span className="text-[9px] font-mono text-slate-400">USD Equiv.</span>
                    </div>
                  </div>

                  <div className="mt-4 p-2.5 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Hash:</span>
                      <span className="text-slate-300 select-all cursor-pointer hover:text-white transition" onClick={() => handleCopyText(userAccountHash, 'Account Hash')}>
                        {userAccountHash.slice(0, 8)}...{userAccountHash.slice(-6)} 📋
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Leaf Index:</span>
                      <span className="text-slate-300">#14,208 (Leaf)</span>
                    </div>
                    <div className="flex justify-between flex-wrap">
                      <span className="text-slate-500">Verification State:</span>
                      {verificationStep === 'success' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">100% PASS <Smile className="w-3 h-3" /></span>
                      ) : (
                        <span className="text-amber-500 font-semibold animate-pulse">Unverified in Session</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-[9px] text-slate-500 font-sans leading-relaxed">
                  Use the Merkle Tree tool below to calculate your path to the Root and verify you are included in our custody balance audit sheet!
                </div>
              </div>

              {/* Verified Custodial Vaults */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
                    <span className="text-xs font-sans font-bold text-slate-300">Verified Custody Vaults 🔒</span>
                    <span className="text-[10px] font-mono text-cyan-400">Addresses</span>
                  </div>

                  <div className="space-y-2 mt-2">
                    <div className="p-2 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase">SOL Cold Custody</span>
                        <span className="text-[10px] font-mono text-slate-300 truncate w-32 md:w-44">SolCustody7XfNxExW1897pLa9vDkS34n</span>
                      </div>
                      <button 
                        onClick={() => handleCopyText('SolCustody7XfNxExW1897pLa9vDkS34n', 'SOL Custody Address')}
                        className="p-1 rounded bg-slate-950 border border-slate-900 text-slate-400 hover:text-cyan-400 text-[10px]"
                        title="Copy Address"
                      >
                        📋
                      </button>
                    </div>

                    <div className="p-2 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase">ETH Multi-Sig Vault</span>
                        <span className="text-[10px] font-mono text-slate-300 truncate w-32 md:w-44">0x76a9a01f92e0cb3c9d78e90f23b6c2a938c98342</span>
                      </div>
                      <button 
                        onClick={() => handleCopyText('0x76a9a01f92e0cb3c9d78e90f23b6c2a938c98342', 'ETH Custody Address')}
                        className="p-1 rounded bg-slate-950 border border-slate-900 text-slate-400 hover:text-cyan-400 text-[10px]"
                        title="Copy Address"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Ledger Attestations</span>
                  <a href="https://solana.fm" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 text-[9px]">
                    Block Explorer <Globe className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

            </div>

            {/* Interactive Merkle Tree Inclusion Proof Tool */}
            <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 mb-6 gap-2">
                <div>
                  <h3 className="text-xs font-sans font-bold text-slate-200">Interactive Merkle Tree Validator</h3>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    Verify that your specific account hash and balance are integrated into our official audited balance tree.
                  </p>
                </div>
                <div>
                  {verificationStep === 'idle' ? (
                    <button
                      onClick={runMerkleVerification}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-xs font-sans rounded-xl shadow-lg shadow-cyan-950/10 transition-all transform hover:scale-[1.02] flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Verify My Inclusion Path
                    </button>
                  ) : verificationStep === 'success' ? (
                    <button
                      onClick={() => setVerificationStep('idle')}
                      className="px-4 py-2 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 font-bold text-xs font-sans rounded-xl transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Inclusion Audited! Run Again
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${verificationProgress}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {verificationStep === 'hashing' && "1/4 Hashing Account..."}
                        {verificationStep === 'sibhashing' && "2/4 Combining Sibling..."}
                        {verificationStep === 'parenthashing' && "3/4 Calculating Branch..."}
                        {verificationStep === 'comparing' && "4/4 Validating On-Chain..."}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Tree Display */}
              <div className="p-6 bg-slate-950/80 border border-slate-900 rounded-2xl relative overflow-hidden flex flex-col items-center">
                
                {/* Visual Merkle Root (Level 0) */}
                <div className="relative flex flex-col items-center z-10">
                  <div className={`p-3 rounded-2xl border transition-all duration-300 text-center w-56 shadow-md ${
                    verificationStep === 'success' ? 'bg-emerald-950/20 border-emerald-500/60 shadow-emerald-950/30 text-emerald-400' :
                    verificationStep === 'comparing' ? 'bg-cyan-950/30 border-cyan-500/80 animate-pulse text-cyan-300' :
                    'bg-slate-900/40 border-slate-800 text-slate-400'
                  }`}>
                    <span className="text-[9px] font-semibold uppercase tracking-wider block mb-1">Merkle Root Hash</span>
                    <span className="text-[10px] font-mono font-bold block truncate">0x6aef88e146522f73e...</span>
                    {verificationStep === 'success' && (
                      <span className="text-[9px] font-sans font-bold text-emerald-400 mt-1 block">✓ MATCHES PUBLIC LEDGER</span>
                    )}
                  </div>
                </div>

                {/* Root lines connecting down */}
                <div className="w-72 h-10 relative mt-1 select-none">
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M 144,0 L 144,12 L 36,12 L 36,40 M 144,12 L 252,12 L 252,40" 
                      fill="none" 
                      stroke={verificationStep === 'parenthashing' || verificationStep === 'comparing' || verificationStep === 'success' ? '#06b6d4' : '#1e293b'} 
                      strokeWidth="2" 
                      className={verificationStep === 'parenthashing' || verificationStep === 'comparing' ? 'stroke-dash' : ''}
                    />
                  </svg>
                </div>

                {/* Parents (Level 1) */}
                <div className="flex justify-between w-full max-w-xl relative z-10 gap-4">
                  {/* Parent A */}
                  <div className={`p-2.5 rounded-xl border transition-all duration-300 text-center flex-1 max-w-[220px] shadow-sm ${
                    verificationStep === 'success' ? 'bg-emerald-950/10 border-emerald-900/50 text-emerald-400' :
                    verificationStep === 'parenthashing' ? 'bg-cyan-950/20 border-cyan-500/70 text-cyan-300' :
                    verificationStep === 'sibhashing' ? 'bg-cyan-950/10 border-cyan-900/40 text-slate-400' :
                    'bg-slate-900/30 border-slate-900 text-slate-500'
                  }`}>
                    <span className="text-[8px] font-semibold uppercase tracking-wider block">Parent Node A (H_12)</span>
                    <span className="text-[9px] font-mono font-bold block mt-1">0x77d8a2cf3e...</span>
                  </div>

                  {/* Parent B (Sibling) */}
                  <div className={`p-2.5 rounded-xl border transition-all duration-300 text-center flex-1 max-w-[220px] shadow-sm ${
                    verificationStep === 'success' ? 'bg-emerald-950/10 border-emerald-900/30 text-slate-300' :
                    verificationStep === 'parenthashing' ? 'bg-cyan-950/10 border-cyan-900/30 text-slate-300 animate-pulse' :
                    'bg-slate-900/30 border-slate-900 text-slate-500'
                  }`}>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[8px] font-semibold uppercase tracking-wider">Parent Node B (H_34)</span>
                    </div>
                    <span className="text-[9px] font-mono block mt-1">0x99a2cfcb01...</span>
                  </div>
                </div>

                {/* Parent lines connecting down */}
                <div className="flex justify-between w-full max-w-xl h-10 relative mt-1 select-none">
                  {/* Left Side Lines */}
                  <div className="w-[200px] h-full relative">
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <path 
                        d="M 100,0 L 100,12 L 36,12 L 36,40 M 100,12 L 164,12 L 164,40" 
                        fill="none" 
                        stroke={verificationStep === 'sibhashing' || verificationStep === 'parenthashing' || verificationStep === 'comparing' || verificationStep === 'success' ? '#06b6d4' : '#1e293b'} 
                        strokeWidth="2" 
                      />
                    </svg>
                  </div>
                  {/* Right Side Lines */}
                  <div className="w-[200px] h-full relative">
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <path 
                        d="M 100,0 L 100,12 L 36,12 L 36,40 M 100,12 L 164,12 L 164,40" 
                        fill="none" 
                        stroke={verificationStep === 'success' ? '#10b981' : '#1e293b'} 
                        strokeWidth="1.5" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Leaves (Level 2) */}
                <div className="flex flex-wrap md:flex-nowrap justify-between w-full max-w-2xl relative z-10 gap-3 mt-1">
                  
                  {/* Leaf 1: User Leaf */}
                  <div className={`p-2 rounded-xl border transition-all duration-300 text-center flex-1 min-w-[130px] max-w-[170px] ${
                    verificationStep === 'success' ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-md' :
                    verificationStep === 'hashing' ? 'bg-cyan-950/30 border-cyan-500/80 text-cyan-300 animate-pulse' :
                    verificationStep !== 'idle' ? 'bg-cyan-950/10 border-cyan-900/30 text-slate-300' :
                    'bg-slate-900/40 border-slate-900 text-slate-400'
                  }`}>
                    <span className="text-[8px] font-bold uppercase tracking-wider block text-cyan-400">YOU (Your Balance)</span>
                    <span className="text-[10px] font-mono font-bold block mt-0.5">${formattedPortfolioValue}</span>
                    <span className="text-[8px] font-mono block text-slate-500 mt-1">{userLeafHash}</span>
                  </div>

                  {/* Leaf 2: Sibling Leaf */}
                  <div className={`p-2 rounded-xl border transition-all duration-300 text-center flex-1 min-w-[130px] max-w-[170px] ${
                    verificationStep === 'success' ? 'bg-emerald-950/10 border-emerald-900/30 text-slate-400' :
                    verificationStep === 'sibhashing' ? 'bg-cyan-950/20 border-cyan-500/70 text-cyan-300 animate-pulse' :
                    verificationStep !== 'idle' ? 'bg-slate-900/30 border-slate-900 text-slate-400' :
                    'bg-slate-900/20 border-slate-900/40 text-slate-500'
                  }`}>
                    <span className="text-[8px] font-semibold uppercase tracking-wider block text-slate-500">Sibling user</span>
                    <span className="text-[10px] font-mono block mt-0.5">$118,450.00</span>
                    <span className="text-[8px] font-mono block text-slate-600 mt-1">0xfc127e2a</span>
                  </div>

                  {/* Leaf 3: Branch Sibling 1 */}
                  <div className="p-2 rounded-xl border border-slate-900/40 text-center flex-1 min-w-[130px] max-w-[170px] bg-slate-900/10 text-slate-600">
                    <span className="text-[8px] font-semibold uppercase tracking-wider block text-slate-600">Other user branch</span>
                    <span className="text-[10px] font-mono block mt-0.5">$924,110.15</span>
                    <span className="text-[8px] font-mono block text-slate-700 mt-1">0x8a1c92ef</span>
                  </div>

                  {/* Leaf 4: Branch Sibling 2 */}
                  <div className="p-2 rounded-xl border border-slate-900/40 text-center flex-1 min-w-[130px] max-w-[170px] bg-slate-900/10 text-slate-600">
                    <span className="text-[8px] font-semibold uppercase tracking-wider block text-slate-600">Other user branch</span>
                    <span className="text-[10px] font-mono block mt-0.5">$148,803,706.95</span>
                    <span className="text-[8px] font-mono block text-slate-700 mt-1">0xdc7210ba</span>
                  </div>

                </div>

              </div>

              {/* JSON Proof Payload for advanced developers */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Cryptographic Proof-of-Inclusion Payload</span>
                  <button 
                    onClick={() => handleCopyText(JSON.stringify({
                      account_id: userAccountHash,
                      balance_usd: parseFloat(formattedPortfolioValue.replace(/,/g, '')),
                      merkle_index: 14208,
                      siblings: [
                        "0xfc127e2a9e20cb38f921ea028ea7cd574f7d",
                        "0x99a2cfcb012a9e20cb38f921ea028ea7cd5"
                      ],
                      published_root: "0x6aef88e146522f73e4b3c9d789e021a8124b89006c9a752bf01e8da7cd574f7d"
                    }, null, 2), 'Inclusion Proof JSON')}
                    className="text-[10px] font-sans text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    Copy Complete Proof 📋
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[9px] text-slate-400 overflow-x-auto leading-relaxed select-all">
{`{
  "account_id": "${userAccountHash}",
  "balance_usd": ${parseFloat(formattedPortfolioValue.replace(/,/g, ''))},
  "merkle_index": 14208,
  "siblings": [
    "0xfc127e2a9e20cb38f921ea028ea7cd574f7d",
    "0x99a2cfcb012a9e20cb38f921ea028ea7cd5"
  ],
  "published_root": "0x6aef88e146522f73e4b3c9d789e021a8124b89006c9a752bf01e8da7cd574f7d"
}`}
                </pre>
              </div>

            </div>

            {/* Asset-by-Asset Solvency Breakdown */}
            <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
                <span className="text-xs font-sans font-bold text-slate-300">Reserves vs Customer Liabilities Breakdown</span>
                <span className="text-[10px] font-mono text-cyan-400">Scan Complete</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* SOL */}
                <div className="p-4 bg-slate-900/30 border border-slate-900/60 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> SOL
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">106.48% Backed</span>
                  </div>
                  <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Customer Deposits:</span>
                      <span className="text-slate-200">45,220.10 SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cold Vault Held:</span>
                      <span className="text-slate-200 text-emerald-400 font-semibold">48,150.00 SOL</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900/50">
                    <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* ETH */}
                <div className="p-4 bg-slate-900/30 border border-slate-900/60 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> ETH
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">107.88% Backed</span>
                  </div>
                  <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Customer Deposits:</span>
                      <span className="text-slate-200">1,840.50 ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cold Vault Held:</span>
                      <span className="text-slate-200 text-emerald-400 font-semibold">1,985.50 ETH</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900/50">
                    <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* USDC */}
                <div className="p-4 bg-slate-900/30 border border-slate-900/60 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> USDC
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">104.40% Backed</span>
                  </div>
                  <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Customer Deposits:</span>
                      <span className="text-slate-200">15,420,500 USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reserve Cash Held:</span>
                      <span className="text-slate-200 text-emerald-400 font-semibold">16,100,000 USDC</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900/50">
                    <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

              </div>
            </div>

            {/* Third-Party Independent Audit Reports Timeline */}
            <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
                <span className="text-xs font-sans font-bold text-slate-300">Quarterly Security & Solvency Audit History</span>
                <span className="text-[10px] font-mono text-cyan-400">External Reviews</span>
              </div>

              <div className="space-y-4">
                
                {/* Audit 1 */}
                <div className="flex gap-4 items-start p-3 bg-slate-900/20 border border-slate-900/50 rounded-xl hover:bg-slate-900/40 transition">
                  <div className="w-10 h-10 bg-emerald-950/40 border border-emerald-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Quarter 2, 2026 Solvency Audit</span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">Pass / Verified</span>
                    </div>
                    <p className="text-[10px] font-sans text-slate-400">
                      Conducted by Hacken Security Ltd. Checked total customer liability tables against cold multi-signature wallets. No errors or deficiencies found.
                    </p>
                    <div className="text-[9px] font-mono text-slate-500 flex justify-between pt-1">
                      <span>Audit Date: June 30, 2026</span>
                      <span>Hash: 0xac32bf...99e1</span>
                    </div>
                  </div>
                </div>

                {/* Audit 2 */}
                <div className="flex gap-4 items-start p-3 bg-slate-900/20 border border-slate-900/50 rounded-xl hover:bg-slate-900/40 transition">
                  <div className="w-10 h-10 bg-emerald-950/40 border border-emerald-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Quarter 1, 2026 Smart Contract Security Audit</span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">Pass / Verified</span>
                    </div>
                    <p className="text-[10px] font-sans text-slate-400">
                      Conducted by Halborn Auditing. Complete security review of on-chain deposit contracts and vault controllers. All recommendations fully resolved.
                    </p>
                    <div className="text-[9px] font-mono text-slate-500 flex justify-between pt-1">
                      <span>Audit Date: March 31, 2026</span>
                      <span>Hash: 0xfe820a...104b</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="access-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* KYC Compliance Onboarding Panel */}
            <div id="kyc-panel" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                  <span className="text-xs font-sans font-bold text-slate-300">Quick Identity Safety Check 🛡️</span>
                  <span className="text-[10px] font-mono text-cyan-400">Proving it's really you!</span>
                </div>

                {user.kycStatus === 'verified' ? (
                  <div className="p-6 text-center bg-emerald-950/20 border border-emerald-900/50 rounded-2xl space-y-4">
                    <div className="mx-auto w-12 h-12 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-400 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-bold text-white">Awesome! You're verified and ready to explore! 🎉</h3>
                      <p className="text-[11px] font-sans text-slate-400 mt-1">
                        Your identity has been fully checked and secured. No one else can ever pretend to be you. Your digital wallet is completely safe!
                      </p>
                    </div>
                    <div className="text-left p-3.5 bg-slate-900/40 rounded-xl space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Safety Status:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">Approved & Secure! <Smile className="w-3.5 h-3.5" /></span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Daily Trading Allowance:</span>
                        <span className="text-slate-200">Unlimited Fun & Trades</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Your Safe Key:</span>
                        <span className="text-slate-400">NX-KYC-APPROVED</span>
                      </div>
                    </div>
                  </div>
                ) : isUploading ? (
                  <div className="p-10 text-center space-y-4">
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-cyan-500 h-2 rounded-full transition-all duration-150 animate-pulse" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs font-sans text-slate-300">Sending picture {fileName}... {uploadProgress}%</p>
                    <p className="text-[10px] text-slate-500 font-sans">Making sure your upload completes safely...</p>
                  </div>
                ) : isScanning ? (
                  <div className="p-10 text-center space-y-4">
                    <div className="mx-auto w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-sans text-cyan-400 animate-pulse font-bold">Scanning document details securely...</p>
                    <p className="text-[10px] font-sans text-slate-400">Awesome! Almost done. Celebratory checkmark incoming!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      Let's make sure it's really you! Snap a quick photo of your ID, Passport, or school card so no one else can ever try to open a wallet in your name.
                    </p>

                    {kycError && (
                      <p className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs font-sans text-red-300">⚠️ {kycError}</p>
                    )}

                    {/* Drag and Drop Zone with friendly layout */}
                    <div
                      id="kyc-dropzone"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                        dragOver 
                          ? 'border-cyan-500 bg-cyan-950/10' 
                          : 'border-slate-900 hover:border-slate-800 bg-slate-950/20'
                      }`}
                    >
                      <input
                        id="kyc-file-input"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="kyc-file-input" className="cursor-pointer block space-y-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                          <Camera className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-sans font-semibold text-slate-200">Drag & drop your passport, school ID, or driver's license here!</p>
                          <p className="text-[10px] font-sans text-slate-500 mt-1">Accepts any clear image file up to 10MB</p>
                        </div>
                        <span className="inline-block px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-[11px] font-sans font-medium text-cyan-400 border border-slate-800 rounded-xl">
                          Choose Picture File 📁
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Two-Factor Security Panel */}
            <div id="twofa-panel" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                  <span className="text-xs font-sans font-bold text-slate-300">Smart Lock (Double Protection) 🔐</span>
                  <span className="text-[10px] font-mono text-cyan-400">Extra Armor</span>
                </div>

                {user.twoFactorEnabled ? (
                  <div className="p-6 text-center bg-cyan-950/20 border border-cyan-900/50 rounded-2xl space-y-4">
                    <div className="mx-auto w-12 h-12 bg-cyan-950 border border-cyan-800 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-bold text-white">Double Security Lock is Active! 🔐</h3>
                      <p className="text-[11px] font-sans text-slate-400 mt-1">
                        Your account now has extra armor. Whenever you send coins or make big moves, we will ask for your safe 6-digit pin from your phone app.
                      </p>
                    </div>
                    <button
                      id="disable-2fa-btn"
                      onClick={handleDisable2FA}
                      className="px-4 py-2 bg-red-950/40 hover:bg-red-900 border border-red-900/30 text-red-400 rounded-xl text-xs font-sans cursor-pointer transition"
                    >
                      Remove Extra Security
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      Want to double-lock your piggy bank? Link your mobile phone with a secure 6-digit pin so only you can unlock your rewards.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 items-center p-4 bg-slate-900/20 border border-slate-900 rounded-xl">
                      {/* Custom Vector QR Code */}
                      <div className="w-24 h-24 bg-white p-2 rounded-xl shrink-0 select-none flex flex-wrap gap-0.5 relative">
                        <div className="absolute inset-2 bg-[linear-gradient(to_right,#000_2px,transparent_2px),linear-gradient(to_bottom,#000_2px,transparent_2px)] bg-[size:10px_10px]" />
                        {/* Corner anchors */}
                        <div className="absolute top-2 left-2 w-5 h-5 bg-black border-4 border-white" />
                        <div className="absolute top-2 right-2 w-5 h-5 bg-black border-4 border-white" />
                        <div className="absolute bottom-2 left-2 w-5 h-5 bg-black border-4 border-white" />
                        {/* Tiny dots */}
                        <div className="absolute bottom-4 right-4 w-2.5 h-2.5 bg-black" />
                        <div className="absolute top-8 left-8 w-1.5 h-1.5 bg-black" />
                      </div>

                      {/* Seed code Details */}
                      <div className="space-y-1.5 w-full">
                        <span className="text-[10px] font-sans text-slate-400 uppercase">Your Private Setup Key</span>
                        <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between font-mono text-xs text-slate-300">
                          <span>{secretSeed}</span>
                        </div>
                        <p className="text-[10px] font-sans text-slate-500">Scan this QR code with your phone's Authenticator App (like Google Authenticator) or type the setup key above.</p>
                      </div>
                    </div>

                    {/* OTP verify form */}
                    <form onSubmit={handleVerify2FA} className="space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-sans text-slate-400">Enter the 6-Digit App Code</label>
                        <input
                          id="twofa-code-input"
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 102938"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-xs text-white text-center font-mono focus:outline-none tracking-widest"
                        />
                      </div>

                      {twoFactorError && (
                        <p className="text-xs font-sans text-red-400">⚠️ {twoFactorError}</p>
                      )}

                      <button
                        id="verify-2fa-btn"
                        type="submit"
                        disabled={success2FA}
                        className="w-full py-2.5 bg-cyan-900 hover:bg-cyan-850 text-cyan-100 border border-cyan-800 hover:border-cyan-700 font-sans font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {success2FA ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>Lock Account Safely 🔒</span>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
