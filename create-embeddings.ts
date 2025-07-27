import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080/api/v1';

class SimpleDocumentProcessor {
  // Read and process the HSBC document
  async loadHSBCDocument(): Promise<string> {
    try {
      console.log('📖 Loading HSBC comprehensive document...');
      
      const documentPath = path.join(process.cwd(), 'data', 'hsbc-bank-comprehensive-info.md');
      const documentContent = await fs.readFile(documentPath, 'utf-8');
      
      console.log(`✅ Document loaded successfully (${documentContent.length} characters)`);
      return documentContent;
      
    } catch (error) {
      console.error('❌ Error loading document:', error);
      throw error;
    }
  }

  // Split document into logical sections for better vectorization
  splitDocumentIntoSections(content: string): Array<{text: string; metadata: any}> {
    console.log('✂️ Splitting document into logical sections...');
    
    const sections: Array<{text: string; metadata: any}> = [];
    
    // Split by main headings (##)
    const mainSections = content.split(/(?=^## )/gm).filter(section => section.trim());
    
    for (let i = 0; i < mainSections.length; i++) {
      const section = mainSections[i].trim();
      if (!section) continue;
      
      // Extract section title
      const titleMatch = section.match(/^## (.+)$/m);
      const sectionTitle = titleMatch ? titleMatch[1].trim() : `Section ${i + 1}`;
      
      // For longer sections, split by subsections (###)
      if (section.length > 2000) {
        const subsections = section.split(/(?=^### )/gm).filter(sub => sub.trim());
        
        for (let j = 0; j < subsections.length; j++) {
          const subsection = subsections[j].trim();
          if (!subsection) continue;
          
          const subTitleMatch = subsection.match(/^### (.+)$/m);
          const subsectionTitle = subTitleMatch ? subTitleMatch[1].trim() : `Subsection ${j + 1}`;
          
          sections.push({
            text: subsection,
            metadata: {
              document_type: 'hsbc_bank_info',
              section: sectionTitle,
              subsection: subsectionTitle,
              section_index: i,
              subsection_index: j,
              category: this.categorizeSection(sectionTitle, subsectionTitle),
              processed_at: new Date().toISOString()
            }
          });
        }
      } else {
        // For shorter sections, add as-is
        sections.push({
          text: section,
          metadata: {
            document_type: 'hsbc_bank_info',
            section: sectionTitle,
            section_index: i,
            category: this.categorizeSection(sectionTitle),
            processed_at: new Date().toISOString()
          }
        });
      }
    }
    
    console.log(`✅ Document split into ${sections.length} sections`);
    return sections;
  }

  // Categorize sections for better organization
  private categorizeSection(sectionTitle: string, subsectionTitle?: string): string {
    const title = (sectionTitle + ' ' + (subsectionTitle || '')).toLowerCase();
    
    if (title.includes('loan') || title.includes('mortgage') || title.includes('financing')) {
      return 'loans_and_financing';
    }
    if (title.includes('credit card') || title.includes('card')) {
      return 'credit_cards';
    }
    if (title.includes('saving') || title.includes('checking') || title.includes('account')) {
      return 'bank_accounts';
    }
    if (title.includes('rate') || title.includes('fee') || title.includes('interest')) {
      return 'rates_and_fees';
    }
    if (title.includes('digital') || title.includes('online') || title.includes('mobile') || title.includes('app')) {
      return 'digital_services';
    }
    if (title.includes('business')) {
      return 'business_banking';
    }
    if (title.includes('about') || title.includes('company') || title.includes('overview')) {
      return 'company_information';
    }
    if (title.includes('application') || title.includes('process') || title.includes('requirement')) {
      return 'processes_and_requirements';
    }
    
    return 'general_information';
  }

  // Add documents to vector database (no authentication required)
  async vectorizeAndStore(documents: Array<{text: string; metadata: any}>): Promise<void> {
    try {
      console.log(`🧠 Vectorizing and storing ${documents.length} document sections...`);
      
      // Process in batches to avoid overwhelming the system
      const batchSize = 3;
      let totalProcessed = 0;
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}...`);
        
        const response = await fetch(`${API_BASE}/rag/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documents: batch,
            source: 'hsbc_comprehensive_document'
          })
        });

        const data = await response.json() as any;
        
        if (data.success) {
          totalProcessed += data.data.total_chunks;
          console.log(`✅ Batch processed: ${data.data.total_chunks} chunks in ${data.data.processing_time_ms}ms`);
        } else {
          throw new Error(`Batch processing failed: ${data.message}`);
        }
        
        // Small delay between batches to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log(`🎉 Successfully vectorized and stored ${totalProcessed} document chunks!`);
      
    } catch (error) {
      console.error('❌ Error vectorizing documents:', error);
      throw error;
    }
  }

  // Test the vectorized knowledge base with sample queries
  async testKnowledgeBase(): Promise<void> {
    try {
      console.log('\n🧪 Testing the vectorized knowledge base...\n');
      
      const testQueries = [
        'What types of home loans does HSBC offer?',
        'What are the interest rates for personal loans?',
        'What credit cards are available and what are their benefits?',
        'What is the minimum balance for HSBC savings accounts?',
        'What documents are required for a business loan application?'
      ];

      for (const query of testQueries) {
        console.log(`🔍 Query: "${query}"`);
        
        const response = await fetch(`${API_BASE}/rag/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock_jwt_token_user-1_1753613428679'
          },
          body: JSON.stringify({
            query: query,
            top_k: 2,
            threshold: 0.3
          })
        });

        const data = await response.json() as any;
        
        if (data.success && data.data.results.length > 0) {
          console.log(`✅ Found ${data.data.results.length} relevant results:`);
          
          data.data.results.forEach((result: any, index: number) => {
            console.log(`   ${index + 1}. [${result.similarity.toFixed(3)}] ${result.metadata.category} - ${result.metadata.section}`);
            console.log(`      Preview: ${result.text.substring(0, 100)}...`);
          });
        } else {
          console.log('❌ No relevant results found');
        }
        
        console.log(''); // Empty line for readability
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between queries
      }
      
    } catch (error) {
      console.error('❌ Error testing knowledge base:', error);
      throw error;
    }
  }

  // Get final statistics
  async getFinalStats(): Promise<void> {
    try {
      console.log('📊 Getting final vector database statistics...\n');
      
      const response = await fetch(`${API_BASE}/rag/stats`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer mock_jwt_token_user-1_1753613428679'
        }
      });

      const data = await response.json() as any;
      
      if (data.success) {
        console.log('🎯 Final Vector Database Statistics:');
        console.log(`   📚 Total document chunks: ${data.data.total_chunks}`);
        console.log(`   🤖 Embedding model: ${data.data.model}`);
        console.log(`   📅 Last updated: ${new Date(data.data.updated_at).toLocaleString()}`);
        console.log(`   💾 Storage location: data/vector-db.json`);
        
        console.log('\n📋 Document categories found:');
        const categories = new Set();
        data.data.sample_chunks.forEach((chunk: any) => {
          if (chunk.metadata.category) {
            categories.add(chunk.metadata.category);
          }
        });
        
        categories.forEach(category => {
          console.log(`   • ${category}`);
        });
        
      } else {
        throw new Error(data.message);
      }
      
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }

  // Run the complete process
  async processHSBCDocument(): Promise<void> {
    try {
      console.log('🚀 Starting HSBC Document Processing and Vectorization\n');
      
      // Step 1: Load document
      const documentContent = await this.loadHSBCDocument();
      
      // Step 2: Split into sections
      const sections = this.splitDocumentIntoSections(documentContent);
      
      // Step 3: Vectorize and store
      await this.vectorizeAndStore(sections);
      
      // Step 4: Test the knowledge base
      await this.testKnowledgeBase();
      
      // Step 5: Get final statistics
      await this.getFinalStats();
      
      console.log('\n🎉 HSBC Document Processing Complete!');
      console.log('✅ Your RAG system is now ready with comprehensive HSBC banking information.');
      console.log('🔧 You can now use the /api/v1/rag/search endpoint to retrieve relevant context for customer queries.');
      
    } catch (error) {
      console.error('❌ Document processing failed:', error);
      process.exit(1);
    }
  }
}

// Run the processor if this file is executed directly
if (require.main === module) {
  const processor = new SimpleDocumentProcessor();
  processor.processHSBCDocument().catch(console.error);
}

export { SimpleDocumentProcessor };
