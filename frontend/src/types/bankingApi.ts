/**
 * Type definitions for Banking API Tool Registry
 */

// Account Related Types
export interface AccountBalance {
  accountNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  referenceNumber?: string;
  balance: number;
}

export interface MiniStatement {
  accountNumber: string;
  transactions: Transaction[];
  generatedAt: string;
}

export interface AccountDetails {
  accountNumber: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT';
  holderName: string;
  email: string;
  phone: string;
  address: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  openingDate: string;
  branch: string;
  ifscCode: string;
}

// Card Related Types
export interface CardBlockResponse {
  success: boolean;
  blockReference: string;
  message: string;
  blockedAt: string;
}

export interface CardUnblockResponse {
  success: boolean;
  message: string;
  unblockedAt: string;
}

export interface CardRequestResponse {
  success: boolean;
  requestId: string;
  estimatedDelivery: string;
  trackingNumber: string;
  charges?: number;
}

// Loan Related Types
export interface LoanApplicationResponse {
  success: boolean;
  applicationId: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  estimatedProcessingTime: string;
  nextSteps: string[];
  documentsRequired?: string[];
}

export interface LoanStatusResponse {
  applicationId: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'ACTIVE' | 'CLOSED';
  loanAmount: number;
  interestRate: number;
  tenure: number;
  emi?: number;
  disbursementDate?: string;
  nextEmiDate?: string;
  outstandingAmount?: number;
  loanType: 'PERSONAL' | 'HOME' | 'BUSINESS' | 'AUTO' | 'EDUCATION';
}

// Transaction Related Types
export interface TransactionResponse {
  success: boolean;
  transactionId: string;
  referenceNumber: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  debitedAmount: number;
  charges: number;
  completedAt: string;
  recipientDetails?: {
    name: string;
    account: string;
  };
}

export interface TransactionHistory {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters?: {
    fromDate?: string;
    toDate?: string;
    type?: 'DEBIT' | 'CREDIT';
  };
}

export interface CancelTransactionResponse {
  success: boolean;
  message: string;
  refundAmount: number;
  refundReference: string;
  refundTimeline: string;
}

// Support Related Types
export interface ComplaintResponse {
  success: boolean;
  complaintId: string;
  ticketNumber: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  estimatedResolution: string;
  assignedAgent?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface ComplaintUpdate {
  date: string;
  message: string;
  agent: string;
  status?: string;
}

export interface ComplaintStatus {
  complaintId: string;
  ticketNumber: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category: 'TRANSACTION' | 'CARD' | 'LOAN' | 'ACCOUNT' | 'SERVICE' | 'OTHER';
  subcategory?: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  lastUpdated: string;
  estimatedResolution?: string;
  assignedAgent?: string;
  resolution?: string;
  updates: ComplaintUpdate[];
}

// Information Service Types
export interface BankingOffer {
  id: string;
  title: string;
  description: string;
  category: 'LOAN' | 'CARD' | 'ACCOUNT' | 'INVESTMENT' | 'INSURANCE';
  offerType: 'DISCOUNT' | 'SPECIAL_RATE' | 'CASHBACK' | 'REWARD_POINTS';
  validFrom: string;
  validUntil: string;
  terms: string;
  eligibility?: string[];
  minimumAmount?: number;
  maximumAmount?: number;
}

export interface OffersResponse {
  offers: BankingOffer[];
  totalCount: number;
  categories: string[];
}

export interface BranchLocation {
  id: string;
  name: string;
  type: 'BRANCH' | 'ATM' | 'CASH_DEPOSIT_MACHINE';
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  services: ('ATM' | 'CASH_DEPOSIT' | 'CUSTOMER_SERVICE' | 'LOCKER' | 'FOREX')[];
  operatingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // in kilometers
  isActive: boolean;
}

export interface BranchesResponse {
  branches: BranchLocation[];
  totalCount: number;
  searchRadius?: number;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

// API Request Body Types
export interface BlockCardRequest {
  cardNumber: string;
  cardType: 'DEBIT' | 'CREDIT';
  reason: 'LOST' | 'STOLEN' | 'DAMAGED' | 'SUSPICIOUS_ACTIVITY';
  additionalNotes?: string;
}

export interface UnblockCardRequest {
  cardNumber: string;
  blockReference: string;
  reason: string;
}

export interface RequestNewCardRequest {
  cardType: 'DEBIT' | 'CREDIT';
  reason: 'NEW' | 'REPLACEMENT' | 'UPGRADE';
  deliveryAddress: string;
  urgentDelivery?: boolean;
}

export interface LoanApplicationRequest {
  loanType: 'PERSONAL' | 'HOME' | 'BUSINESS' | 'AUTO' | 'EDUCATION';
  amount: number;
  purpose: string;
  monthlyIncome: number;
  employmentStatus: 'EMPLOYED' | 'SELF_EMPLOYED' | 'RETIRED' | 'STUDENT';
  employmentDetails?: string;
  requestedTenure?: number;
  collateral?: string;
  coApplicantDetails?: {
    name: string;
    income: number;
    relationship: string;
  };
}

export interface SendMoneyRequest {
  recipientAccount: string;
  recipientName: string;
  amount: number;
  purpose: string;
  transferType: 'IMPS' | 'NEFT' | 'RTGS' | 'UPI';
  scheduledDate?: string;
  remarks?: string;
  beneficiaryId?: string;
}

export interface CancelTransactionRequest {
  transactionId: string;
  reason: string;
}

export interface RaiseComplaintRequest {
  category: 'TRANSACTION' | 'CARD' | 'LOAN' | 'ACCOUNT' | 'SERVICE' | 'OTHER';
  subcategory?: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments?: string[];
  relatedTransactionId?: string;
  relatedAccountNumber?: string;
}

// API Response Base Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Query Parameters Types
export interface TransactionHistoryQuery {
  fromDate?: string;
  toDate?: string;
  type?: 'DEBIT' | 'CREDIT';
  limit?: number;
  page?: number;
  category?: string;
}

export interface BranchSearchQuery {
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  type?: 'BRANCH' | 'ATM' | 'CASH_DEPOSIT_MACHINE';
  services?: string[];
  radius?: number; // in kilometers
}

export interface OffersQuery {
  category?: 'LOAN' | 'CARD' | 'ACCOUNT' | 'INVESTMENT' | 'INSURANCE';
  active?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ValidationError extends ApiError {
  field: string;
  constraint: string;
}

// Banking Constants
export const CARD_TYPES = ['DEBIT', 'CREDIT'] as const;
export const LOAN_TYPES = ['PERSONAL', 'HOME', 'BUSINESS', 'AUTO', 'EDUCATION'] as const;
export const TRANSACTION_TYPES = ['DEBIT', 'CREDIT'] as const;
export const TRANSFER_TYPES = ['IMPS', 'NEFT', 'RTGS', 'UPI'] as const;
export const ACCOUNT_TYPES = ['SAVINGS', 'CURRENT', 'FIXED_DEPOSIT'] as const;
export const COMPLAINT_CATEGORIES = ['TRANSACTION', 'CARD', 'LOAN', 'ACCOUNT', 'SERVICE', 'OTHER'] as const;
export const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export type CardType = typeof CARD_TYPES[number];
export type LoanType = typeof LOAN_TYPES[number];
export type TransactionType = typeof TRANSACTION_TYPES[number];
export type TransferType = typeof TRANSFER_TYPES[number];
export type AccountType = typeof ACCOUNT_TYPES[number];
export type ComplaintCategory = typeof COMPLAINT_CATEGORIES[number];
export type PriorityLevel = typeof PRIORITY_LEVELS[number];
