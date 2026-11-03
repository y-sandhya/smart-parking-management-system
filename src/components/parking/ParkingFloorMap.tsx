import React, { useState } from 'react';
import { ParkingSlot } from '../../types';
import {
  Car,
  Zap,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ShieldCheck,
  Compass,
  Layers,
  Radio,
  CheckCircle2,
  Lock,
  BatteryCharging,
  Wifi,
  Sparkles,
  Info
} from 'lucide-react';

interface ParkingFloorMapProps {
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  onSelectSlot: (slot: ParkingSlot) => void;
  currentFloor: string;
  onFloorChange: (floor: string) => void;
  floors: string[];
}

export const ParkingFloorMap: React.FC<ParkingFloorMapProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  currentFloor,
  onFloorChange,
  floors,
}) => {
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('all');
  const [showSensorDetails, setShowSensorDetails] = useState<boolean>(false);

  // Filter slots for current floor
  const floorSlots = slots.filter(s => s.floor === currentFloor);
  const displayedSlots = activeZoneFilter === 'all'
    ? floorSlots
    : floorSlots.filter(s => s.zone === activeZoneFilter || s.zone.endsWith(activeZoneFilter));

  const totalOnFloor = floorSlots.length;
  const availableOnFloor = floorSlots.filter(s => s.status === 'available').length;
  const occupiedOnFloor = floorSlots.filter(s => s.status === 'occupied').length;
  const reservedOnFloor = floorSlots.filter(s => s.status === 'reserved').length;
  const evOnFloor = floorSlots.filter(s => s.hasEvCharger && s.status === 'available').length;

  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];

  // Top-down SVG car graphic for occupied slots (Crisp, stylish vehicle rendering)
  const renderVehicleSvg = (color: string = '#2563EB') => (
    <svg className="w-10 h-16 drop-shadow-sm transition-transform group-hover:scale-105" viewBox="0 0 40 65" fill="none">
      {/* Car Body Outer Shell */}
      <rect x="5" y="6" width="30" height="53" rx="7" fill={color} />
      {/* Front Windshield */}
      <path d="M9 18 C13 14, 27 14, 31 18 L29 27 C25 25, 15 25, 11 27 Z" fill="#0F172A" opacity="0.85" />
      {/* Rear Window */}
      <path d="M10 48 C14 51, 26 51, 30 48 L29 43 C25 44, 15 44, 11 43 Z" fill="#0F172A" opacity="0.85" />
      {/* Roof Panel */}
      <rect x="11" y="27" width="18" height="15" rx="3" fill="#FFFFFF" opacity="0.25" />
      {/* Front Headlights */}
      <rect x="7" y="7" width="5" height="3" rx="1.5" fill="#FEF08A" />
      <rect x="28" y="7" width="5" height="3" rx="1.5" fill="#FEF08A" />
      {/* Rear Taillights */}
      <rect x="7" y="55" width="5" height="2.5" rx="1" fill="#EF4444" />
      <rect x="28" y="55" width="5" height="2.5" rx="1" fill="#EF4444" />
      {/* Side Mirrors */}
      <rect x="3" y="19" width="3" height="4" rx="1.5" fill={color} />
      <rect x="34" y="19" width="3" height="4" rx="1.5" fill={color} />
    </svg>
  );

  return (
    <div className="bg-white rounded-3xl border border-[#E7EBF0] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-4 sm:p-6 space-y-6">
      {/* Floor & Zone Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E7EBF0]">
        {/* Floor Selection Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F3F6FA] rounded-2xl overflow-x-auto max-w-full border border-[#E7EBF0]">
          <span className="text-[11px] font-black uppercase text-[#718096] px-2.5 py-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
            Floor
          </span>
          {floors.map(floor => (
            <button
              key={floor}
              type="button"
              onClick={() => onFloorChange(floor)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                currentFloor === floor
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#718096] hover:text-[#172B4D] hover:bg-slate-200/60'
              }`}
            >
              {floor}
            </button>
          ))}
        </div>

        {/* Zone Filter & Telemetry Toggle */}
        <div className="flex items-center gap-2">
          {/* Zone filter buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-[#F3F6FA] border border-[#E7EBF0] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveZoneFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeZoneFilter === 'all'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-[#718096] hover:text-[#172B4D]'
              }`}
            >
              All Zones
            </button>
            {zones.map(z => {
              const zoneCode = z.replace('Zone ', '');
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => setActiveZoneFilter(zoneCode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeZoneFilter === zoneCode
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-[#718096] hover:text-[#172B4D]'
                  }`}
                >
                  {zoneCode}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowSensorDetails(!showSensorDetails)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              showSensorDetails
                ? 'bg-blue-50 border-blue-200 text-[#2563EB]'
                : 'bg-white border-[#E7EBF0] text-[#718096] hover:bg-[#F3F6FA]'
            }`}
            title="Toggle IoT Telemetry overlays"
          >
            <Radio className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="hidden md:inline">IoT Telemetry</span>
          </button>
        </div>
      </div>

      {/* Floor Occupancy Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#16A36A] animate-pulse" />
          <div>
            <div className="text-[11px] font-bold text-emerald-800">Available Bays</div>
            <div className="text-lg font-black text-emerald-950">{availableOnFloor} / {totalOnFloor}</div>
          </div>
        </div>

        <div className="p-3 bg-white border border-[#E7EBF0] rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-3 h-3 rounded-full bg-slate-400" />
          <div>
            <div className="text-[11px] font-bold text-[#718096]">Occupied</div>
            <div className="text-lg font-black text-[#172B4D]">{occupiedOnFloor}</div>
          </div>
        </div>

        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#E9A23B]" />
          <div>
            <div className="text-[11px] font-bold text-amber-800">Reserved</div>
            <div className="text-lg font-black text-amber-950">{reservedOnFloor}</div>
          </div>
        </div>

        <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center gap-3">
          <Zap className="w-4 h-4 text-[#2563EB]" />
          <div>
            <div className="text-[11px] font-bold text-blue-800">EV Available</div>
            <div className="text-lg font-black text-blue-950">{evOnFloor} Chargers</div>
          </div>
        </div>
      </div>

      {/* Top Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#718096] bg-[#F3F6FA] p-3 rounded-2xl border border-[#E7EBF0] gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-50 border-2 border-[#16A36A] inline-block shadow-2xs" />
            <span className="font-bold text-[#172B4D]">Available (Click to Reserve)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-50 border-2 border-[#DC5252] inline-block shadow-2xs" />
            <span className="font-bold text-[#172B4D]">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-50 border-2 border-[#E9A23B] inline-block shadow-2xs" />
            <span className="font-bold text-[#172B4D]">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-blue-50 border-2 border-[#2563EB] inline-block shadow-2xs" />
            <span className="font-bold text-[#172B4D]">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#16A36A] fill-current" />
            <span className="font-bold text-[#172B4D]">EV Charging</span>
          </div>
        </div>

        <div className="text-[11px] text-[#718096] flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Real-time Ultrasonic IoT Telemetry Simulated</span>
        </div>
      </div>

      {/* LIGHT THEME GARAGE DECK CANVAS (#F8FAFC) */}
      <div className="relative bg-[#F8FAFC] rounded-3xl p-6 overflow-hidden border-2 border-[#E7EBF0] shadow-xs">
        {/* Architectural Grid Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        {/* ENTRY GATE BARRIER */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E7EBF0] text-xs relative z-10">
          <div className="flex items-center gap-3 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 px-3.5 py-1.5 rounded-xl shadow-2xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#16A36A] animate-ping" />
            <span className="font-black tracking-wide text-emerald-900">GATE 1 • ENTRY (RFID & QR SCANNER)</span>
            <ArrowRight className="w-4 h-4 text-[#16A36A] animate-pulse" />
          </div>

          <div className="text-[#718096] text-[11px] font-mono hidden md:flex items-center gap-2 font-bold">
            <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>DIRECTION: ONE-WAY PERIMETER CIRCULATION</span>
          </div>

          <div className="flex items-center gap-2 bg-rose-50 border-2 border-rose-300 text-rose-900 px-3.5 py-1.5 rounded-xl shadow-2xs">
            <ArrowRight className="w-4 h-4 text-[#DC5252]" />
            <span className="font-black tracking-wide text-rose-900">GATE 2 • EXIT BARRIER</span>
          </div>
        </div>

        {/* ZONES GRID LAYOUT (Panels in #FFFFFF with #E7EBF0 borders) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {zones.map(zoneName => {
            const zoneCode = zoneName.replace('Zone ', '');
            if (activeZoneFilter !== 'all' && activeZoneFilter !== zoneCode) {
              return null;
            }

            const zoneSlots = floorSlots.filter(s => s.zone === zoneName || s.zone === zoneCode);

            return (
              <div
                key={zoneName}
                className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E7EBF0] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3"
              >
                {/* Zone Header & Elevator Guidance */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E7EBF0]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#2563EB] text-white font-black text-xs flex items-center justify-center shadow-2xs">
                      {zoneCode}
                    </span>
                    <span className="text-sm font-black text-[#172B4D]">{zoneName}</span>
                    <span className="text-[11px] font-bold text-[#718096]">
                      ({zoneSlots.filter(s => s.status === 'available').length} free)
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[#718096] flex items-center gap-1 font-semibold">
                    <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>~30s to Lobby Lift</span>
                  </span>
                </div>

                {/* Bays Grid in Zone */}
                <div className="grid grid-cols-3 gap-3">
                  {zoneSlots.map(slot => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isAvail = slot.status === 'available';
                    const isOccupied = slot.status === 'occupied';
                    const isReserved = slot.status === 'reserved';

                    return (
                      <div
                        key={slot.id}
                        onClick={() => {
                          if (isAvail) {
                            onSelectSlot(slot);
                          }
                        }}
                        className={`relative rounded-xl p-2.5 flex flex-col items-center justify-between min-h-[148px] transition-all duration-200 border-2 select-none ${
                          isSelected
                            ? 'bg-blue-50 border-[#2563EB] shadow-md ring-2 ring-[#2563EB]/25 scale-[1.02] cursor-pointer'
                            : isAvail
                            ? 'bg-emerald-50/80 border-[#16A36A]/60 hover:border-[#16A36A] hover:bg-emerald-100/70 hover:scale-[1.02] cursor-pointer group shadow-2xs'
                            : isReserved
                            ? 'bg-amber-50/80 border-[#E9A23B]/60 cursor-not-allowed shadow-2xs'
                            : 'bg-rose-50/70 border-[#DC5252]/60 cursor-not-allowed shadow-2xs'
                        }`}
                      >
                        {/* Bay number header & EV icon */}
                        <div className="w-full flex items-center justify-between text-xs">
                          <span
                            className={`font-black tracking-tight ${
                              isSelected
                                ? 'text-blue-950'
                                : isAvail
                                ? 'text-emerald-950'
                                : isReserved
                                ? 'text-amber-950'
                                : 'text-rose-950'
                            }`}
                          >
                            {slot.slotNumber}
                          </span>

                          <div className="flex items-center gap-1">
                            {slot.hasEvCharger && (
                              <span
                                className="p-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300"
                                title={`EV Charger: ${slot.evChargerPowerKw || 150}kW`}
                              >
                                <Zap className="w-3 h-3 fill-current" />
                              </span>
                            )}
                            {slot.type === 'disabled' && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-bold border border-blue-200">
                                ACC
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bay Center Graphic */}
                        <div className="my-1 flex items-center justify-center w-full">
                          {isOccupied ? (
                            <div className="flex flex-col items-center">
                              {renderVehicleSvg('#2563EB')}
                              <span className="text-[9px] font-mono text-[#172B4D] bg-white border border-rose-200 px-1.5 py-0.5 rounded shadow-2xs mt-1 font-bold line-clamp-1 max-w-[70px] text-center">
                                {slot.occupiedVehicle?.licensePlate || 'PARKED'}
                              </span>
                            </div>
                          ) : isReserved ? (
                            <div className="flex flex-col items-center text-amber-700 py-3">
                              <Lock className="w-6 h-6 mb-1 text-[#E9A23B]" />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                Reserved
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                                <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                              </div>
                              <span className="text-[10px] font-bold text-emerald-800 mt-1">
                                Open Bay
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bay Footer Rate or Occupied Status */}
                        <div className="w-full text-center pt-1 border-t border-[#E7EBF0]">
                          {isAvail ? (
                            <span className="text-[11px] font-black text-emerald-950">
                              ${(slot.baseHourlyRate * 1.15).toFixed(2)}/hr
                            </span>
                          ) : isOccupied ? (
                            <span className="text-[10px] font-bold text-[#DC5252]">
                              Occupied
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#E9A23B]">
                              Reserved
                            </span>
                          )}
                        </div>

                        {/* Optional IoT Telemetry Badge */}
                        {showSensorDetails && slot.iotSensor && (
                          <div className="absolute -top-1.5 -right-1.5 bg-white border border-blue-200 text-[#2563EB] text-[8px] font-mono px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1 z-20 font-bold">
                            <Wifi className="w-2.5 h-2.5 text-[#2563EB]" />
                            <span>{slot.iotSensor.batteryLevel}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Driving Lane Runway Indicator (Light Road Markings) */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-[#CBD5E1] flex items-center justify-between text-[#718096] font-mono text-[11px] relative z-10">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[#E9A23B] animate-pulse" />
            <span className="tracking-widest uppercase font-bold text-[#172B4D]">Drive Lane A → Zone B Connector</span>
          </div>

          <div className="px-3 py-1 rounded-md bg-white text-[#172B4D] font-bold border border-[#E7EBF0] shadow-2xs">
            MAX CLEARANCE: 2.1 METERS
          </div>

          <div className="flex items-center gap-2 font-bold text-[#172B4D]">
            <span className="tracking-widest uppercase">Pedestrian Pathway To Elevators</span>
            <ArrowRight className="w-4 h-4 text-[#16A36A]" />
          </div>
        </div>
      </div>
    </div>
  );
};
