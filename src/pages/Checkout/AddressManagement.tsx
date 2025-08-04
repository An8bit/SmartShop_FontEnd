import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentService from '../../services/paymentService';
import { useToast } from '../../components/common/Toast/ToastProvider';
import { Address } from '../../interfaces/Payment';
import { UpdateAddress } from '../../interfaces/User';
import UserAddressForm from './UserAddressForm';
import styles from './AddressManagement.module.css';

interface AddressManagementProps {
  onAddressSelected?: (address: Address) => void;
  showSelectButton?: boolean;
}

const AddressManagement: React.FC<AddressManagementProps> = ({ 
  onAddressSelected, 
  showSelectButton = false 
}) => {
  const [userAddress, setUserAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadUserAddress();
  }, []);

  const loadUserAddress = async () => {
    try {
      setLoading(true);
      const addresses = await PaymentService.getUserAddresses();
      console.log("User addresses loaded:", addresses);
      // Lấy địa chỉ đầu tiên hoặc địa chỉ mặc định
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0] || null;
      setUserAddress(defaultAddress);
    } catch (error) {
      console.error('Error loading user address:', error);
      showToast('Có lỗi khi tải địa chỉ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressUpdated = () => {
    loadUserAddress();
    setShowForm(false);
    showToast('Cập nhật địa chỉ thành công', 'success');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải địa chỉ...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý địa chỉ</h2>
        <button 
          className={styles.addButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hủy' : (userAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ')}
        </button>
      </div>

      {userAddress && !showForm && (
        <div className={styles.addressCard}>
          <div className={styles.addressInfo}>
            <h4>{userAddress.receiverName} <span className={styles.defaultBadge}>Địa chỉ chính</span></h4>
            <p>{userAddress.receiverPhone}</p>
            <p>{userAddress.addressLine1}</p>
            {userAddress.addressLine2 && <p>{userAddress.addressLine2}</p>}
            <p>{userAddress.city}, {userAddress.state} {userAddress.postalCode}</p>
          </div>
          <div className={styles.actions}>
            {showSelectButton && onAddressSelected && (
              <button 
                onClick={() => onAddressSelected(userAddress)}
                className={styles.selectButton}
              >
                Chọn địa chỉ này
              </button>
            )}
            <button 
              onClick={() => setShowForm(true)}
              className={styles.editButton}
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      )}

      {!userAddress && !showForm && (
        <div className={styles.emptyState}>
          <p>Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ để tiếp tục.</p>
        </div>
      )}

      {showForm && (
        <UserAddressForm
          onAddressUpdated={handleAddressUpdated}
          initialData={userAddress ? {
            addressLine1: userAddress.addressLine1,
            addressLine2: userAddress.addressLine2 || '',
            city: userAddress.city,
            state: userAddress.state,
            postalCode: userAddress.postalCode,
            isDefault: userAddress.isDefault
          } : undefined}
        />
      )}
    </div>
  );
};

export default AddressManagement;
