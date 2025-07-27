/**
 * Enhanced Conversation Orchestrator with Banking Tools
 * Integrates banking function calling with existing conversation flow
 */

import { GoogleGenAI, Type } from '@google/genai';
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
import { BankingToolsIntegration, bankingFunctionMap } from './bankingToolsIntegration';

export class EnhancedConversationOrchestrator {
    private genAI: GoogleGenAI;
    private intentClassifier: IntentClassifier;
    private bankingService: BankingService;
    private taskManager: TaskManager;
    private bankingTools: BankingToolsIntegration;
    private conversations: Map<string, ConversationContext> = new Map();

    constructor(apiKey: string) {
        this.genAI = new GoogleGenAI({
            apiKey: apiKey,
        });
        this.intentClassifier = new IntentClassifier(apiKey);
        this.bankingService = new BankingService();
        this.taskManager = new TaskManager();
        this.bankingTools = new BankingToolsIntegration({
            enableMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true' // Use environment variable
        });
    }

    async processMessage(
        conversationId: string,
        userId: string,
        userMessage: string,
        authToken?: string
    ): Promise<{ response: string; context: ConversationContext }> {
        // Get or create conversation context
        let context = this.conversations.get(conversationId);
        if (!context) {
            context = this.createNewConversation(conversationId, userId);
        }

        // Set auth token if provided
        if (authToken) {
            this.bankingTools.setAuthToken(authToken);
        }

        // Add user message to context
        const userMsg: Message = {
            id: uuidv4(),
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };
        context.messages.push(userMsg);

        // Process the message with function calling capability
        let response: string;

        try {
            // Determine conversation phase and handle accordingly
            if (context.state.phase === 'greeting') {
                // Handle initial intent detection
                response = await this.handleIntentDetection(context, userMessage);
            } else if (context.state.phase === 'information_gathering') {
                // Continue gathering information
                response = await this.handleInformationGathering(context, userMessage);
            } else if (context.state.phase === 'confirmation') {
                // Handle confirmation
                response = await this.handleConfirmation(context, userMessage);
            } else if (context.state.phase === 'execution') {
                // Execute with function calling
                response = await this.processWithFunctionCalling(context, userMessage, authToken);
            } else {
                // Default to function calling for other phases
                response = await this.processWithFunctionCalling(context, userMessage, authToken);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            response = "I apologize, but I encountered an error. Let me help you with that again. What can I assist you with today?";
            context.state.phase = 'greeting';
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

    /**
     * Process message with Google AI function calling
     */
    private async processWithFunctionCalling(
        context: ConversationContext,
        userMessage: string,
        authToken?: string
    ): Promise<string> {
        // Get banking function declarations
        const bankingFunctions = this.bankingTools.getBankingFunctionDeclarations();

        // Create enhanced system prompt with conversation state awareness
        const conversationHistory = context.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
        
        const systemPrompt = `You are an expert HSBC banking assistant. Follow this EXACT conversation flow:

CONVERSATION FLOW:
1. INTENT DETECTION: Understand what the user wants to do
2. INFORMATION GATHERING: Collect ALL required information step by step  
3. CONFIRMATION: Confirm all details with user
4. EXECUTION: Call the appropriate banking function
5. COMPLETION: Provide results and ask for next steps

CURRENT CONVERSATION STATE:
- User ID: ${context.userId}
- Phase: ${context.state.phase}
- Intent: ${context.currentIntent || 'Not detected'}
- Required Fields: ${context.state.requiredFields.join(', ') || 'None'}
- Collected Fields: ${Object.keys(context.state.collectedFields).join(', ') || 'None'}

CONVERSATION HISTORY:
${conversationHistory}

CURRENT USER MESSAGE: "${userMessage}"

BANKING FUNCTIONS AVAILABLE:
- get_account_balance: Check account balance
- get_mini_statement: Get recent transactions  
- send_money: Transfer money to another account
- block_card: Block a card for security
- apply_loan: Submit loan application (requires: loanType, amount, tenure)
- raise_complaint: File support complaint
- search_banking_context: Search HSBC banking information, loan details, rules, and policies

CRITICAL RULES:
1. DO NOT call functions during information gathering phase
2. ONLY call functions when phase is 'execution' 
3. For loan applications, collect these in order:
   - loanType (personal, home, car, education)
   - amount (loan amount in numbers)
   - tenure (duration in months)
4. After collecting ALL information, ask for confirmation
5. ONLY after user confirms, call the banking function

RESPONSE INSTRUCTIONS:
- If phase is 'intent_detection': Acknowledge intent and start gathering info
- If phase is 'information_gathering': Ask for the next missing piece of information
- If phase is 'confirmation': Ask user to confirm all details before proceeding
- If phase is 'execution': Call the appropriate banking function
- If phase is 'completion': Provide results and ask what else they need

Current phase is: ${context.state.phase}
Current intent is: ${context.currentIntent || 'Not detected'}

Based on the current phase and conversation, provide the appropriate response WITHOUT calling any functions unless phase is 'execution'.`;

        try {
            console.log('🚀 Creating Google AI chat session...');
            console.log('🔧 Available banking functions:', bankingFunctions.length);
            
            // Create chat with function calling capability
            const chat = this.genAI.chats.create({
                model: "gemini-2.5-flash",
                config: {
                    tools: [{
                        functionDeclarations: bankingFunctions as any
                    }],
                    temperature: 0.7
                }
            });

            console.log('💬 Sending message to AI...');
            let response = await chat.sendMessage({
                message: systemPrompt
            });

            let finalResponse = '';
            let executedFunctions: string[] = [];

            console.log('🤖 AI Response received');
            console.log('🔍 Function calls found:', response.functionCalls?.length || 0);

            // Handle function calls
            if (response.functionCalls && response.functionCalls.length > 0) {
                console.log(`🔧 LLM wants to call ${response.functionCalls.length} banking function(s)`);

                const toolResponses = [];

                for (const functionCall of response.functionCalls) {
                    const { name, args } = functionCall;
                    
                    if (!name) continue;

                    console.log(`📞 Calling banking function: ${name}`);
                    console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));

                    try {
                        // Execute banking function
                        const result = await this.bankingTools.executeBankingFunction(
                            { name, args: args || {} },
                            authToken
                        );

                        toolResponses.push({
                            name: name,
                            response: result
                        });

                        executedFunctions.push(name);

                        console.log(`✅ Banking function ${name} completed:`, result.success ? 'Success' : 'Failed');
                        console.log(`📊 Function result:`, result);

                    } catch (error) {
                        console.error(`❌ Banking function ${name} error:`, error);
                        toolResponses.push({
                            name: name,
                            response: { 
                                success: false, 
                                error: error instanceof Error ? error.message : 'Unknown error' 
                            }
                        });
                    }
                }

                // Send function results back to the model
                console.log("📨 Sending banking tool results back to the model...");
                response = await chat.sendMessage({
                    message: `Banking function results: ${JSON.stringify(toolResponses, null, 2)}`
                });

                finalResponse = response.text || 'Banking operations completed successfully!';

                // Update conversation state based on executed functions
                this.updateConversationStateAfterFunctions(context, executedFunctions);

            } else {
                // For execution phase, manually trigger function calls based on collected data
                if (context.state.phase === 'execution' && context.currentIntent) {
                    console.log('🚀 Execution phase: manually triggering function call');
                    finalResponse = await this.executeFunctionManually(context, authToken);
                } else {
                    // No function calls - handle normal conversation flow
                    finalResponse = response.text || '';
                    
                    console.log('💭 No function calls detected, using AI response');
                    console.log('📝 AI response text:', finalResponse);
                    
                    if (!finalResponse) {
                        // Fallback to traditional conversation handling
                        console.log('⚠️ Empty AI response, falling back to traditional flow');
                        finalResponse = await this.handleTraditionalFlow(context, userMessage);
                    }
                }
            }

            console.log('🎉 Final response:', finalResponse);
            return finalResponse;

        } catch (error) {
            console.error('❌ Function calling error:', error);
            console.error('🔍 Error details:', {
                name: (error as any)?.name,
                message: (error as any)?.message,
                stack: (error as any)?.stack
            });
            
            // Fallback to traditional conversation handling
            console.log('🔄 Falling back to traditional conversation handling');
            return await this.handleTraditionalFlow(context, userMessage);
        }
    }

    /**
     * Handle traditional conversation flow (without function calling)
     */
    private async handleTraditionalFlow(context: ConversationContext, userMessage: string): Promise<string> {
        switch (context.state.phase) {
            case 'greeting':
                return await this.handleGreeting(context, userMessage);
            case 'intent_detection':
                return await this.handleIntentDetection(context, userMessage);
            case 'information_gathering':
                return await this.handleInformationGathering(context, userMessage);
            case 'confirmation':
                return await this.handleConfirmation(context, userMessage);
            case 'execution':
                return await this.handleExecution(context, userMessage);
            case 'completion':
                return await this.handleCompletion(context, userMessage);
            default:
                return await this.handleGeneral(context, userMessage);
        }
    }

    private async executeFunctionManually(context: ConversationContext, authToken?: string): Promise<string> {
        console.log('🔧 Manually executing function for intent:', context.currentIntent);
        console.log('📊 Collected fields:', context.state.collectedFields);
        
        try {
            let result;
            
            if (context.currentIntent === 'apply_loan') {
                const { loanType, amount, tenure } = context.state.collectedFields;
                result = await this.bankingTools.executeBankingFunction({
                    name: 'apply_loan',
                    args: { loanType, amount, tenure }
                }, authToken);
                
            } else if (context.currentIntent === 'send_money') {
                const { toAccountNumber, amount, description } = context.state.collectedFields;
                result = await this.bankingTools.executeBankingFunction({
                    name: 'send_money', 
                    args: { toAccountNumber, amount, description }
                }, authToken);
                
            } else if (context.currentIntent === 'block_card') {
                const { cardId } = context.state.collectedFields;
                result = await this.bankingTools.executeBankingFunction({
                    name: 'block_card',
                    args: { cardId }
                }, authToken);
                
            } else if (context.currentIntent === 'check_balance') {
                result = await this.bankingTools.executeBankingFunction({
                    name: 'get_account_balance',
                    args: {}
                }, authToken);
                
            } else if (context.currentIntent === 'get_mini_statement') {
                result = await this.bankingTools.executeBankingFunction({
                    name: 'get_mini_statement',
                    args: {}
                }, authToken);
                
            } else if (context.currentIntent === 'raise_complaint') {
                const { subject, description, category } = context.state.collectedFields;
                result = await this.bankingTools.executeBankingFunction({
                    name: 'raise_complaint',
                    args: { subject, description, category }
                }, authToken);
                
            } else if (context.currentIntent === 'search_banking_context') {
                const { query } = context.state.collectedFields;
                result = await this.bankingTools.executeBankingFunction({
                    name: 'search_banking_context',
                    args: { query: query || 'general banking information' }
                }, authToken);
                
            } else {
                return "I'm not sure how to execute that operation. Please try again.";
            }
            
            console.log('✅ Function executed successfully:', result);
            
            // Move to completion phase
            context.state.phase = 'completion';
            
            if (result.success) {
                return result.message + (result.data ? '\n\n' + JSON.stringify(result.data, null, 2) : '');
            } else {
                return `I apologize, but there was an issue: ${result.message}`;
            }
            
        } catch (error) {
            console.error('❌ Manual function execution error:', error);
            return "I apologize, but I encountered an error while processing your request. Please try again.";
        }
    }

    /**
     * Update conversation state after function execution
     */
    private updateConversationStateAfterFunctions(context: ConversationContext, executedFunctions: string[]): void {
        if (executedFunctions.length > 0) {
            // Mark as completed if functions were executed
            context.state.phase = 'completion';

            // Update task progress
            if (context.taskProgress) {
                context.taskProgress.completed = true;
                context.taskProgress.step = context.taskProgress.totalSteps;
            }

            // Set intent based on executed functions
            if (executedFunctions.includes('get_account_balance')) {
                context.currentIntent = 'check_balance';
            } else if (executedFunctions.includes('send_money')) {
                context.currentIntent = 'transfer_money';
            } else if (executedFunctions.includes('block_card')) {
                context.currentIntent = 'block_card';
            } else if (executedFunctions.includes('apply_loan')) {
                context.currentIntent = 'apply_loan';
            }
        }
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
            return "Hello! Welcome to HSBC Banking Assistant. I'm here to help you with various banking services including checking balances, transferring money, blocking cards, applying for loans, and more. How may I assist you today?";
        } else {
            // User jumped straight to a request
            context.state.phase = 'intent_detection';
            return await this.handleIntentDetection(context, userMessage);
        }
    }

