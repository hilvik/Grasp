import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const country_code = searchParams.get('country_code');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    let query = supabaseAdmin
      .from('news_articles')
      .select('*', { count: 'exact' })  // Fixed: removed 'count()' from select
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }
    if (country_code) {
      query = query.eq('country_code', country_code);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json({ error: 'Failed to fetch articles', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], count: count || 0 });
  } catch (error) {
    console.error('Error in articles API route:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}