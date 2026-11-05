import {
  Company,
  InventoryItem,
  Order,
  ReturnRecord,
  Expense,
  PaymentTransaction,
  ProductionBatch,
  GoogleSheetsConfig,
  Employee,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_INVENTORY,
  INITIAL_ORDERS,
  INITIAL_RETURNS,
  INITIAL_EXPENSES,
  INITIAL_PAYMENTS,
  INITIAL_EMPLOYEES,
  DEMO_SAMPLE_COMPANIES,
} from '../data/initialData';

const STORAGE_KEYS = {
  COMPANIES: 'dessertboss_companies',
  EMPLOYEES: 'dessertboss_employees',
  INVENTORY: 'dessertboss_inventory',
  ORDERS: 'dessertboss_orders',
  RETURNS: 'dessertboss_returns',
  EXPENSES: 'dessertboss_expenses',
  PAYMENTS: 'dessertboss_payments',
  BATCHES: 'dessertboss_batches',
  CONFIG: 'dessertboss_sheets_config',
  ROLE: 'dessertboss_user_role',
};

// ================= Central Server Sync Engine =================
let syncTimer: any = null;

export const pushDatabaseToServer = async () => {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      const payload = {
        companies: getStoredCompanies(),
        employees: getStoredEmployees(),
        inventory: getStoredInventory(),
        orders: getStoredOrders(),
        returns: getStoredReturns(),
        expenses: getStoredExpenses(),
        payments: getStoredPayments(),
        config: getStoredSheetsConfig(),
      };
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Offline or network error handled gracefully
    }
  }, 300);
};

export const fetchServerDatabase = async () => {
  try {
    const res = await fetch('/api/db');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      const { companies, employees, inventory, orders, returns, expenses, payments, config } = json.data;
      if (Array.isArray(companies)) localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
      if (Array.isArray(employees)) localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      if (Array.isArray(inventory)) localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
      if (Array.isArray(orders)) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      if (Array.isArray(returns)) localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));
      if (Array.isArray(expenses)) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      if (Array.isArray(payments)) localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
      if (config) localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
      return json.data;
    }
  } catch {
    // Return null if offline
  }
  return null;
};

export const getStoredEmployees = (): Employee[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    return INITIAL_EMPLOYEES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_EMPLOYEES;
  }
};

export const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  pushDatabaseToServer();
};

export const getStoredCompanies = (): Company[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(INITIAL_COMPANIES));
    return INITIAL_COMPANIES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_COMPANIES;
  }
};

export const getStoredInventory = (): InventoryItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    return INITIAL_INVENTORY;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_INVENTORY;
  }
};

export const getStoredOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ORDERS;
  }
};

export const getStoredReturns = (): ReturnRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RETURNS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(INITIAL_RETURNS));
    return INITIAL_RETURNS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_RETURNS;
  }
};

export const getStoredExpenses = (): Expense[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    return INITIAL_EXPENSES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_EXPENSES;
  }
};

export const getStoredPayments = (): PaymentTransaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    return INITIAL_PAYMENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PAYMENTS;
  }
};

export const getStoredSheetsConfig = (): GoogleSheetsConfig => {
  const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (!data) {
    const defaultConfig: GoogleSheetsConfig = {
      sheetId: '1DESSERT-BOSS-DISTRIBUTION-SHEET-2026',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1DESSERT-BOSS-DISTRIBUTION-SHEET-2026',
      webhookUrl: '',
      autoSync: false,
      status: 'connected',
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(defaultConfig));
    return defaultConfig;
  }
  try {
    return JSON.parse(data);
  } catch {
    return {
      sheetId: '',
      status: 'disconnected',
      autoSync: false,
    };
  }
};

export const saveSheetsConfig = (config: GoogleSheetsConfig) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  pushDatabaseToServer();
};

// ================= Automated Computations & Storage Updates =================

export const saveCompanies = (companies: Company[]) => {
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  pushDatabaseToServer();
};

