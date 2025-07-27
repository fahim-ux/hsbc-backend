import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { Card } from '../types';

export class CardService {
  constructor(private db: Database) {}

  async blockCard(cardId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const card = await this.db.getCardById(cardId);
      if (!card) {
        return { success: false, message: 'Card not found' };
      }

      if (card.userId !== userId) {
        return { success: false, message: 'Unauthorized to block this card' };
      }

      if (card.isBlocked) {
        return { success: false, message: 'Card is already blocked' };
      }

      await this.db.updateCardStatus(cardId, true);

      return {
        success: true,
        message: 'Card blocked successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to block card'
      };
    }
  }

  async unblockCard(cardId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const card = await this.db.getCardById(cardId);
      if (!card) {
        return { success: false, message: 'Card not found' };
      }

      if (card.userId !== userId) {
        return { success: false, message: 'Unauthorized to unblock this card' };
      }

      if (!card.isBlocked) {
        return { success: false, message: 'Card is not blocked' };
      }

      await this.db.updateCardStatus(cardId, false);

      return {
        success: true,
        message: 'Card unblocked successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to unblock card'
      };
    }
  }

  async requestNewCard(userId: string, cardType: 'debit' | 'credit'): Promise<{ success: boolean; cardId?: string; message: string }> {
    try {
      const cardId = uuidv4();
      const cardNumber = this.generateCardNumber();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 3); // 3 years validity

      const cardLimit = cardType === 'credit' ? 50000 : 5000; // Default limits

      const newCard: Omit<Card, 'createdAt' | 'updatedAt'> = {
        id: cardId,
        userId,
        cardNumber,
        cardType,
        expiryDate,
        isBlocked: false,
        isActive: true,
        cardLimit
      };

      await this.db.createCard(newCard);

      return {
        success: true,
        cardId,
        message: `New ${cardType} card requested successfully. You will receive it within 7-10 business days.`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to request new card'
      };
    }
  }

  async getUserCards(userId: string): Promise<Card[]> {
    return await this.db.getCardsByUserId(userId);
  }

  private generateCardNumber(): string {
    // Generate a mock card number (in real system, this would be handled by card provider)
    const prefix = '4532'; // Visa prefix
    const middle = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${prefix}-${middle.substring(0, 4)}-${middle.substring(4, 8)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }
}
