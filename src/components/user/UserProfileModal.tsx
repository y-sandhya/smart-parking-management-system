import React, { useState } from 'react';
import { UserProfile, VehicleType } from '../../types';
import {
  X,
  User,
  Mail,
  Phone,
  Wallet,
  Car,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  SlidersHorizontal,
  CreditCard,
  Sparkles
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'vehicles' | 'wallet' | 'preferences'>('profile');
  const [profileData, setProfileData] = useState<UserProfile>({ ...user });
  const [showAddVehicle, setShowAddVehicle] = useState<boolean>(false);
  const [newPlate, setNewPlate] = useState<string>('');
  const [newModel, setNewModel] = useState<string>('');
  const [newColor, setNewColor] = useState<string>('White');
  const [newType, setNewType] = useState<VehicleType>('sedan');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(profileData);
    showToast('Profile information saved!');
  };

  const handleTopUp = (amount: number) => {
    const updated = {
      ...profileData,
      walletBalance: Number((profileData.walletBalance + amount).toFixed(2)),
    };
    setProfileData(updated);
    onUpdateUser(updated);
    showToast(`Added $${amount}.00 to simulated wallet!`);
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim() || !newModel.trim()) return;

    const newVeh = {
      id: `veh-${Date.now()}`,
      licensePlate: newPlate.trim().toUpperCase(),
      model: newModel.trim(),
      color: newColor,
      type: newType,
      isDefault: profileData.vehicles.length === 0,
    };

    const updated = {
      ...profileData,
      vehicles: [...profileData.vehicles, newVeh],
    };
    setProfileData(updated);
    onUpdateUser(updated);
    setNewPlate('');
    setNewModel('');
    setShowAddVehicle(false);
    showToast(`Vehicle ${newVeh.model} added!`);
  };

  const handleRemoveVehicle = (id: string) => {
    const updated = {
      ...profileData,
      vehicles: profileData.vehicles.filter(v => v.id !== id),
    };
    setProfileData(updated);
    onUpdateUser(updated);
    showToast('Vehicle removed');
  };

  const handleSetDefaultVehicle = (id: string) => {
    const updated = {
      ...profileData,
      vehicles: profileData.vehicles.map(v => ({
        ...v,
        isDefault: v.id === id,
      })),
    };
    setProfileData(updated);
    onUpdateUser(updated);
    showToast('Default vehicle updated');
  };

  const handleTogglePreference = (key: keyof UserProfile['preferences']) => {
    const updated = {
      ...profileData,
      preferences: {
        ...profileData.preferences,
        [key]: !profileData.preferences[key],
      },
    };
    setProfileData(updated);
    onUpdateUser(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={profileData.avatarUrl}
              alt={profileData.name}
              className="w-14 h-14 rounded-full border-2 border-white/50 object-cover shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{profileData.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-blue-100">
                  {profileData.role}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">{profileData.email}</p>
            </div>
          </div>

          {/* Quick Balance & Points Pill */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-bold text-white">
              <Wallet className="w-3.5 h-3.5 text-emerald-300" />
              <span>Simulated Balance: ${profileData.walletBalance.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-bold text-white">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>{profileData.rewardPoints} Smart Points</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 px-6 bg-slate-50/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Driver Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vehicles')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'vehicles'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Vehicles ({profileData.vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'wallet'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Simulated Wallet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Preferences
          </button>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="mx-6 mt-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          )}

          {/* TAB 2: Vehicles */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Registered Vehicles
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddVehicle(!showAddVehicle)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Vehicle</span>
                </button>
              </div>

              {/* Add Vehicle Form */}
              {showAddVehicle && (
                <form onSubmit={handleAddVehicle} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">License Plate</label>
                      <input
                        type="text"
                        value={newPlate}
                        onChange={(e) => setNewPlate(e.target.value)}
                        placeholder="e.g. 7XYZ890"
                        className="w-full p-2 text-xs rounded-xl border border-slate-200 uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Model Name</label>
                      <input
                        type="text"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        placeholder="e.g. Tesla Model 3"
                        className="w-full p-2 text-xs rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Vehicle Type</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as VehicleType)}
                        className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="ev">Electric Vehicle (EV)</option>
                        <option value="hatchback">Hatchback</option>
                        <option value="compact">Compact</option>
                        <option value="van">Van</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Color</label>
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="e.g. Pearl White"
                        className="w-full p-2 text-xs rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
                    >
                      Save Vehicle
                    </button>
                  </div>
                </form>
              )}

              {/* Vehicle Cards */}
              <div className="space-y-2.5">
                {profileData.vehicles.map(veh => (
                  <div
                    key={veh.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                        {veh.type === 'ev' ? (
                          <Zap className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Car className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{veh.model}</span>
                          {veh.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-100 text-blue-700">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {veh.licensePlate} • {veh.color} • {veh.type.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!veh.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultVehicle(veh.id)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          Set Default
                        </button>
                      )}
                      {profileData.vehicles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVehicle(veh.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Remove vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Simulated Wallet */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl relative overflow-hidden shadow-xl">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Simulated Driver Balance
                </div>
                <div className="text-3xl font-black text-white mt-1">
                  ${profileData.walletBalance.toFixed(2)}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Used for automated reservation hold, time-based per-minute billing, and automated refunds upon exit.
                </div>
                <div className="mt-3 text-[10px] text-amber-300 font-mono">
                  * Note: Simulated accounting environment. No real bank accounts charged.
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Top-Up Demo Funds
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[25, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleTopUp(amt)}
                      className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 font-black text-sm text-slate-800 transition-all shadow-xs cursor-pointer text-center"
                    >
                      +${amt}.00
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                Smart Parking Preferences
              </span>

              {[
                {
                  key: 'evPriority' as const,
                  title: 'EV Supercharger Priority',
                  desc: 'Automatically suggest parking bays with 150kW+ chargers first',
                },
                {
                  key: 'disabledAccess' as const,
                  title: 'Accessible & Ground Bays',
                  desc: 'Prioritize wheelchair accessible bays near elevators',
                },
                {
                  key: 'compactOnly' as const,
                  title: 'Compact Vehicle Priority',
                  desc: 'Save costs with compact vehicle designated spots',
                },
                {
                  key: 'smsNotifications' as const,
                  title: 'SMS Expiry Alerts',
                  desc: 'Receive alerts 15 minutes prior to booking expiration',
                },
                {
                  key: 'emailReceipts' as const,
                  title: 'Digital PDF Receipts',
                  desc: 'Email detailed check-out billing receipts upon exit',
                },
              ].map(pref => (
                <div
                  key={pref.key}
                  onClick={() => handleTogglePreference(pref.key)}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="pr-3">
                    <div className="font-bold text-xs text-slate-800">{pref.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{pref.desc}</div>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      profileData.preferences[pref.key] ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                        profileData.preferences[pref.key] ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
