import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase, embeddings } from '@/lib/db/schema';
import { isDemoMode } from '@/lib/demo-mode';
import { inArray } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    if (isDemoMode()) {
      return NextResponse.json(
        { error: 'Delete operations are disabled in demo mode' },
        { status: 403 }
      );
    }

    const { type } = await request.json();

    if (type !== 'quotes' && type !== 'images') {
      return NextResponse.json({ error: 'Invalid type. Must be "quotes" or "images"' }, { status: 400 });
    }

    const csvPath = path.join(process.cwd(), 'public', 'assets', 'seeds',
      type === 'quotes' ? 'quotes_with_embeddings.csv' : 'images_with_embeddings_edited.csv');

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ error: 'Error parsing CSV', details: parseResult.errors }, { status: 400 });
    }

    const rows = parseResult.data as any[];
    const uuidsToDelete = rows
      .filter(row => row.uuid)
      .map(row => row.uuid);

    if (uuidsToDelete.length === 0) {
      return NextResponse.json({ error: 'No valid UUIDs found in CSV' }, { status: 400 });
    }

    // Delete from both tables (embeddings will be deleted automatically due to cascade)
    const deleteResult = await db.delete(commonbase)
      .where(inArray(commonbase.id, uuidsToDelete));

    return NextResponse.json({
      success: true,
      message: `Bulk delete completed. ${uuidsToDelete.length} entries deleted.`,
      details: {
        deletedCount: uuidsToDelete.length,
        uuids: uuidsToDelete
      }
    });

  } catch (error: any) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk delete', details: error.message },
      { status: 500 }
    );
  }
}