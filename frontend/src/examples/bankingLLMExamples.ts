/**
 * Banking LLM Agent Usage Examples
 * Demonstrates how to integrate the banking system with LLM
 */

import { BankingLLMAgent } from '@/services/bankingLLMAgent';
import { BankingApiWrapper } from '@/services/bankingApiWrapper';
import { EnhancedBankingService } from '@/services/enhancedBankingService';

// ===== EXAMPLE 1: Basic LLM Agent Setup =====

export async function setupBankingAgent() {
  // Initialize API wrapper
  const apiWrapper = new BankingApiWrapper('http://localhost:3000/api/v1');
  
  // Initialize LLM agent
  const llmAgent = new BankingLLMAgent(apiWrapper);
  
  // Set authentication token (after user login)
  llmAgent.setAuthToken('your_jwt_token_here');
  
  return llmAgent;
}

// ===== EXAMPLE 2: Register Tools with OpenAI =====

export function getOpenAITools() {
  const llmAgent = new BankingLLMAgent(new BankingApiWrapper());
  
  // Get function definitions for OpenAI
  const functions = llmAgent.getOpenAIFunctionDefinitions();
  
  console.log('Available banking tools for OpenAI:', functions.length);
  
  return functions;
}

// ===== EXAMPLE 3: Register Tools with Google AI =====

export function getGoogleAITools() {
  const llmAgent = new BankingLLMAgent(new BankingApiWrapper());
  
  // Get function definitions for Google AI
  const functions = llmAgent.getGoogleAIFunctionDefinitions();
  
  console.log('Available banking tools for Google AI:', functions.length);
  
  return functions;
}

// ===== EXAMPLE 4: Execute Banking Operations =====

export async function executeBankingOperations() {
  const llmAgent = await setupBankingAgent();
  
  try {
    // Example 1: Get account balance
    const balance = await llmAgent.executeTool('get_account_balance', {});
    console.log('Account Balance:', balance);
    
    // Example 2: Send money
    const transfer = await llmAgent.executeTool('send_money', {
      toAccountNumber: 'ACC002',
      amount: 1000,
      description: 'Payment for services'
    });
    console.log('Money Transfer:', transfer);
    
    // Example 3: Apply for loan
    const loan = await llmAgent.executeTool('apply_for_loan', {
      loanType: 'personal',
      amount: 50000,
      tenure: 36
    });
    console.log('Loan Application:', loan);
    
    // Example 4: Block card
    const blockCard = await llmAgent.executeTool('block_card', {
      cardId: 'card-123'
    });
    console.log('Card Blocked:', blockCard);
    
  } catch (error) {
    console.error('Banking operation failed:', error);
  }
}

// ===== EXAMPLE 5: Enhanced Service Usage =====

export async function useEnhancedService() {
  const service = new EnhancedBankingService({
    enableMockData: true, // Use mock data for testing
    authToken: 'your_jwt_token_here'
  });
  
  // Execute operations using natural language intents
  const operations = [
    { intent: 'check_balance', params: {} },
    { intent: 'send_money', params: { toAccountNumber: 'ACC002', amount: 500 } },
    { intent: 'mini_statement', params: {} },
    { intent: 'apply_loan', params: { loanType: 'personal', amount: 25000, tenure: 24 } },
    { intent: 'block_card', params: { cardId: 'card-456' } }
  ];
  
  for (const operation of operations) {
    try {
      const result = await service.executeBankingOperation(
        operation.intent,
        { conversationId: 'test', userId: 'user-1', currentTurn: 1 } as any,
        operation.params
      );
      
      console.log(`${operation.intent}:`, result);
    } catch (error) {
      console.error(`Failed to execute ${operation.intent}:`, error);
    }
  }
}

// ===== EXAMPLE 6: Tool Discovery and Search =====

export function discoverBankingTools() {
  const llmAgent = new BankingLLMAgent(new BankingApiWrapper());
  
  // Get all tools
  const allTools = llmAgent.getAllTools();
  console.log('Total banking tools:', allTools.length);
  
  // Get tools by category
  const accountTools = llmAgent.getToolsByCategory('account');
  const cardTools = llmAgent.getToolsByCategory('card');
  const loanTools = llmAgent.getToolsByCategory('loan');
  
  console.log('Account tools:', accountTools.map(t => t.name));
  console.log('Card tools:', cardTools.map(t => t.name));
  console.log('Loan tools:', loanTools.map(t => t.name));
  
  // Search tools
  const transferTools = llmAgent.searchTools('transfer');
  const balanceTools = llmAgent.searchTools('balance');
  
  console.log('Transfer-related tools:', transferTools.map(t => t.name));
  console.log('Balance-related tools:', balanceTools.map(t => t.name));
  
  // Get public vs authenticated tools
  const publicTools = llmAgent.getPublicTools();
  const authTools = llmAgent.getAuthenticatedTools();
  
  console.log('Public tools:', publicTools.map(t => t.name));
  console.log('Authenticated tools:', authTools.length);
}

