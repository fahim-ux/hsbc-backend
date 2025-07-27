import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { Transaction, Account } from '../types';

export class TransactionService {
  constructor(private db: Database) {}

  async sendMoney(fromUserId: string, toAccountNumber: string, amount: number, description: string = ''): Promise<{ success: boolean; transactionId?: string; message: string }> {
    try {
      // Get sender's account
      const fromAccount = await this.db.getAccountByUserId(fromUserId);
      if (!fromAccount) {
        return { success: false, message: 'Sender account not found' };
      }

      // Check if sender has sufficient balance
      if (fromAccount.balance < amount) {
        return { success: false, message: 'Insufficient balance' };
      }

      // Get receiver's account (simplified - in real system, you'd query by account number)
      // For demo purposes, we'll create a mock transaction
      const transactionId = uuidv4();
      const reference = `TXN${Date.now()}`;

      // Create debit transaction
      const transaction: Omit<Transaction, 'createdAt' | 'updatedAt'> = {
        id: transactionId,
        fromAccountId: fromAccount.id,
        toAccountId: undefined, // In real system, you'd find the target account
        amount,
        type: 'debit',
        description: description || `Transfer to ${toAccountNumber}`,
        reference,
        status: 'completed'
      };

      await this.db.createTransaction(transaction);

      // Update sender's balance
      const newBalance = fromAccount.balance - amount;
      await this.db.updateAccountBalance(fromAccount.id, newBalance);

      return {
        success: true,
        transactionId,
        message: 'Transaction completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Transaction failed due to system error'
      };
    }
  }

  async getTransactionHistory(userId: string, limit: number = 10): Promise<Transaction[]> {
    return await this.db.getTransactionsByUserId(userId, limit);
  }

  async cancelTransaction(transactionId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const transaction = await this.db.getTransactionById(transactionId);
      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      // Verify user owns this transaction
      const account = await this.db.getAccountByUserId(userId);
      if (!account || account.id !== transaction.fromAccountId) {
        return { success: false, message: 'Unauthorized to cancel this transaction' };
      }

      if (transaction.status === 'completed') {
        return { success: false, message: 'Cannot cancel completed transaction' };
      }

      if (transaction.status === 'cancelled') {
        return { success: false, message: 'Transaction already cancelled' };
      }

      await this.db.updateTransactionStatus(transactionId, 'cancelled');

      return {
        success: true,
        message: 'Transaction cancelled successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to cancel transaction'
      };
    }
  }

  async getMiniStatement(userId: string): Promise<Transaction[]> {
    return await this.db.getTransactionsByUserId(userId, 5);
  }
}
