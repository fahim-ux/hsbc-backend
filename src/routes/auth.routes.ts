import { FastifyPluginAsync } from 'fastify';
import { AuthService } from '../services/auth.service';
import { Database } from '../database';
// import { loginSchema } from '../schemas/validation';

const authRoutes: FastifyPluginAsync = async function (fastify) {
  const db = new Database();
  const authService = new AuthService(db);

  // Login endpoint
  fastify.post('/login', async (request, reply) => {
    try {
      const { username, password } = request.body as { username: string; password: string };
      console.log(`🔑 [${new Date().toISOString()}] Login attempt for username: ${username}`);

      // Validate input
      if (!username || !password) {
        console.log(`❌ [${new Date().toISOString()}] Login failed - missing credentials for: ${username}`);
        return reply.code(400).send({ error: 'Username and password are required' });
      }

      const user = await authService.login(username, password);
      if (!user) {
        console.log(`❌ [${new Date().toISOString()}] Login failed - invalid credentials for: ${username}`);
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const payload = authService.generateJWTPayload(user);
      const token = fastify.jwt.sign(payload);

      console.log(`✅ [${new Date().toISOString()}] Login successful for user: ${username} (ID: ${user.id})`);

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email
        }
      };
    } catch (error) {
      console.log(`💥 [${new Date().toISOString()}] Login error: ${error}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Verify token endpoint
  fastify.get('/verify', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const user = (request as any).user;
    return {
      success: true,
      message: 'Token is valid',
      user
    };
  });
};

export default authRoutes;
