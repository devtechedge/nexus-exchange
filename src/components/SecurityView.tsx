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
  Info
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
          
          // Simulate AI background scanning check
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
        setKycError('Invalid file type. Please upload a PDF or an Image (JPEG/PNG).');
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
      setTwoFactorError('Please enter a valid 6-digit numeric pin.');
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
      
      {/* Grid: Compliance Onboarding vs 2FA Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KYC Compliance Onboarding Panel */}
        <div id="kyc-panel" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <span className="text-xs font-sans font-semibold text-slate-300">Compliance Onboarding Wizard</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">KYC Gateway</span>
            </div>

            {user.kycStatus === 'verified' ? (
              <div className="p-6 text-center bg-emerald-950/20 border border-emerald-900/50 rounded-2xl space-y-4">
                <div className="mx-auto w-12 h-12 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-bold text-white">Identity Verification Completed</h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">Your sovereign account has passed automated KYC checks successfully. Full withdrawals and institutional OTC channels are now active.</p>
                </div>
                <div className="text-left p-3.5 bg-slate-900/40 rounded-xl space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Audit Status:</span>
                    <span className="text-emerald-400 font-bold">VERIFIED_APPROVED</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Daily Limit:</span>
                    <span className="text-slate-300">$5,000,000 USDC</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Compliance Key:</span>
                    <span className="text-slate-300">NX-KYC-98522-X78</span>
                  </div>
                </div>
              </div>
            ) : isUploading ? (
              <div className="p-10 text-center space-y-4">
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-cyan-500 h-2 rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs font-mono text-slate-400">Uploading {fileName}... {uploadProgress}%</p>
              </div>
            ) : isScanning ? (
              <div className="p-10 text-center space-y-4">
                <div className="mx-auto w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-slate-300 animate-pulse">Scanning identity document with AI neural parser...</p>
                <p className="text-[10px] font-mono text-slate-500">Verifying signature and biometric matches...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  To protect our decentralized clearing operations and support standard fiat-to-token off-ramps, you must complete instant compliance checks.
                </p>

                {kycError && (
                  <p className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs font-mono text-red-400">{kycError}</p>
                )}

                {/* Drag and Drop Zone */}
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
                    <UploadCloud className="w-8 h-8 text-slate-500 mx-auto" />
                    <div>
                      <p className="text-xs font-sans font-semibold text-slate-300">Drag & drop passport or driver license</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">Accepts PDF, JPEG, or PNG up to 10MB</p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-slate-900 hover:bg-slate-850 text-[10px] font-mono text-slate-400 border border-slate-850 rounded-lg">
                      Choose Document File
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
              <span className="text-xs font-sans font-semibold text-slate-300">Two-Factor Security Matrix</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">MFA Lock</span>
            </div>

            {user.twoFactorEnabled ? (
              <div className="p-6 text-center bg-cyan-950/20 border border-cyan-900/50 rounded-2xl space-y-4">
                <div className="mx-auto w-12 h-12 bg-cyan-950 border border-cyan-800 rounded-full flex items-center justify-center">
                  <Fingerprint className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-bold text-white">Google Authenticator Enabled</h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">Multi-factor security protocol is active. Outbound withdrawals require MFA authentication challenge.</p>
                </div>
                <button
                  id="disable-2fa-btn"
                  onClick={handleDisable2FA}
                  className="px-4 py-2 bg-red-950/40 hover:bg-red-900 border border-red-900/30 text-red-400 rounded-xl text-xs font-mono cursor-pointer transition"
                >
                  DEACTIVATE 2FA LOCK
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Protect your clearing balances with a secondary cryptographically tied device. Sync Google Authenticator or any compatible OTP app.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 items-center p-4 bg-slate-900/20 border border-slate-900 rounded-xl">
                  {/* Custom Vector QR Code */}
                  <div className="w-24 h-24 bg-white p-2 rounded-xl shrink-0 select-none flex flex-wrap gap-0.5 relative">
                    {/* SVG representation or grid simulation of QR code */}
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
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Authenticator Key Secret</span>
                    <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between font-mono text-xs text-slate-300">
                      <span>{secretSeed}</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500">Scan QR or type seed key manual setup.</p>
                  </div>
                </div>

                {/* OTP verify form */}
                <form onSubmit={handleVerify2FA} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Enter Authenticator Pin</label>
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
                    <p className="text-xs font-mono text-red-400">{twoFactorError}</p>
                  )}

                  <button
                    id="verify-2fa-btn"
                    type="submit"
                    disabled={success2FA}
                    className="w-full py-2.5 bg-cyan-900 hover:bg-cyan-850 text-cyan-100 border border-cyan-800 hover:border-cyan-700 font-sans font-bold text-xs rounded-xl shadow-lg transition tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {success2FA ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>COUPLE MFA PROTOCOL</span>
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
