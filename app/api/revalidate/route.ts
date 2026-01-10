import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  const tags = request.nextUrl.searchParams.get('tags');
  const type = request.nextUrl.searchParams.get('type') as 'layout' | 'page' | undefined;

  const results: string[] = [];

  if (path) {
    revalidatePath(path, type);
    results.push(`Revalidated path: ${path} (type: ${type || 'default'})`);
    console.log(`[API] Revalidated path: ${path} (type: ${type || 'default'})`);
  }

  if (tags) {
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    tagList.forEach((tag) => {
      // @ts-ignore
      revalidateTag(tag);
      results.push(`Revalidated tag: ${tag}`);
      console.log(`[API] Revalidated tag: ${tag}`);
    });
  }

  if (results.length === 0) {
    return NextResponse.json(
      { 
        message: 'No path or tags provided to revalidate',
        usage: '/api/revalidate?path=/some-path&tags=tag1,tag2' 
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    results,
  });
}
