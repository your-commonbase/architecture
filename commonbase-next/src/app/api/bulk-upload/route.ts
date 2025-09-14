import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase, embeddings } from '@/lib/db/schema';
import { isDemoMode, getDemoModeError } from '@/lib/demo-mode';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    if (isDemoMode()) {
      return NextResponse.json(getDemoModeError(), { status: 403 });
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
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        if (!row.uuid || !row.data || !row.embedding) {
          errorCount++;
          errors.push(`Invalid row data: ${JSON.stringify(row)}`);
          continue;
        }

        // Parse the embedding array from string
        let embeddingArray;
        try {
          embeddingArray = JSON.parse(row.embedding);
          if (!Array.isArray(embeddingArray) || embeddingArray.length !== 1536) {
            throw new Error('Invalid embedding format');
          }
        } catch (e) {
          errorCount++;
          errors.push(`Invalid embedding for UUID ${row.uuid}: ${e}`);
          continue;
        }

        // Parse metadata
        let metadata = {};
        if (row.metadata) {
          try {
            metadata = JSON.parse(row.metadata);
          } catch (e) {
            console.warn(`Invalid metadata for UUID ${row.uuid}, using empty object`);
          }
        }

        // For images, update the metadata to point to the local file path
        if (type === 'images' && row.filename) {
          metadata = {
            ...metadata,
            filename: row.filename,
            source: `/assets/seeds/sample_images/${row.filename}`,
            type: 'image'
          };
        }

        // Insert into commonbase table
        await db.insert(commonbase).values({
          id: row.uuid,
          data: row.data,
          metadata: metadata,
          created: new Date(),
          updated: new Date(),
        });

        // Insert into embeddings table
        await db.insert(embeddings).values({
          id: row.uuid,
          embedding: embeddingArray,
        });

        successCount++;
      } catch (error: any) {
        errorCount++;
        const errorMsg = error.message?.includes('duplicate key')
          ? `Entry ${row.uuid} already exists`
          : `Error inserting ${row.uuid}: ${error.message}`;
        errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk upload completed. ${successCount} entries added, ${errorCount} errors`,
      details: {
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Limit to first 10 errors
      }
    });

  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk upload', details: error.message },
      { status: 500 }
    );
  }
}