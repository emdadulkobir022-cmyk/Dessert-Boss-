import React, { useState } from 'react';
import { Company, Order, PaymentTransaction, ReturnRecord, UserRole, Employee } from '../types';
import {
  Users,
  Search,
  Phone,
  MessageSquare,
  Banknote,
  PlusCircle,
  FileText,
  Calendar,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Building,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  CalendarDays,
  Clock,
  Trash2,
} from 'lucide-react';

export type LedgerPeriodFilter =
  | 'day'
  | 'month'
  | 'year'
  | 'all'
  | 'exact-date'
  | 'exact-month'
  | 'exact-year';

interface CustomerLedgerScreenProps {
  companies: Company[];
  orders: Order[];
  payments: PaymentTransaction[];
  returns: ReturnRecord[];
  employees?: Employee[];
  role: UserRole;
  onOpenQuickOrder: (companyName: string) => void;
  onOpenPaymentModal: (companyName: string) => void;
  onOpenInvoice: (order: Order) => void;
  onOpenAddCompany?: () => void;
  onOpenTodaysCollections?: () => void;
  onDeleteCompany?: (companyId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  onDeletePayment?: (paymentId: string) => void;
}

export const CustomerLedgerScreen: React.FC<CustomerLedgerScreenProps> = ({
  companies,
  orders,
  payments,
  returns,
  employees = [],
  role,
  onOpenQuickOrder,
  onOpenPaymentModal,
  onOpenInvoice,
  onOpenAddCompany,
  onOpenTodaysCollections,
  onDeleteCompany,
  onDeleteOrder,
  onDeletePayment,
}) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<'due-desc' | 'due-asc' | 'name'>('due-desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<LedgerPeriodFilter>('all');
  const [modalPeriodFilter, setModalPeriodFilter] = useState<LedgerPeriodFilter>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM
  const currentYearStr = todayStr.slice(0, 4); // YYYY

  const [selectedExactDate, setSelectedExactDate] = useState<string>(todayStr);
  const [selectedExactMonth, setSelectedExactMonth] = useState<string>(currentMonthStr);
  const [selectedExactYear, setSelectedExactYear] = useState<string>(currentYearStr);

  const totalDueAllCompanies = companies.reduce((sum, c) => sum + (c.Current_Due || 0), 0);
  const companiesWithDueCount = companies.filter((c) => c.Current_Due > 0).length;

  // Filter helper by date
  const isDateInPeriod = (dateStr: string, period: LedgerPeriodFilter) => {
    if (!dateStr) return false;
    if (period === 'day') return dateStr === todayStr;
    if (period === 'month') return dateStr.startsWith(currentMonthStr);
    if (period === 'year') return dateStr.startsWith(currentYearStr);
    if (period === 'exact-date') return dateStr === selectedExactDate;
    if (period === 'exact-month') return dateStr.startsWith(selectedExactMonth);
    if (period === 'exact-year') return dateStr.startsWith(selectedExactYear);
    return true;
  };

  // Filtered period overall totals
  const filteredOrders = orders.filter((o) => isDateInPeriod(o.Date, periodFilter));
  const filteredPayments = payments.filter((p) => isDateInPeriod(p.Date, periodFilter));
  const filteredPeriodBilled = filteredOrders.reduce((sum, o) => sum + (o.Total_Bill || 0), 0);
  const filteredPeriodPaid = filteredPayments.reduce((sum, p) => sum + (p.Amount || 0), 0);
  const filteredPeriodUnits = filteredOrders.reduce((sum, o) => sum + (o.Quantity || 0), 0);

  // Calculate stats for a company in a chosen period
  const getCompanyPeriodStats = (companyName: string, period: LedgerPeriodFilter) => {
    const compOrders = orders.filter(
      (o) => o.Company_Name === companyName && isDateInPeriod(o.Date, period)
    );
    const compPayments = payments.filter(
      (p) => p.Company_Name === companyName && isDateInPeriod(p.Date, period)
    );

    const periodBilled = compOrders.reduce((sum, o) => sum + (o.Total_Bill || 0), 0);
    const periodPaid = compPayments.reduce((sum, p) => sum + (p.Amount || 0), 0);
    const periodUnits = compOrders.reduce((sum, o) => sum + (o.Quantity || 0), 0);

    return { periodBilled, periodPaid, periodUnits };
  };

  // Filter and sort companies
  const filteredCompanies = companies
    .filter((c) => {
      const matchesSearch =
        c.Company_Name.toLowerCase().includes(search.toLowerCase()) ||
        c.Address.toLowerCase().includes(search.toLowerCase()) ||
        (c.Contact_Person && c.Contact_Person.toLowerCase().includes(search.toLowerCase()));

      const matchesCat = categoryFilter === 'all' || c.Category === categoryFilter;

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortOption === 'due-desc') return b.Current_Due - a.Current_Due;
      if (sortOption === 'due-asc') return a.Current_Due - b.Current_Due;
      return a.Company_Name.localeCompare(b.Company_Name);
    });

