import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/account.routes';
import cardRoutes from './routes/card.routes';
import loanRoutes from './routes/loan.routes';
import transactionRoutes from './routes/transaction.routes';
import supportRoutes from './routes/support.routes';
import generalRoutes from './routes/general.routes';
import { ragRoutes } from './routes/rag.routes';

// Load environment variables
dotenv.config();

const server = fastify({ 
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  },
  trustProxy: true
});

const start = async () => {
  try {
    // Add request logging middleware
    server.addHook('onRequest', async (request, reply) => {
      console.log(`📥 [${new Date().toISOString()}] ${request.method} ${request.url} - Client: ${request.ip}`);
      server.log.info(`Incoming request: ${request.method} ${request.url}`);
    });

    server.addHook('onResponse', async (request, reply) => {
      console.log(`📤 [${new Date().toISOString()}] ${request.method} ${request.url} - Status: ${reply.statusCode} - Duration: ${reply.elapsedTime}ms`);
      server.log.info(`Response sent: ${request.method} ${request.url} - Status: ${reply.statusCode}`);
    });

    // Register CORS
    await server.register(cors, {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    });

    // Register JWT
    await server.register(jwt, {
      secret: process.env.JWT_SECRET || 'hsbc-banking-jwt-secret-key-2025-secure'
    });

    // Add JWT authentication decorator
    server.decorate('authenticate', async function(request: any, reply: any) {
      try {
        console.log(`🔐 [${new Date().toISOString()}] Authenticating request to ${request.url}`);
        await request.jwtVerify();
        console.log(`✅ [${new Date().toISOString()}] Authentication successful for user: ${request.user?.userId || 'unknown'}`);
        server.log.info(`Authentication successful for ${request.url}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.log(`❌ [${new Date().toISOString()}] Authentication failed for ${request.url}: ${errorMessage}`);
        server.log.warn(`Authentication failed for ${request.url}: ${errorMessage}`);
        reply.code(401).send({ error: 'Unauthorized' });
      }
    });

    // Register Swagger
    await server.register(swagger, {
      swagger: {
        info: {
          title: 'HSBC Banking API',
          description: 'Banking Assistant Backend API with JWT Authentication',
          version: '1.0.0'
        },
        host: 'localhost:8080',
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        securityDefinitions: {
          Bearer: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header'
          }
        }
      }
    });

    await server.register(swaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      }
    });

    // Register routes
    const apiPrefix = process.env.API_PREFIX || '/api/v1';
    
    await server.register(authRoutes, { prefix: `${apiPrefix}/auth` });
    await server.register(accountRoutes, { prefix: `${apiPrefix}/account` });
    await server.register(cardRoutes, { prefix: `${apiPrefix}/card` });
    await server.register(loanRoutes, { prefix: `${apiPrefix}/loan` });
    await server.register(transactionRoutes, { prefix: `${apiPrefix}/transaction` });
    await server.register(supportRoutes, { prefix: `${apiPrefix}/support` });
    await server.register(ragRoutes, { prefix: `${apiPrefix}/rag` });
    await server.register(generalRoutes, { prefix: apiPrefix });

    // Root endpoint
    server.get('/', async (request, reply) => {
      return {
        message: 'HSBC Banking API',
        version: '1.0.0',
        documentation: '/documentation',
        endpoints: {
          auth: `${apiPrefix}/auth`,
          account: `${apiPrefix}/account`,
          card: `${apiPrefix}/card`,
          loan: `${apiPrefix}/loan`,
          transaction: `${apiPrefix}/transaction`,
          support: `${apiPrefix}/support`,
          offers: `${apiPrefix}/offers`,
          branches: `${apiPrefix}/branches`,
          health: `${apiPrefix}/health`
        }
      };
    });

    // Error handler
    server.setErrorHandler((error, request, reply) => {
      server.log.error(error);
      reply.status(500).send({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });

    // Start server
    const port = parseInt(process.env.PORT || '8080', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    
    console.log('🚀'.repeat(50));
    console.log(`🚀 HSBC Banking API Server running on http://${host}:${port}`);
    console.log(`📚 API Documentation available at http://${host}:${port}/documentation`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log(`   🔐 POST ${apiPrefix}/auth/login - User authentication`);
    console.log(`   🏦 GET  ${apiPrefix}/account/balance - Get account balance`);
    console.log(`   🏦 GET  ${apiPrefix}/account/mini-statement - Get recent transactions`);
    console.log(`   🏦 GET  ${apiPrefix}/account/details - Get account details`);
    console.log(`   💳 POST ${apiPrefix}/card/block - Block card`);
    console.log(`   💳 POST ${apiPrefix}/card/unblock - Unblock card`);
    console.log(`   💳 POST ${apiPrefix}/card/request - Request new card`);
    console.log(`   💳 GET  ${apiPrefix}/card/list - List user cards`);
    console.log(`   🏠 POST ${apiPrefix}/loan/apply - Apply for loan`);
    console.log(`   🏠 GET  ${apiPrefix}/loan/status - Check loan status`);
    console.log(`   💸 POST ${apiPrefix}/transaction/send - Send money`);
    console.log(`   💸 GET  ${apiPrefix}/transaction/history - Transaction history`);
    console.log(`   💸 POST ${apiPrefix}/transaction/cancel - Cancel transaction`);
    console.log(`   🎧 POST ${apiPrefix}/support/complaint - Raise complaint`);
    console.log(`   🎧 GET  ${apiPrefix}/support/complaint/:id - Track complaint`);
    console.log(`   🧠 POST ${apiPrefix}/rag/documents - Add documents to vector DB`);
    console.log(`   🧠 POST ${apiPrefix}/rag/search - Search for RAG context`);
    console.log(`   🧠 GET  ${apiPrefix}/rag/stats - Vector DB statistics`);
    console.log(`   🧠 DELETE ${apiPrefix}/rag/documents - Delete specific documents`);
    console.log(`   🧠 DELETE ${apiPrefix}/rag/all - Clear entire vector DB`);
    console.log(`   🎁 GET  ${apiPrefix}/offers - Banking offers`);
    console.log(`   🏢 GET  ${apiPrefix}/branches - Branch locations`);
    console.log(`   ❤️  GET  ${apiPrefix}/health - Health check`);
    console.log('');
    console.log('🧪 Test Credentials:');
    console.log('   Username: john_doe   | Password: password');
    console.log('   Username: jane_smith | Password: password');
    console.log('🚀'.repeat(50));
    
    server.log.info(`Server started on ${host}:${port}`);
    
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    await server.close();
    console.log('Server closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
start();
