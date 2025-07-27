/**
 * Banking SuperAgent - Simplified Working Version
 * Google AI Chat-based banking assistant with function calling
 */

import { GoogleGenAI, Type } from '@google/genai';
import { BankingApiWrapper } from './bankingApiWrapper';

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
  result?: any;
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

  constructor(apiKey?: string) {
    const key = apiKey || 'AIzaSyAabtfY2bpIhgpZJUMaTCI6mZrI-rzl6e0';
    
    if (!key) {
      throw new Error('Google AI API key not provided');
    }

    this.genai = new GoogleGenAI({
      apiKey: key
    });

    this.apiWrapper = new BankingApiWrapper();
  }

  /**
   * Get banking function declarations for Google AI
   */
  private getBankingFunctionDeclarations() {
    return [
      {
        name: 'loginUser',
        description: 'Authenticate user with username and password',
        parameters: {
          type: Type.OBJECT,
          properties: {
            username: { type: Type.STRING, description: 'User username' },
            password: { type: Type.STRING, description: 'User password' }
          },
          required: ['username', 'password']
        }
      },
      {
        name: 'getAccountBalance',
        description: 'Get current account balance',
        parameters: {
          type: Type.OBJECT,
          properties: {},
          required: []
        }
      },
      {
        name: 'getMiniStatement',
        description: 'Get recent 5 transactions',
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
            amount: { type: Type.NUMBER, description: 'Amount to transfer' },
            description: { type: Type.STRING, description: 'Transfer description' }
          },
          required: ['toAccountNumber', 'amount']
        }
      },
      {
        name: 'blockCard',
        description: 'Block a debit or credit card',
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
        name: 'raiseComplaint',
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
      }
    ];
  }

  /**
   * Execute banking function
   */
  private async executeBankingFunction(
    functionName: string, 
    args: any, 
    context: BankingContext,
    enableMockData: boolean = false
  ): Promise<any> {
    if (enableMockData) {
      return this.getMockResponse(functionName, args);
    }

    // Set auth token if available
    if (context.authToken) {
      this.apiWrapper.setAuthToken(context.authToken);
    }

    try {
      switch (functionName) {
        case 'loginUser':
          const loginResponse = await this.apiWrapper.login(args);
          if (loginResponse.success && loginResponse.token) {
            this.apiWrapper.setAuthToken(loginResponse.token);
            context.authToken = loginResponse.token;
          }
          return loginResponse;

        case 'getAccountBalance':
          return await this.apiWrapper.getAccountBalance();

        case 'getMiniStatement':
          return await this.apiWrapper.getMiniStatement();

        case 'sendMoney':
          return await this.apiWrapper.sendMoney(args);

        case 'blockCard':
          return await this.apiWrapper.blockCard(args);

        case 'applyLoan':
          return await this.apiWrapper.applyLoan(args);

        case 'raiseComplaint':
          return await this.apiWrapper.raiseComplaint(args);

        default:
          throw new Error(`Function ${functionName} not implemented`);
      }
    } catch (error) {
      throw new Error(`Banking function failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Main banking assistant function
   */
  async processBankingRequest(
    userMessage: string,
    context: BankingContext,
    enableMockData: boolean = true
  ): Promise<BankingAgentResponse> {
    console.log(`🏦 Banking SuperAgent: Processing request for user ${context.userId}`);

    const tasks: BankingTask[] = [];

    try {
      // Create function declarations
      const functionDeclarations = this.getBankingFunctionDeclarations();

      const config = {
        tools: [{
          functionDeclarations: functionDeclarations
        }],
        temperature: 0.7
      };

      // Enhanced system prompt
      const systemPrompt = `You are an expert HSBC banking assistant. Help users with their banking needs using the available tools.

User Context:
- User ID: ${context.userId}
- Authenticated: ${!!context.authToken}
- User Profile: ${context.userProfile ? JSON.stringify(context.userProfile) : 'Not available'}

User Request: "${userMessage}"

Available banking functions:
- loginUser: Authenticate user
- getAccountBalance: Check account balance
- getMiniStatement: Get recent transactions
- sendMoney: Transfer money to another account
- blockCard: Block a card for security
- applyLoan: Submit loan application
- raiseComplaint: File support complaint

Use appropriate functions to help the user. If authentication is needed, guide them to login first.`;

      // Create chat session
      const chat = this.genai.chats.create({
        model: "gemini-2.5-flash",
        config: config
      });

      let response;
      let counter = 0;
      const maxIterations = 5;

      while (counter < maxIterations) {
        console.log(`🔄 Iteration ${counter + 1}`);
        
        response = await chat.sendMessage({
          message: counter === 0 ? systemPrompt : `Continue processing the banking request.`
        });

        console.log('Banking Agent response:', JSON.stringify(response, null, 2));

        if (response.functionCalls && response.functionCalls.length > 0) {
          console.log(`🔧 LLM wants to call ${response.functionCalls.length} banking function(s)`);

          const toolResponses = [];

          for (const functionCall of response.functionCalls) {
            const { name, args } = functionCall;
            
            if (!name) {
              console.error('Function call without name');
              continue;
            }

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

              // Execute function
              const result = await this.executeBankingFunction(name, args, context, enableMockData);
              
              task.status = 'completed';
              task.result = result;
              
              toolResponses.push({
                name: name,
                response: result
              });

              console.log(`✅ Banking function ${name} completed successfully`);

            } catch (error) {
              console.error(`❌ Banking function ${name} error:`, error);
              
              const errorTask = tasks.find(t => t.type === name);
              if (errorTask) {
                errorTask.status = 'failed';
                errorTask.result = { error: error instanceof Error ? error.message : 'Unknown error' };
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
            message: `Banking function results: ${JSON.stringify(toolResponses, null, 2)}`
          });

          counter++;
        } else {
          // No more function calls, break the loop
          console.log('✅ No more function calls needed');
          break;
        }
      }

      // Final response
      const finalText = response?.text || 'Banking request processed successfully!';
      const successfulTasks = tasks.filter(t => t.status === 'completed').length;

      return {
        success: true,
        message: finalText,
        tasks: tasks,
        nextSteps: this.generateNextSteps(tasks, context)
      };

    } catch (error) {
      console.error('Banking SuperAgent error:', error);
      
      return {
        success: false,
        message: `I encountered an error while processing your banking request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tasks: tasks,
        nextSteps: ['Please try again or contact support']
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
      sendMoney: {
        success: true,
        data: {
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
        },
        message: `Successfully transferred $${args.amount} to account ${args.toAccountNumber}`
      },
      blockCard: {
        success: true,
        message: `Card ${args.cardId} has been blocked successfully for security`
      },
      applyLoan: {
        success: true,
        data: {
          loanId: 'loan_' + Math.random().toString(36).substr(2, 9)
        },
        message: `${args.loanType} loan application submitted successfully for $${args.amount} over ${args.tenure} months`
      },
      raiseComplaint: {
        success: true,
        data: {
          complaintId: 'complaint_' + Math.random().toString(36).substr(2, 9)
        },
        message: `Complaint "${args.subject}" has been filed successfully in ${args.category} category`
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
      steps.push('🔐 Login to access more banking services');
    }

    if (tasks.some(t => t.type === 'sendMoney' && t.status === 'completed')) {
      steps.push('📊 Check your mini statement to confirm the transfer');
    }

    if (tasks.some(t => t.type === 'applyLoan' && t.status === 'completed')) {
      steps.push('📋 Monitor your loan application status');
    }

    if (tasks.some(t => t.type === 'blockCard' && t.status === 'completed')) {
      steps.push('💳 Consider requesting a replacement card');
    }

    if (tasks.some(t => t.type === 'raiseComplaint' && t.status === 'completed')) {
      steps.push('📞 Track your complaint status for updates');
    }

    if (steps.length === 0) {
      steps.push('💬 Is there anything else I can help you with today?');
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
