const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'server/pak_admin3.geojson');

try {
    const rawData = fs.readFileSync(inputPath);
    const geoData = JSON.parse(rawData);

    // Karachi Districts (adm2_name)
    // Based on previous run: [ 'Karachi Central', 'Karachi East', 'Malir Karachi', 'Karachi South', 'Karachi West', 'Korangi Karachi', 'Keamari' ]
    const karachiFeatures = geoData.features.filter(f => {
        const adm2 = f.properties.adm2_name || '';
        return adm2.includes('Karachi') || adm2.includes('Malir') || adm2.includes('Korangi') || adm2.includes('Keamari');
    });

    console.log(`\nFound ${karachiFeatures.length} Karachi features.`);

    const towns = karachiFeatures.map(f => ({
        name: f.properties.adm3_name,
        adm2: f.properties.adm2_name,
        area: f.properties.area_sqkm,
        pcode: f.properties.adm3_pcode
    }));

    console.log('\nList of Towns/Tehsils in Karachi:');
    towns.sort((a, b) => a.name.localeCompare(b.name)).forEach(t => {
        console.log(`- ${t.name} (${t.adm2}) Area: ${t.area.toFixed(2)} km² ID: ${t.pcode}`);
    });

} catch (error) {
    console.error('Error:', error);
}
