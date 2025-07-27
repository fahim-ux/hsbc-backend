# HSBC Banking System - Complete Full-Stack Application

A comprehensive AI-powered banking assistant with both backend API and frontend chat interface. Built with TypeScript, Fastify, Next.js, and Google Gemini AI for intelligent conversational banking.

## 🏗️ System Architecture

### Backend (Port 8080)
- **Fastify + TypeScript** - High-performance REST API
- **JWT Authentication** - Secure session management  
- **SQLite Database** - Local banking data storage
- **RAG Vector Search** - AI-powered document search
- **15+ Banking APIs** - Complete banking operations

### Frontend (Port 3000)
- **Next.js 15.4.4 + React 19** - Modern web interface
- **Google Gemini AI** - Conversational banking assistant
- **Real-time Chat** - Interactive banking conversations
- **Function Calling** - AI-driven banking operations
- **Responsive Design** - Mobile-first banking interface

## 🚀 Complete Setup Guide

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hsbc-backend
```

### 2. Backend Setup

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
Create `.env` file in the root directory:
```env
# Server Configuration
PORT=8080
HOST=0.0.0.0
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters

# CORS Settings
CORS_ORIGIN=*

# API Configuration
API_PREFIX=/api/v1
```

#### Start Backend Server
```bash
# Development mode (recommended)
npm run dev

# Or production mode
npm run build
npm start
```

✅ **Backend Ready**: `http://localhost:8080`
📚 **API Documentation**: `http://localhost:8080/documentation`

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd frontend
```

#### Install Frontend Dependencies
```bash
npm install
```

#### Frontend Environment Configuration
Create `.env.local` file in the `frontend` directory:
```env
# Google AI (Gemini) API Key - Required for AI chat
NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key_here

# Backend API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

#### Get Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the API key to your `.env.local` file

#### Start Frontend Application
```bash
# Development mode
npm run dev

# Or production mode
npm run build
npm start
```

✅ **Frontend Ready**: `http://localhost:3000`

## 🧪 Testing the Complete System

### Test Credentials
```
Username: john_doe
Password: password
Account: ACC001
Balance: $10,000

Username: jane_smith  
Password: password
Account: ACC002
Balance: $25,000
```

### Quick Test Steps

1. **Open Frontend**: Navigate to `http://localhost:3000`
2. **Login**: Use test credentials above
3. **Start Chatting**: Try these sample requests:
   - "What's my account balance?"
   - "I want to apply for a personal loan"
   - "Send $500 to account ACC002"
   - "Block my card"
   - "Show me recent transactions"
   - "What types of loans do you offer?"

### Manual API Testing
```bash
# Test login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "password"}'

# Test balance (replace TOKEN with JWT from login response)
curl -X GET http://localhost:8080/api/v1/account/balance \
  -H "Authorization: Bearer TOKEN"
```

## 📱 Available Features

### Backend API Endpoints

| Feature | Endpoint | Method | Purpose |
|---------|----------|--------|---------|
| **Authentication** | | | |
| Login | `/api/v1/auth/login` | POST | User login with JWT token |
| Verify Token | `/api/v1/auth/verify` | GET | Verify JWT token validity |
| **Account Management** | | | |
| Account Balance | `/api/v1/account/balance` | GET | Get account balance |
| Mini Statement | `/api/v1/account/mini-statement` | GET | Fetch recent transactions |
| Account Info | `/api/v1/account/details` | GET | Get account holder info |
| **Card Operations** | | | |
| Block Card | `/api/v1/card/block` | POST | Block debit/credit card |
| Unblock Card | `/api/v1/card/unblock` | POST | Unblock a card |
| Request New Card | `/api/v1/card/request` | POST | Request new debit/credit card |
| List Cards | `/api/v1/card/list` | GET | Get user's cards |
| **Loan Services** | | | |
| Apply Loan | `/api/v1/loan/apply` | POST | Submit loan application |
| Loan Status | `/api/v1/loan/status` | GET | Check status of loans |
| **Transactions** | | | |
| Send Money | `/api/v1/transaction/send` | POST | Make a transaction |
| Transaction History | `/api/v1/transaction/history` | GET | View past transfers |
| Cancel Transaction | `/api/v1/transaction/cancel` | POST | Cancel a transfer |
| **Support** | | | |
| Raise Complaint | `/api/v1/support/complaint` | POST | File a support issue |
| Track Complaint | `/api/v1/support/complaint/:id` | GET | Track complaint by ID |
| List Complaints | `/api/v1/support/complaints` | GET | Get user's complaints |
| **General** | | | |
| List Offers | `/api/v1/offers` | GET | Get banking offers |
| List Branches | `/api/v1/branches` | GET | Nearest ATMs/branches |
| Health Check | `/api/v1/health` | GET | API health status |

