import { ExpenseCategory, ExpenseStatus } from '../types';

export const CURRENCY_RATES: Record<string, { symbol: string; name: string; rateToEUR: number }> = {
  EUR: { symbol: '€', name: 'Euro', rateToEUR: 1.0 },
  USD: { symbol: '$', name: 'US Dollar', rateToEUR: 0.92 },
  GBP: { symbol: '£', name: 'British Pound', rateToEUR: 1.17 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', rateToEUR: 1.05 },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', rateToEUR: 0.68 },
  JPY: { symbol: '¥', name: 'Japanese Yen', rateToEUR: 0.0061 },
};

export function convertToEUR(amount: number, currency: string): number {
  const code = currency.toUpperCase();
  const rate = CURRENCY_RATES[code]?.rateToEUR || 1.0;
  return Number((amount * rate).toFixed(2));
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'EUR'): string {
  if (amount == null || isNaN(amount)) return '—';
  const curr = currency.toUpperCase();
  const info = CURRENCY_RATES[curr];
  const symbol = info?.symbol || curr;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'JPY'].includes(curr) ? curr : 'EUR',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; description: string; color: string; bg: string; ring: string }
> = {
  MEALS: {
    label: 'Meals & Dining',
    description: 'Restaurants, breakfast, business meals, catering',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    ring: 'ring-amber-500/20',
  },
  LODGING: {
    label: 'Lodging & Hotel',
    description: 'Hotels, apartments, booking accommodations',
    color: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    ring: 'ring-indigo-500/20',
  },
  TRANSPORT: {
    label: 'Transport & Travel',
    description: 'Flights, train tickets, Uber, taxi, subway',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    ring: 'ring-blue-500/20',
  },
  FUEL: {
    label: 'Fuel & Mileage',
    description: 'Gas station, EV charge, road tolls, parking',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    ring: 'ring-emerald-500/20',
  },
  OTHER: {
    label: 'Other & Miscellaneous',
    description: 'Supplies, conference fees, client entertainment',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    ring: 'ring-purple-500/20',
  },
};

export const STATUS_CONFIG: Record<
  ExpenseStatus,
  { label: string; description: string; bg: string; text: string; border: string; dot: string }
> = {
  DRAFT: {
    label: 'Draft',
    description: 'In progress by employee. Not yet submitted to HR.',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  SUBMITTED: {
    label: 'Submitted',
    description: 'Awaiting review and approval by HR / Management.',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
    dot: 'bg-amber-500 animate-pulse',
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    description: 'Returned by HR. Action required on missing or invalid receipts.',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    dot: 'bg-orange-500',
  },
  APPROVED: {
    label: 'Approved',
    description: 'Approved by HR. Queued for employee reimbursement.',
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Declined by HR. Check attached comments.',
    bg: 'bg-rose-100 dark:bg-rose-900/40',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
    dot: 'bg-rose-500',
  },
};

// Date control rule validation: startDate <= receiptDate <= endDate
export function validateReceiptDate(
  receiptDate: string | null | undefined,
  tripStartDate: string,
  tripEndDate: string
): { isValid: boolean; errorMessage?: string } {
  if (!receiptDate || receiptDate.trim() === '') {
    return {
      isValid: false,
      errorMessage: 'Date is missing or unreadable. Please enter transaction date manually.',
    };
  }

  // Ensure dates are parsed cleanly
  const rDate = receiptDate.trim();
  const sDate = tripStartDate.trim();
  const eDate = tripEndDate.trim();

  if (rDate < sDate) {
    return {
      isValid: false,
      errorMessage: `Date (${formatDate(rDate)}) is before trip start date (${formatDate(sDate)}). Receipts outside trip range are not allowed.`,
    };
  }

  if (rDate > eDate) {
    return {
      isValid: false,
      errorMessage: `Date (${formatDate(rDate)}) is after trip end date (${formatDate(eDate)}). Receipts outside trip range are not allowed.`,
    };
  }

  return { isValid: true };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
