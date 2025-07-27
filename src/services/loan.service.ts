import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { Loan } from '../types';

export class LoanService {
  constructor(private db: Database) {}

  async applyForLoan(
    userId: string,
    loanType: 'personal' | 'home' | 'car' | 'education',
    amount: number,
    tenure: number
  ): Promise<{ success: boolean; loanId?: string; message: string }> {
    try {
      const loanId = uuidv4();
      const interestRate = this.getInterestRate(loanType, amount);

      const loan: Omit<Loan, 'applicationDate'> = {
        id: loanId,
        userId,
        loanType,
        amount,
        interestRate,
        tenure,
        status: 'pending'
      };

      await this.db.createLoan(loan);

      return {
        success: true,
        loanId,
        message: `${loanType} loan application submitted successfully. You will receive a response within 2-3 business days.`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit loan application'
      };
    }
  }

  async getLoanStatus(userId: string): Promise<Loan[]> {
    return await this.db.getLoansByUserId(userId);
  }

  private getInterestRate(loanType: string, amount: number): number {
    // Simplified interest rate calculation
    switch (loanType) {
      case 'personal':
        return amount > 500000 ? 10.5 : 12.0;
      case 'home':
        return 8.5;
      case 'car':
        return 9.5;
      case 'education':
        return 7.5;
      default:
        return 12.0;
    }
  }
}
