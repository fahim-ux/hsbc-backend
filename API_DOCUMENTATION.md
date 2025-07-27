# HSBC Banking Assistant Backend

A comprehensive banking API backend built with TypeScript, Fastify, and JWT authentication. This API serves as the backend for a banking assistant that can be used by LLMs as tools.

## Features

- **JWT Session-based Authentication**
- **Account Management** (Balance, Details, Mini Statement)
- **Card Operations** (Block/Unblock, Request New Card)
- **Loan Services** (Apply, Status Check)
- **Transaction Management** (Send Money, History, Cancel)
- **Support System** (Complaints, Tracking)
- **Banking Information** (Offers, Branches)
- **SQLite Database** with sample data
- **Swagger Documentation**
- **CORS Support**
- **TypeScript** for type safety

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

4. **Access the API**
   - API Base URL: `http://localhost:3000/api/v1`
   - Documentation: `http://localhost:3000/documentation`

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=sqlite:./banking.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
API_PREFIX=/api/v1
CORS_ORIGIN=*
```

## Sample Users

The system comes with pre-loaded sample users for testing:

| Username | Password | Account Number | Balance |
|----------|----------|----------------|---------|
| john_doe | password | ACC001 | $10,000 |
| jane_smith | password | ACC002 | $25,000 |

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/verify` | GET | Verify JWT token |

**Login Request:**
```json
{
  "username": "john_doe",
  "password": "password"
}
```

**Login Response:**
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

### Account Management

| Endpoint | Method | Description | Purpose |
|----------|--------|-------------|---------|
| `/api/v1/account/balance` | GET | Get account balance | Get account balance |
| `/api/v1/account/mini-statement` | GET | Fetch recent transactions | Fetch recent transactions |
| `/api/v1/account/details` | GET | Get account holder info | Get account holder info |

### Card Operations

| Endpoint | Method | Description | Purpose |
|----------|--------|-------------|---------|
| `/api/v1/card/block` | POST | Block debit/credit card | Block debit/credit card |
| `/api/v1/card/unblock` | POST | Unblock a card | Unblock a card |
| `/api/v1/card/request` | POST | Request new debit/credit card | Request new debit/credit card |
| `/api/v1/card/list` | GET | Get user's cards | List all user cards |

**Block/Unblock Card Request:**
```json
{
  "cardId": "card-1"
}
```

**Request New Card:**
```json
{
  "cardType": "debit" // or "credit"
}
```

### Loan Services

| Endpoint | Method | Description | Purpose |
|----------|--------|-------------|---------|
| `/api/v1/loan/apply` | POST | Submit loan application | Apply loan |
| `/api/v1/loan/status` | GET | Check status of loan | Loan status |

**Loan Application Request:**
```json
{
  "loanType": "personal", // "personal", "home", "car", "education"
  "amount": 100000,
  "tenure": 36 // months
}
```

### Transaction Management

| Endpoint | Method | Description | Purpose |
|----------|--------|-------------|---------|
| `/api/v1/transaction/send` | POST | Make a transaction | Send money |
| `/api/v1/transaction/history` | GET | View past transfers | Transaction history |
| `/api/v1/transaction/cancel` | POST | Cancel a transfer | Cancel transaction |

**Send Money Request:**
```json
{
  "toAccountNumber": "ACC002",
  "amount": 1000,
  "description": "Payment for services"
}
```

**Cancel Transaction Request:**
```json
{
  "transactionId": "transaction-id-here"
}
```

### Support System

| Endpoint | Method | Description | Purpose |
|----------|--------|-------------|---------|
| `/api/v1/support/complaint` | POST | File a support issue | Raise complaint |
| `/api/v1/support/complaint/:id` | GET | Track complaint by ID | Track complaint |
| `/api/v1/support/complaints` | GET | Get all user complaints | List complaints |

**Raise Complaint Request:**
```json
{
  "subject": "Card transaction issue",
  "description": "My card was charged twice for the same transaction",
  "category": "transaction", // "transaction", "card", "loan", "account", "general"
  "priority": "medium" // "low", "medium", "high", "urgent" (optional)
}
```

### Banking Information

| Endpoint | Method | Description | Purpose |
|----------|--------|-------------|---------|
| `/api/v1/offers` | GET | Get banking offers | List offers |
| `/api/v1/branches` | GET | Nearest ATMs/branches | List branches |
| `/api/v1/health` | GET | API health check | Health check |

## Authentication

All endpoints (except `/auth/login` and `/health`) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this consistent format:

```json
{
  "success": true/false,
  "message": "Description of the result",
  "data": {
    // Response data (when applicable)
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Database Schema

The application uses SQLite with the following main tables:

- **users** - User account information
- **accounts** - Bank account details
- **transactions** - Transaction records
- **cards** - Debit/Credit card information
- **loans** - Loan applications and status
- **complaints** - Support complaints
- **offers** - Banking offers and promotions
- **branches** - Branch and ATM locations

## Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Project Structure

```
src/
├── types/           # TypeScript type definitions
├── database/        # Database connection and operations
├── services/        # Business logic services
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── schemas/         # Validation schemas
└── index.ts         # Main application entry point
```

## Testing the API

You can test the API using tools like:

- **Postman** - Import the API collection
- **curl** - Command line testing
- **Swagger UI** - Interactive documentation at `/documentation`

### Example curl requests:

1. **Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "password"}'
```

2. **Get Balance:**
```bash
curl -X GET http://localhost:3000/api/v1/account/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Send Money:**
```bash
curl -X POST http://localhost:3000/api/v1/transaction/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"toAccountNumber": "ACC002", "amount": 100, "description": "Test transfer"}'
```

## Security Notes

- Change the default JWT secret in production
- Use HTTPS in production
- Implement rate limiting for production use
- Add input validation and sanitization
- Use environment variables for sensitive configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
