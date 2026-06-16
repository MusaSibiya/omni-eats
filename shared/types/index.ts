export interface Restaurant {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  rating: number;
  deliveryTime?: string | null;
  cuisineType?: string | null;
  dietaryOptions?: string | null;
  ownerId?: string | null;
  status: string;
  isOpen: boolean;
  deliveryAvailable: boolean;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  category: string;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  driverId?: string | null;
  status: string;
  deliveryType: string;
  total: number;
  paymentStatus: string;
  promoCode?: string | null;
  discount?: number | null;
  addressId?: string | null;
  deliveryAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
