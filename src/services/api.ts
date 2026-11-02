import {
  ParkingLocation,
  ParkingSlot,
  Reservation,
  OccupancyStats,
  DemandPrediction,
  LocationReview,
  HeatmapResponse,
  SmartPricingResult,
  OverstayAlert
} from '../types';

export const api = {
  async getLocations(): Promise<ParkingLocation[]> {
    const res = await fetch('/api/locations');
    if (!res.ok) throw new Error('Failed to fetch locations');
    return res.json();
  },

  async updateLocation(id: string, data: Partial<ParkingLocation>): Promise<ParkingLocation> {
    const res = await fetch(`/api/locations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update location');
    return res.json();
  },

  // Feature 2: Favorites
  async getUserFavorites(userId: string): Promise<string[]> {
    const res = await fetch(`/api/users/${userId}/favorites`);
    if (!res.ok) return [];
    return res.json();
  },

  async toggleFavorite(userId: string, locationId: string): Promise<string[]> {
    const res = await fetch(`/api/users/${userId}/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId }),
    });
    if (!res.ok) throw new Error('Failed to update favorites');
    const data = await res.json();
    return data.favorites;
  },

  // Feature 10: Feedback & Reviews
  async getLocationReviews(locationId: string): Promise<LocationReview[]> {
    const res = await fetch(`/api/locations/${locationId}/reviews`);
    if (!res.ok) return [];
    return res.json();
  },

  async addLocationReview(locationId: string, data: {
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    tags?: string[];
  }): Promise<{ review: LocationReview; averageRating: number; totalReviews: number }> {
    const res = await fetch(`/api/locations/${locationId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  async getSlots(filters?: { locationId?: string; floor?: string; zone?: string; status?: string; hasEv?: boolean }): Promise<ParkingSlot[]> {
    const params = new URLSearchParams();
    if (filters?.locationId) params.append('locationId', filters.locationId);
    if (filters?.floor) params.append('floor', filters.floor);
    if (filters?.zone) params.append('zone', filters.zone);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.hasEv) params.append('hasEv', 'true');

    const res = await fetch(`/api/slots?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch slots');
    return res.json();
  },

  async createSlot(slot: Partial<ParkingSlot>): Promise<ParkingSlot> {
    const res = await fetch('/api/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot),
    });
    if (!res.ok) throw new Error('Failed to create slot');
    return res.json();
  },

  async updateSlot(id: string, data: Partial<ParkingSlot>): Promise<ParkingSlot> {
    const res = await fetch(`/api/slots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update slot');
    return res.json();
  },

  async deleteSlot(id: string): Promise<{ success: boolean; deletedId: string }> {
    const res = await fetch(`/api/slots/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete slot');
    return res.json();
  },

  async getReservations(filters?: { userId?: string; status?: string }): Promise<Reservation[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);

    const res = await fetch(`/api/reservations?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch reservations');
    return res.json();
  },

  async createReservation(data: {
    slotId: string;
    locationId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    vehicle: { licensePlate: string; model: string; type: string };
    floor: string;
    zone: string;
    slotNumber: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    evChargingIncluded: boolean;
    paymentMethod: string;
  }): Promise<Reservation> {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.status === 409) {
      const errData = await res.json();
      const err = new Error(errData.error || 'Conflict: Slot already booked during this time');
      (err as any).conflictData = errData;
      throw err;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create reservation');
    }

    return res.json();
  },

  // Feature 3: Extend Booking Duration
  async extendReservation(id: string, additionalHours: number): Promise<{
    success: boolean;
    reservation: Reservation;
    extendedHours: number;
    additionalAmount: number;
    newEndTime: string;
  }> {
    const res = await fetch(`/api/reservations/${id}/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ additionalHours }),
    });

    if (res.status === 409) {
      const errData = await res.json();
      throw new Error(errData.error || 'Cannot extend: Slot is booked by another driver.');
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to extend reservation');
    }

    return res.json();
  },

  async cancelReservation(id: string): Promise<{ success: boolean; reservation: Reservation; refundAmount: number }> {
    const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to cancel reservation');
    }
    return res.json();
  },

  // Feature 6: Smart Pricing
  async calculateSmartPrice(params: {
    locationId: string;
    slotId?: string;
    durationHours: number;
    startTime?: string;
    includeEvCharging?: boolean;
  }): Promise<SmartPricingResult> {
    const res = await fetch('/api/pricing/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to calculate pricing');
    return res.json();
  },

  // Feature 7: QR Entry & Exit Scanner
  async scanGatePass(params: {
    query: string;
    scanType: 'entry' | 'exit';
  }): Promise<{
    valid: boolean;
    action: string;
    direction: 'entry' | 'exit';
    booking: Reservation;
    slot?: ParkingSlot;
    actualMinutes?: number;
    overstayMinutes?: number;
    overstayPenalty?: number;
    message: string;
  }> {
    const res = await fetch('/api/gate/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok && !data.valid) {
      throw new Error(data.message || 'Gate pass scan failed');
    }
    return data;
  },

  // Legacy verify pass wrapper
  async verifyPass(query: string): Promise<any> {
    return this.scanGatePass({ query, scanType: 'entry' });
  },

  // Feature 9: Overstay Alerts
  async getOverstayAlerts(): Promise<OverstayAlert[]> {
    const res = await fetch('/api/alerts/overstay');
    if (!res.ok) return [];
    return res.json();
  },

  async getExpiringSoonAlerts(userId?: string): Promise<Reservation[]> {
    const res = await fetch(`/api/alerts/expiring-soon${userId ? `?userId=${userId}` : ''}`);
    if (!res.ok) return [];
    return res.json();
  },

  // Feature 5: Demand Heatmap
  async getHeatmapData(locationId?: string): Promise<HeatmapResponse> {
    const res = await fetch(`/api/analytics/heatmap${locationId ? `?locationId=${locationId}` : ''}`);
    if (!res.ok) throw new Error('Failed to load heatmap data');
    return res.json();
  },

  // Feature 4: Smart AI Assistant
  async askAIAssistant(query: string, userId?: string): Promise<{
    reply: string;
    recommendedLocation?: ParkingLocation;
    recommendedSlots?: ParkingSlot[];
    timestamp: string;
  }> {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, userId }),
    });
    if (!res.ok) throw new Error('AI Assistant request failed');
    return res.json();
  },

  // Feature 8: Admin Analytics Summary
  async getAdminSummary(period: 'daily' | 'weekly' | 'monthly'): Promise<{
    period: string;
    periodLabel: string;
    stats: OccupancyStats;
  }> {
    const res = await fetch(`/api/analytics/summary?period=${period}`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  async getAnalytics(): Promise<{
    stats: OccupancyStats;
    hourlyOccupancy: { hour: string; rate: number; revenue: number }[];
    zoneDistribution: { zone: string; occupancy: number; total: number; revenue: number }[];
  }> {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async simulateIoTEvent(params: {
    slotId?: string;
    eventType: 'car_parked' | 'car_departed' | 'randomize';
    licensePlate?: string;
    model?: string;
    vehicleType?: string;
    color?: string;
  }): Promise<any> {
    const res = await fetch('/api/iot/simulate-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to trigger IoT simulation');
    return res.json();
  },

  async getDemandForecast(locationId: string, targetHour?: number): Promise<{
    hour: number;
    predictedOccupancyPercentage: number;
    recommendedDynamicRateMultiplier: number;
    demandLevel: 'low' | 'moderate' | 'high' | 'surge';
    aiInsight: string;
    hourlyForecast: DemandPrediction[];
  }> {
    const res = await fetch('/api/ai/demand-forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId, targetHour }),
    });
    if (!res.ok) throw new Error('Failed to fetch AI demand forecast');
    return res.json();
  },

  async getSlotRecommendations(params: {
    locationId: string;
    floor?: string;
    vehicleType?: string;
    requiresEv?: boolean;
    maxWalkingDistance?: number;
  }): Promise<{
    recommendations: {
      slot: ParkingSlot;
      matchScore: number;
      reasons: string[];
      badge: string;
    }[];
  }> {
    const res = await fetch('/api/ai/recommend-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to fetch slot recommendations');
    return res.json();
  }
};
