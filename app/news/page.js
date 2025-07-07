'use client';

import NewsList from '@/components/news/NewsList';

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Latest News</h1>
      <NewsList />
    </div>
  );
}
