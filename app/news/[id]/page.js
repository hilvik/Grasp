'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchArticleById, fetchArticles } from '@/utils/newsProcessor';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { ChevronRight, Calendar, Clock, User } from 'lucide-react';
import { calculateReadingTime } from '@/utils/helpers';
import ShareButtons from '@/components/ShareButtons';
import NewsCard from '@/components/news/NewsCard';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getArticle() {
      try {
        setLoading(true);
        const fetchedArticle = await fetchArticleById(id);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
          
          // Fetch related articles from the same category
          if (fetchedArticle.category) {
            const { data } = await fetchArticles({ 
              category: fetchedArticle.category, 
              limit: 4 
            });
            // Filter out the current article
            setRelatedArticles(data.filter(a => a.id !== fetchedArticle.id).slice(0, 3));
          }
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
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
        <button onClick={() => router.back()} className="text-primary hover:underline mt-4">Go Back</button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Article not found.</p>
        <button onClick={() => router.back()} className="text-primary hover:underline mt-4">Go Back</button>
      </div>
    );
  }

  const readingTime = calculateReadingTime(article.original_content || article.summary || '');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="hover:underline">Home</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
            </li>
            <li className="flex items-center">
              <Link href="/news" className="hover:underline">News</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
            </li>
            {article.category && (
              <>
                <li className="flex items-center">
                  <Link href={`/news?category=${article.category}`} className="hover:underline capitalize">
                    {article.category}
                  </Link>
                  <ChevronRight className="h-4 w-4 mx-1" />
                </li>
              </>
            )}
            <li className="flex items-center">
              <span className="truncate max-w-xs">{article.title}</span>
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{article.author || article.source_name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(article.published_at), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {article.category && (
              <Badge variant="secondary" className="capitalize">{article.category}</Badge>
            )}
            {article.source_name && (
              <Badge variant="outline">{article.source_name}</Badge>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {article.image_url && (
          <img 
            src={article.image_url} 
            alt={article.title} 
            className="w-full h-auto object-cover rounded-lg mb-8 max-h-[500px]" 
          />
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8">
          {article.original_content ? (
            <div className="whitespace-pre-wrap">{article.original_content}</div>
          ) : article.summary ? (
            <div>
              <p className="text-xl text-muted-foreground mb-4">{article.summary}</p>
              {article.source_url && (
                <p className="text-sm">
                  <a 
                    href={article.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Read full article at source →
                  </a>
                </p>
              )}
            </div>
          ) : (
            <p>No content available for this article.</p>
          )}
        </div>

        {/* Share Buttons */}
        {typeof window !== 'undefined' && (
          <ShareButtons 
            articleTitle={article.title} 
            articleUrl={`${window.location.origin}/news/${article.id}`} 
          />
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <NewsCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>
          </section>
        )}

        {/* Back to News */}
        <div className="mt-8 pt-8 border-t">
          <Link href="/news" className="text-primary hover:underline">
            ← Back to News
          </Link>
        </div>
      </div>
    </div>
  );
}