    private async handleIntentDetection(context: ConversationContext, userMessage: string): Promise<string> {
        console.log('🎯 Handling intent detection for:', userMessage);
        
        // Simple intent detection based on keywords
        const loanKeywords = ['loan', 'apply', 'credit', 'borrow', 'finance'];
        const balanceKeywords = ['balance', 'account', 'money', 'funds'];
        const transferKeywords = ['transfer', 'send', 'pay', 'payment'];
        const cardKeywords = ['card', 'block', 'freeze', 'stop'];
        const infoKeywords = ['information', 'info', 'details', 'rules', 'regulations', 'policy', 'policies', 'eligibility', 'criteria', 'requirements', 'types', 'interest rate', 'tenure', 'what', 'how', 'tell me', 'explain'];
        
        if (loanKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
            console.log('🎯 Detected loan application intent');
            context.currentIntent = 'apply_loan';
            context.state.phase = 'information_gathering';
            context.state.requiredFields = ['loanType', 'amount', 'tenure'];
            context.state.collectedFields = {};
            
            return "I can help you apply for a loan. Let me gather some information. What type of loan are you looking for? We offer personal, home, car, and education loans.";
            
        } else if (balanceKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
            console.log('🎯 Detected balance inquiry intent');
            context.currentIntent = 'check_balance';
            context.state.phase = 'execution';
            return "I'll check your account balance right away.";
            
        } else if (transferKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
            console.log('🎯 Detected money transfer intent');
            context.currentIntent = 'send_money';
            context.state.phase = 'information_gathering';
            context.state.requiredFields = ['toAccountNumber', 'amount', 'description'];
            context.state.collectedFields = {};
            
            return "I can help you transfer money. Please provide the recipient's account number.";
            
        } else if (cardKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
            console.log('🎯 Detected card blocking intent');
            context.currentIntent = 'block_card';
            context.state.phase = 'information_gathering';
            context.state.requiredFields = ['cardId'];
            context.state.collectedFields = {};
            
            return "I can help you block your card for security. Please provide your card ID or last 4 digits.";
            
        } else if (infoKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
            console.log('🎯 Detected information inquiry intent');
            context.currentIntent = 'search_banking_context';
            context.state.phase = 'execution';
            context.state.requiredFields = [];
            context.state.collectedFields = { query: userMessage };
            
            return "Let me search for that information in HSBC's banking documentation.";
            
        } else {
            console.log('🎯 Unknown intent, asking for clarification');
            return "I'm here to help with your banking needs. I can assist with:\n- Loan applications\n- Checking account balance\n- Money transfers\n- Blocking cards\n- Transaction history\n- Banking information and rules\n\nWhat would you like to do today?";
        }
    }

