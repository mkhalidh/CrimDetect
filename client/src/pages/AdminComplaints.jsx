import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/useToast';
import complaintService from '../services/complaintService';
import { getRelativeTime } from '../lib/utils';
import { Check, X, Loader2 } from 'lucide-react';

export default function AdminComplaints() {
    const { toast } = useToast();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchComplaints = async () => {
        try {
            const res = await complaintService.getComplaints({ status: 'PENDING' });
            // Handle if response wraps in data object
            setComplaints(res.success ? res.data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            await complaintService.verifyComplaint(id, action);
            toast({
                title: 'Success',
                description: `Complaint ${action}ed`,
                variant: 'success'
            });
            fetchComplaints();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Action failed',
                variant: 'destructive'
            });
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Complaint Review</h1>
                <Button variant="outline" onClick={fetchComplaints}>Refresh</Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : complaints.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-slate-500">No pending complaints</CardContent></Card>
            ) : (
                <div className="grid gap-4">
                    {complaints.map(complaint => (
                        <Card key={complaint.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{complaint.category}</Badge>
                                            <span className="text-sm text-slate-500">
                                                {getRelativeTime(complaint.created_at)}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-lg">
                                            {complaint.location_area}, {complaint.location_city}
                                        </h3>
                                        <p className="text-slate-600">{complaint.description}</p>
                                        <div className="text-sm text-slate-400">
                                            Reported by: {complaint.user_email}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleAction(complaint.id, 'approve')}
                                            disabled={actionLoading === complaint.id}
                                        >
                                            <Check className="h-4 w-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleAction(complaint.id, 'reject')}
                                            disabled={actionLoading === complaint.id}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
