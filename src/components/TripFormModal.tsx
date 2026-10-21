import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  MapPin,
  Calendar,
  AlertTriangle,
  Check,
  FolderGit2,
} from 'lucide-react';
import { Trip, Receipt } from '../types';
import { formatDate } from '../utils/currencies';

interface TripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripData: {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    projectCode?: string;
  }) => void;
  editingTrip?: Trip | null;
}

export const TripFormModal: React.FC<TripFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTrip,
}) => {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [acknowledgedDateImpact, setAcknowledgedDateImpact] = useState(false);

  useEffect(() => {
    if (editingTrip) {
      setTitle(editingTrip.title);
      setDestination(editingTrip.destination);
      setStartDate(editingTrip.startDate);
      setEndDate(editingTrip.endDate);
      setProjectCode(editingTrip.projectCode || '');
      setAcknowledgedDateImpact(false);
    } else {
      // Default to upcoming 3-day trip
      const today = new Date();
      const inThreeDays = new Date();
      inThreeDays.setDate(today.getDate() + 3);
      setTitle('');
      setDestination('');
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(inThreeDays.toISOString().split('T')[0]);
      setProjectCode('');
      setAcknowledgedDateImpact(false);
    }
  }, [editingTrip, isOpen]);

  if (!isOpen) return null;

  // RULE 3: "Si les dates du déplacement sont modifiées, tous les tickets sont contrôlés à nouveau."
  const existingReceipts: Receipt[] = editingTrip?.receipts || [];
  const affectedReceipts = existingReceipts.filter((receipt) => {
    if (!receipt.date) return false;
    return receipt.date < startDate || receipt.date > endDate;
  });

  const isDateOrderInvalid = startDate && endDate && startDate > endDate;
  const isFormValid =
    title.trim() !== '' &&
    destination.trim() !== '' &&
    startDate.trim() !== '' &&
    endDate.trim() !== '' &&
    !isDateOrderInvalid &&
    (affectedReceipts.length === 0 || acknowledgedDateImpact);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    onSave({
      title: title.trim(),
      destination: destination.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      projectCode: projectCode.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight">
                {editingTrip ? 'Edit Business Trip Details' : 'Create New Business Trip'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Mandatory dates &amp; destination for receipt bounding
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Trip Purpose / Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Trip Purpose / Mission Title *</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Client Onsite Architecture Audit, VivaTech Conference"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Destination City &amp; Country *</span>
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. London, UK or Paris, France"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Dates Grid (Mandatory) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Date * (Mandatory)</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>End Date * (Mandatory)</span>
              </label>
              <input
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {isDateOrderInvalid && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>Trip End Date cannot precede the Start Date.</span>
            </div>
          )}

          {/* Project Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Project or Client Cost Code (Optional)</span>
            </label>
            <input
              type="text"
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
              placeholder="e.g. PRJ-LONDON-2026, ADV-AI-90"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* RULE 3 CHECK: Warning if modifying dates invalidates existing tickets */}
          {affectedReceipts.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-900 dark:text-amber-200 text-xs space-y-2.5 animate-pulse">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 dark:text-amber-300">
                    Warning: Date Change Affects {affectedReceipts.length} Existing Receipt(s)!
                  </p>
                  <p className="mt-1 leading-relaxed text-[11px]">
                    The following receipts will now fall outside the new trip window ({formatDate(startDate)} to {formatDate(endDate)}):
                  </p>
                  <ul className="mt-1.5 space-y-1 list-disc pl-4 text-[11px]">
                    {affectedReceipts.map((r) => (
                      <li key={r.id}>
                        <span className="font-semibold">{r.merchant}</span> on {formatDate(r.date)} ({r.amount} {r.currency})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-amber-800 dark:text-amber-300">
                    If you apply this change, these tickets will be flagged with a warning in your expense report.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 border-t border-amber-200 dark:border-amber-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedDateImpact}
                  onChange={(e) => setAcknowledgedDateImpact(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-[11px]">
                  I understand and wish to update trip dates anyway
                </span>
              </label>
            </div>
          )}

          {/* Footer inside form */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                !isFormValid
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{editingTrip ? 'Save Changes' : 'Create Trip & Start'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