    private async handleInformationGathering(context: ConversationContext, userMessage: string): Promise<string> {
        console.log('📝 Handling information gathering for:', context.currentIntent);
        console.log('📋 Required fields:', context.state.requiredFields);
        console.log('✅ Collected fields:', Object.keys(context.state.collectedFields));
        
        // Check if user wants to switch to a different task
        const intentSwitch = this.checkForIntentSwitch(userMessage);
        if (intentSwitch) {
            console.log('🔄 Intent switch detected from', context.currentIntent, 'to', intentSwitch);
            return this.switchToNewIntent(context, userMessage, intentSwitch);
        }
        
        if (context.currentIntent === 'apply_loan') {
            return this.handleLoanInformationGathering(context, userMessage);
        } else if (context.currentIntent === 'send_money') {
            return this.handleTransferInformationGathering(context, userMessage);
        } else if (context.currentIntent === 'block_card') {
            return this.handleCardInformationGathering(context, userMessage);
        } else if (context.currentIntent === 'raise_complaint') {
            return this.handleComplaintInformationGathering(context, userMessage);
        }
        
        return "I need more information to help you with that. Could you please provide additional details?";
    }
    
    private checkForIntentSwitch(userMessage: string): string | null {
        const userInput = userMessage.toLowerCase();
        
        // Check for different intent keywords
        if (userInput.includes('block') && (userInput.includes('card') || userInput.includes('credit') || userInput.includes('debit'))) {
            return 'block_card';
        }
        
        if ((userInput.includes('loan') || userInput.includes('apply')) && !userInput.includes('block')) {
            return 'apply_loan';
        }
        
        if (userInput.includes('transfer') || userInput.includes('send') || userInput.includes('pay')) {
            return 'send_money';
        }
        
        if (userInput.includes('balance') || userInput.includes('account')) {
            return 'check_balance';
        }
        
        if (userInput.includes('transaction') || userInput.includes('statement') || userInput.includes('history')) {
            return 'get_mini_statement';
        }
        
        if (userInput.includes('complaint') || userInput.includes('issue') || userInput.includes('problem')) {
            return 'raise_complaint';
        }
        
        // Check for information/context search keywords
        const infoKeywords = ['information', 'info', 'details', 'rules', 'regulations', 'policy', 'policies', 'eligibility', 'criteria', 'requirements', 'types', 'interest rate', 'tenure', 'what', 'how', 'tell me', 'explain'];
        if (infoKeywords.some(keyword => userInput.includes(keyword))) {
            return 'search_banking_context';
        }
        
        return null;
    }
    
