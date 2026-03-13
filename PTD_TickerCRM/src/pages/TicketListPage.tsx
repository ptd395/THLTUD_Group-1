import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTickets } from '@/context/TicketContext';
import SentimentBadge from '@/components/SentimentBadge';
import { Globe, Mail, MessageCircle } from 'lucide-react';

type Tab = 'open' | 'pending' | 'closed';

const channelIcons = { Web: Globe, Email: Mail, Mess: MessageCircle };

const TicketListPage = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as Tab) || 'open';
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const { getByStatus } = useTickets();
  const navigate = useNavigate();
  const tickets = getByStatus(activeTab);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'open', label: `Đang mở (${getByStatus('open').length})` },
    { key: 'pending', label: `Đang chờ (${getByStatus('pending').length})` },
    { key: 'closed', label: 'Đã đóng' },
  ];

  const getTitle = () => {
    if (activeTab === 'open') return 'Quản lý Ticket CRM';
    if (activeTab === 'pending') return 'Danh sách Ticket - Đang chờ';
    return 'Lịch sử Ticket - Đã đóng';
  };

  const handleAction = (id: string) => {
    if (activeTab === 'open') navigate(`/tickets/process/${id}`);
    else if (activeTab === 'pending') navigate(`/tickets/detail/${id}`);
    else navigate(`/tickets/closed/${id}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">{getTitle()}</h1>
      <div className="bg-card rounded-xl border border-border p-6">
        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="pb-4 pr-4">Mã Ticket</th>
              {activeTab === 'open' && (
                <>
                  <th className="pb-4 pr-4">Tiêu đề / Khách hàng</th>
                  <th className="pb-4 pr-4">AI Sentiment</th>
                  <th className="pb-4 pr-4">Kênh</th>
                </>
              )}
              {activeTab === 'pending' && (
                <>
                  <th className="pb-4 pr-4">Lý do tạm dừng</th>
                  <th className="pb-4 pr-4">Thời gian chờ</th>
                  <th className="pb-4 pr-4">Người gán</th>
                  <th className="pb-4 pr-4">Thao tác</th>
                </>
              )}
              {activeTab === 'closed' && (
                <>
                  <th className="pb-4 pr-4">Kết quả xử lý</th>
                  <th className="pb-4 pr-4">AI Sentiment cuối</th>
                  <th className="pb-4 pr-4">Ngày đóng</th>
                </>
              )}
              {activeTab !== 'pending' && <th className="pb-4"></th>}
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="py-4 pr-4 font-semibold text-foreground">{ticket.id}</td>
                {activeTab === 'open' && (
                  <>
                    <td className="py-4 pr-4 text-foreground">{ticket.title} - {ticket.customerName}</td>
                    <td className="py-4 pr-4"><SentimentBadge sentiment={ticket.sentiment} /></td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-foreground">
                        {(() => { const Icon = channelIcons[ticket.channel]; return <Icon size={16} className="text-muted-foreground" />; })()}
                        {ticket.channel}
                      </span>
                    </td>
                  </>
                )}
                {activeTab === 'pending' && (
                  <>
                    <td className="py-4 pr-4 text-foreground italic">{ticket.pendingReason}</td>
                    <td className="py-4 pr-4 font-semibold text-status-pending">{ticket.waitTime}</td>
                    <td className="py-4 pr-4 text-foreground">{ticket.assignedAgent}</td>
                  </>
                )}
                {activeTab === 'closed' && (
                  <>
                    <td className="py-4 pr-4 text-muted-foreground">{ticket.resolution}</td>
                    <td className="py-4 pr-4"><SentimentBadge sentiment={ticket.sentiment} /></td>
                    <td className="py-4 pr-4 text-foreground">{ticket.closedDate}</td>
                  </>
                )}
                <td className="py-4 text-right">
                  <button
                    onClick={() => handleAction(ticket.id)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'open'
                        ? 'bg-action-process text-action-process-foreground hover:opacity-90'
                        : 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    {activeTab === 'open' ? 'Xử lý ngay' : activeTab === 'pending' ? 'Xem chi tiết' : 'Xem lại'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Không có ticket nào.</p>
        )}

        <div className="flex items-center justify-end mt-6 text-sm text-muted-foreground">
          Hiển thị 1 trên 1
        </div>
      </div>
    </div>
  );
};

export default TicketListPage;
