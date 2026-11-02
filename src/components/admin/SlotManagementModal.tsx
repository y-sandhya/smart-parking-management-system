import React, { useState, useEffect } from 'react';
import { ParkingSlot, SlotType } from '../../types';
import { X, Save, Trash2, Zap, Accessibility, Car } from 'lucide-react';

interface SlotManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ParkingSlot | null;
  locationId: string;
  floors: string[];
  zones: string[];
  onSave: (slotData: Partial<ParkingSlot>) => Promise<void>;
  onDelete?: (slotId: string) => Promise<void>;
}

export const SlotManagementModal: React.FC<SlotManagementModalProps> = ({
  isOpen,
  onClose,
  slot,
  locationId,
  floors,
  zones,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  const isEditing = !!slot;

  const [slotNumber, setSlotNumber] = useState<string>(slot?.slotNumber || 'A105');
  const [floor, setFloor] = useState<string>(slot?.floor || floors[0] || 'Level B1');
  const [zone, setZone] = useState<string>(slot?.zone || zones[0] || 'Zone A');
  const [type, setType] = useState<SlotType>(slot?.type || 'standard');
  const [baseHourlyRate, setBaseHourlyRate] = useState<number>(slot?.baseHourlyRate || 4.50);
  const [hasEvCharger, setHasEvCharger] = useState<boolean>(slot?.hasEvCharger || false);
  const [evPowerKw, setEvPowerKw] = useState<number>(slot?.evChargerPowerKw || 150);
  const [distanceToElevator, setDistanceToElevator] = useState<number>(slot?.distanceToElevatorMeters || 18);
  const [widthM, setWidthM] = useState<number>(slot?.dimensions.widthM || 2.5);
  const [lengthM, setLengthM] = useState<number>(slot?.dimensions.lengthM || 5.0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (slot) {
      setSlotNumber(slot.slotNumber);
      setFloor(slot.floor);
      setZone(slot.zone);
      setType(slot.type);
      setBaseHourlyRate(slot.baseHourlyRate);
      setHasEvCharger(slot.hasEvCharger);
      setEvPowerKw(slot.evChargerPowerKw || 150);
      setDistanceToElevator(slot.distanceToElevatorMeters);
      setWidthM(slot.dimensions.widthM);
      setLengthM(slot.dimensions.lengthM);
    }
  }, [slot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        id: slot?.id,
        locationId,
        slotNumber,
        floor,
        zone,
        type,
        baseHourlyRate: Number(baseHourlyRate),
        currentDynamicRate: Number((baseHourlyRate * 1.15).toFixed(2)),
        hasEvCharger,
        evChargerPowerKw: hasEvCharger ? Number(evPowerKw) : undefined,
        distanceToElevatorMeters: Number(distanceToElevator),
        walkingTimeSeconds: Math.round(Number(distanceToElevator) * 0.9),
        dimensions: {
          widthM: Number(widthM),
          lengthM: Number(lengthM),
        },
      });
      onClose();
    } catch (err) {
      console.error('Failed to save slot:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slot || !onDelete) return;
    if (window.confirm(`Are you sure you want to permanently delete Bay ${slot.slotNumber}?`)) {
      setIsSaving(true);
      try {
        await onDelete(slot.id);
        onClose();
      } catch (err) {
        console.error('Failed to delete slot:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">
              {isEditing ? `Edit Parking Bay ${slot?.slotNumber}` : 'Add New Parking Bay'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Bay Identifier</label>
              <input
                type="text"
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value.toUpperCase())}
                required
                placeholder="e.g. A105"
                className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Base Hourly Rate ($)</label>
              <input
                type="number"
                step="0.25"
                value={baseHourlyRate}
                onChange={(e) => setBaseHourlyRate(parseFloat(e.target.value) || 0)}
                required
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Floor Level</label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                {floors.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                {zones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Slot Category</label>
              <select
                value={type}
                onChange={(e) => {
                  const val = e.target.value as SlotType;
                  setType(val);
                  if (val === 'ev') setHasEvCharger(true);
                }}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard Vehicle</option>
                <option value="ev">EV Fast Charging</option>
                <option value="disabled">Accessible / Wheelchair</option>
                <option value="compact">Compact Small Car</option>
                <option value="suv">Wide SUV / Van</option>
                <option value="vip">VIP Reserved</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Distance to Elevator (m)</label>
              <input
                type="number"
                value={distanceToElevator}
                onChange={(e) => setDistanceToElevator(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* EV Charging options */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-emerald-950">Electric Vehicle Fast Charger</div>
                <div className="text-[11px] text-emerald-700">Equipped with Level 2 / DC Fast Terminal</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hasEvCharger}
              onChange={(e) => setHasEvCharger(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </div>

          {/* Bay Dimensions */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Width (meters)</label>
              <input
                type="number"
                step="0.1"
                value={widthM}
                onChange={(e) => setWidthM(parseFloat(e.target.value) || 2.5)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Length (meters)</label>
              <input
                type="number"
                step="0.1"
                value={lengthM}
                onChange={(e) => setLengthM(parseFloat(e.target.value) || 5.0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Bay</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Bay'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