    private switchToNewIntent(context: ConversationContext, userMessage: string, newIntent: string): string {
        console.log('🔄 Switching from', context.currentIntent, 'to', newIntent);
        
        // Clear current progress
        context.state.collectedFields = {};
        context.currentIntent = newIntent;
        
        // Set up new task based on intent
        switch (newIntent) {
            case 'block_card':
                context.state.phase = 'information_gathering';
                context.state.requiredFields = ['cardId'];
                return "I understand you want to block your card instead. I can help you with that for security. Please provide your card ID or last 4 digits of your card.";
                
            case 'apply_loan':
                context.state.phase = 'information_gathering';
                context.state.requiredFields = ['loanType', 'amount', 'tenure'];
                return "I see you want to apply for a loan instead. I can help you with that. What type of loan are you looking for? We offer personal, home, car, and education loans.";
                
            case 'send_money':
                context.state.phase = 'information_gathering';
                context.state.requiredFields = ['toAccountNumber', 'amount', 'description'];
                return "I understand you want to transfer money instead. I can help you with that. Please provide the recipient's account number.";
                
            case 'check_balance':
                context.state.phase = 'execution';
                context.state.requiredFields = [];
                return "I see you want to check your balance instead. Let me get that information for you right away.";
                
            case 'get_mini_statement':
                context.state.phase = 'execution';
                context.state.requiredFields = [];
                return "I understand you want to see your transaction history instead. Let me retrieve your recent transactions.";
                
            case 'raise_complaint':
                context.state.phase = 'information_gathering';
                context.state.requiredFields = ['subject', 'description', 'category'];
                return "I see you want to file a complaint instead. I can help you with that. What is the subject of your complaint?";
                
            case 'search_banking_context':
                context.state.phase = 'execution';
                context.state.requiredFields = [];
                context.state.collectedFields = { query: userMessage };
                return "I understand you want information about HSBC banking. Let me search our documentation for you.";
                
            default:
                return "I understand you want to do something different. How can I help you?";
        }
    }
    
