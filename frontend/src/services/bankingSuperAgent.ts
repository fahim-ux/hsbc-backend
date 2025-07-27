/**
 * Banking SuperAgent
 * Google AI Chat-based banking assistant with function calling
 */

import { GoogleGenAI, Type } from '@google/genai';
import { BankingApiWrapper } from './bankingApiWrapper';
import type {
  LoginRequest,
  AccountBalanceResponse,
  MiniStatementResponse,
  SendMoneyRequest,
  LoanApplicationRequest,
  BlockCardRequest,
  RaiseComplaintRequest
} from '@/types/bankingApiTypes';

export interface BankingContext {
  userId: string;
  authToken?: string;
  conversationId: string;
  userProfile?: {
    name: string;
    accountNumber: string;
    email: string;
  };
}

export interface BankingTask {
  id: string;
  type: string;
  description: string;
  parameters: Record<string, any>;
  status: 'pending' | 'completed' | 'failed';
}

export interface BankingAgentResponse {
  success: boolean;
  message: string;
  data?: any;
  tasks: BankingTask[];
  nextSteps?: string[];
  requiresAuth?: boolean;
}

export class BankingSuperAgent {
  private genai: GoogleGenAI;
  private apiWrapper: BankingApiWrapper;
  private functionMap: Record<string, (task: BankingTask, context: BankingContext) => Promise<any>> = {};

  constructor(apiKey?: string) {
    const key = apiKey || 'AIzaSyAabtfY2bpIhgpZJUMaTCI6mZrI-rzl6e0';
    
    if (!key) {
      throw new Error('Google AI API key not provided');
    }

    this.genai = new GoogleGenAI({
      apiKey: key
    });

    this.apiWrapper = new BankingApiWrapper();
    this.initializeFunctionMap();
  }

  /**
   * Initialize banking function mapping
   */
  private initializeFunctionMap(): void {
    this.functionMap = {
      // Authentication functions
      loginUser: async (task: BankingTask, context: BankingContext) => {
        const { username, password } = task.parameters;
        const response = await this.apiWrapper.login({ username, password });
        if (response.success && response.token) {
          this.apiWrapper.setAuthToken(response.token);
          context.authToken = response.token;
          context.userProfile = {
            name: response.user.fullName,
            accountNumber: 'ACC001', // Would come from API
            email: response.user.email
          };
        }
        return response;
      },

      // Account functions
      getAccountBalance: async (task: BankingTask, context: BankingContext) => {
        return await this.apiWrapper.getAccountBalance();
      },

      getMiniStatement: async (task: BankingTask, context: BankingContext) => {
        return await this.apiWrapper.getMiniStatement();
      },

      getAccountDetails: async (task: BankingTask, context: BankingContext) => {
        return await this.apiWrapper.getAccountDetails();
      },

      // Card functions
      blockCard: async (task: BankingTask, context: BankingContext) => {
        const { cardId } = task.parameters;
        return await this.apiWrapper.blockCard({ cardId });
      },

      unblockCard: async (task: BankingTask, context: BankingContext) => {
        const { cardId } = task.parameters;
        return await this.apiWrapper.unblockCard({ cardId });
      },

      requestNewCard: async (task: BankingTask, context: BankingContext) => {
        const { cardType } = task.parameters;
        return await this.apiWrapper.requestNewCard({ cardType });
      },

      getCardsList: async (task: BankingTask, context: BankingContext) => {
        return await this.apiWrapper.getCardList();
      },

      // Transaction functions
      sendMoney: async (task: BankingTask, context: BankingContext) => {
        const { toAccountNumber, amount, description } = task.parameters;
        return await this.apiWrapper.sendMoney({ toAccountNumber, amount, description });
      },

      getTransactionHistory: async (task: BankingTask, context: BankingContext) => {
        const { limit } = task.parameters;
        return await this.apiWrapper.getTransactionHistory(limit);
      },

      cancelTransaction: async (task: BankingTask, context: BankingContext) => {
        const { transactionId } = task.parameters;
        return await this.apiWrapper.cancelTransaction({ transactionId });
      },

      // Loan functions
      applyLoan: async (task: BankingTask, context: BankingContext) => {
        const { loanType, amount, tenure } = task.parameters;
        return await this.apiWrapper.applyLoan({ loanType, amount, tenure });
      },

      getLoanStatus: async (task: BankingTask, context: BankingContext) => {
        return await this.apiWrapper.getLoanStatus();
      },

      // Support functions
      raiseComplaint: async (task: BankingTask, context: BankingContext) => {
        const { subject, description, category, priority } = task.parameters;
        return await this.apiWrapper.raiseComplaint({ subject, description, category, priority });
      },

      trackComplaint: async (task: BankingTask, context: BankingContext) => {
        const { complaintId } = task.parameters;
        return await this.apiWrapper.trackComplaint(complaintId);
      },

      // Information functions
      getBankingOffers: async (task: BankingTask, context: BankingContext) => {
        return await this.apiWrapper.getOffers();
      },

      getBranchLocations: async (task: BankingTask, context: BankingContext) => {
        return await this.apiWrapper.getBranches();
      }
    };
  }

