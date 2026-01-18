import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase, htAPI } from '../config/supabase'
import ConciergeModal from '../components/ConciergeModal'

function Auth() {
    const [activeTab, setActiveTab] = useState('login')
    const [role, setRole] = useState('exporter')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [showConcierge, setShowConcierge] = useState(false)
    const [currentUserId, setCurrentUserId] = useState(null)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Login form state
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    // Signup form state
    const [fullName, setFullName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [phone, setPhone] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [businessCategory, setBusinessCategory] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        const action = searchParams.get('action')
        if (action === 'register') {
            setActiveTab('signup')
        }
    }, [searchParams])

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword
            })

            if (authError) throw authError

            // Check if profile is complete
            const profileResult = await htAPI.getUserProfile(data.user.id)

            if (profileResult.success && profileResult.profile?.profile_complete) {
                // Profile complete → go to dashboard
                navigate('/dashboard')
            } else {
                // Profile incomplete → show concierge modal
                setCurrentUserId(data.user.id)
                setShowConcierge(true)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleConciergeComplete = () => {
        setShowConcierge(false)
        navigate('/dashboard')
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        company_name: companyName,
                        phone: phone,
                        role: role,
                        city: city,
                        state: state,
                        business_category: businessCategory
                    }
                }
            })

            if (authError) throw authError

            setSuccess('✅ Signup successful! Redirecting...')

            setTimeout(() => {
                navigate('/dashboard')
            }, 2000)

        } catch (err) {
            console.error('Signup error:', err)
            setError('❌ Error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const selectRole = (selectedRole) => {
        setRole(selectedRole)
    }

    const roles = [
        { id: 'buyer', icon: '🛒', label: 'Buyer', desc: 'Source products globally' },
        { id: 'exporter', icon: '📦', label: 'Exporter', desc: 'Sell to global markets' },
        { id: 'ca', icon: '👨‍⚖️', label: 'CA', desc: 'Chartered Accountant' },
        { id: 'cha', icon: '🚢', label: 'CHA', desc: 'Customs House Agent' }
    ]

    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-blue-600/30 overflow-x-hidden">

            {/* CONCIERGE ONBOARDING MODAL */}
            {showConcierge && (
                <ConciergeModal userId={currentUserId} onComplete={handleConciergeComplete} />
            )}

            {/* AMBIENT LIGHTING */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-[150px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
            </div>

            {/* FLOATING NAVBAR */}
            <nav className="sticky top-4 z-50 px-4">
                <div className="max-w-4xl mx-auto h-16 flex items-center justify-between bg-black/70 backdrop-blur-xl border border-white/5 rounded-2xl px-6 shadow-2xl">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-b from-blue-600 to-indigo-800 rounded-lg flex items-center justify-center text-white font-serif font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                            H
                        </div>
                        <span className="text-base tracking-[0.2em] font-light text-white uppercase">HindTrade</span>
                    </Link>
                    <Link to="/" className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-[0.2em] transition">
                        ← Back to Home
                    </Link>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] py-12 px-4">
                <div className="w-full max-w-md">

                    {/* CARD CONTAINER */}
                    <div className="bg-[#080808] border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

                        <div className="relative z-10">
                            {/* HEADER */}
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-gradient-to-b from-blue-600 to-indigo-800 rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-[0_0_30px_rgba(37,99,235,0.4)] mx-auto mb-4">
                                    H
                                </div>
                                <h2 className="text-2xl font-serif text-white mb-2">HindTrade Access</h2>
                                <p className="text-slate-500 text-xs tracking-[0.15em] uppercase">Global Trade Operating System</p>
                            </div>

                            {/* TABS */}
                            <div className="flex border border-white/10 rounded-xl mb-8 p-1 bg-black/50">
                                <button
                                    onClick={() => setActiveTab('login')}
                                    className={`w-1/2 py-3 font-bold text-[10px] uppercase tracking-[0.2em] rounded-lg transition ${activeTab === 'login'
                                        ? 'bg-white text-black'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setActiveTab('signup')}
                                    className={`w-1/2 py-3 font-bold text-[10px] uppercase tracking-[0.2em] rounded-lg transition ${activeTab === 'signup'
                                        ? 'bg-white text-black'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Register
                                </button>
                            </div>

                            {/* LOGIN FORM */}
                            {activeTab === 'login' && (
                                <form className="space-y-5" onSubmit={handleLogin}>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 focus:shadow-[0_0_20px_rgba(255,255,255,0.05)] outline-none transition"
                                            placeholder="you@company.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 focus:shadow-[0_0_20px_rgba(255,255,255,0.05)] outline-none transition"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-white text-black font-bold text-[10px] uppercase tracking-[0.25em] rounded-xl transition hover:bg-slate-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
                                    >
                                        {loading ? 'Logging in...' : 'Login to Dashboard'}
                                    </button>
                                </form>
                            )}

                            {/* SIGNUP FORM */}
                            {activeTab === 'signup' && (
                                <form className="space-y-5" onSubmit={handleSignup}>

                                    {/* ROLE SELECTION - 4 Options */}
                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-3">I am a</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {roles.map((r) => (
                                                <button
                                                    key={r.id}
                                                    type="button"
                                                    onClick={() => selectRole(r.id)}
                                                    className={`group p-3 rounded-xl border text-center transition-all duration-300 ${role === r.id
                                                        ? 'border-white/40 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                                        : 'border-white/10 bg-black/50 hover:border-white/20 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <div className="text-xl mb-1">{r.icon}</div>
                                                    <div className={`text-[10px] font-bold uppercase tracking-wide ${role === r.id ? 'text-white' : 'text-slate-400'}`}>
                                                        {r.label}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 outline-none transition"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">
                                            {role === 'ca' || role === 'cha' ? 'Firm Name' : 'Company Name'}
                                        </label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 outline-none transition"
                                            placeholder={role === 'ca' ? 'CA Sharma & Associates' : role === 'cha' ? 'Express Clearing Agency' : 'Himrock Exports Pvt Ltd'}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 outline-none transition"
                                            placeholder="+91 9876543210"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">City</label>
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 outline-none transition"
                                                placeholder="Mumbai"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">State</label>
                                            <input
                                                type="text"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 outline-none transition"
                                                placeholder="Maharashtra"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {(role === 'exporter' || role === 'buyer') && (
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Business Category</label>
                                            <select
                                                value={businessCategory}
                                                onChange={(e) => setBusinessCategory(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 outline-none transition appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="" className="bg-black">Select Category</option>
                                                <option value="textiles" className="bg-black">Textiles</option>
                                                <option value="agriculture" className="bg-black">Agriculture</option>
                                                <option value="manufacturing" className="bg-black">Manufacturing</option>
                                                <option value="handicrafts" className="bg-black">Handicrafts</option>
                                                <option value="electronics" className="bg-black">Electronics</option>
                                                <option value="chemicals" className="bg-black">Chemicals</option>
                                                <option value="services" className="bg-black">Services</option>
                                                <option value="other" className="bg-black">Other</option>
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 outline-none transition"
                                            placeholder="you@company.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 outline-none transition"
                                            placeholder="Min 6 characters"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-white text-black font-bold text-[10px] uppercase tracking-[0.25em] rounded-xl transition hover:bg-slate-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
                                    >
                                        {loading ? 'Creating Account...' : `Create ${role === 'ca' ? 'CA' : role === 'cha' ? 'CHA' : role === 'buyer' ? 'Buyer' : 'Exporter'} Account`}
                                    </button>
                                </form>
                            )}

                            {/* ERROR/SUCCESS MESSAGES */}
                            {error && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs text-center">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs text-center">
                                    {success}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="text-center mt-6 text-[10px] text-slate-600 uppercase tracking-widest">
                        Secure Trade Infrastructure
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth
