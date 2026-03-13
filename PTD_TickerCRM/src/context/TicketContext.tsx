import React, { createContext, useContext, useState, useCallback } from 'react';
import { Ticket, TicketStatus } from '@/types/ticket';
import { mockTickets, closedTickets } from '@/data/mockTickets';

interface TicketContextType {
  tickets: Ticket[];
  closed: Ticket[];
  getByStatus: (status: TicketStatus) => Ticket[];
  getById: (id: string, status?: TicketStatus) => Ticket | undefined;
  moveToPending: (id: string, reason: string) => void;
  closeTicket: (id: string) => void;
  moveToOpen: (id: string) => void;
  addMessage: (id: string, content: string) => void;
}

const TicketContext = createContext<TicketContextType | null>(null);

export const useTickets = () => {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used within TicketProvider');
  return ctx;
};

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [closed, setClosed] = useState<Ticket[]>(closedTickets);

  const getByStatus = useCallback((status: TicketStatus) => {
    if (status === 'closed') return closed;
    return tickets.filter(t => t.status === status);
  }, [tickets, closed]);

  const getById = useCallback((id: string, status?: TicketStatus) => {
    if (status === 'closed') return closed.find(t => t.id === id);
    return tickets.find(t => t.id === id);
  }, [tickets, closed]);

  const moveToPending = useCallback((id: string, reason: string) => {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'pending' as TicketStatus, pendingReason: reason, waitTime: 'vừa xong', assignedAgent: 'Agent A' } : t
    ));
  }, []);

  const closeTicket = useCallback((id: string) => {
    setTickets(prev => {
      const ticket = prev.find(t => t.id === id);
      if (ticket) {
        setClosed(c => [...c, { ...ticket, status: 'closed', closedDate: new Date().toLocaleDateString('vi-VN') }]);
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const moveToOpen = useCallback((id: string) => {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'open' as TicketStatus, pendingReason: undefined, waitTime: undefined } : t
    ));
  }, []);

  const addMessage = useCallback((id: string, content: string) => {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, messages: [...t.messages, { id: Date.now().toString(), content, sender: 'agent', timestamp: new Date().toISOString() }] } : t
    ));
  }, []);

  return (
    <TicketContext.Provider value={{ tickets, closed, getByStatus, getById, moveToPending, closeTicket, moveToOpen, addMessage }}>
      {children}
    </TicketContext.Provider>
  );
};
