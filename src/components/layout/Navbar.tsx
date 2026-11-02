import React from 'react';
import { UserProfile, Reservation } from '../../types';
import {
  Car,
  Compass,
  LayoutDashboard,
  Calendar,
  Wallet,
  Shield,
  Bell,
  Search,
  UserCheck,
  Zap,
  Sparkles,
  ChevronDown,
  Heart
} from 'lucide-react';

interface NavbarProps {
  currentView: 'user' | 'admin' | 'navigation';
  onViewChange: (view: 'user' | 'admin' | 'navigation') => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  activeReservationsCount: number;
  onOpenBookings: () => void;
  onOpenProfile: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoritesCount?: number;
  showOnlyFavorites?: boolean;
  onToggleFavoritesFilter?: () => void;
  onOpenAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  currentUser,
  allUsers,
  onSwitchUser,
  activeReservationsCount,
  onOpenBookings,
  onOpenProfile,
  searchQuery,
  onSearchChange,
  favoritesCount = 0,
  showOnlyFavorites = false,
  onToggleFavoritesFilter,
  onOpenAssistant,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onViewChange('user')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight">SMART PARK</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] font-bold text-blue-600 tracking-wider uppercase -mt-0.5">
                AI Parking & IoT Platform
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar (User mode) */}
        {currentView === 'user' && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search garages by location, mall, airport, or EV station..."
                className="w-full text-xs font-medium pl-9 pr-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        )}

        {/* Center / Right Module Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Main Module Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onViewChange('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'user'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Driver View
            </button>

            <button
              onClick={() => onViewChange('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                currentView === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Center</span>
            </button>

            <button
              onClick={() => onViewChange('navigation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                currentView === 'navigation'
                  ? 'bg-[#090E1A] text-[#CCFF00] border border-[#CCFF00]/40 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-lime-500" />
              <span className="hidden sm:inline">In-Car HUD</span>
            </button>
          </div>

          {/* Feature 2: Favorites Toggle */}
          {onToggleFavoritesFilter && (
            <button
              onClick={onToggleFavoritesFilter}
              className={`relative p-2 rounded-xl transition-all ${
                showOnlyFavorites
                  ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Saved Favorite Locations"
            >
              <Heart className={`w-5 h-5 ${showOnlyFavorites ? 'fill-rose-600' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center ring-2 ring-white">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Bookings & Pass button */}
          <button
            onClick={onOpenBookings}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="My Bookings & Passes"
          >
            <Calendar className="w-5 h-5" />
            {activeReservationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-extrabold text-[9px] flex items-center justify-center ring-2 ring-white">
                {activeReservationsCount}
              </span>
            )}
          </button>

          {/* Demo User Switcher Dropdown */}
          <div className="relative group">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 line-clamp-1">{currentUser.name}</div>
                <div className="text-[10px] text-blue-600 font-semibold uppercase">
                  ${currentUser.walletBalance.toFixed(2)}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Quick Demo Switcher Menu on hover */}
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Switch Demo Persona
              </div>
              <div className="space-y-1">
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors ${
                      currentUser.id === u.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                    <div>
                      <div className="font-semibold leading-tight">{u.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase">
                        {u.role === 'admin' ? 'Admin / Ops Director' : u.id === 'user-elena' ? 'EV Enthusiast' : 'Driver'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-2 mt-1 border-t border-slate-100 px-1">
                <button
                  onClick={onOpenProfile}
                  className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 py-1"
                >
                  Manage User Profile & Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
