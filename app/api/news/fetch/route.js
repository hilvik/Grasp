import { NextResponse } from 'next/server';
import { newsAPI } from '@/lib/apis/newsapi';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'us';
    const category = searchParams.get('category');
    const query = searchParams.get('query');

    let data;
    if (query) {
      data = await newsAPI.searchEverything({ query });
    } else {
      data = await newsAPI.getTopHeadlines({ country, category });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
