import { pipeline } from '@xenova/transformers';
import * as fs from 'fs/promises';
import * as path from 'path';

interface DocumentChunk {
  id: string;
  text: string;
  metadata: Record<string, any>;
  embedding: number[];
}

interface VectorDatabase {
  chunks: DocumentChunk[];
  model: string;
  created_at: string;
  updated_at: string;
}

export class VectorService {
  private embedder: any = null;
  private vectorDbPath: string;
  private vectorDb: VectorDatabase;

  constructor() {
    this.vectorDbPath = path.join(process.cwd(), 'data', 'vector-db.json');
    this.vectorDb = {
      chunks: [],
      model: 'Xenova/all-MiniLM-L6-v2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Initialize the embedding model
  async initializeEmbedder() {
    if (!this.embedder) {
      console.log('🤖 Initializing embedding model...');
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('✅ Embedding model initialized');
    }
    return this.embedder;
  }

  // Load existing vector database
  async loadVectorDatabase(): Promise<VectorDatabase> {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.vectorDbPath);
      await fs.mkdir(dataDir, { recursive: true });

      const data = await fs.readFile(this.vectorDbPath, 'utf-8');
      this.vectorDb = JSON.parse(data);
      console.log(`📚 Loaded vector database with ${this.vectorDb.chunks.length} chunks`);
    } catch (error) {
      console.log('📝 Creating new vector database');
      await this.saveVectorDatabase();
    }
    return this.vectorDb;
  }

  // Save vector database to file
  async saveVectorDatabase(): Promise<void> {
    this.vectorDb.updated_at = new Date().toISOString();
    await fs.writeFile(this.vectorDbPath, JSON.stringify(this.vectorDb, null, 2));
  }

  // Generate embedding for text
  async generateEmbedding(text: string): Promise<number[]> {
    await this.initializeEmbedder();
    const output = await this.embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Chunk text into smaller pieces
  chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }
    
    return chunks;
  }

  // Add documents to vector database
  async addDocuments(documents: Array<{ text: string; metadata?: Record<string, any> }>): Promise<string[]> {
    await this.loadVectorDatabase();
    const addedIds: string[] = [];

    for (const doc of documents) {
      const chunks = this.chunkText(doc.text);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_chunk_${i}`;
        const embedding = await this.generateEmbedding(chunks[i]);
        
        const documentChunk: DocumentChunk = {
          id: chunkId,
          text: chunks[i],
          metadata: {
            ...doc.metadata,
            chunk_index: i,
            total_chunks: chunks.length,
            created_at: new Date().toISOString()
          },
          embedding
        };

        this.vectorDb.chunks.push(documentChunk);
        addedIds.push(chunkId);
      }
    }

    await this.saveVectorDatabase();
    console.log(`📚 Added ${addedIds.length} document chunks to vector database`);
    return addedIds;
  }

  // Search for similar documents
  async search(query: string, topK: number = 5, threshold: number = 0.5): Promise<Array<{
    chunk: DocumentChunk;
    similarity: number;
  }>> {
    await this.loadVectorDatabase();
    
    if (this.vectorDb.chunks.length === 0) {
      return [];
    }

    const queryEmbedding = await this.generateEmbedding(query);
    
    const results = this.vectorDb.chunks
      .map(chunk => ({
        chunk,
        similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding)
      }))
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    console.log(`🔍 Found ${results.length} relevant chunks for query: "${query}"`);
    return results;
  }

  // Get database statistics
  async getStats(): Promise<{
    total_chunks: number;
    model: string;
    created_at: string;
    updated_at: string;
    sample_chunks: Array<{ id: string; text_preview: string; metadata: Record<string, any> }>;
  }> {
    await this.loadVectorDatabase();
    
    return {
      total_chunks: this.vectorDb.chunks.length,
      model: this.vectorDb.model,
      created_at: this.vectorDb.created_at,
      updated_at: this.vectorDb.updated_at,
      sample_chunks: this.vectorDb.chunks.slice(0, 3).map(chunk => ({
        id: chunk.id,
        text_preview: chunk.text.substring(0, 100) + '...',
        metadata: chunk.metadata
      }))
    };
  }

  // Delete all documents
  async clearDatabase(): Promise<void> {
    this.vectorDb.chunks = [];
    this.vectorDb.updated_at = new Date().toISOString();
    await this.saveVectorDatabase();
    console.log('🗑️ Vector database cleared');
  }

  // Delete specific document chunks
  async deleteDocuments(documentIds: string[]): Promise<number> {
    await this.loadVectorDatabase();
    const initialCount = this.vectorDb.chunks.length;
    
    this.vectorDb.chunks = this.vectorDb.chunks.filter(chunk => 
      !documentIds.includes(chunk.id)
    );
    
    const deletedCount = initialCount - this.vectorDb.chunks.length;
    
    if (deletedCount > 0) {
      await this.saveVectorDatabase();
      console.log(`🗑️ Deleted ${deletedCount} document chunks`);
    }
    
    return deletedCount;
  }
}

// Singleton instance
export const vectorService = new VectorService();
