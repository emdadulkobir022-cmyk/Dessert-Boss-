import React, { useState, useEffect } from 'react';
import { Company, InventoryItem, Order, OrderItem, Employee } from '../types';
import { X, Plus, Minus, ShoppingBag, Check, Calculator, AlertCircle, Building2 } from 'lucide-react';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  inventory: InventoryItem[];
  employees?: Employee[];
  preselectedCompany?: string;
  onSaveOrder: (newOrder: Order) => void;
  onOrderSavedOpenInvoice?: (order: Order) => void;
  onOpenAddCompany?: () => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  companies,
  inventory,
  employees = [],
  preselectedCompany,
  onSaveOrder,
  onOrderSavedOpenInvoice,
  onOpenAddCompany,
}) => {
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  const [companySearch, setCompanySearch] = useState('');
  const [orderItems, setOrderItems] = useState<Record<string, number>>({});
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Credit'>('Cash');
  const [status, setStatus] = useState<'Pending' | 'Delivered'>('Delivered');
  const [deliveredBy, setDeliveredBy] = useState('');
  const [notes, setNotes] = useState('');
  const [orderTime, setOrderTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );

  useEffect(() => {
    if (isOpen) {
      if (preselectedCompany) {
        setSelectedCompanyName(preselectedCompany);
      } else if (companies.length > 0 && !selectedCompanyName) {
        setSelectedCompanyName(companies[0].Company_Name);
      }
      // Initialize default with 20 cups of Green Coconut Pudding
      const greenCoconut = inventory.find((i) => i.Item_Name.includes('Green Coconut'));
      if (greenCoconut) {
        setOrderItems({ [greenCoconut.Item_Name]: 20 });
      } else if (inventory.length > 0) {
        setOrderItems({ [inventory[0].Item_Name]: 10 });
      }
      setPaidAmount(0);
      setPaymentMethod('Cash');
      setStatus('Delivered');
      setNotes('');
    }
  }, [isOpen, preselectedCompany, companies, inventory]);

  if (!isOpen) return null;

  const currentCompany = companies.find((c) => c.Company_Name === selectedCompanyName);
  const previousDue = currentCompany ? currentCompany.Current_Due : 0;

  // Calculate bill
  let totalBill = 0;
  let totalQuantity = 0;
  const detailedItems: OrderItem[] = [];

  Object.entries(orderItems).forEach(([name, qty]: [string, number]) => {
    if (qty > 0) {
      const invItem = inventory.find((i) => i.Item_Name === name);
      const unitPrice = invItem ? invItem.Unit_Price : 120;
      const total = qty * unitPrice;
      totalBill += total;
      totalQuantity += qty;
      detailedItems.push({
        Item_Name: name,
        Quantity: qty,
        Unit_Price: unitPrice,
        Total: total,
      });
    }
  });

  const dueAmount = Math.max(0, totalBill - paidAmount);
  const totalPayableWithPrevious = totalBill + previousDue;
  const remainingDueWithPrevious = totalPayableWithPrevious - paidAmount;

  const handleItemQtyChange = (name: string, delta: number) => {
    setOrderItems((prev: Record<string, number>) => {
      const current = prev[name] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [name]: next };
    });
  };

  const handleSetExactQty = (name: string, val: string) => {
    const num = parseInt(val, 10);
    setOrderItems((prev: Record<string, number>) => ({
      ...prev,
      [name]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyName) {
      alert('Please select a company.');
      return;
    }
    if (detailedItems.length === 0 || totalQuantity === 0) {
      alert('Please add at least 1 dessert item with quantity greater than 0.');
      return;
    }

    const orderId = `ORD-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];

    const newOrder: Order = {
      Order_ID: orderId,
      Date: today,
      Time: orderTime,
      Company_Name: selectedCompanyName,
      Item_Name: detailedItems.map((i) => `${i.Quantity}x ${i.Item_Name}`).join(', '),
      Items: detailedItems,
      Quantity: totalQuantity,
      Total_Bill: totalBill,
      Paid_Amount: paidAmount,
      Due_Amount: dueAmount,
      Status: status,
      Payment_Method: paymentMethod,
      Delivered_By: deliveredBy || undefined,
      Notes: notes || undefined,
    };

    onSaveOrder(newOrder);
    onClose();

    if (onOrderSavedOpenInvoice) {
      onOrderSavedOpenInvoice(newOrder);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <ShoppingBag size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">নতুন অর্ডার তৈরি (Quick Order)</h2>
              <p className="text-[11px] text-emerald-200">
                Auto-bills customer & updates stock instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-3.5 text-xs flex-1">
          {/* Company Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-200">
                কোম্পানি বা আউটলেট নির্বাচন করুন (Select Client) *
              </label>
              {onOpenAddCompany && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddCompany();
                  }}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus size={11} />
                  <span>নতুন কোম্পানি যোগ</span>
                </button>
              )}
            </div>

            {companies.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs space-y-1.5">
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  ⚠️ আপনার কোনো কোম্পানি বা ক্লায়েন্ট নেই!
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 text-[11px]">
                  অর্ডার তৈরি করার পূর্বে অন্তত একটি ক্লায়েন্ট বা সুপারশপ যোগ করুন।
                </p>
                {onOpenAddCompany && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddCompany();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    + নতুন কোম্পানি যোগ করুন
                  </button>
                )}
              </div>
            ) : (
              <select
                value={selectedCompanyName}
                onChange={(e) => setSelectedCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {companies.map((c) => (
                  <option key={c.Company_ID} value={c.Company_Name}>
                    {c.Company_Name} {c.Current_Due > 0 ? `(Due: ৳${c.Current_Due.toLocaleString()})` : '(No Due)'}
                  </option>
                ))}
              </select>
            )}

            {/* Current Due Warning */}
            {currentCompany && (
              <div className="mt-1.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Previous Outstanding:</span>{' '}
                  <span className={`font-bold ${currentCompany.Current_Due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    ৳ {currentCompany.Current_Due.toLocaleString()}
                  </span>
                </div>
                <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[180px]">
                  {currentCompany.Address}
                </span>
              </div>
            )}
          </div>

          {/* Dessert Selection with Counters */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-200">
                Pudding & Desserts Ordered *
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {totalQuantity} Units Selected
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {inventory.map((item) => {
                const qty = orderItems[item.Item_Name] || 0;
                const isOutOfStock = item.Stock_Qty <= 0;

                return (
                  <div
                    key={item.Item_Name}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      qty > 0
                        ? 'border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.Item_Name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          ৳{item.Unit_Price}
                        </span>
                        <span>•</span>
                        <span>Stock: {item.Stock_Qty} left</span>
                        {qty > 0 && (
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            = ৳{(qty * item.Unit_Price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(item.Item_Name, -10)}
                        className="px-1.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 font-mono text-[10px]"
                        title="Minus 10"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(item.Item_Name, -1)}
                        className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center justify-center font-bold"
                      >
                        <Minus size={13} />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={qty === 0 ? '' : qty}
                        placeholder="0"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/^0+(?=\d)/, '');
                          handleSetExactQty(item.Item_Name, clean);
                        }}
                        className="w-12 h-7 text-center font-bold text-xs rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                      />

                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(item.Item_Name, 1)}
                        className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold"
                      >
                        <Plus size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(item.Item_Name, 10)}
                        className="px-1.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 font-mono text-[10px]"
                        title="Plus 10"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Automatic Calculation Summary Box */}
          <div className="bg-emerald-950 text-white p-3.5 rounded-xl space-y-1.5 shadow-inner">
            <div className="flex justify-between items-center text-xs text-emerald-200">
              <span>Order Subtotal ({totalQuantity} units):</span>
              <span className="font-bold text-white text-sm">৳ {totalBill.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-emerald-300/80">
              <span>Previous Balance Due:</span>
              <span className="font-semibold text-rose-300">+ ৳ {previousDue.toLocaleString()}</span>
            </div>
            <div className="border-t border-emerald-800/80 pt-1.5 flex justify-between items-center font-bold text-xs">
              <span className="text-amber-300">Total Outstanding Payable:</span>
              <span className="text-amber-300 text-sm">৳ {totalPayableWithPrevious.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-200 mb-1">
                Amount Paid Today (৳)
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="0"
                  value={paidAmount === 0 ? '' : paidAmount}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/^0+(?=\d)/, '');
                    setPaidAmount(clean === '' ? 0 : Number(clean));
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setPaidAmount(totalBill)}
                  className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] whitespace-nowrap"
                >
                  Full Paid
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-200 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs"
              >
                <option value="Cash">Cash on Delivery</option>
                <option value="bKash">bKash Merchant</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank Transfer">Bank Transfer / EFT</option>
                <option value="Credit">Credit (Pay Later)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-200 mb-1">
                Delivery Status
              </label>
              <div className="flex gap-2">
                <label className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border cursor-pointer font-medium text-xs transition-colors ${
                  status === 'Delivered'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="orderStatus"
                    value="Delivered"
                    checked={status === 'Delivered'}
                    onChange={() => setStatus('Delivered')}
                    className="sr-only"
                  />
                  <span>✓ Delivered</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border cursor-pointer font-medium text-xs transition-colors ${
                  status === 'Pending'
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-bold'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="orderStatus"
                    value="Pending"
                    checked={status === 'Pending'}
                    onChange={() => setStatus('Pending')}
                    className="sr-only"
                  />
                  <span>⏳ Pending</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-200 mb-1">
                Dispatch Time
              </label>
              <input
                type="time"
                value={orderTime}
                onChange={(e) => setOrderTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>
          </div>

          {/* Delivered By Rider */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-200 mb-1">
              ডেলিভারি রাইডার / দায়িত্বপ্রাপ্ত এমপ্লয়ী (Delivered By)
            </label>
            <select
              value={deliveredBy}
              onChange={(e) => setDeliveredBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
            >
              <option value="">নির্বাচন করুন (Select Rider)</option>
              {employees.map((emp) => (
                <option key={emp.Employee_ID} value={emp.Name}>
                  {emp.Name} ({emp.Role} - {emp.Assigned_Zone})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-200 mb-1">
              Delivery Note / Special Instructions (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deliver to 4th floor pantry, refrigerated van #1"
              className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div className="text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400">New Running Due:</span>{' '}
            <span className="font-bold text-rose-600 dark:text-rose-400">
              ৳ {remainingDueWithPrevious.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={totalQuantity === 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Confirm & Print Memo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
