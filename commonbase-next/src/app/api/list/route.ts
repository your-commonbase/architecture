import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const entries = await db
      .select()
      .from(commonbase)
      .orderBy(desc(commonbase.created))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      entries,
      page,
      limit,
      hasMore: entries.length === limit,
    });
  } catch (error) {
    console.error('Error listing entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, page = 1, limit = 20 } = body;
    const offset = (page - 1) * limit;

    let query = db.select().from(commonbase);

    // Apply filters if provided
    if (filters?.metadata?.link) {
      // Filter for entries that have this link in their metadata
      query = query.where(
        sql`${commonbase.metadata}->>'link' = ${filters.metadata.link}`
      );
    }

    const entries = await query
      .orderBy(desc(commonbase.created))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      entries,
      page,
      limit,
      hasMore: entries.length === limit,
    });
  } catch (error) {
    console.error('Error listing entries with filters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}