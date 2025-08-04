// Service để lấy thông tin tỉnh thành từ API provinces.open-api.vn
export interface Province {
  name: string;
  code: number;
  division_type: string;
  phone_code: number;
  codename: string;
  districts?: District[];
}

export interface District {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  province_code: number;
  wards?: Ward[];
}

export interface Ward {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  district_code: number;
}

export interface SearchResult {
  name: string;
  code: number;
  matches: { [key: string]: number[] };
  score: number;
}

class ProvinceService {
  private readonly BASE_URL = 'https://provinces.open-api.vn/api/v1';

  /**
   * Lấy danh sách tất cả tỉnh thành
   * @param depth - 1: chỉ tỉnh, 2: tỉnh + quận/huyện, 3: tỉnh + quận/huyện + phường/xã
   */
  async getProvinces(depth: 1 | 2 | 3 = 1): Promise<Province[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/?depth=${depth}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw new Error('Không thể tải danh sách tỉnh thành');
    }
  }

  /**
   * Lấy thông tin chi tiết một tỉnh thành theo code
   * @param provinceCode - Mã tỉnh thành
   * @param depth - 1: chỉ tỉnh, 2: tỉnh + quận/huyện, 3: tỉnh + quận/huyện + phường/xã
   */
  async getProvinceByCode(provinceCode: number, depth: 1 | 2 | 3 = 2): Promise<Province> {
    try {
      const response = await fetch(`${this.BASE_URL}/p/${provinceCode}?depth=${depth}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching province by code:', error);
      throw new Error('Không thể tải thông tin tỉnh thành');
    }
  }

  /**
   * Lấy danh sách quận/huyện của một tỉnh
   * @param provinceCode - Mã tỉnh thành
   * @param depth - 1: chỉ quận/huyện, 2: quận/huyện + phường/xã
   */
  async getDistrictsByProvince(provinceCode: number, depth: 1 | 2 = 1): Promise<District[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/p/${provinceCode}?depth=${depth + 1}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const province: Province = await response.json();
      return province.districts || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw new Error('Không thể tải danh sách quận/huyện');
    }
  }

  /**
   * Lấy thông tin chi tiết một quận/huyện theo code
   * @param districtCode - Mã quận/huyện
   * @param depth - 1: chỉ quận/huyện, 2: quận/huyện + phường/xã
   */
  async getDistrictByCode(districtCode: number, depth: 1 | 2 = 2): Promise<District> {
    try {
      const response = await fetch(`${this.BASE_URL}/d/${districtCode}?depth=${depth}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching district by code:', error);
      throw new Error('Không thể tải thông tin quận/huyện');
    }
  }

  /**
   * Lấy danh sách phường/xã của một quận/huyện
   * @param districtCode - Mã quận/huyện
   */
  async getWardsByDistrict(districtCode: number): Promise<Ward[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const district: District = await response.json();
      return district.wards || [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw new Error('Không thể tải danh sách phường/xã');
    }
  }

  /**
   * Lấy thông tin chi tiết một phường/xã theo code
   * @param wardCode - Mã phường/xã
   */
  async getWardByCode(wardCode: number): Promise<Ward> {
    try {
      const response = await fetch(`${this.BASE_URL}/w/${wardCode}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ward by code:', error);
      throw new Error('Không thể tải thông tin phường/xã');
    }
  }

  /**
   * Tìm kiếm tỉnh thành theo tên
   * @param query - Từ khóa tìm kiếm
   */
  async searchProvinces(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/p/search/?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching provinces:', error);
      throw new Error('Không thể tìm kiếm tỉnh thành');
    }
  }

  /**
   * Tìm kiếm quận/huyện theo tên
   * @param query - Từ khóa tìm kiếm
   */
  async searchDistricts(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/d/search/?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching districts:', error);
      throw new Error('Không thể tìm kiếm quận/huyện');
    }
  }

  /**
   * Tìm kiếm phường/xã theo tên
   * @param query - Từ khóa tìm kiếm
   */
  async searchWards(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/w/search/?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching wards:', error);
      throw new Error('Không thể tìm kiếm phường/xã');
    }
  }

  /**
   * Lấy địa chỉ đầy đủ từ các mã
   * @param provinceCode - Mã tỉnh thành
   * @param districtCode - Mã quận/huyện (tùy chọn)
   * @param wardCode - Mã phường/xã (tùy chọn)
   */
  async getFullAddress(provinceCode: number, districtCode?: number, wardCode?: number): Promise<string> {
    try {
      const parts: string[] = [];

      if (wardCode) {
        const ward = await this.getWardByCode(wardCode);
        parts.push(ward.name);
      }

      if (districtCode) {
        const district = await this.getDistrictByCode(districtCode, 1);
        parts.push(district.name);
      }

      const province = await this.getProvinceByCode(provinceCode, 1);
      parts.push(province.name);

      return parts.join(', ');
    } catch (error) {
      console.error('Error getting full address:', error);
      throw new Error('Không thể tải địa chỉ đầy đủ');
    }
  }

  /**
   * Kiểm tra kết nối API
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/`);
      return response.ok;
    } catch (error) {
      console.error('API connection failed:', error);
      return false;
    }
  }
}

export default new ProvinceService();
