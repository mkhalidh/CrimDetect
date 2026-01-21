/**
 * User Dashboard Page
 * Shows user profile overview, warnings, and claims
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { showToast } from '../hooks/useToast';
import { formatDateTime, getStatusColor, getClaimStatusColor, getRelativeTime } from '../lib/utils';
import {
    User,
    AlertTriangle,
    FileText,
    Clock,
    Shield,
    ChevronRight,
    Activity,
    Bell,
    CheckCircle,
} from 'lucide-react';

export default function UserDashboard() {
    const [profile, setProfile] = useState(null);
    const [warnings, setWarnings] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

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

            if (profileRes.success) setProfile(profileRes.data);
            if (warningsRes.success) setWarnings(warningsRes.data);
            if (claimsRes.success) setClaims(claimsRes.data);
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to load dashboard data',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledgeWarning = async (id) => {
        try {
            await userService.acknowledgeWarning(id);
            showToast({
                title: 'Warning Acknowledged',
                description: 'Warning has been acknowledged',
                variant: 'success',
            });
            fetchData();
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to acknowledge warning',
                variant: 'error',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const statusConfig = {
        NORMAL: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
        UNDER_OBSERVATION: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
        CRIMINAL: { icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
    };

    const currentStatus = statusConfig[profile?.person?.status] || statusConfig.NORMAL;
    const StatusIcon = currentStatus.icon;

    return (
        <div className="space-y-6 animate-in">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back, {profile?.user?.name}</p>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Profile Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {profile?.user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">{profile?.user?.name}</h3>
                                    <p className="text-slate-500">{profile?.user?.email}</p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">Status:</span>
                                        <Badge className={getStatusColor(profile?.person?.status)}>
                                            {profile?.person?.status?.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    {profile?.person?.cnic && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">CNIC:</span>
                                            <span className="font-mono text-sm">{profile?.person?.cnic}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Card */}
                <Card className={`${currentStatus.bg} border-0`}>
                    <CardContent className="pt-6 text-center">
                        <div className={`inline-flex h-16 w-16 rounded-2xl ${currentStatus.bg} items-center justify-center mb-4`}>
                            <StatusIcon className={`h-8 w-8 ${currentStatus.color}`} />
                        </div>
                        <h3 className={`text-lg font-semibold ${currentStatus.color}`}>
                            {profile?.person?.status?.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-slate-600 mt-2">
                            Violations: {profile?.statistics?.violationCount || 0}
                        </p>
                        <p className="text-sm text-slate-600">
                            Warnings: {profile?.statistics?.totalWarnings || 0}
                        </p>
                        {profile?.person?.status !== 'NORMAL' && (
                            <Button asChild size="sm" variant="outline" className="mt-4">
                                <Link to="/profile">Submit Claim</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Warnings</p>
                                <p className="text-2xl font-bold text-slate-900">{profile?.statistics?.totalWarnings || 0}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Unacknowledged</p>
                                <p className="text-2xl font-bold text-slate-900">{profile?.statistics?.unacknowledgedWarnings || 0}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                                <Bell className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Warning Level</p>
                                <p className="text-2xl font-bold text-slate-900">{profile?.statistics?.currentWarningLevel || 'NONE'}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Warnings */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            Recent Warnings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {warnings?.warnings && warnings.warnings.length > 0 ? (
                            <div className="space-y-3">
                                {warnings.warnings.slice(0, 5).map((warning) => (
                                    <div
                                        key={warning.id}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-slate-50"
                                    >
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${warning.level === 'HIGH' ? 'bg-red-100' :
                                                warning.level === 'MEDIUM' ? 'bg-amber-100' : 'bg-green-100'
                                            }`}>
                                            <AlertTriangle className={`h-5 w-5 ${warning.level === 'HIGH' ? 'text-red-600' :
                                                    warning.level === 'MEDIUM' ? 'text-amber-600' : 'text-green-600'
                                                }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900">{warning.message || 'Warning issued'}</p>
                                            <p className="text-xs text-slate-500">{getRelativeTime(warning.created_at)}</p>
                                        </div>
                                        <Badge variant={warning.level === 'HIGH' ? 'danger' : warning.level === 'MEDIUM' ? 'warning' : 'success'}>
                                            {warning.level}
                                        </Badge>
                                        {!warning.acknowledged && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleAcknowledgeWarning(warning.id)}
                                            >
                                                Acknowledge
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                                <p>No warnings! Keep up the good behavior.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* My Claims */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            My Claims
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/profile">
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {claims && claims.length > 0 ? (
                            <div className="space-y-3">
                                {claims.slice(0, 5).map((claim) => (
                                    <div
                                        key={claim.id}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-slate-50"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{claim.reason}</p>
                                            <p className="text-xs text-slate-500">{getRelativeTime(claim.created_at)}</p>
                                        </div>
                                        <Badge className={getClaimStatusColor(claim.status)}>
                                            {claim.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <p>No claims submitted yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
