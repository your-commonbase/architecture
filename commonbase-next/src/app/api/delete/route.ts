import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // First, get the entry to see what links/backlinks it has
    const [entryToDelete] = await db
      .select()
      .from(commonbase)
      .where(eq(commonbase.id, id));

    if (!entryToDelete) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Get links and backlinks from the entry being deleted
    const links = entryToDelete.metadata?.links || [];
    const backlinks = entryToDelete.metadata?.backlinks || [];
    const allRelatedIds = [...links, ...backlinks];

    // Update all related entries to remove references to the deleted entry
    if (allRelatedIds.length > 0) {
      for (const relatedId of allRelatedIds) {
        try {
          const [relatedEntry] = await db
            .select()
            .from(commonbase)
            .where(eq(commonbase.id, relatedId));

          if (relatedEntry) {
            const updatedMetadata = { ...relatedEntry.metadata };
            
            // Remove the deleted entry ID from links array
            if (updatedMetadata.links) {
              updatedMetadata.links = updatedMetadata.links.filter(
                (linkId: string) => linkId !== id
              );
            }
            
            // Remove the deleted entry ID from backlinks array
            if (updatedMetadata.backlinks) {
              updatedMetadata.backlinks = updatedMetadata.backlinks.filter(
                (backlinkId: string) => backlinkId !== id
              );
            }

            await db
              .update(commonbase)
              .set({
                metadata: updatedMetadata,
                updated: new Date(),
              })
              .where(eq(commonbase.id, relatedId));
          }
        } catch (updateError) {
          console.error(`Failed to update related entry ${relatedId}:`, updateError);
        }
      }
    }

    // Now delete the entry
    const [deletedEntry] = await db
      .delete(commonbase)
      .where(eq(commonbase.id, id))
      .returning();

    return NextResponse.json({ success: true, deleted: deletedEntry });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}