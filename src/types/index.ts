export type SlotStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type SlotType = 'standard' | 'ev' | 'disabled' | 'compact' | 'suv' | 'vip';
export type VehicleType = 'sedan' | 'suv' | 'hatchback' | 'ev' | 'van' | 'compact' | 'motorcycle';

export interface ParkingSlot {
  id: string; // e.g. "A-101"
  locationId: string;
  floor: string; // "B2", "B1", "G", "L2"
  zone: string; // "A", "B", "C", "D"
  slotNumber: string;
  type: SlotType;
  status: SlotStatus;
  baseHourlyRate: number;
  currentDynamicRate: number;
  distanceToElevatorMeters: number;
  walkingTimeSeconds: number;
  hasEvCharger: boolean;
  evChargerPowerKw?: number;
  evConnectorType?: 'CCS 2' | 'Tesla NACS' | 'Type 2' | 'CHAdeMO';
  dimensions: {
    widthM: number;
    lengthM: number;
  };
  occupiedVehicle?: {
    licensePlate: string;
    model: string;
    color: string;
    type: VehicleType;
    parkedAt: string;
  };
  iotSensor: {
    sensorId: string;
    isSimulated: true;
    batteryLevel: number;
    signalStrengthDbm: number;
    detectionConfidence: number;
    temperatureCelsius: number;
    lastHeartbeat: string;
    rawDistanceCm: number;
  };
  gridRow: number;
  gridCol: number;
  orientation: 'horizontal' | 'vertical';
}

export interface LocationReview {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  tags?: string[];
}

export interface ParkingLocation {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  image: string;
  totalSlots: number;
  availableSlots: number;
  evAvailableCount?: number;
  baseHourlyRate: number;
  currentDynamicMultiplier: number;
  operatingHours: string;
  floors: string[];
  zones: string[];
  amenities: string[];
  lat: number;
  lng: number;
  // EV specific attributes
  hasEvCharging: boolean;
  evConnectorTypes?: string[];
  evChargingPricePerKwh?: number;
  evChargingSessionFee?: number;
  reviews?: LocationReview[];
}

export interface BookingExtension {
  extendedAt: string;
  additionalHours: number;
  additionalAmount: number;
  newEndTime: string;
}

export interface Reservation {
  id: string;
  bookingReference: string; // e.g. "SP-2026-94182"
  slotId: string;
  locationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  vehicle: {
    licensePlate: string;
    model: string;
    type: VehicleType;
  };
  floor: string;
  zone: string;
  slotNumber: string;
  startTime: string; // ISO
  endTime: string; // ISO
  durationHours: number;
  baseRatePerHour: number;
  dynamicMultiplier: number;
  evChargingIncluded: boolean;
  evChargingFee: number;
  discountApplied: number;
  totalAmount: number;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  qrPayload: string;
  qrToken: string; // Cryptographic secure verification token
  entryPin: string;
  checkInTime?: string;
  checkOutTime?: string;
  // Feature 7 & 9 tracking
  qrScannedEntry?: boolean;
  qrScannedExit?: boolean;
  actualDurationMinutes?: number;
  overstayMinutes?: number;
  overstayPenalty?: number;
  extensionHistory?: BookingExtension[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'driver' | 'admin';
  avatarUrl: string;
  walletBalance: number;
  rewardPoints: number;
  favoriteLocationIds: string[]; // Feature 2: Saved locations
  vehicles: {
    id: string;
    licensePlate: string;
    model: string;
    color: string;
    type: VehicleType;
    isDefault: boolean;
  }[];
  preferences: {
    evPriority: boolean;
    disabledAccess: boolean;
    compactOnly: boolean;
    smsNotifications: boolean;
    emailReceipts: boolean;
  };
}

export interface DemandPrediction {
  timestamp: string;
  hour: number;
  dayOfWeek: string;
  predictedOccupancyPercentage: number;
  recommendedDynamicRateMultiplier: number;
  demandLevel: 'low' | 'moderate' | 'high' | 'surge';
  factors: string[];
}

export interface ZoneHeatmapData {
  zone: string;
  floor: string;
  occupancyPercentage: number;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  demandLevel: 'low' | 'moderate' | 'high' | 'surge';
  intensityColor: string;
  averageTurnoverHours: number;
}

export interface HeatmapResponse {
  zones: ZoneHeatmapData[];
  hourlyTrend: { hour: string; occupancy: number }[];
  dailyTrend: { day: string; occupancy: number; revenue: number }[];
}

export interface SmartPricingResult {
  baseHourlyRate: number;
  hours: number;
  originalPrice: number;
  occupancyRate: number;
  occupancySurgeMultiplier: number;
  timeOfDayMultiplier: number;
  evFee: number;
  discount: number;
  adjustedPrice: number;
  savingsOrSurgeAmount: number;
  isSurge: boolean;
  explanations: string[];
}

export interface OverstayAlert {
  reservationId: string;
  bookingReference: string;
  slotNumber: string;
  floor: string;
  zone: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverName: string;
  driverPhone: string;
  scheduledEndTime: string;
  minutesOverdue: number;
  penaltyFee: number;
}

export interface OccupancyStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  occupancyRatePercentage: number;
  revenueToday: number;
  activeBookingsCount: number;
  activeUsersCount?: number;
}
