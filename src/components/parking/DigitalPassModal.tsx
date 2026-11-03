import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Reservation, PaymentReceipt } from '../../types';
import { api } from '../../services/api';
import { BookingExtensionModal } from './BookingExtensionModal';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import {
  X,
  QrCode,
  Compass,
  Download,
  Printer,
  Calendar,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Navigation,
  PlusCircle,
  AlertTriangle,
  Receipt,
  Timer,
  Wallet
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
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(reservation.receipt || null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);

  // Live parking timer for vehicle inside bay
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    setCurrentBooking(reservation);
    if (reservation.receipt) {
      setActiveReceipt(reservation.receipt);
    }
  }, [reservation]);

  useEffect(() => {
    if (currentBooking) {
      QRCode.toDataURL(currentBooking.qrPayload || currentBooking.bookingReference, {
        width: 320,
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

  // Timer interval when car is parked
  useEffect(() => {
    if (currentBooking.status === 'active' && currentBooking.checkInTime && !currentBooking.checkOutTime) {
      const updateTimer = () => {
        const startMs = new Date(currentBooking.checkInTime!).getTime();
        const diffSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setLiveElapsedSeconds(diffSecs);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [currentBooking.status, currentBooking.checkInTime, currentBooking.checkOutTime]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePrintPass = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });

      // Header Blue Banner
      doc.setFillColor(37, 99, 235); // #2563EB
      doc.rect(0, 0, 148, 28, 'F');

      // Title & Branding
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('SMART PARK PASS', 12, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Official Contactless Digital QR Entry Pass', 12, 20);

      // Status pill on right of header
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(95, 8, 42, 12, 2, 2, 'F');
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(
        currentBooking.status === 'completed'
          ? 'SESSION SETTLED'
          : currentBooking.status === 'active'
          ? 'ACTIVE IN BAY'
          : 'VALID FOR ENTRY',
        98,
        15.5
      );

      // Booking Reference & PIN Box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(12, 33, 124, 19, 2.5, 2.5, 'F');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('BOOKING REFERENCE', 16, 39);
      doc.text('ENTRY PIN', 85, 39);

      doc.setTextColor(15, 23, 42);
      doc.setFont('courier', 'bold');
      doc.setFontSize(12);
      doc.text(currentBooking.bookingReference, 16, 46);
      doc.setTextColor(217, 119, 6);
      doc.text(currentBooking.entryPin || '5821', 85, 46);

      // Assigned Space & Vehicle cards
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(12, 56, 59, 24, 2.5, 2.5, 'FD');
      doc.roundedRect(77, 56, 59, 24, 2.5, 2.5, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('ASSIGNED SPACE', 16, 62);
      doc.text('VEHICLE DETAILS', 81, 62);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`Bay ${currentBooking.slotNumber}`, 16, 70);
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235);
      doc.text(`${currentBooking.floor} - ${currentBooking.zone}`, 16, 76);

      doc.setTextColor(15, 23, 42);
      doc.setFont('courier', 'bold');
      doc.setFontSize(10.5);
      doc.text(currentBooking.vehicle.licensePlate, 81, 69);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(currentBooking.vehicle.model, 81, 75);

      // QR Code presentation
      if (qrDataUrl) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(41, 84, 66, 66, 3, 3, 'FD');
        doc.addImage(qrDataUrl, 'PNG', 44, 87, 60, 60);
      }

      // Time Window & Rates
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(12, 154, 124, 22, 2.5, 2.5, 'F');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('SCHEDULED PARKING WINDOW', 16, 161);
      doc.text('PREPAID USAGE', 95, 161);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(
        `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        16,
        167
      );
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${startDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • ${currentBooking.durationHours} hrs`,
        16,
        172
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(5, 150, 105);
      doc.text(`$${currentBooking.totalAmount.toFixed(2)}`, 95, 168);

      // Security footer
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text('Scan this QR code at the automated gate sensor upon arrival. Keep pass accessible during parking.', 12, 184);
      doc.text(`Security Token: ${currentBooking.qrToken || currentBooking.bookingReference} | Printed: ${new Date().toLocaleString()}`, 12, 189);

      const filename = `SmartPark-Pass-${currentBooking.bookingReference}.pdf`;
      doc.save(filename);
      showToast(`Downloaded ${filename} successfully!`);
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Could not generate PDF. Please use Print Pass instead.');
    }
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

      if (scanType === 'exit' && res.receipt) {
        setActiveReceipt(res.receipt);
        setIsReceiptOpen(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Gate verification failed');
    } finally {
      setGateSimulating(false);
    }
  };

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      await api.cancelReservation(currentBooking.id);
      showToast('Reservation cancelled. Full refund processed.');
      onCancelled(currentBooking.id);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel reservation');
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const startDate = new Date(currentBooking.startTime);
  const endDate = new Date(currentBooking.endTime);
  const nowMs = Date.now();
  const isOverdue = nowMs > endDate.getTime() && currentBooking.status === 'active' && !currentBooking.checkOutTime;

  // Format timer
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Live billing calculations
  const effectiveRate = currentBooking.effectiveHourlyRate || Number((currentBooking.baseRatePerHour * (currentBooking.dynamicMultiplier || 1)).toFixed(2));
  const liveBilledHours = Math.max(1, Math.ceil(Math.max(1, Math.floor(liveElapsedSeconds / 60)) / 60));
  const evFee = currentBooking.evChargingIncluded ? (currentBooking.evChargingFee || 5.00) : 0;
  const currentAccumulatedCharge = Number((liveBilledHours * effectiveRate + evFee).toFixed(2));
  const prepaidAmt = currentBooking.prepaidAmount || currentBooking.totalAmount;
  const estimatedRemainingBalance = Number(Math.max(0, prepaidAmt - currentAccumulatedCharge).toFixed(2));
  const isCurrentlyOverstaying = currentAccumulatedCharge > prepaidAmt;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
        <div
          id="printable-parking-pass"
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
        >
          {/* Pass Header Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-xl pointer-events-none no-print" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>OFFICIAL DIGITAL PARKING PASS</span>
              </div>

              {/* Header Actions: Print, Download, Close */}
              <div className="flex items-center gap-1.5 no-print">
                <button
                  type="button"
                  onClick={handlePrintPass}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                  title="Print parking pass"
                  aria-label="Print parking pass"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                  title="Download PDF pass"
                  aria-label="Download PDF pass"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer ml-1"
                  title="Close Pass"
                  aria-label="Close Pass"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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
              <span className="w-2 h-2 rounded-full bg-white animate-pulse no-print"></span>
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
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-900 space-y-2 no-print">
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
                  className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
                  alt={`Parking Pass QR Code for ${currentBooking.bookingReference}`}
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg animate-pulse">
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
                <span className="text-[10px] text-slate-500 font-medium">
                  {startDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {currentBooking.durationHours} hrs booked (${currentBooking.totalAmount.toFixed(2)})
                </span>
              </div>

              {currentBooking.status !== 'completed' && currentBooking.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setIsExtensionOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer no-print"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Extend Time</span>
                </button>
              )}
            </div>

            {/* ISSUE 1 FIX: Prominent Print and Download Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 no-print pt-1">
              <button
                type="button"
                onClick={handlePrintPass}
                className="py-3 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-300 shadow-xs hover:shadow-md active:scale-98"
                title="Print parking pass"
                aria-label="Print Parking Pass"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Print Pass</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
                title="Download Parking Pass PDF"
                aria-label="Download Parking Pass PDF"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download PDF</span>
              </button>
            </div>

            {/* Toast message if present */}
            {toastMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold text-center animate-fadeIn no-print">
                {toastMessage}
              </div>
            )}

            {/* Primary Action: Launch Futuristic HUD Navigation */}
            <button
              onClick={() => {
                onLaunchNavigation(currentBooking);
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white font-extrabold text-xs tracking-wider uppercase border border-slate-800 shadow-md hover:shadow-xl hover:border-lime-500 transition-all flex items-center justify-center gap-2 group cursor-pointer no-print"
            >
              <Compass className="w-4 h-4 text-lime-400 group-hover:rotate-45 transition-transform" />
              <span>Launch In-Car 3D HUD Navigation</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-lime-400 text-slate-950 font-black">
                NEON HUD
              </span>
            </button>

            {/* Live Parking Session Timer & Accumulated Billing Card */}
            {currentBooking.status === 'active' && currentBooking.checkInTime && !currentBooking.checkOutTime && (
              <div className="bg-[#FAF8F5] border-2 border-blue-400 rounded-2xl p-4 space-y-3 shadow-sm animate-fadeIn no-print">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-pulse">
                      <Timer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-[#1E293B]">
                        Live Parking Session in Progress
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        Rate: ${effectiveRate.toFixed(2)}/hr (1h min, hourly rounded)
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Elapsed</span>
                    <div className="font-mono text-sm font-black text-blue-700">
                      {formatTimer(liveElapsedSeconds)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-[#E2E8F0]">
                    <span className="text-[10px] font-bold text-[#64748B] block">Current Accrued Cost</span>
                    <span className="font-black text-[#1E293B] text-sm">${currentAccumulatedCharge.toFixed(2)}</span>
                    <span className="text-[9px] text-[#64748B] block">({liveBilledHours} billed hr{liveBilledHours > 1 ? 's' : ''})</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${isCurrentlyOverstaying ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                    <span className="text-[10px] font-bold block">
                      {isCurrentlyOverstaying ? 'Pending Overcharge' : 'Unused Prepaid Balance'}
                    </span>
                    <span className="font-black text-sm">
                      {isCurrentlyOverstaying
                        ? `+$${(currentAccumulatedCharge - prepaidAmt).toFixed(2)}`
                        : `$${estimatedRemainingBalance.toFixed(2)}`}
                    </span>
                    <span className="text-[9px] block opacity-80">
                      {isCurrentlyOverstaying ? 'Due upon checkout' : 'Refundable on exit'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* View Receipt Button for Completed Sessions */}
            {currentBooking.status === 'completed' && activeReceipt && (
              <button
                type="button"
                onClick={() => setIsReceiptOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer no-print"
              >
                <Receipt className="w-4 h-4 text-emerald-100" />
                <span>View Settled Payment Receipt & Refund Breakdown</span>
              </button>
            )}

            {/* Gate Testing Buttons: Entry vs Exit */}
            <div className="grid grid-cols-2 gap-2 pt-1 no-print">
              <button
                type="button"
                onClick={() => handleSimulateGateScan('entry')}
                disabled={gateSimulating || currentBooking.qrScannedEntry || currentBooking.status === 'completed'}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
              >
                {currentBooking.qrScannedEntry ? '✓ Entry Scanned (Parked)' : 'Simulate Entry Barrier'}
              </button>

              <button
                type="button"
                onClick={() => handleSimulateGateScan('exit')}
                disabled={gateSimulating || !currentBooking.qrScannedEntry || currentBooking.status === 'completed'}
                className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
              >
                {currentBooking.status === 'completed' ? '✓ Exit Settled' : 'Simulate Exit & Settle Bill'}
              </button>
            </div>

            {/* Cancellation Confirmation Inline */}
            {showCancelConfirm ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2 no-print animate-fadeIn">
                <p className="font-bold text-rose-900">
                  Are you sure you want to cancel this reservation? Full prepaid amount of ${currentBooking.totalAmount.toFixed(2)} will be credited back to your wallet.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold"
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-50"
                  >
                    {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                  </button>
                </div>
              </div>
            ) : currentBooking.status !== 'completed' && currentBooking.status !== 'cancelled' ? (
              <div className="text-center pt-1 no-print">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isCancelling}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 underline transition-colors cursor-pointer"
                >
                  Cancel Reservation & Process Refund
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={activeReceipt}
      />

      {/* Extension Modal */}
      <BookingExtensionModal
        isOpen={isExtensionOpen}
        onClose={() => setIsExtensionOpen(false)}
        reservation={currentBooking}
        onExtensionSuccess={(updated: Reservation) => {
          setCurrentBooking(updated);
          if (onReservationUpdated) onReservationUpdated(updated);
          showToast(`Extended parking until ${new Date(updated.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`);
        }}
      />
    </>
  );
};
