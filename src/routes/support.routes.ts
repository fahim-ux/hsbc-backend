import { FastifyPluginAsync } from 'fastify';
import { SupportService } from '../services/support.service';
import { Database } from '../database';

const supportRoutes: FastifyPluginAsync = async function (fastify) {
  const db = new Database();
  const supportService = new SupportService(db);

  // Raise complaint
  fastify.post('/complaint', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const { subject, description, category, priority } = request.body as {
        subject: string;
        description: string;
        category: 'transaction' | 'card' | 'loan' | 'account' | 'general';
        priority?: 'low' | 'medium' | 'high' | 'urgent';
      };
      const userId = request.user.userId;

      // Validate input
      if (!subject || !description || !category) {
        return reply.code(400).send({ error: 'Subject, description, and category are required' });
      }

      if (!['transaction', 'card', 'loan', 'account', 'general'].includes(category)) {
        return reply.code(400).send({ error: 'Invalid category' });
      }

      const result = await supportService.raiseComplaint(userId, subject, description, category, priority);
      
      if (!result.success) {
        return reply.code(400).send({ error: result.message });
      }

      return {
        success: true,
        data: {
          complaintId: result.complaintId
        },
        message: result.message
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Track complaint by ID
  fastify.get('/complaint/:id', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;

      const result = await supportService.trackComplaint(id, userId);
      
      if (!result.success) {
        return reply.code(404).send({ error: result.message });
      }

      return {
        success: true,
        data: {
          complaint: result.complaint
        },
        message: result.message
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get all user complaints
  fastify.get('/complaints', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply: any) => {
    try {
      const userId = request.user.userId;
      const complaints = await supportService.getUserComplaints(userId);

      return {
        success: true,
        data: {
          complaints
        },
        message: 'Complaints retrieved successfully'
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};

export default supportRoutes;
