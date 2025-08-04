import ApiService from "./apiService";
import { UserInfo,UpdateAddress } from "../interfaces/User";



class UserService {
  static async login(email: string, password: string) {
    return ApiService.post<{ message: string; user: { fullName: string; email: string } }>("user/login", { email, password });
  }
  static async register(data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
  }) {
    return ApiService.post<{ message: string }>("user/register", data);
  }

  static async getProfile() {
    return ApiService.get<{ user: UserInfo }>("user/profile");
  }

  static async updateProfileAddress(data: Partial<UserInfo>) {
    return ApiService.put<{ UpdateAddress: UpdateAddress }>("user/UpdateAddress", data);
  }
}

export default UserService;


