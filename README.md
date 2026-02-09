# AI Support Copilot MVP

A modern web application for real-time sentiment analysis in support conversations with multilingual support (Vietnamese + English), configurable metrics, and voice demo capabilities.

## 🎯 Overview

The AI Support Copilot provides support teams with actionable sentiment insights across customer conversations. The MVP includes:

- **Real-time Sentiment Analysis**: Analyze customer sentiment as conversations happen
- **Multilingual Support**: Automatic language detection for Vietnamese and English
- **Configurable Thresholds**: Customize sentiment scales, escalation triggers, and metrics
- **Metrics Dashboard**: Track average sentiment, negative rates, volatility, and escalation counts
- **Voice Demo Harness**: Showcase ASR/TTS pipeline with latency breakdown
- **Live Configuration Preview**: Test sentiment analysis with sample text

## 🏗️ Architecture

### Project Structure

```
client/
├── src/
│   ├── pages/
│   │   ├── Home.tsx              # Landing page with feature overview
│   │   ├── Demo.tsx              # Main demo interface
│   │   ├── Settings.tsx          # Sentiment configuration screen
│   │   └── NotFound.tsx          # 404 page
│   ├── components/
│   │   ├── ChatPanel.tsx         # Chat interface with language selection
│   │   ├── SentimentPanel.tsx    # Sentiment visualization and metrics
│   │   ├── MetricsPanel.tsx      # Performance and conversation metrics
│   │   ├── VoiceDemoPanel.tsx    # Voice recording and playback demo
│   │   ├── SentimentConfigForm.tsx # Configuration UI with tabs
│   │   ├── ui/                   # shadcn/ui components
│   │   └── ErrorBoundary.tsx     # Error handling
│   ├── contexts/
│   │   ├── SentimentContext.tsx  # Global sentiment config and history
│   │   └── ThemeContext.tsx      # Theme management
│   ├── lib/
│   │   └── sentiment.ts          # Sentiment analysis utilities
│   ├── App.tsx                   # Route definitions
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles and design tokens
├── public/                       # Static assets
└── index.html                    # HTML template
```

### Core Data Models

#### SentimentConfig
Stores sentiment analysis configuration with thresholds, triggers, and metrics selection.

```typescript
{
  scale: 'ternary',
  labels: { positive, neutral, negative },
  thresholds: {
    negativeThreshold: -0.3,
    escalationThreshold: -0.6,
    consecutiveNegativeCount: 3
  },
  rules: {
    recencyWeighting: 0.7,
    roleWeighting: { customer: 1.0, agent: 0.5 },
    smoothingWindow: 3
  },
  triggers: {
    enableEscalation: true,
    enableNegativeStreak: true,
    enableVolatilityAlert: true
  },
  metricsSelection: {
    avgSentiment: true,
    negativeRate: true,
    volatility: true,
    escalationCount: true,
    latency: true
  }
}
```

#### SentimentResult
Output of sentiment analysis for each message.

```typescript
{
  label: 'Positive' | 'Neutral' | 'Negative',
  score: number,        // Range: [-1, 1]
  confidence: number    // Range: [0, 1]
}
```

### Sentiment Analysis Pipeline

1. **Language Detection**: Automatic detection of Vietnamese vs English
2. **Sentiment Scoring**: Keyword-based analysis (mock in MVP) producing score in [-1, 1]
3. **Threshold Evaluation**: Check against configured thresholds
4. **Trigger Evaluation**: Detect escalation conditions based on config
5. **Metrics Calculation**: Compute aggregated metrics (avg, rate, volatility)

## 🚀 Features

### 1. Demo Screen (`/demo`)

The main interface for sentiment analysis demonstration featuring:

- **Chat Panel**: Send messages with language selection (Auto/Vietnamese/English)
- **Sentiment Visualization**: Current sentiment badge, gauge, and trend chart
- **Metrics Display**: Average sentiment, negative rate, volatility
- **Voice Demo Harness**: Record audio, simulate ASR/TTS with latency breakdown
- **Escalation Alerts**: Real-time escalation suggestions based on sentiment trends

### 2. Settings Screen (`/settings/sentiment`)

Configuration interface with four tabs:

- **Thresholds Tab**: Adjust negative threshold, escalation threshold, consecutive negative count
- **Triggers Tab**: Enable/disable escalation, negative streak, and volatility alerts
- **Metrics Tab**: Select which metrics to display in the dashboard
- **Preview Tab**: Test sentiment analysis with sample text in Vietnamese or English

### 3. Home Page (`/`)

Landing page with:

