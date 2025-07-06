import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are loaded
  const envStatus = {
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID ? '✅ Set' : '❌ Missing',
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT ? '✅ Set' : '❌ Missing',
    NEWSAPI_KEY: process.env.NEWSAPI_KEY ? '✅ Set' : '❌ Missing',
    GUARDIAN_API_KEY: process.env.GUARDIAN_API_KEY ? '✅ Set' : '❌ Missing',
  };

  // Show partial values for debugging (first 5 chars only for security)
  const partialValues = {
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID?.substring(0, 5) + '...' || 'Not set',
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET?.substring(0, 5) + '...' || 'Not set',
    REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT || 'Not set',
  };

  return NextResponse.json({
    status: 'Environment Variable Check',
    variables: envStatus,
    partialValues: partialValues,
    note: 'Make sure your .env.local file is in the root directory and you restarted the dev server after adding variables'
  });
}