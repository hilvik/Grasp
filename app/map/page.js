'use client';

import { useEffect, useState } from 'react';
import DynamicMap from '@/components/map/DynamicMap';
import { fetchArticles } from '@/utils/newsProcessor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, RefreshCw, MapPin, TrendingUp, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import './leaflet.css';

export default function MapPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    categories: {}
  });

  const fetchMapData = async () => {
    try {
      setLoading(true);
      // Fetch more articles for the map
      const { data } = await fetchArticles({ limit: 100 });
      setArticles(data);
      
      // Calculate statistics
      const countries = new Set(data.map(a => a.country_code).filter(Boolean));
      const categories = data.reduce((acc, article) => {
        if (article.category) {
          acc[article.category] = (acc[article.category] || 0) + 1;
        }
        return acc;
      }, {});
      
      setStats({
        total: data.length,
        countries: countries.size,
        categories
      });
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMapData();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Globe className="h-10 w-10 text-primary" />
              News World Map
            </h1>
            <p className="text-muted-foreground">
              Explore news from around the globe on our interactive map
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Total Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Mapped worldwide</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.countries}</div>
              <p className="text-sm text-muted-foreground">With news coverage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(stats.categories)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize">
                        {category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map */}
      {loading ? (
        <Card className="min-h-[600px] flex items-center justify-center">
          <CardContent className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Globe className="h-24 w-24 text-muted-foreground animate-spin-slow" />
                <MapPin className="h-8 w-8 text-primary absolute top-4 right-0" />
              </div>
            </div>
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </CardContent>
        </Card>
      ) : articles.length === 0 ? (
        <Card className="min-h-[600px] flex items-center justify-center">
          <CardContent className="text-center">
            <Globe className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Articles Found</h2>
            <p className="text-muted-foreground mb-4">
              There are no articles to display on the map.
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <DynamicMap articles={articles} />
        </Card>
      )}

      {/* Instructions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Click & Explore</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click on any marker to see news from that location. Markers are color-coded by sentiment.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zoom & Navigate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use mouse wheel to zoom, drag to pan. Click the home button to reset to world view.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the dropdown to filter news by category. Switch between map styles using the layers control.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}