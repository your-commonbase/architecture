import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase, embeddings } from '@/lib/db/schema';
import { isDemoMode, getDemoModeError } from '@/lib/demo-mode';
import { generateEmbedding } from '@/lib/embeddings';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Helper function to validate UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function POST(request: NextRequest) {
  try {
    if (isDemoMode()) {
      return NextResponse.json(getDemoModeError(), { status: 403 });
    }

    const body = await request.json();
    let csvContent: string;

    // Handle different input methods
    if (body.type && (body.type === 'quotes' || body.type === 'images')) {
      // Legacy support for predefined CSV files
      const csvPath = path.join(process.cwd(), 'public', 'assets', 'seeds',
        body.type === 'quotes' ? 'quotes_with_embeddings.csv' : 'images_with_embeddings_edited.csv');

      if (!fs.existsSync(csvPath)) {
        return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
      }

      csvContent = fs.readFileSync(csvPath, 'utf-8');
    } else if (body.csvPath) {
      // Accept custom CSV file path (relative to public/assets/seeds/)
      const csvPath = path.join(process.cwd(), 'public', 'assets', 'seeds', body.csvPath);

      if (!fs.existsSync(csvPath)) {
        return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
      }

      csvContent = fs.readFileSync(csvPath, 'utf-8');
    } else if (body.csvContent) {
      // Accept CSV content directly
      csvContent = body.csvContent;
    } else {
      return NextResponse.json({
        error: 'Must provide either "type" (quotes/images), "csvPath", or "csvContent"'
      }, { status: 400 });
    }

    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"',
      escapeChar: '"',
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ error: 'Error parsing CSV', details: parseResult.errors }, { status: 400 });
    }

    const rows = parseResult.data as any[];
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // Account for header row

      try {
        // Validate required field: data
        if (!row.data) {
          errorCount++;
          errors.push(`Row ${rowNumber}: "data" field is required`);
          continue;
        }

        // Handle optional ID field (can be "id" or "uuid" for backward compatibility)
        let entryId = row.id || row.uuid || null;

        // Validate ID if provided
        if (entryId && !isValidUUID(entryId)) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Invalid UUID format for id "${entryId}"`);
          continue;
        }

        // Check if ID already exists (if provided)
        if (entryId) {
          const existingEntry = await db
            .select({ id: commonbase.id })
            .from(commonbase)
            .where(eq(commonbase.id, entryId))
            .limit(1);

          if (existingEntry.length > 0) {
            errorCount++;
            errors.push(`Row ${rowNumber}: Entry with ID "${entryId}" already exists`);
            continue;
          }
        }

        // Parse metadata
        let metadata = {};
        if (row.metadata) {
          try {
            metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
          } catch (e) {
            console.warn(`Row ${rowNumber}: Invalid metadata JSON, using empty object`);
            metadata = {};
          }
        }

        // Handle optional embedding field
        let embeddingArray = null;
        let needsEmbedding = true;

        if (row.embedding) {
          try {
            embeddingArray = typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding;
            if (Array.isArray(embeddingArray) && embeddingArray.length === 1536) {
              needsEmbedding = false;
            } else {
              console.warn(`Row ${rowNumber}: Invalid embedding format, will generate new embedding`);
              embeddingArray = null;
            }
          } catch (e) {
            console.warn(`Row ${rowNumber}: Error parsing embedding, will generate new embedding`);
            embeddingArray = null;
          }
        }

        // Generate embedding if needed
        if (needsEmbedding) {
          try {
            embeddingArray = await generateEmbedding(row.data);
          } catch (e) {
            errorCount++;
            errors.push(`Row ${rowNumber}: Failed to generate embedding: ${e}`);
            continue;
          }
        }

        // Create entry values
        const entryValues: { data: string; metadata: any; id?: string } = {
          data: row.data,
          metadata,
        };

        if (entryId) {
          entryValues.id = entryId;
        }

        // Insert into commonbase table
        const [newEntry] = await db.insert(commonbase).values(entryValues).returning({ id: commonbase.id });
        const finalEntryId = newEntry.id;

        // Insert embedding (only if we have a valid array)
        if (embeddingArray && Array.isArray(embeddingArray)) {
          await db.insert(embeddings).values({
            id: finalEntryId,
            embedding: embeddingArray,
          });
        }

        // Handle optional link field (create bidirectional links)
        if (row.link) {
          try {
            // Get the parent entry
            const [parentEntry] = await db
              .select()
              .from(commonbase)
              .where(eq(commonbase.id, row.link));

            if (parentEntry) {
              // Update new entry to link to parent
              const currentLinks = (metadata as any).links || [];
              if (!currentLinks.includes(row.link)) {
                await db
                  .update(commonbase)
                  .set({
                    metadata: {
                      ...metadata,
                      links: [...currentLinks, row.link],
                    },
                    updated: new Date(),
                  })
                  .where(eq(commonbase.id, finalEntryId));
              }

              // Update parent entry to backlink to new entry
              const parentLinks = parentEntry.metadata?.backlinks || [];
              if (!parentLinks.includes(finalEntryId)) {
                await db
                  .update(commonbase)
                  .set({
                    metadata: {
                      ...parentEntry.metadata,
                      backlinks: [...parentLinks, finalEntryId],
                    },
                    updated: new Date(),
                  })
                  .where(eq(commonbase.id, row.link));
              }
            } else {
              console.warn(`Row ${rowNumber}: Link target "${row.link}" not found`);
            }
          } catch (e) {
            console.warn(`Row ${rowNumber}: Error creating link to "${row.link}": ${e}`);
          }
        }

        successCount++;
      } catch (error: any) {
        errorCount++;
        const errorMsg = error.message?.includes('duplicate key')
          ? `Row ${rowNumber}: Entry already exists`
          : `Row ${rowNumber}: ${error.message}`;
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