| **RAG System** | | | |
| Upload Documents | `/api/v1/rag/documents` | POST | Add documents to vector DB |
| Search Context | `/api/v1/rag/search` | POST | Semantic search for banking info |
| Get Statistics | `/api/v1/rag/stats` | GET | Vector database statistics |
| Delete Documents | `/api/v1/rag/documents` | DELETE | Remove specific documents |
| Clear Database | `/api/v1/rag/all` | DELETE | Clear entire vector database |

### Frontend Chat Features
- **AI-Powered Conversations** - Natural language banking interactions
- **Intent Detection** - Automatic recognition of banking requests
- **Function Calling** - AI directly executes banking operations
- **Context Management** - Maintains conversation state and history
- **Real-time Responses** - Immediate feedback for all operations
- **Quick Actions** - Pre-defined banking shortcuts
- **Responsive Design** - Works on desktop and mobile devices

## 🔧 Development Commands

### Backend Commands
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm run test        # Run test suite (if available)
npm run lint        # Run ESLint
```

### Frontend Commands (in frontend/ directory)
```bash
npm run dev          # Start Next.js development server
npm run build        # Build production bundle
npm start           # Start production server
npm run lint        # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Protected Routes** - Authentication middleware for all banking operations
- **CORS Configuration** - Configurable cross-origin request handling
- **Input Validation** - Joi schema validation for all API inputs
- **Error Handling** - Sanitized error responses without sensitive data

## 🗄️ Database Schema

### SQLite Tables
- **users** - User authentication and profile data
- **accounts** - Account information and balances
- **transactions** - Transaction history and status
- **cards** - Card details and status
- **loans** - Loan applications and status
- **complaints** - Support tickets and tracking
- **offers** - Banking offers and promotions
- **branches** - Branch locations and services

### Vector Database (JSON)
- **Document Chunks** - Processed text segments with embeddings
- **Metadata** - Document categories and processing information
- **Search Index** - Optimized for cosine similarity search

## 🚀 Deployment

### Production Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
JWT_SECRET=super-secure-production-jwt-secret-minimum-32-characters
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_production_gemini_api_key
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api/v1
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

## 🧪 Testing & Validation

### Automated Testing Scripts
```bash
# Test authentication and basic operations
npx tsx test-auth-and-doc.ts

# Test RAG system with document processing
npx tsx create-embeddings.ts

# Test complete RAG workflow
npx tsx test-rag.ts

# Test login functionality
npx tsx test-login.ts
```

### Health Checks
- **Backend Health**: `GET http://localhost:8080/api/v1/health`
- **Frontend Status**: `GET http://localhost:3000`
- **Database Status**: Automatic validation on server startup
- **AI Integration**: Validated during first chat interaction

## 📋 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if port 8080 is available
netstat -an | findstr :8080

# Clear database and restart (Windows)
Remove-Item -Path "banking.db" -Force
npm run dev
```

#### Frontend Can't Connect to Backend
1. Verify backend is running on `http://localhost:8080`
2. Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Verify CORS settings in backend `.env`

#### Login Fails
1. Ensure database has been recreated with correct password hashes
2. Try test credentials: `john_doe` / `password`
3. Check browser console for authentication errors

