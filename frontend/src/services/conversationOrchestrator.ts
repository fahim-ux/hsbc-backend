import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { 
  ConversationContext, 
  Message, 
  BankingTask, 
  ConversationState,
  TaskProgress,
  IntentClassification
} from '@/types/conversation';
import { IntentClassifier } from './intentClassifier';
import { BankingService } from './bankingService';
import { TaskManager } from './taskManager';

export class ConversationOrchestrator {
  private genAI: GoogleGenAI;
  private intentClassifier: IntentClassifier;
  private bankingService: BankingService;
  private taskManager: TaskManager;
  private conversations: Map<string, ConversationContext> = new Map();

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({
      apiKey: apiKey,
    });
    this.intentClassifier = new IntentClassifier(apiKey);
    this.bankingService = new BankingService();
    this.taskManager = new TaskManager();
  }

  async processMessage(
    conversationId: string,
    userId: string,
    userMessage: string
  ): Promise<{ response: string; context: ConversationContext }> {
    // Get or create conversation context
    let context = this.conversations.get(conversationId);
    if (!context) {
      context = this.createNewConversation(conversationId, userId);
    }

    // Add user message to context
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    context.messages.push(userMsg);

    // Process the message based on current state
    let response: string;
    
    try {
      switch (context.state.phase) {
        case 'greeting':
          response = await this.handleGreeting(context, userMessage);
          break;
        case 'intent_detection':
          response = await this.handleIntentDetection(context, userMessage);
          break;
        case 'information_gathering':
          response = await this.handleInformationGathering(context, userMessage);
          break;
        case 'confirmation':
          response = await this.handleConfirmation(context, userMessage);
          break;
        case 'execution':
          response = await this.handleExecution(context, userMessage);
          break;
        case 'completion':
          response = await this.handleCompletion(context, userMessage);
          break;
        default:
          response = await this.handleGeneral(context, userMessage);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        phase: context.state.phase,
        task: context.state.currentTask
      });
      
      response = "I apologize, but I encountered an error. Let me help you with that again. What can I assist you with today?";
      context.state.phase = 'intent_detection';
    }

    // Add assistant response to context
    const assistantMsg: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    context.messages.push(assistantMsg);

    // Update conversation context
    context.updatedAt = new Date();
    this.conversations.set(conversationId, context);

    return { response, context };
  }

  private createNewConversation(conversationId: string, userId: string): ConversationContext {
    return {
      id: conversationId,
      userId,
      state: {
        phase: 'greeting',
        requiredFields: [],
        collectedFields: {},
        pendingClarifications: []
      },
      entities: {},
      taskProgress: {
        step: 0,
        totalSteps: 0,
        completed: false,
        data: {}
      },
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async handleGreeting(context: ConversationContext, userMessage: string): Promise<string> {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetings.some(g => userMessage.toLowerCase().includes(g));

    if (isGreeting || context.messages.length === 1) {
      context.state.phase = 'intent_detection';
      return "Hello! Welcome to HSBC Banking Assistant. I'm here to help you with various banking services including loan applications, card management, account inquiries, and more. How may I assist you today?";
    } else {
      // User jumped straight to a request
      context.state.phase = 'intent_detection';
      return await this.handleIntentDetection(context, userMessage);
    }
  }

  private async handleIntentDetection(context: ConversationContext, userMessage: string): Promise<string> {
    const conversationHistory = context.messages
      .slice(-5) // Last 5 messages for context
      .map(m => `${m.role}: ${m.content}`);

    const classification = await this.intentClassifier.classifyIntent(userMessage, conversationHistory);
    console.log('Intent classification result 2:', classification);
    // Store intent and entities
    if (classification.intent !== 'unknown') {
      context.currentIntent = classification.intent;
      context.entities = { ...context.entities, ...classification.entities };

      if (classification.clarificationNeeded && classification.clarificationQuestion) {
        return classification.clarificationQuestion;
      }

      // Initialize task
      const taskConfig = this.taskManager.getTaskConfiguration(classification.intent);
      context.state.currentTask = classification.intent;
      context.state.requiredFields = taskConfig.requiredFields;
      context.taskProgress = {
        taskType: classification.intent,
        step: 1,
        totalSteps: taskConfig.steps.length,
        completed: false,
        data: { ...classification.entities }
      };

      // Check if we have enough information to proceed
      const missingFields = this.getMissingRequiredFields(context);
      
      if (missingFields.length === 0) {
        context.state.phase = 'confirmation';
        return await this.generateConfirmationMessage(context);
      } else {
        context.state.phase = 'information_gathering';
        return await this.generateInformationGatheringMessage(context, missingFields[0]);
      }
    } else {
      return "I'm not sure I understood that correctly. Could you please clarify what you'd like help with today? I can assist with loan applications, card blocking, account statements, balance inquiries, and more.";
    }
  }

  private async handleInformationGathering(context: ConversationContext, userMessage: string): Promise<string> {
    // Extract information from user response
    const extractedInfo = await this.extractInformationFromResponse(context, userMessage);
    
    // Update collected fields
    Object.assign(context.state.collectedFields, extractedInfo);
    Object.assign(context.taskProgress.data, extractedInfo);

    // Check for missing fields
    const missingFields = this.getMissingRequiredFields(context);
    
    if (missingFields.length === 0) {
      context.state.phase = 'confirmation';
      return await this.generateConfirmationMessage(context);
    } else {
      // Ask for next missing field
      return await this.generateInformationGatheringMessage(context, missingFields[0]);
    }
  }

  private async handleConfirmation(context: ConversationContext, userMessage: string): Promise<string> {
    const confirmation = userMessage.toLowerCase();
    const isConfirmed = confirmation.includes('yes') || confirmation.includes('confirm') || 
                       confirmation.includes('proceed') || confirmation.includes('correct');
    const isDenied = confirmation.includes('no') || confirmation.includes('cancel') || 
                    confirmation.includes('wrong');

    if (isConfirmed) {
      context.state.phase = 'execution';
      return await this.handleExecution(context, userMessage);
    } else if (isDenied) {
      context.state.phase = 'information_gathering';
      return "I understand. Let me help you correct the information. What would you like to change?";
    } else {
      return "Please confirm if the information is correct by saying 'yes' or 'confirm', or say 'no' if you'd like to make changes.";
    }
  }

  private async handleExecution(context: ConversationContext, userMessage: string): Promise<string> {
    const task = context.state.currentTask;
    const taskData = context.taskProgress.data;

    try {
      let result;
      switch (task) {
        case 'loan_application':
          result = await this.bankingService.submitLoanApplication(context.userId, taskData);
          break;
        case 'card_blocking':
          result = await this.bankingService.blockCard(context.userId, taskData);
          break;
        case 'account_statement':
          result = await this.bankingService.getAccountStatement(context.userId, taskData);
          break;
        case 'balance_inquiry':
          result = await this.bankingService.getBalance(context.userId);
          break;
        case 'transaction_history':
          result = await this.bankingService.getTransactionHistory(context.userId, taskData);
          break;
        case 'interest_rate_inquiry':
          result = await this.bankingService.getInterestRates(taskData);
          break;
        default:
          result = await this.bankingService.handleGeneralInquiry(userMessage);
      }

      context.taskProgress.completed = true;
      context.state.phase = 'completion';
      
      return this.formatExecutionResult(task!, result);
    } catch (error) {
      console.error('Execution error:', error);
      return `I apologize, but there was an error processing your ${task?.replace('_', ' ')} request. Please try again or contact customer service for assistance.`;
    }
  }

  private async handleCompletion(context: ConversationContext, userMessage: string): Promise<string> {
    // Check if user wants to do something else
    const newTaskKeywords = ['another', 'also', 'help', 'need', 'want'];
    const hasNewRequest = newTaskKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (hasNewRequest) {
      // Reset context for new task
      context.state.phase = 'intent_detection';
      context.currentIntent = undefined;
      context.state.currentTask = undefined;
      context.state.collectedFields = {};
      context.state.requiredFields = [];
      context.taskProgress = {
        step: 0,
        totalSteps: 0,
        completed: false,
        data: {}
      };

      return "Of course! I'm here to help with any other banking needs. What else can I assist you with today?";
    } else {
      return "Thank you for using HSBC Banking Assistant! If you need any further assistance, feel free to ask. Have a great day!";
    }
  }

  private async handleGeneral(context: ConversationContext, userMessage: string): Promise<string> {
    const prompt = `You are a helpful HSBC banking assistant. The user said: "${userMessage}"

    Respond helpfully and professionally. If they're asking about banking services, provide relevant information. 
    If it's a greeting or general chat, respond appropriately and ask how you can help with their banking needs.`;

    try {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking
          },
        }
      });
      return response.text || "I'm here to help you with your banking needs. What can I assist you with today?";
    } catch (error) {
      console.error('General handler error:', error);
      return "I'm here to help you with your banking needs. What can I assist you with today?";
    }
  }

  private getMissingRequiredFields(context: ConversationContext): string[] {
    const required = context.state.requiredFields;
    const collected = Object.keys(context.state.collectedFields);
    const fromEntities = Object.keys(context.entities);
    const fromTaskData = Object.keys(context.taskProgress.data);
    
    const allCollected = [...collected, ...fromEntities, ...fromTaskData];
    
    return required.filter(field => !allCollected.includes(field));
  }

  private async generateConfirmationMessage(context: ConversationContext): Promise<string> {
    const task = context.state.currentTask;
    const data = { ...context.state.collectedFields, ...context.taskProgress.data };

    switch (task) {
      case 'loan_application':
        return `Let me confirm your loan application details:
- Amount: $${data.amount || 'Not specified'}
- Purpose: ${data.purpose || 'Not specified'}
- Employment Status: ${data.employmentStatus || 'Not specified'}
- Monthly Income: $${data.monthlyIncome || 'Not specified'}

Please confirm if this information is correct, and I'll submit your application.`;

      case 'card_blocking':
        return `I'll block your ${data.cardType || 'card'} ending in ${data.lastFourDigits || 'XXXX'} due to it being ${data.reason || 'lost/stolen'}.
        
Please confirm to proceed with blocking this card.`;

      case 'balance_inquiry':
        return "I'll check your current account balance. Please confirm to proceed.";

      default:
        return "Please confirm if you'd like me to proceed with this request.";
    }
  }

  private async generateInformationGatheringMessage(context: ConversationContext, missingField: string): Promise<string> {
    const task = context.state.currentTask;
    
    const fieldQuestions: Record<string, string> = {
      amount: "What loan amount are you looking for?",
      purpose: "What is the purpose of this loan? (e.g., home, car, business, education, personal)",
      employmentStatus: "What is your current employment status?",
      monthlyIncome: "What is your monthly income?",
      cardType: "Which type of card would you like to block - debit or credit?",
      lastFourDigits: "Please provide the last four digits of your card.",
      reason: "Why do you need to block this card? (lost, stolen, damaged, or suspicious activity)",
      timePeriod: "For what time period would you like the statement/history? (e.g., last month, last 3 months)"
    };

    return fieldQuestions[missingField] || `Please provide information about ${missingField}.`;
  }

  private async extractInformationFromResponse(context: ConversationContext, userMessage: string): Promise<Record<string, any>> {
    const task = context.state.currentTask;
    const extracted: Record<string, any> = {};

    // Use Gemini to extract structured information
    const prompt = `Extract relevant information for a ${task} from this user response: "${userMessage}"

    Return a JSON object with extracted fields. For ${task}, look for:
    ${this.getExtractionPromptForTask(task!)}

    Response format: {"field_name": "value"}`;

    try {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        }
      });
      
      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        Object.assign(extracted, JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error('Extraction error:', error);
      console.error('Extraction error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        task,
        userMessage: userMessage.substring(0, 100) + '...' // Log first 100 chars for debugging
      });
    }

    // Fallback: simple pattern matching
    if (task === 'loan_application') {
      const amountMatch = userMessage.match(/\$?([\d,]+(?:\.\d{2})?)/);
      if (amountMatch) extracted.amount = amountMatch[1];
    }

    return extracted;
  }

  private getExtractionPromptForTask(task: BankingTask): string {
    switch (task) {
      case 'loan_application':
        return '- amount (numerical value)\n- purpose (home/car/business/education/personal)\n- employmentStatus\n- monthlyIncome (numerical value)';
      case 'card_blocking':
        return '- cardType (debit/credit)\n- lastFourDigits (4 digits)\n- reason (lost/stolen/damaged/suspicious_activity)';
      case 'account_statement':
      case 'transaction_history':
        return '- timePeriod (timeframe like "last month", "3 months", etc.)';
      default:
        return '- any relevant banking information';
    }
  }

  private formatExecutionResult(task: BankingTask, result: any): string {
    switch (task) {
      case 'loan_application':
        return `Great! Your loan application has been submitted successfully. 
        
Application ID: ${result.id}
Status: ${result.status}
Amount: $${result.amount}

You'll receive updates via email and SMS. The review process typically takes 3-5 business days.`;

      case 'card_blocking':
        return `Your ${result.cardType} card ending in ${result.cardLastFourDigits} has been successfully blocked.

Block Reference: ${result.id}
Reason: ${result.reason}
Status: ${result.status}

A replacement card will be sent to your registered address within 7-10 business days.`;

      case 'balance_inquiry':
        return `Your current account balance is: $${result.balance.toFixed(2)}

Account Type: ${result.accountType}
Available Balance: $${result.availableBalance?.toFixed(2) || result.balance.toFixed(2)}
Last Updated: ${new Date().toLocaleString()}`;

      case 'transaction_history':
        const transactions = result.transactions.slice(0, 5);
        let response = `Here are your recent transactions:\n\n`;
        transactions.forEach((tx: any) => {
          response += `${tx.date} | ${tx.type.toUpperCase()} | $${tx.amount} | ${tx.description}\n`;
        });
        response += `\nShowing ${transactions.length} of ${result.transactions.length} transactions.`;
        return response;

      default:
        return "Your request has been processed successfully.";
    }
  }

  getConversation(conversationId: string): ConversationContext | undefined {
    return this.conversations.get(conversationId);
  }

  clearConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
  }
}
