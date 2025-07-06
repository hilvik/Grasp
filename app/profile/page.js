'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, MapPin, BookOpen, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const INTERESTS = [
  'Technology', 'Business', 'Health', 'Science', 
  'Politics', 'Sports', 'Entertainment', 'Travel',
  'Education', 'Environment', 'Finance', 'Food'
]

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isNewProfile, setIsNewProfile] = useState(false)
  
  const [displayName, setDisplayName] = useState('')
  const [locationCountry, setLocationCountry] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [readingLevel, setReadingLevel] = useState('standard')
  const [selectedInterests, setSelectedInterests] = useState([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, authLoading, router])

  const loadProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist - show setup form
        setIsNewProfile(true)
        setDisplayName(user.email?.split('@')[0] || '')
      } else if (error) {
        throw error
      } else if (profile) {
        // Profile exists - load data
        setProfile(profile)
        setDisplayName(profile.display_name || '')
        setLocationCountry(profile.location_country || '')
        setLocationCity(profile.location_city || '')
        setReadingLevel(profile.reading_level || 'standard')
        setSelectedInterests(profile.interests || [])
      }
    } catch (error) {
      toast.error('Failed to load profile')
      console.error('Profile load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Please enter a display name')
      return
    }

    setSaving(true)
    
    try {
      const profileData = {
        user_id: user.id,
        display_name: displayName,
        location_country: locationCountry,
        location_city: locationCity,
        reading_level: readingLevel,
        interests: selectedInterests,
      }

      if (isNewProfile) {
        // Create new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select()
          .single()
        
        if (error) throw error
        setProfile(data)
        setIsNewProfile(false)
        toast.success('Profile created successfully!')
      } else {
        // Update existing profile
        const { data, error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
          .single()
        
        if (error) throw error
        setProfile(data)
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      toast.error('Failed to save profile')
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">
        {isNewProfile ? 'Complete Your Profile' : 'Your Profile'}
      </h1>
      
      {isNewProfile && (
        <div className="mb-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm">
            Welcome to Grasp! Let's set up your profile to personalize your news experience.
          </p>
        </div>
      )}
      
      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              This helps us personalize your news experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={locationCountry}
                  onChange={(e) => setLocationCountry(e.target.value)}
                  placeholder="e.g., United States"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  placeholder="e.g., New York"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Reading Preferences</CardTitle>
            <CardDescription>
              Choose how you'd like news to be presented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="readingLevel">Reading Level</Label>
              <Select value={readingLevel} onValueChange={setReadingLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Simple (ELI5)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="standard">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Standard</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Advanced</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Your Interests</CardTitle>
            <CardDescription>
              Select topics you're interested in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleInterest(interest)}
                >
                  {selectedInterests.includes(interest) && <Heart className="h-3 w-3 mr-1" />}
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full md:w-auto md:self-start"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isNewProfile ? 'Create Profile' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}