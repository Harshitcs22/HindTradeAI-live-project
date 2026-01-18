import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, htAPI } from '../config/supabase'

function CADashboard({ session }) {
    const [requests, setRequests] = useState([])
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [filter, setFilter] = useState('pending')
    const [notes, setNotes] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (!session?.user) {
            navigate('/auth')
            return
        }
        loadData()
    }, [session])

    const loadData = async () => {
        setLoading(true)
        try {
            // Use htAPI for stable, tested query
            const result = await htAPI.getAllVerificationRequests()

            if (result.success) {
                const allRequests = result.requests || []
                setRequests(allRequests)

                // Calculate stats from fresh DB data
                const pending = allRequests.filter(r => r.status === 'pending').length
                const approved = allRequests.filter(r => r.status === 'approved').length
                const rejected = allRequests.filter(r => r.status === 'rejected').length

                setStats({ pending, approved, rejected })
            }
        } catch (error) {
            // Silent fail - user sees empty state
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (request) => {
        setActionLoading(request.id)
        try {
            const exporterUserId = request.exporters?.user_id
            const result = await htAPI.approveExporter(
                request.id,
                request.exporter_id,
                exporterUserId,
                session.user.id
            )
            if (result.success) {
                setSelectedRequest(null)
                await loadData() // Force re-fetch from DB
            }
        } catch (error) {
            // Silent fail
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (request) => {
        setActionLoading(request.id)
        try {
            const result = await htAPI.rejectExporter(
                request.id,
                request.exporter_id,
                session.user.id,
                notes
            )
            if (result.success) {
                setSelectedRequest(null)
                setNotes('')
                loadData()
            }
        } catch (error) {
            console.error('Rejection error:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    const filteredRequests = filter === 'all'
        ? requests
        : requests.filter(r => r.status === filter)

    const formatDate = (date) => {
        if (!date) return '–'
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading CA Dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-slate-200">
            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-[#0a0f1a]/95 backdrop-blur-lg border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                                CA
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-semibold text-white">CA Dashboard</h1>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        Verifier
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">Chartered Accountant Portal</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white transition">
                                ← Back to Dashboard
                            </Link>
                            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 transition">
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                        <p className="text-3xl font-bold text-white">{requests.length}</p>
                        <p className="text-sm text-slate-400 mt-1">Total Requests</p>
                    </div>
                    <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/20">
                        <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
                        <p className="text-sm text-slate-400 mt-1">Pending Review</p>
                    </div>
                    <div className="bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/20">
                        <p className="text-3xl font-bold text-emerald-400">{stats.approved}</p>
                        <p className="text-sm text-slate-400 mt-1">Approved</p>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/20">
                        <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
                        <p className="text-sm text-slate-400 mt-1">Rejected</p>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                        {['pending', 'approved', 'rejected', 'all'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === status
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                {status === 'pending' && stats.pending > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-amber-900 text-xs rounded-full font-bold">
                                        {stats.pending}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* VERIFICATION QUEUE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Request List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                            Verification Queue
                        </h3>

                        {filteredRequests.length === 0 ? (
                            <div className="bg-slate-800/30 rounded-xl p-12 text-center border border-slate-700/50">
                                <p className="text-slate-500">No {filter !== 'all' ? filter : ''} verification requests</p>
                            </div>
                        ) : (
                            filteredRequests.map(request => (
                                <div
                                    key={request.id}
                                    onClick={() => setSelectedRequest(request)}
                                    className={`bg-slate-800/50 rounded-xl border p-5 cursor-pointer transition-all ${selectedRequest?.id === request.id
                                        ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                                        : 'border-slate-700/50 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold">
                                                {(request.exporters?.company_name || 'C').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white">
                                                    {request.exporters?.company_name || 'Unknown Company'}
                                                </h4>
                                                <p className="text-sm text-slate-500">
                                                    {request.exporters?.city}, {request.exporters?.state}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                    {request.exporters?.gst_number && (
                                                        <span>GST: {request.exporters.gst_number}</span>
                                                    )}
                                                    {request.exporters?.iec_code && (
                                                        <span>IEC: {request.exporters.iec_code}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                request.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {request.status.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {formatDate(request.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-1">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                            Document Review
                        </h3>

                        {selectedRequest ? (
                            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 sticky top-24">
                                <div className="mb-6">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-xl mb-4">
                                        {(selectedRequest.exporters?.company_name || 'C').substring(0, 2).toUpperCase()}
                                    </div>
                                    <h4 className="text-lg font-semibold text-white">
                                        {selectedRequest.exporters?.company_name}
                                    </h4>
                                    <p className="text-sm text-slate-400">
                                        {selectedRequest.exporters?.city}, {selectedRequest.exporters?.state}
                                    </p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <DetailRow label="Company Type" value={selectedRequest.exporters?.company_type || '–'} />
                                    <DetailRow label="GST Number" value={selectedRequest.exporters?.gst_number || '–'} />
                                    <DetailRow label="IEC Code" value={selectedRequest.exporters?.iec_code || '–'} />
                                    <DetailRow label="PAN Number" value={selectedRequest.exporters?.pan_number || '–'} />
                                    <DetailRow label="Annual Turnover" value={selectedRequest.exporters?.annual_turnover || '–'} />
                                    <DetailRow label="Export Products" value={selectedRequest.exporters?.export_products || '–'} />
                                </div>

                                {selectedRequest.status === 'pending' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-xs text-slate-500 uppercase mb-2">
                                                Verification Notes
                                            </label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-white resize-none focus:border-amber-500 outline-none"
                                                rows={3}
                                                placeholder="Add audit notes, UDIN, or comments..."
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(selectedRequest)}
                                                disabled={actionLoading === selectedRequest.id}
                                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition disabled:opacity-50"
                                            >
                                                {actionLoading === selectedRequest.id ? '...' : '✓ Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(selectedRequest)}
                                                disabled={actionLoading === selectedRequest.id}
                                                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold rounded-lg transition disabled:opacity-50"
                                            >
                                                {actionLoading === selectedRequest.id ? '...' : '✗ Reject'}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {selectedRequest.status !== 'pending' && (
                                    <div className={`p-4 rounded-lg ${selectedRequest.status === 'approved'
                                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                                        : 'bg-red-500/10 border border-red-500/20'
                                        }`}>
                                        <p className={`text-sm font-medium ${selectedRequest.status === 'approved' ? 'text-emerald-400' : 'text-red-400'
                                            }`}>
                                            {selectedRequest.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                                        </p>
                                        {selectedRequest.updated_at && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                on {formatDate(selectedRequest.updated_at)}
                                            </p>
                                        )}
                                        {selectedRequest.notes && (
                                            <p className="text-xs text-slate-400 mt-2">
                                                Notes: {selectedRequest.notes}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-8 text-center">
                                <p className="text-slate-500 text-sm">Select a verification request to review documents</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

function DetailRow({ label, value }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-xs text-slate-500 uppercase flex-shrink-0">{label}</span>
            <span className="text-sm text-slate-300 text-right font-mono truncate">{value}</span>
        </div>
    )
}

export default CADashboard
