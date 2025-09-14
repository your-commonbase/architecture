import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase, embeddings } from '@/lib/db/schema';
import { sql, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    // Fetch entries with their embeddings
    const results = await db
      .select({
        id: commonbase.id,
        data: commonbase.data,
        metadata: commonbase.metadata,
        created: commonbase.created,
        updated: commonbase.updated,
        embedding: embeddings.embedding,
      })
      .from(commonbase)
      .innerJoin(embeddings, sql`${commonbase.id} = ${embeddings.id}`)
      .where(inArray(commonbase.id, ids));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching embeddings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}