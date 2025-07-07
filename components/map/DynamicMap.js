'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the map component to avoid SSR issues with Leaflet
const NewsMap = dynamic(
  () => import('./NewsMap'),
  {
    loading: () => (
      <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </div>
    ),
    ssr: false
  }
);

export default function DynamicMap({ articles }) {
  return <NewsMap articles={articles} />;
}