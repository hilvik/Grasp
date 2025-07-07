import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Globe, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function NewsCard({ article }) {
  // Determine sentiment icon and color
  const getSentimentDisplay = (score) => {
    if (!score && score !== 0) return null;
    
    if (score > 0.2) {
      return {
        icon: <TrendingUp className="h-3 w-3" />,
        label: 'Positive',
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    } else if (score < -0.2) {
      return {
        icon: <TrendingDown className="h-3 w-3" />,
        label: 'Negative',
        className: 'bg-red-100 text-red-800 border-red-200'
      };
    } else {
      return {
        icon: <Minus className="h-3 w-3" />,
        label: 'Neutral',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      };
    }
  };

  const sentiment = getSentimentDisplay(article.sentiment_score);
  const readingTime = article.original_content 
    ? Math.ceil(article.original_content.split(' ').length / 200)
    : 2;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg group h-full">
      {/* Image Section */}
      <Link href={`/news/${article.id}`} className="relative aspect-video overflow-hidden bg-muted">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`h-full w-full ${article.image_url ? 'hidden' : 'flex'} items-center justify-center bg-muted`}
        >
          <Globe className="h-12 w-12 text-muted-foreground" />
        </div>
      </Link>

      {/* Content Section */}
      <CardHeader className="flex-grow">
        <CardTitle className="text-xl leading-tight line-clamp-2">
          <Link href={`/news/${article.id}`} className="hover:underline">
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
          <span>{article.source_name}</span>
          <span>•</span>
          <span>{format(new Date(article.published_at), 'MMM dd, yyyy')}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime} min
          </span>
        </CardDescription>
      </CardHeader>

      {/* Summary Section */}
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground line-clamp-3">
          {article.summary || article.original_content?.substring(0, 150) + '...' || 'No summary available.'}
        </p>
      </CardContent>

      {/* Footer with Badges */}
      <CardFooter className="flex flex-wrap gap-2">
        {article.category && (
          <Badge variant="secondary" className="capitalize">
            {article.category}
          </Badge>
        )}
        
        {article.country_code && (
          <Badge variant="outline">
            {article.country_code.toUpperCase()}
          </Badge>
        )}
        
        {sentiment && (
          <Badge variant="outline" className={sentiment.className}>
            <span className="flex items-center gap-1">
              {sentiment.icon}
              {sentiment.label}
            </span>
          </Badge>
        )}

        {article.importance_score && article.importance_score > 7 && (
          <Badge variant="default" className="bg-orange-500">
            Important
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}