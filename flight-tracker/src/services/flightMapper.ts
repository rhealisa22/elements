import type { ParsedFlight, Flight } from '../types';
import { computeDuration, computeFlightProgress } from './timeUtils';

export function mapParsedFlight(parsed: ParsedFlight): Omit<Flight, 'id' | 'label' | 'animationState' | 'lastUpdated'> {
  const duration = computeDuration(
    parsed.date,
    parsed.departureTime,
    parsed.arrivalTime,
    parsed.origin,
    parsed.destination,
  );
  const { status, elapsed, departureTimezone } = computeFlightProgress(
    parsed.date,
    parsed.departureTime,
    duration,
    parsed.origin,
  );

  return {
    flightNumber: parsed.flightNumber,
    date: parsed.date,
    airline: parsed.airline,
    origin: parsed.origin,
    destination: parsed.destination,
    scheduledDeparture: parsed.departureTime,
    scheduledArrival: parsed.arrivalTime,
    status,
    duration,
    elapsed,
    departureTimezone,
  };
}
