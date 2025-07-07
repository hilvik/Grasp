'use client';

import { useEffect, useState } from 'react';
import NewsCard from './NewsCard';
import { fetchArticles } from '@/utils/newsProcessor';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const ARTICLES_PER_PAGE = 9;

export default function NewsList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function getArticles() {
      try {
        setLoading(true);
        const { data, count } = await fetchArticles({
          limit: ARTICLES_PER_PAGE,
          offset: page * ARTICLES_PER_PAGE,
        });

        setArticles((prevArticles) => [...prevArticles, ...data]);
        setHasMore(articles.length + data.length < count);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getArticles();
  }, [page]);

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
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
    return <p className="text-red-500">Error loading news: {error}</p>;
  }

  if (articles.length === 0 && !loading) {
    return <p>No news articles found.</p>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
      {hasMore && (
        <Button onClick={handleLoadMore} disabled={loading} className="mt-8">
          {loading ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}