export const saveInventory = (inventory: InventoryItem[]) => {
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  pushDatabaseToServer();
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  pushDatabaseToServer();
};

export const saveReturns = (returns: ReturnRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));
  pushDatabaseToServer();
};

export const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  pushDatabaseToServer();
};

export const savePayments = (payments: PaymentTransaction[]) => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  pushDatabaseToServer();
};

/**
 * Creates a new order:
 * 1. Appends order to Orders tab
 * 2. Deducts item quantities from Inventory Stock_Qty
 * 3. Updates Company Current_Due by Due_Amount
 * 4. Records payment if paid amount > 0
 */
export const createOrderWithCalculations = (
  newOrder: Order,
  paymentDetails?: { method: PaymentTransaction['Payment_Method']; reference?: string; receiver: string }
): { orders: Order[]; companies: Company[]; inventory: InventoryItem[]; payments: PaymentTransaction[] } => {
  const orders = getStoredOrders();
  const companies = getStoredCompanies();
  const inventory = getStoredInventory();
  const payments = getStoredPayments();

  // 1. Add order
  const updatedOrders = [newOrder, ...orders];
  saveOrders(updatedOrders);

  // 2. Adjust inventory stock
  const updatedInventory = [...inventory];
  if (newOrder.Items && newOrder.Items.length > 0) {
    for (const item of newOrder.Items) {
      const idx = updatedInventory.findIndex((i) => i.Item_Name === item.Item_Name);
      if (idx !== -1) {
        updatedInventory[idx] = {
          ...updatedInventory[idx],
          Stock_Qty: Math.max(0, updatedInventory[idx].Stock_Qty - item.Quantity),
        };
      }
    }
  } else {
    const idx = updatedInventory.findIndex((i) => i.Item_Name === newOrder.Item_Name);
    if (idx !== -1) {
      updatedInventory[idx] = {
        ...updatedInventory[idx],
        Stock_Qty: Math.max(0, updatedInventory[idx].Stock_Qty - newOrder.Quantity),
      };
    }
  }
  saveInventory(updatedInventory);

  // 3. Update customer Current_Due
  const companyIndex = companies.findIndex((c) => c.Company_Name === newOrder.Company_Name);
  let updatedCompanies = [...companies];
  if (companyIndex !== -1) {
    const existingDue = updatedCompanies[companyIndex].Current_Due || 0;
    updatedCompanies[companyIndex] = {
      ...updatedCompanies[companyIndex],
      Current_Due: existingDue + newOrder.Due_Amount,
    };
    saveCompanies(updatedCompanies);
  }

  // 4. Record payment if applicable
  let updatedPayments = [...payments];
  if (newOrder.Paid_Amount > 0) {
    const newPayment: PaymentTransaction = {
      Payment_ID: `PAY-${Date.now().toString().slice(-4)}`,
      Date: newOrder.Date,
      Company_Name: newOrder.Company_Name,
      Amount: newOrder.Paid_Amount,
      Payment_Method: paymentDetails?.method || (newOrder.Payment_Method as any) || 'Cash',
      Reference: paymentDetails?.reference || `Order #${newOrder.Order_ID}`,
      Received_By: paymentDetails?.receiver || 'Staff',
    };
    updatedPayments = [newPayment, ...updatedPayments];
    savePayments(updatedPayments);
  }

  return {
    orders: updatedOrders,
    companies: updatedCompanies,
    inventory: updatedInventory,
    payments: updatedPayments,
  };
};

/**
 * Records a direct payment collection from a company:
 * 1. Adds to Payments ledger
 * 2. Reduces company Current_Due
 */
