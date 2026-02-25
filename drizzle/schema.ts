import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Metrics Events Table
 * Logs every user interaction for analytics and metrics computation
 */
export const metricsEvents = mysqlTable(
  "metrics_events",
  {
    id: int("id").autoincrement().primaryKey(),
    // Session and timing
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    ts: int("ts").notNull(), // Unix timestamp in milliseconds
    
    // Channel and language
    channel: mysqlEnum("channel", ["web_chat", "voice_demo", "hotline_agent_assist"]).notNull(),
    language: mysqlEnum("language", ["vi", "en"]).notNull(),
    
    // Message content
    messageText: text("messageText"),
    messageRole: mysqlEnum("messageRole", ["user", "bot"]).notNull(),
    
    // Classification
    serviceLabel: int("serviceLabel"), // 1-6, null if needs clarification
    labelConfidence: decimal("labelConfidence", { precision: 3, scale: 2 }), // 0.00-1.00
    needsClarification: boolean("needsClarification").default(false),
    
    // Sentiment
    sentimentLabel: mysqlEnum("sentimentLabel", ["negative", "neutral", "positive"]),
    sentimentScore: decimal("sentimentScore", { precision: 3, scale: 2 }), // -1.00 to 1.00
    
    // Escalation tracking
    escalationSuggested: boolean("escalationSuggested").default(false),
    negativeStreak: int("negativeStreak").default(0),
    
    // Performance
    latencyMs: int("latencyMs"), // Optional: response latency
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    sessionIdIdx: index("sessionId_idx").on(table.sessionId),
    tsIdx: index("ts_idx").on(table.ts),
    channelIdx: index("channel_idx").on(table.channel),
    serviceLabelIdx: index("serviceLabel_idx").on(table.serviceLabel),
  })
);

export type MetricsEvent = typeof metricsEvents.$inferSelect;
export type InsertMetricsEvent = typeof metricsEvents.$inferInsert;