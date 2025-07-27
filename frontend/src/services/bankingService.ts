import { 
  BankingUser, 
  Transaction, 
  LoanApplication, 
  CardBlockRequest 
} from '@/types/conversation';
import { v4 as uuidv4 } from 'uuid';

export class BankingService {
  private users: Map<string, BankingUser> = new Map();
  private loanApplications: Map<string, LoanApplication> = new Map();
  private cardBlockRequests: Map<string, CardBlockRequest> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock user data
    const mockUser: BankingUser = {
      id: 'user123',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
      accountNumber: '1234567890',
      accountType: 'checking',
      balance: 15420.50,
      creditScore: 720,
      hasActiveCards: true,
      recentTransactions: [
        {
          id: 'tx1',
          amount: -45.50,
          type: 'debit',
          description: 'Coffee Shop Purchase',
          date: new Date('2025-01-25'),
          balance: 15420.50
        },
        {
          id: 'tx2',
          amount: -120.00,
          type: 'debit',
          description: 'Grocery Store',
          date: new Date('2025-01-24'),
          balance: 15466.00
        },
        {
          id: 'tx3',
          amount: 2500.00,
          type: 'credit',
          description: 'Salary Deposit',
          date: new Date('2025-01-23'),
          balance: 15586.00
        },
        {
          id: 'tx4',
          amount: -85.30,
          type: 'debit',
          description: 'Electric Bill Payment',
          date: new Date('2025-01-22'),
          balance: 13086.00
        },
        {
          id: 'tx5',
          amount: -350.00,
          type: 'debit',
          description: 'Rent Payment',
          date: new Date('2025-01-20'),
          balance: 13171.30
        }
      ]
    };

