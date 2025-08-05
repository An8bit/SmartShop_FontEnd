import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentService from '../../services/paymentService';
import { useToast } from '../../components/common/Toast/ToastProvider';
import { Order } from '../../interfaces/Payment';
import styles from './OrderHistory.module.css';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const ORDERS_PER_PAGE = 10;

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // API getOrder() trả về array, không phải object với pagination
      const orderData = await PaymentService.getOrder();
      setOrders(orderData);
      setTotalOrders(orderData.length);
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Có lỗi khi tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleCancelOrder = async (orderId: number) => {
    const reason = prompt('Vui lòng nhập lý do hủy đơn hàng:');
    if (!reason) return;

    try {
      await PaymentService.cancelOrder(orderId, reason);
      showToast('Hủy đơn hàng thành công', 'success');
      loadOrders(); // Reload orders
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast('Có lỗi khi hủy đơn hàng', 'error');
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

  const canCancelOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'confirmed';
  };

  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);

  if (loading && orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải danh sách đơn hàng...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Lịch sử đơn hàng</h1>
        <p>Quản lý và theo dõi các đơn hàng của bạn</p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
          <button 
            onClick={() => navigate('/')}
            className={styles.shopButton}
          >
            Bắt đầu mua sắm
          </button>
        </div>
      ) : (
        <>
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.orderId} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderNumber}>#{order.orderNumber}</span>
                    <span className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className={styles.orderStatus}>
                    {getStatusBadge(order.status)}
                    {order.paymentStatus && getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {(order.orderItems || order.items || []).slice(0, 2).map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <div className={styles.itemInfo}>
                        <h4>{item.productName}</h4>
                        {item.variantName && <p>{item.variantName}</p>}
                        <p>Số lượng: {item.quantity}</p>
                      </div>
                      <div className={styles.itemPrice}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                  {(order.orderItems || order.items || []).length > 2 && (
                    <div className={styles.moreItems}>
                      +{(order.orderItems || order.items || []).length - 2} sản phẩm khác
                    </div>
                  )}
                </div>

                <div className={styles.orderSummary}>
                  <div className={styles.summaryRow}>
                    <span>Phương thức thanh toán:</span>
                    <span>
                      {order.paymentMethod === 'bank_transfer' 
                        ? 'Chuyển khoản ngân hàng' 
                        : 'Thanh toán khi nhận hàng'}
                    </span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Tổng cộng:</span>
                    <span>{(order.totalAmount || order.total || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <button 
                    onClick={() => handleViewOrderDetail(order)}
                    className={styles.detailButton}
                  >
                    Xem chi tiết
                  </button>
                  {canCancelOrder(order) && (
                    <button 
                      onClick={() => handleCancelOrder(order.orderId)}
                      className={styles.cancelButton}
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button 
                      onClick={() => navigate(`/products/${(order.orderItems || order.items || [])[0]?.productId}/review`)}
                      className={styles.reviewButton}
                    >
                      Đánh giá
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                Trước
              </button>
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Chi tiết đơn hàng #{selectedOrder.orderNumber}</h2>
              <button 
                onClick={() => setShowOrderDetail(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Thông tin đơn hàng</h3>
                <div className={styles.detailRow}>
                  <span>Ngày đặt:</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Trạng thái:</span>
                  <span>{getStatusBadge(selectedOrder.status)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Thanh toán:</span>
                  <span>{selectedOrder.paymentStatus && getPaymentStatusBadge(selectedOrder.paymentStatus)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Phương thức thanh toán:</span>
                  <span>
                    {selectedOrder.paymentMethod === 'bank_transfer' 
                      ? 'Chuyển khoản ngân hàng' 
                      : 'Thanh toán khi nhận hàng'}
                  </span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Địa chỉ giao hàng</h3>
                <div className={styles.address}>
                  <p><strong>{selectedOrder.shippingAddress.receiverName}</strong></p>
                  <p>{selectedOrder.shippingAddress.receiverPhone}</p>
                  <p>{selectedOrder.shippingAddress.addressLine1}</p>
                  {selectedOrder.shippingAddress.addressLine2 && (
                    <p>{selectedOrder.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Sản phẩm đã đặt</h3>
                <div className={styles.itemsList}>
                  {(selectedOrder.orderItems || selectedOrder.items || []).map((item, index) => (
                    <div key={index} className={styles.detailItem}>
                      <div className={styles.itemInfo}>
                        <h4>{item.productName}</h4>
                        {item.variantName && <p>{item.variantName}</p>}
                        <p>Số lượng: {item.quantity}</p>
                        <p>Đơn giá: {item.price.toLocaleString('vi-VN')}₫</p>
                      </div>
                      <div className={styles.itemTotal}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className={styles.detailSection}>
                  <h3>Ghi chú</h3>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}

              <div className={styles.detailSection}>
                <h3>Tóm tắt thanh toán</h3>
                <div className={styles.paymentSummary}>
                  <div className={styles.summaryRow}>
                    <span>Tạm tính:</span>
                    <span>{(selectedOrder.subtotal || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Phí vận chuyển:</span>
                    <span>{(selectedOrder.shippingFee || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                  {(selectedOrder.discount || 0) > 0 && (
                    <div className={styles.summaryRow}>
                      <span>Giảm giá:</span>
                      <span>-{(selectedOrder.discount || 0).toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  {(selectedOrder.tax || 0) > 0 && (
                    <div className={styles.summaryRow}>
                      <span>Thuế:</span>
                      <span>{(selectedOrder.tax || 0).toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Tổng cộng:</span>
                    <span>{(selectedOrder.total || selectedOrder.totalAmount || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              {canCancelOrder(selectedOrder) && (
                <button 
                  onClick={() => {
                    handleCancelOrder(selectedOrder.orderId);
                    setShowOrderDetail(false);
                  }}
                  className={styles.cancelButton}
                >
                  Hủy đơn hàng
                </button>
              )}
              <button 
                onClick={() => navigate('/order-confirmation', { 
                  state: { 
                    orderId: selectedOrder.orderId,
                    paymentMethod: selectedOrder.paymentMethod 
                  } 
                })}
                className={styles.viewConfirmationButton}
              >
                Xem trang xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
