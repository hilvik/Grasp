'use client';

import { useEffect, useState, useCallback } from 'react';
import NewsCard from './NewsCard';
import { fetchArticles } from '@/utils/newsProcessor';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const ARTICLES_PER_PAGE = 9;

export default function NewsList({ category }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const getArticles = useCallback(async (pageNum, isRefresh = false) => {
    try {
      setLoading(true);
      const { data, count } = await fetchArticles({
        category: category,
        limit: ARTICLES_PER_PAGE,
        offset: pageNum * ARTICLES_PER_PAGE,
      });

      if (isRefresh) {
        setArticles(data);
      } else {
        setArticles((prevArticles) => [...prevArticles, ...data]);
      }
      
      setTotalCount(count);
      setHasMore((pageNum + 1) * ARTICLES_PER_PAGE < count);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    // Reset when category changes
    setArticles([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    getArticles(0);
  }, [category, getArticles]);

  useEffect(() => {
    // Load more articles when page changes (but not on initial load)
    if (page > 0) {
      getArticles(page);
    }
  }, [page, getArticles]);

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    getArticles(0, true);
  };

  if (loading && articles.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(ARTICLES_PER_PAGE)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error loading news: {error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (articles.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No news articles found{category ? ` in ${category} category` : ''}.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Article count and refresh button */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {articles.length} of {totalCount} articles
          {category && ` in ${category}`}
        </p>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="mt-8 text-center">
          <Button 
            onClick={handleLoadMore} 
            disabled={loading}
            size="lg"
          >
            {loading ? 'Loading...' : 'Load More Articles'}
          </Button>
        </div>
      )}

      {/* End of articles message */}
      {!hasMore && articles.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            You've reached the end! {totalCount} articles loaded.
          </p>
        </div>
      )}
    </div>
  );
}