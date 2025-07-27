/**
 * Banking Context Validator
 * Determines if user queries are banking-related and filters out non-banking requests
 */

export class BankingContextValidator {
  
  // Banking-related keywords and phrases
  private readonly bankingKeywords = [
    // Core banking terms
    'bank', 'banking', 'account', 'balance', 'deposit', 'withdraw', 'transaction', 'transfer',
    'loan', 'credit', 'debit', 'mortgage', 'finance', 'payment', 'money', 'currency',
    'interest', 'rate', 'card', 'atm', 'branch', 'customer service', 'statement',
    
    // Loan related
    'personal loan', 'home loan', 'car loan', 'education loan', 'business loan',
    'emi', 'tenure', 'principal', 'installment', 'eligibility', 'collateral',
    
    // Card related
    'credit card', 'debit card', 'block card', 'unblock', 'pin', 'cvv', 'expire',
    'limit', 'bill', 'due date', 'minimum payment',
    
    // Account related
    'savings', 'current', 'fixed deposit', 'recurring deposit', 'fd', 'rd',
    'cheque', 'draft', 'neft', 'rtgs', 'imps', 'upi',
    
    // Investment related
    'investment', 'mutual fund', 'shares', 'bonds', 'portfolio', 'trading',
    'sip', 'dividend', 'capital gains',
    
    // HSBC specific
    'hsbc', 'premier', 'advance', 'jade', 'global', 'international banking',
    
    // Banking operations
    'apply', 'application', 'approve', 'reject', 'process', 'verify',
    'kyc', 'documents', 'proof', 'income', 'salary', 'employment',
    
    // Support related
    'complaint', 'issue', 'problem', 'help', 'support', 'query', 'question',
    'resolve', 'escalate', 'feedback',
    
    // Policy and rules
    'policy', 'terms', 'conditions', 'rules', 'regulations', 'compliance',
    'charges', 'fees', 'penalty', 'waiver'
  ];

  // Common non-banking topics that should be rejected
  private readonly nonBankingTopics = [
    'weather', 'climate', 'temperature', 'rain', 'snow', 'forecast',
    'sports', 'football', 'cricket', 'basketball', 'game', 'match', 'score',
    'politics', 'government', 'election', 'president', 'minister', 'parliament',
    'entertainment', 'movie', 'film', 'actor', 'actress', 'celebrity', 'music',
    'technology', 'computer', 'software', 'hardware', 'programming', 'coding',
    'travel', 'tourism', 'hotel', 'flight', 'vacation', 'holiday', 'trip',
    'food', 'recipe', 'cooking', 'restaurant', 'cuisine', 'diet', 'nutrition',
    'health', 'medicine', 'doctor', 'hospital', 'disease', 'treatment',
    'education', 'school', 'college', 'university', 'study', 'exam', 'degree',
    'shopping', 'clothes', 'fashion', 'brand', 'store', 'online shopping',
    'science', 'physics', 'chemistry', 'biology', 'research', 'experiment',
    'history', 'historical', 'ancient', 'war', 'culture', 'tradition'
  ];

  // Banking intent patterns
  private readonly bankingIntentPatterns = [
    // Direct banking requests
    /\b(apply|want|need|get|open)\s+(loan|account|card|credit|debit)/i,
    /\b(check|show|tell|what)\s+(balance|statement|transaction)/i,
    /\b(transfer|send|pay)\s+(money|amount|funds)/i,
    /\b(block|unblock|cancel)\s+(card|account)/i,
    /\b(interest|rate|charges|fees)\b/i,
    
    // Information requests
    /\b(what|how|tell|explain|information|info|details)\s+.*(loan|bank|account|card|credit|debit|interest|rate|charges)/i,
    /\b(eligibility|criteria|requirement|document|proof)\b/i,
    /\b(complain|complaint|issue|problem|support|help)\b/i,
    
    // HSBC specific
    /\bhsbc\b/i,
    /\b(premier|advance|jade)\s+(banking|account)/i
  ];