- Feature highlights with icons
- Clear value proposition
- Direct CTA to demo
- Links to settings

## 🔧 Configuration

### Default Sentiment Configuration

The application comes with sensible defaults that can be customized:

```typescript
{
  negativeThreshold: -0.3,      // Scores below this are negative
  escalationThreshold: -0.6,    // Scores below this trigger escalation
  consecutiveNegativeCount: 3   // N consecutive negative turns trigger escalation
}
```

### Customization

1. Navigate to Settings (`/settings/sentiment`)
2. Adjust thresholds using sliders
3. Toggle triggers on/off
4. Select metrics to display
5. Use Preview tab to test changes
6. Click "Save Configuration" to persist

Configuration is saved to browser localStorage and persists across sessions.

## 🌍 Multilingual Support

The application supports Vietnamese and English with:

- **Auto-detection**: Analyzes text for Vietnamese characters (à, á, ả, ã, ạ, etc.)
- **Manual Selection**: Users can force language mode in chat panel
- **Consistent Scoring**: Sentiment scores are on the same [-1, 1] scale regardless of language
- **UI Localization**: Component labels can be easily translated

### Language Detection Algorithm

Vietnamese text is detected by counting Vietnamese diacritical marks. If more than 10% of characters are Vietnamese, the text is classified as Vietnamese; otherwise, English.

## 🎤 Voice Demo Harness

The voice demo showcases the ASR/TTS pipeline:

1. **Recording**: Click "Start Recording" to capture audio via browser microphone
2. **Processing**: Audio is sent to mock ASR endpoint
3. **Transcription**: Mock transcript is displayed with detected language
4. **Analysis**: Sentiment is analyzed using the same pipeline as chat
5. **Latency Breakdown**: Shows ASR, LLM, and TTS latencies

### Mock Latencies

- ASR: 150-250ms
- LLM: 200-350ms
- TTS: 100-180ms

In production, these would be real latencies from actual services.

## 📊 Metrics

The dashboard tracks:

- **Average Sentiment**: Mean sentiment score across conversation
- **Negative Rate**: Percentage of turns with negative sentiment
- **Volatility**: Standard deviation of sentiment scores
- **Escalation Count**: Number of escalation triggers
- **Response Latency**: LLM and total response times

## 🔌 Future Integration Points

### Agent-Assist Voice Architecture

The application is designed to extend to production agent-assist voice with:

```typescript
// POST /api/voice/agent-assist/ingest (or WebSocket)
{
  call_id: string,
  chunk_text: string,
  speaker: 'customer' | 'agent',
  ts: number
}

// Server returns incremental analysis
{
  call_id: string,
  sentiment: SentimentResult,
  triggers: TriggerState,
  suggested_next_action: string,
  partial_summary: string
}
```

This allows real-time sentiment analysis of live calls with agent-assist prompts and alerts.

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: Wouter
- **State Management**: React Context + localStorage
- **Build**: Vite

## 📝 Development

### Installation

```bash
cd client
pnpm install
```

### Development Server

```bash
pnpm dev
```

Server runs at `http://localhost:3000`

### Build

```bash
pnpm build
```

### Type Checking

```bash
pnpm check
```

## 🎨 Design Philosophy

The application follows a **Modern Data Dashboard** aesthetic:

- **Information Hierarchy**: Strategic color coding for sentiment states
- **Minimalist Design**: Card-based layout with purposeful whitespace
- **Real-time Reactivity**: Smooth animations and immediate feedback
- **Professional Tone**: Deep blue primary with sentiment-based color coding
  - Red (#dc2626) for negative
  - Amber (#f59e0b) for neutral
  - Green (#16a34a) for positive

## 📈 Roadmap

### MVP (Current)
- ✅ Chat interface with sentiment analysis
- ✅ Multilingual support (VI + EN)
- ✅ Configurable thresholds and triggers
- ✅ Metrics dashboard
- ✅ Voice demo harness
- ✅ Live configuration preview

### V1 (Planned)
- Analytics screen with daily/weekly trends
- Breakdown by language
- Top sessions with escalations
- Agent-assist voice integration
- Real ASR/TTS services
- Database persistence

### V2+ (Future)
- Multi-agent support
- Custom sentiment models
- Integration with popular support platforms
- Advanced analytics and reporting
- Team collaboration features

## 🔒 Security Considerations

- Configuration is stored in browser localStorage (client-side only in MVP)
- No sensitive data is transmitted in the demo
- Voice recording is processed client-side
- In production, implement proper authentication and encryption

## 📄 License

MIT

## 🤝 Support

For questions or issues, please refer to the inline code documentation and component comments.
