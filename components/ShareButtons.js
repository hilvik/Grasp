'use client';

import { Button } from '@/components/ui/button';
import { Twitter, Facebook, Link2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButtons({ articleTitle, articleUrl }) {
  const shareUrl = typeof window !== 'undefined' ? articleUrl : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(articleTitle);
  
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-8">
      <Button asChild size="sm" variant="outline">
        <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4 mr-2" /> Share on Twitter
        </a>
      </Button>
      <Button asChild size="sm" variant="outline">
        <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4 mr-2" /> Share on Facebook
        </a>
      </Button>
      <Button size="sm" variant="outline" onClick={copyToClipboard}>
        <Link2 className="h-4 w-4 mr-2" /> Copy Link
      </Button>
    </div>
  );
}