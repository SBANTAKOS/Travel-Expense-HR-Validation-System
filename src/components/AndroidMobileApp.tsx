import React, { useState } from 'react';
import {
  Plus,
  Camera,
  Briefcase,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Receipt as ReceiptIcon,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { Trip, Receipt } from '../types';
import { STATUS_CONFIG, formatCurrency, formatDate, validateReceiptDate } from '../utils/currencies';

interface AndroidMobileAppProps {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onOpenCreateTrip: () => void;
  onQuickScanReceipt: (trip: Trip) => void;
}

export const AndroidMobileApp: React.FC<AndroidMobileAppProps> = ({
  trips,
  onSelectTrip,
  onOpenCreateTrip,
  onQuickScanReceipt,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  const activeTrips = trips.filter((t) => t.status === 'DRAFT' || t.status === 'CHANGES_REQUESTED' || t.status === 'SUBMITTED');
  const archivedTrips = trips.filter((t) => t.status === 'APPROVED' || t.status === 'REJECTED');

  const displayedList = (
    filterTab === 'ALL' ? trips : filterTab === 'ACTIVE' ? activeTrips : archivedTrips
  ).filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q);
  });

  // Calculate totals
  const totalReimbursable = activeTrips.reduce((acc, t) => {
    return acc + t.receipts.reduce((sum, r) => sum + (r.convertedAmountEUR || 0), 0);
  }, 0);

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Mobile App Header (Material You style) */}
      <div className="bg-slate-900 text-white px-5 pt-4 pb-5 rounded-b-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center font-extrabold text-sm shadow-md">
              EX
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight">Expensio</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-mono">
                  MOBILE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Alexandre Dumont (EMP-4091)</p>
            </div>
          </div>

          <button
            onClick={onOpenCreateTrip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Trip</span>
          </button>
        </div>

        {/* Quick Balance Hero Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border border-blue-700/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block">
              Active Reimbursements
            </span>
            <div className="text-2xl font-black font-mono text-white mt-0.5">
              {formatCurrency(totalReimbursable, 'EUR')}
            </div>
            <p className="text-[10px] text-blue-200/80 mt-0.5">
              Across {activeTrips.length} active business trip{activeTrips.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/30 flex items-center justify-center text-blue-300">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Search bar inside header */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips by destination or mission..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="px-5 pt-3 pb-2 flex gap-1.5">
        {[
          { id: 'ACTIVE', label: 'Active Trips', count: activeTrips.length },
          { id: 'ARCHIVED', label: 'Completed', count: archivedTrips.length },
          { id: 'ALL', label: 'All', count: trips.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Trips Cards List */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3 pb-24">
        {displayedList.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 mt-4">
            <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No business trips found
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Create your business trip first before attaching travel tickets and receipts.
            </p>
            <button
              onClick={onOpenCreateTrip}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Travel Mission</span>
            </button>
          </div>
        ) : (
          displayedList.map((trip) => {
            const statusCfg = STATUS_CONFIG[trip.status];
            const tripTotal = trip.receipts.reduce(
              (sum, r) => sum + (r.convertedAmountEUR || 0),
              0
            );

            // Check if any attached receipt violates dates
            const invalidCount = trip.receipts.filter(
              (r) => !validateReceiptDate(r.date, trip.startDate, trip.endDate).isValid
            ).length;

            return (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition cursor-pointer group space-y-3"
              >
                {/* Top Row: Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {trip.destination}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Travel Dates */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{formatDate(trip.startDate)}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-semibold">{formatDate(trip.endDate)}</span>
                </div>

                {/* Changes Requested HR Banner */}
                {trip.status === 'CHANGES_REQUESTED' && trip.hrComment && (
                  <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800 text-[11px] text-orange-900 dark:text-orange-200 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">HR Action Required: </span>
                      <span>{trip.hrComment}</span>
                    </div>
                  </div>
                )}

                {/* Date Violation Alert (if dates were modified) */}
                {invalidCount > 0 && (
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="font-bold">
                      {invalidCount} ticket(s) outside new travel dates!
                    </span>
                  </div>
                )}

                {/* Bottom Row: Receipts count & Total amount */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                      <ReceiptIcon className="w-3.5 h-3.5" />
                      {trip.receipts.length} ticket{trip.receipts.length > 1 ? 's' : ''}
                    </span>
                    {(trip.status === 'DRAFT' || trip.status === 'CHANGES_REQUESTED') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickScanReceipt(trip);
                        }}
                        className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        + Scan
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {formatCurrency(tripTotal, 'EUR')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Bar at bottom */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-lg z-30">
        <button
          onClick={onOpenCreateTrip}
          className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          <span>New Trip</span>
        </button>

        {activeTrips.length > 0 && (
          <button
            onClick={() => onQuickScanReceipt(activeTrips[0])}
            className="flex-1 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Receipt</span>
          </button>
        )}
      </div>
    </div>
  );
};
