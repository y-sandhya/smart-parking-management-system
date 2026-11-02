import React, { useState } from 'react';
import { ParkingSlot, SlotType } from '../../types';
import { VehicleIllustration } from './VehicleIllustration';
import { 
  Zap, 
  Car, 
  ShieldCheck, 
  Radio, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Navigation,
  Accessibility,
  BatteryCharging
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
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [hoveredSlot, setHoveredSlot] = useState<ParkingSlot | null>(null);

  // Filter slots by current floor
  const floorSlots = slots.filter(s => s.floor === currentFloor);
  const zones = ['all', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];

  const displayedSlots = selectedZone === 'all'
    ? floorSlots
    : floorSlots.filter(s => s.zone === selectedZone);

  // Group slots by Zone for clear visual lanes
  const zoneGroups = ['Zone A', 'Zone B', 'Zone C', 'Zone D'].map(zoneName => ({
    zone: zoneName,
    slots: floorSlots.filter(s => s.zone === zoneName),
  }));

  const getSlotTypeBadge = (type: SlotType) => {
    switch (type) {
      case 'ev':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            <Zap className="w-3 h-3 text-emerald-600 fill-emerald-500" /> EV 150kW
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
            <Accessibility className="w-3 h-3 text-blue-600" /> Accessible
          </span>
        );
      case 'compact':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            Compact
          </span>
        );
      case 'vip':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            VIP Bay
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            Standard
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header bar with Floor selector and live stats */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-lg">Interactive Parking Layout</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live IoT Sensors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click an available green bay to reserve. Hover to inspect sensor telemetry.
          </p>
        </div>

        {/* Floor Selection Tabs */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
          {floors.map(floor => (
            <button
              key={floor}
              onClick={() => onFloorChange(floor)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                currentFloor === floor
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/60'
              }`}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Status Legend */}
      <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-white">
        {/* Zone Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Zone:</span>
          {zones.map(z => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedZone === z
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {z === 'all' ? 'All Zones' : z}
            </button>
          ))}
        </div>

        {/* Status Indicators Legend */}
        <div className="flex items-center gap-4 flex-wrap text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-200"></span>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Floor Plan Canvas Layout */}
      <div className="p-4 sm:p-6 bg-slate-100/70 overflow-x-auto min-h-[520px] flex flex-col justify-between">
        {/* Entrance Gate Wayfinding Banner */}
        <div className="flex items-center justify-between mb-4 bg-white/90 backdrop-blur-sm border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              IN
            </div>
            <div>
              <span className="text-slate-900">Main Vehicle Gate & Scanner Barrier</span>
              <span className="text-slate-400 font-normal ml-2">Clearance 2.4m • Automated QR Lane</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1 text-blue-600">
              <Navigation className="w-3.5 h-3.5" /> One-Way Flow
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
              OUT
            </div>
          </div>
        </div>

        {/* Garage Bay Grid with Driving Aisles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zoneGroups.map(({ zone, slots: zSlots }) => {
            if (selectedZone !== 'all' && selectedZone !== zone) return null;

            return (
              <div
                key={zone}
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col justify-between"
              >
                {/* Zone Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                    <span className="font-bold text-xs text-slate-800">{zone}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {zSlots.filter(s => s.status === 'available').length} / {zSlots.length} Free
                  </span>
                </div>

                {/* Slots Column */}
                <div className="space-y-3">
                  {zSlots.map(slot => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isAvailable = slot.status === 'available';
                    const isOccupied = slot.status === 'occupied';
                    const isReserved = slot.status === 'reserved';

                    return (
                      <div
                        key={slot.id}
                        onClick={() => {
                          if (isAvailable) onSelectSlot(slot);
                        }}
                        onMouseEnter={() => setHoveredSlot(slot)}
                        onMouseLeave={() => setHoveredSlot(null)}
                        className={`relative rounded-xl border-2 transition-all duration-200 p-2.5 select-none ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 ring-4 ring-blue-100 shadow-md scale-[1.02] cursor-pointer'
                            : isAvailable
                            ? 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-sm cursor-pointer'
                            : isReserved
                            ? 'border-amber-300 bg-amber-50/50 cursor-not-allowed opacity-90'
                            : 'border-slate-300 bg-slate-50 cursor-not-allowed'
                        }`}
                      >
                        {/* Slot Header */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                              Bay {slot.slotNumber}
                            </span>
                            {/* Status Dot */}
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSelected
                                  ? 'bg-blue-600 animate-ping'
                                  : isAvailable
                                  ? 'bg-emerald-500'
                                  : isReserved
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            ></span>
                          </div>

                          <div className="flex items-center gap-1">
                            {getSlotTypeBadge(slot.type)}
                          </div>
                        </div>

                        {/* Middle: Parking Bay Graphics with Vehicle Illustration if occupied/reserved */}
                        <div className="h-28 w-full rounded-lg bg-slate-900/5 border border-dashed border-slate-300/80 relative flex items-center justify-center overflow-hidden">
                          {/* Parking Bay Painted Line Markings */}
                          <div className="absolute top-1 left-2 text-[9px] font-mono font-bold text-slate-400">
                            [ {slot.slotNumber} ]
                          </div>
                          
                          {/* Top-down vehicle illustration if occupied or reserved */}
                          {isOccupied && slot.occupiedVehicle ? (
                            <div className="flex flex-col items-center">
                              <VehicleIllustration
                                type={slot.occupiedVehicle.type}
                                color={slot.occupiedVehicle.color}
                                className="w-14 h-24"
                                isCharging={slot.type === 'ev'}
                              />
                              <span className="absolute bottom-1 bg-slate-900/80 text-white text-[8px] font-mono px-1.5 py-0.2 rounded">
                                {slot.occupiedVehicle.licensePlate}
                              </span>
                            </div>
                          ) : isReserved ? (
                            <div className="flex flex-col items-center justify-center text-amber-700">
                              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-1">
                                <Clock className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                Reserved Bay
                              </span>
                              <span className="text-[9px] text-amber-600">Pending Arrival</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-emerald-700 py-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-transform ${isSelected ? 'bg-blue-600 text-white scale-110' : 'bg-emerald-100 text-emerald-600'}`}>
                                {isSelected ? (
                                  <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                  <Car className="w-4 h-4" />
                                )}
                              </div>
                              <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-700' : 'text-emerald-700'}`}>
                                {isSelected ? 'Selected' : 'Available'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold">
                                ${(slot.baseHourlyRate * 1.15).toFixed(2)}/hr
                              </span>
                            </div>
                          )}

                          {/* IoT Sensor Blip indicator at the top of bay */}
                          <div className="absolute top-1 right-2 flex items-center gap-0.5 text-[8px] font-mono text-slate-500 bg-white/80 px-1 rounded shadow-2xs">
                            <Radio className={`w-2.5 h-2.5 ${isOccupied ? 'text-rose-500' : 'text-emerald-500 animate-pulse'}`} />
                            <span>{slot.iotSensor.batteryLevel}%</span>
                          </div>
                        </div>

                        {/* Footer Details */}
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {slot.distanceToElevatorMeters}m to lift
                          </span>
                          {isAvailable && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSlot(slot);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                            >
                              {isSelected ? 'Chosen' : 'Select'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Central Lane Wayfinding Indicator */}
                <div className="mt-3 pt-2 border-t border-dashed border-slate-200 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
                  <span>◀ LANE {zone.charAt(5)}</span>
                  <span>•</span>
                  <span>SPEED 10 KM/H</span>
                  <span>▶</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hovered / Selected Slot IoT Telemetry Card */}
        {(hoveredSlot || selectedSlot) && (
          <div className="mt-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-sm">
                {(hoveredSlot || selectedSlot)?.slotNumber}
              </div>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>Bay {(hoveredSlot || selectedSlot)?.slotNumber} Details</span>
                  <span className="text-[10px] font-medium text-slate-500">
                    Floor {(hoveredSlot || selectedSlot)?.floor} • {(hoveredSlot || selectedSlot)?.zone}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] flex items-center gap-3 mt-0.5">
                  <span>Rate: ${(hoveredSlot || selectedSlot)?.currentDynamicRate.toFixed(2)}/hr</span>
                  <span>•</span>
                  <span>Distance: {(hoveredSlot || selectedSlot)?.distanceToElevatorMeters} meters ({(hoveredSlot || selectedSlot)?.walkingTimeSeconds}s walk)</span>
                  <span>•</span>
                  <span>Bay Size: {(hoveredSlot || selectedSlot)?.dimensions.widthM}m × {(hoveredSlot || selectedSlot)?.dimensions.lengthM}m</span>
                </div>
              </div>
            </div>

            {/* IoT Sensor Reading (Simulated) */}
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-700 flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Sensor {(hoveredSlot || selectedSlot)?.iotSensor.sensorId} (Simulated)
                </div>
                <div className="text-[10px] text-slate-400">
                  Clearance: {(hoveredSlot || selectedSlot)?.iotSensor.rawDistanceCm}cm • Signal: {(hoveredSlot || selectedSlot)?.iotSensor.signalStrengthDbm} dBm
                </div>
              </div>
              <div className="text-emerald-600 font-extrabold text-xs">
                {(hoveredSlot || selectedSlot)?.iotSensor.detectionConfidence}% Conf.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
