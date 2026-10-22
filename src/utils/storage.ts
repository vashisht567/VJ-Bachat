import { Category, ExpenseEntry, InflowEntry, UdharEntry, MonthlyHisaab, UserProfile } from '../types/hisaab';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'dudh',
    name: 'Milk & Dairy',
    nameHi: 'दूध व डेयरी',
    icon: 'Milk',
    color: 'amber',
    unit: 'लीटर (Litre)',
    defaultRate: 66,
    defaultRecipient: 'रामू दूधवाला (Dairy)',
    isCustom: false,
  },
  {
    id: 'kirana',
    name: 'Grocery & Ration',
    nameHi: 'किराना व राशन',
    icon: 'ShoppingCart',
    color: 'indigo',
    unit: 'बिल',
    defaultRate: 1500,
    defaultRecipient: 'शर्मा जी किराना स्टोर',
    isCustom: false,
  },
  {
    id: 'sabzi',
    name: 'Vegetables & Fruits',
    nameHi: 'सब्ज़ी व फल (मंडी)',
    icon: 'ShoppingBag',
    color: 'emerald',
    unit: 'दिन',
    defaultRate: 150,
    defaultRecipient: 'सब्ज़ी मंडी',
    isCustom: false,
  },
  {
    id: 'petrol',
    name: 'Vehicle & Petrol',
    nameHi: 'गाड़ी / कार पेट्रोल',
    icon: 'Fuel',
    color: 'rose',
    unit: 'लीटर / खर्च',
    defaultRate: 500,
    defaultRecipient: 'पेट्रोल पंप',
    isCustom: false,
  },
  {
    id: 'auto',
    name: 'Auto / Transport',
    nameHi: 'ऑटो / लोकल किराया',
    icon: 'Car',
    color: 'sky',
    unit: 'चक्कर',
    defaultRate: 70,
    defaultRecipient: 'ऑटो वाले भैया',
    isCustom: false,
  },
  {
    id: 'school_fees',
    name: 'School / Tuition Fees',
    nameHi: 'स्कूल व ट्यूशन फीस',
    icon: 'GraduationCap',
    color: 'purple',
    unit: 'महीना',
    defaultRate: 2500,
    defaultRecipient: 'स्कूल / कोचिंग',
    isCustom: false,
  },
  {
    id: 'bijli_pani',
    name: 'Electricity & Water',
    nameHi: 'बिजली व पानी बिल',
    icon: 'Zap',
    color: 'yellow',
    unit: 'माह',
    defaultRate: 1200,
    defaultRecipient: 'विद्युत विभाग',
    isCustom: false,
  },
  {
    id: 'gas_cylinder',
    name: 'LPG Gas Cylinder',
    nameHi: 'रसोई गैस सिलेंडर',
    icon: 'Flame',
    color: 'orange',
    unit: 'सिलेंडर',
    defaultRate: 850,
    defaultRecipient: 'भारत गैस एजेंसी',
    isCustom: false,
  },
  {
    id: 'maid_kamwali',
    name: 'House Help / Maid',
    nameHi: 'कामवाली / बाई की पगार',
    icon: 'Home',
    color: 'teal',
    unit: 'महीना',
    defaultRate: 2000,
    defaultRecipient: 'कामवाली बाई',
    isCustom: false,
  },
  {
    id: 'medical',
    name: 'Medicines & Doctor',
    nameHi: 'दवा व डॉक्टर',
    icon: 'HeartPulse',
    color: 'red',
    unit: 'खर्च',
    defaultRate: 350,
    defaultRecipient: 'फार्मेसी / डॉक्टर',
    isCustom: false,
  },
  {
    id: 'udhar_given',
    name: 'Money Lent (Udhar)',
    nameHi: 'उधार दिया (दोस्त / रिश्तेदार)',
    icon: 'HandCoins',
    color: 'rose',
    unit: 'रकम',
    defaultRate: 1000,
    defaultRecipient: 'दोस्त / पड़ोसी',
    isCustom: false,
  },
  {
    id: 'misc',
    name: 'Other Household Misc',
    nameHi: 'अन्य घरेलू फुटकर खर्च',
    icon: 'Coins',
    color: 'stone',
    unit: 'खर्च',
    defaultRate: 100,
    defaultRecipient: 'फुटकर',
    isCustom: false,
  },
];

