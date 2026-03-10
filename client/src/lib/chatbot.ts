/**
 * Rule-based Customer Support Chatbot Service
 * Handles service label classification, sentiment analysis, scenario detection, and template responses
 */

export type Language = 'vi' | 'en';
export type ServiceLabel = 1 | 2 | 3 | 4 | 5 | 6;
export type Scenario = 'REQUEST_SERVICE' | 'REACT_TO_ORDER_INFO' | 'CLARIFICATION';
export type SentimentLabel = 'negative' | 'neutral' | 'positive';

export interface SentimentResult {
  label: SentimentLabel;
  score: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
}

export interface ChatbotResponse {
  language: Language;
  scenario: Scenario;
  service_label: ServiceLabel | null;
  label_name: string | null;
  sentiment: SentimentResult;
  ui_actions: Array<{ type: string; template: string }>;
  bot_message: string;
  needs_clarification: boolean;
  menu_options?: Array<{ n: ServiceLabel; vi: string; en: string }>;
}

// Service label definitions
const SERVICE_LABELS_MAP: Record<ServiceLabel, { vi: string; en: string; keywords_vi: string[]; keywords_en: string[] }> = {
  1: {
    vi: 'Tra cứu đơn hàng',
    en: 'Order lookup',
    keywords_vi: ['tra cứu đơn', 'kiểm tra đơn', 'đơn hàng', 'mã đơn', 'tracking', 'giao tới đâu', 'trạng thái đơn', 'chưa nhận'],
    keywords_en: ['order status', 'track', 'tracking number', 'where is my order', 'delivery status', 'eta', "hasn't arrived"],
  },
  2: {
    vi: 'Đổi trả / Hoàn tiền / Hủy đơn',
    en: 'Return/Exchange',
    keywords_vi: ['đổi trả', 'trả hàng', 'hoàn tiền', 'refund', 'hủy đơn', 'giao nhầm', 'thiếu hàng'],
    keywords_en: ['return', 'exchange', 'refund', 'cancel', 'wrong item', 'missing item'],
  },
  3: {
    vi: 'Bảo hành',
    en: 'Warranty',
    keywords_vi: ['bảo hành', 'kích hoạt bảo hành', 'tra cứu bảo hành', 'serial', 's/n', 'trung tâm bảo hành'],
    keywords_en: ['warranty', 'claim', 'service center', 'serial number'],
  },
  4: {
    vi: 'Giá / Thông tin sản phẩm',
    en: 'Pricing/Product info',
    keywords_vi: ['giá', 'khuyến mãi', 'thông số', 'tính năng', 'còn hàng'],
    keywords_en: ['price', 'discount', 'promotion', 'specs', 'features', 'in stock'],
  },
  5: {
    vi: 'Lỗi kỹ thuật',
    en: 'Technical issue',
    keywords_vi: ['lỗi', 'hỏng', 'không hoạt động', 'nóng máy', 'pin tụt', 'crash', 'không đăng nhập'],
    keywords_en: ['not working', 'broken', 'overheating', 'battery drains', 'crash', "can't login"],
  },
  6: {
    vi: 'Gặp nhân viên',
    en: 'Talk to an agent',
    keywords_vi: ['gặp nhân viên', 'tư vấn viên', 'người thật', 'gọi lại'],
    keywords_en: ['talk to an agent', 'human', 'representative', 'call me', 'agent'],
  },
};

// Sentiment keywords
const SENTIMENT_KEYWORDS = {
  negative_vi: ['tệ', 'dở', 'xấu', 'tạm', 'thất vọng', 'bực', 'tức', 'khó chịu', 'không hài lòng', 'lỗi', 'hỏng', 'trễ'],
  positive_vi: ['tốt', 'tuyệt', 'ổn', 'ok', 'hài lòng', 'cảm ơn', 'ưng'],
  negative_en: ['bad', 'terrible', 'awful', 'disappointed', 'angry', 'upset', 'late', 'broken'],
  positive_en: ['good', 'great', 'awesome', 'satisfied', 'thanks', 'love'],
};

