import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // Get articles with and without coordinates
    const { data: withCoords, error: error1 } = await supabaseAdmin
      .from('news_articles')
      .select('id, title, latitude, longitude, country_code')
      .not('latitude', 'is', null)
      .limit(5);
      
    const { data: withoutCoords, error: error2 } = await supabaseAdmin
      .from('news_articles')
      .select('id, title, latitude, longitude, country_code')
      .is('latitude', null)
      .limit(5);
      
    const { count: totalWithCoords } = await supabaseAdmin
      .from('news_articles')
      .select('*', { count: 'exact', head: true })
      .not('latitude', 'is', null);
      
    const { count: totalWithoutCoords } = await supabaseAdmin
      .from('news_articles')
      .select('*', { count: 'exact', head: true })
      .is('latitude', null);
    
    return NextResponse.json({
      summary: {
        articlesWithCoordinates: totalWithCoords || 0,
        articlesWithoutCoordinates: totalWithoutCoords || 0,
        total: (totalWithCoords || 0) + (totalWithoutCoords || 0)
      },
      samples: {
        withCoordinates: withCoords || [],
        withoutCoordinates: withoutCoords || []
      },
      recommendation: totalWithoutCoords > 0 
        ? 'Run /api/add-locations to add coordinates to articles without them'
        : 'All articles have coordinates!'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check map data', 
      details: error.message 
    }, { status: 500 });
  }
}