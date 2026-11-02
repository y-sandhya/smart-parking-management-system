import React, { useState } from 'react';
import { UserProfile, VehicleType } from '../../types';
import {
  X,
  User,
  Mail,
  Phone,
  Car,
  Wallet,
  Award,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Zap,
  Bell
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [vehicles, setVehicles] = useState([...user.vehicles]);
  const [preferences, setPreferences] = useState({ ...user.preferences });

  // Add vehicle mini form
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState<VehicleType>('sedan');
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newModel) return;

    const newVeh = {
      id: `veh-${Date.now()}`,
      licensePlate: newPlate.toUpperCase(),
      model: newModel,
      color: '#2563EB',
      type: newType,
      isDefault: vehicles.length === 0,
    };

    setVehicles([...vehicles, newVeh]);
    setNewPlate('');
    setNewModel('');
    setShowAddVehicle(false);
  };

  const handleRemoveVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const handleSetDefaultVehicle = (id: string) => {
    setVehicles(vehicles.map(v => ({ ...v, isDefault: v.id === id })));
  };

  const handleSave = () => {
    onUpdateUser({
      ...user,
      name,
      email,
      phone,
      vehicles,
      preferences,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">{user.name}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/20">
                  {user.role === 'admin' ? 'Facility Admin' : 'Verified Driver'}
                </span>
              </div>
              <p className="text-xs text-blue-100">{user.email}</p>
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
          {/* ParkWallet & Rewards Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                ParkWallet Balance
              </span>
              <div className="text-2xl font-black text-blue-950 mt-1">
                ${user.walletBalance.toFixed(2)}
              </div>
              <span className="text-[10px] text-blue-700 font-medium">Instant One-Click Pass</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                SmartPark Rewards
              </span>
              <div className="text-2xl font-black text-amber-950 mt-1">
                {user.rewardPoints} pts
              </div>
              <span className="text-[10px] text-amber-700 font-medium">Gold Driver Tier</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider block">
              Contact Information
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Registered Vehicles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Registered Vehicles ({vehicles.length})
              </label>

              <button
                type="button"
                onClick={() => setShowAddVehicle(!showAddVehicle)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle</span>
              </button>
            </div>

            {/* Vehicle List */}
            <div className="space-y-2">
              {vehicles.map(v => (
                <div
                  key={v.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    v.isDefault ? 'border-blue-400 bg-blue-50/40' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Car className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{v.model}</span>
                        {v.isDefault && (
                          <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 font-semibold uppercase">
                        {v.licensePlate} • {v.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!v.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultVehicle(v.id)}
                        className="text-[10px] font-semibold text-blue-600 hover:underline"
                      >
                        Set Default
                      </button>
                    )}
                    {vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVehicle(v.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Vehicle Inline Drawer */}
            {showAddVehicle && (
              <form onSubmit={handleAddVehicle} className="p-3 bg-slate-100 rounded-xl space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    placeholder="License Plate (e.g. CA-490-ZZ)"
                    required
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono uppercase text-xs"
                  />
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="Vehicle Model (e.g. Honda Civic)"
                    required
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="px-2 py-1 rounded border border-slate-300 text-xs"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="ev">EV</option>
                    <option value="compact">Compact</option>
                    <option value="van">Van</option>
                  </select>

                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-xs"
                  >
                    Save Vehicle
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider block">
              Parking & Notification Preferences
            </label>

            <div className="space-y-2 text-xs text-slate-700">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Prioritize EV Fast-Charging Bays
                </span>
                <input
                  type="checkbox"
                  checked={preferences.evPriority}
                  onChange={(e) => setPreferences({ ...preferences, evPriority: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Send SMS reminders 15 mins prior to expiry
                </span>
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications}
                  onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
