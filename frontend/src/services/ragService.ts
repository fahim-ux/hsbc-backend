/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles searching banking context and information from vector database
 */

import { RAGSearchRequest, RAGSearchResponse } from '@/types/rag';

export class RAGService {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Search for banking context and information
   */
  async searchBankingContext(request: RAGSearchRequest): Promise<RAGSearchResponse> {
    const url = `${this.baseUrl}/rag/search`;
    
    try {
      console.log('🔍 Searching banking context:', request.query);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          query: request.query,
          top_k: request.top_k || 5,
          threshold: request.threshold || 0.5
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Found ${data.data.total_results} relevant documents in ${data.data.search_time_ms}ms`);
      
      return data;
    } catch (error) {
      console.error('❌ RAG search failed:', error);
      throw new Error(`RAG search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Format search results for display
   */
  formatSearchResults(response: RAGSearchResponse): string {
    if (!response.success || response.data.results.length === 0) {
      return "I couldn't find specific information about that in our banking documentation.";
    }

    const { results } = response.data;
    
    let formattedResponse = `Based on HSBC's banking information, here's what I found:\n\n`;
    
    results.forEach((result, index) => {
      formattedResponse += `${index + 1}. ${result.text.trim()}\n\n`;
    });

    formattedResponse += `\n💡 This information is sourced from HSBC's official banking documentation.`;
    
    return formattedResponse;
  }

  /**
   * Search for loan-specific information
   */
  async searchLoanInfo(loanType?: string): Promise<string> {
    let query = "What types of loans does HSBC offer? What are the interest rates, tenure options, and eligibility criteria?";
    
    if (loanType) {
      query = `What are the details for ${loanType} loans at HSBC? Include interest rates, tenure, eligibility, and requirements.`;
    }

    try {
      const response = await this.searchBankingContext({
        query,
        top_k: 3,
        threshold: 0.4
      });

      return this.formatSearchResults(response);
    } catch (error) {
      return `I apologize, but I couldn't retrieve loan information at the moment. ${error instanceof Error ? error.message : 'Please try again later.'}`;
    }
  }

  /**
   * Search for general banking rules and regulations
   */
  async searchBankingRules(topic?: string): Promise<string> {
    let query = "What are HSBC's banking rules, regulations, terms and conditions?";
    
    if (topic) {
      query = `What are HSBC's rules and regulations regarding ${topic}?`;
    }

    try {
      const response = await this.searchBankingContext({
        query,
        top_k: 3,
        threshold: 0.4
      });

      return this.formatSearchResults(response);
    } catch (error) {
      return `I apologize, but I couldn't retrieve banking rules information at the moment. ${error instanceof Error ? error.message : 'Please try again later.'}`;
    }
  }
}

// Create default instance
export const ragService = new RAGService();

export default RAGService;
