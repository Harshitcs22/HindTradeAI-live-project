import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { htAPI } from '../config/supabase'

function TradeCard() {
    const { id } = useParams()
    const [tradeCard, setTradeCard] = useState(null)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadTradeCard()
    }, [id])

    const loadTradeCard = async () => {
        setLoading(true)
        setError('')
        try {
            const result = await htAPI.getTradeCardById(id)
            if (result.success && result.tradeCard) {
                setTradeCard(result.tradeCard)
                // Fetch products for this exporter
                if (result.tradeCard.exporter_id) {
                    const prodResult = await htAPI.getProducts(result.tradeCard.exporter_id)
                    if (prodResult.success) {
                        setProducts(prodResult.products)
                    }
                }
            } else {
                setError('Trade card not found or has expired')
            }
        } catch (err) {
            setError('Error loading trade card')
        } finally {
            setLoading(false)
        }
    }

    const getCurrentUrl = () => {
        return window.location.href
    }

    const generateQRDataUrl = (text) => {
        // Using a simple QR code API for client-side generation
        const size = 200
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=1e293b&color=22d3ee`
    }

    const handleShare = async () => {
        const url = getCurrentUrl()
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${tradeCard?.company_name} - HindTrade Verified`,
                    text: `View verified trade card for ${tradeCard?.company_name}`,
                    url: url
                })
            } catch (err) {
                copyToClipboard(url)
            }
        } else {
            copyToClipboard(url)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        alert('Trade card link copied to clipboard!')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    <p className="text-cyan-400 text-sm font-medium">Loading Verified Credential...</p>
                </div>
            </div>
        )
    }

    if (error || !tradeCard) {
        return (
            <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Trade Card Not Found</h1>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">{error || 'This trade card may have expired or doesn\'t exist'}</p>
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition font-medium border border-slate-700">
                        ← Return to Home
                    </Link>
                </div>
            </div>
        )
    }

    const exporter = tradeCard.exporters || {}

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-slate-200 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg shadow-cyan-500/20">H</div>
                        <span className="font-semibold text-lg tracking-tight">HindTrade<span className="text-cyan-400">AI</span></span>
                    </Link>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
                        ● Public Verification View
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: THE CARD (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl relative group">
                                {/* Holographic Effect Overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.05)_40%,transparent_60%)] pointer-events-none"></div>

                                {/* Header Strip */}
                                <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-4 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-emerald-600 font-bold text-xs">✓</span>
                                        </div>
                                        <span className="text-slate-900 font-bold text-xs tracking-wider">VERIFIED EXPORTER</span>
                                    </div>
                                    <div className="text-slate-900 font-mono text-xs font-bold opacity-80">{tradeCard.card_id}</div>
                                </div>

                                {/* Card Content */}
                                <div className="p-6 relative z-10">
                                    {/* Company Info */}
                                    <div className="text-center mb-8">
                                        <div className="w-24 h-24 bg-slate-800 border-2 border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-500/10">
                                            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-emerald-400">
                                                {(tradeCard.company_name || 'C').substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <h1 className="text-xl font-bold text-white mb-1 leading-tight">{tradeCard.company_name}</h1>
                                        {exporter.city && (
                                            <p className="text-slate-400 text-sm mt-1">{exporter.city}, {exporter.state}</p>
                                        )}
                                    </div>

                                    {/* Trust Score */}
                                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 mb-6 flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Trust Score</p>
                                            <p className="text-2xl font-bold text-white">{tradeCard.trust_score}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center">
                                            <span className="text-xs font-bold text-emerald-400">A+</span>
                                        </div>
                                    </div>

                                    {/* Business Details */}
                                    <div className="space-y-3 text-sm border-t border-slate-700/50 pt-5 mb-6">
                                        {exporter.gst_number && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">GST Reg.</span>
                                                <span className="text-slate-300 font-mono tracking-wide">{exporter.gst_number}</span>
                                            </div>
                                        )}
                                        {exporter.iec_code && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">IEC Code</span>
                                                <span className="text-slate-300 font-mono tracking-wide">{exporter.iec_code}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* QR Code */}
                                    <div className="bg-white p-2 rounded-xl w-32 mx-auto mb-2">
                                        <img
                                            src={generateQRDataUrl(getCurrentUrl())}
                                            alt="Trade Card QR Code"
                                            className="w-full h-full"
                                        />
                                    </div>
                                    <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest">Scan to Verify</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleShare}
                                    className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all text-sm"
                                >
                                    Share Credential
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-3 bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded-xl transition"
                                >
                                    🖨️
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: PORTFOLIO & DETAILS */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Intro */}
                        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Trade Identity</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {tradeCard.company_name} is a verified trade entity on the HindTradeAI network.
                                The Trust Score indicates compliance with export regulations and verification by accredited Trust Partners.
                            </p>
                        </div>

                        {/* PRODUCT PORTFOLIO */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Product Portfolio</h2>
                                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700">
                                    {products.length} Items attached
                                </span>
                            </div>

                            {products.length === 0 ? (
                                <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700/50">
                                    <p className="text-slate-500">No products have been attached to this Trade Card yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {products.map(product => (
                                        <div key={product.id} className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-colors group">
                                            <div className="h-32 bg-slate-900 relative">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-3xl font-bold">
                                                        {product.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                {product.external_link && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-emerald-400 text-xs font-bold rounded border border-emerald-500/30">
                                                            Live Page
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-white mb-2">{product.name}</h3>
                                                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{product.description}</p>

                                                {product.external_link ? (
                                                    <a
                                                        href={product.external_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block w-full text-center py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors text-xs font-bold uppercase tracking-wider"
                                                    >
                                                        View Product Page
                                                    </a>
                                                ) : (
                                                    <div className="text-center py-2 bg-slate-800 text-slate-500 rounded-lg text-xs border border-slate-700">
                                                        Basic Listing
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* FOOTER BADGES */}
                        <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-800">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-slate-400">
                                <span>🛡️</span> Verified Entity
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-slate-400">
                                <span>🔒</span> Secure Identity
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-slate-400">
                                <span>🌐</span> Global Access
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )


}

export default TradeCard
