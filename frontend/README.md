# HSBC Conversational AI Banking Assistant

A sophisticated conversational AI system for handling dynamic banking interactions including loan applications, card blocking, account queries, and more. Built with Next.js, TypeScript, and Google Gemini AI.

## 🚀 Features

### Core Capabilities
- **Multi-turn Conversation Management**: Maintains context across multiple interactions
- **Intent Classification**: Automatically detects user intent with high accuracy
- **Task-oriented Workflows**: Handles complex banking tasks step-by-step
- **Real-time Processing**: Instant responses with backend task execution
- **Context Switching**: Seamlessly handles topic changes mid-conversation
- **Ambiguity Resolution**: Asks clarifying questions when needed

### Banking Services Supported
1. **Loan Applications** - Complete loan application process with validation
2. **Card Management** - Block/unblock cards with security verification
3. **Account Inquiries** - Balance checks and account information
4. **Transaction History** - Detailed transaction records and analysis
5. **Account Statements** - Generate and deliver account statements
6. **Interest Rate Inquiries** - Current rates for various banking products
7. **General Banking** - Comprehensive banking information and support

### Technical Features
- **Modular Architecture**: Extensible and maintainable codebase
- **Type Safety**: Full TypeScript implementation
- **Real-time UI**: Responsive chat interface with live updates
- **State Management**: Sophisticated conversation state tracking
- **Error Handling**: Robust error recovery and user guidance
- **API Integration**: Mock banking services with realistic data

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Chat Interface (UI)                      │
├─────────────────────────────────────────────────────────────┤
│                Conversation Orchestrator                    │
├─────────────────────────────────────────────────────────────┤
│    Intent Classifier  │  Task Manager  │  Banking Service  │
├─────────────────────────────────────────────────────────────┤
│              Google Gemini AI Integration                   │
└─────────────────────────────────────────────────────────────┘
```

### Core Services

#### 1. Conversation Orchestrator (`src/services/conversationOrchestrator.ts`)
- **Purpose**: Central brain of the system
- **Responsibilities**:
  - Manages conversation flow and state
  - Coordinates between all services
  - Handles context switching and multi-turn interactions
  - Processes user messages through different phases

#### 2. Intent Classifier (`src/services/intentClassifier.ts`)
- **Purpose**: Understands user intent from natural language
- **Capabilities**:
  - Classifies messages into banking task categories
  - Extracts entities (amounts, dates, card types, etc.)
  - Determines when clarification is needed
  - Maintains conversation context for better accuracy

#### 3. Task Manager (`src/services/taskManager.ts`)
- **Purpose**: Manages task-specific workflows
- **Features**:
  - Defines task configurations and required fields
  - Tracks progress through multi-step processes
  - Validates user input for each task type
  - Handles task completion and transitions

#### 4. Banking Service (`src/services/bankingService.ts`)
- **Purpose**: Simulates real banking operations
- **Mock Services**:
  - User account management
  - Loan application processing
  - Card blocking/unblocking
  - Transaction history retrieval
  - Balance inquiries
  - Statement generation

## 🎯 Conversation Flow Design

### Phase-based Processing

1. **Greeting Phase**
   - Welcome message and introduction
   - Transition to intent detection

2. **Intent Detection**
   - Analyze user message for banking intent
   - Extract relevant entities
   - Request clarification if needed

3. **Information Gathering**
   - Collect required fields for the task
   - Validate input in real-time
   - Guide user through complex forms

4. **Confirmation**
   - Summarize collected information
   - Allow user to make corrections
   - Confirm before proceeding

5. **Execution**
   - Execute the banking task
   - Interact with backend services
   - Handle errors gracefully

6. **Completion**
   - Provide results and confirmations
   - Offer additional assistance
   - Reset for new conversations

### Context Management Strategy

- **Short-term Memory**: Last 5 messages for immediate context
- **Session State**: Complete conversation history and progress
- **Entity Persistence**: Collected information across conversation turns
- **Intent Switching**: Seamless transition between different banking tasks

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hsbc-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Getting a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and use it in the application

## 💡 Usage Examples

### Example Conversations

#### Loan Application
```
User: "I want to apply for a personal loan of $50,000"
Assistant: "I'd be happy to help you with a personal loan application. You mentioned $50,000 - what is the purpose of this loan?"
User: "Home renovation"
Assistant: "Great! For the home renovation loan, I'll need some additional information. What is your current employment status?"
...
```

#### Card Blocking
```
User: "My credit card was stolen"
Assistant: "I'm sorry to hear about your stolen credit card. I'll help you block it immediately. Can you provide the last four digits of the card?"
User: "1234"
Assistant: "I'll block your credit card ending in 1234 due to theft. Please confirm to proceed."
...
```

#### Balance Inquiry
```
User: "What's my account balance?"
Assistant: "I'll check your current account balance."
Assistant: "Your current account balance is: $15,420.50
Account Type: checking
Available Balance: $15,420.50"
```

### Quick Actions
The interface provides pre-configured quick actions for common tasks:
- Apply for Loan
- Block My Card  
- Check Balance
- Transaction History
- Account Statement
- Interest Rates

## 🔧 Configuration

### Task Configuration
Tasks are configured in `src/services/taskManager.ts` with:
- Required fields for each task type
- Validation rules and error messages
- Step-by-step workflow definitions
- Progress tracking mechanisms

### Banking Service Configuration
Mock data and business rules in `src/services/bankingService.ts`:
- User account data
- Transaction history
- Interest rates
- Approval/rejection logic

## 🚦 API Endpoints

### POST `/api/chat`
Process a chat message and return response with updated context.

**Request Body:**
```json
{
  "conversationId": "string",
  "userId": "string", 
  "message": "string",
  "apiKey": "string"
}
```

**Response:**
```json
{
  "response": "string",
  "context": {
    "id": "string",
    "state": { ... },
    "messages": [ ... ],
    "taskProgress": { ... }
  }
}
```

### DELETE `/api/chat?conversationId=<id>`
Clear conversation history and reset state.

## 🔍 Key Technical Decisions

### Why Google Gemini?
- Advanced natural language understanding
- Excellent intent classification capabilities
- Good context retention for multi-turn conversations
- Flexible prompt engineering support

### Why Next.js?
- Full-stack TypeScript support
- API routes for backend processing
- Excellent development experience
- Production-ready optimization

### State Management Approach
- In-memory conversation storage for demo purposes
- Easily extendable to database persistence
- Session-based orchestrator instances
- Real-time UI updates with React state

## 🔮 Future Enhancements

### Technical Improvements
- Database persistence for conversation history
- User authentication and session management
- Real banking API integrations
- Advanced analytics and monitoring
- Voice interface support
- Multi-language support

### Banking Features
- Investment portfolio management
- Mortgage applications and tracking
- Business banking services
- Customer service ticket creation
- Appointment scheduling
- Document upload and verification

### AI Enhancements
- Sentiment analysis for better user experience
- Predictive banking suggestions
- Fraud detection and alerts
- Personalized financial advice
- Learning from user interactions

## 🧪 Testing the System

### Test Scenarios

1. **Happy Path Testing**
   - Complete loan application process
   - Successful card blocking
   - Balance inquiry and transaction history

2. **Error Handling**
   - Invalid input validation
   - Missing required information
   - Network error recovery

3. **Context Switching**
   - Switch from loan application to card blocking
   - Handle interruptions gracefully
   - Maintain state across topic changes

4. **Edge Cases**
   - Very long conversations
   - Rapid message sending
   - Unclear or ambiguous requests

### Sample Test Prompts
```
"I need a $25,000 car loan but also want to block my debit card"
"What's my balance? Also, show me last month's transactions"
"Apply for loan" (test clarification)
"My card ending in 1234 was lost yesterday"
"I want to know about your services"
```

## 📱 Mobile Responsiveness
The interface is fully responsive and works seamlessly on:
- Desktop browsers
- Tablet devices  
- Mobile phones
- Progressive Web App capable

## 🔐 Security Considerations
- API key is stored client-side for demo purposes
- No persistent user data storage
- Mock banking data only
- Input validation and sanitization
- Error message sanitization

## 🤝 Contributing
This is a hackathon project, but future contributions could include:
- Additional banking services
- Enhanced UI/UX improvements
- Performance optimizations
- Security enhancements
- Test coverage expansion

## 📄 License
MIT License - See LICENSE file for details

## 👥 Team
Built for HSBC Hackathon 2025 - Demonstrating advanced conversational AI capabilities for modern banking.

---

**Note**: This is a proof-of-concept demo using mock banking services. In a production environment, proper security measures, authentication, and real banking API integrations would be required.
