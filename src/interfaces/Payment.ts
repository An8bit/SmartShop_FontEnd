export interface Address {
  id?: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault: boolean;
  receiverName?: string;
  receiverPhone?: string;
  // API response fields
  addressId?: number;
  userId?: number;
}

export interface ShippingFee {
  baseShipping: number;
  expressShipping: number;
  freeShippingThreshold: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface OrderItem {
  productId: number;
  productName?: string;
  quantity: number;
  price: number;
  variantId?: number;
  variantName?: string;
  imageUrl?: string;
  // API response fields
  orderItemId?: number;
  productImage?: string;
  productVariantId?: number;
  variantInfo?: string;
  totalPrice?: number;
}

export interface OrderSummary {
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  tax: number;
}

export interface CreateOrderDto {
  shippingAddressId: number;
  paymentMethod: string;
  cartItemIds: number[];
  orderNotes: string;
}

export interface Order {
  orderId: number;
  orderNumber?: string;
  userId: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'Pending';
  paymentMethod: string;
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  shippingAddress: Address;
  items?: OrderItem[]; // Optional for backward compatibility
  orderItems?: OrderItem[]; // API response field
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  tax?: number;
  total?: number;
  totalAmount?: number; // API response field
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  orderDate?: string; // API response field
}

export interface Invoice {
  invoiceId: number;
  orderId: number;
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: Address;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

export interface BankTransferInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrCodeUrl?: string;
}
