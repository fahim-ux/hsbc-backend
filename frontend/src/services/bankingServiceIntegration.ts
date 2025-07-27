/**
 * Banking Service Integration
 * Enhanced integration using LLM Agent and API Wrapper
 */

import { BankingLLMAgent, bankingLLMAgent } from './bankingLLMAgent';
import { BankingApiWrapper } from './bankingApiWrapper';
import { ConversationContext } from '@/types/conversation';
import type {
  LoginRequest,
  AccountBalanceResponse,
  MiniStatementResponse,
  AccountDetailsResponse,
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
  OffersResponse,
  BranchesResponse
} from '@/types/bankingApiTypes';

export interface BankingServiceOptions {
  apiClient?: BankingApiClient;
  enableMockData?: boolean;
  authToken?: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class BankingServiceIntegration {
  private apiClient: BankingApiClient;
  private enableMockData: boolean;

  constructor(options: BankingServiceOptions = {}) {
    this.apiClient = options.apiClient || bankingApi;
    this.enableMockData = options.enableMockData ?? true; // Default to mock data for development
    
    if (options.authToken) {
      this.apiClient.setAuthToken(options.authToken);
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.apiClient.setAuthToken(token);
  }

  /**
   * Enable or disable mock data
   */
  setMockDataEnabled(enabled: boolean): void {
    this.enableMockData = enabled;
  }

  /**
   * Execute banking operation based on intent and context
   */
  async executeBankingOperation(
    intent: string,
    context: ConversationContext,
    parameters?: Record<string, any>
  ): Promise<ServiceResponse<any>> {
    try {
      // If mock data is enabled, return mock responses
      if (this.enableMockData) {
        return this.getMockResponse(intent, parameters);
      }

      // Execute real API calls based on intent
      switch (intent.toLowerCase()) {
        case 'check_balance':
        case 'account_balance':
          return await this.handleAccountBalance();

        case 'mini_statement':
        case 'recent_transactions':
          return await this.handleMiniStatement(parameters?.limit);

        case 'account_details':
        case 'account_info':
          return await this.handleAccountDetails();

        case 'block_card':
          return await this.handleBlockCard(parameters as BlockCardRequest);

        case 'unblock_card':
          return await this.handleUnblockCard(parameters as UnblockCardRequest);

        case 'request_new_card':
          return await this.handleRequestNewCard(parameters as RequestNewCardRequest);

        case 'apply_loan':
          return await this.handleApplyLoan(parameters as LoanApplicationRequest);

        case 'loan_status':
          return await this.handleLoanStatus(parameters?.applicationId);

        case 'send_money':
        case 'transfer_money':
          return await this.handleSendMoney(parameters as SendMoneyRequest);

        case 'transaction_history':
          return await this.handleTransactionHistory(parameters as TransactionHistoryQuery);

        case 'cancel_transaction':
          return await this.handleCancelTransaction(parameters as CancelTransactionRequest);

        case 'raise_complaint':
        case 'file_complaint':
          return await this.handleRaiseComplaint(parameters as RaiseComplaintRequest);

        case 'track_complaint':
        case 'complaint_status':
          return await this.handleTrackComplaint(parameters?.complaintId);

        case 'list_offers':
        case 'available_offers':
          return await this.handleListOffers(parameters as OffersQuery);

        case 'find_branches':
        case 'branch_locations':
          return await this.handleFindBranches(parameters as BranchSearchQuery);

        default:
          return {
            success: false,
            error: `Unknown banking operation: ${intent}`,
            message: 'I don\'t recognize that banking operation. Please try again with a different request.'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'I encountered an error while processing your request. Please try again.'
      };
    }
  }

  // Account Operations
  private async handleAccountBalance(): Promise<ServiceResponse<AccountBalance>> {
    try {
      const response = await this.apiClient.getAccountBalance();
      return {
        success: true,
        data: response.data,
        message: 'Account balance retrieved successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to get account balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleMiniStatement(limit?: number): Promise<ServiceResponse<MiniStatement>> {
    try {
      const response = await this.apiClient.getMiniStatement(limit);
      return {
        success: true,
        data: response.data,
        message: 'Mini statement retrieved successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to get mini statement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleAccountDetails(): Promise<ServiceResponse<AccountDetails>> {
    try {
      const response = await this.apiClient.getAccountDetails();
      return {
        success: true,
        data: response.data,
        message: 'Account details retrieved successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to get account details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Card Operations
  private async handleBlockCard(request: BlockCardRequest): Promise<ServiceResponse<CardBlockResponse>> {
    try {
      const response = await this.apiClient.blockCard(request);
      return {
        success: true,
        data: response.data,
        message: 'Card blocked successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to block card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleUnblockCard(request: UnblockCardRequest): Promise<ServiceResponse<CardUnblockResponse>> {
    try {
      const response = await this.apiClient.unblockCard(request);
      return {
        success: true,
        data: response.data,
        message: 'Card unblocked successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to unblock card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleRequestNewCard(request: RequestNewCardRequest): Promise<ServiceResponse<CardRequestResponse>> {
    try {
      const response = await this.apiClient.requestNewCard(request);
      return {
        success: true,
        data: response.data,
        message: 'New card request submitted successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to request new card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Loan Operations
  private async handleApplyLoan(request: LoanApplicationRequest): Promise<ServiceResponse<LoanApplicationResponse>> {
    try {
      const response = await this.apiClient.applyLoan(request);
      return {
        success: true,
        data: response.data,
        message: 'Loan application submitted successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to apply for loan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleLoanStatus(applicationId: string): Promise<ServiceResponse<LoanStatusResponse>> {
    try {
      const response = await this.apiClient.getLoanStatus(applicationId);
      return {
        success: true,
        data: response.data,
        message: 'Loan status retrieved successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to get loan status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Transaction Operations
  private async handleSendMoney(request: SendMoneyRequest): Promise<ServiceResponse<TransactionResponse>> {
    try {
      const response = await this.apiClient.sendMoney(request);
      return {
        success: true,
        data: response.data,
        message: 'Money transfer completed successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to send money: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleTransactionHistory(query?: TransactionHistoryQuery): Promise<ServiceResponse<TransactionHistory>> {
    try {
      const response = await this.apiClient.getTransactionHistory(query);
      return {
        success: true,
        data: response.data,
        message: 'Transaction history retrieved successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleCancelTransaction(request: CancelTransactionRequest): Promise<ServiceResponse<CancelTransactionResponse>> {
    try {
      const response = await this.apiClient.cancelTransaction(request);
      return {
        success: true,
        data: response.data,
        message: 'Transaction cancellation processed.'
      };
    } catch (error) {
      throw new Error(`Failed to cancel transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Support Operations
  private async handleRaiseComplaint(request: RaiseComplaintRequest): Promise<ServiceResponse<ComplaintResponse>> {
    try {
      const response = await this.apiClient.raiseComplaint(request);
      return {
        success: true,
        data: response.data,
        message: 'Complaint raised successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to raise complaint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleTrackComplaint(complaintId: string): Promise<ServiceResponse<ComplaintStatus>> {
    try {
      const response = await this.apiClient.trackComplaint(complaintId);
      return {
        success: true,
        data: response.data,
        message: 'Complaint status retrieved successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to track complaint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Information Services
  private async handleListOffers(query?: OffersQuery): Promise<ServiceResponse<OffersResponse>> {
    try {
      const response = await this.apiClient.getOffers(query);
      return {
        success: true,
        data: response.data,
        message: 'Offers retrieved successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to get offers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleFindBranches(query?: BranchSearchQuery): Promise<ServiceResponse<BranchesResponse>> {
    try {
      const response = await this.apiClient.getBranches(query);
      return {
        success: true,
        data: response.data,
        message: 'Branch information retrieved successfully.'
      };
    } catch (error) {
      throw new Error(`Failed to find branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate mock responses for development/testing
   */
  private getMockResponse(intent: string, parameters?: Record<string, any>): ServiceResponse<any> {
    const mockData = {
      check_balance: {
        accountNumber: '****1234',
        balance: 15750.50,
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      },
      mini_statement: {
        accountNumber: '****1234',
        transactions: [
          {
            id: 'txn_001',
            date: '2024-01-15',
            description: 'ATM Withdrawal',
            amount: -200.00,
            balance: 15750.50
          },
          {
            id: 'txn_002',
            date: '2024-01-14',
            description: 'Salary Credit',
            amount: 5000.00,
            balance: 15950.50
          }
        ]
      },
      block_card: {
        cardNumber: '****1234',
        status: 'BLOCKED',
        blockedAt: new Date().toISOString(),
        reason: parameters?.reason || 'User requested'
      },
      send_money: {
        transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
        status: 'SUCCESS',
        amount: parameters?.amount || 100,
        recipient: parameters?.recipient || 'John Doe',
        completedAt: new Date().toISOString()
      },
      apply_loan: {
        applicationId: 'loan_' + Math.random().toString(36).substr(2, 9),
        status: 'SUBMITTED',
        amount: parameters?.amount || 10000,
        type: parameters?.type || 'personal',
        submittedAt: new Date().toISOString()
      }
    };

    const intentKey = intent.toLowerCase().replace(/_/g, '_');
    const data = mockData[intentKey as keyof typeof mockData];

    if (data) {
      return {
        success: true,
        data,
        message: `Mock response for ${intent} operation.`
      };
    }

    return {
      success: false,
      error: `No mock data available for intent: ${intent}`,
      message: 'This operation is not yet supported in mock mode.'
    };
  }

  /**
   * Get available banking operations
   */
  getAvailableOperations(): string[] {
    return this.apiClient.getAllTools().map(tool => tool.id);
  }

  /**
   * Search for banking operations
   */
  searchOperations(query: string): string[] {
    return this.apiClient.searchTools(query).map(tool => tool.id);
  }

  /**
   * Get operation details
   */
  getOperationDetails(operationId: string): any {
    const tools = this.apiClient.getAllTools();
    return tools.find(tool => tool.id === operationId);
  }
}

// Create a default instance
export const bankingService = new BankingServiceIntegration();

export default BankingServiceIntegration;
