/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Company,
  Employee,
  InventoryItem,
  Order,
  ReturnRecord,
  Expense,
  PaymentTransaction,
  UserRole,
  GoogleSheetsConfig,
} from './types';
import {
  getStoredCompanies,
  getStoredEmployees,
  getStoredInventory,
  getStoredOrders,
  getStoredReturns,
  getStoredExpenses,
  getStoredPayments,
  getStoredSheetsConfig,
  saveCompanies,
  saveEmployees,
  saveInventory,
  saveOrders,
  saveExpenses,
  saveSheetsConfig,
  createOrderWithCalculations,
  recordPaymentCollection,
  recordReturnWithCalculations,
  recordProductionBatch,
  deleteStoredCompany,
  deleteStoredProduct,
  deleteStoredOrder,
  deleteStoredPayment,
  clearAllApplicationData,
  fetchServerDatabase,
  pushDatabaseToServer,
} from './services/storageService';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { TodaysOrdersScreen } from './components/TodaysOrdersScreen';
import { CustomerLedgerScreen } from './components/CustomerLedgerScreen';
import { EmployeesScreen } from './components/EmployeesScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { ExpensesScreen } from './components/ExpensesScreen';
import { SheetDatabaseScreen } from './components/SheetDatabaseScreen';
import { QuickOrderModal } from './components/QuickOrderModal';
import { InvoiceModal } from './components/InvoiceModal';
import { PaymentModal } from './components/PaymentModal';
import { ProductionBatchModal } from './components/ProductionBatchModal';
import { ReturnRecordModal } from './components/ReturnRecordModal';
import { RoleSwitchModal } from './components/RoleSwitchModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { AddCompanyModal } from './components/AddCompanyModal';
import { AddProductModal } from './components/AddProductModal';
import { TodaysCollectionsModal } from './components/TodaysCollectionsModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { DataManagementModal } from './components/DataManagementModal';
import { PWAInstallModal } from './components/PWAInstallModal';

