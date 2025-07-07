'use client';

import { Button } from '@/components/ui/button';
import { Twitter, Facebook } from 'lucide-react';

export default function ShareButtons({ articleTitle, articleUrl }) {
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;

  return (
    <div className="flex space-x-2 mt-8">
      <Button asChild size="sm">
        <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4 mr-2" /> Share on Twitter
        </a>
      </Button>
      <Button asChild size="sm" variant="outline">
        <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4 mr-2" /> Share on Facebook
        </a>
      </Button>
    </div>
  );
}
