import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, htAPI } from '../config/supabase'

function Admin({ session }) {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [filter, setFilter] = useState('pending')
    const navigate = useNavigate()

    useEffect(() => {
        if (!session?.user) {
            navigate('/')
            return
        }
        loadRequests()
    }, [session, filter])

    const loadRequests = async () => {
        setLoading(true)
        setError('')
        try {
            const result = await htAPI.getAllVerificationRequests()
            if (result.success) {
                const filtered = filter === 'all'
                    ? result.requests
                    : result.requests.filter(r => r.status === filter)
                setRequests(filtered)
            } else {
                setError('Failed to load requests: ' + result.error)
            }
        } catch (err) {
            setError('Error loading requests: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (request) => {
        if (!confirm('Are you sure you want to approve this exporter?')) return

        setActionLoading(request.id)
        setError('')
        setSuccess('')

        try {
            const result = await htAPI.approveExporter(
                request.id,
                request.exporter_id,
                request.exporters?.user_id,
                session.user.id
            )

            if (result.success) {
                setSuccess(`✅ Exporter approved! Trade Card ID: ${result.tradeCard.card_id}`)
                loadRequests()
            } else {
                setError('Approval failed: ' + result.error)
            }
        } catch (err) {
            setError('Error: ' + err.message)
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (request) => {
        const notes = prompt('Enter rejection reason (optional):')
        if (notes === null) return // User cancelled

        setActionLoading(request.id)
        setError('')
        setSuccess('')

        try {
            const result = await htAPI.rejectExporter(request.id, session.user.id, notes)

            if (result.success) {
                setSuccess('❌ Exporter verification rejected')
                loadRequests()
            } else {
                setError('Rejection failed: ' + result.error)
            }
        } catch (err) {
            setError('Error: ' + err.message)
        } finally {
            setActionLoading(null)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
            approved: 'bg-green-500/20 text-green-400 border-green-500/50',
            rejected: 'bg-red-500/20 text-red-400 border-red-500/50'
        }
        return styles[status] || styles.pending
    }

    return (
        <div className="min-h-screen bg-slate-900 text-gray-200">
            {/* Header */}
            <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center text-slate-900 font-bold">H</div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                            <p className="text-xs text-gray-400">Verification Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-400 hover:text-white transition text-sm"
                        >
                            ← Dashboard
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-red-400 hover:text-red-300 transition text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                        <div className="text-3xl font-bold text-white">{requests.length}</div>
                        <div className="text-sm text-gray-400">Total Requests</div>
                    </div>
                    <div className="bg-yellow-500/10 rounded-xl p-5 border border-yellow-500/30">
                        <div className="text-3xl font-bold text-yellow-400">
                            {requests.filter(r => r.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-400">Pending</div>
                    </div>
                    <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/30">
                        <div className="text-3xl font-bold text-green-400">
                            {requests.filter(r => r.status === 'approved').length}
                        </div>
                        <div className="text-sm text-gray-400">Approved</div>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/30">
                        <div className="text-3xl font-bold text-red-400">
                            {requests.filter(r => r.status === 'rejected').length}
                        </div>
                        <div className="text-sm text-gray-400">Rejected</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {['pending', 'approved', 'rejected', 'all'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === status
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                : 'bg-slate-800 text-gray-400 border border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                    <button
                        onClick={loadRequests}
                        className="ml-auto px-4 py-2 bg-slate-800 text-gray-400 rounded-full text-sm border border-slate-700 hover:text-white transition"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                {/* Requests List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-2">No {filter !== 'all' ? filter : ''} requests found</div>
                        <p className="text-gray-600 text-sm">Verification requests will appear here when exporters submit their profiles</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(request => (
                            <div
                                key={request.id}
                                className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-white">
                                                    {request.exporters?.company_name || 'Unknown Company'}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(request.status)}`}>
                                                    {request.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                                <div>
                                                    <div className="text-gray-500 text-xs uppercase mb-1">GST Number</div>
                                                    <div className="text-gray-300 font-mono">{request.exporters?.gst_number || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs uppercase mb-1">IEC Code</div>
                                                    <div className="text-gray-300 font-mono">{request.exporters?.iec_code || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs uppercase mb-1">Location</div>
                                                    <div className="text-gray-300">
                                                        {request.exporters?.city ? `${request.exporters.city}, ${request.exporters.state}` : 'N/A'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs uppercase mb-1">Submitted</div>
                                                    <div className="text-gray-300">{formatDate(request.created_at)}</div>
                                                </div>
                                            </div>

                                            {request.exporters?.export_products && (
                                                <div className="mt-4">
                                                    <div className="text-gray-500 text-xs uppercase mb-1">Export Products</div>
                                                    <div className="text-gray-300 text-sm">{request.exporters.export_products}</div>
                                                </div>
                                            )}

                                            {request.notes && (
                                                <div className="mt-4 bg-slate-900/50 rounded-lg p-3">
                                                    <div className="text-gray-500 text-xs uppercase mb-1">Notes</div>
                                                    <div className="text-gray-300 text-sm">{request.notes}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        {request.status === 'pending' && (
                                            <div className="flex flex-col gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleApprove(request)}
                                                    disabled={actionLoading === request.id}
                                                    className="px-6 py-2 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    {actionLoading === request.id ? '...' : '✓ Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request)}
                                                    disabled={actionLoading === request.id}
                                                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    {actionLoading === request.id ? '...' : '✗ Reject'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Admin