// ===== EXAMPLE 7: Parameter Validation =====

export function validateToolParameters() {
  const llmAgent = new BankingLLMAgent(new BankingApiWrapper());
  
  // Valid parameters
  const validSendMoney = {
    toAccountNumber: 'ACC002',
    amount: 1000,
    description: 'Payment'
  };
  
  // Invalid parameters
  const invalidSendMoney = {
    toAccountNumber: 'ACC002',
    // Missing required 'amount' field
    description: 'Payment'
  };
  
  const validationErrors1 = llmAgent.validateToolParameters('send_money', validSendMoney);
  const validationErrors2 = llmAgent.validateToolParameters('send_money', invalidSendMoney);
  
  console.log('Valid parameters errors:', validationErrors1); // Should be empty
  console.log('Invalid parameters errors:', validationErrors2); // Should contain errors
}

// ===== EXAMPLE 8: Integration with Conversation System =====

export async function integrateWithConversation(userMessage: string, conversationContext: any) {
  const service = new EnhancedBankingService({
    enableMockData: false, // Use real API
    authToken: conversationContext.authToken
  });
  
  // Simple intent extraction (in real scenario, use NLP)
  let intent = '';
  let parameters = {};
  
  if (userMessage.toLowerCase().includes('balance')) {
    intent = 'check_balance';
  } else if (userMessage.toLowerCase().includes('send money') || userMessage.toLowerCase().includes('transfer')) {
    intent = 'send_money';
    // Extract parameters from message (in real scenario, use NLP)
    parameters = {
      toAccountNumber: 'ACC002', // Would be extracted from message
      amount: 1000, // Would be extracted from message
      description: 'Transfer request'
    };
  } else if (userMessage.toLowerCase().includes('mini statement')) {
    intent = 'mini_statement';
  } else if (userMessage.toLowerCase().includes('block card')) {
    intent = 'block_card';
    parameters = {
      cardId: 'card-123' // Would be extracted from context or asked from user
    };
  }
  
  if (intent) {
    try {
      const result = await service.executeBankingOperation(intent, conversationContext, parameters);
      return {
        response: result.message || 'Operation completed',
        data: result.data,
        success: result.success
      };
    } catch (error) {
      return {
        response: 'I encountered an error processing your request.',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  return {
    response: 'I didn\'t understand your banking request. Please try again.',
    success: false
  };
}

// ===== EXAMPLE 9: Mock Data Testing =====

export async function testWithMockData() {
  const service = new EnhancedBankingService({
    enableMockData: true // Enable mock responses
  });
  
  const testCases = [
    'check_balance',
    'mini_statement',
    'send_money',
    'apply_loan',
    'block_card',
    'login'
  ];
  
  console.log('Testing with mock data:');
  
  for (const testCase of testCases) {
    const result = await service.executeBankingOperation(
      testCase,
      { conversationId: 'test', userId: 'test-user', currentTurn: 1 } as any,
      { amount: 1000, cardId: 'test-card', loanType: 'personal', toAccountNumber: 'ACC002' }
    );
    
    console.log(`${testCase}:`, result.success ? 'SUCCESS' : 'FAILED', result.message);
  }
}

// ===== EXAMPLE 10: Error Handling =====

export async function demonstrateErrorHandling() {
  const llmAgent = new BankingLLMAgent(new BankingApiWrapper());
  
  try {
    // Try to execute non-existent tool
    await llmAgent.executeTool('non_existent_tool', {});
  } catch (error) {
    console.log('Expected error for non-existent tool:', error.message);
  }
  
  try {
    // Try to execute tool with invalid parameters
    await llmAgent.executeTool('send_money', {
      // Missing required parameters
      description: 'Test'
    });
  } catch (error) {
    console.log('Expected error for invalid parameters:', error.message);
  }
  
  // Validate parameters before execution
  const errors = llmAgent.validateToolParameters('send_money', {
    amount: 'invalid_amount', // Should be number
    toAccountNumber: 'ACC002'
  });
  
  if (errors.length > 0) {
    console.log('Parameter validation errors:', errors);
  }
}

// Export all examples for easy usage
export const examples = {
  setupBankingAgent,
  getOpenAITools,
  getGoogleAITools,
  executeBankingOperations,
  useEnhancedService,
  discoverBankingTools,
  validateToolParameters,
  integrateWithConversation,
  testWithMockData,
  demonstrateErrorHandling
};

export default examples;
