# HSBC Banking System - Complete Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture & Component Breakdown](#architecture--component-breakdown)
3. [Agent Behavior & Flow Design](#agent-behavior--flow-design)
4. [Fallback & Context Handling](#fallback--context-handling)
5. [Limitations and Potential Enhancements](#limitations-and-potential-enhancements)

---

## System Overview

### Technology Stack
- **Backend**: Fastify + TypeScript + SQLite + Vector DB (JSON)
- **Frontend**: Next.js 15.4.4 + React 19 + TypeScript + Tailwind CSS
- **AI Engine**: Google Gemini 2.5 Flash with Function Calling
- **RAG System**: @xenova/transformers with Xenova/all-MiniLM-L6-v2
- **Authentication**: JWT tokens with bcrypt password hashing

### Core Features
- **15+ Banking APIs**: Complete CRUD operations for accounts, cards, loans, transactions
- **AI-Powered Chat**: Conversational banking with intent detection and function calling
- **RAG Knowledge Base**: Vector search for banking information and policies
- **Real-time Processing**: Immediate API responses with fallback mechanisms
- **Secure Authentication**: JWT-based session management with protected routes

---

## Architecture & Component Breakdown

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HSBC Banking System                          │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js + TypeScript)                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │    Auth     │ │    Chat     │ │   Banking   │ │    RAG      │  │
│  │   Context   │ │ Interface   │ │  Services   │ │  Service    │  │
│  │ - JWT Mgmt  │ │ - Messages  │ │ - API Calls │ │ - Vector    │  │
│  │ - Sessions  │ │ - Intent    │ │ - Functions │ │ - Search    │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  AI Layer (Google Gemini)                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ Conversation│ │   Intent    │ │  Function   │ │   Context   │  │
│  │Orchestrator │ │ Classifier  │ │   Calling   │ │  Manager    │  │
│  │ - Flow Ctrl │ │ - Keywords  │ │ - Banking   │ │ - State     │  │
│  │ - Phases    │ │ - Switching │ │ - Tools     │ │ - History   │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  Backend API (Fastify + TypeScript)                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │    Auth     │ │   Banking   │ │     RAG     │ │   General   │  │
│  │   Routes    │ │   Routes    │ │   Routes    │ │   Routes    │  │
│  │ - Login     │ │ - Accounts  │ │ - Upload    │ │ - Health    │  │
│  │ - Verify    │ │ - Cards     │ │ - Search    │ │ - Offers    │  │
│  │             │ │ - Loans     │ │ - Stats     │ │ - Branches  │  │
│  │             │ │ - Txns      │ │             │ │             │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  Data Layer                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │   SQLite    │ │   Vector    │ │    Auth     │ │    Mock     │  │
│  │  Database   │ │  Database   │ │  Service    │ │    Data     │  │
│  │ - Users     │ │ - Embeddings│ │ - JWT       │ │ - Fallback  │  │
│  │ - Accounts  │ │ - Metadata  │ │ - bcrypt    │ │ - Testing   │  │
│  │ - Txns      │ │ - Cosine    │ │             │ │             │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Backend Components

#### 1. **API Layer** (Port 8080)
```typescript
// Main server with comprehensive routing
src/
├── index.ts                 # Fastify server + middleware
├── routes/
│   ├── auth.routes.ts      # JWT authentication
│   ├── account.routes.ts   # Balance, statements, details
│   ├── card.routes.ts      # Block, unblock, request, list
│   ├── loan.routes.ts      # Apply, status checking
│   ├── transaction.routes.ts # Send money, history, cancel
│   ├── support.routes.ts   # Complaints, tracking
│   ├── rag.routes.ts       # Vector search, upload
│   └── general.routes.ts   # Health, offers, branches
├── services/               # Business logic
└── database/              # SQLite + Vector DB
```

#### 2. **Authentication System**
```typescript
class AuthService {
  async login(username: string, password: string): Promise<User | null> {
    const user = await this.db.getUserByUsername(username);
    const isValidPassword = await bcrypt.compare(password, user.password);
    return isValidPassword ? user : null;
  }
}
```

#### 3. **RAG Vector System**
```typescript
class VectorService {
  private model = "Xenova/all-MiniLM-L6-v2";
  
  async generateEmbedding(text: string): Promise<number[]> {
    const pipe = await pipeline('feature-extraction', this.model);
    return await pipe(text);
  }
  
  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    // Cosine similarity search
    return this.findSimilarChunks(queryEmbedding, topK);
  }
}
```

### Frontend Components

#### 1. **Chat Interface**
```typescript
// Main conversational UI with real-time messaging
export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId] = useState(() => generateId());
  
  const handleSendMessage = async (content: string) => {
    const result = await orchestrator.processMessage(
      conversationId, user?.id, content, token
    );
    setMessages(prev => [...prev, userMsg, botMsg]);
  };
}
```

#### 2. **Conversation Orchestrator**
```typescript
class EnhancedConversationOrchestrator {
  async processMessage(conversationId: string, userId: string, 
                      userMessage: string, authToken?: string): Promise<Response> {
    
    const context = this.getOrCreateContext(conversationId, userId);
    
    // Check for intent switching
    const newIntent = this.checkForIntentSwitch(userMessage);
    if (newIntent) return this.switchToNewIntent(context, newIntent);
    
    // Process based on current phase
    switch (context.state.phase) {
      case 'greeting': return this.handleIntentDetection(context, userMessage);
      case 'information_gathering': return this.handleInformationGathering(context, userMessage);
      case 'confirmation': return this.handleConfirmation(context, userMessage);
      case 'execution': return this.processWithFunctionCalling(context, userMessage, authToken);
    }
  }
}
```

#### 3. **Banking Function Integration**
```typescript
class BankingToolsIntegration {
  getBankingFunctionDeclarations(): FunctionDeclaration[] {
    return [
      { name: "check_balance", description: "Get account balance" },
      { name: "send_money", description: "Transfer money to another account",
        parameters: { toAccountNumber: "string", amount: "number", description: "string" }},
      { name: "apply_loan", description: "Submit loan application",
        parameters: { loanType: "string", amount: "number", tenure: "number" }},
      { name: "block_card", description: "Block a card",
        parameters: { cardId: "string" }},
      { name: "get_mini_statement", description: "Get recent transactions" },
      { name: "raise_complaint", description: "Submit support complaint",
        parameters: { subject: "string", description: "string", category: "string" }},
      { name: "search_banking_context", description: "Search banking information",
        parameters: { query: "string" }}
    ];
  }
}
```

---

## Agent Behavior & Flow Design

### Conversation Flow Phases

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GREETING  │───▶│   INTENT    │───▶│INFORMATION  │───▶│CONFIRMATION │
│             │    │ DETECTION   │    │ GATHERING   │    │             │
│ "Hello!"    │    │ "send money"│    │ "To which   │    │ "Send $500  │
│ "Welcome"   │    │ "check bal" │    │  account?"  │    │  to ACC002?"│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                   │                   │
                           │                   │                   ▼
                           │                   │           ┌─────────────┐
                           │                   │           │  EXECUTION  │
                           │                   │           │             │
                           │                   │           │ Call API    │
                           │                   │           │ Show Result │
                           │                   │           └─────────────┘
                           │                   │                   │
                           │                   │                   ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   GENERAL   │    │   CONTEXT   │    │ COMPLETION  │
                   │             │    │   SEARCH    │    │             │
                   │ Fallback    │    │ RAG Query   │    │ "Transfer   │
                   │ Responses   │    │ for Info    │    │  Complete!" │
                   └─────────────┘    └─────────────┘    └─────────────┘
```

### Intent Detection Strategy

#### 1. **Keyword-Based Classification**
```typescript
const BANKING_INTENTS = {
  apply_loan: ['loan', 'apply', 'credit', 'borrow', 'financing'],
  check_balance: ['balance', 'money', 'account', 'funds'],
  send_money: ['transfer', 'send', 'pay', 'payment'],
  block_card: ['card', 'block', 'freeze', 'stop'],
  get_mini_statement: ['statement', 'transactions', 'history'],
  raise_complaint: ['complaint', 'issue', 'problem', 'help'],
  search_banking_context: ['information', 'details', 'rules', 'policies']
};
```

#### 2. **Multi-Intent Support**
```typescript
private checkForIntentSwitch(userMessage: string): string | null {
  const messageLower = userMessage.toLowerCase();
  
  for (const [intent, keywords] of Object.entries(BANKING_INTENTS)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      return intent;
    }
  }
  return null;
}
```

#### 3. **Context-Aware Responses**
```typescript
private generatePhaseResponse(intent: string, phase: string, data?: any): string {
  const templates = {
    send_money: {
      information_gathering: "I need the recipient's account number and amount to transfer.",
      confirmation: `Confirm: Send $${data.amount} to account ${data.toAccountNumber}?`,
      completion: "Money transfer completed successfully!"
    },
    apply_loan: {
      information_gathering: "What type of loan and amount do you need?",
      confirmation: `Confirm: ${data.loanType} loan for $${data.amount}, ${data.tenure} months?`,
      completion: "Loan application submitted successfully!"
    }
  };
  
  return templates[intent]?.[phase] || this.getDefaultResponse(intent, phase);
}
```

### Function Calling Workflow

#### 1. **AI-Driven Function Selection**
```typescript
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: userMessage }] }],
  tools: [{ functionDeclarations: this.bankingTools.getBankingFunctionDeclarations() }]
});

