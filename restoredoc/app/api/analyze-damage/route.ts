import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { getDamagePrompt } from '@/lib/prompts/damage-analysis';

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { photos, damageType } = await request.json();

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      );
    }

    if (!damageType || !['water', 'fire', 'mold'].includes(damageType)) {
      return NextResponse.json(
        { error: 'Invalid damage type' },
        { status: 400 }
      );
    }

    // Get the appropriate prompt for damage type
    const prompt = getDamagePrompt(damageType as 'water' | 'fire' | 'mold');

    // Prepare messages with images for OpenAI
    const messages: any[] = [
      {
        role: "system",
        content: "You are an IICRC-certified restoration expert providing accurate estimates for Major Restoration Services in York, PA. Always respond with valid JSON only."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt + "\n\nAnalyze these damage photos and provide a detailed assessment with accurate York, PA pricing. Return only valid JSON."
          },
          ...photos.map((photo: { base64: string; mimeType: string }) => ({
            type: "image_url",
            image_url: {
              url: `data:${photo.mimeType || 'image/jpeg'};base64,${photo.base64}`,
              detail: "high" // Use high detail for accuracy
            }
          }))
        ]
      }
    ];

    // Generate response with OpenAI GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest GPT-4 model with vision capabilities
      messages,
      max_tokens: 4096,
      temperature: 0.1, // Low for consistent pricing
      response_format: { type: "json_object" } // Force JSON response
    });

    const text = response.choices[0].message.content || '{}';

    // Parse JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', text);
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format from OpenAI');
      }
    }

    // Validate and enhance the response
    const enhancedResult = {
      ...analysisResult,
      timestamp: new Date().toISOString(),
      modelUsed: 'gpt-4o',
      photoCount: photos.length,
      
      // Ensure required fields exist
      damageType: damageType,
      totalEstimate: analysisResult.totalEstimate || calculateTotalFromLineItems(analysisResult.lineItems),
      affectedAreaSqFt: analysisResult.affectedAreaSqFt || 0,
      
      // Add metadata
      metadata: {
        analysisVersion: '1.0',
        iicrcStandards: getIICRCStandard(damageType),
        region: 'York, PA',
        pricingYear: 2024
      }
    };

    return NextResponse.json({
      success: true,
      analysis: enhancedResult
    });

  } catch (error) {
    console.error('Damage analysis error:', error);
    
    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze damage',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate total from line items
function calculateTotalFromLineItems(lineItems: any[]): number {
  if (!lineItems || !Array.isArray(lineItems)) return 0;
  return lineItems.reduce((total, item) => total + (item.total || 0), 0);
}

// Helper function to get IICRC standard
function getIICRCStandard(damageType: string): string {
  const standards: Record<string, string> = {
    water: 'IICRC S500',
    fire: 'IICRC S700',
    mold: 'IICRC S520-2024'
  };
  return standards[damageType] || 'IICRC';
}

// OPTIONS method for CORS
export async function OPTIONS(request: Request) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}