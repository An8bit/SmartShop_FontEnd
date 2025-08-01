class ApiService {
  static API_BASE_URL = "http://localhost:5000/api";

  static async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${ApiService.API_BASE_URL}/${endpoint}`, {
      method: "GET",
      credentials: "include", // Quan trọng: gửi cookies/session
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Lỗi API: " + res.statusText);
    return res.json();
  }

  static async post<T>(endpoint: string, data: any): Promise<T> {
    const res = await fetch(`${ApiService.API_BASE_URL}/${endpoint}`, {
      method: "POST",
      credentials: "include", // Quan trọng: gửi cookies/session
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Lỗi API: " + res.statusText);
    return res.json();
  }

  static async put<T>(endpoint: string, data: any): Promise<T> {
    const res = await fetch(`${ApiService.API_BASE_URL}/${endpoint}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Lỗi API: " + res.statusText);
    return res.json();
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${ApiService.API_BASE_URL}/${endpoint}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Lỗi API: " + res.statusText);
    return res.json();
  }
}

export default ApiService;