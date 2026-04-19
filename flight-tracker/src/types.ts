export type FlightStatus =
  | 'scheduled'
  | 'boarding'
  | 'in_air'
  | 'landed'
  | 'delayed'
  | 'cancelled';

export type AnimationState = 'IDLE' | 'TAKEOFF' | 'CRUISING' | 'LANDING' | 'LANDED';

export interface Flight {
  id: string;
  flightNumber: string;
  date: string;
  label?: string;
  airline: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
  status: FlightStatus;
  animationState: AnimationState;
  lastUpdated: number;
  duration: number; // minutes
  elapsed: number; // minutes
  departureTimezone?: string; // IANA timezone e.g. "America/New_York"
}

export interface ParsedFlight {
  flightNumber: string;
  date: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  confidence: 'high' | 'medium';
  source: 'email' | 'screenshot';
  dateDetected: boolean;
}
