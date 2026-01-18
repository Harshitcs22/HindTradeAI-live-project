import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, htAPI } from '../config/supabase'

export default function Dashboard({ session }) {
    const [activeTab, setActiveTab] = useState('overview')
    const [userProfile, setUserProfile] = useState(null)
    const [exporterProfile, setExporterProfile] = useState(null)
    const [verificationStatus, setVerificationStatus] = useState(null)
    const [tradeCard, setTradeCard] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    // Mock Data for UI (fallback)
    const trustScore = tradeCard?.trust_score || 82
    const plan = verificationStatus?.status === 'approved' ? 'Verified' : 'Basic'

    useEffect(() => {
        loadAllData()
    }, [session])

    const loadAllData = async () => {
        if (!session?.user) {
            navigate('/')
            return
        }

        try {
            const profileResult = await htAPI.getUserProfile(session.user.id)
            if (profileResult.success) {
                setUserProfile(profileResult.profile)
            }

            const exporterResult = await htAPI.getExporterProfile(session.user.id)
            if (exporterResult.success && exporterResult.exporter) {
                setExporterProfile(exporterResult.exporter)
            }

            const verifyResult = await htAPI.getVerificationStatus(session.user.id)
            if (verifyResult.success && verifyResult.request) {
                setVerificationStatus(verifyResult.request)
            }

            const cardResult = await htAPI.getTradeCard(session.user.id)
            if (cardResult.success && cardResult.tradeCard) {
                setTradeCard(cardResult.tradeCard)
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    const companyName = exporterProfile?.company_name || userProfile?.company_name || 'Himrock Exports'

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Loading your workspace...</p>
                </div>
            </div>
        )
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewSection trustScore={trustScore} plan={plan} exporterProfile={exporterProfile} verificationStatus={verificationStatus} userId={session?.user?.id} userProfile={userProfile} setActiveTab={setActiveTab} />
            case 'profile':
                return <ProfileSection userId={session?.user?.id} userProfile={userProfile} exporterProfile={exporterProfile} verificationStatus={verificationStatus} tradeCard={tradeCard} trustScore={trustScore} companyName={companyName} onProfileUpdate={loadAllData} setActiveTab={setActiveTab} />
            case 'trade-card':
                return <TradeCardSection tradeCard={tradeCard} companyName={companyName} />
            case 'inventory':
                return <InventorySection userId={session?.user?.id} />
            case 'demand-signals':
                return <DemandSignalsSection plan={plan} userId={session?.user?.id} exporterProfile={exporterProfile} tradeCard={tradeCard} />
            case 'requests':
                return <RequestsSection plan={plan} userId={session?.user?.id} />
            case 'network':
                return <NetworkSection userId={session?.user?.id} />
            case 'docs':
                return <DocsSection />
            default:
                return <OverviewSection trustScore={trustScore} plan={plan} exporterProfile={exporterProfile} verificationStatus={verificationStatus} />
        }
    }

    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-blue-600/30 flex overflow-hidden">

            {/* SIDEBAR NAVIGATION */}
            <aside className="w-64 bg-[#050505] border-r border-white/5 flex flex-col hidden md:flex">
                <div className="h-20 flex items-center px-8 border-b border-white/5">
                    <Link to="/" className="text-xl font-light text-white tracking-[0.2em] uppercase">
                        HindTrade<span className="text-blue-600 font-bold">AI</span>
                    </Link>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-1">
                    {[
                        { id: 'overview', label: 'Command Center' },
                        { id: 'profile', label: 'Public Profile' },
                        { id: 'trade-card', label: 'Trade Identity' },
                        { id: 'inventory', label: 'Inventory' },
                        { id: 'demand-signals', label: 'Demand Signals', badge: 'New' },
                        { id: 'requests', label: 'Trade Requests', badge: '3' },
                        { id: 'network', label: 'Expert Network' },
                        { id: 'docs', label: 'Document Vault' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-[11px] tracking-[0.15em] transition duration-300 group ${activeTab === item.id
                                ? 'bg-white/5 text-white border-l-2 border-white'
                                : 'text-slate-500 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`w-1.5 h-1.5 rounded-full transition ${activeTab === item.id ? 'bg-white' : 'bg-slate-700 group-hover:bg-slate-500'}`}></span>
                                <span className="font-light">{item.label}</span>
                            </div>
                            {item.badge && <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${item.badge === 'New' ? 'bg-white/10 text-white/60' : 'bg-white/10 text-white/60'}`}>{item.badge}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Current Plan</div>
                        <div className="text-white font-serif text-lg mb-2">{plan}</div>
                        <Link to="/#membership" className="block w-full py-2 bg-white/5 hover:bg-blue-600 hover:text-white text-center transition text-[10px] font-bold uppercase tracking-widest rounded border border-white/10">
                            Upgrade
                        </Link>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full mt-3 py-2 text-[10px] text-slate-600 hover:text-red-400 uppercase tracking-widest transition"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto relative">
                {/* Header */}
                <header className="h-20 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
                    <div className="text-sm text-slate-500">Dashboard / <span className="text-white capitalize">{activeTab.replace('-', ' ')}</span></div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600"></div>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">{companyName}</span>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="p-8 max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>

            {/* Mobile Nav Toggle */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 bg-[#050505] border border-white/10 rounded-2xl p-2 flex justify-around z-50">
                {[
                    { id: 'overview', icon: '⚡' },
                    { id: 'trade-card', icon: '🪪' },
                    { id: 'inventory', icon: '📦' },
                    { id: 'network', icon: '🤝' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`p-3 rounded-xl ${activeTab === item.id ? 'bg-blue-600/20 text-blue-500' : 'text-slate-500'}`}
                    >
                        <span className="text-xl">{item.icon}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

/* ---------------- SECTIONS ---------------- */

// 1. OVERVIEW: THE COMMAND CENTER (Real Data)
function OverviewSection({ trustScore, plan, exporterProfile, verificationStatus, userId, userProfile, setActiveTab }) {
    const [networkStats, setNetworkStats] = useState({ pending: 0, requests: [], total: 0 })
    const [loading, setLoading] = useState(true)
    const [inventoryCount, setInventoryCount] = useState(0)

    useEffect(() => {
        const loadStats = async () => {
            if (!userId) return
            setLoading(true)
            const reqResult = await htAPI.getServiceRequests(userId)
            if (reqResult.success) {
                const allRequests = reqResult.requests || []
                const pending = allRequests.filter(r => r.status === 'pending')
                setNetworkStats({ pending: pending.length, requests: pending.slice(0, 3), total: allRequests.length })
            }
            const invResult = await htAPI.getInventory(userId)
            if (invResult.success) setInventoryCount(invResult.items?.length || 0)
            setLoading(false)
        }
        loadStats()
    }, [userId])

    const getTrustLabel = (score) => {
        if (score >= 80) return { label: 'High Credibility', color: 'text-emerald-400' }
        if (score >= 50) return { label: 'Building Trust', color: 'text-blue-400' }
        return { label: 'Getting Started', color: 'text-amber-400' }
    }

    const getServiceLabel = (type) => ({ 'student_site': 'Student Portfolio', 'ca_audit': 'CA Audit', 'cha_lead': 'CHA Consultation' }[type] || type)
    const trustInfo = getTrustLabel(trustScore)

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trust Score Card */}
                <div className="bg-[#080808] border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-4">Trust Score</div>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-light text-white">{trustScore}</span>
                            <span className="text-sm text-slate-600 mb-2">/ 100</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${trustScore}%` }}></div>
                        </div>
                        <div className={`mt-4 text-xs ${trustInfo.color} font-bold uppercase tracking-widest`}>
                            {trustInfo.label}
                        </div>
                    </div>
                </div>

                {/* Identity Status */}
                <div className="bg-[#080808] border border-white/10 p-6 rounded-2xl hover:border-white/20 transition">
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-4">Identity Status</div>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center text-sm text-slate-300">
                            <span>GST Verification</span>
                            <span className={exporterProfile?.gst_number ? "text-emerald-500 font-bold" : "text-slate-600"}>
                                {exporterProfile?.gst_number ? "✓ Verified" : "—"}
                            </span>
                        </li>
                        <li className="flex justify-between items-center text-sm text-slate-300">
                            <span>IEC Code</span>
                            <span className={exporterProfile?.iec_code ? "text-emerald-500 font-bold" : "text-slate-600"}>
                                {exporterProfile?.iec_code ? "✓ Verified" : "—"}
                            </span>
                        </li>
                        <li className="flex justify-between items-center text-sm text-slate-300">
                            <span>CA Audit</span>
                            <span className={verificationStatus?.status === 'approved' ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                                {verificationStatus?.status === 'approved' ? "✓ Complete" : "⚠ Pending"}
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Visibility Pulse - REAL DATA */}
                <div className="bg-[#080808] border border-white/10 p-6 rounded-2xl hover:border-white/20 transition">
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-4">30-Day Visibility</div>
                    <div className="flex items-end gap-4 mb-2">
                        <div title="Total profile views from buyers and partners">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl text-white font-mono">{userProfile?.profile_views || 0}</span>
                                {/* Sparkline SVG */}
                                <svg width="40" height="16" viewBox="0 0 40 16" className="opacity-60">
                                    {(userProfile?.profile_views || 0) > 0 ? (
                                        <polyline points="0,14 10,10 20,8 30,5 40,2" fill="none" stroke="#10b981" strokeWidth="2" />
                                    ) : (
                                        <line x1="0" y1="8" x2="40" y2="8" stroke="#374151" strokeWidth="2" />
                                    )}
                                </svg>
                            </div>
                            <div className="text-[9px] text-slate-600 uppercase">Profile Views</div>
                            {(userProfile?.profile_views || 0) === 0 && (
                                <div className="text-[9px] text-blue-400 mt-1">Share Card to boost</div>
                            )}
                        </div>
                        <div className="h-8 w-[1px] bg-white/10"></div>
                        <div title="Total service requests and buyer inquiries">
                            <div className="text-2xl text-white font-mono">{networkStats.total}</div>
                            <div className="text-[9px] text-slate-600 uppercase">Requests</div>
                            {networkStats.total === 0 && (
                                <div className="text-[9px] text-amber-400 mt-1">Waiting for leads</div>
                            )}
                        </div>
                        <div className="h-8 w-[1px] bg-white/10"></div>
                        <div title="Products in your inventory">
                            <div className="text-2xl text-white font-mono">{inventoryCount}</div>
                            <div className="text-[9px] text-slate-600 uppercase">Products</div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        {(userProfile?.profile_views || 0) > 50
                            ? <span>Your visibility is <span className="text-emerald-400">Top 15%</span> in your region.</span>
                            : (userProfile?.profile_views || 0) > 10
                                ? <span>Your visibility is <span className="text-blue-400">Growing</span>. Keep adding products!</span>
                                : <span>Boost visibility by <span className="text-amber-400">adding products</span> and sharing your Trade Card.</span>
                        }
                    </div>
                </div>
            </div>

            {/* Dynamic Pending Actions */}
            {(() => {
                const isVerified = verificationStatus?.status === 'approved'
                const pendingActions = []

                // Only show if actually missing
                if (!isVerified) {
                    pendingActions.push({
                        id: 'ca',
                        title: "Complete CA Verification",
                        desc: "Unlock the Verified Badge to increase buyer trust.",
                        action: "Book CA",
                        urgent: true,
                        onClick: () => setActiveTab('network')
                    })
                }

                if (inventoryCount < 5) {
                    pendingActions.push({
                        id: 'inventory',
                        title: `Add ${5 - inventoryCount} More Products`,
                        desc: "Profiles with 5+ products get 2x more visibility.",
                        action: "Add Inventory",
                        urgent: inventoryCount === 0,
                        onClick: () => setActiveTab('inventory')
                    })
                }

                if (inventoryCount > 0 && (userProfile?.profile_views || 0) < 10) {
                    pendingActions.push({
                        id: 'share',
                        title: "Share Your Trade Card",
                        desc: "Boost visibility by sharing your public profile link.",
                        action: "Share Link",
                        urgent: false,
                        onClick: () => setActiveTab('trade-card')
                    })
                }

                if (!exporterProfile?.gst_number) {
                    pendingActions.push({
                        id: 'gst',
                        title: "Add GST Number",
                        desc: "Required for verified exporter status.",
                        action: "Update Profile",
                        urgent: true,
                        onClick: () => setActiveTab('profile')
                    })
                }

                return pendingActions.length > 0 ? (
                    <div>
                        <h3 className="text-white text-sm uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Pending Actions</h3>
                        <div className="bg-[#080808] border border-white/10 rounded-xl overflow-hidden">
                            {pendingActions.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-2 h-2 mt-2 rounded-full ${item.urgent ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                        <div>
                                            <div className="text-white text-sm font-medium mb-1">{item.title}</div>
                                            <div className="text-xs text-slate-500">{item.desc}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={item.onClick}
                                        className="px-4 py-2 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition rounded"
                                    >
                                        {item.action}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-4">✅</span>
                        <h3 className="text-emerald-400 font-serif text-xl mb-2">Profile Complete</h3>
                        <p className="text-slate-400 text-sm">Your trade identity is fully set up. Focus on growing your network!</p>
                    </div>
                )
            })()}
        </div>
    )
}

// 2. TRADE CARD: IDENTITY MANAGEMENT
function TradeCardSection({ tradeCard, companyName }) {
    return (
        <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
                <h2 className="text-2xl text-white font-serif mb-6">Your Digital Identity</h2>
                <p className="text-slate-400 text-sm mb-8 max-w-md">
                    This is your live business passport. Buyers scan this to verify your GST, Bank, and Export history.
                </p>

                <div className="space-y-4">
                    <div className="bg-[#080808] p-4 border border-white/10 rounded-lg flex justify-between items-center">
                        <span className="text-sm text-slate-300">Public Link Status</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-emerald-500">ACTIVE</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 rounded">Share Link</button>
                        <button className="py-3 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black rounded">Download PDF</button>
                    </div>
                </div>
            </div>

            {/* The Visual Card */}
            <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-[420px] aspect-[1.586/1] bg-[#030303] rounded-xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)] p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 border border-white/20 rounded flex items-center justify-center bg-black">
                            <span className="text-white font-serif text-lg">H</span>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] text-white/60 uppercase tracking-widest">Verified</div>
                        </div>
                    </div>
                    <div>
                        <div className="w-12 h-8 rounded bg-gradient-to-r from-white/20 to-white/5 mb-4"></div>
                        <h2 className="text-xl text-white tracking-widest uppercase font-light">{companyName}</h2>
                        <p className="text-[9px] text-slate-500 tracking-widest">ID: {tradeCard?.card_id || 'HT-XXXX-XX'}</p>
                    </div>
                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                        <div className="text-2xl text-white font-light">{tradeCard?.trust_score || 82}<span className="text-xs text-slate-600">/100</span></div>
                        <div className="text-xl grayscale opacity-50">🇮🇳</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// 3. INVENTORY: CAPABILITIES (Real Data)
function InventorySection({ userId }) {
    const [inventory, setInventory] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newProduct, setNewProduct] = useState({ product_name: '', moq: '', capacity: '', category: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadInventory()
    }, [userId])

    const loadInventory = async () => {
        if (!userId) return
        setLoading(true)
        const result = await htAPI.getInventory(userId)
        if (result.success) {
            setInventory(result.inventory)
        }
        setLoading(false)
    }

    const handleAddProduct = async () => {
        if (!newProduct.product_name || !userId) return
        setSaving(true)
        const result = await htAPI.createInventoryItem(userId, newProduct)
        if (result.success) {
            setInventory([result.item, ...inventory])
            setNewProduct({ product_name: '', moq: '', capacity: '', category: '' })
            setShowAddModal(false)
        }
        setSaving(false)
    }

    const handleDeleteProduct = async (itemId) => {
        const result = await htAPI.deleteInventoryItem(itemId)
        if (result.success) {
            setInventory(inventory.filter(item => item.id !== itemId))
        }
    }

    // Shimmer Loading State
    if (loading) {
        return (
            <div>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-white/5 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[#080808] border border-white/10 p-6 rounded-xl">
                            <div className="w-12 h-12 bg-white/5 rounded-lg animate-pulse mb-4"></div>
                            <div className="h-5 w-32 bg-white/5 rounded animate-pulse mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-white/5 rounded animate-pulse"></div>
                                <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl text-white font-serif">Supply Capabilities</h2>
                    <p className="text-slate-500 text-xs mt-1">What you can make. Visible to the world.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 rounded"
                >
                    + Add Product
                </button>
            </div>

            {/* Empty State */}
            {inventory.length === 0 && (
                <div className="bg-[#080808] border border-dashed border-white/20 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl opacity-50">📦</span>
                    </div>
                    <h3 className="text-white font-medium mb-2">Start Your Catalog</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                        Add your first product to show buyers what you can manufacture. No prices needed - just capabilities.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 rounded"
                    >
                        Add First Product
                    </button>
                </div>
            )}

            {/* Inventory Grid */}
            {inventory.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {inventory.map((item) => (
                        <div key={item.id} className="bg-[#080808] border border-white/10 p-6 rounded-xl hover:border-white/30 transition group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                                    <span className="text-lg">📦</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${item.status === 'active' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                        {item.status || 'Active'}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteProduct(item.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-white font-bold mb-1">{item.product_name}</h3>
                            {item.category && <p className="text-xs text-slate-500 mb-4">{item.category}</p>}
                            <div className="space-y-2 text-xs text-slate-400">
                                {item.moq && <div className="flex justify-between"><span>MOQ:</span> <span className="text-white">{item.moq}</span></div>}
                                {item.capacity && <div className="flex justify-between"><span>Capacity:</span> <span className="text-white">{item.capacity}</span></div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
                        <h3 className="text-white text-xl font-serif mb-6">Add New Product</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    value={newProduct.product_name}
                                    onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-white/30 outline-none transition"
                                    placeholder="e.g. Cotton Yarn 40s"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">Category</label>
                                <input
                                    type="text"
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-white/30 outline-none transition"
                                    placeholder="e.g. Textiles, Yarn"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">MOQ</label>
                                    <input
                                        type="text"
                                        value={newProduct.moq}
                                        onChange={(e) => setNewProduct({ ...newProduct, moq: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-white/30 outline-none transition"
                                        placeholder="e.g. 500 Kgs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">Capacity</label>
                                    <input
                                        type="text"
                                        value={newProduct.capacity}
                                        onChange={(e) => setNewProduct({ ...newProduct, capacity: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-white/30 outline-none transition"
                                        placeholder="e.g. 10 Tonnes/Month"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddProduct}
                                disabled={saving || !newProduct.product_name}
                                className="flex-1 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


// 4. REQUESTS: TRADE INBOX (Real Data)
function RequestsSection({ plan, userId }) {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadRequests()
    }, [userId])

    const loadRequests = async () => {
        if (!userId) return
        setLoading(true)
        const result = await htAPI.getServiceRequests(userId)
        if (result.success) {
            setRequests(result.requests || [])
        }
        setLoading(false)
    }

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Recently'
        const now = new Date()
        const date = new Date(dateString)
        const diffMs = now - date
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHrs / 24)

        if (diffHrs < 1) return 'Just now'
        if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    }

    const getServiceLabel = (type) => {
        const labels = {
            'ca_audit': 'CA Audit Request',
            'student_site': 'Student Design Request',
            'cha_lead': 'CHA Consultation',
            'demand_interest': 'Buyer Interest'
        }
        return labels[type] || type
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl text-white font-serif">Trade Requests</h2>
                    <p className="text-slate-500 text-xs mt-1">Your service requests and buyer inquiries.</p>
                </div>
            </div>

            <div className="bg-[#080808] border border-white/10 rounded-xl overflow-hidden">
                {loading ? (
                    /* Shimmer Loading State */
                    <div className="space-y-0">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-6 border-b border-white/5 last:border-0">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-lg animate-pulse"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div>
                                        <div className="h-3 w-24 bg-white/5 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="h-8 w-20 bg-white/5 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : requests.length === 0 ? (
                    /* Empty State - Luxury Waiting UI */
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl animate-pulse">📡</span>
                        </div>
                        <h3 className="text-white font-serif text-lg mb-2">Waiting for Signals</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                            Your trade requests will appear here. Submit a service request from the Network tab to get started.
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                            <span className="text-[10px] text-blue-400 uppercase tracking-widest">Listening...</span>
                        </div>
                    </div>
                ) : (
                    /* Real Data */
                    requests.map((req, i) => (
                        <div key={req.id || i} className="flex items-center justify-between p-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-lg">
                                    {req.service_type === 'ca_audit' ? '👨‍⚖️' :
                                        req.service_type === 'student_site' ? '🎨' :
                                            req.service_type === 'cha_lead' ? '🚢' : '📩'}
                                </div>
                                <div>
                                    <div className="text-white text-sm font-medium mb-1">{getServiceLabel(req.service_type)}</div>
                                    <div className="text-xs text-slate-500">
                                        Status: <span className={`font-bold ${req.status === 'completed' ? 'text-emerald-400' : req.status === 'pending' ? 'text-amber-400' : 'text-slate-400'}`}>
                                            {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-600 mb-2">{getTimeAgo(req.created_at)}</div>
                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${req.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                    req.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-white/10 text-slate-400'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}


// 5. NETWORK: MARKETPLACE (Real Service Requests with Active List)
function NetworkSection({ userId }) {
    const [requestingService, setRequestingService] = useState(null)
    const [requestSuccess, setRequestSuccess] = useState(null)
    const [activeRequests, setActiveRequests] = useState([])
    const [loadingRequests, setLoadingRequests] = useState(true)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        loadActiveRequests()
    }, [userId])

    const loadActiveRequests = async () => {
        if (!userId) return
        setLoadingRequests(true)
        const result = await htAPI.getServiceRequests(userId)
        if (result.success) {
            setActiveRequests(result.requests?.filter(r => r.status === 'pending') || [])
        }
        setLoadingRequests(false)
    }

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const handleServiceRequest = async (serviceType) => {
        if (!userId) return

        // Check for duplicate pending request
        const existingRequest = activeRequests.find(
            r => r.service_type === serviceType && r.status === 'pending'
        )
        if (existingRequest) {
            showToast('You already have a pending request for this service', 'warning')
            return
        }

        setRequestingService(serviceType)
        const result = await htAPI.createServiceRequest(userId, serviceType, { requested_at: new Date().toISOString() })

        if (result.success) {
            setRequestSuccess(serviceType)
            showToast(getToastMessage(serviceType), 'success')
            loadActiveRequests() // Refresh the list
            setTimeout(() => setRequestSuccess(null), 3000)
        } else {
            showToast('Failed to send request. Please try again.', 'error')
        }
        setRequestingService(null)
    }

    const getToastMessage = (type) => {
        const messages = {
            'student_site': '🎨 Request sent to Student Design Wing!',
            'ca_audit': '👨‍⚖️ Request sent to CA Network!',
            'cha_lead': '🚢 Request sent to CHA Network!'
        }
        return messages[type] || 'Request sent successfully!'
    }

    const getServiceLabel = (type) => {
        const labels = {
            'student_site': 'Student Portfolio',
            'ca_audit': 'CA Audit',
            'cha_lead': 'CHA Consultation'
        }
        return labels[type] || type
    }

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Recently'
        const now = new Date()
        const date = new Date(dateString)
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / (1000 * 60))
        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
        const diffHrs = Math.floor(diffMins / 60)
        if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`
        return `${Math.floor(diffHrs / 24)} day${Math.floor(diffHrs / 24) > 1 ? 's' : ''} ago`
    }

    return (
        <div className="relative">
            {/* TOAST NOTIFICATION */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' :
                    toast.type === 'warning' ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' :
                        'bg-red-500/20 border-red-500/30 text-red-300'
                    }`}>
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-xl text-white font-serif">Expert Network</h2>
                <p className="text-slate-500 text-xs mt-1">Connect with verified professionals.</p>
            </div>

            {/* ACTIVE SERVICE REQUESTS */}
            {(activeRequests.length > 0 || loadingRequests) && (
                <div className="mb-8 bg-[#080808] border border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <h3 className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Active Service Requests</h3>
                    </div>

                    {loadingRequests ? (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {[1, 2].map(i => (
                                <div key={i} className="flex-shrink-0 h-16 w-48 bg-white/5 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {activeRequests.map((req) => (
                                <div key={req.id} className="flex-shrink-0 bg-white/5 border border-white/10 rounded-lg px-4 py-3 min-w-[200px]">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white text-sm font-medium">{getServiceLabel(req.service_type)}</span>
                                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] font-bold uppercase rounded">
                                            Pending
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">Sent {getTimeAgo(req.created_at)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* STUDENT CARD - Featured */}
                <div className="col-span-1 md:col-span-2 bg-[#080808] border border-white/20 p-8 rounded-xl relative overflow-hidden group hover:border-white/40 transition">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                    <div className="relative z-10">
                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 block">Student Design Wing</span>
                        <h3 className="text-2xl text-white font-serif mb-4">Get a Product Website for ₹500</h3>
                        <p className="text-slate-400 text-sm max-w-md mb-6">
                            Hire a vetted NIT/IIT engineering student to build a stunning portfolio page linked to your Trade Card. Fixed price. 48-hour delivery.
                        </p>
                        <button
                            onClick={() => handleServiceRequest('student_site')}
                            disabled={requestingService === 'student_site'}
                            className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 rounded disabled:opacity-50"
                        >
                            {requestingService === 'student_site' ? 'Requesting...' :
                                requestSuccess === 'student_site' ? '✓ Request Sent!' : 'Hire Student Designer'}
                        </button>
                    </div>
                </div>

                {/* CA CARD */}
                <div className="bg-[#080808] border border-white/10 p-6 rounded-xl hover:border-white/30 transition group">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 transition">
                        <span className="text-2xl">👨‍⚖️</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">Chartered Accountants</h3>
                    <p className="text-xs text-slate-500 mb-6">Audit services, Net Worth Certificates, and UDIN generation.</p>
                    <button
                        onClick={() => handleServiceRequest('ca_audit')}
                        disabled={requestingService === 'ca_audit'}
                        className="w-full py-2 border border-white/10 text-white text-[10px] font-bold uppercase hover:bg-white hover:text-black transition rounded disabled:opacity-50"
                    >
                        {requestingService === 'ca_audit' ? 'Requesting...' :
                            requestSuccess === 'ca_audit' ? '✓ Request Sent!' : 'Request CA Audit'}
                    </button>
                </div>

                {/* CHA CARD */}
                <div className="bg-[#080808] border border-white/10 p-6 rounded-xl hover:border-white/30 transition group">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 transition">
                        <span className="text-2xl">🚢</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">CHA Network</h3>
                    <p className="text-xs text-slate-500 mb-6">Verified Customs House Agents for smooth export clearance.</p>
                    <button
                        onClick={() => handleServiceRequest('cha_lead')}
                        disabled={requestingService === 'cha_lead'}
                        className="w-full py-2 border border-white/10 text-white text-[10px] font-bold uppercase hover:bg-white hover:text-black transition rounded disabled:opacity-50"
                    >
                        {requestingService === 'cha_lead' ? 'Requesting...' :
                            requestSuccess === 'cha_lead' ? '✓ Request Sent!' : 'Contact CHA'}
                    </button>
                </div>

                {/* AI MENTOR CARD */}
                <div className="bg-[#080808] border border-white/10 p-6 rounded-xl hover:border-white/30 transition group">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 transition">
                        <span className="text-2xl">🤖</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">AI Trade Mentor</h3>
                    <p className="text-xs text-slate-500 mb-6">24/7 guidance for HSN codes, shipping ports, required documents.</p>
                    <button className="w-full py-2 border border-white/10 text-white text-[10px] font-bold uppercase hover:bg-white hover:text-black transition rounded">
                        Ask AI
                    </button>
                </div>
            </div>

            {/* Success Toast */}
            {requestSuccess && (
                <div className="fixed bottom-8 right-8 bg-emerald-900/90 border border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-xl shadow-2xl animate-pulse z-50">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">✓</span>
                        <div>
                            <div className="font-bold text-sm">Request Submitted!</div>
                            <div className="text-xs text-emerald-400/70">We'll connect you with a professional soon.</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


// 6. DOCS: DOCUMENT VAULT
function DocsSection() {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl text-white font-serif">Document Vault</h2>
                    <p className="text-slate-500 text-xs mt-1">Secure storage for your trade documents.</p>
                </div>
                <button className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 rounded">
                    + Upload Doc
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { name: "GST Certificate", type: "PDF", date: "Jan 2026" },
                    { name: "IEC Registration", type: "PDF", date: "Jan 2026" },
                    { name: "Bank Statement", type: "PDF", date: "Dec 2025" },
                    { name: "CA Audit Report", type: "PDF", date: "Pending" },
                ].map((doc, i) => (
                    <div key={i} className="bg-[#080808] border border-white/10 p-4 rounded-xl hover:border-white/30 transition group cursor-pointer">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-3 text-lg">📄</div>
                        <h4 className="text-white text-sm font-medium mb-1">{doc.name}</h4>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{doc.type} • {doc.date}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 7. PROFILE: EDITABLE PUBLIC PROFILE (Real Data)
function ProfileSection({ userId, userProfile, exporterProfile, verificationStatus, tradeCard, trustScore, companyName, onProfileUpdate, setActiveTab }) {
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [photoPreview, setPhotoPreview] = useState(exporterProfile?.logo_url || userProfile?.avatar_url || null)

    // Editable form state
    const [formData, setFormData] = useState({
        company_name: exporterProfile?.company_name || companyName || '',
        city: exporterProfile?.city || '',
        state: exporterProfile?.state || '',
        bio: exporterProfile?.bio || '',
        export_products: exporterProfile?.export_products || '',
        years_in_business: exporterProfile?.years_in_business || 5,
        annual_turnover: exporterProfile?.annual_turnover || 0,
        target_markets: exporterProfile?.target_markets?.join(', ') || '',
        established_year: exporterProfile?.established_year || '',
        net_worth: exporterProfile?.net_worth || '',
        trade_preference: exporterProfile?.trade_preference || 'both',
    })

    const isVerified = verificationStatus?.status === 'approved'

    // Trust Vault State
    const [trustDocs, setTrustDocs] = useState([])
    const [uploadingDoc, setUploadingDoc] = useState(null)
    const [analyzingDoc, setAnalyzingDoc] = useState(null)
    const [loadingDocs, setLoadingDocs] = useState(true)

    useEffect(() => {
        loadTrustDocuments()
        loadShipments()
        loadCertifications()
    }, [userId])

    const loadTrustDocuments = async () => {
        if (!userId) return
        setLoadingDocs(true)
        const result = await htAPI.getTrustDocuments(userId)
        if (result.success) setTrustDocs(result.documents || [])
        setLoadingDocs(false)
    }

    // Shipment Ledger State
    const [shipments, setShipments] = useState([])
    const [shipmentCount, setShipmentCount] = useState(0)
    const [loadingShipments, setLoadingShipments] = useState(true)
    const [showShipmentModal, setShowShipmentModal] = useState(false)
    const [addingShipment, setAddingShipment] = useState(false)
    const [newShipment, setNewShipment] = useState({
        destination_country: '',
        shipment_date: '',
        goods_type: '',
        value_inr: ''
    })

    // Cover Photo State
    const [coverUrl, setCoverUrl] = useState(exporterProfile?.cover_url || null)
    const [uploadingCover, setUploadingCover] = useState(false)

    // Certifications State
    const [certifications, setCertifications] = useState([])
    const [loadingCerts, setLoadingCerts] = useState(true)
    const [showCertModal, setShowCertModal] = useState(false)
    const [addingCert, setAddingCert] = useState(false)
    const [newCert, setNewCert] = useState({
        cert_name: '',
        issuer: '',
        issue_date: '',
        expiry_date: '',
        cert_number: ''
    })

    const loadCertifications = async () => {
        if (!userId) return
        setLoadingCerts(true)
        const result = await htAPI.getCertifications(userId)
        if (result.success) {
            setCertifications(result.certifications || [])
        }
        setLoadingCerts(false)
    }

    const handleAddCertification = async () => {
        if (!userId || !newCert.cert_name) return
        setAddingCert(true)
        const result = await htAPI.addCertification(userId, newCert)
        if (result.success) {
            loadCertifications()
            setShowCertModal(false)
            setNewCert({ cert_name: '', issuer: '', issue_date: '', expiry_date: '', cert_number: '' })
        }
        setAddingCert(false)
    }

    const loadShipments = async () => {
        if (!userId) return
        setLoadingShipments(true)
        const result = await htAPI.getShipmentLogs(userId)
        if (result.success) {
            setShipments(result.shipments || [])
            setShipmentCount(result.count || 0)
        }
        setLoadingShipments(false)
    }

    const handleCoverUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !userId) return
        setUploadingCover(true)
        const result = await htAPI.uploadCoverPhoto(userId, file)
        if (result.success) {
            setCoverUrl(result.url)
            if (onProfileUpdate) onProfileUpdate()
        }
        setUploadingCover(false)
    }

    const handleAddShipment = async () => {
        if (!userId || !newShipment.destination_country || !newShipment.shipment_date) return
        setAddingShipment(true)
        const result = await htAPI.addShipmentLog(userId, newShipment)
        if (result.success) {
            loadShipments()
            setShowShipmentModal(false)
            setNewShipment({ destination_country: '', shipment_date: '', goods_type: '', value_inr: '' })
        }
        setAddingShipment(false)
    }

    // Helper to format currency safely (fixes NaN bug)
    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === '' || isNaN(value)) return null
        const num = parseFloat(value)
        if (isNaN(num) || num === 0) return null
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`
        return `₹${num.toLocaleString('en-IN')}`
    }

    const handleDocUpload = async (docType, e) => {
        const file = e.target.files?.[0]
        if (!file || !userId) return

        setUploadingDoc(docType)

        // Simulate upload delay
        await new Promise(r => setTimeout(r, 1000))

        // Show analyzing state
        setUploadingDoc(null)
        setAnalyzingDoc(docType)

        // Simulate AI analysis (2 seconds)
        await new Promise(r => setTimeout(r, 2000))

        // Actually upload
        const result = await htAPI.uploadTrustDocument(userId, docType, file)
        if (result.success) {
            loadTrustDocuments()
        }
        setAnalyzingDoc(null)
    }

    const handleToggleVisibility = async (docId, currentVisibility) => {
        await htAPI.toggleDocumentVisibility(docId, !currentVisibility)
        loadTrustDocuments()
    }

    const getDocByType = (type) => trustDocs.find(d => d.doc_type === type)

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !userId) return

        setUploading(true)

        // Show preview immediately
        const reader = new FileReader()
        reader.onload = (e) => setPhotoPreview(e.target?.result)
        reader.readAsDataURL(file)

        // Upload to Supabase and persist to DB
        const uploadResult = await htAPI.uploadProfilePhoto(userId, file)
        if (uploadResult.success) {
            await htAPI.updateProfileWithPhoto(userId, uploadResult.url)
            setPhotoPreview(uploadResult.url)
            // Trigger refresh so parent reloads data
            if (onProfileUpdate) onProfileUpdate()
        }
        setUploading(false)
    }

    const handleSave = async () => {
        if (!userId) return
        setSaving(true)

        try {
            const exporterData = {
                company_name: formData.company_name,
                city: formData.city,
                state: formData.state,
                bio: formData.bio,
                export_products: formData.export_products,
                years_in_business: parseInt(formData.years_in_business) || 5,
                annual_turnover: parseInt(formData.annual_turnover) || 0,
                target_markets: formData.target_markets ? formData.target_markets.split(',').map(m => m.trim()).filter(Boolean) : [],
                established_year: formData.established_year ? parseInt(formData.established_year) : null,
                net_worth: formData.net_worth ? parseFloat(formData.net_worth) : null,
                trade_preference: formData.trade_preference || 'both'
            }

            const profileData = {
                company_name: formData.company_name,
                full_name: formData.company_name
            }

            console.log('💾 Saving profile...', exporterData)
            const result = await htAPI.updateFullProfile(userId, profileData, exporterData)
            console.log('📋 Save result:', result)

            if (result.success) {
                setIsEditing(false)
                if (onProfileUpdate) onProfileUpdate()
            } else {
                console.error('❌ Save failed:', result.error)
                alert('Failed to save: ' + (result.error || 'Unknown error'))
            }
        } catch (err) {
            console.error('❌ Save error:', err)
            alert('Error saving profile: ' + err.message)
        }
        setSaving(false)
    }

    return (
        <div className="space-y-8">
            {/* EDIT MODE TOGGLE BANNER */}
            <div className="bg-gradient-to-r from-blue-900/20 to-transparent border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-blue-500">{isEditing ? '✏️' : '👁️'}</span>
                    <span className="text-sm text-slate-400">
                        {isEditing ? 'Edit Mode — Make changes to your profile' : 'This is how buyers see your public profile'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-[10px] font-bold text-white/60 uppercase tracking-widest hover:text-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 rounded-lg transition"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* HERO SECTION */}
            <div className="bg-[#080808] border border-white/10 rounded-2xl overflow-hidden">
                {/* Cover Photo with Edit */}
                <div className="h-32 relative group" style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    {!coverUrl && <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900/20 to-slate-900"></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-transparent"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    {/* Edit Cover Button */}
                    <label className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg text-[10px] text-white font-bold uppercase tracking-widest cursor-pointer hover:bg-white/10 transition opacity-0 group-hover:opacity-100">
                        <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                        {uploadingCover ? '...' : '📷 Edit Cover'}
                    </label>
                </div>

                {/* Profile Content */}
                <div className="px-8 pb-8 -mt-12 relative">
                    {/* Avatar with Upload */}
                    <div className="flex items-end gap-6 mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 bg-[#0a0a0a] border-4 border-[#080808] rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-serif text-white">{formData.company_name?.substring(0, 2).toUpperCase() || 'HE'}</span>
                                )}
                            </div>
                            {/* Upload Overlay */}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-2xl">
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                <span className="text-white text-sm font-bold">{uploading ? '...' : '📷'}</span>
                            </label>
                        </div>
                        <div className="flex-1 pb-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    className="text-2xl text-white font-serif bg-transparent border-b border-white/20 focus:border-white/50 outline-none w-full"
                                    placeholder="Company Name"
                                />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl text-white font-serif">{formData.company_name || companyName}</h1>
                                    {isVerified && (
                                        <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                                            ✓ Verified
                                        </span>
                                    )}
                                    {/* Trade Badge */}
                                    <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-[10px] text-blue-400 font-bold uppercase">
                                        {exporterProfile?.trade_preference === 'global' ? 'Global' : exporterProfile?.trade_preference === 'domestic' ? 'Domestic' : 'Both'}
                                    </span>
                                </div>
                            )}
                            {isEditing ? (
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="text-sm text-slate-400 bg-transparent border-b border-white/10 focus:border-white/30 outline-none w-32"
                                        placeholder="City"
                                    />
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="text-sm text-slate-400 bg-transparent border-b border-white/10 focus:border-white/30 outline-none w-32"
                                        placeholder="State"
                                    />
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm mt-1">
                                    {formData.city || exporterProfile?.city || 'India'}{formData.state ? `, ${formData.state}` : ''} • Exporter
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-light text-white">{trustScore}<span className="text-sm text-slate-600">/100</span></div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Trust Score</div>
                        </div>
                    </div>

                    {/* Quick Stats - REAL DATA */}
                    <div className="grid grid-cols-4 gap-4 py-6 border-t border-b border-white/5">
                        <div className="text-center">
                            <div className="text-2xl text-white font-mono">{exporterProfile?.established_year || '--'}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Established</div>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <div className="text-2xl text-white font-mono">{shipmentCount}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Shipments</div>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <div className="text-2xl text-white font-mono">{formatCurrency(exporterProfile?.net_worth) || '--'}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Net Worth</div>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <div className="text-sm text-white font-medium">
                                {exporterProfile?.trade_preference === 'global' ? 'Global Trade' : exporterProfile?.trade_preference === 'domestic' ? 'Domestic' : 'Global & Domestic'}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Trade Type</div>
                        </div>
                    </div>

                    {/* VIEW TRADE CARD BUTTON */}
                    <button
                        onClick={() => {
                            // Navigate to Trade Identity tab
                            if (setActiveTab) setActiveTab('identity')
                        }}
                        className="w-full py-4 mt-6 bg-black/50 border border-white/20 text-white/80 hover:text-white hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px] font-bold rounded-xl"
                    >
                        View Trade Card →
                    </button>

                    {/* ADD CERTIFICATION MODAL */}
                    {showCertModal && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                                <h3 className="text-white text-lg font-serif mb-6">Add Certification</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Certification Name *</label>
                                        <input
                                            type="text"
                                            value={newCert.cert_name}
                                            onChange={(e) => setNewCert({ ...newCert, cert_name: e.target.value })}
                                            placeholder="e.g., ISO 9001, GOTS, OEKO-TEX"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Issuing Body</label>
                                        <input
                                            type="text"
                                            value={newCert.issuer}
                                            onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                                            placeholder="e.g., Bureau Veritas, SGS"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Issue Date</label>
                                            <input
                                                type="date"
                                                value={newCert.issue_date}
                                                onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={newCert.expiry_date}
                                                onChange={(e) => setNewCert({ ...newCert, expiry_date: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Certificate Number</label>
                                        <input
                                            type="text"
                                            value={newCert.cert_number}
                                            onChange={(e) => setNewCert({ ...newCert, cert_number: e.target.value })}
                                            placeholder="e.g., CERT-2024-12345"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowCertModal(false)}
                                        className="flex-1 px-4 py-3 border border-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/5 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddCertification}
                                        disabled={addingCert || !newCert.cert_name}
                                        className="flex-1 px-4 py-3 bg-white text-black text-sm font-bold rounded-lg hover:bg-slate-200 disabled:opacity-50 transition"
                                    >
                                        {addingCert ? 'Adding...' : 'Add Certification'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About */}
                    <div className="py-6 border-t border-white/5">
                        <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">About</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {exporterProfile?.bio || `${exporterProfile?.company_name || companyName} is a leading exporter of ${exporterProfile?.export_products || 'quality products'}, serving international markets with a focus on quality, compliance, and timely delivery.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* TRUST & VERIFICATION SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trust Badges */}
                <div className="bg-[#080808] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        Trust Verification
                    </h3>

                    <div className="space-y-4">
                        {[
                            { label: 'GST Registration', value: exporterProfile?.gst_number, verified: !!exporterProfile?.gst_number, icon: '🏛️' },
                            { label: 'Import Export Code', value: exporterProfile?.iec_code, verified: !!exporterProfile?.iec_code, icon: '🌍' },
                            { label: 'PAN Verification', value: exporterProfile?.pan_number ? '••••' + exporterProfile.pan_number.slice(-4) : null, verified: !!exporterProfile?.pan_number, icon: '🆔' },
                            { label: 'CA Audit', value: isVerified ? 'Completed' : 'Pending', verified: isVerified, icon: '📋' },
                            { label: 'Bank Verification', value: 'Active Account', verified: true, icon: '🏦' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl group hover:bg-white/10 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-lg">{item.icon}</div>
                                    <div>
                                        <div className="text-white text-sm">{item.label}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">{item.value || 'Not provided'}</div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.verified
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-700 text-slate-500'
                                    }`}>
                                    {item.verified ? '✓ Verified' : 'Pending'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Capabilities & Certifications */}
                {/* Capabilities & Certifications */}
                <div className="bg-[#080808] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Capabilities
                    </h3>

                    {/* Export Products */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Products & Categories</div>
                            <button onClick={() => setIsEditing(true)} className="text-slate-600 hover:text-white transition">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(exporterProfile?.export_products ? exporterProfile.export_products.split(',') : []).length > 0 ? (
                                exporterProfile.export_products.split(',').map((product, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300">
                                        {product.trim()}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-slate-600 italic">No products listed</span>
                            )}
                        </div>
                    </div>

                    {/* Export Markets */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Export Markets</div>
                            <button onClick={() => setIsEditing(true)} className="text-slate-600 hover:text-white transition">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {exporterProfile?.target_markets && Array.isArray(exporterProfile.target_markets) && exporterProfile.target_markets.length > 0 ? (
                                exporterProfile.target_markets.map((market, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300">
                                        {market}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-slate-600 italic">No markets listed</span>
                            )}
                        </div>
                    </div>

                    {/* Certifications (Real Data) */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Certifications</div>
                            <button
                                onClick={() => setShowCertModal(true)}
                                className="text-[10px] text-blue-400 hover:text-blue-300 uppercase tracking-widest font-bold transition"
                            >
                                + Add
                            </button>
                        </div>

                        {loadingCerts ? (
                            <div className="flex gap-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-8 w-20 bg-white/5 rounded animate-pulse"></div>
                                ))}
                            </div>
                        ) : certifications.length === 0 ? (
                            <p className="text-slate-600 text-[10px]">No certifications added yet.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {certifications.map(cert => (
                                    <div key={cert.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <span className="text-xs text-white">{cert.cert_name}</span>
                                        <span className={`text-[9px] uppercase tracking-wider font-bold ${cert.is_verified ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {cert.is_verified ? 'Active' : 'Pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CAPABILITY EVIDENCE (Smart Trust Vault) */}
            <div className="bg-[#080808] border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Capability Evidence
                        <span className="text-[10px] text-blue-400 font-normal ml-2">AI Verified</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 uppercase">Trust Vault™</span>
                </div>

                <p className="text-slate-500 text-sm mb-6">
                    Upload real proof of your capabilities. Our AI analyzes documents to verify authenticity.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Factory Proof */}
                    {(() => {
                        const doc = getDocByType('electricity_bill')
                        const isUploading = uploadingDoc === 'electricity_bill'
                        const isAnalyzing = analyzingDoc === 'electricity_bill'
                        return (
                            <div className={`bg-black/50 border rounded-xl p-5 transition ${doc ? 'border-emerald-500/30' : 'border-white/10 hover:border-white/20'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-2xl">🏭</span>
                                    <div>
                                        <div className="text-white text-sm font-medium">Factory Proof</div>
                                        <div className="text-[10px] text-slate-500">Electricity Bill</div>
                                    </div>
                                </div>

                                {doc ? (
                                    <div className="space-y-3">
                                        <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                            <p className="text-emerald-400 text-xs font-medium">{doc.ai_insight}</p>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <button
                                                onClick={() => handleToggleVisibility(doc.id, doc.is_public)}
                                                className="text-slate-400 hover:text-white transition"
                                            >
                                                {doc.is_public ? '👁️ Public' : '🔒 Private'}
                                            </button>
                                            <span className="text-emerald-500">✓ Verified</span>
                                        </div>
                                    </div>
                                ) : isUploading ? (
                                    <div className="text-center py-4">
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                                        <span className="text-xs text-slate-400">Uploading...</span>
                                    </div>
                                ) : isAnalyzing ? (
                                    <div className="text-center py-4">
                                        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                                        <span className="text-xs text-blue-400">🔍 AI Analyzing...</span>
                                    </div>
                                ) : (
                                    <label className="block cursor-pointer">
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocUpload('electricity_bill', e)} className="hidden" />
                                        <div className="py-3 border border-dashed border-white/20 rounded-lg text-center hover:border-white/40 transition">
                                            <span className="text-xs text-slate-400">+ Upload Bill</span>
                                        </div>
                                    </label>
                                )}
                            </div>
                        )
                    })()}

                    {/* Export Proof */}
                    {(() => {
                        const doc = getDocByType('bill_of_lading')
                        const isUploading = uploadingDoc === 'bill_of_lading'
                        const isAnalyzing = analyzingDoc === 'bill_of_lading'
                        return (
                            <div className={`bg-black/50 border rounded-xl p-5 transition ${doc ? 'border-emerald-500/30' : 'border-white/10 hover:border-white/20'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-2xl">🚢</span>
                                    <div>
                                        <div className="text-white text-sm font-medium">Export Proof</div>
                                        <div className="text-[10px] text-slate-500">Bill of Lading</div>
                                    </div>
                                </div>

                                {doc ? (
                                    <div className="space-y-3">
                                        <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                            <p className="text-emerald-400 text-xs font-medium">{doc.ai_insight}</p>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <button
                                                onClick={() => handleToggleVisibility(doc.id, doc.is_public)}
                                                className="text-slate-400 hover:text-white transition"
                                            >
                                                {doc.is_public ? '👁️ Public' : '🔒 Private'}
                                            </button>
                                            <span className="text-emerald-500">✓ Verified</span>
                                        </div>
                                    </div>
                                ) : isUploading ? (
                                    <div className="text-center py-4">
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                                        <span className="text-xs text-slate-400">Uploading...</span>
                                    </div>
                                ) : isAnalyzing ? (
                                    <div className="text-center py-4">
                                        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                                        <span className="text-xs text-blue-400">🔍 AI Analyzing...</span>
                                    </div>
                                ) : (
                                    <label className="block cursor-pointer">
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocUpload('bill_of_lading', e)} className="hidden" />
                                        <div className="py-3 border border-dashed border-white/20 rounded-lg text-center hover:border-white/40 transition">
                                            <span className="text-xs text-slate-400">+ Upload B/L</span>
                                        </div>
                                    </label>
                                )}
                            </div>
                        )
                    })()}

                    {/* Quality Proof */}
                    {(() => {
                        const doc = getDocByType('quality_cert')
                        const isUploading = uploadingDoc === 'quality_cert'
                        const isAnalyzing = analyzingDoc === 'quality_cert'
                        return (
                            <div className={`bg-black/50 border rounded-xl p-5 transition ${doc ? 'border-emerald-500/30' : 'border-white/10 hover:border-white/20'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-2xl">✅</span>
                                    <div>
                                        <div className="text-white text-sm font-medium">Quality Proof</div>
                                        <div className="text-[10px] text-slate-500">ISO / Lab Report</div>
                                    </div>
                                </div>

                                {doc ? (
                                    <div className="space-y-3">
                                        <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                            <p className="text-emerald-400 text-xs font-medium">{doc.ai_insight}</p>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <button
                                                onClick={() => handleToggleVisibility(doc.id, doc.is_public)}
                                                className="text-slate-400 hover:text-white transition"
                                            >
                                                {doc.is_public ? '👁️ Public' : '🔒 Private'}
                                            </button>
                                            <span className="text-emerald-500">✓ Verified</span>
                                        </div>
                                    </div>
                                ) : isUploading ? (
                                    <div className="text-center py-4">
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                                        <span className="text-xs text-slate-400">Uploading...</span>
                                    </div>
                                ) : isAnalyzing ? (
                                    <div className="text-center py-4">
                                        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                                        <span className="text-xs text-blue-400">🔍 AI Analyzing...</span>
                                    </div>
                                ) : (
                                    <label className="block cursor-pointer">
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocUpload('quality_cert', e)} className="hidden" />
                                        <div className="py-3 border border-dashed border-white/20 rounded-lg text-center hover:border-white/40 transition">
                                            <span className="text-xs text-slate-400">+ Upload Cert</span>
                                        </div>
                                    </label>
                                )}
                            </div>
                        )
                    })()}
                </div>
            </div>

            {/* SHIPMENT LEDGER (Real Data) */}
            <div className="bg-[#080808] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        Trade History
                        <span className="ml-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded">
                            {shipmentCount} Shipments
                        </span>
                    </h3>
                    <button
                        onClick={() => setShowShipmentModal(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition"
                    >
                        + Log Shipment
                    </button>
                </div>

                {loadingShipments ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-white/5 rounded animate-pulse"></div>
                        ))}
                    </div>
                ) : shipments.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                        <span className="text-3xl block mb-2">📦</span>
                        <p className="text-slate-400 text-sm">No shipments logged yet.</p>
                        <p className="text-slate-600 text-xs mt-1">Log your first export to build credibility.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest pb-4">Date</th>
                                    <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest pb-4">Destination</th>
                                    <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest pb-4">Product</th>
                                    <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest pb-4">Value</th>
                                    <th className="text-right text-[10px] text-slate-500 uppercase tracking-widest pb-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.slice(0, 5).map((shipment) => (
                                    <tr key={shipment.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                                        <td className="py-4 text-sm text-slate-400">{new Date(shipment.shipment_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                                        <td className="py-4 text-sm text-white">{shipment.destination_country}</td>
                                        <td className="py-4 text-sm text-slate-300">{shipment.goods_type || '-'}</td>
                                        <td className="py-4 text-sm text-white font-mono">{formatCurrency(shipment.value_inr) || '-'}</td>
                                        <td className="py-4 text-right">
                                            <span className={`px-2 py-1 ${shipment.is_verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} text-[10px] font-bold rounded uppercase tracking-widest`}>
                                                {shipment.is_verified ? '✓ Verified' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ADD SHIPMENT MODAL */}
            {showShipmentModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white text-lg font-serif mb-6 flex items-center gap-2">
                            <span>📦</span> Log New Shipment
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Destination Country *</label>
                                <input
                                    type="text"
                                    value={newShipment.destination_country}
                                    onChange={(e) => setNewShipment({ ...newShipment, destination_country: e.target.value })}
                                    placeholder="e.g., USA, UAE, Germany"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Shipment Date *</label>
                                <input
                                    type="date"
                                    value={newShipment.shipment_date}
                                    onChange={(e) => setNewShipment({ ...newShipment, shipment_date: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Goods/Product Type</label>
                                <input
                                    type="text"
                                    value={newShipment.goods_type}
                                    onChange={(e) => setNewShipment({ ...newShipment, goods_type: e.target.value })}
                                    placeholder="e.g., Cotton Yarn, Textiles"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Value (INR)</label>
                                <input
                                    type="number"
                                    value={newShipment.value_inr}
                                    onChange={(e) => setNewShipment({ ...newShipment, value_inr: e.target.value })}
                                    placeholder="e.g., 500000"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowShipmentModal(false)}
                                className="flex-1 px-4 py-3 border border-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddShipment}
                                disabled={addingShipment || !newShipment.destination_country || !newShipment.shipment_date}
                                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition"
                            >
                                {addingShipment ? 'Logging...' : 'Log Shipment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TRADE CARD MINI */}
            <div className="bg-gradient-to-r from-[#080808] to-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🪪</span>
                    </div>
                    <div>
                        <h3 className="text-white font-serif text-lg">Trade Card</h3>
                        <p className="text-slate-500 text-xs">Verified digital identity for global trade</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-white font-mono text-sm">{tradeCard?.card_id || 'HT-XXXX-XX'}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">Card ID</div>
                    </div>
                    <button className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 rounded-lg transition">
                        View Card
                    </button>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-white text-xl font-serif mb-6 flex items-center gap-2">
                            <span>✏️</span> Edit Profile
                        </h3>

                        <div className="space-y-5">
                            {/* Company Name */}
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Company Name</label>
                                <input
                                    type="text"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>

                            {/* Established Year */}
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Established Year</label>
                                <input
                                    type="number"
                                    value={formData.established_year}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (val.length <= 4) setFormData({ ...formData, established_year: val })
                                    }}
                                    placeholder="e.g., 2012"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>

                            {/* Net Worth */}
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Net Worth (in Crores)</label>
                                <input
                                    type="number"
                                    value={formData.net_worth ? formData.net_worth / 10000000 : ''}
                                    onChange={(e) => setFormData({ ...formData, net_worth: e.target.value ? parseFloat(e.target.value) * 10000000 : '' })}
                                    placeholder="e.g., 12 (for ₹12 Cr)"
                                    step="0.1"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>

                            {/* Trade Preference */}
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Trade Preference</label>
                                <select
                                    value={formData.trade_preference}
                                    onChange={(e) => setFormData({ ...formData, trade_preference: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                >
                                    <option value="both">Global & Domestic</option>
                                    <option value="global">Global Only</option>
                                    <option value="domestic">Domestic Only</option>
                                </select>
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="e.g., Mumbai"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        placeholder="e.g., Maharashtra"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* About / Bio */}
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">About Company</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    placeholder="Describe your company, expertise, and export capabilities..."
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none resize-none"
                                />
                            </div>

                            {/* Export Products */}
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Export Products</label>
                                <input
                                    type="text"
                                    value={formData.export_products}
                                    onChange={(e) => setFormData({ ...formData, export_products: e.target.value })}
                                    placeholder="e.g., Cotton Yarn, Textiles, Fabrics"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>

                            {/* Target Markets */}
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Export Markets</label>
                                <input
                                    type="text"
                                    value={formData.target_markets}
                                    onChange={(e) => setFormData({ ...formData, target_markets: e.target.value })}
                                    placeholder="e.g., USA, UK, UAE, Germany"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 px-4 py-3 border border-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// 8. DEMAND SIGNALS: BUYER DEMAND MARKETPLACE (Real Data)
function DemandSignalsSection({ plan, userId, exporterProfile, tradeCard }) {
    const [filters, setFilters] = useState({
        industry: '',
        category: '',
        region: '',
        moq: '',
        compliance: ''
    })
    const [demandSignals, setDemandSignals] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(null)
    const [submitted, setSubmitted] = useState([])

    useEffect(() => {
        loadDemandSignals()
    }, [filters])

    const loadDemandSignals = async () => {
        setLoading(true)
        const result = await htAPI.getDemandSignals(filters)
        if (result.success) {
            // Map database columns to display format
            const formattedSignals = result.signals.map(signal => ({
                id: signal.id,
                buyerType: signal.buyer_type?.charAt(0).toUpperCase() + signal.buyer_type?.slice(1) || 'Buyer',
                region: signal.region,
                industry: signal.industry,
                category: signal.category,
                requirement: signal.requirement,
                moqNeeded: signal.moq_needed,
                frequency: signal.frequency,
                compliance: signal.compliance_required || [],
                verified: signal.is_verified,
                posted: getTimeAgo(signal.created_at)
            }))
            setDemandSignals(formattedSignals)
        }
        setLoading(false)
    }

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Recently'
        const now = new Date()
        const date = new Date(dateString)
        const diffMs = now - date
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHrs / 24)

        if (diffHrs < 1) return 'Just now'
        if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    }

    const handleSubmitInterest = async (signalId) => {
        if (!exporterProfile?.id || !userId) {
            console.log('No exporter profile found')
            return
        }
        setSubmitting(signalId)
        const result = await htAPI.submitSupplyInterest(
            exporterProfile.id,
            signalId,
            tradeCard?.id || null,
            'Interested in this requirement'
        )
        if (result.success) {
            setSubmitted([...submitted, signalId])
        }
        setSubmitting(null)
    }

    // Fallback mock data if database is empty
    const displaySignals = demandSignals.length > 0 ? demandSignals : [
        { id: 1, buyerType: 'Importer', region: 'Middle East', industry: 'Textiles', category: 'Yarn', requirement: 'Cotton Yarn 40s', moqNeeded: '1–2 MT', frequency: 'Monthly', compliance: ['GST', 'IEC'], verified: true, posted: '2 hours ago' },
        { id: 2, buyerType: 'Distributor', region: 'European Union', industry: 'Textiles', category: 'Fabric', requirement: 'Knitted Cotton Fabric', moqNeeded: '500–1000 Meters', frequency: 'Bi-Weekly', compliance: ['GST', 'IEC', 'ISO'], verified: true, posted: '5 hours ago' },
        { id: 3, buyerType: 'Brand', region: 'North America', industry: 'Apparel', category: 'Finished Goods', requirement: 'T-Shirts (Cotton Blend)', moqNeeded: '5000–10000 Pcs', frequency: 'Quarterly', compliance: ['GST', 'IEC', 'WRAP'], verified: true, posted: '1 day ago' },
        { id: 4, buyerType: 'Importer', region: 'South Asia', industry: 'Home Textiles', category: 'Bedding', requirement: 'Cotton Bed Sheets 300TC', moqNeeded: '2000–5000 Sets', frequency: 'Monthly', compliance: ['GST', 'IEC'], verified: false, posted: '2 days ago' },
        { id: 5, buyerType: 'Wholesaler', region: 'Africa', industry: 'Textiles', category: 'Yarn', requirement: 'Polyester Yarn 150D', moqNeeded: '3–5 MT', frequency: 'Monthly', compliance: ['GST', 'IEC'], verified: true, posted: '3 days ago' }
    ]

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl text-white font-serif flex items-center gap-3">
                        <span className="text-2xl">📡</span>
                        Demand Signals
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">Anonymized buyer requirements. Submit your supply interest.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">{displaySignals.length} Active Signals</span>
                </div>
            </div>

            {/* FILTERS */}
            <div className="bg-[#080808] border border-white/10 rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                        <label className="block text-[9px] text-slate-500 uppercase tracking-widest mb-2">Industry</label>
                        <select
                            value={filters.industry}
                            onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/30 outline-none transition appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-black">All Industries</option>
                            <option value="textiles" className="bg-black">Textiles</option>
                            <option value="apparel" className="bg-black">Apparel</option>
                            <option value="home-textiles" className="bg-black">Home Textiles</option>
                            <option value="agriculture" className="bg-black">Agriculture</option>
                            <option value="manufacturing" className="bg-black">Manufacturing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[9px] text-slate-500 uppercase tracking-widest mb-2">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/30 outline-none transition appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-black">All Categories</option>
                            <option value="yarn" className="bg-black">Yarn</option>
                            <option value="fabric" className="bg-black">Fabric</option>
                            <option value="finished-goods" className="bg-black">Finished Goods</option>
                            <option value="bedding" className="bg-black">Bedding</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[9px] text-slate-500 uppercase tracking-widest mb-2">Region</label>
                        <select
                            value={filters.region}
                            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/30 outline-none transition appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-black">All Regions</option>
                            <option value="middle-east" className="bg-black">Middle East</option>
                            <option value="eu" className="bg-black">European Union</option>
                            <option value="north-america" className="bg-black">North America</option>
                            <option value="south-asia" className="bg-black">South Asia</option>
                            <option value="africa" className="bg-black">Africa</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[9px] text-slate-500 uppercase tracking-widest mb-2">MOQ Range</label>
                        <select
                            value={filters.moq}
                            onChange={(e) => setFilters({ ...filters, moq: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/30 outline-none transition appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-black">Any MOQ</option>
                            <option value="small" className="bg-black">Small ({"<"}1 MT)</option>
                            <option value="medium" className="bg-black">Medium (1–5 MT)</option>
                            <option value="large" className="bg-black">Large ({">"}5 MT)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[9px] text-slate-500 uppercase tracking-widest mb-2">Compliance</label>
                        <select
                            value={filters.compliance}
                            onChange={(e) => setFilters({ ...filters, compliance: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/30 outline-none transition appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-black">Any</option>
                            <option value="gst" className="bg-black">GST Required</option>
                            <option value="iec" className="bg-black">IEC Required</option>
                            <option value="iso" className="bg-black">ISO Required</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* DEMAND CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displaySignals.map((signal) => (
                    <div key={signal.id} className="bg-[#080808] border border-white/10 rounded-xl p-6 hover:border-white/20 transition group relative overflow-hidden">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition"></div>

                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                                        <span className="text-lg">
                                            {signal.buyerType === 'Importer' ? '🌍' :
                                                signal.buyerType === 'Distributor' ? '🏪' :
                                                    signal.buyerType === 'Brand' ? '🏷️' : '📦'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium">{signal.buyerType}</div>
                                        <div className="text-[10px] text-slate-500">{signal.region}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {signal.verified && (
                                        <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                                            ✓ Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Requirement */}
                            <div className="mb-4">
                                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Requirement</div>
                                <div className="text-white font-medium">{signal.requirement}</div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-4 py-4 border-t border-b border-white/5">
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Industry</div>
                                    <div className="text-xs text-slate-300">{signal.industry}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">MOQ Needed</div>
                                    <div className="text-xs text-white font-mono">{signal.moqNeeded}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Frequency</div>
                                    <div className="text-xs text-slate-300">{signal.frequency}</div>
                                </div>
                            </div>

                            {/* Compliance Tags */}
                            <div className="mb-4">
                                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Compliance Required</div>
                                <div className="flex flex-wrap gap-1">
                                    {signal.compliance.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-slate-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Contact & CTA */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600">🔒</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Contact Locked</span>
                                </div>
                                <button
                                    onClick={() => handleSubmitInterest(signal.id)}
                                    disabled={submitting === signal.id || submitted.includes(signal.id)}
                                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition ${submitted.includes(signal.id)
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-white text-black hover:bg-slate-200'
                                        } disabled:opacity-50`}
                                >
                                    {submitting === signal.id ? 'Submitting...' :
                                        submitted.includes(signal.id) ? '✓ Interest Sent' : 'Submit Interest'}
                                </button>
                            </div>

                            {/* Posted time */}
                            <div className="mt-3 text-[10px] text-slate-600 text-right">
                                Posted {signal.posted}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* INFO CARD */}
            <div className="bg-gradient-to-r from-blue-900/10 to-transparent border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">💡</span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-2">How Demand Signals Work</h3>
                        <ul className="text-xs text-slate-400 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">1.</span>
                                <span>Browse anonymized buyer requirements matching your capabilities</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">2.</span>
                                <span>Click "Submit Interest" to send your Trade Card, Inventory & Trust Score to the buyer</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">3.</span>
                                <span>If accepted, buyer unlocks your contact (based on your plan)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">4.</span>
                                <span>No cold outreach. No spam. Power stays balanced.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
