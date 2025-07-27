import { FastifyInstance, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: any) => Promise<void>;
    jwt: {
      sign: (payload: any) => string;
      verify: (token: string) => any;
    };
  }

  interface FastifyRequest {
    jwtVerify: () => Promise<any>;
    user: any;
  }
}
