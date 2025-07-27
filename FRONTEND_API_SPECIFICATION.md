# HSBC Banking API - Complete Input/Output Specification

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints (except login and health) require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### 🔐 POST /auth/login
**Purpose**: User authentication
**Input Format**:
```json
{
  "username": "string (required, 3-50 chars)",
  "password": "string (required, min 6 chars)"
}
```
**Sample Request**:
```json
{
  "username": "john_doe",
  "password": "password"
}
```
**Success Response**:
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

### 🔐 GET /auth/verify
**Purpose**: Verify JWT token validity
**Input**: JWT token in header only
**Headers Required**:
```
Authorization: Bearer <jwt_token>
```

---

## 2. ACCOUNT MANAGEMENT ENDPOINTS

### 🏦 GET /account/balance
**Purpose**: Get account balance
**Input**: JWT token in header only
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "balance": 10000,
    "accountNumber": "ACC001"
  },
  "message": "Account balance retrieved successfully"
}
```

### 🏦 GET /account/mini-statement
**Purpose**: Get recent transactions (last 5)
**Input**: JWT token in header only
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn-1",
        "amount": 1000,
        "type": "debit",
        "description": "Transfer to ACC002",
        "status": "completed",
        "createdAt": "2025-01-27T10:30:00Z"
      }
    ]
  },
  "message": "Mini statement retrieved successfully"
}
```

### 🏦 GET /account/details
**Purpose**: Get complete account holder information
**Input**: JWT token in header only
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-1",
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "phoneNumber": "1234567890"
    },
    "account": {
      "id": "acc-1",
      "accountNumber": "ACC001",
      "accountType": "savings",
      "balance": 10000,
      "currency": "USD"
    }
  },
  "message": "Account details retrieved successfully"
}
```

---

## 3. CARD MANAGEMENT ENDPOINTS

### 💳 POST /card/block
**Purpose**: Block a debit/credit card
**Input Format**:
```json
{
  "cardId": "string (required)"
}
```
**Sample Request**:
```json
{
  "cardId": "card-1"
}
```

### 💳 POST /card/unblock
**Purpose**: Unblock a card
**Input Format**:
```json
{
  "cardId": "string (required)"
}
```
**Sample Request**:
```json
{
  "cardId": "card-1"
}
```

### 💳 POST /card/request
**Purpose**: Request new debit/credit card
**Input Format**:
```json
{
  "cardType": "string (required: 'debit' | 'credit')"
}
```
**Sample Request**:
```json
{
  "cardType": "debit"
}
```
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "cardId": "card-new-123"
  },
  "message": "New debit card requested successfully. You will receive it within 7-10 business days."
}
```

### 💳 GET /card/list
**Purpose**: Get all user's cards
**Input**: JWT token in header only
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "card-1",
        "cardNumber": "4532-1234-5678-9012",
        "cardType": "debit",
        "isBlocked": false,
        "isActive": true,
        "expiryDate": "2027-12-31",
        "cardLimit": 5000
      }
    ]
  },
  "message": "Cards retrieved successfully"
}
```

---

## 4. LOAN SERVICES ENDPOINTS

### 🏠 POST /loan/apply
**Purpose**: Submit loan application
**Input Format**:
```json
{
  "loanType": "string (required: 'personal' | 'home' | 'car' | 'education')",
  "amount": "number (required, positive)",
  "tenure": "number (required, 1-360 months)"
}
```
**Sample Request**:
```json
{
  "loanType": "personal",
  "amount": 100000,
  "tenure": 36
}
```
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "loanId": "loan-123"
  },
  "message": "Personal loan application submitted successfully. You will receive a response within 2-3 business days."
}
```

### 🏠 GET /loan/status
**Purpose**: Check status of all user loans
**Input**: JWT token in header only
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "loans": [
      {
        "id": "loan-1",
        "loanType": "personal",
        "amount": 100000,
        "interestRate": 10.5,
        "tenure": 36,
        "status": "pending",
        "applicationDate": "2025-01-27T10:00:00Z"
      }
    ]
  },
  "message": "Loan status retrieved successfully"
}
```

---

## 5. TRANSACTION MANAGEMENT ENDPOINTS

### 💸 POST /transaction/send
**Purpose**: Send money to another account
**Input Format**:
```json
{
  "toAccountNumber": "string (required)",
  "amount": "number (required, positive)",
  "description": "string (optional, max 255 chars)"
}
```
**Sample Request**:
```json
{
  "toAccountNumber": "ACC002",
  "amount": 1000,
  "description": "Payment for services"
}
```
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": "txn-123"
  },
  "message": "Transaction completed successfully"
}
```

