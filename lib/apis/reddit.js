import axios from 'axios';

const REDDIT_BASE_URL = 'https://oauth.reddit.com';
const AUTH_URL = 'https://www.reddit.com/api/v1/access_token';
const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USERNAME = process.env.REDDIT_USERNAME;
const PASSWORD = process.env.REDDIT_PASSWORD;
const USER_AGENT = process.env.REDDIT_USER_AGENT || 'script:com.grasp.news:v1.0.0 (by /u/Klutzy-Pilot-8900)';
const RATE_LIMIT = parseInt(process.env.REDDIT_RATE_LIMIT || '60');

// Track API usage
let requestsPerMinute = 0;
let lastResetTime = Date.now();
let accessToken = null;
let tokenExpiry = null;

class RedditAPIClient {
  constructor() {
    this.clientId = CLIENT_ID;
    this.clientSecret = CLIENT_SECRET;
    this.username = USERNAME;
    this.password = PASSWORD;
    this.userAgent = USER_AGENT;
    this.baseURL = REDDIT_BASE_URL;
  }

  // Get OAuth token
  async getAccessToken() {
    // Check if we have a valid token
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      return accessToken;
    }

    // Check required credentials
    if (!USERNAME || !PASSWORD) {
      throw new Error('Reddit username and password are required for script apps. Please add REDDIT_USERNAME and REDDIT_PASSWORD to your .env.local file');
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      // For script apps, we use password grant type with actual Reddit credentials
      const params = new URLSearchParams({
        grant_type: 'password',
        username: USERNAME,
        password: PASSWORD,
      });

      const response = await axios.post(
        AUTH_URL,
        params.toString(),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.userAgent,
          },
        }
      );

      accessToken = response.data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);
      
      return accessToken;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Reddit authentication failed. Please check your username, password, client ID, and client secret.');
      }
      throw new Error('Failed to authenticate with Reddit: ' + error.message);
    }
  }

  // Create authenticated client
  async getAuthenticatedClient() {
    const token = await this.getAccessToken();
    
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': this.userAgent,
      },
      timeout: 10000,
    });
  }

  // Rate limiting check
  checkRateLimit() {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastResetTime;
    
    // Reset counter every minute
    if (timeDiff >= 60000) {
      requestsPerMinute = 0;
      lastResetTime = currentTime;
    }
    
    if (requestsPerMinute >= RATE_LIMIT) {
      const waitTime = 60000 - timeDiff;
      throw new Error(`Reddit rate limit reached. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }
    
    requestsPerMinute++;
  }

  // Transform Reddit post to our schema
  transformPost(post) {
    const data = post.data;
    
    // Try to extract location from title or subreddit
    let country_code = null;
    let category = this.mapSubredditToCategory(data.subreddit);

    return {
      title: data.title || 'Untitled',
      content: data.selftext || data.url || '',
      summary: data.selftext ? data.selftext.substring(0, 200) + '...' : '',
      source_name: `Reddit - r/${data.subreddit}`,
      source_url: `https://reddit.com${data.permalink}`,
      author: data.author || '[deleted]',
      published_at: new Date(data.created_utc * 1000),
      image_url: this.extractImageUrl(data),
      category: category,
      country_code: country_code,
      latitude: null,
      longitude: null,
      reddit_data: {
        subreddit: data.subreddit,
        score: data.score,
        upvote_ratio: data.upvote_ratio,
        num_comments: data.num_comments,
        is_video: data.is_video,
        awards: data.total_awards_received,
        flair: data.link_flair_text,
      },
      raw_data: data,
    };
  }

  // Extract image URL from Reddit post
  extractImageUrl(data) {
    // Direct image link
    if (data.url && data.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return data.url;
    }
    
    // Reddit gallery
    if (data.gallery_data && data.media_metadata) {
      const firstItem = data.gallery_data.items[0];
      const media = data.media_metadata[firstItem.media_id];
      return media?.s?.u?.replace(/&amp;/g, '&');
    }
    
    // Preview images
    if (data.preview?.images?.[0]?.source?.url) {
      return data.preview.images[0].source.url.replace(/&amp;/g, '&');
    }
    
    // Thumbnail (low quality fallback)
    if (data.thumbnail && data.thumbnail !== 'self' && data.thumbnail !== 'default') {
      return data.thumbnail;
    }
    
    return null;
  }

  // Map subreddits to categories
  mapSubredditToCategory(subreddit) {
    const subredditMap = {
      'technology': 'technology',
      'tech': 'technology',
      'programming': 'technology',
      'business': 'business',
      'economics': 'business',
      'science': 'science',
      'askscience': 'science',
      'sports': 'sports',
      'nba': 'sports',
      'soccer': 'sports',
      'nfl': 'sports',
      'entertainment': 'entertainment',
      'movies': 'entertainment',
      'television': 'entertainment',
      'politics': 'politics',
      'worldnews': 'world',
      'news': 'general',
      'health': 'health',
      'fitness': 'health',
      'environment': 'environment',
      'education': 'education',
      'travel': 'travel',
      'food': 'food',
      'cooking': 'food',
    };

    return subredditMap[subreddit.toLowerCase()] || 'general';
  }

  // Get hot posts from a subreddit
  async getHotPosts(subreddit = 'all', options = {}) {
    try {
      this.checkRateLimit();
      const client = await this.getAuthenticatedClient();
      
      const params = {
        limit: options.limit || 25,
        after: options.after || null,
        before: options.before || null,
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null) delete params[key];
      });

      const response = await client.get(`/r/${subreddit}/hot`, { params });
      
      return {
        posts: response.data.data.children.map(post => this.transformPost(post)),
        after: response.data.data.after,
        before: response.data.data.before,
        raw: response.data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get new posts
  async getNewPosts(subreddit = 'all', options = {}) {
    try {
      this.checkRateLimit();
      const client = await this.getAuthenticatedClient();
      
      const params = {
        limit: options.limit || 25,
        after: options.after || null,
        before: options.before || null,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === null) delete params[key];
      });

      const response = await client.get(`/r/${subreddit}/new`, { params });
      
      return {
        posts: response.data.data.children.map(post => this.transformPost(post)),
        after: response.data.data.after,
        before: response.data.data.before,
        raw: response.data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get top posts
  async getTopPosts(subreddit = 'all', options = {}) {
    try {
      this.checkRateLimit();
      const client = await this.getAuthenticatedClient();
      
      const params = {
        t: options.timeframe || 'day', // hour, day, week, month, year, all
        limit: options.limit || 25,
        after: options.after || null,
        before: options.before || null,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === null) delete params[key];
      });

      const response = await client.get(`/r/${subreddit}/top`, { params });
      
      return {
        posts: response.data.data.children.map(post => this.transformPost(post)),
        after: response.data.data.after,
        before: response.data.data.before,
        raw: response.data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Search posts
  async searchPosts(query, options = {}) {
    try {
      this.checkRateLimit();
      const client = await this.getAuthenticatedClient();
      
      const params = {
        q: query,
        sort: options.sort || 'relevance', // relevance, hot, top, new, comments
        t: options.timeframe || 'all',
        limit: options.limit || 25,
        after: options.after || null,
        restrict_sr: options.subreddit ? 'on' : null,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === null) delete params[key];
      });

      const subreddit = options.subreddit || '';
      const endpoint = subreddit ? `/r/${subreddit}/search` : '/search';

      const response = await client.get(endpoint, { params });
      
      return {
        posts: response.data.data.children.map(post => this.transformPost(post)),
        after: response.data.data.after,
        before: response.data.data.before,
        raw: response.data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get trending subreddits
  async getTrendingSubreddits() {
    try {
      this.checkRateLimit();
      const client = await this.getAuthenticatedClient();
      
      const response = await client.get('/api/trending_subreddits');
      
      return {
        trending: response.data.subreddit_names || [],
        raw: response.data,
      };
    } catch (error) {
      // Trending endpoint might not be available
      console.warn('Could not fetch trending subreddits:', error.message);
      return { trending: [] };
    }
  }

  // Get posts from multiple subreddits
  async getMultipleSubredditPosts(subreddits, options = {}) {
    const subredditString = subreddits.join('+');
    return this.getHotPosts(subredditString, options);
  }

  // Get news-related posts
  async getNewsPosts(options = {}) {
    const newsSubreddits = [
      'worldnews',
      'news',
      'politics',
      'technology',
      'science',
      'business',
      'economics',
    ];
    
    return this.getMultipleSubredditPosts(newsSubreddits, options);
  }

  // Get sentiment from comments
  async getPostSentiment(postId) {
    try {
      this.checkRateLimit();
      const client = await this.getAuthenticatedClient();
      
      const response = await client.get(`/comments/${postId}`, {
        params: { limit: 100 }
      });
      
      // Simple sentiment analysis based on comment scores
      const comments = response.data[1].data.children;
      let totalScore = 0;
      let commentCount = 0;
      
      comments.forEach(comment => {
        if (comment.data.body) {
          totalScore += comment.data.score;
          commentCount++;
        }
      });
      
      const averageScore = commentCount > 0 ? totalScore / commentCount : 0;
      
      return {
        averageScore,
        commentCount,
        sentiment: averageScore > 5 ? 'positive' : averageScore < -5 ? 'negative' : 'neutral',
      };
    } catch (error) {
      console.warn('Could not analyze sentiment:', error.message);
      return { sentiment: 'neutral', averageScore: 0, commentCount: 0 };
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || 'Unknown error';
      
      switch (status) {
        case 401:
          // Clear token to force re-authentication
          accessToken = null;
          tokenExpiry = null;
          throw new Error('Reddit authentication failed');
        case 429:
          throw new Error('Reddit rate limit exceeded');
        case 403:
          throw new Error('Access forbidden - check subreddit permissions');
        case 404:
          throw new Error('Subreddit or post not found');
        default:
          throw new Error(`Reddit API error: ${message}`);
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to reach Reddit API');
    } else {
      throw error;
    }
  }

  // Get remaining requests
  getRemainingRequests() {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastResetTime;
    
    if (timeDiff >= 60000) {
      return RATE_LIMIT;
    }
    
    return RATE_LIMIT - requestsPerMinute;
  }
}

// Export singleton instance
export const redditAPI = new RedditAPIClient();

// Export for testing
export default RedditAPIClient;