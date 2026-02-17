import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import complaintService from '../services/complaintService';
import { getRelativeTime } from '../lib/utils';
import { Loader2, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const statusIcons = {
    PENDING: Clock,
    APPROVED: CheckCircle,
    REJECTED: XCircle
};

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
};

export default function MyComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyComplaints = async () => {
            try {
                const res = await complaintService.getComplaints({});
                setComplaints(res.success ? res.data : []);
            } catch (error) {
                console.error('Error fetching complaints:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyComplaints();
    }, []);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">My Complaints</h1>
                <Badge variant="outline">{complaints.length} Total</Badge>
            </div>

            {complaints.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500">No complaints submitted yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {complaints.map(complaint => {
                        const StatusIcon = statusIcons[complaint.status] || Clock;
                        return (
                            <Card key={complaint.id}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="font-semibold">
                                                    {complaint.category}
                                                </Badge>
                                                <Badge className={statusColors[complaint.status]}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {complaint.status}
                                                </Badge>
                                                <span className="text-sm text-slate-500">
                                                    {getRelativeTime(complaint.created_at)}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg">
                                                {complaint.location_area}, {complaint.location_city}
                                            </h3>
                                            <p className="text-slate-600">{complaint.description}</p>
                                            {complaint.image_url && (
                                                <img
                                                    src={complaint.image_url}
                                                    alt="Evidence"
                                                    className="w-48 h-32 object-cover rounded border mt-2"
                                                />
                                            )}
                                            {complaint.admin_feedback && (
                                                <div className="mt-3 p-3 bg-slate-50 rounded border-l-4 border-blue-500">
                                                    <p className="text-sm font-semibold text-slate-700">Admin Response:</p>
                                                    <p className="text-sm text-slate-600">{complaint.admin_feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
