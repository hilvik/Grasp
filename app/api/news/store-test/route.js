import { NextResponse } from 'next/server';
import { newsAPI } from '@/lib/apis/newsapi';
import { storeArticles } from '@/utils/newsProcessor';

export async function GET(request) {
  try {
    // 1. Fetch latest news from NewsAPI
    const newsResponse = await newsAPI.getTopHeadlines({ country: 'us', pageSize: 10 });

    if (!newsResponse || newsResponse.status !== 'ok') {
      throw new Error('Failed to fetch news from NewsAPI');
    }

    const articlesToStore = newsResponse.articles;

    // 2. Store the fetched articles in the database
    const storageResult = await storeArticles(articlesToStore);

    // 3. Return a summary of the operation
    return NextResponse.json({
      message: 'News fetching and storing process completed.',
      fetchedArticles: articlesToStore.length,
      stored: storageResult.stored,
      duplicates: storageResult.duplicates,
      errors: storageResult.errors,
      storageError: storageResult.error || null,
    });

  } catch (error) {
    console.error('Error in store-test route:', error);
    return NextResponse.json(
      { 
        message: 'An error occurred during the test run.',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
