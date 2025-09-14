import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase, embeddings } from '@/lib/db/schema';
import { generateEmbedding } from '@/lib/embeddings';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, types = { semantic: { options: { limit: 10, threshold: 0.7 } }, fulltext: { options: { limit: 10 } } } } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const results: any[] = [];

    // Semantic search with timeout
    if (types.semantic) {
      try {
        // Set a timeout for embedding generation to prevent hanging
        const embeddingPromise = generateEmbedding(query);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Embedding generation timeout')), 8000)
        );
        
        const queryEmbedding = await Promise.race([embeddingPromise, timeoutPromise]) as number[];
        const { limit = 10, threshold = 0.5 } = types.semantic.options || {};
        
        // Format the embedding as a PostgreSQL vector string
        const vectorString = `[${queryEmbedding.join(',')}]`;

        const semanticResults = await db
          .select({
            id: commonbase.id,
            data: commonbase.data,
            metadata: commonbase.metadata,
            created: commonbase.created,
            updated: commonbase.updated,
            similarity: sql<number>`1 - (${embeddings.embedding} <=> ${vectorString}::vector)`,
          })
          .from(commonbase)
          .innerJoin(embeddings, sql`${commonbase.id} = ${embeddings.id}`)
          .where(sql`1 - (${embeddings.embedding} <=> ${vectorString}::vector) > ${threshold}`)
          .orderBy(sql`${embeddings.embedding} <=> ${vectorString}::vector`)
          .limit(limit);

        results.push(
          ...semanticResults.map(row => ({
            type: 'semantic',
            similarity: row.similarity,
            ...row,
          }))
        );
      } catch (error) {
        console.error('Semantic search error:', error);
        // Continue with other search types even if semantic search fails
      }
    }

    // Full-text search
    if (types.fulltext) {
      try {
        const { limit = 10 } = types.fulltext.options || {};
        
        const ftsResults = await db
          .select({
            id: commonbase.id,
            data: commonbase.data,
            metadata: commonbase.metadata,
            created: commonbase.created,
            updated: commonbase.updated,
          })
          .from(commonbase)
          .where(sql`to_tsvector('english', ${commonbase.data}) @@ plainto_tsquery('english', ${query})`)
          .orderBy(sql`ts_rank(to_tsvector('english', ${commonbase.data}), plainto_tsquery('english', ${query})) DESC`)
          .limit(limit);

        results.push(
          ...ftsResults.map(row => ({
            type: 'fts',
            ...row,
          }))
        );
      } catch (error) {
        console.error('Full-text search error:', error);
      }
    }

    // Deduplicate results by ID, preserving semantic results over FTS when there are duplicates
    const deduplicatedResults = [];
    const seenIds = new Set();
    
    // First pass: add all semantic results
    for (const result of results) {
      if (result.type === 'semantic' && !seenIds.has(result.id)) {
        deduplicatedResults.push(result);
        seenIds.add(result.id);
      }
    }
    
    // Second pass: add FTS results that weren't already added
    for (const result of results) {
      if (result.type === 'fts' && !seenIds.has(result.id)) {
        deduplicatedResults.push(result);
        seenIds.add(result.id);
      }
    }

    return NextResponse.json(deduplicatedResults);
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}