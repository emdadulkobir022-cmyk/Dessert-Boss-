import React, { useState } from 'react';
import { Company, Order, Employee } from '../types';
import {
  CheckCircle2,
  Clock,
  Printer,
  PlusCircle,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Truck,
  Building2,
  CheckCheck,
  Trash2,
  Calendar,
} from 'lucide-react';

interface TodaysOrdersScreenProps {
  companies: Company[];
  orders: Order[];
  employees?: Employee[];
  onOpenQuickOrder: (companyName?: string) => void;
  onOpenInvoice: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: 'Pending' | 'Delivered') => void;
  onOpenPaymentModal: (companyName: string) => void;
  onOpenAddCompany?: () => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const TodaysOrdersScreen: React.FC<TodaysOrdersScreenProps> = ({
  companies,
  orders,
  employees = [],
  onOpenQuickOrder,
  onOpenInvoice,
  onUpdateOrderStatus,
  onOpenPaymentModal,
  onOpenAddCompany,
  onDeleteOrder,
}) => {
  const [filter, setFilter] = useState<'all' | 'ordered' | 'not-ordered' | 'pending' | 'delivered'>('all');
  const [search, setSearch] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const displayedOrders = orders.filter((o) => o.Date === selectedDate);

  // Group orders by company name for selected date
  const ordersByCompany: { [name: string]: Order[] } = {};
  displayedOrders.forEach((order) => {
    if (!ordersByCompany[order.Company_Name]) {
      ordersByCompany[order.Company_Name] = [];
    }
    ordersByCompany[order.Company_Name].push(order);
  });

  const companiesOrderedCount = Object.keys(ordersByCompany).length;
  const companiesNotOrderedCount = Math.max(0, companies.length - companiesOrderedCount);
  const pendingCount = displayedOrders.filter((o) => o.Status === 'Pending').length;
  const deliveredCount = displayedOrders.filter((o) => o.Status === 'Delivered').length;

  const totalTodayBilled = displayedOrders.reduce((sum, o) => sum + (o.Total_Bill || 0), 0);
  const totalTodayUnits = displayedOrders.reduce((sum, o) => sum + (o.Quantity || 0), 0);
  const totalTodayCollected = displayedOrders.reduce((sum, o) => sum + (o.Paid_Amount || 0), 0);

  // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const hasOrdered = !!ordersByCompany[company.Company_Name];
    const companyOrders = ordersByCompany[company.Company_Name] || [];
    const hasPending = companyOrders.some((o) => o.Status === 'Pending');
    const hasDelivered = companyOrders.some((o) => o.Status === 'Delivered');

    const matchesSearch =
      company.Company_Name.toLowerCase().includes(search.toLowerCase()) ||
      company.Address.toLowerCase().includes(search.toLowerCase()) ||
      (company.Contact_Person && company.Contact_Person.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'ordered') return hasOrdered;
    if (filter === 'not-ordered') return !hasOrdered;
    if (filter === 'pending') return hasPending;
    if (filter === 'delivered') return hasDelivered;
    return true;
  });

  const handleWhatsAppContact = (company: Company) => {
    const cleanPhone = company.Phone_Number.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${company.Contact_Person || company.Company_Name}, this is Dessert Boss Distribution. Please confirm your daily coconut pudding & dessert orders for today. Current Ledger Due: ৳${company.Current_Due.toLocaleString()}. Thank you!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20 pt-2 animate-fadeIn">
      {/* Top Today's Distribution Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-4 shadow-lg border border-emerald-700/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Truck size={18} className="text-emerald-300" />
              <span>ডেলিভারি ও অর্ডার মনিটরিং</span>
            </h2>
            <p className="text-xs text-emerald-200 mt-0.5">
              {selectedDate === todayStr ? 'আজকের লাইভ অর্ডার ডেসপ্যাচ' : `${selectedDate} তারিখের অর্ডারের হিসাব`}
            </p>
          </div>
          <button
            onClick={() => onOpenQuickOrder()}
            className="px-3 py-1.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 active:scale-95 shadow-md flex items-center gap-1.5 transition-all"
          >
            <PlusCircle size={15} className="text-emerald-700" />
            <span>+ Add Order</span>
          </button>
        </div>

        {/* Date Selector for Orders */}
        <div className="flex items-center justify-between pt-2 border-t border-emerald-700/60 flex-wrap gap-2 text-xs mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-emerald-300" />
            <span className="font-bold text-white">অর্ডারের তারিখ নির্বাচন:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-600 text-white font-bold text-xs"
            />
            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-[11px] font-bold text-emerald-100"
              >
                আজকে
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric counters */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-700/60 text-center">
          <div className="bg-emerald-950/40 rounded-xl p-2">
            <span className="text-[10px] text-emerald-300 uppercase font-semibold">Ordered Hubs</span>
            <p className="text-base font-black text-white">{companiesOrderedCount} / {companies.length}</p>
          </div>
          <div className="bg-emerald-950/40 rounded-xl p-2">
            <span className="text-[10px] text-emerald-300 uppercase font-semibold">Pudding Units</span>
            <p className="text-base font-black text-white">{totalTodayUnits} pcs</p>
          </div>
          <div className="bg-emerald-950/40 rounded-xl p-2">
            <span className="text-[10px] text-emerald-300 uppercase font-semibold">Total Billed</span>
            <p className="text-base font-black text-white">৳ {totalTodayBilled.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, address, or contact person..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all ${
              filter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            All 24 Hubs ({companies.length})
          </button>
          <button
            onClick={() => setFilter('ordered')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all ${
              filter === 'ordered'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            Ordered Today ({companiesOrderedCount})
          </button>
          <button
            onClick={() => setFilter('not-ordered')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all ${
              filter === 'not-ordered'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            Not Yet Ordered ({companiesNotOrderedCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all ${
              filter === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            Pending Delivery ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all ${
              filter === 'delivered'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            Delivered ({deliveredCount})
          </button>
        </div>
      </div>

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building2 size={28} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {companies.length === 0 ? 'কোনো কোম্পানি বা আউটলেট নেই' : 'কোনো তথ্য মেলেনি'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
              {companies.length === 0
                ? 'আজকের অর্ডার শুরু করতে আপনার কাস্টমার / কোম্পানি যোগ করুন।'
                : 'অন্য নাম দিয়ে চেষ্টা করুন।'}
            </p>
          </div>
          {onOpenAddCompany && (
            <button
              onClick={onOpenAddCompany}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <PlusCircle size={16} />
              <span>+ নতুন কোম্পানি যোগ করুন (Add Client)</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCompanies.map((company, index) => {
            const companyOrders = ordersByCompany[company.Company_Name] || [];
            const hasOrderedToday = companyOrders.length > 0;

            return (
              <div
                key={company.Company_ID}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  hasOrderedToday
                    ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'
                    : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-dashed border-zinc-300 dark:border-zinc-800'
                }`}
              >
              {/* Company Header Row */}
              <div className="p-3.5 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                      #{index + 1}
                    </span>
                    <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {company.Company_Name}
                    </h3>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      {company.Category || 'Corporate'}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                    {company.Address}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Current Due:{' '}
                      <strong className={company.Current_Due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        ৳ {company.Current_Due.toLocaleString()}
                      </strong>
                    </span>
                    {company.Contact_Person && (
                      <span className="text-zinc-400 text-[10px] truncate max-w-[150px]">
                        👤 {company.Contact_Person}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Indicator or Quick Order Button */}
                <div className="flex flex-col items-end gap-1.5">
                  {hasOrderedToday ? (
                    <span className="px-2 py-0.8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCheck size={11} />
                      <span>{companyOrders.length} Order(s) Today</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.8 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-medium">
                      No Order Yet
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      onClick={() => handleWhatsAppContact(company)}
                      className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors"
                      title="Send WhatsApp reminder"
                    >
                      <MessageSquare size={13} />
                    </button>
                    <a
                      href={`tel:${company.Phone_Number}`}
                      className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 transition-colors"
                      title="Call company"
                    >
                      <Phone size={13} />
                    </a>
                    <button
                      onClick={() => onOpenQuickOrder(company.Company_Name)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1"
                    >
                      <PlusCircle size={12} />
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Placed Orders Breakdown (if any) */}
              {hasOrderedToday && (
                <div className="border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-800/30 p-3 space-y-2">
                  {companyOrders.map((order) => {
                    const isDelivered = order.Status === 'Delivered';
                    return (
                      <div
                        key={order.Order_ID}
                        className="bg-white dark:bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 shadow-2xs flex flex-col gap-1.5 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {order.Items && order.Items.length > 0
                                ? order.Items.map((i) => `${i.Quantity}x ${i.Item_Name}`).join(', ')
                                : `${order.Quantity}x ${order.Item_Name}`}
                            </span>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              <span>Bill: ৳{order.Total_Bill.toLocaleString()}</span> •{' '}
                              <span className="text-emerald-600 dark:text-emerald-400">
                                Paid: ৳{order.Paid_Amount.toLocaleString()} ({order.Payment_Method || 'Cash'})
                              </span>{' '}
                              {order.Due_Amount > 0 && (
                                <>
                                  • <span className="text-rose-600 dark:text-rose-400 font-bold">Due: ৳{order.Due_Amount.toLocaleString()}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <span className="font-mono text-[10px] text-zinc-400">
                            {order.Time || '09:30'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-700 text-[11px]">
                          <button
                            onClick={() =>
                              onUpdateOrderStatus(
                                order.Order_ID,
                                isDelivered ? 'Pending' : 'Delivered'
                              )
                            }
                            className={`px-2 py-0.5 rounded-md font-semibold text-[10px] flex items-center gap-1 transition-colors ${
                              isDelivered
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {isDelivered ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                            <span>{order.Status}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {order.Due_Amount > 0 && (
                              <button
                                onClick={() => onOpenPaymentModal(company.Company_Name)}
                                className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold text-[10px] hover:bg-emerald-200"
                              >
                                Record Pay
                              </button>
                            )}
                            <button
                              onClick={() => onOpenInvoice(order)}
                              className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 font-semibold text-[10px] text-zinc-800 dark:text-zinc-200 flex items-center gap-1"
                            >
                              <Printer size={10} />
                              <span>Invoice Memo</span>
                            </button>

                            {onDeleteOrder && (
                              <button
                                onClick={() => {
                                  if (confirm(`আপনি কি অর্ডার #${order.Order_ID} ডিলিট করতে চান?`)) {
                                    onDeleteOrder(order.Order_ID);
                                  }
                                }}
                                className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                                title="অর্ডার মুছুন"
                              >
                                <Trash2 size={12} />
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
        })}
      </div>
      )}
    </div>
  );
};
