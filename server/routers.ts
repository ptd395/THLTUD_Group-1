import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { logMetricsEvent, getMetricsOverview, getRecentEscalations, MetricsFilters } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  metrics: router({
    log: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          ts: z.number(),
          channel: z.enum(["web_chat", "voice_demo", "hotline_agent_assist"]),
          language: z.enum(["vi", "en"]),
          messageText: z.string().optional(),
          messageRole: z.enum(["user", "bot"]),
          serviceLabel: z.number().int().min(1).max(6).optional(),
          labelConfidence: z.number().min(0).max(1).optional(),
          needsClarification: z.boolean().optional(),
          sentimentLabel: z.enum(["negative", "neutral", "positive"]).optional(),
          sentimentScore: z.number().min(-1).max(1).optional(),
          escalationSuggested: z.boolean().optional(),
          negativeStreak: z.number().int().optional(),
          latencyMs: z.number().int().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const eventData = {
          ...input,
          labelConfidence: input.labelConfidence ? input.labelConfidence.toString() : undefined,
          sentimentScore: input.sentimentScore ? input.sentimentScore.toString() : undefined,
        } as any;
        const event = await logMetricsEvent(eventData);
        return { success: !!event, eventId: event?.id };
      }),

    overview: publicProcedure
      .input(
        z.object({
          range: z.enum(["7d", "30d", "custom"]),
          from: z.number().optional(),
          to: z.number().optional(),
          channel: z.string().optional(),
          language: z.string().optional(),
          serviceLabel: z.number().int().optional(),
        })
      )
      .query(async ({ input }) => {
        const now = Date.now();
        let fromTs = now;

        if (input.range === "7d") {
          fromTs = now - 7 * 24 * 60 * 60 * 1000;
        } else if (input.range === "30d") {
          fromTs = now - 30 * 24 * 60 * 60 * 1000;
        } else if (input.range === "custom" && input.from) {
          fromTs = input.from;
        }

        const filters: MetricsFilters = {
          fromTs,
          toTs: input.to || now,
          channel: input.channel,
          language: input.language,
          serviceLabel: input.serviceLabel,
        };

        const overview = await getMetricsOverview(filters);
        return overview || {
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
      }),

    escalations: publicProcedure
      .input(
        z.object({
          range: z.enum(["7d", "30d", "custom"]),
          from: z.number().optional(),
          to: z.number().optional(),
          channel: z.string().optional(),
          language: z.string().optional(),
          limit: z.number().int().default(10),
        })
      )
      .query(async ({ input }) => {
        const now = Date.now();
        let fromTs = now;

        if (input.range === "7d") {
          fromTs = now - 7 * 24 * 60 * 60 * 1000;
        } else if (input.range === "30d") {
          fromTs = now - 30 * 24 * 60 * 60 * 1000;
        } else if (input.range === "custom" && input.from) {
          fromTs = input.from;
        }

        const filters: MetricsFilters = {
          fromTs,
          toTs: input.to || now,
          channel: input.channel,
          language: input.language,
        };

        const escalations = await getRecentEscalations(filters, input.limit);
        return escalations || [];
      }),
  }),
});

export type AppRouter = typeof appRouter;
