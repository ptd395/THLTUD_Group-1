import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { X } from 'lucide-react';

interface OrderInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'vi' | 'en';
}

export default function OrderInfoPopup({ isOpen, onClose, language }: OrderInfoPopupProps) {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    // Log the order info for now
    console.log({ orderId, email, phone });
    // In production, this would call an API to fetch order details
    setOrderId('');
    setEmail('');
    setPhone('');
  };

  const isVietnamese = language === 'vi';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isVietnamese ? 'Thông tin đơn hàng' : 'Order Information'}
          </DialogTitle>
          <DialogDescription>
            {isVietnamese
              ? 'Vui lòng cung cấp thông tin để chúng tôi có thể kiểm tra đơn hàng của bạn'
              : 'Please provide your information so we can look up your order'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="orderId" className="text-sm font-medium">
              {isVietnamese ? 'Mã đơn hàng' : 'Order ID'}
            </Label>
            <Input
              id="orderId"
              placeholder={isVietnamese ? 'VD: ORD-123456' : 'E.g., ORD-123456'}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              {isVietnamese ? 'Email' : 'Email'}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={isVietnamese ? 'VD: you@example.com' : 'E.g., you@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              {isVietnamese ? 'Số điện thoại' : 'Phone Number'}
            </Label>
            <Input
              id="phone"
              placeholder={isVietnamese ? 'VD: 0912345678' : 'E.g., +1234567890'}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isVietnamese ? 'Kiểm tra' : 'Check'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              {isVietnamese ? 'Đóng' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
