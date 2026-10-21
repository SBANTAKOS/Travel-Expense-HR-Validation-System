import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Plus,
  Camera,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Trip, Receipt, ExpenseStatus, ReceiptScanApiResponse } from './types';
import { INITIAL_TRIPS } from './data/mockData';
import { AndroidFrame } from './components/AndroidFrame';
import { AndroidMobileApp } from './components/AndroidMobileApp';
import { ExpenseReportView } from './components/ExpenseReportView';
import { HRBackOffice } from './components/HRBackOffice';
import { TripFormModal } from './components/TripFormModal';
import { CameraReceiptScanner } from './components/CameraReceiptScanner';
import { ReceiptEditModal } from './components/ReceiptEditModal';
import { validateReceiptDate } from './utils/currencies';

const STORAGE_KEY = 'expensio_trips_data_v1';

export default function App() {
  // Persistence via localStorage with fallback to INITIAL_TRIPS
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load trips from storage:', e);
    }
    return INITIAL_TRIPS;
  });

  // Active top-level view: 'COLLABORATOR' (Mobile) or 'HR_BACKOFFICE' (Desktop Web)
  const [activeView, setActiveView] = useState<'COLLABORATOR' | 'HR_BACKOFFICE'>('COLLABORATOR');

  // Selected trip for detailed expense report view
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Phone frame simulation toggle
  const [isSimulatedDevice, setIsSimulatedDevice] = useState<boolean>(true);

  // Modals state
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTargetTrip, setScannerTargetTrip] = useState<Trip | null>(null);

  const [isReceiptEditOpen, setIsReceiptEditOpen] = useState(false);
  const [scanResult, setScanResult] = useState<ReceiptScanApiResponse | null>(null);
  const [scannedImage, setScannedImage] = useState<string>('');
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  // Save trips to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, [trips]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || null;
  const pendingHRCount = trips.filter((t) => t.status === 'SUBMITTED').length;

  // Reset to default sample data
  const handleResetData = () => {
    if (window.confirm('Reset all trips and receipts to initial sample dataset?')) {
      setTrips(INITIAL_TRIPS);
      setSelectedTripId(null);
    }
  };

  // TRIP ACTIONS
  const handleOpenCreateTrip = () => {
    setEditingTrip(null);
    setIsTripModalOpen(true);
  };

  const handleOpenEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setIsTripModalOpen(true);
  };

  const handleSaveTrip = (tripData: {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    projectCode?: string;
  }) => {
    if (editingTrip) {
      // Update existing trip & re-validate existing tickets
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === editingTrip.id) {
            return {
              ...t,
              ...tripData,
            };
          }
          return t;
        })
      );
    } else {
      // Create new trip
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        ...tripData,
        status: 'DRAFT',
        employeeName: 'Alexandre Dumont',
        employeeEmail: 'a.dumont@corporate.com',
        employeeId: 'EMP-4091',
        department: 'Digital Solutions & Consulting',
        receipts: [],
        createdAt: new Date().toISOString(),
      };
      setTrips((prev) => [newTrip, ...prev]);
      setSelectedTripId(newTrip.id);
    }
    setIsTripModalOpen(false);
    setEditingTrip(null);
  };

  // RECEIPT SCANNING ACTIONS
  const handleStartScan = (trip: Trip) => {
    setScannerTargetTrip(trip);
    setEditingReceipt(null);
    setIsScannerOpen(true);
  };

  const handleScanComplete = (result: ReceiptScanApiResponse, imageBase64: string) => {
    setIsScannerOpen(false);
    setScanResult(result);
    setScannedImage(imageBase64);
    setIsReceiptEditOpen(true);
  };

  const handleOpenEditReceipt = (receipt: Receipt) => {
    const target = trips.find((t) => t.id === receipt.tripId);
    if (!target) return;
    setScannerTargetTrip(target);
    setEditingReceipt(receipt);
    setScannedImage(receipt.imageUrl);
    setScanResult(null);
    setIsReceiptEditOpen(true);
  };

  const handleSaveReceipt = (receiptData: Omit<Receipt, 'id' | 'createdAt'>) => {
    if (!scannerTargetTrip) return;

    if (editingReceipt) {
      // Update existing receipt
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id === scannerTargetTrip.id) {
            return {
              ...trip,
              receipts: trip.receipts.map((r) =>
                r.id === editingReceipt.id ? { ...r, ...receiptData } : r
              ),
            };
          }
          return trip;
        })
      );
    } else {
      // Add new receipt
      const newReceipt: Receipt = {
        id: `rec-${Date.now()}`,
        ...receiptData,
        tripId: scannerTargetTrip.id,
        createdAt: new Date().toISOString(),
      };

      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id === scannerTargetTrip.id) {
            return {
              ...trip,
              receipts: [...trip.receipts, newReceipt],
            };
          }
          return trip;
        })
      );
    }

    setIsReceiptEditOpen(false);
    setEditingReceipt(null);
    setScanResult(null);
  };

  const handleDeleteReceipt = (receiptId: string) => {
    if (!selectedTripId) return;
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id === selectedTripId) {
            return {
              ...trip,
              receipts: trip.receipts.filter((r) => r.id !== receiptId),
            };
          }
          return trip;
        })
      );
    }
  };

  // SUBMIT EXPENSE REPORT TO HR
  const handleSubmitToHR = (tripId: string) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id === tripId) {
          return {
            ...trip,
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
          };
        }
        return trip;
      })
    );
  };

  // HR BACK-OFFICE DECISION (Approve, Request changes, Reject)
  const handleUpdateTripStatus = (
    tripId: string,
    newStatus: ExpenseStatus,
    comment?: string,
    reviewer?: string
  ) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id === tripId) {
          return {
            ...trip,
            status: newStatus,
            hrComment: comment,
            hrReviewedAt: new Date().toISOString(),
            hrReviewedBy: reviewer || 'HR Reviewer',
          };
        }
        return trip;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans">
      {/* Universal Top Switcher Bar (Collaborator App vs HR Back-Office) */}
      <header className="bg-slate-900 text-white px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs sticky top-0 z-40 print:hidden">
        {/* App Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              EXPENSIO
            </span>
          </div>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            Travel Expense &amp; HR Validation System
          </span>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-800 p-1 rounded-2xl border border-slate-700 shadow-inner">
          <button
            onClick={() => setActiveView('COLLABORATOR')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'COLLABORATOR'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📱 Employee App (Android)</span>
          </button>

          <button
            onClick={() => setActiveView('HR_BACKOFFICE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
              activeView === 'HR_BACKOFFICE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>💻 HR Back-Office</span>
            {pendingHRCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {pendingHRCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Reset Sample Data */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition cursor-pointer"
            title="Reset to default mock data"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Main View Router */}
      <div className="flex-1 flex flex-col">
        {activeView === 'COLLABORATOR' ? (
          <AndroidFrame
            isSimulatedDevice={isSimulatedDevice}
            onToggleDeviceMode={() => setIsSimulatedDevice(!isSimulatedDevice)}
          >
            {selectedTrip ? (
              <ExpenseReportView
                trip={selectedTrip}
                onBack={() => setSelectedTripId(null)}
                onSubmitToHR={handleSubmitToHR}
                onAddReceipt={() => handleStartScan(selectedTrip)}
                onEditReceipt={handleOpenEditReceipt}
                onDeleteReceipt={handleDeleteReceipt}
                onEditTrip={() => handleOpenEditTrip(selectedTrip)}
              />
            ) : (
              <AndroidMobileApp
                trips={trips}
                onSelectTrip={(t) => setSelectedTripId(t.id)}
                onOpenCreateTrip={handleOpenCreateTrip}
                onQuickScanReceipt={handleStartScan}
              />
            )}
          </AndroidFrame>
        ) : (
          <HRBackOffice
            trips={trips}
            onUpdateTripStatus={handleUpdateTripStatus}
            onViewReport={(trip) => {
              setSelectedTripId(trip.id);
              setActiveView('COLLABORATOR');
            }}
          />
        )}
      </div>

      {/* MODAL 1: CREATE / EDIT TRIP (Mandatory Dates & Destination) */}
      <TripFormModal
        isOpen={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false);
          setEditingTrip(null);
        }}
        onSave={handleSaveTrip}
        editingTrip={editingTrip}
      />

      {/* MODAL 2: CAMERA RECEIPT SCANNER (OCR Gemini 3.8 Flash) */}
      {scannerTargetTrip && (
        <CameraReceiptScanner
          isOpen={isScannerOpen}
          onClose={() => {
            setIsScannerOpen(false);
            setScannerTargetTrip(null);
          }}
          onScanComplete={handleScanComplete}
          tripStartDate={scannerTargetTrip.startDate}
          tripEndDate={scannerTargetTrip.endDate}
        />
      )}

      {/* MODAL 3: RECEIPT EDIT & VERIFICATION MODAL (Date Check & Duplicate Rules) */}
      {scannerTargetTrip && (
        <ReceiptEditModal
          isOpen={isReceiptEditOpen}
          onClose={() => {
            setIsReceiptEditOpen(false);
            setEditingReceipt(null);
            setScanResult(null);
          }}
          onSave={handleSaveReceipt}
          initialScanData={scanResult}
          receiptImage={scannedImage}
          tripStartDate={scannerTargetTrip.startDate}
          tripEndDate={scannerTargetTrip.endDate}
          existingReceipts={scannerTargetTrip.receipts}
          editingReceipt={editingReceipt}
        />
      )}
    </div>
  );
}
