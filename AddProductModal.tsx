import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { X, PackagePlus, Check } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (product: InventoryItem) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(120);
  const [stock, setStock] = useState<number>(50);
  const [unit, setUnit] = useState('Cup (200g)');
  const [category, setCategory] = useState('Puddings');
  const [minAlert, setMinAlert] = useState<number>(20);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('অনুগ্রহ করে প্রোডাক্ট বা ডেজার্টের নাম লিখুন');
      return;
    }
    if (price <= 0) {
      alert('অনুগ্রহ করে সঠিক মূল্য লিখুন');
      return;
    }

    const newItem: InventoryItem = {
      Item_Name: name.trim(),
      Unit_Price: Number(price),
      Stock_Qty: Number(stock) || 0,
      Unit: unit.trim() || 'Cup',
      Min_Alert_Qty: Number(minAlert) || 20,
      Category: category,
    };

    onSaveProduct(newItem);
    onClose();

    setName('');
    setPrice(120);
    setStock(50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <PackagePlus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">নতুন প্রোডাক্ট / আইটেম যোগ করুন</h2>
              <p className="text-[11px] text-emerald-300">
                Add New Pudding / Falooda Item
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto max-h-[80vh]">
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              প্রোডাক্ট / ডেজার্টের নাম (Item Name) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: Green Coconut Pudding / Mango Falooda"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                বিক্রয় মূল্য (Unit Price - ৳) *
              </label>
              <input
                type="number"
                min="1"
                value={price === 0 ? '' : price}
                onChange={(e) => {
                  const clean = e.target.value.replace(/^0+(?=\d)/, '');
                  setPrice(clean === '' ? 0 : Number(clean));
                }}
                onFocus={(e) => e.target.select()}
                placeholder="120"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                বর্তমান স্টক সংখ্যা (Initial Stock)
              </label>
              <input
                type="number"
                min="0"
                value={stock === 0 ? '' : stock}
                onChange={(e) => {
                  const clean = e.target.value.replace(/^0+(?=\d)/, '');
                  setStock(clean === '' ? 0 : Number(clean));
                }}
                onFocus={(e) => e.target.select()}
                placeholder="50"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                প্যাকেজিং ইউনিট (Unit / Size)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Cup (200g), Jar (350ml)"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ক্যাটাগরি (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              >
                <option value="Puddings">পুডিং (Puddings)</option>
                <option value="Falooda">ফালুদা (Falooda)</option>
                <option value="Traditional">ঐতিহ্যবাহী মিষ্টি (Traditional)</option>
                <option value="Frozen Desserts">কুলফি ও ফ্রোজেন (Frozen Desserts)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              লো স্টক ওয়ার্নিং লিমিট (Min Alert Stock)
            </label>
            <input
              type="number"
              min="1"
              value={minAlert}
              onChange={(e) => setMinAlert(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Check size={14} />
              <span>প্রোডাক্ট যোগ করুন (Add Product)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
