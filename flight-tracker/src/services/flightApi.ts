import type { Flight, FlightStatus } from '../types';
import { computeDuration, computeFlightProgress } from './timeUtils';

const API_BASE = 'http://api.aviationstack.com/v1';
const API_KEY_STORAGE = 'pixelflight_api_key';

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function setApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE, key.trim());
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

type FlightData = Omit<Flight, 'id' | 'label' | 'animationState' | 'lastUpdated'>;

function mapStatus(status: string | null): FlightStatus {
  if (!status) return 'scheduled';
  switch (status.toLowerCase()) {
    case 'active':
    case 'en-route':
      return 'in_air';
    case 'landed':
      return 'landed';
    case 'scheduled':
      return 'scheduled';
    case 'cancelled':
      return 'cancelled';
    case 'diverted':
    case 'incident':
      return 'delayed';
    default:
      return 'scheduled';
  }
}

function parseTime(datetime: string | null): string {
  if (!datetime) return '';
  // AviationStack returns times in airport local timezone: "2026-03-08T08:30:00+00:00"
  // Extract HH:MM directly from the string to preserve the airport's local time
  const match = datetime.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : '';
}

function estimateDurationFromApi(dep: string | null, arr: string | null, originIata: string, destIata: string): number {
  if (!dep || !arr) return 180;
  const depTime = parseTime(dep);
  const arrTime = parseTime(arr);
  if (!depTime || !arrTime) return 180;
  const date = dep.split('T')[0];
  return computeDuration(date, depTime, arrTime, originIata, destIata);
}

function estimateElapsed(status: FlightStatus, duration: number, date: string, depTime: string, origin: string, depTimezone?: string): number {
  if (status === 'landed') return duration;
  if (status !== 'in_air') return 0;
  const { elapsed } = computeFlightProgress(date, depTime, duration, origin, depTimezone);
  return elapsed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseApiResponse(data: any): FlightData | null {
  if (!data || !data.data || data.data.length === 0) return null;

  // AviationStack returns an array, take the first matching flight
  const f = data.data[0];
  const departure = f.departure || {};
  const arrival = f.arrival || {};
  const airline = f.airline || {};
  const flightInfo = f.flight || {};

  const status = mapStatus(f.flight_status);
  const scheduledDep = departure.scheduled || null;
  const scheduledArr = arrival.scheduled || null;
  const actualDep = departure.actual || null;
  const actualArr = arrival.actual || null;
  const duration = estimateDurationFromApi(scheduledDep, scheduledArr, departure.iata || '', arrival.iata || '');
  const depTimezone: string | undefined = departure.timezone || undefined;

  return {
    flightNumber: flightInfo.iata ? flightInfo.iata.replace(/(\D+)(\d+)/, '$1 $2') : '',
    date: scheduledDep ? scheduledDep.split('T')[0] : new Date().toISOString().split('T')[0],
    airline: airline.name || '',
    origin: departure.iata || '',
    destination: arrival.iata || '',
    scheduledDeparture: parseTime(scheduledDep),
    scheduledArrival: parseTime(scheduledArr),
    actualDeparture: actualDep ? parseTime(actualDep) : undefined,
    actualArrival: actualArr ? parseTime(actualArr) : undefined,
    status,
    duration,
    elapsed: estimateElapsed(status, duration, scheduledDep ? scheduledDep.split('T')[0] : new Date().toISOString().split('T')[0], parseTime(actualDep || scheduledDep), departure.iata || '', depTimezone),
    departureTimezone: depTimezone,
  };
}

export async function lookupFlightApi(flightNumber: string, _date: string): Promise<FlightData | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const code = flightNumber.replace(/\s/g, '').toUpperCase();

  // Detect if airline prefix is 2-letter (IATA) or 3-letter (ICAO)
  const airlineMatch = code.match(/^([A-Z]{2,3})(\d+)$/);
  const isIcao = airlineMatch && airlineMatch[1].length === 3;

  // Try IATA lookup first
  const iataParam = isIcao ? 'flight_icao' : 'flight_iata';
  const result = await callApi(`${API_BASE}/flights?access_key=${encodeURIComponent(apiKey)}&${iataParam}=${encodeURIComponent(code)}`);
  if (result) return result;

  // If ICAO didn't work, also try as IATA just in case
  if (isIcao) {
    const iataResult = await callApi(`${API_BASE}/flights?access_key=${encodeURIComponent(apiKey)}&flight_iata=${encodeURIComponent(code)}`);
    if (iataResult) return iataResult;
  }

  return null;
}

async function callApi(url: string): Promise<FlightData | null> {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error('[FlightAPI] Network error:', err);
    throw new Error('Network error calling AviationStack. Check browser console.');
  }

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('Invalid API key. Check your AviationStack key in settings.');
    }
    throw new Error(`API error (${res.status})`);
  }

  if (data.error) {
    // flightsFuture might not be available on free tier — don't throw, just return null
    if (data.error.code === 105) return null;
    throw new Error(data.error.info || `API error (code ${data.error.code})`);
  }

  return parseApiResponse(data);
}
