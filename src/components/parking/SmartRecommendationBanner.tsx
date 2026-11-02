import React, { useState, useEffect } from 'react';
import { ParkingSlot } from '../../types';
import { Sparkles, Zap, Accessibility, ChevronRight, Check, Compass, SlidersHorizontal } from 'lucide-react';
import { api } from '../../services/api';

interface SmartRecommendationBannerProps {
  locationId: string;
  currentFloor: string;
  onSelectSlot: (slot: ParkingSlot) => void;
  selectedSlotId?: string;
  defaultVehicleType?: string;
}

export const SmartRecommendationBanner: React.FC<SmartRecommendationBannerProps> = ({
  locationId,
  currentFloor,
  onSelectSlot,
  selectedSlotId,
  defaultVehicleType = 'sedan',
}) => {
  const [recommendations, setRecommendations] = useState<{
    slot: ParkingSlot;
    matchScore: number;
    reasons: string[];
    badge: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresEv, setRequiresEv] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [vehicleType, setVehicleType] = useState(defaultVehicleType);

  useEffect(() => {
    fetchRecommendations();
  }, [locationId, currentFloor, requiresEv, vehicleType]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSlotRecommendations({
        locationId,
        floor: currentFloor,
        vehicleType,
        requiresEv,
      });
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (recommendations.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden mb-6">
      {/* Subtle background glow rings */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                AI Smart Slot Recommendation Engine
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                Live Algorithm
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Personalized matching based on walking distance, floor proximity, and EV charging needs.
            </p>
          </div>
        </div>

        {/* Quick preference toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRequiresEv(!requiresEv)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              requiresEv
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>EV Charging Only</span>
          </button>

          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10 transition-colors"
            title="Adjust Vehicle Type"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vehicle Type Picker Dropdown if toggled */}
      {showOptions && (
        <div className="relative z-10 mb-4 p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-300 font-medium">Vehicle Profile:</span>
          {['sedan', 'suv', 'ev', 'compact', 'van'].map(v => (
            <button
              key={v}
              onClick={() => {
                setVehicleType(v);
                if (v === 'ev') setRequiresEv(true);
              }}
              className={`px-3 py-1 rounded-lg uppercase text-[11px] font-bold transition-all ${
                vehicleType === v
                  ? 'bg-blue-500 text-white shadow-xs'
                  : 'bg-white/5 text-slate-300 hover:bg-white/15'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Recommended Slot Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recommendations.map(({ slot, matchScore, reasons, badge }) => {
          const isChosen = selectedSlotId === slot.id;

          return (
            <div
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              className={`group bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl p-3.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isChosen
                  ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-white/20 shadow-lg'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold text-xs">
                    <span>{matchScore}% Match</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-1">
                  <h5 className="font-extrabold text-lg text-white">
                    Bay {slot.slotNumber}
                  </h5>
                  <span className="text-xs font-semibold text-slate-300">
                    ${(slot.baseHourlyRate * 1.15).toFixed(2)}/hr
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {reasons.slice(0, 2).map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="line-clamp-1">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {slot.floor} • {slot.zone}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSlot(slot);
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    isChosen
                      ? 'bg-cyan-400 text-slate-900 shadow-sm'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  <span>{isChosen ? 'Selected' : 'Pick Bay'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
