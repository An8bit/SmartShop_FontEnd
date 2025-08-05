import { UserInfo } from '../interfaces/User';

class AuthService {
  private static readonly USER_KEY = 'user';
  
  static saveUser(user: any): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
  
static saveUserData(user: UserInfo): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));}

  static getUser(): any | null {
    const userData = sessionStorage.getItem(this.USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  
  static isLoggedIn(): boolean {
    return !!this.getUser();
  }
  
  static logout(): void {
    sessionStorage.removeItem(this.USER_KEY);
  }
}

export default AuthService;