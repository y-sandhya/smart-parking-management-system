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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7EBF0] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onViewChange('user')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-200">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-[#172B4D] tracking-tight">SMART PARK</span>
                <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-pulse"></span>
              </div>
              <p className="text-[10px] font-bold text-[#2563EB] tracking-wider uppercase -mt-0.5">
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
                className="w-full text-xs font-medium pl-9 pr-4 py-2 rounded-xl bg-[#F3F6FA] hover:bg-slate-100 focus:bg-white border border-[#E7EBF0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] text-[#172B4D] placeholder-[#718096] transition-all"
              />
              <Search className="w-4 h-4 text-[#718096] absolute left-3 top-2.5" />
            </div>
          </div>
        )}

        {/* Center / Right Module Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Main Module Tabs */}
          <div className="flex items-center bg-[#F3F6FA] p-1 rounded-xl border border-[#E7EBF0]">
            <button
              onClick={() => onViewChange('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentView === 'user'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#718096] hover:text-[#172B4D]'
              }`}
            >
              Driver View
            </button>

            <button
              onClick={() => onViewChange('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-[#172B4D] text-white shadow-xs'
                  : 'text-[#718096] hover:text-[#172B4D]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Admin Center</span>
            </button>

            <button
              onClick={() => onViewChange('navigation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                currentView === 'navigation'
                  ? 'bg-[#090E1A] text-[#CCFF00] border border-[#CCFF00]/40 shadow-xs'
                  : 'text-[#718096] hover:text-[#172B4D]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#84CC16]" />
              <span className="hidden sm:inline">In-Car HUD</span>
            </button>
          </div>

          {/* Feature 2: Favorites Toggle */}
          {onToggleFavoritesFilter && (
            <button
              onClick={onToggleFavoritesFilter}
              className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                showOnlyFavorites
                  ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-200'
                  : 'text-[#718096] hover:bg-[#F3F6FA] hover:text-[#172B4D]'
              }`}
              title="Saved Favorite Locations"
            >
              <Heart className={`w-5 h-5 ${showOnlyFavorites ? 'fill-rose-600 text-rose-600' : ''}`} />
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
            className="relative p-2 rounded-xl text-[#718096] hover:bg-[#F3F6FA] hover:text-[#172B4D] transition-colors cursor-pointer"
            title="My Bookings & Passes"
          >
            <Calendar className="w-5 h-5" />
            {activeReservationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#2563EB] text-white font-extrabold text-[9px] flex items-center justify-center ring-2 ring-white">
                {activeReservationsCount}
              </span>
            )}
          </button>

          {/* Demo User Switcher Dropdown */}
          <div className="relative group">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[#E7EBF0] hover:bg-[#F3F6FA] transition-colors cursor-pointer"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#E7EBF0]"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-[#172B4D] line-clamp-1">{currentUser.name}</div>
                <div className="text-[10px] text-[#2563EB] font-semibold uppercase">
                  ${currentUser.walletBalance.toFixed(2)}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#718096]" />
            </button>

            {/* Quick Demo Switcher Menu on hover */}
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-[#E7EBF0] p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#718096] px-3 py-1">
                Switch Demo Persona
              </div>
              <div className="space-y-1">
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      currentUser.id === u.id
                        ? 'bg-blue-50 text-[#2563EB] font-bold'
                        : 'hover:bg-[#F3F6FA] text-[#172B4D]'
                    }`}
                  >
                    <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                    <div>
                      <div className="font-semibold leading-tight">{u.name}</div>
                      <div className="text-[10px] text-[#718096] uppercase">
                        {u.role === 'admin' ? 'Admin / Ops Director' : u.id === 'user-elena' ? 'EV Enthusiast' : 'Driver'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-2 mt-1 border-t border-[#E7EBF0] px-1">
                <button
                  onClick={onOpenProfile}
                  className="w-full text-center text-xs font-bold text-[#2563EB] hover:text-blue-700 py-1 cursor-pointer"
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
