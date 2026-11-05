import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Database file path
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'dessertboss_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default database structure
const DEFAULT_DB = {
  companies: [],
  employees: [],
  inventory: [
    {
      Item_Name: 'Green Coconut Pudding (ডাবের পুডিং)',
      Unit_Price: 120,
      Stock_Qty: 50,
      Unit: 'Cup (200g)',
      Min_Alert_Qty: 20,
      Category: 'Puddings',
    },
    {
      Item_Name: 'Royal Falooda Delight (রয়্যাল ফালুদা)',
      Unit_Price: 160,
      Stock_Qty: 30,
      Unit: 'Jar (350ml)',
      Min_Alert_Qty: 15,
      Category: 'Falooda',
    },
  ],
  orders: [],
  returns: [],
  expenses: [],
  payments: [],
  config: {
    sheetId: '1DESSERT-BOSS-DISTRIBUTION-SHEET-2026',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1DESSERT-BOSS-DISTRIBUTION-SHEET-2026',
    webhookUrl: '',
    autoSync: false,
    status: 'connected',
    lastSyncTime: '09:00 AM',
  },
  lastUpdated: new Date().toISOString(),
};

// Initialize DB file if not present
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
}

function readDatabase() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, returning default:', err);
    return DEFAULT_DB;
  }
}

function writeDatabase(data: any) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
}

// API Routes
app.get('/api/db', (req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db });
});

app.post('/api/db', (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  const current = readDatabase();
  const updated = {
    ...current,
    ...incoming,
    lastUpdated: new Date().toISOString(),
  };

  writeDatabase(updated);
  res.json({ success: true, data: updated });
});

// Smart 2-way sync endpoint
app.post('/api/db/sync', (req, res) => {
  const incoming = req.body;
  const current = readDatabase();

  // Merge companies by Company_ID or Company_Name
  const companyMap = new Map();
  (current.companies || []).forEach((c: any) => companyMap.set(c.Company_ID || c.Company_Name, c));
  (incoming.companies || []).forEach((c: any) => companyMap.set(c.Company_ID || c.Company_Name, c));

  // Merge orders by Order_ID
  const orderMap = new Map();
  (current.orders || []).forEach((o: any) => orderMap.set(o.Order_ID, o));
  (incoming.orders || []).forEach((o: any) => orderMap.set(o.Order_ID, o));

  // Merge expenses by Expense_ID
  const expenseMap = new Map();
  (current.expenses || []).forEach((e: any) => expenseMap.set(e.Expense_ID, e));
  (incoming.expenses || []).forEach((e: any) => expenseMap.set(e.Expense_ID, e));

  // Merge payments by Payment_ID
  const paymentMap = new Map();
  (current.payments || []).forEach((p: any) => paymentMap.set(p.Payment_ID, p));
  (incoming.payments || []).forEach((p: any) => paymentMap.set(p.Payment_ID, p));

  // Merge returns by Return_ID
  const returnMap = new Map();
  (current.returns || []).forEach((r: any) => returnMap.set(r.Return_ID, r));
  (incoming.returns || []).forEach((r: any) => returnMap.set(r.Return_ID, r));

  // Merge employees by Employee_ID
  const employeeMap = new Map();
  (current.employees || []).forEach((emp: any) => employeeMap.set(emp.Employee_ID, emp));
  (incoming.employees || []).forEach((emp: any) => employeeMap.set(emp.Employee_ID, emp));

  const merged = {
    companies: Array.from(companyMap.values()),
    orders: Array.from(orderMap.values()),
    expenses: Array.from(expenseMap.values()),
    payments: Array.from(paymentMap.values()),
    returns: Array.from(returnMap.values()),
    employees: Array.from(employeeMap.values()),
    inventory: incoming.inventory && incoming.inventory.length > 0 ? incoming.inventory : current.inventory,
    config: incoming.config || current.config,
    lastUpdated: new Date().toISOString(),
  };

  writeDatabase(merged);
  res.json({ success: true, data: merged });
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Dessert Boss Server running on http://0.0.0.0:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
