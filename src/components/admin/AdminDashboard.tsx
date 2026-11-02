import React, { useState, useEffect } from 'react';
import { ParkingLocation, ParkingSlot, Reservation, OccupancyStats, OverstayAlert } from '../../types';
import { api } from '../../services/api';
import { SlotManagementModal } from './SlotManagementModal';
import { GateScannerModal } from './GateScannerModal';
import { DemandForecastModal } from './DemandForecastModal';
import { DemandHeatmapModal } from '../parking/DemandHeatmapModal';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Radio,
  Car,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Scan,
  RefreshCw,
  Search,
  Brain,
  Sliders,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Filter,
  Download,
  Users,
  Flame,
  Phone,
  AlertOctagon
} from 'lucide-react';

interface AdminDashboardProps {
  locations: ParkingLocation[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  locations,
  onRefreshData,
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || 'loc-metro-central');
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [overstayAlerts, setOverstayAlerts] = useState<OverstayAlert[]>([]);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [analytics, setAnalytics] = useState<{
    stats: OccupancyStats;
    hourlyOccupancy: { hour: string; rate: number; revenue: number }[];
    zoneDistribution: { zone: string; occupancy: number; total: number; revenue: number }[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'monitor' | 'spaces' | 'bookings' | 'analytics' | 'overstay' | 'iot'>('monitor');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);
  const [isGateScannerOpen, setIsGateScannerOpen] = useState(false);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const [isRandomizingIoT, setIsRandomizingIoT] = useState(false);

  const currentLocation = locations.find(l => l.id === selectedLocationId) || locations[0];

  useEffect(() => {
    fetchAdminData();
  }, [selectedLocationId, analyticsPeriod]);

  const fetchAdminData = async () => {
    try {
      const [fetchedSlots, fetchedReservations, fetchedAnalytics, fetchedOverstay] = await Promise.all([
        api.getSlots({ locationId: selectedLocationId }),
        api.getReservations(),
        api.getAnalytics(),
        api.getOverstayAlerts(),
      ]);
      setSlots(fetchedSlots);
      setReservations(fetchedReservations);
      setAnalytics(fetchedAnalytics);
      setOverstayAlerts(fetchedOverstay);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleToggleSlotOccupancy = async (slot: ParkingSlot) => {
    try {
      if (slot.status === 'available') {
        await api.simulateIoTEvent({
          slotId: slot.id,
          eventType: 'car_parked',
          licensePlate: `ADM-${Math.floor(100 + Math.random() * 899)}`,
          model: 'Manual Admin Check-in',
          color: '#2563EB',
          vehicleType: slot.type === 'ev' ? 'ev' : 'sedan',
        });
      } else {
        await api.simulateIoTEvent({
          slotId: slot.id,
          eventType: 'car_departed',
        });
      }
      fetchAdminData();
      onRefreshData();
    } catch (err) {
      console.error('Failed to toggle slot occupancy:', err);
    }
  };

  const handleRandomizeTraffic = async () => {
    setIsRandomizingIoT(true);
    try {
      await api.simulateIoTEvent({ eventType: 'randomize' });
      await fetchAdminData();
      onRefreshData();
    } catch (err) {
      console.error('Failed to randomize:', err);
    } finally {
      setIsRandomizingIoT(false);
    }
  };

  const handleSaveSlot = async (slotData: Partial<ParkingSlot>) => {
    if (editingSlot) {
      await api.updateSlot(editingSlot.id, slotData);
    } else {
      await api.createSlot({
        ...slotData,
        status: 'available',
        locationId: selectedLocationId,
      });
    }
    fetchAdminData();
    onRefreshData();
  };

  const handleDeleteSlot = async (slotId: string) => {
    await api.deleteSlot(slotId);
    fetchAdminData();
    onRefreshData();
  };

  const handleDownloadCsv = (type: 'bookings' | 'revenue' | 'occupancy') => {
    window.location.href = `/api/analytics/export/csv?type=${type}`;
  };

  const filteredSlots = slots.filter(s => {
    if (selectedFloor !== 'all' && s.floor !== selectedFloor) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery && !s.slotNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calculate period multiplier for stats display
  const periodMultiplier = analyticsPeriod === 'monthly' ? 28.5 : analyticsPeriod === 'weekly' ? 6.8 : 1.0;
  const periodRevenue = analytics ? (analytics.stats.revenueToday * periodMultiplier).toFixed(2) : '1,280.00';
  const periodBookings = analytics ? Math.round(analytics.stats.activeBookingsCount * periodMultiplier) : 18;
  const activeUsersCount = Math.round(14 * (analyticsPeriod === 'monthly' ? 8.5 : analyticsPeriod === 'weekly' ? 3.2 : 1.0));

  return (
    <div className="space-y-6">
      {/* Feature 9: Overstay Alert Notification Ribbon if overdue vehicles detected */}
      {overstayAlerts.length > 0 && (
        <div className="bg-rose-500 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm">
                Security Alert: {overstayAlerts.length} Vehicle(s) Currently Overstayed
              </div>
              <p className="text-xs text-rose-100">
                Vehicles have exceeded their booked reservation time. Penalty rates ($10/hr) are accruing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overstay')}
              className="px-4 py-2 bg-white text-rose-700 font-extrabold text-xs rounded-xl shadow-xs hover:bg-rose-50 transition-colors"
            >
              View Overstay Roster
            </button>
          </div>
        </div>
      )}

      {/* Admin Top Facility Bar & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Admin Operations Center</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                Facility Control
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Capacity monitoring, QR access control, overstay enforcement, and analytics.
            </p>
          </div>
        </div>

        {/* Facility Selector & Quick Tool Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl border border-slate-200 transition-colors"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsGateScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Scan className="w-3.5 h-3.5 text-cyan-300" />
            <span>Gate Scanner</span>
          </button>

          <button
            onClick={() => setIsHeatmapOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Demand Heatmap</span>
          </button>

          <button
            onClick={() => setIsForecastOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Surge ML</span>
          </button>
        </div>
      </div>

      {/* Feature 8: Period Selector (Daily, Weekly, Monthly) & Downloadable CSV Reports */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold mr-1">Time Period:</span>
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setAnalyticsPeriod(p)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all ${
                analyticsPeriod === p
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* CSV Export Dropdown Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold hidden sm:inline">Export Reports:</span>
          <button
            onClick={() => handleDownloadCsv('bookings')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Bookings CSV</span>
          </button>

          <button
            onClick={() => handleDownloadCsv('revenue')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Revenue CSV</span>
          </button>

          <button
            onClick={() => handleDownloadCsv('occupancy')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Occupancy CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span className="capitalize">{analyticsPeriod} Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">${periodRevenue}</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +16.4%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Dynamic pricing multiplier active ({currentLocation.currentDynamicMultiplier}x)
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span className="capitalize">{analyticsPeriod} Reservations</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{periodBookings}</span>
            <span className="text-xs text-slate-400">confirmed passes</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {reservations.filter(r => r.evChargingIncluded).length} EV charging sessions included
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Average Occupancy</span>
            <Car className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {analytics ? analytics.stats.occupancyRatePercentage : 78}%
            </span>
            <span className="text-xs text-slate-400">
              ({slots.filter(s => s.status === 'occupied').length} / {slots.length} bays)
            </span>
          </div>
          <div className="mt-2.5 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${analytics ? analytics.stats.occupancyRatePercentage : 78}%` }}
            />
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span className="capitalize">{analyticsPeriod} Active Drivers</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeUsersCount}</span>
            <span className="text-xs text-emerald-600 font-bold">+28% retention</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Contactless mobile pass adoption
          </div>
        </div>
      </div>

      {/* Main Admin Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'monitor', label: 'Real-Time Bay Monitor' },
              { id: 'spaces', label: 'Space Management (CRUD)' },
              { id: 'bookings', label: 'Bookings & Gate Control' },
              { id: 'overstay', label: `Overstay Alerts (${overstayAlerts.length})` },
              { id: 'analytics', label: 'Revenue & Occupancy Analytics' },
              { id: 'iot', label: 'Simulated IoT Sensor Hub' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomizeTraffic}
              disabled={isRandomizingIoT}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="Simulates real-world traffic moving in and out"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRandomizingIoT ? 'animate-spin' : ''}`} />
              <span>Simulate Live Traffic</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Real-Time Bay Monitor */}
        {activeTab === 'monitor' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search bay e.g. A101"
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>

                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                >
                  <option value="all">All Floors</option>
                  {currentLocation.floors.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available (Green)</option>
                  <option value="occupied">Occupied (Red)</option>
                  <option value="reserved">Reserved (Amber)</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing {filteredSlots.length} of {slots.length} bays • Click bay to toggle occupancy
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredSlots.map(slot => {
                const isAvail = slot.status === 'available';
                const isOcc = slot.status === 'occupied';
                const isRes = slot.status === 'reserved';

                return (
                  <div
                    key={slot.id}
                    onClick={() => handleToggleSlotOccupancy(slot)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isAvail
                        ? 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-500'
                        : isRes
                        ? 'border-amber-300 bg-amber-50/50 hover:border-amber-500'
                        : slot.status === 'maintenance'
                        ? 'border-slate-300 bg-slate-100 opacity-60'
                        : 'border-rose-300 bg-rose-50/40 hover:border-rose-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-slate-900 font-mono">
                        {slot.slotNumber}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isAvail ? 'bg-emerald-500' : isRes ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>

                    <div className="my-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {slot.floor} • {slot.zone}
                      </div>
                      {isOcc && slot.occupiedVehicle ? (
                        <div className="text-[11px] font-mono font-bold text-slate-800 line-clamp-1">
                          {slot.occupiedVehicle.licensePlate}
                        </div>
                      ) : isRes ? (
                        <div className="text-[10px] font-bold text-amber-700">Reserved</div>
                      ) : (
                        <div className="text-[10px] font-bold text-emerald-700">Free</div>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>{slot.iotSensor.batteryLevel}% Bat</span>
                      <span className="group-hover:text-blue-600 font-semibold">Toggle</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Space Management (CRUD) */}
        {activeTab === 'spaces' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Manage Parking Spaces & Capacity</h3>
                <p className="text-xs text-slate-500">Add, configure, update pricing or remove parking spaces.</p>
              </div>

              <button
                onClick={() => {
                  setEditingSlot(null);
                  setIsSlotModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Parking Bay</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Bay #</th>
                    <th className="p-3">Floor / Zone</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Sensor Node</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSlots.map(slot => (
                    <tr key={slot.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{slot.slotNumber}</td>
                      <td className="p-3 text-slate-600">{slot.floor} • {slot.zone}</td>
                      <td className="p-3">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {slot.type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">${slot.baseHourlyRate.toFixed(2)}/hr</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            slot.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : slot.status === 'reserved'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {slot.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        {slot.iotSensor.sensorId} ({slot.iotSensor.batteryLevel}%)
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingSlot(slot);
                            setIsSlotModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Bookings & Gate Control */}
        {activeTab === 'bookings' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Driver Bookings & Gate Check-in</h3>
                <p className="text-xs text-slate-500">Live reservation ledger and access status.</p>
              </div>

              <button
                onClick={() => setIsGateScannerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Scan className="w-3.5 h-3.5 text-cyan-300" />
                <span>Open Barrier Scanner</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Driver</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Allocated Bay</th>
                    <th className="p-3">Time Window</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {res.bookingReference}
                        <div className="text-[10px] text-slate-400 font-normal">PIN: {res.entryPin}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {res.userName}
                        <div className="text-[10px] text-slate-400">{res.userEmail}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        {res.vehicle.licensePlate}
                        <div className="text-[10px] text-slate-400">{res.vehicle.model}</div>
                      </td>
                      <td className="p-3 font-bold text-blue-700">
                        Bay {res.slotNumber}
                        <div className="text-[10px] text-slate-500 font-normal">{res.floor}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <div className="text-[10px] text-slate-400">{res.durationHours} hrs</div>
                      </td>
                      <td className="p-3 font-bold text-slate-900">${res.totalAmount.toFixed(2)}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            res.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : res.status === 'upcoming'
                              ? 'bg-emerald-100 text-emerald-800'
                              : res.status === 'completed'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {res.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {res.status !== 'completed' && res.status !== 'cancelled' ? (
                          <button
                            onClick={async () => {
                              await api.scanGatePass({
                                query: res.bookingReference,
                                scanType: res.checkInTime ? 'exit' : 'entry',
                              });
                              fetchAdminData();
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            {res.checkInTime ? 'Simulate Exit' : 'Simulate Entry'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Finished</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feature 9: Overstay Alerts Roster Tab */}
        {activeTab === 'overstay' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Overdue Vehicles & Overstay Enforcement</h3>
                <p className="text-xs text-slate-500">Vehicles exceeding booked reservation duration without checking out.</p>
              </div>

              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
                Penalty Rate: $10.00 / Hour
              </span>
            </div>

            {overstayAlerts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                <div className="text-sm font-bold text-slate-800">Zero Overdue Vehicles</div>
                <p className="text-xs text-slate-500">All parked vehicles are operating within valid reservation windows.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-rose-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50 border-b border-rose-200 text-rose-900 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Bay Location</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Driver Contact</th>
                      <th className="p-3">Scheduled End</th>
                      <th className="p-3">Overdue Time</th>
                      <th className="p-3">Accrued Penalty</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100">
                    {overstayAlerts.map(alert => (
                      <tr key={alert.reservationId} className="hover:bg-rose-50/40">
                        <td className="p-3 font-mono font-bold text-slate-900">{alert.bookingReference}</td>
                        <td className="p-3 font-bold text-blue-700">Bay {alert.slotNumber} ({alert.floor})</td>
                        <td className="p-3 font-mono text-slate-800">{alert.vehiclePlate} ({alert.vehicleModel})</td>
                        <td className="p-3 text-slate-700">
                          {alert.driverName}
                          <div className="text-[10px] text-slate-400">{alert.driverPhone}</div>
                        </td>
                        <td className="p-3 text-slate-600">
                          {new Date(alert.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3 font-bold text-rose-600">+{alert.minutesOverdue} mins</td>
                        <td className="p-3 font-black text-rose-700">${alert.penaltyFee.toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => alert(`Notified driver ${alert.driverName} via SMS at ${alert.driverPhone}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Notify Driver</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Revenue & Occupancy Analytics */}
        {activeTab === 'analytics' && analytics && (
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Revenue & Occupancy Analytics</h3>
                <p className="text-xs text-slate-500">Hourly throughput, capacity load factor, and zone performance.</p>
              </div>

              <button
                onClick={() => setIsHeatmapOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold"
              >
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Open Visual Heatmap</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.zoneDistribution.map(z => (
                <div key={z.zone} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 block mb-1">{z.zone}</span>
                  <div className="text-xl font-black text-slate-900">${z.revenue}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Occupancy</span>
                    <span className="font-bold text-blue-600">{z.occupancy}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Today's Hourly Load Profile (00:00 - 22:00)
              </h4>
              <div className="h-44 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-end gap-3">
                {analytics.hourlyOccupancy.map(h => (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-500 font-bold">{h.rate}%</span>
                    <div className="w-full bg-slate-200 rounded-t-md h-28 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-blue-600 rounded-t-md transition-all duration-500"
                        style={{ height: `${h.rate}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">{h.hour}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Simulated IoT Sensor Integration Hub */}
        {activeTab === 'iot' && (
          <div className="p-5 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <Radio className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-amber-950">
                  Simulated IoT Occupancy Sensor Architecture
                </div>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  <strong>Notice:</strong> All ultrasonic distance readings, signal RSSI, and battery percentages are
                  <strong> simulated in real time</strong> by the backend server for university hackathon demonstration purposes.
                  No physical hardware sensors are required to test the end-to-end telemetry pipeline.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase text-slate-600 tracking-wider">
                Telemetry Registry ({slots.length} Connected Nodes)
              </h4>

              <button
                onClick={handleRandomizeTraffic}
                disabled={isRandomizingIoT}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Trigger Dynamic Sensor Noise
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Node Sensor ID</th>
                    <th className="p-3">Assigned Space</th>
                    <th className="p-3">Ultrasonic Distance</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Battery Status</th>
                    <th className="p-3">Signal (RSSI)</th>
                    <th className="p-3">Telemetry Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {slots.slice(0, 12).map(slot => (
                    <tr key={slot.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{slot.iotSensor.sensorId}</td>
                      <td className="p-3 font-sans font-semibold text-blue-700">Bay {slot.slotNumber} ({slot.floor})</td>
                      <td className="p-3 text-slate-700">{slot.iotSensor.rawDistanceCm} cm ({slot.status === 'occupied' ? 'OBSTRUCTED' : 'CLEAR'})</td>
                      <td className="p-3 text-emerald-600 font-bold">{slot.iotSensor.detectionConfidence}%</td>
                      <td className="p-3 text-slate-700">{slot.iotSensor.batteryLevel}% (Li-Ion 3.6V)</td>
                      <td className="p-3 text-slate-500">{slot.iotSensor.signalStrengthDbm} dBm</td>
                      <td className="p-3 font-sans">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          Simulated Node
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SlotManagementModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        slot={editingSlot}
        locationId={selectedLocationId}
        floors={currentLocation.floors}
        zones={currentLocation.zones}
        onSave={handleSaveSlot}
        onDelete={editingSlot ? handleDeleteSlot : undefined}
      />

      <GateScannerModal
        isOpen={isGateScannerOpen}
        onClose={() => setIsGateScannerOpen(false)}
        onVerificationSuccess={() => {
          fetchAdminData();
          onRefreshData();
        }}
      />

      <DemandForecastModal
        isOpen={isForecastOpen}
        onClose={() => setIsForecastOpen(false)}
        locationId={selectedLocationId}
        locationName={currentLocation.name}
      />

      <DemandHeatmapModal
        isOpen={isHeatmapOpen}
        onClose={() => setIsHeatmapOpen(false)}
        locationId={selectedLocationId}
        locationName={currentLocation.name}
      />
    </div>
  );
};
