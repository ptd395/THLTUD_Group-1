import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2, Mic } from 'lucide-react';
import { useSentiment } from '@/contexts/SentimentContext';
import { processChatbotMessage, type ChatbotResponse, type ServiceLabel } from '@/lib/chatbot';
import OrderInfoPopup from './OrderInfoPopup';
import ClarificationMenu from './ClarificationMenu';
import VoiceModal from './VoiceModal';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  language: 'vi' | 'en';
  sentiment?: {
    label: string;
    score: number;
  };
  serviceLabel?: ServiceLabel;
  timestamp: number;
  chatbotResponse?: ChatbotResponse;
}

export function ChatPanel() {
  const { addToHistory } = useSentiment();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [languageMode, setLanguageMode] = useState<'auto' | 'vi' | 'en'>('auto');
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [orderContextLabel, setOrderContextLabel] = useState<ServiceLabel | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'vi' | 'en'>('en');
  const [showClarification, setShowClarification] = useState(false);
  const [clarificationLanguage, setClarificationLanguage] = useState<'vi' | 'en'>('en');
  const [voiceLanguage, setVoiceLanguage] = useState<'vi' | 'en'>('en');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (overrideText?: string) => {
    const messageText = (overrideText ?? input).trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: messageText,
      language: languageMode === 'auto' ? detectLanguageSimple(messageText) : (languageMode as 'vi' | 'en'),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Process with chatbot
    const chatbotResponse = processChatbotMessage(messageText);
    setCurrentLanguage(chatbotResponse.language);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Add to history
    addToHistory({
      text: messageText,
      language: userMessage.language,
      sentiment: chatbotResponse.sentiment,
    });

    // Create bot message
    const botMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'bot',
      text: chatbotResponse.bot_message,
      language: chatbotResponse.language,
      sentiment: {
        label: chatbotResponse.sentiment.label,
        score: chatbotResponse.sentiment.score,
      },
      serviceLabel: chatbotResponse.service_label || undefined,
      timestamp: Date.now(),
      chatbotResponse,
    };

    setMessages(prev => [...prev, botMessage]);

    // Handle UI actions
    if (chatbotResponse.ui_actions.length > 0) {
      const action = chatbotResponse.ui_actions[0];
      if (action.type === 'OPEN_ORDER_INFO_POPUP') {
        setOrderContextLabel(chatbotResponse.service_label || null);
        setShowOrderPopup(true);
      }
    }

    // Show clarification menu if needed
    if (chatbotResponse.needs_clarification) {
      setShowClarification(true);
      setClarificationLanguage(chatbotResponse.language);
    }

    setLoading(false);
  };

  const handleClarificationSelect = (label: ServiceLabel) => {
    setShowClarification(false);
    const selectedOption = [
      { n: 1, vi: 'Tra cứu đơn hàng', en: 'Order lookup' },
      { n: 2, vi: 'Đổi trả', en: 'Return/Exchange' },
      { n: 3, vi: 'Bảo hành', en: 'Warranty' },
      { n: 4, vi: 'Giá/ Thông tin sản phẩm', en: 'Pricing/Product info' },
      { n: 5, vi: 'Lỗi kỹ thuật', en: 'Technical issue' },
      { n: 6, vi: 'Gặp nhân viên', en: 'Talk to an agent' },
    ].find(opt => opt.n === label);

    if (selectedOption) {
      const text = clarificationLanguage === 'vi' ? selectedOption.vi : selectedOption.en;
      void handleSendMessage(text);
    }
  };

  const getLabelName = (label: ServiceLabel, language: 'vi' | 'en') => {
    const labelMap: Record<ServiceLabel, { vi: string; en: string }> = {
      1: { vi: 'Tra cứu đơn hàng', en: 'Order lookup' },
      2: { vi: 'Đổi trả', en: 'Return/Exchange' },
      3: { vi: 'Bảo hành', en: 'Warranty' },
      4: { vi: 'Giá / Thông tin sản phẩm', en: 'Pricing/Product info' },
      5: { vi: 'Lỗi kỹ thuật', en: 'Technical issue' },
      6: { vi: 'Gặp nhân viên', en: 'Talk to an agent' },
    };

    return labelMap[label][language];
  };

  const handleOrderResolved = (details: {
    orderId: string;
    status: 'processing' | 'shipping' | 'delivered';
    etaDate: string;
  }) => {
    const statusText =
      currentLanguage === 'vi'
        ? details.status === 'processing'
          ? 'Đang xử lý'
          : details.status === 'shipping'
            ? 'Đang giao'
            : 'Đã giao'
        : details.status === 'processing'
          ? 'Processing'
          : details.status === 'shipping'
            ? 'Shipping'
            : 'Delivered';

    const labelText = orderContextLabel
      ? ` (${getLabelName(orderContextLabel, currentLanguage)})`
      : '';

    const summary =
      currentLanguage === 'vi'
        ? `Đã tra cứu đơn ${details.orderId}${labelText}. Trạng thái hiện tại: ${statusText}. Dự kiến: ${details.etaDate}.`
        : `Order ${details.orderId}${labelText} is now ${statusText}. Estimated date: ${details.etaDate}.`;

    const systemMessage: Message = {
      id: `msg-${Date.now()}-order`,
      role: 'bot',
      text: summary,
      language: currentLanguage,
      timestamp: Date.now(),
      serviceLabel: orderContextLabel || undefined,
    };

    setMessages(prev => [...prev, systemMessage]);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    setShowVoiceInput(false);
  };

  const getSentimentColor = (label: string): string => {
    switch (label) {
      case 'positive':
        return '#22c55e';
      case 'negative':
        return '#ef4444';
      case 'neutral':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Support Chat</h2>
          <Select value={languageMode} onValueChange={(value: any) => setLanguageMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto Detect</SelectItem>
              <SelectItem value="vi">Vietnamese</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          {languageMode === 'auto' ? 'Language: Auto-detected' : `Language: ${languageMode === 'vi' ? 'Vietnamese' : 'English'}`}
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center py-12">
              <div>
                <p className="text-muted-foreground mb-2">No messages yet</p>
                <p className="text-sm text-muted-foreground">Start a conversation with the support bot</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm break-words">{message.text}</p>
                {message.sentiment && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        backgroundColor: getSentimentColor(message.sentiment.label),
                        color: 'white',
                        borderColor: getSentimentColor(message.sentiment.label),
                      }}
                    >
                      {message.sentiment.label.toUpperCase()}
                    </Badge>
                    <span className="text-xs opacity-75">
                      {(message.sentiment.score * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {message.serviceLabel && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Label {message.serviceLabel}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}

          {showClarification && (
            <div className="flex justify-start">
              <ClarificationMenu
                language={clarificationLanguage}
                onSelect={handleClarificationSelect}
              />
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Voice Modal */}
      <VoiceModal
        isOpen={showVoiceInput}
        onClose={() => setShowVoiceInput(false)}
        onTranscript={handleVoiceTranscript}
        language={voiceLanguage}
        onLanguageChange={setVoiceLanguage}
      />

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={currentLanguage === 'vi' ? 'Nhập tin nhắn...' : 'Type a message...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSendMessage();
                }
              }}
              disabled={loading}
            />
            <Button
              onClick={() => {
                void handleSendMessage();
              }}
              disabled={loading || !input.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => setShowVoiceInput(true)}
              variant="outline"
              title="Voice input"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Order Info Popup */}
      <OrderInfoPopup
        isOpen={showOrderPopup}
        onClose={() => setShowOrderPopup(false)}
        language={currentLanguage}
        serviceLabel={orderContextLabel}
        onOrderResolved={handleOrderResolved}
      />


    </div>
  );
}

function detectLanguageSimple(message: string): 'vi' | 'en' {
  const vietnameseChars = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  return vietnameseChars.test(message) ? 'vi' : 'en';
}
