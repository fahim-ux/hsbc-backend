/**
 * Banking Tools Integration for Conversation Orchestrator
 * Integrates banking tools with existing Google AI conversation system
 */

import { GoogleGenAI, Type } from '@google/genai';
import { BankingApiWrapper } from './bankingApiWrapper';
import { RAGService } from './ragService';

export interface BankingToolsConfig {
  apiKey?: string;
  baseUrl?: string;
  enableMockData?: boolean;
}

export interface BankingFunctionCall {
  name: string;
  args: Record<string, any>;
}

export interface BankingExecutionResult {
  functionName: string;
  success: boolean;
  data?: any;
  error?: string;
  message: string;
}

export class BankingToolsIntegration {
  private apiWrapper: BankingApiWrapper;
  private ragService: RAGService;
  private enableMockData: boolean;

  constructor(config: BankingToolsConfig = {}) {
    this.apiWrapper = new BankingApiWrapper(config.baseUrl);
    this.ragService = new RAGService(config.baseUrl);
    this.enableMockData = config.enableMockData ?? false; // Default to false for production
  }

  /**
   * Get banking function declarations for Google AI
   * This returns the exact format needed for function calling
   */
  getBankingFunctionDeclarations() {
    return [
      {
        name: 'get_account_balance',
        description: 'Get the current account balance for the authenticated user',
        parameters: {
          type: Type.OBJECT,
          properties: {},
          required: []
        }
      },
      {
        name: 'get_mini_statement',
        description: 'Get recent 5 transactions (mini statement)',
        parameters: {
          type: Type.OBJECT,
          properties: {},
          required: []
        }
      },
      {
        name: 'send_money',
        description: 'Transfer money to another account',
        parameters: {
          type: Type.OBJECT,
          properties: {
            toAccountNumber: { type: Type.STRING, description: 'Recipient account number' },
            amount: { type: Type.NUMBER, description: 'Amount to transfer' },
            description: { type: Type.STRING, description: 'Transfer description' }
          },
          required: ['toAccountNumber', 'amount']
        }
      },
      {
        name: 'block_card',
        description: 'Block a debit or credit card for security',
        parameters: {
          type: Type.OBJECT,
          properties: {
            cardId: { type: Type.STRING, description: 'ID of the card to block' }
          },
          required: ['cardId']
        }
      },
      {
        name: 'apply_loan',
        description: 'Submit a loan application',
        parameters: {
          type: Type.OBJECT,
          properties: {
            loanType: { type: Type.STRING, description: 'Type of loan (personal, home, car, education)' },
            amount: { type: Type.NUMBER, description: 'Loan amount' },
            tenure: { type: Type.NUMBER, description: 'Loan tenure in months' }
          },
          required: ['loanType', 'amount', 'tenure']
        }
      },
      {
        name: 'raise_complaint',
        description: 'File a support complaint',
        parameters: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: 'Complaint subject' },
            description: { type: Type.STRING, description: 'Complaint description' },
            category: { type: Type.STRING, description: 'Complaint category' }
          },
          required: ['subject', 'description', 'category']
        }
      },
      {
        name: 'search_banking_context',
        description: 'Search HSBC banking information, loan details, rules, regulations, and policies',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { 
              type: Type.STRING, 
              description: 'Search query for banking information (e.g., "loan types", "interest rates", "eligibility criteria")' 
            },
            top_k: { 
              type: Type.NUMBER, 
              description: 'Number of results to return (default: 5, max: 20)' 
            },
            threshold: { 
              type: Type.NUMBER, 
              description: 'Minimum similarity score (default: 0.5, range: 0-1)' 
            }
          },
          required: ['query']
        }
      }
    ];
  }

  /**
   * Execute a banking function call
   * This function will be called by your conversation orchestrator
   */
  async executeBankingFunction(
    functionCall: BankingFunctionCall,
    authToken?: string
  ): Promise<BankingExecutionResult> {
    const { name, args } = functionCall;

    console.log(`🏦 Executing banking function: ${name}`);
    console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));

    try {
      // Set auth token if provided
      if (authToken) {
        this.apiWrapper.setAuthToken(authToken);
        this.ragService.setAuthToken(authToken);
      }

      // Always try real API first, fallback to mock if needed
      let result: any;
      
      try {
        result = await this.executeRealFunction(name, args);
        console.log(`✅ Real API call successful for ${name}`);
      } catch (apiError) {
        console.warn(`⚠️ Real API call failed for ${name}, trying mock data:`, apiError);
        
        if (this.enableMockData) {
          result = this.getMockResponse(name, args);
          console.log(`🎭 Using mock data for ${name}`);
        } else {
          throw apiError; // Re-throw if mock data is disabled
        }
      }

      return {
        functionName: name,
        success: true,
        data: result,
        message: this.getSuccessMessage(name, args, result)
      };

    } catch (error) {
      console.error(`❌ Banking function ${name} failed:`, error);
      
      return {
        functionName: name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to execute ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Execute real API function
   */
  private async executeRealFunction(functionName: string, args: any): Promise<any> {
    switch (functionName) {
      case 'get_account_balance':
        return await this.apiWrapper.getAccountBalance();

      case 'get_mini_statement':
        return await this.apiWrapper.getMiniStatement();

      case 'send_money':
        return await this.apiWrapper.sendMoney({
          toAccountNumber: args.toAccountNumber,
          amount: args.amount,
          description: args.description
        });

      case 'block_card':
        return await this.apiWrapper.blockCard({
          cardId: args.cardId
        });

      case 'apply_loan':
        return await this.apiWrapper.applyLoan({
          loanType: args.loanType,
          amount: args.amount,
          tenure: args.tenure
        });

      case 'raise_complaint':
        return await this.apiWrapper.raiseComplaint({
          subject: args.subject,
          description: args.description,
          category: args.category
        });

      case 'search_banking_context':
        return await this.ragService.searchBankingContext({
          query: args.query,
          top_k: args.top_k || 5,
          threshold: args.threshold || 0.5
        });

      default:
        throw new Error(`Unknown banking function: ${functionName}`);
    }
  }

  /**
   * Generate mock responses for development
   */
  private getMockResponse(functionName: string, args: any): any {
    const mockResponses: Record<string, any> = {
      get_account_balance: {
        success: true,
        data: {
          balance: 15750.50,
          accountNumber: '****1234'
        },
        message: 'Account balance retrieved successfully'
      },
      get_mini_statement: {
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
      send_money: {
        success: true,
        data: {
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
        },
        message: 'Money transfer completed successfully'
      },
      block_card: {
        success: true,
        message: 'Card blocked successfully'
      },
      apply_loan: {
        success: true,
        data: {
          loanId: 'loan_' + Math.random().toString(36).substr(2, 9)
        },
        message: 'Loan application submitted successfully'
      },
      raise_complaint: {
        success: true,
        data: {
          complaintId: 'complaint_' + Math.random().toString(36).substr(2, 9)
        },
        message: 'Complaint raised successfully'
      },
      search_banking_context: {
        success: true,
        message: "Found relevant banking information",
        data: {
          query: args.query,
          results: [
            {
              id: "mock_doc_1",
              text: "HSBC offers various loan types including Personal Loans (up to $100,000, tenure 12-84 months, interest rates from 6.99%), Home Loans (up to $2M, tenure up to 30 years, rates from 3.5%), Car Loans (up to $200,000, tenure 12-84 months, rates from 4.99%), and Education Loans (up to $500,000, tenure up to 15 years, rates from 5.5%).",
              similarity: 0.92,
              metadata: { product: "loans", type: "info", chunk_index: 1 }
            },
            {
              id: "mock_doc_2", 
              text: "Eligibility criteria include minimum age of 21 years, stable employment for at least 6 months, minimum monthly income requirements, and good credit score. Documents required include ID proof, address proof, income statements, and bank statements.",
              similarity: 0.85,
              metadata: { product: "loans", type: "eligibility", chunk_index: 2 }
            }
          ],
          total_results: 2,
          search_time_ms: 45
        }
      }
    };

    return mockResponses[functionName] || {
      success: true,
      message: `Mock response for ${functionName}`
    };
  }

  /**
   * Generate success messages
   */
  private getSuccessMessage(functionName: string, args: any, result: any): string {
    switch (functionName) {
      case 'get_account_balance':
        return `Your current account balance is $${result.data?.balance || 'N/A'}`;
      
      case 'get_mini_statement':
        const txnCount = result.data?.transactions?.length || 0;
        return `Retrieved your last ${txnCount} transactions`;
      
      case 'send_money':
        return `Successfully transferred $${args.amount} to account ${args.toAccountNumber}`;
      
      case 'block_card':
        return `Card ${args.cardId} has been blocked for security`;
      
      case 'apply_loan':
        return `Your ${args.loanType} loan application for $${args.amount} has been submitted`;
      
      case 'raise_complaint':
        return `Your complaint "${args.subject}" has been filed in ${args.category} category`;
      
      case 'search_banking_context':
        const resultCount = result.data?.total_results || 0;
        return `Found ${resultCount} relevant documents about: ${args.query}`;
      
      default:
        return `${functionName} completed successfully`;
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.apiWrapper.setAuthToken(token);
    this.ragService.setAuthToken(token);
  }

  /**
   * Enable/disable mock data
   */
  setMockDataEnabled(enabled: boolean): void {
    this.enableMockData = enabled;
  }

  /**
   * Get available banking functions
   */
  getAvailableFunctions(): string[] {
    return [
      'get_account_balance',
      'get_mini_statement', 
      'send_money',
      'block_card',
      'apply_loan',
      'raise_complaint'
    ];
  }

  /**
   * Check if a function is a banking function
   */
  isBankingFunction(functionName: string): boolean {
    return this.getAvailableFunctions().includes(functionName);
  }
}

// Create and export banking function map for easy integration
export const bankingFunctionMap = {
  get_account_balance: async (args: any, authToken?: string) => {
    const integration = new BankingToolsIntegration();
    return integration.executeBankingFunction({ name: 'get_account_balance', args }, authToken);
  },
  get_mini_statement: async (args: any, authToken?: string) => {
    const integration = new BankingToolsIntegration();
    return integration.executeBankingFunction({ name: 'get_mini_statement', args }, authToken);
  },
  send_money: async (args: any, authToken?: string) => {
    const integration = new BankingToolsIntegration();
    return integration.executeBankingFunction({ name: 'send_money', args }, authToken);
  },
  block_card: async (args: any, authToken?: string) => {
    const integration = new BankingToolsIntegration();
    return integration.executeBankingFunction({ name: 'block_card', args }, authToken);
  },
  apply_loan: async (args: any, authToken?: string) => {
    const integration = new BankingToolsIntegration();
    return integration.executeBankingFunction({ name: 'apply_loan', args }, authToken);
  },
  raise_complaint: async (args: any, authToken?: string) => {
    const integration = new BankingToolsIntegration();
    return integration.executeBankingFunction({ name: 'raise_complaint', args }, authToken);
  }
};

// Default instance
export const defaultBankingTools = new BankingToolsIntegration({
  enableMockData: true // Default to mock data for development
});

export default BankingToolsIntegration;