// Clean storage prefix for VJ Bachat v4
const STORAGE_PREFIX = 'vj_bachat_v4';
const CURRENT_USER_KEY = `${STORAGE_PREFIX}_active_user`;
const ALL_USERS_KEY = `${STORAGE_PREFIX}_registered_users`;

export const DEFAULT_USER: UserProfile = {
  id: 'vj_owner',
  name: 'Vashisht Joshi',
  phoneOrEmail: 'vashishtjoshi21@gmail.com',
  pin: '1234',
  role: 'owner',
  createdAt: Date.now(),
};

// User Profile Management (Multi-User Login & Data Isolation)
export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch (err) {
    console.warn('Error reading active user:', err);
  }
  // Initialize default user if none
  saveUserProfile(DEFAULT_USER);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEFAULT_USER));
  return DEFAULT_USER;
}

export function setCurrentUser(user: UserProfile): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    saveUserProfile(user);
  } catch (err) {
    console.error('Error setting active user:', err);
  }
}

export function getSavedUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(ALL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Error reading saved users:', err);
  }
  return [DEFAULT_USER];
}

export function saveUserProfile(user: UserProfile): void {
  try {
    const users = getSavedUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id);
    let updated: UserProfile[];
    if (existingIndex >= 0) {
      updated = [...users];
      updated[existingIndex] = { ...updated[existingIndex], ...user };
    } else {
      updated = [...users, user];
    }
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

export function deleteUserProfile(userId: string): void {
  try {
    const users = getSavedUsers().filter((u) => u.id !== userId);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users.length ? users : [DEFAULT_USER]));
    if (getCurrentUser().id === userId) {
      setCurrentUser(users[0] || DEFAULT_USER);
    }
  } catch (err) {
    console.error('Error deleting user profile:', err);
  }
}

// Clean Initial Monthly Data (NO pre-seeded fake/future expenses! Starts completely empty)
export function getInitialMonthlyData(yearMonth: string = '2026-10'): MonthlyHisaab {
  return {
    monthKey: yearMonth,
    startingCash: 0,
    salaryCycleDay: 10,
    defaultMilkLitre: 1.5,
    defaultMilkRate: 66,
    inflows: [],
    expenses: [],
    udhars: [],
    categories: DEFAULT_CATEGORIES,
  };
}

export function loadCategories(userId?: string): Category[] {
  const uid = userId || getCurrentUser().id;
  const key = `${STORAGE_PREFIX}_cats_${uid}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading categories from localStorage:', err);
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[], userId?: string): void {
  const uid = userId || getCurrentUser().id;
  const key = `${STORAGE_PREFIX}_cats_${uid}`;
  try {
    localStorage.setItem(key, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving categories:', err);
  }
}

export function loadMonthlyData(yearMonth: string, userId?: string): MonthlyHisaab {
  const uid = userId || getCurrentUser().id;
  const key = `${STORAGE_PREFIX}_data_${uid}_${yearMonth}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.expenses)) {
        if (!parsed.salaryCycleDay) parsed.salaryCycleDay = 10;
        if (!parsed.defaultMilkLitre) parsed.defaultMilkLitre = 1.5;
        if (!parsed.defaultMilkRate) parsed.defaultMilkRate = 66;
        if (!Array.isArray(parsed.udhars)) parsed.udhars = [];
        if (!Array.isArray(parsed.inflows)) parsed.inflows = [];
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading month data:', err);
  }

  // Brand new clean month: no fake expenses, starts 100% empty
  const fresh = getInitialMonthlyData(yearMonth);
  saveMonthlyData(fresh, uid);
  return fresh;
}

export function saveMonthlyData(data: MonthlyHisaab, userId?: string): void {
  const uid = userId || getCurrentUser().id;
  const key = `${STORAGE_PREFIX}_data_${uid}_${data.monthKey}`;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving month data:', err);
  }
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}
