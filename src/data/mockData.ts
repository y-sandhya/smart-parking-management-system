import { ParkingLocation, ParkingSlot, Reservation, UserProfile } from '../types';

export const INITIAL_LOCATIONS: ParkingLocation[] = [
  {
    id: 'loc-metro-central',
    name: 'Metro Central Plaza Grand Parking',
    tagline: 'Premium multi-level underground parking with direct mall & transit access',
    address: '450 Grand Avenue, Downtown Metro District',
    city: 'San Francisco, CA',
    distanceKm: 0.8,
    rating: 4.8,
    reviewsCount: 342,
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80',
    totalSlots: 48,
    availableSlots: 24,
    evAvailableCount: 8,
    baseHourlyRate: 4.50,
    currentDynamicMultiplier: 1.15,
    operatingHours: '24/7 Open',
    floors: ['Level B2', 'Level B1', 'Ground G', 'Level 2'],
    zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
    amenities: [
      'EV Supercharging (150kW)',
      '24/7 Monitored CCTV',
      'Contactless QR Gate',
      'Elevator & Wheelchair Access',
      'Covered Multi-Level',
      'Valet Assistance',
      'Tire Pressure & Free Air'
    ],
    lat: 37.7891,
    lng: -122.4014,
    hasEvCharging: true,
    evConnectorTypes: ['CCS 2 (150kW)', 'Tesla NACS (250kW)', 'Type 2 Mennekes'],
    evChargingPricePerKwh: 0.32,
    evChargingSessionFee: 5.00,
    reviews: [
      {
        id: 'rev-1',
        locationId: 'loc-metro-central',
        userId: 'user-elena',
        userName: 'Elena Vance',
        userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'Super fast 150kW EV charging! Recharged from 20% to 80% while shopping at the mall.',
        createdAt: '2026-11-01T14:30:00.000Z',
        tags: ['Fast EV Charger', 'Clean Facility', 'Easy Navigation'],
      },
      {
        id: 'rev-2',
        locationId: 'loc-metro-central',
        userId: 'user-alex',
        userName: 'Alex Morgan',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'QR scanner at the gate lifted the boom barrier instantly. Wide parking spots with great lighting.',
        createdAt: '2026-10-29T10:15:00.000Z',
        tags: ['Contactless Entry', 'Spacious Bays'],
      }
    ]
  },
  {
    id: 'loc-skyline-tech',
    name: 'Skyline Tech Innovation Center Garages',
    tagline: 'High-speed automated garage with 100% renewable EV charging bays',
    address: '880 Innovation Parkway, Tech Corridor',
    city: 'San Francisco, CA',
    distanceKm: 1.4,
    rating: 4.9,
    reviewsCount: 219,
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
    totalSlots: 48,
    availableSlots: 26,
    evAvailableCount: 10,
    baseHourlyRate: 5.00,
    currentDynamicMultiplier: 1.25,
    operatingHours: '05:00 AM – 01:00 AM',
    floors: ['Level B1', 'Ground G', 'Level 2', 'Level 3'],
    zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
    amenities: [
      'Solar-Powered EV Chargers',
      'License Plate Auto-Scan',
      'Covered Heated Facility',
      'Touchless Restrooms',
      'Security Patrols'
    ],
    lat: 37.7749,
    lng: -122.4194,
    hasEvCharging: true,
    evConnectorTypes: ['Tesla NACS (250kW)', 'CCS 2 (300kW Ultra-Fast)'],
    evChargingPricePerKwh: 0.38,
    evChargingSessionFee: 6.00,
    reviews: [
      {
        id: 'rev-3',
        locationId: 'loc-skyline-tech',
        userId: 'user-alex',
        userName: 'Alex Morgan',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'State of the art automated garage. The indoor guidance HUD led me right to Bay A-101.',
        createdAt: '2026-10-31T09:00:00.000Z',
        tags: ['High Tech', 'Direct HUD Guidance'],
      }
    ]
  },
  {
    id: 'loc-airport-express',
    name: 'Grand Terminal Airport Express Parking',
    tagline: 'Secure long-term & express flight parking with complimentary shuttle',
    address: 'Terminal 2 Boulevard, Airport North Perimeter',
    city: 'San Francisco, CA',
    distanceKm: 5.2,
    rating: 4.6,
    reviewsCount: 890,
    image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1200&q=80',
    totalSlots: 48,
    availableSlots: 28,
    evAvailableCount: 12,
    baseHourlyRate: 3.50,
    currentDynamicMultiplier: 0.95,
    operatingHours: '24/7 Open',
    floors: ['Ground G', 'Level 1', 'Level 2', 'Rooftop Deck'],
    zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
    amenities: [
      'Free 5-Min Terminal Shuttle',
      'Luggage Assistance',
      'Long-Term Discount Passes',
      'Gated Fence & Guards',
      'Car Detailing & Wash'
    ],
    lat: 37.6213,
    lng: -122.3790,
    hasEvCharging: true,
    evConnectorTypes: ['Type 2 (22kW Overnight)', 'CCS 2 (50kW)'],
    evChargingPricePerKwh: 0.28,
    evChargingSessionFee: 4.00,
    reviews: [
      {
        id: 'rev-4',
        locationId: 'loc-airport-express',
        userId: 'user-elena',
        userName: 'Elena Vance',
        userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        rating: 4,
        comment: 'Great value for airport parking. Shuttle picked us up in under 3 minutes.',
        createdAt: '2026-10-25T18:20:00.000Z',
        tags: ['Shuttle Service', 'Affordable Long-term'],
      }
    ]
  },
  {
    id: 'loc-harbor-waterfront',
    name: 'Harborview Waterfront Pavilion Parking',
    tagline: 'Scenic bayfront parking steps from ferry terminal and dining promenade',
    address: '12 Pier Promenade, Embarcadero',
    city: 'San Francisco, CA',
    distanceKm: 2.1,
    rating: 4.7,
    reviewsCount: 178,
    image: 'https://images.unsplash.com/photo-1545179605-1296651e9d43?auto=format&fit=crop&w=1200&q=80',
    totalSlots: 48,
    availableSlots: 25,
    evAvailableCount: 8,
    baseHourlyRate: 4.00,
    currentDynamicMultiplier: 1.05,
    operatingHours: '06:00 AM – Midnight',
    floors: ['Ground G', 'Level 1', 'Level 2', 'Pier Deck'],
    zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
    amenities: [
      'Promenade Direct Access',
      'Motorcycle Dedicated Bays',
      'EV Charging Points',
      'Digital Payment Kiosks',
      'Valet Assistance'
    ],
    lat: 37.7981,
    lng: -122.3965,
    hasEvCharging: true,
    evConnectorTypes: ['Type 2 (22kW)', 'CCS 2 (100kW)'],
    evChargingPricePerKwh: 0.35,
    evChargingSessionFee: 5.00,
    reviews: [
      {
        id: 'rev-5',
        locationId: 'loc-harbor-waterfront',
        userId: 'user-alex',
        userName: 'Alex Morgan',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'Convenient waterfront parking right by the ferry docks. Very smooth entry scan.',
        createdAt: '2026-10-28T12:00:00.000Z',
        tags: ['Scenic Location', 'Smooth Entry'],
      }
    ]
  }
];

