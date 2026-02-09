import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { useSentiment } from '@/contexts/SentimentContext';
import { detectLanguage, analyzeSentiment, getSentimentColor } from '@/lib/sentiment';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  language: 'vi' | 'en';
  sentiment?: {
    label: string;
    score: number;
  };
  timestamp: number;
}

export function ChatPanel() {
  const { config, addToHistory } = useSentiment();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [languageMode, setLanguageMode] = useState<'auto' | 'vi' | 'en'>('auto');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: input,
      language: languageMode === 'auto' ? detectLanguage(input) : (languageMode as 'vi' | 'en'),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Analyze sentiment
    const sentiment = analyzeSentiment(input, userMessage.language);
    addToHistory({
      text: input,
      language: userMessage.language,
      sentiment,
    });

    // Generate bot reply
    const botReply = generateBotReply(input, userMessage.language);

    const botMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'bot',
      text: botReply,
      language: userMessage.language,
      sentiment,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, botMessage]);
    setLoading(false);
  };

  const generateBotReply = (userText: string, language: 'vi' | 'en'): string => {
    const replies = {
      vi: [
        'Tôi hiểu vấn đề của bạn. Hãy cho tôi biết thêm chi tiết.',
        'Cảm ơn bạn đã liên hệ. Tôi sẽ giúp bạn giải quyết.',
        'Vấn đề này rất quan trọng. Chúng tôi sẽ xử lý ngay.',
      ],
      en: [
        'I understand your concern. Please tell me more details.',
        'Thank you for contacting us. I\'ll help you resolve this.',
        'This issue is important. We\'ll handle it right away.',
      ],
    };

    const replyList = replies[language];
    return replyList[Math.floor(Math.random() * replyList.length)];
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Demo Chat</h2>
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
                <p className="text-sm text-muted-foreground">Start a conversation to see sentiment analysis</p>
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
                        backgroundColor: getSentimentColor(message.sentiment.score),
                        color: 'white',
                        borderColor: getSentimentColor(message.sentiment.score),
                      }}
                    >
                      {message.sentiment.label}
                    </Badge>
                    <span className="text-xs opacity-75">
                      {message.sentiment.score.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground px-4 py-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
