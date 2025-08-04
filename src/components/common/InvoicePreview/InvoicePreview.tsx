import React from 'react';
import { Address, OrderSummary } from '../../../interfaces/Payment';
import styles from './InvoicePreview.module.css';

interface InvoicePreviewProps {
  orderSummary: OrderSummary;
  selectedAddress: Address;
  paymentMethod: string;
  orderNotes?: string;
  orderNumber?: string;
  onDownload?: () => void;
  onClose?: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  orderSummary,
  selectedAddress,
  paymentMethod,
  orderNotes,
  orderNumber = 'HD' + Date.now(),
  onDownload,
  onClose
}) => {
  const currentDate = new Date().toLocaleDateString('vi-VN');
  const currentTime = new Date().toLocaleTimeString('vi-VN');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Fallback: use browser's print to PDF
      window.print();
    }
  };

  return (
    <div className={styles.invoiceModal}>
      <div className={styles.invoiceContainer}>
        {/* Header với nút điều khiển */}
        <div className={styles.invoiceHeader}>
          <h2>🧾 Xem trước hóa đơn</h2>
          <div className={styles.headerActions}>
            <button onClick={handlePrint} className={styles.printButton}>
              🖨️ In hóa đơn
            </button>
            <button onClick={handleDownloadPDF} className={styles.downloadButton}>
              📥 Tải PDF
            </button>
            {onClose && (
              <button onClick={onClose} className={styles.closeButton}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Nội dung hóa đơn */}
        <div className={styles.invoiceContent} id="invoice-content">
          {/* Logo và thông tin công ty */}
          <div className={styles.companyHeader}>
            <div className={styles.companyInfo}>
              <h1>SmartShop</h1>
              <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
              <p>Điện thoại: (028) 1234-5678</p>
              <p>Email: contact@smartshop.vn</p>
              <p>Mã số thuế: 0123456789</p>
            </div>
            <div className={styles.invoiceNumber}>
              <h2>HÓA ĐƠN BÁN HÀNG</h2>
              <p><strong>Số HĐ:</strong> {orderNumber}</p>
              <p><strong>Ngày:</strong> {currentDate}</p>
              <p><strong>Giờ:</strong> {currentTime}</p>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Thông tin khách hàng */}
          <div className={styles.customerInfo}>
            <h3>📋 Thông tin khách hàng</h3>
            <div className={styles.customerDetails}>
              <p><strong>Họ tên:</strong> {selectedAddress.receiverName}</p>
              <p><strong>Điện thoại:</strong> {selectedAddress.receiverPhone}</p>
              <p><strong>Địa chỉ:</strong> {selectedAddress.addressLine1}</p>
              {selectedAddress.addressLine2 && (
                <p><strong>Địa chỉ 2:</strong> {selectedAddress.addressLine2}</p>
              )}
              <p><strong>Thành phố:</strong> {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p>
              <p><strong>Phương thức thanh toán:</strong> {paymentMethod}</p>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Bảng sản phẩm */}
          <div className={styles.productsTable}>
            <h3>🛒 Chi tiết sản phẩm</h3>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sản phẩm</th>
                  <th>Phân loại</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderSummary.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.productName}</td>
                    <td>{item.variantName || '-'}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toLocaleString('vi-VN')}₫</td>
                    <td>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tổng tiền */}
          <div className={styles.totalSection}>
            <div className={styles.totalRow}>
              <span>Tạm tính:</span>
              <span>{orderSummary.subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className={styles.totalRow}>
              <span>Phí vận chuyển:</span>
              <span>{orderSummary.shippingFee.toLocaleString('vi-VN')}₫</span>
            </div>
            {orderSummary.discount > 0 && (
              <div className={styles.totalRow}>
                <span>Giảm giá:</span>
                <span>-{orderSummary.discount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            {orderSummary.tax > 0 && (
              <div className={styles.totalRow}>
                <span>Thuế VAT (10%):</span>
                <span>{orderSummary.tax.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            <hr />
            <div className={`${styles.totalRow} ${styles.finalTotal}`}>
              <span><strong>TỔNG CỘNG:</strong></span>
              <span><strong>{orderSummary.total.toLocaleString('vi-VN')}₫</strong></span>
            </div>
          </div>

          {/* Ghi chú */}
          {orderNotes && (
            <div className={styles.notes}>
              <h4>📝 Ghi chú:</h4>
              <p>{orderNotes}</p>
            </div>
          )}

          {/* Footer */}
          <div className={styles.invoiceFooter}>
            <div className={styles.signatures}>
              <div className={styles.signature}>
                <p><strong>Người bán hàng</strong></p>
                <p>(Ký và ghi rõ họ tên)</p>
                <div className={styles.signatureSpace}></div>
              </div>
              <div className={styles.signature}>
                <p><strong>Người mua hàng</strong></p>
                <p>(Ký và ghi rõ họ tên)</p>
                <div className={styles.signatureSpace}></div>
              </div>
            </div>
            <div className={styles.thankYou}>
              <p>🙏 Cảm ơn quý khách đã mua hàng tại SmartShop!</p>
              <p>Hotline hỗ trợ: 1900-1234 | Website: www.smartshop.vn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
