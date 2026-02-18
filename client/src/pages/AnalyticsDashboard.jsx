import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, GeoJSON, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import karachiFullDistricts from '../data/karachi_full_districts.json';
import complaintService from '../services/complaintService';
import { Loader2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        categoryStats: [],
        topAreas: [],
        areaStats: [],
        stackedData: []
    });
    const [selectedArea, setSelectedArea] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await complaintService.getStats();
                if (res.success) {
                    setStats(res.data);
                }
            } catch (error) {
                console.error('Analytics error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    // Get unique categories for stacked bars
    const categories = stats.categoryStats ? stats.categoryStats.map(c => c.category) : [];

    // Filter logic for Pie Chart
    let filteredCategoryStats = stats.categoryStats;
    if (selectedArea !== 'All' && stats.stackedData) {
        const areaData = stats.stackedData.find(item =>
            item.name && item.name.trim().toLowerCase() === selectedArea.trim().toLowerCase()
        );
        if (areaData) {
            filteredCategoryStats = categories.map(cat => ({
                category: cat,
                total: areaData[cat] || 0
            })).filter(item => item.total > 0);
        } else {
            filteredCategoryStats = [];
        }
    }

    // Default center (Karachi)
    let center = [24.8607, 67.0011];
    if (selectedArea !== 'All') {
        // Find the feature in GeoJSON to get its official center
        const feature = karachiFullDistricts.features.find(f =>
            f.properties.name.trim().toLowerCase() === selectedArea.trim().toLowerCase()
        );
        if (feature) {
            center = [feature.properties.center_lat, feature.properties.center_lon];
        } else if (stats.areaStats) {
            // Fallback to complaint average
            const areaCoord = stats.areaStats.find(a =>
                a.area && a.area.trim().toLowerCase() === selectedArea.trim().toLowerCase()
            );
            if (areaCoord && areaCoord.latitude) {
                center = [areaCoord.latitude, areaCoord.longitude];
            }
        }
    } else if (stats.areaStats && stats.areaStats.length > 0 && stats.areaStats[0].latitude) {
        center = [stats.areaStats[0].latitude, stats.areaStats[0].longitude];
    }

    // Delete Area Function
    const handleDeleteArea = async () => {
        if (selectedArea === 'All') return;

        if (confirm(`Are you sure you want to delete ALL data for area "${selectedArea}"? This cannot be undone.`)) {
            try {
                setLoading(true);
                await complaintService.deleteArea(selectedArea);
                // Refresh data
                const res = await complaintService.getStats();
                if (res.success) {
                    setStats(res.data);
                    setSelectedArea('All');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('Error deleting area: ' + error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-slate-900">Crime Analytics</h1>
                <div className="flex items-center gap-4">
                    {selectedArea !== 'All' && (
                        <button
                            onClick={handleDeleteArea}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm font-medium transition-colors"
                        >
                            Delete Area Data
                        </button>
                    )}
                    <select
                        className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-w-[150px]"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-w-[150px]"
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                    >
                        <option value="All">All Areas</option>
                        {stats.stackedData && stats.stackedData.map(area => (
                            <option key={area.name} value={area.name}>{area.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Crimes by Category {selectedArea !== 'All' && `(${selectedArea})`}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {filteredCategoryStats && filteredCategoryStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={filteredCategoryStats}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="total"
                                        nameKey="category"
                                    >
                                        {filteredCategoryStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                No crime data available yet
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Area-wise Crime Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {stats.stackedData && stats.stackedData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.stackedData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    {categories
                                        .filter(cat => selectedCategory === 'All' || cat === selectedCategory)
                                        .map((cat, index) => (
                                            <Bar
                                                key={cat}
                                                dataKey={cat}
                                                stackId="a"
                                                fill={COLORS[categories.indexOf(cat) % COLORS.length]}
                                            />
                                        ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                No area data available yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Geographic Crime Map (Intensity)</CardTitle>
                </CardHeader>
                <CardContent className="h-[500px] p-0 overflow-hidden rounded-b-lg">
                    {typeof window !== 'undefined' && (
                        <div className="relative h-full w-full">
                            <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <GeoJSON
                                    key={`geojson-${selectedCategory}-${JSON.stringify(stats.stackedData)}`}
                                    data={karachiFullDistricts}
                                    style={(feature) => {
                                        const areaName = feature.properties.name;
                                        let count = 0;

                                        if (stats.stackedData) {
                                            const foundData = stats.stackedData.find(d =>
                                                d.name && d.name.trim().toLowerCase() === areaName.trim().toLowerCase()
                                            );
                                            if (foundData) {
                                                if (selectedCategory === 'All') {
                                                    count = Object.keys(foundData)
                                                        .filter(k => k !== 'name')
                                                        .reduce((sum, key) => sum + (parseInt(foundData[key]) || 0), 0);
                                                } else {
                                                    count = parseInt(foundData[selectedCategory]) || 0;
                                                }
                                            }
                                        }

                                        const getColor = (d) => {
                                            return d > 10 ? '#7f1d1d' :
                                                d > 5 ? '#ef4444' :
                                                    d > 2 ? '#f97316' :
                                                        d > 0 ? '#fef08a' :
                                                            'transparent';
                                        };

                                        return {
                                            fillColor: getColor(count),
                                            weight: 2,
                                            opacity: 1,
                                            color: 'white',
                                            dashArray: '3',
                                            fillOpacity: 0.7
                                        };
                                    }}
                                    onEachFeature={(feature, layer) => {
                                        const areaName = feature.properties.name;
                                        let count = 0;
                                        let details = {};

                                        if (stats.stackedData) {
                                            const foundData = stats.stackedData.find(d =>
                                                d.name && d.name.trim().toLowerCase() === areaName.trim().toLowerCase()
                                            );
                                            if (foundData) {
                                                details = foundData;
                                                if (selectedCategory === 'All') {
                                                    count = Object.keys(foundData)
                                                        .filter(k => k !== 'name')
                                                        .reduce((sum, key) => sum + (parseInt(foundData[key]) || 0), 0);
                                                } else {
                                                    count = parseInt(foundData[selectedCategory]) || 0;
                                                }
                                            }
                                        }

                                        const categories = Object.keys(details).filter(k => k !== 'name');
                                        const breakdown = categories.length > 0
                                            ? categories.map(c => `${c}: ${details[c]}`).join(', ')
                                            : 'No recorded crimes';

                                        layer.bindTooltip(`
                                            <div class="text-center">
                                                <div class="font-bold text-lg">${areaName}</div>
                                                <div class="font-bold ${count > 0 ? 'text-red-600' : 'text-green-600'} text-base">
                                                    ${count} Crimes
                                                </div>
                                                <div class="text-xs text-slate-600 mt-1">${breakdown}</div>
                                            </div>
                                        `, {
                                            permanent: false,
                                            direction: "top",
                                            opacity: 0.9,
                                            className: "custom-leaflet-tooltip"
                                        });

                                        layer.on({
                                            mouseover: (e) => {
                                                const l = e.target;
                                                l.setStyle({ weight: 5, color: '#666', dashArray: '', fillOpacity: 0.9 });
                                            },
                                            mouseout: (e) => {
                                                const l = e.target;
                                                l.setStyle({ weight: 2, color: 'white', dashArray: '3', fillOpacity: 0.7 });
                                            }
                                        });
                                    }}
                                />
                            </MapContainer>

                            {/* Map Legend */}
                            <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200">
                                <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Crime Intensity</div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <div className="w-4 h-4 rounded border border-white shadow-sm" style={{ backgroundColor: '#7f1d1d' }}></div>
                                        <span>High (&gt; 10)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <div className="w-4 h-4 rounded border border-white shadow-sm" style={{ backgroundColor: '#ef4444' }}></div>
                                        <span>Moderate-High (6-10)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <div className="w-4 h-4 rounded border border-white shadow-sm" style={{ backgroundColor: '#f97316' }}></div>
                                        <span>Moderate (3-5)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <div className="w-4 h-4 rounded border border-white shadow-sm" style={{ backgroundColor: '#fef08a' }}></div>
                                        <span>Low (1-2)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: 'white' }}></div>
                                        <span>Safe / No Data</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
