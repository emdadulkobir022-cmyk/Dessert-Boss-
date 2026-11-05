export type UserRole = 'admin' | 'staff';

export interface Employee {
  Employee_ID: string;
  Name: string;
  Role: 'Delivery Rider' | 'Sales Representative' | 'Kitchen Manager' | 'Van Driver' | 'Branch Staff';
  Phone_Number: string;
  Assigned_Zone: string; // e.g. "Gulshan / Banani", "Uttara", "Dhanmondi", "Tejgaon / Mohakhali"
  Status: 'Active' | 'Inactive';
  Join_Date?: string;
  Notes?: string;
}

export interface Company {
  Company_ID: string;
  Company_Name: string;
  Phone_Number: string;
  Address: string;
  Current_Due: number;
  Contact_Person?: string;
  Category?: 'Corporate Canteen' | 'Superstore' | 'Retail Outlet' | 'Executive Lounge' | 'Restaurant / Cafe';
  Assigned_Employee?: string; // Which employee handles this client
}

export interface InventoryItem {
  Item_Name: string;
  Unit_Price: number;
  Stock_Qty: number;
  Unit?: string; // e.g. "Cup", "Jar", "Slice", "Box"
  Min_Alert_Qty?: number;
  Category?: string;
}

export interface OrderItem {
  Item_Name: string;
  Quantity: number;
  Unit_Price: number;
  Total: number;
}

export interface Order {
  Order_ID: string;
  Date: string; // YYYY-MM-DD
  Time?: string; // HH:mm
  Company_Name: string;
  Item_Name: string; // Primary item or summary
  Items?: OrderItem[]; // Multi-item breakdown
  Quantity: number;
  Total_Bill: number;
  Paid_Amount: number;
  Due_Amount: number;
  Status: 'Pending' | 'Delivered' | 'Cancelled';
  Payment_Method?: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Credit';
  Delivered_By?: string; // Employee who delivered
  Notes?: string;
}

export interface ReturnRecord {
  Return_ID: string;
  Date: string;
  Company_Name: string;
  Item_Name: string;
  Return_Qty: number;
  Reason: 'Damaged in transit' | 'Expiry / Quality Issue' | 'Unsold Stock Adjustment' | 'Seal Broken' | 'Chiller Issue' | 'Other';
  Credit_Amount?: number;
  Action_Taken?: 'Restocked' | 'Discarded';
  Notes?: string;
}

export interface Expense {
  Expense_ID: string;
  Date: string;
  Expense_Type:
    | 'Green Coconut'
    | 'Milk & Dairy'
    | 'Sugar & Sweeteners'
    | 'Packaging & Cups'
    | 'Transport & Fuel'
    | 'Ice & Cooling'
    | 'Labor & Utilities'
    | 'Falooda Items'
    | 'Staff Food & Snacks'
    | 'Other'
    | string;
  Amount: number;
  Note: string;
  Payment_Method?: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Credit' | string;
  Paid_By?: string;
  Voucher_No?: string;
}

export interface PaymentTransaction {
  Payment_ID: string;
  Date: string;
  Company_Name: string;
  Amount: number;
  Payment_Method: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cheque';
  Reference?: string;
  Received_By: string; // Employee / Staff name
}

export interface ProductionBatch {
  Batch_ID: string;
  Date: string;
  Item_Name: string;
  Quantity_Produced: number;
  Cost_Per_Unit?: number;
  Notes?: string;
}

export interface GoogleSheetsConfig {
  sheetId: string;
  sheetUrl?: string;
  webhookUrl?: string; // Apps Script Web App URL
  lastSyncTime?: string;
  autoSync: boolean;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
}
