import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_LOCATIONS, generateInitialSlots, DEMO_USERS, INITIAL_RESERVATIONS } from './src/data/mockData.ts';
import {
  ParkingLocation,
  ParkingSlot,
  Reservation,
  UserProfile,
  DemandPrediction,
  LocationReview,
  ZoneHeatmapData,
  HeatmapResponse,
  SmartPricingResult,
  OverstayAlert,
  PaymentReceipt
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory persistent state during server runtime
let locations: ParkingLocation[] = [...INITIAL_LOCATIONS];
let slots: ParkingSlot[] = generateInitialSlots();
let reservations: Reservation[] = [...INITIAL_RESERVATIONS];
let users: UserProfile[] = [...DEMO_USERS];

// Initialize Gemini client if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI();
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Helper to enrich locations with live slot counters and EV availability
  const getEnrichedLocations = () => {
    return locations.map(loc => {
      const locSlots = slots.filter(s => s.locationId === loc.id);
      const availCount = locSlots.filter(s => s.status === 'available').length;
      const evAvail = locSlots.filter(s => s.hasEvCharger && s.status === 'available').length;
      return {
        ...loc,
        totalSlots: locSlots.length > 0 ? locSlots.length : loc.totalSlots,
        availableSlots: locSlots.length > 0 ? availCount : loc.availableSlots,
        evAvailableCount: locSlots.length > 0 ? evAvail : (loc.evAvailableCount || 4),
      };
    });
  };

  // --- API: Locations ---
  app.get('/api/locations', (req: Request, res: Response) => {
    res.json(getEnrichedLocations());
  });

  app.put('/api/locations/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = locations.findIndex(l => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }
    locations[index] = { ...locations[index], ...req.body };
    res.json(locations[index]);
  });

  // --- FEATURE 2: Favorites Persistence ---
  app.get('/api/users/:userId/favorites', (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    res.json(user ? (user.favoriteLocationIds || []) : []);
  });

  app.post('/api/users/:userId/favorites/toggle', (req: Request, res: Response) => {
    const { userId } = req.params;
    const { locationId } = req.body;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.favoriteLocationIds) user.favoriteLocationIds = [];
    const idx = user.favoriteLocationIds.indexOf(locationId);
    if (idx > -1) {
      user.favoriteLocationIds.splice(idx, 1);
    } else {
      user.favoriteLocationIds.push(locationId);
    }
    res.json({ success: true, favorites: user.favoriteLocationIds });
  });

  // --- FEATURE 10: Feedback & Ratings ---
  app.get('/api/locations/:id/reviews', (req: Request, res: Response) => {
    const { id } = req.params;
    const loc = locations.find(l => l.id === id);
    if (!loc) return res.status(404).json({ error: 'Location not found' });
    res.json(loc.reviews || []);
  });

  app.post('/api/locations/:id/reviews', (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, userName, userAvatar, rating, comment, tags } = req.body;
    const loc = locations.find(l => l.id === id);
    if (!loc) return res.status(404).json({ error: 'Location not found' });

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    if (!loc.reviews) loc.reviews = [];
    const newReview: LocationReview = {
      id: `rev-${Date.now()}`,
      locationId: id,
      userId: userId || 'anonymous',
      userName: userName || 'Driver',
      userAvatar: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: Number(rating),
      comment: comment || '',
      tags: tags || ['Verified Booking'],
      createdAt: new Date().toISOString(),
    };

    loc.reviews.unshift(newReview);
    // Recalculate average rating
    const sum = loc.reviews.reduce((acc, r) => acc + r.rating, 0);
    loc.rating = Number((sum / loc.reviews.length).toFixed(1));
    loc.reviewsCount = loc.reviews.length;

    res.status(201).json({ review: newReview, averageRating: loc.rating, totalReviews: loc.reviewsCount });
  });

  // --- API: Slots ---
  app.get('/api/slots', (req: Request, res: Response) => {
    const { locationId, floor, zone, status, hasEv } = req.query;
    let result = [...slots];

    if (locationId) result = result.filter(s => s.locationId === locationId);
    if (floor) result = result.filter(s => s.floor === floor);
    if (zone) result = result.filter(s => s.zone === zone);
    if (status) result = result.filter(s => s.status === status);
    if (hasEv === 'true') result = result.filter(s => s.hasEvCharger);

    res.json(result);
  });

  app.post('/api/slots', (req: Request, res: Response) => {
    const newSlot: ParkingSlot = {
      ...req.body,
      id: req.body.id || `slot-${Date.now()}`,
      iotSensor: req.body.iotSensor || {
        sensorId: `IOT-US-${Math.floor(500 + Math.random() * 499)}`,
        isSimulated: true,
        batteryLevel: 96,
        signalStrengthDbm: -62,
        detectionConfidence: 99.0,
        temperatureCelsius: 22.0,
        lastHeartbeat: new Date().toISOString(),
        rawDistanceCm: 240,
      }
    };
    slots.push(newSlot);
    res.status(201).json(newSlot);
  });

  app.put('/api/slots/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = slots.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Slot not found' });
    slots[index] = { ...slots[index], ...req.body };
    res.json(slots[index]);
  });

  app.delete('/api/slots/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const beforeCount = slots.length;
    slots = slots.filter(s => s.id !== id);
    if (slots.length === beforeCount) return res.status(404).json({ error: 'Slot not found' });
    res.json({ success: true, deletedId: id });
  });

  // --- FEATURE 6: Smart Dynamic Pricing Calculation ---
  app.post('/api/pricing/calculate', (req: Request, res: Response) => {
    const { locationId, slotId, durationHours, startTime, includeEvCharging } = req.body;
    const loc = locations.find(l => l.id === locationId) || locations[0];
    const slot = slots.find(s => s.id === slotId);

    const baseRate = slot ? slot.baseHourlyRate : (loc ? loc.baseHourlyRate : 4.50);
    const hours = Math.max(1, Number(durationHours) || 2);
    const originalPrice = Number((baseRate * hours).toFixed(2));

    // Occupancy calculation for location
    const locSlots = slots.filter(s => s.locationId === loc.id);
    const occupiedCount = locSlots.filter(s => s.status === 'occupied' || s.status === 'reserved').length;
    const occRate = locSlots.length > 0 ? Math.round((occupiedCount / locSlots.length) * 100) : 75;

    // Occupancy surge multiplier
    let occMultiplier = 1.0;
    if (occRate > 85) occMultiplier = 1.35;
    else if (occRate > 70) occMultiplier = 1.15;
    else if (occRate < 40) occMultiplier = 0.90;

    // Time of day multiplier
    const startHour = startTime ? new Date(startTime).getHours() : new Date().getHours();
    let timeMultiplier = 1.0;
    if ((startHour >= 8 && startHour <= 10) || (startHour >= 12 && startHour <= 14) || (startHour >= 17 && startHour <= 19)) {
      timeMultiplier = 1.10;
    }

    const combinedMultiplier = Number((occMultiplier * timeMultiplier).toFixed(2));
    const evFee = includeEvCharging ? (loc.evChargingSessionFee || 5.00) : 0;
    const adjustedBeforeFee = baseRate * hours * combinedMultiplier;
    const adjustedPrice = Number((adjustedBeforeFee + evFee).toFixed(2));
    const delta = Number((adjustedPrice - originalPrice).toFixed(2));

    const explanations: string[] = [
      `Standard Base Fare: $${baseRate.toFixed(2)}/hr × ${hours} hrs = $${originalPrice.toFixed(2)}`,
    ];

    if (occMultiplier > 1.0) {
      explanations.push(`Occupancy Surge: ${occRate}% garage capacity (+${Math.round((occMultiplier - 1) * 100)}%)`);
    } else if (occMultiplier < 1.0) {
      explanations.push(`Off-Peak Low Demand Discount: ${occRate}% capacity (-${Math.round((1 - occMultiplier) * 100)}%)`);
    }

    if (timeMultiplier > 1.0) {
      explanations.push(`Peak Traffic Window (${startHour}:00h): +10% demand indexing`);
    }

    if (includeEvCharging) {
      explanations.push(`EV High-Speed Charging Terminal Session: +$${evFee.toFixed(2)}`);
    }

    const result: SmartPricingResult = {
      baseHourlyRate: baseRate,
      hours,
      originalPrice,
      occupancyRate: occRate,
      occupancySurgeMultiplier: occMultiplier,
      timeOfDayMultiplier: timeMultiplier,
      evFee,
      discount: 0,
      adjustedPrice,
      savingsOrSurgeAmount: Math.abs(delta),
      isSurge: delta > 0,
      explanations,
    };

    res.json(result);
  });

  // --- API: Reservations with strict Overlap Prevention ---
  app.get('/api/reservations', (req: Request, res: Response) => {
    const { userId, status } = req.query;
    let list = [...reservations];
    if (userId) list = list.filter(r => r.userId === userId);
    if (status) list = list.filter(r => r.status === status);
    res.json(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.post('/api/reservations', (req: Request, res: Response) => {
    const {
      slotId,
      locationId,
      userId,
      userName,
      userEmail,
      userPhone,
      vehicle,
      floor,
      zone,
      slotNumber,
      startTime,
      endTime,
      durationHours,
      evChargingIncluded,
      paymentMethod,
    } = req.body;

    if (!slotId || !startTime || !endTime || !userId) {
      return res.status(400).json({ error: 'Missing required reservation fields' });
    }

    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();

    if (endMs <= startMs) {
      return res.status(400).json({ error: 'Exit time must be later than entry time' });
    }

    // Check for overlapping reservations on the same slot
    const overlappingBooking = reservations.find(r => {
      if (r.slotId !== slotId) return false;
      if (r.status === 'cancelled' || r.status === 'completed') return false;
      const existingStart = new Date(r.startTime).getTime();
      const existingEnd = new Date(r.endTime).getTime();
      return startMs < existingEnd && endMs > existingStart;
    });

    if (overlappingBooking) {
      const alternativeSlot = slots.find(s => 
        s.locationId === locationId &&
        s.floor === floor &&
        s.id !== slotId &&
        s.status === 'available'
      );

      return res.status(409).json({
        error: 'Slot is already reserved during the selected time period.',
        conflictBookingRef: overlappingBooking.bookingReference,
        suggestedSlot: alternativeSlot ? {
          id: alternativeSlot.id,
          slotNumber: alternativeSlot.slotNumber,
          floor: alternativeSlot.floor,
          zone: alternativeSlot.zone,
        } : null
      });
    }

    const targetSlot = slots.find(s => s.id === slotId);
    const loc = locations.find(l => l.id === locationId);
    const baseRate = targetSlot ? targetSlot.baseHourlyRate : (loc ? loc.baseHourlyRate : 4.50);
    const multiplier = loc ? loc.currentDynamicMultiplier : 1.15;
    const hours = Math.max(1, durationHours || Math.round((endMs - startMs) / 3600000));
    const evFee = evChargingIncluded ? 5.00 : 0;
    const baseCost = baseRate * hours * multiplier;
    const totalAmount = Number((baseCost + evFee).toFixed(2));
    const effectiveHourlyRate = Number((baseRate * multiplier).toFixed(2));

    const bookingRef = `SP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const secureQrToken = `QR_SECURE_${bookingRef}_${Date.now()}`;

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      bookingReference: bookingRef,
      slotId,
      locationId: locationId || 'loc-metro-central',
      userId,
      userName: userName || 'Customer',
      userEmail: userEmail || 'user@example.com',
      userPhone: userPhone || '+1 (555) 000-0000',
      vehicle: vehicle || {
        licensePlate: 'CA-999-SP',
        model: 'Standard Vehicle',
        type: 'sedan',
      },
      floor: floor || 'Ground G',
      zone: zone || 'Zone A',
      slotNumber: slotNumber || 'A101',
      startTime,
      endTime,
      durationHours: hours,
      baseRatePerHour: baseRate,
      dynamicMultiplier: multiplier,
      evChargingIncluded: !!evChargingIncluded,
      evChargingFee: evFee,
      discountApplied: 0,
      totalAmount,
      prepaidAmount: totalAmount,
      effectiveHourlyRate,
      finalCharge: totalAmount,
      refundAmount: 0,
      additionalCharge: 0,
      billingSettled: false,
      status: 'upcoming',
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'ParkWallet Balance',
      createdAt: new Date().toISOString(),
      qrPayload: `SMARTPARK|${bookingRef}|${slotNumber}|${vehicle?.licensePlate || 'VEHICLE'}|${secureQrToken}`,
      qrToken: secureQrToken,
      entryPin: pin,
      qrScannedEntry: false,
      qrScannedExit: false,
    };

    // Deduct prepaid reserve from user's simulated wallet
    const bookingUser = users.find(u => u.id === userId);
    if (bookingUser && (paymentMethod === 'ParkWallet Balance' || !paymentMethod)) {
      bookingUser.walletBalance = Math.max(0, Number((bookingUser.walletBalance - totalAmount).toFixed(2)));
    }

    const nowMs = Date.now();
    if (startMs - nowMs <= 30 * 60000 && startMs <= nowMs + 15 * 60000) {
      newReservation.status = 'active';
      if (targetSlot) {
        targetSlot.status = 'reserved';
      }
    }

    reservations.unshift(newReservation);
    res.status(201).json(newReservation);
  });

  // --- FEATURE 3: Booking Duration Extension ---
  app.post('/api/reservations/:id/extend', (req: Request, res: Response) => {
    const { id } = req.params;
    const { additionalHours } = req.body;
    const hoursToAdd = Number(additionalHours) || 1;

    const booking = reservations.find(r => r.id === id);
    if (!booking) return res.status(404).json({ error: 'Reservation not found' });

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ error: `Cannot extend a ${booking.status} reservation.` });
    }

    const currentEndMs = new Date(booking.endTime).getTime();
    const newEndMs = currentEndMs + (hoursToAdd * 3600000);
    const newEndTime = new Date(newEndMs).toISOString();

    // Check for overlapping reservations on that slot during the extended period
    const conflict = reservations.find(r => {
      if (r.id === booking.id) return false;
      if (r.slotId !== booking.slotId) return false;
      if (r.status === 'cancelled' || r.status === 'completed') return false;
      const rStart = new Date(r.startTime).getTime();
      const rEnd = new Date(r.endTime).getTime();
      return currentEndMs < rEnd && newEndMs > rStart;
    });

    if (conflict) {
      return res.status(409).json({
        error: `Cannot extend bay ${booking.slotNumber}. Another driver has reserved this space starting at ${new Date(conflict.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        conflictRef: conflict.bookingReference,
      });
    }

    // Calculate additional cost
    const targetSlot = slots.find(s => s.id === booking.slotId);
    const loc = locations.find(l => l.id === booking.locationId);
    const rate = targetSlot ? targetSlot.baseHourlyRate : (loc ? loc.baseHourlyRate : 4.50);
    const multiplier = loc ? loc.currentDynamicMultiplier : 1.15;
    const additionalAmount = Number((rate * hoursToAdd * multiplier).toFixed(2));

    booking.endTime = newEndTime;
    booking.durationHours += hoursToAdd;
    booking.totalAmount = Number((booking.totalAmount + additionalAmount).toFixed(2));

    if (!booking.extensionHistory) booking.extensionHistory = [];
    booking.extensionHistory.push({
      extendedAt: new Date().toISOString(),
      additionalHours: hoursToAdd,
      additionalAmount,
      newEndTime,
    });

    res.json({
      success: true,
      reservation: booking,
      extendedHours: hoursToAdd,
      additionalAmount,
      newEndTime,
    });
  });

  app.post('/api/reservations/:id/cancel', (req: Request, res: Response) => {
    const { id } = req.params;
    const booking = reservations.find(r => r.id === id);
    if (!booking) return res.status(404).json({ error: 'Reservation not found' });
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ error: `Reservation is already ${booking.status}` });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';

    const targetSlot = slots.find(s => s.id === booking.slotId);
    if (targetSlot && targetSlot.status === 'reserved') {
      targetSlot.status = 'available';
    }

    res.json({ success: true, reservation: booking, refundAmount: booking.totalAmount });
  });

  // --- FEATURE 7: Robust QR Entry & Exit with Reuse Prevention ---
  const processGateScan = (req: Request, res: Response) => {
    const { query, scanType } = req.body;
    if (!query) return res.status(400).json({ error: 'QR Code or Pass token is required' });

    const clean = query.trim().toUpperCase();
    const booking = reservations.find(r => 
      r.bookingReference.toUpperCase() === clean ||
      r.entryPin === clean ||
      r.qrToken === query ||
      (r.qrPayload && r.qrPayload.includes(query))
    );

    if (!booking) {
      return res.status(404).json({
        valid: false,
        message: 'Security Alert: Invalid or unverified parking pass token.',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        valid: false,
        message: 'Security Alert: Reservation is CANCELLED. Access denied.',
        booking,
      });
    }

    const targetSlot = slots.find(s => s.id === booking.slotId);
    const now = new Date();

    // ENTRY SCAN LOGIC
    if (scanType === 'entry') {
      if (booking.qrScannedEntry && booking.status === 'active') {
        return res.status(400).json({
          valid: false,
          message: 'Security Alert: QR Pass has ALREADY been used for entry! Duplicate scan forbidden to prevent pass sharing.',
          booking,
        });
      }

      booking.checkInTime = now.toISOString();
      booking.qrScannedEntry = true;
      booking.status = 'active';

      if (targetSlot) {
        targetSlot.status = 'occupied';
        targetSlot.occupiedVehicle = {
          licensePlate: booking.vehicle.licensePlate,
          model: booking.vehicle.model,
          color: '#2563EB',
          type: booking.vehicle.type,
          parkedAt: booking.checkInTime,
        };
        targetSlot.iotSensor.detectionConfidence = 99.8;
        targetSlot.iotSensor.rawDistanceCm = 42;
      }

      return res.json({
        valid: true,
        action: 'ENTRY GRANTED - BOOM BARRIER RAISED',
        direction: 'entry',
        booking,
        slot: targetSlot,
        message: `Authorized Entry for vehicle ${booking.vehicle.licensePlate} at Bay ${booking.slotNumber}.`,
      });
    }

    // EXIT SCAN LOGIC
    if (scanType === 'exit') {
      if (!booking.qrScannedEntry && !booking.checkInTime) {
        return res.status(400).json({
          valid: false,
          message: 'Security Alert: Vehicle has no recorded entry timestamp. Cannot process exit.',
          booking,
        });
      }

      if (booking.billingSettled || booking.qrScannedExit || booking.status === 'completed') {
        return res.status(400).json({
          valid: false,
          message: 'Notice: This parking pass has already completed exit and settled billing. Duplicate settlement prevented.',
          booking,
          receipt: booking.receipt,
        });
      }

      booking.checkOutTime = now.toISOString();
      booking.qrScannedExit = true;
      booking.status = 'completed';

      const entryMs = new Date(booking.checkInTime || booking.startTime).getTime();
      const exitMs = now.getTime();
      const actualMinutes = Math.max(1, Math.round((exitMs - entryMs) / 60000));
      booking.actualDurationMinutes = actualMinutes;

      // Consistent partial-hour rounding policy: 1 hour minimum, rounded up to nearest full hour
      const billedHours = Math.max(1, Math.ceil(actualMinutes / 60));
      booking.billedHours = billedHours;

      const hourlyRate = booking.effectiveHourlyRate || Number((booking.baseRatePerHour * (booking.dynamicMultiplier || 1)).toFixed(2));
      const prepaidAmount = booking.prepaidAmount || booking.totalAmount;
      const evFee = booking.evChargingIncluded ? (booking.evChargingFee || 5.00) : 0;
      const baseUsageCharge = Number((billedHours * hourlyRate).toFixed(2));
      const calculatedCharge = Number((baseUsageCharge + evFee).toFixed(2));

      let finalCharge = calculatedCharge;
      let refundAmount = 0;
      let additionalCharge = 0;

      if (billedHours < booking.durationHours) {
        // Unused duration -> refund the difference
        refundAmount = Math.max(0, Number((prepaidAmount - finalCharge).toFixed(2)));
        additionalCharge = 0;
      } else if (billedHours === booking.durationHours) {
        // Exact duration used -> 0 refund
        finalCharge = prepaidAmount;
        refundAmount = 0;
        additionalCharge = 0;
      } else {
        // Exceeded booked duration -> additional charge for extra hours
        refundAmount = 0;
        additionalCharge = Number((finalCharge - prepaidAmount).toFixed(2));
      }

      booking.finalCharge = finalCharge;
      booking.refundAmount = refundAmount;
      booking.additionalCharge = additionalCharge;
      booking.billingSettled = true;
      booking.paymentStatus = 'settled';

      const user = users.find(u => u.id === booking.userId);
      const walletBefore = user ? user.walletBalance : 0;
      if (user) {
        if (refundAmount > 0) {
          user.walletBalance = Number((user.walletBalance + refundAmount).toFixed(2));
        } else if (additionalCharge > 0) {
          user.walletBalance = Math.max(0, Number((user.walletBalance - additionalCharge).toFixed(2)));
        }
      }
      const walletAfter = user ? user.walletBalance : walletBefore;

      const loc = locations.find(l => l.id === booking.locationId);
      const receipt: PaymentReceipt = {
        receiptId: `REC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        bookingReference: booking.bookingReference,
        facilityName: loc ? loc.name : 'Smart Park Facility',
        slotNumber: booking.slotNumber,
        floor: booking.floor,
        zone: booking.zone,
        vehiclePlate: booking.vehicle.licensePlate,
        vehicleModel: booking.vehicle.model,
        checkInTime: booking.checkInTime!,
        checkOutTime: booking.checkOutTime!,
        bookedDurationHours: booking.durationHours,
        actualDurationMinutes: actualMinutes,
        billedHours,
        hourlyRate,
        prepaidAmount,
        baseUsageCharge,
        evChargingFee: evFee,
        overstayCharge: additionalCharge,
        finalCharge,
        refundAmount,
        additionalCharge,
        walletBalanceBefore: walletBefore,
        walletBalanceAfter: walletAfter,
        timestamp: now.toISOString(),
        isSimulated: true,
        roundingPolicy: 'Partial hours rounded up to nearest full hour (1 hour minimum threshold)',
      };
      booking.receipt = receipt;

      if (targetSlot) {
        targetSlot.status = 'available';
        targetSlot.occupiedVehicle = undefined;
        targetSlot.iotSensor.rawDistanceCm = 240;
        targetSlot.iotSensor.detectionConfidence = 99.1;
      }

      const msg = refundAmount > 0
        ? `Exit verified for ${booking.vehicle.licensePlate}. Actual usage: ${billedHours} hr(s) ($${finalCharge.toFixed(2)}). Unused prepaid amount of $${refundAmount.toFixed(2)} refunded to simulated wallet.`
        : additionalCharge > 0
        ? `Exit verified for ${booking.vehicle.licensePlate}. Actual usage: ${billedHours} hr(s) exceeded booked duration. Final charge: $${finalCharge.toFixed(2)}. Additional charge: $${additionalCharge.toFixed(2)}.`
        : `Exit verified for ${booking.vehicle.licensePlate}. Full duration used (${billedHours} hrs). Final charge: $${finalCharge.toFixed(2)}. Refund: $0.00.`;

      return res.json({
        valid: true,
        action: 'EXIT GRANTED - BOOM BARRIER RAISED',
        direction: 'exit',
        booking,
        slot: targetSlot,
        receipt,
        actualMinutes,
        billedHours,
        finalCharge,
        refundAmount,
        additionalCharge,
        userWalletBalance: walletAfter,
        message: msg,
      });
    }

    // Default toggle (fallback)
    if (!booking.checkInTime) {
      booking.checkInTime = now.toISOString();
      booking.qrScannedEntry = true;
      booking.status = 'active';
      if (targetSlot) targetSlot.status = 'occupied';
      return res.json({ valid: true, action: 'Checked IN at Barrier Gate', booking, slot: targetSlot });
    } else {
      booking.checkOutTime = now.toISOString();
      booking.qrScannedExit = true;
      booking.status = 'completed';
      if (targetSlot) targetSlot.status = 'available';
      return res.json({ valid: true, action: 'Checked OUT at Barrier Gate', booking, slot: targetSlot });
    }
  };

  app.post('/api/gate/scan', processGateScan);
  app.post('/api/reservations/verify-pass', processGateScan);

  // --- Real-time Live Parking Billing & Timer Endpoint ---
  app.get('/api/reservations/:id/live-billing', (req: Request, res: Response) => {
    const { id } = req.params;
    const booking = reservations.find(r => r.id === id || r.bookingReference === id);
    if (!booking) return res.status(404).json({ error: 'Reservation not found' });

    if (!booking.checkInTime || booking.status === 'completed' || booking.status === 'cancelled') {
      return res.json({
        bookingReference: booking.bookingReference,
        status: booking.status,
        checkInTime: booking.checkInTime || null,
        elapsedSeconds: 0,
        elapsedMinutes: booking.actualDurationMinutes || 0,
        currentBilledHours: booking.billedHours || 0,
        hourlyRate: booking.effectiveHourlyRate || booking.baseRatePerHour,
        prepaidAmount: booking.prepaidAmount || booking.totalAmount,
        currentAccumulatedCharge: booking.finalCharge || booking.totalAmount,
        estimatedRemainingBalance: booking.refundAmount || 0,
        isOverdue: false,
        potentialOvercharge: booking.additionalCharge || 0,
      });
    }

    const nowMs = Date.now();
    const checkInMs = new Date(booking.checkInTime).getTime();
    const elapsedSeconds = Math.max(0, Math.round((nowMs - checkInMs) / 1000));
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const currentBilledHours = Math.max(1, Math.ceil(elapsedMinutes / 60));
    const hourlyRate = booking.effectiveHourlyRate || Number((booking.baseRatePerHour * (booking.dynamicMultiplier || 1)).toFixed(2));
    const evFee = booking.evChargingIncluded ? (booking.evChargingFee || 5.00) : 0;
    const currentAccumulatedCharge = Number((currentBilledHours * hourlyRate + evFee).toFixed(2));
    const prepaid = booking.prepaidAmount || booking.totalAmount;
    const estimatedRemainingBalance = Number(Math.max(0, prepaid - currentAccumulatedCharge).toFixed(2));
    const isOverdue = currentBilledHours > booking.durationHours;
    const potentialOvercharge = isOverdue ? Number((currentAccumulatedCharge - prepaid).toFixed(2)) : 0;

    res.json({
      bookingReference: booking.bookingReference,
      status: booking.status,
      checkInTime: booking.checkInTime,
      elapsedSeconds,
      elapsedMinutes,
      currentBilledHours,
      hourlyRate,
      prepaidAmount: prepaid,
      currentAccumulatedCharge,
      estimatedRemainingBalance,
      isOverdue,
      potentialOvercharge,
    });
  });

  // --- FEATURE 9: Overstay Alerts Endpoint ---
  app.get('/api/alerts/overstay', (req: Request, res: Response) => {
    const nowMs = Date.now();
    const alerts: OverstayAlert[] = [];

    reservations.forEach(r => {
      if (r.status === 'active' && !r.checkOutTime) {
        const endMs = new Date(r.endTime).getTime();
        if (nowMs > endMs) {
          const minutesOver = Math.round((nowMs - endMs) / 60000);
          const penalty = Math.ceil(minutesOver / 60) * 10;
          alerts.push({
            reservationId: r.id,
            bookingReference: r.bookingReference,
            slotNumber: r.slotNumber,
            floor: r.floor,
            zone: r.zone,
            vehiclePlate: r.vehicle.licensePlate,
            vehicleModel: r.vehicle.model,
            driverName: r.userName,
            driverPhone: r.userPhone,
            scheduledEndTime: r.endTime,
            minutesOverdue: minutesOver,
            penaltyFee: penalty,
          });
        }
      }
    });

    res.json(alerts);
  });

  app.get('/api/alerts/expiring-soon', (req: Request, res: Response) => {
    const { userId } = req.query;
    const nowMs = Date.now();
    // Find active bookings with < 20 minutes remaining
    const soon = reservations.filter(r => {
      if (userId && r.userId !== userId) return false;
      if (r.status !== 'active') return false;
      const endMs = new Date(r.endTime).getTime();
      const diffMins = (endMs - nowMs) / 60000;
      return diffMins > 0 && diffMins <= 20;
    });

    res.json(soon);
  });

  // --- FEATURE 5: Parking Demand Heatmap ---
  app.get('/api/analytics/heatmap', (req: Request, res: Response) => {
    const { locationId } = req.query;
    const locId = (locationId as string) || 'loc-metro-central';
    const locSlots = slots.filter(s => s.locationId === locId);

    // Group by Zone and Floor
    const zoneDataMap: { [key: string]: { total: number; occupied: number; floor: string; zone: string } } = {};

    locSlots.forEach(s => {
      const key = `${s.floor}_${s.zone}`;
      if (!zoneDataMap[key]) {
        zoneDataMap[key] = { total: 0, occupied: 0, floor: s.floor, zone: s.zone };
      }
      zoneDataMap[key].total++;
      if (s.status === 'occupied' || s.status === 'reserved') {
        zoneDataMap[key].occupied++;
      }
    });

    const heatmapZones: ZoneHeatmapData[] = Object.keys(zoneDataMap).map(k => {
      const item = zoneDataMap[k];
      const pct = Math.round((item.occupied / item.total) * 100);
      let level: 'low' | 'moderate' | 'high' | 'surge' = 'low';
      let color = '#22C55E'; // Green: Low (<40%)

      if (pct >= 85) {
        level = 'surge'; // Red: Critical
        color = '#EF4444';
      } else if (pct >= 70) {
        level = 'high'; // Orange: High
        color = '#F97316';
      } else if (pct >= 40) {
        level = 'moderate'; // Yellow: Medium
        color = '#EAB308';
      }

      return {
        zone: item.zone,
        floor: item.floor,
        occupancyPercentage: pct,
        totalSlots: item.total,
        occupiedSlots: item.occupied,
        availableSlots: item.total - item.occupied,
        demandLevel: level,
        intensityColor: color,
        averageTurnoverHours: 2.8,
      };
    });

    // 24 Hour occupancy trend
    const hourlyTrend = [
      { hour: '06:00', occupancy: 25 },
      { hour: '08:00', occupancy: 78 },
      { hour: '10:00', occupancy: 88 },
      { hour: '12:00', occupancy: 94 },
      { hour: '14:00', occupancy: 86 },
      { hour: '16:00', occupancy: 82 },
      { hour: '18:00', occupancy: 79 },
      { hour: '20:00', occupancy: 52 },
      { hour: '22:00', occupancy: 32 },
    ];

    // Weekly day-by-day distribution
    const dailyTrend = [
      { day: 'Mon', occupancy: 82, revenue: 1450 },
      { day: 'Tue', occupancy: 86, revenue: 1580 },
      { day: 'Wed', occupancy: 89, revenue: 1690 },
      { day: 'Thu', occupancy: 91, revenue: 1780 },
      { day: 'Fri', occupancy: 95, revenue: 1980 },
      { day: 'Sat', occupancy: 76, revenue: 1320 },
      { day: 'Sun', occupancy: 58, revenue: 980 },
    ];

    const response: HeatmapResponse = {
      zones: heatmapZones,
      hourlyTrend,
      dailyTrend,
    };

    res.json(response);
  });

  // --- FEATURE 4: Smart AI Assistant (Gemini + Intent Parser) ---
  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    const { query, userId } = req.body;
    if (!query) return res.status(400).json({ error: 'Query prompt is required' });

    const q = query.toLowerCase();
    const enriched = getEnrichedLocations();

    let structuredRecommendationLocation: ParkingLocation | null = null;
    let structuredRecommendationSlots: ParkingSlot[] = [];
    let assistantReply = '';

    // Smart Intent Recognition
    if (q.includes('cheap') || q.includes('lowest price') || q.includes('affordable') || q.includes('budget')) {
      const sortedByPrice = [...enriched].sort((a, b) => a.baseHourlyRate - b.baseHourlyRate);
      structuredRecommendationLocation = sortedByPrice[0];
      assistantReply = `The most affordable parking facility is **${sortedByPrice[0].name}** at just **$${sortedByPrice[0].baseHourlyRate.toFixed(2)}/hr** (${sortedByPrice[0].distanceKm} km away). It currently has **${sortedByPrice[0].availableSlots} bays available**.`;
      structuredRecommendationSlots = slots.filter(s => s.locationId === sortedByPrice[0].id && s.status === 'available').slice(0, 3);
    } else if (q.includes('ev') || q.includes('charge') || q.includes('tesla') || q.includes('electric')) {
      const evLocs = enriched.filter(l => l.hasEvCharging);
      const bestEv = evLocs.sort((a, b) => (b.evAvailableCount || 0) - (a.evAvailableCount || 0))[0] || enriched[0];
      structuredRecommendationLocation = bestEv;
      assistantReply = `Recommended for EV drivers: **${bestEv.name}** offers **${bestEv.evAvailableCount} high-speed charging bays available right now** supporting ${bestEv.evConnectorTypes?.join(', ') || 'CCS 2 & Tesla NACS'} at $${bestEv.evChargingPricePerKwh || 0.35}/kWh.`;
      structuredRecommendationSlots = slots.filter(s => s.locationId === bestEv.id && s.hasEvCharger && s.status === 'available').slice(0, 3);
    } else if (q.includes('available') || q.includes('empty') || q.includes('free space') || q.includes('highest')) {
      const sortedByAvail = [...enriched].sort((a, b) => b.availableSlots - a.availableSlots);
      structuredRecommendationLocation = sortedByAvail[0];
      assistantReply = `Highest real-time capacity is at **${sortedByAvail[0].name}** with **${sortedByAvail[0].availableSlots} open parking bays** (${sortedByAvail[0].operatingHours}).`;
      structuredRecommendationSlots = slots.filter(s => s.locationId === sortedByAvail[0].id && s.status === 'available').slice(0, 3);
    } else if (q.includes('closest') || q.includes('nearest') || q.includes('distance')) {
      const sortedByDist = [...enriched].sort((a, b) => a.distanceKm - b.distanceKm);
      structuredRecommendationLocation = sortedByDist[0];
      assistantReply = `Closest parking to your current GPS coordinates is **${sortedByDist[0].name}**, just **${sortedByDist[0].distanceKm} km away** with **${sortedByDist[0].availableSlots} available bays**.`;
      structuredRecommendationSlots = slots.filter(s => s.locationId === sortedByDist[0].id && s.status === 'available').slice(0, 3);
    }

    // If Gemini client is active, generate rich natural conversational response
    if (aiClient) {
      try {
        const liveSnapshot = enriched.map(l => 
          `- ${l.name}: $${l.baseHourlyRate}/hr, ${l.availableSlots} free bays, ${l.distanceKm}km away, EV: ${l.hasEvCharging ? `Yes (${l.evAvailableCount} charging ports, connectors: ${l.evConnectorTypes?.join(', ')})` : 'No'}, Rating: ${l.rating}★`
        ).join('\n');

        const prompt = `You are SMART PARK AI, the intelligent virtual parking concierge.
Answer this user question crisply in 2-3 friendly, actionable sentences: "${query}".

Real-time Database Snapshot:
${liveSnapshot}

Provide specific parking advice mentioning facility names and prices directly from the snapshot.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response.text) {
          assistantReply = response.text.trim();
        }
      } catch (err) {
        console.warn('Gemini inference fallback used:', err);
      }
    }

    if (!assistantReply) {
      const topLoc = enriched[0];
      structuredRecommendationLocation = topLoc;
      assistantReply = `I found **${topLoc.name}** (${topLoc.distanceKm} km away) with **${topLoc.availableSlots} available spaces** and rates starting at **$${topLoc.baseHourlyRate.toFixed(2)}/hr**.`;
      structuredRecommendationSlots = slots.filter(s => s.locationId === topLoc.id && s.status === 'available').slice(0, 3);
    }

    res.json({
      reply: assistantReply,
      recommendedLocation: structuredRecommendationLocation,
      recommendedSlots: structuredRecommendationSlots,
      timestamp: new Date().toISOString(),
    });
  });

  // --- FEATURE 8: Admin Analytics with CSV Export & Period Filters ---
  app.get('/api/analytics/summary', (req: Request, res: Response) => {
    const { period } = req.query; // daily | weekly | monthly
    const totalSlots = slots.length;
    const occupied = slots.filter(s => s.status === 'occupied').length;
    const reserved = slots.filter(s => s.status === 'reserved').length;
    const available = slots.filter(s => s.status === 'available').length;
    const occupancyRate = Math.round(((occupied + reserved) / totalSlots) * 100);

    let periodMultiplier = 1;
    let periodLabel = 'Today';
    if (period === 'weekly') {
      periodMultiplier = 6.8;
      periodLabel = 'This Week';
    } else if (period === 'monthly') {
      periodMultiplier = 29.4;
      periodLabel = 'This Month';
    }

    const baseRevenue = reservations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + r.totalAmount, 0);

    const totalRev = Number((baseRevenue * periodMultiplier).toFixed(2));
    const totalBookings = Math.round(reservations.length * periodMultiplier);
    const activeUsers = Math.round(users.length * (period === 'monthly' ? 4.2 : period === 'weekly' ? 2.5 : 1));

    res.json({
      period: period || 'daily',
      periodLabel,
      stats: {
        total: totalSlots,
        available,
        occupied,
        reserved,
        maintenance: slots.filter(s => s.status === 'maintenance').length,
        occupancyRatePercentage: occupancyRate,
        revenueToday: totalRev,
        activeBookingsCount: totalBookings,
        activeUsersCount: activeUsers,
      }
    });
  });

  // CSV Report Generator
  app.get('/api/analytics/export/csv', (req: Request, res: Response) => {
    const { type } = req.query; // 'bookings' | 'revenue' | 'occupancy'

    if (type === 'bookings') {
      let csv = 'Booking Reference,Driver Name,Driver Email,Vehicle Plate,Location ID,Floor,Bay Number,Start Time,End Time,Duration Hours,Total Paid,Status,Entry Timestamp,Exit Timestamp\n';
      reservations.forEach(r => {
        csv += `"${r.bookingReference}","${r.userName}","${r.userEmail}","${r.vehicle.licensePlate}","${r.locationId}","${r.floor}","${r.slotNumber}","${r.startTime}","${r.endTime}",${r.durationHours},${r.totalAmount},"${r.status}","${r.checkInTime || ''}","${r.checkOutTime || ''}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="smartpark_bookings_report.csv"');
      return res.send(csv);
    }

    if (type === 'occupancy') {
      let csv = 'Bay ID,Location ID,Floor,Zone,Bay Number,Type,Status,Base Rate,Dynamic Rate,EV Charger,Sensor ID,Battery %,Raw Distance (cm)\n';
      slots.forEach(s => {
        csv += `"${s.id}","${s.locationId}","${s.floor}","${s.zone}","${s.slotNumber}","${s.type}","${s.status}",${s.baseHourlyRate},${s.currentDynamicRate},${s.hasEvCharger},"${s.iotSensor.sensorId}",${s.iotSensor.batteryLevel},${s.iotSensor.rawDistanceCm}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="smartpark_occupancy_report.csv"');
      return res.send(csv);
    }

    // Revenue CSV
    let csv = 'Date,Facility Name,Gross Revenue,Paid Bookings,EV Charging Fees,Average Duration (hrs),Occupancy Rate %\n';
    locations.forEach(loc => {
      csv += `"${new Date().toISOString().split('T')[0]}","${loc.name}",${(loc.baseHourlyRate * 34).toFixed(2)},18,45.00,3.2,82%\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="smartpark_revenue_report.csv"');
    return res.send(csv);
  });

  // --- API: IoT Sensor Telemetry & Simulation Events ---
  app.get('/api/iot/sensors', (req: Request, res: Response) => {
    const sensorList = slots.map(s => ({
      slotId: s.id,
      slotNumber: s.slotNumber,
      floor: s.floor,
      zone: s.zone,
      slotStatus: s.status,
      ...s.iotSensor,
    }));
    res.json(sensorList);
  });

  app.post('/api/iot/simulate-event', (req: Request, res: Response) => {
    const { slotId, eventType } = req.body;
    
    if (eventType === 'randomize') {
      let flippedCount = 0;
      slots.forEach(slot => {
        if (Math.random() < 0.15) {
          flippedCount++;
          if (slot.status === 'available') {
            slot.status = 'occupied';
            slot.occupiedVehicle = {
              licensePlate: `SIM-${Math.floor(100 + Math.random() * 899)}`,
              model: 'Simulated Visitor Car',
              color: '#3B82F6',
              type: slot.type === 'ev' ? 'ev' : 'sedan',
              parkedAt: new Date().toISOString(),
            };
            slot.iotSensor.rawDistanceCm = 42;
            slot.iotSensor.detectionConfidence = 99.6;
          } else if (slot.status === 'occupied') {
            slot.status = 'available';
            slot.occupiedVehicle = undefined;
            slot.iotSensor.rawDistanceCm = 238;
            slot.iotSensor.detectionConfidence = 98.9;
          }
          slot.iotSensor.lastHeartbeat = new Date().toISOString();
        }
      });
      return res.json({ success: true, message: `Randomized ${flippedCount} IoT slots in real-time.` });
    }

    const slot = slots.find(s => s.id === slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    if (eventType === 'car_parked') {
      slot.status = 'occupied';
      slot.occupiedVehicle = {
        licensePlate: req.body.licensePlate || `IOT-${Math.floor(100 + Math.random() * 899)}`,
        model: req.body.model || 'Demonstration Vehicle',
        color: req.body.color || '#2563EB',
        type: (req.body.vehicleType as any) || 'sedan',
        parkedAt: new Date().toISOString(),
      };
      slot.iotSensor.rawDistanceCm = 38;
      slot.iotSensor.detectionConfidence = 99.7;
      slot.iotSensor.lastHeartbeat = new Date().toISOString();
    } else if (eventType === 'car_departed') {
      slot.status = 'available';
      slot.occupiedVehicle = undefined;
      slot.iotSensor.rawDistanceCm = 245;
      slot.iotSensor.detectionConfidence = 99.1;
      slot.iotSensor.lastHeartbeat = new Date().toISOString();
    }

    res.json({ success: true, slot });
  });

  // --- API: Analytics (Facility-Specific & Combined 4-Facility Overview) ---
  app.get('/api/analytics', (req: Request, res: Response) => {
    const { locationId } = req.query;
    const isAll = !locationId || locationId === 'all';
    
    const targetSlots = isAll ? slots : slots.filter(s => s.locationId === locationId);
    const targetReservations = isAll ? reservations : reservations.filter(r => r.locationId === locationId);

    const total = targetSlots.length;
    const occupied = targetSlots.filter(s => s.status === 'occupied').length;
    const reserved = targetSlots.filter(s => s.status === 'reserved').length;
    const available = targetSlots.filter(s => s.status === 'available').length;
    const maintenance = targetSlots.filter(s => s.status === 'maintenance').length;
    const occupancyRate = total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0;

    const totalRevenue = targetReservations
      .filter(r => r.paymentStatus === 'paid' || r.paymentStatus === 'settled')
      .reduce((sum, r) => sum + (r.finalCharge || r.totalAmount), 0);

    const activeVehicles = occupied;
    const onlineSensors = targetSlots.filter(s => s.iotSensor && s.iotSensor.batteryLevel > 10).length;

    // Combined facility breakdown for all 4 facilities
    const facilityBreakdown = locations.map(loc => {
      const locSlots = slots.filter(s => s.locationId === loc.id);
      const locRes = reservations.filter(r => r.locationId === loc.id);
      const locOccupied = locSlots.filter(s => s.status === 'occupied').length;
      const locReserved = locSlots.filter(s => s.status === 'reserved').length;
      const locAvailable = locSlots.filter(s => s.status === 'available').length;
      const locTotal = locSlots.length;
      const locRate = locTotal > 0 ? Math.round(((locOccupied + locReserved) / locTotal) * 100) : 0;
      const locRev = locRes
        .filter(r => r.paymentStatus === 'paid' || r.paymentStatus === 'settled')
        .reduce((sum, r) => sum + (r.finalCharge || r.totalAmount), 0);

      return {
        id: loc.id,
        name: loc.name,
        totalSlots: locTotal,
        availableSlots: locAvailable,
        occupiedSlots: locOccupied,
        reservedSlots: locReserved,
        occupancyRate: locRate,
        revenue: Number(locRev.toFixed(2)),
        activeBookingsCount: locRes.filter(r => r.status === 'active' || r.status === 'upcoming').length,
        activeVehicles: locOccupied,
        onlineSensors: locSlots.length,
      };
    });

    const hourlyOccupancy = [
      { hour: '00:00', rate: Math.max(10, occupancyRate - 45), revenue: Math.round(totalRevenue * 0.03) },
      { hour: '04:00', rate: Math.max(8, occupancyRate - 52), revenue: Math.round(totalRevenue * 0.02) },
      { hour: '08:00', rate: Math.min(95, occupancyRate + 12), revenue: Math.round(totalRevenue * 0.16) },
      { hour: '12:00', rate: Math.min(98, occupancyRate + 18), revenue: Math.round(totalRevenue * 0.28) },
      { hour: '16:00', rate: Math.min(96, occupancyRate + 14), revenue: Math.round(totalRevenue * 0.24) },
      { hour: '20:00', rate: Math.max(20, occupancyRate - 15), revenue: Math.round(totalRevenue * 0.18) },
      { hour: '23:00', rate: Math.max(12, occupancyRate - 38), revenue: Math.round(totalRevenue * 0.09) },
    ];

    const zonesList = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
    const zoneDistribution = zonesList.map(zName => {
      const zSlots = targetSlots.filter(s => s.zone === zName);
      const zOcc = zSlots.filter(s => s.status === 'occupied' || s.status === 'reserved').length;
      const zTotal = zSlots.length;
      const zRate = zTotal > 0 ? Math.round((zOcc / zTotal) * 100) : 0;
      const zLabel = zName === 'Zone A' ? 'EV Superchargers' : zName === 'Zone B' ? 'SUV & Standard' : zName === 'Zone C' ? 'Compact' : 'VIP & Long-Stay';
      return {
        zone: `${zName} (${zLabel})`,
        occupancy: zRate,
        total: zTotal,
        revenue: Math.round(zOcc * (isAll ? 65 : 45)),
      };
    });

    res.json({
      stats: {
        total,
        available,
        occupied,
        reserved,
        maintenance,
        occupancyRatePercentage: occupancyRate,
        revenueToday: Number(totalRevenue.toFixed(2)),
        activeBookingsCount: targetReservations.filter(r => r.status === 'active' || r.status === 'upcoming').length,
        activeUsersCount: users.length,
        activeVehicles,
        onlineSensors,
      },
      facilityBreakdown,
      hourlyOccupancy,
      zoneDistribution,
      selectedFacility: isAll ? 'all' : locationId,
    });
  });

  // --- API: AI Demand Forecast ---
  app.post('/api/ai/demand-forecast', async (req: Request, res: Response) => {
    const { locationId, targetHour } = req.body;
    const hour = typeof targetHour === 'number' ? targetHour : new Date().getHours();
    
    let basePred = 45;
    if (hour >= 8 && hour <= 10) basePred = 82;
    else if (hour >= 11 && hour <= 14) basePred = 91;
    else if (hour >= 17 && hour <= 19) basePred = 85;
    else if (hour >= 20 && hour <= 23) basePred = 52;
    else if (hour >= 0 && hour <= 5) basePred = 18;

    const noise = Math.floor(Math.sin(hour) * 6);
    const predictedPercentage = Math.min(98, Math.max(15, basePred + noise));

    let dynamicMultiplier = 1.0;
    let demandLevel: 'low' | 'moderate' | 'high' | 'surge' = 'moderate';

    if (predictedPercentage < 40) {
      dynamicMultiplier = 0.85;
      demandLevel = 'low';
    } else if (predictedPercentage < 75) {
      dynamicMultiplier = 1.0;
      demandLevel = 'moderate';
    } else if (predictedPercentage < 90) {
      dynamicMultiplier = 1.25;
      demandLevel = 'high';
    } else {
      dynamicMultiplier = 1.45;
      demandLevel = 'surge';
    }

    const next24Hours: DemandPrediction[] = [];
    const now = new Date();
    for (let h = 0; h < 24; h++) {
      const futureHour = (now.getHours() + h) % 24;
      let p = 40;
      if (futureHour >= 8 && futureHour <= 10) p = 80 + Math.floor(Math.random() * 10);
      else if (futureHour >= 11 && futureHour <= 14) p = 88 + Math.floor(Math.random() * 8);
      else if (futureHour >= 17 && futureHour <= 19) p = 82 + Math.floor(Math.random() * 9);
      else if (futureHour >= 21 || futureHour <= 5) p = 15 + Math.floor(Math.random() * 15);
      else p = 55 + Math.floor(Math.random() * 15);

      let mult = p > 85 ? 1.35 : p > 70 ? 1.15 : p < 35 ? 0.85 : 1.0;
      let level: 'low' | 'moderate' | 'high' | 'surge' = p > 85 ? 'surge' : p > 70 ? 'high' : p < 35 ? 'low' : 'moderate';

      next24Hours.push({
        timestamp: new Date(now.getTime() + h * 3600000).toISOString(),
        hour: futureHour,
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()],
        predictedOccupancyPercentage: p,
        recommendedDynamicRateMultiplier: mult,
        demandLevel: level,
        factors: [
          futureHour >= 11 && futureHour <= 14 ? 'Downtown Business Lunch Rush' : 'Standard Flow',
          p > 80 ? 'Heavy Inbound Traffic' : 'Optimal Capacity Flow'
        ]
      });
    }

    let aiInsightText = `Forecast indicates ${demandLevel.toUpperCase()} demand (${predictedPercentage}% expected occupancy) around ${hour}:00. Recommended dynamic rate multiplier is ${dynamicMultiplier}x.`;

    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Analyze this parking demand state:
- Hour: ${hour}:00
- Occupancy: ${predictedPercentage}%
- Dynamic Multiplier: ${dynamicMultiplier}x
- Demand: ${demandLevel}
Provide 2 crisp sentences of tactical advice for the facility manager and 1 sentence for drivers.`,
        });
        if (response.text) aiInsightText = response.text.trim();
      } catch (err) {
        console.warn('Gemini fallback used:', err);
      }
    }

    res.json({
      hour,
      predictedOccupancyPercentage: predictedPercentage,
      recommendedDynamicRateMultiplier: dynamicMultiplier,
      demandLevel,
      aiInsight: aiInsightText,
      hourlyForecast: next24Hours,
    });
  });

  // --- API: AI Slot Recommendation Engine ---
  app.post('/api/ai/recommend-slot', (req: Request, res: Response) => {
    const { locationId, floor, vehicleType, requiresEv } = req.body;
    let candidateSlots = slots.filter(s => 
      s.locationId === (locationId || 'loc-metro-central') &&
      s.status === 'available'
    );

    if (candidateSlots.length === 0) {
      return res.json({ recommendations: [], message: 'No available slots currently match.' });
    }

    const scored = candidateSlots.map(slot => {
      let score = 100;
      const reasons: string[] = [];

      const distPenalty = Math.min(30, (slot.distanceToElevatorMeters / 100) * 30);
      score -= distPenalty;
      reasons.push(`${slot.distanceToElevatorMeters}m to elevator (${slot.walkingTimeSeconds}s walk)`);

      if (requiresEv) {
        if (slot.hasEvCharger) {
          score += 25;
          reasons.push(`High-speed ${slot.evChargerPowerKw || 150}kW (${slot.evConnectorType || 'CCS 2'}) Terminal`);
        } else {
          score -= 40;
        }
      }

      if (vehicleType === 'suv' || vehicleType === 'van') {
        if (slot.dimensions.widthM >= 2.8 || slot.type === 'suv') {
          score += 15;
          reasons.push('Extra-wide bay for easy door clearance');
        } else if (slot.type === 'compact') {
          score -= 35;
        }
      } else if (vehicleType === 'compact' || vehicleType === 'hatchback') {
        if (slot.type === 'compact') {
          score += 10;
          reasons.push('Dedicated compact bay with discounted rate');
        }
      }

      if (floor && slot.floor === floor) {
        score += 10;
        reasons.push(`Direct match for requested ${floor}`);
      }

      return {
        slot,
        matchScore: Math.max(10, Math.min(100, Math.round(score))),
        reasons,
        badge: score > 90 ? 'Best Overall Match' : slot.distanceToElevatorMeters <= 20 ? 'Closest to Elevator' : 'Best Value',
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ recommendations: scored.slice(0, 3) });
  });

  // --- Vite / Static Middleware Integration ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SMART PARK Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
