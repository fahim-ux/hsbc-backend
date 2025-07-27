/**
 * Banking API Types
 * Type definitions for HSBC Banking API endpoints
 */

// ===== AUTHENTICATION TYPES =====
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
  };
}

// ===== ACCOUNT TYPES =====
export interface AccountBalanceResponse {
  success: boolean;
  data: {
    balance: number;
    accountNumber: string;
  };
  message: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface MiniStatementResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
  };
  message: string;
}

export interface AccountDetailsResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      phoneNumber: string;
    };
    account: {
      id: string;
      accountNumber: string;
      accountType: string;
      balance: number;
      currency: string;
    };
  };
  message: string;
}

// ===== CARD TYPES =====
export interface BlockCardRequest {
  cardId: string;
}

export interface UnblockCardRequest {
  cardId: string;
}

export interface RequestNewCardRequest {
  cardType: 'debit' | 'credit';
}

export interface Card {
  id: string;
  cardNumber: string;
  cardType: 'debit' | 'credit';
  isBlocked: boolean;
  isActive: boolean;
  expiryDate: string;
  cardLimit: number;
}

export interface CardListResponse {
  success: boolean;
  data: {
    cards: Card[];
  };
  message: string;
}

// ===== LOAN TYPES =====
export interface LoanApplicationRequest {
  loanType: 'personal' | 'home' | 'car' | 'education';
  amount: number;
  tenure: number;
}

export interface LoanApplicationResponse {
  success: boolean;
  data: {
    loanId: string;
  };
  message: string;
}

export interface Loan {
  id: string;
  loanType: 'personal' | 'home' | 'car' | 'education';
  amount: number;
  interestRate: number;
  tenure: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  applicationDate: string;
}

export interface LoanStatusResponse {
  success: boolean;
  data: {
    loans: Loan[];
  };
  message: string;
}

// ===== TRANSACTION TYPES =====
export interface SendMoneyRequest {
  toAccountNumber: string;
  amount: number;
  description?: string;
}

export interface TransactionResponse {
  success: boolean;
  data: {
    transactionId: string;
  };
  message: string;
}

export interface TransactionHistoryItem {
  id: string;
  fromAccountId: string;
  toAccountId: string | null;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  reference: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  data: {
    transactions: TransactionHistoryItem[];
  };
  message: string;
}

export interface CancelTransactionRequest {
  transactionId: string;
}

// ===== SUPPORT TYPES =====
export interface RaiseComplaintRequest {
  subject: string;
  description: string;
  category: 'transaction' | 'card' | 'loan' | 'account' | 'general';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ComplaintResponse {
  success: boolean;
  data: {
    complaintId: string;
  };
  message: string;
}

export interface Complaint {
  id: string;
  subject: string;
  description: string;
  category: 'transaction' | 'card' | 'loan' | 'account' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
}

export interface ComplaintDetailsResponse {
  success: boolean;
  data: {
    complaint: Complaint;
  };
  message: string;
}

export interface ComplaintsListResponse {
  success: boolean;
  data: {
    complaints: Complaint[];
  };
  message: string;
}

// ===== INFORMATION TYPES =====
export interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  termsAndConditions: string;
}

export interface OffersResponse {
  success: boolean;
  data: {
    offers: Offer[];
  };
  message: string;
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
  workingHours: string;
  services: string[];
  hasATM: boolean;
}

export interface BranchesResponse {
  success: boolean;
  data: {
    branches: Branch[];
  };
  message: string;
}

// ===== UTILITY TYPES =====
export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
}

// ===== COMMON RESPONSE WRAPPER =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
}
