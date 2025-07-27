/**
 * Banking Chat Integration
 * Simple integration for chat interface with banking functions
 */

import { GoogleGenAI } from '@google/genai';
import { BankingToolsIntegration } from './bankingToolsIntegration';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface BankingChatResponse {
  message: string;
  functionsExecuted?: string[];
  data?: any;
  error?: string;
}

export class BankingChatIntegration {
  private genAI: GoogleGenAI;
  private bankingTools: BankingToolsIntegration;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({
      apiKey: apiKey
    });
    this.bankingTools = new BankingToolsIntegration({
      enableMockData: true // Default to mock data
    });
  }

  /**
   * Process chat message with banking capabilities
   */
  async processChatMessage(
    userMessage: string,
    chatHistory: ChatMessage[] = [],
    authToken?: string
  ): Promise<BankingChatResponse> {
    try {
      // Set auth token if provided
      if (authToken) {
        this.bankingTools.setAuthToken(authToken);
      }

      // Check if message is banking-related
      const isBankingRequest = this.isBankingRelated(userMessage);

      if (isBankingRequest) {
        return await this.handleBankingRequest(userMessage, chatHistory, authToken);
      } else {
        return await this.handleGeneralChat(userMessage, chatHistory);
      }

    } catch (error) {
      console.error('Chat processing error:', error);
      return {
        message: "I apologize, but I encountered an error. Please try again or contact support.",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if message is banking-related
   */
  private isBankingRelated(message: string): boolean {
    const bankingKeywords = [
      'balance', 'account', 'transfer', 'send money', 'pay', 'payment',
      'card', 'block', 'debit', 'credit', 'loan', 'apply', 'borrow',
      'statement', 'transaction', 'complaint', 'issue', 'problem',
      'bank', 'banking', 'hsbc', 'withdraw', 'deposit'
    ];

    const lowerMessage = message.toLowerCase();
    return bankingKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Handle banking-specific requests
   */
  private async handleBankingRequest(
    userMessage: string,
    chatHistory: ChatMessage[],
    authToken?: string
  ): Promise<BankingChatResponse> {
    console.log('🏦 Processing banking request:', userMessage);

    // Create banking-focused prompt
    const systemPrompt = this.createBankingPrompt(userMessage, chatHistory, !!authToken);

    try {
      // Simple text generation for banking responses
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          role: 'user',
          parts: [{ text: systemPrompt }]
        }]
      });

      const aiResponse = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Analyze response to determine if we need to execute banking functions
      const functionToExecute = this.determineBankingFunction(userMessage, aiResponse);

      if (functionToExecute) {
        console.log(`🔧 Executing banking function: ${functionToExecute.name}`);
        
        const result = await this.bankingTools.executeBankingFunction(
          functionToExecute,
          authToken
        );

        if (result.success) {
          return {
            message: this.formatSuccessResponse(functionToExecute.name, result),
            functionsExecuted: [functionToExecute.name],
            data: result.data
          };
        } else {
          return {
            message: `I encountered an issue: ${result.error || 'Unknown error'}`,
            error: result.error
          };
        }
      }

      return {
        message: aiResponse || "I'd be happy to help with your banking needs. Could you please be more specific about what you'd like to do?"
      };

    } catch (error) {
      console.error('Banking request processing error:', error);
      return {
        message: "I'm having trouble processing your banking request. Please try again or be more specific.",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle general chat (non-banking)
   */
  private async handleGeneralChat(
    userMessage: string,
    chatHistory: ChatMessage[]
  ): Promise<BankingChatResponse> {
    const prompt = `You are a helpful HSBC banking assistant. The user said: "${userMessage}"

Provide a friendly, helpful response. If they're asking about banking services, guide them to be more specific about what they need help with.

Keep responses concise and professional.`;

    try {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });

      const aiResponse = response.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Hello! I'm your HSBC banking assistant. How can I help you today?";

      return { message: aiResponse };

    } catch (error) {
      return {
        message: "Hello! I'm your HSBC banking assistant. I can help you with account balances, transfers, card management, loans, and more. What would you like to do today?"
      };
    }
  }

  /**
   * Create banking-focused prompt
   */
  private createBankingPrompt(userMessage: string, chatHistory: ChatMessage[], isAuthenticated: boolean): string {
    const historyText = chatHistory.slice(-3).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    return `You are an expert HSBC banking assistant. Help the user with their banking request.

Authentication Status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}

Recent conversation:
${historyText}

Current request: "${userMessage}"

Available banking services:
- Check account balance
- Get mini statement (recent transactions)
- Send/transfer money
- Block cards for security
- Apply for loans
- File complaints

Guidelines:
1. Be helpful and professional
2. If not authenticated, mention they may need to login for some services
3. Provide clear, actionable responses
4. Ask for clarification if the request is unclear
5. For specific operations, be ready to execute them

Respond helpfully to their banking request:`;
  }

  /**
   * Determine which banking function to execute based on user message
   */
  private determineBankingFunction(userMessage: string, aiResponse: string): { name: string; args: any } | null {
    const lowerMessage = userMessage.toLowerCase();

    // Check account balance
    if (lowerMessage.includes('balance') || lowerMessage.includes('how much')) {
      return { name: 'get_account_balance', args: {} };
    }

    // Mini statement
    if (lowerMessage.includes('statement') || lowerMessage.includes('recent transaction') || lowerMessage.includes('last transaction')) {
      return { name: 'get_mini_statement', args: {} };
    }

    // Send money - extract details if possible
    if (lowerMessage.includes('send') || lowerMessage.includes('transfer') || lowerMessage.includes('pay')) {
      // Try to extract amount and account
      const amountMatch = userMessage.match(/\$?(\d+(?:\.\d{2})?)/);
      const accountMatch = userMessage.match(/(?:to|account)\s+([A-Z0-9]+)/i);
      
      if (amountMatch && accountMatch) {
        return {
          name: 'send_money',
          args: {
            amount: parseFloat(amountMatch[1]),
            toAccountNumber: accountMatch[1],
            description: 'Transfer via chat'
          }
        };
      }
    }

    // Block card
    if (lowerMessage.includes('block') && lowerMessage.includes('card')) {
      // Try to extract card ID
      const cardMatch = userMessage.match(/card[-\s]*([A-Za-z0-9]+)/i);
      if (cardMatch) {
        return {
          name: 'block_card',
          args: { cardId: cardMatch[1] }
        };
      } else {
        return {
          name: 'block_card',
          args: { cardId: 'card-1' } // Default for demo
        };
      }
    }

    // Apply for loan
    if (lowerMessage.includes('loan') && (lowerMessage.includes('apply') || lowerMessage.includes('request'))) {
      // Try to extract loan details
      const amountMatch = userMessage.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      const typeMatch = userMessage.match(/(personal|home|car|education)/i);
      
      if (amountMatch) {
        return {
          name: 'apply_loan',
          args: {
            loanType: typeMatch ? typeMatch[1].toLowerCase() : 'personal',
            amount: parseFloat(amountMatch[1].replace(/,/g, '')),
            tenure: 36 // Default
          }
        };
      }
    }

    // Raise complaint
    if (lowerMessage.includes('complaint') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return {
        name: 'raise_complaint',
        args: {
          subject: 'Customer Issue',
          description: userMessage,
          category: 'general'
        }
      };
    }

    return null;
  }

  /**
   * Format success response for executed functions
   */
  private formatSuccessResponse(functionName: string, result: any): string {
    switch (functionName) {
      case 'get_account_balance':
        const balance = result.data?.balance || result.data?.data?.balance;
        return `💰 Your current account balance is $${balance?.toFixed(2) || 'N/A'}`;

      case 'get_mini_statement':
        const transactions = result.data?.transactions || result.data?.data?.transactions || [];
        if (transactions.length > 0) {
          const txnList = transactions.slice(0, 3).map((tx: any) => 
            `• ${tx.description}: $${Math.abs(tx.amount)} (${tx.type})`
          ).join('\n');
          return `📋 Recent Transactions:\n${txnList}`;
        }
        return '📋 No recent transactions found.';

      case 'send_money':
        const txnId = result.data?.transactionId || result.data?.data?.transactionId;
        return `✅ Money transfer completed successfully! Transaction ID: ${txnId}`;

      case 'block_card':
        return `🔒 Your card has been blocked successfully for security. Please contact us if you need a replacement card.`;

      case 'apply_loan':
        const loanId = result.data?.loanId || result.data?.data?.loanId;
        return `📄 Loan application submitted successfully! Application ID: ${loanId}. We'll review and get back to you within 2-3 business days.`;

      case 'raise_complaint':
        const complaintId = result.data?.complaintId || result.data?.data?.complaintId;
        return `🎧 Complaint filed successfully! Complaint ID: ${complaintId}. We'll investigate and respond within 24-48 hours.`;

      default:
        return result.message || 'Operation completed successfully!';
    }
  }

  /**
   * Set mock data mode
   */
  setMockDataEnabled(enabled: boolean): void {
    this.bankingTools.setMockDataEnabled(enabled);
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.bankingTools.setAuthToken(token);
  }
}

export default BankingChatIntegration;
