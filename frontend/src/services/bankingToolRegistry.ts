/**
 * Banking API Tool Registry
 * Comprehensive registry of all available banking API endpoints and their configurations
 */

export interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  category: 'account' | 'card' | 'loan' | 'transaction' | 'support' | 'info';
  requiredParams?: string[];
  optionalParams?: string[];
  bodySchema?: Record<string, any>;
  responseType: string;
  examples?: {
    request?: any;
    response?: any;
  };
}

export const BANKING_API_REGISTRY: Record<string, ApiEndpoint> = {
  // Account Operations
  ACCOUNT_BALANCE: {
    id: 'account_balance',
    name: 'Account Balance',
    description: 'Get current account balance',
    endpoint: '/account/balance',
    method: 'GET',
    category: 'account',
    responseType: 'AccountBalance',
    examples: {
      response: {
        accountNumber: '****1234',
        balance: 25000.50,
        availableBalance: 24500.50,
        currency: 'USD',
        lastUpdated: '2025-01-27T10:30:00Z'
      }
    }
  },

  MINI_STATEMENT: {
    id: 'mini_statement',
    name: 'Mini Statement',
    description: 'Fetch recent transactions (last 10-20 transactions)',
    endpoint: '/account/mini-statement',
    method: 'GET',
    category: 'account',
    optionalParams: ['limit'],
    responseType: 'MiniStatement',
    examples: {
      response: {
        accountNumber: '****1234',
        transactions: [
          {
            id: 'txn_001',
            date: '2025-01-27',
            type: 'DEBIT',
            amount: 500.00,
            description: 'ATM Withdrawal',
            balance: 24500.50
          }
        ]
      }
    }
  },

  ACCOUNT_DETAILS: {
    id: 'account_details',
    name: 'Account Info',
    description: 'Get comprehensive account holder information',
    endpoint: '/account/details',
    method: 'GET',
    category: 'account',
    responseType: 'AccountDetails',
    examples: {
      response: {
        accountNumber: '****1234',
        accountType: 'SAVINGS',
        holderName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1234567890',
        address: '123 Main St, City, State 12345',
        accountStatus: 'ACTIVE',
        openingDate: '2020-01-15'
      }
    }
  },

  // Card Operations
  BLOCK_CARD: {
    id: 'block_card',
    name: 'Block Card',
    description: 'Block debit or credit card for security',
    endpoint: '/card/block',
    method: 'POST',
    category: 'card',
    requiredParams: ['cardNumber', 'reason'],
    bodySchema: {
      cardNumber: 'string',
      cardType: 'DEBIT | CREDIT',
      reason: 'LOST | STOLEN | DAMAGED | SUSPICIOUS_ACTIVITY',
      additionalNotes: 'string?'
    },
    responseType: 'CardBlockResponse',
    examples: {
      request: {
        cardNumber: '****1234',
        cardType: 'DEBIT',
        reason: 'LOST',
        additionalNotes: 'Lost during travel'
      },
      response: {
        success: true,
        blockReference: 'BLK_001234',
        message: 'Card blocked successfully',
        blockedAt: '2025-01-27T10:30:00Z'
      }
    }
  },

  UNBLOCK_CARD: {
    id: 'unblock_card',
    name: 'Unblock Card',
    description: 'Unblock a previously blocked card',
    endpoint: '/card/unblock',
    method: 'POST',
    category: 'card',
    requiredParams: ['cardNumber', 'blockReference'],
    bodySchema: {
      cardNumber: 'string',
      blockReference: 'string',
      reason: 'string'
    },
    responseType: 'CardUnblockResponse',
    examples: {
      request: {
        cardNumber: '****1234',
        blockReference: 'BLK_001234',
        reason: 'Card found'
      },
      response: {
        success: true,
        message: 'Card unblocked successfully',
        unblockedAt: '2025-01-27T11:00:00Z'
      }
    }
  },

  REQUEST_NEW_CARD: {
    id: 'request_new_card',
    name: 'Request New Card',
    description: 'Request new debit or credit card',
    endpoint: '/card/request',
    method: 'POST',
    category: 'card',
    requiredParams: ['cardType', 'deliveryAddress'],
    bodySchema: {
      cardType: 'DEBIT | CREDIT',
      reason: 'NEW | REPLACEMENT | UPGRADE',
      deliveryAddress: 'string',
      urgentDelivery: 'boolean?'
    },
    responseType: 'CardRequestResponse',
    examples: {
      request: {
        cardType: 'DEBIT',
        reason: 'REPLACEMENT',
        deliveryAddress: '123 Main St, City, State 12345',
        urgentDelivery: false
      },
      response: {
        success: true,
        requestId: 'REQ_001234',
        estimatedDelivery: '7-10 business days',
        trackingNumber: 'TRK_567890'
      }
    }
  },

  // Loan Operations
  APPLY_LOAN: {
    id: 'apply_loan',
    name: 'Apply Loan',
    description: 'Submit loan application for personal, home, or business loans',
    endpoint: '/loan/apply',
    method: 'POST',
    category: 'loan',
    requiredParams: ['loanType', 'amount', 'purpose', 'monthlyIncome'],
    bodySchema: {
      loanType: 'PERSONAL | HOME | BUSINESS | AUTO | EDUCATION',
      amount: 'number',
      purpose: 'string',
      monthlyIncome: 'number',
      employmentStatus: 'EMPLOYED | SELF_EMPLOYED | RETIRED | STUDENT',
      employmentDetails: 'string?',
      requestedTenure: 'number?',
      collateral: 'string?'
    },
    responseType: 'LoanApplicationResponse',
    examples: {
      request: {
        loanType: 'PERSONAL',
        amount: 50000,
        purpose: 'Home renovation',
        monthlyIncome: 8000,
        employmentStatus: 'EMPLOYED',
        requestedTenure: 36
      },
      response: {
        success: true,
        applicationId: 'LOAN_001234',
        status: 'UNDER_REVIEW',
        estimatedProcessingTime: '3-5 business days',
        nextSteps: ['Document verification', 'Credit check', 'Final approval']
      }
    }
  },

  LOAN_STATUS: {
    id: 'loan_status',
    name: 'Loan Status',
    description: 'Check status of loan application or existing loan',
    endpoint: '/loan/status',
    method: 'GET',
    category: 'loan',
    requiredParams: ['applicationId'],
    responseType: 'LoanStatusResponse',
    examples: {
      response: {
        applicationId: 'LOAN_001234',
        status: 'APPROVED',
        loanAmount: 50000,
        interestRate: 8.5,
        tenure: 36,
        emi: 1580.50,
        disbursementDate: '2025-02-01',
        nextEmiDate: '2025-03-01'
      }
    }
  },

  // Transaction Operations
  SEND_MONEY: {
    id: 'send_money',
    name: 'Send Money',
    description: 'Transfer money to another account',
    endpoint: '/transaction/send',
    method: 'POST',
    category: 'transaction',
    requiredParams: ['recipientAccount', 'amount', 'purpose'],
    bodySchema: {
      recipientAccount: 'string',
      recipientName: 'string',
      amount: 'number',
      purpose: 'string',
      transferType: 'IMPS | NEFT | RTGS | UPI',
      scheduledDate: 'string?',
      remarks: 'string?'
    },
    responseType: 'TransactionResponse',
    examples: {
      request: {
        recipientAccount: '9876543210',
        recipientName: 'Jane Smith',
        amount: 1000,
        purpose: 'Payment for services',
        transferType: 'IMPS'
      },
      response: {
        success: true,
        transactionId: 'TXN_001234',
        referenceNumber: 'REF_567890',
        status: 'SUCCESS',
        debitedAmount: 1000,
        charges: 5,
        completedAt: '2025-01-27T10:30:00Z'
      }
    }
  },

  TRANSACTION_HISTORY: {
    id: 'transaction_history',
    name: 'Transaction History',
    description: 'View detailed transaction history with filters',
    endpoint: '/transaction/history',
    method: 'GET',
    category: 'transaction',
    optionalParams: ['fromDate', 'toDate', 'type', 'limit'],
    responseType: 'TransactionHistory',
    examples: {
      response: {
        transactions: [
          {
            id: 'TXN_001',
            date: '2025-01-27',
            type: 'DEBIT',
            amount: 1000,
            description: 'Transfer to Jane Smith',
            referenceNumber: 'REF_567890',
            balance: 24000.50
          }
        ],
        totalCount: 50,
        page: 1,
        hasMore: true
      }
    }
  },

  CANCEL_TRANSACTION: {
    id: 'cancel_transaction',
    name: 'Cancel Transaction',
    description: 'Cancel a pending or scheduled transaction',
    endpoint: '/transaction/cancel',
    method: 'POST',
    category: 'transaction',
    requiredParams: ['transactionId', 'reason'],
    bodySchema: {
      transactionId: 'string',
      reason: 'string'
    },
    responseType: 'CancelTransactionResponse',
    examples: {
      request: {
        transactionId: 'TXN_001234',
        reason: 'Incorrect amount'
      },
      response: {
        success: true,
        message: 'Transaction cancelled successfully',
        refundAmount: 1000,
        refundReference: 'REF_CANCEL_001'
      }
    }
  },

  // Support Operations
  RAISE_COMPLAINT: {
    id: 'raise_complaint',
    name: 'Raise Complaint',
    description: 'File a customer support complaint or issue',
    endpoint: '/support/complaint',
    method: 'POST',
    category: 'support',
    requiredParams: ['category', 'description'],
    bodySchema: {
      category: 'TRANSACTION | CARD | LOAN | ACCOUNT | SERVICE | OTHER',
      subcategory: 'string?',
      description: 'string',
      priority: 'LOW | MEDIUM | HIGH | URGENT',
      attachments: 'string[]?'
    },
    responseType: 'ComplaintResponse',
    examples: {
      request: {
        category: 'TRANSACTION',
        description: 'Unauthorized transaction on my account',
        priority: 'HIGH'
      },
      response: {
        success: true,
        complaintId: 'CMP_001234',
        ticketNumber: 'TKT_567890',
        status: 'OPEN',
        estimatedResolution: '2-3 business days',
        assignedAgent: 'Agent Smith'
      }
    }
  },

  TRACK_COMPLAINT: {
    id: 'track_complaint',
    name: 'Track Complaint',
    description: 'Track status and updates of a complaint',
    endpoint: '/support/complaint/:id',
    method: 'GET',
    category: 'support',
    requiredParams: ['complaintId'],
    responseType: 'ComplaintStatus',
    examples: {
      response: {
        complaintId: 'CMP_001234',
        ticketNumber: 'TKT_567890',
        status: 'IN_PROGRESS',
        category: 'TRANSACTION',
        description: 'Unauthorized transaction on my account',
        createdAt: '2025-01-25T09:00:00Z',
        lastUpdated: '2025-01-27T10:00:00Z',
        updates: [
          {
            date: '2025-01-26T14:00:00Z',
            message: 'Investigation started',
            agent: 'Agent Smith'
          }
        ]
      }
    }
  },

  // Information Services
  LIST_OFFERS: {
    id: 'list_offers',
    name: 'List Offers',
    description: 'Get current banking offers and promotions',
    endpoint: '/offers',
    method: 'GET',
    category: 'info',
    optionalParams: ['category', 'active'],
    responseType: 'OffersResponse',
    examples: {
      response: {
        offers: [
          {
            id: 'OFFER_001',
            title: 'Personal Loan at 7.5% Interest',
            description: 'Special rate for existing customers',
            category: 'LOAN',
            validUntil: '2025-03-31',
            terms: 'Minimum income: $5000/month'
          }
        ]
      }
    }
  },

  LIST_BRANCHES: {
    id: 'list_branches',
    name: 'List Branches',
    description: 'Find nearest ATMs and branch locations',
    endpoint: '/branches',
    method: 'GET',
    category: 'info',
    optionalParams: ['latitude', 'longitude', 'city', 'type'],
    responseType: 'BranchesResponse',
    examples: {
      response: {
        branches: [
          {
            id: 'BR_001',
            name: 'HSBC Main Branch',
            type: 'BRANCH',
            address: '123 Banking St, Financial District',
            phone: '+1-800-HSBC-001',
            services: ['ATM', 'CASH_DEPOSIT', 'CUSTOMER_SERVICE'],
            operatingHours: {
              weekdays: '9:00 AM - 5:00 PM',
              saturday: '9:00 AM - 2:00 PM',
              sunday: 'Closed'
            },
            distance: 2.5
          }
        ]
      }
    }
  }
};

