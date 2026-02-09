# AI Support Copilot - API Specification

This document outlines the API contracts for the AI Support Copilot MVP and future production integrations.

## MVP Phase (Current - Client-side Only)

The current MVP is a client-side only application with mock implementations. All sentiment analysis and configuration management is handled in the browser using React Context and localStorage.

### Mock Endpoints (for future backend integration)

These endpoints are currently mocked in the frontend but should be implemented as real backend services in production.

## V1 Phase - Backend Integration

### 1. Chat API

#### POST /api/chat/send

Send a message and receive sentiment analysis and bot reply.

**Request:**
```json
{
  "session_id": "session-123",
  "message": "I'm very frustrated with your service",
  "language_mode": "auto|vi|en"
}
```

**Response:**
```json
{
  "reply_text": "I understand your frustration. Let me help you resolve this.",
  "language": "en",
  "sentiment": {
    "label": "Negative",
    "score": -0.75,
    "confidence": 0.92
  },
  "triggers": {
    "escalationSuggested": true,
    "negativeStreak": 2
  },
  "metrics": {
    "avgSentiment": -0.35,
    "negativeRate": 0.4,
    "volatility": 0.45
  },
  "timings_ms": {
    "llm": 245,
    "total": 312
  }
}
```

**Status Codes:**
- `200 OK`: Successful analysis
- `400 Bad Request`: Invalid input
- `500 Internal Server Error`: Server error

---

### 2. Settings API

#### GET /api/settings/sentiment

Retrieve current sentiment configuration.

**Response:**
```json
{
  "id": "config-1",
  "version": 1,
  "scale": "ternary",
  "labels": {
    "positive": "Positive",
    "neutral": "Neutral",
    "negative": "Negative"
  },
  "thresholds": {
    "negativeThreshold": -0.3,
    "escalationThreshold": -0.6,
    "consecutiveNegativeCount": 3
  },
  "rules": {
    "recencyWeighting": 0.7,
    "roleWeighting": {
      "customer": 1.0,
      "agent": 0.5
    },
    "smoothingWindow": 3
  },
  "triggers": {
    "enableEscalation": true,
    "enableNegativeStreak": true,
    "enableVolatilityAlert": true
  },
  "metricsSelection": {
    "avgSentiment": true,
    "negativeRate": true,
    "volatility": true,
    "escalationCount": true,
    "latency": true
  },
  "updated_at": "2026-02-09T06:00:00Z"
}
```

#### PUT /api/settings/sentiment

Update sentiment configuration.

**Request:**
```json
{
  "scale": "ternary",
  "labels": { ... },
  "thresholds": { ... },
  "rules": { ... },
  "triggers": { ... },
  "metricsSelection": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "config": { ... },
  "version": 2,
  "updated_at": "2026-02-09T06:15:00Z"
}
```

---

### 3. Voice Demo Harness APIs

#### POST /api/voice/transcribe

Transcribe audio to text (ASR).

**Request:**
```
Content-Type: audio/wav
[Binary audio data]
```

**Response:**
```json
{
  "transcript": "I need help with my order",
  "language": "en",
  "confidence": 0.95,
  "timings_ms": {
    "asr": 180
  }
}
```

#### POST /api/voice/synthesize

Convert text to speech (TTS).

**Request:**
```json
{
  "text": "Thank you for contacting us. How can I help?",
  "language": "en",
  "voice_id": "default"
}
```

**Response:**
```
Content-Type: audio/wav
[Binary audio data]
```

**Headers:**
```
X-Timings-TTS: 125
```

---

## Production Phase - Agent-Assist Voice Architecture

### 4. Agent-Assist Voice Ingestion

#### POST /api/voice/agent-assist/ingest (or WebSocket)

Stream live call transcripts for real-time sentiment analysis.

**Request (Streaming):**
```json
{
  "call_id": "call-456",
  "chunk_text": "I've been waiting for 30 minutes",
  "speaker": "customer|agent",
  "ts": 1707461400000
}
```

**Response (Incremental Events):**
```json
{
  "call_id": "call-456",
  "sentiment": {
    "label": "Negative",
    "score": -0.65,
    "confidence": 0.88
  },
  "triggers": {
    "escalationSuggested": true,
    "negativeStreak": 2
  },
  "suggested_next_action": "Offer immediate assistance or escalate to supervisor",
  "partial_summary": "Customer frustrated with wait time. Consider offering compensation.",
  "ts": 1707461405000
}
```

