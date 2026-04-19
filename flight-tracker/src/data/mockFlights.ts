import type { Flight } from '../types';
import { hasApiKey, lookupFlightApi } from '../services/flightApi';

export const MOCK_FLIGHT_DB: Record<string, Omit<Flight, 'id' | 'label' | 'animationState' | 'lastUpdated'>> = {
  'BA472': {
    flightNumber: 'BA 472',
    date: '2026-03-07',
    airline: 'British Airways',
    origin: 'LHR',
    destination: 'JFK',
    scheduledDeparture: '08:30',
    scheduledArrival: '11:45',
    actualDeparture: '08:35',
    status: 'in_air',
    duration: 495,
    elapsed: 180,
    departureTimezone: 'Europe/London',
  },
  'LH401': {
    flightNumber: 'LH 401',
    date: '2026-03-07',
    airline: 'Lufthansa',
    origin: 'FRA',
    destination: 'ORD',
    scheduledDeparture: '13:15',
    scheduledArrival: '16:30',
    status: 'scheduled',
    duration: 615,
    elapsed: 0,
    departureTimezone: 'Europe/Berlin',
  },
  'AA1234': {
    flightNumber: 'AA 1234',
    date: '2026-03-07',
    airline: 'American Airlines',
    origin: 'DFW',
    destination: 'LAX',
    scheduledDeparture: '06:00',
    scheduledArrival: '07:45',
    actualDeparture: '06:02',
    actualArrival: '07:40',
    status: 'landed',
    duration: 225,
    elapsed: 225,
    departureTimezone: 'America/Chicago',
  },
  'EK204': {
    flightNumber: 'EK 204',
    date: '2026-03-07',
    airline: 'Emirates',
    origin: 'DXB',
    destination: 'SFO',
    scheduledDeparture: '09:00',
    scheduledArrival: '13:15',
    status: 'delayed',
    duration: 975,
    elapsed: 0,
    departureTimezone: 'Asia/Dubai',
  },
  'QF11': {
    flightNumber: 'QF 11',
    date: '2026-03-07',
    airline: 'Qantas',
    origin: 'SYD',
    destination: 'LAX',
    scheduledDeparture: '16:00',
    scheduledArrival: '11:00',
    status: 'boarding',
    duration: 840,
    elapsed: 0,
    departureTimezone: 'Australia/Sydney',
  },
  'AF83': {
    flightNumber: 'AF 83',
    date: '2026-03-07',
    airline: 'Air France',
    origin: 'CDG',
    destination: 'MIA',
    scheduledDeparture: '10:30',
    scheduledArrival: '14:45',
    status: 'cancelled',
    duration: 615,
    elapsed: 0,
    departureTimezone: 'Europe/Paris',
  },
};

export async function lookupFlight(flightNumber: string, date: string): Promise<Omit<Flight, 'id' | 'label' | 'animationState' | 'lastUpdated'> | null> {
  // Try real API first if key is configured
  if (hasApiKey()) {
    try {
      const result = await lookupFlightApi(flightNumber, date);
      if (result) return result;
    } catch (err) {
      // Re-throw auth errors so the UI can show them
      if (err instanceof Error && err.message.includes('API key')) {
        throw err;
      }
      // For other errors, fall through to mock
    }
  }

  // Fall back to mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = flightNumber.replace(/\s/g, '').toUpperCase();
      resolve(MOCK_FLIGHT_DB[key] || null);
    }, 800 + Math.random() * 700);
  });
}
