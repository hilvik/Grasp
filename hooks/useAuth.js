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

  const signIn = async (email, password, rememberMe = false) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // If remember me is checked, session persists for 30 days
        // Otherwise, session ends when browser closes
        persistSession: rememberMe
      }
    })
    
    if (error) throw error
    
    // Check if profile exists, create if not
    if (data.user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single()
      
      if (!profile) {
        await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            display_name: email.split('@')[0],
          })
      }
    }
    
    router.push('/profile')
    return data
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error

    // Create user profile after signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          display_name: email.split('@')[0],
        })
      
      if (profileError && profileError.code !== '23505') {
        console.error('Profile creation error:', profileError)
      }
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
    
    let { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    // If profile doesn't exist, create it
    if (error && error.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'User',
        })
        .select()
        .single()
      
      if (createError) throw createError
      return newProfile
    }
    
    if (error) throw error
    return profile
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