  const handleWhatsAppStatement = (company: Company) => {
    const cleanPhone = company.Phone_Number.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `*DESSERT BOSS - কাস্টমার লেজার ও বকেয়া নোটিশ*\n\n` +
      `দোকান/গ্রাহক: ${company.Company_Name}\n` +
      `তারিখ: ${new Date().toLocaleDateString('bn-BD')}\n` +
      `বর্তমান মোট বকেয়া (Current Due): ৳ ${company.Current_Due.toLocaleString()}\n\n` +
      `বকেয়া বিল পরিশোধের জন্য বিকাশ, ব্যাংক বা ক্যাশ কালেকশন করতে যোগাযোগ করুন।\n` +
      `ধন্যবাদ!\nDessert Boss Food Distribution`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Build combined ledger history for selected company
  const getCompanyLedgerTransactions = (companyName: string, period: LedgerPeriodFilter) => {
    const compOrders = orders.filter(
      (o) => o.Company_Name === companyName && isDateInPeriod(o.Date, period)
    );
    const compPayments = payments.filter(
      (p) => p.Company_Name === companyName && isDateInPeriod(p.Date, period)
    );
    const compReturns = returns.filter(
      (r) => r.Company_Name === companyName && isDateInPeriod(r.Date, period)
    );

    type LedgerEntry = {
      id: string;
      date: string;
      time?: string;
      type: 'Order' | 'Payment' | 'Return';
      description: string;
      staffName?: string;
      debit: number; // Increases due
      credit: number; // Decreases due
      rawObject: any;
    };

    const entries: LedgerEntry[] = [];

    compOrders.forEach((o) => {
      entries.push({
        id: o.Order_ID,
        date: o.Date,
        time: o.Time,
        type: 'Order',
        description:
          o.Items && o.Items.length > 0
            ? o.Items.map((i) => `${i.Quantity}x ${i.Item_Name}`).join(', ')
            : `${o.Quantity}x ${o.Item_Name}`,
        staffName: o.Delivered_By,
        debit: o.Total_Bill,
        credit: o.Paid_Amount, // If partial paid on order
        rawObject: o,
      });
    });

    compPayments.forEach((p) => {
      entries.push({
        id: p.Payment_ID,
        date: p.Date,
        type: 'Payment',
        description: `বকেয়া বিল আদায় (${p.Payment_Method}) ${p.Reference ? `[রেফ: ${p.Reference}]` : ''}`,
        staffName: p.Received_By,
        debit: 0,
        credit: p.Amount,
        rawObject: p,
      });
    });

    compReturns.forEach((r) => {
      entries.push({
        id: r.Return_ID,
        date: r.Date,
        type: 'Return',
        description: `ফেরত/রিটার্ন: ${r.Return_Qty}x ${r.Item_Name} (${r.Reason})`,
        debit: 0,
        credit: r.Credit_Amount || 0,
        rawObject: r,
      });
    });

    // Sort descending by date
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  };

  return (
    <div className="space-y-4 pb-20 pt-2 animate-fadeIn">
      {/* Overview Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                দোকান ও ক্লায়েন্ট লেজার ({companies.length})
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                কোন দোকান কত টাকা বিল দিলো ও কত টাকা পাবো
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTodaysCollections && (
              <button
                onClick={onOpenTodaysCollections}
                className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Banknote size={14} />
                <span>আজকের বিল আদায়</span>
              </button>
            )}

            {onOpenAddCompany && (
              <button
                onClick={onOpenAddCompany}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <PlusCircle size={14} />
                <span>+ নতুন কোম্পানি</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Due Banner */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
          <div>
            <span>মোট বাকি (সব দোকান মিলিয়ে পাবো): </span>
            <strong className="text-rose-600 dark:text-rose-400 text-sm font-black">
              ৳ {totalDueAllCompanies.toLocaleString()}
            </strong>
          </div>
          <div>
            <span>বকেয়া দোকান: </span>
            <strong className="text-zinc-800 dark:text-zinc-200 font-bold">
              {companiesWithDueCount} / {companies.length} টি
            </strong>
          </div>
        </div>

        {/* Period Selector Tabs: দিন / মাস / বছর / সব সময় / নির্দিষ্ট তারিখ / নির্দিষ্ট মাস / নির্দিষ্ট বছর */}
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
              <Calendar size={13} className="text-emerald-600" />
              হিসাবের রিপোর্ট সময়কাল ফিল্টার:
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {periodFilter === 'day' && '📅 আজকের দিন'}
              {periodFilter === 'month' && '📆 চলতি মাস'}
              {periodFilter === 'year' && '🗓️ চলতি বছর'}
              {periodFilter === 'all' && '🌐 সব সময়ের হিসাব'}
              {periodFilter === 'exact-date' && `📅 তারিখ: ${selectedExactDate}`}
              {periodFilter === 'exact-month' && `📆 মাস: ${selectedExactMonth}`}
              {periodFilter === 'exact-year' && `🗓️ বছর: ${selectedExactYear}`}
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPeriodFilter('day')}
              className={`py-1.5 px-2.5 rounded-lg text-center transition-all shrink-0 ${
                periodFilter === 'day'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              আজকে
            </button>
            <button
              onClick={() => setPeriodFilter('month')}
              className={`py-1.5 px-2.5 rounded-lg text-center transition-all shrink-0 ${
                periodFilter === 'month'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              চলতি মাস
            </button>
            <button
              onClick={() => setPeriodFilter('year')}
              className={`py-1.5 px-2.5 rounded-lg text-center transition-all shrink-0 ${
                periodFilter === 'year'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              চলতি বছর
            </button>
            <button
              onClick={() => setPeriodFilter('all')}
              className={`py-1.5 px-2.5 rounded-lg text-center transition-all shrink-0 ${
                periodFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              সব সময়
            </button>
            <button
              onClick={() => setPeriodFilter('exact-date')}
              className={`py-1.5 px-2.5 rounded-lg text-center transition-all shrink-0 ${
                periodFilter === 'exact-date'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              📅 নির্দিষ্ট তারিখ
            </button>
            <button
              onClick={() => setPeriodFilter('exact-month')}
              className={`py-1.5 px-2.5 rounded-lg text-center transition-all shrink-0 ${
                periodFilter === 'exact-month'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              📆 নির্দিষ্ট মাস
            </button>
            <button
              onClick={() => setPeriodFilter('exact-year')}
              className={`py-1.5 px-2.5 rounded-lg text-center transition-all shrink-0 ${
                periodFilter === 'exact-year'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              🗓️ বছর বাই বছর
            </button>
          </div>

          {/* Sub-picker controls */}
          {periodFilter === 'exact-date' && (
            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                তারিখ সিলেক্ট করুন (Date Picker):
              </span>
              <input
                type="date"
                value={selectedExactDate}
                onChange={(e) => setSelectedExactDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          {periodFilter === 'exact-month' && (
            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                মাস সিলেক্ট করুন (Month Picker):
              </span>
              <input
                type="month"
                value={selectedExactMonth}
                onChange={(e) => setSelectedExactMonth(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          {periodFilter === 'exact-year' && (
            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                বছর বেছে নিন (Year Selection):
              </span>
              <select
                value={selectedExactYear}
                onChange={(e) => setSelectedExactYear(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y.toString()}>
                    {y} সাল
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtered Period Stats Overview */}
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-2 border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-medium">নির্বাচিত সময়ে মোট বিল</span>
              <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                ৳ {filteredPeriodBilled.toLocaleString()}
              </p>
              <span className="text-[9.5px] text-zinc-400">{filteredPeriodUnits} কাপ/বক্স</span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl p-2 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">নির্বাচিত সময়ে আদায়</span>
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                ৳ {filteredPeriodPaid.toLocaleString()}
              </p>
              <span className="text-[9.5px] text-emerald-700/80">{filteredPayments.length} টি কালেকশন</span>
            </div>

            <div className="bg-rose-50/60 dark:bg-rose-950/30 rounded-xl p-2 border border-rose-200 dark:border-rose-800/60">
              <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-medium">বাকি রয়েছে</span>
              <p className="text-xs font-black text-rose-600 dark:text-rose-400">
                ৳ {Math.max(0, filteredPeriodBilled - filteredPeriodPaid).toLocaleString()}
              </p>
              <span className="text-[9.5px] text-zinc-400">অনাদায়ি বিল</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="দোকান বা ক্লায়েন্টের নাম খুঁজুন..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">সব ক্যাটাগরি</option>
            <option value="Corporate Canteen">Corporate Canteens</option>
            <option value="Superstore">Superstores</option>
            <option value="Retail Outlet">Retail Outlets</option>
            <option value="Executive Lounge">Executive Lounges</option>
          </select>

          {/* Sort By */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
          >
            <option value="due-desc">সর্বোচ্চ বকেয়া আগে</option>
            <option value="due-asc">কম বকেয়া আগে</option>
            <option value="name">নামের ক্রমানুসারে (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Companies Ledger Grid / Cards */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building size={28} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {companies.length === 0 ? 'কোনো ক্লায়েন্ট বা দোকান নেই' : 'কোনো কোম্পানি খুঁজে পাওয়া যায়নি'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
              {companies.length === 0
                ? 'আপনার পুডিং ও ফালুদা যেসকল সুপারশপ বা কর্পোরেট ক্যান্টিনে বিক্রি করবেন, তাদের যুক্ত করুন।'
                : 'ভিন্ন নাম দিয়ে সার্চ করে দেখুন।'}
            </p>
          </div>
          {onOpenAddCompany && (
            <button
              onClick={onOpenAddCompany}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <PlusCircle size={16} />
              <span>+ নতুন কোম্পানি যোগ করুন (Add Client)</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCompanies.map((company) => {
            const hasDue = company.Current_Due > 0;
            const stats = getCompanyPeriodStats(company.Company_Name, periodFilter);

            return (
              <div
                key={company.Company_ID}
                onClick={() => {
                  setSelectedCompany(company);
                  setModalPeriodFilter(periodFilter);
                }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/60 transition-all cursor-pointer shadow-2xs active:scale-[0.99] flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] text-zinc-400">
                        {company.Company_ID}
                      </span>
                      <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {company.Company_Name}
                      </h3>
                      {company.Assigned_Employee && (
                        <span className="text-[10px] bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-1.5 py-0.2 rounded font-medium border border-teal-200 dark:border-teal-800">
                          {company.Assigned_Employee}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                      {company.Address}
                    </p>
                  </div>

                  {/* Due Amount Highlight */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-zinc-400 block font-medium">মোট বকেয়া পাবো</span>
                    <p
                      className={`text-sm font-black ${
                        hasDue ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      ৳ {company.Current_Due.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Day / Month / Year Financial Metric Bar */}
                <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-[11px]">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">
                      {periodFilter === 'day'
                        ? 'আজকের বিল'
                        : periodFilter === 'month'
                        ? 'মাসের বিল'
                        : periodFilter === 'year'
                        ? 'বছরের বিল'
                        : 'মোট অর্ডার বিল'}
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      ৳ {stats.periodBilled.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[10px] block">
                      {periodFilter === 'day'
                        ? 'আজকে দিয়েছে'
                        : periodFilter === 'month'
                        ? 'মাসে দিয়েছে'
                        : periodFilter === 'year'
                        ? 'বছরে দিয়েছে'
                        : 'পরিশোধিত টাকা'}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ৳ {stats.periodPaid.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-zinc-500 text-[10px] block">পুডিং ইনটেক</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {stats.periodUnits} কাপ
                    </span>
                  </div>
                </div>

                {/* Footer Actions Row */}
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPaymentModal(company.Company_Name);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-100 transition-colors"
                    >
                      + বিল আদায়
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQuickOrder(company.Company_Name);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-200 transition-colors"
                    >
                      + নতুন অর্ডার
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      পূর্ণ লেজার দেখুন →
                    </span>

                    {onDeleteCompany && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`আপনি কি "${company.Company_Name}" কোম্পানি/দোকানটি খতিয়ান থেকে মুছে ফেলতে চান?`)) {
                            onDeleteCompany(company.Company_ID);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="কোম্পানি ডিলিট করুন"
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

      {/* Individual Company Ledger Profile Modal with Day/Month/Year Breakdown */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-emerald-950 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                  {selectedCompany.Company_ID} • {selectedCompany.Category || 'Client'}
                </span>
                <h2 className="font-bold text-base mt-1 text-white">
                  {selectedCompany.Company_Name}
                </h2>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  {selectedCompany.Address}
                </p>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Contact & Outstanding Due Card */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
              {/* Day / Month / Year Filter within Modal */}
              <div className="bg-zinc-200/80 dark:bg-zinc-800 p-1 rounded-xl grid grid-cols-4 gap-1 text-xs font-semibold">
                <button
                  onClick={() => setModalPeriodFilter('day')}
                  className={`py-1.5 rounded-lg transition-all ${
                    modalPeriodFilter === 'day'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  আজ (দিন)
                </button>
                <button
                  onClick={() => setModalPeriodFilter('month')}
                  className={`py-1.5 rounded-lg transition-all ${
                    modalPeriodFilter === 'month'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  চলতি মাস
                </button>
                <button
                  onClick={() => setModalPeriodFilter('year')}
                  className={`py-1.5 rounded-lg transition-all ${
                    modalPeriodFilter === 'year'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  চলতি বছর
                </button>
                <button
                  onClick={() => setModalPeriodFilter('all')}
                  className={`py-1.5 rounded-lg transition-all ${
                    modalPeriodFilter === 'all'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  সব হিসাব
                </button>
              </div>

              {/* 3 Main Financial Cards: বিল দিলো, টাকা দিলো, পাবো */}
              {(() => {
                const modalStats = getCompanyPeriodStats(
                  selectedCompany.Company_Name,
                  modalPeriodFilter
                );

                return (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-[10px] text-zinc-500 font-bold block">
                        {modalPeriodFilter === 'day'
                          ? 'আজকের মোট বিল'
                          : modalPeriodFilter === 'month'
                          ? 'মাসের মোট বিল'
                          : modalPeriodFilter === 'year'
                          ? 'বছরের মোট বিল'
                          : 'মোট অর্ডার বিল'}
                      </span>
                      <p className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                        ৳ {modalStats.periodBilled.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-zinc-400">{modalStats.periodUnits} কাপ সাপ্লাই</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                        দোকানদার বিল দিলো (Paid)
                      </span>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ৳ {modalStats.periodPaid.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-emerald-600/80">পরিশোধিত টাকা</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-900/60">
                      <span className="text-[10px] text-rose-600 font-bold block">
                        দোকানের কাছে পাবো (Due)
                      </span>
                      <p className="text-base font-black text-rose-600 dark:text-rose-400 mt-0.5">
                        ৳ {selectedCompany.Current_Due.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-zinc-400">বর্তমান বকেয়া</span>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => onOpenPaymentModal(selectedCompany.Company_Name)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Banknote size={14} />
                  <span>বকেয়া বিল আদায় করুন</span>
                </button>

                <button
                  onClick={() => {
                    const comp = selectedCompany;
                    setSelectedCompany(null);
                    onOpenQuickOrder(comp.Company_Name);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 font-bold active:scale-95 transition-all"
                >
                  <PlusCircle size={14} />
                  <span>+ নতুন অর্ডার দিন</span>
                </button>

                <button
                  onClick={() => handleWhatsAppStatement(selectedCompany)}
                  className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold"
                  title="হোয়াটসঅ্যাপে লেজার পাঠান"
                >
                  <MessageSquare size={14} />
                </button>
              </div>
            </div>

            {/* Ledger Transactions Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-emerald-600" />
                  <span>
                    লেজার স্টেটমেন্ট (
                    {modalPeriodFilter === 'day'
                      ? 'আজকের দিন'
                      : modalPeriodFilter === 'month'
                      ? 'চলতি মাস'
                      : modalPeriodFilter === 'year'
                      ? 'চলতি বছর'
                      : 'সব সময়'}
                    )
                  </span>
                </h4>
              </div>

              {(() => {
                const transactions = getCompanyLedgerTransactions(
                  selectedCompany.Company_Name,
                  modalPeriodFilter
                );

                if (transactions.length === 0) {
                  return (
                    <div className="text-center py-8 text-zinc-400">
                      এই নির্বাচিত সময়কালে কোনো লেনদেনের রেকর্ড নেই।
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {transactions.map((tx) => {
                      const isOrder = tx.type === 'Order';
                      const isPayment = tx.type === 'Payment';
                      const isReturn = tx.type === 'Return';

                      return (
                        <div
                          key={tx.id}
                          className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {isOrder && (
                                <span className="p-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                  <ArrowUpRight size={13} />
                                </span>
                              )}
                              {isPayment && (
                                <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  <ArrowDownLeft size={13} />
                                </span>
                              )}
                              {isReturn && (
                                <span className="p-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                  <RotateCcw size={13} />
                                </span>
                              )}

                              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                {isOrder
                                  ? 'পণ্য ডেলিভারি'
                                  : isPayment
                                  ? 'বিল পরিশোধ'
                                  : 'পণ্য ফেরত'}
                                {' • '}
                                <span className="font-mono text-[10px] text-zinc-400">
                                  {tx.id}
                                </span>
                              </span>
                            </div>

                            <span className="text-[11px] text-zinc-400 font-mono">
                              {tx.date} {tx.time || ''}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 pl-6">
                            {tx.description}
                          </p>

                          {/* Staff / Collector name display */}
                          {tx.staffName && (
                            <div className="pl-6 flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-300">
                              <UserCheck size={12} />
                              <span>{isPayment ? 'বকেয়া বিল আদায়কারী:' : 'ডেলিভারি স্টাফ:'}</span>
                              <strong className="font-bold">{tx.staffName}</strong>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[11px] pl-6">
                            <div className="flex gap-3">
                              {tx.debit > 0 && (
                                <span className="text-rose-600 font-semibold">
                                  বিল: +৳{tx.debit.toLocaleString()}
                                </span>
                              )}
                              {tx.credit > 0 && (
                                <span className="text-emerald-600 font-semibold">
                                  জমা/পরিশোধ: -৳{tx.credit.toLocaleString()}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {isOrder && (
                                <button
                                  onClick={() => {
                                    setSelectedCompany(null);
                                    onOpenInvoice(tx.rawObject);
                                  }}
                                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline text-[11px]"
                                >
                                  মেমো প্রিন্ট →
                                </button>
                              )}

                              {isOrder && onDeleteOrder && (
                                <button
                                  onClick={() => {
                                    if (confirm(`আপনি কি অর্ডার #${tx.id} মুছে ফেলতে চান?`)) {
                                      onDeleteOrder(tx.id);
                                    }
                                  }}
                                  className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                                  title="অর্ডার মুছুন"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}

                              {isPayment && onDeletePayment && (
                                <button
                                  onClick={() => {
                                    if (confirm(`আপনি কি এই পেমেন্ট কালেকশন রেকর্ডটি মুছে ফেলতে চান?`)) {
                                      onDeletePayment(tx.id);
                                    }
                                  }}
                                  className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                                  title="পেমেন্ট রেকর্ড মুছুন"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs flex-wrap gap-2">
              <span className="text-zinc-500">
                গ্রাহক ফোন: <strong>{selectedCompany.Phone_Number}</strong>
              </span>

              <div className="flex items-center gap-2">
                {onDeleteCompany && (
                  <button
                    onClick={() => {
                      if (confirm(`সতর্কতা: আপনি কি নিশ্চিত যে "${selectedCompany.Company_Name}" কোম্পানিটি সম্পূর্ণ মুছে ফেলতে চান?`)) {
                        onDeleteCompany(selectedCompany.Company_ID);
                        setSelectedCompany(null);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1 border border-rose-200 dark:border-rose-900"
                  >
                    <Trash2 size={13} />
                    <span>কোম্পানি মুছুন</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedCompany(null)}
                  className="px-4 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold"
                >
                  বন্ধ করুন (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