  /**
   * Get Google AI function declarations for banking tools
   */
  private getBankingFunctionDeclarations() {
    return [
      // Authentication tools
      {
        name: 'loginUser',
        description: 'Authenticate user with username and password to access banking services',
        parameters: {
          type: Type.OBJECT,
          properties: {
            username: { type: Type.STRING, description: 'User username' },
            password: { type: Type.STRING, description: 'User password' }
          },
          required: ['username', 'password']
        }
      },

      // Account management tools
      {
        name: 'getAccountBalance',
        description: 'Get current account balance for the authenticated user',
        parameters: {
          type: Type.OBJECT,
          properties: {},
          required: []
        }
      },

      {
        name: 'getMiniStatement',
        description: 'Get recent 5 transactions (mini statement)',
        parameters: {
          type: Type.OBJECT,
          properties: {},
          required: []
        }
      },

      {
        name: 'sendMoney',
        description: 'Transfer money to another account',
        parameters: {
          type: Type.OBJECT,
          properties: {
            toAccountNumber: { type: Type.STRING, description: 'Recipient account number' },
            amount: { type: Type.NUMBER, description: 'Amount to transfer (must be positive)' },
            description: { type: Type.STRING, description: 'Optional transfer description' }
          },
          required: ['toAccountNumber', 'amount']
        }
      },

      {
        name: 'blockCard',
        description: 'Block a debit or credit card to prevent unauthorized use',
        parameters: {
          type: Type.OBJECT,
          properties: {
            cardId: { type: Type.STRING, description: 'ID of the card to block' }
          },
          required: ['cardId']
        }
      },

      {
        name: 'applyLoan',
        description: 'Submit a loan application for personal, home, car, or education loan',
        parameters: {
          type: Type.OBJECT,
          properties: {
            loanType: { type: Type.STRING, description: 'Type of loan (personal, home, car, education)' },
            amount: { type: Type.NUMBER, description: 'Loan amount (must be positive)' },
            tenure: { type: Type.NUMBER, description: 'Loan tenure in months (1-360)' }
          },
          required: ['loanType', 'amount', 'tenure']
        }
      },

      {
        name: 'raiseComplaint',
        description: 'File a support complaint about banking services',
        parameters: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: 'Complaint subject (5-200 characters)' },
            description: { type: Type.STRING, description: 'Detailed complaint description' },
            category: { type: Type.STRING, description: 'Complaint category (transaction, card, loan, account, general)' }
          },
          required: ['subject', 'description', 'category']
        }
      }
    ];
  }

  /**
   * Main banking assistant function
   */
  async processBankingRequest(
    userMessage: string,
    context: BankingContext,
    enableMockData: boolean = false
  ): Promise<BankingAgentResponse> {
    console.log(`🏦 Banking SuperAgent: Processing request for user ${context.userId}`);

    const tasks: BankingTask[] = [];
    let authRequired = false;

    try {
      // Set auth token if available
      if (context.authToken) {
        this.apiWrapper.setAuthToken(context.authToken);
      }

      // Create function declarations
      const functionDeclarations = this.getBankingFunctionDeclarations();

      const config = {
        tools: [{
          functionDeclarations: functionDeclarations
        }],
        temperature: 0.7
      };

      // Enhanced prompt for banking assistance
      const systemPrompt = `You are an expert HSBC banking assistant. Help users with their banking needs using the available tools.

User Context:
- User ID: ${context.userId}
- Authenticated: ${!!context.authToken}
- User Profile: ${context.userProfile ? JSON.stringify(context.userProfile) : 'Not available'}

User Request: "${userMessage}"

Your responsibilities:
1. Understand the user's banking needs
2. Use appropriate banking tools to fulfill requests
3. Handle authentication when needed
4. Provide clear, helpful responses
5. Ensure security and privacy

If the user is not authenticated and wants to perform authenticated operations, guide them to login first.
Execute the necessary tool calls and provide comprehensive responses.

Always prioritize user security and privacy in banking operations.`;

      // Create chat session
      let chat = this.genai.chats.create({
        model: "gemini-2.5-flash",
        config: config
      });

      let response;
      let counter = 0;
      const maxIterations = 10; // Prevent infinite loops

      while (counter < maxIterations) {
        response = await chat.sendMessage({
          message: counter === 0 ? systemPrompt : `Continue processing. Tool responses: ${JSON.stringify(tasks.filter(t => t.status === 'completed').map(t => ({ name: t.type, result: 'completed' })))}`
        });

        console.log('Counter:', counter++);
        console.log('Banking Agent response:', JSON.stringify(response, null, 2));

        if (response.functionCalls && response.functionCalls.length > 0) {
          console.log(`🔧 LLM wants to call ${response.functionCalls.length} banking function(s)`);

          const toolResponses = [];

          for (const functionCall of response.functionCalls) {
            const { name, args } = functionCall;
            console.log(`📞 Calling banking function: ${name}`);
            console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));

            try {
              // Create task
              const task: BankingTask = {
                id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                type: name,
                description: `Execute ${name}`,
                parameters: args || {},
                status: 'pending'
              };

              tasks.push(task);

              // Handle mock data
              if (enableMockData) {
                const mockResult = this.getMockResponse(name, args);
                task.status = 'completed';
                toolResponses.push({
                  name: name,
                  response: mockResult
                });
                console.log(`✅ Mock function ${name} completed`);
              } else {
                // Execute real function
                const func = this.functionMap[name];
                if (func) {
                  const result = await func(task, context);
                  task.status = 'completed';
                  toolResponses.push({
                    name: name,
                    response: result
                  });
                  console.log(`✅ Banking function ${name} completed:`, result.success !== false ? 'Success' : `Failed: ${result.error}`);
                } else {
                  task.status = 'failed';
                  const errorResponse = { success: false, error: `Function ${name} not implemented` };
                  toolResponses.push({
                    name: name,
                    response: errorResponse
                  });
                  console.error(`❌ Banking function ${name} not found`);
                }
              }
            } catch (error) {
              console.error(`❌ Banking function ${name} error:`, error);
              const errorTask = tasks.find(t => t.type === name);
              if (errorTask) {
                errorTask.status = 'failed';
              }
              toolResponses.push({
                name: name,
                response: { 
                  success: false, 
                  error: error instanceof Error ? error.message : 'Unknown error' 
                }
              });
            }
          }

          console.log("📨 Sending banking tool results back to the model...");
          response = await chat.sendMessage({
            message: `Tool execution results: ${JSON.stringify(toolResponses, null, 2)}`
          });
        } else {
          // No more function calls, break the loop
          break;
        }
      }

      // Final response
      const text = response.text || 'Banking request processed!';
      const successfulTasks = tasks.filter(t => t.status === 'completed').length;
      const totalTasks = tasks.length;

      return {
        success: true,
        message: text,
        tasks: tasks,
        nextSteps: this.generateNextSteps(tasks, context),
        requiresAuth: authRequired
      };

    } catch (error) {
      console.error('Banking SuperAgent error:', error);
      
      return {
        success: false,
        message: `I encountered an error while processing your banking request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tasks: tasks,
        nextSteps: ['Please try again or contact support'],
        requiresAuth: authRequired
      };
    }
  }

  /**
   * Generate mock responses for development
   */
  private getMockResponse(functionName: string, args: any): any {
    const mockResponses: Record<string, any> = {
      loginUser: {
        success: true,
        token: 'mock_jwt_token_' + Math.random().toString(36).substr(2, 20),
        user: {
          id: 'user-1',
          username: args.username,
          fullName: 'John Doe',
          email: 'john@example.com'
        },
        message: 'Login successful'
      },
      getAccountBalance: {
        success: true,
        data: {
          balance: 15750.50,
          accountNumber: '****1234'
        },
        message: 'Account balance retrieved successfully'
      },
      getMiniStatement: {
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
            }
          ]
        },
        message: 'Mini statement retrieved successfully'
      },
      sendMoney: {
        success: true,
        data: {
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
        },
        message: `Successfully transferred $${args.amount} to ${args.toAccountNumber}`
      },
      blockCard: {
        success: true,
        message: `Card ${args.cardId} blocked successfully`
      },
      applyLoan: {
        success: true,
        data: {
          loanId: 'loan_' + Math.random().toString(36).substr(2, 9)
        },
        message: `${args.loanType} loan application submitted for $${args.amount}`
      }
    };

    return mockResponses[functionName] || { 
      success: true, 
      message: `Mock response for ${functionName}` 
    };
  }

  /**
   * Generate contextual next steps
   */
  private generateNextSteps(tasks: BankingTask[], context: BankingContext): string[] {
    const steps: string[] = [];
    
    if (!context.authToken) {
      steps.push('Consider logging in for full banking access');
    }

    if (tasks.some(t => t.type === 'sendMoney' && t.status === 'completed')) {
      steps.push('Check your transaction in mini statement');
    }

    if (tasks.some(t => t.type === 'applyLoan' && t.status === 'completed')) {
      steps.push('Monitor your loan application status');
    }

    if (tasks.some(t => t.type === 'blockCard' && t.status === 'completed')) {
      steps.push('Consider requesting a replacement card');
    }

    if (steps.length === 0) {
      steps.push('Is there anything else I can help you with?');
    }

    return steps;
  }

  /**
   * Set authentication context
   */
  setAuthContext(context: BankingContext): void {
    if (context.authToken) {
      this.apiWrapper.setAuthToken(context.authToken);
    }
  }
}

export default BankingSuperAgent;
