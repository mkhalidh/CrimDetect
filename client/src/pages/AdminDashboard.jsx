/**
 * Admin Dashboard Page
 * Shows statistics, charts, and recent activity
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import criminalService from '../services/criminalService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { showToast } from '../hooks/useToast';
import { formatDateTime, getRiskColor, getRelativeTime, getImageUrl } from '../lib/utils';
import {
    Users,
    FileText,
    Camera,
    AlertTriangle,
    TrendingUp,
    Eye,
    ChevronRight,
    Clock,
    Shield,
    Activity,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await criminalService.getDashboard();
            if (response.success) {
                setDashboardData(response.data);
            }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { counts, criminalStats, recentDetections, timeline } = dashboardData || {};

    const riskData = [
        { name: 'Low', value: criminalStats?.low_risk || 0 },
        { name: 'Medium', value: criminalStats?.medium_risk || 0 },
        { name: 'High', value: criminalStats?.high_risk || 0 },
    ];

    return (
        <div className="space-y-6 animate-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of the criminal detection system</p>
                </div>
                <Button asChild className="gradient-primary">
                    <Link to="/admin/detection">
                        <Camera className="h-4 w-4 mr-2" />
                        Start Detection
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Criminals</p>
                                <p className="text-3xl font-bold mt-1">{counts?.totalCriminals || 0}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-sm font-medium">Pending Claims</p>
                                <p className="text-3xl font-bold mt-1">{counts?.pendingClaims || 0}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <FileText className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium" title="Users with 3 or more violations who are not yet classified as criminals">Under Observation</p>
                                <p className="text-3xl font-bold mt-1">{counts?.underObservation || 0}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Eye className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg shadow-green-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Total Detections</p>
                                <p className="text-3xl font-bold mt-1">{counts?.totalDetections || 0}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Camera className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Detection Timeline */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            Detection Timeline (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            {timeline && timeline.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={timeline}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="hour"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => {
                                                const date = new Date(value);
                                                return `${date.getHours()}:00`;
                                            }}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dot={{ fill: '#3b82f6' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    No detection data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            Risk Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {riskData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 mt-4">
                                {riskData.map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index] }}
                                        />
                                        <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Detections */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-500" />
                        Recent Detections
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/admin/detection">
                            View All <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {recentDetections && recentDetections.length > 0 ? (
                        <div className="space-y-4">
                            {recentDetections.slice(0, 5).map((detection) => (
                                <div
                                    key={detection.id}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                        {detection.image_url ? (
                                            <img
                                                src={getImageUrl(detection.image_url)}
                                                alt={detection.person_name}
                                                className="h-12 w-12 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <Shield className="h-6 w-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900">{detection.person_name}</p>
                                        <p className="text-sm text-slate-500">{detection.crime_type}</p>
                                    </div>
                                    <Badge className={getRiskColor(detection.risk_level)}>
                                        {detection.risk_level}
                                    </Badge>
                                    <span className="text-sm text-slate-400">
                                        {getRelativeTime(detection.detected_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            No recent detections
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
