# HSBC Banking API - Complete System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Authentication](#authentication)
5. [Banking API Endpoints](#banking-api-endpoints)
6. [RAG (Retrieval-Augmented Generation) System](#rag-system)
7. [Database Schema](#database-schema)
8. [Error Handling](#error-handling)
9. [Deployment](#deployment)
10. [Testing](#testing)

## System Overview

The HSBC Banking API is a comprehensive backend system built with **Fastify** and **TypeScript** that provides:

- **Complete Banking Operations**: Account management, transactions, cards, loans, and customer support
- **JWT Authentication**: Secure session-based authentication system
- **RAG Vector Database**: AI-powered document search and context retrieval
- **Real-time Logging**: Comprehensive request/response tracking
- **Swagger Documentation**: Interactive API documentation
- **SQLite Database**: Local data persistence with sample banking data

### Key Features
- 🏦 **15+ Banking Endpoints** covering all major banking operations
- 🤖 **AI-Powered RAG System** for intelligent document search
- 🔐 **JWT Authentication** with secure token management
- 📚 **Interactive API Documentation** with Swagger UI
- 🚀 **High Performance** with Fastify framework
- 📊 **Comprehensive Logging** for debugging and monitoring
- 🗄️ **Embedded SQLite Database** with sample data

## Architecture

### Technology Stack
```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│              (Web, Mobile, AI Assistants)              │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/HTTPS
                      │
┌─────────────────────▼───────────────────────────────────┐
│                 Fastify Server                          │
│                   (Port 8080)                          │
├─────────────────────────────────────────────────────────┤
│  • CORS Support     • JWT Authentication               │
│  • Request Logging  • Error Handling                   │
│  • Swagger Docs     • TypeScript                       │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼─────┐
│    Banking   │ │   RAG    │ │  General  │
│   Services   │ │ Services │ │ Services  │
│              │ │          │ │           │
│ • Auth       │ │ • Vector │ │ • Health  │
│ • Accounts   │ │   DB     │ │ • Offers  │
│ • Cards      │ │ • Embed  │ │ • Branches│
│ • Loans      │ │ • Search │ │           │
│ • Transactions│ │         │ │           │
│ • Support    │ │          │ │           │
└──────┬───────┘ └────┬─────┘ └───────────┘
       │              │
┌──────▼───────┐ ┌────▼─────┐
│   SQLite     │ │  Vector  │
│  Database    │ │Database  │
│              │ │ (JSON)   │
│ • Users      │ │          │
│ • Accounts   │ │ • Docs   │
│ • Transactions│ │ • Embeds │
│ • Cards      │ │ • Meta   │
│ • Loans      │ │          │
│ • Complaints │ │          │
└──────────────┘ └──────────┘
```

### System Components

#### 1. **Fastify Server** (`src/index.ts`)
- Main application server with middleware configuration
- JWT authentication setup
- Route registration and error handling
- Request/response logging
- Swagger documentation setup

#### 2. **Banking Services**
- **Authentication Service**: User login and token management
- **Account Service**: Balance, statements, account details
- **Card Service**: Block/unblock, request new cards, list cards
- **Loan Service**: Apply for loans, check status
- **Transaction Service**: Send money, view history, cancel transactions
- **Support Service**: Raise and track complaints

#### 3. **RAG System** (`src/services/vector.service.ts`)
- **Vector Database**: JSON-based storage for document embeddings
- **Embedding Model**: Xenova/all-MiniLM-L6-v2 for text vectorization
- **Semantic Search**: Cosine similarity-based document retrieval
- **Document Management**: Add, search, delete, and statistics

#### 4. **Database Layer**
- **SQLite Database**: Local persistence with sample data
- **Vector Storage**: JSON file-based vector database
- **Data Models**: TypeScript interfaces for type safety

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TypeScript knowledge

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd hsbc-backend

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Environment Configuration
Create a `.env` file:
```env
PORT=8080
HOST=0.0.0.0
JWT_SECRET=your-secure-jwt-secret-key
CORS_ORIGIN=*
API_PREFIX=/api/v1
NODE_ENV=development
```

### Server Startup
```bash
🚀 HSBC Banking API Server running on http://0.0.0.0:8080
📚 API Documentation available at http://0.0.0.0:8080/documentation

🧪 Test Credentials:
   Username: john_doe   | Password: password
   Username: jane_smith | Password: password
```

## Authentication

### JWT Token System
The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid token.

#### Login Process
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password"
}
```

#### Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1",
    "username": "john_doe",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Using the Token
Include in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Test Accounts
```
Username: john_doe    | Password: password | Account: ACC-001
Username: jane_smith  | Password: password | Account: ACC-002
```

## Banking API Endpoints

### Authentication Endpoints

#### POST `/api/v1/auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "john_doe",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {...}
}
```

### Account Management

#### GET `/api/v1/account/balance`
Get current account balance.
- **Auth Required**: Yes
- **Response**: Current balance and account details

#### GET `/api/v1/account/mini-statement`
Get recent transactions (last 10).
- **Auth Required**: Yes  
- **Response**: List of recent transactions

#### GET `/api/v1/account/details`
Get complete account information.
- **Auth Required**: Yes
- **Response**: Full account details including personal info

### Card Management

#### POST `/api/v1/card/block`
Block a credit/debit card.
- **Auth Required**: Yes
- **Body**: `{"cardNumber": "1234-5678-9012-3456", "reason": "lost"}`

#### POST `/api/v1/card/unblock`
Unblock a previously blocked card.
- **Auth Required**: Yes
- **Body**: `{"cardNumber": "1234-5678-9012-3456"}`

#### POST `/api/v1/card/request`
Request a new credit/debit card.
- **Auth Required**: Yes
- **Body**: `{"cardType": "credit", "deliveryAddress": "address"}`

#### GET `/api/v1/card/list`
List all user's cards with status.
- **Auth Required**: Yes
- **Response**: Array of user's cards

### Loan Services

#### POST `/api/v1/loan/apply`
Apply for a loan.
- **Auth Required**: Yes
- **Body**: 
```json
{
  "loanType": "personal",
  "amount": 50000,
  "purpose": "home improvement",
  "employmentDetails": {...}
}
```

#### GET `/api/v1/loan/status`
Check status of loan applications.
- **Auth Required**: Yes
- **Response**: List of loan applications with status

### Transaction Services

#### POST `/api/v1/transaction/send`
Send money to another account.
- **Auth Required**: Yes
- **Body**:
```json
{
  "toAccount": "ACC-002", 
  "amount": 1000,
  "purpose": "payment"
}
```

#### GET `/api/v1/transaction/history`
Get transaction history with pagination.
- **Auth Required**: Yes
- **Query Params**: `page`, `limit`

#### POST `/api/v1/transaction/cancel`
Cancel a pending transaction.
- **Auth Required**: Yes
- **Body**: `{"transactionId": "TXN-123"}`

### Support Services

#### POST `/api/v1/support/complaint`
Raise a customer complaint.
- **Auth Required**: Yes
- **Body**:
```json
{
  "category": "card_issues",
  "priority": "high", 
  "description": "Card not working"
}
```

#### GET `/api/v1/support/complaint/:id`
Track complaint status.
- **Auth Required**: Yes
- **Response**: Complaint details and status

### General Services

#### GET `/api/v1/offers`
Get current banking offers and promotions.
- **Auth Required**: No
- **Response**: List of available offers

#### GET `/api/v1/branches`
Find nearby bank branches.
- **Auth Required**: No
- **Query Params**: `city`, `limit`

#### GET `/api/v1/health`
Health check endpoint.
- **Auth Required**: No
- **Response**: Server status and version

## RAG System

### Overview
The RAG (Retrieval-Augmented Generation) system provides AI-powered document search and context retrieval for customer service and information queries.

### Features
- **Document Embedding**: Converts text to vector embeddings using `Xenova/all-MiniLM-L6-v2`
- **Semantic Search**: Find relevant content based on meaning, not just keywords
- **Document Management**: Add, update, delete, and organize documents
- **Metadata Support**: Rich metadata for better organization and filtering
- **Real-time Processing**: Fast embedding generation and search

### RAG API Endpoints

#### POST `/api/v1/rag/documents` ⚡ **No Auth Required**
Add documents to the vector database.

**Request:**
```json
{
  "documents": [
    {
      "text": "HSBC offers various types of savings accounts...",
      "metadata": {
        "category": "banking_products",
        "type": "account_info",
        "title": "Savings Accounts"
      }
    }
  ],
  "source": "knowledge_base"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully added 5 document chunks",
  "data": {
    "document_ids": ["doc_123_chunk_0", "doc_123_chunk_1"],
    "total_chunks": 5,
    "processing_time_ms": 1250
  }
}
```

#### POST `/api/v1/rag/search` 🔐 **Auth Required**
Search for relevant document chunks.

**Request:**
```json
{
  "query": "What are the interest rates for home loans?",
  "top_k": 5,
  "threshold": 0.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Found 3 relevant document chunks",
  "data": {
    "query": "What are the interest rates for home loans?",
    "results": [
      {
        "id": "doc_123_chunk_1",
        "text": "Current rates start from 3.75% for 30-year fixed mortgages...",
        "similarity": 0.887,
        "metadata": {
          "category": "loans_and_financing",
          "section": "Home Loans"
        }
      }
    ],
    "total_results": 3,
    "search_time_ms": 45
  }
}
```

#### GET `/api/v1/rag/stats` 🔐 **Auth Required**
Get vector database statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_chunks": 25,
    "model": "Xenova/all-MiniLM-L6-v2",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T14:22:15.000Z",
    "sample_chunks": [...]
  }
}
```

#### DELETE `/api/v1/rag/documents` 🔐 **Auth Required**
Delete specific document chunks.

#### DELETE `/api/v1/rag/all` 🔐 **Auth Required**
Clear entire vector database.

### RAG Usage Example

#### For AI Assistant Integration:
```javascript
// 1. User asks a question
const userQuery = "What documents do I need for a business loan?";

// 2. Search for relevant context
const response = await fetch('/api/v1/rag/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: userQuery,
    top_k: 3,
    threshold: 0.5
  })
});

const context = await response.json();

// 3. Combine context with user query for LLM
const prompt = `
Context: ${context.data.results.map(r => r.text).join('\n\n')}

Question: ${userQuery}

Please answer based on the provided context.
`;

// 4. Send to your LLM (OpenAI, Claude, etc.)
```

### Pre-loaded Knowledge Base
The system comes with comprehensive HSBC banking information including:
- **Account Types**: Savings, checking, premier accounts
- **Credit Cards**: Features, benefits, fees, rewards
- **Loans**: Personal, home, auto, business loans
- **Interest Rates**: Current rates for all products
- **Processes**: Application procedures, requirements
- **Digital Services**: Online banking, mobile app features
- **Customer Support**: Contact information, procedures

## Database Schema

### SQLite Database Tables

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Accounts Table
```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  account_number TEXT UNIQUE,
  account_type TEXT,
  balance REAL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  from_account TEXT,
  to_account TEXT,
  amount REAL,
  type TEXT,
  purpose TEXT,
  status TEXT DEFAULT 'completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Cards Table
```sql
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  card_number TEXT,
  card_type TEXT,
  status TEXT DEFAULT 'active',
  expiry_date TEXT,
  credit_limit REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Vector Database Schema (JSON)
```json
{
  "chunks": [
    {
      "id": "doc_123_chunk_0",
      "text": "Document content...",
      "metadata": {
        "document_type": "hsbc_bank_info",
        "section": "Loan Products",
        "category": "loans_and_financing",
        "processed_at": "2025-01-15T10:30:00.000Z"
      },
      "embedding": [0.1, 0.2, 0.3, ...]
    }
  ],
  "model": "Xenova/all-MiniLM-L6-v2",
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-01-15T14:22:15.000Z"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **404**: Not Found
- **500**: Internal Server Error

### Common Error Scenarios

#### Authentication Errors
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token"
}
```

#### Validation Errors
```json
{
  "success": false,
  "message": "Validation error: amount must be greater than 0"
}
```

#### Business Logic Errors
```json
{
  "success": false,
  "message": "Insufficient balance for transaction"
}
```

## Deployment

### Development
```bash
npm run dev    # Watch mode with tsx
npm run build  # TypeScript compilation
npm start      # Production mode
```

### Production Deployment
1. **Environment Setup**:
   ```env
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=your-secure-production-secret
   ```

2. **Build Process**:
   ```bash
   npm install --production
   npm run build
   npm start
   ```

3. **Docker Deployment** (optional):
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   RUN npm run build
   EXPOSE 8080
   CMD ["npm", "start"]
   ```

### Monitoring and Logging
- **Request Logging**: All HTTP requests are logged with timestamps
- **Authentication Logging**: Login attempts and token validation
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response times and processing duration

## Testing

### Manual Testing
1. **API Documentation**: Visit `http://localhost:8080/documentation`
2. **Health Check**: `GET http://localhost:8080/api/v1/health`
3. **Authentication**: Use provided test credentials

### Test Scripts
```bash
# Test authentication and basic operations
npx tsx test-auth-and-doc.ts

# Test RAG system with document processing
npx tsx create-embeddings.ts

# Test complete RAG workflow
npx tsx test-rag.ts
```

### Sample Test Requests

#### Login Test
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "password"}'
```

#### Balance Check
```bash
curl -X GET http://localhost:8080/api/v1/account/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### RAG Search Test
```bash
curl -X POST http://localhost:8080/api/v1/rag/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "What are the interest rates for home loans?",
    "top_k": 3,
    "threshold": 0.5
  }'
```

### Load Testing
For production readiness, consider testing with tools like:
- **Artillery**: Load testing
- **Jest**: Unit testing
- **Postman**: API testing collections

## API Versioning and Future Updates

### Current Version: v1
- All endpoints are prefixed with `/api/v1`
- Backward compatibility maintained
- New features added without breaking changes

### Planned Features
- [ ] Real-time notifications via WebSocket
- [ ] Advanced transaction categorization
- [ ] Multi-factor authentication
- [ ] Analytics and reporting endpoints
- [ ] Integration with external payment systems
- [ ] Enhanced RAG with multiple embedding models

## Security Considerations

### Current Security Measures
- **JWT Authentication**: Secure token-based authentication
- **CORS Configuration**: Configurable cross-origin requests
- **Input Validation**: Joi schema validation for all inputs
- **Error Handling**: No sensitive information in error responses
- **Password Hashing**: bcrypt for password security

### Production Security Recommendations
- Use HTTPS in production
- Implement rate limiting
- Add API key authentication for external integrations
- Regular security audits
- Database encryption for sensitive data
- Environment variable protection

---

## Quick Reference

### Server Information
- **Base URL**: `http://localhost:8080`
- **API Version**: v1
- **Documentation**: `/documentation`
- **Health Check**: `/api/v1/health`

### Test Credentials
```
john_doe / password (Account: ACC-001)
jane_smith / password (Account: ACC-002)
```

### Key Endpoints Summary
```
Auth:         POST /api/v1/auth/login
Account:      GET  /api/v1/account/{balance,mini-statement,details}
Cards:        POST /api/v1/card/{block,unblock,request}
              GET  /api/v1/card/list
Loans:        POST /api/v1/loan/apply
              GET  /api/v1/loan/status
Transactions: POST /api/v1/transaction/{send,cancel}
              GET  /api/v1/transaction/history
Support:      POST /api/v1/support/complaint
              GET  /api/v1/support/complaint/:id
RAG:          POST /api/v1/rag/{documents,search}
              GET  /api/v1/rag/stats
              DELETE /api/v1/rag/{documents,all}
General:      GET  /api/v1/{offers,branches,health}
```

For detailed API specifications, visit the interactive documentation at `/documentation` when the server is running.
