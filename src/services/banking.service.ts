import { Database } from '../database';
import { Offer, Branch } from '../types';

export class BankingService {
  constructor(private db: Database) {}

  async getOffers(): Promise<Offer[]> {
    return await this.db.getAllOffers();
  }

  async getBranches(): Promise<Branch[]> {
    return await this.db.getAllBranches();
  }

  async getAccountBalance(userId: string): Promise<{ success: boolean; balance?: number; accountNumber?: string; message: string }> {
    try {
      const account = await this.db.getAccountByUserId(userId);
      if (!account) {
        return { success: false, message: 'Account not found' };
      }

      return {
        success: true,
        balance: account.balance,
        accountNumber: account.accountNumber,
        message: 'Account balance retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve account balance'
      };
    }
  }

  async getAccountDetails(userId: string): Promise<{ success: boolean; user?: any; account?: any; message: string }> {
    try {
      const user = await this.db.getUserById(userId);
      const account = await this.db.getAccountByUserId(userId);

      if (!user || !account) {
        return { success: false, message: 'Account details not found' };
      }

      // Remove sensitive information
      const { password, ...userDetails } = user;

      return {
        success: true,
        user: userDetails,
        account,
        message: 'Account details retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve account details'
      };
    }
  }
}
