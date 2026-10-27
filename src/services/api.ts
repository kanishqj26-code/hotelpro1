import { User, Room, Booking, Payment, AdminStats } from '../types/index.ts';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('roomsforuse_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth
  async register(userData: { name: string; email: string; password: string; phone: string; role?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse<{ success: boolean; message: string; user: User; token: string }>(res);
  },

  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse<{ success: boolean; message: string; user: User; token: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; user: User }>(res);
  },

  async updateProfile(updates: { name?: string; phone?: string; password?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse<{ success: boolean; message: string; user: User }>(res);
  },

  // Rooms
  async getRooms(params?: {
    checkIn?: string;
    checkOut?: string;
    capacity?: number;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.checkIn) query.append('checkIn', params.checkIn);
    if (params?.checkOut) query.append('checkOut', params.checkOut);
    if (params?.capacity) query.append('capacity', String(params.capacity));
    if (params?.type) query.append('type', params.type);
    if (params?.minPrice) query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/rooms?${query.toString()}`);
    return handleResponse<{ success: boolean; count: number; rooms: Room[] }>(res);
  },

  async getRoomById(id: string) {
    const res = await fetch(`${API_BASE}/rooms/${id}`);
    return handleResponse<{ success: boolean; room: Room; bookedRanges: { checkIn: string; checkOut: string; bookingId: string }[] }>(res);
  },

  async checkAvailability(roomId: string, checkIn: string, checkOut: string) {
    const res = await fetch(`${API_BASE}/rooms/availability?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`);
    return handleResponse<{
      success: boolean;
      isAvailable: boolean;
      numberOfNights: number;
      pricePerNight: number;
      totalAmount: number;
      roomNumber: string;
      roomType: string;
    }>(res);
  },

  // Admin Room Operations
  async createRoom(roomData: {
    roomNumber: string;
    capacity: number;
    pricePerNight: number;
    images: string[];
    type: 'Delux' | 'Non-Delux';
    description: string;
  }) {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    });
    return handleResponse<{ success: boolean; message: string; room: Room }>(res);
  },

  async updateRoom(id: string, roomData: Partial<Room>) {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    });
    return handleResponse<{ success: boolean; message: string; room: Room }>(res);
  },

  async deleteRoom(id: string) {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Bookings
  async createBooking(bookingData: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    userPhone?: string;
  }) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData)
    });
    return handleResponse<{ success: boolean; message: string; booking: Booking }>(res);
  },

  async getMyBookings() {
    const res = await fetch(`${API_BASE}/bookings/my`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; count: number; bookings: Booking[] }>(res);
  },

  async getBookingById(id: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; booking: Booking; room?: Room }>(res);
  },

  async cancelBooking(id: string, reason?: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse<{ success: boolean; message: string; booking: Booking }>(res);
  },

  // Payments
  async createPaymentOrder(bookingId: string, amount: number, provider?: string) {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookingId, amount, provider })
    });
    return handleResponse<{
      success: boolean;
      order: {
        orderId: string;
        amount: number;
        currency: string;
        bookingId: string;
        roomNumber: string;
        provider: string;
        key: string;
      };
    }>(res);
  },

  async verifyPayment(bookingId: string, paymentMethod: string, transactionId?: string) {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookingId, paymentMethod, transactionId })
    });
    return handleResponse<{ success: boolean; message: string; payment: Payment; booking: Booking }>(res);
  },

  // Admin operations
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; stats: AdminStats }>(res);
  },

  async getAllBookings(status?: string, search?: string) {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (search) query.append('search', search);

    const res = await fetch(`${API_BASE}/admin/bookings?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; count: number; bookings: Booking[] }>(res);
  },

  async updateBookingStatus(id: string, status: { bookingStatus?: string; paymentStatus?: string }) {
    const res = await fetch(`${API_BASE}/admin/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(status)
    });
    return handleResponse<{ success: boolean; message: string; booking: Booking }>(res);
  },

  async getAllUsers(search?: string, role?: string) {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (role) query.append('role', role);

    const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; count: number; users: User[] }>(res);
  },

  async updateUserRole(id: string, role: 'admin' | 'customer') {
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    return handleResponse<{ success: boolean; message: string; user: User }>(res);
  },

  async toggleUserStatus(id: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; message: string; user: User }>(res);
  },

  async getAllPayments() {
    const res = await fetch(`${API_BASE}/admin/payments`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; count: number; payments: Payment[] }>(res);
  }
};