    private handleLoanInformationGathering(context: ConversationContext, userMessage: string): string {
        const collected = context.state.collectedFields;
        
        // Collect loan type
        if (!collected.loanType) {
            const loanTypes = ['personal', 'home', 'car', 'education'];
            const userInput = userMessage.toLowerCase();
            
            if (loanTypes.some(type => userInput.includes(type))) {
                const detectedType = loanTypes.find(type => userInput.includes(type));
                collected.loanType = detectedType;
                console.log('✅ Collected loan type:', detectedType);
                return `Great! You want a ${detectedType} loan. What is the loan amount you need?`;
            } else {
                return "Please specify the type of loan you want: personal, home, car, or education.";
            }
        }
        
        // Collect amount
        if (!collected.amount) {
            const amount = this.extractAmount(userMessage);
            if (amount) {
                collected.amount = amount;
                console.log('✅ Collected amount:', amount);
                return `Perfect! You want a ${collected.loanType} loan for ${amount}. What is your preferred loan tenure in months?`;
            } else {
                return "Please provide the loan amount (e.g., 50000, 5 lakh, etc.).";
            }
        }
        
        // Collect tenure
        if (!collected.tenure) {
            const tenure = this.extractTenure(userMessage);
            if (tenure) {
                collected.tenure = tenure;
                console.log('✅ Collected tenure:', tenure);
                context.state.phase = 'confirmation';
                return `Thank you! Let me confirm your loan details:\n- Type: ${collected.loanType} loan\n- Amount: ${collected.amount}\n- Tenure: ${tenure} months\n\nShall I proceed with your loan application?`;
            } else {
                return "Please provide the loan tenure in months (e.g., 36, 60, etc.).";
            }
        }
        
        return "All information collected. Ready for confirmation.";
    }
    
