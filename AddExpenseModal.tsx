import React, { useState } from 'react';
import { Expense, Employee } from '../types';
import { X, WalletCards, Check, Plus, Coins, Calendar, User, CreditCard, Tag } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Expense) => void;
  employees?: Employee[];
}

export const EXPENSE_CATEGORIES = [
  { id: 'Green Coconut', label: 'কাঁচা ডাব ও নারিকেল', icon: '🥥', sub: 'ডাব, নারিকেল শাস' },
  { id: 'Milk & Dairy', label: 'তরল দুধ ও ডেইরি', icon: '🥛', sub: 'মিল্কভিটা, আড়ং, মিষ্টি ক্রিম' },
  { id: 'Sugar & Sweeteners', label: 'চিনি ও আগার-আগার', icon: '🍚', sub: 'চিনি, জেলাটিন, কাস্টার্ড' },
  { id: 'Falooda Items', label: 'ফালুদা সামগ্রী ও ফল', icon: '🍮', sub: 'নুডলস, সাবজা, জেলি, কলা, আপেল' },
  { id: 'Packaging & Cups', label: 'কাপ, সিল ও বক্স', icon: '📦', sub: 'ওয়ান-টাইম কাপ, ঢাকনা, চামচ' },
  { id: 'Transport & Fuel', label: 'পরিবহন ও ভ্যান তেল', icon: '🚚', sub: 'গাড়ির জ্বালানি, সিএনজি ভাড়া' },
  { id: 'Ice & Cooling', label: 'বরফ ও কুলিং খরচ', icon: '🧊', sub: 'ড্রাই আইস, বরফের ব্লক' },
  { id: 'Labor & Utilities', label: 'গ্যাস সিলিন্ডার ও কারখানা', icon: '🔥', sub: 'এলপিজি গ্যাস, বিদ্যুৎ, পানি' },
  { id: 'Staff Food & Snacks', label: 'স্টাফ নাস্তা ও খাবার', icon: '☕', sub: 'দুপুরের খাবার, চা, নাস্তা' },
  { id: 'Other', label: 'অন্যান্য মালামাল কেনাকাটা', icon: '🛠️', sub: 'বিবিধ খরচ ও কেনাকাটা' },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  employees = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Green Coconut');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer'>('Cash');
  const [paidBy, setPaidBy] = useState<string>('');
  const [customPaidBy, setCustomPaidBy] = useState<string>('');
  const [voucherNo, setVoucherNo] = useState<string>('');

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/^0+(?=\d)/, '');
    if (rawVal === '') {
      setAmount(0);
    } else {
      const num = parseInt(rawVal, 10);
      setAmount(isNaN(num) ? 0 : Math.max(0, num));
    }
  };

  const handleAddQuickAmount = (increment: number) => {
    setAmount((prev) => (prev || 0) + increment);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('অনুগ্রহ করে সঠিক খরচের টাকার পরিমাণ লিখুন (কমপক্ষে ১ টাকা)।');
      return;
    }

    const effectivePaidBy = paidBy === 'OTHER' ? customPaidBy.trim() : (paidBy || 'মালিক / অফিস');

    const newExpense: Expense = {
      Expense_ID: `EXP-${Date.now().toString().slice(-4)}`,
      Date: date,
      Expense_Type: selectedCategory,
      Amount: amount,
      Note: note.trim() || `${selectedCategory} কেনাকাটা`,
      Payment_Method: paymentMethod,
      Paid_By: effectivePaidBy,
      Voucher_No: voucherNo.trim() || undefined,
    };

    onSaveExpense(newExpense);
    onClose();
    // Reset state
    setAmount(0);
    setNote('');
    setVoucherNo('');
    setCustomPaidBy('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-zinc-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <WalletCards size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">খরচ ও কেনাকাটার হিসাব লিখুন</h2>
              <p className="text-[11px] text-emerald-300">
                কাঁচামাল, ডাব, দুধ, চিনি, কাপ ও দৈনন্দিন খরচের ভাউচার
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Category Selection */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Tag size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>খরচ বা কেনাকাটার ক্যাটাগরি বেছে নিন *</span>
            </label>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2 rounded-xl text-left border transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/70 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-base select-none shrink-0">{cat.icon}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-[11px] block truncate">{cat.label}</span>
                      <span className="text-[9.5px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {cat.sub}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Coins size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>খরচের টাকার পরিমাণ (৳) *</span>
              </label>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                সংখ্যা লিখুন
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-emerald-700 dark:text-emerald-400">
                ৳
              </span>
              <input
                type="number"
                min="1"
                value={amount === 0 ? '' : amount}
                onChange={handleAmountChange}
                onFocus={(e) => e.target.select()}
                placeholder="যেমন: ৩,৫০০"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-black text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">কুইক যোগ:</span>
              {[200, 500, 1000, 2000, 5000].map((inc) => (
                <button
                  type="button"
                  key={inc}
                  onClick={() => handleAddQuickAmount(inc)}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold transition-colors"
                >
                  +৳{inc}
                </button>
              ))}
              {amount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(0)}
                  className="px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-semibold hover:bg-zinc-300"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>
          </div>

          {/* Details / Notes */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              আইটেম বা কেনাকাটার বিবরণ (Description / Note) *
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: আড়ং খাঁটি দুধ ৩০ লিটার, ১০০ পিস কাঁচা ডাব কারওয়ান বাজার থেকে, ইত্যাদি..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-zinc-500" />
                <span>খরচের তারিখ (Date)</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <CreditCard size={13} className="text-zinc-500" />
                <span>টাকা প্রদান পদ্ধতি (Payment)</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="Cash">ক্যাশ (নগদ টাকা)</option>
                <option value="bKash">বিকাশ (bKash)</option>
                <option value="Nagad">নগদ (Nagad)</option>
                <option value="Bank Transfer">ব্যাংক ট্রান্সফার</option>
              </select>
            </div>
          </div>

          {/* Paid By / Purchaser */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <User size={13} className="text-zinc-500" />
                <span>বাজার / টাকা পরিশোধকারী (Paid By)</span>
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="">মালিক / মেইন ক্যাশ</option>
                {employees.map((emp) => (
                  <option key={emp.Employee_ID} value={emp.Name}>
                    {emp.Name} ({emp.Role})
                  </option>
                ))}
                <option value="OTHER">+ অন্য কারো নাম লিখুন</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ভাউচার / মেমো নং (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                placeholder="যেমন: MEMO-1049"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {paidBy === 'OTHER' && (
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                নির্দিষ্ট ব্যক্তির নাম লিখুন
              </label>
              <input
                type="text"
                value={customPaidBy}
                onChange={(e) => setCustomPaidBy(e.target.value)}
                placeholder="নাম লিখুন..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Check size={16} />
              <span>খরচ সেভ করুন (Save to Sheets)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
