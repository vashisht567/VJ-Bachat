/**
 * Types for Ghar Ka Hisaab (Household Expense & Monthly Ledger)
 */

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Udhar';

export interface Category {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  color: string;
  unit?: string;
  defaultRate?: number;
  defaultRecipient?: string;
  isCustom?: boolean;
}

export interface ExpenseEntry {
  id: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
  categoryName: string;
  itemName?: string; // Exact custom item name e.g. "रोहन की स्कूल फीस", "कार पेट्रोल"
  amount: number;
  quantity?: number;
  unit?: string;
  rate?: number;
  recipient: string; // "Kis-kis ko diye" e.g., Ramu Milkman, Mandi, Auto, Friend
  paymentMode: PaymentMode;
  notes?: string;
  timestamp: number;
  isChutti?: boolean; // If milk was skipped on this day
  isUdhar?: boolean; // If this was money lent / given as loan
  udharStatus?: 'pending' | 'returned'; // Pending or returned
}

export interface InflowEntry {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  source: string; // e.g. Salary, ATM Cash, Rental, Other
  paymentMode: 'Cash' | 'Bank' | 'UPI';
  notes?: string;
  timestamp: number;
}

export interface UdharEntry {
  id: string;
  date: string;
  personName: string;
  relation: 'दोस्त' | 'पड़ोसी' | 'रिश्तेदार' | 'अन्य';
  amount: number;
  status: 'pending' | 'returned';
  notes?: string;
  timestamp: number;
  returnDate?: string;
}

export interface MonthlyHisaab {
  monthKey: string; // YYYY-MM
  startingCash: number;
  salaryCycleDay: number; // e.g. 10th (for 10th to 9th next month) or 1st
  defaultMilkLitre: number; // e.g. 1.5
  defaultMilkRate: number; // e.g. 66
  inflows: InflowEntry[];
  expenses: ExpenseEntry[];
  udhars: UdharEntry[];
  categories: Category[];
}

export interface UserProfile {
  id: string; // Unique User ID
  name: string; // Full Name / Display Name
  phoneOrEmail?: string; // Mobile number or email
  pin?: string; // 4-digit security PIN
  role?: 'owner' | 'member';
  createdAt: number;
}