    private handleTransferInformationGathering(context: ConversationContext, userMessage: string): string {
        const collected = context.state.collectedFields;
        
        if (!collected.toAccountNumber) {
            // Extract account number pattern
            const accountMatch = userMessage.match(/\b[A-Z]{3}\d{3,}\b|\b\d{8,}\b/);
            if (accountMatch) {
                collected.toAccountNumber = accountMatch[0];
                return `Account number ${accountMatch[0]} noted. What amount would you like to transfer?`;
            } else {
                return "Please provide the recipient's account number.";
            }
        }
        
        if (!collected.amount) {
            const amount = this.extractAmount(userMessage);
            if (amount) {
                collected.amount = amount;
                return `Transfer amount ${amount} noted. Please provide a description for this transfer.`;
            } else {
                return "Please specify the transfer amount.";
            }
        }
        
        if (!collected.description) {
            collected.description = userMessage;
            context.state.phase = 'confirmation';
            return `Transfer details:\n- To: ${collected.toAccountNumber}\n- Amount: ${collected.amount}\n- Description: ${collected.description}\n\nShall I proceed with the transfer?`;
        }
        
        return "All information collected.";
    }
    
    private handleCardInformationGathering(context: ConversationContext, userMessage: string): string {
        const collected = context.state.collectedFields;
        
        if (!collected.cardId) {
            // Extract card ID or number
            const cardMatch = userMessage.match(/\b\d{4}\b|\bcard[_-]?\d+\b/i) || [userMessage.trim()];
            if (cardMatch[0]) {
                collected.cardId = cardMatch[0];
                context.state.phase = 'confirmation';
                return `I will block card: ${cardMatch[0]}\n\nShall I proceed with blocking this card?`;
            } else {
                return "Please provide your card ID or last 4 digits of your card.";
            }
        }
        
        return "Card information collected.";
    }
    
    private handleComplaintInformationGathering(context: ConversationContext, userMessage: string): string {
        const collected = context.state.collectedFields;
        
        if (!collected.subject) {
            collected.subject = userMessage;
            return "Thank you. Please provide a detailed description of your complaint.";
        }
        
        if (!collected.description) {
            collected.description = userMessage;
            return "What category does this complaint fall under? (billing, service, technical, or general)";
        }
        
        if (!collected.category) {
            const categories = ['billing', 'service', 'technical', 'general'];
            const userInput = userMessage.toLowerCase();
            const category = categories.find(cat => userInput.includes(cat)) || 'general';
            
            collected.category = category;
            context.state.phase = 'confirmation';
            return `Complaint details:\n- Subject: ${collected.subject}\n- Description: ${collected.description}\n- Category: ${category}\n\nShall I file this complaint for you?`;
        }
        
        return "Complaint information collected.";
    }
    
