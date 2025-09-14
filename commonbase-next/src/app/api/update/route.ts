import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase, embeddings } from '@/lib/db/schema';
import { generateEmbedding } from '@/lib/embeddings';
import { eq } from 'drizzle-orm';
import { isDemoMode } from '@/lib/demo-mode';

export async function POST(request: NextRequest) {
  try {
    // Check if demo mode is enabled
    if (isDemoMode()) {
      return NextResponse.json(
        { error: 'Edit functionality is disabled in demo mode. Deploy your own instance at https://github.com/your-commonbase/commonbase' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, data = null, metadata = null } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if entry exists
    const [existingEntry] = await db
      .select()
      .from(commonbase)
      .where(eq(commonbase.id, id));

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const updates: any = { updated: new Date() };

    // Update data and regenerate embedding if data changed
    if (data !== null) {
      updates.data = data;
      
      try {
        const newEmbedding = await generateEmbedding(data);
        await db
          .update(embeddings)
          .set({ embedding: newEmbedding })
          .where(eq(embeddings.id, id));
      } catch (embeddingError) {
        console.error('Failed to update embedding:', embeddingError);
      }
    }

    // Update metadata partially
    if (metadata !== null) {
      updates.metadata = {
        ...existingEntry.metadata,
        ...metadata,
      };
    }

    const [updatedEntry] = await db
      .update(commonbase)
      .set(updates)
      .where(eq(commonbase.id, id))
      .returning();

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}