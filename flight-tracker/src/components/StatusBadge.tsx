import type { FlightStatus } from '../types';
import './StatusBadge.css';

const STATUS_CONFIG: Record<FlightStatus, { label: string; className: string }> = {
  scheduled: { label: 'SCHEDULED', className: 'badge-default' },
  boarding: { label: 'BOARDING', className: 'badge-default' },
  in_air: { label: 'IN AIR', className: 'badge-blue' },
  landed: { label: 'LANDED', className: 'badge-green' },
  delayed: { label: 'DELAYED', className: 'badge-amber' },
  cancelled: { label: 'CANCELLED', className: 'badge-red' },
};

interface StatusBadgeProps {
  status: FlightStatus;
  pulse?: boolean;
}

export function StatusBadge({ status, pulse = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`status-badge ${config.className} ${pulse ? 'pulse' : ''}`} role="status">
      {config.label}
    </span>
  );
}
