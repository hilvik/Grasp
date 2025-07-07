'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Map, MapPin } from 'lucide-react';

export default function MapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">News World Map</h1>
        <p className="text-muted-foreground">
          Explore news from around the globe on our interactive map
        </p>
      </div>

      <Card className="min-h-[600px] flex items-center justify-center">
        <CardContent className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Globe className="h-24 w-24 text-muted-foreground animate-spin-slow" />
              <MapPin className="h-8 w-8 text-primary absolute top-4 right-0" />
              <MapPin className="h-6 w-6 text-secondary absolute bottom-4 left-0" />
              <MapPin className="h-7 w-7 text-destructive absolute top-8 left-2" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Interactive Map Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're building an amazing interactive map that will show you news from around the world. 
            You'll be able to click on any country to see the latest news from that region.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <Map className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Click & Explore</h3>
              <p className="text-sm text-muted-foreground">Click any country to see local news</p>
            </div>
            <div className="text-center">
              <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-red-500 rounded-full mx-auto mb-2" />
              <h3 className="font-semibold">Sentiment Heatmap</h3>
              <p className="text-sm text-muted-foreground">See global news sentiment at a glance</p>
            </div>
            <div className="text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">News markers update as stories break</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}