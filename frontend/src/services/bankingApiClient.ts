/**
 * Banking API Client
 * Comprehensive client for making API calls using the tool registry
 */

import { BANKING_API_REGISTRY, BankingToolRegistry, ApiEndpoint } from './bankingToolRegistry';
import type {
  ApiResponse,
  AccountBalance,
  MiniStatement,
  AccountDetails,
  CardBlockResponse,
  CardUnblockResponse,
  CardRequestResponse,
  LoanApplicationResponse,
  LoanStatusResponse,
  TransactionResponse,
  TransactionHistory,
  CancelTransactionResponse,
  ComplaintResponse,
  ComplaintStatus,
  OffersResponse,
  BranchesResponse,
  BlockCardRequest,
  UnblockCardRequest,
  RequestNewCardRequest,
  LoanApplicationRequest,
  SendMoneyRequest,
  CancelTransactionRequest,
  RaiseComplaintRequest,
  TransactionHistoryQuery,
  BranchSearchQuery,
  OffersQuery
} from '@/types/bankingApi';

export class BankingApiClient {
  private baseUrl: string;
  private apiKey?: string;
  private authToken?: string;

  constructor(baseUrl: string = '/api', config?: { apiKey?: string; authToken?: string }) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config?.apiKey;
    this.authToken = config?.authToken;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Generic API call method
   */
  private async apiCall<T>(
    endpoint: ApiEndpoint,
    params?: Record<string, any>,
    body?: any
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint.endpoint, params);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const requestConfig: RequestInit = {
      method: endpoint.method,
      headers,
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      requestConfig.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestConfig);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build URL with parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    // Replace path parameters (e.g., :id)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, encodeURIComponent(String(value)));
      });
      
      // Add query parameters for GET requests
      const queryParams = Object.entries(params)
        .filter(([key]) => !url.includes(`:${key}`)) // Exclude path parameters
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      
      if (queryParams) {
        url += `?${queryParams}`;
      }
    }
    
    return url;
  }

  // Account Operations
  async getAccountBalance(): Promise<ApiResponse<AccountBalance>> {
    return this.apiCall<AccountBalance>(BANKING_API_REGISTRY.ACCOUNT_BALANCE);
  }

  async getMiniStatement(limit?: number): Promise<ApiResponse<MiniStatement>> {
    return this.apiCall<MiniStatement>(
      BANKING_API_REGISTRY.MINI_STATEMENT,
      limit ? { limit } : undefined
    );
  }

  async getAccountDetails(): Promise<ApiResponse<AccountDetails>> {
    return this.apiCall<AccountDetails>(BANKING_API_REGISTRY.ACCOUNT_DETAILS);
  }

  // Card Operations
  async blockCard(request: BlockCardRequest): Promise<ApiResponse<CardBlockResponse>> {
    return this.apiCall<CardBlockResponse>(
      BANKING_API_REGISTRY.BLOCK_CARD,
      undefined,
      request
    );
  }

  async unblockCard(request: UnblockCardRequest): Promise<ApiResponse<CardUnblockResponse>> {
    return this.apiCall<CardUnblockResponse>(
      BANKING_API_REGISTRY.UNBLOCK_CARD,
      undefined,
      request
    );
  }

  async requestNewCard(request: RequestNewCardRequest): Promise<ApiResponse<CardRequestResponse>> {
    return this.apiCall<CardRequestResponse>(
      BANKING_API_REGISTRY.REQUEST_NEW_CARD,
      undefined,
      request
    );
  }

  // Loan Operations
  async applyLoan(request: LoanApplicationRequest): Promise<ApiResponse<LoanApplicationResponse>> {
    return this.apiCall<LoanApplicationResponse>(
      BANKING_API_REGISTRY.APPLY_LOAN,
      undefined,
      request
    );
  }

  async getLoanStatus(applicationId: string): Promise<ApiResponse<LoanStatusResponse>> {
    return this.apiCall<LoanStatusResponse>(
      BANKING_API_REGISTRY.LOAN_STATUS,
      { applicationId }
    );
  }

  // Transaction Operations
  async sendMoney(request: SendMoneyRequest): Promise<ApiResponse<TransactionResponse>> {
    return this.apiCall<TransactionResponse>(
      BANKING_API_REGISTRY.SEND_MONEY,
      undefined,
      request
    );
  }

  async getTransactionHistory(query?: TransactionHistoryQuery): Promise<ApiResponse<TransactionHistory>> {
    return this.apiCall<TransactionHistory>(
      BANKING_API_REGISTRY.TRANSACTION_HISTORY,
      query
    );
  }

  async cancelTransaction(request: CancelTransactionRequest): Promise<ApiResponse<CancelTransactionResponse>> {
    return this.apiCall<CancelTransactionResponse>(
      BANKING_API_REGISTRY.CANCEL_TRANSACTION,
      undefined,
      request
    );
  }

  // Support Operations
  async raiseComplaint(request: RaiseComplaintRequest): Promise<ApiResponse<ComplaintResponse>> {
    return this.apiCall<ComplaintResponse>(
      BANKING_API_REGISTRY.RAISE_COMPLAINT,
      undefined,
      request
    );
  }

  async trackComplaint(complaintId: string): Promise<ApiResponse<ComplaintStatus>> {
    return this.apiCall<ComplaintStatus>(
      BANKING_API_REGISTRY.TRACK_COMPLAINT,
      { id: complaintId }
    );
  }

  // Information Services
  async getOffers(query?: OffersQuery): Promise<ApiResponse<OffersResponse>> {
    return this.apiCall<OffersResponse>(
      BANKING_API_REGISTRY.LIST_OFFERS,
      query
    );
  }

  async getBranches(query?: BranchSearchQuery): Promise<ApiResponse<BranchesResponse>> {
    return this.apiCall<BranchesResponse>(
      BANKING_API_REGISTRY.LIST_BRANCHES,
      query
    );
  }

  // Utility Methods
  /**
   * Get available tools by category
   */
  getToolsByCategory(category: ApiEndpoint['category']): ApiEndpoint[] {
    return BankingToolRegistry.getToolsByCategory(category);
  }

  /**
   * Search for available tools
   */
  searchTools(query: string): ApiEndpoint[] {
    return BankingToolRegistry.searchTools(query);
  }

  /**
   * Get all available tools
   */
  getAllTools(): ApiEndpoint[] {
    return BankingToolRegistry.getAllTools();
  }

  /**
   * Execute a custom API call using tool ID
   */
  async executeToolById<T>(
    toolId: string,
    params?: Record<string, any>,
    body?: any
  ): Promise<ApiResponse<T>> {
    const tool = BankingToolRegistry.getToolById(toolId);
    if (!tool) {
      throw new Error(`Tool with ID '${toolId}' not found`);
    }

    return this.apiCall<T>(tool, params, body);
  }

  /**
   * Validate request data against tool schema
   */
  validateRequest(toolId: string, data: any): string[] {
    const tool = BankingToolRegistry.getToolById(toolId);
    if (!tool) {
      return ['Tool not found'];
    }

    const errors: string[] = [];

    // Check required parameters
    if (tool.requiredParams) {
      tool.requiredParams.forEach(param => {
        if (!data || !(param in data)) {
          errors.push(`Required parameter '${param}' is missing`);
        }
      });
    }

    // Additional validation can be added here based on bodySchema
    return errors;
  }

  /**
   * Generate request example for a tool
   */
  getRequestExample(toolId: string): any {
    const tool = BankingToolRegistry.getToolById(toolId);
    return tool?.examples?.request || null;
  }

  /**
   * Generate response example for a tool
   */
  getResponseExample(toolId: string): any {
    const tool = BankingToolRegistry.getToolById(toolId);
    return tool?.examples?.response || null;
  }
}

// Create a default instance
export const bankingApi = new BankingApiClient();

// Export tool registry for direct access
export { BANKING_API_REGISTRY, BankingToolRegistry } from './bankingToolRegistry';

export default BankingApiClient;
