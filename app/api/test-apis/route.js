import { NextResponse } from 'next/server';
import { newsAPI } from '@/lib/apis/newsapi';
import { guardianAPI } from '@/lib/apis/guardian';
import { redditAPI } from '@/lib/apis/reddit';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
    apis: {}
  };
  
  // Test NewsAPI
  try {
    const news = await newsAPI.getTopHeadlines({ pageSize: 3 });
    results.apis.newsAPI = {
      success: true,
      totalResults: news.totalResults,
      articles: news.articles.length,
      titles: news.articles.map(a => a.title),
      remainingRequests: newsAPI.getRemainingRequests()
    };
  } catch (error) {
    results.apis.newsAPI = {
      success: false,
      error: error.message
    };
  }
  
  // Test Guardian API
  try {
    const guardian = await guardianAPI.getLatestArticles(null, 3);
    results.apis.guardian = {
      success: true,
      total: guardian.total,
      articles: guardian.articles.length,
      titles: guardian.articles.map(a => a.title),
      remainingRequests: guardianAPI.getRemainingRequests()
    };
  } catch (error) {
    results.apis.guardian = {
      success: false,
      error: error.message
    };
  }
  
  // Test Reddit API
  try {
    // Check if Reddit credentials are set
    const hasRedditCreds = process.env.REDDIT_USERNAME && process.env.REDDIT_PASSWORD;
    
    if (!hasRedditCreds) {
      results.apis.reddit = {
        success: false,
        error: 'Reddit username and password are required for script apps. Please add REDDIT_USERNAME and REDDIT_PASSWORD to your .env.local file',
        setup: {
          REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID ? '✅ Set' : '❌ Missing',
          REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
          REDDIT_USERNAME: process.env.REDDIT_USERNAME ? '✅ Set' : '❌ Missing',
          REDDIT_PASSWORD: process.env.REDDIT_PASSWORD ? '✅ Set' : '❌ Missing',
        }
      };
    } else {
      const reddit = await redditAPI.getHotPosts('news', { limit: 3 });
      results.apis.reddit = {
        success: true,
        posts: reddit.posts.length,
        titles: reddit.posts.map(p => p.title),
        subreddits: reddit.posts.map(p => p.reddit_data?.subreddit || 'unknown'),
        remainingRequests: redditAPI.getRemainingRequests()
      };
    }
  } catch (error) {
    results.apis.reddit = {
      success: false,
      error: error.message,
      tip: error.message.includes('username and password') 
        ? 'Set a password on your Reddit account at https://www.reddit.com/settings/account' 
        : 'Check your Reddit app credentials'
    };
  }
  
  // Summary
  results.summary = {
    totalAPIs: 3,
    working: Object.values(results.apis).filter(api => api.success).length,
    failed: Object.values(results.apis).filter(api => !api.success).length
  };
  
  // Add helpful next steps
  if (results.summary.failed > 0) {
    results.nextSteps = [];
    
    if (!results.apis.newsAPI?.success) {
      results.nextSteps.push('Sign up at https://newsapi.org/register for NewsAPI key');
    }
    
    if (!results.apis.guardian?.success) {
      results.nextSteps.push('Sign up at https://open-platform.theguardian.com/access/ for Guardian API key');
    }
    
    if (!results.apis.reddit?.success) {
      if (results.apis.reddit?.error?.includes('username and password')) {
        results.nextSteps.push('Set a password on your Reddit account at https://www.reddit.com/settings/account');
        results.nextSteps.push('Add REDDIT_USERNAME and REDDIT_PASSWORD to your .env.local file');
      } else {
        results.nextSteps.push('Check your Reddit app credentials and ensure it\'s a "script" type app');
      }
    }
  } else {
    results.message = '🎉 All APIs are working! You\'re ready for Day 16!';
  }
  
  return NextResponse.json(results, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}