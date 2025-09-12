import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase } from '@/lib/db/schema';
import { sql, notInArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count = 1, exclude = [] } = body;

    let query = db
      .select()
      .from(commonbase)
      .orderBy(sql`RANDOM()`)
      .limit(count);

    if (exclude.length > 0) {
      query = query.where(notInArray(commonbase.id, exclude)) as any;
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching random entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}