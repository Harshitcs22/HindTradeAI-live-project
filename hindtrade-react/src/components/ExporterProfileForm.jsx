import { useState } from 'react'
import { htAPI } from '../config/supabase'

function ExporterProfileForm({ userId, onSuccess, existingData = null }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        company_name: existingData?.company_name || '',
        company_type: existingData?.company_type || '',
        gst_number: existingData?.gst_number || '',
        iec_code: existingData?.iec_code || '',
        pan_number: existingData?.pan_number || '',
        business_address: existingData?.business_address || '',
        city: existingData?.city || '',
        state: existingData?.state || '',
        pincode: existingData?.pincode || '',
        export_products: existingData?.export_products || '',
        annual_turnover: existingData?.annual_turnover || '',
        years_in_business: existingData?.years_in_business || '',
        website: existingData?.website || ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Validate required fields
            if (!formData.company_name || !formData.gst_number) {
                throw new Error('Company name and GST number are required')
            }

            let exporterResult
            if (existingData?.id) {
                // Update existing profile
                exporterResult = await htAPI.updateExporterProfile(userId, formData)
            } else {
                // Create new profile
                exporterResult = await htAPI.createExporterProfile(userId, formData)
            }

            if (!exporterResult.success) {
                throw new Error(exporterResult.error)
            }

            // Create verification request if new profile
            if (!existingData?.id) {
                const verifyResult = await htAPI.createVerificationRequest(
                    exporterResult.exporter.id,
                    userId
                )
                if (!verifyResult.success) {
                    console.error('Failed to create verification request:', verifyResult.error)
                }
            }

            if (onSuccess) {
                onSuccess(exporterResult.exporter)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {existingData ? 'Update Exporter Profile' : 'Complete Your Exporter Profile'}
                </h2>
                <p className="text-gray-400 text-sm">
                    Fill in your business details to get verified and receive your Trade Card
                </p>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">1</span>
                        Company Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Company Name *</label>
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                                placeholder="Acme Exports Pvt Ltd"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Company Type</label>
                            <select
                                name="company_type"
                                value={formData.company_type}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition"
                            >
                                <option value="">Select Type</option>
                                <option value="private_limited">Private Limited</option>
                                <option value="public_limited">Public Limited</option>
                                <option value="partnership">Partnership</option>
                                <option value="proprietorship">Proprietorship</option>
                                <option value="llp">LLP</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Years in Business</label>
                            <input
                                type="number"
                                name="years_in_business"
                                value={formData.years_in_business}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition"
                                placeholder="5"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Registration Details */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">2</span>
                        Registration Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">GST Number *</label>
                            <input
                                type="text"
                                name="gst_number"
                                value={formData.gst_number}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition uppercase"
                                placeholder="22AAAAA0000A1Z5"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">IEC Code</label>
                            <input
                                type="text"
                                name="iec_code"
                                value={formData.iec_code}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition uppercase"
                                placeholder="AAAA0000AA"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">PAN Number</label>
                            <input
                                type="text"
                                name="pan_number"
                                value={formData.pan_number}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition uppercase"
                                placeholder="ABCDE1234F"
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">3</span>
                        Business Address
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Full Address</label>
                            <textarea
                                name="business_address"
                                value={formData.business_address}
                                onChange={handleChange}
                                rows={2}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition resize-none"
                                placeholder="123 Industrial Area, Sector 5"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-400 text-xs uppercase font-bold mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition"
                                    placeholder="Mumbai"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs uppercase font-bold mb-2">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition"
                                    placeholder="Maharashtra"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition"
                                    placeholder="400001"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Details */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">4</span>
                        Business Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Export Products</label>
                            <textarea
                                name="export_products"
                                value={formData.export_products}
                                onChange={handleChange}
                                rows={2}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition resize-none"
                                placeholder="Rice, Textiles, Spices, Handicrafts..."
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Annual Turnover</label>
                            <select
                                name="annual_turnover"
                                value={formData.annual_turnover}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition"
                            >
                                <option value="">Select Range</option>
                                <option value="below_1cr">Below ₹1 Crore</option>
                                <option value="1_5cr">₹1 - 5 Crore</option>
                                <option value="5_25cr">₹5 - 25 Crore</option>
                                <option value="25_100cr">₹25 - 100 Crore</option>
                                <option value="above_100cr">Above ₹100 Crore</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Website</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition"
                                placeholder="https://www.company.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-900 font-bold rounded-xl transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : existingData ? 'Update Profile' : 'Submit for Verification'}
                    </button>
                </div>

                <p className="text-gray-500 text-xs text-center">
                    By submitting, your profile will be reviewed by our team. You'll receive your Trade Card upon approval.
                </p>
            </form>
        </div>
    )
}

export default ExporterProfileForm