export const recordPaymentCollection = (
  companyName: string,
  amount: number,
  method: PaymentTransaction['Payment_Method'],
  reference: string,
  receivedBy: string
): { companies: Company[]; payments: PaymentTransaction[] } => {
  const companies = getStoredCompanies();
  const payments = getStoredPayments();
  const today = new Date().toISOString().split('T')[0];

  const newPayment: PaymentTransaction = {
    Payment_ID: `PAY-${Date.now().toString().slice(-5)}`,
    Date: today,
    Company_Name: companyName,
    Amount: amount,
    Payment_Method: method,
    Reference: reference || 'Counter Collection',
    Received_By: receivedBy,
  };

  const updatedPayments = [newPayment, ...payments];
  savePayments(updatedPayments);

  const updatedCompanies = companies.map((comp) => {
    if (comp.Company_Name === companyName) {
      return {
        ...comp,
        Current_Due: Math.max(0, comp.Current_Due - amount),
      };
    }
    return comp;
  });
  saveCompanies(updatedCompanies);

  return {
    companies: updatedCompanies,
    payments: updatedPayments,
  };
};

/**
 * Records a dessert return:
 * 1. Adds to Returns tab
 * 2. If credit due is requested, deducts credit amount from customer Current_Due
 * 3. If restocked, increases inventory stock
 */
export const recordReturnWithCalculations = (
  returnRecord: ReturnRecord,
  adjustDue: boolean = true
): { returns: ReturnRecord[]; companies: Company[]; inventory: InventoryItem[] } => {
  const returns = getStoredReturns();
  const companies = getStoredCompanies();
  const inventory = getStoredInventory();

  const updatedReturns = [returnRecord, ...returns];
  saveReturns(updatedReturns);

  let updatedCompanies = [...companies];
  if (adjustDue && returnRecord.Credit_Amount && returnRecord.Credit_Amount > 0) {
    updatedCompanies = companies.map((c) => {
      if (c.Company_Name === returnRecord.Company_Name) {
        return {
          ...c,
          Current_Due: Math.max(0, c.Current_Due - (returnRecord.Credit_Amount || 0)),
        };
      }
      return c;
    });
    saveCompanies(updatedCompanies);
  }

  let updatedInventory = [...inventory];
  if (returnRecord.Action_Taken === 'Restocked') {
    updatedInventory = inventory.map((item) => {
      if (item.Item_Name === returnRecord.Item_Name) {
        return {
          ...item,
          Stock_Qty: item.Stock_Qty + returnRecord.Return_Qty,
        };
      }
      return item;
    });
    saveInventory(updatedInventory);
  }

  return {
    returns: updatedReturns,
    companies: updatedCompanies,
    inventory: updatedInventory,
  };
};

/**
 * Adds a new production batch into inventory:
 */
export const recordProductionBatch = (
  itemName: string,
  quantity: number,
  notes?: string
): InventoryItem[] => {
  const inventory = getStoredInventory();
  const updated = inventory.map((item) => {
    if (item.Item_Name === itemName) {
      return {
        ...item,
        Stock_Qty: item.Stock_Qty + quantity,
      };
    }
    return item;
  });
  saveInventory(updated);
  return updated;
};

// ================= Deletion & Database Customization =================

export const deleteStoredCompany = (companyId: string): Company[] => {
  const companies = getStoredCompanies().filter((c) => c.Company_ID !== companyId);
  saveCompanies(companies);
  return companies;
};

export const deleteStoredProduct = (itemName: string): InventoryItem[] => {
  const inventory = getStoredInventory().filter((i) => i.Item_Name !== itemName);
  saveInventory(inventory);
  return inventory;
};

export const deleteStoredOrder = (orderId: string): Order[] => {
  const orders = getStoredOrders().filter((o) => o.Order_ID !== orderId);
  saveOrders(orders);
  return orders;
};

export const deleteStoredPayment = (paymentId: string): PaymentTransaction[] => {
  const payments = getStoredPayments().filter((p) => p.Payment_ID !== paymentId);
  savePayments(payments);
  return payments;
};

export const deleteStoredReturn = (returnId: string): ReturnRecord[] => {
  const returns = getStoredReturns().filter((r) => r.Return_ID !== returnId);
  saveReturns(returns);
  return returns;
};

