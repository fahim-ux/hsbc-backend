# RAG (Retrieval-Augmented Generation) API Documentation

## Overview

The RAG API provides endpoints for managing a vector database that stores document embeddings and enables semantic search for context retrieval. This system is designed to support AI assistants and chatbots by providing relevant context from your document collection.

## Features

- **Document Embedding**: Convert text documents into vector embeddings using state-of-the-art models
- **Semantic Search**: Find relevant document chunks based on query similarity
- **Vector Storage**: Store embeddings in a JSON-based vector database
- **Authentication**: All endpoints require JWT authentication
- **Comprehensive Logging**: Full request/response tracking for debugging

## Authentication

All RAG endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

To get a token, first authenticate using the login endpoint:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "password"}'
```

## Endpoints

### 1. Add Documents
**POST** `/api/v1/rag/documents`

Add documents to the vector database. Documents are automatically chunked and embedded.

**Request Body:**
```json
{
  "documents": [
    {
      "text": "Your document content here...",
      "metadata": {
        "title": "Document Title",
        "category": "banking",
        "type": "policy"
      }
    }
  ],
  "source": "api_upload"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully added 5 document chunks to vector database",
  "data": {
    "document_ids": ["doc_123_chunk_0", "doc_123_chunk_1"],
    "total_chunks": 5,
    "processing_time_ms": 1250
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/rag/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "documents": [
      {
        "text": "HSBC Savings Account offers competitive interest rates and flexible terms...",
        "metadata": {"product": "savings", "type": "info"}
      }
    ],
    "source": "product_docs"
  }'
```

### 2. Search for Context
**POST** `/api/v1/rag/search`

Search the vector database for relevant document chunks based on a query.

**Request Body:**
```json
{
  "query": "What are the interest rates for savings accounts?",
  "top_k": 5,
  "threshold": 0.5
}
```

**Parameters:**
- `query` (required): Search query text
- `top_k` (optional): Number of results to return (default: 5, max: 20)
- `threshold` (optional): Minimum similarity score (default: 0.5, range: 0-1)

**Response:**
```json
{
  "success": true,
  "message": "Found 3 relevant document chunks",
  "data": {
    "query": "What are the interest rates for savings accounts?",
    "results": [
      {
        "id": "doc_123_chunk_1",
        "text": "Current interest rate for savings accounts is 2.5% per annum...",
        "similarity": 0.887,
        "metadata": {
          "product": "savings",
          "type": "info",
          "chunk_index": 1
        }
      }
    ],
    "total_results": 3,
    "search_time_ms": 45
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/rag/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "How do I apply for a home loan?",
    "top_k": 3,
    "threshold": 0.4
  }'
```

### 3. Get Database Statistics
**GET** `/api/v1/rag/stats`

Retrieve information about the current state of the vector database.

**Response:**
```json
{
  "success": true,
  "message": "Vector database statistics retrieved successfully",
  "data": {
    "total_chunks": 25,
    "model": "Xenova/all-MiniLM-L6-v2",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T14:22:15.000Z",
    "sample_chunks": [
      {
        "id": "doc_123_chunk_0",
        "text_preview": "HSBC Savings Account Terms and Conditions: 1. Account Opening...",
        "metadata": {"product": "savings", "type": "terms"}
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/rag/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Delete Specific Documents
**DELETE** `/api/v1/rag/documents`

Remove specific document chunks from the vector database.

**Request Body:**
```json
{
  "document_ids": ["doc_123_chunk_0", "doc_123_chunk_1"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully deleted 2 document chunks",
  "data": {
    "deleted_count": 2,
    "remaining_chunks": 23
  }
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/rag/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"document_ids": ["doc_123_chunk_0", "doc_123_chunk_1"]}'
```

### 5. Clear Entire Database
**DELETE** `/api/v1/rag/all`

Remove all documents from the vector database.

**Response:**
```json
{
  "success": true,
  "message": "Vector database cleared successfully",
  "data": null
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/rag/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Usage Patterns

### For RAG Implementation

1. **Document Ingestion**: Use the `/documents` endpoint to add your knowledge base
2. **Context Retrieval**: Use the `/search` endpoint to find relevant context for user queries
3. **Context Injection**: Pass the retrieved context to your LLM along with the user's question

Example workflow:
```javascript
// 1. User asks a question
const userQuery = "What is the minimum balance for savings account?";

// 2. Search for relevant context
const contextResponse = await fetch('/api/v1/rag/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: userQuery,
    top_k: 3,
    threshold: 0.5
  })
});

const context = await contextResponse.json();

// 3. Combine context with user query for LLM
const prompt = `
Context: ${context.data.results.map(r => r.text).join('\n\n')}

Question: ${userQuery}

Please answer the question based on the provided context.
`;

// 4. Send to your LLM
```

### Best Practices

1. **Document Chunking**: Documents are automatically chunked into ~500 words with 50-word overlap
2. **Metadata Usage**: Include relevant metadata to help with filtering and organization
3. **Search Tuning**: Adjust `threshold` based on your quality requirements (higher = more strict)
4. **Batch Processing**: Add multiple documents in a single request for better performance
5. **Regular Monitoring**: Use the `/stats` endpoint to monitor database growth

## Technical Details

- **Embedding Model**: Uses `Xenova/all-MiniLM-L6-v2` for generating embeddings
- **Vector Storage**: JSON file-based storage in `data/vector-db.json`
- **Similarity Metric**: Cosine similarity for search ranking
- **Chunk Size**: 500 words with 50-word overlap
- **Supported Formats**: Plain text documents with optional metadata

## Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "message": "Validation error: query is required",
  "data": null
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `500`: Internal Server Error

## Testing

Use the provided test script to verify the RAG system:

```bash
npx tsx test-rag.ts
```

This will:
1. Authenticate with the API
2. Add sample documents
3. Perform various search queries
4. Display results and statistics

The test demonstrates typical usage patterns and helps verify that the embedding and search functionality is working correctly.
