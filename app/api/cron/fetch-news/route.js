import { NextResponse } from 'next/server';
import { newsAPI } from '@/lib/apis/newsapi';
import { guardianAPI } from '@/lib/apis/guardian';
import { redditAPI } from '@/lib/apis/reddit';
import { storeArticles } from '@/utils/newsProcessor';

export async function GET() {
  try {
    console.log('Starting scheduled news fetch...');
    
    let totalStored = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;

    // Fetch from NewsAPI
    try {
      const newsApiResponse = await newsAPI.getTopHeadlines({ pageSize: 20 });
      if (newsApiResponse?.articles?.length > 0) {
        const result = await storeArticles(newsApiResponse.articles);
        totalStored += result.stored;
        totalDuplicates += result.duplicates;
        totalErrors += result.errors;
        console.log(`NewsAPI: Stored ${result.stored} new articles, ${result.duplicates} duplicates`);
      }
    } catch (error) {
      console.error('NewsAPI fetch error:', error.message);
    }

    // Fetch from Guardian API
    try {
      const guardianResponse = await guardianAPI.getLatestArticles(null, 20);
      if (guardianResponse?.articles?.length > 0) {
        const result = await storeArticles(guardianResponse.articles);
        totalStored += result.stored;
        totalDuplicates += result.duplicates;
        totalErrors += result.errors;
        console.log(`Guardian: Stored ${result.stored} new articles, ${result.duplicates} duplicates`);
      }
    } catch (error) {
      console.error('Guardian API fetch error:', error.message);
    }

    // Fetch from Reddit API (news-related subreddits)
    try {
      const redditResponse = await redditAPI.getNewsPosts({ limit: 20 });
      if (redditResponse?.posts?.length > 0) {
        const result = await storeArticles(redditResponse.posts);
        totalStored += result.stored;
        totalDuplicates += result.duplicates;
        totalErrors += result.errors;
        console.log(`Reddit: Stored ${result.stored} new articles, ${result.duplicates} duplicates`);
      }
    } catch (error) {
      console.error('Reddit API fetch error:', error.message);
    }

    console.log('Scheduled news fetch completed.');
    return NextResponse.json({ 
      message: 'News fetch completed',
      results: {
        stored: totalStored,
        duplicates: totalDuplicates,
        errors: totalErrors
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error during scheduled news fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch news', details: error.message }, { status: 500 });
  }
}