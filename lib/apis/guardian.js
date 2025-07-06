import axios from 'axios';

const GUARDIAN_BASE_URL = 'https://content.guardianapis.com';
const API_KEY = process.env.GUARDIAN_API_KEY;
const RATE_LIMIT = parseInt(process.env.GUARDIAN_RATE_LIMIT || '5000');

// Track API usage
let dailyRequests = 0;
let lastResetDate = new Date().toDateString();

class GuardianAPIClient {
  constructor() {
    this.apiKey = API_KEY;
    this.baseURL = GUARDIAN_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      params: {
        'api-key': this.apiKey,
      },
      timeout: 10000,
    });
  }

  // Rate limiting check
  checkRateLimit() {
    const currentDate = new Date().toDateString();
    
    if (currentDate !== lastResetDate) {
      dailyRequests = 0;
      lastResetDate = currentDate;
    }
    
    if (dailyRequests >= RATE_LIMIT) {
      throw new Error(`Guardian API rate limit reached (${RATE_LIMIT}/day)`);
    }
    
    dailyRequests++;
  }

  // Transform Guardian article to our schema
  transformArticle(article) {
    // Extract location from tags if available
    const locationTag = article.tags?.find(tag => tag.type === 'keyword' && tag.webTitle.includes(','));
    let country_code = null;
    let latitude = null;
    let longitude = null;

    // Try to extract category from section
    const category = this.mapSectionToCategory(article.sectionId);

    return {
      title: article.webTitle || 'Untitled',
      content: article.fields?.body || article.fields?.bodyText || '',
      summary: article.fields?.trailText || article.fields?.standfirst || '',
      source_name: 'The Guardian',
      source_url: article.webUrl,
      author: article.fields?.byline || null,
      published_at: article.webPublicationDate ? new Date(article.webPublicationDate) : new Date(),
      image_url: article.fields?.thumbnail || null,
      category: category,
      country_code: country_code,
      latitude: latitude,
      longitude: longitude,
      tags: article.tags?.map(tag => tag.webTitle) || [],
      section: article.sectionName,
      raw_data: article,
    };
  }

  // Map Guardian sections to our categories
  mapSectionToCategory(sectionId) {
    const sectionMap = {
      'technology': 'technology',
      'business': 'business',
      'science': 'science',
      'sport': 'sports',
      'football': 'sports',
      'culture': 'entertainment',
      'film': 'entertainment',
      'music': 'entertainment',
      'politics': 'politics',
      'world': 'world',
      'uk-news': 'national',
      'us-news': 'national',
      'environment': 'environment',
      'money': 'finance',
      'education': 'education',
      'society': 'health',
      'lifeandstyle': 'lifestyle',
      'travel': 'travel',
      'food': 'food',
    };

    return sectionMap[sectionId] || 'general';
  }

  // Search content
  async searchContent(options = {}) {
    try {
      this.checkRateLimit();
      
      const params = {
        q: options.query || null,
        section: options.section || null,
        tag: options.tag || null,
        'from-date': options.fromDate || null,
        'to-date': options.toDate || null,
        'order-by': options.orderBy || 'newest',
        'show-fields': options.showFields || 'all',
        'show-tags': options.showTags || 'all',
        'page-size': options.pageSize || 20,
        page: options.page || 1,
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null) delete params[key];
      });

      const response = await this.client.get('/search', { params });
      
      return {
        status: response.data.response.status,
        total: response.data.response.total,
        startIndex: response.data.response.startIndex,
        pageSize: response.data.response.pageSize,
        currentPage: response.data.response.currentPage,
        pages: response.data.response.pages,
        articles: response.data.response.results.map(article => this.transformArticle(article)),
        raw: response.data.response,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get sections
  async getSections() {
    try {
      this.checkRateLimit();
      
      const response = await this.client.get('/sections');
      
      return {
        status: response.data.response.status,
        sections: response.data.response.results,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get tags
  async getTags(options = {}) {
    try {
      this.checkRateLimit();
      
      const params = {
        q: options.query || null,
        type: options.type || null,
        section: options.section || null,
        'page-size': options.pageSize || 20,
        page: options.page || 1,
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null) delete params[key];
      });

      const response = await this.client.get('/tags', { params });
      
      return {
        status: response.data.response.status,
        total: response.data.response.total,
        tags: response.data.response.results,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get single item
  async getItem(id) {
    try {
      this.checkRateLimit();
      
      const params = {
        'show-fields': 'all',
        'show-tags': 'all',
      };

      const response = await this.client.get(`/${id}`, { params });
      
      return {
        status: response.data.response.status,
        article: this.transformArticle(response.data.response.content),
        raw: response.data.response,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get latest articles
  async getLatestArticles(section = null, pageSize = 20) {
    return this.searchContent({
      section,
      orderBy: 'newest',
      pageSize,
    });
  }

  // Get articles by category
  async getArticlesByCategory(category, pageSize = 20) {
    const categoryToSection = {
      'technology': 'technology',
      'business': 'business',
      'sports': 'sport',
      'entertainment': 'culture',
      'politics': 'politics',
      'science': 'science',
      'health': 'society',
      'environment': 'environment',
      'education': 'education',
      'travel': 'travel',
      'food': 'food',
    };

    const section = categoryToSection[category];
    if (!section) {
      throw new Error(`Unknown category: ${category}`);
    }

    return this.getLatestArticles(section, pageSize);
  }

  // Get in-depth articles (long reads)
  async getLongReads(pageSize = 10) {
    return this.searchContent({
      tag: 'tone/features,type/article',
      orderBy: 'newest',
      pageSize,
    });
  }

  // Get opinion pieces
  async getOpinionPieces(pageSize = 20) {
    return this.searchContent({
      section: 'commentisfree',
      orderBy: 'newest',
      pageSize,
    });
  }

  // Search by date range
  async searchByDateRange(query, fromDate, toDate, pageSize = 20) {
    return this.searchContent({
      query,
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
      orderBy: 'newest',
      pageSize,
    });
  }

  // Get live blog entries
  async getLiveBlogs(pageSize = 10) {
    return this.searchContent({
      tag: 'tone/minutebyminute',
      orderBy: 'newest',
      pageSize,
    });
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Unknown error';
      
      switch (status) {
        case 401:
          throw new Error('Invalid Guardian API key');
        case 429:
          throw new Error('Guardian API rate limit exceeded');
        case 400:
          throw new Error(`Bad request: ${message}`);
        case 403:
          throw new Error('Access forbidden - check your API key permissions');
        default:
          throw new Error(`Guardian API error: ${message}`);
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to reach Guardian API');
    } else {
      throw error;
    }
  }

  // Get remaining requests
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
export const guardianAPI = new GuardianAPIClient();

// Export for testing
export default GuardianAPIClient;