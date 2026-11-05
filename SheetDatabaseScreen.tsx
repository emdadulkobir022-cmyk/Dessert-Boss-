import React, { useState } from 'react';
import {
  Company,
  Employee,
  InventoryItem,
  Order,
  ReturnRecord,
  Expense,
  UserRole,
  GoogleSheetsConfig,
} from '../types';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Table,
  CheckCircle2,
  Trash2,
  Edit2,
  Share2,
  Lock,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  downloadCSV,
  downloadAllDataJSON,
  saveCompanies,
  saveEmployees,
  saveInventory,
  saveOrders,
  saveReturns,
  saveExpenses,
} from '../services/storageService';

interface SheetDatabaseScreenProps {
  companies: Company[];
  employees: Employee[];
  inventory: InventoryItem[];
  orders: Order[];
  returns: ReturnRecord[];
  expenses: Expense[];
  role: UserRole;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSyncSettings: () => void;
  onRefreshData: () => void;
  onUpdateCompanies: (companies: Company[]) => void;
  onUpdateEmployees: (employees: Employee[]) => void;
  onUpdateInventory: (inventory: InventoryItem[]) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateReturns: (returns: ReturnRecord[]) => void;
  onUpdateExpenses: (expenses: Expense[]) => void;
  onOpenInstallModal?: () => void;
}

type SheetTab = 'Companies' | 'Employees' | 'Inventory' | 'Orders' | 'Returns' | 'Expenses';

