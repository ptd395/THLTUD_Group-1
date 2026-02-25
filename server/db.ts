import { eq, gte, lte, and, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, metricsEvents, InsertMetricsEvent, MetricsEvent } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// METRICS QUERIES
// ============================================================================

export interface MetricsFilters {
  fromTs: number; // Unix timestamp in milliseconds
  toTs: number;
  channel?: string; // 'web_chat' | 'voice_demo' | 'hotline_agent_assist'
  language?: string; // 'vi' | 'en'
  serviceLabel?: number; // 1-6
}

/**
 * Log a metrics event
 */
export async function logMetricsEvent(event: InsertMetricsEvent): Promise<MetricsEvent | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log metrics event: database not available");
    return null;
  }

  try {
    const result = await db.insert(metricsEvents).values(event);
    // Return the inserted event (we'll fetch it back)
    const inserted = await db
      .select()
      .from(metricsEvents)
      .where(eq(metricsEvents.id, result[0].insertId as number))
      .limit(1);
    return inserted.length > 0 ? inserted[0] : null;
  } catch (error) {
    console.error("[Database] Failed to log metrics event:", error);
    throw error;
  }
}

/**
 * Get metrics overview for dashboard
 */
export async function getMetricsOverview(filters: MetricsFilters) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get metrics overview: database not available");
    return null;
  }

  try {
    // Build where clause
    const whereConditions = [
      gte(metricsEvents.ts, filters.fromTs),
      lte(metricsEvents.ts, filters.toTs),
      eq(metricsEvents.messageRole, 'user'), // Only count user messages
    ];

    if (filters.channel) {
      whereConditions.push(eq(metricsEvents.channel, filters.channel as any));
    }
    if (filters.language) {
      whereConditions.push(eq(metricsEvents.language, filters.language as any));
    }
    if (filters.serviceLabel) {
      whereConditions.push(eq(metricsEvents.serviceLabel, filters.serviceLabel));
    }

    const whereClause = and(...whereConditions);

    // Get all events matching filters
    const events = await db
      .select()
      .from(metricsEvents)
      .where(whereClause);

    if (events.length === 0) {
      return {
        kpis: {
          totalInteractions: 0,
          totalSessions: 0,
          avgSentiment: 0,
          negativeRate: 0,
          escalationRate: 0,
          avgLatency: 0,
        },
        seriesByDay: [],
        breakdownByLabel: {},
        breakdownBySentiment: { positive: 0, neutral: 0, negative: 0 },
        breakdownByLanguage: { vi: 0, en: 0 },
        topNegativeLabels: [],
      };
    }

    // Calculate KPIs
    const totalInteractions = events.length;
    const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
    
    const sentimentScores = events
      .filter(e => e.sentimentScore !== null)
      .map(e => parseFloat(e.sentimentScore as any));
    const avgSentiment = sentimentScores.length > 0
      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
      : 0;

    const negativeCount = events.filter(e => e.sentimentLabel === 'negative').length;
    const negativeRate = totalInteractions > 0 ? negativeCount / totalInteractions : 0;

    const escalationCount = events.filter(e => e.escalationSuggested || e.serviceLabel === 6).length;
    const escalationRate = totalInteractions > 0 ? escalationCount / totalInteractions : 0;

    const latencies = events
      .filter(e => e.latencyMs !== null)
      .map(e => e.latencyMs as number);
    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    // Series by day
    const seriesByDay = aggregateByDay(events);

    // Breakdown by service label
    const breakdownByLabel: Record<number, number> = {};
    for (let i = 1; i <= 6; i++) {
      breakdownByLabel[i] = events.filter(e => e.serviceLabel === i).length;
    }

    // Breakdown by sentiment
    const breakdownBySentiment = {
      positive: events.filter(e => e.sentimentLabel === 'positive').length,
      neutral: events.filter(e => e.sentimentLabel === 'neutral').length,
      negative: events.filter(e => e.sentimentLabel === 'negative').length,
    };

    // Breakdown by language
    const breakdownByLanguage = {
      vi: events.filter(e => e.language === 'vi').length,
      en: events.filter(e => e.language === 'en').length,
    };

    // Top negative labels
    const topNegativeLabels = calculateTopNegativeLabels(events);

    return {
      kpis: {
        totalInteractions,
        totalSessions: uniqueSessions,
        avgSentiment: Math.round(avgSentiment * 100) / 100,
        negativeRate: Math.round(negativeRate * 10000) / 100, // percentage
        escalationRate: Math.round(escalationRate * 10000) / 100, // percentage
        avgLatency: Math.round(avgLatency),
      },
      seriesByDay,
      breakdownByLabel,
      breakdownBySentiment,
      breakdownByLanguage,
      topNegativeLabels,
    };
  } catch (error) {
    console.error("[Database] Failed to get metrics overview:", error);
    throw error;
  }
}

