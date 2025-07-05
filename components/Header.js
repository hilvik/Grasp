import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Globe, Newspaper, User, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Grasp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/news" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
              <Newspaper className="h-4 w-4" />
              <span>News</span>
            </Link>
            <Link href="/map" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
              <Globe className="h-4 w-4" />
              <span>Map</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                <Link href="/news" className="flex items-center space-x-2 text-lg">
                  <Newspaper className="h-5 w-5" />
                  <span>News</span>
                </Link>
                <Link href="/map" className="flex items-center space-x-2 text-lg">
                  <Globe className="h-5 w-5" />
                  <span>Map</span>
                </Link>
                <Link href="/profile" className="flex items-center space-x-2 text-lg">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}