export const SheetDatabaseScreen: React.FC<SheetDatabaseScreenProps> = ({
  companies,
  employees,
  inventory,
  orders,
  returns,
  expenses,
  role,
  sheetsConfig,
  onOpenSyncSettings,
  onRefreshData,
  onUpdateCompanies,
  onUpdateEmployees,
  onUpdateInventory,
  onUpdateOrders,
  onUpdateReturns,
  onUpdateExpenses,
  onOpenInstallModal,
}) => {
  const [activeTab, setActiveTab] = useState<SheetTab>('Companies');
  const [search, setSearch] = useState('');
  const [copiedTab, setCopiedTab] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isSecretSectionOpen, setIsSecretSectionOpen] = useState(false);

  // New Row State modals or inline
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);

  // Handle Tab Copying to clipboard (TSV format for direct paste into Google Sheets!)
  const handleCopyForGoogleSheets = async () => {
    let tsv = '';
    if (activeTab === 'Companies') {
      tsv = 'Company_ID\tCompany_Name\tPhone_Number\tAddress\tCurrent_Due\n';
      tsv += companies
        .map(
          (c) =>
            `${c.Company_ID}\t${c.Company_Name}\t${c.Phone_Number}\t${c.Address}\t${c.Current_Due}`
        )
        .join('\n');
    } else if (activeTab === 'Employees') {
      tsv = 'Employee_ID\tName\tRole\tPhone_Number\tAssigned_Zone\tStatus\n';
      tsv += employees
        .map(
          (e) =>
            `${e.Employee_ID}\t${e.Name}\t${e.Role}\t${e.Phone_Number}\t${e.Assigned_Zone}\t${e.Status}`
        )
        .join('\n');
    } else if (activeTab === 'Inventory') {
      tsv = 'Item_Name\tUnit_Price\tStock_Qty\n';
      tsv += inventory
        .map((i) => `${i.Item_Name}\t${i.Unit_Price}\t${i.Stock_Qty}`)
        .join('\n');
    } else if (activeTab === 'Orders') {
      tsv = 'Order_ID\tDate\tCompany_Name\tItem_Name\tQuantity\tTotal_Bill\tPaid_Amount\tDue_Amount\tStatus\n';
      tsv += orders
        .map(
          (o) =>
            `${o.Order_ID}\t${o.Date}\t${o.Company_Name}\t${o.Item_Name}\t${o.Quantity}\t${o.Total_Bill}\t${o.Paid_Amount}\t${o.Due_Amount}\t${o.Status}`
        )
        .join('\n');
    } else if (activeTab === 'Returns') {
      tsv = 'Date\tCompany_Name\tItem_Name\tReturn_Qty\tReason\n';
      tsv += returns
        .map(
          (r) =>
            `${r.Date}\t${r.Company_Name}\t${r.Item_Name}\t${r.Return_Qty}\t${r.Reason}`
        )
        .join('\n');
    } else if (activeTab === 'Expenses') {
      tsv = 'Date\tExpense_Type\tAmount\tNote\n';
      tsv += expenses
        .map((e) => `${e.Date}\t${e.Expense_Type}\t${e.Amount}\t${e.Note}`)
        .join('\n');
    }

    try {
      await navigator.clipboard.writeText(tsv);
      setCopiedTab(true);
      setTimeout(() => setCopiedTab(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Delete Row (Admin only)
  const handleDeleteRow = (index: number) => {
    if (!confirm(`Are you sure you want to delete row #${index + 1} from ${activeTab}?`)) return;

    if (activeTab === 'Companies') {
      const updated = [...companies];
      updated.splice(index, 1);
      onUpdateCompanies(updated);
      saveCompanies(updated);
    } else if (activeTab === 'Employees') {
      const updated = [...employees];
      updated.splice(index, 1);
      onUpdateEmployees(updated);
      saveEmployees(updated);
    } else if (activeTab === 'Inventory') {
      const updated = [...inventory];
      updated.splice(index, 1);
      onUpdateInventory(updated);
      saveInventory(updated);
    } else if (activeTab === 'Orders') {
      const updated = [...orders];
      updated.splice(index, 1);
      onUpdateOrders(updated);
      saveOrders(updated);
    } else if (activeTab === 'Returns') {
      const updated = [...returns];
      updated.splice(index, 1);
      onUpdateReturns(updated);
      saveReturns(updated);
    } else if (activeTab === 'Expenses') {
      const updated = [...expenses];
      updated.splice(index, 1);
      onUpdateExpenses(updated);
      saveExpenses(updated);
    }
  };

  // Summary formula calculations for active sheet
  const getTabFormulaSummary = () => {
    if (activeTab === 'Companies') {
      const totalDue = companies.reduce((sum, c) => sum + (c.Current_Due || 0), 0);
      return `COUNT: ${companies.length} rows | SUM(Current_Due): ৳ ${totalDue.toLocaleString()} | AVERAGE(Due): ৳ ${Math.round(totalDue / Math.max(1, companies.length)).toLocaleString()}`;
    }
    if (activeTab === 'Employees') {
      const activeCount = employees.filter((e) => e.Status === 'Active').length;
      return `COUNT: ${employees.length} employees | ACTIVE: ${activeCount} active staff | INACTIVE: ${employees.length - activeCount}`;
    }
    if (activeTab === 'Inventory') {
      const totalStock = inventory.reduce((sum, i) => sum + i.Stock_Qty, 0);
      const totalVal = inventory.reduce((sum, i) => sum + i.Stock_Qty * i.Unit_Price, 0);
      return `COUNT: ${inventory.length} items | SUM(Stock_Qty): ${totalStock} units | VALUATION: ৳ ${totalVal.toLocaleString()}`;
    }
    if (activeTab === 'Orders') {
      const totalBilled = orders.reduce((sum, o) => sum + (o.Total_Bill || 0), 0);
      const totalPaid = orders.reduce((sum, o) => sum + (o.Paid_Amount || 0), 0);
      const totalDue = orders.reduce((sum, o) => sum + (o.Due_Amount || 0), 0);
      return `ROWS: ${orders.length} | SUM(Total_Bill): ৳ ${totalBilled.toLocaleString()} | SUM(Paid): ৳ ${totalPaid.toLocaleString()} | SUM(Due): ৳ ${totalDue.toLocaleString()}`;
    }
    if (activeTab === 'Returns') {
      const totalQty = returns.reduce((sum, r) => sum + (r.Return_Qty || 0), 0);
      return `COUNT: ${returns.length} return events | SUM(Return_Qty): ${totalQty} units`;
    }
    if (activeTab === 'Expenses') {
      const totalExp = expenses.reduce((sum, e) => sum + e.Amount, 0);
      return `COUNT: ${expenses.length} records | SUM(Amount): ৳ ${totalExp.toLocaleString()}`;
    }
    return '';
  };

  return (
    <div className="space-y-3 pb-20 pt-2 animate-fadeIn">
      {/* Google Sheets Branding Header */}
      <div className="bg-emerald-950 text-white rounded-2xl p-3.5 shadow-lg border border-emerald-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-sm tracking-tight">
                  Google Sheets Backend Database
                </h2>
                <span className="text-[10px] px-2 py-0.2 bg-emerald-800 text-emerald-200 font-semibold rounded-full">
                  6 Tabs
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 font-mono">
                dessert-boss-master-database.xlsx
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyForGoogleSheets}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-850 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold border border-emerald-700/60 flex items-center gap-1 transition-all active:scale-95"
              title="Copy active sheet in TSV format (ready to paste directly into Google Sheets with Ctrl+V)"
            >
              {copiedTab ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedTab ? 'Copied Tab!' : 'Copy to Sheet'}</span>
            </button>

            <button
              onClick={() => downloadCSV(activeTab)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-all active:scale-95"
              title={`Download ${activeTab}.csv`}
            >
              <Download size={13} />
              <span>CSV</span>
            </button>

            <button
              onClick={onOpenSyncSettings}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-medium border border-emerald-700/60 flex items-center gap-1"
              title="Sync settings and Webhook setup"
            >
              <RefreshCw size={12} />
              <span className="hidden sm:inline">Sync Hub</span>
            </button>
          </div>
        </div>

        {/* 6 Tabs Ribbon (Like Google Sheets bottom/top tab bar) */}
        <div className="flex gap-1 overflow-x-auto pt-3 border-t border-emerald-900/80 mt-2.5 no-scrollbar">
          {(['Companies', 'Employees', 'Inventory', 'Orders', 'Returns', 'Expenses'] as SheetTab[]).map(
            (tab) => {
              const isActive = activeTab === tab;
              const count =
                tab === 'Companies'
                  ? companies.length
                  : tab === 'Employees'
                  ? employees.length
                  : tab === 'Inventory'
                  ? inventory.length
                  : tab === 'Orders'
                  ? orders.length
                  : tab === 'Returns'
                  ? returns.length
                  : expenses.length;

              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearch('');
                  }}
                  className={`px-3 py-1.5 rounded-t-lg font-mono text-xs whitespace-nowrap transition-all flex items-center gap-1.5 border-b-2 ${
                    isActive
                      ? 'bg-white text-emerald-950 font-bold border-emerald-500 shadow-md'
                      : 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border-transparent font-medium'
                  }`}
                >
                  <Table size={12} className={isActive ? 'text-emerald-700' : 'text-emerald-400'} />
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                      isActive ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Search & Action bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter ${activeTab} rows...`}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs font-mono"
          />
        </div>

        <button
          onClick={() => downloadAllDataJSON()}
          className="px-2.5 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold whitespace-nowrap flex items-center gap-1"
          title="Backup all 5 tabs in a single JSON file"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Backup All</span>
        </button>
      </div>

      {/* Spreadsheet Data Grid View */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
        {/* Table Container with horizontal and vertical scroll */}
        <div className="overflow-x-auto max-h-[60vh] font-mono text-xs">
          {activeTab === 'Companies' && (
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 sticky top-0 z-10 select-none border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="py-2 px-2.5 text-center text-[10px] text-zinc-400 border-r border-zinc-200 dark:border-zinc-700 w-10">
                    #
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Company_ID
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Company_Name
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Phone_Number
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Address
                  </th>
                  <th className="py-2 px-3 font-bold text-right border-r border-zinc-200 dark:border-zinc-700">
                    Current_Due (৳)
                  </th>
                  {role === 'admin' && <th className="py-2 px-2 text-center w-10">Act</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {companies
                  .filter(
                    (c) =>
                      c.Company_Name.toLowerCase().includes(search.toLowerCase()) ||
                      c.Address.toLowerCase().includes(search.toLowerCase()) ||
                      c.Company_ID.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((company, index) => (
                    <tr
                      key={company.Company_ID}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <td className="py-1.5 px-2 text-center text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-850 border-r border-zinc-200 dark:border-zinc-800 select-none">
                        {index + 1}
                      </td>
                      <td className="py-1.5 px-3 text-emerald-700 dark:text-emerald-400 font-semibold border-r border-zinc-100 dark:border-zinc-800">
                        {company.Company_ID}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-zinc-900 dark:text-zinc-100 border-r border-zinc-100 dark:border-zinc-800 max-w-[200px] truncate">
                        {company.Company_Name}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-600 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800 whitespace-nowrap">
                        {company.Phone_Number}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800 max-w-[240px] truncate">
                        {company.Address}
                      </td>
                      <td className={`py-1.5 px-3 text-right font-black border-r border-zinc-100 dark:border-zinc-800 ${
                        company.Current_Due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        ৳ {company.Current_Due.toLocaleString()}
                      </td>
                      {role === 'admin' && (
                        <td className="py-1 px-1.5 text-center">
                          <button
                            onClick={() => handleDeleteRow(index)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                            title="Delete Row"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Employees' && (
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 sticky top-0 z-10 select-none border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="py-2 px-2.5 text-center text-[10px] text-zinc-400 border-r border-zinc-200 dark:border-zinc-700 w-10">
                    #
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Employee_ID
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Name
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Role
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Phone_Number
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Assigned_Zone
                  </th>
                  <th className="py-2 px-3 font-bold text-center border-r border-zinc-200 dark:border-zinc-700">
                    Status
                  </th>
                  {role === 'admin' && <th className="py-2 px-2 text-center w-10">Act</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {employees
                  .filter(
                    (e) =>
                      e.Name.toLowerCase().includes(search.toLowerCase()) ||
                      e.Role.toLowerCase().includes(search.toLowerCase()) ||
                      e.Employee_ID.toLowerCase().includes(search.toLowerCase()) ||
                      (e.Assigned_Zone && e.Assigned_Zone.toLowerCase().includes(search.toLowerCase()))
                  )
                  .map((employee, index) => (
                    <tr
                      key={employee.Employee_ID}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <td className="py-1.5 px-2 text-center text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-850 border-r border-zinc-200 dark:border-zinc-800 select-none">
                        {index + 1}
                      </td>
                      <td className="py-1.5 px-3 text-emerald-700 dark:text-emerald-400 font-semibold border-r border-zinc-100 dark:border-zinc-800">
                        {employee.Employee_ID}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-zinc-900 dark:text-zinc-100 border-r border-zinc-100 dark:border-zinc-800">
                        {employee.Name}
                      </td>
                      <td className="py-1.5 px-3 border-r border-zinc-100 dark:border-zinc-800">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {employee.Role}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-zinc-600 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800 whitespace-nowrap">
                        {employee.Phone_Number}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800">
                        {employee.Assigned_Zone || 'All Zones'}
                      </td>
                      <td className="py-1.5 px-3 text-center border-r border-zinc-100 dark:border-zinc-800">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            employee.Status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {employee.Status}
                        </span>
                      </td>
                      {role === 'admin' && (
                        <td className="py-1 px-1.5 text-center">
                          <button
                            onClick={() => handleDeleteRow(index)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                            title="Delete Employee Record"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Inventory' && (
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 sticky top-0 z-10 select-none border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="py-2 px-2.5 text-center text-[10px] text-zinc-400 border-r border-zinc-200 dark:border-zinc-700 w-10">
                    #
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Item_Name
                  </th>
                  <th className="py-2 px-3 font-bold text-right border-r border-zinc-200 dark:border-zinc-700">
                    Unit_Price (৳)
                  </th>
                  <th className="py-2 px-3 font-bold text-right border-r border-zinc-200 dark:border-zinc-700">
                    Stock_Qty
                  </th>
                  <th className="py-2 px-3 font-bold text-right">
                    Stock Value (৳)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {inventory
                  .filter((i) => i.Item_Name.toLowerCase().includes(search.toLowerCase()))
                  .map((item, index) => (
                    <tr
                      key={item.Item_Name}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <td className="py-1.5 px-2 text-center text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-850 border-r border-zinc-200 dark:border-zinc-800 select-none">
                        {index + 1}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-zinc-900 dark:text-zinc-100 border-r border-zinc-100 dark:border-zinc-800">
                        {item.Item_Name}
                      </td>
                      <td className="py-1.5 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 border-r border-zinc-100 dark:border-zinc-800">
                        ৳ {item.Unit_Price}
                      </td>
                      <td className="py-1.5 px-3 text-right font-black text-zinc-900 dark:text-zinc-100 border-r border-zinc-100 dark:border-zinc-800">
                        {item.Stock_Qty}
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-zinc-700 dark:text-zinc-300">
                        ৳ {(item.Stock_Qty * item.Unit_Price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Orders' && (
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 sticky top-0 z-10 select-none border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="py-2 px-2.5 text-center text-[10px] text-zinc-400 border-r border-zinc-200 dark:border-zinc-700 w-10">
                    #
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Order_ID
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Date
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Company_Name
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Item_Name
                  </th>
                  <th className="py-2 px-3 font-bold text-center border-r border-zinc-200 dark:border-zinc-700">
                    Quantity
                  </th>
                  <th className="py-2 px-3 font-bold text-right border-r border-zinc-200 dark:border-zinc-700">
                    Total_Bill
                  </th>
                  <th className="py-2 px-3 font-bold text-right border-r border-zinc-200 dark:border-zinc-700">
                    Paid_Amount
                  </th>
                  <th className="py-2 px-3 font-bold text-right border-r border-zinc-200 dark:border-zinc-700">
                    Due_Amount
                  </th>
                  <th className="py-2 px-3 font-bold text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {orders
                  .filter(
                    (o) =>
                      o.Company_Name.toLowerCase().includes(search.toLowerCase()) ||
                      o.Item_Name.toLowerCase().includes(search.toLowerCase()) ||
                      o.Order_ID.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((order, index) => (
                    <tr
                      key={order.Order_ID}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <td className="py-1.5 px-2 text-center text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-850 border-r border-zinc-200 dark:border-zinc-800 select-none">
                        {index + 1}
                      </td>
                      <td className="py-1.5 px-3 text-emerald-700 dark:text-emerald-400 font-semibold border-r border-zinc-100 dark:border-zinc-800">
                        {order.Order_ID}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-500 border-r border-zinc-100 dark:border-zinc-800 whitespace-nowrap">
                        {order.Date}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-zinc-900 dark:text-zinc-100 border-r border-zinc-100 dark:border-zinc-800 max-w-[180px] truncate">
                        {order.Company_Name}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-700 dark:text-zinc-300 border-r border-zinc-100 dark:border-zinc-800 max-w-[180px] truncate">
                        {order.Item_Name}
                      </td>
                      <td className="py-1.5 px-3 text-center font-bold border-r border-zinc-100 dark:border-zinc-800">
                        {order.Quantity}
                      </td>
                      <td className="py-1.5 px-3 text-right font-black border-r border-zinc-100 dark:border-zinc-800">
                        ৳ {order.Total_Bill.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-3 text-right font-semibold text-emerald-600 border-r border-zinc-100 dark:border-zinc-800">
                        ৳ {order.Paid_Amount.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-rose-600 border-r border-zinc-100 dark:border-zinc-800">
                        ৳ {order.Due_Amount.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.Status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {order.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Returns' && (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 sticky top-0 z-10 select-none border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="py-2 px-2.5 text-center text-[10px] text-zinc-400 border-r border-zinc-200 dark:border-zinc-700 w-10">
                    #
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Date
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Company_Name
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Item_Name
                  </th>
                  <th className="py-2 px-3 font-bold text-center border-r border-zinc-200 dark:border-zinc-700">
                    Return_Qty
                  </th>
                  <th className="py-2 px-3 font-bold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {returns
                  .filter(
                    (r) =>
                      r.Company_Name.toLowerCase().includes(search.toLowerCase()) ||
                      r.Item_Name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((ret, index) => (
                    <tr
                      key={ret.Return_ID || index}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <td className="py-1.5 px-2 text-center text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-850 border-r border-zinc-200 dark:border-zinc-800 select-none">
                        {index + 1}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-500 border-r border-zinc-100 dark:border-zinc-800 whitespace-nowrap">
                        {ret.Date}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-zinc-900 dark:text-zinc-100 border-r border-zinc-100 dark:border-zinc-800">
                        {ret.Company_Name}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-700 dark:text-zinc-300 border-r border-zinc-100 dark:border-zinc-800">
                        {ret.Item_Name}
                      </td>
                      <td className="py-1.5 px-3 text-center font-bold text-rose-600 border-r border-zinc-100 dark:border-zinc-800">
                        {ret.Return_Qty}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-600 dark:text-zinc-400">
                        {ret.Reason}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Expenses' && (
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 sticky top-0 z-10 select-none border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="py-2 px-2.5 text-center text-[10px] text-zinc-400 border-r border-zinc-200 dark:border-zinc-700 w-10">
                    #
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Date
                  </th>
                  <th className="py-2 px-3 font-bold border-r border-zinc-200 dark:border-zinc-700">
                    Expense_Type
                  </th>
                  <th className="py-2 px-3 font-bold text-right border-r border-zinc-200 dark:border-zinc-700">
                    Amount (৳)
                  </th>
                  <th className="py-2 px-3 font-bold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {expenses
                  .filter(
                    (e) =>
                      e.Expense_Type.toLowerCase().includes(search.toLowerCase()) ||
                      e.Note.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((exp, index) => (
                    <tr
                      key={exp.Expense_ID || index}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <td className="py-1.5 px-2 text-center text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-850 border-r border-zinc-200 dark:border-zinc-800 select-none">
                        {index + 1}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-500 border-r border-zinc-100 dark:border-zinc-800 whitespace-nowrap">
                        {exp.Date}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-emerald-800 dark:text-emerald-300 border-r border-zinc-100 dark:border-zinc-800">
                        {exp.Expense_Type}
                      </td>
                      <td className="py-1.5 px-3 text-right font-black text-rose-600 dark:text-rose-400 border-r border-zinc-100 dark:border-zinc-800">
                        ৳ {exp.Amount.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-600 dark:text-zinc-400 max-w-[250px] truncate">
                        {exp.Note}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Formula / Status Bar at bottom of table (Like Google Sheets bottom status bar) */}
        <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-emerald-800 dark:text-emerald-300 truncate">
            {getTabFormulaSummary()}
          </span>
          <span className="text-[10px] text-zinc-400 shrink-0 ml-2">
            Tab: {activeTab}
          </span>
        </div>
      </div>

      {/* Discreet Private Settings (Hidden from main dashboard, employees & customers) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          onClick={() => setIsSecretSectionOpen(!isSecretSectionOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-850/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
              <Lock size={14} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                🔒 অভ্যন্তরীণ ও মোবাইল কানেকশন সেটিংস (Private App Settings)
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                মোবাইল অ্যাপ ইনস্টল, QR কোড ও ব্যাকআপ (চোখের আড়ালে সংরক্ষিত)
              </p>
            </div>
          </div>
          {isSecretSectionOpen ? (
            <ChevronUp size={16} className="text-zinc-400" />
          ) : (
            <ChevronDown size={16} className="text-zinc-400" />
          )}
        </button>

        {isSecretSectionOpen && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              এই অপশনটি কর্মচারীদের ও সাধারণ ক্রেতাদের চোখের আড়ালে রাখার জন্য প্রধান স্ক্রিন থেকে সরিয়ে এখানে রাখা হয়েছে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {onOpenInstallModal && (
                <button
                  onClick={onOpenInstallModal}
                  className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2.5 shadow-sm active:scale-95 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0">
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <span className="block">📲 মোবাইলে অ্যাপ নিন (QR Code)</span>
                    <span className="text-[10px] text-emerald-200 font-normal">মোবাইল ইনস্টলেশন ও সরাসরি লিঙ্ক</span>
                  </div>
                </button>
              )}

              <button
                onClick={downloadAllDataJSON}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-2.5 shadow-sm active:scale-95 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                  <Download size={16} />
                </div>
                <div>
                  <span className="block">💾 সম্পূর্ণ ব্যাকআপ ফাইল (JSON)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">১ ক্লিকে সব ডেটা অফলাইনে ডাউনলোড</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
