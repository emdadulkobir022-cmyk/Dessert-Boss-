import React, { useState } from 'react';
import { Company, InventoryItem, ReturnRecord } from '../types';
import { X, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface ReturnRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  inventory: InventoryItem[];
  onRecordReturn: (record: ReturnRecord, adjustDue: boolean) => void;
}

export const ReturnRecordModal: React.FC<ReturnRecordModalProps> = ({
  isOpen,
  onClose,
  companies,
  inventory,
  onRecordReturn,
}) => {
  const [selectedCompany, setSelectedCompany] = useState(
    companies[0]?.Company_Name || ''
  );
  const [selectedItem, setSelectedItem] = useState(
    inventory[0]?.Item_Name || ''
  );
  const [returnQty, setReturnQty] = useState<number>(3);
  const [reason, setReason] = useState<ReturnRecord['Reason']>('Damaged in transit');
  const [actionTaken, setActionTaken] = useState<'Discarded' | 'Restocked'>('Discarded');
  const [adjustCustomerDue, setAdjustCustomerDue] = useState(true);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentItem = inventory.find((i) => i.Item_Name === selectedItem);
  const unitPrice = currentItem ? currentItem.Unit_Price : 120;
  const creditAmount = returnQty * unitPrice;
  const companyObj = companies.find((c) => c.Company_Name === selectedCompany);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !selectedItem || returnQty <= 0) {
      alert('Please fill in company, dessert item and valid return quantity.');
      return;
    }

    const newRecord: ReturnRecord = {
      Return_ID: `RET-${Date.now().toString().slice(-4)}`,
      Date: new Date().toISOString().split('T')[0],
      Company_Name: selectedCompany,
      Item_Name: selectedItem,
      Return_Qty: returnQty,
      Reason: reason,
      Credit_Amount: adjustCustomerDue ? creditAmount : 0,
      Action_Taken: actionTaken,
      Notes: notes || undefined,
    };

    onRecordReturn(newRecord, adjustCustomerDue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-800 flex items-center justify-center text-white">
              <RotateCcw size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Log Damaged / Returned Desserts</h2>
              <p className="text-[11px] text-rose-300">
                Adjusts Google Sheets Returns tab & customer credit ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-rose-900 text-rose-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Select Distribution Point *
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
            >
              {companies.map((c) => (
                <option key={c.Company_ID} value={c.Company_Name}>
                  {c.Company_Name} (Due: ৳{c.Current_Due.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Dessert Item *
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
            >
              {inventory.map((item) => (
                <option key={item.Item_Name} value={item.Item_Name}>
                  {item.Item_Name} (Rate: ৳{item.Unit_Price})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Return Qty (Units) *
              </label>
              <input
                type="number"
                min="1"
                value={returnQty === 0 ? '' : returnQty}
                onChange={(e) => {
                  const val = e.target.value.replace(/^0+(?=\d)/, '');
                  setReturnQty(val === '' ? 0 : Number(val));
                }}
                onFocus={(e) => e.target.select()}
                placeholder="1"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Total Credit Value
              </label>
              <div className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">
                ৳ {creditAmount.toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Return / Damage Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
            >
              <option value="Damaged in transit">Damaged in transit (Cracked cup/seal)</option>
              <option value="Unsold Stock Adjustment">Unsold Stock Adjustment (Replacement)</option>
              <option value="Expiry / Quality Issue">Expiry / Quality Issue</option>
              <option value="Chiller Issue">Chiller / Temperature Abuse</option>
              <option value="Seal Broken">Seal Broken at retail outlet</option>
              <option value="Other">Other Adjustment</option>
            </select>
          </div>

          {/* Action Taken */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Stock Disposition
              </label>
              <select
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="Discarded">Discarded (Waste)</option>
                <option value="Restocked">Restocked into Inventory</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Ledger Credit
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adjustCustomerDue}
                  onChange={(e) => setAdjustCustomerDue(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  Deduct from client due
                </span>
              </label>
            </div>
          </div>

          {adjustCustomerDue && companyObj && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
              Customer Current Due will decrease from <strong>৳{companyObj.Current_Due.toLocaleString()}</strong> to{' '}
              <strong>৳{Math.max(0, companyObj.Current_Due - creditAmount).toLocaleString()}</strong>.
            </div>
          )}

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Inspection Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Crate fell during speed breaker impact on van #2"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              <Check size={14} />
              <span>Record Return & Adjust Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
