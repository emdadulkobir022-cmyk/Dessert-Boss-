import React, { useState, useEffect } from 'react';
import { Company, Employee, PaymentTransaction } from '../types';
import { X, Banknote, Check, UserCheck, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  employees?: Employee[];
  preselectedCompany?: string;
  onRecordPayment: (
    companyName: string,
    amount: number,
    method: PaymentTransaction['Payment_Method'],
    reference: string,
    receivedBy: string
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  companies,
  employees = [],
  preselectedCompany,
  onRecordPayment,
}) => {
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [method, setMethod] = useState<PaymentTransaction['Payment_Method']>('Cash');
  const [reference, setReference] = useState('');
  const [selectedCollectorOption, setSelectedCollectorOption] = useState<string>('');
  const [customCollectorName, setCustomCollectorName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (preselectedCompany) {
        setSelectedCompanyName(preselectedCompany);
        const comp = companies.find((c) => c.Company_Name === preselectedCompany);
        if (comp && comp.Current_Due > 0) {
          setAmountInput(String(comp.Current_Due));
        } else {
          setAmountInput('');
        }
      } else if (companies.length > 0) {
        const firstComp = companies[0];
        setSelectedCompanyName(firstComp.Company_Name);
        if (firstComp.Current_Due > 0) {
          setAmountInput(String(firstComp.Current_Due));
        } else {
          setAmountInput('');
        }
      }

      // Default collector to first active employee or empty
      const activeEmps = employees.filter((e) => e.Status === 'Active');
      if (activeEmps.length > 0) {
        setSelectedCollectorOption(activeEmps[0].Name);
      } else {
        setSelectedCollectorOption('__custom__');
      }

      setReference('');
      setCustomCollectorName('');
    }
  }, [isOpen, preselectedCompany, companies, employees]);

  if (!isOpen) return null;

  const currentCompany = companies.find((c) => c.Company_Name === selectedCompanyName);
  const numericAmount = Math.max(0, Number(amountInput) || 0);

  // Resolved collector name
  const finalReceivedBy =
    selectedCollectorOption === '__custom__'
      ? customCollectorName.trim()
      : selectedCollectorOption.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyName) {
      alert('অনুগ্রহ করে কোম্পানি বা দোকান নির্বাচন করুন');
      return;
    }
    if (numericAmount <= 0) {
      alert('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন (কমপক্ষে ১ টাকা)');
      return;
    }
    if (!finalReceivedBy) {
      alert('অনুগ্রহ করে বকেয়া বিল কে আদায় করলো তার নাম নির্বাচন করুন বা লিখুন');
      return;
    }

    onRecordPayment(
      selectedCompanyName,
      numericAmount,
      method,
      reference || `বকেয়া কালেকশন (${method})`,
      finalReceivedBy
    );
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip leading zeros unless it's just '0'
    const val = e.target.value.replace(/^0+(?=\d)/, '');
    setAmountInput(val);
  };

  const activeEmployees = employees.filter((e) => e.Status === 'Active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
              <Banknote size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">বকেয়া বিল আদায় (Collect Payment)</h2>
              <p className="text-[11px] text-emerald-300">
                দোকানদারের বাকি থেকে সাথে সাথে সমন্বয় হবে
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* Shop Selector */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              দোকান বা ক্লায়েন্ট নির্বাচন করুন *
            </label>
            <select
              value={selectedCompanyName}
              onChange={(e) => {
                const name = e.target.value;
                setSelectedCompanyName(name);
                const comp = companies.find((c) => c.Company_Name === name);
                if (comp && comp.Current_Due > 0) {
                  setAmountInput(String(comp.Current_Due));
                } else {
                  setAmountInput('');
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
            >
              {companies.map((c) => (
                <option key={c.Company_ID} value={c.Company_Name}>
                  {c.Company_Name} (বকেয়া: ৳{c.Current_Due.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {currentCompany && (
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">
                  বর্তমান মোট বকেয়া (Current Due):
                </span>
                <p className="font-black text-rose-600 dark:text-rose-400 text-base">
                  ৳ {currentCompany.Current_Due.toLocaleString()}
                </p>
              </div>
              {currentCompany.Current_Due > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountInput(String(currentCompany.Current_Due))}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all"
                >
                  পুরো টাকা আদায় (Full)
                </button>
              )}
            </div>
          )}

          {/* Amount input - FIXED: No leading zero bug */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              আদায়কৃত টাকার পরিমাণ (৳) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-sm">
                ৳
              </span>
              <input
                type="number"
                min="1"
                value={amountInput}
                onChange={handleAmountChange}
                onFocus={(e) => e.target.select()}
                placeholder="যেমন: 5000"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-black text-base focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              যেকোনো সংখ্যা লিখুন। শুরুতে বাড়তি কোনো শূন্য (০) আসবে না।
            </p>
          </div>

          {/* Collector Name Field - FIXED: Proper employee selection */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
            <label className="block font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
              <UserCheck size={14} className="text-emerald-600" />
              <span>বকেয়া বিল আদায় করলো কে? (আদায়কারী) *</span>
            </label>

            <select
              value={selectedCollectorOption}
              onChange={(e) => setSelectedCollectorOption(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
            >
              {activeEmployees.length > 0 ? (
                <>
                  <optgroup label="টিমের এমপ্লয়ীগণ">
                    {activeEmployees.map((emp) => (
                      <option key={emp.Employee_ID} value={emp.Name}>
                        {emp.Name} ({emp.Role})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="অন্যান্য">
                    <option value="__custom__">+ অন্য কারো নাম টাইপ করুন</option>
                  </optgroup>
                </>
              ) : (
                <option value="__custom__">এমপ্লয়ীর নাম লিখুন</option>
              )}
            </select>

            {(selectedCollectorOption === '__custom__' || activeEmployees.length === 0) && (
              <input
                type="text"
                value={customCollectorName}
                onChange={(e) => setCustomCollectorName(e.target.value)}
                placeholder="যিনি টাকা আদায় করেছেন তার নাম লিখুন..."
                className="w-full px-3 py-2 rounded-xl border border-emerald-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                required
              />
            )}
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                পেমেন্ট মাধ্যম (Payment Method)
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cash">নগদ ক্যাশ (Cash)</option>
                <option value="bKash">বিকাশ (bKash)</option>
                <option value="Nagad">নগদ (Nagad)</option>
                <option value="Bank Transfer">ব্যাংক ট্রান্সফার (Bank)</option>
                <option value="Cheque">চেক (Cheque)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                রেফারেন্স / TrxID (অপশনাল)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="TrxID বা নোট"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>
          </div>

          {currentCompany && numericAmount > 0 && (
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300 flex justify-between">
              <span>টাকা জমার পর বকেয়া থাকবে:</span>
              <strong className="text-zinc-900 dark:text-zinc-100">
                ৳ {Math.max(0, currentCompany.Current_Due - numericAmount).toLocaleString()}
              </strong>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all text-xs"
            >
              <Check size={14} />
              <span>বিল আদায় সংরক্ষণ করুন (Save)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
