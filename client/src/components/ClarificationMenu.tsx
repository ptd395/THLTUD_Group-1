import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ServiceLabel } from '@/lib/chatbot';

interface ClarificationMenuProps {
  language: 'vi' | 'en';
  onSelect: (label: ServiceLabel) => void;
}

const MENU_OPTIONS: Array<{ n: ServiceLabel; vi: string; en: string }> = [
  { n: 1, vi: 'Tra cứu đơn hàng', en: 'Order lookup' },
  { n: 2, vi: 'Đổi trả', en: 'Return/Exchange' },
  { n: 3, vi: 'Bảo hành', en: 'Warranty' },
  { n: 4, vi: 'Giá/ Thông tin sản phẩm', en: 'Pricing/Product info' },
  { n: 5, vi: 'Lỗi kỹ thuật', en: 'Technical issue' },
  { n: 6, vi: 'Gặp nhân viên', en: 'Talk to an agent' },
];

export default function ClarificationMenu({ language, onSelect }: ClarificationMenuProps) {
  const isVietnamese = language === 'vi';

  return (
    <Card className="p-4 bg-card border-border">
      <p className="text-sm font-medium text-foreground mb-3">
        {isVietnamese ? 'Bạn cần hỗ trợ về vấn đề nào?' : 'What can I help you with?'}
      </p>
      <div className="grid grid-cols-1 gap-2">
        {MENU_OPTIONS.map((option) => (
          <Button
            key={option.n}
            onClick={() => onSelect(option.n)}
            variant="outline"
            className="justify-start text-left h-auto py-2 px-3"
          >
            <span className="font-semibold mr-2">{option.n}.</span>
            {isVietnamese ? option.vi : option.en}
          </Button>
        ))}
      </div>
    </Card>
  );
}
