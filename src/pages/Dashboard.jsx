import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, htAPI } from '../config/supabase'

function Dashboard({ session }) {
    const [currentView, setCurrentView] = useState('dashboard')
    const [userProfile, setUserProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [agentModalOpen, setAgentModalOpen] = useState(false)
    const [agentSubtitle, setAgentSubtitle] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        loadUserProfile()
    }, [session])

    const loadUserProfile = async () => {
        if (!session?.user) {
            navigate('/')
            return
        }

        try {
            const result = await htAPI.getUserProfile(session.user.id)
            if (result.success) {
                setUserProfile(result.profile)
            } else {
                // Create default profile if not found
                setUserProfile({
                    name: session.user.email?.split('@')[0] || 'User',
                    initials: 'HT',
                    location: 'Location not set',
                    credits: 100,
                    trust_score: 50,
                    company_name: 'Company',
                    net_worth: 0,
                    shipments_completed: 0,
                    ca_verified: false
                })
            }
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    const openAgentModal = (subtitle) => {
        setAgentSubtitle(subtitle)
        setAgentModalOpen(true)
        document.body.style.overflow = 'hidden'
    }

    const closeAgentModal = () => {
        setAgentModalOpen(false)
        document.body.style.overflow = ''
    }

    const navigateView = (viewId) => {
        setCurrentView(viewId)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#050810] to-[#0F1428] flex items-center justify-center">
                <div className="text-[#00D9FF] text-xl">Loading Dashboard...</div>
            </div>
        )
    }

    const profile = userProfile || {
        name: 'User',
        initials: 'HT',
        location: 'Location not set',
        credits: 0,
        trust_score: 0,
        company_name: 'Company',
        net_worth: 0,
        shipments_completed: 0,
        ca_verified: false
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#050810] to-[#0F1428] text-gray-200" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Agent Modal */}
            {agentModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-ht-border w-full max-w-6xl h-[85vh] flex flex-col">
                        <div className="border-b border-ht-border px-6 py-4 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-purple-400">
                                    <i className="ri-robot-line text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-gray-800 font-semibold text-lg">EKAYAN</h3>
                                    <p className="text-xs text-gray-600">{agentSubtitle || 'The one who is all'}</p>
                                </div>
                            </div>
                            <button onClick={closeAgentModal} className="text-gray-400 hover:text-gray-800 transition">
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden bg-white">
                            <iframe
                                src="https://app.relevanceai.com/agents/d7b62b/3fdb8425-c0a5-4909-9513-21d07c9f8f99/a3f0bb17-9cbf-4d17-88cc-c1a981deabdd/embed-chat"
                                className="w-full h-full border-0 bg-white"
                                allow="microphone; camera"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-64 bg-[#050810] border-r border-[#1A2847] flex flex-col z-50 overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#00D9FF] to-[#FFB800] rounded flex items-center justify-center text-[#0A0E27] font-bold text-sm">H</div>
                        <span className="text-lg font-bold text-white">HindTrade</span>
                    </div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">AI Enterprise OS</p>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    <button onClick={() => navigateView('dashboard')} className={`nav-item-dash w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg ${currentView === 'dashboard' ? 'active text-[#00D9FF]' : 'text-gray-400 hover:text-[#00D9FF]'}`}>
                        <i className="ri-dashboard-3-line text-base"></i><span>Dashboard</span>
                    </button>
                    <button onClick={() => navigateView('opportunities')} className={`nav-item-dash w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg ${currentView === 'opportunities' ? 'active text-[#00D9FF]' : 'text-gray-400 hover:text-[#00D9FF]'}`}>
                        <i className="ri-global-line text-base"></i><span>Global Trades</span>
                    </button>
                    <button onClick={() => navigateView('inventory')} className={`nav-item-dash w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg ${currentView === 'inventory' ? 'active text-[#00D9FF]' : 'text-gray-400 hover:text-[#00D9FF]'}`}>
                        <i className="ri-store-2-line text-base"></i><span>Inventory</span>
                    </button>
                    <button onClick={() => navigateView('agents')} className={`nav-item-dash w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg ${currentView === 'agents' ? 'active text-[#00D9FF]' : 'text-gray-400 hover:text-[#00D9FF]'}`}>
                        <i className="ri-robot-2-line text-base"></i><span>AI Agents</span>
                    </button>
                    <div className="mt-6 mb-2 px-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Network</div>
                    <button onClick={() => navigateView('experts')} className={`nav-item-dash w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg ${currentView === 'experts' ? 'active text-[#00D9FF]' : 'text-gray-400 hover:text-[#00D9FF]'}`}>
                        <i className="ri-team-line text-base"></i><span>Experts</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-[#1A2847]">
                    <div className="glass glass-hover p-3 rounded-lg flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#FFB800] flex items-center justify-center text-[#0A0E27] font-bold text-xs">
                            {profile.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{profile.company_name || profile.name}</div>
                            <button onClick={handleLogout} className="text-[11px] text-red-400 hover:text-red-300 transition">Log Out</button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 h-screen overflow-y-auto flex flex-col">
                {/* HEADER */}
                <header className="sticky top-0 z-40 bg-[#0A0E27]/80 backdrop-blur-md border-b border-[#1A2847] px-8 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">
                        {currentView === 'dashboard' && 'Dashboard'}
                        {currentView === 'opportunities' && 'Global Opportunities'}
                        {currentView === 'inventory' && 'Inventory'}
                        {currentView === 'agents' && 'AI Agents'}
                        {currentView === 'experts' && 'Experts Network'}
                    </h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full text-sm">
                            <i className="ri-zap-fill text-[#FFB800]"></i>
                            <span className="text-gray-400">Credits:</span>
                            <span className="font-semibold text-[#00D9FF]">{profile.credits?.toLocaleString() || 0}</span>
                        </div>
                        <button className="text-gray-400 hover:text-[#00D9FF] transition relative">
                            <i className="ri-notification-3-line text-lg"></i>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <div className="p-8 flex-1 overflow-y-auto animate-fade-in">
                    {currentView === 'dashboard' && <DashboardView profile={profile} navigateView={navigateView} />}
                    {currentView === 'opportunities' && <OpportunitiesView />}
                    {currentView === 'inventory' && <InventoryView />}
                    {currentView === 'agents' && <AgentsView openAgentModal={openAgentModal} />}
                    {currentView === 'experts' && <ExpertsView />}
                </div>
            </main>
        </div>
    )
}

// Dashboard View Component
function DashboardView({ profile, navigateView }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: PROFILE + TRADE CARD PREVIEW */}
            <div className="lg:col-span-4 space-y-4">
                <div className="glass glass-hover rounded-xl p-5 flex gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#FFB800] flex items-center justify-center text-[#0A0E27] font-bold text-sm">
                        {profile.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                            <h3 className="text-base font-semibold text-white truncate">{profile.name}</h3>
                            <i className="ri-verified-badge-fill text-[#FFB800] text-sm"></i>
                        </div>
                        <div className="text-[11px] text-gray-400">{profile.location}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#0F1428] border border-[#1A2847] text-gray-300">Exporter</span>
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#0F1428] border border-[#1A2847] text-gray-300">Premium</span>
                        </div>
                    </div>
                </div>

                {/* Trade Card Premium Preview */}
                <div className="glass rounded-xl p-4 relative overflow-hidden border-2 border-[#FFB800]/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-[#00D9FF]/10 pointer-events-none"></div>
                    <div className="absolute top-2 right-2 text-[10px] text-[#FFB800] font-semibold">DIGITAL CARD</div>
                    <div className="relative flex flex-col gap-3">
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">HindTrade Verified</div>
                            <div className="text-sm font-bold text-white">{profile.name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="bg-white/5 rounded p-2">
                                <div className="text-gray-400">Net Worth</div>
                                <div className="text-[#FFB800] font-semibold mt-1">
                                    {profile.net_worth ? '₹' + (profile.net_worth / 10000000).toFixed(1) + ' Cr' : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded p-2">
                                <div className="text-gray-400">Shipments</div>
                                <div className="text-[#00D9FF] font-semibold mt-1">{profile.shipments_completed || 0}+</div>
                            </div>
                            <div className="bg-white/5 rounded p-2">
                                <div className="text-gray-400">Trust Score</div>
                                <div className="text-white font-semibold mt-1">{profile.trust_score || 0}/100</div>
                            </div>
                            <div className="bg-white/5 rounded p-2">
                                <div className="text-gray-400">Status</div>
                                <div className="text-[#10B981] font-semibold mt-1">{profile.ca_verified ? '✓ Verified' : 'Pending'}</div>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-[#1A2847] flex items-center justify-between">
                            <button className="btn-dash-primary text-[11px] flex-1 mr-2">View Card</button>
                            <div className="w-12 h-12 rounded bg-white/5 border border-[#1A2847] flex items-center justify-center text-[9px] text-gray-400 font-medium">QR</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MIDDLE COLUMN: STATS + GETTING STARTED */}
            <div className="lg:col-span-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <div className="glass stat-card-dash p-4 rounded-xl">
                        <div className="metric-label">Platform Status</div>
                        <div className="text-base font-semibold text-white mb-1">Premium</div>
                        <div className="text-[11px] text-gray-400">Active member</div>
                    </div>
                    <div className="glass stat-card-dash p-4 rounded-xl">
                        <div className="metric-label">Profile Views</div>
                        <div className="metric-value">1,240</div>
                        <div className="text-[11px] text-gray-400">Last 30 days</div>
                    </div>
                    <div className="glass stat-card-dash p-4 rounded-xl">
                        <div className="metric-label">Negotiations</div>
                        <div className="metric-value">8</div>
                        <div className="text-[11px] text-gray-400">In progress</div>
                    </div>
                </div>

                <div className="glass rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white">Getting Started</h4>
                        <span className="text-[10px] text-[#00D9FF] font-medium">1/3</span>
                    </div>
                    <div className="space-y-3 text-[12px]">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#00D9FF]/20 flex items-center justify-center text-[10px] text-[#00D9FF] border border-[#00D9FF]/40 flex-shrink-0">1</div>
                            <div>
                                <div className="text-white font-medium">Complete Profile</div>
                                <div className="text-gray-400 text-[11px]">Add company details & certifications</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#00D9FF]/5 flex items-center justify-center text-[10px] text-gray-400 border border-[#1A2847] flex-shrink-0">2</div>
                            <div>
                                <div className="text-white font-medium">Get CA Verified</div>
                                <div className="text-gray-400 text-[11px]">Certify your trade card</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#00D9FF]/5 flex items-center justify-center text-[10px] text-gray-400 border border-[#1A2847] flex-shrink-0">3</div>
                            <div>
                                <div className="text-white font-medium">Unlock Leads</div>
                                <div className="text-gray-400 text-[11px]">View buyers & CHA contacts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: QUICK ACTIONS + SUMMARY */}
            <div className="lg:col-span-3 space-y-4">
                <div className="glass rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-white mb-1">Quick Actions</h4>
                    <button className="w-full btn-dash-primary text-[12px] justify-center" onClick={() => navigateView('agents')}>
                        <i className="ri-search-eye-line mr-1"></i> Ask HS Code Agent
                    </button>
                    <button className="w-full btn-dash-secondary text-[12px] justify-center" onClick={() => navigateView('opportunities')}>
                        <i className="ri-global-line mr-1"></i> Browse Trades
                    </button>
                    <button className="w-full btn-dash-secondary text-[12px] justify-center">
                        <i className="ri-user-voice-line mr-1"></i> Contact CA/CHA
                    </button>
                </div>

                <div className="glass rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-white mb-1">Account</h4>
                    <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Profile</span>
                            <span className="text-[#00D9FF] font-medium">72%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">KYC Status</span>
                            <span className="text-yellow-300 font-medium">Pending</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">CA Verify</span>
                            <span className="text-gray-300 font-medium">Not started</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Credits</span>
                            <span className="text-[#FFB800] font-semibold">{profile.credits}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Opportunities View Component
function OpportunitiesView() {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-2 bg-[#0F1428] border border-[#1A2847] rounded-lg px-4 py-3 focus-within:border-[#00D9FF] transition">
                    <i className="ri-search-line text-gray-500"></i>
                    <input type="text" placeholder="Search trades: Rice, Textiles, Spices, Machinery..." className="bg-transparent flex-1 text-white outline-none placeholder:text-gray-600" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 rounded-full text-xs font-medium bg-[#00D9FF]/20 border border-[#00D9FF]/50 text-[#00D9FF] hover:bg-[#00D9FF]/30 transition">All Trades</button>
                    <button className="px-4 py-2 rounded-full text-xs font-medium border border-[#1A2847] text-gray-400 hover:border-[#00D9FF] hover:text-[#00D9FF] transition">Agriculture</button>
                    <button className="px-4 py-2 rounded-full text-xs font-medium border border-[#1A2847] text-gray-400 hover:border-[#00D9FF] hover:text-[#00D9FF] transition">Textiles</button>
                    <button className="px-4 py-2 rounded-full text-xs font-medium border border-[#1A2847] text-gray-400 hover:border-[#00D9FF] hover:text-[#00D9FF] transition">Electronics</button>
                    <button className="px-4 py-2 rounded-full text-xs font-medium border border-[#1A2847] text-gray-400 hover:border-[#00D9FF] hover:text-[#00D9FF] transition">More +</button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-global-line text-[#00D9FF]"></i> Global Opportunities
                </h3>
                <div className="space-y-4">
                    <div className="glass glass-hover rounded-xl p-6 border-l-4 border-l-[#FFB800]">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h4 className="text-white font-semibold text-lg">Premium Basmati Rice - Grade A</h4>
                                <p className="text-sm text-gray-400 mt-1">🇦🇪 Dubai • Verified Buyer • Min Order: 1000 MT</p>
                            </div>
                            <span className="text-[#FFB800] font-bold text-lg">$500K+</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">Looking for consistent supply. Bulk orders preferred. Direct payment via LC.</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">RC</div>
                                <div className="text-sm">
                                    <div className="text-white font-medium blur-secret">Royal Catering LLC</div>
                                    <div className="text-gray-500 text-xs blur-secret">Dubai, UAE</div>
                                </div>
                            </div>
                            <button className="btn-dash-primary text-xs">Unlock (1 Credit)</button>
                        </div>
                    </div>

                    <div className="glass glass-hover rounded-xl p-6 border-l-4 border-l-[#00D9FF]">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h4 className="text-white font-semibold text-lg">Cotton Yarn & Fabric Supply</h4>
                                <p className="text-sm text-gray-400 mt-1">🇬🇧 Manchester • Verified Buyer • Min Order: 500 MT</p>
                            </div>
                            <span className="text-[#00D9FF] font-bold text-lg">₹2.5Cr+</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">Looking for Indian cotton yarn suppliers. Quality certified. Long-term partnership.</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">TM</div>
                                <div className="text-sm">
                                    <div className="text-white font-medium blur-secret">Texcraft Manufacturing</div>
                                    <div className="text-gray-500 text-xs blur-secret">Manchester, UK</div>
                                </div>
                            </div>
                            <button className="btn-dash-primary text-xs">Unlock (1 Credit)</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Inventory View Component
function InventoryView() {
    return (
        <div className="space-y-6">
            <button className="w-full glass rounded-xl p-8 border-2 border-dashed border-[#1A2847] hover:border-[#00D9FF] transition flex flex-col items-center justify-center group">
                <div className="w-12 h-12 rounded-full bg-[#00D9FF]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <i className="ri-add-line text-2xl text-[#00D9FF]"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-[#00D9FF] transition">Add New Product</span>
            </button>

            <div className="glass rounded-xl overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-[#00D9FF]/20 to-[#FFB800]/20 relative">
                    <img src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-40" alt="Product" />
                    <div className="absolute top-3 right-3 bg-[#10B981]/20 border border-[#10B981]/50 px-2 py-1 rounded text-xs text-[#10B981] font-medium">Live</div>
                </div>
                <div className="p-6">
                    <h3 className="text-white font-semibold mb-4">Nashik Red Onion</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="metric-label">Price</div>
                            <div className="text-xl font-bold text-[#FFB800]">₹2,400/Qt</div>
                        </div>
                        <div>
                            <div className="metric-label">Available</div>
                            <div className="text-xl font-bold text-white">50 MT</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Agents View Component
function AgentsView({ openAgentModal }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">AI Agents</h2>
                <p className="text-gray-400 text-sm">Intelligent assistants powered by Relevance AI</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass rounded-xl p-6 border border-[#1A2847] hover:border-[#00D9FF] transition cursor-pointer" onClick={() => openAgentModal('HS Code Lookup')}>
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                            <i className="ri-search-line text-2xl"></i>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-1">EKAYAN</h3>
                            <p className="text-xs text-[#00D9FF] font-medium mb-2">The one who is all</p>
                            <p className="text-sm text-gray-400 mb-3">HS Code classification & tariff lookup</p>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-[#10B981]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="mt-4 w-full btn-dash-primary text-sm py-2 rounded-lg">
                        <i className="ri-chat-3-line mr-2"></i>Start Chat
                    </button>
                </div>

                <div className="glass rounded-xl p-6 border border-[#1A2847] hover:border-[#00D9FF] transition cursor-pointer" onClick={() => openAgentModal('Logistics Support')}>
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                            <i className="ri-ship-2-line text-2xl"></i>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-1">EKAYAN</h3>
                            <p className="text-xs text-[#00D9FF] font-medium mb-2">The one who is all</p>
                            <p className="text-sm text-gray-400 mb-3">Port routing & shipping optimization</p>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-[#10B981]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="mt-4 w-full btn-dash-primary text-sm py-2 rounded-lg">
                        <i className="ri-chat-3-line mr-2"></i>Start Chat
                    </button>
                </div>

                <div className="glass rounded-xl p-6 border border-[#1A2847] opacity-60 cursor-not-allowed">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-500/20 flex items-center justify-center text-gray-500 flex-shrink-0">
                            <i className="ri-file-text-line text-2xl"></i>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-400 font-semibold text-lg">Export Docs Copilot</h3>
                                <i className="ri-lock-fill text-gray-500 text-sm"></i>
                            </div>
                            <p className="text-xs text-gray-500 font-medium mb-2">Premium Feature</p>
                            <p className="text-sm text-gray-500 mb-3">Automated document generation & validation</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Coming Soon</span>
                            </div>
                        </div>
                    </div>
                    <button className="mt-4 w-full bg-gray-700/30 text-gray-500 text-sm py-2 rounded-lg cursor-not-allowed" disabled>
                        <i className="ri-lock-fill mr-2"></i>Premium Access
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-xl p-6 border border-[#1A2847]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#00D9FF]/20 flex items-center justify-center text-[#00D9FF]">
                            <i className="ri-question-answer-line text-lg"></i>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">24</p>
                            <p className="text-xs text-gray-400">Queries This Month</p>
                        </div>
                    </div>
                </div>
                <div className="glass rounded-xl p-6 border border-[#1A2847]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                            <i className="ri-time-line text-lg"></i>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">2.3s</p>
                            <p className="text-xs text-gray-400">Avg Response Time</p>
                        </div>
                    </div>
                </div>
                <div className="glass rounded-xl p-6 border border-[#1A2847]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <i className="ri-robot-2-line text-lg"></i>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">100%</p>
                            <p className="text-xs text-gray-400">Uptime</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Experts View Component
function ExpertsView() {
    return (
        <div className="space-y-8">
            {/* CA Section */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-user-search-line text-[#FFB800]"></i> Chartered Accountants (CA)
                </h3>
                <p className="text-sm text-gray-400 mb-4">Verified export-focused CAs to certify your trade card</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { initials: 'RM', name: 'CA Rahul Mehta', firm: 'Mehta & Associates', exp: '10+ years', reg: 'A45782', certified: '₹150 Cr+', tags: ['Export Specialist', 'FMCG', 'Agri'] },
                        { initials: 'PS', name: 'CA Priya Sharma', firm: 'Sharma & Co.', exp: '8+ years', reg: 'B67234', certified: '₹200 Cr+', tags: ['Export Specialist', 'Textiles'] },
                        { initials: 'AK', name: 'CA Amit Khurana', firm: 'Khurana Group', exp: '12+ years', reg: 'C89012', certified: '₹300 Cr+', tags: ['Export Specialist', 'Electronics', 'Machinery'] }
                    ].map((ca, idx) => (
                        <div key={idx} className="glass glass-hover rounded-xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFB800]/10 rounded-full blur-2xl -z-0"></div>
                            <div className="relative z-10">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFB800] to-yellow-600 flex items-center justify-center text-[#0A0E27] font-bold text-sm flex-shrink-0">{ca.initials}</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-semibold text-sm">{ca.name}</h4>
                                        <p className="text-[11px] text-gray-400">{ca.firm}</p>
                                    </div>
                                </div>
                                <div className="space-y-1 mb-3 text-[11px]">
                                    <div className="text-gray-300"><strong>{ca.exp}</strong> • Export-Focused</div>
                                    <div className="text-gray-500">ICAI Reg. No. {ca.reg}</div>
                                    <div className="text-[#FFB800]">{ca.certified} exports certified</div>
                                </div>
                                <div className="flex items-center gap-1 mb-3 flex-wrap">
                                    {ca.tags.map((tag, i) => (
                                        <span key={i} className={`px-2 py-0.5 text-[10px] rounded-full ${i === 0 ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'}`}>{tag}</span>
                                    ))}
                                </div>
                                <div className="space-y-2 text-[11px]">
                                    <button className="w-full btn-dash-primary text-[11px]">Hire for 1 Year</button>
                                    <button className="w-full btn-dash-secondary text-[11px]">Get Trade Card</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CHA Section */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-ship-line text-[#00D9FF]"></i> Custom House Agents (CHA)
                </h3>
                <p className="text-sm text-gray-400 mb-4">Port-wise CHA network for customs clearance & logistics</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { name: 'ABC Logistics (CHA)', lic: 'CHG/2019/001', ports: 'Nhava Sheva, Mundra, ICD TKD', cleared: '2,300+', tags: ['FCL/LCL', 'Reefer', 'Agro'] },
                        { name: 'XYZ Port Services (CHA)', lic: 'CHG/2018/045', ports: 'Jawaharlal Nehru, Kolkata Port', cleared: '1,850+', tags: ['FCL', 'Air Cargo', 'Textiles'] },
                        { name: 'Global Trade Solutions (CHA)', lic: 'CHG/2020/089', ports: 'Pipavav, Kutch, ICD DLI', cleared: '3,100+', tags: ['FCL/LCL', 'Machinery', 'Chemicals'] }
                    ].map((cha, idx) => (
                        <div key={idx} className="glass glass-hover rounded-xl p-5 relative overflow-hidden border-l-4 border-l-[#00D9FF]">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#00D9FF]/10 rounded-full blur-2xl -z-0"></div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-semibold text-sm">{cha.name}</h4>
                                        <p className="text-[11px] text-gray-400">CHA Lic. No. {cha.lic}</p>
                                    </div>
                                    <span className="text-[10px] text-[#10B981] font-semibold ml-2 flex-shrink-0">VERIFIED</span>
                                </div>
                                <div className="space-y-1 mb-3 text-[11px]">
                                    <div className="text-gray-300"><strong>Ports:</strong> {cha.ports}</div>
                                    <div className="text-[#00D9FF] font-semibold">{cha.cleared} shipments cleared</div>
                                    <div className="text-gray-400">Contact: Locked • Unlock (2 Credits)</div>
                                </div>
                                <div className="flex items-center gap-1 mb-3 flex-wrap">
                                    {cha.tags.map((tag, i) => (
                                        <span key={i} className={`px-2 py-0.5 text-[10px] rounded-full ${i === 0 ? 'bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'}`}>{tag}</span>
                                    ))}
                                </div>
                                <div className="space-y-2 text-[11px]">
                                    <button className="w-full btn-dash-primary text-[11px]">Unlock Contact (2 Credits)</button>
                                    <button className="w-full btn-dash-secondary text-[11px]">Share Shipment Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
