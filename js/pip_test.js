const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

const inputPath = path.join(__dirname, 'server/pak_admin3.geojson');

try {
    const rawData = fs.readFileSync(inputPath);
    const geoData = JSON.parse(rawData);

    // Known correct points for comparison
    const points = [
        { name: 'Saddar Center', lat: 24.8601, lng: 67.0289 },
        { name: 'PECHS (Jamshed Town)', lat: 24.8700, lng: 67.0600 },
        { name: 'Gulshan Iqbal Block 7', lat: 24.9100, lng: 67.0900 },
        { name: 'Malir Cantt', lat: 24.9300, lng: 67.2000 },
        { name: 'Malir Town', lat: 24.8900, lng: 67.1900 }
    ];

    points.forEach(p => {
        const pt = turf.point([p.lng, p.lat]);
        console.log(`\nChecking Point: ${p.name} [${p.lng}, ${p.lat}]`);

        const containingFeatures = geoData.features.filter(f =>
            turf.booleanPointInPolygon(pt, f)
        );

        if (containingFeatures.length > 0) {
            containingFeatures.forEach(f => {
                console.log(`  -> Contained in: ${f.properties.adm3_name} (${f.properties.adm2_name}) PCODE: ${f.properties.adm3_pcode}`);
            });
        } else {
            console.log('  -> Not contained in any feature.');
        }
    });

} catch (error) {
    console.error('Error:', error);
}
