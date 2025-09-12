import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commonbase } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, link_ids } = body;

    if (!id || !link_ids || !Array.isArray(link_ids)) {
      return NextResponse.json(
        { error: 'ID and link_ids array are required' },
        { status: 400 }
      );
    }

    // Get the main entry
    const [mainEntry] = await db
      .select()
      .from(commonbase)
      .where(eq(commonbase.id, id));

    if (!mainEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Get all entries to be linked
    const linkedEntries = await db
      .select()
      .from(commonbase)
      .where(inArray(commonbase.id, link_ids));

    if (linkedEntries.length !== link_ids.length) {
      return NextResponse.json(
        { error: 'Some linked entries not found' },
        { status: 404 }
      );
    }

    // Update main entry's links
    const currentLinks = mainEntry.metadata?.links || [];
    const newLinks = [...currentLinks, ...link_ids.filter(linkId => !currentLinks.includes(linkId))];

    await db
      .update(commonbase)
      .set({
        metadata: {
          ...mainEntry.metadata,
          links: newLinks,
        },
        updated: new Date(),
      })
      .where(eq(commonbase.id, id));

    // Update each linked entry's backlinks
    for (const linkedEntry of linkedEntries) {
      const currentBacklinks = linkedEntry.metadata?.backlinks || [];
      if (!currentBacklinks.includes(id)) {
        await db
          .update(commonbase)
          .set({
            metadata: {
              ...linkedEntry.metadata,
              backlinks: [...currentBacklinks, id],
            },
            updated: new Date(),
          })
          .where(eq(commonbase.id, linkedEntry.id));
      }
    }

    return NextResponse.json({ success: true, linked: link_ids.length });
  } catch (error) {
    console.error('Error joining entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}