/**
 * Claims Management Page (Admin)
 * View and verify user claims
 */

import { useState, useEffect } from 'react';
import criminalService from '../services/criminalService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { showToast } from '../hooks/useToast';
import { formatDateTime, getClaimStatusColor, getStatusColor, getImageUrl } from '../lib/utils';
import {
    FileText,
    CheckCircle,
    XCircle,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Eye,
    User,
    Clock,
    MessageSquare,
} from 'lucide-react';

export default function ClaimsManagement() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchClaims();
    }, [pagination.page, statusFilter]);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const response = await criminalService.getClaims({
                page: pagination.page,
                limit: pagination.limit,
                status: statusFilter
            });
            if (response.success) {
                setClaims(response.data);
                setPagination(prev => ({ ...prev, total: response.pagination.total }));
            }
        } catch (error) {
            showToast({ title: 'Error', description: 'Failed to load claims', variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (status) => {
        if (!selectedClaim) return;

        setProcessing(true);
        try {
            await criminalService.verifyClaim(selectedClaim.id, {
                status,
                admin_response: responseText
            });
            showToast({
                title: 'Success',
                description: `Claim ${status.toLowerCase()} successfully`,
                variant: 'success'
            });
            setSelectedClaim(null);
            setResponseText('');
            fetchClaims();
        } catch (error) {
            showToast({ title: 'Error', description: error.message, variant: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Claims Management</h1>
                <p className="text-slate-500 mt-1">Review and verify user claims</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Claims List */}
            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : claims.length > 0 ? (
                        <div className="space-y-4">
                            {claims.map((claim) => (
                                <div
                                    key={claim.id}
                                    className="p-4 rounded-xl border bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                {claim.image_url ? (
                                                    <img src={getImageUrl(claim.image_url)} alt="" className="h-12 w-12 rounded-xl object-cover" />
                                                ) : (
                                                    <User className="h-6 w-6 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-medium text-slate-900">{claim.user_name}</p>
                                                    <span className="text-slate-400">•</span>
                                                    <p className="text-sm text-slate-500">{claim.user_email}</p>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{claim.reason}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <div className="text-right">
                                                <Badge className={getStatusColor(claim.person_status)}>
                                                    {claim.person_status?.replace('_', ' ')}
                                                </Badge>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    <Clock className="h-3 w-3 inline mr-1" />
                                                    {formatDateTime(claim.created_at)}
                                                </p>
                                            </div>
                                            <Badge className={getClaimStatusColor(claim.status)}>
                                                {claim.status}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelectedClaim(claim)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <FileText className="h-12 w-12 mx-auto mb-3" />
                            <p>No claims found</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <p className="text-sm text-slate-500">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm" variant="outline"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm" variant="outline"
                                    disabled={pagination.page === totalPages}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Claim Detail Modal */}
            {selectedClaim && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Claim Details</h2>
                            <button onClick={() => setSelectedClaim(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Info */}
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                    {selectedClaim.user_name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">{selectedClaim.user_name}</p>
                                    <p className="text-slate-500">{selectedClaim.user_email}</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Current Status</p>
                                    <Badge className={getStatusColor(selectedClaim.person_status)}>
                                        {selectedClaim.person_status?.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Claim Status</p>
                                    <Badge className={getClaimStatusColor(selectedClaim.status)}>
                                        {selectedClaim.status}
                                    </Badge>
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Reason for Claim</p>
                                <div className="p-4 bg-slate-50 rounded-lg text-slate-700">
                                    {selectedClaim.reason}
                                </div>
                            </div>

                            {/* Proof */}
                            {selectedClaim.proof_url && (
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-2">Proof/Evidence</p>
                                    <a
                                        href={selectedClaim.proof_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        View uploaded proof
                                    </a>
                                </div>
                            )}

                            {/* Admin Response (if already processed) */}
                            {selectedClaim.admin_response && (
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-2">Admin Response</p>
                                    <div className="p-4 bg-slate-50 rounded-lg text-slate-700">
                                        {selectedClaim.admin_response}
                                    </div>
                                </div>
                            )}

                            {/* Action Section (only for pending claims) */}
                            {selectedClaim.status === 'PENDING' && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm font-medium text-slate-700 mb-2">
                                        <MessageSquare className="h-4 w-4 inline mr-1" />
                                        Your Response
                                    </p>
                                    <textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        placeholder="Enter your response (optional)..."
                                        className="w-full h-24 px-3 py-2 rounded-lg border text-sm resize-none"
                                    />

                                    <div className="flex gap-3 mt-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => handleVerify('REJECTED')}
                                            disabled={processing}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleVerify('APPROVED')}
                                            disabled={processing}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