export default function App() {
  // State for Database
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(getStoredSheetsConfig());

  // UI State
  const [role, setRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDesktopWide, setIsDesktopWide] = useState<boolean>(false);

  // Modals
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [quickOrderCompany, setQuickOrderCompany] = useState<string | undefined>(undefined);

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentCompany, setPaymentCompany] = useState<string | undefined>(undefined);

  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isRoleSwitchOpen, setIsRoleSwitchOpen] = useState(false);
  const [isSheetsSyncOpen, setIsSheetsSyncOpen] = useState(false);

  // New Creation Modals (User requested to add employees, companies, products easily)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isTodaysCollectionsOpen, setIsTodaysCollectionsOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Multi-device sync state
  const [lastSyncTime, setLastSyncTime] = useState<string>('সবেমাত্র');

  const syncWithServer = async () => {
    try {
      const serverDb = await fetchServerDatabase();
      if (serverDb) {
        if (Array.isArray(serverDb.companies)) setCompanies(serverDb.companies);
        if (Array.isArray(serverDb.employees)) setEmployees(serverDb.employees);
        if (Array.isArray(serverDb.inventory)) setInventory(serverDb.inventory);
        if (Array.isArray(serverDb.orders)) setOrders(serverDb.orders);
        if (Array.isArray(serverDb.returns)) setReturns(serverDb.returns);
        if (Array.isArray(serverDb.expenses)) setExpenses(serverDb.expenses);
        if (Array.isArray(serverDb.payments)) setPayments(serverDb.payments);
        if (serverDb.config) setSheetsConfig(serverDb.config);
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(time);
      }
    } catch {
      // Ignore network errors in polling
    }
  };

  // Load from local storage and sync with central server on mount & interval
  useEffect(() => {
    // 1. Initial local load
    reloadAllData();

    // 2. Fetch server database immediately for multi-device sync
    syncWithServer();

    // 3. Automated real-time background sync every 5 seconds
    const interval = setInterval(() => {
      syncWithServer();
    }, 5000);

    // 4. Fetch immediately whenever tab or phone screen wakes up
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        syncWithServer();
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const storedRole = localStorage.getItem('dessertboss_user_role') as UserRole;
    if (storedRole === 'admin' || storedRole === 'staff') {
      setRole(storedRole);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  const reloadAllData = () => {
    setCompanies(getStoredCompanies());
    setEmployees(getStoredEmployees());
    setInventory(getStoredInventory());
    setOrders(getStoredOrders());
    setReturns(getStoredReturns());
    setExpenses(getStoredExpenses());
    setPayments(getStoredPayments());
    setSheetsConfig(getStoredSheetsConfig());
    syncWithServer();
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('dessertboss_user_role', newRole);
  };

  // Employee Handlers
  const handleSaveEmployee = (newEmployee: Employee) => {
    const updated = [newEmployee, ...employees];
    setEmployees(updated);
    saveEmployees(updated);
  };

  const handleDeleteEmployee = (id: string) => {
    const updated = employees.filter((e) => e.Employee_ID !== id);
    setEmployees(updated);
    saveEmployees(updated);
  };

  const handleToggleEmployeeStatus = (id: string) => {
    const updated = employees.map((e) =>
      e.Employee_ID === id
        ? { ...e, Status: (e.Status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' }
        : e
    );
    setEmployees(updated);
    saveEmployees(updated);
  };

  // Company Handlers
  const handleSaveCompany = (newCompany: Company) => {
    const updated = [...companies, newCompany];
    setCompanies(updated);
    saveCompanies(updated);
  };

  const handleDeleteCompany = (id: string) => {
    const updated = deleteStoredCompany(id);
    setCompanies(updated);
  };

  // Product / Inventory Handlers
  const handleSaveProduct = (newProduct: InventoryItem) => {
    const updated = [...inventory, newProduct];
    setInventory(updated);
    saveInventory(updated);
  };

  const handleDeleteProduct = (itemName: string) => {
    const updated = deleteStoredProduct(itemName);
    setInventory(updated);
  };

  // Order Handlers
  const handleOpenQuickOrder = (companyName?: string) => {
    setQuickOrderCompany(companyName);
    setIsQuickOrderOpen(true);
  };

  const handleSaveOrder = (newOrder: Order) => {
    const result = createOrderWithCalculations(newOrder);
    setOrders(result.orders);
    setCompanies(result.companies);
    setInventory(result.inventory);
    setPayments(result.payments);
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = deleteStoredOrder(orderId);
    setOrders(updated);
  };

  const handleOrderSavedOpenInvoice = (savedOrder: Order) => {
    setSelectedInvoiceOrder(savedOrder);
    setIsInvoiceOpen(true);
  };

  const handleOpenInvoice = (order: Order) => {
    setSelectedInvoiceOrder(order);
    setIsInvoiceOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'Pending' | 'Delivered') => {
    const updated = orders.map((o) => (o.Order_ID === orderId ? { ...o, Status: status } : o));
    setOrders(updated);
    saveOrders(updated);
  };

  // Payment Handlers
  const handleOpenPaymentModal = (companyName?: string) => {
    setPaymentCompany(companyName);
    setIsPaymentOpen(true);
  };

  const handleRecordPayment = (
    companyName: string,
    amount: number,
    method: PaymentTransaction['Payment_Method'],
    reference: string,
    receivedBy: string
  ) => {
    const result = recordPaymentCollection(companyName, amount, method, reference, receivedBy);
    setCompanies(result.companies);
    setPayments(result.payments);
  };

  const handleDeletePayment = (paymentId: string) => {
    const updated = deleteStoredPayment(paymentId);
    setPayments(updated);
  };

  // Return Handlers
  const handleRecordReturn = (record: ReturnRecord, adjustDue: boolean) => {
    const result = recordReturnWithCalculations(record, adjustDue);
    setReturns(result.returns);
    setCompanies(result.companies);
    setInventory(result.inventory);
  };

  // Production Handlers
  const handleAddProductionBatch = (itemName: string, quantity: number, notes?: string) => {
    const updated = recordProductionBatch(itemName, quantity, notes);
    setInventory(updated);
  };

  // Expense Handlers
  const handleAddExpense = (expense: Expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.Expense_ID !== id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrdersCount = orders.filter((o) => o.Date === todayStr).length;
  const lowStockCount = inventory.filter((i) => i.Stock_Qty <= (i.Min_Alert_Qty || 30)).length;

  const invoiceCompany = selectedInvoiceOrder
    ? companies.find((c) => c.Company_Name === selectedInvoiceOrder.Company_Name)
    : undefined;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        role={role}
        onOpenRoleSwitch={() => setIsRoleSwitchOpen(true)}
        sheetsConfig={sheetsConfig}
        onOpenSheetsSync={() => setActiveTab('sheet')}
        isDesktopWide={isDesktopWide}
        onToggleDesktopWide={() => setIsDesktopWide(!isDesktopWide)}
        onOpenDataManagement={() => setIsDataManagementOpen(true)}
      />

      {/* Main Container - Responsive Glide Mobile Frame or Wide Mode */}
      <main className="flex-1 w-full flex justify-center px-2 sm:px-4">
        <div
          className={`w-full transition-all duration-300 ${
            isDesktopWide ? 'max-w-5xl' : 'max-w-md md:max-w-lg'
          }`}
        >
          {activeTab === 'dashboard' && (
            <HomeDashboard
              companies={companies}
              inventory={inventory}
              orders={orders}
              expenses={expenses}
              payments={payments}
              role={role}
              onOpenQuickOrder={handleOpenQuickOrder}
              onOpenProductionModal={() => setIsProductionOpen(true)}
              onOpenPaymentModal={handleOpenPaymentModal}
              onOpenInvoice={handleOpenInvoice}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
              onOpenAddCompany={() => setIsAddCompanyOpen(true)}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onOpenTodaysCollections={() => setIsTodaysCollectionsOpen(true)}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenDataManagement={() => setIsDataManagementOpen(true)}
            />
          )}

          {activeTab === 'today-orders' && (
            <TodaysOrdersScreen
              companies={companies}
              orders={orders}
              employees={employees}
              onOpenQuickOrder={handleOpenQuickOrder}
              onOpenInvoice={handleOpenInvoice}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenPaymentModal={handleOpenPaymentModal}
              onOpenAddCompany={() => setIsAddCompanyOpen(true)}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'ledger' && (
            <CustomerLedgerScreen
              companies={companies}
              orders={orders}
              payments={payments}
              returns={returns}
              employees={employees}
              role={role}
              onOpenQuickOrder={handleOpenQuickOrder}
              onOpenPaymentModal={handleOpenPaymentModal}
              onOpenInvoice={handleOpenInvoice}
              onOpenAddCompany={() => setIsAddCompanyOpen(true)}
              onOpenTodaysCollections={() => setIsTodaysCollectionsOpen(true)}
              onDeleteCompany={handleDeleteCompany}
              onDeleteOrder={handleDeleteOrder}
              onDeletePayment={handleDeletePayment}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesScreen
              employees={employees}
              companies={companies}
              orders={orders}
              role={role}
              onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
              onDeleteEmployee={handleDeleteEmployee}
              onToggleStatus={handleToggleEmployeeStatus}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryScreen
              inventory={inventory}
              orders={orders}
              returns={returns}
              companies={companies}
              role={role}
              onOpenProductionModal={() => setIsProductionOpen(true)}
              onOpenReturnModal={() => setIsReturnOpen(true)}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'sheet' && (
            <SheetDatabaseScreen
              companies={companies}
              employees={employees}
              inventory={inventory}
              orders={orders}
              returns={returns}
              expenses={expenses}
              role={role}
              sheetsConfig={sheetsConfig}
              onOpenSyncSettings={() => setIsSheetsSyncOpen(true)}
              onRefreshData={reloadAllData}
              onUpdateCompanies={(updated) => setCompanies(updated)}
              onUpdateEmployees={(updated) => setEmployees(updated)}
              onUpdateInventory={(updated) => setInventory(updated)}
              onUpdateOrders={(updated) => setOrders(updated)}
              onUpdateReturns={(updated) => setReturns(updated)}
              onUpdateExpenses={(updated) => setExpenses(updated)}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesScreen
              expenses={expenses}
              orders={orders}
              role={role}
              employees={employees}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onSwitchToAdmin={() => setIsRoleSwitchOpen(true)}
              onOpenAddExpenseModal={() => setIsAddExpenseOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Glide Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        todayOrdersCount={todayOrdersCount}
        lowStockCount={lowStockCount}
        employeesCount={employees.length}
        role={role}
      />

      {/* Modals & Dialogs */}
      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        companies={companies}
        inventory={inventory}
        employees={employees}
        preselectedCompany={quickOrderCompany}
        onSaveOrder={handleSaveOrder}
        onOrderSavedOpenInvoice={handleOrderSavedOpenInvoice}
        onOpenAddCompany={() => {
          setIsQuickOrderOpen(false);
          setIsAddCompanyOpen(true);
        }}
      />

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={selectedInvoiceOrder}
        company={invoiceCompany}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        companies={companies}
        employees={employees}
        preselectedCompany={paymentCompany}
        onRecordPayment={handleRecordPayment}
      />

      <TodaysCollectionsModal
        isOpen={isTodaysCollectionsOpen}
        onClose={() => setIsTodaysCollectionsOpen(false)}
        payments={payments}
        companies={companies}
        employees={employees}
        onOpenPaymentModal={(companyName) => {
          handleOpenPaymentModal(companyName);
        }}
        onSelectCompanyForLedger={(company) => {
          setActiveTab('ledger');
        }}
        onDeletePayment={handleDeletePayment}
      />

      <ProductionBatchModal
        isOpen={isProductionOpen}
        onClose={() => setIsProductionOpen(false)}
        inventory={inventory}
        onAddProductionBatch={handleAddProductionBatch}
      />

      <ReturnRecordModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        companies={companies}
        inventory={inventory}
        onRecordReturn={handleRecordReturn}
      />

      <RoleSwitchModal
        isOpen={isRoleSwitchOpen}
        onClose={() => setIsRoleSwitchOpen(false)}
        currentRole={role}
        onSelectRole={handleRoleChange}
      />

      <GoogleSheetsSyncModal
        isOpen={isSheetsSyncOpen}
        onClose={() => setIsSheetsSyncOpen(false)}
        config={sheetsConfig}
        onUpdateConfig={(cfg) => setSheetsConfig(cfg)}
        companies={companies}
        employees={employees}
        inventory={inventory}
        orders={orders}
        returns={returns}
        expenses={expenses}
        onDataReset={reloadAllData}
      />

      {/* New Entity Addition Modals */}
      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onSaveEmployee={handleSaveEmployee}
      />

      <AddCompanyModal
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
        onSaveCompany={handleSaveCompany}
        employees={employees}
        existingCompaniesCount={companies.length}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSaveProduct={handleSaveProduct}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSaveExpense={handleAddExpense}
        employees={employees}
      />

      {/* Data Management & Deletion Modal */}
      <DataManagementModal
        isOpen={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
        onDataReset={reloadAllData}
      />

      {/* PWA Phone Installation Guide Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}

