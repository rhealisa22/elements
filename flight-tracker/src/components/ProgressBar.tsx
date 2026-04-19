import './ProgressBar.css';

interface ProgressBarProps {
  elapsed: number;
  total: number;
}

export function ProgressBar({ elapsed, total }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((elapsed / total) * 100));
  const segments = 10;
  const filled = Math.round((pct / 100) * segments);

  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-segments">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className={`progress-segment ${i < filled ? 'filled' : ''}`} />
        ))}
      </div>
      <span className="progress-text">{pct}%</span>
    </div>
  );
}