#### AI Chat Not Working
1. Verify `NEXT_PUBLIC_GEMINI_API_KEY` is set correctly
2. Check Google AI Studio API key is active
3. Ensure backend RAG endpoints are accessible

## 📚 Documentation

### Available Documentation Files
- `COMPLETE-SYSTEM-DOCUMENTATION.md` - Comprehensive system architecture
- `SYSTEM-DOCUMENTATION.md` - Detailed API and component documentation
- `API_DOCUMENTATION.md` - API endpoint specifications
- `FRONTEND_API_SPECIFICATION.md` - Frontend integration guide

### Interactive Documentation
- **Swagger UI**: `http://localhost:8080/documentation`
- **API Testing**: Built-in request/response testing
- **Schema Validation**: Live API validation and examples

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is part of the HSBC Hackathon submission.

---

## Quick Reference

### System URLs
- **Backend API**: `http://localhost:8080`
- **Frontend App**: `http://localhost:3000`
- **API Documentation**: `http://localhost:8080/documentation`
- **Health Check**: `http://localhost:8080/api/v1/health`

### Test Credentials
```

### Sample Conversation Examples
Try these natural language requests in the frontend chat:
- "What's my current balance?"
- "I need to apply for a home loan for $200,000"
- "Send $1,000 to account ACC002 for rent payment"
- "My card is lost, please block it"
- "Show me my last 5 transactions"
- "What are the interest rates for personal loans?"
- "I have a problem with my online banking"

### System Status
- ✅ **Backend**: REST API with 20+ endpoints
- ✅ **Frontend**: AI-powered chat interface  
- ✅ **Authentication**: JWT-based security
- ✅ **RAG System**: Vector search with 15 document chunks
- ✅ **Database**: SQLite with sample banking data
- ✅ **AI Integration**: Google Gemini with function calling

---

**🏗️ System Architecture**: Full-stack TypeScript application  
**🤖 AI Engine**: Google Gemini 2.5 Flash with RAG capabilities  
**🔐 Security**: JWT authentication with bcrypt password hashing  
**📱 Interface**: Responsive chat-based banking assistant  
**🚀 Deployment**: Ready for production with Docker support
  -H "Authorization: Bearer <your-jwt-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "cardId": "card-1"
  }'
\`\`\`

## Project Structure

\`\`\`
src/
├── database/           # Database operations and models
├── middleware/         # Custom middleware (auth, validation)
├── routes/            # API route handlers
├── schemas/           # Validation schemas
├── services/          # Business logic services
├── types/             # TypeScript type definitions
└── index.ts           # Main server entry point
\`\`\`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Server port | 3000 |
| DATABASE_URL | SQLite database path | sqlite:./banking.db |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRES_IN | JWT expiration time | 24h |
| API_PREFIX | API path prefix | /api/v1 |
| CORS_ORIGIN | CORS allowed origins | * |

## Database Schema

The application uses SQLite with the following main tables:
- **users** - User accounts and authentication
- **accounts** - Bank account details
- **transactions** - Transaction history
- **cards** - Debit/credit card information
- **loans** - Loan applications and status
- **complaints** - Customer support tickets
- **offers** - Banking offers and promotions
- **branches** - Bank branch/ATM locations

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests

### Adding New Features

1. Create service in `src/services/`
2. Add routes in `src/routes/`
3. Update types in `src/types/`
4. Add validation schemas in `src/schemas/`

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation
- SQL injection prevention
- CORS protection
- Request rate limiting (can be added)

## Error Handling

The API returns consistent error responses:

\`\`\`json
{
  "error": "Error message",
  "details": "Additional error details (development only)"
}
\`\`\`

HTTP Status Codes:
- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 404: Not Found
- 500: Internal Server Error

## Testing

Test the API using:
- Swagger UI at `/documentation`
- Postman collection (can be generated from Swagger)
- curl commands (examples above)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Repository Issues](link-to-issues)
- Email: support@hsbc-banking-api.com

---

**Note**: This is a demo banking API for educational purposes. Do not use in production without proper security audits and compliance reviews.
