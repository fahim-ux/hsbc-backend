import { GoogleGenAI } from '@google/genai';
import { IntentClassification, BankingTask } from '@/types/conversation';

export class IntentClassifier {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  async classifyIntent(userMessage: string, conversationHistory: string[] = []): Promise<IntentClassification> {
    console.log('Clasifying intent for message:', userMessage);
    const context = conversationHistory.length > 0 
      ? `Previous conversation:\n${conversationHistory.join('\n')}\n\n`
      : '';

    const prompt = `${context}You are a banking assistant intent classifier. Analyze the user's message and classify it into one of these banking intents:

1. loan_application - User wants to apply for a loan
2. card_blocking - User wants to block/cancel a card (lost, stolen, damaged)
3. account_statement - User wants account statements or mini statements
4. balance_inquiry - User wants to check account balance
5. transaction_history - User wants to see transaction history
6. interest_rate_inquiry - User wants information about interest rates
7. general_inquiry - General questions about banking services

User message: "${userMessage}"

Extract any entities (amounts, card types, time periods, etc.) and determine if clarification is needed.

Respond in JSON format:
{
  "intent": "intent_name",
  "confidence": 0.0-1.0,
  "entities": {
    "entity_name": "entity_value"
  },
  "clarificationNeeded": boolean,
  "clarificationQuestion": "question if clarification needed"
}`;

    try {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        }
      });
      
      const text = response.text || '';
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('No JSON found in response:', text);
        throw new Error('Invalid JSON response from model');
      }

      const classification = JSON.parse(jsonMatch[0]) as IntentClassification;
      
      // Validate intent
      const validIntents: BankingTask[] = [
        'loan_application', 'card_blocking', 'account_statement', 
        'balance_inquiry', 'transaction_history', 'interest_rate_inquiry', 'general_inquiry'
      ];

      if (!validIntents.includes(classification.intent as BankingTask)) {
        classification.intent = 'general_inquiry';
        classification.confidence = 0.5;
      }
      console.log('Intent classification result:', classification);
      return classification;
    } catch (error) {
      console.error('Intent classification error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return {
        intent: 'general_inquiry',
        confidence: 0.1,
        entities: {},
        clarificationNeeded: true,
        clarificationQuestion: "I'm not sure I understood that correctly. Could you please clarify what you'd like help with today?"
      };
    }
  }

  extractEntities(userMessage: string, intent: BankingTask): Record<string, any> {
    const entities: Record<string, any> = {};

    switch (intent) {
      case 'loan_application':
        const amountMatch = userMessage.match(/(\$?[\d,]+(?:\.\d{2})?)/);
        if (amountMatch) entities.amount = amountMatch[1];
        
        const purposeKeywords = ['home', 'car', 'business', 'education', 'personal'];
        const foundPurpose = purposeKeywords.find(p => 
          userMessage.toLowerCase().includes(p)
        );
        if (foundPurpose) entities.purpose = foundPurpose;
        break;

      case 'card_blocking':
        const cardTypes = ['debit', 'credit'];
        const foundCardType = cardTypes.find(t => 
          userMessage.toLowerCase().includes(t)
        );
        if (foundCardType) entities.cardType = foundCardType;

        const reasons = ['lost', 'stolen', 'damaged'];
        const foundReason = reasons.find(r => 
          userMessage.toLowerCase().includes(r)
        );
        if (foundReason) entities.reason = foundReason;
        break;

      case 'account_statement':
      case 'transaction_history':
        const timePatterns = [
          { pattern: /last (\d+) days?/i, type: 'days' },
          { pattern: /last (\d+) months?/i, type: 'months' },
          { pattern: /this month/i, type: 'current_month' },
          { pattern: /last month/i, type: 'last_month' }
        ];

        for (const timePattern of timePatterns) {
          const match = userMessage.match(timePattern.pattern);
          if (match) {
            entities.timePeriod = {
              type: timePattern.type,
              value: match[1] || 1
            };
            break;
          }
        }
        break;
    }

    return entities;
  }
}
