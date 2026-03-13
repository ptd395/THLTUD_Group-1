import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '@/context/TicketContext';
import StatusBadge from '@/components/StatusBadge';
import SentimentBadge from '@/components/SentimentBadge';
import PendingModal from '@/components/PendingModal';

const TicketProcessPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, addMessage, closeTicket } = useTickets();
  const [reply, setReply] = useState('');
  const [showPendingModal, setShowPendingModal] = useState(false);

  const ticket = getById(id || '');
  if (!ticket) return <p className="text-muted-foreground">Ticket không tồn tại.</p>;

  const handleSend = () => {
    if (!reply.trim()) return;
    addMessage(ticket.id, reply);
    setReply('');
  };

  const handleClose = () => {
    closeTicket(ticket.id);
    navigate('/tickets');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Hỗ trợ Ticket #{ticket.id}</h1>

      <div className="grid grid-cols-[280px_1fr_300px] gap-6">
        {/* Left: Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Thông tin cố định</h2>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Mã: {ticket.id}</p>
            <p className="text-muted-foreground">Kênh: {ticket.channel === 'Web' ? 'Website Chat' : ticket.channel}</p>
            {ticket.assignedAgent && <p className="text-muted-foreground">Người gán: {ticket.assignedAgent}</p>}
          </div>
          <div className="mt-4">
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Center: Chat */}
        <div className="bg-card rounded-xl border-2 border-primary/30 p-6 flex flex-col">
          <h2 className="font-semibold text-foreground mb-4">Nội dung trao đổi</h2>
          <div className="flex-1 space-y-4 mb-6">
            {ticket.messages.map(msg => (
              <div key={msg.id}>
                {msg.isAttachment ? (
                  <div className="inline-block bg-status-open-bg border-2 border-dashed border-status-open rounded-lg px-4 py-3 text-sm">
                    📁 {ticket.attachment || 'Tệp đính kèm'}
                  </div>
                ) : (
                  <div className={`rounded-lg px-4 py-3 text-sm max-w-[80%] ${
                    msg.sender === 'customer' ? 'bg-muted' : 'bg-primary/10 ml-auto'
                  }`}>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 items-center border-2 border-primary/30 rounded-lg px-4 py-2">
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Nhập phản hồi cho khách hàng..."
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90"
            >
              Gửi (Enter)
            </button>
          </div>
        </div>

        {/* Right: AI */}
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
          <h2 className="font-semibold text-primary text-lg mb-4">Nova AI-Assisted</h2>
          <div className="space-y-3 text-sm flex-1">
            <p><span className="font-semibold text-foreground">AI Intent:</span> {ticket.aiIntent}</p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">AI Sentiment:</span>
              <SentimentBadge sentiment={ticket.sentiment} />
            </div>
            {ticket.quickReplies && ticket.quickReplies.length > 0 && (
              <div>
                <p className="font-semibold text-foreground mb-2">Gợi ý trả lời nhanh:</p>
                {ticket.quickReplies.map((qr, i) => (
                  <button key={i} className="block w-full text-left border border-primary/30 text-primary rounded-lg px-3 py-2 text-sm hover:bg-primary/5 mb-2">
                    {qr}
                  </button>
                ))}
              </div>
            )}
            {ticket.relatedDocs && ticket.relatedDocs.length > 0 && (
              <div>
                <p className="font-semibold text-foreground mb-2">Tài liệu liên quan:</p>
                {ticket.relatedDocs.map((doc, i) => (
                  <a key={i} href="#" className="block text-primary text-sm hover:underline mb-1">{doc}</a>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setShowPendingModal(true)}
              className="w-full border-2 border-primary text-primary rounded-lg py-2.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Chuyển Đang chờ
            </button>
            <button
              onClick={handleClose}
              className="w-full bg-action-resolve text-action-resolve-foreground rounded-lg py-2.5 text-sm font-medium hover:opacity-90"
            >
              Đóng Ticket (Resolved)
            </button>
          </div>
        </div>
      </div>

      {showPendingModal && (
        <PendingModal
          ticketId={ticket.id}
          onClose={() => setShowPendingModal(false)}
          onConfirm={() => {
            setShowPendingModal(false);
            navigate('/tickets?tab=pending');
          }}
        />
      )}
    </div>
  );
};

export default TicketProcessPage;
