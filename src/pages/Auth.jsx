import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../config/supabase'

function Auth() {
    const [activeTab, setActiveTab] = useState('login')
    const [role, setRole] = useState('exporter')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
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
        // Check URL params for action
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

            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
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

    return (
        <div className="bg-[#02040a] flex items-center justify-center min-h-screen relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10"></div>

            <div className="glass-card glass-card-scrollable p-8 rounded-2xl w-full max-w-md border-blue-500/30 animate-fade-in relative">
                <Link to="/" className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <i className="ri-close-line text-xl"></i>
                </Link>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4">H</div>
                    <h2 className="text-2xl font-serif text-white mb-2">HindTrade Access</h2>
                    <p className="text-gray-400 text-sm">Global Trade Operating System</p>
                </div>

                <div className="flex border-b border-white/10 mb-6">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`w-1/2 pb-2 font-bold text-sm transition ${activeTab === 'login' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`w-1/2 pb-2 font-bold text-sm transition ${activeTab === 'signup' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Register
                    </button>
                </div>

                {/* Login Form */}
                {activeTab === 'login' && (
                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Email</label>
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-blue-500 outline-none transition"
                                placeholder="exporter@company.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Password</label>
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-blue-500 outline-none transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login to Dashboard'}
                        </button>
                    </form>
                )}

                {/* Signup Form */}
                {activeTab === 'signup' && (
                    <form className="space-y-4" onSubmit={handleSignup}>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => selectRole('exporter')}
                                className={`p-2 rounded border text-xs font-bold ${role === 'exporter' ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                Exporter
                            </button>
                            <button
                                type="button"
                                onClick={() => selectRole('ca')}
                                className={`p-2 rounded border text-xs font-bold ${role === 'ca' ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                CA
                            </button>
                            <button
                                type="button"
                                onClick={() => selectRole('cha')}
                                className={`p-2 rounded border text-xs font-bold ${role === 'cha' ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                CHA
                            </button>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Company Name</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                                placeholder="Himrock Exports Pvt Ltd"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Phone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                                placeholder="+91 9876543210"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-gray-400 text-xs uppercase font-bold mb-2">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                                    placeholder="Ludhiana"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs uppercase font-bold mb-2">State</label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                                    placeholder="Punjab"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Business Category</label>
                            <select
                                value={businessCategory}
                                onChange={(e) => setBusinessCategory(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="textiles">Textiles</option>
                                <option value="agriculture">Agriculture</option>
                                <option value="manufacturing">Manufacturing</option>
                                <option value="services">Services</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-white text-blue-900 font-bold rounded-lg transition hover:bg-gray-200 disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Create Trade Account'}
                        </button>
                    </form>
                )}

                {error && <p className="text-red-400 text-xs text-center mt-4">{error}</p>}
                {success && <p className="text-green-400 text-xs text-center mt-4">{success}</p>}
            </div>
        </div>
    )
}

export default Auth
