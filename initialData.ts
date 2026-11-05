import { Company, InventoryItem, Order, ReturnRecord, Expense, PaymentTransaction, Employee } from '../types';

// The user requested a clean slate with zero dummy records so they can add real employees, companies, and orders.
export const INITIAL_COMPANIES: Company[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_RETURNS: ReturnRecord[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_PAYMENTS: PaymentTransaction[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [
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
];

// Optional demo data if user ever wants to preview 24 companies
export const DEMO_SAMPLE_COMPANIES: Company[] = [
  { Company_ID: 'DB-COMP-001', Company_Name: 'Grameenphone HQ Cafeteria', Phone_Number: '+8801711000101', Address: 'Bashundhara R/A, Dhaka', Current_Due: 0, Contact_Person: 'Rafiqul Islam', Category: 'Corporate Canteen' },
  { Company_ID: 'DB-COMP-002', Company_Name: 'Robi Axiata Lounge', Phone_Number: '+8801819000202', Address: 'Gulshan South Ave, Dhaka', Current_Due: 0, Contact_Person: 'Kawsar Ahmed', Category: 'Executive Lounge' },
  { Company_ID: 'DB-COMP-003', Company_Name: 'BRAC Centre Cafeteria', Phone_Number: '+8801713000404', Address: 'Mohakhali, Dhaka', Current_Due: 0, Contact_Person: 'Shamim Reza', Category: 'Corporate Canteen' },
  { Company_ID: 'DB-COMP-004', Company_Name: 'Shwapno Superstore Gulshan 2', Phone_Number: '+8801721001212', Address: 'Gulshan 2 Circle, Dhaka', Current_Due: 0, Contact_Person: 'Moniruzzaman', Category: 'Superstore' },
  { Company_ID: 'DB-COMP-005', Company_Name: 'Unimart Dhanmondi', Phone_Number: '+8801724001515', Address: 'Satmasjid Road, Dhanmondi', Current_Due: 0, Contact_Person: 'Arifur Rahman', Category: 'Superstore' },
];
