/**
 * User Profile Page
 * View profile, submit claims, manage warnings
 */

import { useState, useEffect } from 'react';
import userService from '../services/userService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { showToast } from '../hooks/useToast';
import { formatDateTime, getStatusColor, getClaimStatusColor, getRiskColor } from '../lib/utils';
import {
    User,
    AlertTriangle,
    FileText,
    Upload,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Edit,
    Save,
} from 'lucide-react';

export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [warnings, setWarnings] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [claimData, setClaimData] = useState({ reason: '', proof: null });
    const [submitting, setSubmitting] = useState(false);
    const [editData, setEditData] = useState({ age: '', cnic: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, warningsRes, claimsRes] = await Promise.all([
                userService.getProfile(),
                userService.getWarnings(),
                userService.getClaims(),
            ]);

            if (profileRes.success) {
                setProfile(profileRes.data);
                setEditData({
                    age: profileRes.data.person?.age || '',
                    cnic: profileRes.data.person?.cnic || '',
                });
            }
            if (warningsRes.success) setWarnings(warningsRes.data);
            if (claimsRes.success) setClaims(claimsRes.data);
        } catch (error) {
            showToast({ title: 'Error', description: 'Failed to load profile', variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        try {
            const form = new FormData();
            if (editData.age) form.append('age', editData.age);
            if (editData.cnic) form.append('cnic', editData.cnic);

            await userService.updateProfile(form);
            showToast({ title: 'Success', description: 'Profile updated', variant: 'success' });
            setIsEditing(false);
            fetchData();
        } catch (error) {
            showToast({ title: 'Error', description: error.message, variant: 'error' });
        }
    };

    const handleClaimSubmit = async () => {
        if (!claimData.reason || claimData.reason.length < 10) {
            showToast({ title: 'Error', description: 'Please provide a detailed reason (min 10 chars)', variant: 'error' });
            return;
        }

        setSubmitting(true);
        try {
            const form = new FormData();
            form.append('reason', claimData.reason);
            if (claimData.proof) form.append('proof', claimData.proof);

            await userService.submitClaim(form);
            showToast({ title: 'Success', description: 'Claim submitted successfully', variant: 'success' });
            setShowClaimForm(false);
            setClaimData({ reason: '', proof: null });
            fetchData();
        } catch (error) {
            showToast({ title: 'Error', description: error.message, variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500 mt-1">Manage your profile and view status</p>
                </div>
                {profile?.person?.status !== 'NORMAL' && !showClaimForm && (
                    <Button onClick={() => setShowClaimForm(true)} className="gradient-primary">
                        <FileText className="h-4 w-4 mr-2" />
                        Submit Claim
                    </Button>
                )}
            </div>

            {/* Profile Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Personal Information
                    </CardTitle>
                    {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleProfileUpdate}>
                                <Save className="h-4 w-4 mr-1" /> Save
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-500">Full Name</label>
                                <p className="font-medium">{profile?.user?.name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Email</label>
                                <p className="font-medium">{profile?.user?.email}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Age</label>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={editData.age}
                                        onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                                        className="max-w-[200px]"
                                    />
                                ) : (
                                    <p className="font-medium">{profile?.person?.age || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">CNIC</label>
                                {isEditing ? (
                                    <Input
                                        value={editData.cnic}
                                        onChange={(e) => setEditData({ ...editData, cnic: e.target.value })}
                                        placeholder="XXXXX-XXXXXXX-X"
                                        className="max-w-[200px]"
                                    />
                                ) : (
                                    <p className="font-medium font-mono">{profile?.person?.cnic || 'Not set'}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-500">Status</label>
                                <div className="mt-1">
                                    <Badge className={`${getStatusColor(profile?.person?.status)} text-sm px-3 py-1`}>
                                        {profile?.person?.status?.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Warning Level</label>
                                <p className="font-medium">{profile?.statistics?.currentWarningLevel || 'NONE'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Violation Count</label>
                                <p className="font-medium">{profile?.statistics?.violationCount || 0}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Total Warnings</label>
                                <p className="font-medium">{profile?.statistics?.totalWarnings || 0}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submit Claim Form */}
            {showClaimForm && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle>Submit Claim</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Reason for Claim *</label>
                            <textarea
                                value={claimData.reason}
                                onChange={(e) => setClaimData({ ...claimData, reason: e.target.value })}
                                placeholder="Explain why you believe your status should be changed..."
                                className="w-full h-32 px-3 py-2 mt-1 rounded-lg border text-sm resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Proof/Evidence (Optional)</label>
                            <label className="flex items-center justify-center gap-2 p-4 mt-1 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                                <Upload className="h-5 w-5 text-slate-400" />
                                <span className="text-sm text-slate-500">
                                    {claimData.proof?.name || 'Click to upload proof'}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setClaimData({ ...claimData, proof: e.target.files[0] })}
                                />
                            </label>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowClaimForm(false)}>Cancel</Button>
                            <Button onClick={handleClaimSubmit} disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Submit Claim
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Warning Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Warning Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {warnings?.warnings && warnings.warnings.length > 0 ? (
                        <div className="relative pl-6 space-y-6">
                            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                            {warnings.warnings.map((warning, index) => (
                                <div key={warning.id} className="relative">
                                    <div className={`absolute -left-6 w-4 h-4 rounded-full border-2 border-white ${warning.level === 'HIGH' ? 'bg-red-500' :
                                            warning.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'
                                        }`}></div>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge className={getRiskColor(warning.level)}>{warning.level}</Badge>
                                            <span className="text-xs text-slate-400">{formatDateTime(warning.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-slate-700">{warning.message || 'Warning issued'}</p>
                                        {warning.acknowledged ? (
                                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" /> Acknowledged
                                            </p>
                                        ) : (
                                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Pending acknowledgment
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                            <p>No warnings on record</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Claims History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        My Claims History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {claims && claims.length > 0 ? (
                        <div className="space-y-4">
                            {claims.map((claim) => (
                                <div key={claim.id} className="p-4 rounded-lg border bg-slate-50">
                                    <div className="flex items-start justify-between mb-3">
                                        <Badge className={getClaimStatusColor(claim.status)}>{claim.status}</Badge>
                                        <span className="text-xs text-slate-400">{formatDateTime(claim.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-2">{claim.reason}</p>
                                    {claim.admin_response && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-slate-500 mb-1">Admin Response:</p>
                                            <p className="text-sm text-slate-700">{claim.admin_response}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p>No claims submitted</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
