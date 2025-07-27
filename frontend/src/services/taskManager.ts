import { BankingTask } from '@/types/conversation';

export interface TaskConfiguration {
  requiredFields: string[];
  steps: TaskStep[];
  description: string;
}

export interface TaskStep {
  id: string;
  description: string;
  requiredFields: string[];
  optional: boolean;
}

export class TaskManager {
  private taskConfigurations: Map<BankingTask, TaskConfiguration> = new Map();

  constructor() {
    this.initializeTaskConfigurations();
  }

  private initializeTaskConfigurations() {
    // Loan Application Configuration
    this.taskConfigurations.set('loan_application', {
      requiredFields: ['amount', 'purpose', 'employmentStatus', 'monthlyIncome'],
      steps: [
        {
          id: 'gather_basic_info',
          description: 'Collect loan amount and purpose',
          requiredFields: ['amount', 'purpose'],
          optional: false
        },
        {
          id: 'gather_employment_info',
          description: 'Collect employment and income details',
          requiredFields: ['employmentStatus', 'monthlyIncome'],
          optional: false
        },
        {
          id: 'confirm_details',
          description: 'Confirm all loan application details',
          requiredFields: [],
          optional: false
        },
        {
          id: 'submit_application',
          description: 'Submit the loan application',
          requiredFields: [],
          optional: false
        }
      ],
      description: 'Process a loan application with required documentation and eligibility checks'
    });

    // Card Blocking Configuration
    this.taskConfigurations.set('card_blocking', {
      requiredFields: ['cardType', 'lastFourDigits', 'reason'],
      steps: [
        {
          id: 'identify_card',
          description: 'Identify the card to be blocked',
          requiredFields: ['cardType', 'lastFourDigits'],
          optional: false
        },
        {
          id: 'get_reason',
          description: 'Determine reason for blocking',
          requiredFields: ['reason'],
          optional: false
        },
        {
          id: 'confirm_blocking',
          description: 'Confirm card blocking details',
          requiredFields: [],
          optional: false
        },
        {
          id: 'execute_block',
          description: 'Block the card',
          requiredFields: [],
          optional: false
        }
      ],
      description: 'Block a lost, stolen, or compromised card'
    });

    // Account Statement Configuration
    this.taskConfigurations.set('account_statement', {
      requiredFields: ['timePeriod'],
      steps: [
        {
          id: 'specify_period',
          description: 'Specify time period for statement',
          requiredFields: ['timePeriod'],
          optional: false
        },
        {
          id: 'generate_statement',
          description: 'Generate and deliver statement',
          requiredFields: [],
          optional: false
        }
      ],
      description: 'Generate and provide account statement for specified period'
    });

    // Balance Inquiry Configuration
    this.taskConfigurations.set('balance_inquiry', {
      requiredFields: [],
      steps: [
        {
          id: 'fetch_balance',
          description: 'Retrieve current account balance',
          requiredFields: [],
          optional: false
        }
      ],
      description: 'Check current account balance and available funds'
    });

    // Transaction History Configuration
    this.taskConfigurations.set('transaction_history', {
      requiredFields: ['timePeriod'],
      steps: [
        {
          id: 'specify_period',
          description: 'Specify time period for transaction history',
          requiredFields: ['timePeriod'],
          optional: false
        },
        {
          id: 'fetch_transactions',
          description: 'Retrieve transaction history',
          requiredFields: [],
          optional: false
        }
      ],
      description: 'Retrieve transaction history for specified time period'
    });

    // Interest Rate Inquiry Configuration
    this.taskConfigurations.set('interest_rate_inquiry', {
      requiredFields: [],
      steps: [
        {
          id: 'fetch_rates',
          description: 'Retrieve current interest rates',
          requiredFields: [],
          optional: false
        }
      ],
      description: 'Provide current interest rates for various banking products'
    });

    // General Inquiry Configuration
    this.taskConfigurations.set('general_inquiry', {
      requiredFields: [],
      steps: [
        {
          id: 'process_inquiry',
          description: 'Process general banking inquiry',
          requiredFields: [],
          optional: false
        }
      ],
      description: 'Handle general banking questions and information requests'
    });
  }

  getTaskConfiguration(task: BankingTask): TaskConfiguration {
    const config = this.taskConfigurations.get(task);
    if (!config) {
      return this.taskConfigurations.get('general_inquiry')!;
    }
    return config;
  }

  getNextStep(task: BankingTask, currentStep: number): TaskStep | null {
    const config = this.getTaskConfiguration(task);
    if (currentStep >= config.steps.length) {
      return null;
    }
    return config.steps[currentStep];
  }

  isTaskComplete(task: BankingTask, collectedFields: Record<string, any>): boolean {
    const config = this.getTaskConfiguration(task);
    const requiredFields = config.requiredFields;
    
    return requiredFields.every(field => 
      collectedFields.hasOwnProperty(field) && collectedFields[field] !== undefined
    );
  }

  getMissingFields(task: BankingTask, collectedFields: Record<string, any>): string[] {
    const config = this.getTaskConfiguration(task);
    return config.requiredFields.filter(field => 
      !collectedFields.hasOwnProperty(field) || collectedFields[field] === undefined
    );
  }

  validateField(task: BankingTask, fieldName: string, value: any): { valid: boolean; error?: string } {
    switch (task) {
      case 'loan_application':
        return this.validateLoanField(fieldName, value);
      case 'card_blocking':
        return this.validateCardField(fieldName, value);
      default:
        return { valid: true };
    }
  }

  private validateLoanField(fieldName: string, value: any): { valid: boolean; error?: string } {
    switch (fieldName) {
      case 'amount':
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) {
          return { valid: false, error: 'Please provide a valid loan amount greater than $0' };
        }
        if (amount > 1000000) {
          return { valid: false, error: 'Loan amount cannot exceed $1,000,000. Please contact a loan specialist for larger amounts.' };
        }
        return { valid: true };
        
      case 'monthlyIncome':
        const income = parseFloat(value);
        if (isNaN(income) || income <= 0) {
          return { valid: false, error: 'Please provide a valid monthly income amount' };
        }
        return { valid: true };
        
      case 'purpose':
        const validPurposes = ['home', 'car', 'business', 'education', 'personal'];
        if (!validPurposes.includes(value.toLowerCase())) {
          return { valid: false, error: 'Please specify a valid loan purpose: home, car, business, education, or personal' };
        }
        return { valid: true };
        
      default:
        return { valid: true };
    }
  }

  private validateCardField(fieldName: string, value: any): { valid: boolean; error?: string } {
    switch (fieldName) {
      case 'cardType':
        const validTypes = ['debit', 'credit'];
        if (!validTypes.includes(value.toLowerCase())) {
          return { valid: false, error: 'Please specify either "debit" or "credit" card' };
        }
        return { valid: true };
        
      case 'lastFourDigits':
        const digits = value.toString();
        if (!/^\d{4}$/.test(digits)) {
          return { valid: false, error: 'Please provide exactly 4 digits for the last four digits of your card' };
        }
        return { valid: true };
        
      case 'reason':
        const validReasons = ['lost', 'stolen', 'damaged', 'suspicious_activity'];
        if (!validReasons.includes(value.toLowerCase())) {
          return { valid: false, error: 'Please specify a valid reason: lost, stolen, damaged, or suspicious activity' };
        }
        return { valid: true };
        
      default:
        return { valid: true };
    }
  }
}
