import { FastifyPluginAsync } from 'fastify';
import { BankingService } from '../services/banking.service';
import { TransactionService } from '../services/transaction.service';
import { Database } from '../database';

const accountRoutes: FastifyPluginAsync = async function (fastify) {
  const db = new Database();
  const bankingService = new BankingService(db);
  const transactionService = new TransactionService(db);

  // Get account balance
  fastify.get('/balance', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const userId = request.user.userId;
      const result = await bankingService.getAccountBalance(userId);
      
      if (!result.success) {
        return reply.code(404).send({ error: result.message });
      }

      return {
        success: true,
        data: {
          balance: result.balance,
          accountNumber: result.accountNumber
        },
        message: result.message
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get mini statement
  fastify.get('/mini-statement', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const userId = request.user.userId;
      const transactions = await transactionService.getMiniStatement(userId);

      return {
        success: true,
        data: {
          transactions
        },
        message: 'Mini statement retrieved successfully'
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get account details
  fastify.get('/details', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const userId = request.user.userId;
      const result = await bankingService.getAccountDetails(userId);
      
      if (!result.success) {
        return reply.code(404).send({ error: result.message });
      }

      return {
        success: true,
        data: {
          user: result.user,
          account: result.account
        },
        message: result.message
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};

export default accountRoutes;
