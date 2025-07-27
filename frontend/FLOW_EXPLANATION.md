# HSBC Conversational AI Banking System - Flow Explanation

## 🔄 System Flow Overview

The HSBC Conversational AI Banking Assistant follows a sophisticated multi-phase conversation flow designed to handle complex banking tasks through natural language interaction. Here's how the entire system works:

## 🏗️ Architecture Flow

```
User Input → ChatInterface → ConversationOrchestrator → [Intent Classifier, Task Manager, Banking Service] → Response
```

## 📋 Detailed Component Flow

### 1. **Application Startup**

```
1. User visits the application
2. ChatInterface component loads
3. useEffect hook triggers initializeOrchestrator()
4. System reads NEXT_PUBLIC_GEMINI_API_KEY from environment
5. ConversationOrchestrator instance is created with API key
6. Welcome message is displayed
7. QuickActions are shown for easy access
```

### 2. **User Message Processing Pipeline**

When a user sends a message, here's the complete flow:

#### **Step 1: Message Reception**
```typescript
User types message → ChatInput component → handleSendMessage() → ConversationOrchestrator.processMessage()
```

#### **Step 2: Context Retrieval**
```typescript
// Get or create conversation context
let context = conversations.get(conversationId);
if (!context) {
    context = createNewConversation(conversationId, userId);
}
```

#### **Step 3: Phase-Based Processing**
The orchestrator determines the current conversation phase and routes accordingly:

```typescript
switch (context.state.phase) {
    case 'greeting': → handleGreeting()
    case 'intent_detection': → handleIntentDetection()
    case 'information_gathering': → handleInformationGathering()
    case 'confirmation': → handleConfirmation()
    case 'execution': → handleExecution()
    case 'completion': → handleCompletion()
}
```

## 🎯 Phase-by-Phase Flow

### **Phase 1: Greeting**
```
User Input: "Hello" or first message
↓
handleGreeting()
├── Detect if greeting or direct request
├── Set phase to 'intent_detection'
└── Return welcome message or process as intent
```

### **Phase 2: Intent Detection**
```
User Input: "I want to apply for a loan"
↓
handleIntentDetection()
├── Call IntentClassifier.classifyIntent()
│   ├── Send message + context to Gemini AI
│   ├── Get structured response with intent & entities
│   └── Extract banking task type and confidence
├── Store intent and entities in context
├── Initialize TaskManager configuration
├── Check if enough information collected
└── Route to information_gathering or confirmation
```

**Intent Classification Process:**
```
Input: "I need a $50,000 car loan"
↓ 
Gemini AI Analysis
↓
Output: {
    intent: "loan_application",
    confidence: 0.95,
    entities: {
        amount: "50000",
        purpose: "car"
    },
    clarificationNeeded: false
}
```

### **Phase 3: Information Gathering**
```
Missing fields detected
↓
handleInformationGathering()
├── Get TaskManager configuration for current task
├── Identify missing required fields
├── Ask for next missing field
├── Extract information from user response
├── Validate input using TaskManager.validateField()
├── Update context with collected data
└── Continue until all fields collected
```

**Example Flow for Loan Application:**
```
Required Fields: [amount, purpose, employmentStatus, monthlyIncome]

Step 1: "What's the purpose of the loan?" → User: "Home renovation"
Step 2: "What's your employment status?" → User: "Full-time employed"
Step 3: "What's your monthly income?" → User: "$5,000"
→ All fields collected, move to confirmation
```

### **Phase 4: Confirmation**
```
All information collected
↓
handleConfirmation()
├── Generate summary of collected information
├── Present confirmation message to user
├── Wait for user confirmation
├── If confirmed → move to execution
├── If denied → back to information_gathering
└── If unclear → ask for clarification
```

### **Phase 5: Execution**
```
User confirms information
↓
handleExecution()
├── Route to appropriate BankingService method
│   ├── submitLoanApplication()
│   ├── blockCard()
│   ├── getBalance()
│   ├── getTransactionHistory()
│   └── etc.
├── Execute backend task with mock data
├── Format results for user presentation
├── Set task as completed
└── Move to completion phase
```

