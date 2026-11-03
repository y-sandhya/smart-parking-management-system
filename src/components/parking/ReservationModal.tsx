import React, { useState, useEffect } from 'react';
import { ParkingLocation, ParkingSlot, UserProfile, Reservation, VehicleType, SmartPricingResult } from '../../types';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Clock,
  Car,
  Zap,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Info
} from 'lucide-react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ParkingSlot | null;
  location: ParkingLocation | null;
  user: UserProfile;
  onReservationComplete: (reservation: Reservation) => void;
  onSelectAlternativeSlot?: (slotId: string) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  slot,
  location,
  user,
  onReservationComplete,
  onSelectAlternativeSlot,
}) => {
  if (!isOpen || !slot || !location) return null;

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(today);

  const currentHour = new Date().getHours();
  const defaultEntryHour = `${String(Math.min(23, currentHour + 1)).padStart(2, '0')}:00`;
  const defaultExitHour = `${String(Math.min(23, currentHour + 3)).padStart(2, '0')}:00`;

  const [entryTime, setEntryTime] = useState<string>(defaultEntryHour);
  const [exitTime, setExitTime] = useState<string>(defaultExitHour);

  // Vehicle states
  const defaultVehicle = user.vehicles.find(v => v.isDefault) || user.vehicles[0];
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(defaultVehicle?.id || 'new');
  const [customPlate, setCustomPlate] = useState<string>(defaultVehicle?.licensePlate || 'CA-789-XP');
  const [customModel, setCustomModel] = useState<string>(defaultVehicle?.model || 'Audi A4');
  const [vehicleType, setVehicleType] = useState<VehicleType>(defaultVehicle?.type || 'sedan');

  // Add-ons: EV Charging
  const [includeEvCharging, setIncludeEvCharging] = useState<boolean>(slot.hasEvCharger);
  const [selectedConnector, setSelectedConnector] = useState<string>(slot.evConnectorType || 'CCS 2');

  // Coupon
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<string>('ParkWallet Balance');

  // Smart Pricing State
  const [smartPricing, setSmartPricing] = useState<SmartPricingResult | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<any | null>(null);

  const startDateTime = new Date(`${date}T${entryTime}:00`);
  const endDateTime = new Date(`${date}T${exitTime}:00`);
  let durationHours = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 3600000);
  if (durationHours <= 0) durationHours = 2;

  // Fetch Smart Dynamic Pricing on changes
  useEffect(() => {
    fetchPriceQuote();
  }, [slot.id, durationHours, includeEvCharging, entryTime]);

  const fetchPriceQuote = async () => {
    setIsCalculatingPrice(true);
    try {
      const quote = await api.calculateSmartPrice({
        locationId: location.id,
        slotId: slot.id,
        durationHours,
        startTime: `${date}T${entryTime}:00`,
        includeEvCharging,
      });
      setSmartPricing(quote);
    } catch (err) {
      console.error('Pricing error:', err);
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'SMARTPARK20') {
      setCouponDiscount(0.20);
      setCouponMessage('Coupon applied! 20% discount granted.');
    } else if (couponCode.trim().toUpperCase() === 'HACKATHON') {
      setCouponDiscount(0.35);
      setCouponMessage('University Hackathon Special: 35% discount applied!');
    } else {
      setCouponDiscount(0);
      setCouponMessage('Invalid or expired coupon code.');
    }
  };

  const handleVehicleSelect = (vId: string) => {
    setSelectedVehicleId(vId);
    const chosen = user.vehicles.find(v => v.id === vId);
    if (chosen) {
      setCustomPlate(chosen.licensePlate);
      setCustomModel(chosen.model);
      setVehicleType(chosen.type);
      if (chosen.type === 'ev' && slot.hasEvCharger) {
        setIncludeEvCharging(true);
      }
    }
  };

  const finalTotal = smartPricing
    ? Number((smartPricing.adjustedPrice * (1 - couponDiscount)).toFixed(2))
    : Number((slot.baseHourlyRate * durationHours * 1.15 + (includeEvCharging ? 5 : 0)).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setConflictData(null);
    setIsSubmitting(true);

    try {
      const reservation = await api.createReservation({
        slotId: slot.id,
        locationId: location.id,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        vehicle: {
          licensePlate: customPlate.toUpperCase(),
          model: customModel,
          type: vehicleType,
        },
        floor: slot.floor,
        zone: slot.zone,
        slotNumber: slot.slotNumber,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        durationHours,
        evChargingIncluded: includeEvCharging,
        paymentMethod,
      });

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#22C55E', '#FACC15', '#06B6D4'],
        });
      } catch (err) {}

      onReservationComplete(reservation);
      onClose();
    } catch (err: any) {
      console.error('Reservation error:', err);
      if (err.conflictData) {
        setConflictData(err.conflictData);
        setErrorMessage(err.conflictData.error || 'This slot is already booked for this time window.');
      } else {
        setErrorMessage(err.message || 'Failed to complete reservation. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">Reserve Bay {slot.slotNumber}</h3>
                <span className="text-[11px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  {slot.floor} • {slot.zone}
                </span>
                {slot.hasEvCharger && (
                  <span className="text-[10px] font-black uppercase bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" />
                    EV Charger
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 line-clamp-1">{location.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Overlap Error / Conflict Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Reservation Conflict Detected</span>
              </div>
              <p>{errorMessage}</p>

              {conflictData?.suggestedSlot && (
                <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-rose-700">
                    Alternative space: <strong>Bay {conflictData.suggestedSlot.slotNumber}</strong> ({conflictData.suggestedSlot.floor})
                  </span>
                  {onSelectAlternativeSlot && (
                    <button
                      type="button"
                      onClick={() => onSelectAlternativeSlot(conflictData.suggestedSlot.id)}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
                    >
                      Switch Bay
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Time & Duration Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#718096] mb-2">
              1. Date & Parking Duration
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[#718096] font-medium mb-1 block">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E7EBF0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-[#F3F6FA]/50 focus:bg-white text-[#172B4D] transition-all"
                  />
                  <Calendar className="w-4 h-4 text-[#718096] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#718096] font-medium mb-1 block">Entry Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    required
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E7EBF0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-[#F3F6FA]/50 focus:bg-white text-[#172B4D] transition-all"
                  />
                  <Clock className="w-4 h-4 text-[#718096] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#718096] font-medium mb-1 block">Exit Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    required
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E7EBF0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-[#F3F6FA]/50 focus:bg-white text-[#172B4D] transition-all"
                  />
                  <Clock className="w-4 h-4 text-[#718096] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-2 text-xs text-[#718096] flex items-center justify-between">
              <span>Duration: <strong className="text-[#172B4D]">{durationHours} hours</strong></span>
              <span className="text-[#16A36A] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Space held for 15 minutes post scheduled entry
              </span>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#718096] mb-2">
              2. Vehicle Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              <div>
                <label className="text-xs text-[#718096] font-medium mb-1 block">License Plate</label>
                <input
                  type="text"
                  value={customPlate}
                  onChange={(e) => setCustomPlate(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. CA-789-XP"
                  className="w-full uppercase font-mono font-bold text-xs px-3 py-2.5 rounded-xl border border-[#E7EBF0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-[#F3F6FA]/50 focus:bg-white text-[#172B4D] transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-[#718096] font-medium mb-1 block">Car Model</label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  required
                  placeholder="e.g. Tesla Model 3"
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E7EBF0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-[#F3F6FA]/50 focus:bg-white text-[#172B4D] transition-all"
                />
              </div>
            </div>

            {/* Quick Vehicle Profile Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#718096]">Quick load vehicle:</span>
              {user.vehicles.map(v => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => handleVehicleSelect(v.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    selectedVehicleId === v.id
                      ? 'bg-blue-50 text-[#2563EB] border-[#2563EB]/40 font-bold'
                      : 'bg-white text-[#718096] border-[#E7EBF0] hover:bg-[#F3F6FA] hover:text-[#172B4D]'
                  }`}
                >
                  {v.model} ({v.licensePlate})
                </button>
              ))}
            </div>
          </div>

          {/* Feature 1: EV Charging Options */}
          {slot.hasEvCharger && (
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#16A36A] text-white flex items-center justify-center shadow-xs">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>Reserve EV Fast-Charging Station</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 rounded font-bold">
                        +$5.00 flat fee
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Terminal: {slot.evChargerPowerKw || 150}kW High-Speed DC Charger (${location.evChargingPricePerKwh || 0.32}/kWh)
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={includeEvCharging}
                  onChange={(e) => setIncludeEvCharging(e.target.checked)}
                  className="w-5 h-5 accent-[#16A36A] rounded cursor-pointer"
                />
              </div>

              {includeEvCharging && (
                <div className="pt-2 border-t border-emerald-200 flex items-center gap-2 text-xs">
                  <span className="text-emerald-900 font-semibold text-[11px]">Connector:</span>
                  {(location.evConnectorTypes || ['CCS 2', 'Tesla NACS']).map(conn => (
                    <button
                      type="button"
                      key={conn}
                      onClick={() => setSelectedConnector(conn)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        selectedConnector === conn
                          ? 'bg-[#16A36A] text-white border-[#16A36A]'
                          : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {conn}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Coupon Code Section */}
          <div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo code (try 'SMARTPARK20' or 'HACKATHON')"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-[#E7EBF0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] uppercase bg-[#F3F6FA]/50 focus:bg-white text-[#172B4D] transition-all"
                />
                <Tag className="w-3.5 h-3.5 text-[#718096] absolute right-3 top-2.5" />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-3.5 py-2 text-xs font-bold bg-[#172B4D] hover:bg-slate-900 text-white rounded-xl transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p className={`text-[11px] mt-1.5 font-medium ${couponDiscount > 0 ? 'text-[#16A36A]' : 'text-[#DC5252]'}`}>
                {couponMessage}
              </p>
            )}
          </div>

          {/* Feature 6: Smart Dynamic Pricing Transparent Breakdown */}
          <div className="p-4 rounded-2xl bg-[#F3F6FA] border border-[#E7EBF0] space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-[#E7EBF0]">
              <span className="font-bold text-[#172B4D] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
                Smart Dynamic Pricing Engine
              </span>
              <span className="text-[10px] font-bold uppercase bg-blue-100 text-[#2563EB] px-2 py-0.5 rounded-full shadow-2xs">
                Transparent Fare
              </span>
            </div>

            {smartPricing ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#718096]">
                  <span>Standard Base Rate ({durationHours} hrs × ${smartPricing.baseHourlyRate.toFixed(2)})</span>
                  <span className="line-through text-slate-400">${smartPricing.originalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-medium">
                  <span className="flex items-center gap-1 text-[#172B4D]">
                    <Sparkles className="w-3 h-3 text-[#E9A23B]" />
                    Dynamic Occupancy Multiplier ({smartPricing.occupancySurgeMultiplier}x)
                  </span>
                  <span className={smartPricing.isSurge ? 'text-[#E9A23B] font-bold' : 'text-[#16A36A] font-bold'}>
                    {smartPricing.isSurge ? `+$${smartPricing.savingsOrSurgeAmount.toFixed(2)} Surge` : `-$${smartPricing.savingsOrSurgeAmount.toFixed(2)} Off-Peak`}
                  </span>
                </div>

                {includeEvCharging && (
                  <div className="flex justify-between text-[#16A36A] font-semibold">
                    <span>EV Fast-Charging Terminal Session</span>
                    <span>+${smartPricing.evFee.toFixed(2)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#16A36A] font-bold">
                    <span>Promo Discount ({couponDiscount * 100}%)</span>
                    <span>-${(smartPricing.adjustedPrice * couponDiscount).toFixed(2)}</span>
                  </div>
                )}

                {/* Transparent Explanations */}
                <div className="mt-2 pt-2 border-t border-[#E7EBF0] space-y-1 bg-white p-2.5 rounded-xl border border-[#E7EBF0] text-[11px] text-[#718096]">
                  <div className="font-bold text-[#172B4D] flex items-center gap-1 text-[10px] uppercase">
                    <Info className="w-3 h-3 text-[#2563EB]" />
                    Price Change Explanation:
                  </div>
                  {smartPricing.explanations.map((exp, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-[#718096]">
                      <span>•</span>
                      <span>{exp}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[#718096] py-1 text-center">Calculating live rates...</div>
            )}

            <div className="pt-2 border-t border-[#E7EBF0] flex justify-between items-baseline text-[#172B4D]">
              <div>
                <span className="font-extrabold text-sm block">Prepaid Authorization Total</span>
                <span className="text-[10px] text-[#718096]">Prepaid deposit for {durationHours}h reservation</span>
              </div>
              <div className="text-right">
                <span className="font-black text-2xl text-[#2563EB]">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Time-Based Billing Guarantee Badge */}
            <div className="mt-2 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[11px] text-blue-950 flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Fair Time-Based Billing Policy:</strong>
                <span className="text-[#718096] leading-tight">
                  You are only billed for actual hours parked. Timer starts upon scanning in at the entry gate. If you exit early, unused prepaid time is automatically refunded to your wallet!
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#718096] mb-2">
              3. Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'ParkWallet Balance', sub: `$${user.walletBalance.toFixed(2)} available` },
                { name: 'Apple Pay', sub: 'Instant One-Touch' },
                { name: 'Visa (•••• 4128)', sub: 'Exp 08/28' },
              ].map(m => (
                <button
                  type="button"
                  key={m.name}
                  onClick={() => setPaymentMethod(m.name)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === m.name
                      ? 'border-[#2563EB] bg-blue-50/60 ring-2 ring-[#2563EB]/20 font-bold text-[#172B4D]'
                      : 'border-[#E7EBF0] bg-white hover:bg-[#F3F6FA] text-[#172B4D]'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{m.name}</div>
                  <div className="text-[10px] text-[#718096] mt-0.5">{m.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-[#E7EBF0] text-xs font-bold text-[#718096] hover:bg-[#F3F6FA] hover:text-[#172B4D] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Securing Parking Bay...</span>
                </>
              ) : (
                <>
                  <span>Confirm Reservation & Generate QR Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
