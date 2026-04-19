import { getAirportTimezone } from '../data/airportTimezones';
import type { FlightStatus } from '../types';

/**
 * Convert a date + HH:MM time in a specific IANA timezone to UTC milliseconds.
 * If no timezone is provided, falls back to the browser's local timezone.
 */
export function toUtcMs(date: string, time: string, timezone?: string): number {
  const naive = `${date}T${time}:00`;

  if (!timezone) {
    return new Date(naive).getTime();
  }

  const asUtcMs = new Date(naive + 'Z').getTime();
  const ref = new Date(asUtcMs);
  const utcStr = ref.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr = ref.toLocaleString('en-US', { timeZone: timezone });
  const offsetMs = new Date(tzStr).getTime() - new Date(utcStr).getTime();
  return asUtcMs - offsetMs;
}

/**
 * Compute flight duration in minutes, accounting for departure and arrival
 * being in different timezones. E.g. depart 08:00 EST, arrive 09:00 CST = 2h not 1h.
 */
export function computeDuration(
  date: string,
  depTime: string,
  arrTime: string,
  origin: string,
  destination: string,
): number {
  if (!depTime || !arrTime) return 180;

  const depTz = getAirportTimezone(origin);
  const arrTz = getAirportTimezone(destination);

  const depUtc = toUtcMs(date, depTime, depTz);
  let arrUtc = toUtcMs(date, arrTime, arrTz);

  // Handle overnight flights (arrival UTC is before departure UTC)
  if (arrUtc <= depUtc) {
    arrUtc += 24 * 60 * 60000;
  }

  return Math.round((arrUtc - depUtc) / 60000);
}

/**
 * Compute current status and elapsed time for a flight based on
 * its departure time, duration, and departure timezone.
 */
export function computeFlightProgress(
  date: string,
  depTime: string,
  duration: number,
  origin: string,
  departureTimezone?: string,
): { status: FlightStatus; elapsed: number; departureTimezone?: string } {
  const depTz = departureTimezone || getAirportTimezone(origin);
  const now = Date.now();

  if (!depTime) {
    return { status: 'scheduled', elapsed: 0, departureTimezone: depTz };
  }

  const depUtc = toUtcMs(date, depTime, depTz);
  const arrUtc = depUtc + duration * 60000;

  if (now < depUtc) {
    return { status: 'scheduled', elapsed: 0, departureTimezone: depTz };
  }
  if (now >= arrUtc) {
    return { status: 'landed', elapsed: duration, departureTimezone: depTz };
  }

  const elapsed = Math.round((now - depUtc) / 60000);
  return { status: 'in_air', elapsed: Math.min(elapsed, duration), departureTimezone: depTz };
}
