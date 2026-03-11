import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ServiceLabel } from "@/lib/chatbot";
import { CalendarDays, PackageCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type OrderStatus = "processing" | "shipping" | "delivered";

type OrderDetails = {
  orderId: string;
  customerName: string;
  status: OrderStatus;
  etaDate: string;
  totalText: string;
  itemCount: number;
  items: string[];
  lastUpdated: string;
};

interface OrderInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  language: "vi" | "en";
  serviceLabel?: ServiceLabel | null;
  onOrderResolved?: (details: OrderDetails) => void;
}

const SERVICE_LABEL_NAME: Record<ServiceLabel, { vi: string; en: string }> = {
  1: { vi: "Tra cứu đơn hàng", en: "Order lookup" },
  2: { vi: "Đổi trả", en: "Return/Exchange" },
  3: { vi: "Bảo hành", en: "Warranty" },
  4: { vi: "Giá / Thông tin sản phẩm", en: "Pricing/Product" },
  5: { vi: "Lỗi kỹ thuật", en: "Technical issue" },
  6: { vi: "Gặp nhân viên", en: "Talk to an agent" },
};

function buildMockOrder(orderIdInput: string): OrderDetails {
  const normalizedOrderId =
    orderIdInput.trim() || `ORD-${Date.now().toString().slice(-6)}`;
  const seed = normalizedOrderId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const statuses: OrderStatus[] = ["processing", "shipping", "delivered"];
  const status = statuses[seed % statuses.length];
  const deliveryDayOffset = status === "delivered" ? 0 : (seed % 4) + 1;
  const eta = new Date(Date.now() + deliveryDayOffset * 24 * 60 * 60 * 1000);

  return {
    orderId: normalizedOrderId.toUpperCase(),
    customerName: "Nova Tech Customer",
    status,
    etaDate: eta.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    totalText: `$${(59 + (seed % 200)).toFixed(2)}`,
    itemCount: (seed % 3) + 1,
    items: [
      "Nova Smart Hub",
      "NovaCare Service Pack",
      "Premium Accessory Bundle",
    ].slice(0, (seed % 3) + 1),
    lastUpdated: new Date().toLocaleString(),
  };
}

export default function OrderInfoPopup({
  isOpen,
  onClose,
  language,
  serviceLabel,
  onOrderResolved,
}: OrderInfoPopupProps) {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const isVietnamese = language === "vi";

  useEffect(() => {
    if (!isOpen) {
      setOrderId("");
      setEmail("");
      setPhone("");
      setOrderDetails(null);
    }
  }, [isOpen]);

  const serviceLabelText = useMemo(() => {
    if (!serviceLabel) return null;
    return isVietnamese
      ? SERVICE_LABEL_NAME[serviceLabel].vi
      : SERVICE_LABEL_NAME[serviceLabel].en;
  }, [isVietnamese, serviceLabel]);

  const handleSubmit = () => {
    if (!orderId.trim() && !email.trim() && !phone.trim()) {
      alert(
        isVietnamese
          ? "Vui lòng nhập ít nhất một thông tin để tra cứu."
          : "Please provide at least one field to continue."
      );
      return;
    }

    const result = buildMockOrder(orderId);
    setOrderDetails(result);
    onOrderResolved?.(result);
  };

  const closePopup = () => {
    onClose();
  };

  const statusLabel = (status: OrderStatus) => {
    if (isVietnamese) {
      if (status === "processing") return "Đang xử lý";
      if (status === "shipping") return "Đang giao";
      return "Đã giao";
    }
    if (status === "processing") return "Processing";
    if (status === "shipping") return "Shipping";
    return "Delivered";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) closePopup();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isVietnamese ? "Thông tin đơn hàng" : "Order Information"}
          </DialogTitle>
          <DialogDescription>
            {isVietnamese
              ? "Màn hình dùng chung cho mọi tình huống hỗ trợ (label)."
              : "Shared order screen for all support labels and scenarios."}
          </DialogDescription>
        </DialogHeader>

        {!orderDetails ? (
          <div className="space-y-4">
            {serviceLabelText && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                {isVietnamese ? "Ngữ cảnh hỗ trợ: " : "Support context: "}
                <span className="font-semibold">{serviceLabelText}</span>
              </div>
            )}

            <div>
              <Label htmlFor="orderId" className="text-sm font-medium">
                {isVietnamese ? "Mã đơn hàng" : "Order ID"}
              </Label>
              <Input
                id="orderId"
                placeholder={isVietnamese ? "VD: ORD-123456" : "E.g., ORD-123456"}
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                {isVietnamese ? "Email" : "Email"}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={
                  isVietnamese ? "VD: you@example.com" : "E.g., you@example.com"
                }
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                {isVietnamese ? "Số điện thoại" : "Phone Number"}
              </Label>
              <Input
                id="phone"
                placeholder={isVietnamese ? "VD: 0912345678" : "E.g., +1234567890"}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isVietnamese ? "Xem thông tin đơn hàng" : "View order details"}
              </Button>
              <Button onClick={closePopup} variant="outline" className="flex-1">
                {isVietnamese ? "Đóng" : "Close"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 rounded-xl border border-border bg-muted/40 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {isVietnamese ? "Mã đơn" : "Order ID"}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {orderDetails.orderId}
                </p>
                <Badge
                  className="mt-1"
                  variant={
                    orderDetails.status === "delivered" ? "default" : "secondary"
                  }
                >
                  {statusLabel(orderDetails.status)}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {isVietnamese ? "Khách hàng" : "Customer"}
                </p>
                <p className="text-sm font-medium">{orderDetails.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {isVietnamese ? "Cập nhật lúc: " : "Updated: "}
                  {orderDetails.lastUpdated}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  {isVietnamese ? "Tổng giá trị" : "Order Total"}
                </p>
                <p className="text-xl font-bold">{orderDetails.totalText}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  {isVietnamese ? "Số mặt hàng" : "Item Count"}
                </p>
                <p className="text-xl font-bold">{orderDetails.itemCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  {isVietnamese ? "Ngày dự kiến" : "ETA"}
                </p>
                <p className="text-xl font-bold">{orderDetails.etaDate}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-3 font-medium">
                {isVietnamese ? "Sản phẩm trong đơn" : "Items in this order"}
              </p>
              <ul className="space-y-2">
                {orderDetails.items.map((item, idx) => (
                  <li key={`${item}-${idx}`} className="flex items-center gap-2 text-sm">
                    <PackageCheck className="h-4 w-4 text-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-3 font-medium">
                {isVietnamese ? "Tiến trình giao hàng" : "Delivery timeline"}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-green-600" />
                  <span>{isVietnamese ? "Đơn hàng đã xác nhận" : "Order confirmed"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays
                    className={`h-4 w-4 ${
                      orderDetails.status === "processing"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  />
                  <span>{isVietnamese ? "Đang xử lý kho" : "Warehouse processing"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck
                    className={`h-4 w-4 ${
                      orderDetails.status === "delivered"
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span>{isVietnamese ? "Đang vận chuyển" : "In transit"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setOrderDetails(null)}
                className="flex-1"
              >
                {isVietnamese ? "Tra cứu lại" : "Lookup again"}
              </Button>
              <Button onClick={closePopup} className="flex-1 bg-primary hover:bg-primary/90">
                {isVietnamese ? "Hoàn tất" : "Done"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
