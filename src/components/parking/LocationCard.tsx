import React from 'react';
import { ParkingLocation } from '../../types';
import {
  Star,
  MapPin,
  Navigation,
  Zap,
  Shield,
  Car,
  ArrowRight,
  Heart,
  MessageSquare
} from 'lucide-react';

interface LocationCardProps {
  location: ParkingLocation;
  isSelected: boolean;
  onSelect: (location: ParkingLocation) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (locationId: string) => void;
  onOpenReviews?: (location: ParkingLocation) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSelected,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  onOpenReviews,
}) => {
  const isAvailableHigh = location.availableSlots > 15;
  const isAvailableLow = location.availableSlots <= 5;
  const evSlotsAvailable = location.evAvailableCount || 0;

  return (
    <div
      onClick={() => onSelect(location)}
      className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-blue-600 ring-4 ring-blue-100 shadow-md'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      {/* Location Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

        {/* Top Badges & Favorite Heart Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
            <Navigation className="w-3.5 h-3.5 text-blue-600 fill-blue-500" />
            {location.distanceKm} km away
          </span>

          <div className="flex items-center gap-1.5">
            {/* Feature 2: Favorite Button */}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(location.id);
                }}
                className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                  isFavorite
                    ? 'bg-rose-500 text-white shadow-md scale-105'
                    : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white shadow-xs'
                }`}
                title={isFavorite ? 'Remove from Saved' : 'Save to Favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              </button>
            )}

            <span
              className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md ${
                isAvailableLow
                  ? 'bg-rose-500/95 text-white'
                  : isAvailableHigh
                  ? 'bg-emerald-500/95 text-white'
                  : 'bg-amber-500/95 text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {location.availableSlots} Bays Free
            </span>
          </div>
        </div>

        {/* Bottom overlay: Name and Reviews button */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenReviews) onOpenReviews(location);
              }}
              className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
            >
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{location.rating.toFixed(1)}</span>
              <span className="text-slate-300 font-normal">({location.reviewsCount} reviews)</span>
            </button>

            {location.hasEvCharging && (
              <span className="text-[10px] font-extrabold bg-emerald-500/90 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                {evSlotsAvailable} EV Bays Free
              </span>
            )}
          </div>

          <h4 className="text-base font-bold leading-tight line-clamp-1 drop-shadow-xs">
            {location.name}
          </h4>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{location.address}</span>
          </div>

          {/* Feature 1: EV Connector Info Banner if EV charging available */}
          {location.hasEvCharging && (
            <div className="mb-3 p-2 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-medium line-clamp-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0 fill-current" />
                <span>{location.evConnectorTypes?.slice(0, 2).join(' • ') || 'CCS 2 / Tesla NACS'}</span>
              </div>
              <span className="font-bold text-emerald-700 shrink-0">
                ${location.evChargingPricePerKwh || 0.35}/kWh
              </span>
            </div>
          )}

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {location.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                {amenity.includes('EV') ? (
                  <Zap className="w-3 h-3 text-emerald-600" />
                ) : amenity.includes('CCTV') || amenity.includes('Security') ? (
                  <Shield className="w-3 h-3 text-blue-600" />
                ) : (
                  <Car className="w-3 h-3 text-slate-400" />
                )}
                {amenity}
              </span>
            ))}
            {location.amenities.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                +{location.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Selection Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Hourly Rate</div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-slate-900">
                ${location.baseHourlyRate.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">/hr</span>
              {location.currentDynamicMultiplier > 1.0 ? (
                <span className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                  {location.currentDynamicMultiplier}x Surge
                </span>
              ) : (
                <span className="ml-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  Standard Rate
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(location);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 shadow-xs cursor-pointer ${
              isSelected
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
            }`}
          >
            <span>{isSelected ? 'Viewing' : 'Select'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
