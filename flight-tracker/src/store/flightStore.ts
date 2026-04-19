import { create } from 'zustand';
import type { Flight, AnimationState, FlightStatus } from '../types';
import { lookupFlight } from '../data/mockFlights';
import { hasApiKey } from '../services/flightApi';
import { computeFlightProgress } from '../services/timeUtils';

const MAX_FLIGHTS = 8;
const STORAGE_KEY = 'pixelflight_flights';

function statusToAnimationState(status: FlightStatus): AnimationState {
  switch (status) {
    case 'scheduled':
    case 'boarding':
    case 'delayed':
      return 'IDLE';
    case 'in_air':
      return 'CRUISING';
    case 'landed':
      return 'LANDED';
    case 'cancelled':
      return 'IDLE';
  }
}

function loadFlights(): Flight[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFlights(flights: Flight[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flights));
}

interface FlightStore {
  flights: Flight[];
  isLoading: boolean;
  error: string | null;

  addFlight: (flightNumber: string, date: string, label?: string) => Promise<void>;
  addFlightDirect: (flightData: Omit<Flight, 'id' | 'label' | 'animationState' | 'lastUpdated'>, label?: string) => void;
  addFlightsBatch: (flightsData: Array<{ data: Omit<Flight, 'id' | 'label' | 'animationState' | 'lastUpdated'>; label?: string }>) => number;
  removeFlight: (id: string) => void;
  triggerTakeoff: (id: string) => void;
  triggerLanding: (id: string) => void;
  setAnimationState: (id: string, state: AnimationState) => void;
  updateElapsed: (id: string, elapsed: number) => void;
  updateLabel: (id: string, label: string | undefined) => void;
  tickFlights: () => void;
  cycleStatus: (id: string) => void;
}

export const useFlightStore = create<FlightStore>((set, get) => ({
  flights: loadFlights(),
  isLoading: false,
  error: null,

  addFlight: async (flightNumber: string, date: string, label?: string) => {
    const { flights } = get();
    if (flights.length >= MAX_FLIGHTS) {
      set({ error: 'Maximum 8 flights reached!' });
      return;
    }

    set({ isLoading: true, error: null });

    let data;
    try {
      data = await lookupFlight(flightNumber, date);
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Lookup failed' });
      return;
    }
    if (!data) {
      const msg = hasApiKey()
        ? 'Flight not found. AviationStack only shows flights operating today.'
        : 'Flight not found. Without an API key, only demo flights work: BA472, LH401, AA1234, EK204, QF11, AF83';
      set({ isLoading: false, error: msg });
      return;
    }

    const newFlight: Flight = {
      ...data,
      id: crypto.randomUUID(),
      label,
      animationState: statusToAnimationState(data.status),
      lastUpdated: Date.now(),
    };

    const updated = [...flights, newFlight];
    saveFlights(updated);
    set({ flights: updated, isLoading: false, error: null });
  },

  addFlightDirect: (flightData: Omit<Flight, 'id' | 'label' | 'animationState' | 'lastUpdated'>, label?: string) => {
    const { flights } = get();
    if (flights.length >= MAX_FLIGHTS) {
      set({ error: 'Maximum 8 flights reached!' });
      return;
    }

    const newFlight: Flight = {
      ...flightData,
      id: crypto.randomUUID(),
      label,
      animationState: statusToAnimationState(flightData.status),
      lastUpdated: Date.now(),
    };

    const updated = [...flights, newFlight];
    saveFlights(updated);
    set({ flights: updated, error: null });
  },

  addFlightsBatch: (flightsData) => {
    const { flights } = get();
    const slotsAvailable = MAX_FLIGHTS - flights.length;
    const toAdd = flightsData.slice(0, slotsAvailable);

    const newFlights: Flight[] = toAdd.map(({ data, label }) => ({
      ...data,
      id: crypto.randomUUID(),
      label,
      animationState: statusToAnimationState(data.status),
      lastUpdated: Date.now(),
    }));

    const updated = [...flights, ...newFlights];
    saveFlights(updated);
    set({ flights: updated, error: null });
    return newFlights.length;
  },

  removeFlight: (id: string) => {
    const updated = get().flights.filter((f) => f.id !== id);
    saveFlights(updated);
    set({ flights: updated });
  },

  triggerTakeoff: (id: string) => {
    const updated = get().flights.map((f) =>
      f.id === id ? { ...f, status: 'in_air' as FlightStatus, animationState: 'TAKEOFF' as AnimationState } : f
    );
    saveFlights(updated);
    set({ flights: updated });
  },

  triggerLanding: (id: string) => {
    const updated = get().flights.map((f) =>
      f.id === id ? { ...f, status: 'landed' as FlightStatus, animationState: 'LANDING' as AnimationState } : f
    );
    saveFlights(updated);
    set({ flights: updated });
  },

  setAnimationState: (id: string, state: AnimationState) => {
    const updated = get().flights.map((f) =>
      f.id === id ? { ...f, animationState: state } : f
    );
    saveFlights(updated);
    set({ flights: updated });
  },

  updateLabel: (id: string, label: string | undefined) => {
    const updated = get().flights.map((f) =>
      f.id === id ? { ...f, label } : f
    );
    saveFlights(updated);
    set({ flights: updated });
  },

  updateElapsed: (id: string, elapsed: number) => {
    const updated = get().flights.map((f) =>
      f.id === id ? { ...f, elapsed, lastUpdated: Date.now() } : f
    );
    saveFlights(updated);
    set({ flights: updated });
  },

  tickFlights: () => {
    const { flights } = get();
    let changed = false;
    const updated = flights.map((f) => {
      // Only tick flights that can progress
      if (f.status === 'landed' || f.status === 'cancelled') return f;
      const depTime = f.actualDeparture || f.scheduledDeparture;
      if (!depTime || !f.date) return f;

      const { status, elapsed } = computeFlightProgress(
        f.date, depTime, f.duration, f.origin, f.departureTimezone,
      );

      if (status === f.status && elapsed === f.elapsed) return f;
      changed = true;

      const newAnimState = status !== f.status ? statusToAnimationState(status) : f.animationState;
      return { ...f, status, elapsed, animationState: newAnimState, lastUpdated: Date.now() };
    });

    if (changed) {
      saveFlights(updated);
      set({ flights: updated });
    }
  },

  cycleStatus: (id: string) => {
    const flight = get().flights.find((f) => f.id === id);
    if (!flight) return;

    const sequence: FlightStatus[] = ['scheduled', 'boarding', 'in_air', 'landed'];
    const currentIdx = sequence.indexOf(flight.status);
    const nextStatus = sequence[(currentIdx + 1) % sequence.length];

    if (nextStatus === 'in_air') {
      get().triggerTakeoff(id);
    } else if (nextStatus === 'landed') {
      get().triggerLanding(id);
    } else {
      const updated = get().flights.map((f) =>
        f.id === id
          ? { ...f, status: nextStatus, animationState: statusToAnimationState(nextStatus) }
          : f
      );
      saveFlights(updated);
      set({ flights: updated });
    }
  },
}));
