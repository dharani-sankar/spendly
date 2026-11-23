import {
  House,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Plane,
  Ellipsis,
  Wallet,
  Laptop,
  TrendingUp,
  Gift,
  CirclePlus,
} from 'lucide-react';

// Category colours are borrowed from banknote hues: lavender, fluorescent blue,
// saffron yellow, stone grey, olive. They stay distinct on both light and dark grounds.
export const CATEGORIES = [
  { id: 'rent', label: 'Rent & housing', type: 'expense', color: '#7B6BD6', icon: House },
  { id: 'food', label: 'Food & dining', type: 'expense', color: '#F2994A', icon: Utensils },
  { id: 'transport', label: 'Transport', type: 'expense', color: '#2BB6D4', icon: Car },
  { id: 'shopping', label: 'Shopping', type: 'expense', color: '#E0559A', icon: ShoppingBag },
  { id: 'bills', label: 'Bills & utilities', type: 'expense', color: '#8A8F98', icon: Receipt },
  { id: 'entertainment', label: 'Entertainment', type: 'expense', color: '#E3B520', icon: Clapperboard },
  { id: 'health', label: 'Health', type: 'expense', color: '#E5533D', icon: HeartPulse },
  { id: 'education', label: 'Education', type: 'expense', color: '#2F9E8F', icon: GraduationCap },
  { id: 'travel', label: 'Travel', type: 'expense', color: '#8FB339', icon: Plane },
  { id: 'other', label: 'Other', type: 'expense', color: '#A7A29A', icon: Ellipsis },

  { id: 'salary', label: 'Salary', type: 'income', color: '#2F8F5B', icon: Wallet },
  { id: 'freelance', label: 'Freelance', type: 'income', color: '#3BB589', icon: Laptop },
  { id: 'investments', label: 'Investments', type: 'income', color: '#4C8DF6', icon: TrendingUp },
  { id: 'gift', label: 'Gifts', type: 'income', color: '#F28FB0', icon: Gift },
  { id: 'otherIncome', label: 'Other income', type: 'income', color: '#A5C33C', icon: CirclePlus },
];

const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const getCategory = (id) => byId[id] ?? byId.other;
export const categoriesFor = (type) => CATEGORIES.filter((c) => c.type === type);

export const CURRENCIES = [
  { code: 'INR', locale: 'en-IN', symbol: '₹', label: 'Indian rupee (₹)' },
  { code: 'USD', locale: 'en-US', symbol: '$', label: 'US dollar ($)' },
  { code: 'EUR', locale: 'en-IE', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', locale: 'en-GB', symbol: '£', label: 'British pound (£)' },
  { code: 'JPY', locale: 'ja-JP', symbol: '¥', label: 'Japanese yen (¥)' },
];
