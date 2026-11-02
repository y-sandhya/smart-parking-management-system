import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { HeatmapResponse, ZoneHeatmapData } from '../../types';
import {
  X,
  Flame,
  Layers,
  BarChart2,
  Calendar,
  Clock,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface DemandHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  locationName: string;
}

export const DemandHeatmapModal: React.FC<DemandHeatmapModalProps> = ({
  isOpen,
  onClose,
  locationId,
  locationName,
}) => {
  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<HeatmapResponse | null>(null);

  useEffect(() => {
    fetchHeatmap();
  }, [locationId]);

  const fetchHeatmap = async () => {
    setIsLoading(true);
    try {
      const res = await api.getHeatmapData(locationId);
      setData(res);
    } catch (err) {
      console.error('Heatmap load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">Visual Parking Occupancy Heatmap</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/30 px-2 py-0.5 rounded-full">
                  Zone Intensity
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{locationName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Generating visual thermal occupancy matrix...</span>
            </div>
          ) : data ? (
            <>
              {/* Heatmap Legend */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100 text-xs">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Demand Intensity Spectrum:
                </span>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                    Low (&lt;40%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-blue-500"></span>
                    Moderate (40-64%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-amber-500"></span>
                    High (65-84%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-rose-500 animate-pulse"></span>
                    Surge Peak (&gt;85%)
                  </span>
                </div>
              </div>

              {/* Floor and Zone Thermal Tiles */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider mb-3">
                  Zone Congestion & Occupancy Density
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.zones.map((zone, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
                      style={{
                        borderColor: `${zone.intensityColor}50`,
                        backgroundColor: `${zone.intensityColor}12`,
                      }}
                    >
                      <div
                        className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-xl pointer-events-none"
                        style={{ backgroundColor: zone.intensityColor, opacity: 0.25 }}
                      />

                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {zone.zone}
                        </span>
                        <span
                          className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: zone.intensityColor }}
                        >
                          {zone.demandLevel}
                        </span>
                      </div>

                      <div className="my-2">
                        <div className="text-3xl font-black text-slate-900 tracking-tight">
                          {zone.occupancyPercentage}%
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {zone.floor} • {zone.occupiedSlots}/{zone.totalSlots} spaces taken
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Turnover: {zone.averageTurnoverHours}h</span>
                        <span className="font-bold text-slate-700">{zone.availableSlots} Free</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly & Daily Demand Graphs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hourly Profile */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Hourly Occupancy Curve
                    </span>
                    <span className="text-[10px] text-slate-400">06:00 - 22:00</span>
                  </div>

                  <div className="flex items-end gap-2 h-28 pt-2">
                    {data.hourlyTrend.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-slate-200 rounded-t h-20 flex items-end overflow-hidden">
                          <div
                            className={`w-full rounded-t transition-all ${
                              h.occupancy >= 85
                                ? 'bg-rose-500'
                                : h.occupancy >= 65
                                ? 'bg-amber-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ height: `${h.occupancy}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 font-bold">{h.hour}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day-of-Week Profile */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Weekly Daily Load (Mon - Sun)
                    </span>
                    <span className="text-[10px] text-slate-400">Historical Avg</span>
                  </div>

                  <div className="flex items-end gap-2 h-28 pt-2">
                    {data.dailyTrend.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-slate-200 rounded-t h-20 flex items-end overflow-hidden">
                          <div
                            className="w-full rounded-t bg-emerald-500 transition-all"
                            style={{ height: `${d.occupancy}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 font-bold">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
