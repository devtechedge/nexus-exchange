import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Sparkles
} from 'lucide-react';
import { User } from '../types';

interface SecurityViewProps {
  user: User;
  onUpdateKyc: (status: 'unverified' | 'pending' | 'verified') => void;
  onToggle2FA: (enabled: boolean) => void;
}

export default function SecurityView({ user, onUpdateKyc, onToggle2FA }: SecurityViewProps) {
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

  // Custom mock secret seed
  const secretSeed = "NXEX CORE FH76 J982 9ALK";

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
    }, 1000);
  };

  const handleDisable2FA = () => {
    onToggle2FA(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Friendly general info banner */}
      <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-white">Why are these security steps important?</p>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Just like putting a lock on your piggy bank, these steps make sure that you are the only person who can ever touch your digital coins!
          </p>
        </div>
      </div>

      {/* Grid: Compliance Onboarding vs 2FA Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
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
                    <p className="text-[10px] font-sans text-slate-500">Scan this funny QR code with your phone's Authenticator App (like Google Authenticator) or type the setup key above.</p>
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

      </div>
    </div>
  );
}
