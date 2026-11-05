import React, { useState } from 'react';
import { Employee, UserRole, Company, Order } from '../types';
import {
  Users,
  UserPlus,
  Phone,
  MessageSquare,
  MapPin,
  Briefcase,
  Search,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface EmployeesScreenProps {
  employees: Employee[];
  companies?: Company[];
  orders?: Order[];
  role: UserRole;
  onOpenAddEmployee: () => void;
  onDeleteEmployee: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const EmployeesScreen: React.FC<EmployeesScreenProps> = ({
  employees,
  companies = [],
  orders = [],
  role,
  onOpenAddEmployee,
  onDeleteEmployee,
  onToggleStatus,
}) => {
  const [search, setSearch] = useState('');

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.Name.toLowerCase().includes(search.toLowerCase()) ||
      emp.Phone_Number.includes(search) ||
      emp.Role.toLowerCase().includes(search.toLowerCase()) ||
      emp.Assigned_Zone.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = employees.filter((e) => e.Status === 'Active').length;
  const ridersCount = employees.filter((e) => e.Role === 'Delivery Rider' || e.Role === 'Van Driver').length;

  const handleWhatsApp = (phone: string, name: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`হ্যালো ${name}, Dessert Boss থেকে আজকের ডেলিভারি আপডেট দিন। ধন্যবাদ!`);
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20 pt-2 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-950 text-white rounded-2xl p-4 shadow-lg border border-emerald-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
              টিম ম্যানেজমেন্ট
            </span>
            <h2 className="text-base font-bold flex items-center gap-2 mt-1">
              <Users size={18} className="text-emerald-400" />
              <span>এমপ্লয়ী ও ডেলিভারি স্টাফ (Employees)</span>
            </h2>
            <p className="text-xs text-emerald-300 mt-0.5">
              ডেলিভারি রাইডার ও সেলস রিপ্রেজেন্টেটিভদের তালিকা
            </p>
          </div>

          <button
            onClick={onOpenAddEmployee}
            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <UserPlus size={15} />
            <span>+ নতুন এমপ্লয়ী</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-800/80 text-center">
          <div className="bg-emerald-950/60 rounded-xl p-2 border border-emerald-800/40">
            <span className="text-[10px] text-emerald-300 uppercase font-semibold">মোট এমপ্লয়ী</span>
            <p className="text-base font-black text-white">{employees.length} জন</p>
          </div>
          <div className="bg-emerald-950/60 rounded-xl p-2 border border-emerald-800/40">
            <span className="text-[10px] text-teal-300 uppercase font-semibold">সক্রিয় (Active)</span>
            <p className="text-base font-black text-emerald-300">{activeCount} জন</p>
          </div>
          <div className="bg-emerald-950/60 rounded-xl p-2 border border-emerald-800/40">
            <span className="text-[10px] text-emerald-300 uppercase font-semibold">ডেলিভারি রাইডার</span>
            <p className="text-base font-black text-teal-200">{ridersCount} জন</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="এমপ্লয়ীর নাম, ফোন নম্বর বা জোন দিয়ে খুঁজুন..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Employees List */}
      {employees.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserPlus size={28} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              এখনো কোনো এমপ্লয়ী যোগ করা হয়নি
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
              আপনার মিষ্টি ও পুডিং ডেলিভারি করার জন্য আপনার নিজস্ব ডেলিভারি রাইডার বা স্টাফ যোগ করুন।
            </p>
          </div>
          <button
            onClick={onOpenAddEmployee}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <UserPlus size={16} />
            <span>+ প্রথম এমপ্লয়ী যোগ করুন (Add First Employee)</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredEmployees.map((emp) => {
            const isActive = emp.Status === 'Active';

            return (
              <div
                key={emp.Employee_ID}
                className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {emp.Name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        {emp.Role}
                      </span>
                      <button
                        onClick={() => onToggleStatus(emp.Employee_ID)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                        title="Click to toggle status"
                      >
                        {isActive ? '● Active' : '○ Inactive'}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500 flex-wrap">
                      <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                        <MapPin size={12} className="text-emerald-600" />
                        <span>জোন: {emp.Assigned_Zone}</span>
                      </span>
                      <span className="text-zinc-400">|</span>
                      <span className="text-zinc-600 dark:text-zinc-400 font-mono">
                        {emp.Phone_Number}
                      </span>
                    </div>

                    {emp.Notes && (
                      <p className="text-[11px] text-zinc-400 mt-1 italic">
                        "{emp.Notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleWhatsApp(emp.Phone_Number, emp.Name)}
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors"
                      title="Send WhatsApp message"
                    >
                      <MessageSquare size={14} />
                    </button>
                    <a
                      href={`tel:${emp.Phone_Number}`}
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 transition-colors"
                      title="Call employee"
                    >
                      <Phone size={14} />
                    </a>
                    {role === 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`এমপ্লয়ী "${emp.Name}" কে ডিলিট করতে চান?`)) {
                            onDeleteEmployee(emp.Employee_ID);
                          }
                        }}
                        className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="Delete employee"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
