import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
  const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
  const USER_AGENT = process.env.REDDIT_USER_AGENT;
  
  const debug = {
    environment: {
      CLIENT_ID: CLIENT_ID ? `${CLIENT_ID.substring(0, 5)}...` : 'NOT SET',
      CLIENT_SECRET: CLIENT_SECRET ? `${CLIENT_SECRET.substring(0, 5)}...` : 'NOT SET',
      USER_AGENT: USER_AGENT || 'NOT SET',
    },
    authAttempt: null,
    error: null
  };

  if (!CLIENT_ID || !CLIENT_SECRET) {
    debug.error = 'Missing Reddit credentials in environment variables';
    return NextResponse.json(debug);
  }

  // Try to authenticate
  try {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    debug.authDetails = {
      authHeaderPreview: `Basic ${auth.substring(0, 10)}...`,
      clientIdLength: CLIENT_ID.length,
      secretLength: CLIENT_SECRET.length,
    };
    
    // Try with URLSearchParams for body
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      params,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT || 'Grasp:v1.0.0',
        },
      }
    );

    debug.authAttempt = {
      success: true,
      tokenReceived: !!response.data.access_token,
      tokenType: response.data.token_type,
      expiresIn: response.data.expires_in,
    };

    // Try a simple API call
    const testResponse = await axios.get(
      'https://oauth.reddit.com/r/news/hot.json?limit=1',
      {
        headers: {
          'Authorization': `Bearer ${response.data.access_token}`,
          'User-Agent': USER_AGENT || 'Grasp:v1.0.0',
        },
      }
    );

    debug.testCall = {
      success: true,
      postCount: testResponse.data.data.children.length,
      firstPost: testResponse.data.data.children[0]?.data?.title || 'No posts found',
    };

  } catch (error) {
    debug.authAttempt = {
      success: false,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      errorMessage: error.message,
    };
  }

  return NextResponse.json(debug);
}