const functionCall = result.response.functionCalls()?.[0];
if (functionCall) {
  const executionResult = await this.bankingTools.executeBankingFunction(
    functionCall, authToken
  );
}
```

#### 2. **Real API Integration**
```typescript
async executeBankingFunction(functionCall: BankingFunctionCall, authToken?: string): Promise<BankingExecutionResult> {
  const { name, args } = functionCall;
  
  try {
    // Try real API first
    const result = await this.executeRealFunction(name, args, authToken);
    return { functionName: name, success: true, data: result };
  } catch (apiError) {
    // Fallback to mock data if enabled
    if (this.enableMockData) {
      const mockResult = this.getMockResponse(name, args);
      return { functionName: name, success: true, data: mockResult, 
               message: "Using demo data - " + this.getSuccessMessage(name, args, mockResult) };
    }
    throw apiError;
  }
}
```

---

## Fallback & Context Handling

### Multi-Level Fallback Strategy

#### 1. **API-Level Fallbacks**
```typescript
// Primary → Mock → Error Message
try {
  result = await realAPI.call(endpoint, data);
} catch (networkError) {
  if (mockDataEnabled) {
    result = mockData.getResponse(endpoint);
    showWarning("Using demo data");
  } else {
    throw new UserFriendlyError("Service temporarily unavailable");
  }
}
```

#### 2. **Authentication Fallbacks**
```typescript
// Token validation → Refresh → Re-login → Logout
async validateRequest(token: string): Promise<boolean> {
  try {
    return await this.verifyToken(token);
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      return await this.refreshToken();
    }
    this.forceLogout();
    return false;
  }
}
```

#### 3. **Conversation Fallbacks**
```typescript
// AI Response → Template → Generic
private getResponseWithFallback(intent: string, phase: string, context: any): string {
  try {
    return this.generateAIResponse(intent, phase, context);
  } catch (aiError) {
    const template = this.getTemplateResponse(intent, phase);
    return template || "I'm having trouble understanding. Can you rephrase that?";
  }
}
```

### Context Management

#### 1. **Conversation State**
```typescript
interface ConversationContext {
  id: string;                           // Unique conversation ID
  userId: string;                       // Authenticated user
  currentIntent?: string;               // Active banking operation
  state: {
    phase: ConversationPhase;           // Current flow phase
    requiredFields: string[];           // Fields needed
    collectedFields: Record<string, any>; // User inputs
    pendingClarifications: string[];    // Missing info
  };
  entities: Record<string, any>;        // Extracted entities
  taskProgress: TaskProgress;           // Operation progress
  messages: Message[];                  // Conversation history
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. **Context Persistence**
```typescript
class ConversationContextManager {
  private conversations = new Map<string, ConversationContext>();
  
  getOrCreateContext(conversationId: string, userId: string): ConversationContext {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, this.createNewContext(conversationId, userId));
    }
    return this.conversations.get(conversationId)!;
  }
  
  updateContext(conversationId: string, updates: Partial<ConversationContext>): void {
    const context = this.conversations.get(conversationId);
    if (context) {
      Object.assign(context, updates);
      context.updatedAt = new Date();
    }
  }
}
```

#### 3. **Error Recovery**
```typescript
class ErrorRecoveryManager {
  handleConversationError(error: any, context: ConversationContext): string {
    this.logError(error, context);
    
    // Attempt state recovery
    if (this.canRecoverState(context)) {
      return this.recoverAndContinue(context);
    }
    
    // Reset to safe state
    this.resetToSafeState(context);
    return "Let me start over. How can I help you today?";
  }
}
```

---

## Limitations and Potential Enhancements

### Current Limitations

#### 1. **Technical Constraints**
- **Intent Detection**: Keyword-based (not ML-based) classification
- **Context Window**: Limited to recent messages for AI processing
- **Session Storage**: No persistent conversation history across browser sessions
- **Single Language**: English-only interface
- **Offline Support**: Requires internet connection for all operations

#### 2. **Functional Constraints**
- **Batch Operations**: No support for multiple transactions simultaneously
- **Real-time Updates**: No live notifications for transaction status
- **Advanced Analytics**: No spending insights or pattern analysis
- **Multi-Account**: Single account operations only
- **Voice Interface**: Text-only interaction

#### 3. **Security Constraints**
- **Client-Side Storage**: JWT tokens in localStorage
- **Session Timeout**: No automatic logout on inactivity
- **Audit Trail**: Limited logging of user actions
- **Input Sanitization**: Basic validation without advanced security

### Potential Enhancements

#### Phase 1: Immediate Improvements (1-2 months)

**Enhanced Security**
```typescript
// Secure token management with auto-refresh
class SecureAuthManager {
  private refreshToken(): Promise<string>;
  private autoLogoutOnInactivity(timeoutMinutes: number): void;
  private encryptTokenStorage(token: string): void;
}
```

**ML-Based Intent Detection**
```typescript
// Replace keyword matching with ML classification
class MLIntentClassifier {
  async classifyIntent(message: string): Promise<{
    intent: string;
    confidence: number;
    entities: ExtractedEntity[];
  }>;
}
```

**Real-time Notifications**
```typescript
// WebSocket integration for live updates
class RealtimeNotificationService {
  onTransactionUpdate(callback: (update: TransactionUpdate) => void): void;
  onAccountActivity(callback: (activity: AccountActivity) => void): void;
}
```

#### Phase 2: Advanced Features (3-6 months)

**Multi-Language Support**
```typescript
interface LocalizedBankingSystem {
  supportedLanguages: ['en', 'es', 'fr', 'de', 'hi'];
  processMessage(message: string, language: string): Promise<LocalizedResponse>;
}
```

**Voice Interface**
```typescript
class VoiceBankingInterface {
  startVoiceRecording(): Promise<string>;
  synthesizeSpeech(text: string): Promise<AudioBuffer>;
  processVoiceCommand(audio: Blob): Promise<ConversationResponse>;
}
```

**Advanced Analytics**
```typescript
class BankingInsights {
  generateSpendingPatterns(userId: string): Promise<SpendingInsights>;
  provideBudgetingAdvice(transactions: Transaction[]): Promise<BudgetAdvice>;
  detectAnomalousActivity(userId: string): Promise<SecurityAlert[]>;
}
```

#### Phase 3: Enterprise Features (6-12 months)

**AI Risk Assessment**
```typescript
class AIRiskEngine {
  assessTransactionRisk(transaction: Transaction): Promise<RiskScore>;
  detectFraudPatterns(userId: string): Promise<FraudAnalysis>;
  calculateCreditScore(userProfile: UserProfile): Promise<CreditAssessment>;
}
```

**Blockchain Integration**
```typescript
class BlockchainBanking {
  createImmutableTransactionRecord(tx: Transaction): Promise<BlockchainReceipt>;
  executeSmartLoanContract(terms: LoanTerms): Promise<ContractResult>;
  validateTransactionIntegrity(txId: string): Promise<ValidationResult>;
}
```

**Advanced RAG System**
```typescript
class EnhancedRAGService {
  // Multi-modal search (text, images, documents)
  searchMultiModal(query: MultiModalQuery): Promise<EnhancedResults>;
  
  // Personalized recommendations
  getPersonalizedBankingAdvice(userId: string): Promise<PersonalizedAdvice>;
  
  // Real-time regulatory updates
  syncComplianceUpdates(): Promise<ComplianceUpdate[]>;
}
```

---

### Implementation Roadmap

| Timeline | Focus Area | Key Deliverables |
|----------|------------|------------------|
| **Month 1-2** | Security & UX | Token encryption, auto-logout, ML intent detection |
| **Month 3-4** | Real-time Features | WebSocket notifications, live transaction updates |
| **Month 5-6** | Internationalization | Multi-language support, voice interface |
| **Month 7-9** | AI Enhancement | Advanced analytics, personalized insights |
| **Month 10-12** | Enterprise Integration | Blockchain, advanced risk assessment, compliance |

---

## Quick Reference

### System URLs
- **Backend API**: `http://localhost:8080`
- **Frontend App**: `http://localhost:3000`
- **API Docs**: `http://localhost:8080/documentation`
- **Health Check**: `http://localhost:8080/api/v1/health`

### Test Credentials
```
john_doe / password (Balance: $10,000, Account: ACC001)
jane_smith / password (Balance: $25,000, Account: ACC002)
```

### Environment Setup
```env
# Backend (.env)
PORT=8080
JWT_SECRET=your-secure-jwt-secret

# Frontend (.env.local)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

### Key Architecture Principles
- **Separation of Concerns**: Clear layer boundaries between UI, AI, Business Logic, and Data
- **Fallback Strategy**: Multiple levels of graceful degradation for robust operation
- **Type Safety**: Comprehensive TypeScript interfaces across all components
- **Modular Design**: Independent, testable components with dependency injection
- **Security First**: JWT authentication with proper validation and error handling

---

**Documentation Version**: 1.0  
**Last Updated**: January 27, 2025  
**System Status**: Production Ready
