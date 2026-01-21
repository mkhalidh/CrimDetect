/**
 * Criminal Management Page
 * CRUD operations for criminal records (Admin)
 */

import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import criminalService from '../services/criminalService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { showToast } from '../hooks/useToast';
import { formatDate, getRiskColor, truncate, getImageUrl } from '../lib/utils';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    Upload,
    User,
    AlertTriangle,
    Filter,
} from 'lucide-react';

const crimeTypes = ['Theft', 'Murder', 'Fraud', 'Traffic Violation', 'Assault', 'Robbery', 'Cybercrime', 'Other'];
const riskLevels = ['LOW', 'MEDIUM', 'HIGH'];

export default function CriminalManagement() {
    const [criminals, setCriminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [filters, setFilters] = useState({ search: '', crime_type: '', risk_level: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [faceDetectionState, setFaceDetectionState] = useState('idle'); // idle, detecting, valid, invalid
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: '', age: '', cnic: '', crime_type: '',
        description: '', risk_level: 'LOW', image: null, user_id: ''
    });

    useEffect(() => {
        loadModels();
        loadModels();
        fetchCriminals();
        fetchUsers();
    }, [pagination.page, filters]);

    const fetchUsers = async () => {
        try {
            const res = await criminalService.getUsers();
            if (res.success) {
                setUsers(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const loadModels = async () => {
        try {
            const MODEL_URL = '/models';
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            console.log('Face models loaded');
        } catch (error) {
            console.error('Error loading models:', error);
            showToast({ title: 'Error', description: 'Failed to load face detection models', variant: 'error' });
        }
    };

    const fetchCriminals = async () => {
        setLoading(true);
        try {
            const response = await criminalService.getCriminals({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });
            if (response.success) {
                setCriminals(response.data);
                setPagination(prev => ({ ...prev, total: response.pagination.total }));
            }
        } catch (error) {
            showToast({ title: 'Error', description: 'Failed to load criminals', variant: 'error' });
        } finally {
            setLoading(false);
        }
    };


    const processImage = async (file) => {
        if (!file) return;

        setFaceDetectionState('detecting');
        try {
            const img = await faceapi.bufferToImage(file);
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

            if (detection) {
                setFaceDetectionState('valid');
                return JSON.stringify(Array.from(detection.descriptor));
            } else {
                setFaceDetectionState('invalid');
                showToast({ title: 'Warning', description: 'No face detected in this image. Detection will not work for this criminal.', variant: 'warning' });
                return null;
            }
        } catch (error) {
            console.error('Detection error:', error);
            setFaceDetectionState('error');
            return null;
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, image: file });
        if (file) {
            await processImage(file);
        } else {
            setFaceDetectionState('idle');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Re-process image if needed (ensure descriptor is ready)
        let faceDescriptor = null;
        if (formData.image) {
            // If state is valid, we could re-use, but re-processing is safer to ensure fresh descriptor
            // However, processImage saves to state.
            // We can just call processImage again to get the return value.
            faceDescriptor = await processImage(formData.image);

            if (faceDetectionState === 'invalid' || !faceDescriptor) {
                if (!confirm('No face detected. Are you sure you want to proceed? The system will not be able to identify this criminal.')) {
                    return;
                }
            }
        }

        const form = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) form.append(key, formData[key]);
        });

        if (faceDescriptor) {
            form.append('face_descriptor', faceDescriptor);
        }

        try {
            if (editingId) {
                await criminalService.updateCriminal(editingId, form);
                showToast({ title: 'Success', description: 'Criminal updated', variant: 'success' });
            } else {
                await criminalService.addCriminal(form);
                showToast({ title: 'Success', description: 'Criminal added', variant: 'success' });
            }
            setShowModal(false);
            resetForm();
            fetchCriminals();
        } catch (error) {
            showToast({ title: 'Error', description: error.message, variant: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await criminalService.deleteCriminal(id);
            showToast({ title: 'Success', description: 'Criminal deleted', variant: 'success' });
            fetchCriminals();
        } catch (error) {
            showToast({ title: 'Error', description: error.message, variant: 'error' });
        }
    };

    const handleEdit = (criminal) => {
        setEditingId(criminal.id);
        setFormData({
            name: criminal.person_name, age: criminal.age || '', cnic: criminal.cnic || '',
            crime_type: criminal.crime_type, description: criminal.description || '',
            risk_level: criminal.risk_level, image: null
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFaceDetectionState('idle');
        setFormData({ name: '', age: '', cnic: '', crime_type: '', description: '', risk_level: 'LOW', image: null, user_id: '' });
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <div className="space-y-6 animate-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Criminal Management</h1>
                    <p className="text-slate-500 mt-1">Manage criminal records in the database</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }} className="gradient-primary">
                    <Plus className="h-4 w-4 mr-2" /> Add Criminal
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or CNIC..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filters.crime_type}
                            onChange={(e) => setFilters({ ...filters, crime_type: e.target.value })}
                            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                            <option value="">All Crime Types</option>
                            {crimeTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <select
                            value={filters.risk_level}
                            onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
                            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                            <option value="">All Risk Levels</option>
                            {riskLevels.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Criminal List */}
            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : criminals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Criminal</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Crime Type</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Risk Level</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Violations</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Added</th>
                                        <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {criminals.map((criminal) => (
                                        <tr key={criminal.id} className="border-b hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                                        {criminal.image_url ? (
                                                            <img src={getImageUrl(criminal.image_url)} alt="" className="h-10 w-10 object-cover" />
                                                        ) : (
                                                            <User className="h-5 w-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{criminal.person_name}</p>
                                                        <p className="text-sm text-slate-500">{criminal.cnic || 'No CNIC'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-700">{criminal.crime_type}</td>
                                            <td className="py-3 px-4">
                                                <Badge className={getRiskColor(criminal.risk_level)}>{criminal.risk_level}</Badge>
                                            </td>
                                            <td className="py-3 px-4 text-slate-700">{criminal.violation_count}</td>
                                            <td className="py-3 px-4 text-slate-500">{formatDate(criminal.created_at)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(criminal)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(criminal.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-3" />
                            <p>No criminals found</p>
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">{editingId ? 'Edit Criminal' : 'Add Criminal'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Name *</label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Link User Account (Optional)</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.user_id}
                                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                    >
                                        <option value="">Select User to Link</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Age</label>
                                    <Input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">CNIC</label>
                                    <Input placeholder="XXXXX-XXXXXXX-X" value={formData.cnic} onChange={(e) => setFormData({ ...formData, cnic: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Crime Type *</label>
                                    <select
                                        value={formData.crime_type}
                                        onChange={(e) => setFormData({ ...formData, crime_type: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md border"
                                        required
                                    >
                                        <option value="">Select...</option>
                                        {crimeTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Risk Level</label>
                                    <select
                                        value={formData.risk_level}
                                        onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md border"
                                    >
                                        {riskLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-24 px-3 py-2 rounded-md border text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Face Image</label>
                                <label className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary ${faceDetectionState === 'valid' ? 'border-green-500 bg-green-50' :
                                    faceDetectionState === 'invalid' ? 'border-red-500 bg-red-50' : ''
                                    }`}>
                                    <Upload className="h-5 w-5 text-slate-400" />
                                    <span className="text-sm text-slate-500">{formData.image?.name || 'Click to upload'}</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                                {faceDetectionState === 'detecting' && <p className="text-xs text-blue-600 mt-1">Scanning face...</p>}
                                {faceDetectionState === 'valid' && <p className="text-xs text-green-600 mt-1">Face detected successfully</p>}
                                {faceDetectionState === 'invalid' && <p className="text-xs text-red-600 mt-1">No face detecting in image</p>}
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 gradient-primary">{editingId ? 'Update' : 'Add'} Criminal</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
