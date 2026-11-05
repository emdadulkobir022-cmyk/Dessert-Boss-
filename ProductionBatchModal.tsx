import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { X, PackagePlus, Check } from 'lucide-react';

interface ProductionBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onAddProductionBatch: (itemName: string, quantity: number, notes?: string) => void;
}

export const ProductionBatchModal: React.FC<ProductionBatchModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onAddProductionBatch,
}) => {
  const [selectedItem, setSelectedItem] = useState(
    inventory[0]?.Item_Name || 'Green Coconut Pudding (Signature)'
  );
  const [quantity, setQuantity] = useState<number>(100);
  const [notes, setNotes] = useState('Fresh morning batch from master kitchen');

  if (!isOpen) return null;

  const currentItem = inventory.find((i) => i.Item_Name === selectedItem);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || quantity <= 0) {
      alert('Please enter a valid item and quantity.');
      return;
    }

    onAddProductionBatch(selectedItem, quantity, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <PackagePlus size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Add Daily Production Batch</h2>
              <p className="text-[11px] text-emerald-300">
                Increases cold room inventory stock in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Select Dessert Item *
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
            >
              {inventory.map((item) => (
                <option key={item.Item_Name} value={item.Item_Name}>
                  {item.Item_Name} (Current Stock: {item.Stock_Qty} {item.Unit || 'pcs'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Quantity Produced (Units/Cups) *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantity === 0 ? '' : quantity}
                onChange={(e) => {
                  const val = e.target.value.replace(/^0+(?=\d)/, '');
                  setQuantity(val === '' ? 0 : Number(val));
                }}
                onFocus={(e) => e.target.select()}
                placeholder="100"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setQuantity(50)}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-semibold text-[11px]"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => setQuantity(100)}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-semibold text-[11px]"
              >
                +100
              </button>
            </div>
          </div>

          {currentItem && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex justify-between">
              <span>Updated Total Stock:</span>
              <strong>{currentItem.Stock_Qty + quantity} {currentItem.Unit || 'pcs'}</strong>
            </div>
          )}

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Batch Notes / Quality Check
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Chef signature, shelf-life expiry note..."
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              <Check size={14} />
              <span>Add to Cold Room Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
