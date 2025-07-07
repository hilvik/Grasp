import { NextResponse } from 'next/server';
import { newsAPI } from '@/lib/apis/newsapi';
import { guardianAPI } from '@/lib/apis/guardian';
import { redditAPI } from '@/lib/apis/reddit';
import { storeArticles } from '@/utils/newsProcessor';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';
    const count = parseInt(searchParams.get('count') || '10');
    
    const results = {
      timestamp: new Date().toISOString(),
      requested: { source, count },
      results: {}
    };

    // Fetch from NewsAPI
    if (source === 'all' || source === 'newsapi') {
      try {
        const newsApiResponse = await newsAPI.getTopHeadlines({ pageSize: count });
        const storeResult = await storeArticles(newsApiResponse.articles);
        results.results.newsAPI = {
          success: true,
          fetched: newsApiResponse.articles.length,
          stored: storeResult.stored,
          duplicates: storeResult.duplicates,
          errors: storeResult.errors
        };
      } catch (error) {
        results.results.newsAPI = {
          success: false,
          error: error.message
        };
      }
    }

    // Fetch from Guardian
    if (source === 'all' || source === 'guardian') {
      try {
        const guardianResponse = await guardianAPI.getLatestArticles(null, count);
        const storeResult = await storeArticles(guardianResponse.articles);
        results.results.guardian = {
          success: true,
          fetched: guardianResponse.articles.length,
          stored: storeResult.stored,
          duplicates: storeResult.duplicates,
          errors: storeResult.errors
        };
      } catch (error) {
        results.results.guardian = {
          success: false,
          error: error.message
        };
      }
    }

    // Fetch from Reddit
    if (source === 'all' || source === 'reddit') {
      try {
        const redditResponse = await redditAPI.getNewsPosts({ limit: count });
        const storeResult = await storeArticles(redditResponse.posts);
        results.results.reddit = {
          success: true,
          fetched: redditResponse.posts.length,
          stored: storeResult.stored,
          duplicates: storeResult.duplicates,
          errors: storeResult.errors
        };
      } catch (error) {
        results.results.reddit = {
          success: false,
          error: error.message
        };
      }
    }

    // Calculate totals
    const totals = {
      fetched: 0,
      stored: 0,
      duplicates: 0,
      errors: 0
    };

    Object.values(results.results).forEach(result => {
      if (result.success) {
        totals.fetched += result.fetched || 0;
        totals.stored += result.stored || 0;
        totals.duplicates += result.duplicates || 0;
        totals.errors += result.errors || 0;
      }
    });

    results.totals = totals;
    results.message = `Successfully fetched ${totals.fetched} articles, stored ${totals.stored} new articles`;

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch news',
        details: error.message 
      },
      { status: 500 }
    );
  }
}