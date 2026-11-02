import React, { useState } from 'react';
import { Reservation } from '../../types';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  X,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface BookingExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onExtensionSuccess: (updatedReservation: Reservation) => void;
}

export const BookingExtensionModal: React.FC<BookingExtensionModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onExtensionSuccess,
}) => {
  if (!isOpen || !reservation) return null;

  const [hoursToAdd, setHoursToAdd] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic fee calculation
  const additionalCost = Number((reservation.baseRatePerHour * hoursToAdd * reservation.dynamicMultiplier).toFixed(2));
  const currentEnd = new Date(reservation.endTime);
  const newEnd = new Date(currentEnd.getTime() + hoursToAdd * 3600000);

  const handleExtend = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.extendReservation(reservation.id, hoursToAdd);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#22C55E', '#10B981'],
        });
      } catch (e) {}

      onExtensionSuccess(res.reservation);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Slot cannot be extended. Please check slot schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Extend Parking Session</h3>
              <p className="text-[11px] text-blue-100">Bay {reservation.slotNumber} • {reservation.floor}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Current schedule info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Current Exit Time:</span>
              <strong className="text-slate-800">
                {currentEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({currentEnd.toLocaleDateString()})
              </strong>
            </div>
            <div className="flex justify-between text-blue-700 font-semibold pt-1 border-t border-slate-200/60">
              <span>New Scheduled Exit:</span>
              <strong>
                {newEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </div>
          </div>

          {/* Quick hour selector buttons */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-2">
              Select Additional Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 3].map(h => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setHoursToAdd(h)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    hoursToAdd === h
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  +{h >= 1 ? `${h}h` : '30m'}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Charge calculation */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-blue-900 block">Additional Extension Fee</span>
              <span className="text-[11px] text-blue-600">
                {hoursToAdd} hr × ${reservation.baseRatePerHour.toFixed(2)} ({reservation.dynamicMultiplier}x rate)
              </span>
            </div>
            <div className="text-xl font-black text-blue-700">
              +${additionalCost.toFixed(2)}
            </div>
          </div>

          {/* Error conflict alert */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExtend}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Checking Slot Availability...</span>
              ) : (
                <>
                  <span>Confirm +{hoursToAdd}h Extension</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
