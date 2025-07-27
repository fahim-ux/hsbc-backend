/**
 * RAG (Retrieval-Augmented Generation) Types
 * For searching banking context and information
 */

export interface RAGSearchRequest {
  query: string;
  top_k?: number;
  threshold?: number;
}

export interface RAGSearchResult {
  id: string;
  text: string;
  similarity: number;
  metadata: {
    product?: string;
    type?: string;
    chunk_index?: number;
    [key: string]: any;
  };
}

export interface RAGSearchResponse {
  success: boolean;
  message: string;
  data: {
    query: string;
    results: RAGSearchResult[];
    total_results: number;
    search_time_ms: number;
  };
}

export interface BankingContextFunctionCall {
  name: 'search_banking_context';
  args: {
    query: string;
    top_k?: number;
    threshold?: number;
  };
}
