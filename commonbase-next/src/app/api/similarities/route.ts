import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase, embeddings } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function similarityToPercentage(similarity: number): number {
  // Convert cosine similarity (-1 to 1) to percentage (0 to 100)
  // Where 1 = 100%, 0 = 50%, -1 = 0%
  return ((similarity + 1) / 2) * 100;
}

export async function POST(request: NextRequest) {
  try {
    const { entryId } = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Get the main entry and its embedding
    const mainEntry = await db.select({
      id: commonbase.id,
      data: commonbase.data,
      metadata: commonbase.metadata,
      created: commonbase.created,
      updated: commonbase.updated,
      embedding: embeddings.embedding
    })
    .from(commonbase)
    .leftJoin(embeddings, eq(commonbase.id, embeddings.id))
    .where(eq(commonbase.id, entryId))
    .limit(1);

    if (mainEntry.length === 0 || !mainEntry[0].embedding) {
      return NextResponse.json({ error: 'Entry not found or no embedding available' }, { status: 404 });
    }

    const entry = mainEntry[0];
    const mainEmbedding = entry.embedding;

    // Get linked and backlinked entry IDs
    const linkedIds: string[] = entry.metadata?.links || [];
    const backlinkedIds: string[] = entry.metadata?.backlinks || [];
    const allConnectedIds = [...new Set([...linkedIds, ...backlinkedIds])];


    // Get connected entries with their embeddings
    const connectedEntries = allConnectedIds.length > 0 ? await db.select({
      id: commonbase.id,
      data: commonbase.data,
      metadata: commonbase.metadata,
      created: commonbase.created,
      updated: commonbase.updated,
      embedding: embeddings.embedding
    })
    .from(commonbase)
    .leftJoin(embeddings, eq(commonbase.id, embeddings.id))
    .where(inArray(commonbase.id, allConnectedIds)) : [];

    // Calculate similarities for linked/backlinked entries
    const connectedSimilarities = connectedEntries
      .filter(connectedEntry => connectedEntry.embedding) // Only include entries with embeddings
      .map(connectedEntry => {
        const similarity = cosineSimilarity(mainEmbedding, connectedEntry.embedding!);
        const similarityPercentage = similarityToPercentage(similarity);

        return {
          id: connectedEntry.id,
          data: connectedEntry.data,
          metadata: connectedEntry.metadata,
          created: connectedEntry.created,
          updated: connectedEntry.updated,
          similarity: similarity,
          similarityPercentage: similarityPercentage,
          isLinked: linkedIds.includes(connectedEntry.id),
          isBacklinked: backlinkedIds.includes(connectedEntry.id),
          isSimilar: false,
          // Add some random x-axis positioning for scatter plot
          xPosition: Math.random() * 80 + 10 // Random between 10-90 for padding
        };
      });

    // Get similar entries by directly comparing embeddings
    let similarEntries: any[] = [];
    try {
      // Get all other entries with embeddings (excluding current entry and connected entries)
      const excludeIds = [entryId, ...allConnectedIds];

      const allOtherEntries = await db.select({
        id: commonbase.id,
        data: commonbase.data,
        metadata: commonbase.metadata,
        created: commonbase.created,
        updated: commonbase.updated,
        embedding: embeddings.embedding
      })
      .from(commonbase)
      .innerJoin(embeddings, eq(commonbase.id, embeddings.id));

      // Filter out current entry and connected entries, then calculate similarities
      const candidateEntries = allOtherEntries.filter(entry =>
        !excludeIds.includes(entry.id)
      );

      // Calculate cosine similarity for each candidate and filter by threshold
      const threshold = 0.1; // 10% similarity threshold (more inclusive)
      const entriesWithSimilarity = candidateEntries
        .map(candidateEntry => {
          const similarity = cosineSimilarity(mainEmbedding, candidateEntry.embedding!);
          const similarityPercentage = similarityToPercentage(similarity);

          return {
            ...candidateEntry,
            similarity,
            similarityPercentage
          };
        })
        .filter(entry => entry.similarity >= threshold) // Only include entries above threshold
        .sort((a, b) => b.similarity - a.similarity) // Sort by similarity descending
        .slice(0, 10); // Take top 10

      similarEntries = entriesWithSimilarity.map(entry => ({
        id: entry.id,
        data: entry.data,
        metadata: entry.metadata,
        created: entry.created,
        updated: entry.updated,
        similarity: entry.similarity,
        similarityPercentage: entry.similarityPercentage,
        isLinked: false,
        isBacklinked: false,
        isSimilar: true,
        xPosition: Math.random() * 80 + 10 // Random between 10-90 for padding
      }));

    } catch (error) {
      console.error('Failed to fetch similar entries:', error);
    }

    // Combine connected entries and similar entries
    const similarities = [...connectedSimilarities, ...similarEntries]
      .sort((a, b) => b.similarity - a.similarity); // Sort by similarity descending

    return NextResponse.json({
      entry: {
        id: entry.id,
        data: entry.data,
        metadata: entry.metadata,
        created: entry.created,
        updated: entry.updated
      },
      similarities
    });

  } catch (error: any) {
    console.error('Similarities API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch similarities', details: error.message },
      { status: 500 }
    );
  }
}