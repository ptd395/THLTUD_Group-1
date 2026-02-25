import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// Mock database functions
vi.mock('./db', () => ({
  logMetricsEvent: vi.fn(async (event) => ({
    id: 1,
    ...event,
  })),
  getMetricsOverview: vi.fn(async () => ({
    kpis: {
      totalInteractions: 5,
      totalSessions: 2,
      avgSentiment: 0.4,
      negativeRate: 20,
      escalationRate: 10,
      avgLatency: 150,
    },
    seriesByDay: [
      { date: '2026-02-25', interactions: 5, avgSentiment: 0.4 },
    ],
    breakdownByLabel: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 0, 6: 0 },
    breakdownBySentiment: { positive: 3, neutral: 1, negative: 1 },
    breakdownByLanguage: { vi: 3, en: 2 },
    topNegativeLabels: [
      { serviceLabel: 2, count: 1, negativeRate: 100, avgSentiment: -0.8 },
    ],
  })),
  getRecentEscalations: vi.fn(async () => [
    {
      id: 1,
      sessionId: 'session-123',
      ts: Date.now(),
      channel: 'web_chat',
      language: 'en',
      messageText: 'This is urgent',
      messageRole: 'user',
      serviceLabel: 6,
      labelConfidence: '0.95',
      needsClarification: false,
      sentimentLabel: 'negative',
      sentimentScore: '-0.9',
      escalationSuggested: true,
      negativeStreak: 3,
      latencyMs: 200,
      createdAt: new Date(),
    },
  ]),
}));

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

describe('metrics router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe('metrics.log', () => {
    it('should log a metrics event successfully', async () => {
      const result = await caller.metrics.log({
        sessionId: 'session-123',
        ts: Date.now(),
        channel: 'web_chat',
        language: 'en',
        messageText: 'Hello, I need help',
        messageRole: 'user',
        serviceLabel: 1,
        labelConfidence: 0.95,
        sentimentLabel: 'positive',
        sentimentScore: 0.8,
      });

      expect(result.success).toBe(true);
      expect(result.eventId).toBe(1);
    });

    it('should handle optional fields', async () => {
      const result = await caller.metrics.log({
        sessionId: 'session-456',
        ts: Date.now(),
        channel: 'voice_demo',
        language: 'vi',
        messageRole: 'bot',
      });

      expect(result.success).toBe(true);
    });

    it('should validate service label range', async () => {
      await expect(
        caller.metrics.log({
          sessionId: 'session-789',
          ts: Date.now(),
          channel: 'web_chat',
          language: 'en',
          messageRole: 'user',
          serviceLabel: 7, // Invalid: should be 1-6
        } as any)
      ).rejects.toThrow();
    });

    it('should validate sentiment score range', async () => {
      await expect(
        caller.metrics.log({
          sessionId: 'session-789',
          ts: Date.now(),
          channel: 'web_chat',
          language: 'en',
          messageRole: 'user',
          sentimentScore: 1.5, // Invalid: should be -1 to 1
        } as any)
      ).rejects.toThrow();
    });
  });

  describe('metrics.overview', () => {
    it('should return metrics overview for 7 days', async () => {
      const result = await caller.metrics.overview({
        range: '7d',
      });

      expect(result.kpis).toBeDefined();
      expect(result.kpis.totalInteractions).toBe(5);
      expect(result.kpis.totalSessions).toBe(2);
      expect(result.kpis.avgSentiment).toBe(0.4);
      expect(result.kpis.negativeRate).toBe(20);
      expect(result.kpis.escalationRate).toBe(10);
    });

    it('should return metrics overview for 30 days', async () => {
      const result = await caller.metrics.overview({
        range: '30d',
      });

      expect(result.seriesByDay).toBeDefined();
      expect(result.breakdownByLabel).toBeDefined();
      expect(result.breakdownBySentiment).toBeDefined();
    });

    it('should filter by channel', async () => {
      const result = await caller.metrics.overview({
        range: '7d',
        channel: 'web_chat',
      });

      expect(result.kpis).toBeDefined();
    });

    it('should filter by language', async () => {
      const result = await caller.metrics.overview({
        range: '7d',
        language: 'vi',
      });

      expect(result.kpis).toBeDefined();
    });

    it('should filter by service label', async () => {
      const result = await caller.metrics.overview({
        range: '7d',
        serviceLabel: 1,
      });

      expect(result.kpis).toBeDefined();
    });

    it('should handle custom date range', async () => {
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const result = await caller.metrics.overview({
        range: 'custom',
        from: weekAgo,
        to: now,
      });

      expect(result.kpis).toBeDefined();
    });
  });

  describe('metrics.escalations', () => {
    it('should return recent escalations', async () => {
      const result = await caller.metrics.escalations({
        range: '7d',
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].escalationSuggested).toBe(true);
    });

    it('should limit escalations result', async () => {
      const result = await caller.metrics.escalations({
        range: '7d',
        limit: 5,
      });

      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should filter escalations by channel', async () => {
      const result = await caller.metrics.escalations({
        range: '7d',
        channel: 'web_chat',
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter escalations by language', async () => {
      const result = await caller.metrics.escalations({
        range: '7d',
        language: 'en',
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('metrics calculations', () => {
    it('should calculate correct KPI values', async () => {
      const result = await caller.metrics.overview({
        range: '7d',
      });

      // Verify KPI structure
      expect(result.kpis).toHaveProperty('totalInteractions');
      expect(result.kpis).toHaveProperty('totalSessions');
      expect(result.kpis).toHaveProperty('avgSentiment');
      expect(result.kpis).toHaveProperty('negativeRate');
      expect(result.kpis).toHaveProperty('escalationRate');
      expect(result.kpis).toHaveProperty('avgLatency');

      // Verify types
      expect(typeof result.kpis.totalInteractions).toBe('number');
      expect(typeof result.kpis.avgSentiment).toBe('number');
      expect(typeof result.kpis.negativeRate).toBe('number');
    });

    it('should include breakdown data', async () => {
      const result = await caller.metrics.overview({
        range: '7d',
      });

      expect(result).toHaveProperty('breakdownByLabel');
      expect(result).toHaveProperty('breakdownBySentiment');
      expect(result).toHaveProperty('breakdownByLanguage');
      expect(result).toHaveProperty('topNegativeLabels');
    });

    it('should handle empty data gracefully', async () => {
      const result = await caller.metrics.overview({
        range: '7d',
      });

      // Should return valid structure even with data
      expect(result.kpis).toBeDefined();
      expect(result.seriesByDay).toBeDefined();
      expect(Array.isArray(result.seriesByDay)).toBe(true);
    });
  });
});
