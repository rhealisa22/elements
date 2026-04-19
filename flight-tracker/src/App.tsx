import { useState, useEffect } from 'react';
import { useFlightStore } from './store/flightStore';
import { FlightCard } from './components/FlightCard';
import { FlightInput } from './components/FlightInput';
import { ImportModal } from './components/ImportModal';
import { Settings } from './components/Settings';
import './styles/pixels.css';
import './App.css';

function App() {
  const { flights, tickFlights } = useFlightStore();
  const [showInput, setShowInput] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Tick flight elapsed/status every 30 seconds
  useEffect(() => {
    tickFlights();
    const interval = setInterval(tickFlights, 30_000);
    return () => clearInterval(interval);
  }, [tickFlights]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header pixel-border">
        <div className="header-content">
          <div className="header-logo">
            <span className="logo-plane">✈</span>
            <h1 className="logo-text">PIXELFLIGHT</h1>
          </div>
          <div className="header-right">
            <span className="flight-count">{flights.length}/8 FLIGHTS</span>
            <button
              className="pixel-btn settings-btn"
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
              title="Settings"
              style={{ fontSize: '7px', padding: '8px 10px' }}
            >
              ⚙
            </button>
            <button
              className="pixel-btn import-btn"
              onClick={() => setShowImport(true)}
              disabled={flights.length >= 8}
              aria-label="Import flights from email or screenshot"
            >
              IMPORT
            </button>
            <button
              className="pixel-btn primary add-btn"
              onClick={() => setShowInput(true)}
              disabled={flights.length >= 8}
              aria-label="Add a flight to track"
            >
              + ADD FLIGHT
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        {flights.length === 0 ? (
          <div className="empty-state">
            <div className="empty-plane-art">
              <div className="empty-runway" />
              <div className="empty-plane">✈</div>
            </div>
            <p className="empty-title">NO FLIGHTS TRACKED</p>
            <p className="empty-subtitle">Add a flight to watch it come alive</p>
            <button
              className="pixel-btn primary"
              onClick={() => setShowInput(true)}
            >
              + ADD YOUR FIRST FLIGHT
            </button>
          </div>
        ) : (
          <div className="flight-grid">
            {flights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>
        )}
      </main>

      {/* Input modal */}
      {showInput && <FlightInput onClose={() => setShowInput(false)} />}

      {/* Import modal */}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      {/* Settings modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
