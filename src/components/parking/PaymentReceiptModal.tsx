import React from 'react';
import { PaymentReceipt } from '../../types';
import {
  X,
  CheckCircle2,
  Receipt,
  Download,
  Calendar,
  Clock,
  Car,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowDownCircle,
  AlertTriangle,
  Wallet
} from 'lucide-react';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PaymentReceipt | null;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div id="printable-parking-receipt" className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-6">
        {/* Receipt Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Receipt className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  Official Parking Payment Receipt
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full">
                  SETTLED
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Receipt ID: {receipt.receiptId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer no-print"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Content Body */}
        <div className="p-6 space-y-5 bg-[#FAF8F5]">
          {/* Facility & Bay Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wider">
                  Parking Facility
                </span>
                <h4 className="text-sm font-extrabold text-[#1E293B]">
                  {receipt.facilityName}
                </h4>
                <div className="text-xs text-blue-600 font-bold mt-0.5">
                  Bay {receipt.slotNumber} • {receipt.floor} • {receipt.zone}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wider">
                  Vehicle
                </span>
                <div className="text-xs font-mono font-black text-[#1E293B] bg-slate-100 px-2 py-0.5 rounded mt-0.5 inline-block">
                  {receipt.vehiclePlate}
                </div>
                <div className="text-[11px] text-[#64748B]">
                  {receipt.vehicleModel}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps & Duration Comparison */}
          <div className="grid grid-cols-2 gap-3 bg-white border border-[#E2E8F0] rounded-2xl p-4 text-xs shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#64748B]">Entry Time</span>
              <div className="font-bold text-[#1E293B] mt-0.5">
                {new Date(receipt.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <span className="text-[10px] text-[#64748B]">
                {new Date(receipt.checkInTime).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-[#64748B]">Exit Time</span>
              <div className="font-bold text-[#1E293B] mt-0.5">
                {new Date(receipt.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <span className="text-[10px] text-[#64748B]">
                {new Date(receipt.checkOutTime).toLocaleDateString()}
              </span>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <span className="text-[10px] font-bold uppercase text-[#64748B]">Booked Duration</span>
              <div className="font-bold text-[#1E293B]">
                {receipt.bookedDurationHours} hour(s)
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <span className="text-[10px] font-bold uppercase text-[#64748B]">Actual Usage</span>
              <div className="font-bold text-blue-700">
                {receipt.actualDurationMinutes} mins ({receipt.billedHours} hr billed)
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2 text-xs shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] font-bold text-[#1E293B]">
              <span>Accounting Item</span>
              <span>Amount</span>
            </div>

            <div className="flex items-center justify-between text-[#64748B]">
              <span>Prepaid Reservation Amount</span>
              <span className="font-semibold text-[#1E293B]">${receipt.prepaidAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-[#64748B]">
              <span>
                Actual Usage Charge ({receipt.billedHours}h @ ${receipt.hourlyRate.toFixed(2)}/hr)
              </span>
              <span className="font-semibold text-[#1E293B]">${receipt.baseUsageCharge.toFixed(2)}</span>
            </div>

            {receipt.evChargingFee > 0 && (
              <div className="flex items-center justify-between text-[#64748B]">
                <span>EV Fast Charging Session Fee</span>
                <span className="font-semibold text-[#1E293B]">${receipt.evChargingFee.toFixed(2)}</span>
              </div>
            )}

            {receipt.overstayCharge > 0 && (
              <div className="flex items-center justify-between text-amber-700 font-medium">
                <span>Overstay Additional Charge</span>
                <span className="font-bold">+${receipt.overstayCharge.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-sm font-extrabold text-[#1E293B]">
              <span>Final Settled Parking Charge</span>
              <span className="text-base text-blue-700">${receipt.finalCharge.toFixed(2)}</span>
            </div>

            {/* Refund Box */}
            {receipt.refundAmount > 0 ? (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-extrabold text-xs">Unused Prepaid Refund</div>
                    <div className="text-[10px] text-emerald-700">
                      Credited back to simulated wallet immediately
                    </div>
                  </div>
                </div>
                <div className="text-lg font-black text-emerald-700 font-mono">
                  +${receipt.refundAmount.toFixed(2)}
                </div>
              </div>
            ) : receipt.additionalCharge > 0 ? (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-extrabold text-xs">Additional Overstay Charge</div>
                    <div className="text-[10px] text-amber-700">
                      Duration exceeded booked slot
                    </div>
                  </div>
                </div>
                <div className="text-base font-black text-amber-800 font-mono">
                  ${receipt.additionalCharge.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-center text-blue-900 text-[11px] font-semibold">
                Full booked duration utilized. Exact balance settled ($0.00 refund).
              </div>
            )}
          </div>

          {/* Wallet Balance Update Card */}
          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase">
                  Simulated ParkWallet
                </span>
                <div className="font-extrabold text-[#1E293B]">
                  New Balance: ${receipt.walletBalanceAfter.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-[#64748B]">
              Prev: ${receipt.walletBalanceBefore.toFixed(2)}
            </div>
          </div>

          {/* Simulated Disclaimer */}
          <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-[#64748B] text-center font-mono leading-relaxed">
            [SIMULATED ACCOUNTING] {receipt.roundingPolicy}. Instant simulated wallet adjustment. No real bank charges or cards processed.
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1 no-print">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Print / Save</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
