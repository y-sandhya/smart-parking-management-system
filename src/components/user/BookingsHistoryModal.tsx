import React, { useState } from 'react';
import { Reservation } from '../../types';
import {
  X,
  Calendar,
  Clock,
  Car,
  QrCode,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Navigation
} from 'lucide-react';

interface BookingsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onOpenPass: (reservation: Reservation) => void;
  onCancelReservation: (reservationId: string) => Promise<void>;
  onLaunchNav: (reservation: Reservation) => void;
  onExtend?: (reservation: Reservation) => void;
}

export const BookingsHistoryModal: React.FC<BookingsHistoryModalProps> = ({
  isOpen,
  onClose,
  reservations,
  onOpenPass,
  onCancelReservation,
  onLaunchNav,
  onExtend,
}) => {
  if (!isOpen) return null;

  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filtered = reservations.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleCancel = async (id: string, amount: number) => {
    if (!window.confirm(`Are you sure you want to cancel this booking? A full refund of $${amount.toFixed(2)} will be credited.`)) {
      return;
    }
    setCancellingId(id);
    try {
      await onCancelReservation(id);
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">My Parking Reservations</h3>
              <p className="text-xs text-slate-400">Manage active parking sessions, passes, and past receipts.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'all', label: `All (${reservations.length})` },
            { id: 'active', label: 'Active in Bay' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === t.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-700">No reservations found</div>
              <p className="text-xs text-slate-400">No parking bookings match your current filter.</p>
            </div>
          ) : (
            filtered.map(res => {
              const startDate = new Date(res.startTime);
              const endDate = new Date(res.endTime);
              const isActive = res.status === 'active';
              const isUpcoming = res.status === 'upcoming';

              return (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition-all space-y-3 shadow-2xs"
                >
                  {/* Top line: Reference + Status badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 tracking-wide">
                        {res.bookingReference}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        PIN: {res.entryPin}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-100 text-blue-800'
                          : isUpcoming
                          ? 'bg-emerald-100 text-emerald-800'
                          : res.status === 'completed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  {/* Middle Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-y border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Bay & Floor</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        Bay {res.slotNumber}
                      </div>
                      <div className="text-[10px] text-slate-500">{res.floor}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Vehicle</span>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        {res.vehicle.licensePlate}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{res.vehicle.model}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Timing</span>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-slate-400">{startDate.toLocaleDateString()}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Total Paid</span>
                      <div className="font-extrabold text-blue-600 text-sm mt-0.5">
                        ${res.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">{res.durationHours} hrs session</div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onOpenPass(res);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Pass</span>
                      </button>

                      {onExtend && (isActive || isUpcoming) && (
                        <button
                          onClick={() => {
                            onExtend(res);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Extend</span>
                        </button>
                      )}

                      {(isActive || isUpcoming) && (
                        <button
                          onClick={() => {
                            onLaunchNav(res);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-lime-400" />
                          <span>In-Car HUD</span>
                        </button>
                      )}
                    </div>

                    {res.status !== 'completed' && res.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancel(res.id, res.totalAmount)}
                        disabled={cancellingId === res.id}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                      >
                        {cancellingId === res.id ? 'Cancelling...' : 'Cancel & Refund'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
