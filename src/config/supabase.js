import { createClient } from '@supabase/supabase-js'

// Supabase credentials
const SUPABASE_URL = 'https://fgzlekquexmtnzrhjswd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnemxla3F1ZXhtdG56cmhqc3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NDgxNTQsImV4cCI6MjA4MjUyNDE1NH0.hEDqZzidfJJTE5n0KF2Jd1XNMSbDyZcut4MP-PCi1NY'

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// HindTrade API Wrapper
export const htAPI = {
    supabase,

    // ============ AUTHENTICATION METHODS ============

    async getCurrentSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) throw error
            console.log('📋 Session check:', session ? 'Active' : 'None')
            return session
        } catch (error) {
            console.error('❌ getCurrentSession error:', error)
            return null
        }
    },

    async signIn(email, password) {
        try {
            console.log('🔐 Attempting sign in:', email)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            console.log('✅ Sign in successful:', data.user.email)
            return { success: true, user: data.user, session: data.session }
        } catch (error) {
            console.error('❌ signIn error:', error)
            return { success: false, error: error.message }
        }
    },

    async signUp(email, password, metadata = {}) {
        try {
            console.log('📝 Attempting sign up:', email)
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            })

            if (error) throw error

            console.log('✅ Sign up successful:', data.user.email)

            // Create user profile if sign up successful
            if (data.user) {
                const profileResult = await this.createUserProfile(data.user.id, {
                    email: email,
                    full_name: metadata.full_name || '',
                    company_name: metadata.company_name || '',
                    location: metadata.location || '',
                    initials: this.generateInitials(metadata.full_name || metadata.company_name || email)
                })

                if (!profileResult.success) {
                    console.warn('⚠️ Profile creation failed but user created')
                }
            }

            return { success: true, user: data.user, session: data.session }
        } catch (error) {
            console.error('❌ signUp error:', error)
            return { success: false, error: error.message }
        }
    },

    async signOut() {
        try {
            console.log('👋 Signing out...')
            const { error } = await supabase.auth.signOut()
            if (error) throw error

            console.log('✅ Sign out successful')
            return { success: true }
        } catch (error) {
            console.error('❌ signOut error:', error)
            return { success: false, error: error.message }
        }
    },

    async resetPassword(email) {
        try {
            console.log('🔑 Requesting password reset for:', email)
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/`
            })

            if (error) throw error

            console.log('✅ Password reset email sent')
            return { success: true }
        } catch (error) {
            console.error('❌ resetPassword error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============ PROFILE METHODS ============

    async getUserProfile(userId) {
        try {
            console.log('👤 Fetching profile for user:', userId)

            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (error) throw error

            if (!data) {
                console.warn('⚠️ No profile found for user:', userId)
                return { success: false, error: 'Profile not found' }
            }

            // Map full_name to name and provide fallbacks
            const profile = {
                ...data,
                name: data.full_name || data.company_name || 'User',
                initials: data.initials || this.generateInitials(data.full_name || data.company_name || data.email || 'HT'),
                credits: data.credits || 0,
                trust_score: data.trust_score || 0,
                location: data.location || data.city || 'Location not set',
                company_name: data.company_name || 'Company',
                net_worth: data.net_worth || 0,
                shipments_completed: data.shipments_completed || 0
            }

            console.log('✅ Profile loaded:', profile.name)
            return { success: true, profile }
        } catch (error) {
            console.error('❌ getUserProfile error:', error)
            return { success: false, error: error.message }
        }
    },

    async createUserProfile(userId, profileData) {
        try {
            console.log('➕ Creating profile for user:', userId)

            const { data, error } = await supabase
                .from('user_profiles')
                .insert([{
                    user_id: userId,
                    email: profileData.email,
                    full_name: profileData.full_name || '',
                    company_name: profileData.company_name || '',
                    location: profileData.location || '',
                    initials: profileData.initials || this.generateInitials(profileData.full_name || 'HT'),
                    credits: 100,
                    trust_score: 50,
                    status: 'active',
                    role: 'trader'
                }])
                .select()
                .single()

            if (error) throw error

            console.log('✅ Profile created')
            return { success: true, profile: data }
        } catch (error) {
            console.error('❌ createUserProfile error:', error)
            return { success: false, error: error.message }
        }
    },

    async updateUserProfile(userId, updates) {
        try {
            console.log('🔄 Updating profile for user:', userId)

            const { data, error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single()

            if (error) throw error

            console.log('✅ Profile updated')
            return { success: true, profile: data }
        } catch (error) {
            console.error('❌ updateUserProfile error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============ DATA METHODS ============

    async getOpportunities(filters = {}) {
        try {
            console.log('🌐 Fetching opportunities...')

            let query = supabase
                .from('trade_opportunities')
                .select('*')
                .order('created_at', { ascending: false })

            if (filters.status) {
                query = query.eq('status', filters.status)
            }

            if (filters.limit) {
                query = query.limit(filters.limit)
            }

            const { data, error } = await query

            if (error) throw error

            console.log(`✅ Loaded ${data?.length || 0} opportunities`)
            return { success: true, opportunities: data || [] }
        } catch (error) {
            console.error('❌ getOpportunities error:', error)
            return { success: false, error: error.message, opportunities: [] }
        }
    },

    async getInventory(userId) {
        try {
            console.log('📦 Fetching inventory for user:', userId)

            const { data, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error

            console.log(`✅ Loaded ${data?.length || 0} inventory items`)
            return { success: true, inventory: data || [] }
        } catch (error) {
            console.error('❌ getInventory error:', error)
            return { success: false, error: error.message, inventory: [] }
        }
    },

    async getAgents(filters = {}) {
        try {
            console.log('🤖 Fetching agents...')

            let query = supabase
                .from('agents')
                .select('*')
                .order('created_at', { ascending: false })

            if (filters.status) {
                query = query.eq('status', filters.status)
            }

            const { data, error } = await query

            if (error) throw error

            console.log(`✅ Loaded ${data?.length || 0} agents`)
            return { success: true, agents: data || [] }
        } catch (error) {
            console.error('❌ getAgents error:', error)
            return { success: false, error: error.message, agents: [] }
        }
    },

    async getExperts(category = null) {
        try {
            console.log('👨‍💼 Fetching experts...', category ? `(${category})` : '')

            let query = supabase
                .from('experts')
                .select('*')
                .order('created_at', { ascending: false })

            if (category) {
                query = query.eq('category', category)
            }

            const { data, error } = await query

            if (error) throw error

            console.log(`✅ Loaded ${data?.length || 0} experts`)
            return { success: true, experts: data || [] }
        } catch (error) {
            console.error('❌ getExperts error:', error)
            return { success: false, error: error.message, experts: [] }
        }
    },

    // ============ REAL-TIME LISTENERS ============

    setupProfileListener(userId, callback) {
        try {
            console.log('📡 Setting up profile listener for:', userId)

            const channel = supabase
                .channel(`profile_${userId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'user_profiles',
                    filter: `user_id=eq.${userId}`
                }, (payload) => {
                    console.log('📡 Profile update received:', payload)
                    if (callback) callback(payload)
                })
                .subscribe()

            console.log('✅ Profile listener active')
            return channel
        } catch (error) {
            console.error('❌ setupProfileListener error:', error)
            return null
        }
    },

    setupOpportunitiesListener(callback) {
        try {
            console.log('📡 Setting up opportunities listener')

            const channel = supabase
                .channel('opportunities')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'trade_opportunities'
                }, (payload) => {
                    console.log('📡 Opportunity update received:', payload)
                    if (callback) callback(payload)
                })
                .subscribe()

            console.log('✅ Opportunities listener active')
            return channel
        } catch (error) {
            console.error('❌ setupOpportunitiesListener error:', error)
            return null
        }
    },

    // ============ UTILITY METHODS ============

    generateInitials(text) {
        if (!text || text.trim() === '') return 'HT'

        const cleaned = text.trim()
        const words = cleaned.split(/\s+/)

        if (words.length === 1) {
            const word = words[0]
            if (word.length === 0) return 'HT'
            if (word.length === 1) return word.toUpperCase() + 'T'
            return word.substring(0, 2).toUpperCase()
        }

        return (words[0][0] + words[1][0]).toUpperCase()
    }
}

console.log('✅ HindTrade API (htAPI) initialized and ready')