/**
 * Get recent escalation sessions
 */
export async function getRecentEscalations(filters: MetricsFilters, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get escalations: database not available");
    return [];
  }

  try {
    const whereConditions = [
      gte(metricsEvents.ts, filters.fromTs),
      lte(metricsEvents.ts, filters.toTs),
      or(
        eq(metricsEvents.escalationSuggested, true),
        eq(metricsEvents.serviceLabel, 6)
      ),
    ];

    if (filters.channel) {
      whereConditions.push(eq(metricsEvents.channel, filters.channel as any));
    }
    if (filters.language) {
      whereConditions.push(eq(metricsEvents.language, filters.language as any));
    }

    const whereClause = and(...whereConditions);

    const escalations = await db
      .select()
      .from(metricsEvents)
      .where(whereClause)
      .orderBy(metricsEvents.ts);

    // Group by session and get latest event per session
    const sessionMap = new Map<string, MetricsEvent>();
    for (const event of escalations) {
      const existing = sessionMap.get(event.sessionId);
      if (!existing || event.ts > existing.ts) {
        sessionMap.set(event.sessionId, event);
      }
    }

    return Array.from(sessionMap.values())
      .sort((a, b) => b.ts - a.ts)
      .slice(0, limit);
  } catch (error) {
    console.error("[Database] Failed to get escalations:", error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function aggregateByDay(events: MetricsEvent[]) {
  const dayMap = new Map<string, { interactions: number; sentiments: number[] }>();

  for (const event of events) {
    const date = new Date(event.ts);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, { interactions: 0, sentiments: [] });
    }

    const day = dayMap.get(dayKey)!;
    day.interactions++;
    if (event.sentimentScore !== null) {
      day.sentiments.push(parseFloat(event.sentimentScore as any));
    }
  }

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      interactions: data.interactions,
      avgSentiment: data.sentiments.length > 0
        ? Math.round((data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length) * 100) / 100
        : 0,
    }));
}

function calculateTopNegativeLabels(events: MetricsEvent[]) {
  const labelStats: Record<number, { count: number; negativeCount: number; sentiments: number[] }> = {};

  for (let i = 1; i <= 6; i++) {
    labelStats[i] = { count: 0, negativeCount: 0, sentiments: [] };
  }

  for (const event of events) {
    if (event.serviceLabel && event.serviceLabel >= 1 && event.serviceLabel <= 6) {
      const stats = labelStats[event.serviceLabel];
      stats.count++;
      if (event.sentimentLabel === 'negative') {
        stats.negativeCount++;
      }
      if (event.sentimentScore !== null) {
        stats.sentiments.push(parseFloat(event.sentimentScore as any));
      }
    }
  }

  return Object.entries(labelStats)
    .map(([label, stats]) => ({
      serviceLabel: parseInt(label),
      count: stats.count,
      negativeRate: stats.count > 0 ? Math.round((stats.negativeCount / stats.count) * 10000) / 100 : 0,
      avgSentiment: stats.sentiments.length > 0
        ? Math.round((stats.sentiments.reduce((a, b) => a + b, 0) / stats.sentiments.length) * 100) / 100
        : 0,
    }))
    .filter(s => s.count > 0)
    .sort((a, b) => {
      if (b.negativeRate !== a.negativeRate) {
        return b.negativeRate - a.negativeRate;
      }
      return b.count - a.count;
    });
}
