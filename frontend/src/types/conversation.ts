export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    entities?: Record<string, any>;
    confidence?: number;
    toolCalls?: ToolCall[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  result?: any;
  status: 'pending' | 'success' | 'error';
}

export interface ConversationContext {
  id: string;
  userId: string;
  currentIntent?: string;
  state: ConversationState;
  entities: Record<string, any>;
  taskProgress: TaskProgress;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationState {
  phase: 'greeting' | 'intent_detection' | 'information_gathering' | 'confirmation' | 'execution' | 'completion';
  currentTask?: BankingTask;
  requiredFields: string[];
  collectedFields: Record<string, any>;
  pendingClarifications: string[];
}

export type BankingTask = 
  | 'loan_application'
  | 'card_blocking'
  | 'account_statement'
  | 'balance_inquiry'
  | 'transaction_history'
  | 'interest_rate_inquiry'
  | 'general_inquiry';

export interface TaskProgress {
  taskType?: BankingTask;
  step: number;
  totalSteps: number;
  completed: boolean;
  data: Record<string, any>;
}

export interface IntentClassification {
  intent: BankingTask | 'unknown';
  confidence: number;
  entities: Record<string, any>;
  clarificationNeeded: boolean;
  clarificationQuestion?: string;
}

export interface BankingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'business';
  balance: number;
  creditScore?: number;
  hasActiveCards: boolean;
  recentTransactions: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  date: Date;
  balance: number;
}

export interface LoanApplication {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  employmentStatus: string;
  monthlyIncome: number;
  creditScore: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface CardBlockRequest {
  id: string;
  userId: string;
  cardType: 'debit' | 'credit';
  cardLastFourDigits: string;
  reason: 'lost' | 'stolen' | 'damaged' | 'suspicious_activity';
  status: 'requested' | 'processing' | 'blocked' | 'failed';
  createdAt: Date;
}
