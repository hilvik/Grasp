import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCountryCoordinates } from '@/utils/mapHelpers';

export async function GET() {
  try {
    // Get articles without coordinates
    const { data: articles, error } = await supabaseAdmin
      .from('news_articles')
      .select('id, country_code, source_name')
      .is('latitude', null)
      .limit(100);

    if (error) {
      throw error;
    }

    let updated = 0;
    const updates = [];
    
    for (const article of articles || []) {
      let lat, lng;
      
      // Try to get coordinates from country code
      if (article.country_code) {
        const coords = getCountryCoordinates(article.country_code);
        if (coords) {
          // Add some randomness to prevent exact overlap
          lat = coords.lat + (Math.random() - 0.5) * 5;
          lng = coords.lng + (Math.random() - 0.5) * 5;
        }
      }
      
      // Try to infer from source name
      if (!lat && article.source_name) {
        const sourceLower = article.source_name.toLowerCase();
        if (sourceLower.includes('guardian') || sourceLower.includes('bbc')) {
          const ukCoords = getCountryCoordinates('GB');
          lat = ukCoords.lat + (Math.random() - 0.5) * 3;
          lng = ukCoords.lng + (Math.random() - 0.5) * 3;
        } else if (sourceLower.includes('times') || sourceLower.includes('post')) {
          const usCoords = getCountryCoordinates('US');
          lat = usCoords.lat + (Math.random() - 0.5) * 10;
          lng = usCoords.lng + (Math.random() - 0.5) * 20;
        }
      }
      
      // If still no coordinates, assign random world location
      if (!lat || !lng) {
        // More realistic distribution - concentrate around populated areas
        const regions = [
          { lat: 40, lng: -100, spread: 15 }, // North America
          { lat: 50, lng: 10, spread: 10 },   // Europe
          { lat: 35, lng: 100, spread: 20 },  // Asia
          { lat: -25, lng: 135, spread: 15 }, // Australia
          { lat: -15, lng: -60, spread: 15 }, // South America
          { lat: 0, lng: 20, spread: 20 },    // Africa
        ];
        
        const region = regions[Math.floor(Math.random() * regions.length)];
        lat = region.lat + (Math.random() - 0.5) * region.spread;
        lng = region.lng + (Math.random() - 0.5) * region.spread;
      }
      
      updates.push({
        id: article.id,
        latitude: lat,
        longitude: lng
      });
    }
    
    // Batch update
    for (const update of updates) {
      const { error: updateError } = await supabaseAdmin
        .from('news_articles')
        .update({ 
          latitude: update.latitude, 
          longitude: update.longitude 
        })
        .eq('id', update.id);
        
      if (!updateError) {
        updated++;
      }
    }
    
    return NextResponse.json({ 
      message: `Updated ${updated} articles with coordinates`,
      total: articles?.length || 0,
      updated: updated
    });
  } catch (error) {
    console.error('Error adding locations:', error);
    return NextResponse.json({ 
      error: 'Failed to add locations', 
      details: error.message 
    }, { status: 500 });
  }
}