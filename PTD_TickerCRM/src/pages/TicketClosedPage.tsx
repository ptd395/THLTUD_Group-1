import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '@/context/TicketContext';
import SentimentBadge from '@/components/SentimentBadge';
import StatusBadge from '@/components/StatusBadge';

const TicketClosedPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById } = useTickets();

  const ticket = getById(id || '', 'closed');
  if (!ticket) return <p className="text-muted-foreground">Ticket không tồn tại.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Lịch sử Ticket #{ticket.id} (Đã đóng)</h1>

      <div className="grid grid-cols-[280px_1fr_300px] gap-6">
        {/* Left */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Thông tin lưu trữ</h2>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Mã: {ticket.id}</p>
            <p className="text-muted-foreground">Kênh: {ticket.channel === 'Web' ? 'Website Chat' : ticket.channel}</p>
            <p className="text-muted-foreground">Ngày đóng: {ticket.closedDate}</p>
          </div>
          <div className="mt-4">
            <StatusBadge status="closed" />
          </div>
        </div>

        {/* Center */}
        <div className="bg-card rounded-xl border-2 border-primary/30 p-6 flex flex-col">
          <h2 className="font-semibold text-foreground mb-4">Lịch sử hội thoại</h2>
          <div className="flex-1 space-y-4 mb-6">
            {ticket.messages.map(msg => (
              <div key={msg.id} className={`rounded-lg px-4 py-3 text-sm max-w-[80%] ${
                msg.sender === 'customer' ? 'bg-muted' : 'bg-primary/10 ml-auto'
              }`}>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="border-2 border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
            Ticket đã đóng - Không thể nhập phản hồi
          </div>
        </div>

        {/* Right */}
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
          <h2 className="font-semibold text-primary text-lg mb-4">Kết quả AI</h2>
          <div className="space-y-3 text-sm flex-1">
            <p><span className="font-semibold text-foreground">Ý định cuối:</span> {ticket.aiIntent}</p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Cảm xúc cuối:</span>
              <SentimentBadge sentiment={ticket.sentiment} />
            </div>
            {ticket.appliedSolutions && ticket.appliedSolutions.length > 0 && (
              <div>
                <p className="font-semibold text-foreground mb-2">Giải pháp áp dụng:</p>
                <ul className="text-muted-foreground space-y-1">
                  {ticket.appliedSolutions.map((s, i) => (
                    <li key={i}>- {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/tickets')}
            className="w-full mt-6 border-2 border-border text-muted-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketClosedPage;
