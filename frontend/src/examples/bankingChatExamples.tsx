/**
 * Example: Integrating Banking Tools with ChatInterface
 * Shows how to use the banking chat integration
 */

import React from 'react';
import { BankingChatIntegration } from '@/services/bankingChatIntegration';
import { BankingToolsIntegration, defaultBankingTools } from '@/services/bankingToolsIntegration';

// ===== EXAMPLE 1: Simple Banking Chat Integration =====

export async function createBankingChatDemo() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY not found in environment variables');
  }
  
  const bankingChat = new BankingChatIntegration(apiKey);
  
  // Enable mock data for demo
  bankingChat.setMockDataEnabled(true);

  // Test banking requests
  const testMessages = [
    "What's my account balance?",
    "Show me my recent transactions",
    "I want to send $500 to account ACC002",
    "Block my card please, card-123",
    "I want to apply for a personal loan of $10000",
    "I have a complaint about my last transaction"
  ];

  console.log('🏦 Banking Chat Demo:');
  
  for (const message of testMessages) {
    console.log(`\nUser: ${message}`);
    
    const response = await bankingChat.processChatMessage(message);
    console.log(`Assistant: ${response.message}`);
    
    if (response.functionsExecuted) {
      console.log(`Functions executed: ${response.functionsExecuted.join(', ')}`);
    }
  }
}

// ===== EXAMPLE 2: Integration with Existing ChatInterface =====

export class EnhancedChatInterface {
  private bankingChat: BankingChatIntegration;
  private authToken?: string;

  constructor(apiKey: string) {
    this.bankingChat = new BankingChatIntegration(apiKey);
  }

  /**
   * Set user authentication
   */
  setAuth(token: string): void {
    this.authToken = token;
    this.bankingChat.setAuthToken(token);
  }

  /**
   * Process user message with banking capabilities
   */
  async processMessage(userMessage: string, chatHistory: any[] = []): Promise<any> {
    try {
      // Convert chat history to required format
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      }));

      // Process with banking integration
      const response = await this.bankingChat.processChatMessage(
        userMessage,
        formattedHistory,
        this.authToken
      );

      return {
        success: true,
        message: response.message,
        data: response.data,
        functionsExecuted: response.functionsExecuted || [],
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Chat processing error:', error);
      return {
        success: false,
        message: "I'm sorry, I encountered an error. Please try again.",
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Quick banking operations
   */
  async quickBalance(): Promise<any> {
    return this.processMessage("What's my account balance?");
  }

  async quickStatement(): Promise<any> {
    return this.processMessage("Show me my recent transactions");
  }

  async quickTransfer(amount: number, toAccount: string): Promise<any> {
    return this.processMessage(`Send $${amount} to account ${toAccount}`);
  }
}

// ===== EXAMPLE 3: Direct Banking Function Usage =====

export async function directBankingDemo() {
  console.log('🔧 Direct Banking Functions Demo:');

  // Get available functions
  const functions = defaultBankingTools.getAvailableFunctions();
  console.log('Available functions:', functions);

  // Execute functions directly
  const results = {
    balance: await defaultBankingTools.executeBankingFunction({
      name: 'get_account_balance',
      args: {}
    }),
    
    statement: await defaultBankingTools.executeBankingFunction({
      name: 'get_mini_statement', 
      args: {}
    }),
    
    transfer: await defaultBankingTools.executeBankingFunction({
      name: 'send_money',
      args: {
        toAccountNumber: 'ACC002',
        amount: 1000,
        description: 'Test transfer'
      }
    })
  };

  console.log('Function results:', results);
}

// ===== EXAMPLE 4: React Hook Integration =====

export function useBankingChat(apiKey: string) {
  const [bankingChat] = React.useState(() => new BankingChatIntegration(apiKey));
  const [authToken, setAuthToken] = React.useState<string>();

  React.useEffect(() => {
    if (authToken) {
      bankingChat.setAuthToken(authToken);
    }
  }, [authToken, bankingChat]);

  const sendMessage = React.useCallback(async (message: string, history: any[] = []) => {
    return bankingChat.processChatMessage(message, history, authToken);
  }, [bankingChat, authToken]);

  const setAuth = React.useCallback((token: string) => {
    setAuthToken(token);
  }, []);

  const quickOperations = React.useMemo(() => ({
    checkBalance: () => sendMessage("What's my account balance?"),
    getStatement: () => sendMessage("Show me my recent transactions"),
    sendMoney: (amount: number, toAccount: string) => 
      sendMessage(`Send $${amount} to account ${toAccount}`),
    blockCard: (cardId: string) => 
      sendMessage(`Block my card ${cardId}`),
    applyLoan: (type: string, amount: number) => 
      sendMessage(`Apply for ${type} loan of $${amount}`)
  }), [sendMessage]);

  return {
    sendMessage,
    setAuth,
    quickOperations
  };
}

// ===== EXAMPLE 5: Testing Functions =====

export async function testBankingIntegration() {
  console.log('🧪 Testing Banking Integration:');

  const integration = new BankingToolsIntegration({
    enableMockData: true
  });

  // Test all functions
  const testCases = [
    { name: 'get_account_balance', args: {} },
    { name: 'get_mini_statement', args: {} },
    { name: 'send_money', args: { toAccountNumber: 'ACC002', amount: 500 } },
    { name: 'block_card', args: { cardId: 'card-123' } },
    { name: 'apply_loan', args: { loanType: 'personal', amount: 10000, tenure: 36 } },
    { name: 'raise_complaint', args: { subject: 'Test Issue', description: 'Test description', category: 'general' } }
  ];

  for (const testCase of testCases) {
    console.log(`\nTesting ${testCase.name}:`);
    try {
      const result = await integration.executeBankingFunction(testCase);
      console.log('✅ Success:', result.success);
      console.log('📝 Message:', result.message);
      if (result.data) {
        console.log('📊 Data:', JSON.stringify(result.data, null, 2));
      }
    } catch (error) {
      console.log('❌ Error:', error);
    }
  }
}

// ===== USAGE INSTRUCTIONS =====

export const USAGE_INSTRUCTIONS = `
# Banking Chat Integration Usage

## 1. Basic Setup
\`\`\`typescript
import { BankingChatIntegration } from '@/services/bankingChatIntegration';

const bankingChat = new BankingChatIntegration('your-api-key');
bankingChat.setMockDataEnabled(true); // For development
\`\`\`

## 2. Process Messages
\`\`\`typescript
const response = await bankingChat.processChatMessage(
  "What's my balance?",
  chatHistory,
  authToken
);
console.log(response.message);
\`\`\`

## 3. Available Banking Functions
- get_account_balance: Check account balance
- get_mini_statement: Get recent transactions  
- send_money: Transfer money
- block_card: Block a card
- apply_loan: Submit loan application
- raise_complaint: File complaint

## 4. Natural Language Examples
- "What's my account balance?"
- "Show my recent transactions"
- "Send $500 to account ACC002"
- "Block my card card-123"
- "Apply for personal loan of $10000"
- "I have a complaint about fees"

## 5. Integration with React
Use the provided useBankingChat hook for easy React integration.
`;

export default {
  createBankingChatDemo,
  EnhancedChatInterface,
  directBankingDemo,
  useBankingChat,
  testBankingIntegration,
  USAGE_INSTRUCTIONS
};
