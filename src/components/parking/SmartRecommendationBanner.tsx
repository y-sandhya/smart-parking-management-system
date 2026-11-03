import React, { useEffect, useState } from 'react';
import { ParkingSlot } from '../../types';
import { api } from '../../services/api';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Clock,
  TrendingDown
} from 'lucide-react';

interface SmartRecommendationBannerProps {
  locationId: string;
  currentFloor: string;
  onSelectSlot: (slot: ParkingSlot) => void;
  selectedSlotId?: string;
  defaultVehicleType: string;
}

export const SmartRecommendationBanner: React.FC<SmartRecommendationBannerProps> = ({
  locationId,
  currentFloor,
  onSelectSlot,
  selectedSlotId,
  defaultVehicleType,
}) => {
  const [recommendedSlot, setRecommendedSlot] = useState<ParkingSlot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBestSlot = async () => {
      setLoading(true);
      try {
        const slots = await api.getSlots({ locationId, floor: currentFloor, status: 'available' });
        if (!isMounted) return;

        if (slots.length > 0) {
          // Sort by walking distance & EV preference if applicable
          const sorted = [...slots].sort((a, b) => {
            if (defaultVehicleType === 'ev') {
              if (a.hasEvCharger && !b.hasEvCharger) return -1;
              if (!a.hasEvCharger && b.hasEvCharger) return 1;
            }
            return (a.distanceToElevatorMeters || 20) - (b.distanceToElevatorMeters || 20);
          });
          setRecommendedSlot(sorted[0]);
        } else {
          setRecommendedSlot(null);
        }
      } catch (err) {
        console.error('Failed to load recommendation:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBestSlot();
    return () => {
      isMounted = false;
    };
  }, [locationId, currentFloor, defaultVehicleType]);

  if (loading || !recommendedSlot) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-blue-500/30 relative overflow-hidden">
      {/* Background glow circle */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Recommendation Badge & Highlights */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30">
                AI Smart Pick
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Best bay for your {defaultVehicleType.toUpperCase()}
              </span>
            </div>

            <h3 className="text-lg font-black text-white mt-0.5">
              Bay {recommendedSlot.slotNumber} • {recommendedSlot.zone} ({recommendedSlot.floor})
            </h3>

            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                {recommendedSlot.distanceToElevatorMeters || 12}m to Elevator
              </span>

              {recommendedSlot.hasEvCharger && (
                <span className="flex items-center gap-1 text-emerald-300 font-bold">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {recommendedSlot.evChargerPowerKw || 150}kW Supercharger
                </span>
              )}

              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <TrendingDown className="w-3.5 h-3.5" />
                ${(recommendedSlot.baseHourlyRate * 1.15).toFixed(2)}/hr Dynamic Rate
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: CTA Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectSlot(recommendedSlot)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/40 hover:shadow-blue-500/60 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Book Recommended Bay {recommendedSlot.slotNumber}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
