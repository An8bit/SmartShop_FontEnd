import ApiService from './apiService';
import { 
  Address, 
  ShippingFee, 
  PaymentMethod, 
  OrderSummary, 
  CreateOrderDto, 
  Order, 
  Invoice, 
  BankTransferInfo 
} from '../interfaces/Payment';
import { Console } from 'console';

class PaymentService {
  // ================== ADDRESS MANAGEMENT ==================
  
  /**
   * Lấy danh sách địa chỉ của người dùng
   */
  static async getUserAddresses(): Promise<Address[]> {
    try {
      const response = await ApiService.get<Address[]>('user/addresses');
        console.log('Fetched user addresses:', response);
      return response;
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      throw error;
    }
  }

  /**
   * Lấy địa chỉ mặc định của người dùng
   */
  static async getDefaultAddress(): Promise<Address | null> {
    try {
      const addresses = await this.getUserAddresses();
      return addresses.find(addr => addr.isDefault) || null;
    } catch (error) {
      console.error('Error fetching default address:', error);
      return null;
    }
  }

  /**
   * Thêm/Cập nhật địa chỉ của user hiện tại
   */
  static async addAddress(address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
  }): Promise<void> {
    try {
      await ApiService.post('User/AddAddress', address);
    } catch (error) {
      console.error('Error adding/updating address:', error);
      throw error;
    }
  }

  /**
   * Cập nhật địa chỉ
   */
  static async updateAddress(addressId: number, address: Partial<Address>): Promise<Address> {
    try {
      const response = await ApiService.put<{ address: Address }>(`user/addresses/${addressId}`, address);
      return response.address;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  /**
   * Cập nhật địa chỉ của user hiện tại (alias của addAddress)
   */
  static async updateUserAddress(address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
  }): Promise<void> {
    return this.addAddress(address);
  }

  /**
   * Xóa địa chỉ
   */
  static async deleteAddress(addressId: number): Promise<void> {
    try {
      await ApiService.delete(`user/addresses/${addressId}`);
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  /**
   * Đặt địa chỉ làm mặc định
   */
  static async setDefaultAddress(addressId: number): Promise<void> {
    try {
      await ApiService.put(`user/addresses/${addressId}/default`, {});
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  // ================== SHIPPING CALCULATION ==================

  /**
   * Tính phí ship dựa trên địa chỉ và giỏ hàng
   */
  static async calculateShippingFee(addressId: number, cartTotal: number): Promise<ShippingFee> {
    try {
      const response = await ApiService.post<{ shipping: ShippingFee }>('shipping/calculate', {
        addressId,
        cartTotal
      });
      return response.shipping;
    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      // Trả về phí ship mặc định nếu API lỗi
      return {
        baseShipping: 30000,
        expressShipping: 50000,
        freeShippingThreshold: 500000
      };
    }
  }

  // ================== PAYMENT METHODS ==================

  /**
   * Lấy danh sách phương thức thanh toán
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await ApiService.get<{ methods: PaymentMethod[] }>('payment/methods');
      return response.methods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Trả về phương thức mặc định
      return [
        {
          id: 'bank_transfer',
          name: 'Chuyển khoản ngân hàng',
          description: 'Thanh toán qua chuyển khoản ngân hàng',
          enabled: true
        },
        {
          id: 'cash_on_delivery',
          name: 'Thanh toán khi nhận hàng',
          description: 'Thanh toán bằng tiền mặt khi nhận hàng',
          enabled: true
        }
      ];
    }
  }

  /**
   * Lấy thông tin chuyển khoản
   */
  static async getBankTransferInfo(): Promise<BankTransferInfo> {
    try {
      const response = await ApiService.get<{ bankInfo: BankTransferInfo }>('payment/bank-info');
      return response.bankInfo;
    } catch (error) {
      console.error('Error fetching bank transfer info:', error);
      // Trả về thông tin mặc định
      return {
        bankName: 'Ngân hàng Vietcombank',
        accountNumber: '1234567890',
        accountName: 'SMARTSHOP COMPANY',
        transferContent: 'Thanh toan don hang [ORDER_NUMBER]'
      };
    }
  }

  // ================== ORDER PROCESSING ==================

  /**
   * Tính tổng đơn hàng
   */
  static async calculateOrderSummary(
    cartItems: any[], 
    addressId: number, 
    discountCode?: string
  ): Promise<OrderSummary> {
    try {
      const response = await ApiService.post<{ summary: OrderSummary }>('orders/calculate', {
        items: cartItems,
        addressId,
        discountCode
      });
      return response.summary;
    } catch (error) {
      console.error('Error calculating order summary:', error);
      throw error;
    }
  }

  /**
   * Tạo đơn hàng mới - chỉ truyền request theo format API
   */
  static async createOrder(orderData: {
    shippingAddressId: number;
    paymentMethod: string;
    cartItemIds: number[];
    orderNotes?: string;
  }): Promise<Order> {
    try {
      console.log('Creating order with data:', orderData);
      
      // Request format theo API yêu cầu
      const requestPayload = {
        shippingAddressId: orderData.shippingAddressId,
        paymentMethod: orderData.paymentMethod,
        cartItemIds: orderData.cartItemIds,
        orderNotes: orderData.orderNotes || ""
      };
      
      const response = await ApiService.post<Order>('Order/OrderProduces', requestPayload);
      console.log('Order created successfully:', response);
      
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách đơn hàng của user
   */
  static async getOrder(): Promise<Order[]> {
    try {
      const response = await ApiService.get<Order[]>(`order`);  
      console.log('Fetched orders:', response);  
      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái thanh toán
   */
  static async updatePaymentStatus(orderId: number, status: string, transactionId?: string): Promise<void> {
    try {
      await ApiService.put(`orders/${orderId}/payment-status`, {
        status,
        transactionId
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // ================== INVOICE MANAGEMENT ==================

  /**
   * Tạo hóa đơn
   */
  static async generateInvoice(orderId: number): Promise<Invoice> {
    try {
      const response = await ApiService.post<{ invoice: Invoice }>(`orders/${orderId}/invoice`, {});
      return response.invoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  /**
   * Lấy hóa đơn theo orderId
   */
  static async getInvoice(orderId: number): Promise<Invoice> {
    try {
      const response = await ApiService.get<{ invoice: Invoice }>(`invoices/order/${orderId}`);
      return response.invoice;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  /**
   * Tải hóa đơn PDF
   */
  static async downloadInvoicePDF(invoiceId: number): Promise<Blob> {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download invoice PDF');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      throw error;
    }
  }

  // ================== UTILITY METHODS ==================

  /**
   * Xác nhận thanh toán chuyển khoản
   */
  static async confirmBankTransfer(orderId: number, transactionId: string, amount: number): Promise<void> {
    try {
      await ApiService.post(`orders/${orderId}/confirm-payment`, {
        transactionId,
        amount,
        paymentMethod: 'bank_transfer'
      });
    } catch (error) {
      console.error('Error confirming bank transfer:', error);
      throw error;
    }
  }

  /**
   * Hủy đơn hàng
   */
  static async cancelOrder(orderId: number, reason: string): Promise<void> {
    try {
      await ApiService.put(`orders/${orderId}/cancel`, { reason });
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử đơn hàng của người dùng
   */
  static async getUserOrders(page: number = 1, limit: number = 10): Promise<{ orders: Order[], total: number }> {
    try {
      const response = await ApiService.get<{ orders: Order[], total: number }>(`user/orders?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }
}

export default PaymentService;
