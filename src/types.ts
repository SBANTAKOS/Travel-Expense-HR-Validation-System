export type ExpenseCategory =
  | 'MEALS'
  | 'LODGING'
  | 'TRANSPORT'
  | 'FUEL'
  | 'OTHER';

export type ExpenseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';

export interface Receipt {
  id: string;
  tripId: string;
  merchant: string;
  date: string; // YYYY-MM-DD
  amount: number;
  currency: string;
  category: ExpenseCategory;
  taxAmount?: number;
  receiptNumber?: string;
  notes?: string;
  imageUrl: string;
  isDateUnreadable?: boolean;
  detectedDuplicate?: boolean;
  duplicateWarning?: string;
  createdAt: string;
  convertedAmountEUR: number;
}

export interface Trip {
  id: string;
  title: string; // Purpose of the trip
  destination: string;
  startDate: string; // YYYY-MM-DD (mandatory)
  endDate: string; // YYYY-MM-DD (mandatory)
  status: ExpenseStatus;
  employeeName: string;
  employeeEmail: string;
  employeeId: string;
  department: string;
  projectCode?: string;
  receipts: Receipt[];
  createdAt: string;
  submittedAt?: string;
  hrComment?: string;
  hrReviewedAt?: string;
  hrReviewedBy?: string;
}

export interface CurrencyRate {
  code: string;
  symbol: string;
  name: string;
  rateToEUR: number; // 1 unit in EUR
}

export interface ReceiptScanApiResponse {
  merchant: string;
  date: string | null;
  amount: number | null;
  currency: string;
  category: 'RESTAURANT' | 'HEBERGEMENT' | 'TRANSPORT' | 'CARBURANT' | 'AUTRE';
  taxAmount?: number | null;
  receiptNumber?: string | null;
  confidence: number;
  rawSummary?: string;
  isDateUnreadable: boolean;
  source: 'gemini' | 'heuristic';
}