// Evaluation keywords for Scenario B detection
const EVALUATION_KEYWORDS = {
  vi: ['tốt', 'tệ', 'tạm', 'ok', 'ổn', 'xấu', 'dở', 'hài lòng', 'không hài lòng'],
  en: ['good', 'bad', 'terrible', 'okay', 'satisfied', 'disappointed', 'happy', 'unhappy'],
};

// Template responses
const TEMPLATES = {
  scenario_a_vi: 'Mình đã mở thông tin đơn cho bạn. Bạn cho mình xin mã đơn / email / SĐT đặt hàng để mình kiểm tra và hỗ trợ nhanh nhất nhé.',
  scenario_a_en: "I've opened your order details. Please share your order ID / purchase email / phone so I can check and help quickly.",
  scenario_b_positive_vi: 'Cảm ơn bạn đã phản hồi! Mình rất vui khi nghe điều đó. Mình đã mở lại thông tin đơn để bạn tiện theo dõi.',
  scenario_b_positive_en: "Thanks for the feedback! Glad to hear that. I've opened the order details again so you can review them.",
  scenario_b_negative_vi: 'Mình xin lỗi vì trải nghiệm chưa tốt. Mình đã mở lại thông tin đơn để kiểm tra nhanh và hỗ trợ bạn ngay.',
  scenario_b_negative_en: "Sorry about the experience. I've opened the order details again so I can check quickly and help you right away.",
  scenario_b_neutral_vi: 'Mình đã ghi nhận. Mình đã mở lại thông tin đơn để bạn tiện theo dõi.',
  scenario_b_neutral_en: "Noted. I've opened the order details again so you can review them.",
};

/**
 * Detect language from message (simple heuristic)
 */
function detectLanguage(message: string): Language {
  // Vietnamese characters
  const vietnameseChars = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  return vietnameseChars.test(message) ? 'vi' : 'en';
}

/**
 * Detect sentiment from message
 */
function detectSentiment(message: string, language: Language): SentimentResult {
  const lowerMessage = message.toLowerCase();
  const keywords = language === 'vi' ? SENTIMENT_KEYWORDS : { negative_vi: [], positive_vi: [], negative_en: SENTIMENT_KEYWORDS.negative_en, positive_en: SENTIMENT_KEYWORDS.positive_en };

  const negativeKeywords = language === 'vi' ? SENTIMENT_KEYWORDS.negative_vi : SENTIMENT_KEYWORDS.negative_en;
  const positiveKeywords = language === 'vi' ? SENTIMENT_KEYWORDS.positive_vi : SENTIMENT_KEYWORDS.positive_en;

  let negativeCount = 0;
  let positiveCount = 0;

  negativeKeywords.forEach(kw => {
    if (lowerMessage.includes(kw)) negativeCount++;
  });

  positiveKeywords.forEach(kw => {
    if (lowerMessage.includes(kw)) positiveCount++;
  });

  let label: SentimentLabel = 'neutral';
  let score = 0;
  let confidence = 0;

  if (negativeCount > positiveCount) {
    label = 'negative';
    score = -Math.min(negativeCount * 0.3, 1.0);
    confidence = Math.min(negativeCount * 0.2, 1.0);
  } else if (positiveCount > negativeCount) {
    label = 'positive';
    score = Math.min(positiveCount * 0.3, 1.0);
    confidence = Math.min(positiveCount * 0.2, 1.0);
  } else {
    label = 'neutral';
    score = 0;
    confidence = 0.5;
  }

  return { label, score, confidence };
}

/**
 * Detect service label from message
 */
function detectServiceLabel(message: string, language: Language): ServiceLabel | null {
  const lowerMessage = message.toLowerCase();

  // Check for human handoff first (override)
  const humanHandoffKeywords = language === 'vi' ? SERVICE_LABELS_MAP[6].keywords_vi : SERVICE_LABELS_MAP[6].keywords_en;
  if (humanHandoffKeywords.some(kw => lowerMessage.includes(kw))) {
    return 6;
  }

  // Check other labels
  for (let i = 1; i <= 5; i++) {
    const label = i as ServiceLabel;
    const keywords = language === 'vi' ? SERVICE_LABELS_MAP[label].keywords_vi : SERVICE_LABELS_MAP[label].keywords_en;
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      return label;
    }
  }

  return null;
}

