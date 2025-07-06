import { NextResponse } from 'next/server';

export async function GET() {
  // Hardcoded values for testing
  const CLIENT_ID = 'wGzT-xIafqpZpRr0sfgV_A';
  const CLIENT_SECRET = 'lDKwg8498jQNvA9y7qmX6brSmCKwA';
  const USER_AGENT = 'Grasp:v1.0.0 (by /u/Klutzy-Pilot-8900)';
  
  try {
    // Create Basic Auth header
    const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const base64Auth = Buffer.from(credentials).toString('base64');
    
    // Use fetch instead of axios
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64Auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'Reddit auth failed',
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: {
          authorization: `Basic ${base64Auth.substring(0, 20)}...`,
          userAgent: USER_AGENT,
        }
      });
    }

    return NextResponse.json({
      success: true,
      token: data.access_token ? 'Token received!' : 'No token',
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      scope: data.scope,
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Request failed',
      message: error.message,
      type: error.constructor.name,
    });
  }
}