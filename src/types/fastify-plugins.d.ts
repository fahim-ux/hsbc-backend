// Type declarations for @fastify/cors
declare module '@fastify/cors' {
  import { FastifyPluginCallback } from 'fastify';
  
  interface FastifyCorsOptions {
    origin?: string | boolean | string[] | RegExp | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    credentials?: boolean;
    exposedHeaders?: string | string[];
    allowedHeaders?: string | string[];
    methods?: string | string[];
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
    preflight?: boolean;
    strictPreflight?: boolean;
    hideOptionsRoute?: boolean;
  }

  const cors: FastifyPluginCallback<FastifyCorsOptions>;
  export default cors;
}

// Type declarations for @fastify/jwt
declare module '@fastify/jwt' {
  import { FastifyPluginCallback } from 'fastify';
  
  interface FastifyJWTOptions {
    secret: string | Buffer | object;
    sign?: object;
    verify?: object;
    decode?: object;
    messages?: object;
    trusted?: (request: any, decodedToken: any) => boolean;
  }

  const jwt: FastifyPluginCallback<FastifyJWTOptions>;
  export default jwt;
}

// Type declarations for @fastify/swagger
declare module '@fastify/swagger' {
  import { FastifyPluginCallback } from 'fastify';
  
  interface FastifySwaggerOptions {
    swagger?: {
      info?: {
        title?: string;
        description?: string;
        version?: string;
      };
      host?: string;
      schemes?: string[];
      consumes?: string[];
      produces?: string[];
      securityDefinitions?: object;
    };
    openapi?: object;
    hiddenTag?: string;
    hideUntagged?: boolean;
    exposeRoute?: boolean;
    addModels?: boolean;
    refResolver?: object;
  }

  const swagger: FastifyPluginCallback<FastifySwaggerOptions>;
  export default swagger;
}

// Type declarations for @fastify/swagger-ui
declare module '@fastify/swagger-ui' {
  import { FastifyPluginCallback } from 'fastify';
  
  interface FastifySwaggerUiOptions {
    routePrefix?: string;
    uiConfig?: {
      docExpansion?: string;
      deepLinking?: boolean;
    };
    staticCSP?: boolean;
    theme?: object;
    logo?: object;
  }

  const swaggerUi: FastifyPluginCallback<FastifySwaggerUiOptions>;
  export default swaggerUi;
}
