interface QuickAction {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
  category: string;
}

export const quickActions: QuickAction[] = [
  {
    id: 'loan_application',
    title: 'Apply for Loan',
    description: 'Start a new loan application',
    prompt: 'I would like to apply for a personal loan of $50,000 for home renovation.',
    icon: '💰',
    category: 'loans'
  },
  {
    id: 'card_blocking',
    title: 'Block My Card',
    description: 'Block a lost or stolen card',
    prompt: 'I need to block my credit card because it was stolen.',
    icon: '🚫',
    category: 'cards'
  },
  {
    id: 'balance_check',
    title: 'Check Balance',
    description: 'View current account balance',
    prompt: 'What is my current account balance?',
    icon: '💳',
    category: 'accounts'
  },
  {
    id: 'transaction_history',
    title: 'Transaction History',
    description: 'View recent transactions',
    prompt: 'Show me my transaction history for the last month.',
    icon: '📊',
    category: 'accounts'
  },
  {
    id: 'account_statement',
    title: 'Account Statement',
    description: 'Get account statement',
    prompt: 'I need my account statement for the last 3 months.',
    icon: '📄',
    category: 'accounts'
  },
  {
    id: 'interest_rates',
    title: 'Interest Rates',
    description: 'Check current rates',
    prompt: 'What are the current interest rates for personal loans?',
    icon: '📈',
    category: 'rates'
  },
  {
    id: 'loan_information',
    title: 'Loan Information',
    description: 'Learn about loan types',
    prompt: 'What types of loans does HSBC offer and what are the eligibility criteria?',
    icon: '🏦',
    category: 'information'
  },
  {
    id: 'banking_rules',
    title: 'Banking Rules',
    description: 'View policies & regulations',
    prompt: 'What are HSBC\'s banking rules and regulations?',
    icon: '📋',
    category: 'information'
  }
];

export const examplePrompts = [
  "I want to apply for a $25,000 car loan",
  "My debit card was lost, please block it",
  "What's my account balance?",
  "Show me transactions from last week",
  "I need my statement for tax purposes",
  "What are your current mortgage rates?",
  "What types of loans does HSBC offer?",
  "What are the eligibility criteria for home loans?",
  "Tell me about HSBC's banking policies",
  "What are the interest rates for education loans?",
  "How long can loan tenure be?",
  "What documents are required for loan application?"
];
