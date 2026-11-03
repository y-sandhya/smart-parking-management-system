import React from 'react';
import { ParkingLocation } from '../../types';
import {
  MapPin,
  Star,
  Zap,
  Car,
  Clock,
  Heart,
  Navigation,
  ChevronRight,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface LocationCardProps {
  location: ParkingLocation;
  isSelected: boolean;
  onSelect: (location: ParkingLocation) => void;
  isFavorite: boolean;
  onToggleFavorite: (locationId: string) => void;
  onOpenReviews: (location: ParkingLocation) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSelected,
  onSelect,
  isFavorite,
  onToggleFavorite,
  onOpenReviews,
}) => {
  const occupancyPercentage = Math.round(
    ((location.totalSlots - location.availableSlots) / (location.totalSlots || 1)) * 100
  );

  const isLowAvailability = location.availableSlots <= 8;

  return (
    <div
      onClick={() => onSelect(location)}
      className={`group relative flex flex-col justify-between bg-white rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.18)] -translate-y-1'
          : 'border-[#E7EBF0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#60A5FA] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)] hover:-translate-y-1'
      }`}
    >
      {/* Top Image & Floating Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-[#F3F6FA]">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#172B4D]/80 via-transparent to-black/20" />

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(location.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/85 text-slate-700 hover:bg-white shadow-xs'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save as favorite'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Rate & Distance Floating Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#2563EB] text-white shadow-sm">
            ${location.baseHourlyRate.toFixed(2)}/hr
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/90 text-[#172B4D] backdrop-blur-xs flex items-center gap-1 shadow-2xs">
            <Navigation className="w-3 h-3 text-[#2563EB]" />
            {location.distanceKm} km
          </span>
        </div>

        {/* Status on image bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isLowAvailability ? 'bg-[#E9A23B] animate-pulse' : 'bg-[#16A36A]'
              }`}
            />
            <span className="font-bold text-white drop-shadow-xs">
              {location.availableSlots} / {location.totalSlots} Bays Free
            </span>
          </div>

          {location.hasEvCharging && (
            <span className="flex items-center gap-1 text-[11px] font-bold bg-[#16A36A]/95 text-white px-2 py-0.5 rounded-full backdrop-blur-xs shadow-2xs">
              <Zap className="w-3 h-3 fill-current" />
              EV Ready
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-[#172B4D] text-base leading-snug group-hover:text-[#2563EB] transition-colors">
              {location.name}
            </h3>
          </div>
          <p className="text-xs text-[#718096] line-clamp-1 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#718096] shrink-0" />
            <span>{location.address}</span>
          </p>

          <p className="text-xs text-[#718096] mt-2 line-clamp-2 leading-relaxed">
            {location.tagline}
          </p>
        </div>

        {/* Reviews and occupancy meter */}
        <div className="pt-2 border-t border-[#E7EBF0] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenReviews(location);
              }}
              className="inline-flex items-center gap-1 text-[#172B4D] hover:text-[#2563EB] font-bold transition-colors cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-[#E9A23B] text-[#E9A23B]" />
              <span>{location.rating.toFixed(1)}</span>
              <span className="text-[#718096] font-normal">({location.reviewsCount} reviews)</span>
            </button>

            <span className="text-[11px] font-semibold text-[#718096] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#718096]" />
              {location.operatingHours}
            </span>
          </div>

          {/* Occupancy progress bar */}
          <div>
            <div className="flex justify-between text-[11px] text-[#718096] font-medium mb-1">
              <span>Occupancy</span>
              <span className={occupancyPercentage > 85 ? 'text-[#DC5252] font-bold' : 'text-[#172B4D] font-bold'}>
                {occupancyPercentage}%
              </span>
            </div>
            <div className="w-full bg-[#F3F6FA] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  occupancyPercentage > 85
                    ? 'bg-[#DC5252]'
                    : occupancyPercentage > 60
                    ? 'bg-[#E9A23B]'
                    : 'bg-[#16A36A]'
                }`}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            type="button"
            className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'bg-[#F3F6FA] hover:bg-blue-50 text-[#172B4D] hover:text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white'
            }`}
          >
            <span>{isSelected ? 'Currently Viewing Bays' : 'Select Facility'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
