import React, { useState } from 'react';
import { PaymentTransaction, Company, Employee } from '../types';
import {
  X,
  Banknote,
  Search,
  UserCheck,
  PlusCircle,
  Building,
  Calendar,
  CheckCircle2,
  Wallet,
  Smartphone,
  CreditCard,
  MessageSquare,
  Trash2,
} from 'lucide-react';

interface TodaysCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentTransaction[];
  companies: Company[];
  employees?: Employee[];
  onOpenPaymentModal: (companyName?: string) => void;
  onSelectCompanyForLedger?: (company: Company) => void;
  onDeletePayment?: (paymentId: string) => void;
}

export const TodaysCollectionsModal: React.FC<TodaysCollectionsModalProps> = ({
  isOpen,
  onClose,
  payments,
  companies,
  employees = [],
  onOpenPaymentModal,
  onSelectCompanyForLedger,
  onDeletePayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [collectorFilter, setCollectorFilter] = useState<string>('all');

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Payments collected today
  const todaysPayments = payments.filter((p) => p.Date === todayStr);

  const totalCollectedToday = todaysPayments.reduce((sum, p) => sum + (p.Amount || 0), 0);
  const cashCollected = todaysPayments
    .filter((p) => p.Payment_Method === 'Cash')
    .reduce((sum, p) => sum + (p.Amount || 0), 0);
  const digitalCollected = todaysPayments
    .filter((p) => p.Payment_Method !== 'Cash')
    .reduce((sum, p) => sum + (p.Amount || 0), 0);

  // Distinct collectors who collected money today
  const collectorsToday = Array.from(
    new Set(todaysPayments.map((p) => p.Received_By).filter(Boolean))
  );

  const filteredPayments = todaysPayments.filter((p) => {
    const matchesSearch =
      p.Company_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.Received_By && p.Received_By.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.Reference && p.Reference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || p.Payment_Method === methodFilter;
    const matchesCollector =
      collectorFilter === 'all' || p.Received_By === collectorFilter;

    return matchesSearch && matchesMethod && matchesCollector;
  });

  const handleShareWhatsAppReceipt = (p: PaymentTransaction) => {
    const comp = companies.find((c) => c.Company_Name === p.Company_Name);
    const cleanPhone = comp ? comp.Phone_Number.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(
      `*DESSERT BOSS - পেমেন্ট রিসিট (PAYMENT RECEIPT)*\n\n` +
      `গ্রাহক: ${p.Company_Name}\n` +
      `তারিখ: ${p.Date}\n` +
      `আদায়কৃত টাকা: ৳ ${p.Amount.toLocaleString()}\n` +
      `পেমেন্ট মাধ্যম: ${p.Payment_Method}\n` +
      `আদায়কারী: ${p.Received_By || 'স্টাফ'}\n` +
      (p.Reference ? `রেফারেন্স/নোট: ${p.Reference}\n` : '') +
      (comp ? `বর্তমান অবশিষ্ট বাকি: ৳ ${comp.Current_Due.toLocaleString()}\n` : '') +
      `\nটাকা বুঝে পেলাম। ধন্যবাদ!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 py-3.5 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Banknote size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">আজকের বিল আদায় (Today's Collections)</h2>
              <p className="text-[11px] text-emerald-300">
                আজকের সংগৃহীত সমস্ত পেমেন্ট ও আদায়কারীর তালিকা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenPaymentModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <PlusCircle size={14} />
              <span>+ নতুন বিল আদায়</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
              <span className="text-[10px] text-zinc-500 font-bold block">আজকের মোট আদায়</span>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                ৳ {totalCollectedToday.toLocaleString()}
              </p>
              <span className="text-[10px] text-zinc-400">{todaysPayments.length} টি কালেকশন</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
              <span className="text-[10px] text-zinc-500 font-bold block flex items-center gap-1">
                <Wallet size={11} className="text-emerald-600" />
                নগদ ক্যাশ (Cash)
              </span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                ৳ {cashCollected.toLocaleString()}
              </p>
              <span className="text-[10px] text-zinc-400">হাতে প্রাপ্ত টাকা</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
              <span className="text-[10px] text-zinc-500 font-bold block flex items-center gap-1">
                <Smartphone size={11} className="text-teal-600" />
                বিকাশ ও ডিজিটাল
              </span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                ৳ {digitalCollected.toLocaleString()}
              </p>
              <span className="text-[10px] text-zinc-400">bKash/Nagad/Bank</span>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[140px]">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="দোকান বা আদায়কারীর নাম..."
                className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Payment Method filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
            >
              <option value="all">সব মাধ্যম</option>
              <option value="Cash">ক্যাশ (Cash)</option>
              <option value="bKash">বিকাশ (bKash)</option>
              <option value="Nagad">নগদ (Nagad)</option>
              <option value="Bank Transfer">ব্যাংক</option>
            </select>

            {/* Collector filter */}
            {collectorsToday.length > 0 && (
              <select
                value={collectorFilter}
                onChange={(e) => setCollectorFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
              >
                <option value="all">সব আদায়কারী</option>
                {collectorsToday.map((name) => (
                  <option key={name} value={name}>
                    আদায়কারী: {name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Banknote size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  {todaysPayments.length === 0
                    ? 'আজকে এখনও কোনো বিল আদায় রেকর্ড করা হয়নি'
                    : 'ফিল্টারে কোনো আদায় তথ্য পাওয়া যায়নি'}
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-0.5">
                  যে দোকানদার বকেয়া টাকা দিয়েছে, তার কালেকশন যোগ করতে নিচের বোতামে চাপ দিন।
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenPaymentModal();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <PlusCircle size={15} />
                <span>+ বিল আদায় যোগ করুন (Record Collection)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredPayments.map((p) => {
                const comp = companies.find((c) => c.Company_Name === p.Company_Name);

                return (
                  <div
                    key={p.Payment_ID}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 shadow-2xs hover:border-emerald-500/50 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            {p.Company_Name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {p.Payment_ID}
                          </span>
                        </div>
                        {comp && (
                          <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                            {comp.Address} • বাকি ছিল: ৳{comp.Current_Due.toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                          + ৳ {p.Amount.toLocaleString()}
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mt-0.5">
                          {p.Payment_Method}
                        </span>
                      </div>
                    </div>

                    {/* Collector Row - Prominently Displayed */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                      <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                        <UserCheck size={13} className="text-teal-600" />
                        <span className="font-medium text-zinc-500">বকেয়া বিল আদায়কারী:</span>
                        <strong className="text-teal-800 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          {p.Received_By || 'স্টাফ'}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.Reference && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {p.Reference}
                          </span>
                        )}

                        <button
                          onClick={() => handleShareWhatsAppReceipt(p)}
                          className="p-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 transition-colors"
                          title="হোয়াটসঅ্যাপে রিসিট পাঠান"
                        >
                          <MessageSquare size={14} />
                        </button>

                        {comp && onSelectCompanyForLedger && (
                          <button
                            onClick={() => {
                              onClose();
                              onSelectCompanyForLedger(comp);
                            }}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                          >
                            লেজার →
                          </button>
                        )}

                        {onDeletePayment && (
                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি এই বিল আদায়ের রেকর্ডটি (${p.Company_Name} - ৳${p.Amount}) ডিলিট করতে চান?`)) {
                                onDeletePayment(p.Payment_ID);
                              }
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                            title="কালেকশন রেকর্ড মুছুন"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
          <span className="text-zinc-500">
            আজকের তারিখ: <strong>{todayStr}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
