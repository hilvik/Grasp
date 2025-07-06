import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    router.push('/profile')
    return data
  }

  const signUp = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          display_name: displayName,
        })
      
      if (profileError) throw profileError
    }
    
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/')
  }

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in')
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  const getProfile = async () => {
    if (!user) return null
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    getProfile,
  }
}