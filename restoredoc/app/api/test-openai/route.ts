import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Test endpoint to verify OpenAI connection
export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test with a simple text completion
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Say 'OpenAI GPT-4 Vision is connected and working!' in JSON format with a 'message' field."
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json({
      success: true,
      model: response.model,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to connect to OpenAI',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}