import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  Check,
  Copy,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
  QrCode,
  Database,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  getStoredCompanies,
  getStoredEmployees,
  getStoredInventory,
  getStoredOrders,
  getStoredReturns,
  getStoredExpenses,
  getStoredPayments,
} from '../services/storageService';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState<'dev' | 'shared' | null>(null);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios' | 'lifetime' | 'qr'>('android');
  const [backupDownloaded, setBackupDownloaded] = useState(false);

  if (!isOpen) return null;

  // Active URLs
  const devUrl = 'https://ais-dev-h5t2emxhyajbm4xmyevcu7-352832390126.asia-southeast1.run.app';
  const sharedUrl = 'https://ais-pre-h5t2emxhyajbm4xmyevcu7-352832390126.asia-southeast1.run.app';
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : devUrl;

  const handleCopy = (type: 'dev' | 'shared', url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  const handleDownloadFullBackup = () => {
    const backupData = {
      appName: 'Dessert Boss',
      exportDate: new Date().toISOString(),
      companies: getStoredCompanies(),
      employees: getStoredEmployees(),
      inventory: getStoredInventory(),
      orders: getStoredOrders(),
      returns: getStoredReturns(),
      expenses: getStoredExpenses(),
      payments: getStoredPayments(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dessertboss-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupDownloaded(true);
    setTimeout(() => setBackupDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white p-4.5 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 p-1 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shrink-0">
                <img src="/pwa-192x192.png" alt="Dessert Boss" className="w-10 h-10 rounded-xl" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 border border-emerald-500/40">
                  অফিসিয়াল মোবাইল অ্যাপ ও গাইড
                </span>
                <h3 className="font-black text-lg text-white mt-1 leading-tight">
                  ফোনের স্ক্রিনে অ্যাপ নিন ও লাইফটাইম গাইড
                </h3>
                <p className="text-xs text-emerald-300">
                  প্লে-স্টোর ছাড়াই সরাসরি ইনস্টল ও আজীবন ডেটা ব্যাকআপ
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Direct 1-Click Install Button if browser supports it */}
          {isInstallable && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md flex items-center justify-between gap-3">
              <div>
                <strong className="block text-sm font-black">১-ক্লিকে ইনস্টল করুন</strong>
                <span className="text-[11px] text-emerald-100">
                  আপনার ব্রাউজার প্রস্তুত! চাপ দিলেই ফোনে হোম আইকন তৈরি হবে।
                </span>
              </div>
              <button
                onClick={handleInstallClick}
                className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-black text-xs hover:bg-emerald-50 shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Download size={15} />
                <span>ইনস্টল</span>
              </button>
            </div>
          )}

          {/* Quick Tab Switcher: Android vs iPhone vs QR Code vs Lifetime */}
          <div className="bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl grid grid-cols-4 gap-1 font-bold text-center">
            <button
              onClick={() => setActiveDeviceTab('android')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeDeviceTab === 'android'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Smartphone size={13} />
              <span>Android</span>
            </button>
            <button
              onClick={() => setActiveDeviceTab('ios')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeDeviceTab === 'ios'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <span>🍎 iPhone</span>
            </button>
            <button
              onClick={() => setActiveDeviceTab('qr')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeDeviceTab === 'qr'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <QrCode size={13} />
              <span>QR কোড</span>
            </button>
            <button
              onClick={() => setActiveDeviceTab('lifetime')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeDeviceTab === 'lifetime'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Database size={13} />
              <span>লাইফটাইম</span>
            </button>
          </div>

          {/* QR Code Tab (Scan directly from screen) */}
          {activeDeviceTab === 'qr' && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
              <span className="font-bold text-zinc-800 dark:text-zinc-100 block text-xs">
                📷 মোবাইল ক্যামেরা দিয়ে সরাসরি স্ক্যান করুন:
              </span>
              <div className="inline-block p-3 rounded-2xl bg-white shadow-md border border-zinc-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    currentUrl
                  )}`}
                  alt="App QR Code"
                  className="w-44 h-44 mx-auto"
                />
              </div>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                আপনার মোবাইল ফোনের ক্যামেরা বা Google Lens দিয়ে এই QR কোডটি স্ক্যান করলেই সরাসরি অ্যাপটি খুলে যাবে।
              </p>
            </div>
          )}

          {/* Android Chrome Instructions */}
          {activeDeviceTab === 'android' && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px]">
                  ✓
                </span>
                <span>এন্ড্রয়েড ফোনে ইনস্টল করার সহজ নিয়ম:</span>
              </div>

              <ol className="space-y-2 text-zinc-600 dark:text-zinc-300">
                <li className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ১
                  </span>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                      লিংকটি ফোনের Chrome ব্রাউজারে খুলুন
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      নিচের "লিংক কপি করুন" বাটন চাপুন। ফোনে WhatsApp এ পাঠিয়ে ক্রোম ব্রাউজারে ওপেন করুন।
                    </span>
                  </div>
                </li>

                <li className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ২
                  </span>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                      উপরে ডানে ৩-ডট (⋮) মেন্যু চাপুন
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Chrome ব্রাউজারের একেবারে উপরের ডান কোণে তিনটি ডট (⋮) পাবেন।
                    </span>
                  </div>
                </li>

                <li className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ৩
                  </span>
                  <div>
                    <span className="font-black text-emerald-900 dark:text-emerald-200 block">
                      "Install app" বা "Add to Home screen" চাপুন
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      মেন্যুর তালিকায় "Install app" অথবা বাংলায় "হোম স্ক্রিনে যোগ করুন" চাপ দিন।
                    </span>
                  </div>
                </li>

                <li className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ৪
                  </span>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                      স্বয়ংক্রিয় অ্যাপ আইকন তৈরি হয়ে যাবে!
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      আপনার ফোনের স্ক্রিনে সাধারণ অ্যাপের মতো <strong>Dessert Boss</strong> আইকন চলে আসবে।
                    </span>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* iPhone Safari Instructions */}
          {activeDeviceTab === 'ios' && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px]">
                  ✓
                </span>
                <span>iPhone / iPad এ ইনস্টল করার সহজ নিয়ম:</span>
              </div>

              <ol className="space-y-2 text-zinc-600 dark:text-zinc-300">
                <li className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ১
                  </span>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                      Safari ব্রাউজারে লিংকটি খুলুন
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      আইফোনে Safari দিয়ে এই অ্যাপের লিংকটি ওপেন করুন।
                    </span>
                  </div>
                </li>

                <li className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ২
                  </span>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                      নিচে শেয়ার বাটনে (Share ⎋) ট্যাপ করুন
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      স্ক্রিনের নিচের দিকে চারকোনা থেকে তীরের মতো Share আইকন দেখতে পাবেন।
                    </span>
                  </div>
                </li>

                <li className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ৩
                  </span>
                  <div>
                    <span className="font-black text-emerald-900 dark:text-emerald-200 block">
                      "Add to Home Screen" (+) এ চাপুন
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      একটু নিচে স্ক্রোল করলেই "Add to Home Screen" পাবেন।
                    </span>
                  </div>
                </li>

                <li className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ৪
                  </span>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                      উপরে 'Add' বাটনে ক্লিক করুন
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      ফোনের হোম পেজে ফুলস্ক্রিন মোবাইল অ্যাপ হিসেবে যুক্ত হয়ে যাবে!
                    </span>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Lifetime Guide Tab */}
          {activeDeviceTab === 'lifetime' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                  <FileSpreadsheet size={15} />
                  <span>১. গুগল শিট ব্যাকএন্ড (লাইফটাইম ও ফ্রি)</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  অ্যাপটির সমস্ত ডেটা (কোম্পানি, স্টক, অর্ডার, খরচ, কালেকশন) সরাসরি আপনার গুগল ড্রাইভে থাকা <strong>Google Sheet</strong>-এ সিঙ্ক হয়। গুগল শিট সম্পূর্ণ ফ্রি এবং আজীবন আপনার গুগল একাউন্টে সেভ থাকে। ফোন হারালেও সমস্ত হিসাব অক্ষত থাকবে।
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                    <Database size={15} className="text-blue-500" />
                    <span>২. ১-ক্লিকে অফলাইন ব্যাকআপ ডাউনলোড</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  যেকোনো সময় আপনার সম্পূর্ণ ব্যবসায়ের সব ডেটা (JSON ফাইল) আপনার কম্পিউটার বা ফোনে সেভ করে রাখতে পারেন:
                </p>
                <button
                  onClick={handleDownloadFullBackup}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  {backupDownloaded ? <Check size={14} /> : <Download size={14} />}
                  <span>{backupDownloaded ? 'ব্যাকআপ ডাউনলোড সম্পন্ন!' : 'সম্পূর্ণ ডেটা ব্যাকআপ ডাউনলোড করুন'}</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                  <Sparkles size={15} className="text-amber-500" />
                  <span>৩. Vercel বা নিজস্ব ডোমেইনে ফ্রি হোস্টিং</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  এটি স্ট্যান্ডার্ড React কোড। আপনি চাইলে ১-ক্লিকে গিটহাব থেকে Vercel বা Netlify-তে আজীবনের জন্য ফ্রিতে নিজস্ব ডোমেইনে (যেমন: <code>dessertboss.com</code>) হোস্ট করতে পারবেন।
                </p>
              </div>
            </div>
          )}

          {/* Direct Live Links with Copy Buttons */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
              🔗 অ্যাপের সরাসরি লিংক (ফোনে পাঠাতে):
            </span>

            {/* Live Development URL */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                • লাইভ অ্যাপ লিংক (Primary Live App):
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 select-all"
                />
                <button
                  onClick={() => handleCopy('dev', currentUrl)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-xs"
                >
                  {copiedLink === 'dev' ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedLink === 'dev' ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>
            </div>

            {/* Shared Container URL */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400">
                • শেয়ার্ড লিংক (Shared URL):
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={sharedUrl}
                  className="flex-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 select-all"
                />
                <button
                  onClick={() => handleCopy('shared', sharedUrl)}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-xs"
                >
                  {copiedLink === 'shared' ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedLink === 'shared' ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>
            </div>

            {/* Crucial Note about Google Account Login */}
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-[10.5px] text-amber-900 dark:text-amber-200">
              <Lock size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>লগইন তথ্য:</strong> যেহেতু এই ক্লাউড অ্যাপটি আপনার জিমেইল অ্যাকাউন্ট (<strong>emdadulkobir359@gmail.com</strong>) দ্বারা সুরক্ষিত, তাই ফোনে ক্রোম ব্রাউজারে একই জিমেইল দিয়ে সাইন-ইন থাকতে হবে।
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>ব্রাউজারে নতুন ট্যাবে খুলুন</span>
            <ExternalLink size={12} />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs active:scale-95 transition-all"
          >
            বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
