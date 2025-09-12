import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

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