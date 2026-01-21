/**
 * Detection Controller
 * Handles face detection matching and logging
 * Uses worker threads for CPU-intensive face matching
 */

const Person = require('../models/Person');
const DetectionLog = require('../models/DetectionLog');
const CriminalRecord = require('../models/CriminalRecord');
const { findBestMatch, findAllMatches, validateDescriptor } = require('../utils/faceMatcher');
const workerManager = require('../workers/workerManager');
const response = require('../utils/response');

const detectionController = {
    /**
     * POST /api/detect/face
     * Match a face descriptor against criminal database
     */
    async detectFace(req, res, next) {
        try {
            const { descriptor, useWorker = false } = req.body;

            // Validate descriptor
            const validation = validateDescriptor(descriptor);
            if (!validation.valid) {
                return response.error(res, validation.error);
            }

            // Get all criminals with face descriptors
            const criminals = await Person.getAllCriminalsWithDescriptors();

            if (criminals.length === 0) {
                return response.success(res, {
                    match: null,
                    message: 'No criminals in database'
                });
            }

            let result;

            if (useWorker) {
                // Use worker thread for matching (Lab requirements)
                try {
                    result = await workerManager.matchFace(descriptor, criminals);
                } catch (error) {
                    console.error('Worker matching failed, falling back to main thread:', error);
                    result = findBestMatch(descriptor, criminals);
                }
            } else {
                // Direct matching in main thread
                result = findBestMatch(descriptor, criminals);
            }

            if (result) {
                // Log the detection
                await DetectionLog.create({
                    person_id: result.person.id,
                    confidence: result.confidence / 100, // Store as decimal
                    location: req.body.location || null
                });

                return response.success(res, {
                    match: true,
                    result: {
                        id: result.person.id,
                        name: result.person.name,
                        crime_type: result.person.crime_type,
                        risk_level: result.person.risk_level,
                        image_url: result.person.image_url,
                        email: result.person.email,
                        cnic: result.person.cnic,
                        violation_count: result.person.violation_count,
                        description: result.person.description,
                        confidence: result.confidence,
                        distance: result.distance
                    }
                }, 'Criminal match found!');
            }

            return response.success(res, {
                match: false,
                message: 'No match found'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/detect/batch
     * Match multiple face descriptors (for video processing)
     */
    async detectBatch(req, res, next) {
        try {
            const { descriptors } = req.body;

            if (!Array.isArray(descriptors) || descriptors.length === 0) {
                return response.error(res, 'Descriptors array is required');
            }

            // Validate all descriptors
            for (let i = 0; i < descriptors.length; i++) {
                const validation = validateDescriptor(descriptors[i].descriptor);
                if (!validation.valid) {
                    return response.error(res, `Invalid descriptor at index ${i}: ${validation.error}`);
                }
            }

            // Get criminals
            const criminals = await Person.getAllCriminalsWithDescriptors();

            if (criminals.length === 0) {
                return response.success(res, {
                    matches: [],
                    message: 'No criminals in database'
                });
            }

            // Use worker for batch processing
            const results = await workerManager.batchMatch(
                descriptors.map((d, i) => ({ index: i, descriptor: d.descriptor })),
                criminals
            );

            // Log detections for successful matches
            const matches = [];
            for (const result of results) {
                if (result.success && result.result) {
                    await DetectionLog.create({
                        person_id: result.result.id,
                        confidence: result.result.confidence / 100
                    });
                    matches.push(result.result);
                }
            }

            return response.success(res, {
                matches,
                total: descriptors.length,
                matchCount: matches.length
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/detect/criminals
     * Get all criminal descriptors for client-side matching
     */
    async getCriminals(req, res, next) {
        try {
            const criminals = await Person.getAllCriminalsWithDescriptors();

            // Return criminals with descriptors for client-side matching
            const data = criminals.map(c => ({
                id: c.id,
                name: c.name,
                crime_type: c.crime_type,
                risk_level: c.risk_level,
                image_url: c.image_url,
                email: c.email,
                cnic: c.cnic,
                violation_count: c.violation_count,
                description: c.description,
                descriptor: c.face_descriptor
            }));

            return response.success(res, {
                criminals: data,
                count: data.length
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/detect/log
     * Log a detection event (from client-side matching)
     */
    async logDetection(req, res, next) {
        try {
            const { person_id, confidence, location } = req.body;

            if (!person_id) {
                return response.error(res, 'person_id is required');
            }

            // Verify person exists
            const person = await Person.findById(person_id);
            if (!person) {
                return response.notFound(res, 'Person not found');
            }

            // Create log
            const log = await DetectionLog.create({
                person_id,
                confidence: confidence || 0,
                location
            });

            return response.created(res, log, 'Detection logged successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/detect/logs
     * Get detection logs
     */
    async getLogs(req, res, next) {
        try {
            const { page = 1, limit = 20, person_id } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const logs = await DetectionLog.findAll({
                limit: parseInt(limit),
                offset,
                person_id: person_id ? parseInt(person_id) : null
            });

            const total = await DetectionLog.count();

            return response.paginated(res, logs, parseInt(page), parseInt(limit), total);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/detect/recent
     * Get recent detections
     */
    async getRecent(req, res, next) {
        try {
            const { limit = 10, hours = 24 } = req.query;

            const recent = await DetectionLog.getRecent(
                parseInt(limit),
                parseInt(hours)
            );

            return response.success(res, recent);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/detect/stats
     * Get detection statistics
     */
    async getStats(req, res, next) {
        try {
            const stats = await DetectionLog.getStatistics();
            const timeline = await DetectionLog.getHourlyTimeline();

            return response.success(res, {
                statistics: stats,
                timeline
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/detect/worker-status
     * Get worker thread pool status
     */
    async getWorkerStatus(req, res, next) {
        try {
            const status = workerManager.getStatus();
            return response.success(res, status);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = detectionController;
