import { useState } from 'react';
import type { Flight } from '../types';
import { useFlightStore } from '../store/flightStore';
import { PixelSky } from './PixelSky';
import { PixelRunway } from './PixelRunway';
import { PixelPlane } from './PixelPlane';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import './FlightCard.css';

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function parseHour(time: string): number | null {
  if (!time) return null;
  const parts = time.split(':');
  if (parts.length < 2) return null;
  return parseInt(parts[0], 10);
}

function isNightTime(flight: Flight): boolean {
  const depHour = parseHour(flight.scheduledDeparture);
  const arrHour = parseHour(flight.scheduledArrival);

  if (flight.status === 'landed' || flight.animationState === 'LANDED' || flight.animationState === 'LANDING') {
    // At landing: use arrival time
    if (arrHour !== null) return arrHour < 6 || arrHour >= 20;
  }

  if (flight.status === 'in_air' || flight.animationState === 'CRUISING' || flight.animationState === 'TAKEOFF') {
    // In flight: estimate current hour based on progress
    if (depHour !== null && arrHour !== null) {
      const progress = flight.duration > 0 ? flight.elapsed / flight.duration : 0;
      let currentHour = depHour + (arrHour - depHour + 24) % 24 * progress;
      currentHour = ((currentHour % 24) + 24) % 24;
      return currentHour < 6 || currentHour >= 20;
    }
    if (depHour !== null) return depHour < 6 || depHour >= 20;
  }

  // Scheduled/boarding/delayed: use departure time
  if (depHour !== null) return depHour < 6 || depHour >= 20;

  return false;
}

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const { removeFlight, setAnimationState, updateLabel } = useFlightStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [justLanded, setJustLanded] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(flight.label || '');

  const isNight = isNightTime(flight);

  const handleTakeoffComplete = () => {
    setAnimationState(flight.id, 'CRUISING');
  };

  const handleLandingComplete = () => {
    setAnimationState(flight.id, 'LANDED');
    setJustLanded(true);
    setTimeout(() => setJustLanded(false), 4500);
  };

  const handleRemove = () => {
    if (showConfirm) {
      removeFlight(flight.id);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div
      className={`flight-card pixel-border ${flight.status === 'landed' ? 'landed-card' : ''}`}
      role="region"
      aria-label={`Flight ${flight.flightNumber} from ${flight.origin} to ${flight.destination}`}
      aria-live="polite"
    >
      {/* Sky scene */}
      <div className="card-scene">
        <PixelSky isNight={isNight} isLanded={flight.animationState === 'LANDED'} />
        {editingLabel ? (
          <div className="scene-label pixel-border scene-label-editing">
            <input
              className="scene-label-input"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateLabel(flight.id, labelDraft.trim() || undefined);
                  setEditingLabel(false);
                } else if (e.key === 'Escape') {
                  setLabelDraft(flight.label || '');
                  setEditingLabel(false);
                }
              }}
              onBlur={() => {
                updateLabel(flight.id, labelDraft.trim() || undefined);
                setEditingLabel(false);
              }}
              autoFocus
              maxLength={24}
            />
          </div>
        ) : flight.label ? (
          <div className="scene-label pixel-border">
            {flight.label}
            <button
              className="scene-label-edit"
              onClick={() => { setLabelDraft(flight.label || ''); setEditingLabel(true); }}
              aria-label="Edit label"
            >
              ✎
            </button>
          </div>
        ) : null}
        <PixelRunway />
        <PixelPlane
          animationState={flight.animationState}
          status={flight.status}
          onTakeoffComplete={handleTakeoffComplete}
          onLandingComplete={handleLandingComplete}
        />
      </div>

      {/* Info strip */}
      <div className="card-info">
        <div className="card-info-top">
          <div className="flight-route">
            <span className="flight-number">{flight.flightNumber}</span>
            <span className="route-codes">
              {flight.origin} → {flight.destination}
            </span>
          </div>
          <div className="card-actions">
            <button
              className={`remove-btn ${showConfirm ? 'confirm' : ''}`}
              onClick={handleRemove}
              aria-label={showConfirm ? 'Confirm remove flight' : 'Remove flight'}
              title={showConfirm ? 'Click again to confirm' : 'Remove flight'}
            >
              {showConfirm ? '??' : 'x'}
            </button>
          </div>
        </div>

        <div className="flight-times">
          <div className="time-block">
            <span className="time-label">DEP · {flight.origin}</span>
            <span className="time-value">
              {flight.actualDeparture || flight.scheduledDeparture}
            </span>
          </div>
          <div className="time-block time-block-right">
            <span className="time-label">ARR · {flight.destination}</span>
            <span className="time-value">
              {flight.actualArrival || flight.scheduledArrival}
            </span>
          </div>
        </div>

        {flight.status === 'in_air' && flight.duration > 0 && (
          <div className="flight-elapsed">
            <span className="elapsed-text">
              {formatDuration(flight.elapsed)} flown · {formatDuration(Math.max(0, flight.duration - flight.elapsed))} remaining
            </span>
          </div>
        )}

        <div className="card-footer">
          <StatusBadge status={flight.status} pulse={justLanded} />
          <span className="flight-duration">{formatDuration(flight.duration)}</span>
        </div>

        {flight.status === 'in_air' && (
          <ProgressBar elapsed={flight.elapsed} total={flight.duration} />
        )}

        {justLanded && (
          <div className="landed-confirmation">
            LANDED ✓
          </div>
        )}
      </div>
    </div>
  );
}
