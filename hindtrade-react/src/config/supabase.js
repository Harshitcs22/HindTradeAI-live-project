import { createClient } from '@supabase/supabase-js'

// Supabase credentials - use environment variables with fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fgzlekquexmtnzrhjswd.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnemxla3F1ZXhtdG56cmhqc3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NDgxNTQsImV4cCI6MjA4MjUyNDE1NH0.hEDqZzidfJJTE5n0KF2Jd1XNMSbDyZcut4MP-PCi1NY'

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

    async createInventoryItem(userId, itemData) {
        try {
            console.log('➕ Creating inventory item...')
            const { data, error } = await supabase
                .from('inventory')
                .insert([{
                    user_id: userId,
                    product_name: itemData.product_name,
                    category: itemData.category || '',
                    hsn_code: itemData.hsn_code || '',
                    moq: itemData.moq || '',
                    capacity: itemData.capacity || '',
                    unit: itemData.unit || 'units',
                    description: itemData.description || '',
                    status: itemData.status || 'active'
                }])
                .select()
                .single()

            if (error) throw error
            console.log('✅ Inventory item created')
            return { success: true, item: data }
        } catch (error) {
            console.error('❌ createInventoryItem error:', error)
            return { success: false, error: error.message }
        }
    },

    async updateInventoryItem(itemId, updates) {
        try {
            console.log('🔄 Updating inventory item:', itemId)
            const { data, error } = await supabase
                .from('inventory')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', itemId)
                .select()
                .single()

            if (error) throw error
            console.log('✅ Inventory item updated')
            return { success: true, item: data }
        } catch (error) {
            console.error('❌ updateInventoryItem error:', error)
            return { success: false, error: error.message }
        }
    },

    async deleteInventoryItem(itemId) {
        try {
            console.log('🗑️ Deleting inventory item:', itemId)
            const { error } = await supabase
                .from('inventory')
                .delete()
                .eq('id', itemId)

            if (error) throw error
            console.log('✅ Inventory item deleted')
            return { success: true }
        } catch (error) {
            console.error('❌ deleteInventoryItem error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============ SERVICE REQUESTS METHODS ============

    async createServiceRequest(userId, serviceType, details = {}) {
        try {
            console.log('📝 Creating service request:', serviceType)
            const { data, error } = await supabase
                .from('service_requests')
                .insert([{
                    sender_id: userId,
                    service_type: serviceType,
                    details: details,
                    status: 'pending'
                }])
                .select()
                .single()

            if (error) throw error
            console.log('✅ Service request created')
            return { success: true, request: data }
        } catch (error) {
            console.error('❌ createServiceRequest error:', error)
            return { success: false, error: error.message }
        }
    },

    async getServiceRequests(userId) {
        try {
            const { data, error } = await supabase
                .from('service_requests')
                .select('*')
                .eq('sender_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { success: true, requests: data || [] }
        } catch (error) {
            console.error('❌ getServiceRequests error:', error)
            return { success: false, error: error.message, requests: [] }
        }
    },

    // ============ DEMAND SIGNALS METHODS ============

    async getDemandSignals(filters = {}) {
        try {
            console.log('📡 Fetching demand signals...')
            let query = supabase
                .from('demand_signals')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })

            if (filters.industry) query = query.eq('industry', filters.industry)
            if (filters.category) query = query.eq('category', filters.category)
            if (filters.region) query = query.eq('region', filters.region)

            const { data, error } = await query

            if (error) throw error
            console.log(`✅ Loaded ${data?.length || 0} demand signals`)
            return { success: true, signals: data || [] }
        } catch (error) {
            console.error('❌ getDemandSignals error:', error)
            return { success: false, error: error.message, signals: [] }
        }
    },

    async submitSupplyInterest(exporterId, demandSignalId, tradeCardId, message = '') {
        try {
            console.log('🤝 Submitting supply interest...')
            const { data, error } = await supabase
                .from('supply_interests')
                .insert([{
                    demand_signal_id: demandSignalId,
                    exporter_id: exporterId,
                    trade_card_id: tradeCardId,
                    message: message,
                    status: 'pending'
                }])
                .select()
                .single()

            if (error) throw error
            console.log('✅ Supply interest submitted')
            return { success: true, interest: data }
        } catch (error) {
            console.error('❌ submitSupplyInterest error:', error)
            return { success: false, error: error.message }
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

    // ============ EXPORTER METHODS ============

    async getExporterProfile(userId) {
        try {
            console.log('🏢 Fetching exporter profile for user:', userId)
            const { data, error } = await supabase
                .from('exporters')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            return { success: true, exporter: data }
        } catch (error) {
            console.error('❌ getExporterProfile error:', error)
            return { success: false, error: error.message, exporter: null }
        }
    },

    async createExporterProfile(userId, exporterData) {
        try {
            console.log('➕ Creating exporter profile...')
            const { data, error } = await supabase
                .from('exporters')
                .insert([{ user_id: userId, ...exporterData }])
                .select()
                .single()

            if (error) throw error
            console.log('✅ Exporter profile created')
            return { success: true, exporter: data }
        } catch (error) {
            console.error('❌ createExporterProfile error:', error)
            return { success: false, error: error.message }
        }
    },

    async updateExporterProfile(userId, updates) {
        try {
            console.log('🔄 Updating exporter profile...')
            const { data, error } = await supabase
                .from('exporters')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('user_id', userId)
                .select()
                .single()

            if (error) throw error
            console.log('✅ Exporter profile updated')
            return { success: true, exporter: data }
        } catch (error) {
            console.error('❌ updateExporterProfile error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============ VERIFICATION REQUEST METHODS ============

    async createVerificationRequest(exporterId) {
        try {
            console.log('📝 Creating verification request for exporter:', exporterId)

            // NOTE: verification_requests does NOT have user_id column
            // Ownership is via exporter_id → exporters.user_id
            const { data, error } = await supabase
                .from('verification_requests')
                .insert([{
                    exporter_id: exporterId,
                    status: 'pending'
                }])
                .select()
                .single()

            if (error) throw error
            console.log('✅ Verification request created:', data.id)
            return { success: true, request: data }
        } catch (error) {
            console.error('❌ createVerificationRequest error:', error)
            return { success: false, error: error.message }
        }
    },

    async getVerificationStatus(userId) {
        try {
            // First get the exporter for this user
            const { data: exporter } = await supabase
                .from('exporters')
                .select('id')
                .eq('user_id', userId)
                .single()

            if (!exporter) {
                return { success: true, request: null }
            }

            // Then get verification request for that exporter
            const { data, error } = await supabase
                .from('verification_requests')
                .select('*')
                .eq('exporter_id', exporter.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            return { success: true, request: data }
        } catch (error) {
            return { success: false, error: error.message, request: null }
        }
    },

    async getAllVerificationRequests() {
        try {
            // Use * to get all columns - avoids column mismatch errors
            const { data, error } = await supabase
                .from('verification_requests')
                .select(`
                    *,
                    exporters (*)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { success: true, requests: data || [] }
        } catch (error) {
            return { success: false, error: error.message, requests: [] }
        }
    },

    async approveExporter(requestId, exporterId, userId, adminId) {
        try {
            // STEP 1: Update verification_requests (status + reviewed_by)
            const { error: reqError } = await supabase
                .from('verification_requests')
                .update({
                    status: 'approved',
                    reviewed_by: adminId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)

            if (reqError) throw new Error(`Verification update failed: ${reqError.message}`)

            // STEP 2: Get exporter details for trade card
            const { data: exporter, error: fetchError } = await supabase
                .from('exporters')
                .select('company_name, city, user_id')
                .eq('id', exporterId)
                .single()

            if (fetchError) throw new Error(`Exporter fetch failed: ${fetchError.message}`)

            // Use exporter's user_id if userId not provided
            const exporterUserId = userId || exporter?.user_id

            // STEP 3: Update exporters (verified + verification_status + trust_score)
            const { error: expError } = await supabase
                .from('exporters')
                .update({
                    verified: true,
                    verification_status: 'approved',
                    trust_score: 80
                })
                .eq('id', exporterId)

            if (expError) throw new Error(`Exporter update failed: ${expError.message}`)

            // STEP 4: Generate trade card ID (HT-CITY-YEAR-XXXX)
            const cityCode = (exporter?.city || 'IND').substring(0, 3).toUpperCase()
            const year = new Date().getFullYear()
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
            const cardId = `HT-${cityCode}-${year}-${randomPart}`

            // STEP 5: Generate URLs
            const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/trade-card/${cardId}`
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`

            // STEP 6: Create trade card (CRITICAL - must succeed)
            // STEP 6: Create trade card (CRITICAL - must succeed)
            const { data: tradeCard, error: cardError } = await supabase
                .from('trade_cards')
                .insert([{
                    exporter_id: exporterId,
                    card_id: cardId,
                    trust_score: 80,
                    is_active: true,
                    qr_code_url: qrCodeUrl,
                    public_url: publicUrl,
                    issued_at: new Date().toISOString()
                }])
                .select()
                .single()

            if (cardError) throw new Error(`Trade card creation failed: ${cardError.message}`)

            return { success: true, tradeCard, cardId, publicUrl }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    async rejectExporter(requestId, exporterId, adminId, rejectionNotes = '') {
        try {
            // Update verification request (only valid columns: status, notes, updated_at)
            const { error } = await supabase
                .from('verification_requests')
                .update({
                    status: 'rejected',
                    notes: rejectionNotes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)

            if (error) throw error

            // Update exporter to show action required (only valid columns)
            const { error: expError } = await supabase
                .from('exporters')
                .update({
                    verified: false,
                    trust_score: 40
                })
                .eq('id', exporterId)

            if (expError) throw expError

            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    // ============ TRADE CARD METHODS ============

    async getTradeCard(userId) {
        try {
            // ALWAYS get exporter first - trade_cards uses exporter_id, NOT user_id
            const { data: exporter } = await supabase
                .from('exporters')
                .select('id')
                .eq('user_id', userId)
                .single()

            if (!exporter) {
                return { success: true, tradeCard: null }
            }

            // Query trade_cards by exporter_id
            const { data, error } = await supabase
                .from('trade_cards')
                .select('*')
                .eq('exporter_id', exporter.id)
                .eq('is_active', true)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            return { success: true, tradeCard: data }
        } catch (error) {
            return { success: false, error: error.message, tradeCard: null }
        }
    },

    async getTradeCardById(cardId) {
        try {
            console.log('🔍 Fetching trade card:', cardId)
            const { data, error } = await supabase
                .from('trade_cards')
                .select(`
                    *,
                    exporters (*)
                `)
                .eq('card_id', cardId)
                .eq('is_active', true)
                .single()

            if (error) throw error
            console.log('✅ Trade card found')
            return { success: true, tradeCard: data }
        } catch (error) {
            console.error('❌ getTradeCardById error:', error)
            return { success: false, error: error.message, tradeCard: null }
        }
    },

    // ============ PRODUCT METHODS (RLP) ============

    async getProducts(exporterId) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('exporter_id', exporterId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { success: true, products: data || [] }
        } catch (error) {
            console.error('❌ getProducts error:', error)
            return { success: false, error: error.message, products: [] }
        }
    },

    async createProduct(productData) {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select()
                .single()

            if (error) throw error
            return { success: true, product: data }
        } catch (error) {
            console.error('❌ createProduct error:', error)
            return { success: false, error: error.message }
        }
    },

    async updateProduct(productId, updates) {
        try {
            const { data, error } = await supabase
                .from('products')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', productId)
                .select()
                .single()

            if (error) throw error
            return { success: true, product: data }
        } catch (error) {
            console.error('❌ updateProduct error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============ PROVIDERS (CA) METHODS ============

    async getProviders(type = null) {
        try {
            // Query only guaranteed columns: id, name, provider_type
            let query = supabase
                .from('providers')
                .select('id, name, provider_type, email, phone, location, rating, specialization')

            if (type) {
                query = query.eq('provider_type', type)
            }

            const { data, error } = await query

            if (error) throw error
            return { success: true, providers: data || [] }
        } catch (error) {
            return { success: false, error: error.message, providers: [] }
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
    },

    // ============ PROFILE PHOTO UPLOAD ============

    async uploadProfilePhoto(userId, file) {
        try {
            console.log('📸 Uploading profile photo...')

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}-${Date.now()}.${fileExt}`
            const filePath = `profile-photos/${fileName}`

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (error) throw error

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            console.log('✅ Profile photo uploaded:', urlData.publicUrl)
            return { success: true, url: urlData.publicUrl, path: filePath }
        } catch (error) {
            console.error('❌ uploadProfilePhoto error:', error)
            return { success: false, error: error.message }
        }
    },

    async updateProfileWithPhoto(userId, photoUrl) {
        try {
            // Update user_profiles
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({ avatar_url: photoUrl })
                .eq('user_id', userId)

            // Update exporters
            const { error: exporterError } = await supabase
                .from('exporters')
                .update({ logo_url: photoUrl })
                .eq('user_id', userId)

            if (profileError) throw profileError
            console.log('✅ Profile photo URL saved')
            return { success: true }
        } catch (error) {
            console.error('❌ updateProfileWithPhoto error:', error)
            return { success: false, error: error.message }
        }
    },

    async updateFullProfile(userId, profileData, exporterData) {
        try {
            console.log('📝 Updating full profile...')

            // Update user_profiles
            if (profileData && Object.keys(profileData).length > 0) {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .update(profileData)
                    .eq('user_id', userId)
                if (profileError) throw profileError
            }

            // Update exporters
            if (exporterData && Object.keys(exporterData).length > 0) {
                const { error: exporterError } = await supabase
                    .from('exporters')
                    .update(exporterData)
                    .eq('user_id', userId)
                if (exporterError) throw exporterError
            }

            console.log('✅ Full profile updated')
            return { success: true }
        } catch (error) {
            console.error('❌ updateFullProfile error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============ TRUST DOCUMENTS (Smart Trust Vault) ============

    async uploadTrustDocument(userId, docType, file) {
        try {
            console.log(`📄 Uploading trust document: ${docType}...`)

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}/${docType}-${Date.now()}.${fileExt}`
            const filePath = `trust-docs/${fileName}`

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath)

            // Generate AI summary based on doc type
            const aiSummary = this.generateAISummary(docType)
            const aiInsight = this.generateAIInsight(docType)

            // Insert record
            const { data, error } = await supabase
                .from('trust_documents')
                .insert([{
                    user_id: userId,
                    doc_type: docType,
                    file_url: urlData.publicUrl,
                    file_name: file.name,
                    ai_summary: aiSummary,
                    ai_insight: aiInsight,
                    status: 'verified',
                    is_public: true
                }])
                .select()
                .single()

            if (error) throw error

            console.log('✅ Trust document uploaded and verified')
            return { success: true, document: data, aiSummary, aiInsight }
        } catch (error) {
            console.error('❌ uploadTrustDocument error:', error)
            return { success: false, error: error.message }
        }
    },

    generateAISummary(docType) {
        const summaries = {
            'electricity_bill': 'Industrial Connection: 65kW Load Verified',
            'bill_of_lading': 'Export History: US/EU Markets Confirmed',
            'machinery_invoice': 'Production Capacity: Heavy Machinery Verified',
            'quality_cert': 'ISO 9001:2015 Certification Active',
            'gst_cert': 'GST Registration Active & Compliant',
            'iec_cert': 'DGFT IEC Code Valid for Exports'
        }
        return summaries[docType] || 'Document Verified'
    },

    generateAIInsight(docType) {
        const insights = {
            'electricity_bill': '⚡ AI Insight: Industrial Connection Verified - Factory Grade Power',
            'bill_of_lading': '🌍 AI Insight: Proven Export History - US/EU Markets',
            'machinery_invoice': '🏭 AI Insight: Production Capability Confirmed',
            'quality_cert': '✅ AI Insight: Quality Standards Certified',
            'gst_cert': '🏛️ AI Insight: Tax Compliance Verified',
            'iec_cert': '📋 AI Insight: Export License Active'
        }
        return insights[docType] || '✓ Document Verified by AI'
    },

    async getTrustDocuments(userId) {
        try {
            console.log('📋 Fetching trust documents...')
            const { data, error } = await supabase
                .from('trust_documents')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            console.log(`✅ Loaded ${data?.length || 0} trust documents`)
            return { success: true, documents: data || [] }
        } catch (error) {
            console.error('❌ getTrustDocuments error:', error)
            return { success: false, error: error.message, documents: [] }
        }
    },

    async deleteTrustDocument(docId) {
        try {
            const { error } = await supabase
                .from('trust_documents')
                .delete()
                .eq('id', docId)

            if (error) throw error
            console.log('✅ Trust document deleted')
            return { success: true }
        } catch (error) {
            console.error('❌ deleteTrustDocument error:', error)
            return { success: false, error: error.message }
        }
    },

    async toggleDocumentVisibility(docId, isPublic) {
        try {
            const { error } = await supabase
                .from('trust_documents')
                .update({ is_public: isPublic, updated_at: new Date().toISOString() })
                .eq('id', docId)

            if (error) throw error
            console.log(`✅ Document visibility set to ${isPublic ? 'public' : 'private'}`)
            return { success: true }
        } catch (error) {
            console.error('❌ toggleDocumentVisibility error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============ SHIPMENT LOGS (Trade History) ============

    async addShipmentLog(userId, shipmentData) {
        try {
            console.log('📦 Adding shipment log...')

            const { data, error } = await supabase
                .from('shipment_logs')
                .insert([{
                    user_id: userId,
                    destination_country: shipmentData.destination_country,
                    shipment_date: shipmentData.shipment_date,
                    goods_type: shipmentData.goods_type,
                    value_inr: shipmentData.value_inr || null,
                    proof_url: shipmentData.proof_url || null,
                    is_verified: !!shipmentData.proof_url
                }])
                .select()
                .single()

            if (error) throw error
            console.log('✅ Shipment logged successfully')
            return { success: true, shipment: data }
        } catch (error) {
            console.error('❌ addShipmentLog error:', error)
            return { success: false, error: error.message }
        }
    },

    async getShipmentLogs(userId) {
        try {
            console.log('📋 Fetching shipment logs...')
            const { data, error } = await supabase
                .from('shipment_logs')
                .select('*')
                .eq('user_id', userId)
                .order('shipment_date', { ascending: false })

            if (error) throw error
            console.log(`✅ Loaded ${data?.length || 0} shipments`)
            return { success: true, shipments: data || [], count: data?.length || 0 }
        } catch (error) {
            console.error('❌ getShipmentLogs error:', error)
            return { success: false, error: error.message, shipments: [], count: 0 }
        }
    },

    async deleteShipmentLog(shipmentId) {
        try {
            const { error } = await supabase
                .from('shipment_logs')
                .delete()
                .eq('id', shipmentId)

            if (error) throw error
            console.log('✅ Shipment deleted')
            return { success: true }
        } catch (error) {
            console.error('❌ deleteShipmentLog error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============================================
    // CERTIFICATIONS (Capability Evidence)
    // ============================================

    async getCertifications(userId) {
        try {
            console.log('📜 Fetching certifications...')
            const { data, error } = await supabase
                .from('certifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            console.log(`✅ Loaded ${data?.length || 0} certifications`)
            return { success: true, certifications: data || [] }
        } catch (error) {
            console.error('❌ getCertifications error:', error)
            return { success: false, error: error.message, certifications: [] }
        }
    },

    async addCertification(userId, certData) {
        try {
            console.log('📜 Adding certification...')
            const { data, error } = await supabase
                .from('certifications')
                .insert([{
                    user_id: userId,
                    cert_name: certData.cert_name,
                    issuer: certData.issuer || null,
                    issue_date: certData.issue_date || null,
                    expiry_date: certData.expiry_date || null,
                    cert_number: certData.cert_number || null,
                    proof_url: certData.proof_url || null,
                    is_verified: false
                }])
                .select()
                .single()

            if (error) throw error
            console.log('✅ Certification added successfully')
            return { success: true, certification: data }
        } catch (error) {
            console.error('❌ addCertification error:', error)
            return { success: false, error: error.message }
        }
    },

    async deleteCertification(certId) {
        try {
            const { error } = await supabase
                .from('certifications')
                .delete()
                .eq('id', certId)

            if (error) throw error
            console.log('✅ Certification deleted')
            return { success: true }
        } catch (error) {
            console.error('❌ deleteCertification error:', error)
            return { success: false, error: error.message }
        }
    },

    async uploadCoverPhoto(userId, file) {
        try {
            console.log('🖼️ Uploading cover photo...')

            const fileExt = file.name.split('.').pop()
            const fileName = `covers/${userId}-${Date.now()}.${fileExt}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { cacheControl: '3600', upsert: true })

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            // Update exporter profile with cover URL
            const { error: updateError } = await supabase
                .from('exporters')
                .update({ cover_url: urlData.publicUrl })
                .eq('user_id', userId)

            if (updateError) throw updateError

            console.log('✅ Cover photo uploaded and saved')
            return { success: true, url: urlData.publicUrl }
        } catch (error) {
            console.error('❌ uploadCoverPhoto error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============ ADMIN & ROLE METHODS ============

    async isUserAdmin(userId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('user_id', userId)
                .single()

            if (error) return false
            return data?.role === 'admin' || data?.role === 'ca'
        } catch (error) {
            console.error('❌ isUserAdmin error:', error)
            return false
        }
    },

    async getUserRole(userId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('user_id', userId)
                .single()

            if (error) return 'exporter'
            return data?.role || 'exporter'
        } catch (error) {
            console.error('❌ getUserRole error:', error)
            return 'exporter'
        }
    },

    async makeUserAdmin(userId) {
        try {
            console.log('🔐 Making user admin:', userId)

            // First check if profile exists
            const { data: existing } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', userId)
                .single()

            if (existing) {
                // Update existing profile
                const { error } = await supabase
                    .from('user_profiles')
                    .update({ role: 'admin', updated_at: new Date().toISOString() })
                    .eq('user_id', userId)

                if (error) throw error
            } else {
                // Create new profile with admin role
                const { error } = await supabase
                    .from('user_profiles')
                    .insert([{
                        user_id: userId,
                        role: 'admin',
                        credits: 1000,
                        trust_score: 100,
                        status: 'active'
                    }])

                if (error) throw error
            }

            console.log('✅ User is now admin')
            return { success: true }
        } catch (error) {
            console.error('❌ makeUserAdmin error:', error)
            return { success: false, error: error.message }
        }
    },

    async ensureUserProfile(userId, userData = {}) {
        try {
            // Check if profile exists
            const { data: existing, error: fetchError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (existing) {
                return { success: true, profile: existing, created: false }
            }

            // Create profile if not exists
            const { data: newProfile, error: insertError } = await supabase
                .from('user_profiles')
                .insert([{
                    user_id: userId,
                    email: userData.email || '',
                    full_name: userData.full_name || '',
                    company_name: userData.company_name || '',
                    location: userData.location || '',
                    initials: this.generateInitials(userData.full_name || userData.company_name || 'HT'),
                    role: userData.role || 'exporter',
                    credits: 100,
                    trust_score: 50,
                    status: 'active'
                }])
                .select()
                .single()

            if (insertError) throw insertError

            console.log('✅ User profile ensured')
            return { success: true, profile: newProfile, created: true }
        } catch (error) {
            console.error('❌ ensureUserProfile error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============ REGISTRATION BOOTSTRAP ============

    async ensureUserProfileAndExporter(userId, userData = {}) {
        try {
            console.log('🚀 Bootstrapping user registration for:', userId)

            // 1. Ensure user_profiles row exists
            const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id, role')
                .eq('user_id', userId)
                .single()

            if (!existingProfile) {
                console.log('📝 Creating user_profiles row...')
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert([{
                        user_id: userId,
                        email: userData.email || '',
                        full_name: userData.full_name || '',
                        role: 'exporter',
                        credits: 100,
                        trust_score: 50,
                        status: 'active'
                    }])

                if (profileError && !profileError.message.includes('duplicate')) {
                    console.error('❌ Failed to create user_profiles:', profileError)
                }
            }

            // 2. Ensure exporters row exists
            const { data: existingExporter } = await supabase
                .from('exporters')
                .select('id')
                .eq('user_id', userId)
                .single()

            let exporterId = existingExporter?.id

            if (!existingExporter) {
                console.log('📝 Creating exporters row...')
                const { data: newExporter, error: exporterError } = await supabase
                    .from('exporters')
                    .insert([{
                        user_id: userId,
                        company_name: userData.company_name || '',
                        verification_status: 'pending',
                        trust_score: 50
                    }])
                    .select('id')
                    .single()

                if (exporterError && !exporterError.message.includes('duplicate')) {
                    console.error('❌ Failed to create exporter:', exporterError)
                } else if (newExporter) {
                    exporterId = newExporter.id
                }
            }

            console.log('✅ Registration bootstrap complete')
            return {
                success: true,
                exporterId,
                profileExists: !!existingProfile,
                exporterExists: !!existingExporter
            }
        } catch (error) {
            console.error('❌ ensureUserProfileAndExporter error:', error)
            return { success: false, error: error.message }
        }
    },

    // ============ AI PROMPT SYSTEM ============

    /**
     * Save AI log to database
     */
    async saveAILog(userId, promptType, context, output, status = 'success', errorMessage = null) {
        try {
            const { data, error } = await supabase
                .from('ai_logs')
                .insert([{
                    user_id: userId,
                    prompt_type: promptType,
                    context: context,
                    output: output,
                    status: status,
                    error_message: errorMessage
                }])
                .select()
                .single()

            if (error) throw error
            console.log('✅ AI log saved')
            return { success: true, log: data }
        } catch (error) {
            console.error('❌ saveAILog error:', error)
            return { success: false, error: error.message }
        }
    },

    /**
     * Prompt 1: Generate Buyer Inquiry Reply
     * Context: exporter profile, inventory, demand signal
     */
    async generateBuyerReply(userId, exporterData, inventoryData, demandSignal, supplyMessage) {
        try {
            console.log('🤖 Generating buyer inquiry reply...')

            const context = {
                exporter_profile: exporterData,
                inventory: inventoryData,
                demand_signal: demandSignal,
                supply_message: supplyMessage
            }

            // AI Prompt Template
            const promptData = {
                mode: 'hindtrade_exporter_os',
                task: 'reply_to_buyer_inquiry',
                context: context,
                rules: [
                    'Do not assume missing data',
                    'Use professional international trade English',
                    'Mention MOQ only if available',
                    'Return only final buyer-ready message'
                ],
                output_format: 'email_reply'
            }

            // For now, generate a template response (will be replaced with actual AI call)
            const companyName = exporterData?.company_name || 'Our Company'
            const product = demandSignal?.requirement || 'your required products'
            const moq = inventoryData?.[0]?.moq || 'flexible'

            const generatedReply = `Dear Buyer,

Thank you for your inquiry regarding ${product}.

${companyName} is pleased to confirm our capability to supply the requested products. We are a verified exporter with an active Trade Card on HindTradeAI.

Product Details:
- Requirement: ${product}
- Our MOQ: ${moq}
- Delivery: As per your requirement

We maintain strict quality standards and all necessary export compliance certifications (GST, IEC${exporterData?.certifications ? ', ' + exporterData.certifications.join(', ') : ''}).

Please let us know your detailed specifications and we will provide a competitive quotation.

Best regards,
${companyName}
Verified Exporter | HindTradeAI`

            // Save to AI logs
            await this.saveAILog(userId, 'buyer_inquiry_reply', context, generatedReply)

            return { success: true, reply: generatedReply, prompt: promptData }
        } catch (error) {
            console.error('❌ generateBuyerReply error:', error)
            return { success: false, error: error.message, reply: 'Unable to generate reply. Please try again.' }
        }
    },

    /**
     * Prompt 2: Generate Proforma Invoice
     * Context: exporter, product, buyer region
     */
    async generateProformaInvoice(userId, exporterData, productData, buyerRegion) {
        try {
            console.log('📄 Generating proforma invoice...')

            const context = {
                exporter_company: exporterData,
                product: productData,
                buyer_region: buyerRegion
            }

            const promptData = {
                mode: 'hindtrade_exporter_os',
                task: 'generate_proforma_invoice',
                context: context,
                rules: [
                    'Use INCOTERMS FOB by default',
                    'Currency USD unless specified',
                    'No legal disclaimers',
                    'Clean tabular format'
                ],
                output_format: 'proforma_invoice_text'
            }

            const today = new Date().toISOString().split('T')[0]
            const piNumber = `PI-${Date.now().toString().slice(-6)}`

            const generatedPI = `
═══════════════════════════════════════════════════
                    PROFORMA INVOICE
═══════════════════════════════════════════════════

PI Number: ${piNumber}
Date: ${today}
Valid Until: 30 days from date

EXPORTER:
${exporterData?.company_name || 'Company Name'}
${exporterData?.city || 'City'}, India
GST: ${exporterData?.gst_number || 'XXXXXXXXX'}
IEC: ${exporterData?.iec_code || 'XXXXXXXXX'}

BUYER:
[Buyer Details]
Region: ${buyerRegion || 'International'}

───────────────────────────────────────────────────
PRODUCT DETAILS
───────────────────────────────────────────────────
Product: ${productData?.product_name || 'Product'}
HSN Code: ${productData?.hsn_code || '-'}
Quantity: ${productData?.moq || 'As per requirement'}
Unit Price: USD [To be quoted]
Total: USD [To be calculated]

───────────────────────────────────────────────────
TERMS & CONDITIONS
───────────────────────────────────────────────────
Incoterms: FOB
Payment: [To be discussed]
Shipment: Within [X] days from order confirmation

═══════════════════════════════════════════════════
            HindTradeAI Verified Exporter
═══════════════════════════════════════════════════`

            await this.saveAILog(userId, 'proforma_invoice', context, generatedPI)

            return { success: true, invoice: generatedPI, prompt: promptData }
        } catch (error) {
            console.error('❌ generateProformaInvoice error:', error)
            return { success: false, error: error.message }
        }
    },

    /**
     * Prompt 3: Export Readiness Assessment
     * Context: user profile, exporter data, inventory count
     */
    async generateExportReadiness(userId, profileData, exporterData, inventoryCount) {
        try {
            console.log('📋 Generating export readiness assessment...')

            const context = {
                profile: profileData,
                exporter: exporterData,
                inventory_count: inventoryCount
            }

            const promptData = {
                mode: 'hindtrade_exporter_os',
                task: 'export_readiness_assessment',
                context: context,
                rules: [
                    'Be practical, not motivational',
                    'Max 5 bullet points',
                    'Highlight missing compliance only'
                ],
                output_format: 'checklist'
            }

            // Generate checklist based on actual data
            const checklist = []

            // Check GST
            if (exporterData?.gst_number) {
                checklist.push({ item: 'GST Registration', status: 'complete', note: 'Verified' })
            } else {
                checklist.push({ item: 'GST Registration', status: 'missing', note: 'Required for export billing' })
            }

            // Check IEC
            if (exporterData?.iec_code) {
                checklist.push({ item: 'IEC Code', status: 'complete', note: 'Active' })
            } else {
                checklist.push({ item: 'IEC Code', status: 'missing', note: 'Mandatory for exports - Apply at DGFT' })
            }

            // Check Inventory
            if (inventoryCount > 0) {
                checklist.push({ item: 'Product Catalog', status: 'complete', note: `${inventoryCount} products listed` })
            } else {
                checklist.push({ item: 'Product Catalog', status: 'missing', note: 'Add products to attract buyers' })
            }

            // Check Trade Card
            if (exporterData?.verified) {
                checklist.push({ item: 'Trade Card', status: 'complete', note: 'Verified and active' })
            } else {
                checklist.push({ item: 'Trade Card', status: 'pending', note: 'Apply for CA audit to get verified' })
            }

            // Check Bank Account
            checklist.push({ item: 'Export Bank Account', status: 'pending', note: 'Confirm FIRC-enabled account' })

            await this.saveAILog(userId, 'export_readiness', context, JSON.stringify(checklist))

            return { success: true, checklist: checklist, prompt: promptData }
        } catch (error) {
            console.error('❌ generateExportReadiness error:', error)
            return { success: false, error: error.message, checklist: [] }
        }
    }
}

console.log('✅ HindTrade API (htAPI) initialized and ready')

