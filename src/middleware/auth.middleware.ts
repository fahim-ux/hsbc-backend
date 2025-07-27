import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    // User info is automatically added to request by @fastify/jwt
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}

export function validateRequest(schema: any) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { error } = schema.validate(request.body);
      if (error) {
        reply.code(400).send({ error: error.details[0].message });
        return;
      }
    } catch (err) {
      reply.code(400).send({ error: 'Invalid request data' });
    }
  };
}
