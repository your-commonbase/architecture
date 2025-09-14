import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase, embeddings } from '@/lib/db/schema';
import { generateEmbedding } from '@/lib/embeddings';
import { eq } from 'drizzle-orm';
import { isDemoMode, getDemoModeError } from '@/lib/demo-mode';

export async function POST(request: NextRequest) {
  try {
    // Check if demo mode is enabled
    if (isDemoMode()) {
      const error = getDemoModeError();
      return NextResponse.json({ 
        error: error.message,
        action: error.action 
      }, { status: 403 });
    }

    const body = await request.json();
    const { data, metadata = {}, link = null } = body;

    if (!data) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 });
    }

    // Create new entry
    const [newEntry] = await db
      .insert(commonbase)
      .values({
        data,
        metadata,
      })
      .returning();

    // Generate and store embedding
    try {
      const embedding = await generateEmbedding(data);
      await db.insert(embeddings).values({
        id: newEntry.id,
        embedding,
      });
    } catch (embeddingError) {
      console.error('Failed to generate embedding:', embeddingError);
      // Continue without embedding rather than failing completely
    }

    // If link is provided, update parent record's backlinks
    if (link) {
      try {
        const [parentEntry] = await db
          .select()
          .from(commonbase)
          .where(eq(commonbase.id, link));

        if (parentEntry) {
          const currentBacklinks = parentEntry.metadata?.backlinks || [];
          await db
            .update(commonbase)
            .set({
              metadata: {
                ...parentEntry.metadata,
                backlinks: [...currentBacklinks, newEntry.id],
              },
              updated: new Date(),
            })
            .where(eq(commonbase.id, link));
        }
      } catch (linkError) {
        console.error('Failed to update parent backlinks:', linkError);
      }
    }

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error('Error adding entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}