---

### 5. Call Summary API

#### GET /api/voice/agent-assist/call/{call_id}/summary

Retrieve end-of-call analysis and summary.

**Response:**
```json
{
  "call_id": "call-456",
  "duration_seconds": 420,
  "agent_id": "agent-123",
  "customer_sentiment": {
    "initial": 0.2,
    "final": -0.4,
    "average": -0.1,
    "trend": "declining"
  },
  "key_intents": ["order_status", "complaint", "refund_request"],
  "escalation_triggered": true,
  "escalation_reason": "Negative streak of 3 turns",
  "sentiment_timeline": [
    { "ts": 1707461400000, "score": 0.2, "label": "Neutral" },
    { "ts": 1707461410000, "score": -0.3, "label": "Negative" },
    { "ts": 1707461420000, "score": -0.5, "label": "Negative" },
    { "ts": 1707461430000, "score": -0.4, "label": "Negative" }
  ],
  "recommended_actions": [
    "Send follow-up survey",
    "Offer service credit",
    "Schedule callback with manager"
  ],
  "created_at": "2026-02-09T06:30:00Z"
}
```

---

## Data Models

### SentimentConfig
```typescript
interface SentimentConfig {
  id?: string;
  version?: number;
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
  updated_at?: string;
}
```

### SentimentResult
```typescript
interface SentimentResult {
  label: string;
  score: number;        // Range: [-1, 1]
  confidence: number;   // Range: [0, 1]
}
```

### BotTurn
```typescript
interface BotTurn {
  id: string;
  session_id: string;
  role: 'user' | 'bot';
  text: string;
  language: 'vi' | 'en';
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
  created_at: string;
}
```

### CallSession
```typescript
interface CallSession {
  id: string;
  agent_id: string;
  customer_id?: string;
  status: 'active' | 'completed' | 'escalated';
  language_mode: 'auto' | 'vi' | 'en';
  detected_language: 'vi' | 'en';
  sentiment_config_version: number;
  turns: BotTurn[];
  created_at: string;
  ended_at?: string;
}
```

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

- `200 OK`: Successful request
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

Error responses should follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {
    "field": "additional context"
  }
}
```

---

## Rate Limiting

Recommended rate limits for production:

- Chat API: 100 requests/minute per session
- Voice Transcribe: 50 requests/minute per user
- Voice Synthesize: 50 requests/minute per user
- Settings API: 10 requests/minute per user

---

## Authentication

For production, implement OAuth 2.0 or JWT-based authentication:

```
Authorization: Bearer <token>
```

---

## Versioning

API versioning should be handled via URL path:

- `/api/v1/chat/send`
- `/api/v2/chat/send`

Current version: `v1` (MVP)

---

## WebSocket Support (Optional)

For real-time agent-assist voice, consider WebSocket for streaming:

```
ws://api.example.com/api/voice/agent-assist/stream
```

This allows bidirectional streaming of call transcripts and real-time sentiment analysis.

---

## Testing

Example cURL requests for testing:

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-1",
    "message": "I am very happy with your service",
    "language_mode": "auto"
  }'

# Test settings endpoint
curl -X GET http://localhost:3000/api/settings/sentiment

# Test voice transcribe
curl -X POST http://localhost:3000/api/voice/transcribe \
  -H "Content-Type: audio/wav" \
  --data-binary @audio.wav
```

---

## Deployment Considerations

1. **Database**: Use PostgreSQL with Prisma ORM for data persistence
2. **Caching**: Implement Redis for configuration caching
3. **Message Queue**: Use message queue (RabbitMQ/Kafka) for async processing
4. **Monitoring**: Implement logging and monitoring for API performance
5. **Security**: Use HTTPS, implement CORS, rate limiting, and input validation
6. **Scalability**: Design for horizontal scaling with load balancing

---

## Future Enhancements

- [ ] Batch processing API for historical data analysis
- [ ] Webhooks for escalation alerts
- [ ] Custom sentiment models per organization
- [ ] Integration with CRM systems
- [ ] Advanced analytics and reporting APIs
- [ ] Team collaboration APIs
