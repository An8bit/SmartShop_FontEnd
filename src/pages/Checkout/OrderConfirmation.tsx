import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentService from '../../services/paymentService';
import AuthService from '../../services/authService';
import { useToast } from '../../components/common/Toast/ToastProvider';
import { Order, Invoice, BankTransferInfo } from '../../interfaces/Payment';
import { UserInfo } from '../../interfaces/User';
import styles from './OrderConfirmation.module.css';

const OrderConfirmation: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [bankInfo, setBankInfo] = useState<BankTransferInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get orderId from URL params if provided, otherwise will load the latest order
  const orderIdFromUrl = new URLSearchParams(location.search).get('orderId');

  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);

      // Load order details - API trả về array
      const ordersData = await PaymentService.getOrder();
     
      
      let foundOrder;
      if (orderIdFromUrl) {
        // Nếu có orderId trong URL, tìm order cụ thể
        foundOrder = ordersData.find(order => order.orderId === Number(orderIdFromUrl));
      } else {
        // Nếu không có orderId, lấy order mới nhất (order đầu tiên trong array)
        foundOrder = ordersData[0];
      }
      
      console.log('Found order:', foundOrder);
      if (!foundOrder) {
        showToast('Không tìm thấy đơn hàng', 'error');
        navigate('/');
        return;
      }
      
      setOrder(foundOrder);

      // Load bank transfer info if payment method is bank transfer
      if (foundOrder.paymentMethod === 'bank_transfer') {
        const bankData = await PaymentService.getBankTransferInfo();
        setBankInfo(bankData);
      }

    } catch (error) {
      console.error('Error loading order details:', error);
      showToast('Có lỗi khi tải thông tin đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!order) return;

    // Nếu đã có invoice, chỉ hiển thị modal
    if (invoice) {
      setShowInvoice(true);
      return;
    }

    try {
      setLoading(true);
      const invoiceData = await PaymentService.generateInvoice(order.orderId);
      setInvoice(invoiceData);
      setShowInvoice(true);
      showToast('Tạo hóa đơn thành công!', 'success');
    } catch (error) {
      console.error('Error generating invoice:', error);
      showToast('Có lỗi khi tạo hóa đơn', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoice) return;

    try {
      const blob = await PaymentService.downloadInvoicePDF(invoice.invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Tải hóa đơn thành công!', 'success');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showToast('Có lỗi khi tải hóa đơn', 'error');
    }
  };

  const handleConfirmPayment = async () => {
    if (!order) return;

    const transactionId = prompt('Vui lòng nhập mã giao dịch:');
    if (!transactionId) return;

    try {
      const orderTotal = order.total || order.totalAmount || 0;
      await PaymentService.confirmBankTransfer(order.orderId, transactionId, orderTotal);
      showToast('Xác nhận thanh toán thành công! Chúng tôi sẽ xử lý đơn hàng của bạn.', 'success');
      loadOrderDetails(); // Reload to get updated status
    } catch (error) {
      console.error('Error confirming payment:', error);
      showToast('Có lỗi khi xác nhận thanh toán', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      pending: { label: 'Chờ xử lý', className: styles.statusPending },
      Pending: { label: 'Chờ xử lý', className: styles.statusPending },
      confirmed: { label: 'Đã xác nhận', className: styles.statusConfirmed },
      processing: { label: 'Đang xử lý', className: styles.statusProcessing },
      shipped: { label: 'Đã gửi hàng', className: styles.statusShipped },
      delivered: { label: 'Đã giao hàng', className: styles.statusDelivered },
      cancelled: { label: 'Đã hủy', className: styles.statusCancelled },
    };

    const statusInfo = statusMap[status] || { label: status, className: styles.statusDefault };

    return (
      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      pending: { label: 'Chờ thanh toán', className: styles.paymentPending },
      completed: { label: 'Đã thanh toán', className: styles.paymentCompleted },
      failed: { label: 'Thanh toán thất bại', className: styles.paymentFailed },
      refunded: { label: 'Đã hoàn tiền', className: styles.paymentRefunded },
    };

    const statusInfo = statusMap[status] || { label: status, className: styles.paymentDefault };

    return (
      <span className={`${styles.paymentBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading && !order) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Không tìm thấy thông tin đơn hàng</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.successIcon}>✓</div>
        <h1>Đặt hàng thành công!</h1>
        <p>Cảm ơn bạn đã mua hàng tại SmartShop</p>
      </div>

      {/* Invoice Preview Section - Hiển thị phía trên */}
      <div className={styles.invoicePreview}>
        <div className={styles.invoicePreviewHeader}>
          <h2>🧾 Hóa đơn điện tử</h2>
          <div className={styles.invoiceActions}>
            <button 
              onClick={handleGenerateInvoice}
              className={styles.generateInvoiceButton}
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : invoice ? 'Xem hóa đơn' : 'Tạo hóa đơn'}
            </button>
            {invoice && (
              <button 
                onClick={handleDownloadInvoice}
                className={styles.downloadInvoiceButton}
              >
                📥 Tải PDF
              </button>
            )}
          </div>
        </div>

        {invoice ? (
          <div className={styles.invoiceQuickView}>
            <div className={styles.invoiceBasicInfo}>
              <div className={styles.invoiceRow}>
                <span>Số hóa đơn:</span>
                <span><strong>{invoice.invoiceNumber}</strong></span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Ngày xuất:</span>
                <span>{new Date(invoice.issuedDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Đơn hàng:</span>
                <span>#{order.orderNumber}</span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Tổng tiền:</span>
                <span className={styles.invoiceTotal}>{invoice.total.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
            
            <div className={styles.invoiceStatus}>
              <span className={styles.invoiceStatusBadge}>✅ Hóa đơn đã được tạo</span>
            </div>
          </div>
        ) : (
          <div className={styles.invoicePlaceholder}>
            <p>📋 Hóa đơn chưa được tạo. Nhấn "Tạo hóa đơn" để xuất hóa đơn điện tử.</p>
          </div>
        )}
      </div>

      <div className={styles.orderInfo}>
        <div className={styles.orderHeader}>
          <h2>Thông tin đơn hàng</h2>
          <div className={styles.orderMeta}>
            <span className={styles.orderNumber}>#{order.orderNumber || `ORDER-${order.orderId}`}</span>
            {getStatusBadge(order.status)}
            {order.paymentStatus && getPaymentStatusBadge(order.paymentStatus)}
          </div>
        </div>

        <div className={styles.orderDetails}>
          <div className={styles.section}>
            <h3>Địa chỉ giao hàng</h3>
            <div className={styles.address}>
              <p><strong>{order.shippingAddress.receiverName || 'Người nhận'}</strong></p>
              <p>{order.shippingAddress.receiverPhone || 'Số điện thoại'}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Phương thức thanh toán</h3>
            <p>{order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng'}</p>
          </div>

          <div className={styles.section}>
            <h3>Sản phẩm đã đặt</h3>
            <div className={styles.itemsList}>
              {order.orderItems?.map((item, index) => (
                <div key={index} className={styles.orderItem}>
                  <div className={styles.itemInfo}>
                    <h4>{item.productName || `Sản phẩm #${item.productId}`}</h4>
                    {item.variantInfo && <p>{item.variantInfo}</p>}
                    <p>Số lượng: {item.quantity}</p>
                  </div>
                  <div className={styles.itemPrice}>
                    {(item.totalPrice || item.price * item.quantity || 0).toLocaleString('vi-VN')}₫
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className={styles.section}>
              <h3>Ghi chú</h3>
              <p>{order.notes}</p>
            </div>
          )}
        </div>

        <div className={styles.orderSummary}>
          <div className={styles.summaryRow}>
            <span>Tạm tính:</span>
            <span>{(order.totalAmount || 0).toLocaleString('vi-VN')}₫</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Phí vận chuyển:</span>
            <span>{(order.shippingFee || 30000).toLocaleString('vi-VN')}₫</span>
          </div>
          {(order.discount || 0) > 0 && (
            <div className={styles.summaryRow}>
              <span>Giảm giá:</span>
              <span>-{(order.discount || 0).toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          {(order.tax || 0) > 0 && (
            <div className={styles.summaryRow}>
              <span>Thuế:</span>
              <span>{(order.tax || 0).toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Tổng cộng:</span>
            <span>{(order.total || (order.totalAmount || 0) + (30000)).toLocaleString('vi-VN')}₫</span>
          </div>
        </div>

        {/* Bank Transfer Info */}
        {order.paymentMethod === 'bank_transfer' && bankInfo && (order.paymentStatus === 'pending' || !order.paymentStatus) && (
          <div className={styles.bankTransferInfo}>
            <h3>Thông tin chuyển khoản</h3>
            <div className={styles.bankDetails}>
              <div className={styles.bankRow}>
                <span>Ngân hàng:</span>
                <span>{bankInfo.bankName}</span>
              </div>
              <div className={styles.bankRow}>
                <span>Số tài khoản:</span>
                <span>{bankInfo.accountNumber}</span>
              </div>
              <div className={styles.bankRow}>
                <span>Chủ tài khoản:</span>
                <span>{bankInfo.accountName}</span>
              </div>
              <div className={styles.bankRow}>
                <span>Nội dung chuyển khoản:</span>
                <span>{bankInfo.transferContent.replace('[ORDER_NUMBER]', order.orderNumber || `ORDER-${order.orderId}`)}</span>
              </div>
              <div className={styles.bankRow}>
                <span>Số tiền:</span>
                <span className={styles.amount}>{(order.total || order.totalAmount || 0).toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
            {bankInfo.qrCodeUrl && (
              <div className={styles.qrCode}>
                <img src={bankInfo.qrCodeUrl} alt="QR Code thanh toán" />
                <p>Quét mã QR để thanh toán nhanh</p>
              </div>
            )}
            <button 
              onClick={handleConfirmPayment}
              className={styles.confirmPaymentButton}
            >
              Tôi đã chuyển khoản
            </button>
          </div>
        )}

        <div className={styles.actions}>
          <button 
            onClick={() => navigate('/')}
            className={styles.continueShoppingButton}
          >
            Tiếp tục mua hàng
          </button>
          <button 
            onClick={() => navigate('/profile/orders')}
            className={styles.viewOrdersButton}
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && invoice && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.invoiceHeader}>
              <h2>Hóa đơn điện tử</h2>
              <button 
                onClick={() => setShowInvoice(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div className={styles.invoice}>
              <div className={styles.invoiceInfo}>
                <div className={styles.invoiceRow}>
                  <span>Số hóa đơn:</span>
                  <span><strong>{invoice.invoiceNumber}</strong></span>
                </div>
                <div className={styles.invoiceRow}>
                  <span>Ngày xuất:</span>
                  <span>{new Date(invoice.issuedDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className={styles.invoiceRow}>
                  <span>Đơn hàng:</span>
                  <span>#{order.orderNumber}</span>
                </div>
              </div>

              <div className={styles.customerInfo}>
                <h4>Thông tin khách hàng</h4>
                <p><strong>{invoice.customerInfo.name}</strong></p>
                <p>📧 {invoice.customerInfo.email}</p>
                <p>📞 {invoice.customerInfo.phone}</p>
                <div className={styles.customerAddress}>
                  <p>📍 {invoice.customerInfo.address.addressLine1}</p>
                  {invoice.customerInfo.address.addressLine2 && (
                    <p>{invoice.customerInfo.address.addressLine2}</p>
                  )}
                  <p>{invoice.customerInfo.address.city}, {invoice.customerInfo.address.state} {invoice.customerInfo.address.postalCode}</p>
                </div>
              </div>

              <div className={styles.invoiceItems}>
                <h4>Chi tiết hóa đơn</h4>
                <div className={styles.simpleItemsList}>
                  {invoice.items.map((item, index) => (
                    <div key={index} className={styles.simpleInvoiceItem}>
                      <div className={styles.itemDetails}>
                        <strong>{item.productName}</strong>
                        {item.variantName && <div className={styles.variant}>{item.variantName}</div>}
                        <div className={styles.itemMeta}>
                          Số lượng: {item.quantity} × {item.price.toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                      <div className={styles.itemTotal}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.invoiceSummary}>
                <div className={styles.invoiceRow}>
                  <span>Tạm tính:</span>
                  <span>{invoice.subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className={styles.invoiceRow}>
                  <span>Phí vận chuyển:</span>
                  <span>{invoice.shippingFee.toLocaleString('vi-VN')}₫</span>
                </div>
                {invoice.discount > 0 && (
                  <div className={styles.invoiceRow}>
                    <span>Giảm giá:</span>
                    <span>-{invoice.discount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className={styles.invoiceRow}>
                    <span>Thuế:</span>
                    <span>{invoice.tax.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className={`${styles.invoiceRow} ${styles.invoiceTotal}`}>
                  <span>Tổng cộng:</span>
                  <span>{invoice.total.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              <div className={styles.invoiceFooter}>
                <p>Phương thức thanh toán: {invoice.paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng'}</p>
                <p>Trạng thái thanh toán: {getPaymentStatusBadge(invoice.paymentStatus)}</p>
              </div>
            </div>

            <div className={styles.invoiceActions}>
              <button 
                onClick={handleDownloadInvoice}
                className={styles.downloadButton}
              >
                Tải hóa đơn PDF
              </button>
              <button 
                onClick={() => window.print()}
                className={styles.printButton}
              >
                In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;
