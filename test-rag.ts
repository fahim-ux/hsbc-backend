import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api/v1';

// Test credentials
const testUser = {
  username: 'john_doe',
  password: 'password'
};

// Sample banking documents to test the RAG system
const sampleDocuments = [
  {
    text: `HSBC Savings Account Terms and Conditions:
    
    1. Account Opening: To open a savings account with HSBC, you must be at least 18 years old and provide valid identification documents including passport or national ID card.
    
    2. Minimum Balance: The minimum balance required to maintain a savings account is $500. If the balance falls below this amount, a monthly maintenance fee of $10 will be charged.
    
    3. Interest Rates: Current interest rate for savings accounts is 2.5% per annum, calculated daily and credited monthly to your account.
    
    4. Transaction Limits: You can make up to 6 free withdrawals per month. Additional withdrawals will incur a fee of $5 per transaction.
    
    5. Online Banking: Free online banking services are available 24/7. You can check balances, transfer funds, and pay bills through our secure online platform.
    
    6. Customer Support: Our customer service team is available Monday to Friday 9 AM to 5 PM. For urgent matters, call our 24/7 hotline at 1-800-HSBC-HELP.`,
    metadata: {
      type: 'terms_and_conditions',
      product: 'savings_account',
      category: 'banking_products'
    }
  },
  {
    text: `HSBC Credit Card Benefits and Features:
    
    1. Reward Points: Earn 2 points for every $1 spent on purchases. Points can be redeemed for cash back, travel, or merchandise.
    
    2. Annual Fee: No annual fee for the first year. After that, $95 annual fee applies, waived if you spend $12,000 or more annually.
    
    3. Credit Limit: Initial credit limit based on income and credit score, ranging from $1,000 to $50,000.
    
    4. Cash Advance: Available up to 30% of your credit limit. Cash advance fee is 3% of the amount or $10, whichever is higher.
    
    5. Foreign Transaction: No foreign transaction fees when using your card abroad. Competitive exchange rates apply.
    
    6. Security Features: EMV chip technology, fraud monitoring, and zero liability protection against unauthorized transactions.
    
    7. Mobile App: Manage your account, make payments, and track spending through our mobile banking app available for iOS and Android.`,
    metadata: {
      type: 'product_features',
      product: 'credit_card',
      category: 'banking_products'
    }
  },
  {
    text: `HSBC Home Loan Information:
    
    1. Loan Types: We offer fixed-rate mortgages, adjustable-rate mortgages (ARM), and refinancing options for existing homeowners.
    
    2. Interest Rates: Current rates start from 3.75% for 30-year fixed mortgages and 3.25% for 15-year fixed mortgages.
    
    3. Down Payment: Minimum down payment requirement is 10% for conventional loans. First-time homebuyers may qualify for 5% down payment programs.
    
    4. Loan Amount: Minimum loan amount is $50,000. Maximum loan amount depends on property value and borrower qualifications, up to $2 million.
    
    5. Processing Time: Pre-approval takes 1-3 business days. Full loan processing typically takes 30-45 days from application to closing.
    
    6. Required Documents: Income statements, tax returns, bank statements, employment verification, and property appraisal are required.
    
    7. Closing Costs: Estimated closing costs range from 2-5% of the loan amount, including appraisal fees, title insurance, and attorney fees.`,
    metadata: {
      type: 'product_information',
      product: 'home_loan',
      category: 'lending'
    }
  }
];

class RAGTestClient {
  private authToken: string = '';

  // Authenticate and get JWT token
  async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUser)
      });

      const data = await response.json() as any;
      
      if (data.success && data.data.token) {
        this.authToken = data.data.token;
        console.log('✅ Authentication successful');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }

  // Add documents to vector database
  async addDocuments(): Promise<void> {
    try {
      console.log('📄 Adding sample documents to vector database...');
      
      const response = await fetch(`${API_BASE}/rag/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          documents: sampleDocuments,
          source: 'test_data'
        })
      });

      const data = await response.json() as any;
      
      if (data.success) {
        console.log(`✅ Successfully added ${data.data.total_chunks} document chunks`);
        console.log(`⏱️  Processing time: ${data.data.processing_time_ms}ms`);
        return data.data.document_ids;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error adding documents:', error);
      throw error;
    }
  }

  // Search for relevant context
  async searchContext(query: string, topK: number = 3): Promise<any> {
    try {
      console.log(`🔍 Searching for: "${query}"`);
      
      const response = await fetch(`${API_BASE}/rag/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          query: query,
          top_k: topK,
          threshold: 0.3
        })
      });

      const data = await response.json() as any;
      
      if (data.success) {
        console.log(`✅ Found ${data.data.total_results} relevant chunks`);
        console.log(`⏱️  Search time: ${data.data.search_time_ms}ms\n`);
        
        data.data.results.forEach((result: any, index: number) => {
          console.log(`📋 Result ${index + 1} (Similarity: ${result.similarity}):`);
          console.log(`   Text: ${result.text.substring(0, 200)}...`);
          console.log(`   Product: ${result.metadata.product}`);
          console.log(`   Type: ${result.metadata.type}\n`);
        });
        
        return data.data.results;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error searching:', error);
      throw error;
    }
  }

  // Get vector database statistics
  async getStats(): Promise<void> {
    try {
      console.log('📊 Getting vector database statistics...');
      
      const response = await fetch(`${API_BASE}/rag/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      const data = await response.json() as any;
      
      if (data.success) {
        console.log(`✅ Database Statistics:`);
        console.log(`   Total chunks: ${data.data.total_chunks}`);
        console.log(`   Model: ${data.data.model}`);
        console.log(`   Created: ${data.data.created_at}`);
        console.log(`   Updated: ${data.data.updated_at}\n`);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }

  // Run comprehensive test
  async runTest(): Promise<void> {
    try {
      console.log('🚀 Starting RAG System Test\n');
      
      // Step 1: Authenticate
      await this.authenticate();
      
      // Step 2: Add documents
      await this.addDocuments();
      
      // Step 3: Get stats
      await this.getStats();
      
      // Step 4: Test various search queries
      const testQueries = [
        'What is the minimum balance for savings account?',
        'How do credit card rewards work?',
        'What documents are needed for home loan?',
        'What are the interest rates for mortgages?',
        'How can I contact customer support?'
      ];

      for (const query of testQueries) {
        await this.searchContext(query);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between searches
      }
      
      console.log('✅ RAG System test completed successfully!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const testClient = new RAGTestClient();
  testClient.runTest().catch(console.error);
}

export { RAGTestClient };
