import { describe, it, expect } from 'vitest';
import { processChatbotMessage } from './chatbot';

describe('Chatbot Service', () => {
  describe('Language Detection', () => {
    it('should detect Vietnamese language', () => {
      const response = processChatbotMessage('Tôi muốn tra cứu đơn hàng');
      expect(response.language).toBe('vi');
    });

    it('should detect English language', () => {
      const response = processChatbotMessage('I want to track my order');
      expect(response.language).toBe('en');
    });
  });

  describe('Service Label Detection', () => {
    it('should detect order lookup (label 1)', () => {
      const response = processChatbotMessage('tra cứu đơn hàng');
      expect(response.service_label).toBe(1);
      expect(response.label_name).toBe('Tra cứu đơn hàng');
    });

    it('should detect return/exchange (label 2)', () => {
      const response = processChatbotMessage('Tôi muốn đổi trả sản phẩm');
      expect(response.service_label).toBe(2);
    });

    it('should detect warranty (label 3)', () => {
      const response = processChatbotMessage('bảo hành sản phẩm');
      expect(response.service_label).toBe(3);
    });

    it('should detect pricing/product info (label 4)', () => {
      const response = processChatbotMessage('Giá của sản phẩm bao nhiêu?');
      expect(response.service_label).toBe(4);
    });

    it('should detect technical issue (label 5)', () => {
      const response = processChatbotMessage('Sản phẩm của tôi bị lỗi');
      expect(response.service_label).toBe(5);
    });

    it('should detect human handoff (label 6) - override', () => {
      const response = processChatbotMessage('Tôi muốn gặp nhân viên');
      expect(response.service_label).toBe(6);
    });

    it('should detect human handoff in English', () => {
      const response = processChatbotMessage('I want to talk to an agent');
      expect(response.service_label).toBe(6);
    });
  });

  describe('Sentiment Analysis', () => {
    it('should detect positive sentiment in Vietnamese', () => {
      const response = processChatbotMessage('Sản phẩm rất tốt, tôi rất hài lòng');
      expect(response.sentiment.label).toBe('positive');
      expect(response.sentiment.score).toBeGreaterThan(0);
    });

    it('should detect negative sentiment in Vietnamese', () => {
      const response = processChatbotMessage('Sản phẩm tệ lắm, tôi rất thất vọng');
      expect(response.sentiment.label).toBe('negative');
      expect(response.sentiment.score).toBeLessThan(0);
    });

    it('should detect positive sentiment in English', () => {
      const response = processChatbotMessage('Great product, very satisfied');
      expect(response.sentiment.label).toBe('positive');
      expect(response.sentiment.score).toBeGreaterThan(0);
    });

    it('should detect negative sentiment in English', () => {
      const response = processChatbotMessage('Terrible product, very disappointed');
      expect(response.sentiment.label).toBe('negative');
      expect(response.sentiment.score).toBeLessThan(0);
    });

    it('should detect neutral sentiment', () => {
      const response = processChatbotMessage('Tôi muốn biết thông tin sản phẩm');
      expect(response.sentiment.label).toBe('neutral');
      expect(response.sentiment.score).toBe(0);
    });
  });

  describe('Scenario Detection', () => {
    it('should detect REQUEST_SERVICE scenario', () => {
      const response = processChatbotMessage('Tôi muốn tra cứu đơn hàng');
      expect(response.scenario).toBe('REQUEST_SERVICE');
    });

    it('should detect REACT_TO_ORDER_INFO scenario', () => {
      const response = processChatbotMessage('Sản phẩm rất tốt');
      expect(response.scenario).toBe('REACT_TO_ORDER_INFO');
    });

    it('should detect CLARIFICATION scenario for unclear message', () => {
      const response = processChatbotMessage('help');
      expect(response.scenario).toBe('CLARIFICATION');
    });

    it('should detect CLARIFICATION scenario for short message', () => {
      const response = processChatbotMessage('??');
      expect(response.scenario).toBe('CLARIFICATION');
    });
  });

  describe('UI Actions', () => {
    it('should include OPEN_ORDER_INFO_POPUP for REQUEST_SERVICE', () => {
      const response = processChatbotMessage('tra cứu đơn hàng');
      expect(response.ui_actions).toHaveLength(1);
      expect(response.ui_actions[0].type).toBe('OPEN_ORDER_INFO_POPUP');
      expect(response.ui_actions[0].template).toBe('ORDER_INFO_V1');
    });

    it('should include OPEN_ORDER_INFO_POPUP for REACT_TO_ORDER_INFO', () => {
      const response = processChatbotMessage('Sản phẩm tốt');
      expect(response.ui_actions).toHaveLength(1);
      expect(response.ui_actions[0].type).toBe('OPEN_ORDER_INFO_POPUP');
    });

    it('should NOT include UI actions for CLARIFICATION', () => {
      const response = processChatbotMessage('help');
      expect(response.ui_actions).toHaveLength(0);
    });
  });

  describe('Bot Messages', () => {
    it('should return template message for REQUEST_SERVICE in Vietnamese', () => {
      const response = processChatbotMessage('tra cứu đơn hàng');
      expect(response.bot_message).toContain('Mình đã mở thông tin đơn');
      expect(response.bot_message.length).toBeGreaterThan(0);
    });

    it('should return template message for REQUEST_SERVICE in English', () => {
      const response = processChatbotMessage('track my order');
      expect(response.bot_message).toContain("I've opened your order details");
    });

    it('should return positive template for REACT_TO_ORDER_INFO with positive sentiment', () => {
      const response = processChatbotMessage('Sản phẩm rất tốt');
      expect(response.bot_message).toContain('Cảm ơn');
    });

    it('should return negative template for REACT_TO_ORDER_INFO with negative sentiment', () => {
      const response = processChatbotMessage('Sản phẩm tệ lắm');
      expect(response.bot_message).toContain('xin lỗi');
    });

    it('should return empty message for CLARIFICATION', () => {
      const response = processChatbotMessage('help');
      expect(response.bot_message).toBe('');
    });
  });

  describe('Clarification Menu', () => {
    it('should include menu options for CLARIFICATION', () => {
      const response = processChatbotMessage('help');
      expect(response.needs_clarification).toBe(true);
      expect(response.menu_options).toBeDefined();
      expect(response.menu_options).toHaveLength(6);
    });

    it('should have correct menu structure', () => {
      const response = processChatbotMessage('help');
      const menu = response.menu_options;
      expect(menu[0].n).toBe(1);
      expect(menu[0].vi).toBe('Tra cứu đơn hàng');
      expect(menu[0].en).toBe('Order lookup');
    });

    it('should NOT include menu options for REQUEST_SERVICE', () => {
      const response = processChatbotMessage('tra cứu đơn hàng');
      expect(response.needs_clarification).toBe(false);
      expect(response.menu_options).toBeUndefined();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed Vietnamese and English', () => {
      const response = processChatbotMessage('I want to track my order - tra cứu đơn hàng');
      expect(response.language).toBe('vi');
      expect(response.service_label).toBe(1);
    });

    it('should prioritize human handoff over other labels', () => {
      const response = processChatbotMessage('Tôi muốn gặp nhân viên để tra cứu đơn hàng');
      expect(response.service_label).toBe(6);
    });

    it('should handle multiple sentiment keywords', () => {
      const response = processChatbotMessage('Sản phẩm tệ, giao hàng trễ, tôi rất bực');
      expect(response.sentiment.label).toBe('negative');
    });

    it('should handle empty or whitespace message', () => {
      const response = processChatbotMessage('   ');
      expect(response.scenario).toBe('CLARIFICATION');
    });
  });

  describe('Response Structure', () => {
    it('should always return valid ChatbotResponse structure', () => {
      const response = processChatbotMessage('Tôi muốn tra cứu đơn hàng');

      expect(response).toHaveProperty('language');
      expect(response).toHaveProperty('scenario');
      expect(response).toHaveProperty('service_label');
      expect(response).toHaveProperty('label_name');
      expect(response).toHaveProperty('sentiment');
      expect(response).toHaveProperty('ui_actions');
      expect(response).toHaveProperty('bot_message');
      expect(response).toHaveProperty('needs_clarification');
    });

    it('should have valid sentiment structure', () => {
      const response = processChatbotMessage('Sản phẩm tốt');
      const sentiment = response.sentiment;

      expect(sentiment).toHaveProperty('label');
      expect(sentiment).toHaveProperty('score');
      expect(sentiment).toHaveProperty('confidence');
      expect(['positive', 'neutral', 'negative']).toContain(sentiment.label);
      expect(sentiment.score).toBeGreaterThanOrEqual(-1);
      expect(sentiment.score).toBeLessThanOrEqual(1);
      expect(sentiment.confidence).toBeGreaterThanOrEqual(0);
      expect(sentiment.confidence).toBeLessThanOrEqual(1);
    });
  });
});
