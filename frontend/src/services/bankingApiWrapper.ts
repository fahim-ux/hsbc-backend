/**
 * Banking API Wrapper Functions
 * Direct wrappers for HSBC Banking API endpoints
 */

import type {
  LoginRequest,
  LoginResponse,
  AccountBalanceResponse,
  MiniStatementResponse,
  AccountDetailsResponse,
  BlockCardRequest,
  UnblockCardRequest,
  RequestNewCardRequest,
  CardListResponse,
  LoanApplicationRequest,
  LoanApplicationResponse,
  LoanStatusResponse,
  SendMoneyRequest,
  TransactionResponse,
  TransactionHistoryResponse,
  CancelTransactionRequest,
  RaiseComplaintRequest,
  ComplaintResponse,
  ComplaintDetailsResponse,
  ComplaintsListResponse,
  OffersResponse,
  BranchesResponse,
  HealthResponse,
  ApiErrorResponse
} from '@/types/bankingApiTypes';

export class BankingApiWrapper {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Generic API call wrapper
   */
  private async apiCall<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    requireAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = requireAuth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===== AUTHENTICATION ENDPOINTS =====

  /**
   * 🔐 User Authentication
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.apiCall<LoginResponse>('/auth/login', 'POST', credentials, false);
  }

  /**
   * 🔐 Verify JWT Token
   */
  async verifyToken(): Promise<{ success: boolean; message: string }> {
    return this.apiCall<{ success: boolean; message: string }>('/auth/verify', 'GET', undefined, true);
  }

  // ===== ACCOUNT MANAGEMENT ENDPOINTS =====

  /**
   * 🏦 Get Account Balance
   */
  async getAccountBalance(): Promise<AccountBalanceResponse> {
    return this.apiCall<AccountBalanceResponse>('/account/balance');
  }

  /**
   * 🏦 Get Mini Statement (Recent 5 transactions)
   */
  async getMiniStatement(): Promise<MiniStatementResponse> {
    return this.apiCall<MiniStatementResponse>('/account/mini-statement');
  }

  /**
   * 🏦 Get Complete Account Details
   */
  async getAccountDetails(): Promise<AccountDetailsResponse> {
    return this.apiCall<AccountDetailsResponse>('/account/details');
  }

  // ===== CARD MANAGEMENT ENDPOINTS =====

  /**
   * 💳 Block Card
   */
  async blockCard(request: BlockCardRequest): Promise<{ success: boolean; message: string }> {
    return this.apiCall<{ success: boolean; message: string }>('/card/block', 'POST', request);
  }

  /**
   * 💳 Unblock Card
   */
  async unblockCard(request: UnblockCardRequest): Promise<{ success: boolean; message: string }> {
    return this.apiCall<{ success: boolean; message: string }>('/card/unblock', 'POST', request);
  }

  /**
   * 💳 Request New Card
   */
  async requestNewCard(request: RequestNewCardRequest): Promise<{ success: boolean; data: { cardId: string }; message: string }> {
    return this.apiCall<{ success: boolean; data: { cardId: string }; message: string }>('/card/request', 'POST', request);
  }

  /**
   * 💳 Get All User Cards
   */
  async getCardList(): Promise<CardListResponse> {
    return this.apiCall<CardListResponse>('/card/list');
  }

  // ===== LOAN SERVICES ENDPOINTS =====

  /**
   * 🏠 Apply for Loan
   */
  async applyLoan(request: LoanApplicationRequest): Promise<LoanApplicationResponse> {
    return this.apiCall<LoanApplicationResponse>('/loan/apply', 'POST', request);
  }

  /**
   * 🏠 Get Loan Status
   */
  async getLoanStatus(): Promise<LoanStatusResponse> {
    return this.apiCall<LoanStatusResponse>('/loan/status');
  }

  // ===== TRANSACTION MANAGEMENT ENDPOINTS =====

  /**
   * 💸 Send Money
   */
  async sendMoney(request: SendMoneyRequest): Promise<TransactionResponse> {
    return this.apiCall<TransactionResponse>('/transaction/send', 'POST', request);
  }

  /**
   * 💸 Get Transaction History
   */
  async getTransactionHistory(limit?: number): Promise<TransactionHistoryResponse> {
    const endpoint = limit ? `/transaction/history?limit=${limit}` : '/transaction/history';
    return this.apiCall<TransactionHistoryResponse>(endpoint);
  }

  /**
   * 💸 Cancel Transaction
   */
  async cancelTransaction(request: CancelTransactionRequest): Promise<{ success: boolean; message: string }> {
    return this.apiCall<{ success: boolean; message: string }>('/transaction/cancel', 'POST', request);
  }

  // ===== SUPPORT SYSTEM ENDPOINTS =====

  /**
   * 🎧 File Support Complaint
   */
  async raiseComplaint(request: RaiseComplaintRequest): Promise<ComplaintResponse> {
    return this.apiCall<ComplaintResponse>('/support/complaint', 'POST', request);
  }

  /**
   * 🎧 Track Specific Complaint
   */
  async trackComplaint(complaintId: string): Promise<ComplaintDetailsResponse> {
    return this.apiCall<ComplaintDetailsResponse>(`/support/complaint/${complaintId}`);
  }

  /**
   * 🎧 Get All User Complaints
   */
  async getComplaints(): Promise<ComplaintsListResponse> {
    return this.apiCall<ComplaintsListResponse>('/support/complaints');
  }

  // ===== BANKING INFORMATION ENDPOINTS =====

  /**
   * 🎁 Get Current Banking Offers
   */
  async getOffers(): Promise<OffersResponse> {
    return this.apiCall<OffersResponse>('/offers');
  }

  /**
   * 🏢 Get Branch Locations
   */
  async getBranches(): Promise<BranchesResponse> {
    return this.apiCall<BranchesResponse>('/branches');
  }

  // ===== UTILITY ENDPOINTS =====

  /**
   * ❤️ API Health Check
   */
  async healthCheck(): Promise<HealthResponse> {
    return this.apiCall<HealthResponse>('/health', 'GET', undefined, false);
  }
}

// Create default instance
export const bankingApiWrapper = new BankingApiWrapper();

export default BankingApiWrapper;
