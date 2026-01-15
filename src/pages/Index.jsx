import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'

function Index({ session }) {
    const [nexusModalOpen, setNexusModalOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        // Redirect logged-in users to dashboard
        if (session) {
            navigate('/dashboard')
        }
    }, [session, navigate])

    // Smooth scroll handler
    const handleSmoothScroll = (e, targetId) => {
        e.preventDefault()
        const target = document.querySelector(targetId)
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // Nexus Chat handlers
    const openNexusChat = () => {
        setNexusModalOpen(true)
        document.body.style.overflow = 'hidden'
    }

    const closeNexusChat = () => {
        setNexusModalOpen(false)
        document.body.style.overflow = 'auto'
    }

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeNexusChat()
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    // Button click handlers
    const handleButtonClick = (text) => {
        if (text.includes('Hire This CA')) {
            alert('CA Marketplace: Coming to your dashboard\nYou can directly message CAs, see rates, hire immediately.')
        } else if (text.includes('CHA Leads')) {
            alert('CHA Network: Direct access to verified CHAs by port\nNhava Sheva • Mumbai • JNPT • Kandla • Cochin')
        } else if (text.includes('Start Free')) {
            alert('Free tier activated!\n✓ Profile created\n✓ 3 Nexus queries/month\n✓ Mentor access\n\nUpgrade to Pro for Trade Card & CA marketplace')
        } else if (text.includes('Schedule Call')) {
            alert('Enterprise support:\nSchedule a call with our team\nWhite-label API • Personal CA • 24/7 support\nContact: enterprise@hindtradeai.io')
        }
    }

    const handleViewProfile = (text) => {
        if (text.includes('View Full Profile')) {
            alert('📊 Profile Details:\n\nHimrock Exports\nLudhiana, Punjab\nTrade Score: 98/100\nShipments: 47\nReputation: Excellent\n\nBuyers can view:\n✓ Trust score\n✓ Shipment history\n✓ CA verification\n✓ Net worth\n✓ Payment record')
        } else if (text.includes('Hire This CA')) {
            alert('💼 CA Ramesh Gupta\n\nSpecialization: Export Financing\nRating: 4.9/5\nVerified: 230+ exports\nSuccess Rate: 95%\n\nServices:\n✓ Document signing (UDIN)\n✓ Financing coordination\n✓ Compliance\n✓ Direct rate: ₹500-1000/doc')
        } else if (text.includes('Get CHA Leads')) {
            alert('🛂 Express Customs Solutions\n\nPort: Nhava Sheva (Primary)\nRating: 4.8/5\nClearances: 1,200+\nAvg Time: 2 hours\n\nServices:\n✓ Customs clearance\n✓ Documentation\n✓ Port coordination\n✓ Duty optimization')
        }
    }

    return (
        <>
            {/* Nexus Modal */}
            <div
                className={`nexus-modal ${nexusModalOpen ? 'active' : ''}`}
                onClick={(e) => e.target === e.currentTarget && closeNexusChat()}
            >
                <div className="nexus-modal-content">
                    <div className="nexus-close" onClick={closeNexusChat}>×</div>
                    <iframe
                        className="nexus-iframe"
                        src="https://app.relevanceai.com/agents/d7b62b/3fdb8425-c0a5-4909-9513-21d07c9f8f99/a3f0bb17-9cbf-4d17-88cc-c1a981deabdd/share?hide_tool_steps=false&hide_file_uploads=false&hide_conversation_list=false&bubble_style=agent&primary_color=%23685FFF&bubble_icon=pd%2Fchat&input_placeholder_text=Type+your+message...&hide_logo=false&hide_description=false"
                        allow="microphone"
                    ></iframe>
                </div>
            </div>

            {/* Header */}
            <header>
                <div className="header-content">
                    <div className="logo">🌐 HindTradeAI</div>
                    <nav>
                        <a href="#agents" onClick={(e) => handleSmoothScroll(e, '#agents')}>Agents</a>
                        <a href="#demo" onClick={(e) => handleSmoothScroll(e, '#demo')}>Features</a>
                        <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')}>Pricing</a>
                        <Link to="/auth" className="nav-btn">Register Now</Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <h1>The <span className="gradient-text">Agent-Led Trade Network</span></h1>
                <h1>Code is Law. Trust is Currency.</h1>
                <p>7 AI Agents automate your entire export journey. From CA verification to global buyer discovery—everything verified, nothing manual. Your Trade Card with QR backed by CA audits. <span style={{ color: '#22c55e', fontWeight: 700 }}>🟢 Ekayan is LIVE</span></p>
                <div className="hero-buttons">
                    <button className="btn-primary" onClick={openNexusChat}>🤖 Chat with Nexus Agent Now</button>
                    <button className="btn-secondary" onClick={() => alert('Demo video: https://hindtradeai.vercel.app/demo')} style={{ background: 'rgba(56, 189, 248, 0.1)' }}>📺 Watch Demo</button>
                </div>
            </section>

            {/* Stats */}
            <section className="stats">
                <div className="stat-card">
                    <div className="stat-number">5M+</div>
                    <div className="stat-label">Indian SMEs (TAM)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">$430B</div>
                    <div className="stat-label">Annual Export Value</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">40%</div>
                    <div className="stat-label">Profit Lost to Delays</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">60sec</div>
                    <div className="stat-label">Avg Agent Response</div>
                </div>
            </section>

            {/* Problems Section */}
            <section className="section" id="about">
                <h2 className="section-title">The <span className="gradient-text">7 Problems We Solve</span></h2>
                <div className="cards-grid">
                    <div className="card">
                        <div className="card-icon">⚖️</div>
                        <h3>Legal Fear</h3>
                        <p>HS codes, sanctions, DGFT policy. One wrong move = lost shipment. CAs charge ₹2L/year for manual advice.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon">👻</div>
                        <h3>Buyer Blindness</h3>
                        <p>500M importers globally. No database. No lead system. Cold calls fail. How do buyers even find you?</p>
                    </div>
                    <div className="card">
                        <div className="card-icon">🚢</div>
                        <h3>Shipping Chaos</h3>
                        <p>Port delays. Hidden demurrage charges. No real-time tracking. Each shipment feels like a gamble.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon">📝</div>
                        <h3>Document Prison</h3>
                        <p>Invoices. BoL. Certificates. GST returns. Each needs CA signatures. Weeks of delays, ₹500/doc fee.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon">🔐</div>
                        <h3>Zero Trust Network</h3>
                        <p>No verification system. Scams happen daily. Buyers wonder: "Are these people real?" Banks won't finance.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon">💸</div>
                        <h3>Hidden Tax Drain</h3>
                        <p>CA: ₹2L/year. Certs: ₹5L. Freight: 10%. Only ₹500Cr+ companies afford global trade profitably.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon">👨‍💼</div>
                        <h3>CA Shortage Crisis</h3>
                        <p>Finding trusted CAs for financing, verification, compliance is impossible. No CA marketplace. Payment delays.</p>
                    </div>
                </div>
            </section>

            {/* Agents Section */}
            <section className="section agents-section" id="agents">
                <h2 className="section-title">Your <span className="gradient-text">AI Workforce</span></h2>
                <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '50px', fontSize: '16px' }}>24/7 operation. Zero errors. Costs ₹5K/month vs ₹50L/year in human overhead. Every document needs CA signature—we handle coordination. Plus: Access our curated CA marketplace, Custom House Agent network + hire personal CAs for enterprises. ⚡ <span style={{ color: '#22c55e', fontWeight: 700 }}>Nexus Trade Agent is LIVE NOW</span></p>
                <div className="cards-grid">
                    <div className="agent-card">
                        <div className="agent-icon">🔐</div>
                        <h3>The Gatekeeper</h3>
                        <p>Triple-layer verification + Trust Score from CA audits.</p>
                        <ul className="features-list">
                            <li>IEC + GST + Sanctions check</li>
                            <li>Credit risk analysis</li>
                            <li>CA-verified Trust Score</li>
                            <li>Buyer vetting (UDIN)</li>
                        </ul>
                    </div>
                    <div className="agent-card" style={{ borderLeft: '4px solid #22c55e' }}>
                        <div style={{ display: 'inline-block', background: 'rgba(34, 197, 94, 0.3)', color: '#22c55e', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🟢 Live Now</div>
                        <div className="agent-icon">⚖️</div>
                        <h3>Ekayan</h3>
                        <p>GovTech-grade AI. Real-time DGFT/Customs compliance. Ask anything trade-related. Responds in 60 seconds.</p>
                        <ul className="features-list">
                            <li>HS code lookups (instant)</li>
                            <li>DGFT policy verification</li>
                            <li>Customs duty calculation</li>
                            <li>Trade scenario analysis</li>
                            <li>Find trusted CAs for verification</li>
                        </ul>
                        <button onClick={openNexusChat} style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#22c55e', padding: '10px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '15px', width: '100%' }}>Chat with Nexus Now →</button>
                    </div>
                    <div className="agent-card">
                        <div className="agent-icon">📄</div>
                        <h3>CA Marketplace</h3>
                        <p>Verified CAs for verification, financing, compliance. Direct leads. Zero commission markup. UDIN-backed document signing.</p>
                        <ul className="features-list">
                            <li>Certified CA profiles (searchable)</li>
                            <li>Financing specialists</li>
                            <li>Compliance experts</li>
                            <li>UDIN document signing (IT Act 2000)</li>
                        </ul>
                    </div>
                    <div className="agent-card">
                        <div className="agent-icon">🛂</div>
                        <h3>Custom House Agent Network</h3>
                        <p>Verified CHAs for customs clearance. Direct leads. Real-time clearance status.</p>
                        <ul className="features-list">
                            <li>CHA marketplace (verified CHAs)</li>
                            <li>Port-wise CHA specialization</li>
                            <li>Customs clearance tracking</li>
                            <li>Duty optimization advice</li>
                        </ul>
                    </div>
                    <div className="agent-card">
                        <div className="agent-icon">🔍</div>
                        <h3>Buyer & Financing Agent</h3>
                        <p>Find verified buyers + connect to finance-ready CAs. End-to-end trade closure.</p>
                        <ul className="features-list">
                            <li>AI-matched verified buyers</li>
                            <li>CA-backed financing leads</li>
                            <li>Global + local options</li>
                            <li>Payment guarantee network</li>
                        </ul>
                    </div>
                    <div className="agent-card">
                        <div className="agent-icon">📍</div>
                        <h3>Shipment Tracker</h3>
                        <p>Real-time tracking with QR codes on Trade Card. Share shipments for trust building.</p>
                        <ul className="features-list">
                            <li>Live port updates</li>
                            <li>Ocean tracking</li>
                            <li>Customs alerts</li>
                            <li>Shipment sharing on MiniLinkedIn</li>
                        </ul>
                    </div>
                    <div className="agent-card">
                        <div className="agent-icon">🚢</div>
                        <h3>Logistics Optimizer</h3>
                        <p>Best shipping routes in real-time.</p>
                        <ul className="features-list">
                            <li>Port recommendations</li>
                            <li>Rate comparisons</li>
                            <li>Transit time calc</li>
                            <li>Cost optimization</li>
                        </ul>
                    </div>
                    <div className="agent-card">
                        <div className="agent-icon">🎓</div>
                        <h3>Mentor Agent</h3>
                        <p>Educates new exporters step-by-step.</p>
                        <ul className="features-list">
                            <li>Export 101 guides</li>
                            <li>Regulatory explainers</li>
                            <li>Farmer-to-exporter path</li>
                            <li>Q&A on basics</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Trade Card Demo */}
            <section className="section demo-section" id="demo">
                <h2 className="section-title">Your <span className="gradient-text">Premium Trade Card</span></h2>
                <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '30px' }}>Black luxury card. QR-verified. CA-backed. Share globally. Buyers trust instantly.</p>
                <div className="demo-container">
                    <div className="trade-card" style={{ background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.98), rgba(5, 5, 15, 0.98))', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                        <div className="trade-card-content">
                            <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '12px', letterSpacing: '2px', fontWeight: 700 }}>HINDTRADEAI VERIFIED EXPORTER</div>
                            <div className="company-info">
                                <div className="company-name" style={{ fontSize: '26px', background: 'linear-gradient(135deg, #38bdf8, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Himrock Exports</div>
                                <div className="company-location" style={{ fontSize: '12px', color: '#9ca3af' }}>Ludhiana, Punjab | Established 2015</div>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(34, 197, 94, 0.08))', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '14px', padding: '22px', margin: '18px 0' }}>
                                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '10px', textAlign: 'center', letterSpacing: '1px' }}>QR VERIFICATION</div>
                                <div className="qr-placeholder" style={{ width: '160px', height: '160px', margin: '0 auto 15px' }}>
                                    🔲 <br /><span style={{ fontSize: '11px' }}>Scan to Verify</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#38bdf8', textAlign: 'center', fontWeight: 600 }}>ID: HT-LDH-2024-001</div>
                                <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', marginTop: '8px' }}>Verified | HSN Approved | Financeable</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0', fontSize: '13px' }}>
                                <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trust Score</div>
                                    <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '20px' }}>98/100</div>
                                    <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '4px' }}>CA Verified</div>
                                </div>
                                <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Worth</div>
                                    <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '18px' }}>₹15Cr+</div>
                                    <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '4px' }}>Audited</div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(34, 197, 94, 0.1)', borderLeft: '3px solid #22c55e', borderRadius: '8px', padding: '14px', margin: '16px 0' }}>
                                <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700, marginBottom: '8px' }}>✓ CA-VERIFIED PROFILE</div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.5 }}>
                                    Verified by CA Ramesh Gupta (UDIN: 240599ABC)<br />
                                    <strong style={{ color: '#38bdf8' }}>View Full Audit →</strong>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
                                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>CONTACT YOUR CA</div>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>CA Ramesh Gupta | +91-98765-43210<br /><span style={{ color: '#6b7280', fontSize: '11px' }}>Financing • Verification • Compliance</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo Features */}
                <div className="demo-features">
                    <div className="demo-feature">
                        <div className="demo-feature-icon">🔲</div>
                        <h4>QR-Verified Instantly</h4>
                        <p>Buyers scan black luxury card. See Net Worth, Trust Score, CA audit link. Trade happens in minutes, not weeks.</p>
                    </div>
                    <div className="demo-feature">
                        <div className="demo-feature-icon">👨‍⚖️</div>
                        <h4>CA Marketplace + UDIN Signing</h4>
                        <p>Verified CA profiles. Direct rates. CAs sign documents with UDIN (IT Act 2000 compliant). QR-generated, legally verified.</p>
                    </div>
                    <div className="demo-feature">
                        <div className="demo-feature-icon">🛂</div>
                        <h4>CHA Leads Network</h4>
                        <p>Verified Custom House Agents by port. Direct CHA leads. Port-wise specialization. Customs clearance guaranteed.</p>
                    </div>
                    <div className="demo-feature">
                        <div className="demo-feature-icon">📱</div>
                        <h4>MiniLinkedIn: Shipment Sharing</h4>
                        <p>Share successful shipments on your profile. Build trust publicly. Buyers see your track record. Transparency = more deals.</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section">
                <h2 className="section-title">The <span className="gradient-text">Trade Closure Journey</span></h2>
                <div className="timeline">
                    <div className="timeline-step">
                        <div className="step-number">1</div>
                        <h3>Register & Connect CA</h3>
                        <p>Upload GST/IEC. Nominate your CA (or get assigned). We coordinate audit + net worth verification within 48 hrs.</p>
                    </div>
                    <div className="timeline-step">
                        <div className="step-number">2</div>
                        <h3>Get Black Trade Card + Profile</h3>
                        <p>Premium card with QR arrives. Create MiniLinkedIn profile. Share shipments to build trust publicly. Show track record to buyers.</p>
                    </div>
                    <div className="timeline-step">
                        <div className="step-number">3</div>
                        <h3>Access CA & CHA Marketplaces</h3>
                        <p>Browse verified CAs (financing, compliance), CHAs (customs). Get direct leads. CA signs documents with UDIN. CHA clears customs instantly.</p>
                    </div>
                    <div className="timeline-step">
                        <div className="step-number">4</div>
                        <h3>Close Trade + Build Reputation</h3>
                        <p>Trade, get financed, documents UDIN-signed & QR-verified. Share shipment on MiniLinkedIn. Every deal = higher score = premium opportunities.</p>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="section pricing-section" id="pricing">
                <h2 className="section-title"><span className="gradient-text">Simple. Transparent.</span> No Hidden Fees.</h2>
                <div className="pricing-grid">
                    <div className="pricing-card">
                        <h3>Free Tier</h3>
                        <div className="price">₹0</div>
                        <div className="price-duration">Forever</div>
                        <ul>
                            <li>Profile + Registration</li>
                            <li>3 Nexus queries/month</li>
                            <li>Basic Trust Score</li>
                            <li>Mentor Agent access</li>
                            <li>No Trade Card</li>
                            <li>No CA Verification</li>
                            <li>No CA Marketplace access</li>
                        </ul>
                        <button className="btn-primary" onClick={() => handleButtonClick('Start Free')}>Start Free</button>
                    </div>
                    <div className="pricing-card featured">
                        <h3>Pro (Black Trade Card)</h3>
                        <div className="price">₹5,000</div>
                        <div className="price-duration">per month</div>
                        <ul>
                            <li>Black luxury Trade Card + QR</li>
                            <li>CA-verified net worth audit</li>
                            <li>Access CA Marketplace</li>
                            <li>50+ verified buyer leads/month</li>
                            <li>Bank financing pre-approval</li>
                            <li>Unlimited document coordination</li>
                        </ul>
                        <button className="btn-primary" onClick={() => navigate('/auth')}>Get Early Access</button>
                    </div>
                    <div className="pricing-card">
                        <h3>Enterprise</h3>
                        <div className="price">Custom</div>
                        <div className="price-duration">per month</div>
                        <ul>
                            <li>Everything in Pro</li>
                            <li>Dedicated Personal CA (Hired)</li>
                            <li>Unlimited CA consultations</li>
                            <li>API + White-label</li>
                            <li>Bulk Trade Card Printing</li>
                            <li>Account Manager + 24/7</li>
                        </ul>
                        <button className="btn-primary" onClick={() => handleButtonClick('Schedule Call')}>Schedule Call</button>
                    </div>
                </div>
                <p style={{ textAlign: 'center', marginTop: '40px', color: '#6b7280', fontSize: '14px' }}><strong>Pay-as-you-grow:</strong> CA marketplace (direct rates, no markup). CHA leads (₹1K-2K per clearance). UDIN document signing (₹500/doc, CA fee). Bank financing (bank charges). CHA + CA profiles searchable. Pro: 2 free consultations/month. Enterprise: Unlimited + dedicated personal CA hired.</p>
            </section>

            {/* MiniLinkedIn Profiles Demo */}
            <section className="section" style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', padding: '80px 40px' }}>
                <h2 className="section-title">Build <span className="gradient-text">Trust Publicly</span></h2>
                <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '50px' }}>Your MiniLinkedIn profile. Share shipments. Build reputation. Buyers trust verified track records.</p>
                <div className="profile-showcase">
                    <div className="profile-card">
                        <div className="profile-header">🌐 Exporter Profile</div>
                        <div className="profile-name">Himrock Exports</div>
                        <div className="profile-designation">Bulk Textiles | Ludhiana, Punjab</div>
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', padding: '12px', marginBottom: '15px' }}>
                            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '5px' }}>Trade Score</div>
                            <div style={{ fontSize: '20px', color: '#38bdf8', fontWeight: 700 }}>98/100</div>
                        </div>
                        <div className="shipment-badge">
                            <strong>✓ 47 Shipments Completed</strong><br />
                            <span>Last shipment: UAE (5 days ago)</span>
                        </div>
                        <button className="view-profile-btn" onClick={() => handleViewProfile('View Full Profile')}>View Full Profile →</button>
                    </div>
                    <div className="profile-card">
                        <div className="profile-header">👨‍⚖️ CA Profile</div>
                        <div className="profile-name">CA Ramesh Gupta</div>
                        <div className="profile-designation">UDIN: 240599ABC | Financing Specialist</div>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', padding: '12px', marginBottom: '15px' }}>
                            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '5px' }}>Rating</div>
                            <div style={{ fontSize: '20px', color: '#22c55e', fontWeight: 700 }}>4.9/5</div>
                        </div>
                        <div className="shipment-badge">
                            <strong>✓ 230+ Exports Verified</strong><br />
                            <span>Financing success rate: 95%</span>
                        </div>
                        <button className="view-profile-btn" onClick={() => handleViewProfile('Hire This CA')}>Hire This CA →</button>
                    </div>
                    <div className="profile-card">
                        <div className="profile-header">🛂 CHA Profile</div>
                        <div className="profile-name">Express Customs Solutions</div>
                        <div className="profile-designation">Nhava Sheva Port Specialist | CHA</div>
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', padding: '12px', marginBottom: '15px' }}>
                            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '5px' }}>Rating</div>
                            <div style={{ fontSize: '20px', color: '#38bdf8', fontWeight: 700 }}>4.8/5</div>
                        </div>
                        <div className="shipment-badge">
                            <strong>✓ 1,200+ Clearances</strong><br />
                            <span>Avg clearance time: 2 hours</span>
                        </div>
                        <button className="view-profile-btn" onClick={() => handleViewProfile('Get CHA Leads')}>Get CHA Leads →</button>
                    </div>
                </div>
            </section>

            {/* Register CTA */}
            <section style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(34, 197, 94, 0.15))', padding: '80px 40px', textAlign: 'center', borderRadius: '20px', margin: '80px 40px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <h2 style={{ fontSize: '48px', fontWeight: 700, marginBottom: '20px', color: '#f9fafb' }}>Register Now. Get Early Access.</h2>
                <p style={{ fontSize: '18px', marginBottom: '40px', color: '#9ca3af', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>Be among the first 500 verified exporters. Your Trade Card + MiniLinkedIn profile + CA & CHA marketplace access. Build trust. Close deals faster.</p>
                <button className="btn-primary" id="register" style={{ fontSize: '18px', padding: '20px 50px' }} onClick={() => navigate('/auth')}>Register & Get Early Access →</button>
            </section>

            {/* Footer */}
            <footer>
                <div className="footer-links">
                    <a href="#agents" onClick={(e) => handleSmoothScroll(e, '#agents')}>Agents</a>
                    <a href="#demo" onClick={(e) => handleSmoothScroll(e, '#demo')}>Features</a>
                    <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')}>Pricing</a>
                    <a href="#">Terms</a>
                    <a href="#">Privacy</a>
                    <a href="#">Contact</a>
                </div>
                <p>© 2025 HindTradeAI. The Global Trade OS. | Simplifying Indian Export. | Code is Law. Trust is Currency.</p>
            </footer>
        </>
    )
}

export default Index
