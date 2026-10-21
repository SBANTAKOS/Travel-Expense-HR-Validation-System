import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Eye,
  Printer,
  ChevronRight,
  CreditCard,
  Building,
  User,
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
  Download,
  X,
  MessageSquare,
  AlertOctagon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Trip, Receipt, ExpenseStatus } from '../types';
import {
  STATUS_CONFIG,
  CATEGORY_CONFIG,
  formatCurrency,
  formatDate,
  validateReceiptDate,
} from '../utils/currencies';

interface HRBackOfficeProps {
  trips: Trip[];
  onUpdateTripStatus: (
    tripId: string,
    newStatus: ExpenseStatus,
    comment?: string,
    reviewer?: string
  ) => void;
  onViewReport: (trip: Trip) => void;
}

export const HRBackOffice: React.FC<HRBackOfficeProps> = ({
  trips,
  onUpdateTripStatus,
  onViewReport,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedTrip, setInspectedTrip] = useState<Trip | null>(null);
  const [zoomedReceipt, setZoomedReceipt] = useState<Receipt | null>(null);

  // Modals for actions
  const [actionModalType, setActionModalType] = useState<
    'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | null
  >(null);
  const [commentInput, setCommentInput] = useState('');

  // Calculate HR Metrics
  const submittedTrips = trips.filter((t) => t.status === 'SUBMITTED');
  const approvedTrips = trips.filter((t) => t.status === 'APPROVED');
  const changesRequestedTrips = trips.filter((t) => t.status === 'CHANGES_REQUESTED');

  const pendingReimbursementAmount = submittedTrips.reduce((acc, trip) => {
    return acc + trip.receipts.reduce((sum, r) => sum + (r.convertedAmountEUR || 0), 0);
  }, 0);

  const approvedThisMonthAmount = approvedTrips.reduce((acc, trip) => {
    return acc + trip.receipts.reduce((sum, r) => sum + (r.convertedAmountEUR || 0), 0);
  }, 0);

  // Filtered List
  const filteredTrips = trips.filter((trip) => {
    if (selectedStatusFilter !== 'ALL' && trip.status !== selectedStatusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmp = trip.employeeName.toLowerCase().includes(q);
      const matchTitle = trip.title.toLowerCase().includes(q);
      const matchDest = trip.destination.toLowerCase().includes(q);
      const matchDept = trip.department.toLowerCase().includes(q);
      return matchEmp || matchTitle || matchDest || matchDept;
    }
    return true;
  });

  const handleOpenActionModal = (type: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT') => {
    setActionModalType(type);
    if (type === 'APPROVE') {
      setCommentInput('Approved. Validated against corporate travel expense policies.');
    } else if (type === 'REQUEST_CHANGES') {
      setCommentInput('');
    } else {
      setCommentInput('');
    }
  };

  const handleConfirmAction = () => {
    if (!inspectedTrip || !actionModalType) return;

    let targetStatus: ExpenseStatus = 'APPROVED';
    if (actionModalType === 'REQUEST_CHANGES') targetStatus = 'CHANGES_REQUESTED';
    if (actionModalType === 'REJECT') targetStatus = 'REJECTED';

    onUpdateTripStatus(
      inspectedTrip.id,
      targetStatus,
      commentInput.trim() || undefined,
      'Sarah Jenkins (HR Operations Lead)'
    );

    if (actionModalType === 'APPROVE') {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.5 },
        });
      } catch {}
    }

    // Refresh inspected trip view
    const updated = {
      ...inspectedTrip,
      status: targetStatus,
      hrComment: commentInput.trim() || undefined,
      hrReviewedAt: new Date().toISOString(),
      hrReviewedBy: 'Sarah Jenkins (HR Operations Lead)',
    };
    setInspectedTrip(updated);
    setActionModalType(null);
  };

  return (
    <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col min-h-screen">
      {/* HR Portal Top Navbar */}
      <header className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight">EXPENSIO ENTERPRISE</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                HR Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">Human Resources &amp; Expense Approval Back-Office</p>
          </div>
        </div>

        {/* HR Reviewer Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-100">Sarah Jenkins</p>
            <p className="text-[11px] text-slate-400">HR Operations Lead</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            SJ
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Pending */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Pending HR Review
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {submittedTrips.length}
              </div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                Needs manager validation
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Reimbursement Queue */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Queued Amount
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {formatCurrency(pendingReimbursementAmount, 'EUR')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Pending SEPA disbursement</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Approved */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Approved This Month
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(approvedThisMonthAmount, 'EUR')}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {approvedTrips.length} report(s) approved
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Changes Requested */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Changes Requested
              </span>
              <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
                {changesRequestedTrips.length}
              </div>
              <p className="text-[11px] text-orange-500 font-medium mt-1">
                Returned to employee
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All Reports' },
              { id: 'SUBMITTED', label: 'Submitted (Pending)' },
              { id: 'CHANGES_REQUESTED', label: 'Changes Requested' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected' },
              { id: 'DRAFT', label: 'Drafts' },
            ].map((tab) => {
              const count =
                tab.id === 'ALL' ? trips.length : trips.filter((t) => t.status === tab.id).length;
              const isActive = selectedStatusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee, trip, destination..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Expense Reports Master Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Trip Mission</th>
                  <th className="py-3 px-4">Destination &amp; Dates</th>
                  <th className="py-3 px-4 text-center">Receipts</th>
                  <th className="py-3 px-4 text-right">Total (EUR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No expense reports matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip) => {
                    const statusCfg = STATUS_CONFIG[trip.status];
                    const tripTotalEUR = trip.receipts.reduce(
                      (acc, r) => acc + (r.convertedAmountEUR || 0),
                      0
                    );
                    const currencies = Array.from(new Set(trip.receipts.map((r) => r.currency)));

                    return (
                      <tr
                        key={trip.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                      >
                        {/* Employee */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {trip.employeeName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {trip.department} • <span className="font-mono">{trip.employeeId}</span>
                          </div>
                        </td>

                        {/* Trip Mission */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate">
                            {trip.title}
                          </div>
                          {trip.projectCode && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {trip.projectCode}
                            </span>
                          )}
                        </td>

                        {/* Destination & Dates */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">
                            {trip.destination}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                          </div>
                        </td>

                        {/* Receipts Count */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 font-bold">
                            {trip.receipts.length}
                          </span>
                        </td>

                        {/* Total EUR */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {formatCurrency(tripTotalEUR, 'EUR')}
                          {currencies.length > 1 && (
                            <div className="text-[10px] text-slate-400 font-normal">
                              {currencies.join(', ')}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectedTrip(trip)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
                            <button
                              onClick={() => onViewReport(trip)}
                              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                              title="Print / Save PDF"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* INSPECTION MODAL: Full HR Review Drawer */}
      {inspectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold">
                  HR
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Review Expense Report: {inspectedTrip.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Employee: {inspectedTrip.employeeName} ({inspectedTrip.employeeId}) • Destination:{' '}
                    {inspectedTrip.destination}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedTrip(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Trip Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">
                    Travel Dates
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {formatDate(inspectedTrip.startDate)} → {formatDate(inspectedTrip.endDate)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">
                    Department
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {inspectedTrip.department}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Status</span>
                  <div className="mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        STATUS_CONFIG[inspectedTrip.status].bg
                      } ${STATUS_CONFIG[inspectedTrip.status].text} ${
                        STATUS_CONFIG[inspectedTrip.status].border
                      }`}
                    >
                      {STATUS_CONFIG[inspectedTrip.status].label}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">
                    Total Amount
                  </span>
                  <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                    {formatCurrency(
                      inspectedTrip.receipts.reduce(
                        (sum, r) => sum + (r.convertedAmountEUR || 0),
                        0
                      ),
                      'EUR'
                    )}
                  </p>
                </div>
              </div>

              {/* HR Comments if existing */}
              {inspectedTrip.hrComment && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold">Latest HR Feedback:</span> {inspectedTrip.hrComment}
                  {inspectedTrip.hrReviewedBy && (
                    <span className="text-slate-400 block text-[10px] mt-0.5">
                      Reviewed by {inspectedTrip.hrReviewedBy} on{' '}
                      {inspectedTrip.hrReviewedAt ? formatDate(inspectedTrip.hrReviewedAt.split('T')[0]) : ''}
                    </span>
                  )}
                </div>
              )}

              {/* Itemized Receipts Inspection */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Attached Justificatifs &amp; Receipts ({inspectedTrip.receipts.length})
                </h4>

                <div className="space-y-2.5">
                  {inspectedTrip.receipts.map((r, i) => {
                    const catCfg = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.OTHER;
                    const val = validateReceiptDate(
                      r.date,
                      inspectedTrip.startDate,
                      inspectedTrip.endDate
                    );

                    return (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-4 hover:border-blue-400 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Receipt Thumbnail */}
                          <div
                            onClick={() => setZoomedReceipt(r)}
                            className="w-12 h-16 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5 shrink-0 cursor-pointer shadow-2xs group relative"
                          >
                            <img
                              src={r.imageUrl}
                              alt="Receipt"
                              className="w-full h-full object-contain group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                #{i + 1} {r.merchant}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${catCfg.bg} ${catCfg.color}`}
                              >
                                {catCfg.label}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              <span className="font-mono">Date: {r.date || 'Unreadable'}</span>
                              <span>•</span>
                              <span>Ref: {r.receiptNumber || 'None'}</span>
                              {r.taxAmount ? (
                                <>
                                  <span>•</span>
                                  <span>
                                    VAT: {formatCurrency(r.taxAmount, r.currency)}
                                  </span>
                                </>
                              ) : null}
                            </div>

                            {!val.isValid && (
                              <div className="mt-1 text-[10px] text-rose-600 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Date violates trip period ({inspectedTrip.startDate} - {inspectedTrip.endDate})
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Amount display */}
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                            {formatCurrency(r.amount, r.currency)}
                          </div>
                          {r.currency !== 'EUR' && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              ≈ {formatCurrency(r.convertedAmountEUR, 'EUR')}
                            </div>
                          )}
                          <button
                            onClick={() => setZoomedReceipt(r)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline mt-1 font-semibold block cursor-pointer"
                          >
                            Inspect Receipt →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* HR Decision Action Bar */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => onViewReport(inspectedTrip)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Request Changes button */}
                <button
                  onClick={() => handleOpenActionModal('REQUEST_CHANGES')}
                  className="px-4 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 dark:bg-orange-950/60 dark:hover:bg-orange-900/80 text-orange-800 dark:text-orange-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  <span>Request Changes</span>
                </button>

                {/* Reject button */}
                <button
                  onClick={() => handleOpenActionModal('REJECT')}
                  className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-800 dark:text-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reject</span>
                </button>

                {/* Approve button */}
                <button
                  onClick={() => handleOpenActionModal('APPROVE')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HR Action Modal (Comment & Confirmation) */}
      {actionModalType && inspectedTrip && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  actionModalType === 'APPROVE'
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80'
                    : actionModalType === 'REQUEST_CHANGES'
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/80'
                    : 'bg-rose-100 text-rose-600 dark:bg-rose-950/80'
                }`}
              >
                {actionModalType === 'APPROVE' && <CheckCircle2 className="w-5 h-5" />}
                {actionModalType === 'REQUEST_CHANGES' && <AlertTriangle className="w-5 h-5" />}
                {actionModalType === 'REJECT' && <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {actionModalType === 'APPROVE' && 'Approve Expense Report'}
                  {actionModalType === 'REQUEST_CHANGES' && 'Request Changes from Employee'}
                  {actionModalType === 'REJECT' && 'Reject Expense Report'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {inspectedTrip.title} • {inspectedTrip.employeeName}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {actionModalType === 'REQUEST_CHANGES'
                  ? 'Correction Reason & Instructions * (Required)'
                  : actionModalType === 'REJECT'
                  ? 'Rejection Reason * (Required)'
                  : 'Approval Note (Optional)'}
              </label>
              <textarea
                rows={3}
                required={actionModalType !== 'APPROVE'}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={
                  actionModalType === 'REQUEST_CHANGES'
                    ? 'e.g. The hotel invoice is missing VAT breakdown; please re-upload itemized folio from Hotel Novotel.'
                    : actionModalType === 'REJECT'
                    ? 'e.g. Non-compliant business expense not authorized by manager.'
                    : 'Optional accounting audit note...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionModalType !== 'APPROVE' && !commentInput.trim()}
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                  actionModalType === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : actionModalType === 'REQUEST_CHANGES'
                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                } ${
                  actionModalType !== 'APPROVE' && !commentInput.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'active:scale-95'
                }`}
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Receipt Zoom */}
      {zoomedReceipt && (
        <div
          onClick={() => setZoomedReceipt(null)}
          className="fixed inset-0 z-70 bg-black/85 p-4 flex flex-col items-center justify-center cursor-zoom-out animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl relative space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {zoomedReceipt.merchant}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {formatDate(zoomedReceipt.date)} • {formatCurrency(zoomedReceipt.amount, zoomedReceipt.currency)}
                </p>
              </div>
              <button
                onClick={() => setZoomedReceipt(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="aspect-[3/4] bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden p-2 flex items-center justify-center border border-slate-200 dark:border-slate-800">
              <img
                src={zoomedReceipt.imageUrl}
                alt={zoomedReceipt.merchant}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
