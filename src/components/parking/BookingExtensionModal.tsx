import React, { useState } from 'react';
import { Reservation } from '../../types';
import { api } from '../../services/api';
import {
  X,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Car,
  CreditCard,
  PlusCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface BookingExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onExtensionSuccess: (updated: Reservation) => void;
}

export const BookingExtensionModal: React.FC<BookingExtensionModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onExtensionSuccess,
}) => {
  if (!isOpen || !reservation) return null;

  const [selectedHours, setSelectedHours] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hourlyRate = reservation.effectiveHourlyRate || reservation.baseRatePerHour || 4.50;
  const additionalCost = Number((selectedHours * hourlyRate).toFixed(2));

  const currentEnd = new Date(reservation.endTime);
  const newEnd = new Date(currentEnd.getTime() + selectedHours * 60 * 60 * 1000);

  const handleExtend = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await api.extendReservation(reservation.id, selectedHours);
      if (result.success && result.reservation) {
        onExtensionSuccess(result.reservation);
        onClose();
      } else {
        throw new Error('Extension response was not successful');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to extend booking duration. Slot may be occupied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const extensionOptions = [
    { label: '+30 Minutes', hours: 0.5 },
    { label: '+1 Hour', hours: 1 },
    { label: '+2 Hours', hours: 2 },
    { label: '+3 Hours', hours: 3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Extend Reservation</span>
          </div>
          <h2 className="text-xl font-black">Add Parking Time</h2>
          <p className="text-xs text-blue-100 mt-1">
            Bay {reservation.slotNumber} • {reservation.floor} ({reservation.zone})
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current schedule info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Current Expiration:</span>
              <span className="font-bold text-slate-900">
                {currentEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Vehicle:</span>
              <span className="font-bold text-slate-900">
                {reservation.vehicle.model} ({reservation.vehicle.licensePlate})
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Hourly Rate:</span>
              <span className="font-bold text-blue-600">
                ${hourlyRate.toFixed(2)}/hr
              </span>
            </div>
          </div>

          {/* Extension choices */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Additional Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {extensionOptions.map(opt => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setSelectedHours(opt.hours)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedHours === opt.hours
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-extrabold shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
                  }`}
                >
                  <div className="text-sm">{opt.label}</div>
                  <div className="text-xs text-slate-500 font-normal mt-0.5">
                    +${(opt.hours * hourlyRate).toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* New End Time & Summary */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                New Departure Time
              </div>
              <div className="text-lg font-black text-emerald-950 mt-0.5">
                {newEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[11px] text-emerald-700">
                {newEnd.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                Additional Charge
              </div>
              <div className="text-xl font-black text-emerald-950 mt-0.5">
                +${additionalCost.toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-700">Prepaid Deducted</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExtend}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Extending...</span>
              ) : (
                <>
                  <span>Confirm +${additionalCost.toFixed(2)}</span>
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
