import { NextResponse } from 'next/server';
import { newsAPI } from '@/lib/apis/newsapi';
import { guardianAPI } from '@/lib/apis/guardian';
import { redditAPI } from '@/lib/apis/reddit';
import { storeArticles } from '@/utils/newsProcessor';

export async function GET() {
  try {
    console.log('Starting scheduled news fetch...');

    // Fetch from NewsAPI
    const newsApiArticles = await newsAPI.getTopHeadlines({ pageSize: 20 });
    if (newsApiArticles?.articles?.length > 0) {
      await storeArticles(newsApiArticles.articles);
      console.log(`Stored ${newsApiArticles.articles.length} articles from NewsAPI.`);
    }

    // Fetch from Guardian API
    const guardianArticles = await guardianAPI.getLatestArticles(null, 20);
    if (guardianArticles?.articles?.length > 0) {
      await storeArticles(guardianArticles.articles);
      console.log(`Stored ${guardianArticles.articles.length} articles from Guardian API.`);
    }

    // Fetch from Reddit API (news-related subreddits)
    const redditPosts = await redditAPI.getNewsPosts({ limit: 20 });
    if (redditPosts?.posts?.length > 0) {
      await storeArticles(redditPosts.posts);
      console.log(`Stored ${redditPosts.posts.length} posts from Reddit API.`);
    }

    console.log('Scheduled news fetch completed.');
    return NextResponse.json({ message: 'News fetch completed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error during scheduled news fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch news', details: error.message }, { status: 500 });
  }
}
