import type { AnimationState, FlightStatus } from '../types';
import './PixelPlane.css';

interface PixelPlaneProps {
  animationState: AnimationState;
  status: FlightStatus;
  onTakeoffComplete?: () => void;
  onLandingComplete?: () => void;
}

export function PixelPlane({ animationState, status, onTakeoffComplete, onLandingComplete }: PixelPlaneProps) {
  const isCancelled = status === 'cancelled';

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === 'takeoff-rise' && onTakeoffComplete) {
      onTakeoffComplete();
    }
    if (e.animationName === 'landing-descend' && onLandingComplete) {
      onLandingComplete();
    }
  };

  return (
    <div
      className={`pixel-plane-wrapper ${animationState.toLowerCase()} ${isCancelled ? 'cancelled' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Shadow on tarmac */}
      <div className={`plane-shadow ${animationState.toLowerCase()}`} />

      {/* The plane sprite (CSS pixel art) */}
      <div className="pixel-plane-sprite">
        {/* Fuselage */}
        <div className="fuselage">
          <div className="fuselage-body" />
          <div className="fuselage-nose" />
          <div className="fuselage-tail" />
          <div className="cockpit-window" />
          <div className="window w1" />
          <div className="window w2" />
          <div className="window w3" />
          <div className="window w4" />
          <div className="window w5" />
        </div>
        {/* Wings */}
        <div className="wing wing-top" />
        <div className="wing wing-bottom" />
        {/* Engines */}
        <div className={`engine engine-top ${animationState === 'CRUISING' || animationState === 'TAKEOFF' ? 'fast' : ''}`} />
        <div className={`engine engine-bottom ${animationState === 'CRUISING' || animationState === 'TAKEOFF' ? 'fast' : ''}`} />
        {/* Tail fin */}
        <div className="tail-fin" />
      </div>

      {/* Takeoff/landing dust */}
      {animationState === 'LANDING' && <div className="dust-puff" />}
    </div>
  );
}
