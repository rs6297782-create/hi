import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey } = await request.json();

    if (!prompt || !apiKey) {
      return NextResponse.json(
        { error: 'Missing prompt or API key' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const systemPrompt = `You are an expert web developer. Generate a complete, modern website based on the user's request.

IMPORTANT: Your response must be ONLY valid JSON in this exact format:
{
  "files": [
    {
      "path": "index.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "style.css",
      "content": "body { ... }"
    },
    {
      "path": "script.js",
      "content": "// JavaScript code"
    }
  ]
}

Requirements:
- Generate HTML, CSS, and JavaScript files
- Use modern, clean design
- Include responsive styling
- Add interactive elements where appropriate
- Make it production-ready
- DO NOT include any explanations or markdown
- ONLY output the JSON structure above`;

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/\{[\s\S]*"files"[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: 'Processing files...' })}\n\n`)
        );

        if (parsedResponse.files && Array.isArray(parsedResponse.files)) {
          for (const file of parsedResponse.files) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'file', path: file.path, content: file.content })}\n\n`)
            );
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'complete', message: 'Generation complete!' })}\n\n`)
        );

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate code' },
      { status: 500 }
    );
  }
}
