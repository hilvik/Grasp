import { NextResponse } from 'next/server';
import RedditAPIClient from '@/lib/RedditAPIClient';

export async function GET(request) {
  try {
    const redditAPI = new RedditAPIClient();
    const data = await redditAPI.getHotPosts('news', { limit: 5 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
