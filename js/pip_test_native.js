const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'server/pak_admin3.geojson');

// Simple Ray Casting Point-in-Polygon
function isPointInPoly(point, vs) {
    var x = point[0], y = point[1];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function isPointInFeature(point, feature) {
    const type = feature.geometry.type;
    const coords = feature.geometry.coordinates;
    if (type === 'Polygon') {
        return isPointInPoly(point, coords[0]); // Check exterior ring
    } else if (type === 'MultiPolygon') {
        return coords.some(poly => isPointInPoly(point, poly[0]));
    }
    return false;
}

try {
    const rawData = fs.readFileSync(inputPath);
    const geoData = JSON.parse(rawData);

    const points = [
        { name: 'Saddar Center', lat: 24.8601, lng: 67.0289 },
        { name: 'PECHS (Jamshaid Town)', lat: 24.8700, lng: 67.0600 },
        { name: 'Gulshan Iqbal Block 7', lat: 24.9100, lng: 67.0900 },
        { name: 'Malir Cantt', lat: 24.9300, lng: 67.2000 },
        { name: 'Malir Town', lat: 24.8900, lng: 67.1900 }
    ];

    points.forEach(p => {
        const pt = [p.lng, p.lat];
        console.log(`\nChecking Point: ${p.name} [${p.lng}, ${p.lat}]`);

        const containingFeatures = geoData.features.filter(f =>
            isPointInFeature(pt, f)
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