### **Phase 6: Completion**
```
Task executed successfully
↓
handleCompletion()
├── Present results to user
├── Ask if user needs anything else
├── If new request → reset context and go to intent_detection
├── If satisfied → end conversation gracefully
└── Maintain context for potential follow-ups
```

## 🔧 Key System Components

### **ConversationOrchestrator**
- **Role**: Central brain coordinating all components
- **Responsibilities**: 
  - Manages conversation state and transitions
  - Routes messages to appropriate handlers
  - Maintains context across interactions
  - Handles error recovery and fallbacks

### **IntentClassifier**
- **Role**: Natural language understanding
- **Process**:
  1. Receives user message + conversation history
  2. Constructs prompt for Gemini AI
  3. Parses AI response into structured intent data
  4. Handles fallbacks for unclear intents

### **TaskManager**
- **Role**: Task-specific workflow management
- **Functions**:
  - Defines required fields for each banking task
  - Validates user input
  - Tracks progress through multi-step processes
  - Provides task-specific validation rules

### **BankingService**
- **Role**: Simulates real banking operations
- **Capabilities**:
  - Mock user data and accounts
  - Loan application processing
  - Card management operations
  - Transaction history retrieval
  - Real-time balance checking

## 🔄 Context Management

### **Conversation Context Structure**
```typescript
{
    id: "conversation-uuid",
    userId: "user123",
    currentIntent: "loan_application",
    state: {
        phase: "information_gathering",
        currentTask: "loan_application",
        requiredFields: ["amount", "purpose", "employmentStatus"],
        collectedFields: { amount: "50000", purpose: "car" },
        pendingClarifications: []
    },
    entities: { /* extracted entities */ },
    taskProgress: {
        taskType: "loan_application",
        step: 2,
        totalSteps: 4,
        completed: false,
        data: { /* task-specific data */ }
    },
    messages: [ /* all conversation messages */ ]
}
```

### **State Transitions**
```
greeting → intent_detection → information_gathering → confirmation → execution → completion
    ↑                                    ↓
    └── (new conversation) ←← ←← ←← ←← ←←←
```

## 🎨 UI Flow

### **Real-time Updates**
1. User types message in ChatInput
2. Message appears immediately in chat
3. Loading indicator shows while processing
4. Assistant response appears with typing animation
5. Sidebar updates with current context, progress, and collected data

### **Visual Context Indicators**
- **Phase badges**: Show current conversation phase
- **Progress bars**: Display task completion percentage
- **Collected fields**: Real-time view of gathered information
- **Required fields**: Checklist of what's still needed

## 🔀 Context Switching Example

```
User: "I want to apply for a loan"
→ System: Sets up loan application flow

User: "Actually, I need to block my card first"
→ System: Detects intent change, saves loan context, switches to card blocking

User: "Now back to the loan"
→ System: Can resume previous loan application context
```

## 🛡️ Error Handling Flow

```
Error Occurs
↓
Try-Catch Block
├── Log error details
├── Generate user-friendly error message
├── Reset to safe state (usually intent_detection)
├── Preserve user data when possible
└── Offer alternative actions
```

## 🚀 Performance Optimizations

1. **Lazy Loading**: Components load as needed
2. **Context Batching**: Multiple context updates batched together
3. **Message Streaming**: Large responses can be streamed
4. **Session Management**: Conversations stored in memory with cleanup
5. **API Debouncing**: Prevents rapid-fire API calls

## 🔧 Environment Configuration

The system now uses environment variables for configuration:

```bash
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

This eliminates the need for users to enter API keys and provides a more secure, production-ready setup.

## 🎯 Next Steps for Enhancement

1. **Database Integration**: Replace in-memory storage with persistent database
2. **User Authentication**: Add real user accounts and session management
3. **Real Banking APIs**: Integrate with actual banking services
4. **Advanced Analytics**: Track conversation patterns and success rates
5. **Multi-language Support**: Add internationalization capabilities
6. **Voice Interface**: Add speech-to-text and text-to-speech capabilities

This flow ensures that users have a natural, conversational experience while the system maintains the structure needed to complete complex banking tasks efficiently.
