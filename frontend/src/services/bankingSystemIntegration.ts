/**
 * Complete Banking System Integration
 * Final integration layer for HSBC Banking LLM Agent
 */

import { BankingLLMAgent } from '@/services/bankingLLMAgent';
import { BankingApiWrapper } from '@/services/bankingApiWrapper';
import { EnhancedBankingService } from '@/services/enhancedBankingService';

// Re-export all banking services for easy access
export { BankingLLMAgent } from '@/services/bankingLLMAgent';
export { BankingApiWrapper } from '@/services/bankingApiWrapper';
export { EnhancedBankingService } from '@/services/enhancedBankingService';

// Export types
export type * from '@/types/bankingApiTypes';

// ===== MAIN BANKING INTEGRATION CLASS =====

export interface BankingSystemConfig {
  apiBaseUrl?: string;
  enableMockData?: boolean;
  authToken?: string;
}

export class BankingSystemIntegration {
  private apiWrapper: BankingApiWrapper;
  private llmAgent: BankingLLMAgent;
  private enhancedService: EnhancedBankingService;

  constructor(config: BankingSystemConfig = {}) {
    // Initialize API wrapper
    this.apiWrapper = new BankingApiWrapper(
      config.apiBaseUrl || 'http://localhost:3000/api/v1'
    );

    // Initialize LLM agent
    this.llmAgent = new BankingLLMAgent(this.apiWrapper);

    // Initialize enhanced service
    this.enhancedService = new EnhancedBankingService({
      llmAgent: this.llmAgent,
      enableMockData: config.enableMockData ?? false,
      authToken: config.authToken
    });

    // Set auth token if provided
    if (config.authToken) {
      this.setAuthToken(config.authToken);
    }
  }

  /**
   * Set authentication token for all services
   */
  setAuthToken(token: string): void {
    this.apiWrapper.setAuthToken(token);
    this.llmAgent.setAuthToken(token);
    this.enhancedService.setAuthToken(token);
  }

  /**
   * Login user and set auth token
   */
  async loginUser(username: string, password: string): Promise<any> {
    try {
      const response = await this.apiWrapper.login({ username, password });
      if (response.success && response.token) {
        this.setAuthToken(response.token);
      }
      return response;
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute banking operation with natural language
   */
  async executeBankingOperation(
    intent: string,
    parameters?: Record<string, any>,
    conversationContext?: any
  ): Promise<any> {
    return this.enhancedService.executeBankingOperation(
      intent,
      conversationContext || { conversationId: 'default', userId: 'user', currentTurn: 1 },
      parameters
    );
  }

  /**
   * Execute tool directly by name
   */
  async executeTool(toolName: string, parameters: any): Promise<any> {
    return this.llmAgent.executeTool(toolName, parameters);
  }

  /**
   * Get all available tools for LLM function calling
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
   * Search available tools
   */
  searchTools(query: string) {
    return this.llmAgent.searchTools(query);
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string) {
    return this.llmAgent.getToolsByCategory(category as any);
  }

  /**
   * Validate tool parameters
   */
  validateParameters(toolName: string, parameters: any): string[] {
    return this.llmAgent.validateToolParameters(toolName, parameters);
  }

  /**
   * Enable/disable mock data
   */
  setMockDataEnabled(enabled: boolean): void {
    this.enhancedService.setMockDataEnabled(enabled);
  }

  /**
   * Get API health status
   */
  async getHealthStatus(): Promise<any> {
    return this.apiWrapper.healthCheck();
  }

  /**
   * Get available banking operations
   */
  getAvailableOperations(): string[] {
    return this.enhancedService.getAvailableOperations();
  }
}

// ===== FACTORY FUNCTIONS =====

/**
 * Create banking system with mock data (for development)
 */
export function createMockBankingSystem(authToken?: string): BankingSystemIntegration {
  return new BankingSystemIntegration({
    enableMockData: true,
    authToken
  });
}

/**
 * Create production banking system
 */
export function createProductionBankingSystem(
  apiBaseUrl: string = 'http://localhost:3000/api/v1',
  authToken?: string
): BankingSystemIntegration {
  return new BankingSystemIntegration({
    apiBaseUrl,
    enableMockData: false,
    authToken
  });
}

/**
 * Create banking system for LLM integration
 */
export function createLLMBankingSystem(config: BankingSystemConfig = {}): BankingSystemIntegration {
  return new BankingSystemIntegration(config);
}

// ===== DEFAULT INSTANCES =====

// Default instance for immediate use
export const defaultBankingSystem = new BankingSystemIntegration();

// Mock instance for testing
export const mockBankingSystem = createMockBankingSystem();

// ===== UTILITY FUNCTIONS =====

/**
 * Quick tool registration for OpenAI
 */
export function registerBankingToolsWithOpenAI(): any[] {
  const system = new BankingSystemIntegration();
  return system.getOpenAIFunctionDefinitions();
}

/**
 * Quick tool registration for Google AI
 */
export function registerBankingToolsWithGoogleAI(): any[] {
  const system = new BankingSystemIntegration();
  return system.getGoogleAIFunctionDefinitions();
}

/**
 * Quick banking operation execution
 */
export async function quickBankingOperation(
  intent: string,
  parameters?: Record<string, any>,
  authToken?: string,
  useMockData: boolean = false
): Promise<any> {
  const system = new BankingSystemIntegration({
    enableMockData: useMockData,
    authToken
  });

  return system.executeBankingOperation(intent, parameters);
}

// ===== COMMON BANKING OPERATIONS =====

export const CommonBankingOperations = {
  // Account operations
  CHECK_BALANCE: 'check_balance',
  GET_MINI_STATEMENT: 'mini_statement',
  GET_ACCOUNT_DETAILS: 'account_details',

  // Card operations
  BLOCK_CARD: 'block_card',
  UNBLOCK_CARD: 'unblock_card',
  REQUEST_NEW_CARD: 'request_new_card',
  GET_CARDS: 'get_cards',

  // Transaction operations
  SEND_MONEY: 'send_money',
  GET_TRANSACTION_HISTORY: 'transaction_history',
  CANCEL_TRANSACTION: 'cancel_transaction',

  // Loan operations
  APPLY_LOAN: 'apply_loan',
  GET_LOAN_STATUS: 'loan_status',

  // Support operations
  RAISE_COMPLAINT: 'raise_complaint',
  TRACK_COMPLAINT: 'track_complaint',
  GET_COMPLAINTS: 'get_complaints',

  // Information operations
  GET_OFFERS: 'offers',
  GET_BRANCHES: 'branches',

  // Authentication
  LOGIN: 'login',
  VERIFY_TOKEN: 'verify_token'
};

export default BankingSystemIntegration;
