export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  accountNumber: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: 'savings' | 'current' | 'fixed_deposit';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId?: string;
  amount: number;
  type: 'credit' | 'debit' | 'transfer';
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  userId: string;
  cardNumber: string;
  cardType: 'debit' | 'credit';
  expiryDate: Date;
  isBlocked: boolean;
  isActive: boolean;
  cardLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: string;
  userId: string;
  loanType: 'personal' | 'home' | 'car' | 'education';
  amount: number;
  interestRate: number;
  tenure: number; // in months
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'closed';
  applicationDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
}

export interface Complaint {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: 'transaction' | 'card' | 'loan' | 'account' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  category: 'loan' | 'card' | 'deposit' | 'insurance' | 'investment';
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  termsAndConditions: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  email: string;
  latitude?: number;
  longitude?: number;
  workingHours: string;
  services: string[];
  hasATM: boolean;
}

export interface JWTPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest {
  user: JWTPayload;
}
