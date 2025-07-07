import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Checks for existing articles in the database based on their URLs.
 * @param {Array<string>} urls - An array of article URLs to check.
 * @returns {Promise<Set<string>>} A promise that resolves to a Set containing the URLs that already exist.
 */
async function findExistingUrls(urls) {
  if (!urls || urls.length === 0) {
    return new Set();
  }

  const { data, error } = await supabaseAdmin
    .from('news_articles')
    .select('source_url')
    .in('source_url', urls);

  if (error) {
    console.error('Error checking for existing articles:', error);
    // Return an empty set on error to avoid blocking storage of new articles,
    // though this might result in duplicates if the error persists.
    return new Set();
  }

  return new Set(data.map(article => article.source_url));
}

/**
 * Stores an array of new articles in the database after filtering out duplicates.
 * @param {Array<Object>} articles - An array of article objects to store.
 * @returns {Promise<Object>} A promise that resolves to an object containing the result of the operation.
 */
export async function storeArticles(articles) {
  if (!articles || articles.length === 0) {
    return { stored: 0, duplicates: 0, errors: 0 };
  }

  const incomingUrls = articles.map(article => article.source_url);
  const existingUrls = await findExistingUrls(incomingUrls);

  const newArticles = articles.filter(article => !existingUrls.has(article.source_url));

  const duplicates = articles.length - newArticles.length;

  if (newArticles.length === 0) {
    console.log('No new articles to store.');
    return { stored: 0, duplicates, errors: 0 };
  }

  // Remove the 'raw_data' field before insertion if it exists
  const articlesToInsert = newArticles.map(article => ({
    title: article.title,
    original_content: article.original_content,
    simplified_content: article.simplified_content,
    summary: article.summary,
    source_name: article.source_name,
    source_url: article.source_url,
    author: article.author,
    published_at: article.published_at,
    category: article.category,
    country_code: article.country_code,
    city: article.city,
    latitude: article.latitude,
    longitude: article.longitude,
    sentiment_score: article.sentiment_score,
    importance_score: article.importance_score,
    image_url: article.image_url, // Include image_url
  }));

  const { data, error } = await supabaseAdmin
    .from('news_articles')
    .insert(articlesToInsert)
    .select();

  if (error) {
    console.error('Error storing new articles:', error);
    return { stored: 0, duplicates, errors: newArticles.length, error: error.message };
  }

  console.log(`Successfully stored ${data.length} new articles.`);
  return { stored: data.length, duplicates, errors: 0 };
}

/**
 * Fetches articles from the database with optional filters.
 * @param {Object} options - Options for fetching articles.
 * @param {string} [options.category] - Filter by category.
 * @param {string} [options.country_code] - Filter by country code.
 * @param {number} [options.limit=20] - Maximum number of articles to fetch.
 * @param {number} [options.offset=0] - Offset for pagination.
 * @returns {Promise<{data: Array<Object>, count: number}>} A promise that resolves to an object containing an array of article objects and the total count.
 */
export async function fetchArticles({ category, country_code, limit = 20, offset = 0 }) {
  let query = supabaseAdmin
    .from('news_articles')
    .select('*, count()', { count: 'exact' })
    .order('published_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('category', category);
  }
  if (country_code) {
    query = query.eq('country_code', country_code);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching articles:', error);
    return { data: [], count: 0 };
  }

  return { data, count };
}

/**
 * Fetches a single article by its ID.
 * @param {string} id - The ID of the article to fetch.
 * @returns {Promise<Object|null>} A promise that resolves to the article object or null if not found.
 */
export async function fetchArticleById(id) {
  const { data, error } = await supabaseAdmin
    .from('news_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching article with ID ${id}:`, error);
    return null;
  }

  return data;
}

/**
 * Searches articles in the database based on a query string.
 * @param {string} query - The search query string.
 * @param {number} [limit=20] - Maximum number of articles to fetch.
 * @param {number} [offset=0] - Offset for pagination.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of article objects.
 */
export async function searchArticles(query, limit = 20, offset = 0) {
  const { data, error } = await supabaseAdmin
    .from('news_articles')
    .select('*')
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(`Error searching articles for query "${query}":`, error);
    return [];
  }

  return data;
}