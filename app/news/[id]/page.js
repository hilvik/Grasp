'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchArticleById } from '@/utils/newsProcessor';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { calculateReadingTime } from '@/utils/helpers';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getArticle() {
      try {
        setLoading(true);
        const fetchedArticle = await fetchArticleById(id);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getArticle();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Error: {error}</p>
        <button onClick={() => router.back()} className="text-blue-500 hover:underline mt-4">Go Back</button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Article not found.</p>
        <button onClick={() => router.back()} className="text-blue-500 hover:underline mt-4">Go Back</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <Link href="/news" className="hover:underline">News</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
          </li>
          <li className="flex items-center">
            <span>{article.title}</span>
          </li>
        </ol>
      </nav>

      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <p className="text-muted-foreground text-lg mb-6">
        By {article.author || 'Unknown'} • {format(new Date(article.published_at), 'MMMM dd, yyyy')} • {calculateReadingTime(article.original_content)} min read
      </p>

      {article.image_url && (
        <img src={article.image_url} alt={article.title} className="w-full h-auto object-cover rounded-lg mb-8" />
      )}

      <div className="prose prose-lg max-w-none mb-8">
        <p>{article.original_content}</p>
      </div>

      <Link href="/news" className="text-primary hover:underline">
        &larr; Back to News
      </Link>
    </div>
  );
}