    private extractAmount(text: string): number | null {
        // Extract amount from text (handle various formats)
        const patterns = [
            /(\d+)\s*lakh/i,
            /(\d+)\s*k/i,
            /(\d+)/
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                let amount = parseInt(match[1]);
                if (text.toLowerCase().includes('lakh')) {
                    amount *= 100000;
                } else if (text.toLowerCase().includes('k')) {
                    amount *= 1000;
                }
                return amount;
            }
        }
        return null;
    }
    
    private extractTenure(text: string): number | null {
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    private async handleConfirmation(context: ConversationContext, userMessage: string): Promise<string> {
        console.log('✅ Handling confirmation for:', context.currentIntent);
        
        // Check if user wants to switch to a different task during confirmation
        const intentSwitch = this.checkForIntentSwitch(userMessage);
        if (intentSwitch && intentSwitch !== context.currentIntent) {
            console.log('🔄 Intent switch detected during confirmation from', context.currentIntent, 'to', intentSwitch);
            return this.switchToNewIntent(context, userMessage, intentSwitch);
        }
        
        const confirmWords = ['yes', 'confirm', 'proceed', 'ok', 'sure', 'y'];
        const cancelWords = ['no', 'cancel', 'stop', 'n'];
        
        const userInput = userMessage.toLowerCase();
        
        if (confirmWords.some(word => userInput.includes(word))) {
            console.log('✅ User confirmed, moving to execution phase');
            context.state.phase = 'execution';
            
            // Now execute the function
            return await this.processWithFunctionCalling(context, userMessage, undefined);
            
        } else if (cancelWords.some(word => userInput.includes(word))) {
            console.log('❌ User cancelled operation');
            context.state.phase = 'greeting';
            context.state.collectedFields = {};
            return "Operation cancelled. Is there anything else I can help you with?";
            
        } else {
            return "Please confirm if you'd like me to proceed (yes/no), or let me know if you want to do something else.";
        }
    }

    private async handleExecution(context: ConversationContext, userMessage: string): Promise<string> {
        return "Executing your request...";
    }

    private async handleCompletion(context: ConversationContext, userMessage: string): Promise<string> {
        context.state.phase = 'intent_detection';
        return "Is there anything else I can help you with today?";
    }

    private async handleGeneral(context: ConversationContext, userMessage: string): Promise<string> {
        return "I'm here to help with your banking needs. What would you like to do today?";
    }

    private getMissingRequiredFields(context: ConversationContext): string[] {
        return context.state.requiredFields.filter(field => !(field in context.state.collectedFields));
    }

    private async generateConfirmationMessage(context: ConversationContext): Promise<string> {
        return `Please confirm that you'd like to proceed with ${context.currentIntent}.`;
    }

    private async generateInformationGatheringMessage(context: ConversationContext, field: string): Promise<string> {
        return `I need to know your ${field} to help you with this request.`;
    }

    /**
     * Set banking tools configuration
     */
    setBankingToolsConfig(config: { enableMockData?: boolean; authToken?: string }): void {
        if (config.enableMockData !== undefined) {
            this.bankingTools.setMockDataEnabled(config.enableMockData);
        }
        if (config.authToken) {
            this.bankingTools.setAuthToken(config.authToken);
        }
    }

    /**
     * Update authentication token
     */
    setAuthToken(authToken: string): void {
        this.bankingTools.setAuthToken(authToken);
    }

    /**
     * Get conversation context
     */
    getConversationContext(conversationId: string): ConversationContext | undefined {
        return this.conversations.get(conversationId);
    }

    /**
     * Clear conversation
     */
    clearConversation(conversationId: string): void {
        this.conversations.delete(conversationId);
    }
}

export default EnhancedConversationOrchestrator;
