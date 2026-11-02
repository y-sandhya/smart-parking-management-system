/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LocationCard } from './components/parking/LocationCard';
import { ParkingFloorMap } from './components/parking/ParkingFloorMap';
import { SmartRecommendationBanner } from './components/parking/SmartRecommendationBanner';
import { ReservationModal } from './components/parking/ReservationModal';
import { DigitalPassModal } from './components/parking/DigitalPassModal';
import { BookingExtensionModal } from './components/parking/BookingExtensionModal';
import { DemandHeatmapModal } from './components/parking/DemandHeatmapModal';
import { LocationReviewsModal } from './components/parking/LocationReviewsModal';
import { SmartAIAssistant } from './components/ai/SmartAIAssistant';
import { FuturisticNavView } from './components/navigation/FuturisticNavView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserProfileModal } from './components/user/UserProfileModal';
import { BookingsHistoryModal } from './components/user/BookingsHistoryModal';
import { DemandForecastModal } from './components/admin/DemandForecastModal';
import { api } from './services/api';
import { DEMO_USERS } from './data/mockData';
import { ParkingLocation, ParkingSlot, Reservation, UserProfile } from './types';
import {
  Car,
  Search,
  Zap,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  Filter,
  Navigation,
  SlidersHorizontal,
  Heart,
  Flame,
  AlertTriangle,
  PlusCircle
} from 'lucide-react';

