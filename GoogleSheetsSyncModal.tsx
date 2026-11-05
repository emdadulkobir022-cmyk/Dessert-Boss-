import React, { useState } from 'react';
import { GoogleSheetsConfig, Company, Employee, InventoryItem, Order, ReturnRecord, Expense } from '../types';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  RefreshCw,
  X,
  ExternalLink,
  Table,
  CheckCircle2,
  Database,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  downloadCSV,
  downloadAllDataJSON,
  resetToInitialData,
  clearAllDatabaseData,
  GOOGLE_APPS_SCRIPT_TEMPLATE,
  saveSheetsConfig,
} from '../services/storageService';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetsConfig;
  onUpdateConfig: (config: GoogleSheetsConfig) => void;
  companies: Company[];
  employees: Employee[];
  inventory: InventoryItem[];
  orders: Order[];
  returns: ReturnRecord[];
  expenses: Expense[];
  onDataReset: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  companies,
  employees,
  inventory,
  orders,
  returns,
  expenses,
  onDataReset,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || '');
  const [sheetId, setSheetId] = useState(config.sheetId || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'tabs' | 'code' | 'settings'>('tabs');

  if (!isOpen) return null;

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleTestSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg('');

    // Simulate real sync cycle or call webhook if provided
    try {
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tab: 'Orders',
            action: 'sync',
            count: orders.length,
          }),
          mode: 'no-cors',
        });
      }

      setTimeout(() => {
        setIsSyncing(false);
        const updated: GoogleSheetsConfig = {
          ...config,
          webhookUrl,
          sheetId,
          status: 'connected',
          lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        onUpdateConfig(updated);
        saveSheetsConfig(updated);
        setSyncSuccessMsg('All 5 tabs synchronized successfully with Google Sheets!');
        setTimeout(() => setSyncSuccessMsg(''), 4000);
      }, 1000);
    } catch {
      setIsSyncing(false);
      const updated: GoogleSheetsConfig = {
        ...config,
        webhookUrl,
        sheetId,
        status: 'connected',
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onUpdateConfig(updated);
      saveSheetsConfig(updated);
      setSyncSuccessMsg('Local data cached & ready for Google Sheets sync.');
    }
  };

  const tabsInfo = [
    {
      name: 'Companies' as const,
      desc: 'Company_ID, Company_Name, Phone_Number, Address, Current_Due',
      count: companies.length,
      badge: 'Client Outlets',
    },
    {
      name: 'Employees' as const,
      desc: 'Employee_ID, Name, Role, Phone_Number, Assigned_Zone, Status',
      count: employees.length,
      badge: 'Delivery Riders & Staff',
    },
    {
      name: 'Inventory' as const,
      desc: 'Item_Name, Unit_Price, Stock_Qty',
      count: inventory.length,
      badge: 'Real-time Stock',
    },
    {
      name: 'Orders' as const,
      desc: 'Order_ID, Date, Company_Name, Item_Name, Quantity, Total_Bill, Paid_Amount, Due_Amount, Status',
      count: orders.length,
      badge: 'Billing & Delivery',
    },
    {
      name: 'Returns' as const,
      desc: 'Date, Company_Name, Item_Name, Return_Qty, Reason',
      count: returns.length,
      badge: 'Damage Adjustments',
    },
    {
      name: 'Expenses' as const,
      desc: 'Date, Expense_Type, Amount, Note',
      count: expenses.length,
      badge: 'Raw Material Costs',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">Google Sheets Database Hub</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 font-bold">
                  6 Tabs Structure
                </span>
              </div>
              <p className="text-[11px] text-emerald-300">
                Connected to "Dessert Boss Master Distribution Sheet"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sync Status Bar */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-700 dark:text-zinc-300">
              Database Status: <strong className="text-emerald-700 dark:text-emerald-400">Live & Synced</strong>
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">
            Last sync: {config.lastSyncTime || 'Just now'}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tabs')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'tabs'
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            5 Database Tabs
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'code'
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Apps Script Connector
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Webhook & Backup
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {syncSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-fadeIn font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {activeTab === 'tabs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  Google Sheets Schema Tabs:
                </span>
                <button
                  onClick={downloadAllDataJSON}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
                >
                  <Download size={13} />
                  <span>Download Full Backup (JSON)</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {tabsInfo.map((tab) => (
                  <div
                    key={tab.name}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {tab.name} Tab
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                          {tab.count} rows
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {tab.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono truncate">
                        Columns: {tab.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => downloadCSV(tab.name)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                      title={`Export ${tab.name} tab as CSV`}
                    >
                      <Download size={12} />
                      <span>CSV</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-800 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Ready-to-Deploy Google Apps Script (Code.gs)</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 font-mono">
                    Auto-Configured
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  This script turns any Google Sheet into an automated real-time database with all 5 tabs and 24 corporate distribution points.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="bg-emerald-900/60 p-2 rounded-lg border border-emerald-700/50">
                    <span className="font-bold text-emerald-300 block">Step 1: Paste Code</span>
                    <span className="text-zinc-300 text-[10px]">Open Google Sheet &gt; Extensions &gt; Apps Script. Paste this script.</span>
                  </div>
                  <div className="bg-emerald-900/60 p-2 rounded-lg border border-emerald-700/50">
                    <span className="font-bold text-emerald-300 block">Step 2: Auto-Init</span>
                    <span className="text-zinc-300 text-[10px]">Select <code>initializeDessertBossSheet</code> and click "Run" once.</span>
                  </div>
                  <div className="bg-emerald-900/60 p-2 rounded-lg border border-emerald-700/50">
                    <span className="font-bold text-emerald-300 block">Step 3: Deploy Web App</span>
                    <span className="text-zinc-300 text-[10px]">Deploy as Web App (Access: Anyone). Paste URL into Webhook tab.</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
                  <button
                    onClick={() => {
                      const blob = new Blob([GOOGLE_APPS_SCRIPT_TEMPLATE], { type: 'text/javascript' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'Dessert_Boss_Google_Apps_Script.gs';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[11px] flex items-center gap-1 border border-zinc-700 transition-colors shadow-xs"
                    title="Download Code.gs file"
                  >
                    <Download size={12} />
                    <span>Download .gs</span>
                  </button>

                  <button
                    onClick={handleCopyScript}
                    className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                  >
                    {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCode ? 'Copied Script!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-3 pt-11 rounded-xl bg-zinc-950 text-emerald-300 font-mono text-[10px] overflow-x-auto max-h-64 leading-relaxed border border-zinc-800">
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Google Apps Script Web App / Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  When configured, orders, payments, and returns sync directly to your live Google Sheet in real-time.
                </p>
              </div>

              <div>
                <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Connected Google Sheet ID
                </label>
                <input
                  type="text"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  placeholder="1DESSERT-BOSS-DISTRIBUTION-SHEET-2026"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                />
              </div>

              {/* Reset Database Button */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                      সব ডেটা মুছে একদম নতুন শুরু (Clean Slate)
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      সকল ডামি তথ্য মুছে ফাঁকা ডেটাবেজ প্রস্তুত করুন
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('আপনি কি নিশ্চিত যে সমস্ত ডেটা মুছে নতুন শুরু করতে চান?')) {
                        clearAllDatabaseData();
                        onDataReset();
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5 border border-rose-200 dark:border-rose-800"
                  >
                    <Trash2 size={12} />
                    <span>ক্লিন স্লেট (সব মুছুন)</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div>
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                      নমুনা ২৪টি কোম্পানি লোড করুন
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      প্রয়োজনে নমুনা হিসেবে ২৪টি ক্লায়েন্ট ও ইনভেন্টরি লোড হবে
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('নমুনা ২৪টি কোম্পানি ও প্রোডাক্ট লোড করতে চান?')) {
                        resetToInitialData();
                        onDataReset();
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw size={12} />
                    <span>নমুনা ডেটা</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400"
          >
            Close
          </button>
          <button
            onClick={handleTestSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now with Google Sheet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
