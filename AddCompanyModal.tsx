import React, { useState } from 'react';
import { Company, Employee } from '../types';
import { X, Building2, Phone, MapPin, Check, User } from 'lucide-react';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees?: Employee[];
  existingCompaniesCount?: number;
  onSaveCompany: (company: Company) => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  isOpen,
  onClose,
  employees = [],
  existingCompaniesCount,
  onSaveCompany,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [category, setCategory] = useState<Company['Category']>('Retail Outlet');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [startingDue, setStartingDue] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('অনুগ্রহ করে কোম্পানি বা ক্লায়েন্টের নাম লিখুন');
      return;
    }
    if (!phone.trim()) {
      alert('অনুগ্রহ করে মোবাইল নম্বর লিখুন');
      return;
    }

    const newCompany: Company = {
      Company_ID: `COMP-${Date.now().toString().slice(-4)}`,
      Company_Name: name.trim(),
      Phone_Number: phone.trim(),
      Address: address.trim() || 'Dhaka',
      Current_Due: Number(startingDue) || 0,
      Contact_Person: contactPerson.trim() || undefined,
      Category: category,
      Assigned_Employee: assignedEmployee || undefined,
    };

    onSaveCompany(newCompany);
    onClose();

    // Reset form
    setName('');
    setPhone('');
    setAddress('');
    setContactPerson('');
    setStartingDue(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">নতুন ক্লায়েন্ট / কোম্পানি যোগ করুন</h2>
              <p className="text-[11px] text-emerald-300">
                Add New Corporate Canteen / Superstore / Shop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto max-h-[80vh]">
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              কোম্পানি বা দোকানের নাম (Company / Outlet Name) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: গ্রামীণফোন ক্যাফেটেরিয়া / স্বপ্ন ধানমন্ডি"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                মোবাইল নম্বর (Phone) *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1711..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ক্যাটাগরি (Type)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs"
              >
                <option value="Corporate Canteen">কর্পোরেট ক্যান্টিন (Corporate Canteen)</option>
                <option value="Superstore">সুপারশপ (Superstore)</option>
                <option value="Retail Outlet">খুচরা দোকান / আউটলেট (Retail Outlet)</option>
                <option value="Restaurant / Cafe">রেস্টুরেন্ট / ক্যাফে (Restaurant / Cafe)</option>
                <option value="Executive Lounge">এক্সিকিউটিভ লাউঞ্জ (Executive Lounge)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ঠিকানা / লোকেশন (Full Address) *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="রোড নম্বর, এরিয়া, ঢাকা"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ম্যানেজার / কন্টাক্ট পারসন (Contact Person)
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="ম্যানেজারের নাম"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                দায়িত্বপ্রাপ্ত এমপ্লয়ী (Assigned Rider)
              </label>
              <select
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              >
                <option value="">নির্বাচন করুন (Select)</option>
                {employees.map((emp) => (
                  <option key={emp.Employee_ID} value={emp.Name}>
                    {emp.Name} ({emp.Role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              পূর্বের বকেয়া থাকলে লিখুন (Starting Current Due - ৳)
            </label>
            <input
              type="number"
              min="0"
              value={startingDue === 0 ? '' : startingDue}
              onChange={(e) => {
                const clean = e.target.value.replace(/^0+(?=\d)/, '');
                setStartingDue(clean === '' ? 0 : Number(clean));
              }}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs"
            />
            <p className="text-[10px] text-zinc-400 mt-0.5">
              যদি এই দোকানের কাছে পূর্বে কোনো বাকি থাকে, তবে তা লিখুন। না থাকলে ০ রাখুন।
            </p>
          </div>

          {/* Action buttons */}
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
              <span>কোম্পানি সেভ করুন (Save Client)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
