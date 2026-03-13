export type TicketStatus = 'open' | 'pending' | 'closed';
export type Sentiment = 'positive' | 'negative' | 'neutral';
export type Channel = 'Web' | 'Email' | 'Mess';

export interface Ticket {
  id: string;
  title: string;
  customerName: string;
  status: TicketStatus;
  sentiment: Sentiment;
  channel: Channel;
  messages: Message[];
  aiIntent?: string;
  quickReplies?: string[];
  relatedDocs?: string[];
  pendingReason?: string;
  waitTime?: string;
  assignedAgent?: string;
  closedDate?: string;
  resolution?: string;
  appliedSolutions?: string[];
  attachment?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'customer' | 'agent';
  timestamp: string;
  isAttachment?: boolean;
}
