import React, { useState } from 'react';
import {
  Printer,
  Send,
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  User,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Receipt as ReceiptIcon,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Trip, Receipt, ExpenseStatus } from '../types';
import {
  CATEGORY_CONFIG,
  CURRENCY_RATES,
  STATUS_CONFIG,
  convertToEUR,
  formatCurrency,
  formatDate,
  validateReceiptDate,
} from '../utils/currencies';

interface ExpenseReportViewProps {
  trip: Trip;
  onBack: () => void;
  onSubmitToHR: (tripId: string) => void;
  onAddReceipt: () => void;
  onEditReceipt: (receipt: Receipt) => void;
  onDeleteReceipt: (receiptId: string) => void;
  onEditTrip: () => void;
}

export const ExpenseReportView: React.FC<ExpenseReportViewProps> = ({
  trip,
  onBack,
  onSubmitToHR,
  onAddReceipt,
  onEditReceipt,
  onDeleteReceipt,
  onEditTrip,
}) => {
  const [activeReceiptPreview, setActiveReceiptPreview] = useState<Receipt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusCfg = STATUS_CONFIG[trip.status];
  const canEdit = trip.status === 'DRAFT' || trip.status === 'CHANGES_REQUESTED';

  // Calculate currency breakdown
  const currencyTotals: Record<string, { total: number; count: number }> = {};
  let totalEUR = 0;
  let totalVAT_EUR = 0;

  trip.receipts.forEach((r) => {
    const cur = r.currency.toUpperCase();
    if (!currencyTotals[cur]) {
      currencyTotals[cur] = { total: 0, count: 0 };
    }
    currencyTotals[cur].total += r.amount;
    currencyTotals[cur].count += 1;

    totalEUR += r.convertedAmountEUR || convertToEUR(r.amount, cur);
    if (r.taxAmount) {
      totalVAT_EUR += convertToEUR(r.taxAmount, cur);
    }
  });

  const currenciesList = Object.keys(currencyTotals);
  const isMultiCurrency = currenciesList.length > 1;

  // RULE 3: Date enforcement check on all attached tickets
  const invalidDateReceipts = trip.receipts.filter((r) => {
    const val = validateReceiptDate(r.date, trip.startDate, trip.endDate);
    return !val.isValid;
  });

  const hasBlockingDateErrors = invalidDateReceipts.length > 0;

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = () => {
    if (trip.receipts.length === 0 || hasBlockingDateErrors) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitToHR(trip.id);
      setIsSubmitting(false);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }, 500);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* Top Action Bar (hidden in print) */}
      <div className="print:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trips</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print / Save PDF</span>
          </button>

          {canEdit && (
            <button
              onClick={handleSubmit}
              disabled={trip.receipts.length === 0 || hasBlockingDateErrors || isSubmitting}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                trip.receipts.length === 0 || hasBlockingDateErrors || isSubmitting
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Send to HR'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Expense Report Document */}
      <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6 print:p-0 print:m-0 print:space-y-4">
        {/* Printable Paper Canvas */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 print:shadow-none print:border-none print:p-0">
          {/* Document Header with Logo and Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold text-xs tracking-wider">
                  EXPENSIO
                </span>
                <span className="text-xs text-slate-400 font-mono">BUSINESS EXPENSE VOUCHER</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {trip.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {trip.destination}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                </span>
                {trip.projectCode && (
                  <>
                    <span>•</span>
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                      {trip.projectCode}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Status & ID Badge */}
            <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`}></span>
                {statusCfg.label}
              </span>
              <span className="text-[11px] font-mono text-slate-400">ID: {trip.id}</span>
            </div>
          </div>

          {/* HR Feedback Box (if changes requested or approved) */}
          {trip.hrComment && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1 ${
                trip.status === 'CHANGES_REQUESTED'
                  ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200'
                  : trip.status === 'REJECTED'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {trip.status === 'CHANGES_REQUESTED' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                  {trip.status === 'REJECTED' && <XCircle className="w-4 h-4 text-rose-600" />}
                  {trip.status === 'APPROVED' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  HR Review Feedback ({trip.hrReviewedBy || 'HR Department'}):
                </span>
                {trip.hrReviewedAt && (
                  <span className="text-[10px] font-normal opacity-75">
                    {formatDate(trip.hrReviewedAt.split('T')[0])}
                  </span>
                )}
              </div>
              <p className="leading-relaxed pl-5 font-medium">{trip.hrComment}</p>
            </div>
          )}

          {/* DATE POLICY VIOLATIONS ALERT */}
          {hasBlockingDateErrors && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-900 dark:text-rose-200 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-700 dark:text-rose-300">
                    Submission Blocked: {invalidDateReceipts.length} receipt(s) violate trip dates!
                  </h4>
                  <p className="mt-1 leading-relaxed text-[11px]">
                    Corporate policy requires every expense ticket to occur within the authorized travel period ({formatDate(trip.startDate)} to {formatDate(trip.endDate)}).
                  </p>
                  <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-[11px] font-medium">
                    {invalidDateReceipts.map((r) => (
                      <li key={r.id}>
                        {r.merchant} — Date: <span className="font-bold">{r.date || 'Unreadable/Missing'}</span> (outside range)
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px]">
                    Please edit the receipts or update the travel dates before submitting to HR.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Employee & Bank Coordinates Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Employee Identity
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {trip.employeeName}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">{trip.employeeEmail}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Department &amp; ID
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {trip.department}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                Matricule: {trip.employeeId}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Reimbursement Account
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1 font-mono">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                FR76 •••• •••• 4892
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Direct SEPA Wire upon HR approval
              </p>
            </div>
          </div>

          {/* Itemized Table of Receipts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Itemized Expenses ({trip.receipts.length} tickets)</span>
              </h3>
              {canEdit && (
                <button
                  onClick={onAddReceipt}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition print:hidden"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Receipt</span>
                </button>
              )}
            </div>

            {trip.receipts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <ReceiptIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  No receipts attached yet for this trip.
                </p>
                {canEdit && (
                  <button
                    onClick={onAddReceipt}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-blue-500 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Scan Your First Receipt</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Merchant &amp; Notes</th>
                      <th className="py-2.5 px-3 text-right">Original Amt</th>
                      <th className="py-2.5 px-3 text-right">Conv. (EUR)</th>
                      <th className="py-2.5 px-3 text-center print:hidden">Proof</th>
                      {canEdit && <th className="py-2.5 px-3 text-center print:hidden">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {trip.receipts.map((r) => {
                      const catCfg = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.OTHER;
                      const val = validateReceiptDate(r.date, trip.startDate, trip.endDate);
                      const isInvalidDate = !val.isValid;

                      return (
                        <tr
                          key={r.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                            isInvalidDate ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                          }`}
                        >
                          {/* Date with validation badge */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-900 dark:text-white font-mono">
                              {r.date ? formatDate(r.date) : '—'}
                            </div>
                            {isInvalidDate && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                Out of Range
                              </span>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold ${catCfg.bg} ${catCfg.color}`}
                            >
                              {catCfg.label}
                            </span>
                          </td>

                          {/* Merchant and Notes */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                              {r.merchant}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {r.receiptNumber ? `Ref: ${r.receiptNumber} • ` : ''}
                              {r.notes || 'No description'}
                            </div>
                            {r.detectedDuplicate && (
                              <span className="inline-block mt-0.5 text-[10px] text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950 px-1.5 py-0.2 rounded">
                                ⚠️ Verified duplicate
                              </span>
                            )}
                          </td>

                          {/* Original Amount */}
                          <td className="py-3 px-3 text-right font-mono whitespace-nowrap font-semibold">
                            {formatCurrency(r.amount, r.currency)}
                            {r.taxAmount ? (
                              <div className="text-[10px] text-slate-400 font-normal">
                                VAT: {formatCurrency(r.taxAmount, r.currency)}
                              </div>
                            ) : null}
                          </td>

                          {/* Converted EUR */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {formatCurrency(r.convertedAmountEUR, 'EUR')}
                            {r.currency !== 'EUR' && (
                              <div className="text-[10px] text-slate-400 font-normal">
                                rate: {CURRENCY_RATES[r.currency]?.rateToEUR || 1}
                              </div>
                            )}
                          </td>

                          {/* Proof Thumbnail */}
                          <td className="py-3 px-3 text-center print:hidden">
                            <button
                              onClick={() => setActiveReceiptPreview(r)}
                              className="w-8 h-10 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-0.5 hover:ring-2 hover:ring-blue-500 transition cursor-pointer inline-flex items-center justify-center overflow-hidden group"
                              title="Click to zoom receipt"
                            >
                              <img
                                src={r.imageUrl}
                                alt="Receipt"
                                className="w-full h-full object-contain group-hover:scale-110 transition"
                              />
                            </button>
                          </td>

                          {/* Actions */}
                          {canEdit && (
                            <td className="py-3 px-3 text-center print:hidden">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => onEditReceipt(r)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                                  title="Edit receipt"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteReceipt(r.id)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                                  title="Delete receipt"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FINANCIAL TOTALS & MULTI-CURRENCY BREAKDOWN SECTION */}
          {trip.receipts.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              {/* Multi-currency breakdown tabs if more than 1 currency */}
              {isMultiCurrency && (
                <div className="pb-3 border-b border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Multi-Currency Itemized Breakdown:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currenciesList.map((cur) => (
                      <div
                        key={cur}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-mono flex items-center gap-2"
                      >
                        <span className="font-bold text-blue-400">{cur}:</span>
                        <span>{formatCurrency(currencyTotals[cur].total, cur)}</span>
                        <span className="text-[10px] text-slate-400">
                          ({currencyTotals[cur].count} item{currencyTotals[cur].count > 1 ? 's' : ''})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Totals Table */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 text-xs">Total Net (Excl. VAT)</span>
                  <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                    {formatCurrency(totalEUR - totalVAT_EUR, 'EUR')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Total VAT Recoverable</span>
                  <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                    {formatCurrency(totalVAT_EUR, 'EUR')}
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-emerald-400 font-bold text-xs uppercase tracking-wide">
                    Consolidated Total Reimbursement
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-0.5">
                    {formatCurrency(totalEUR, 'EUR')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Annex: Full Receipt Gallery */}
          {trip.receipts.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Compliance Annex: Attached Receipt Vouchers
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    High-resolution digital archive for fiscal and tax audit inspection
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {trip.receipts.length} Document{trip.receipts.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {trip.receipts.map((r, idx) => (
                  <div
                    key={r.id}
                    onClick={() => setActiveReceiptPreview(r)}
                    className="p-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-400 transition cursor-pointer group"
                  >
                    <div className="aspect-[3/4] bg-white dark:bg-slate-950 rounded-xl overflow-hidden p-1 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-2xs">
                      <img
                        src={r.imageUrl}
                        alt={r.merchant}
                        className="w-full h-full object-contain group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="mt-2 text-[11px] px-1">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        #{idx + 1} {r.merchant}
                      </div>
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] mt-0.5">
                        <span>{r.date}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatCurrency(r.amount, r.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures & Approval Footer */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Employee Signature &amp; Certification
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                I hereby certify that the above expenses were genuinely incurred for company business.
              </p>
              <div className="mt-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700 font-mono text-[11px]">
                {trip.employeeName} — {trip.submittedAt ? formatDate(trip.submittedAt.split('T')[0]) : 'Pending Submission'}
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Human Resources / Finance Approval
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Reviewed against corporate travel policy &amp; tax deductible compliance.
              </p>
              <div className="mt-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700 font-mono text-[11px]">
                {trip.hrReviewedBy || 'Awaiting HR Review'} — {trip.hrReviewedAt ? formatDate(trip.hrReviewedAt.split('T')[0]) : 'Pending'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Receipt Preview */}
      {activeReceiptPreview && (
        <div
          onClick={() => setActiveReceiptPreview(null)}
          className="fixed inset-0 z-60 bg-black/85 p-4 flex flex-col items-center justify-center cursor-zoom-out animate-fade-in print:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl relative space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeReceiptPreview.merchant}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {formatDate(activeReceiptPreview.date)} • {formatCurrency(activeReceiptPreview.amount, activeReceiptPreview.currency)}
                </p>
              </div>
              <button
                onClick={() => setActiveReceiptPreview(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="aspect-[3/4] bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden p-2 flex items-center justify-center border border-slate-200 dark:border-slate-800">
              <img
                src={activeReceiptPreview.imageUrl}
                alt={activeReceiptPreview.merchant}
                className="w-full h-full object-contain"
              />
            </div>

            {activeReceiptPreview.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                <span className="font-bold">Notes:</span> {activeReceiptPreview.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
