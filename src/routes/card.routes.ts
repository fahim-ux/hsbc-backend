import { FastifyPluginAsync } from 'fastify';
import { CardService } from '../services/card.service';
import { Database } from '../database';

const cardRoutes: FastifyPluginAsync = async function (fastify) {
  const db = new Database();
  const cardService = new CardService(db);

  // Block card
  fastify.post('/block', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const { cardId } = request.body as { cardId: string };
      const userId = request.user.userId;

      if (!cardId) {
        return reply.code(400).send({ error: 'Card ID is required' });
      }

      const result = await cardService.blockCard(cardId, userId);
      
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

  // Unblock card
  fastify.post('/unblock', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const { cardId } = request.body as { cardId: string };
      const userId = request.user.userId;

      if (!cardId) {
        return reply.code(400).send({ error: 'Card ID is required' });
      }

      const result = await cardService.unblockCard(cardId, userId);
      
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

  // Request new card
  fastify.post('/request', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const { cardType } = request.body as { cardType: 'debit' | 'credit' };
      const userId = request.user.userId;

      if (!cardType || !['debit', 'credit'].includes(cardType)) {
        return reply.code(400).send({ error: 'Valid card type (debit/credit) is required' });
      }

      const result = await cardService.requestNewCard(userId, cardType);
      
      if (!result.success) {
        return reply.code(400).send({ error: result.message });
      }

      return {
        success: true,
        data: {
          cardId: result.cardId
        },
        message: result.message
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get user cards
  fastify.get('/list', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const userId = request.user.userId;
      const cards = await cardService.getUserCards(userId);

      return {
        success: true,
        data: {
          cards
        },
        message: 'Cards retrieved successfully'
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};

export default cardRoutes;
