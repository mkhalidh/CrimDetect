const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

let featureCollection = null;

const loadGeoData = () => {
    if (featureCollection) return featureCollection;

    try {
        const filePath = path.join(__dirname, '../../data/karachi_full_districts.json');
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath);
            featureCollection = JSON.parse(raw);
            console.log(`Loaded ${featureCollection.features.length} geo features.`);
        } else {
            console.error("GeoJSON file not found at:", filePath);
        }
    } catch (err) {
        console.error("Error loading GeoJSON:", err);
    }
    return featureCollection;
};

/**
 * Find the area name containing the given coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string|null} Area name or null if not found
 */
const getAreaFromCoordinates = (latitude, longitude) => {
    const collection = loadGeoData();
    if (!collection) return null;

    if (!latitude || !longitude) return null;

    const pt = turf.point([parseFloat(longitude), parseFloat(latitude)]);

    for (const feature of collection.features) {
        if (turf.booleanPointInPolygon(pt, feature)) {
            return feature.properties.name;
        }
    }
    return null;
};

module.exports = {
    getAreaFromCoordinates
};
