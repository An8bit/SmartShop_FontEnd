import ApiService from "./apiService";

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
}

export default UserService;