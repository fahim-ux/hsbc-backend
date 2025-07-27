# HSBC Banking Backend API

A comprehensive banking assistant backend built with TypeScript, Fastify, and SQLite. This API provides JWT-based authentication and all essential banking operations for a digital banking assistant.

## Features

- **JWT Authentication** - Secure session-based authentication
- **Account Management** - Balance inquiry, account details, mini statements
- **Card Operations** - Block/unblock cards, request new cards
- **Loan Services** - Apply for loans, check loan status
- **Money Transfer** - Send money, transaction history, cancel transactions
- **Customer Support** - Raise complaints, track complaint status
- **General Services** - View offers, find branches/ATMs

## API Endpoints

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

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd hsbc-backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The server will start on `http://localhost:3000`

### Build and Production

\`\`\`bash
# Build the project
npm run build

# Start production server
npm start
\`\`\`

## Authentication

All endpoints (except login and health check) require JWT authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Default Test Users

The system comes with pre-configured test users:

| Username | Password | Account Number | Balance |
|----------|----------|----------------|---------|
| john_doe | password123 | ACC001 | $10,000 |
| jane_smith | password123 | ACC002 | $25,000 |

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/documentation`
- API Root: `http://localhost:3000`

## Example Usage

### 1. Login
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
\`\`\`

### 2. Get Account Balance
\`\`\`bash
curl -X GET http://localhost:3000/api/v1/account/balance \\
  -H "Authorization: Bearer <your-jwt-token>"
\`\`\`

### 3. Send Money
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/transaction/send \\
  -H "Authorization: Bearer <your-jwt-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "toAccountNumber": "ACC002",
    "amount": 100,
    "description": "Transfer to Jane"
  }'
\`\`\`

### 4. Block a Card
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/card/block \\
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
