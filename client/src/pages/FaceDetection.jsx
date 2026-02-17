/**
 * Face Detection Page
 * Real-time face detection using face-api.js
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import detectionService from '../services/detectionService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { showToast } from '../hooks/useToast';
import { getRiskColor, formatConfidence, getRelativeTime, getImageUrl } from '../lib/utils';
import {
    Camera,
    CameraOff,
    AlertTriangle,
    RefreshCw,
    Volume2,
    VolumeX,
    Loader2,
    Shield,
    Activity,
} from 'lucide-react';

export default function FaceDetection() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [criminals, setCriminals] = useState([]);
    const [currentMatch, setCurrentMatch] = useState(null);
    const [detectionHistory, setDetectionHistory] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [stats, setStats] = useState({ totalScans: 0, matches: 0 });
    const detectionInterval = useRef(null);

    const user = JSON.parse(localStorage.getItem("user") || '{}');
    const isAdmin = user?.role === "admin";

    // Load face-api.js models
    useEffect(() => {
        loadModels();
        fetchCriminals();
        return () => {
            stopDetection();
        };
    }, []);

    const loadModels = async () => {
        try {
            const MODEL_URL = '/models';
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
            showToast({
                title: 'Models Loaded',
                description: 'Face detection models are ready',
                variant: 'success',
            });
        } catch (error) {
            console.error('Error loading models:', error);
            showToast({
                title: 'Error',
                description: 'Failed to load face detection models. Make sure models are in /public/models folder.',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCriminals = async () => {
        try {
            const response = await detectionService.getCriminals();
            if (response.success) {
                setCriminals(response.data.criminals || []);
            }
        } catch (error) {
            console.error('Error fetching criminals:', error);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsRunning(true);
                startDetection();
            }
        } catch (error) {
            console.error('Camera error:', error);
            showToast({
                title: 'Camera Error',
                description: 'Could not access camera. Please check permissions.',
                variant: 'error',
            });
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsRunning(false);
        stopDetection();
        setCurrentMatch(null);
    };

    const startDetection = () => {
        if (detectionInterval.current) return;

        detectionInterval.current = setInterval(async () => {
            await detectFaces();
        }, 500); // Detect every 500ms
    };

    const stopDetection = () => {
        if (detectionInterval.current) {
            clearInterval(detectionInterval.current);
            detectionInterval.current = null;
        }
    };

    const detectFaces = async () => {
        if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Get face detections with descriptors
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withFaceDescriptors();

        // Update stats
        setStats(prev => ({ ...prev, totalScans: prev.totalScans + 1 }));

        // Clear canvas
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length === 0) {
            setCurrentMatch(null);
            return;
        }

        // Check each detected face against criminals
        for (const detection of detections) {
            const descriptor = Array.from(detection.descriptor);

            // Find best match
            const match = findBestMatch(descriptor);

            // Draw face box
            const { x, y, width, height } = detection.detection.box;
            ctx.strokeStyle = match ? '#ef4444' : '#22c55e';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            // Draw label
            if (match) {
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(x, y - 30, width, 30);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Inter';
                ctx.fillText(`${match.name} (${match.confidence.toFixed(1)}%)`, x + 5, y - 10);

                setCurrentMatch(match);

                // Play sound alert
                if (soundEnabled) {
                    playAlertSound();
                }

                // Log detection
                logDetection(match);

                // Add to history
                addToHistory(match);
            } else {
                setCurrentMatch(null);
            }
        }
    };

    const findBestMatch = (descriptor) => {
        if (!criminals || criminals.length === 0) return null;

        let bestMatch = null;
        let bestDistance = Infinity;
        const THRESHOLD = 0.6;

        for (const criminal of criminals) {
            if (!criminal.descriptor) continue;

            const distance = euclideanDistance(descriptor, criminal.descriptor);

            if (distance < bestDistance && distance < THRESHOLD) {
                bestDistance = distance;
                const confidence = Math.max(0, (1 - distance / THRESHOLD) * 100);
                bestMatch = {
                    id: criminal.id,
                    name: criminal.name,
                    crime_type: criminal.crime_type,
                    risk_level: criminal.risk_level,
                    image_url: criminal.image_url,
                    cnic: criminal.cnic,
                    email: criminal.email,
                    violation_count: criminal.violation_count,
                    distance,
                    confidence
                };
            }
        }

        if (bestMatch) {
            setStats(prev => ({ ...prev, matches: prev.matches + 1 }));
        }

        return bestMatch;
    };

    const euclideanDistance = (arr1, arr2) => {
        if (!arr1 || !arr2 || arr1.length !== arr2.length) return Infinity;
        let sum = 0;
        for (let i = 0; i < arr1.length; i++) {
            sum += (arr1[i] - arr2[i]) ** 2;
        }
        return Math.sqrt(sum);
    };

    const playAlertSound = () => {
        // Create a simple beep sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
        } catch (e) {
            console.log('Audio not supported');
        }
    };

    const logDetection = async (match) => {
        try {
            await detectionService.logDetection({
                person_id: match.id,
                confidence: match.confidence / 100
            });
        } catch (error) {
            console.error('Error logging detection:', error);
        }
    };

    const addToHistory = (match) => {
        setDetectionHistory(prev => [{
            ...match,
            detected_at: new Date()
        }, ...prev.slice(0, 9)]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-slate-500">Loading face detection models...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Face Detection</h1>
                    <p className="text-slate-500 mt-1">Real-time criminal face recognition</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                    >
                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    {isAdmin && (
                        <Button
                            variant="outline"
                            onClick={fetchCriminals}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh DB
                        </Button>
                    )}
                    {isRunning ? (
                        <Button variant="destructive" onClick={stopCamera}>
                            <CameraOff className="h-4 w-4 mr-2" />
                            Stop Camera
                        </Button>
                    ) : (
                        <Button className="gradient-primary" onClick={startCamera} disabled={!modelsLoaded}>
                            <Camera className="h-4 w-4 mr-2" />
                            Start Camera
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Camera className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalScans}</p>
                                <p className="text-xs text-slate-500">Total Scans</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.matches}</p>
                                <p className="text-xs text-slate-500">Matches Found</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{criminals.length}</p>
                                <p className="text-xs text-slate-500">In Database</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{isRunning ? 'Active' : 'Inactive'}</p>
                                <p className="text-xs text-slate-500">Status</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Feed */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5 text-blue-600" />
                            Live Camera Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                autoPlay
                                playsInline
                                muted
                            />
                            <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full"
                            />
                            {!isRunning && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                                    <div className="text-center text-white">
                                        <CameraOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">Camera is not active</p>
                                        <p className="text-sm text-slate-400">Click "Start Camera" to begin detection</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Detection Alert / History */}
                <div className="space-y-6">
                    {/* Current Match Alert */}
                    {currentMatch && (
                        <Card className="border-red-200 bg-red-50 animate-pulse">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="h-5 w-5" />
                                    CRIMINAL DETECTED!
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden">
                                        {currentMatch.image_url ? (
                                            <img src={getImageUrl(currentMatch.image_url)} alt="" className="h-16 w-16 object-cover" />
                                        ) : (
                                            <Shield className="h-8 w-8 text-red-400" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-lg text-red-900">{currentMatch.name}</p>
                                                <p className="text-sm text-red-700 font-medium">{currentMatch.crime_type}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={getRiskColor(currentMatch.risk_level)}>
                                                    {currentMatch.risk_level}
                                                </Badge>
                                                <p className="text-sm font-bold text-red-600 mt-1">
                                                    {formatConfidence(currentMatch.confidence)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-2 space-y-1 text-sm text-red-800 bg-red-100/50 p-2 rounded-lg">
                                            <div className="flex justify-between">
                                                <span>CNIC:</span>
                                                <span className="font-mono font-medium">{currentMatch.cnic || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Email:</span>
                                                <span className="font-medium">{currentMatch.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Violations:</span>
                                                <span className="font-bold">{currentMatch.violation_count || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Detection History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Recent Detections
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {detectionHistory.length > 0 ? (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                                    {detectionHistory.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-2 rounded-lg bg-slate-50"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {formatConfidence(item.confidence)}
                                                </p>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {getRelativeTime(item.detected_at)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-slate-400 py-8 text-sm">
                                    No detections yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Instructions */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Click "Start Camera" to begin real-time face detection</li>
                        <li>• The system will automatically scan faces and match against the criminal database</li>
                        <li>• When a match is found (confidence &gt; 60%), an alert will be displayed</li>
                        <li>• All detections are automatically logged for record keeping</li>
                    </ul>
                </CardContent>
            </Card>
        </div >
    );
}
