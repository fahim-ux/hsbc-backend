import { FastifyPluginAsync } from 'fastify';
import { BankingService } from '../services/banking.service';
import { Database } from '../database';

const generalRoutes: FastifyPluginAsync = async function (fastify) {
  const db = new Database();
  const bankingService = new BankingService(db);

  // Get offers
  fastify.get('/offers', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const offers = await bankingService.getOffers();

      return {
        success: true,
        data: {
          offers
        },
        message: 'Offers retrieved successfully'
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get branches
  fastify.get('/branches', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const branches = await bankingService.getBranches();

      return {
        success: true,
        data: {
          branches
        },
        message: 'Branches retrieved successfully'
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Health check endpoint
  fastify.get('/health', async (request: any, reply: any) => {
    return {
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString()
    };
  });
};

export default generalRoutes;
