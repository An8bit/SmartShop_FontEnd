import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/common/Toast/ToastProvider';
import { UpdateAddress } from '../../interfaces/User';
import PaymentService from '../../services/paymentService';
import provinceService, { Province, District, Ward } from '../../services/provinceService';
import styles from './AddressManagement.module.css';

interface UserAddressFormProps {
  onAddressUpdated?: () => void;
  initialData?: UpdateAddress;
}

const UserAddressForm: React.FC<UserAddressFormProps> = ({ 
  onAddressUpdated,
  initialData 
}) => {
  // Province API states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  
  const [addressData, setAddressData] = useState<UpdateAddress>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: true
  });

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadProvinces();
    if (initialData) {
      setAddressData(initialData);
    }
  }, [initialData]);

  const loadProvinces = async () => {
    try {
      const provincesData = await provinceService.getProvinces();
      setProvinces(provincesData);
    } catch (error) {
      console.error('Error loading provinces:', error);
      showToast('Có lỗi khi tải danh sách tỉnh thành', 'error');
    }
  };

  const loadDistricts = async (provinceCode: string) => {
    try {
      const code = parseInt(provinceCode);
      const districtsData = await provinceService.getDistrictsByProvince(code);
      setDistricts(districtsData);
      setWards([]); // Reset wards when province changes
      setSelectedDistrict('');
      setSelectedWard('');
    } catch (error) {
      console.error('Error loading districts:', error);
      showToast('Có lỗi khi tải danh sách quận huyện', 'error');
    }
  };

  const loadWards = async (districtCode: string) => {
    try {
      const code = parseInt(districtCode);
      const wardsData = await provinceService.getWardsByDistrict(code);
      setWards(wardsData);
      setSelectedWard('');
    } catch (error) {
      console.error('Error loading wards:', error);
      showToast('Có lỗi khi tải danh sách phường xã', 'error');
    }
  };

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    const province = provinces.find(p => p.code === parseInt(provinceCode));
    if (province) {
      setAddressData({
        ...addressData,
        state: province.name,
        city: ''
      });
      loadDistricts(provinceCode);
    }
  };

  const handleDistrictChange = (districtCode: string) => {
    setSelectedDistrict(districtCode);
    const district = districts.find(d => d.code === parseInt(districtCode));
    if (district) {
      setAddressData({
        ...addressData,
        city: district.name
      });
      loadWards(districtCode);
    }
  };

  const handleWardChange = (wardCode: string) => {
    setSelectedWard(wardCode);
    const ward = wards.find(w => w.code === parseInt(wardCode));
    if (ward) {
      setAddressData({
        ...addressData,
        addressLine2: ward.name
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setAddressData({
      ...addressData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addressData.addressLine1 || !addressData.city || !addressData.state) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
      return;
    }

    setLoading(true);
    try {
      await PaymentService.addAddress(addressData);
      showToast('Cập nhật địa chỉ thành công', 'success');
      
      if (onAddressUpdated) {
        onAddressUpdated();
      }
    } catch (error) {
      console.error('Error updating address:', error);
      showToast('Có lỗi khi cập nhật địa chỉ', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.addForm}>
      <h3>Cập nhật địa chỉ</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="addressLine1"
          placeholder="Địa chỉ chi tiết (số nhà, tên đường) *"
          value={addressData.addressLine1}
          onChange={handleInputChange}
          className={styles.input}
          required
        />
        
        {/* Dropdown cho Tỉnh/Thành phố */}
        <div className={styles.formRow}>
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className={styles.input}
            required
          >
            <option value="">Chọn Tỉnh/Thành phố *</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className={styles.input}
            disabled={!selectedProvince}
            required
          >
            <option value="">Chọn Quận/Huyện *</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>

          <select
            value={selectedWard}
            onChange={(e) => handleWardChange(e.target.value)}
            className={styles.input}
            disabled={!selectedDistrict}
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <input
            type="text"
            name="postalCode"
            placeholder="Mã bưu điện"
            value={addressData.postalCode}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="isDefault"
            checked={addressData.isDefault}
            onChange={handleInputChange}
          />
          Đặt làm địa chỉ mặc định
        </label>

        <div className={styles.actions}>
          <button 
            type="submit" 
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật địa chỉ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserAddressForm;