// Helper functions for the tool registry
export class BankingToolRegistry {
  /**
   * Get all available tools
   */
  static getAllTools(): ApiEndpoint[] {
    return Object.values(BANKING_API_REGISTRY);
  }

  /**
   * Get tools by category
   */
  static getToolsByCategory(category: ApiEndpoint['category']): ApiEndpoint[] {
    return Object.values(BANKING_API_REGISTRY).filter(tool => tool.category === category);
  }

  /**
   * Get tool by ID
   */
  static getToolById(id: string): ApiEndpoint | undefined {
    return BANKING_API_REGISTRY[id];
  }

  /**
   * Search tools by name or description
   */
  static searchTools(query: string): ApiEndpoint[] {
    const searchTerm = query.toLowerCase();
    return Object.values(BANKING_API_REGISTRY).filter(tool => 
      tool.name.toLowerCase().includes(searchTerm) ||
      tool.description.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get tools by HTTP method
   */
  static getToolsByMethod(method: ApiEndpoint['method']): ApiEndpoint[] {
    return Object.values(BANKING_API_REGISTRY).filter(tool => tool.method === method);
  }

  /**
   * Generate API documentation
   */
  static generateApiDocs(): string {
    let docs = '# Banking API Documentation\n\n';
    
    const categories = ['account', 'card', 'loan', 'transaction', 'support', 'info'] as const;
    
    categories.forEach(category => {
      const tools = this.getToolsByCategory(category);
      if (tools.length === 0) return;
      
      docs += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Operations\n\n`;
      
      tools.forEach(tool => {
        docs += `### ${tool.name}\n`;
        docs += `**${tool.method}** \`${tool.endpoint}\`\n\n`;
        docs += `${tool.description}\n\n`;
        
        if (tool.requiredParams?.length) {
          docs += `**Required Parameters:** ${tool.requiredParams.join(', ')}\n\n`;
        }
        
        if (tool.optionalParams?.length) {
          docs += `**Optional Parameters:** ${tool.optionalParams.join(', ')}\n\n`;
        }
        
        docs += '---\n\n';
      });
    });
    
    return docs;
  }

  /**
   * Validate tool configuration
   */
  static validateTool(tool: ApiEndpoint): string[] {
    const errors: string[] = [];
    
    if (!tool.id) errors.push('Tool ID is required');
    if (!tool.name) errors.push('Tool name is required');
    if (!tool.endpoint) errors.push('Endpoint is required');
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(tool.method)) {
      errors.push('Invalid HTTP method');
    }
    
    return errors;
  }
}

export default BANKING_API_REGISTRY;
