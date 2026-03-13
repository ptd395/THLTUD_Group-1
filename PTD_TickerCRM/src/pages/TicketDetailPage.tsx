import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '@/context/TicketContext';
import StatusBadge from '@/components/StatusBadge';
import SentimentBadge from '@/components/SentimentBadge';

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, closeTicket, moveToOpen, addMessage } = useTickets();
  const [reply, setReply] = useState('');

  const ticket = getById(id || '', 'pending') || getById(id || '');
  if (!ticket) return <p className="text-muted-foreground">Ticket không tồn tại.</p>;

  const handleSend = () => {
    if (!reply.trim()) return;
    addMessage(ticket.id, reply);
    setReply('');
  };

  const handleContinueSupport = () => {
    moveToOpen(ticket.id);
    navigate(`/tickets/process/${ticket.id}`);
  };

  const handleClose = () => {
    closeTicket(ticket.id);
    navigate('/tickets?tab=pending');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Hỗ trợ Ticket #{ticket.id}</h1>

      <div className="grid grid-cols-[280px_1fr_300px] gap-6">
        {/* Left */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Thông tin chi tiết</h2>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Mã: {ticket.id}</p>
            <p className="text-muted-foreground">Kênh: {ticket.channel === 'Web' ? 'Website Chat' : ticket.channel}</p>
            {ticket.assignedAgent && <p className="text-muted-foreground">Người gán: {ticket.assignedAgent}</p>}
          </div>
          <div className="mt-4">
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Center */}
        <div className="bg-card rounded-xl border-2 border-primary/30 p-6 flex flex-col">
          <h2 className="font-semibold text-foreground mb-4">Nội dung hội thoại</h2>
          <div className="flex-1 space-y-4 mb-6">
            {ticket.messages.map(msg => (
              <div key={msg.id}>
                {msg.isAttachment ? (
                  <div className="inline-block bg-status-open-bg border-2 border-dashed border-status-open rounded-lg px-4 py-3 text-sm">
                    📁 {ticket.attachment || 'Tệp đính kèm'}
                  </div>
                ) : msg.content ? (
                  <div className={`rounded-lg px-4 py-3 text-sm max-w-[80%] ${
                    msg.sender === 'customer' ? 'bg-muted' : 'bg-primary/10 ml-auto'
                  }`}>
                    {msg.content}
                  </div>
                ) : null}
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

        {/* Right */}
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
          <h2 className="font-semibold text-primary text-lg mb-4">Nova AI-Assisted</h2>
          <div className="space-y-3 text-sm flex-1">
            <p><span className="font-semibold text-foreground">Ý định:</span> {ticket.aiIntent}</p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Cảm xúc:</span>
              <SentimentBadge sentiment={ticket.sentiment} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleContinueSupport}
              className="w-full bg-action-continue text-action-continue-foreground rounded-lg py-2.5 text-sm font-medium hover:opacity-90"
            >
              Tiếp tục hỗ trợ
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
    </div>
  );
};

export default TicketDetailPage;
