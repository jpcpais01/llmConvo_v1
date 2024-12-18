import { NextRequest, NextResponse } from 'next/server';
import * as Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq.Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Models to use
const MODELS = {
  MODEL1: 'llama-3.3-70b-versatile',
  MODEL2: 'llama-3.2-90b-vision-preview',
  MODEL3: 'mixtral-8x7b-32768'
};

// Detailed system prompts for each model
const MODEL_SYSTEM_PROMPTS = {
  [MODELS.MODEL1]: 'You are a sharp, contrarian intellectual. Deliver your arguments with precision and wit. Keep your responses concise—aim for 2-3 sentences that pack a punch. Your goal is to make every word count, providing a clear, provocative perspective without unnecessary elaboration.',
  
  [MODELS.MODEL2]: 'You are an analytical thinker who dissects complex topics with surgical precision. Craft your responses to be crisp and impactful—no more than 3-4 sentences. Be direct, expose key insights, and challenge assumptions efficiently. Prioritize clarity and intellectual depth over verbosity.',
  
  [MODELS.MODEL3]: 'You are a versatile and creative. Approach each topic with a blend of technical insight and imaginative thinking. Provide responses that are both intellectually rigorous and engaging, balancing depth with accessibility, and keep your responses concise with no more than 2-3 sentences. Communicate clearly and effectively.'
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RecentMessage {
  sender: string;
  text: string;
  id: number;
}

// Validate topic input
function validateTopic(topic: string): boolean {
  // More comprehensive topic validation
  if (!topic || typeof topic !== 'string') return false;
  
  const trimmedTopic = topic.trim();
  
  // Length constraints
  if (trimmedTopic.length < 3 || trimmedTopic.length > 100) return false;
  
  // More sophisticated inappropriate content filter
  const inappropriatePatterns = [
    /\b(fuck|shit|damn|hate|stupid|bad|offensive|inappropriate)\b/i,
    /[^\w\s]/g,  // Disallow special characters
    /\b(porn|sex|racist|sexist)\b/i
  ];
  
  return !inappropriatePatterns.some(pattern => pattern.test(trimmedTopic));
}

export async function POST(request: NextRequest) {
  try {
    const { topic, messages } = await request.json();

    // Validate inputs
    if (!topic || !validateTopic(topic)) {
      return NextResponse.json({ 
        error: 'Invalid topic. Must be 3-100 characters and appropriate.' 
      }, { status: 400 });
    }

    if (!Array.isArray(messages)) {
      return NextResponse.json({ 
        error: 'Invalid messages format' 
      }, { status: 400 });
    }

    // Ensure at least one initial message
    const safeMessages = messages.length > 0 ? messages : [
      { 
        id: 0, 
        text: `Let's discuss: ${topic}`, 
        sender: 'Llama 3.3 70B' 
      }
    ];

    // Limit conversation history
    const recentMessages: RecentMessage[] = safeMessages.slice(-5);

    // Dynamic model selection based on conversation history
    let currentModel: string;
    if (recentMessages.length === 0) {
      // First message always uses MODEL1
      currentModel = MODELS.MODEL1;
    } else {
      // Cycle through models for each response
      const lastSender = recentMessages[recentMessages.length - 1].sender;
      if (lastSender === 'Llama 3.3 70B') {
        currentModel = MODELS.MODEL2;
      } else if (lastSender === 'Llama 3.2 90B') {
        currentModel = MODELS.MODEL3;
      } else {
        currentModel = MODELS.MODEL1;
      }
    }
    
    console.log('Conversation Context:', {
      topic,
      modelUsed: currentModel,
      messageCount: recentMessages.length,
      lastSender: recentMessages.length > 0 
        ? recentMessages[recentMessages.length - 1].sender 
        : 'No previous messages'
    });

    // Prepare conversation context
    const conversationHistory: Message[] = [
      { 
        role: 'system', 
        content: MODEL_SYSTEM_PROMPTS[currentModel]
      },
      { 
        role: 'system', 
        content: `The current discussion topic is: ${topic}. Engage with this subject matter using your unique intellectual approach, but keep your response conversational and concise.` 
      },
      ...recentMessages.slice(-4).map((msg: RecentMessage) => ({
        role: (msg.sender.toLowerCase() === 'claude' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: msg.text
      }))
    ];

    // Generate AI response
    const aiResponse = await groq.chat.completions.create({
      model: currentModel,
      messages: conversationHistory,
      max_tokens: 200,
      temperature: 0.8,
      top_p: 1,
      stream: false
    });

    // More robust response text extraction
    const responseChoice = aiResponse.choices[0];
    const responseText = responseChoice?.message?.content?.trim() || 
      `I apologize, but I'm having difficulty generating a response about "${topic}". Could you rephrase or provide more context?`;

    console.log('AI Response Details:', {
      modelUsed: currentModel,
      responseLength: responseText.length,
      truncated: responseText.length >= 200
    });

    return NextResponse.json({
      response: {
        text: responseText,
        sender: currentModel === MODELS.MODEL1 ? 'Llama 3.3 70B' : currentModel === MODELS.MODEL2 ? 'Llama 3.2 90B' : 'Mixtral 8x7B'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Detailed Conversation API error:', {
      errorType: error instanceof Error ? error.name : 'Unknown Error',
      errorMessage: error instanceof Error ? error.message : 'No message',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // More specific error handling
    if (error instanceof Groq.APIError) {
      return NextResponse.json({ 
        error: 'Groq API Error',
        details: {
          status: error.status,
          message: error.message
        }
      }, { status: error.status || 500 });
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.toString() : 'No additional details'
    }, { status: 500 });
  }
}

// Ensure the API route can handle GET requests for Next.js
export async function GET() {
  return NextResponse.json({ 
    message: 'Conversation API is ready' 
  }, { status: 200 });
}
