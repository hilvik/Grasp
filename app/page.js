'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Globe, Brain, Map, User } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-[calc(100vh-8rem)]">
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
                <Link href="/profile">
                  <User className="mr-2 h-5 w-5" />
                  Your Profile
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

        {/* Debug info - remove in production */}
        {!loading && (
          <div className="mt-8 p-4 bg-muted rounded-lg max-w-md mx-auto">
            <p className="text-sm">
              Status: {user ? `Logged in as ${user.email}` : 'Not logged in'}
            </p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
            <p className="text-muted-foreground">
              See news happening around the world on our interactive global map
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Simplification</h3>
            <p className="text-muted-foreground">
              Complex articles explained in simple terms that anyone can understand
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personal Impact</h3>
            <p className="text-muted-foreground">
              See how global events affect you personally based on your location and interests
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}