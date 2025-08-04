import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentService from '../../services/paymentService';
import { useToast } from '../../components/common/Toast/ToastProvider';
import { Address, PaymentMethod, OrderSummary, CreateOrderDto } from '../../interfaces/Payment';
import { CartItem } from '../../interfaces/Cart';
import AddressManagement from './AddressManagement';
import InvoicePreview from '../../components/common/InvoicePreview/InvoicePreview';
import Header from '../../components/features/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import styles from './CheckoutPage.module.css';
import cartService from '../../services/cartService';

interface CheckoutPageProps {
  cartItems?: CartItem[];
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems = [] }) => {
  const [step, setStep] = useState<'address' | 'shipping' | 'payment' | 'review'>('address');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddressManagement, setShowAddressManagement] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      
      // Ưu tiên lấy từ location state, fallback về cartService
      let items = location.state?.cartItems || cartItems;
      
      if (!items || items.length === 0) {
        // Nếu không có items từ props/location, load từ service
        const cart = await cartService.getCart();
        items = cart.items || [];
      }

      // Đảm bảo mỗi item có cartItemId (có thể dùng index nếu không có)
      const processedItems = items.map((item: any, index: number) => ({
        ...item,
        cartItemId: item.cartItemId || item.id || (index + 1)
      }));

      setCheckoutItems(processedItems);
      console.log('Processed checkout items:', processedItems);

      if (!processedItems || processedItems.length === 0) {
        showToast('Giỏ hàng trống, vui lòng thêm sản phẩm', 'warning');
        navigate('/cart');
        return;
      }

      // Khởi tạo checkout sau khi có items
      await initializeCheckout();
    } catch (error) {
      console.error('Error loading cart items:', error);
      showToast('Có lỗi khi tải giỏ hàng', 'error');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const initializeCheckout = async () => {
    try {
      // Lấy danh sách phương thức thanh toán
      const methods = await PaymentService.getPaymentMethods();
      setPaymentMethods(methods);
      setSelectedPaymentMethod(methods[0]?.id || '');

      // Kiểm tra địa chỉ mặc định
      const defaultAddress = await PaymentService.getDefaultAddress();
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        // Tính phí ship ngay khi có địa chỉ mặc định
        if (defaultAddress.id) {
          await calculateOrderSummary(defaultAddress.id);
        }
        setStep('payment'); // Nếu có địa chỉ, chuyển thẳng đến thanh toán
      } else {
        setStep('address'); // Nếu chưa có địa chỉ, yêu cầu nhập
      }

    } catch (error) {
      console.error('Error initializing checkout:', error);
      showToast('Có lỗi khi khởi tạo trang thanh toán', 'error');
    }
  };

  const handleAddressSelected = async (address: Address) => {
    setSelectedAddress(address);
    setShowAddressManagement(false);
    
    // Tính phí ship và tổng đơn hàng ngay lập tức
    if (address.id) {
      await calculateOrderSummary(address.id);
    }
    
    setStep('payment');
  };

  const calculateOrderSummary = async (addressId: number, discountCode?: string) => {
    try {
      setLoadingShipping(true);
      
      // Nếu addressId không hợp lệ, dùng fallback
      if (!addressId || addressId === 0) {
        console.log('Invalid addressId, using fallback calculation');
        throw new Error('Invalid address ID');
      }
      
      const summary = await PaymentService.calculateOrderSummary(
        checkoutItems,
        addressId,
        discountCode
      );
      setOrderSummary(summary);
    } catch (error) {
      console.error('Error calculating order summary:', error);
      // Tạo summary mặc định nếu API lỗi
      if (checkoutItems && checkoutItems.length > 0) {
        const subtotal = checkoutItems.reduce((sum: number, item: any) => {
          // Ưu tiên discountedPrice cho sản phẩm flashsale
          const itemPrice = item.product?.discountedPrice || item.price || 0;
          return sum + itemPrice * item.quantity;
        }, 0);
        setOrderSummary({
          items: checkoutItems.map((item: any) => ({
            productId: item.productId,
            productName: item.product?.name || `Product ${item.productId}`,
            quantity: item.quantity,
            price: item.product?.discountedPrice || item.price || 0,
            variantId: item.variant?.variantId,
            variantName: item.variant ? `${item.variant.color} - ${item.variant.size}` : undefined,
            imageUrl: item.product?.images?.[0]
          })),
          subtotal,
          shippingFee: 30000,
          discount: 0,
          tax: 0,
          total: subtotal + 30000
        });
      }
    } finally {
      setLoadingShipping(false);
    }
  };

  const createOrderSummaryFromItems = (): OrderSummary | null => {
    if (!checkoutItems || checkoutItems.length === 0) return null;
    
    const items = checkoutItems.map((item: any) => ({
      productId: item.productId,
      productName: item.product?.name || `Product ${item.productId}`,
      quantity: item.quantity,
      price: item.product?.discountedPrice || item.price || 0,
      variantId: item.variant?.variantId,
      variantName: item.variant ? `${item.variant.color} - ${item.variant.size}` : undefined,
      imageUrl: item.product?.images?.[0]
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = orderSummary?.shippingFee || 30000;
    const discount = 0;
    const tax = 0;
    const total = subtotal + shippingFee - discount + tax;
    
    return {
      items,
      subtotal,
      shippingFee,
      discount,
      tax,
      total
    };
  };

  const handleDownloadInvoice = async () => {
    try {
      // Mở print dialog cho người dùng in hoặc lưu PDF
      window.print();
      showToast('Hóa đơn đã sẵn sàng in/tải xuống!', 'success');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showToast('Có lỗi khi in hóa đơn', 'error');
    }
  };

  const handleCreateOrder = async () => {
    // Debug: kiểm tra từng điều kiện
    console.log('=== DEBUG CREATE ORDER ===');
    console.log('selectedAddress:', selectedAddress);
    console.log('selectedPaymentMethod:', selectedPaymentMethod);
    console.log('checkoutItems:', checkoutItems);
    
    if (!selectedAddress) {
      showToast('Vui lòng chọn địa chỉ giao hàng', 'warning');
      return;
    }
    
    // Nếu địa chỉ chưa có ID (địa chỉ mới), tạo ID tạm thời
    if (!selectedAddress.id) {
      console.log('Address missing ID, creating temporary ID');
      selectedAddress.id = Date.now(); // Tạo ID tạm thời
    }
    
    if (!selectedPaymentMethod) {
      showToast('Vui lòng chọn phương thức thanh toán', 'warning');
      return;
    }

    if (!checkoutItems || checkoutItems.length === 0) {
      showToast('Giỏ hàng trống, không thể đặt hàng', 'warning');
      return;
    }

    try {
      setLoading(true);

      // Lấy cartItemIds từ checkoutItems
      const cartItemIds = checkoutItems
        .map((item: any) => item.cartItemId || item.id)
        .filter(id => id); // Lọc bỏ undefined/null ids

      if (cartItemIds.length === 0) {
        showToast('Không thể xác định ID giỏ hàng, vui lòng thử lại', 'error');
        return;
      }

      const orderData: CreateOrderDto = {
        shippingAddressId: selectedAddress.id!,
        paymentMethod: selectedPaymentMethod,
        cartItemIds: cartItemIds,
        orderNotes: orderNotes || ''
      };

      console.log('Order data being sent:', orderData);
      
      const order = await PaymentService.createOrder(orderData);
      
      // Clear cart sau khi đặt hàng thành công
      try {
        await cartService.clearCart();
      } catch (clearError) {
        console.error('Error clearing cart:', clearError);
        // Không throw error vì đơn hàng đã tạo thành công
      }
      
      showToast('Đặt hàng thành công!', 'success');
      
      // Chuyển đến trang xác nhận đơn hàng
      navigate('/order-confirmation', { 
        state: { 
          orderId: order.orderId,
          paymentMethod: selectedPaymentMethod 
        } 
      });

    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Có lỗi khi đặt hàng, vui lòng thử lại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      <div className={`${styles.step} ${step === 'address' ? styles.active : styles.completed}`}>
        <span className={styles.stepNumber}>1</span>
        <span className={styles.stepLabel}>Địa chỉ</span>
      </div>
      <div className={`${styles.step} ${step === 'payment' ? styles.active : step === 'review' ? styles.completed : ''}`}>
        <span className={styles.stepNumber}>2</span>
        <span className={styles.stepLabel}>Thanh toán</span>
      </div>
      <div className={`${styles.step} ${step === 'review' ? styles.active : ''}`}>
        <span className={styles.stepNumber}>3</span>
        <span className={styles.stepLabel}>Xác nhận</span>
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className={styles.stepContent}>
      <h3>Chọn địa chỉ giao hàng</h3>
      {selectedAddress ? (
        <div className={styles.selectedAddress}>
          <div className={styles.addressInfo}>
            <h4>{selectedAddress.receiverName}</h4>
            <p>{selectedAddress.receiverPhone}</p>
            <p>{selectedAddress.addressLine1}</p>
            {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
            <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p>
          </div>
          <div className={styles.actions}>
            <button 
              onClick={() => setShowAddressManagement(true)}
              className={styles.changeButton}
            >
              Thay đổi địa chỉ
            </button>
            <button 
              onClick={() => {
                if (selectedAddress.id) {
                  calculateOrderSummary(selectedAddress.id);
                  setStep('payment');
                }
              }}
              className={styles.continueButton}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.noAddress}>
          <p>Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ để tiếp tục.</p>
          <button 
            onClick={() => setShowAddressManagement(true)}
            className={styles.addAddressButton}
          >
            Thêm địa chỉ
          </button>
        </div>
      )}

      {showAddressManagement && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <AddressManagement 
              onAddressSelected={handleAddressSelected}
              showSelectButton={true}
            />
            <button 
              onClick={() => setShowAddressManagement(false)}
              className={styles.closeButton}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentStep = () => (
    <div className={styles.stepContent}>
      <h3>Chọn phương thức thanh toán</h3>
      
      <div className={styles.paymentMethods}>
        {paymentMethods.map((method) => (
          <label key={method.id} className={styles.paymentMethod}>
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedPaymentMethod === method.id}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <div className={styles.methodInfo}>
              <h4>{method.name}</h4>
              <p>{method.description}</p>
            </div>
          </label>
        ))}
      </div>

      <div className={styles.orderNotes}>
        <h4>Ghi chú đơn hàng (tùy chọn)</h4>
        <textarea
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="Nhập ghi chú cho đơn hàng..."
          className={styles.notesInput}
        />
      </div>

      {loadingShipping ? (
        <div className={styles.orderSummary}>
          <h4>Đang tính phí vận chuyển...</h4>
          <div className={styles.loading}>
            <span>⏳ Vui lòng đợi...</span>
          </div>
        </div>
      ) : orderSummary ? (
        <div className={styles.orderSummary}>
          <h4>Tóm tắt đơn hàng</h4>
          <div className={styles.summaryRow}>
            <span>Tạm tính:</span>
            <span>{orderSummary.subtotal.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Phí vận chuyển:</span>
            <span>{orderSummary.shippingFee.toLocaleString('vi-VN')}₫</span>
          </div>
          {orderSummary.discount > 0 && (
            <div className={styles.summaryRow}>
              <span>Giảm giá:</span>
              <span>-{orderSummary.discount.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Tổng cộng:</span>
            <span>{orderSummary.total.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
      ) : (
        <div className={styles.orderSummary}>
          <h4>Tóm tắt đơn hàng</h4>
          <p>Vui lòng chọn địa chỉ để tính phí vận chuyển</p>
        </div>
      )}

      <div className={styles.actions}>
        <button 
          onClick={() => setStep('address')}
          className={styles.backButton}
        >
          Quay lại
        </button>
        <button 
          onClick={() => setStep('review')}
          className={styles.continueButton}
          disabled={!selectedPaymentMethod}
        >
          Xem lại đơn hàng
        </button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className={styles.stepContent}>
      <h3>Xem lại đơn hàng</h3>
      
      <div className={styles.reviewSection}>
        <div className={styles.reviewItem}>
          <h4>Địa chỉ giao hàng</h4>
          {selectedAddress && (
            <div className={styles.addressSummary}>
              <p><strong>{selectedAddress.receiverName}</strong> | {selectedAddress.receiverPhone}</p>
              <p>{selectedAddress.addressLine1}</p>
              {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
              <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p>
            </div>
          )}
        </div>

        <div className={styles.reviewItem}>
          <h4>Phương thức thanh toán</h4>
          <p>{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</p>
        </div>

        {checkoutItems && checkoutItems.length > 0 && (
          <div className={styles.reviewItem}>
            <h4>Sản phẩm đặt hàng</h4>
            <div className={styles.itemsList}>
              {checkoutItems.map((item: any, index: number) => (
                <div key={index} className={styles.orderItem}>
                  <div className={styles.itemInfo}>
                    <h5>{item.product?.name || `Product ${item.productId}`}</h5>
                    {item.variant && <p>{item.variant.color} - {item.variant.size}</p>}
                    <p>Số lượng: {item.quantity}</p>
                  </div>
                  <div className={styles.itemPrice}>
                    {(() => {
                      const itemPrice = item.product?.discountedPrice || item.price || 0;
                      const totalItemPrice = itemPrice * item.quantity;
                      const hasDiscount = item.product?.discountedPrice && 
                                         item.product?.price && 
                                         item.product.discountedPrice < item.product.price;
                      
                      return (
                        <div>
                          <div style={{ color: hasDiscount ? '#ff4081' : '#333', fontWeight: 'bold' }}>
                            {totalItemPrice.toLocaleString('vi-VN')}₫
                            {hasDiscount && <span style={{ 
                              backgroundColor: '#ff4081', 
                              color: 'white', 
                              fontSize: '0.7em', 
                              padding: '2px 4px', 
                              borderRadius: '3px', 
                              marginLeft: '8px' 
                            }}>FLASHSALE</span>}
                          </div>
                          {hasDiscount && (
                            <div style={{ color: '#999', fontSize: '0.9em', textDecoration: 'line-through' }}>
                              {((item.product?.price || 0) * item.quantity).toLocaleString('vi-VN')}₫
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {orderNotes && (
          <div className={styles.reviewItem}>
            <h4>Ghi chú</h4>
            <p>{orderNotes}</p>
          </div>
        )}

        <div className={styles.reviewItem}>
          <h4>Tùy chọn hóa đơn</h4>
          <div className={styles.invoiceOptions}>
            <button
              onClick={() => setShowInvoicePreview(true)}
              className={styles.previewInvoiceButton}
              type="button"
              disabled={!checkoutItems || checkoutItems.length === 0}
            >
              👁️ Xem trước hóa đơn
            </button>
            <p className={styles.invoiceNote}>
              💡 Bạn có thể xem trước và in hóa đơn sau khi đặt hàng thành công
            </p>
          </div>
        </div>
      </div>

      {checkoutItems && checkoutItems.length > 0 && (() => {
        const subtotal = checkoutItems.reduce((sum: number, item: any) => {
          const itemPrice = item.product?.discountedPrice || item.price || 0;
          return sum + itemPrice * item.quantity;
        }, 0);
        const shippingFee = orderSummary?.shippingFee || 30000;
        const total = subtotal + shippingFee;
        
        return (
          <div className={styles.finalSummary}>
            <div className={styles.summaryRow}>
              <span>Tạm tính:</span>
              <span>{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Phí vận chuyển:</span>
              <span>{shippingFee.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Tổng cộng:</span>
              <span>{total.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        );
      })()}

      <div className={styles.actions}>
        <button 
          onClick={() => setStep('payment')}
          className={styles.backButton}
        >
          Quay lại
        </button>
        <button 
          onClick={handleCreateOrder}
          className={styles.placeOrderButton}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Đặt hàng'}
        </button>
      </div>
    </div>
  );

  if (loading && checkoutItems.length === 0) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.loading}>Đang tải...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Thanh toán</h1>
          {renderStepIndicator()}
        </div>

        <div className={styles.content}>
          {step === 'address' && renderAddressStep()}
          {step === 'payment' && renderPaymentStep()}
          {step === 'review' && renderReviewStep()}
        </div>

        {/* Invoice Preview Modal */}
        {showInvoicePreview && selectedAddress && (() => {
          const invoiceOrderSummary = createOrderSummaryFromItems();
          return invoiceOrderSummary ? (
            <InvoicePreview
              orderSummary={invoiceOrderSummary}
              selectedAddress={selectedAddress}
              paymentMethod={paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Chưa chọn'}
              orderNotes={orderNotes}
              orderNumber={'HD' + Date.now()}
              onDownload={handleDownloadInvoice}
              onClose={() => setShowInvoicePreview(false)}
            />
          ) : null;
        })()}
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