  /**
   * Check if a message is banking-related
   */
  isBankingRelated(message: string): boolean {
    const normalizedMessage = message.toLowerCase().trim();

    // Quick check for empty or very short messages
    if (normalizedMessage.length < 3) {
      return false;
    }

    // Check for direct banking intent patterns
    for (const pattern of this.bankingIntentPatterns) {
      if (pattern.test(normalizedMessage)) {
        console.log('✅ Banking intent detected via pattern:', pattern);
        return true;
      }
    }

    // Check for banking keywords
    const hasBankingKeywords = this.bankingKeywords.some(keyword => 
      normalizedMessage.includes(keyword.toLowerCase())
    );

    // Check for non-banking topics
    const hasNonBankingTopics = this.nonBankingTopics.some(topic => 
      normalizedMessage.includes(topic.toLowerCase())
    );

    // If clearly non-banking topic, reject
    if (hasNonBankingTopics && !hasBankingKeywords) {
      console.log('❌ Non-banking topic detected');
      return false;
    }

    // If has banking keywords, consider it banking-related
    if (hasBankingKeywords) {
      console.log('✅ Banking keywords detected');
      return true;
    }

    // For ambiguous cases, apply additional logic
    return this.checkAmbiguousCase(normalizedMessage);
  }

  /**
   * Handle ambiguous cases that might be banking-related
   */
  private checkAmbiguousCase(message: string): boolean {
    // Common greeting patterns - allow these
    const greetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
      /^(thanks|thank you|bye|goodbye)/i,
      /^(yes|no|okay|ok|sure)/i
    ];

    for (const pattern of greetingPatterns) {
      if (pattern.test(message)) {
        console.log('✅ Greeting/response detected - allowing');
        return true;
      }
    }

    // If message is very short and doesn't contain obvious non-banking terms
    if (message.length < 20 && !this.hasObviousNonBankingTerms(message)) {
      console.log('✅ Short ambiguous message - allowing');
      return true;
    }

    console.log('❌ Message not recognized as banking-related');
    return false;
  }

  /**
   * Check for obvious non-banking terms
   */
  private hasObviousNonBankingTerms(message: string): boolean {
    const obviousNonBankingTerms = [
      'weather', 'temperature', 'rain', 'football', 'cricket', 'movie', 
      'actor', 'politics', 'election', 'recipe', 'doctor', 'medicine'
    ];

    return obviousNonBankingTerms.some(term => 
      message.toLowerCase().includes(term)
    );
  }

  /**
   * Generate appropriate rejection message for non-banking queries
   */
  generateRejectionMessage(userMessage: string): string {
    const rejectionMessages = [
      "I'm HSBC Banking Assistant, specialized in helping with banking services only. I can assist you with loans, account management, card services, transactions, and banking information. How can I help you with your banking needs today?",
      
      "I focus exclusively on HSBC banking services. I can help you with loan applications, checking balances, money transfers, card management, and banking queries. What banking assistance do you need?",
      
      "As your HSBC Banking Assistant, I'm designed to help with banking-related matters only. I can assist with account services, loans, cards, transactions, and banking information. Please let me know how I can help with your banking requirements.",
      
      "I specialize in HSBC banking services and can only assist with banking-related queries. I'm here to help with loans, accounts, cards, transfers, and banking information. What banking service can I help you with?",
      
      "I'm your dedicated HSBC Banking Assistant, focused solely on banking services. I can help you with loan applications, account management, card services, money transfers, and banking policies. How may I assist you with your banking needs?"
    ];

    // Randomly select a rejection message to avoid repetition
    const randomIndex = Math.floor(Math.random() * rejectionMessages.length);
    return rejectionMessages[randomIndex];
  }

  /**
   * Check if message contains potential banking intent but needs clarification
   */
  needsClarification(message: string): boolean {
    const ambiguousTerms = ['apply', 'check', 'get', 'want', 'need', 'how', 'what'];
    const normalizedMessage = message.toLowerCase();
    
    return ambiguousTerms.some(term => normalizedMessage.includes(term)) &&
           !this.bankingKeywords.some(keyword => normalizedMessage.includes(keyword.toLowerCase()));
  }

  /**
   * Generate clarification message
   */
  generateClarificationMessage(): string {
    return "I'm here to help with HSBC banking services. Could you please clarify what specific banking assistance you need? I can help with loans, accounts, cards, transfers, or general banking information.";
  }
}

// Create singleton instance
export const bankingContextValidator = new BankingContextValidator();
