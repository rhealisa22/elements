import './PixelRunway.css';

export function PixelRunway() {
  return (
    <div className="pixel-runway">
      <div className="runway-surface">
        {/* Center line markings */}
        <div className="runway-marking m1" />
        <div className="runway-marking m2" />
        <div className="runway-marking m3" />
        <div className="runway-marking m4" />
        <div className="runway-marking m5" />
        <div className="runway-marking m6" />
        <div className="runway-marking m7" />
      </div>
      {/* Grass strips */}
      <div className="grass-strip top" />
      <div className="grass-strip bottom" />
      {/* Edge lights */}
      <div className="runway-lights">
        <div className="runway-light rl1" />
        <div className="runway-light rl2" />
        <div className="runway-light rl3" />
        <div className="runway-light rl4" />
        <div className="runway-light rl5" />
        <div className="runway-light rl6" />
      </div>
      {/* Windsock */}
      <div className="windsock">
        <div className="windsock-pole" />
        <div className="windsock-sock" />
      </div>
    </div>
  );
}
