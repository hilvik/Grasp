'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Globe, Brain, Map, User, TrendingUp, Clock, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchArticles } from '@/utils/newsProcessor'
import NewsCard from '@/components/news/NewsCard'
import { Skeleton } from '@/components/ui/skeleton'

const CATEGORIES = [
  { name: 'Technology', value: 'technology', icon: '💻' },
  { name: 'Business', value: 'business', icon: '💼' },
  { name: 'Health', value: 'health', icon: '🏥' },
  { name: 'Science', value: 'science', icon: '🔬' },
  { name: 'Sports', value: 'sports', icon: '⚽' },
  { name: 'Entertainment', value: 'entertainment', icon: '🎬' },
];

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const [latestNews, setLatestNews] = useState([])
  const [featuredNews, setFeaturedNews] = useState([])
  const [categoryNews, setCategoryNews] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHomePageData = async () => {
    try {
      setLoading(true)
      
      // Fetch latest news
      const { data: latest } = await fetchArticles({ limit: 6 })
      setLatestNews(latest)
      
      // Set first 3 as featured
      setFeaturedNews(latest.slice(0, 3))
      
      // Fetch news for each category
      const categoryPromises = CATEGORIES.slice(0, 3).map(async (category) => {
        const { data } = await fetchArticles({ 
          category: category.value, 
          limit: 3 
        })
        return { category: category.value, articles: data }
      })
      
      const categoryResults = await Promise.all(categoryPromises)
      const categoryMap = {}
      categoryResults.forEach(result => {
        categoryMap[result.category] = result.articles
      })
      setCategoryNews(categoryMap)
    } catch (error) {
      console.error('Error fetching homepage data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHomePageData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchHomePageData()
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Global News, Finally Understood
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Grasp makes complex news simple and shows you how global events affect your life personally.
        </p>
        
        <div className="flex gap-4 justify-center">
          {user ? (
            <>
              <Button asChild size="lg">
                <Link href="/news">
                  Browse News
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/map">
                  <Map className="mr-2 h-5 w-5" />
                  World Map
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/auth/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">
                  Login
                </Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Latest News Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Latest News</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Featured News Carousel */}
            {featuredNews.length > 0 && (
              <div className="mb-12">
                <Card className="overflow-hidden">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0">
                    {featuredNews.map((article) => (
                      <Link 
                        key={article.id} 
                        href={`/news/${article.id}`}
                        className="group relative overflow-hidden"
                      >
                        <div className="aspect-video relative">
                          {article.image_url ? (
                            <img 
                              src={article.image_url} 
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Globe className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className="absolute bottom-0 p-4 text-white">
                            <Badge className="mb-2 bg-primary/80">Featured</Badge>
                            <h3 className="font-semibold line-clamp-2 group-hover:underline">
                              {article.title}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Latest News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {latestNews.slice(3).map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Category Sections */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Explore by Category</h2>
        
        <div className="space-y-12">
          {CATEGORIES.slice(0, 3).map((category) => (
            <div key={category.value}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-2xl font-semibold">{category.name}</h3>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/news?category=${category.value}`}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[250px] w-full" />
                  ))}
                </div>
              ) : categoryNews[category.value]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {categoryNews[category.value].map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>No articles available in this category yet.</p>
                </Card>
              )}
            </div>
          ))}
        </div>

        {/* View All Categories */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/news">
              Explore All News
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Grasp?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-center">Interactive Map</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                See news happening around the world on our interactive global map
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-center">AI Simplification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Complex articles explained in simple terms that anyone can understand
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-center">Personal Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                See how global events affect you personally based on your location and interests
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}