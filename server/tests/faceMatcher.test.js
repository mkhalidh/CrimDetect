const faceMatcher = require('../src/utils/faceMatcher');

describe('FaceMatcher Utility', () => {
    describe('calculateEuclideanDistance', () => {
        it('should calculate distance between two identical vectors as 0', () => {
            const v1 = [0.1, 0.2, 0.3];
            const v2 = [0.1, 0.2, 0.3];
            const distance = faceMatcher.calculateEuclideanDistance(v1, v2);
            expect(distance).toBe(0);
        });

        it('should calculate correct distance', () => {
            const v1 = [1, 2, 3];
            const v2 = [4, 6, 8];
            // SQRT((1-4)^2 + (2-6)^2 + (3-8)^2) = SQRT(9 + 16 + 25) = SQRT(50) approx 7.07
            const distance = faceMatcher.calculateEuclideanDistance(v1, v2);
            expect(distance).toBeCloseTo(Math.sqrt(50));
        });
    });

    describe('findBestMatch', () => {
        it('should find the best match below threshold', () => {
            const descriptor = [0.1, 0.1, 0.1];
            const criminals = [
                { id: 1, name: 'Match', descriptor: [0.1, 0.1, 0.12] }, // Close
                { id: 2, name: 'No Match', descriptor: [0.9, 0.9, 0.9] } // Far
            ];

            const result = faceMatcher.findBestMatch(descriptor, criminals);
            expect(result).not.toBeNull();
            expect(result.id).toBe(1);
            expect(result.distance).toBeLessThan(0.6);
        });

        it('should return null if no match below threshold', () => {
            const descriptor = [0.1, 0.1, 0.1];
            const criminals = [
                { id: 1, name: 'Far', descriptor: [0.8, 0.8, 0.8] }
            ];

            const result = faceMatcher.findBestMatch(descriptor, criminals);
            expect(result).toBeNull();
        });
    });
});