export const clearAllApplicationData = () => {
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify([]));
  pushDatabaseToServer();
};

// ================= Google Sheets CSV & Apps Script Exporters =================

export const generateTabCSV = (
  tab: 'Companies' | 'Employees' | 'Inventory' | 'Orders' | 'Returns' | 'Expenses'
): string => {
  if (tab === 'Companies') {
    const data = getStoredCompanies();
    const headers = ['Company_ID', 'Company_Name', 'Phone_Number', 'Address', 'Current_Due'];
    const rows = data.map((c) => [
      c.Company_ID,
      `"${c.Company_Name.replace(/"/g, '""')}"`,
      `"${c.Phone_Number}"`,
      `"${c.Address.replace(/"/g, '""')}"`,
      c.Current_Due,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  if (tab === 'Inventory') {
    const data = getStoredInventory();
    const headers = ['Item_Name', 'Unit_Price', 'Stock_Qty'];
    const rows = data.map((i) => [
      `"${i.Item_Name.replace(/"/g, '""')}"`,
      i.Unit_Price,
      i.Stock_Qty,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  if (tab === 'Orders') {
    const data = getStoredOrders();
    const headers = ['Order_ID', 'Date', 'Company_Name', 'Item_Name', 'Quantity', 'Total_Bill', 'Paid_Amount', 'Due_Amount', 'Status'];
    const rows = data.map((o) => [
      o.Order_ID,
      o.Date,
      `"${o.Company_Name.replace(/"/g, '""')}"`,
      `"${o.Item_Name.replace(/"/g, '""')}"`,
      o.Quantity,
      o.Total_Bill,
      o.Paid_Amount,
      o.Due_Amount,
      o.Status,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  if (tab === 'Returns') {
    const data = getStoredReturns();
    const headers = ['Date', 'Company_Name', 'Item_Name', 'Return_Qty', 'Reason'];
    const rows = data.map((r) => [
      r.Date,
      `"${r.Company_Name.replace(/"/g, '""')}"`,
      `"${r.Item_Name.replace(/"/g, '""')}"`,
      r.Return_Qty,
      `"${r.Reason}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  if (tab === 'Employees') {
    const data = getStoredEmployees();
    const headers = ['Employee_ID', 'Name', 'Role', 'Phone_Number', 'Assigned_Zone', 'Status'];
    const rows = data.map((emp) => [
      emp.Employee_ID,
      `"${emp.Name.replace(/"/g, '""')}"`,
      `"${emp.Role}"`,
      `"${emp.Phone_Number}"`,
      `"${(emp.Assigned_Zone || '').replace(/"/g, '""')}"`,
      emp.Status,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  if (tab === 'Expenses') {
    const data = getStoredExpenses();
    const headers = ['Date', 'Expense_Type', 'Amount', 'Note'];
    const rows = data.map((e) => [
      e.Date,
      `"${e.Expense_Type}"`,
      e.Amount,
      `"${e.Note.replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  return '';
};

export const downloadCSV = (tab: 'Companies' | 'Employees' | 'Inventory' | 'Orders' | 'Returns' | 'Expenses') => {
  const csvContent = generateTabCSV(tab);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Dessert_Boss_${tab}_Tab.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAllDataJSON = () => {
  const fullBackup = {
    exportedAt: new Date().toISOString(),
    companies: getStoredCompanies(),
    employees: getStoredEmployees(),
    inventory: getStoredInventory(),
    orders: getStoredOrders(),
    returns: getStoredReturns(),
    expenses: getStoredExpenses(),
    payments: getStoredPayments(),
  };
  const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Dessert_Boss_Full_Database_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const resetToInitialData = () => {
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(INITIAL_COMPANIES));
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(INITIAL_RETURNS));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
};

export const clearAllDatabaseData = () => {
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
};

export const loadDemoSampleCompanies = () => {
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(DEMO_SAMPLE_COMPANIES));
  return DEMO_SAMPLE_COMPANIES;
};

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * =====================================================================
 * DESSERT BOSS — OFFICIAL GOOGLE APPS SCRIPT BACKEND CONNECTOR
 * =====================================================================
 * Paste this script into: Google Sheets > Extensions > Apps Script
 * 
 * STEP 1: Select function "initializeDessertBossSheet" and click "Run".
 *         This automatically creates & formats all 5 tabs with headers!
 * STEP 2: Click "Deploy" > "New deployment".
 * STEP 3: Select type "Web app".
 * STEP 4: Set "Execute as": "Me".
 * STEP 5: Set "Who has access": "Anyone".
 * STEP 6: Copy the Web App URL and paste it into the Dessert Boss app.
 * =====================================================================
 */

/**
 * 1. ONE-CLICK INITIALIZATION: Auto-creates all 5 tabs and seeds 24 companies
 */
function initializeDessertBossSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Companies Tab
  var compSheet = getOrCreateSheet(ss, "Companies", "#064e3b");
  if (compSheet.getLastRow() < 1) {
    compSheet.appendRow(["Company_ID", "Company_Name", "Phone_Number", "Address", "Current_Due"]);
    formatHeaderRow(compSheet, 5);
    // Seed sample companies
    var sampleCompanies = [
      ["DB-COMP-001", "Grameenphone HQ Cafeteria", "+8801711000101", "GP House, Bashundhara R/A, Dhaka", 14200],
      ["DB-COMP-002", "Robi Axiata Executive Lounge", "+8801819000202", "53 Gulshan South Ave, Dhaka", 8500],
      ["DB-COMP-003", "Banglalink Digital Tower", "+8801911000303", "Tigers Den, Gulshan 1, Dhaka", 6200],
      ["DB-COMP-004", "BRAC Centre Cafeteria", "+8801713000404", "75 Mohakhali, Dhaka", 18400],
      ["DB-COMP-005", "Unilever Corporate Hub", "+8801714000505", "ZN Tower, Gulshan 1, Dhaka", 11200],
      ["DB-COMP-006", "Nestle Dining Hall", "+8801715000606", "Tejgaon-Gulshan Link Road", 4500],
      ["DB-COMP-007", "Standard Chartered Canteen", "+8801716000707", "67 Gulshan Avenue, Dhaka", 9300],
      ["DB-COMP-008", "HSBC Bangladesh Pantry", "+8801717000808", "Anchor Tower, Sonargaon Road", 0],
      ["DB-COMP-009", "Square Pharma Cafeteria", "+8801718000909", "Square Centre, Mohakhali", 15600],
      ["DB-COMP-010", "Beximco Pharma Hub", "+8801719001010", "19 Dhanmondi R/A, Road 7", 12800],
      ["DB-COMP-011", "Aarong Flagship Cafe", "+8801720001111", "Tejgaon Industrial Area", 21500],
      ["DB-COMP-012", "Shwapno Superstore Gulshan 2", "+8801721001212", "Gulshan 2 Circle, Dhaka", 34000],
      ["DB-COMP-013", "Shwapno Dhanmondi 27", "+8801722001313", "Road 27, Dhanmondi, Dhaka", 26500],
      ["DB-COMP-014", "Unimart Gulshan Centre Point", "+8801723001414", "Gulshan Centre Point, Gulshan 2", 41200],
      ["DB-COMP-015", "Unimart Dhanmondi", "+8801724001515", "Satmasjid Road, Dhanmondi", 19800],
      ["DB-COMP-016", "Meena Bazar Banani 11", "+8801725001616", "Road 11, Banani, Dhaka", 15300],
      ["DB-COMP-017", "Meena Bazar Uttara", "+8801726001717", "Sector 3, Uttara, Dhaka", 8900],
      ["DB-COMP-018", "Agora Superstore Mirpur", "+8801727001818", "Mirpur 10 Circle, Dhaka", 14700],
      ["DB-COMP-019", "BAT Executive Lounge", "+8801728001919", "New DOHS Road, Mohakhali", 5400],
      ["DB-COMP-020", "Apex Footwear Food Court", "+8801729002020", "Road 134, Gulshan 1", 7600],
      ["DB-COMP-021", "Walton Corporate Canteen", "+8801730002121", "Plot 1088, Bashundhara R/A", 16800],
      ["DB-COMP-022", "Akij House Cafeteria", "+8801731002222", "198 Bir Uttam Mir Shawkat Sarak", 11500],
      ["DB-COMP-023", "Daraz Bangladesh Hub", "+8801732002323", "Tejgaon Industrial Area", 9200],
      ["DB-COMP-024", "Foodpanda Cloud Kitchen", "+8801733002424", "Road 19/A, Banani, Dhaka", 6300]
    ];
    sampleCompanies.forEach(function(row) { compSheet.appendRow(row); });
  }

  // 2. Inventory Tab
  var invSheet = getOrCreateSheet(ss, "Inventory", "#047857");
  if (invSheet.getLastRow() < 1) {
    invSheet.appendRow(["Item_Name", "Unit_Price", "Stock_Qty"]);
    formatHeaderRow(invSheet, 3);
    var sampleInventory = [
      ["Green Coconut Pudding (Signature)", 120, 240],
      ["Royal Falooda Delight", 160, 115],
      ["Mango Sago Cream Pudding", 140, 95],
      ["Matka Shahi Firni / Kheer", 95, 180],
      ["Shahi Rabri Malai Cup", 150, 80],
      ["Tender Coconut Jelly Cake", 220, 42],
      ["Pistachio Malai Kulfi Tub", 130, 75],
      ["Special Sweet Doi (Curd)", 85, 160]
    ];
    sampleInventory.forEach(function(row) { invSheet.appendRow(row); });
  }

  // 3. Orders Tab
  var ordSheet = getOrCreateSheet(ss, "Orders", "#0d9488");
  if (ordSheet.getLastRow() < 1) {
    ordSheet.appendRow(["Order_ID", "Date", "Company_Name", "Item_Name", "Quantity", "Total_Bill", "Paid_Amount", "Due_Amount", "Status"]);
    formatHeaderRow(ordSheet, 9);
    ordSheet.appendRow(["ORD-1001", "2026-10-30", "Grameenphone HQ Cafeteria", "50x Green Coconut Pudding, 20x Royal Falooda", 70, 9200, 5000, 4200, "Delivered"]);
    ordSheet.appendRow(["ORD-1002", "2026-10-30", "BRAC Centre Cafeteria", "60x Green Coconut Pudding, 40x Matka Kheer", 100, 11000, 11000, 0, "Delivered"]);
  }

  // 4. Returns Tab
  var retSheet = getOrCreateSheet(ss, "Returns", "#b91c1c");
  if (retSheet.getLastRow() < 1) {
    retSheet.appendRow(["Date", "Company_Name", "Item_Name", "Return_Qty", "Reason"]);
    formatHeaderRow(retSheet, 5);
    retSheet.appendRow(["2026-10-30", "Shwapno Superstore Gulshan 2", "Green Coconut Pudding (Signature)", 4, "Damaged in transit"]);
  }

  // 5. Expenses Tab
  var expSheet = getOrCreateSheet(ss, "Expenses", "#c2410c");
  if (expSheet.getLastRow() < 1) {
    expSheet.appendRow(["Date", "Expense_Type", "Amount", "Note"]);
    formatHeaderRow(expSheet, 4);
    expSheet.appendRow(["2026-10-30", "Green Coconut", 6800, "120 pcs fresh tender Daab batch"]);
    expSheet.appendRow(["2026-10-30", "Milk & Dairy", 4200, "60L pure whole cow milk"]);
  }

  SpreadsheetApp.getUi().alert("SUCCESS: All 5 tabs initialized, color-coded, and pre-loaded with Dessert Boss data!");
}

/**
 * 2. WEB API: GET REQUESTS (Fetch live data from Google Sheet)
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "all";
  
  try {
    if (action === "all") {
      var payload = {
        status: "success",
        timestamp: new Date().toISOString(),
        companies: readSheetRows(ss.getSheetByName("Companies")),
        inventory: readSheetRows(ss.getSheetByName("Inventory")),
        orders: readSheetRows(ss.getSheetByName("Orders")),
        returns: readSheetRows(ss.getSheetByName("Returns")),
        expenses: readSheetRows(ss.getSheetByName("Expenses"))
      };
      return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
    }
    
    var tabName = e.parameter.tab || "Orders";
    var data = readSheetRows(ss.getSheetByName(tabName));
    return ContentService.createTextOutput(JSON.stringify({ status: "success", tab: tabName, rows: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 3. WEB API: POST REQUESTS (Create order, record collection, adjust stock)
 */
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var response = { status: "success", timestamp: new Date().toISOString() };
  
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action || "appendRow";
    
    // Append Order
    if (action === "addOrder" || body.tab === "Orders") {
      var ordSheet = getOrCreateSheet(ss, "Orders");
      var o = body.order || body.data;
      if (o) {
        ordSheet.appendRow([
          o.Order_ID,
          o.Date,
          o.Company_Name,
          o.Item_Name,
          o.Quantity,
          o.Total_Bill,
          o.Paid_Amount,
          o.Due_Amount,
          o.Status
        ]);
        
        // Auto-update Company Current_Due
        if (o.Due_Amount > 0) {
          adjustCompanyDue(ss, o.Company_Name, o.Due_Amount);
        }
        
        // Auto-deduct stock
        deductInventoryStock(ss, o.Item_Name, o.Quantity);
      }
    } 
    // Record Payment
    else if (action === "recordPayment") {
      adjustCompanyDue(ss, body.companyName, -Math.abs(body.amount));
    }
    // Record Return
    else if (action === "addReturn" || body.tab === "Returns") {
      var retSheet = getOrCreateSheet(ss, "Returns");
      var r = body.returnRecord || body.data;
      if (r) {
        retSheet.appendRow([r.Date, r.Company_Name, r.Item_Name, r.Return_Qty, r.Reason]);
        if (r.Credit_Amount && r.Credit_Amount > 0) {
          adjustCompanyDue(ss, r.Company_Name, -Math.abs(r.Credit_Amount));
        }
      }
    }
    // Add Expense
    else if (action === "addExpense" || body.tab === "Expenses") {
      var expSheet = getOrCreateSheet(ss, "Expenses");
      var exp = body.expense || body.data;
      if (exp) {
        expSheet.appendRow([exp.Date, exp.Expense_Type, exp.Amount, exp.Note]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ----------------- Helper Functions -----------------

function getOrCreateSheet(ss, name, tabColor) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (tabColor) {
    sheet.setTabColor(tabColor);
  }
  return sheet;
}

function formatHeaderRow(sheet, numCols) {
  var range = sheet.getRange(1, 1, 1, numCols);
  range.setBackground("#064e3b");
  range.setFontColor("#ffffff");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, numCols);
}

function readSheetRows(sheet) {
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  var headers = rows[0];
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    result.push(obj);
  }
  return result;
}

function adjustCompanyDue(ss, companyName, delta) {
  var sheet = ss.getSheetByName("Companies");
  if (!sheet) return;
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === companyName) {
      var current = Number(rows[i][4]) || 0;
      var updated = Math.max(0, current + delta);
      sheet.getRange(i + 1, 5).setValue(updated);
      break;
    }
  }
}

function deductInventoryStock(ss, itemName, quantity) {
  var sheet = ss.getSheetByName("Inventory");
  if (!sheet) return;
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === itemName) {
      var stock = Number(rows[i][2]) || 0;
      sheet.getRange(i + 1, 3).setValue(Math.max(0, stock - quantity));
      break;
    }
  }
}
`;