    this.users.set('user123', mockUser);
  }

  async submitLoanApplication(userId: string, applicationData: any): Promise<LoanApplication> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const application: LoanApplication = {
      id: uuidv4(),
      userId,
      amount: parseFloat(applicationData.amount),
      purpose: applicationData.purpose,
      employmentStatus: applicationData.employmentStatus,
      monthlyIncome: parseFloat(applicationData.monthlyIncome),
      creditScore: user.creditScore || 700,
      status: 'submitted',
      createdAt: new Date()
    };

    this.loanApplications.set(application.id, application);

    // Simulate processing delay
    setTimeout(() => {
      const app = this.loanApplications.get(application.id);
      if (app) {
        // Simple approval logic based on income and credit score
        const debtToIncomeRatio = app.amount / (app.monthlyIncome * 12);
        if (app.creditScore >= 650 && debtToIncomeRatio <= 0.4) {
          app.status = 'approved';
        } else {
          app.status = 'under_review';
        }
        this.loanApplications.set(application.id, app);
      }
    }, 2000);

    return application;
  }

  async blockCard(userId: string, cardData: any): Promise<CardBlockRequest> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.hasActiveCards) {
      throw new Error('No active cards found for this account');
    }

    const blockRequest: CardBlockRequest = {
      id: uuidv4(),
      userId,
      cardType: cardData.cardType.toLowerCase(),
      cardLastFourDigits: cardData.lastFourDigits,
      reason: cardData.reason.toLowerCase(),
      status: 'blocked',
      createdAt: new Date()
    };

    this.cardBlockRequests.set(blockRequest.id, blockRequest);

    // Simulate card blocking process
    setTimeout(() => {
      const request = this.cardBlockRequests.get(blockRequest.id);
      if (request) {
        request.status = 'blocked';
        this.cardBlockRequests.set(blockRequest.id, request);
      }
    }, 1000);

    return blockRequest;
  }

  async getBalance(userId: string): Promise<{ balance: number; availableBalance: number; accountType: string }> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      balance: user.balance,
      availableBalance: user.balance, // In real system, this would consider holds, etc.
      accountType: user.accountType
    };
  }

  async getAccountStatement(userId: string, requestData: any): Promise<{ 
    accountNumber: string; 
    period: string; 
    transactions: Transaction[]; 
    openingBalance: number; 
    closingBalance: number; 
  }> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Filter transactions based on time period
    const transactions = this.filterTransactionsByPeriod(user.recentTransactions, requestData.timePeriod);
    
    return {
      accountNumber: user.accountNumber,
      period: this.formatTimePeriod(requestData.timePeriod),
      transactions,
      openingBalance: transactions.length > 0 ? transactions[transactions.length - 1].balance - transactions[transactions.length - 1].amount : user.balance,
      closingBalance: user.balance
    };
  }

  async getTransactionHistory(userId: string, requestData: any): Promise<{ 
    transactions: Transaction[]; 
    totalCount: number; 
    period: string; 
  }> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const transactions = this.filterTransactionsByPeriod(user.recentTransactions, requestData.timePeriod);

    return {
      transactions,
      totalCount: transactions.length,
      period: this.formatTimePeriod(requestData.timePeriod)
    };
  }

  async getInterestRates(requestData?: any): Promise<{ 
    savingsRate: number; 
    loanRates: Record<string, number>; 
    creditCardRate: number; 
  }> {
    // Mock interest rates
    return {
      savingsRate: 2.5,
      loanRates: {
        personal: 8.5,
        home: 6.2,
        car: 5.8,
        business: 7.2,
        education: 4.9
      },
      creditCardRate: 18.9
    };
  }

  async handleGeneralInquiry(question: string): Promise<{ response: string; category: string }> {
    // Simple keyword-based responses for common questions
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('hours') || lowerQuestion.includes('open')) {
      return {
        response: "Our branches are open Monday-Friday 9:00 AM to 5:00 PM, and Saturday 9:00 AM to 1:00 PM. Online banking is available 24/7.",
        category: 'hours'
      };
    }

    if (lowerQuestion.includes('fee') || lowerQuestion.includes('charge')) {
      return {
        response: "We offer various account types with different fee structures. Basic checking accounts have no monthly fee with a minimum balance of $500. Please visit our website or speak with a representative for detailed fee information.",
        category: 'fees'
      };
    }

    if (lowerQuestion.includes('atm') || lowerQuestion.includes('location')) {
      return {
        response: "You can find ATM locations using our mobile app or website. We have over 2,000 ATMs nationwide, and you can use any HSBC ATM fee-free.",
        category: 'locations'
      };
    }

    if (lowerQuestion.includes('online') || lowerQuestion.includes('mobile') || lowerQuestion.includes('app')) {
      return {
        response: "Our mobile app and online banking platform allow you to check balances, transfer funds, pay bills, deposit checks, and much more. Download the HSBC Mobile Banking app from your app store.",
        category: 'digital_services'
      };
    }

    return {
      response: "I'd be happy to help you with your banking question. For specific account inquiries or detailed information, please contact our customer service at 1-800-HSBC-USA or visit your nearest branch.",
      category: 'general'
    };
  }

  private filterTransactionsByPeriod(transactions: Transaction[], timePeriod: any): Transaction[] {
    if (!timePeriod) {
      return transactions; // Return all if no period specified
    }

    const now = new Date();
    let startDate: Date;

    if (typeof timePeriod === 'string') {
      if (timePeriod.includes('month')) {
        const months = parseInt(timePeriod) || 1;
        startDate = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
      } else if (timePeriod.includes('day')) {
        const days = parseInt(timePeriod) || 30;
        startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      } else {
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // Default to 30 days
      }
    } else if (timePeriod.type) {
      switch (timePeriod.type) {
        case 'days':
          startDate = new Date(now.getTime() - (timePeriod.value * 24 * 60 * 60 * 1000));
          break;
        case 'months':
          startDate = new Date(now.getFullYear(), now.getMonth() - timePeriod.value, now.getDate());
          break;
        case 'current_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        default:
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      }
    } else {
      startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    }

    return transactions.filter(tx => tx.date >= startDate);
  }

  private formatTimePeriod(timePeriod: any): string {
    if (!timePeriod) return 'Last 30 days';
    
    if (typeof timePeriod === 'string') {
      return timePeriod;
    }
    
    if (timePeriod.type) {
      switch (timePeriod.type) {
        case 'days':
          return `Last ${timePeriod.value} days`;
        case 'months':
          return `Last ${timePeriod.value} months`;
        case 'current_month':
          return 'Current month';
        case 'last_month':
          return 'Last month';
        default:
          return 'Last 30 days';
      }
    }
    
    return 'Last 30 days';
  }

  // Admin methods for testing
  getUser(userId: string): BankingUser | undefined {
    return this.users.get(userId);
  }

  getLoanApplication(applicationId: string): LoanApplication | undefined {
    return this.loanApplications.get(applicationId);
  }

  getCardBlockRequest(requestId: string): CardBlockRequest | undefined {
    return this.cardBlockRequests.get(requestId);
  }
}
