import { Sentiment } from '@/types/ticket';

interface SentimentBadgeProps {
  sentiment: Sentiment;
}

const config: Record<Sentiment, { label: string; emoji: string; className: string }> = {
  negative: { label: 'Negative', emoji: '😟', className: 'bg-sentiment-negative-bg text-sentiment-negative' },
  positive: { label: 'Positive', emoji: '😊', className: 'bg-sentiment-positive-bg text-sentiment-positive' },
  neutral: { label: 'Neutral', emoji: '😐', className: 'bg-sentiment-neutral-bg text-sentiment-neutral' },
};

const SentimentBadge = ({ sentiment }: SentimentBadgeProps) => {
  const c = config[sentiment];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${c.className}`}>
      {c.emoji} {c.label}
    </span>
  );
};

export default SentimentBadge;
