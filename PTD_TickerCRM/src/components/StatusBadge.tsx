import { TicketStatus } from '@/types/ticket';

interface StatusBadgeProps {
  status: TicketStatus;
}

const config: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: 'Đang mở', className: 'bg-status-open-bg text-status-open' },
  pending: { label: 'Đang chờ', className: 'bg-status-pending-bg text-status-pending' },
  closed: { label: 'Đã đóng', className: 'bg-status-closed-bg text-status-closed' },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const c = config[status];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${c.className}`}>
      Trạng thái: {c.label}
    </span>
  );
};

export default StatusBadge;
