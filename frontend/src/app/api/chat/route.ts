import { NextRequest, NextResponse } from 'next/server';
import { ConversationOrchestrator } from '@/services/conversationOrchestrator';

const orchestrators = new Map<string, ConversationOrchestrator>();

export async function POST(request: NextRequest) {
  try {
    const { conversationId, userId, message } = await request.json();

    if (!conversationId || !userId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, userId, message' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Get or create orchestrator for this session
    let orchestrator = orchestrators.get(conversationId);
    if (!orchestrator) {
      orchestrator = new ConversationOrchestrator(apiKey);
      orchestrators.set(conversationId, orchestrator);
    }

    // Process the message
    const result = await orchestrator.processMessage(conversationId, userId, message);

    return NextResponse.json({
      response: result.response,
      context: result.context
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      );
    }

    // Clear conversation
    const orchestrator = orchestrators.get(conversationId);
    if (orchestrator) {
      orchestrator.clearConversation(conversationId);
      orchestrators.delete(conversationId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
