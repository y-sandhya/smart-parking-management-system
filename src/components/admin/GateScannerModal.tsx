import React, { useState } from 'react';
import { api } from '../../services/api';
import { Reservation, ParkingSlot } from '../../types';
import {
  X,
  QrCode,
  Scan,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Car,
  Clock,
  ArrowRight,
  LogIn,
  LogOut,
  AlertCircle
} from 'lucide-react';

interface GateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (booking: Reservation) => void;
}

export const GateScannerModal: React.FC<GateScannerModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
}) => {
  if (!isOpen) return null;

  const [inputCode, setInputCode] = useState<string>('SP-2026-89412');
  const [scanType, setScanType] = useState<'entry' | 'exit'>('entry');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [result, setResult] = useState<{
    valid: boolean;
    action: string;
    direction: 'entry' | 'exit';
    booking: Reservation;
    slot?: ParkingSlot;
    actualMinutes?: number;
    overstayMinutes?: number;
    overstayPenalty?: number;
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [barrierRaised, setBarrierRaised] = useState<boolean>(false);

  const handleVerify = async (codeToVerify?: string, type?: 'entry' | 'exit') => {
    const code = codeToVerify || inputCode;
    const targetType = type || scanType;
    if (!code.trim()) return;

    setIsVerifying(true);
    setErrorMsg(null);
    setResult(null);
    setBarrierRaised(false);

    try {
      const data = await api.scanGatePass({
        query: code.trim(),
        scanType: targetType,
      });

      setResult(data);
      setBarrierRaised(true);
      onVerificationSuccess(data.booking);

      setTimeout(() => {
        setBarrierRaised(false);
      }, 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Security gate scan failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Scan className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Automated Barrier Gate Access Terminal</h3>
              <p className="text-[11px] text-slate-400">QR Code Entry & Exit Verification System</p>
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
          {/* Scan Type Toggle: Entry Gate vs Exit Gate */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setScanType('entry');
                setResult(null);
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                scanType === 'entry'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Inbound Entry Gate</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScanType('exit');
                setResult(null);
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                scanType === 'exit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Outbound Exit Gate</span>
            </button>
          </div>

          {/* Virtual Scanner Lens Preview */}
          <div className="relative h-44 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
            
            <div
              className={`absolute inset-x-8 h-0.5 shadow-[0_0_12px] animate-bounce ${
                scanType === 'entry'
                  ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-emerald-400'
                  : 'bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-blue-400'
              }`}
            />

            <div className="relative z-10 flex flex-col items-center text-center p-4">
              <QrCode className="w-16 h-16 text-slate-600 mb-2" />
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                {isVerifying ? 'AUTHENTICATING TOKEN...' : `OPTICAL ${scanType.toUpperCase()} CAMERA ACTIVE`}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {scanType === 'entry'
                  ? 'Scan pass to authorize entry & register arrival timestamp'
                  : 'Scan pass to finalize session & calculate parked duration'}
              </span>
            </div>

            {/* Barrier Gate Boom Indicator */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between px-3 py-1.5 bg-slate-900/90 rounded-xl text-xs font-mono">
              <span className="text-slate-400">BOOM ARM:</span>
              <span className={`font-black ${barrierRaised ? 'text-[#CCFF00] animate-pulse' : 'text-slate-400'}`}>
                {barrierRaised ? '▲ RAISED (BARRIER PASS AUTHORIZED)' : '▼ CLOSED & LOCKED'}
              </span>
            </div>
          </div>

          {/* Input Code Box */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Enter Pass Code, Reference, or Secure Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. SP-2026-89412 or PIN"
                className="flex-1 font-mono uppercase font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={isVerifying}
                className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer ${
                  scanType === 'entry' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isVerifying ? 'Verifying...' : `Scan ${scanType === 'entry' ? 'Entry' : 'Exit'}`}
              </button>
            </div>

            {/* Quick Demo Codes */}
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 flex-wrap">
              <span>Quick tests:</span>
              <button
                type="button"
                onClick={() => {
                  setInputCode('SP-2026-89412');
                  handleVerify('SP-2026-89412');
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-semibold"
              >
                SP-2026-89412 (Active)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputCode('SP-2026-94031');
                  handleVerify('SP-2026-94031');
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-semibold"
              >
                SP-2026-94031 (Upcoming)
              </button>
            </div>
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Verification Result Card */}
          {result && (
            <div
              className={`p-4 rounded-2xl text-xs space-y-2 animate-fadeIn border ${
                result.overstayPenalty && result.overstayPenalty > 0
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {result.action}
                </span>
                <span className="font-mono text-[11px] font-bold">
                  {result.booking.bookingReference}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Bay</span>
                  <strong className="text-slate-900">Bay {result.booking.slotNumber}</strong> ({result.booking.floor})
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Vehicle</span>
                  <strong className="text-slate-900">{result.booking.vehicle.licensePlate}</strong>
                </div>
              </div>

              {result.actualMinutes !== undefined && (
                <div className="pt-1 text-[11px] flex justify-between font-medium">
                  <span>Actual Parked Duration:</span>
                  <strong className="text-slate-900">{result.actualMinutes} minutes</strong>
                </div>
              )}

              {result.overstayPenalty !== undefined && result.overstayPenalty > 0 && (
                <div className="p-2 rounded-lg bg-rose-100 text-rose-900 font-bold flex justify-between">
                  <span>Overstay Penalty ({result.overstayMinutes}m overdue):</span>
                  <span>+${result.overstayPenalty.toFixed(2)}</span>
                </div>
              )}

              <div className="text-[11px] pt-1 border-t border-slate-200/60 font-medium">
                {result.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