### 💸 GET /transaction/history
**Purpose**: Get transaction history
**Input**: JWT token in header + optional query parameter
**Query Parameters**:
```
?limit=number (optional, default: 10)
```
**Sample URL**:
```
GET /transaction/history?limit=20
```
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn-1",
        "fromAccountId": "acc-1",
        "toAccountId": null,
        "amount": 1000,
        "type": "debit",
        "description": "Transfer to ACC002",
        "reference": "TXN1737965432",
        "status": "completed",
        "createdAt": "2025-01-27T10:30:00Z"
      }
    ]
  },
  "message": "Transaction history retrieved successfully"
}
```

### 💸 POST /transaction/cancel
**Purpose**: Cancel a pending transaction
**Input Format**:
```json
{
  "transactionId": "string (required)"
}
```
**Sample Request**:
```json
{
  "transactionId": "txn-123"
}
```

---

## 6. SUPPORT SYSTEM ENDPOINTS

### 🎧 POST /support/complaint
**Purpose**: File a support complaint
**Input Format**:
```json
{
  "subject": "string (required, 5-200 chars)",
  "description": "string (required, 10-1000 chars)",
  "category": "string (required: 'transaction' | 'card' | 'loan' | 'account' | 'general')",
  "priority": "string (optional: 'low' | 'medium' | 'high' | 'urgent', default: 'medium')"
}
```
**Sample Request**:
```json
{
  "subject": "Card transaction issue",
  "description": "My card was charged twice for the same transaction on 2025-01-27",
  "category": "transaction",
  "priority": "high"
}
```
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "complaintId": "complaint-123"
  },
  "message": "Complaint raised successfully. Your complaint ID is complaint-123. We will respond within 24-48 hours."
}
```

### 🎧 GET /support/complaint/:id
**Purpose**: Track specific complaint by ID
**Input**: 
- JWT token in header
- Complaint ID in URL path
**Sample URL**:
```
GET /support/complaint/complaint-123
```
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "complaint": {
      "id": "complaint-123",
      "subject": "Card transaction issue",
      "description": "My card was charged twice...",
      "category": "transaction",
      "priority": "high",
      "status": "open",
      "createdAt": "2025-01-27T10:00:00Z"
    }
  },
  "message": "Complaint details retrieved successfully"
}
```

### 🎧 GET /support/complaints
**Purpose**: Get all user complaints
**Input**: JWT token in header only
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "id": "complaint-1",
        "subject": "Card issue",
        "category": "card",
        "priority": "medium",
        "status": "resolved",
        "createdAt": "2025-01-25T10:00:00Z"
      }
    ]
  },
  "message": "Complaints retrieved successfully"
}
```

---

## 7. BANKING INFORMATION ENDPOINTS

### 🎁 GET /offers
**Purpose**: Get current banking offers
**Input**: JWT token in header only
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "offers": [
      {
        "id": "offer-1",
        "title": "Personal Loan at 8.5%",
        "description": "Get personal loan at attractive interest rate",
        "category": "loan",
        "validFrom": "2025-01-01",
        "validTo": "2025-12-31",
        "isActive": true,
        "termsAndConditions": "Minimum salary requirement applies"
      }
    ]
  },
  "message": "Offers retrieved successfully"
}
```

### 🏢 GET /branches
**Purpose**: Get branch and ATM locations
**Input**: JWT token in header only
**Sample Response**:
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "id": "branch-1",
        "name": "HSBC Main Branch",
        "address": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "pincode": "10001",
        "phoneNumber": "555-0123",
        "email": "mainbranch@hsbc.com",
        "workingHours": "9:00 AM - 5:00 PM",
        "services": ["Banking", "Loans", "Cards", "Investment"],
        "hasATM": true
      }
    ]
  },
  "message": "Branches retrieved successfully"
}
```

---

## 8. UTILITY ENDPOINTS

### ❤️ GET /health
**Purpose**: API health check (no authentication required)
**Input**: No input required
**Sample Response**:
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2025-01-27T12:00:00.000Z"
}
```

---

## ERROR RESPONSES

All endpoints return consistent error format:

### 400 - Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 - Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 - Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Error details (in development mode only)"
}
```

---

## SAMPLE WORKFLOW FOR FRONTEND

### 1. User Login Flow
```javascript
// 1. Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'password'
  })
});

const { token } = await loginResponse.json();

// 2. Store token for subsequent requests
localStorage.setItem('authToken', token);
```

### 2. Authenticated Request Flow
```javascript
// Use token in all subsequent requests
const authHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
};

// Get account balance
const balanceResponse = await fetch('/api/v1/account/balance', {
  headers: authHeaders
});

// Send money
const transferResponse = await fetch('/api/v1/transaction/send', {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    toAccountNumber: 'ACC002',
    amount: 1000,
    description: 'Payment'
  })
});
```

---

## TEST CREDENTIALS

Use these credentials for testing:

| Username | Password | Account Number | Balance |
|----------|----------|----------------|---------|
| john_doe | password | ACC001 | $10,000 |
| jane_smith | password | ACC002 | $25,000 |

This specification provides all the exact input formats, validation rules, and response formats that the frontend needs to integrate properly with the banking API.
