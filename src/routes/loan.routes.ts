import { FastifyPluginAsync } from 'fastify';
import { LoanService } from '../services/loan.service';
import { Database } from '../database';

const loanRoutes: FastifyPluginAsync = async function (fastify) {
  const db = new Database();
  const loanService = new LoanService(db);

  // Apply for loan
  fastify.post('/apply', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const { loanType, amount, tenure } = request.body as {
        loanType: 'personal' | 'home' | 'car' | 'education';
        amount: number;
        tenure: number;
      };
      const userId = request.user.userId;

      // Validate input
      if (!loanType || !amount || !tenure) {
        return reply.code(400).send({ error: 'Loan type, amount, and tenure are required' });
      }

      if (!['personal', 'home', 'car', 'education'].includes(loanType)) {
        return reply.code(400).send({ error: 'Invalid loan type' });
      }

      if (amount <= 0 || tenure <= 0) {
        return reply.code(400).send({ error: 'Amount and tenure must be positive numbers' });
      }

      const result = await loanService.applyForLoan(userId, loanType, amount, tenure);
      
      if (!result.success) {
        return reply.code(400).send({ error: result.message });
      }

      return {
        success: true,
        data: {
          loanId: result.loanId
        },
        message: result.message
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get loan status
  fastify.get('/status', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const userId = request.user.userId;
      const loans = await loanService.getLoanStatus(userId);

      return {
        success: true,
        data: {
          loans
        },
        message: 'Loan status retrieved successfully'
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};

export default loanRoutes;
