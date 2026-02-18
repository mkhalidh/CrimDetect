const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'server/pak_admin3.geojson');

try {
    const rawData = fs.readFileSync(inputPath);
    const geoData = JSON.parse(rawData);

    console.log('CRS:', geoData.crs || 'No CRS property found (Standard WGS84 assumed)');

    const targetTowns = ['Saddar Town', 'Jamsheid Town', 'Gulshan-E-Iqbal Town', 'Malir Town'];

    const results = geoData.features.filter(f =>
        targetTowns.includes(f.properties.adm3_name) ||
        f.properties.adm2_name?.includes('Karachi')
    );

    console.log(`\nFound ${results.length} Karachi features.`);

    targetTowns.forEach(town => {
        const feature = geoData.features.find(f => f.properties.adm3_name === town);
        if (feature) {
            console.log(`\n--- ${town} ---`);
            console.log('Properties:', feature.properties);
            const coords = feature.geometry.coordinates;
            // Print a sample of coordinates
            if (feature.geometry.type === 'Polygon') {
                console.log('Sample Coords (first 5):', coords[0].slice(0, 5));
            } else if (feature.geometry.type === 'MultiPolygon') {
                console.log('Sample Coords (first 5 of first polygon):', coords[0][0].slice(0, 5));
            }
        } else {
            console.log(`\n[MISSING] ${town} not found exactly.`);
        }
    });

} catch (error) {
    console.error('Error:', error);
}
