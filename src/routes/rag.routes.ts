import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { vectorService } from '../services/vector.service';
import Joi from 'joi';

// Schemas for request validation
const addDocumentsSchema = Joi.object({
  documents: Joi.array().items(
    Joi.object({
      text: Joi.string().required().min(10).max(50000),
      metadata: Joi.object().optional()
    })
  ).required().min(1).max(100),
  source: Joi.string().optional().default('api')
});

const searchSchema = Joi.object({
  query: Joi.string().required().min(3).max(1000),
  top_k: Joi.number().integer().min(1).max(20).optional().default(5),
  threshold: Joi.number().min(0).max(1).optional().default(0.5)
});

const deleteDocumentsSchema = Joi.object({
  document_ids: Joi.array().items(Joi.string()).required().min(1)
});

interface AddDocumentsRequest {
  documents: Array<{
    text: string;
    metadata?: Record<string, any>;
  }>;
  source?: string;
}

interface SearchRequest {
  query: string;
  top_k?: number;
  threshold?: number;
}

interface DeleteDocumentsRequest {
  document_ids: string[];
}

export async function ragRoutes(server: FastifyInstance) {
  // Add documents to vector database
  server.post<{ Body: AddDocumentsRequest }>('/documents', {
    schema: {
      tags: ['RAG'],
      summary: 'Add documents to vector database',
      description: 'Upload and process documents for RAG context retrieval',
      body: {
        type: 'object',
        required: ['documents'],
        properties: {
          documents: {
            type: 'array',
            items: {
              type: 'object',
              required: ['text'],
              properties: {
                text: { 
                  type: 'string', 
                  minLength: 10, 
                  maxLength: 50000,
                  description: 'Document text content' 
                },
                metadata: { 
                  type: 'object',
                  description: 'Optional metadata for the document'
                }
              }
            },
            minItems: 1,
            maxItems: 100
          },
          source: { 
            type: 'string',
            description: 'Source identifier for the documents'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                document_ids: { 
                  type: 'array',
                  items: { type: 'string' }
                },
                total_chunks: { type: 'number' },
                processing_time_ms: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: AddDocumentsRequest }>, reply: FastifyReply) => {
    const startTime = Date.now();
    
    try {
      console.log(`📄 Processing ${request.body.documents.length} documents for embedding...`);
      
      // Validate request body
      const { error, value } = addDocumentsSchema.validate(request.body);
      if (error) {
        return reply.code(400).send({
          success: false,
          message: `Validation error: ${error.details[0].message}`,
          data: null
        });
      }

      // Add source to metadata
      const documentsWithSource = value.documents.map((doc: any) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          source: value.source,
          uploaded_by: 'anonymous',
          uploaded_at: new Date().toISOString()
        }
      }));

      // Process documents
      const documentIds = await vectorService.addDocuments(documentsWithSource);
      const processingTime = Date.now() - startTime;

      console.log(`✅ Successfully processed ${documentIds.length} document chunks in ${processingTime}ms`);

      return reply.send({
        success: true,
        message: `Successfully added ${documentIds.length} document chunks to vector database`,
        data: {
          document_ids: documentIds,
          total_chunks: documentIds.length,
          processing_time_ms: processingTime
        }
      });

    } catch (error) {
      console.error('❌ Error adding documents:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to process documents',
        data: null
      });
    }
  });

  // Search for relevant context
  server.post<{ Body: SearchRequest }>('/search', {
    schema: {
      tags: ['RAG'],
      summary: 'Search vector database for relevant context',
      description: 'Retrieve relevant document chunks for RAG context',
      body: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { 
            type: 'string',
            minLength: 3,
            maxLength: 1000,
            description: 'Search query text' 
          },
          top_k: { 
            type: 'integer',
            minimum: 1,
            maximum: 20,
            default: 5,
            description: 'Number of top results to return'
          },
          threshold: { 
            type: 'number',
            minimum: 0,
            maximum: 1,
            default: 0.5,
            description: 'Minimum similarity threshold'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                query: { type: 'string' },
                results: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      text: { type: 'string' },
                      similarity: { type: 'number' },
                      metadata: { type: 'object' }
                    }
                  }
                },
                total_results: { type: 'number' },
                search_time_ms: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: SearchRequest }>, reply: FastifyReply) => {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Searching for: "${request.body.query}"`);
      
      // Validate request body
      const { error, value } = searchSchema.validate(request.body);
      if (error) {
        return reply.code(400).send({
          success: false,
          message: `Validation error: ${error.details[0].message}`,
          data: null
        });
      }

      // Perform search
      const results = await vectorService.search(
        value.query,
        value.top_k,
        value.threshold
      );

      const searchTime = Date.now() - startTime;

      console.log(`✅ Found ${results.length} relevant chunks in ${searchTime}ms`);

      return reply.send({
        success: true,
        message: `Found ${results.length} relevant document chunks`,
        data: {
          query: value.query,
          results: results.map(result => ({
            id: result.chunk.id,
            text: result.chunk.text,
            similarity: Math.round(result.similarity * 1000) / 1000, // Round to 3 decimal places
            metadata: result.chunk.metadata
          })),
          total_results: results.length,
          search_time_ms: searchTime
        }
      });

    } catch (error) {
      console.error('❌ Error searching documents:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to search documents',
        data: null
      });
    }
  });

  // Get vector database statistics
  server.get('/stats', {
    schema: {
      tags: ['RAG'],
      summary: 'Get vector database statistics',
      description: 'Retrieve information about the current vector database',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                total_chunks: { type: 'number' },
                model: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: { type: 'string' },
                sample_chunks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      text_preview: { type: 'string' },
                      metadata: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    preHandler: server.authenticate
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('📊 Getting vector database statistics...');
      
      const stats = await vectorService.getStats();

      return reply.send({
        success: true,
        message: 'Vector database statistics retrieved successfully',
        data: stats
      });

    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to retrieve statistics',
        data: null
      });
    }
  });

  // Delete documents from vector database
  server.delete<{ Body: DeleteDocumentsRequest }>('/documents', {
    schema: {
      tags: ['RAG'],
      summary: 'Delete documents from vector database',
      description: 'Remove specific document chunks from the vector database',
      body: {
        type: 'object',
        required: ['document_ids'],
        properties: {
          document_ids: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            description: 'Array of document IDs to delete'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                deleted_count: { type: 'number' },
                remaining_chunks: { type: 'number' }
              }
            }
          }
        }
      }
    },
    preHandler: server.authenticate
  }, async (request: FastifyRequest<{ Body: DeleteDocumentsRequest }>, reply: FastifyReply) => {
    try {
      console.log(`🗑️ Deleting ${request.body.document_ids.length} document chunks...`);
      
      // Validate request body
      const { error, value } = deleteDocumentsSchema.validate(request.body);
      if (error) {
        return reply.code(400).send({
          success: false,
          message: `Validation error: ${error.details[0].message}`,
          data: null
        });
      }

      // Delete documents
      const deletedCount = await vectorService.deleteDocuments(value.document_ids);
      const stats = await vectorService.getStats();

      console.log(`✅ Deleted ${deletedCount} document chunks`);

      return reply.send({
        success: true,
        message: `Successfully deleted ${deletedCount} document chunks`,
        data: {
          deleted_count: deletedCount,
          remaining_chunks: stats.total_chunks
        }
      });

    } catch (error) {
      console.error('❌ Error deleting documents:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to delete documents',
        data: null
      });
    }
  });

  // Clear entire vector database
  server.delete('/all', {
    schema: {
      tags: ['RAG'],
      summary: 'Clear entire vector database',
      description: 'Remove all documents from the vector database',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'null' }
          }
        }
      }
    },
    preHandler: server.authenticate
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('🗑️ Clearing entire vector database...');
      
      await vectorService.clearDatabase();

      console.log('✅ Vector database cleared successfully');

      return reply.send({
        success: true,
        message: 'Vector database cleared successfully',
        data: null
      });

    } catch (error) {
      console.error('❌ Error clearing database:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to clear database',
        data: null
      });
    }
  });
}
