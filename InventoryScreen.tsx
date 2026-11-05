import React, { useState } from 'react';
import { InventoryItem, Order, ReturnRecord, Company, UserRole } from '../types';
import {
  Package,
  PlusCircle,
  AlertCircle,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Sparkles,
  CheckCircle,
  ArrowRight,
  X,
  Trash2,
} from 'lucide-react';

interface InventoryScreenProps {
  inventory: InventoryItem[];
  orders: Order[];
  returns: ReturnRecord[];
  companies: Company[];
  role: UserRole;
  onOpenProductionModal: () => void;
  onOpenReturnModal: () => void;
  onOpenAddProduct?: () => void;
  onDeleteProduct?: (itemName: string) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  inventory,
  orders,
  returns,
  companies,
  role,
  onOpenProductionModal,
  onOpenReturnModal,
  onOpenAddProduct,
  onDeleteProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'returns'>('stock');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.Date === todayStr);

  // Calculate today's units dispatched per item
  const todayUnitsDispatchedByItem: { [itemName: string]: number } = {};
  todayOrders.forEach((o) => {
    if (o.Items && o.Items.length > 0) {
      o.Items.forEach((i) => {
        todayUnitsDispatchedByItem[i.Item_Name] =
          (todayUnitsDispatchedByItem[i.Item_Name] || 0) + i.Quantity;
      });
    } else {
      todayUnitsDispatchedByItem[o.Item_Name] =
        (todayUnitsDispatchedByItem[o.Item_Name] || 0) + o.Quantity;
    }
  });

  const totalCurrentStockUnits = inventory.reduce((sum, i) => sum + i.Stock_Qty, 0);
  const totalStockValue = inventory.reduce(
    (sum, i) => sum + i.Stock_Qty * i.Unit_Price,
    0
  );
  const totalDispatchedToday = Object.values(todayUnitsDispatchedByItem).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="space-y-4 pb-20 pt-2 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl p-4 shadow-lg border border-emerald-800">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
              রিয়েল-টাইম ইনভেন্টরি
            </span>
            <h2 className="text-base font-bold flex items-center gap-1.5 mt-0.5">
              <Package size={17} className="text-emerald-400" />
              <span>ডেজার্ট ও পুডিং স্টক (Inventory)</span>
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {onOpenAddProduct && (
              <button
                onClick={onOpenAddProduct}
                className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1"
              >
                <PlusCircle size={13} />
                <span>+ প্রোডাক্ট যোগ</span>
              </button>
            )}
            <button
              onClick={onOpenReturnModal}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>রিটার্ন</span>
            </button>
            <button
              onClick={onOpenProductionModal}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <PlusCircle size={14} />
              <span>+ প্রোডাকশন</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-800/80 text-center">
          <div className="bg-emerald-950/60 rounded-xl p-2">
            <span className="text-[10px] text-emerald-300 uppercase font-semibold">Total in Cold Room</span>
            <p className="text-base font-black text-white">{totalCurrentStockUnits} pcs</p>
          </div>
          <div className="bg-emerald-950/60 rounded-xl p-2">
            <span className="text-[10px] text-teal-300 uppercase font-semibold">Dispatched Today</span>
            <p className="text-base font-black text-teal-200">{totalDispatchedToday} pcs</p>
          </div>
          <div className="bg-emerald-950/60 rounded-xl p-2">
            <span className="text-[10px] text-emerald-300 uppercase font-semibold">Inventory Valuation</span>
            <p className="text-base font-black text-emerald-300">৳ {totalStockValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'stock'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Available Stock ({inventory.length} Desserts)
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'returns'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Returns & Damage Log ({returns.length})
        </button>
      </div>

      {activeTab === 'stock' ? (
        <div className="space-y-2.5">
          {inventory.map((item) => {
            const minAlert = item.Min_Alert_Qty || 30;
            const isLow = item.Stock_Qty <= minAlert;
            const dispatched = todayUnitsDispatchedByItem[item.Item_Name] || 0;

            return (
              <div
                key={item.Item_Name}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLow
                    ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                } shadow-xs flex flex-col gap-2`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {item.Item_Name}
                      </h3>
                      {isLow && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-0.5">
                          <AlertCircle size={10} /> Low
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {item.Unit || 'Cup'} • Unit Rate: <strong>৳{item.Unit_Price}</strong>
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Available</span>
                      <p className={`text-lg font-black ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {item.Stock_Qty}
                      </p>
                    </div>

                    {onDeleteProduct && (
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${item.Item_Name}" প্রোডাক্টটি তালিকা থেকে সম্পূর্ণ ডিলিট করতে চান?`)) {
                            onDeleteProduct(item.Item_Name);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors ml-1"
                        title="প্রোডাক্ট মুছুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Production & Dispatch progress */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                      <TrendingUp size={12} /> Today Dispatched: {dispatched} pcs
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400">
                    Min Alert: {minAlert}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Returns Tab */
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-zinc-500 font-medium">
              Recorded returns automatically credit client ledgers
            </span>
            <button
              onClick={onOpenReturnModal}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              + Log New Return
            </button>
          </div>

          {returns.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400">
              <RotateCcw size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">No returns or damage logs recorded yet.</p>
            </div>
          ) : (
            returns.map((ret) => (
              <div
                key={ret.Return_ID}
                className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1.5 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
                      {ret.Company_Name}
                    </h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5">
                      {ret.Return_Qty}x {ret.Item_Name}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {ret.Date}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold text-[10px]">
                    Reason: {ret.Reason}
                  </span>
                  {ret.Credit_Amount && ret.Credit_Amount > 0 && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Ledger Credited: ৳{ret.Credit_Amount.toLocaleString()}
                    </span>
                  )}
                </div>

                {ret.Notes && (
                  <p className="text-[11px] text-zinc-400 italic">
                    "{ret.Notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
