import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function NewsCard({ article }) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      {article.image_url && (
        <div className="relative h-48 w-full">
          <img
            src={article.image_url}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader className="flex-grow">
        <CardTitle className="text-xl leading-tight">
          <Link href={`/news/${article.id}`} className="hover:underline">
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {article.source_name} • {format(new Date(article.published_at), 'MMM dd, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground line-clamp-3">
          {article.summary}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {article.category && <Badge variant="secondary">{article.category}</Badge>}
        {article.country_code && <Badge variant="outline">{article.country_code.toUpperCase()}</Badge>}
        {article.sentiment_score && (
          <Badge
            variant="outline"
            className={
              article.sentiment_score > 0.2 ? 'bg-green-100 text-green-800' :
              article.sentiment_score < -0.2 ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }
          >
            Sentiment: {article.sentiment_score > 0.2 ? 'Positive' : article.sentiment_score < -0.2 ? 'Negative' : 'Neutral'}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
