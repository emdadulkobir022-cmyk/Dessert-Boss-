import React, { useState, useEffect } from 'react';
import {
  Company,
  InventoryItem,
  Order,
  Expense,
  PaymentTransaction,
  UserRole,
} from '../types';
import {
  TrendingUp,
  Banknote,
  AlertCircle,
  Truck,
  PlusCircle,
  PackagePlus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Flame,
  CalendarDays,
  UserPlus,
  Building2,
  WalletCards,
  Trash2,
  Download,
  Smartphone,
} from 'lucide-react';
import { getBangladeshDateTime } from '../utils/timeUtils';

interface HomeDashboardProps {
  companies: Company[];
  inventory: InventoryItem[];
  orders: Order[];
  expenses: Expense[];
  payments: PaymentTransaction[];
  role: UserRole;
  onOpenQuickOrder: (companyName?: string) => void;
  onOpenProductionModal: () => void;
  onOpenPaymentModal: (companyName?: string) => void;
  onOpenInvoice: (order: Order) => void;
  onNavigateTab: (tab: any) => void;
  onUpdateOrderStatus: (orderId: string, status: 'Pending' | 'Delivered') => void;
  onOpenAddEmployee?: () => void;
  onOpenAddCompany?: () => void;
  onOpenAddProduct?: () => void;
  onOpenTodaysCollections?: () => void;
  onOpenAddExpense?: () => void;
  onOpenDataManagement?: () => void;
  onOpenInstallModal?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  companies,
  inventory,
  orders,
  expenses,
  payments,
  role,
  onOpenQuickOrder,
  onOpenProductionModal,
  onOpenPaymentModal,
  onOpenInvoice,
  onNavigateTab,
  onUpdateOrderStatus,
  onOpenAddEmployee,
  onOpenAddCompany,
  onOpenAddProduct,
  onOpenTodaysCollections,
  onOpenAddExpense,
  onOpenDataManagement,
  onOpenInstallModal,
}) => {
  const [bdDateTime, setBdDateTime] = useState(getBangladeshDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setBdDateTime(getBangladeshDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's orders
  const todayOrders = orders.filter((o) => o.Date === todayStr);

  // Computations
  const todaySales = todayOrders.reduce((sum, o) => sum + (o.Total_Bill || 0), 0);
  const todayCollections = payments
    .filter((p) => p.Date === todayStr)
    .reduce((sum, p) => sum + (p.Amount || 0), 0);
  const totalOutstandingDue = companies.reduce((sum, c) => sum + (c.Current_Due || 0), 0);
  const todayExpenses = expenses
    .filter((e) => e.Date === todayStr)
    .reduce((sum, e) => sum + (e.Amount || 0), 0);
  const todayNetProfit = todaySales - todayExpenses;

  // Companies ordered today
  const companiesOrderedToday = new Set(todayOrders.map((o) => o.Company_Name));
  const orderedRatio = Math.round((companiesOrderedToday.size / 24) * 100);

  // Delivery breakdown
  const pendingOrders = todayOrders.filter((o) => o.Status === 'Pending');
  const deliveredOrders = todayOrders.filter((o) => o.Status === 'Delivered');

  // Low stock inventory
  const lowStockItems = inventory.filter(
    (item) => item.Stock_Qty <= (item.Min_Alert_Qty || 30)
  );

  return (
    <div className="space-y-4 pb-20 pt-2 animate-fadeIn">
      {/* Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white p-4.5 shadow-xl border border-emerald-800/60">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800/80 text-[11px] font-semibold text-emerald-200 border border-emerald-700/60">
              <Flame size={13} className="text-amber-400" />
              <span>Dessert Boss Hub</span>
            </div>

            {/* Live Bangladesh Time Widget */}
            <div className="flex items-center gap-2 bg-emerald-950/90 px-3 py-1.5 rounded-xl border border-emerald-700/70 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="font-mono font-black text-xs text-white tracking-wider">
                    {bdDateTime.timeStr}
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-800 text-emerald-200 font-bold">
                    BST
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300 font-medium">
                  {bdDateTime.bengaliDateStr}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-emerald-300/90 font-medium">Today's Total Sales</p>
              <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
                ৳ {todaySales.toLocaleString()}
              </h2>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                {todayOrders.length} orders placed
              </p>
            </div>
            <div className="border-l border-emerald-800/60 pl-3">
              <p className="text-xs text-teal-300/90 font-medium">Total Collection</p>
              <h2 className="text-2xl font-black text-teal-200 tracking-tight mt-0.5">
                ৳ {todayCollections.toLocaleString()}
              </h2>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                Cash & digital received
              </p>
            </div>
          </div>

          {/* Corporate Coverage Bar */}
          <div className="bg-emerald-950/60 rounded-xl p-2.5 border border-emerald-800/40">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-emerald-200 font-medium flex items-center gap-1">
                <Truck size={13} className="text-emerald-400" />
                Distribution Coverage: {companiesOrderedToday.size} / 24 Companies
              </span>
              <span className="font-bold text-emerald-300">{orderedRatio}%</span>
            </div>
            <div className="w-full bg-emerald-950 rounded-full h-2 overflow-hidden border border-emerald-800">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(5, orderedRatio))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Install App on Phone Banner */}
      {onOpenInstallModal && (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-2xl p-3 text-white shadow-md border border-emerald-700/60 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20 shrink-0">
              <img src="/pwa-192x192.png" alt="Dessert Boss" className="w-8 h-8 rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-xs text-white">ফোনের স্ক্রিনে অ্যাপ নিন</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-emerald-100 font-bold">
                  📲 ১-ক্লিকে ইনস্টল
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                প্লে-স্টোর ছাড়াই আপনার ফোনের স্ক্রিনে অ্যাপ আইকন তৈরি করুন
              </p>
            </div>
          </div>
          <button
            onClick={onOpenInstallModal}
            className="px-3 py-2 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-emerald-50 active:scale-95 transition-all shadow-sm shrink-0 flex items-center gap-1"
          >
            <Download size={13} className="text-emerald-800" />
            <span>নিয়ম দেখুন</span>
          </button>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Outstanding Due */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-medium">Total Ledger Due</span>
            <AlertCircle size={15} className="text-rose-500" />
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            ৳ {totalOutstandingDue.toLocaleString()}
          </p>
          <button
            onClick={() => onNavigateTab('ledger')}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-1 flex items-center gap-0.5"
          >
            Across 24 Clients <ChevronRight size={12} />
          </button>
        </div>

        {/* Today's Due Added */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-medium">Today's Unpaid Due</span>
            <TrendingUp size={15} className="text-amber-500" />
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            ৳{' '}
            {todayOrders
              .reduce((sum, o) => sum + (o.Due_Amount || 0), 0)
              .toLocaleString()}
          </p>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {todayOrders.filter((o) => o.Due_Amount > 0).length} client bills on credit
          </span>
        </div>

        {/* Delivery Status */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-medium">Dispatches</span>
            <Truck size={15} className="text-teal-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {deliveredOrders.length} Delivered
            </span>
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {pendingOrders.length} pending in route
          </span>
        </div>

        {/* Admin Financial Insight OR Staff Operations Insight */}
        {role === 'admin' ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-amber-200 dark:border-amber-950/60 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                👑 Net Daily P&L
              </span>
              <Banknote size={15} className="text-amber-600" />
            </div>
            <p
              className={`text-lg font-black ${todayNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
            >
              ৳ {todayNetProfit.toLocaleString()}
            </p>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Costs: ৳{todayExpenses.toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
              <span className="text-xs font-medium">Available Pudding</span>
              <PackagePlus size={15} className="text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {inventory.reduce((sum, i) => sum + i.Stock_Qty, 0)} Units
            </p>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Ready for dispatch
            </span>
          </div>
        )}
      </div>

      {/* Quick Setup Card if No Companies Yet */}
      {companies.length === 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-lg border border-emerald-700/60 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                নতুন সেটআপ গাইড (Quick Start)
              </span>
              <h3 className="font-bold text-sm mt-1">
                আপনার নিজস্ব ডেটা যোগ করে শুরু করুন
              </h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                পূর্বের ডামি ডেটা মুছে ফেলা হয়েছে। নিচের ধাপগুলো অনুসরণ করে আপনার টিম ও ক্লায়েন্ট তৈরি করুন:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {onOpenAddEmployee && (
              <button
                onClick={onOpenAddEmployee}
                className="p-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-left border border-emerald-600/60 transition-all flex items-center gap-2.5 active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <UserPlus size={16} />
                </div>
                <div>
                  <span className="font-bold text-white block">১. এমপ্লয়ী যোগ করুন</span>
                  <span className="text-[10px] text-emerald-300">ডেলিভারি রাইডার / স্টাফ</span>
                </div>
              </button>
            )}

            {onOpenAddCompany && (
              <button
                onClick={onOpenAddCompany}
                className="p-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-left border border-emerald-600/60 transition-all flex items-center gap-2.5 active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <Building2 size={16} />
                </div>
                <div>
                  <span className="font-bold text-white block">২. কোম্পানি / দোকান</span>
                  <span className="text-[10px] text-emerald-300">যেখানে পুডিং সাপ্লাই দিবেন</span>
                </div>
              </button>
            )}

            {onOpenAddProduct && (
              <button
                onClick={onOpenAddProduct}
                className="p-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-left border border-emerald-600/60 transition-all flex items-center gap-2.5 active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <PackagePlus size={16} />
                </div>
                <div>
                  <span className="font-bold text-white block">৩. প্রোডাক্ট / ফালুদা</span>
                  <span className="text-[10px] text-emerald-300">দাম ও স্টক সেট করুন</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="bg-zinc-100/80 dark:bg-zinc-900/80 p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-1">
          কুইক অ্যাকশন (Quick Actions)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onOpenQuickOrder()}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-all active:scale-95"
          >
            <PlusCircle size={18} className="mb-1" />
            <span>+ New Order</span>
          </button>

          <button
            onClick={() => {
              if (onOpenAddExpense) {
                onOpenAddExpense();
              } else {
                onNavigateTab('expenses');
              }
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold text-xs border border-rose-200 dark:border-rose-800/60 shadow-sm transition-all active:scale-95"
          >
            <WalletCards size={18} className="mb-1 text-rose-600 dark:text-rose-400" />
            <span>+ খরচ ও কেনাকাটা</span>
          </button>

          <button
            onClick={() => onOpenPaymentModal()}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-medium text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all active:scale-95"
          >
            <Banknote size={18} className="mb-1 text-amber-600 dark:text-amber-400" />
            <span>বকেয়া কালেকশন</span>
          </button>

          {onOpenAddCompany && (
            <button
              onClick={onOpenAddCompany}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-medium text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all active:scale-95"
            >
              <Building2 size={18} className="mb-1 text-emerald-600 dark:text-emerald-400" />
              <span>+ ক্লায়েন্ট/দোকান</span>
            </button>
          )}

          {onOpenAddEmployee && (
            <button
              onClick={onOpenAddEmployee}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-medium text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all active:scale-95"
            >
              <UserPlus size={18} className="mb-1 text-teal-600 dark:text-teal-400" />
              <span>+ এমপ্লয়ী</span>
            </button>
          )}

          <button
            onClick={onOpenProductionModal}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-medium text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all active:scale-95"
          >
            <PackagePlus size={18} className="mb-1 text-emerald-600 dark:text-emerald-400" />
            <span>+ প্রোডাকশন</span>
          </button>

          {onOpenAddProduct && (
            <button
              onClick={onOpenAddProduct}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-medium text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all active:scale-95"
            >
              <PlusCircle size={18} className="mb-1 text-blue-600 dark:text-blue-400" />
              <span>+ নতুন প্রোডাক্ট</span>
            </button>
          )}

          {onOpenDataManagement && (
            <button
              onClick={onOpenDataManagement}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-medium text-xs border border-rose-200 dark:border-rose-800/60 shadow-sm transition-all active:scale-95"
            >
              <Trash2 size={18} className="mb-1 text-rose-600 dark:text-rose-400" />
              <span>ডেটা মুছুন</span>
            </button>
          )}

        </div>
      </div>

      {/* Low Stock Warning (if any) */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold mb-1">
            <AlertCircle size={15} />
            <span>Low Stock Alert ({lowStockItems.length} items)</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {lowStockItems.map((item) => (
              <span
                key={item.Item_Name}
                className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[11px] font-medium border border-amber-300 dark:border-amber-700"
              >
                {item.Item_Name}: <strong>{item.Stock_Qty}</strong> left (Alert at {item.Min_Alert_Qty})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* আজকের বিল আদায় (Today's Bill Collections) Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Banknote size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                আজকের বিল আদায় (Today's Collections)
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                আজকে কে কত টাকা বিল দিলো ও আদায়কারী
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTodaysCollections && (
              <button
                onClick={onOpenTodaysCollections}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center hover:underline"
              >
                সব কালেকশন <ChevronRight size={14} />
              </button>
            )}
            <button
              onClick={() => onOpenPaymentModal()}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all"
            >
              + বিল আদায়
            </button>
          </div>
        </div>

        {/* Collections Summary Mini-Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-medium">আজকের মোট সংগ্রহ</span>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
              ৳ {todayCollections.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
              {payments.filter((p) => p.Date === todayStr).length} টি বিল আদায় হয়েছে
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-medium">দোকানদের কাছে বাকি</span>
            <p className="text-base font-black text-rose-600 dark:text-rose-400">
              ৳ {totalOutstandingDue.toLocaleString()}
            </p>
            <span className="text-[10px] text-zinc-400">সব ক্লায়েন্ট মিলিয়ে</span>
          </div>
        </div>

        {/* Today's Payments List */}
        {(() => {
          const todaysPayments = payments.filter((p) => p.Date === todayStr);

          if (todaysPayments.length === 0) {
            return (
              <div className="text-center py-4 text-zinc-400 dark:text-zinc-600 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                <p className="text-xs">আজকে এখনও কোনো বকেয়া বিল আদায় রেকর্ড করা হয়নি।</p>
                <button
                  onClick={() => onOpenPaymentModal()}
                  className="mt-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  + প্রথম বিল আদায় যোগ করুন
                </button>
              </div>
            );
          }

          return (
            <div className="space-y-2">
              {todaysPayments.slice(0, 3).map((p) => (
                <div
                  key={p.Payment_ID}
                  className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block truncate">
                      {p.Company_Name}
                    </span>
                    <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                      আদায়কারী: <strong>{p.Received_By || 'স্টাফ'}</strong> ({p.Payment_Method})
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 block">
                      + ৳ {p.Amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-400">বিল আদায়</span>
                  </div>
                </div>
              ))}

              {todaysPayments.length > 3 && onOpenTodaysCollections && (
                <button
                  onClick={onOpenTodaysCollections}
                  className="w-full py-1 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  আরও {todaysPayments.length - 3} টি আদায় রেকর্ড দেখুন →
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* আজকের খরচ ও কেনাকাটা (Today's Purchases & Expenses) Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <WalletCards size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                আজকের খরচ ও কেনাকাটা (Today's Purchases)
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                ডাব, দুধ, চিনি, কাপ-বক্স ও বাজারের খরচের হিসাব
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center hover:underline"
            >
              সব খরচ <ChevronRight size={14} />
            </button>
            <button
              onClick={() => {
                if (onOpenAddExpense) {
                  onOpenAddExpense();
                } else {
                  onNavigateTab('expenses');
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all"
            >
              + খরচ লিখুন
            </button>
          </div>
        </div>

        {/* Expenses Summary Mini-Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-medium">আজকের মোট খরচ / বাজার</span>
            <p className="text-base font-black text-rose-600 dark:text-rose-400">
              ৳ {todayExpenses.toLocaleString()}
            </p>
            <span className="text-[10px] text-rose-700 dark:text-rose-300">
              {expenses.filter((e) => e.Date === todayStr).length} টি খরচের ভাউচার
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-medium">আজকের নিট ক্যাশ উদ্বৃত্ত</span>
            <p className={`text-base font-black ${todayCollections - todayExpenses >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
              ৳ {(todayCollections - todayExpenses).toLocaleString()}
            </p>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">কালেকশন - খরচ</span>
          </div>
        </div>

        {/* Today's Expenses List */}
        {(() => {
          const todaysExpenses = expenses.filter((e) => e.Date === todayStr);

          if (todaysExpenses.length === 0) {
            return (
              <div className="text-center py-4 text-zinc-400 dark:text-zinc-600 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                <p className="text-xs">আজকে এখনও কোনো খরচ বা কেনাকাটার হিসাব লেখা হয়নি।</p>
                <button
                  onClick={() => {
                    if (onOpenAddExpense) {
                      onOpenAddExpense();
                    } else {
                      onNavigateTab('expenses');
                    }
                  }}
                  className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  + আজকের প্রথম খরচ / কেনাকাটা লিখুন
                </button>
              </div>
            );
          }

          return (
            <div className="space-y-2">
              {todaysExpenses.slice(0, 3).map((exp) => (
                <div
                  key={exp.Expense_ID}
                  className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                        {exp.Expense_Type}
                      </span>
                      {exp.Paid_By && (
                        <span className="text-[10px] text-zinc-500">
                          {exp.Paid_By}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-800 dark:text-zinc-200 font-medium block truncate mt-0.5">
                      {exp.Note}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs text-rose-600 dark:text-rose-400 block">
                      - ৳ {exp.Amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-400">{exp.Payment_Method || 'ক্যাশ'}</span>
                  </div>
                </div>
              ))}

              {todaysExpenses.length > 3 && (
                <button
                  onClick={() => onNavigateTab('expenses')}
                  className="w-full py-1 text-center text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  আরও {todaysExpenses.length - 3} টি খরচের এন্ট্রি দেখুন →
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Today's Orders / Dispatch Activity */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Today's Dispatches ({todayOrders.length})
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Tap status to mark delivered or view thermal invoice
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('today-orders')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center hover:underline"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {todayOrders.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 dark:text-zinc-600">
            <Truck size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">No orders placed today yet.</p>
            <button
              onClick={() => onOpenQuickOrder()}
              className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              + Create First Order Today
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayOrders.map((order) => {
              const isDelivered = order.Status === 'Delivered';
              return (
                <div
                  key={order.Order_ID}
                  className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {order.Company_Name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {order.Order_ID}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5 line-clamp-1">
                        {order.Items && order.Items.length > 0
                          ? order.Items.map((i) => `${i.Quantity}x ${i.Item_Name}`).join(', ')
                          : `${order.Quantity}x ${order.Item_Name}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        ৳ {order.Total_Bill.toLocaleString()}
                      </p>
                      {order.Due_Amount > 0 ? (
                        <span className="text-[10px] font-semibold text-rose-500 block">
                          Due: ৳{order.Due_Amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                          Paid in Full
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-700/50 text-[11px]">
                    <div className="flex items-center gap-2">
                      {/* Status Toggle Button */}
                      <button
                        onClick={() =>
                          onUpdateOrderStatus(
                            order.Order_ID,
                            isDelivered ? 'Pending' : 'Delivered'
                          )
                        }
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium transition-all ${
                          isDelivered
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {isDelivered ? (
                          <>
                            <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Delivered</span>
                          </>
                        ) : (
                          <>
                            <Clock size={11} className="text-amber-600 dark:text-amber-400" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-zinc-400">
                        {order.Time || '09:00'}
                      </span>
                    </div>

                    {/* Invoice & Memo trigger */}
                    <button
                      onClick={() => onOpenInvoice(order)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-200/80 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 font-semibold text-zinc-700 dark:text-zinc-200 transition-colors"
                      title="Print or share invoice"
                    >
                      <Printer size={12} />
                      <span>Invoice / Memo</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
