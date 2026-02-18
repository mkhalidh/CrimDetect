const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'server/pak_admin3.geojson');

try {
    const rawData = fs.readFileSync(inputPath);
    const geoData = JSON.parse(rawData);

    const karachiFeatures = geoData.features.filter(f => {
        const adm2 = f.properties.adm2_name || '';
        return adm2.includes('Karachi') || adm2.includes('Malir') || adm2.includes('Korangi') || adm2.includes('Keamari');
    });

    console.log(`\nAnalyzing ${karachiFeatures.length} Karachi features...`);

    karachiFeatures.forEach(f => {
        let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
        const processCoords = (list) => {
            list.forEach(pt => {
                if (pt[0] < minLng) minLng = pt[0];
                if (pt[0] > maxLng) maxLng = pt[0];
                if (pt[1] < minLat) minLat = pt[1];
                if (pt[1] > maxLat) maxLat = pt[1];
            });
        };
        const coords = f.geometry.coordinates;
        if (f.geometry.type === 'Polygon') coords.forEach(processCoords);
        else if (f.geometry.type === 'MultiPolygon') coords.forEach(p => p.forEach(processCoords));

        console.log(`- [${f.properties.adm3_name}] BBOX: [${minLng.toFixed(4)}, ${minLat.toFixed(4)}, ${maxLng.toFixed(4)}, ${maxLat.toFixed(4)}]`);
    });

} catch (error) {
    console.error('Error:', error);
}