/**
 * Detect scenario from message and detected label
 */
function detectScenario(message: string, serviceLabel: ServiceLabel | null, language: Language): Scenario {
  const lowerMessage = message.toLowerCase();

  // If service label detected, it's REQUEST_SERVICE
  if (serviceLabel) {
    return 'REQUEST_SERVICE';
  }

  // Check for evaluation keywords (Scenario B)
  const evaluationKeywords = language === 'vi' ? EVALUATION_KEYWORDS.vi : EVALUATION_KEYWORDS.en;
  if (evaluationKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'REACT_TO_ORDER_INFO';
  }

  // Too short or unclear => CLARIFICATION
  if (message.length < 3 || lowerMessage === 'help' || lowerMessage === '??' || lowerMessage === 'lỗi' || lowerMessage === 'đơn hàng') {
    return 'CLARIFICATION';
  }

  // Default to CLARIFICATION if unclear
  return 'CLARIFICATION';
}

/**
 * Get template response based on scenario, sentiment, and language
 */
function getTemplateResponse(scenario: Scenario, sentiment: SentimentLabel, language: Language): string {
  if (scenario === 'REQUEST_SERVICE') {
    return language === 'vi' ? TEMPLATES.scenario_a_vi : TEMPLATES.scenario_a_en;
  }

  if (scenario === 'REACT_TO_ORDER_INFO') {
    if (sentiment === 'positive') {
      return language === 'vi' ? TEMPLATES.scenario_b_positive_vi : TEMPLATES.scenario_b_positive_en;
    } else if (sentiment === 'negative') {
      return language === 'vi' ? TEMPLATES.scenario_b_negative_vi : TEMPLATES.scenario_b_negative_en;
    } else {
      return language === 'vi' ? TEMPLATES.scenario_b_neutral_vi : TEMPLATES.scenario_b_neutral_en;
    }
  }

  return '';
}

/**
 * Get clarification menu options
 */
function getClarificationMenu() {
  return [
    { n: 1 as ServiceLabel, vi: 'Tra cứu đơn hàng', en: 'Order lookup' },
    { n: 2 as ServiceLabel, vi: 'Đổi trả', en: 'Return/Exchange' },
    { n: 3 as ServiceLabel, vi: 'Bảo hành', en: 'Warranty' },
    { n: 4 as ServiceLabel, vi: 'Giá/ Thông tin sản phẩm', en: 'Pricing/Product info' },
    { n: 5 as ServiceLabel, vi: 'Lỗi kỹ thuật', en: 'Technical issue' },
    { n: 6 as ServiceLabel, vi: 'Gặp nhân viên', en: 'Talk to an agent' },
  ];
}

/**
 * Main chatbot processor
 */
export function processChatbotMessage(userMessage: string): ChatbotResponse {
  const language = detectLanguage(userMessage);
  const sentiment = detectSentiment(userMessage, language);
  const serviceLabel = detectServiceLabel(userMessage, language);
  const scenario = detectScenario(userMessage, serviceLabel, language);

  const needsClarification = scenario === 'CLARIFICATION';
  const botMessage = needsClarification ? '' : getTemplateResponse(scenario, sentiment.label, language);

  const uiActions = scenario === 'CLARIFICATION' ? [] : [{ type: 'OPEN_ORDER_INFO_POPUP', template: 'ORDER_INFO_V1' }];

  const response: ChatbotResponse = {
    language,
    scenario,
    service_label: serviceLabel,
    label_name: serviceLabel ? Object.values(SERVICE_LABELS_MAP)[serviceLabel - 1]?.vi : null,
    sentiment,
    ui_actions: uiActions,
    bot_message: botMessage,
    needs_clarification: needsClarification,
  };

  if (needsClarification) {
    response.menu_options = getClarificationMenu();
  }

  return response;
}

/**
 * Get service label name
 */
export function getServiceLabelName(label: ServiceLabel, language: Language): string {
  return SERVICE_LABELS_MAP[label][language];
}

/**
 * Get all service labels
 */
export function getAllServiceLabels() {
  return SERVICE_LABELS_MAP;
}