// Helper to generate realistic slots for all four facilities with their own floors and zones A, B, C, D
export function generateInitialSlots(): ParkingSlot[] {
  const slots: ParkingSlot[] = [];

  const carColors = ['#2563EB', '#1E293B', '#DC2626', '#E2E8F0', '#059669', '#D97706', '#475569', '#7C3AED'];
  const carModels = [
    { model: 'Tesla Model Y', type: 'ev' as const },
    { model: 'BMW 330e Hybrid', type: 'ev' as const },
    { model: 'Audi A4 Quattro', type: 'sedan' as const },
    { model: 'Porsche Macan', type: 'suv' as const },
    { model: 'Toyota RAV4', type: 'suv' as const },
    { model: 'Honda Civic', type: 'sedan' as const },
    { model: 'Volkswagen Golf', type: 'hatchback' as const },
    { model: 'Mercedes C-Class', type: 'sedan' as const },
    { model: 'Hyundai Ioniq 5', type: 'ev' as const },
    { model: 'Ford Mustang Mach-E', type: 'ev' as const },
  ];

  INITIAL_LOCATIONS.forEach((location, locIdx) => {
    const locPrefix = location.id.replace('loc-', '').substring(0, 4).toUpperCase();
    const floors = location.floors;
    const zones = location.zones;
    let sensorIndex = 100 + locIdx * 100;

    floors.forEach((floor, fIdx) => {
      zones.forEach((zone, zIdx) => {
        for (let s = 1; s <= 3; s++) {
          sensorIndex++;
          const zoneLetter = zone.replace('Zone ', '').trim();
          const slotNumber = `${zoneLetter}${fIdx + 1}0${s}`;
          const id = `slot-${location.id}-${floor.replace(/\s+/g, '-').toLowerCase()}-${slotNumber.toLowerCase()}`;

          let type: ParkingSlot['type'] = 'standard';
          let hasEv = false;
          let evPower: number | undefined = undefined;
          let evConnector: ParkingSlot['evConnectorType'] = undefined;

          if (zone === 'Zone A' && s === 1) {
            type = 'disabled';
          } else if (zone === 'Zone A' && (s === 2 || s === 3)) {
            type = 'ev';
            hasEv = true;
            evPower = s === 2 ? 150 : 250;
            evConnector = s === 2 ? 'CCS 2' : 'Tesla NACS';
          } else if (zone === 'Zone B' && s === 3) {
            type = 'suv';
          } else if (zone === 'Zone C' && s === 3) {
            type = 'compact';
          } else if (zone === 'Zone D' && s === 1) {
            type = 'vip';
          }

          // Deterministic distribution of occupancy so each facility has unique live occupancy
          const statusSeed = (locIdx * 13 + fIdx * 7 + zIdx * 5 + s * 3) % 11;
          let status: ParkingSlot['status'] = 'available';
          let occupiedVehicle = undefined;

          if (statusSeed >= 4 && statusSeed <= 7) {
            status = 'occupied';
            const car = carModels[(locIdx + fIdx + zIdx + s) % carModels.length];
            const plateNumbers = 100 + ((locIdx * 77 + fIdx * 31 + zIdx * 17 + s * 13) % 899);
            occupiedVehicle = {
              licensePlate: `CA-${plateNumbers}-${zoneLetter}${s}`,
              model: car.model,
              color: carColors[(locIdx * 3 + fIdx * 2 + zIdx + s) % carColors.length],
              type: car.type,
              parkedAt: new Date(Date.now() - (s * 40 + zIdx * 25 + fIdx * 15 + 10) * 60000).toISOString(),
            };
          } else if (statusSeed === 8) {
            status = 'reserved';
          } else if (statusSeed === 9 && s === 3 && fIdx === 0 && locIdx === 0) {
            status = 'maintenance';
          }

          const distElevator = Math.round(10 + (zIdx * 12) + (s * 4) + (fIdx * 5));
          const walkSeconds = Math.round(distElevator * 0.85);

          slots.push({
            id,
            locationId: location.id,
            floor,
            zone,
            slotNumber,
            type,
            status,
            baseHourlyRate: location.baseHourlyRate,
            currentDynamicRate: Number((location.baseHourlyRate * location.currentDynamicMultiplier).toFixed(2)),
            distanceToElevatorMeters: distElevator,
            walkingTimeSeconds: walkSeconds,
            hasEvCharger: hasEv,
            evChargerPowerKw: evPower,
            evConnectorType: evConnector,
            dimensions: {
              widthM: type === 'suv' ? 2.8 : type === 'compact' ? 2.2 : 2.5,
              lengthM: 5.0,
            },
            occupiedVehicle,
            iotSensor: {
              sensorId: `IOT-${locPrefix}-${sensorIndex}`,
              isSimulated: true,
              batteryLevel: 84 + (sensorIndex % 16),
              signalStrengthDbm: -56 - (sensorIndex % 20),
              detectionConfidence: status === 'occupied' ? 99.6 : 98.9,
              temperatureCelsius: 20.8 + (sensorIndex % 6) * 0.3,
              lastHeartbeat: new Date(Date.now() - (sensorIndex % 45) * 1000).toISOString(),
              rawDistanceCm: status === 'occupied' ? 42 : 238,
            },
            gridRow: zIdx,
            gridCol: s - 1,
            orientation: 'vertical',
          });
        }
      });
    });
  });

  return slots;
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-alex',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 349-8120',
    role: 'driver',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    walletBalance: 65.50,
    rewardPoints: 480,
    favoriteLocationIds: ['loc-metro-central', 'loc-skyline-tech'],
    vehicles: [
      {
        id: 'veh-1',
        licensePlate: 'CA-789-XP',
        model: 'Audi A4 Sport Sedan',
        color: '#2563EB',
        type: 'sedan',
        isDefault: true,
      },
      {
        id: 'veh-2',
        licensePlate: 'NV-412-MK',
        model: 'Porsche Macan GTS',
        color: '#1E293B',
        type: 'suv',
        isDefault: false,
      }
    ],
    preferences: {
      evPriority: false,
      disabledAccess: false,
      compactOnly: false,
      smsNotifications: true,
      emailReceipts: true,
    }
  },
  {
    id: 'user-elena',
    name: 'Elena Vance',
    email: 'elena.vance@techpark.io',
    phone: '+1 (555) 902-4411',
    role: 'driver',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    walletBalance: 120.00,
    rewardPoints: 920,
    favoriteLocationIds: ['loc-skyline-tech'],
    vehicles: [
      {
        id: 'veh-3',
        licensePlate: 'EV-404-GO',
        model: 'Tesla Model 3 Long Range',
        color: '#E2E8F0',
        type: 'ev',
        isDefault: true,
      }
    ],
    preferences: {
      evPriority: true,
      disabledAccess: false,
      compactOnly: false,
      smsNotifications: true,
      emailReceipts: true,
    }
  },
  {
    id: 'user-admin',
    name: 'Marcus Reed',
    email: 'sandhyareddy.new@gmail.com',
    phone: '+1 (555) 880-9900',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    walletBalance: 250.00,
    rewardPoints: 2450,
    favoriteLocationIds: ['loc-metro-central', 'loc-airport-express'],
    vehicles: [
      {
        id: 'veh-admin',
        licensePlate: 'ADM-001-SP',
        model: 'Executive Mercedes EQE',
        color: '#0F172A',
        type: 'ev',
        isDefault: true,
      }
    ],
    preferences: {
      evPriority: true,
      disabledAccess: false,
      compactOnly: false,
      smsNotifications: true,
      emailReceipts: true,
    }
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-101',
    bookingReference: 'SP-2026-89412',
    slotId: 'slot-level-b1-a102',
    locationId: 'loc-metro-central',
    userId: 'user-alex',
    userName: 'Alex Morgan',
    userEmail: 'alex.morgan@example.com',
    userPhone: '+1 (555) 349-8120',
    vehicle: {
      licensePlate: 'CA-789-XP',
      model: 'Audi A4 Sport Sedan',
      type: 'sedan',
    },
    floor: 'Level B1',
    zone: 'Zone A',
    slotNumber: 'A102',
    startTime: new Date(Date.now() - 45 * 60000).toISOString(),
    endTime: new Date(Date.now() + 135 * 60000).toISOString(),
    durationHours: 3,
    baseRatePerHour: 4.50,
    dynamicMultiplier: 1.15,
    evChargingIncluded: false,
    evChargingFee: 0,
    discountApplied: 0,
    totalAmount: 15.53,
    status: 'active',
    paymentStatus: 'paid',
    paymentMethod: 'ParkWallet Balance',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    qrPayload: 'SMARTPARK|SP-2026-89412|A102|CA-789-XP|SECURE_TOKEN_89412',
    qrToken: 'SECURE_TOKEN_89412',
    entryPin: '4821',
    checkInTime: new Date(Date.now() - 40 * 60000).toISOString(),
    qrScannedEntry: true,
    qrScannedExit: false,
  },
  {
    id: 'res-102',
    bookingReference: 'SP-2026-94031',
    slotId: 'slot-level-b2-b103',
    locationId: 'loc-metro-central',
    userId: 'user-elena',
    userName: 'Elena Vance',
    userEmail: 'elena.vance@techpark.io',
    userPhone: '+1 (555) 902-4411',
    vehicle: {
      licensePlate: 'EV-404-GO',
      model: 'Tesla Model 3 Long Range',
      type: 'ev',
    },
    floor: 'Level B2',
    zone: 'Zone B',
    slotNumber: 'B103',
    startTime: new Date(Date.now() + 120 * 60000).toISOString(),
    endTime: new Date(Date.now() + 300 * 60000).toISOString(),
    durationHours: 3,
    baseRatePerHour: 4.50,
    dynamicMultiplier: 1.0,
    evChargingIncluded: true,
    evChargingFee: 6.00,
    discountApplied: 2.00,
    totalAmount: 17.50,
    status: 'upcoming',
    paymentStatus: 'paid',
    paymentMethod: 'Apple Pay (•••• 9021)',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    qrPayload: 'SMARTPARK|SP-2026-94031|B103|EV-404-GO|SECURE_TOKEN_94031',
    qrToken: 'SECURE_TOKEN_94031',
    entryPin: '9184',
    qrScannedEntry: false,
    qrScannedExit: false,
  },
  {
    id: 'res-103',
    bookingReference: 'SP-2026-78190',
    slotId: 'slot-ground-g-c101',
    locationId: 'loc-metro-central',
    userId: 'user-alex',
    userName: 'Alex Morgan',
    userEmail: 'alex.morgan@example.com',
    userPhone: '+1 (555) 349-8120',
    vehicle: {
      licensePlate: 'CA-789-XP',
      model: 'Audi A4 Sport Sedan',
      type: 'sedan',
    },
    floor: 'Ground G',
    zone: 'Zone C',
    slotNumber: 'C101',
    startTime: new Date(Date.now() - 28 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 24 * 3600000).toISOString(),
    durationHours: 4,
    baseRatePerHour: 4.50,
    dynamicMultiplier: 1.2,
    evChargingIncluded: false,
    evChargingFee: 0,
    discountApplied: 0,
    totalAmount: 21.60,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'Visa (•••• 4128)',
    createdAt: new Date(Date.now() - 30 * 3600000).toISOString(),
    qrPayload: 'SMARTPARK|SP-2026-78190|C101|CA-789-XP|SECURE_TOKEN_78190',
    qrToken: 'SECURE_TOKEN_78190',
    entryPin: '2938',
    checkInTime: new Date(Date.now() - 28 * 3600000).toISOString(),
    checkOutTime: new Date(Date.now() - 24 * 3600000 + 15 * 60000).toISOString(),
    qrScannedEntry: true,
    qrScannedExit: true,
    actualDurationMinutes: 255,
    prepaidAmount: 21.60,
    effectiveHourlyRate: 5.40,
    billedHours: 5,
    finalCharge: 21.60,
    refundAmount: 0,
    additionalCharge: 0,
    billingSettled: true,
  },
  {
    id: 'res-104',
    bookingReference: 'SP-2026-31984',
    slotId: 'slot-loc-skyline-tech-ground-g-a102',
    locationId: 'loc-skyline-tech',
    userId: 'user-elena',
    userName: 'Elena Vance',
    userEmail: 'elena.vance@techpark.io',
    userPhone: '+1 (555) 902-4411',
    vehicle: {
      licensePlate: 'EV-404-GO',
      model: 'Tesla Model 3 Long Range',
      type: 'ev',
    },
    floor: 'Ground G',
    zone: 'Zone A',
    slotNumber: 'A102',
    startTime: new Date(Date.now() - 60 * 60000).toISOString(),
    endTime: new Date(Date.now() + 120 * 60000).toISOString(),
    durationHours: 3,
    baseRatePerHour: 5.00,
    dynamicMultiplier: 1.25,
    evChargingIncluded: true,
    evChargingFee: 6.00,
    discountApplied: 0,
    totalAmount: 24.75,
    prepaidAmount: 24.75,
    effectiveHourlyRate: 6.25,
    status: 'active',
    paymentStatus: 'paid',
    paymentMethod: 'ParkWallet Balance',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    qrPayload: 'SMARTPARK|SP-2026-31984|A102|EV-404-GO|SECURE_TOKEN_31984',
    qrToken: 'SECURE_TOKEN_31984',
    entryPin: '5192',
    checkInTime: new Date(Date.now() - 55 * 60000).toISOString(),
    qrScannedEntry: true,
    qrScannedExit: false,
  },
  {
    id: 'res-105',
    bookingReference: 'SP-2026-55410',
    slotId: 'slot-loc-airport-express-level-1-b101',
    locationId: 'loc-airport-express',
    userId: 'user-alex',
    userName: 'Alex Morgan',
    userEmail: 'alex.morgan@example.com',
    userPhone: '+1 (555) 349-8120',
    vehicle: {
      licensePlate: 'NV-412-MK',
      model: 'Porsche Macan GTS',
      type: 'suv',
    },
    floor: 'Level 1',
    zone: 'Zone B',
    slotNumber: 'B101',
    startTime: new Date(Date.now() - 120 * 60000).toISOString(),
    endTime: new Date(Date.now() + 240 * 60000).toISOString(),
    durationHours: 6,
    baseRatePerHour: 3.50,
    dynamicMultiplier: 0.95,
    evChargingIncluded: false,
    evChargingFee: 0,
    discountApplied: 0,
    totalAmount: 19.95,
    prepaidAmount: 19.95,
    effectiveHourlyRate: 3.33,
    status: 'active',
    paymentStatus: 'paid',
    paymentMethod: 'ParkWallet Balance',
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    qrPayload: 'SMARTPARK|SP-2026-55410|B101|NV-412-MK|SECURE_TOKEN_55410',
    qrToken: 'SECURE_TOKEN_55410',
    entryPin: '8204',
    checkInTime: new Date(Date.now() - 110 * 60000).toISOString(),
    qrScannedEntry: true,
    qrScannedExit: false,
  },
  {
    id: 'res-106',
    bookingReference: 'SP-2026-67319',
    slotId: 'slot-loc-harbor-waterfront-ground-g-a101',
    locationId: 'loc-harbor-waterfront',
    userId: 'user-alex',
    userName: 'Alex Morgan',
    userEmail: 'alex.morgan@example.com',
    userPhone: '+1 (555) 349-8120',
    vehicle: {
      licensePlate: 'CA-789-XP',
      model: 'Audi A4 Sport Sedan',
      type: 'sedan',
    },
    floor: 'Ground G',
    zone: 'Zone A',
    slotNumber: 'A101',
    startTime: new Date(Date.now() + 60 * 60000).toISOString(),
    endTime: new Date(Date.now() + 180 * 60000).toISOString(),
    durationHours: 2,
    baseRatePerHour: 4.00,
    dynamicMultiplier: 1.05,
    evChargingIncluded: false,
    evChargingFee: 0,
    discountApplied: 0,
    totalAmount: 8.40,
    prepaidAmount: 8.40,
    effectiveHourlyRate: 4.20,
    status: 'upcoming',
    paymentStatus: 'paid',
    paymentMethod: 'ParkWallet Balance',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    qrPayload: 'SMARTPARK|SP-2026-67319|A101|CA-789-XP|SECURE_TOKEN_67319',
    qrToken: 'SECURE_TOKEN_67319',
    entryPin: '6312',
    qrScannedEntry: false,
    qrScannedExit: false,
  }
];