export default function App() {
  // Navigation & User State
  const [currentView, setCurrentView] = useState<'user' | 'admin' | 'navigation'>('user');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_USERS);

  // Core Data
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [currentFloor, setCurrentFloor] = useState<string>('Level B1');
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Feature 2: Favorites State
  const [favoriteLocationIds, setFavoriteLocationIds] = useState<string[]>(currentUser.favoriteLocationIds || []);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterEvOnly, setFilterEvOnly] = useState<boolean>(false);
  const [filterPriceUnder5, setFilterPriceUnder5] = useState<boolean>(false);

  // Modals & Active Flows
  const [isReservationOpen, setIsReservationOpen] = useState<boolean>(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);
  const [activePassReservation, setActivePassReservation] = useState<Reservation | null>(null);
  const [activeNavReservation, setActiveNavReservation] = useState<Reservation | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState<boolean>(false);
  const [isForecastOpen, setIsForecastOpen] = useState<boolean>(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState<boolean>(false);
  const [reviewsModalLocation, setReviewsModalLocation] = useState<ParkingLocation | null>(null);
  const [extensionModalBooking, setExtensionModalBooking] = useState<Reservation | null>(null);

  // Feature 9: Expiring Soon Alert
  const [expiringBooking, setExpiringBooking] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial Load
  useEffect(() => {
    loadInitialData();
  }, []);

  // Sync favorites when user switches
  useEffect(() => {
    fetchUserFavorites(currentUser.id);
    checkExpiringBookings(currentUser.id);
  }, [currentUser.id, reservations]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [fetchedLocs, fetchedRes] = await Promise.all([
        api.getLocations(),
        api.getReservations(),
      ]);
      setLocations(fetchedLocs);
      if (fetchedLocs.length > 0) {
        setSelectedLocation(fetchedLocs[0]);
        setCurrentFloor(fetchedLocs[0].floors[0] || 'Level B1');
        await loadSlotsForLocation(fetchedLocs[0].id);
      }
      setReservations(fetchedRes);
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFavorites = async (userId: string) => {
    try {
      const favs = await api.getUserFavorites(userId);
      setFavoriteLocationIds(favs);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  const handleToggleFavorite = async (locationId: string) => {
    try {
      const updated = await api.toggleFavorite(currentUser.id, locationId);
      setFavoriteLocationIds(updated);
      setCurrentUser(prev => ({ ...prev, favoriteLocationIds: updated }));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const checkExpiringBookings = (userId: string) => {
    const nowMs = Date.now();
    const active = reservations.find(r => {
      if (r.userId !== userId) return false;
      if (r.status !== 'active') return false;
      const endMs = new Date(r.endTime).getTime();
      const diffMins = (endMs - nowMs) / 60000;
      return diffMins <= 20; // Expiring in under 20 mins or already overdue
    });
    setExpiringBooking(active || null);
  };

  const loadSlotsForLocation = async (locId: string) => {
    try {
      const fetchedSlots = await api.getSlots({ locationId: locId });
      setSlots(fetchedSlots);
    } catch (err) {
      console.error('Failed to load slots:', err);
    }
  };

  const handleSelectLocation = async (loc: ParkingLocation) => {
    setSelectedLocation(loc);
    setCurrentFloor(loc.floors[0] || 'Level B1');
    setSelectedSlot(null);
    await loadSlotsForLocation(loc.id);
  };

  const handleReservationSuccess = (newRes: Reservation) => {
    setReservations(prev => [newRes, ...prev]);
    setActivePassReservation(newRes);
    setIsPassModalOpen(true);
    if (selectedLocation) {
      loadSlotsForLocation(selectedLocation.id);
    }
  };

  const handleLaunchNavigation = (reservation: Reservation) => {
    setActiveNavReservation(reservation);
    setCurrentView('navigation');
  };

  const handleCancelReservation = async (reservationId: string) => {
    await api.cancelReservation(reservationId);
    setReservations(prev =>
      prev.map(r => (r.id === reservationId ? { ...r, status: 'cancelled', paymentStatus: 'refunded' } : r))
    );
    if (selectedLocation) {
      loadSlotsForLocation(selectedLocation.id);
    }
  };

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'admin' && currentView !== 'admin') {
      setCurrentView('admin');
    } else if (user.role === 'driver' && currentView === 'admin') {
      setCurrentView('user');
    }
  };

  // Filter locations by search, EV, and favorites
  const filteredLocations = locations.filter(loc => {
    if (showOnlyFavorites && !favoriteLocationIds.includes(loc.id)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = loc.name.toLowerCase().includes(q);
      const matchAddress = loc.address.toLowerCase().includes(q);
      const matchAmenities = loc.amenities.some(a => a.toLowerCase().includes(q));
      if (!matchName && !matchAddress && !matchAmenities) return false;
    }
    if (filterEvOnly && !loc.hasEvCharging && !loc.amenities.some(a => a.includes('EV'))) return false;
    if (filterPriceUnder5 && loc.baseHourlyRate > 4.5) return false;
    return true;
  });

  const activeReservationsCount = reservations.filter(
    r => r.userId === currentUser.id && (r.status === 'active' || r.status === 'upcoming')
  ).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Navbar with Mode Switcher & Favorites Counter */}
      <Navbar
        currentView={currentView}
        onViewChange={(v) => {
          if (v === 'navigation') {
            const firstActive = reservations.find(r => r.status === 'active' || r.status === 'upcoming');
            if (firstActive) {
              setActiveNavReservation(firstActive);
            } else if (reservations.length > 0) {
              setActiveNavReservation(reservations[0]);
            }
          }
          setCurrentView(v);
        }}
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        activeReservationsCount={activeReservationsCount}
        onOpenBookings={() => setIsBookingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesCount={favoriteLocationIds.length}
        showOnlyFavorites={showOnlyFavorites}
        onToggleFavoritesFilter={() => setShowOnlyFavorites(!showOnlyFavorites)}
      />

      {/* VIEW 1: Futuristic In-Car HUD Navigation Screen */}
      {currentView === 'navigation' && activeNavReservation && (
        <FuturisticNavView
          reservation={activeNavReservation}
          onExit={() => setCurrentView('user')}
          onArrived={() => {
            setCurrentView('user');
            setIsPassModalOpen(true);
            setActivePassReservation(activeNavReservation);
          }}
        />
      )}

      {/* VIEW 2: Admin Operations Dashboard */}
      {currentView === 'admin' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 animate-fadeIn">
          <AdminDashboard
            locations={locations}
            onRefreshData={() => {
              if (selectedLocation) {
                loadSlotsForLocation(selectedLocation.id);
              }
            }}
          />
        </main>
      )}

      {/* VIEW 3: Driver / User Reservation Dashboard */}
      {currentView === 'user' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8 animate-fadeIn">
          {/* Feature 9: Driver Expiry & Overstay Alert Banner */}
          {expiringBooking && (
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    <span>Parking Expiry Notice – Bay {expiringBooking.slotNumber}</span>
                    <span className="text-[10px] bg-white text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs text-amber-100 mt-0.5">
                    Your scheduled reservation ends at{' '}
                    <strong>{new Date(expiringBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>.
                    Extend now to avoid overstay penalty fees ($10/hr).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExtensionModalBooking(expiringBooking)}
                  className="px-4 py-2 rounded-xl bg-white text-amber-900 font-extrabold text-xs shadow-md hover:bg-amber-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-700" />
                  <span>Extend +1 Hour</span>
                </button>
              </div>
            </div>
          )}

          {/* Hero Banner with Modern Rounded Card and Electric Blue Accents */}
          <section className="relative rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white p-6 sm:p-10 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Next-Gen IoT Parking & Smart Reservation System</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Find, Reserve & Park <br />
                <span className="text-cyan-300">With 100% Guaranteed Space.</span>
              </h1>

              <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
                Ultrasonic sensor telemetry, high-speed EV fast-charging reservations, demand heatmap analytics, and turn-by-turn in-garage HUD navigation.
              </p>

              {/* Quick Action Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <button
                  onClick={() => {
                    const el = document.getElementById('interactive-map-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 rounded-xl bg-white text-blue-900 font-extrabold hover:bg-blue-50 shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Car className="w-4 h-4 text-blue-600" />
                  <span>Pick Parking Space</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsHeatmapOpen(true)}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-rose-300" />
                  <span>Demand Heatmap</span>
                </button>

                <button
                  onClick={() => setIsForecastOpen(true)}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>AI Dynamic Surge Forecast</span>
                </button>
              </div>
            </div>

            <div className="hidden lg:flex absolute right-10 bottom-10 bg-slate-950/60 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex-col gap-2 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300 font-medium">Garages:</span>
                <span className="font-bold text-white">{locations.length} Connected</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300 font-medium">EV Terminals:</span>
                <span className="font-bold text-emerald-400">CCS & Tesla NACS</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300 font-medium">Saved Locations:</span>
                <span className="font-bold text-rose-400">{favoriteLocationIds.length} Favorites</span>
              </div>
            </div>
          </section>

          {/* SECTION 1: Nearby Parking Locations & Filters */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {showOnlyFavorites ? 'My Saved Favorite Locations' : 'Nearby Smart Parking Facilities'}
                  </h2>
                  {showOnlyFavorites && (
                    <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-rose-600" />
                      {favoriteLocationIds.length} Saved
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a facility to inspect floor maps, live slot sensors, EV connector types, and community reviews.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    showOnlyFavorites
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-white' : 'text-rose-500'}`} />
                  <span>Favorites ({favoriteLocationIds.length})</span>
                </button>

                <button
                  onClick={() => setFilterEvOnly(!filterEvOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterEvOnly
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>EV Superchargers</span>
                </button>

                <button
                  onClick={() => setFilterPriceUnder5(!filterPriceUnder5)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterPriceUnder5
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Under $4.50/hr</span>
                </button>
              </div>
            </div>

            {/* Location Cards Grid */}
            {filteredLocations.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <Heart className="w-8 h-8 mx-auto text-slate-300" />
                <h4 className="font-bold text-slate-800 text-sm">No facilities match your filter</h4>
                <p className="text-xs text-slate-500">
                  {showOnlyFavorites
                    ? 'You have not favorited any facilities yet. Click the heart icon on any card to save it!'
                    : 'Try clearing your search query or EV filter.'}
                </p>
                {showOnlyFavorites && (
                  <button
                    onClick={() => setShowOnlyFavorites(false)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    View All Locations
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredLocations.map(loc => (
                  <LocationCard
                    key={loc.id}
                    location={loc}
                    isSelected={selectedLocation?.id === loc.id}
                    onSelect={handleSelectLocation}
                    isFavorite={favoriteLocationIds.includes(loc.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenReviews={(l) => setReviewsModalLocation(l)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: AI Smart Slot Recommendation Banner */}
          {selectedLocation && (
            <SmartRecommendationBanner
              locationId={selectedLocation.id}
              currentFloor={currentFloor}
              onSelectSlot={(slot) => {
                setSelectedSlot(slot);
                setIsReservationOpen(true);
              }}
              selectedSlotId={selectedSlot?.id}
              defaultVehicleType={currentUser.vehicles[0]?.type || 'sedan'}
            />
          )}

          {/* SECTION 3: Interactive Floor Map & Slot Selection */}
          <section id="interactive-map-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {selectedLocation ? selectedLocation.name : 'Interactive Parking Map'}
                  </h2>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    {currentFloor}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top-down visual bay layout with realistic vehicle illustrations and lane driving paths.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsHeatmapOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  <span>Zone Heatmap</span>
                </button>

                {selectedSlot && (
                  <button
                    onClick={() => setIsReservationOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all animate-pulse cursor-pointer"
                  >
                    <span>Reserve Bay {selectedSlot.slotNumber}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Layout Component */}
            {selectedLocation && (
              <ParkingFloorMap
                slots={slots}
                selectedSlot={selectedSlot}
                onSelectSlot={(slot) => {
                  setSelectedSlot(slot);
                  setIsReservationOpen(true);
                }}
                currentFloor={currentFloor}
                onFloorChange={setCurrentFloor}
                floors={selectedLocation.floors}
              />
            )}
          </section>

          {/* Floating Selected Slot Banner */}
          {selectedSlot && selectedLocation && !isReservationOpen && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4 animate-bounce">
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white">
                    {selectedSlot.slotNumber}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-white">
                      Bay {selectedSlot.slotNumber} Selected
                    </div>
                    <div className="text-xs text-slate-300">
                      {selectedSlot.floor} • ${(selectedSlot.baseHourlyRate * 1.15).toFixed(2)}/hr
                      {selectedSlot.hasEvCharger && ' • EV 150kW'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setIsReservationOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
                  >
                    Proceed to Booking
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Feature 4: Smart AI Assistant Chat Concierge */}
      <SmartAIAssistant
        onSelectLocation={handleSelectLocation}
        onSelectSlot={(slot, locId) => {
          const loc = locations.find(l => l.id === locId);
          if (loc) {
            handleSelectLocation(loc);
          }
          setSelectedSlot(slot);
          setIsReservationOpen(true);
        }}
        currentUserId={currentUser.id}
      />

      {/* MODALS */}
      {/* 1. Reservation Modal with Dynamic Pricing & EV */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        slot={selectedSlot}
        location={selectedLocation}
        user={currentUser}
        onReservationComplete={handleReservationSuccess}
        onSelectAlternativeSlot={(altId) => {
          const target = slots.find(s => s.id === altId);
          if (target) setSelectedSlot(target);
        }}
      />

      {/* 2. Digital QR Pass Modal with Overstay & Extension */}
      <DigitalPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        reservation={activePassReservation}
        onLaunchNavigation={handleLaunchNavigation}
        onCancelled={handleCancelReservation}
        onReservationUpdated={(updated) => {
          setReservations(prev => prev.map(r => (r.id === updated.id ? updated : r)));
          setActivePassReservation(updated);
        }}
      />

      {/* 3. Booking Extension Modal */}
      <BookingExtensionModal
        isOpen={!!extensionModalBooking}
        onClose={() => setExtensionModalBooking(null)}
        reservation={extensionModalBooking}
        onExtensionSuccess={(updated) => {
          setReservations(prev => prev.map(r => (r.id === updated.id ? updated : r)));
          setActivePassReservation(updated);
          setExpiringBooking(null);
        }}
      />

      {/* 4. Feature 5: Demand Heatmap Modal */}
      {selectedLocation && (
        <DemandHeatmapModal
          isOpen={isHeatmapOpen}
          onClose={() => setIsHeatmapOpen(false)}
          locationId={selectedLocation.id}
          locationName={selectedLocation.name}
        />
      )}

      {/* 5. Feature 10: Location Feedback & Reviews Modal */}
      {reviewsModalLocation && (
        <LocationReviewsModal
          isOpen={!!reviewsModalLocation}
          onClose={() => setReviewsModalLocation(null)}
          location={reviewsModalLocation}
          currentUser={currentUser}
          onReviewAdded={(updatedLoc) => {
            setLocations(prev =>
              prev.map(l => (l.id === reviewsModalLocation.id ? { ...l, ...updatedLoc } : l))
            );
          }}
        />
      )}

      {/* 6. User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          setAllUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
        }}
      />

      {/* 7. Bookings History Modal with Extension */}
      <BookingsHistoryModal
        isOpen={isBookingsOpen}
        onClose={() => setIsBookingsOpen(false)}
        reservations={reservations.filter(r => r.userId === currentUser.id)}
        onOpenPass={(res) => {
          setActivePassReservation(res);
          setIsPassModalOpen(true);
        }}
        onCancelReservation={handleCancelReservation}
        onLaunchNav={handleLaunchNavigation}
        onExtend={(res) => setExtensionModalBooking(res)}
      />

      {/* 8. Demand Forecast ML Modal */}
      {selectedLocation && (
        <DemandForecastModal
          isOpen={isForecastOpen}
          onClose={() => setIsForecastOpen(false)}
          locationId={selectedLocation.id}
          locationName={selectedLocation.name}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
