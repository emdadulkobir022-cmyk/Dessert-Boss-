import React, { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw, X, ShieldAlert, Check, Database } from 'lucide-react';
import { clearAllApplicationData } from '../services/storageService';
import { DEMO_SAMPLE_COMPANIES, INITIAL_INVENTORY, INITIAL_EMPLOYEES } from '../data/initialData';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const [confirmStep, setConfirmStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClearAll = () => {
    if (confirm('সতর্কতা: আপনি কি নিশ্চিত যে সমস্ত ডেটা (দোকানদার, স্টক, অর্ডার, খরচ, কালেকশন ও স্টাফ) সম্পূর্ণ মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না!')) {
      clearAllApplicationData();
      onDataReset();
      alert('সমস্ত ডেটা সম্পূর্ণ পরিষ্কার করা হয়েছে। আপনি এখন সম্পূর্ণ নতুন করে নিজের ডেটা যোগ করতে পারবেন।');
      onClose();
    }
  };

  const handleClearSection = (section: 'companies' | 'employees' | 'inventory' | 'orders' | 'expenses' | 'payments') => {
    const sectionNames = {
      companies: 'কোম্পানি ও দোকানদার তালিকা',
      employees: 'কর্মচারী ও স্টাফ তালিকা',
      inventory: 'ডেজার্ট ও ফালুদা স্টক তালিকা',
      orders: 'অর্ডার হিস্ট্রি',
      expenses: 'খরচ ও কেনাকাটার ভাউচার',
      payments: 'কালেকশন ও পেমেন্ট হিস্ট্রি',
    };

    if (confirm(`আপনি কি শুধুমাত্র "${sectionNames[section]}" মুছে ফেলতে চান?`)) {
      const keys = {
        companies: 'dessertboss_companies',
        employees: 'dessertboss_employees',
        inventory: 'dessertboss_inventory',
        orders: 'dessertboss_orders',
        expenses: 'dessertboss_expenses',
        payments: 'dessertboss_payments',
      };
      localStorage.setItem(keys[section], JSON.stringify([]));
      onDataReset();
      alert(`"${sectionNames[section]}" সফলভাবে মুছে ফেলা হয়েছে।`);
    }
  };

  const handleRestoreSampleData = () => {
    if (confirm('আপনি কি টেস্ট করার জন্য ডেমো স্যাম্পল ডেটা লোড করতে চান?')) {
      localStorage.setItem('dessertboss_companies', JSON.stringify(DEMO_SAMPLE_COMPANIES));
      localStorage.setItem('dessertboss_inventory', JSON.stringify(INITIAL_INVENTORY));
      localStorage.setItem('dessertboss_employees', JSON.stringify(INITIAL_EMPLOYEES));
      onDataReset();
      alert('ডেমো ডেটা লোড করা হয়েছে।');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">
              <Trash2 size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">ডেটাবেস ম্যানেজার ও ডিলিট অপশন</h2>
              <p className="text-[11px] text-zinc-400">
                নিজের মতো যেকোনো ডেটা মুছুন বা নতুন করে সাজান
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs overflow-y-auto flex-1">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px]">
                এখান থেকে আপনি যেকোনো নির্দিষ্ট ডেটা (যেমন: ফালুদা স্টক, দোকানদার, স্টাফ, অর্ডার বা খরচের হিসাব) আলাদাভাবে মুছতে পারবেন অথবা পুরো অ্যাপ একসঙ্গে খালি করে নতুন করে শুরু করতে পারবেন।
              </p>
            </div>
          </div>

          {/* Sectional Delete Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
              নির্দিষ্ট খাতের ডেটা মুছুন (Custom Clear):
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleClearSection('inventory')}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-all group"
              >
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs group-hover:text-rose-600">
                  🍮 ডেজার্ট / স্টক মুছুন
                </span>
                <span className="text-[10px] text-zinc-400">পুডিং ও ফালুদা আইটেম</span>
              </button>

              <button
                onClick={() => handleClearSection('companies')}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-all group"
              >
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs group-hover:text-rose-600">
                  🏢 দোকান / ক্লায়েন্ট মুছুন
                </span>
                <span className="text-[10px] text-zinc-400">সকল দোকানের তালিকা</span>
              </button>

              <button
                onClick={() => handleClearSection('expenses')}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-all group"
              >
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs group-hover:text-rose-600">
                  📝 খরচের ভাউচার মুছুন
                </span>
                <span className="text-[10px] text-zinc-400">বাজার ও কাঁচামাল খরচ</span>
              </button>

              <button
                onClick={() => handleClearSection('employees')}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-all group"
              >
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs group-hover:text-rose-600">
                  👥 স্টাফ / রাইডার মুছুন
                </span>
                <span className="text-[10px] text-zinc-400">সকল কর্মচারীর তথ্য</span>
              </button>

              <button
                onClick={() => handleClearSection('orders')}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-all group"
              >
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs group-hover:text-rose-600">
                  📦 অর্ডার হিস্ট্রি মুছুন
                </span>
                <span className="text-[10px] text-zinc-400">আজকের ও অতীতের অর্ডার</span>
              </button>

              <button
                onClick={() => handleClearSection('payments')}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-all group"
              >
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs group-hover:text-rose-600">
                  💰 কালেকশন রেকর্ড মুছুন
                </span>
                <span className="text-[10px] text-zinc-400">আদায়কৃত বিলের এন্ট্রি</span>
              </button>
            </div>
          </div>

          {/* Master Reset Button */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              বিপদজনক জোন (Master Clean):
            </span>

            <button
              onClick={handleClearAll}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all text-xs"
            >
              <Trash2 size={16} />
              <span>সমস্ত ডেটা একসাথে মুছে ফেলুন (Delete All Data)</span>
            </button>
            <p className="text-[10px] text-zinc-400 text-center">
              এটি ক্লিক করলে সব ডেটা খালি হয়ে যাবে এবং সম্পূর্ণ নতুন করে নিজের মতো ডাটা যোগ করতে পারবেন।
            </p>
          </div>

          {/* Restore Sample Data */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={handleRestoreSampleData}
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              <span>পরীক্ষার জন্য ডেমো স্যাম্পল ডেটা লোড করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
