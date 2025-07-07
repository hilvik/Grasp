import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function logApiUsage(apiName, endpoint, count = 1) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Try to find an existing entry for today
    const { data, error } = await supabaseAdmin
      .from('api_usage_logs')
      .select('id, requests_count')
      .eq('api_name', apiName)
      .eq('endpoint', endpoint)
      .eq('date', today)
      .single();

    if (error && error.code === 'PGRST116') { // No rows found
      // Insert new entry
      const { error: insertError } = await supabaseAdmin
        .from('api_usage_logs')
        .insert({
          api_name: apiName,
          endpoint: endpoint,
          requests_count: count,
          date: today,
        });

      if (insertError) {
        console.error(`Error inserting API usage for ${apiName}-${endpoint}:`, insertError);
      }
    } else if (error) {
      console.error(`Error querying API usage for ${apiName}-${endpoint}:`, error);
    } else if (data) {
      // Update existing entry
      const { error: updateError } = await supabaseAdmin
        .from('api_usage_logs')
        .update({ requests_count: data.requests_count + count })
        .eq('id', data.id);

      if (updateError) {
        console.error(`Error updating API usage for ${apiName}-${endpoint}:`, updateError);
      }
    }
  } catch (e) {
    console.error(`Unexpected error in logApiUsage for ${apiName}-${endpoint}:`, e);
  }
}
