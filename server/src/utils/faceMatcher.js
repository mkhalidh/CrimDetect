/**
 * Face Matcher Utility
 * Handles face descriptor comparison using Euclidean distance
 * Threshold: distance < 0.6 indicates a match
 */

/**
 * Calculate Euclidean distance between two face descriptors
 * @param {Array<number>} descriptor1 - First 128-D face descriptor
 * @param {Array<number>} descriptor2 - Second 128-D face descriptor
 * @returns {number} Euclidean distance (lower = more similar)
 */
const calculateEuclideanDistance = (descriptor1, descriptor2) => {
    if (!descriptor1 || !descriptor2) {
        return Infinity;
    }

    if (descriptor1.length !== descriptor2.length) {
        console.error('Descriptor length mismatch:', descriptor1.length, descriptor2.length);
        return Infinity;
    }

    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        const diff = descriptor1[i] - descriptor2[i];
        sum += diff * diff;
    }

    return Math.sqrt(sum);
};

/**
 * Match detection threshold
 * Distance < 0.6 = Match
 */
const MATCH_THRESHOLD = 0.6;

/**
 * Check if two descriptors match
 * @param {Array<number>} descriptor1 - First descriptor
 * @param {Array<number>} descriptor2 - Second descriptor
 * @returns {Object} Match result with distance and confidence
 */
const checkMatch = (descriptor1, descriptor2) => {
    const distance = calculateEuclideanDistance(descriptor1, descriptor2);
    const isMatch = distance < MATCH_THRESHOLD;

    // Convert distance to confidence percentage
    // 0 distance = 100% confidence, threshold distance = 0% confidence
    const confidence = isMatch
        ? Math.max(0, Math.min(100, (1 - distance / MATCH_THRESHOLD) * 100))
        : 0;

    return {
        isMatch,
        distance: parseFloat(distance.toFixed(4)),
        confidence: parseFloat(confidence.toFixed(2))
    };
};

/**
 * Find best match from an array of criminals
 * @param {Array<number>} inputDescriptor - Input face descriptor to match
 * @param {Array<Object>} criminals - Array of criminal objects with face_descriptor
 * @returns {Object|null} Best match result or null if no match found
 */
const findBestMatch = (inputDescriptor, criminals) => {
    if (!inputDescriptor || !criminals || criminals.length === 0) {
        return null;
    }

    let bestMatch = null;
    let bestDistance = Infinity;

    for (const criminal of criminals) {
        if (!criminal.face_descriptor) continue;

        const distance = calculateEuclideanDistance(inputDescriptor, criminal.face_descriptor);

        if (distance < bestDistance && distance < MATCH_THRESHOLD) {
            bestDistance = distance;
            const confidence = Math.max(0, Math.min(100, (1 - distance / MATCH_THRESHOLD) * 100));

            bestMatch = {
                person: {
                    id: criminal.id,
                    name: criminal.name,
                    image_url: criminal.image_url,
                    status: criminal.status,
                    crime_type: criminal.crime_type,
                    risk_level: criminal.risk_level
                },
                distance: parseFloat(distance.toFixed(4)),
                confidence: parseFloat(confidence.toFixed(2))
            };
        }
    }

    return bestMatch;
};

/**
 * Find all matches from an array of criminals
 * Returns all matches sorted by confidence (highest first)
 * @param {Array<number>} inputDescriptor - Input face descriptor to match
 * @param {Array<Object>} criminals - Array of criminal objects with face_descriptor
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array<Object>} Array of match results
 */
const findAllMatches = (inputDescriptor, criminals, maxResults = 5) => {
    if (!inputDescriptor || !criminals || criminals.length === 0) {
        return [];
    }

    const matches = [];

    for (const criminal of criminals) {
        if (!criminal.face_descriptor) continue;

        const distance = calculateEuclideanDistance(inputDescriptor, criminal.face_descriptor);

        if (distance < MATCH_THRESHOLD) {
            const confidence = Math.max(0, Math.min(100, (1 - distance / MATCH_THRESHOLD) * 100));

            matches.push({
                person: {
                    id: criminal.id,
                    name: criminal.name,
                    image_url: criminal.image_url,
                    status: criminal.status,
                    crime_type: criminal.crime_type,
                    risk_level: criminal.risk_level
                },
                distance: parseFloat(distance.toFixed(4)),
                confidence: parseFloat(confidence.toFixed(2))
            });
        }
    }

    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches.slice(0, maxResults);
};

/**
 * Validate face descriptor format
 * @param {Array<number>} descriptor - Face descriptor to validate
 * @returns {Object} Validation result
 */
const validateDescriptor = (descriptor) => {
    if (!descriptor) {
        return { valid: false, error: 'Descriptor is null or undefined' };
    }

    if (!Array.isArray(descriptor)) {
        return { valid: false, error: 'Descriptor must be an array' };
    }

    if (descriptor.length !== 128) {
        return { valid: false, error: `Descriptor must have 128 dimensions, got ${descriptor.length}` };
    }

    for (let i = 0; i < descriptor.length; i++) {
        if (typeof descriptor[i] !== 'number' || isNaN(descriptor[i])) {
            return { valid: false, error: `Invalid value at index ${i}` };
        }
    }

    return { valid: true };
};

module.exports = {
    calculateEuclideanDistance,
    MATCH_THRESHOLD,
    checkMatch,
    findBestMatch,
    findAllMatches,
    validateDescriptor
};
