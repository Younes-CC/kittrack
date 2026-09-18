export const BOOK_CATEGORIES = [
  "Deen",
  "Persönlichkeitsentwicklung",
  "Finanzen",
  "Wirtschaft",
  "Geschichte",
  "Gesundheit",
  "Biografie",
  "Sonstiges",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export type DeliveryType = "pickup" | "shipping";

export type PaymentStatus = "not_required" | "pending" | "paid";

export type OrderStatus =
  | "reserved"
  | "awaiting_payment"
  | "paid"
  | "packing"
  | "shipped"
  | "ready_for_pickup"
  | "completed"
  | "cancelled"
  | "expired";

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  description: string | null;
  condition: string | null;
  image_url: string | null;
  stock_total: number;
  stock_available: number;
  active: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  public_order_number: string;
  delivery_type: DeliveryType;
  first_name: string;
  last_name: string;
  email: string;
  social_handle: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  shipping_price: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  reservation_expires_at: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string | null;
  book_title_snapshot: string;
  book_author_snapshot: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface Settings {
  id: true;
  shipping_price: number;
  payment_url: string | null;
  reservation_duration_hours: number;
  updated_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  reserved: "Reserviert",
  awaiting_payment: "Zahlung offen",
  paid: "Bezahlt",
  packing: "Wird verpackt",
  shipped: "Versendet",
  ready_for_pickup: "Abholbereit",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
  expired: "Abgelaufen",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  not_required: "Keine Zahlung nötig",
  pending: "Zahlung offen",
  paid: "Bezahlt",
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  pickup: "Abholung",
  shipping: "Versand",
};
