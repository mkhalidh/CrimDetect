const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'server/pak_admin3.geojson');

try {
    const rawData = fs.readFileSync(inputPath);
    const geoData = JSON.parse(rawData);

    const targetTowns = ['Saddar Town', 'Jamshaid Town', 'Gulshan Iqbal Town', 'Malir Town'];

    targetTowns.forEach(town => {
        const feature = geoData.features.find(f => f.properties.adm3_name === town);
        if (feature) {
            console.log(`\n--- ${town} ---`);
            const coords = feature.geometry.coordinates;
            let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;

            const processCoords = (list) => {
                list.forEach(pt => {
                    if (pt[0] < minLng) minLng = pt[0];
                    if (pt[0] > maxLng) maxLng = pt[0];
                    if (pt[1] < minLat) minLat = pt[1];
                    if (pt[1] > maxLat) maxLat = pt[1];
                });
            };

            if (feature.geometry.type === 'Polygon') {
                coords.forEach(ring => processCoords(ring));
            } else if (feature.geometry.type === 'MultiPolygon') {
                coords.forEach(poly => poly.forEach(ring => processCoords(ring)));
            }

            console.log(`BBOX: [${minLng.toFixed(4)}, ${minLat.toFixed(4)}, ${maxLng.toFixed(4)}, ${maxLat.toFixed(4)}]`);
            console.log(`Center (geometric): [${((minLng + maxLng) / 2).toFixed(4)}, ${((minLat + maxLat) / 2).toFixed(4)}]`);
        }
    });

} catch (error) {
    console.error('Error:', error);
}
