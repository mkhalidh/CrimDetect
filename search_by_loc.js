const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'server/pak_admin3.geojson');

try {
    const rawData = fs.readFileSync(inputPath);
    const geoData = JSON.parse(rawData);

    // Karachi approx BBOX: [66.6, 24.7, 67.4, 25.4]
    const karachiFeatures = geoData.features.filter(f => {
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

        const centerLng = (minLng + maxLng) / 2;
        const centerLat = (minLat + maxLat) / 2;

        return centerLng > 66.5 && centerLng < 67.5 && centerLat > 24.5 && centerLat < 25.5;
    });

    console.log(`\nFound ${karachiFeatures.length} features in Karachi bounding box.`);

    karachiFeatures.slice(0, 30).forEach(f => {
        console.log(`- [${f.properties.adm3_name}] ADM2: ${f.properties.adm2_name} Area: ${f.properties.area_sqkm} PCODE: ${f.properties.adm3_pcode}`);
    });

} catch (error) {
    console.error('Error:', error);
}
