const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'server/pak_admin3.geojson');
const outputPath = path.join(__dirname, 'client/src/data/karachi_full_districts.json');
const serverOutputPath = path.join(__dirname, 'server/data/karachi_full_districts.json');

try {
    const rawData = fs.readFileSync(inputPath);
    const geoData = JSON.parse(rawData);

    console.log(`Total Features: ${geoData.features.length}`);

    // Filter for Karachi
    // Karachi usually has adm2_name containing "Karachi" or specific districts like "Malir", "Korangi"
    // Let's filter by adm1_name = "Sindh" first then check adm2

    const karachiFeatures = geoData.features.filter(f => {
        const props = f.properties;
        if (props.adm1_name !== 'Sindh') return false;

        const adm2 = props.adm2_name || '';
        // Check for Karachi districts and Malir/Korangi which might be separate adm2
        return adm2.includes('Karachi') ||
            adm2.includes('Malir') ||
            adm2.includes('Korangi') ||
            adm2.includes('Keamari');
    });

    console.log(`Found ${karachiFeatures.length} Karachi ADM3 features.`);

    // Log unique ADM2 names found
    const adm2Names = [...new Set(karachiFeatures.map(f => f.properties.adm2_name))];
    console.log('ADM2 Names included:', adm2Names);

    const outputData = {
        type: "FeatureCollection",
        features: karachiFeatures.map(f => ({
            type: "Feature",
            properties: {
                name: f.properties.adm3_name, // Map to 'name' for compatibility
                adm2: f.properties.adm2_name,
                adm3: f.properties.adm3_name,
                id: f.properties.adm3_pcode
            },
            geometry: f.geometry
        }))
    };

    // Ensure directories exist
    const clientDir = path.dirname(outputPath);
    if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });

    const serverDir = path.dirname(serverOutputPath);
    if (!fs.existsSync(serverDir)) fs.mkdirSync(serverDir, { recursive: true });

    fs.writeFileSync(outputPath, JSON.stringify(outputData));
    fs.writeFileSync(serverOutputPath, JSON.stringify(outputData));

    console.log(`Written to ${outputPath}`);
    console.log(`Written to ${serverOutputPath}`);

} catch (error) {
    console.error("Error processing GeoJSON:", error);
}
