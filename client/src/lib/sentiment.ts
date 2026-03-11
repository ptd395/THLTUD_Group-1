/**
 * Sentiment Analysis Utilities
 * Handles sentiment scoring, language detection, and configuration
 */

export interface SentimentConfig {
  scale: 'binary' | 'ternary' | 'fivepoint';
  labels: Record<string, string>;
  thresholds: {
    negativeThreshold: number;
    escalationThreshold: number;
    consecutiveNegativeCount: number;
  };
  rules: {
    recencyWeighting: number;
    roleWeighting: {
      customer: number;
      agent: number;
    };
    smoothingWindow: number;
  };
  triggers: {
    enableEscalation: boolean;
    enableNegativeStreak: boolean;
    enableVolatilityAlert: boolean;
  };
  metricsSelection: {
    avgSentiment: boolean;
    negativeRate: boolean;
    volatility: boolean;
    escalationCount: boolean;
    latency: boolean;
  };
}

export interface SentimentResult {
  label: string;
  score: number;
  confidence: number;
}

export interface TurnResult {
  sentiment: SentimentResult;
  triggers: {
    escalationSuggested: boolean;
    negativeStreak: number;
  };
  metrics: {
    avgSentiment: number;
    negativeRate: number;
    volatility: number;
  };
  timings_ms: {
    llm: number;
    total: number;
  };
}

export const DEFAULT_SENTIMENT_CONFIG: SentimentConfig = {
  scale: 'ternary',
  labels: {
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
  },
  thresholds: {
    negativeThreshold: -0.3,
    escalationThreshold: -0.6,
    consecutiveNegativeCount: 3,
  },
  rules: {
    recencyWeighting: 0.7,
    roleWeighting: {
      customer: 1.0,
      agent: 0.5,
    },
    smoothingWindow: 3,
  },
  triggers: {
    enableEscalation: true,
    enableNegativeStreak: true,
    enableVolatilityAlert: true,
  },
  metricsSelection: {
    avgSentiment: true,
    negativeRate: true,
    volatility: true,
    escalationCount: true,
    latency: true,
  },
};

/**
 * Detect language from text using simple heuristics
 * Returns 'vi' for Vietnamese, 'en' for English
 */
export function detectLanguage(text: string): 'vi' | 'en' {
  // Vietnamese characters
  const vietnameseChars = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi;
  
  // Count Vietnamese characters
  const vietnameseMatches = (text.match(vietnameseChars) || []).length;
  
  // If more than 10% of text is Vietnamese characters, classify as Vietnamese
  if (vietnameseMatches > text.length * 0.1) {
    return 'vi';
  }
  
  return 'en';
}

/**
 * Analyze sentiment of text (mock implementation)
 * In production, this would call a real sentiment classifier
 */
export function analyzeSentiment(text: string, language: 'vi' | 'en'): SentimentResult {
  // Mock sentiment analysis based on keywords
  const negativeKeywords = {
    en: ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'upset', 'problem', 'issue', 'broken'],
    vi: ['tệ', 'kinh khủng', 'ghét', 'tức giận', 'bực', 'buồn', 'vấn đề', 'lỗi', 'hỏng'],
  };
  
  const positiveKeywords = {
    en: ['good', 'great', 'excellent', 'love', 'happy', 'satisfied', 'thanks', 'appreciate', 'wonderful'],
    vi: ['tốt', 'tuyệt vời', 'yêu', 'vui', 'hài lòng', 'cảm ơn', 'tuyệt'],
  };
  
  const lowerText = text.toLowerCase();
  const negCount = negativeKeywords[language].filter(kw => lowerText.includes(kw)).length;
  const posCount = positiveKeywords[language].filter(kw => lowerText.includes(kw)).length;
  
  let score = 0;
  let label = 'Neutral';
  
  if (negCount > posCount) {
    score = Math.max(-0.3 - (negCount * 0.2), -1);
    label = 'Negative';
  } else if (posCount > negCount) {
    score = Math.min(0.3 + (posCount * 0.2), 1);
    label = 'Positive';
  }
  
  return {
    label,
    score,
    confidence: 0.7 + Math.random() * 0.25, // Mock confidence between 0.7-0.95
  };
}

/**
 * Get sentiment label based on score and config
 */
export function getSentimentLabel(score: number, config: SentimentConfig): string {
  if (config.scale === 'binary') {
    return score >= 0 ? config.labels.positive : config.labels.negative;
  } else if (config.scale === 'ternary') {
    if (score > 0.2) return config.labels.positive;
    if (score < -0.2) return config.labels.negative;
    return config.labels.neutral;
  }
  return config.labels.neutral;
}

/**
 * Get sentiment color based on score
 */
export function getSentimentColor(score: number): string {
  if (score > 0.2) return '#16a34a'; // Green
  if (score < -0.2) return '#dc2626'; // Red
  return '#f59e0b'; // Amber
}

/**
 * Calculate metrics from conversation history
 */
export function calculateMetrics(
  sentiments: SentimentResult[],
  config: SentimentConfig
): { avgSentiment: number; negativeRate: number; volatility: number } {
  if (sentiments.length === 0) {
    return { avgSentiment: 0, negativeRate: 0, volatility: 0 };
  }
  
  const scores = sentiments.map(s => s.score);
  const avgSentiment = scores.reduce((a, b) => a + b, 0) / scores.length;
  const negativeRate = scores.filter(s => s < config.thresholds.negativeThreshold).length / scores.length;
  
  // Calculate volatility (standard deviation)
  const mean = avgSentiment;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const volatility = Math.sqrt(variance);
  
  return {
    avgSentiment,
    negativeRate,
    volatility,
  };
}

/**
 * Check if escalation should be triggered
 */
export function checkEscalationTrigger(
  sentiments: SentimentResult[],
  config: SentimentConfig
): { escalationSuggested: boolean; negativeStreak: number } {
  if (!config.triggers.enableEscalation || sentiments.length === 0) {
    return { escalationSuggested: false, negativeStreak: 0 };
  }
  
  let negativeStreak = 0;
  
  // Count current consecutive negative turns (latest to oldest until first non-negative)
  for (let i = sentiments.length - 1; i >= 0; i--) {
    if (sentiments[i].score < config.thresholds.negativeThreshold) {
      negativeStreak++;
    } else {
      break;
    }
  }
  
  const escalationSuggested =
    negativeStreak >= config.thresholds.consecutiveNegativeCount ||
    sentiments[sentiments.length - 1].score < config.thresholds.escalationThreshold;
  
  return {
    escalationSuggested,
    negativeStreak,
  };
}
