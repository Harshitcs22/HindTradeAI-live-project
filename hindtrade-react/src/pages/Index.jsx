import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Index({ session }) {
    const [nexusModalOpen, setNexusModalOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (session) {
            navigate('/dashboard')
        }
    }, [session, navigate])

    const openNexusChat = () => {
        setNexusModalOpen(true)
        document.body.style.overflow = 'hidden'
    }

    const closeNexusChat = () => {
        setNexusModalOpen(false)
        document.body.style.overflow = 'auto'
    }

    const scrollToSection = (id) => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-blue-600/30 overflow-x-hidden">

            {/* AMBIENT LIGHTING (Deep Royal Blue) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-blue-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-indigo-900/5 rounded-full blur-[150px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
            </div>

            {/* Nexus Chat Modal */}
            {nexusModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" onClick={(e) => e.target === e.currentTarget && closeNexusChat()}>
                    <div className="w-full max-w-4xl h-[80vh] bg-[#050505] border border-blue-900/30 rounded-sm overflow-hidden relative shadow-2xl ring-1 ring-blue-500/10">
                        <button
                            onClick={closeNexusChat}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black border border-blue-900/50 text-blue-500 hover:text-white transition z-10"
                        >
                            ×
                        </button>
                        <iframe
                            className="w-full h-full border-0 bg-[#050505]"
                            src="https://app.relevanceai.com/agents/d7b62b/3fdb8425-c0a5-4909-9513-21d07c9f8f99/a3f0bb17-9cbf-4d17-88cc-c1a981deabdd/share?hide_tool_steps=false&hide_file_uploads=false&hide_conversation_list=false&bubble_style=agent&primary_color=%232563EB&bubble_icon=pd%2Fchat&input_placeholder_text=Ask+Trade+AI...&hide_logo=false&hide_description=false"
                            allow="microphone"
                        ></iframe>
                    </div>
                </div>
            )}

            {/* NAVBAR - Floating Glass */}
            <nav className="sticky top-4 z-50 px-4">
                <div className="max-w-7xl mx-auto h-20 flex items-center justify-between bg-black/70 backdrop-blur-xl border border-white/5 rounded-2xl px-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-gradient-to-b from-blue-600 to-indigo-800 rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                            H
                        </div>
                        <span className="text-lg tracking-[0.2em] font-light text-white uppercase">HindTrade</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {['Mission', 'Infrastructure', 'Blueprint', 'Membership'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item.toLowerCase())}
                                className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-[0.2em] transition"
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/auth" className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-[0.2em] transition">Login</Link>
                        <Link to="/auth" className="px-6 py-2.5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-50 transition rounded-lg">
                            Get Access
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-32 overflow-hidden z-10">
                <div className="max-w-7xl mx-auto px-6 text-center">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-3 px-4 py-2 border border-blue-900/30 rounded-full bg-blue-950/10 mb-10 backdrop-blur-md mx-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.25em]">Verified Trade Infrastructure</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-8xl font-light text-white mb-8 tracking-tight leading-[1.1]">
                        The <span className="font-serif italic text-blue-500">Operating System</span> <br />
                        for Indian Trade.
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-20 leading-relaxed font-light">
                        A unified identity layer for SMEs. <br />
                        <span className="text-white">Public Visibility. Locked Contacts. Verified Trust.</span>
                    </p>

                    {/* THE ULTRA-LUXURY CARD */}
                    <div className="relative w-full max-w-[320px] md:max-w-[520px] aspect-[1.586/1] mx-auto perspective-1000 mb-12 md:mb-20 group">
                        {/* Champagne/Gold Glow specific to Card */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-amber-200/10 rounded-full blur-[80px] opacity-100 transition duration-1000"></div>

                        <div className="relative h-full w-full bg-[#030303] rounded-2xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] overflow-hidden flex flex-col backdrop-blur-2xl transform transition-transform duration-1000 group-hover:rotate-x-2 group-hover:scale-[1.02]">
                            {/* Texture */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>

                            {/* Card Content */}
                            <div className="relative z-10 p-4 md:p-8 flex flex-col h-full justify-between">

                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md">
                                            <span className="text-white font-serif text-lg">H</span>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-amber-200/80 uppercase tracking-[0.2em] mb-0.5">Verified Exporter</div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                                                <div className="text-[9px] text-white/60 font-mono">LIVE STATUS</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-2xl grayscale opacity-60">🇮🇳</div>
                                </div>

                                {/* Main Data */}
                                <div>
                                    <h2 className="text-lg md:text-2xl text-white tracking-widest uppercase font-light mb-4 md:mb-6">Himrock Exports</h2>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2 md:gap-4 border-t border-white/10 pt-3 md:pt-4 mb-3 md:mb-4">
                                        <div>
                                            <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Shipments</div>
                                            <div className="text-sm text-white font-mono">120+</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Experience</div>
                                            <div className="text-sm text-white font-mono">12 Yrs</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Net Worth</div>
                                            <div className="text-sm text-amber-200 font-mono">₹12 Cr</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 md:gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-slate-400">GST REGISTERED</span>
                                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-slate-400">IEC HOLDER</span>
                                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-slate-400">CA AUDITED</span>
                                    </div>
                                </div>

                                {/* Footer Strip */}
                                <div className="flex justify-between items-end">
                                    <div className="font-mono text-[9px] text-amber-500/60 tracking-widest">
                                        UDIN: 24059182AABCV1928 • VERIFIED
                                    </div>
                                    <button className="px-3 py-1 bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-slate-200 transition rounded-sm">
                                        Portfolio ↗
                                    </button>
                                </div>
                            </div>

                            {/* Holographic Sheen */}
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-5 animate-shine" />
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/auth" className="px-12 py-4 bg-blue-700 text-white font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-blue-600 transition shadow-[0_0_40px_rgba(37,99,235,0.4)] rounded-lg">
                            Get Trade Card
                        </Link>
                        <button onClick={() => scrollToSection('mission')} className="px-12 py-4 bg-transparent border border-white/10 text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em] hover:text-white hover:border-white transition rounded-lg">
                            See The Problem
                        </button>
                    </div>
                </div>
            </section>

            {/* PROBLEM SECTION: "THE TRUST GAP" */}
            <section id="mission" className="py-32 border-t border-white/5 bg-[#030303]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="text-red-500 font-bold text-[10px] uppercase tracking-[0.25em] mb-4 block">The Problem</span>
                        <h2 className="text-4xl font-serif text-white mb-6">Why Indian SMEs Struggle Globally</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
                            International buyers don't trust WhatsApp screenshots. Domestic trade is cluttered with unverified leads.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Identity Crisis", desc: "No verifiable digital proof of business existence beyond PDFs." },
                            { title: "Manual Chaos", desc: "Invoices, GST docs, and compliance handled manually on paper." },
                            { title: "Hidden Visibility", desc: "Great products remain invisible to high-value buyers due to poor presentation." }
                        ].map((item, i) => (
                            <div key={i} className="group p-10 bg-[#050505] border border-white/5 rounded-xl hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(220,38,38,0.1)] transition-all duration-500">
                                <h3 className="text-xl text-white mb-4 font-serif">{item.title}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INFRASTRUCTURE GRID: "SHOPIFY EFFECTS" */}
            <section id="infrastructure" className="py-16 md:py-32 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-20 gap-4">
                        <div className="text-center md:text-left w-full md:w-auto">
                            <span className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.25em] mb-4 block">The Solution</span>
                            <h2 className="text-2xl md:text-4xl font-serif text-white">Core Infrastructure</h2>
                        </div>
                        <p className="text-slate-500 text-center md:text-right text-xs max-w-xs mx-auto md:mx-0 leading-relaxed">
                            A complete operating system to manage identity, compliance, and growth.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                        {[
                            { icon: "🪪", title: "Trade Card", desc: "Your cryptographic business passport. Verified by CAs." },
                            { icon: "🤖", title: "AI Trade Guidance", desc: "24/7 AI Copilot for HSN codes & compliance queries." },
                            { icon: "📄", title: "Auto Doc Gen", desc: "Generate GST Invoices & Packing Lists instantly." },
                            { icon: "👨‍⚖️", title: "Expert Network", desc: "Direct access to CAs & CHAs for audits." },
                            { icon: "🎨", title: "Student Designers", desc: "Hire talent to build your digital portfolio." },
                            { icon: "🌍", title: "Connectivity", desc: "Logistics linking for seamless exports." }
                        ].map((item, i) => (
                            <div key={i} className="group bg-[#080808] border border-white/10 p-4 md:p-8 rounded-xl md:rounded-2xl hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] hover:border-white/30 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative z-10 text-center md:text-left">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-full md:rounded-xl flex items-center justify-center mb-3 md:mb-6 group-hover:bg-white/10 transition mx-auto md:mx-0">
                                        <span className="text-xl md:text-2xl">{item.icon}</span>
                                    </div>
                                    <h3 className="text-sm md:text-lg text-white mb-1 md:mb-2 font-serif">{item.title}</h3>
                                    <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed hidden md:block">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* THE BLUEPRINT: "WORKFLOW" */}
            <section id="blueprint" className="py-32 border-t border-white/5 bg-[#030303]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <span className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.25em] mb-4 block">Workflow</span>
                        <h2 className="text-4xl font-serif text-white">The Blueprint</h2>
                    </div>

                    <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-900/50 to-transparent z-0"></div>

                        {[
                            { step: "01", title: "Initialize", highlight: "Free", desc: "Register. Get your Mini-Profile and Basic Trade Card instantly." },
                            { step: "02", title: "Validate", highlight: "Verify", desc: "Hire a CA from the network. Get your Verified Badge and Net Worth Certificate." },
                            { step: "03", title: "Showcase", highlight: "Build", desc: "Open Student Access. Build a professional product webpage linked to your card." },
                            { step: "04", title: "Execute", highlight: "Scale", desc: "Connect with CHAs. Share your verified identity. Start global trade." }
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 bg-[#050505] border border-white/10 p-8 pt-12 rounded-xl group hover:-translate-y-2 hover:shadow-2xl transition duration-500">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black border border-blue-900 rounded-full flex items-center justify-center text-[10px] text-blue-500 font-bold group-hover:bg-blue-600 group-hover:text-white transition">
                                    {i + 1}
                                </div>
                                <div className="text-blue-500 text-[9px] font-bold uppercase tracking-widest mb-2">{item.highlight}</div>
                                <h3 className="text-xl text-white mb-4">{item.title}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICE MARKETPLACE (CA + CHA) */}
            <section id="marketplace" className="py-32 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-light text-white uppercase tracking-widest mb-4">Service Marketplace</h2>
                        <p className="text-slate-500 text-xs tracking-[0.1em]">Connect with verified professionals.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* CA CARD - Enhanced */}
                        <div className="group bg-[#080808] border border-white/10 p-8 hover:border-white/30 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] hover:-translate-y-2 transition-all duration-500 rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition duration-500 text-white">↗</div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition">
                                    <span className="text-2xl">👨‍⚖️</span>
                                </div>
                                <h3 className="text-lg text-white font-serif mb-3">Chartered Accountants</h3>
                                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                                    Hire CAs for specific tasks without high retainers.
                                </p>
                                <ul className="space-y-3 text-xs text-slate-400 mb-6 border-t border-white/5 pt-5">
                                    <li className="flex justify-between"><span>• Trade Doc Signing</span> <span className="text-white/70">On-Demand</span></li>
                                    <li className="flex justify-between"><span>• Net Worth Certificates</span> <span className="text-white/70">Fixed Fee</span></li>
                                    <li className="flex justify-between"><span>• Verification Audits</span> <span className="text-white/70">Priority</span></li>
                                </ul>
                                <button className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white transition group-hover:text-white">Access Network →</button>
                            </div>
                        </div>

                        {/* CHA CARD */}
                        <div className="group bg-[#080808] border border-white/10 p-8 hover:border-white/30 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] hover:-translate-y-2 transition-all duration-500 rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition duration-500 text-white">↗</div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition">
                                    <span className="text-2xl">🚢</span>
                                </div>
                                <h3 className="text-lg text-white font-serif mb-3">CHA Network</h3>
                                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                                    Connect with verified Customs House Agents.
                                </p>
                                <ul className="space-y-3 text-xs text-slate-400 mb-6 border-t border-white/5 pt-5">
                                    <li className="flex justify-between"><span>• Verified CHA Leads</span> <span className="text-white/70">Direct Contact</span></li>
                                    <li className="flex justify-between"><span>• Export Clearance</span> <span className="text-white/70">Expert Support</span></li>
                                    <li className="flex justify-between"><span>• Port Documentation</span> <span className="text-white/70">Assistance</span></li>
                                </ul>
                                <button className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white transition group-hover:text-white">Contact CHA →</button>
                            </div>
                        </div>

                        {/* STUDENT DESIGNERS CARD */}
                        <div className="group bg-[#080808] border border-white/10 p-8 hover:border-white/30 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] hover:-translate-y-2 transition-all duration-500 rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition duration-500 text-white">↗</div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition">
                                    <span className="text-2xl">🎨</span>
                                </div>
                                <h3 className="text-lg text-white font-serif mb-3">Student Designers</h3>
                                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                                    NIT/IIT students build your portfolio & webpage.
                                </p>
                                <ul className="space-y-3 text-xs text-slate-400 mb-6 border-t border-white/5 pt-5">
                                    <li className="flex justify-between"><span>• Company Webpage</span> <span className="text-white/70">₹500</span></li>
                                    <li className="flex justify-between"><span>• Product Portfolio</span> <span className="text-white/70">Custom</span></li>
                                    <li className="flex justify-between"><span>• Trade Card Linking</span> <span className="text-white/70">Included</span></li>
                                </ul>
                                <button className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white transition group-hover:text-white">Hire Designer →</button>
                            </div>
                        </div>

                        {/* AI MENTOR CARD */}
                        <div className="group bg-[#080808] border border-white/10 p-8 hover:border-white/30 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] hover:-translate-y-2 transition-all duration-500 rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition duration-500 text-white">↗</div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition">
                                    <span className="text-2xl">🤖</span>
                                </div>
                                <h3 className="text-lg text-white font-serif mb-3">AI Trade Mentor</h3>
                                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                                    24/7 AI guidance for global trade compliance.
                                </p>
                                <ul className="space-y-3 text-xs text-slate-400 mb-6 border-t border-white/5 pt-5">
                                    <li className="flex justify-between"><span>• HSN Code Lookup</span> <span className="text-white/70">Instant</span></li>
                                    <li className="flex justify-between"><span>• Shipping Ports & Routes</span> <span className="text-white/70">Global</span></li>
                                    <li className="flex justify-between"><span>• Required Documents</span> <span className="text-white/70">Checklist</span></li>
                                </ul>
                                <button className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white transition group-hover:text-white">Ask AI Mentor →</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DETAILED PRICING (10+ POINTS) */}
            <section id="membership" className="py-32 border-t border-white/5 bg-[#030303]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <span className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.25em] mb-4 block">Membership</span>
                        <h2 className="text-4xl font-serif text-white">Select Your Tier</h2>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-6xl mx-auto">

                        {/* Starter */}
                        <div className="border border-white/10 p-8 bg-[#050505] rounded-xl hover:border-white/20 transition">
                            <div className="text-lg text-white font-serif mb-2">Basic</div>
                            <div className="text-4xl font-light text-white mb-6">₹0</div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-8 pb-8 border-b border-white/5">
                                Trade Card Creation is Free.
                            </p>
                            <Link to="/auth" className="block w-full py-4 border border-white/20 text-white text-center text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition rounded-lg">
                                Start
                            </Link>
                        </div>

                        {/* Verified */}
                        <div className="border border-blue-500/40 p-8 bg-[#0a0a0a] rounded-xl relative shadow-[0_0_30px_rgba(37,99,235,0.1)] hover:-translate-y-1 transition duration-500">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold uppercase px-3 py-1 tracking-widest rounded-bl-lg rounded-tr-lg">Required for Badge</div>
                            <div className="text-lg text-white font-serif mb-2">Verified</div>
                            <div className="text-4xl font-light text-blue-400 mb-6">₹5,000<span className="text-sm text-slate-600">/yr</span></div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-8 pb-8 border-b border-white/5">
                                For Active Trading.
                            </p>
                            <Link to="/auth" className="block w-full py-4 bg-blue-600 text-white text-center text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-500 transition rounded-lg">
                                Get Verified
                            </Link>
                        </div>

                        {/* Scale */}
                        <div className="border border-white/10 p-8 bg-[#050505] rounded-xl hover:border-white/20 transition">
                            <div className="text-lg text-white font-serif mb-2">Scale</div>
                            <div className="text-4xl font-light text-white mb-6">₹10,000<span className="text-sm text-slate-600">/yr</span></div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-8 pb-8 border-b border-white/5">
                                For Market Leaders.
                            </p>
                            <Link to="/auth" className="block w-full py-4 border border-white/20 text-white text-center text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition rounded-lg">
                                Upgrade
                            </Link>
                        </div>
                    </div>

                    {/* DETAILED COMPARISON TABLE (10 POINTS) */}
                    <div className="max-w-5xl mx-auto overflow-x-auto bg-[#050505] border border-white/5 rounded-2xl p-8">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="py-6 pl-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] w-1/3">Feature Breakdown</th>
                                    <th className="py-6 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Basic (Free)</th>
                                    <th className="py-6 text-center text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Verified</th>
                                    <th className="py-6 text-center text-[10px] font-bold text-white uppercase tracking-[0.2em]">Scale</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-slate-400">
                                {[
                                    { name: "Basic Trade Card", basic: true, ver: true, scale: true },
                                    { name: "Public Inventory Listing", basic: true, ver: true, scale: true },
                                    { name: "Receive Trade Requests", basic: true, ver: true, scale: true },
                                    { name: "Access Student Designers (₹500)", basic: true, ver: true, scale: true },
                                    { name: "Verified Badge (CA Audited)", basic: false, ver: true, scale: true },
                                    { name: "Unlock Buyer Contacts", basic: false, ver: true, scale: true },
                                    { name: "Access CA Marketplace", basic: false, ver: true, scale: true },
                                    { name: "Document Vault Storage", basic: false, ver: true, scale: true },
                                    { name: "Net Worth Certificate", basic: false, ver: false, scale: true },
                                    { name: "Access CHA Leads", basic: false, ver: false, scale: true },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition group">
                                        <td className="py-5 pl-4 text-white font-light tracking-wide group-hover:text-blue-400 transition">{row.name}</td>
                                        <td className="text-center text-slate-600">{row.basic ? "●" : "—"}</td>
                                        <td className="text-center text-blue-500">{row.ver ? "●" : "—"}</td>
                                        <td className="text-center text-white">{row.scale ? "●" : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* CONCIERGE ADD-ON BOX */}
                    <div className="max-w-4xl mx-auto mt-20 bg-blue-900/5 border border-dashed border-blue-500/30 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-white text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                Concierge Web Design
                            </h3>
                            <p className="text-slate-500 text-xs max-w-md leading-relaxed">
                                Optional add-on for all members. Hire a vetted engineering student to build a professional product showcase page linked to your Trade Card.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl text-white font-light mb-1">₹500</div>
                            <div className="text-[10px] text-blue-400 uppercase tracking-widest">One-time Fee</div>
                        </div>
                    </div>

                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-20 border-t border-white/5 bg-black text-[10px] text-slate-600 uppercase tracking-widest">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>© 2026 HindTradeAI. Built for Indian Trade.</div>
                    <div className="flex items-center gap-8">
                        <a href="#" className="hover:text-white transition">Privacy</a>
                        <a href="#" className="hover:text-white transition">Terms</a>
                        <button onClick={openNexusChat} className="text-blue-500 hover:text-white transition">
                            Concierge
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Index
