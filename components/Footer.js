import Link from 'next/link'
import { Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">Grasp</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Global news, finally understood. Making complex news simple and personal.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/news" className="text-muted-foreground hover:text-primary">Latest News</Link></li>
              <li><Link href="/map" className="text-muted-foreground hover:text-primary">World Map</Link></li>
              <li><Link href="/trending" className="text-muted-foreground hover:text-primary">Trending</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/news?category=technology" className="text-muted-foreground hover:text-primary">Technology</Link></li>
              <li><Link href="/news?category=business" className="text-muted-foreground hover:text-primary">Business</Link></li>
              <li><Link href="/news?category=health" className="text-muted-foreground hover:text-primary">Health</Link></li>
              <li><Link href="/news?category=science" className="text-muted-foreground hover:text-primary">Science</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3">About</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Grasp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}