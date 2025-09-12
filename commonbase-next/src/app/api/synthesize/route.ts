import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, content } = body;

    if (!prompt || !content) {
      return NextResponse.json({ error: 'Prompt and content are required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that synthesizes ideas and creates cohesive essays from multiple text entries.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nHere are the entries to synthesize:\n\n${content}`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const synthesis = response.choices[0].message.content;
    return NextResponse.json({ synthesis });
  } catch (error) {
    console.error('Synthesis error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize content' },
      { status: 500 }
    );
  }
}