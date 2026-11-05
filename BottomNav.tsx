import { LayoutDashboard, ShoppingCart, Users, Package, WalletCards, FileSpreadsheet, UserCheck } from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 'dashboard' | 'today-orders' | 'ledger' | 'employees' | 'inventory' | 'sheet' | 'expenses';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  todayOrdersCount: number;
  lowStockCount: number;
  role: UserRole;
  employeesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  todayOrdersCount,
  lowStockCount,
  role,
  employeesCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Home',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'today-orders' as TabType,
      label: "Today's",
      icon: ShoppingCart,
      badge: todayOrdersCount > 0 ? todayOrdersCount : null,
    },
    {
      id: 'ledger' as TabType,
      label: 'Clients',
      icon: Users,
      badge: null,
    },
    {
      id: 'employees' as TabType,
      label: 'Staff',
      icon: UserCheck,
      badge: employeesCount > 0 ? employeesCount : null,
      badgeColor: 'bg-teal-600',
    },
    {
      id: 'inventory' as TabType,
      label: 'Stock',
      icon: Package,
      badge: lowStockCount > 0 ? '!' : null,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'expenses' as TabType,
      label: 'খরচ',
      icon: WalletCards,
      badge: null,
    },
    {
      id: 'sheet' as TabType,
      label: 'Sheet DB',
      icon: FileSpreadsheet,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-2xl safe-area-pb">
      <div className="max-w-md mx-auto md:max-w-xl flex items-center justify-around px-0.5 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-0.5 transition-all rounded-xl select-none ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-normal'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-9 h-7 flex items-center justify-center rounded-full transition-all ${
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 scale-105'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    className={`transition-colors ${isActive ? 'text-emerald-700 dark:text-emerald-400' : ''}`}
                  />
                </div>

                {item.badge !== null && (
                  <span
                    className={`absolute -top-1 -right-2 text-[9px] font-bold px-1 py-0.2 rounded-full text-white min-w-3.5 text-center shadow-sm ${
                      item.badgeColor || 'bg-emerald-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9.5px] mt-0.5 tracking-tight truncate max-w-[50px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
