import { useState } from 'react'
import { htAPI } from '../config/supabase'

export default function ConciergeModal({ userId, onComplete }) {
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        company_name: '',
        gstin: '',
        iec_code: '',
        role: 'exporter',
        city: '',
        industry: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.company_name.trim()) return

        setSaving(true)

        try {
            // Update user_profiles
            const profileData = {
                company_name: formData.company_name,
                gstin: formData.gstin,
                iec_code: formData.iec_code,
                role: formData.role,
                profile_complete: true
            }

            // Update exporters
            const exporterData = {
                company_name: formData.company_name,
                gst_number: formData.gstin,
                iec_code: formData.iec_code,
                city: formData.city,
                industry: formData.industry
            }

            await htAPI.updateFullProfile(userId, profileData, exporterData)

            if (onComplete) onComplete()
        } catch (error) {
            console.error('Concierge save error:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            {/* Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-900/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Modal Card */}
            <div className="relative w-[95%] max-w-lg bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)]">
                {/* Top Gradient Border */}
                <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"></div>

                {/* Noise Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

                <div className="relative p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-b from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center text-white font-serif font-bold text-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] mx-auto mb-4">
                            H
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-2">Welcome to HindTrade</h2>
                        <p className="text-slate-500 text-sm">Complete your Trade Identity to unlock the platform</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Company Name */}
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">Company Name *</label>
                            <input
                                type="text"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition"
                                placeholder="Himrock Exports Pvt. Ltd."
                                required
                            />
                        </div>

                        {/* GSTIN & IEC Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">GSTIN</label>
                                <input
                                    type="text"
                                    value={formData.gstin}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500/50 outline-none transition"
                                    placeholder="22AAAAA0000A1Z5"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">IEC Code</label>
                                <input
                                    type="text"
                                    value={formData.iec_code}
                                    onChange={(e) => setFormData({ ...formData, iec_code: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500/50 outline-none transition"
                                    placeholder="AAAPZ1234C"
                                />
                            </div>
                        </div>

                        {/* Role Select */}
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">Business Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'exporter', label: 'Exporter', icon: '📦' },
                                    { id: 'manufacturer', label: 'Manufacturer', icon: '🏭' }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: type.id })}
                                        className={`p-4 border rounded-xl text-center transition ${formData.role === type.id
                                            ? 'bg-blue-600/20 border-blue-500/50 text-white'
                                            : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
                                            }`}
                                    >
                                        <span className="text-2xl block mb-1">{type.icon}</span>
                                        <span className="text-xs font-bold uppercase tracking-widest">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* City & Industry Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500/50 outline-none transition"
                                    placeholder="Mumbai"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">Industry</label>
                                <select
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500/50 outline-none transition appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-black">Select Industry</option>
                                    <option value="textiles" className="bg-black">Textiles</option>
                                    <option value="apparel" className="bg-black">Apparel</option>
                                    <option value="leather" className="bg-black">Leather</option>
                                    <option value="handicrafts" className="bg-black">Handicrafts</option>
                                    <option value="engineering" className="bg-black">Engineering</option>
                                    <option value="chemicals" className="bg-black">Chemicals</option>
                                    <option value="agriculture" className="bg-black">Agriculture</option>
                                    <option value="other" className="bg-black">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={saving || !formData.company_name.trim()}
                            className="w-full py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-slate-100 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                                    Setting Up...
                                </span>
                            ) : (
                                'Activate Trade Identity →'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-[10px] text-slate-600 mt-6 uppercase tracking-widest">
                        Powered by HindTradeAI Infrastructure
                    </p>
                </div>
            </div>
        </div>
    )
}
