import axios from 'axios';
import { logApiUsage } from '@/utils/apiLogger';

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';
const API_KEY = process.env.NEWSAPI_KEY;
const RATE_LIMIT = parseInt(process.env.NEWSAPI_RATE_LIMIT || '100');

// Track API usage
let dailyRequests = 0;
let lastResetDate = new Date().toDateString();

class NewsAPIClient {
  constructor() {
    this.apiKey = API_KEY;
    this.baseURL = NEWSAPI_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Api-Key': this.apiKey,
        'Accept': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });
  }

  // Rate limiting check
  checkRateLimit() {
    const currentDate = new Date().toDateString();
    
    // Reset counter if it's a new day
    if (currentDate !== lastResetDate) {
      dailyRequests = 0;
      lastResetDate = currentDate;
    }
    
    if (dailyRequests >= RATE_LIMIT) {
      throw new Error(`NewsAPI rate limit reached (${RATE_LIMIT}/day)`);
    }
    
    dailyRequests++;
  }

  // Transform NewsAPI article to our schema
  transformArticle(article) {
    return {
      title: article.title || 'Untitled',
      original_content: article.content || article.description || '',
      simplified_content: null, // Not provided by NewsAPI
      summary: article.description || '',
      source_name: article.source?.name || 'Unknown',
      source_url: article.url,
      author: article.author || null,
      published_at: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      image_url: article.urlToImage || '',
      category: null,
      country_code: null,
      city: null,
      latitude: null,
      longitude: null,
      sentiment_score: null,
      importance_score: null,
      original_content: article.content || article.description || '',
      simplified_content: null,
      raw_data: article,
    };
  }

  // Get top headlines
  async getTopHeadlines(options = {}) {
    try {
      this.checkRateLimit();

      const params = {
        category: options.category || null,
        pageSize: options.pageSize || 20,
        page: options.page || 1,
        q: options.query || null,
      };

      // If a country is specified, fetch sources for that country
      // This is a workaround for developer plan limitations where country filter is not allowed
      if (options.country) {
        const sourcesResponse = await this.getSources({ country: options.country });
        if (sourcesResponse && sourcesResponse.sources && sourcesResponse.sources.length > 0) {
          params.sources = sourcesResponse.sources.map(s => s.id).join(',');
          // Category and country are mutually exclusive with sources
          delete params.category;
          delete params.country;
        } else {
          // No sources found for this country, return empty
          return { status: 'ok', totalResults: 0, articles: [] };
        }
      } else if (!options.query && !options.category) {
        // Default to US if no other filters are provided
         params.country = 'us';
      }


      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null) delete params[key];
      });

      const response = await this.client.get('/top-headlines', { params });
      logApiUsage('NewsAPI', 'top-headlines');
      return {
        status: response.data.status,
        totalResults: response.data.totalResults,
        articles: response.data.articles.map(article => this.transformArticle(article)),
        raw: response.data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Search everything
  async searchEverything(options = {}) {
    try {
      this.checkRateLimit();
      
      const params = {
        q: options.query || '*',
        sources: options.sources || null,
        domains: options.domains || null,
        from: options.from || null,
        to: options.to || null,
        language: options.language || 'en',
        sortBy: options.sortBy || 'publishedAt',
        pageSize: options.pageSize || 20,
        page: options.page || 1,
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null) delete params[key];
      });

      const response = await this.client.get('/everything', { params });
      logApiUsage('NewsAPI', 'everything');
      return {
        status: response.data.status,
        totalResults: response.data.totalResults,
        articles: response.data.articles.map(article => this.transformArticle(article)),
        raw: response.data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get available sources
  async getSources(options = {}) {
    try {
      this.checkRateLimit();
      
      const params = {
        category: options.category || null,
        language: options.language || null,
        country: options.country || null,
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null) delete params[key];
      });

      const response = await this.client.get('/sources', { params });
      
      return {
        status: response.data.status,
        sources: response.data.sources,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get headlines by category
  async getHeadlinesByCategory(category) {
    const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
    
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
    
    return this.getTopHeadlines({ category });
  }

  // Search by date range
  async searchByDateRange(query, fromDate, toDate) {
    return this.searchEverything({
      query,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      sortBy: 'publishedAt',
    });
  }

  // Get trending topics (based on top headlines)
  async getTrendingTopics(country = 'us') {
    const headlines = await this.getTopHeadlines({ country, pageSize: 100 });
    
    // Extract common words from titles (simple trending analysis)
    const wordFrequency = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were']);
    
    headlines.articles.forEach(article => {
      const words = article.title.toLowerCase().split(/\W+/);
      words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
    });
    
    // Sort by frequency and return top 10
    const trending = Object.entries(wordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    return trending;
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // API returned an error
      const status = error.response.status;
      const message = error.response.data?.message || 'Unknown error';
      
      switch (status) {
        case 401:
          throw new Error('Invalid NewsAPI key');
        case 429:
          throw new Error('NewsAPI rate limit exceeded');
        case 400:
          throw new Error(`Bad request: ${message}`);
        default:
          throw new Error(`NewsAPI error: ${message}`);
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to reach NewsAPI');
    } else {
      throw error;
    }
  }

  // Get remaining requests for the day
  getRemainingRequests() {
    const currentDate = new Date().toDateString();
    
    if (currentDate !== lastResetDate) {
      dailyRequests = 0;
      lastResetDate = currentDate;
    }
    
    return RATE_LIMIT - dailyRequests;
  }
}

// Export singleton instance
export const newsAPI = new NewsAPIClient();

// Export for testing or multiple instances
export default NewsAPIClient;