/**
 * Enhanced Banking Service Integration
 * Uses LLM Agent for intelligent banking operations
 */

import { BankingLLMAgent, bankingLLMAgent } from './bankingLLMAgent';
import { ConversationContext } from '@/types/conversation';

export interface EnhancedServiceOptions {
  llmAgent?: BankingLLMAgent;
  enableMockData?: boolean;
  authToken?: string;
}

export interface EnhancedServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  toolUsed?: string;
}

export class EnhancedBankingService {
  private llmAgent: BankingLLMAgent;
  private enableMockData: boolean;

  constructor(options: EnhancedServiceOptions = {}) {
    this.llmAgent = options.llmAgent || bankingLLMAgent;
    this.enableMockData = options.enableMockData ?? false; // Default to real API calls
    
    if (options.authToken) {
      this.llmAgent.setAuthToken(options.authToken);
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.llmAgent.setAuthToken(token);
  }

  /**
   * Enable or disable mock data
   */
  setMockDataEnabled(enabled: boolean): void {
    this.enableMockData = enabled;
  }

  /**
   * Execute banking operation using natural language intent
   */
  async executeBankingOperation(
    intent: string,
    context: ConversationContext,
    parameters?: Record<string, any>
  ): Promise<EnhancedServiceResponse<any>> {
    try {
      // If mock data is enabled, return mock responses
      if (this.enableMockData) {
        return this.getMockResponse(intent, parameters);
      }

      // Map intent to tool name and execute
      const toolName = this.mapIntentToTool(intent);
      if (!toolName) {
        return {
          success: false,
          error: `Unknown banking operation: ${intent}`,
          message: 'I don\'t recognize that banking operation. Please try again with a different request.'
        };
      }

      // Validate tool exists
      const tool = this.llmAgent.getTool(toolName);
      if (!tool) {
        return {
          success: false,
          error: `Tool '${toolName}' not found`,
          message: 'This banking operation is not available at the moment.'
        };
      }

      // Validate parameters if provided
      if (parameters) {
        const validationErrors = this.llmAgent.validateToolParameters(toolName, parameters);
        if (validationErrors.length > 0) {
          return {
            success: false,
            error: validationErrors.join(', '),
            message: 'Please check your input and try again.'
          };
        }
      }

      // Execute the tool
      const result = await this.llmAgent.executeTool(toolName, parameters || {});
      
      return {
        success: true,
        data: result,
        message: 'Operation completed successfully.',
        toolUsed: toolName
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'I encountered an error while processing your request. Please try again.'
      };
    }
  }

  /**
   * Map natural language intent to tool name
   */
  private mapIntentToTool(intent: string): string | null {
    const intentMap: Record<string, string> = {
      // Authentication
      'login': 'login_user',
      'authenticate': 'login_user',
      'sign_in': 'login_user',
      'verify_token': 'verify_token',
      'check_auth': 'verify_token',

      // Account operations
      'check_balance': 'get_account_balance',
      'account_balance': 'get_account_balance',
      'balance': 'get_account_balance',
      'mini_statement': 'get_mini_statement',
      'recent_transactions': 'get_mini_statement',
      'last_transactions': 'get_mini_statement',
      'account_details': 'get_account_details',
      'account_info': 'get_account_details',
      'profile': 'get_account_details',

      // Card operations
      'block_card': 'block_card',
      'stop_card': 'block_card',
      'freeze_card': 'block_card',
      'unblock_card': 'unblock_card',
      'activate_card': 'unblock_card',
      'unfreeze_card': 'unblock_card',
      'request_new_card': 'request_new_card',
      'order_card': 'request_new_card',
      'new_card': 'request_new_card',
      'get_cards': 'get_cards_list',
      'list_cards': 'get_cards_list',
      'my_cards': 'get_cards_list',

      // Loan operations
      'apply_loan': 'apply_for_loan',
      'loan_application': 'apply_for_loan',
      'request_loan': 'apply_for_loan',
      'loan_status': 'get_loan_status',
      'check_loan': 'get_loan_status',
      'my_loans': 'get_loan_status',

      // Transaction operations
      'send_money': 'send_money',
      'transfer_money': 'send_money',
      'pay': 'send_money',
      'transfer': 'send_money',
      'transaction_history': 'get_transaction_history',
      'transactions': 'get_transaction_history',
      'payment_history': 'get_transaction_history',
      'cancel_transaction': 'cancel_transaction',
      'stop_payment': 'cancel_transaction',

      // Support operations
      'raise_complaint': 'raise_complaint',
      'file_complaint': 'raise_complaint',
      'complaint': 'raise_complaint',
      'issue': 'raise_complaint',
      'track_complaint': 'track_complaint',
      'complaint_status': 'track_complaint',
      'check_complaint': 'track_complaint',
      'get_complaints': 'get_all_complaints',
      'my_complaints': 'get_all_complaints',

      // Information services
      'offers': 'get_banking_offers',
      'promotions': 'get_banking_offers',
      'deals': 'get_banking_offers',
      'branches': 'get_branch_locations',
      'branch_locations': 'get_branch_locations',
      'atm_locations': 'get_branch_locations',
      'find_branch': 'get_branch_locations',

      // Utility
      'health_check': 'check_api_health',
      'api_status': 'check_api_health',
      'system_status': 'check_api_health'
    };

    const normalizedIntent = intent.toLowerCase().replace(/[_\s-]+/g, '_');
    return intentMap[normalizedIntent] || null;
  }

  /**
   * Get all available tools for LLM registration
   */
  getAllTools() {
    return this.llmAgent.getAllTools();
  }

  /**
   * Get OpenAI-compatible function definitions
   */
  getOpenAIFunctionDefinitions() {
    return this.llmAgent.getOpenAIFunctionDefinitions();
  }

  /**
   * Get Google AI-compatible function definitions
   */
  getGoogleAIFunctionDefinitions() {
    return this.llmAgent.getGoogleAIFunctionDefinitions();
  }

  /**
   * Execute tool directly by name (for LLM function calling)
   */
  async executeToolByName(toolName: string, parameters: any): Promise<any> {
    return this.llmAgent.executeTool(toolName, parameters);
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string) {
    return this.llmAgent.getToolsByCategory(category as any);
  }

  /**
   * Search available tools
   */
  searchTools(query: string) {
    return this.llmAgent.searchTools(query);
  }

  /**
   * Get available banking operations
   */
  getAvailableOperations(): string[] {
    return this.llmAgent.getAllTools().map(tool => tool.name);
  }

  /**
   * Get operation details
   */
  getOperationDetails(operationName: string): any {
    return this.llmAgent.getTool(operationName);
  }

  /**
   * Generate mock responses for development/testing
   */
  private getMockResponse(intent: string, parameters?: Record<string, any>): EnhancedServiceResponse<any> {
    const mockData = {
      check_balance: {
        success: true,
        data: {
          balance: 15750.50,
          accountNumber: '****1234'
        },
        message: 'Account balance retrieved successfully'
      },
      mini_statement: {
        success: true,
        data: {
          transactions: [
            {
              id: 'txn_001',
              amount: -200.00,
              type: 'debit',
              description: 'ATM Withdrawal',
              status: 'completed',
              createdAt: new Date().toISOString()
            },
            {
              id: 'txn_002',
              amount: 5000.00,
              type: 'credit',
              description: 'Salary Credit',
              status: 'completed',
              createdAt: new Date().toISOString()
            }
          ]
        },
        message: 'Mini statement retrieved successfully'
      },
      block_card: {
        success: true,
        message: `Card ${parameters?.cardId || 'card-123'} blocked successfully`
      },
      send_money: {
        success: true,
        data: {
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
        },
        message: `Successfully transferred $${parameters?.amount || 100} to ${parameters?.toAccountNumber || 'ACC002'}`
      },
      apply_loan: {
        success: true,
        data: {
          loanId: 'loan_' + Math.random().toString(36).substr(2, 9)
        },
        message: `${parameters?.loanType || 'Personal'} loan application submitted successfully for $${parameters?.amount || 10000}`
      },
      login: {
        success: true,
        token: 'mock_jwt_token_' + Math.random().toString(36).substr(2, 20),
        user: {
          id: 'user-1',
          username: parameters?.username || 'john_doe',
          fullName: 'John Doe',
          email: 'john@example.com'
        },
        message: 'Login successful'
      }
    };

    const intentKey = intent.toLowerCase().replace(/[_\s-]+/g, '_');
    const data = mockData[intentKey as keyof typeof mockData];

    if (data) {
      return {
        success: true,
        data,
        message: `Mock response for ${intent} operation.`,
        toolUsed: this.mapIntentToTool(intent) || intent
      };
    }

    return {
      success: false,
      error: `No mock data available for intent: ${intent}`,
      message: 'This operation is not yet supported in mock mode.'
    };
  }
}

// Create default instance
export const enhancedBankingService = new EnhancedBankingService();

export default EnhancedBankingService;
