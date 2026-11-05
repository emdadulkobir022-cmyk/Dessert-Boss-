import React, { useState } from 'react';
import { Employee } from '../types';
import { X, UserPlus, Phone, MapPin, Briefcase, Check } from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEmployee: (employee: Employee) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSaveEmployee,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Employee['Role']>('Delivery Rider');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('Gulshan / Banani');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('অনুগ্রহ করে এমপ্লয়ীর নাম লিখুন (Please enter employee name)');
      return;
    }
    if (!phone.trim()) {
      alert('অনুগ্রহ করে মোবাইল নম্বর লিখুন (Please enter phone number)');
      return;
    }

    const newEmployee: Employee = {
      Employee_ID: `EMP-${Date.now().toString().slice(-4)}`,
      Name: name.trim(),
      Role: role,
      Phone_Number: phone.trim(),
      Assigned_Zone: zone.trim() || 'General Delivery',
      Status: status,
      Join_Date: new Date().toISOString().split('T')[0],
      Notes: notes.trim() || undefined,
    };

    onSaveEmployee(newEmployee);
    onClose();

    // Reset form
    setName('');
    setPhone('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">নতুন এমপ্লয়ী যোগ করুন</h2>
              <p className="text-[11px] text-emerald-300">
                Add New Delivery Rider / Sales Staff
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
              এমপ্লয়ীর নাম (Employee Full Name) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: রহিম আহমেদ / তারিফ হোসেন"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                পদবী (Role / Job Title) *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs"
              >
                <option value="Delivery Rider">ডেলিভারি রাইডার (Delivery Rider)</option>
                <option value="Sales Representative">সেলস রিপ্রেজেন্টেটিভ (Sales Rep)</option>
                <option value="Van Driver">ভ্যান চালক (Van Driver)</option>
                <option value="Kitchen Manager">কিচেন শেফ / ম্যানেজার (Kitchen Manager)</option>
                <option value="Branch Staff">স্টাফ / সহকারী (Branch Staff)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                মোবাইল নম্বর (Phone Number) *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1711..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ডিউটি জোন / রুট (Assigned Delivery Zone) *
            </label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="যেমন: গুলশান, বনানী, মহাখালী রুট"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              স্ট্যাটাস (Status)
            </label>
            <div className="flex gap-2">
              <label className={`flex-1 py-1.5 px-3 rounded-xl border cursor-pointer font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                status === 'Active'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                  : 'border-zinc-300 dark:border-zinc-700 text-zinc-500'
              }`}>
                <input
                  type="radio"
                  name="empStatus"
                  value="Active"
                  checked={status === 'Active'}
                  onChange={() => setStatus('Active')}
                  className="sr-only"
                />
                <span>✓ Active (সক্রিয়)</span>
              </label>

              <label className={`flex-1 py-1.5 px-3 rounded-xl border cursor-pointer font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                status === 'Inactive'
                  ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-500 text-zinc-800 dark:text-zinc-200'
                  : 'border-zinc-300 dark:border-zinc-700 text-zinc-500'
              }`}>
                <input
                  type="radio"
                  name="empStatus"
                  value="Inactive"
                  checked={status === 'Inactive'}
                  onChange={() => setStatus('Inactive')}
                  className="sr-only"
                />
                <span>Inactive (নিষ্ক্রিয়)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              মন্তব্য / ঠিকানা (Notes / Address)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="এনআইডি নম্বর, বাসার ঠিকানা বা লাইসেন্স..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
            />
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
              <span>এমপ্লয়ী সেভ করুন (Save Employee)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
