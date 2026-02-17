import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/useToast';
import complaintService from '../services/complaintService';
import { Loader2, MapPin, Upload, X } from 'lucide-react';

const categories = ['Theft', 'Snatching', 'Harassment', 'Traffic Violation', 'Other'];

export default function ComplaintSubmission() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        category: '',
        location_city: 'Karachi',
        location_area: '',
        description: '',
        latitude: null,
        longitude: null,
        image_url: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await complaintService.submitComplaint(formData);
            toast({
                title: 'Success',
                description: 'Complaint submitted successfully!',
                variant: 'success',
            });
            setFormData({
                category: '',
                location_city: 'Karachi',
                location_area: '',
                description: '',
                latitude: null,
                longitude: null,
                image_url: ''
            });
            setImagePreview(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.toString(),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLocation = () => {
        if (navigator.geolocation) {
            toast({
                title: 'Fetching Location...',
                description: 'Please wait',
            });
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                toast({
                    title: 'Location Fetched',
                    description: 'Coordinates added to complaint',
                });
            }, (err) => {
                toast({
                    title: 'Error',
                    description: 'Could not fetch location. Please ensure location services are enabled.',
                    variant: 'destructive',
                });
            });
        } else {
            toast({
                title: 'Error',
                description: 'Geolocation not supported by your browser',
                variant: 'destructive',
            });
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Error',
                description: 'Image must be less than 5MB',
                variant: 'destructive',
            });
            return;
        }

        setUploadingImage(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: uploadFormData
            });

            const data = await response.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, image_url: data.data.imageUrl }));
                setImagePreview(URL.createObjectURL(file));
                toast({
                    title: 'Success',
                    description: 'Image uploaded successfully',
                });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Error',
                description: 'Failed to upload image',
                variant: 'destructive',
            });
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image_url: '' }));
        setImagePreview(null);
    };

    return (
        <div className="max-w-2xl mx-auto animate-in">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Submit a Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Category</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border bg-background"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">City</label>
                                <Input
                                    value={formData.location_city}
                                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Area</label>
                                <Input
                                    value={formData.location_area}
                                    onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                                    placeholder="e.g. Saddar"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Description</label>
                            <textarea
                                className="w-full min-h-[100px] p-3 rounded-md border bg-background text-sm"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the incident..."
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Upload Evidence (Optional)</label>
                            <div className="flex items-center gap-4">
                                <Button type="button" variant="outline" onClick={() => document.getElementById('image-file').click()} disabled={uploadingImage}>
                                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                    {uploadingImage ? 'Uploading...' : 'Choose File'}
                                </Button>
                                <input
                                    id="image-file"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            {imagePreview && (
                                <div className="mt-3 relative inline-block">
                                    <img src={imagePreview} alt="Preview" className="w-48 h-32 object-cover rounded-md border" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6"
                                        onClick={removeImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="button" variant="outline" onClick={handleLocation}>
                                <MapPin className="h-4 w-4 mr-2" />
                                Use My Location
                            </Button>
                            {formData.latitude && <span className="text-xs text-green-600 font-semibold">✓ Location set</span>}
                        </div>

                        <Button type="submit" disabled={loading} className="w-full gradient-primary">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Submit Complaint
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
