import { FastifyPluginAsync } from 'fastify';
import { TransactionService } from '../services/transaction.service';
import { Database } from '../database';

const transactionRoutes: FastifyPluginAsync = async function (fastify) {
  const db = new Database();
  const transactionService = new TransactionService(db);

  // Send money
  fastify.post('/send', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const { toAccountNumber, amount, description } = request.body as {
        toAccountNumber: string;
        amount: number;
        description?: string;
      };
      const userId = request.user.userId;

      console.log(`💸 [${new Date().toISOString()}] Transfer request - User: ${userId}, To: ${toAccountNumber}, Amount: ${amount}`);

      // Validate input
      if (!toAccountNumber || !amount) {
        console.log(`❌ [${new Date().toISOString()}] Transfer failed - missing required fields`);
        return reply.code(400).send({ error: 'Recipient account number and amount are required' });
      }

      if (amount <= 0) {
        console.log(`❌ [${new Date().toISOString()}] Transfer failed - invalid amount: ${amount}`);
        return reply.code(400).send({ error: 'Amount must be positive' });
      }

      const result = await transactionService.sendMoney(userId, toAccountNumber, amount, description);
      
      if (!result.success) {
        console.log(`❌ [${new Date().toISOString()}] Transfer failed - ${result.message}`);
        return reply.code(400).send({ error: result.message });
      }

      console.log(`✅ [${new Date().toISOString()}] Transfer successful - Transaction ID: ${result.transactionId}`);

      return {
        success: true,
        data: {
          transactionId: result.transactionId
        },
        message: result.message
      };
    } catch (error) {
      console.log(`💥 [${new Date().toISOString()}] Transfer error: ${error}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get transaction history
  fastify.get('/history', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const userId = request.user.userId;
      const { limit } = request.query as { limit?: string };
      
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      const transactions = await transactionService.getTransactionHistory(userId, limitNumber);

      return {
        success: true,
        data: {
          transactions
        },
        message: 'Transaction history retrieved successfully'
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Cancel transaction
  fastify.post('/cancel', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const { transactionId } = request.body as { transactionId: string };
      const userId = request.user.userId;

      if (!transactionId) {
        return reply.code(400).send({ error: 'Transaction ID is required' });
      }

      const result = await transactionService.cancelTransaction(transactionId, userId);
      
      if (!result.success) {
        return reply.code(400).send({ error: result.message });
      }

      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};

export default transactionRoutes;
