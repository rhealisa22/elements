import './PixelSky.css';

interface PixelSkyProps {
  isNight?: boolean;
  isLanded?: boolean;
}

export function PixelSky({ isNight = false, isLanded = false }: PixelSkyProps) {
  return (
    <div className={`pixel-sky ${isNight ? 'night' : 'day'} ${isLanded ? 'dimmed' : ''}`}>
      {/* Stars (night only) */}
      {isNight && (
        <div className="stars-layer">
          <div className="star s1" />
          <div className="star s2" />
          <div className="star s3" />
          <div className="star s4" />
          <div className="star s5" />
          <div className="star s6" />
          <div className="star s7" />
          <div className="star s8" />
        </div>
      )}

      {/* Clouds (day only) */}
      {!isNight && (
        <div className="clouds-layer">
          <div className="pixel-cloud cloud-1" />
          <div className="pixel-cloud cloud-2" />
          <div className="pixel-cloud cloud-3" />
        </div>
      )}
    </div>
  );
}
