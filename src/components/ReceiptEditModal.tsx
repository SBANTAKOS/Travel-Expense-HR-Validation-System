import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  AlertOctagon,
  Check,
  Calendar,
  DollarSign,
  Building,
  Tag,
  Receipt as ReceiptIcon,
  HelpCircle,
  Eye,
  FileCheck,
} from 'lucide-react';
import { ExpenseCategory, Receipt, ReceiptScanApiResponse } from '../types';
import {
  CATEGORY_CONFIG,
  CURRENCY_RATES,
  convertToEUR,
  formatDate,
  validateReceiptDate,
} from '../utils/currencies';

interface ReceiptEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (receiptData: Omit<Receipt, 'id' | 'createdAt'>) => void;
  initialScanData?: ReceiptScanApiResponse | null;
  receiptImage: string;
  tripStartDate: string;
  tripEndDate: string;
  existingReceipts: Receipt[];
  editingReceipt?: Receipt | null;
}

export const ReceiptEditModal: React.FC<ReceiptEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialScanData,
  receiptImage,
  tripStartDate,
  tripEndDate,
  existingReceipts,
  editingReceipt,
}) => {
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState('EUR');
  const [category, setCategory] = useState<ExpenseCategory>('MEALS');
  const [taxAmount, setTaxAmount] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [forceDuplicateOverride, setForceDuplicateOverride] = useState(false);

  // Initialize or reset form values
  useEffect(() => {
    if (editingReceipt) {
      setMerchant(editingReceipt.merchant);
      setDate(editingReceipt.date);
      setAmount(editingReceipt.amount.toString());
      setCurrency(editingReceipt.currency);
      setCategory(editingReceipt.category);
      setTaxAmount(editingReceipt.taxAmount ? editingReceipt.taxAmount.toString() : '');
      setReceiptNumber(editingReceipt.receiptNumber || '');
      setNotes(editingReceipt.notes || '');
      setForceDuplicateOverride(false);
    } else if (initialScanData) {
      setMerchant(initialScanData.merchant || '');
      setDate(initialScanData.date || '');
      setAmount(initialScanData.amount ? initialScanData.amount.toString() : '');
      setCurrency(initialScanData.currency || 'EUR');

      // Map scanned category
      const catMap: Record<string, ExpenseCategory> = {
        RESTAURANT: 'MEALS',
        HEBERGEMENT: 'LODGING',
        TRANSPORT: 'TRANSPORT',
        CARBURANT: 'FUEL',
        AUTRE: 'OTHER',
      };
      setCategory(catMap[initialScanData.category] || 'MEALS');
      setTaxAmount(initialScanData.taxAmount ? initialScanData.taxAmount.toString() : '');
      setReceiptNumber(initialScanData.receiptNumber || '');
      setNotes(initialScanData.rawSummary || '');
      setForceDuplicateOverride(false);
    }
  }, [initialScanData, editingReceipt, isOpen]);

  if (!isOpen) return null;

  // RULE 3: Date Control
  const dateValidation = validateReceiptDate(date, tripStartDate, tripEndDate);
  const isOutOfRange = !dateValidation.isValid && date.trim() !== '';
  const isDateMissing = !date || date.trim() === '';

  // RULE 3: Duplicate Check (same merchant, same date, same amount)
  const numericAmount = parseFloat(amount);
  const editingReceiptId = editingReceipt?.id;
  const isDuplicate =
    !editingReceiptId &&
    !isNaN(numericAmount) &&
    Boolean(merchant.trim()) &&
    Boolean(date.trim()) &&
    existingReceipts.some(
      (r) =>
        r.id !== editingReceiptId &&
        r.merchant.toLowerCase().trim() === merchant.toLowerCase().trim() &&
        r.date === date &&
        Math.abs(r.amount - numericAmount) < 0.01
    );

  const isSaveBlocked =
    !merchant.trim() ||
    isDateMissing ||
    isOutOfRange ||
    isNaN(numericAmount) ||
    numericAmount <= 0 ||
    (isDuplicate && !forceDuplicateOverride);

  const handleSave = () => {
    if (isSaveBlocked) return;

    const finalAmount = parseFloat(amount);
    const finalTax = taxAmount ? parseFloat(taxAmount) : undefined;
    const convertedEUR = convertToEUR(finalAmount, currency);

    onSave({
      tripId: editingReceipt?.tripId || '',
      merchant: merchant.trim(),
      date: date.trim(),
      amount: finalAmount,
      currency: currency.toUpperCase(),
      category,
      taxAmount: finalTax,
      receiptNumber: receiptNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      imageUrl: receiptImage,
      isDateUnreadable: isDateMissing,
      detectedDuplicate: isDuplicate,
      duplicateWarning: isDuplicate ? `Duplicate of existing ${merchant} ticket` : undefined,
      convertedAmountEUR: convertedEUR,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight">
                {editingReceipt ? 'Edit Receipt Details' : 'Verify & Confirm Scanned Receipt'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Check OCR values and compliance with trip dates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Top Receipt Visual Bar & Quick Inspect */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div
              onClick={() => setIsZoomOpen(true)}
              className="relative w-16 h-20 bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer group shrink-0"
            >
              <img
                src={receiptImage}
                alt="Receipt proof"
                className="w-full h-full object-contain p-1 group-hover:scale-105 transition"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {merchant || 'Scanning merchant...'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                  OCR Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Trip Period:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatDate(tripStartDate)} → {formatDate(tripEndDate)}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1 mt-1 cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                View full original receipt
              </button>
            </div>
          </div>

          {/* CRITICAL DATE VALIDATION ALERTS */}
          {isOutOfRange && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3 animate-shake">
              <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-700 dark:text-rose-300">
                  Receipt Blocked: Date Outside Trip Window
                </p>
                <p className="mt-1 leading-relaxed">
                  The receipt date (<span className="font-bold">{date || 'empty'}</span>) does not fall
                  within the mandatory trip period (<span className="font-semibold">{tripStartDate}</span>{' '}
                  to <span className="font-semibold">{tripEndDate}</span>).
                </p>
                <p className="mt-1.5 font-medium text-rose-600 dark:text-rose-400">
                  Please correct the date or update the travel mission dates to proceed.
                </p>
              </div>
            </div>
          )}

          {isDateMissing && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Unreadable Date Detected</p>
                <p className="mt-0.5">
                  The OCR scanner could not detect a valid date on the voucher. Corporate policy requires
                  manual date entry.
                </p>
              </div>
            </div>
          )}

          {/* DUPLICATE DETECTION ALERT */}
          {isDuplicate && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 dark:text-amber-300">
                    Potential Duplicate Receipt Detected
                  </p>
                  <p className="mt-1 leading-relaxed">
                    A receipt with merchant <span className="font-semibold">"{merchant}"</span>, amount{' '}
                    <span className="font-semibold">{amount} {currency}</span>, and date{' '}
                    <span className="font-semibold">{date}</span> already exists in this report.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 pt-2 border-t border-amber-200 dark:border-amber-800 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={forceDuplicateOverride}
                  onChange={(e) => setForceDuplicateOverride(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold">
                  I confirm this is a separate distinct expense (not an accidental duplicate)
                </span>
              </label>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Merchant / Vendor */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Establishment / Merchant Name *</span>
              </label>
              <input
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Brasserie Le Train Bleu, Novotel, SNCF, Uber"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Date with range indication */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Transaction Date *</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  [{tripStartDate} to {tripEndDate}]
                </span>
              </label>
              <input
                type="date"
                required
                min={tripStartDate}
                max={tripEndDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition ${
                  isOutOfRange || isDateMissing
                    ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* Total Amount & Currency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Total Amount &amp; Currency *</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-24 px-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold font-mono focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  {Object.keys(CURRENCY_RATES).map((c) => (
                    <option key={c} value={c}>
                      {c} ({CURRENCY_RATES[c].symbol})
                    </option>
                  ))}
                </select>
              </div>
              {currency !== 'EUR' && !isNaN(numericAmount) && numericAmount > 0 && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  ≈ {convertToEUR(numericAmount, currency).toFixed(2)} EUR (exchange rate applied)
                </p>
              )}
            </div>

            {/* Category selection */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Expense Category (AI Proposed) *</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((catKey) => {
                  const cfg = CATEGORY_CONFIG[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{cfg.label.split('&')[0]}</span>
                      <span className="text-[10px] font-normal opacity-70 truncate mt-1">
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VAT / Tax Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                VAT / Tax Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                placeholder="e.g. 10.50"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Receipt Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Receipt / Invoice Reference No.
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="e.g. FAC-2026-881"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Notes / Business Justification */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Notes &amp; Business Purpose
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Lunch with client partner to review contract milestones"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {isOutOfRange && (
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                Blocked (Date out of range)
              </span>
            )}
            <button
              type="button"
              disabled={isSaveBlocked}
              onClick={handleSave}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                isSaveBlocked
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{editingReceipt ? 'Update Receipt' : 'Save & Attach to Trip'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Lightbox */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-60 bg-black/90 p-4 flex flex-col items-center justify-center cursor-zoom-out animate-fade-in"
        >
          <div className="max-w-md w-full bg-white rounded-2xl p-2 shadow-2xl relative">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-10 right-0 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" /> Close
            </button>
            <img
              src={receiptImage}
              alt="Full resolution receipt"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
