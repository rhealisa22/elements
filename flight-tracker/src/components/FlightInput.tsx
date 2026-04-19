import { useState } from 'react';
import { useFlightStore } from '../store/flightStore';
import './FlightInput.css';

interface FlightInputProps {
  onClose: () => void;
}

export function FlightInput({ onClose }: FlightInputProps) {
  const { addFlight, isLoading, error, flights } = useFlightStore();
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState('2026-03-07');
  const [label, setLabel] = useState('');
  const [labelError, setLabelError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber.trim() || !date) return;

    if (label.trim()) {
      const exists = flights.some(
        (f) => f.label?.toLowerCase() === label.trim().toLowerCase()
      );
      if (exists) {
        setLabelError('Label already exists!');
        return;
      }
    }

    await addFlight(flightNumber.trim(), date, label.trim() || undefined);
    if (!useFlightStore.getState().error) {
      setFlightNumber('');
      setLabel('');
      onClose();
    }
  };

  return (
    <div className="flight-input-overlay" onClick={onClose}>
      <form
        className="flight-input-panel pixel-border"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="input-header">
          <span className="input-title">+ NEW QUEST... er, FLIGHT</span>
          <button type="button" className="remove-btn" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <div className="input-fields">
          <div className="input-group">
            <label className="input-label" htmlFor="flight-number">FLIGHT NO.</label>
            <input
              id="flight-number"
              className="pixel-input"
              type="text"
              placeholder="e.g. BA 472"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="flight-date">DATE</label>
            <input
              id="flight-date"
              className="pixel-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="flight-label">LABEL (OPTIONAL)</label>
            <input
              id="flight-label"
              className="pixel-input"
              type="text"
              placeholder="e.g. Dad's flight home"
              value={label}
              onChange={(e) => { setLabel(e.target.value); setLabelError(''); }}
              autoComplete="off"
            />
          </div>
        </div>

        {(error || labelError) && <div className="input-error">{labelError || error}</div>}

        <div className="input-actions">
          <button type="submit" className="pixel-btn primary" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner">SEARCHING...</span>
            ) : (
              'TRACK FLIGHT'
            )}
          </button>
        </div>

        <div className="input-hint">
          DEMO FLIGHTS: BA472, LH401, AA1234, EK204, QF11, AF83
        </div>
      </form>
    </div>
  );
}
