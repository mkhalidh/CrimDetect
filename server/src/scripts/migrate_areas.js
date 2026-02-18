/**
 * Area Migration Script
 * Normalizes all historical area names in the database to official Karachi Town names.
 */

const fs = require('fs');
const path = require('path');
const { query, pool } = require('../config/db');
const turf = require('@turf/turf');

// Load Official GeoJSON
const loadGeoData = () => {
    const filePath = path.join(__dirname, '../../data/karachi_full_districts.json');
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath));
    }
    return null;
};

const officialTowns = [
    'Baldia Town', 'Bin Qasim Town', 'Gadap Town', 'Gulberg Town', 'Gulshan Iqbal Town',
    'Jamshaid Town', 'Kemari Town', 'Korangi Town', 'Landhi Town', 'Liaqatabad Town',
    'Liyari Town', 'Malir Town', 'New Karachi Town', 'North Nazimabad Town',
    'Orangi Town', 'Saddar Town', 'Shah Faisal Town', 'Site Town'
];

const getAreaFromCoords = (lat, lng, collection) => {
    if (!lat || !lng || !collection) return null;
    const pt = turf.point([parseFloat(lng), parseFloat(lat)]);
    for (const feature of collection.features) {
        if (turf.booleanPointInPolygon(pt, feature)) {
            return feature.properties.name;
        }
    }
    return null;
};

const fuzzyMatch = (areaName) => {
    if (!areaName) return null;
    const d = areaName.trim().toLowerCase();
    for (const town of officialTowns) {
        const g = town.toLowerCase();
        if (d === g || d.includes(g.replace(' town', '')) || g.includes(d)) {
            return town;
        }
    }
    return null;
};

async function migrate() {
    console.log('🚀 Starting Data Migration...');
    const collection = loadGeoData();

    try {
        // 1. Get all complaints
        const complaints = await query('SELECT * FROM complaints');
        console.log(`Checking ${complaints.length} complaints...`);

        let updatedCount = 0;

        for (const complaint of complaints) {
            let officialName = null;

            // Try coordinates first
            if (complaint.latitude && complaint.longitude) {
                officialName = getAreaFromCoords(complaint.latitude, complaint.longitude, collection);
            }

            // Fallback to fuzzy match on existing name
            if (!officialName) {
                officialName = fuzzyMatch(complaint.location_area);
            }

            if (officialName && officialName !== complaint.location_area) {
                await query('UPDATE complaints SET location_area = ? WHERE id = ?', [officialName, complaint.id]);
                updatedCount++;
            }
        }

        console.log(`✅ Updated ${updatedCount} complaints to official area names.`);

        // 2. Rebuild stats table
        console.log('📊 Rebuilding Stats Table...');
        await query('TRUNCATE TABLE area_category_stats');

        const approvedComplaints = await query('SELECT * FROM complaints WHERE status = "APPROVED"');

        for (const c of approvedComplaints) {
            await query(`
                INSERT INTO area_category_stats (country, city, area, category, crime_count)
                VALUES (?, ?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE crime_count = crime_count + 1, last_update = NOW()
            `, [c.location_country || 'Pakistan', c.location_city, c.location_area, c.category]);
        }

        console.log(`✅ Stats table rebuilt with ${approvedComplaints.length} approved complaints.`);
        console.log('✨ Migration Complete!');

    } catch (error) {
        console.error('❌ Migration Failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
