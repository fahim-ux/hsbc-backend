/**
 * LLM Agent Tool Mapping System
 * Maps banking API functions to LLM tools with proper schemas
 */

import { BankingApiWrapper } from './bankingApiWrapper';
import type {
  LoginRequest,
  BlockCardRequest,
  UnblockCardRequest,
  RequestNewCardRequest,
  LoanApplicationRequest,
  SendMoneyRequest,
  CancelTransactionRequest,
  RaiseComplaintRequest
} from '@/types/bankingApiTypes';

export interface LLMToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  function: (params: any) => Promise<any>;
  category: 'authentication' | 'account' | 'card' | 'loan' | 'transaction' | 'support' | 'information' | 'utility';
  requiresAuth: boolean;
}

export class BankingLLMAgent {
  private apiWrapper: BankingApiWrapper;
  private tools: Map<string, LLMToolDefinition> = new Map();

  constructor(apiWrapper: BankingApiWrapper) {
    this.apiWrapper = apiWrapper;
    this.initializeTools();
  }

  /**
   * Initialize all banking tools for LLM
   */
  private initializeTools(): void {
    const toolDefinitions: LLMToolDefinition[] = [
      // ===== AUTHENTICATION TOOLS =====
      {
        name: 'login_user',
        description: 'Authenticate user with username and password to get access token',
        parameters: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'User username (3-50 characters)',
              minLength: 3,
              maxLength: 50
            },
            password: {
              type: 'string',
              description: 'User password (minimum 6 characters)',
              minLength: 6
            }
          },
          required: ['username', 'password']
        },
        function: async (params: LoginRequest) => this.apiWrapper.login(params),
        category: 'authentication',
        requiresAuth: false
      },

      {
        name: 'verify_token',
        description: 'Verify if the current authentication token is valid',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        function: async () => this.apiWrapper.verifyToken(),
        category: 'authentication',
        requiresAuth: true
      },

      // ===== ACCOUNT TOOLS =====
      {
        name: 'get_account_balance',
        description: 'Get the current account balance for the authenticated user',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        function: async () => this.apiWrapper.getAccountBalance(),
        category: 'account',
        requiresAuth: true
      },

      {
        name: 'get_mini_statement',
        description: 'Get the last 5 recent transactions (mini statement)',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        function: async () => this.apiWrapper.getMiniStatement(),
        category: 'account',
        requiresAuth: true
      },

      {
        name: 'get_account_details',
        description: 'Get complete account holder information including personal and account details',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        function: async () => this.apiWrapper.getAccountDetails(),
        category: 'account',
        requiresAuth: true
      },

      // ===== CARD TOOLS =====
      {
        name: 'block_card',
        description: 'Block a debit or credit card to prevent unauthorized use',
        parameters: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'The ID of the card to block'
            }
          },
          required: ['cardId']
        },
        function: async (params: BlockCardRequest) => this.apiWrapper.blockCard(params),
        category: 'card',
        requiresAuth: true
      },

      {
        name: 'unblock_card',
        description: 'Unblock a previously blocked card',
        parameters: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'The ID of the card to unblock'
            }
          },
          required: ['cardId']
        },
        function: async (params: UnblockCardRequest) => this.apiWrapper.unblockCard(params),
        category: 'card',
        requiresAuth: true
      },

      {
        name: 'request_new_card',
        description: 'Request a new debit or credit card',
        parameters: {
          type: 'object',
          properties: {
            cardType: {
              type: 'string',
              enum: ['debit', 'credit'],
              description: 'Type of card to request'
            }
          },
          required: ['cardType']
        },
        function: async (params: RequestNewCardRequest) => this.apiWrapper.requestNewCard(params),
        category: 'card',
        requiresAuth: true
      },

      {
        name: 'get_cards_list',
        description: 'Get all cards belonging to the user',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        function: async () => this.apiWrapper.getCardList(),
        category: 'card',
        requiresAuth: true
      },

      // ===== LOAN TOOLS =====
      {
        name: 'apply_for_loan',
        description: 'Submit a loan application for personal, home, car, or education loan',
        parameters: {
          type: 'object',
          properties: {
            loanType: {
              type: 'string',
              enum: ['personal', 'home', 'car', 'education'],
              description: 'Type of loan to apply for'
            },
            amount: {
              type: 'number',
              minimum: 1,
              description: 'Loan amount (must be positive)'
            },
            tenure: {
              type: 'number',
              minimum: 1,
              maximum: 360,
              description: 'Loan tenure in months (1-360)'
            }
          },
          required: ['loanType', 'amount', 'tenure']
        },
        function: async (params: LoanApplicationRequest) => this.apiWrapper.applyLoan(params),
        category: 'loan',
        requiresAuth: true
      },

      {
        name: 'get_loan_status',
        description: 'Get status of all loan applications for the user',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        function: async () => this.apiWrapper.getLoanStatus(),
        category: 'loan',
        requiresAuth: true
      },

      // ===== TRANSACTION TOOLS =====
      {
        name: 'send_money',
        description: 'Transfer money to another account',
        parameters: {
          type: 'object',
          properties: {
            toAccountNumber: {
              type: 'string',
              description: 'Recipient account number'
            },
            amount: {
              type: 'number',
              minimum: 0.01,
              description: 'Amount to transfer (must be positive)'
            },
            description: {
              type: 'string',
              maxLength: 255,
              description: 'Optional transfer description'
            }
          },
          required: ['toAccountNumber', 'amount']
        },
        function: async (params: SendMoneyRequest) => this.apiWrapper.sendMoney(params),
        category: 'transaction',
        requiresAuth: true
      },

      {
        name: 'get_transaction_history',
        description: 'Get transaction history with optional limit',
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              description: 'Number of transactions to retrieve (default: 10)'
            }
          },
          required: []
        },
        function: async (params: { limit?: number }) => this.apiWrapper.getTransactionHistory(params.limit),
        category: 'transaction',
        requiresAuth: true
      },

      {
        name: 'cancel_transaction',
        description: 'Cancel a pending transaction',
        parameters: {
          type: 'object',
          properties: {
            transactionId: {
              type: 'string',
              description: 'ID of the transaction to cancel'
            }
          },
          required: ['transactionId']
        },
        function: async (params: CancelTransactionRequest) => this.apiWrapper.cancelTransaction(params),
        category: 'transaction',
        requiresAuth: true
      },

      // ===== SUPPORT TOOLS =====
      {
        name: 'raise_complaint',
        description: 'File a support complaint about banking services',
        parameters: {
          type: 'object',
          properties: {
            subject: {
              type: 'string',
              minLength: 5,
              maxLength: 200,
              description: 'Complaint subject (5-200 characters)'
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 1000,
              description: 'Detailed complaint description (10-1000 characters)'
            },
            category: {
              type: 'string',
              enum: ['transaction', 'card', 'loan', 'account', 'general'],
              description: 'Complaint category'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Complaint priority (default: medium)'
            }
          },
          required: ['subject', 'description', 'category']
        },
        function: async (params: RaiseComplaintRequest) => this.apiWrapper.raiseComplaint(params),
        category: 'support',
        requiresAuth: true
      },

      {
        name: 'track_complaint',
        description: 'Track the status of a specific complaint',
        parameters: {
          type: 'object',
          properties: {
            complaintId: {
              type: 'string',
              description: 'ID of the complaint to track'
            }
          },
          required: ['complaintId']
        },
        function: async (params: { complaintId: string }) => this.apiWrapper.trackComplaint(params.complaintId),
        category: 'support',
        requiresAuth: true
      },

      {
        name: 'get_all_complaints',
        description: 'Get all complaints filed by the user',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        function: async () => this.apiWrapper.getComplaints(),
        category: 'support',
        requiresAuth: true
      },

      // ===== INFORMATION TOOLS =====
      {
        name: 'get_banking_offers',
        description: 'Get current banking offers and promotions',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        function: async () => this.apiWrapper.getOffers(),
        category: 'information',
        requiresAuth: true
      },

      {
        name: 'get_branch_locations',
        description: 'Get list of bank branches and ATM locations',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        function: async () => this.apiWrapper.getBranches(),
        category: 'information',
        requiresAuth: true
      },

      // ===== UTILITY TOOLS =====
      {
        name: 'check_api_health',
        description: 'Check if the banking API is healthy and operational',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        function: async () => this.apiWrapper.healthCheck(),
        category: 'utility',
        requiresAuth: false
      }
    ];

    // Register all tools
    toolDefinitions.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  /**
   * Get all available tools
   */
  getAllTools(): LLMToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: LLMToolDefinition['category']): LLMToolDefinition[] {
    return this.getAllTools().filter(tool => tool.category === category);
  }

  /**
   * Get tool by name
   */
  getTool(name: string): LLMToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Execute a tool by name with parameters
   */
  async executeTool(name: string, parameters: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }

    try {
      return await tool.function(parameters);
    } catch (error) {
      throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get OpenAI-compatible function definitions for LLM
   */
  getOpenAIFunctionDefinitions(): any[] {
    return this.getAllTools().map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }

  /**
   * Get Google AI-compatible function definitions for LLM
   */
  getGoogleAIFunctionDefinitions(): any[] {
    return this.getAllTools().map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }

  /**
   * Set authentication token for API calls
   */
  setAuthToken(token: string): void {
    this.apiWrapper.setAuthToken(token);
  }

  /**
   * Get tools that don't require authentication
   */
  getPublicTools(): LLMToolDefinition[] {
    return this.getAllTools().filter(tool => !tool.requiresAuth);
  }

  /**
   * Get tools that require authentication
   */
  getAuthenticatedTools(): LLMToolDefinition[] {
    return this.getAllTools().filter(tool => tool.requiresAuth);
  }

  /**
   * Search tools by description or name
   */
  searchTools(query: string): LLMToolDefinition[] {
    const searchTerm = query.toLowerCase();
    return this.getAllTools().filter(tool => 
      tool.name.toLowerCase().includes(searchTerm) || 
      tool.description.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Validate tool parameters
   */
  validateToolParameters(toolName: string, parameters: any): string[] {
    const tool = this.getTool(toolName);
    if (!tool) {
      return [`Tool '${toolName}' not found`];
    }

    const errors: string[] = [];
    const { required, properties } = tool.parameters;

    // Check required parameters
    required.forEach(param => {
      if (!(param in parameters)) {
        errors.push(`Required parameter '${param}' is missing`);
      }
    });

    // Validate parameter types and constraints
    Object.entries(properties).forEach(([param, schema]: [string, any]) => {
      if (param in parameters) {
        const value = parameters[param];
        
        // Type validation
        if (schema.type === 'string' && typeof value !== 'string') {
          errors.push(`Parameter '${param}' must be a string`);
        } else if (schema.type === 'number' && typeof value !== 'number') {
          errors.push(`Parameter '${param}' must be a number`);
        }

        // String constraints
        if (schema.type === 'string' && typeof value === 'string') {
          if (schema.minLength && value.length < schema.minLength) {
            errors.push(`Parameter '${param}' must be at least ${schema.minLength} characters`);
          }
          if (schema.maxLength && value.length > schema.maxLength) {
            errors.push(`Parameter '${param}' must be at most ${schema.maxLength} characters`);
          }
          if (schema.enum && !schema.enum.includes(value)) {
            errors.push(`Parameter '${param}' must be one of: ${schema.enum.join(', ')}`);
          }
        }

        // Number constraints
        if (schema.type === 'number' && typeof value === 'number') {
          if (schema.minimum !== undefined && value < schema.minimum) {
            errors.push(`Parameter '${param}' must be at least ${schema.minimum}`);
          }
          if (schema.maximum !== undefined && value > schema.maximum) {
            errors.push(`Parameter '${param}' must be at most ${schema.maximum}`);
          }
        }
      }
    });

    return errors;
  }
}

// Create default instance
export const bankingLLMAgent = new BankingLLMAgent(new BankingApiWrapper());

export default BankingLLMAgent;
