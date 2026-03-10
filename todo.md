# AI Support Copilot - Metrics Dashboard TODO

## Backend Implementation
- [x] Create metrics event logging schema in drizzle/schema.ts
- [x] Implement event logging API endpoint (POST /api/metrics/log)
- [x] Implement metrics overview API endpoint (GET /api/metrics/overview)
- [x] Create database query helpers in server/db.ts
- [x] Create tRPC procedures for metrics in server/routers.ts

## Frontend - Dashboard UI
- [x] Create dashboard page component (client/src/pages/Dashboard.tsx)
- [x] Build filter controls (date range, channel, language, service label)
- [x] Implement KPI cards component
- [x] Create line chart for interactions/sentiment trends
- [x] Create bar chart for service label breakdown
- [x] Create pie/donut chart for sentiment distribution
- [x] Create language split visualization

## Frontend - Analytics Tables
- [x] Build "Top Negative Labels" table
- [x] Build "Recent Escalation Sessions" table
- [x] Add table filtering and sorting

## Integration
- [ ] Update ChatPanel to log events on message send
- [ ] Add event logging to voice demo
- [ ] Test event logging flow end-to-end

## Testing & Polish
- [x] Write vitest tests for metrics API
- [x] Write vitest tests for event logging
- [ ] Test dashboard with various date ranges and filters
- [x] Verify calculations (negative rate, avg sentiment, etc.)
- [x] Handle empty states and loading states

## Completed Features
- [x] Project upgraded to web-db-user (database + server + auth)
- [x] Fixed Home.tsx import issues


## Chatbot Implementation (New)
- [x] Create chatbot service with rule-based classification logic
- [x] Implement language detection (Vietnamese/English)
- [x] Implement service label detection with keyword matching
- [x] Implement sentiment analysis with keyword-based scoring
- [x] Implement scenario detection (REQUEST_SERVICE, REACT_TO_ORDER_INFO, CLARIFICATION)
- [x] Create template response system for all scenarios and languages
- [x] Integrate chatbot into Chat interface
- [x] Build OrderInfoPopup component
- [x] Add UI action handlers (OPEN_ORDER_INFO_POPUP)
- [x] Build clarification menu component
- [x] Write vitest tests for chatbot logic
- [x] Test all scenarios and language combinations
