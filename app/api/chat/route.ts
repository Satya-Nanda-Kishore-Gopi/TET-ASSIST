import { NextRequest, NextResponse } from 'next/server';
import { GeminiChatService, ChatMessagePayload } from '@/lib/services/gemini';
import { AI_CONFIG } from '@/lib/constants/ai';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || !('messages' in body)) {
      return NextResponse.json(
        { error: 'Payload must contain a "messages" array.' },
        { status: 400 }
      );
    }

    const { messages } = body as { messages: unknown };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '"messages" must be a non-empty array.' },
        { status: 400 }
      );
    }

    // 1. Validate structure of each individual message
    const sanitizedMessages: ChatMessagePayload[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (
        !msg ||
        typeof msg !== 'object' ||
        !('role' in msg) ||
        !('content' in msg)
      ) {
        return NextResponse.json(
          { error: 'Each message must contain valid "role" and "content" fields.' },
          { status: 400 }
        );
      }

      const role = (msg as { role: unknown }).role;
      const content = (msg as { content: unknown }).content;

      if (role !== 'user' && role !== 'assistant') {
        return NextResponse.json(
          { error: 'Message role must be either "user" or "assistant".' },
          { status: 400 }
        );
      }

      if (typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Message content cannot be empty.' },
          { status: 400 }
        );
      }

      sanitizedMessages.push({
        role,
        content: content.trim(),
      });
    }

    // 2. Validate the CURRENT (latest) user message specifically
    const currentMessage = sanitizedMessages[sanitizedMessages.length - 1];

    if (currentMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'The latest message must be from the user.' },
        { status: 400 }
      );
    }

    if (currentMessage.content.length > AI_CONFIG.maxUserMessageLength) {
      return NextResponse.json(
        {
          error: `మీ సందేశం ${AI_CONFIG.maxUserMessageLength.toLocaleString()} అక్షరాల పరిమితిని మించిపోయింది. దయచేసి సంక్షిప్తంగా అడగండి. (Your message exceeds the ${AI_CONFIG.maxUserMessageLength} character limit.)`,
        },
        { status: 400 }
      );
    }

    // 3. Intelligent Conversation History Trimming
    // Keep up to maxHistoryTurns (e.g. last 10-12 messages)
    let windowed = sanitizedMessages.slice(-AI_CONFIG.maxHistoryTurns);

    // Calculate total character footprint
    let totalChars = windowed.reduce((sum, m) => sum + m.content.length, 0);

    // If total conversation exceeds combined limit (e.g. 30,000 chars),
    // drop the oldest historical turns one-by-one while ALWAYS preserving the latest user message
    while (
      totalChars > AI_CONFIG.maxCombinedHistoryChars &&
      windowed.length > 1
    ) {
      const removed = windowed.shift();
      if (removed) {
        totalChars -= removed.content.length;
      }
    }

    // Ensure the conversation starts with a user turn if prior turns were trimmed
    if (windowed.length > 1 && windowed[0].role === 'assistant') {
      windowed = windowed.slice(1);
    }

    // 3.5 Retrieve authentic TET Assist knowledge base context
    const latestUserMessage = windowed[windowed.length - 1];
    let knowledgeContextText = '';
    try {
      const { KnowledgeRetriever } = await import('@/lib/services/knowledge/knowledgeRetriever');
      const retrieval = await KnowledgeRetriever.retrieveContext(latestUserMessage.content);
      knowledgeContextText = retrieval.contextText;
    } catch (kErr) {
      console.warn('[API /api/chat] Knowledge retrieval notice:', kErr);
    }

    // 4. Send to server-side Gemini service with knowledge base context
    const result = await GeminiChatService.generateChatResponse(windowed, knowledgeContextText);

    return NextResponse.json(
      { message: result.message },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorStr = error instanceof Error ? error.message : String(error);

    // Missing API key error
    if (errorStr.includes('GEMINI_API_KEY is not configured')) {
      return NextResponse.json(
        {
          error:
            'AI service configuration is incomplete on the server. Please set GEMINI_API_KEY in .env.local to activate the AI assistant.',
        },
        { status: 503 }
      );
    }

    // Rate limiting / Quota / 503 high demand errors
    if (
      errorStr.includes('429') ||
      errorStr.includes('503') ||
      errorStr.toLowerCase().includes('quota') ||
      errorStr.toLowerCase().includes('rate limit') ||
      errorStr.toLowerCase().includes('high demand')
    ) {
      return NextResponse.json(
        {
          error:
            'క్షమించండి, ప్రస్తుతం AI response అందుబాటులో లేదు. సర్వర్‌లో రద్దీగా ఉంది, కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి. (High traffic, please try again shortly.)',
        },
        { status: 429 }
      );
    }

    // Generic safe error message (no leaked secrets, keys, or stack traces)
    return NextResponse.json(
      {
        error:
          'క్షమించండి, ప్రస్తుతం AI response అందుబాటులో లేదు. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',
      },
      { status: 500 }
    );
  }
}
