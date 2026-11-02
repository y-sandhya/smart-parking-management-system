import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Reservation } from '../../types';
import { api } from '../../services/api';
import { BookingExtensionModal } from './BookingExtensionModal';
import {
  X,
  QrCode,
  Compass,
  Download,
  Share2,
  Calendar,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Navigation,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';

interface DigitalPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onLaunchNavigation: (reservation: Reservation) => void;
  onCancelled: (reservationId: string) => void;
  onReservationUpdated?: (updated: Reservation) => void;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onLaunchNavigation,
  onCancelled,
  onReservationUpdated,
}) => {
  if (!isOpen || !reservation) return null;

  const [currentBooking, setCurrentBooking] = useState<Reservation>(reservation);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [gateSimulating, setGateSimulating] = useState<boolean>(false);
  const [isExtensionOpen, setIsExtensionOpen] = useState<boolean>(false);

  useEffect(() => {
    setCurrentBooking(reservation);
  }, [reservation]);

  useEffect(() => {
    if (currentBooking) {
      QRCode.toDataURL(currentBooking.qrPayload || currentBooking.bookingReference, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed to generate QR code:', err));
    }
  }, [currentBooking]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSimulateGateScan = async (scanType: 'entry' | 'exit') => {
    setGateSimulating(true);
    try {
      const res = await api.scanGatePass({
        query: currentBooking.bookingReference,
        scanType,
      });
      setCurrentBooking(res.booking);
      if (onReservationUpdated) onReservationUpdated(res.booking);
      showToast(res.message);
    } catch (err: any) {
      showToast(err.message || 'Gate verification failed');
    } finally {
      setGateSimulating(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this reservation? A full refund of $' + currentBooking.totalAmount.toFixed(2) + ' will be credited to your wallet.')) {
      return;
    }
    setIsCancelling(true);
    try {
      await api.cancelReservation(currentBooking.id);
      showToast('Reservation cancelled. Refund processed.');
      onCancelled(currentBooking.id);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel reservation');
    } finally {
      setIsCancelling(false);
    }
  };

  const startDate = new Date(currentBooking.startTime);
  const endDate = new Date(currentBooking.endTime);
  const nowMs = Date.now();
  const isOverdue = nowMs > endDate.getTime() && currentBooking.status === 'active' && !currentBooking.checkOutTime;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
          {/* Pass Header Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>OFFICIAL DIGITAL PARKING PASS</span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Booking Reference
                </span>
                <h3 className="text-xl font-mono font-black text-white tracking-wider">
                  {currentBooking.bookingReference}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Entry PIN
                </span>
                <div className="text-xl font-mono font-black text-amber-400 tracking-widest">
                  {currentBooking.entryPin}
                </div>
              </div>
            </div>
          </div>

          {/* Status ribbon */}
          <div
            className={`px-6 py-2 flex items-center justify-between text-xs font-bold ${
              isOverdue
                ? 'bg-rose-600 text-white animate-pulse'
                : currentBooking.status === 'active'
                ? 'bg-blue-600 text-white'
                : currentBooking.status === 'completed'
                ? 'bg-slate-700 text-slate-200'
                : currentBooking.status === 'cancelled'
                ? 'bg-rose-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {isOverdue
                ? 'OVERSTAY DETECTED - EXTEND NOW'
                : currentBooking.status === 'active'
                ? 'VEHICLE PARKED IN BAY'
                : currentBooking.status === 'completed'
                ? 'PARKING SESSION COMPLETED'
                : currentBooking.status === 'cancelled'
                ? 'RESERVATION CANCELLED'
                : 'VALID FOR GATE ENTRY'}
            </span>
            <span className="font-mono text-[11px] opacity-90">{currentBooking.floor}</span>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Overstay Warning Banner if active and past scheduled end */}
            {isOverdue && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-900 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    Overstay Warning
                  </span>
                  <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-mono">
                    +$10.00/hr Penalty
                  </span>
                </div>
                <p className="text-[11px] text-rose-800">
                  Your reservation expired at {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Please extend duration or exit to avoid extra charges.
                </p>
                <button
                  type="button"
                  onClick={() => setIsExtensionOpen(true)}
                  className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Extend Duration Immediately
                </button>
              </div>
            )}

            {/* Bay Callout Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Assigned Space
                </span>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  Bay {currentBooking.slotNumber}
                </div>
                <div className="text-xs font-semibold text-blue-600 mt-0.5">
                  {currentBooking.floor} • {currentBooking.zone}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Vehicle Tag
                </span>
                <div className="text-sm font-mono font-extrabold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs mt-1">
                  {currentBooking.vehicle.licensePlate}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {currentBooking.vehicle.model}
                </div>
              </div>
            </div>

            {/* QR Code Presentation */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-2xs">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Parking Pass QR Code"
                  className="w-44 h-44 object-contain rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-slate-100 rounded-lg animate-pulse">
                  <QrCode className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <div className="text-[10px] font-mono text-slate-400 mt-2 text-center">
                Token: {currentBooking.qrToken || currentBooking.bookingReference}
              </div>
            </div>

            {/* Timing details with Extension Button */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Entry - Exit Window</span>
                <div className="font-bold text-slate-800">
                  {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <span className="text-[10px] text-slate-400">{currentBooking.durationHours} hrs booked</span>
              </div>

              {currentBooking.status !== 'completed' && currentBooking.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setIsExtensionOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Extend Time</span>
                </button>
              )}
            </div>

            {/* Toast message if present */}
            {toastMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold text-center animate-fadeIn">
                {toastMessage}
              </div>
            )}

            {/* Primary Action: Launch Futuristic HUD Navigation */}
            <button
              onClick={() => {
                onLaunchNavigation(currentBooking);
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white font-extrabold text-xs tracking-wider uppercase border border-slate-800 shadow-md hover:shadow-xl hover:border-lime-500 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Compass className="w-4 h-4 text-lime-400 group-hover:rotate-45 transition-transform" />
              <span>Launch In-Car 3D HUD Navigation</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-lime-400 text-slate-950 font-black">
                NEON HUD
              </span>
            </button>

            {/* Gate Testing Buttons: Entry vs Exit */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSimulateGateScan('entry')}
                disabled={gateSimulating || currentBooking.qrScannedEntry || currentBooking.status === 'completed'}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors disabled:opacity-40"
              >
                {currentBooking.qrScannedEntry ? '✓ Entry Scanned' : 'Test Entry Barrier'}
              </button>

              <button
                type="button"
                onClick={() => handleSimulateGateScan('exit')}
                disabled={gateSimulating || !currentBooking.qrScannedEntry || currentBooking.status === 'completed'}
                className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors disabled:opacity-40"
              >
                {currentBooking.status === 'completed' ? '✓ Exit Completed' : 'Test Exit Barrier'}
              </button>
            </div>

            {/* Cancellation link */}
            {currentBooking.status !== 'completed' && currentBooking.status !== 'cancelled' && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 underline transition-colors"
                >
                  {isCancelling ? 'Processing Cancellation...' : 'Cancel Reservation & Refund'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extension Modal */}
      <BookingExtensionModal
        isOpen={isExtensionOpen}
        onClose={() => setIsExtensionOpen(false)}
        reservation={currentBooking}
        onExtensionSuccess={(updated) => {
          setCurrentBooking(updated);
          if (onReservationUpdated) onReservationUpdated(updated);
          showToast(`Extended parking until ${new Date(updated.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`);
        }}
      />
    </>
  );
};
