'use client';

import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewsList from '@/components/news/NewsList';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  { label: 'All News', value: 'all' },
  { label: 'Technology', value: 'technology' },
  { label: 'Business', value: 'business' },
  { label: 'Health', value: 'health' },
  { label: 'Science', value: 'science' },
  { label: 'Sports', value: 'sports' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Politics', value: 'politics' },
  { label: 'World', value: 'world' },
];

export default function NewsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Latest News</h1>
        <p className="text-muted-foreground">
          Stay informed with the latest news from around the world
        </p>
      </div>

      <Tabs value={category} className="w-full">
        <TabsList className="w-full justify-start flex-wrap h-auto p-1 mb-6">
          {CATEGORIES.map((cat) => (
            <TabsTrigger 
              key={cat.value} 
              value={cat.value}
              asChild
            >
              <a href={`/news${cat.value === 'all' ? '' : `?category=${cat.value}`}`}>
                {cat.label}
              </a>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            <NewsList category={cat.value === 'all' ? undefined : cat.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}