import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  fcmToken?: string;
  createdAt: Timestamp;
}

export type Audience = 'women' | 'kids';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  category: string;
  imageUrl: string;
  isActive: boolean;
  audience: Audience;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  hasReview?: boolean;
  createdAt: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stockCount: number;
  isActive: boolean;
  audience: Audience;
}

export interface PreBooking {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: 'active' | 'collected' | 'expired';
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

export interface Instalment {
  amount: number;
  paidAt: Timestamp;
  method: 'gpay' | 'cash' | 'razorpay';
  transactionId?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  referenceType: 'booking' | 'preBooking';
  referenceId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  instalments: Instalment[];
  paymentMode: 'full' | 'instalment';
  maxInstalments: 4;
  numberOfInstalments?: number;
  instalmentAmount?: number;
  status: 'pending' | 'partial' | 'paid';
  dueDate: Timestamp;
  createdAt: Timestamp;
}

export interface Feedback {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp;
}
