import React, { useState } from 'react';
import { Expense, Order, UserRole, Employee } from '../types';
import {
  WalletCards,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Calendar,
  Trash2,
  Lock,
  Tag,
  Search,
  Filter,
  CreditCard,
  User,
  FileSpreadsheet,
  CalendarDays,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { AddExpenseModal, EXPENSE_CATEGORIES } from './AddExpenseModal';

export type ExpensePeriodFilter =
  | 'day'
  | 'month'
  | 'year'
  | 'all'
  | 'exact-date'
  | 'exact-month'
  | 'exact-year';

interface ExpensesScreenProps {
  expenses: Expense[];
  orders: Order[];
  role: UserRole;
  employees?: Employee[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onSwitchToAdmin: () => void;
  onOpenAddExpenseModal?: () => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  expenses,
  orders,
  role,
  employees = [],
  onAddExpense,
  onDeleteExpense,
  onSwitchToAdmin,
  onOpenAddExpenseModal,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<ExpensePeriodFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM
  const currentYearStr = todayStr.slice(0, 4); // YYYY

  const [selectedExactDate, setSelectedExactDate] = useState<string>(todayStr);
  const [selectedExactMonth, setSelectedExactMonth] = useState<string>(currentMonthStr);
  const [selectedExactYear, setSelectedExactYear] = useState<string>(currentYearStr);

  // Filter helper by period
  const isDateInPeriod = (dateStr: string, period: ExpensePeriodFilter) => {
    if (!dateStr) return false;
    if (period === 'day') return dateStr === todayStr;
    if (period === 'month') return dateStr.startsWith(currentMonthStr);
    if (period === 'year') return dateStr.startsWith(currentYearStr);
    if (period === 'exact-date') return dateStr === selectedExactDate;
    if (period === 'exact-month') return dateStr.startsWith(selectedExactMonth);
    if (period === 'exact-year') return dateStr.startsWith(selectedExactYear);
    return true;
  };

  // Filter expenses by period, category, and search
  const filteredExpenses = expenses.filter((e) => {
    const matchesPeriod = isDateInPeriod(e.Date, periodFilter);
    const matchesCat = selectedCategory === 'all' || e.Expense_Type === selectedCategory;
    const matchesSearch =
      search === '' ||
      e.Note.toLowerCase().includes(search.toLowerCase()) ||
      e.Expense_Type.toLowerCase().includes(search.toLowerCase()) ||
      (e.Paid_By && e.Paid_By.toLowerCase().includes(search.toLowerCase())) ||
      (e.Voucher_No && e.Voucher_No.toLowerCase().includes(search.toLowerCase()));

    return matchesPeriod && matchesCat && matchesSearch;
  });

  // Financial calculations for chosen period
  const periodFilteredOrders = orders.filter((o) => isDateInPeriod(o.Date, periodFilter));
  const periodSales = periodFilteredOrders.reduce((sum, o) => sum + (o.Total_Bill || 0), 0);
  const periodExpenses = filteredExpenses.reduce((sum, e) => sum + (e.Amount || 0), 0);
  const periodNetProfit = periodSales - periodExpenses;

  // Overall Today Stats
  const todayExpensesTotal = expenses
    .filter((e) => e.Date === todayStr)
    .reduce((sum, e) => sum + (e.Amount || 0), 0);

  const todayOrders = orders.filter((o) => o.Date === todayStr);
  const todaySales = todayOrders.reduce((sum, o) => sum + (o.Total_Bill || 0), 0);
  const todayNetProfit = todaySales - todayExpensesTotal;

  // Category breakdown for filtered period
  const categorySummary = EXPENSE_CATEGORIES.map((cat) => {
    const catTotal = filteredExpenses
      .filter((e) => e.Expense_Type === cat.id)
      .reduce((sum, e) => sum + (e.Amount || 0), 0);
    return {
      ...cat,
      total: catTotal,
      count: filteredExpenses.filter((e) => e.Expense_Type === cat.id).length,
    };
  }).filter((c) => c.total > 0);

  const getCategoryIcon = (type: string) => {
    const found = EXPENSE_CATEGORIES.find((c) => c.id === type);
    return found ? found.icon : '📝';
  };

  const getCategoryLabel = (type: string) => {
    const found = EXPENSE_CATEGORIES.find((c) => c.id === type);
    return found ? found.label : type;
  };

  const openAddForm = () => {
    if (onOpenAddExpenseModal) {
      onOpenAddExpenseModal();
    } else {
      setIsAddOpen(true);
    }
  };

  return (
    <div className="space-y-4 pb-20 pt-2 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-emerald-950 to-zinc-950 text-white rounded-2xl p-4 shadow-lg border border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                Google Sheets: Expenses Tab
              </span>
            </div>
            <h2 className="text-base font-bold flex items-center gap-1.5 mt-1 text-white">
              <WalletCards size={18} className="text-emerald-400" />
              <span>খরচ ও কাঁচামাল কেনাকাটা (Expenses)</span>
            </h2>
            <p className="text-[11px] text-emerald-300/90 mt-0.5">
              ডাব, দুধ, চিনি, ফালুদা সামগ্রী, কাপ-বক্স ও পরিবহন খরচ
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle size={15} />
            <span>+ খরচ লিখুন</span>
          </button>
        </div>

        {/* Period Filter Buttons: দিন, মাস, বছর, সব সময়, নির্দিষ্ট তারিখ, নির্দিষ্ট মাস, নির্দিষ্ট বছর */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 mb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setPeriodFilter('day')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
              periodFilter === 'day'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            আজকে
          </button>
          <button
            onClick={() => setPeriodFilter('month')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
              periodFilter === 'month'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            চলতি মাস
          </button>
          <button
            onClick={() => setPeriodFilter('year')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
              periodFilter === 'year'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            চলতি বছর
          </button>
          <button
            onClick={() => setPeriodFilter('all')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
              periodFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            সব সময়
          </button>
          <button
            onClick={() => setPeriodFilter('exact-date')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
              periodFilter === 'exact-date'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            📅 নির্দিষ্ট তারিখ
          </button>
          <button
            onClick={() => setPeriodFilter('exact-month')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
              periodFilter === 'exact-month'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            📆 নির্দিষ্ট মাস
          </button>
          <button
            onClick={() => setPeriodFilter('exact-year')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center shrink-0 ${
              periodFilter === 'exact-year'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🗓️ বছর বাই বছর
          </button>
        </div>

        {/* Sub-picker controls for Expenses */}
        {periodFilter === 'exact-date' && (
          <div className="mb-3 p-2.5 rounded-xl bg-zinc-900 border border-emerald-800/80 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-emerald-300">
              নির্দিষ্ট তারিখ বেছে নিন (Date Picker):
            </span>
            <input
              type="date"
              value={selectedExactDate}
              onChange={(e) => setSelectedExactDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-bold text-white"
            />
          </div>
        )}

        {periodFilter === 'exact-month' && (
          <div className="mb-3 p-2.5 rounded-xl bg-zinc-900 border border-emerald-800/80 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-emerald-300">
              নির্দিষ্ট মাস বেছে নিন (Month Picker):
            </span>
            <input
              type="month"
              value={selectedExactMonth}
              onChange={(e) => setSelectedExactMonth(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-bold text-white"
            />
          </div>
        )}

        {periodFilter === 'exact-year' && (
          <div className="mb-3 p-2.5 rounded-xl bg-zinc-900 border border-emerald-800/80 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-emerald-300">
              নির্দিষ্ট বছর নির্বাচন করুন (Year Selection):
            </span>
            <select
              value={selectedExactYear}
              onChange={(e) => setSelectedExactYear(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-bold text-white"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y.toString()}>
                  {y} সাল
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Financial P&L Insight (Admin vs Staff) */}
        {role === 'admin' ? (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center">
            <div className="bg-zinc-900/80 rounded-xl p-2 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                {periodFilter === 'day' ? "Today's Sales" : 'Period Sales'}
              </span>
              <p className="text-sm font-black text-white">৳ {periodSales.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-900/80 rounded-xl p-2 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                {periodFilter === 'day' ? "Today's Costs" : 'Period Costs'}
              </span>
              <p className="text-sm font-black text-rose-300">৳ {periodExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-950/80 rounded-xl p-2 border border-emerald-800">
              <span className="text-[10px] text-emerald-300 uppercase font-bold">
                নিট লাভ (Profit)
              </span>
              <p
                className={`text-sm font-black ${
                  periodNetProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'
                }`}
              >
                ৳ {periodNetProfit.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-center">
            <div className="bg-zinc-900/80 rounded-xl p-2 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                ফিল্টার করা মোট খরচ
              </span>
              <p className="text-base font-black text-rose-300">
                ৳ {periodExpenses.toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-900/80 rounded-xl p-2 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                আজকের মোট খরচ
              </span>
              <p className="text-base font-black text-white">
                ৳ {todayExpensesTotal.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Category Spending Breakdown Pill Slider */}
      {categorySummary.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              খাতভিত্তিক খরচের সারসংক্ষেপ ({categorySummary.length})
            </span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              মোট: ৳{periodExpenses.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categorySummary.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)
                }
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-left border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{cat.icon}</span>
                  <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                    {cat.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 mt-1">
                  <span className="text-[10px] text-zinc-500">{cat.count} টি ভাউচার</span>
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                    ৳ {cat.total.toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="খরচের বিবরণ, আইটেম বা ব্যক্তির নাম দিয়ে খুঁজুন..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">সব খাত</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Ledger List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-xs text-zinc-700 dark:text-zinc-300">
            খরচের তালিকা ({filteredExpenses.length} টি রেকর্ড)
          </h3>
          <span className="text-xs text-zinc-500 font-semibold">
            সাব-টোটাল: ৳ {periodExpenses.toLocaleString()}
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6 space-y-2">
            <WalletCards size={36} className="mx-auto text-zinc-300 dark:text-zinc-600" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              এই ফিল্টারে কোনো খরচের রেকর্ড পাওয়া যায়নি।
            </p>
            <button
              onClick={openAddForm}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle size={14} />
              <span>+ নতুন খরচ বা কেনাকাটা লিখুন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((expense) => {
              const icon = getCategoryIcon(expense.Expense_Type);
              const label = getCategoryLabel(expense.Expense_Type);

              return (
                <div
                  key={expense.Expense_ID}
                  className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-base shrink-0 select-none">
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {label}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {expense.Date}
                        </span>
                        {expense.Voucher_No && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                            #{expense.Voucher_No}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 font-medium">
                        {expense.Note}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] text-zinc-500 dark:text-zinc-400">
                        {expense.Paid_By && (
                          <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full font-medium text-zinc-700 dark:text-zinc-300">
                            <User size={10} className="text-emerald-600" />
                            {expense.Paid_By}
                          </span>
                        )}
                        {expense.Payment_Method && (
                          <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full font-medium text-zinc-700 dark:text-zinc-300">
                            <CreditCard size={10} className="text-blue-500" />
                            {expense.Payment_Method}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2 shrink-0">
                    <div>
                      <span className="font-black text-rose-600 dark:text-rose-400 text-sm block">
                        - ৳ {expense.Amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">ব্যয়</span>
                    </div>

                    {(role === 'admin' || true) && (
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${expense.Note}" খরচের রেকর্ডটি মুছে ফেলতে চান?`)) {
                            onDeleteExpense(expense.Expense_ID);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors ml-1"
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Internal Modal Fallback if not using Global App Modal */}
      <AddExpenseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSaveExpense={onAddExpense}
        employees={employees}
      />
    </div>
  );
};
