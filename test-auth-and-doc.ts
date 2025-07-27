import fs from 'fs/promises';
import path from 'path';

// Simple test to check authentication response format
async function testAuth() {
  const testUser = {
    username: 'john_doe',
    password: 'password'
  };

  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response text:', responseText);

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed JSON:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Failed to parse as JSON');
    }

  } catch (error) {
    console.error('Request error:', error);
  }
}

// Simple document processing without authentication issues
async function processDocumentSimple() {
  try {
    console.log('📖 Loading HSBC document...');
    
    const documentPath = path.join(process.cwd(), 'data', 'hsbc-bank-comprehensive-info.md');
    const documentContent = await fs.readFile(documentPath, 'utf-8');
    
    console.log(`Document loaded: ${documentContent.length} characters`);
    
    // Split document into sections
    const sections = documentContent.split(/(?=^## )/gm).filter(section => section.trim());
    console.log(`Document split into ${sections.length} main sections`);
    
    // Create documents array for the API
    const documents = sections.map((section, index) => {
      const titleMatch = section.match(/^## (.+)$/m);
      const sectionTitle = titleMatch ? titleMatch[1].trim() : `Section ${index + 1}`;
      
      return {
        text: section,
        metadata: {
          document_type: 'hsbc_bank_info',
          section: sectionTitle,
          section_index: index,
          category: categorizeSection(sectionTitle),
          processed_at: new Date().toISOString()
        }
      };
    });

    console.log('✅ Documents prepared for vectorization');
    console.log('Document sections:');
    documents.forEach((doc, i) => {
      console.log(`  ${i + 1}. ${doc.metadata.section} (${doc.metadata.category})`);
    });

    return documents;

  } catch (error) {
    console.error('Error processing document:', error);
  }
}

function categorizeSection(sectionTitle: string): string {
  const title = sectionTitle.toLowerCase();
  
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

async function run() {
  console.log('🔍 Testing authentication...');
  await testAuth();
  
  console.log('\n📄 Processing document...');
  await processDocumentSimple();
}

run().catch(console.error);
