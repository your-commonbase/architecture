import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase, embeddings } from '@/lib/db/schema';
import { generateEmbedding } from '@/lib/embeddings';
import { eq } from 'drizzle-orm';
import { isDemoMode, getDemoModeError } from '@/lib/demo-mode';
import { validateApiRequest } from '@/lib/api-auth';

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

    // Validate authentication and get user info
    const authResult = await validateApiRequest(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { data, metadata = {}, link = null, embedding = null, id = null } = body;

    if (!data) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 });
    }

    // Validate ID if provided
    if (id) {
      // Basic UUID validation (36 chars with dashes in right positions)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return NextResponse.json({ error: 'Invalid UUID format for id parameter' }, { status: 400 });
      }
      
      // Check if ID already exists
      const existingEntry = await db
        .select({ id: commonbase.id })
        .from(commonbase)
        .where(eq(commonbase.id, id))
        .limit(1);
        
      if (existingEntry.length > 0) {
        return NextResponse.json({ error: 'Entry with this ID already exists' }, { status: 409 });
      }
    }

    // Enhance metadata with user information if available
    const enhancedMetadata = { ...metadata };
    if (authResult.user) {
      enhancedMetadata.userId = authResult.user.id;
      enhancedMetadata.username = authResult.user.name || authResult.user.email;
      enhancedMetadata.createdBy = authResult.user.name || authResult.user.email;
    }

    if (link) {
      enhancedMetadata.links = Array.isArray(enhancedMetadata.links)
        ? [...new Set([...enhancedMetadata.links, link])]
        : [link];
    }

    // Create new entry with provided or generated ID
    const entryValues: { data: string; metadata: any; id?: string } = {
      data,
      metadata: enhancedMetadata,
    };

    if (id) {
      entryValues.id = id;
    }

    const [newEntry] = await db
      .insert(commonbase)
      .values(entryValues)
      .returning();

    // Generate or use provided embedding
    try {
      let finalEmbedding;
      
      if (embedding && Array.isArray(embedding)) {
        // Use provided embedding (validate it's the right size)
        if (embedding.length === 1536) {
          finalEmbedding = embedding;
        } else {
          console.warn(`Invalid embedding size: ${embedding.length}, expected 1536. Generating new embedding.`);
          finalEmbedding = await generateEmbedding(data);
        }
      } else {
        // Generate new embedding
        finalEmbedding = await generateEmbedding(data);
      }
      
      await db.insert(embeddings).values({
        id: newEntry.id,
        embedding: finalEmbedding,
      });
    } catch (embeddingError) {
      console.error('Failed to process embedding:', embeddingError);
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