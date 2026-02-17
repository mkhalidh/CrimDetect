const geoUtils = require('./server/src/utils/geoUtils');

// Test coordinates for Saddar area (approx)
const lat = 24.8607;
const lng = 67.0011;

console.log(`Testing lookup for Lat: ${lat}, Lng: ${lng}...`);
const area = geoUtils.getAreaFromCoordinates(lat, lng);

if (area) {
    console.log(`SUCCESS: Detected Area -> ${area}`);
} else {
    console.log("FAILED: No area detected for these coordinates.");
}

// Test coordinates for another area (e.g. Clifton/Garden)
const lat2 = 24.8138;
const lng2 = 67.0336;
console.log(`Testing lookup for Lat: ${lat2}, Lng: ${lng2}...`);
const area2 = geoUtils.getAreaFromCoordinates(lat2, lng2);
console.log(`Result -> ${area2 || 'Not found'}`);
