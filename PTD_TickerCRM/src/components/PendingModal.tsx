import { useState } from 'react';
import { useTickets } from '@/context/TicketContext';

interface PendingModalProps {
  ticketId: string;
  onClose: () => void;
  onConfirm: () => void;
}

const PendingModal = ({ ticketId, onClose, onConfirm }: PendingModalProps) => {
  const [reason, setReason] = useState('');
  const { moveToPending } = useTickets();

  const handleConfirm = () => {
    if (!reason.trim()) return;
    moveToPending(ticketId, reason);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
      <div className="bg-card rounded-2xl p-8 w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-xl font-bold text-foreground mb-2">Xác nhận chuyển Đang chờ</h2>
        <p className="text-sm text-muted-foreground mb-6">Vui lòng nhập lý do cụ thể để Agent khác có thể nắm bắt</p>

        <label className="block text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
          Nội dung lý do tạm dừng *
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="w-full border-2 border-primary/30 rounded-xl p-4 text-sm min-h-[120px] outline-none focus:border-primary transition-colors resize-none"
          placeholder="Nhập lý do tạm dừng..."
        />

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-border text-muted-foreground font-medium text-sm hover:bg-muted transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-colors"
          >
            Xác nhận chuyển
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingModal;
