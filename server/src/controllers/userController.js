/**
 * User Controller
 * Handles user profile, warnings, claims, and status
 */

const Person = require('../models/Person');
const Warning = require('../models/Warning');
const Claim = require('../models/Claim');
const CriminalRecord = require('../models/CriminalRecord');
const RuleEngine = require('../utils/ruleEngine');
const Notification = require('../models/Notification');
const response = require('../utils/response');
const { getFileUrl } = require('../config/multer');
const { validationResult } = require('express-validator');

const userController = {
    /**
     * GET /api/user/profile
     * Get user profile with status and violation count
     */
    async getProfile(req, res, next) {
        try {
            let person = await Person.findByUserId(req.user.id);

            if (!person) {
                // Auto-create person profile if missing (Self-healing)
                person = await Person.create({
                    user_id: req.user.id,
                    name: req.user.name,
                    status: 'NORMAL'
                });
            }

            // Get violation count from criminal records
            const records = await CriminalRecord.findByPersonId(person.id);
            const violationCount = records.reduce((sum, r) => sum + r.violation_count, 0);

            // Get warning count
            const warnings = await Warning.findByPersonId(person.id);
            const unacknowledged = warnings.filter(w => !w.acknowledged).length;

            // Get latest warning level - prioritize highest risk level from records
            const levels = ['LOW', 'MEDIUM', 'HIGH'];
            let maxRiskIdx = -1;
            for (const r of records) {
                const idx = levels.indexOf(r.risk_level);
                if (idx > maxRiskIdx) maxRiskIdx = idx;
            }
            const currentWarningLevel = maxRiskIdx >= 0 ? levels[maxRiskIdx] : ((warnings[0]?.warning_level) || 'NONE');

            return response.success(res, {
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email
                },
                person: {
                    id: person.id,
                    name: person.name,
                    age: person.age,
                    cnic: person.cnic,
                    image_url: person.image_url,
                    status: person.status
                },
                statistics: {
                    violationCount,
                    totalWarnings: warnings.length,
                    unacknowledgedWarnings: unacknowledged,
                    currentWarningLevel
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/user/warnings
     * Get user's warning history
     */
    async getWarnings(req, res, next) {
        try {
            let person = await Person.findByUserId(req.user.id);

            if (!person) {
                person = await Person.create({
                    user_id: req.user.id,
                    name: req.user.name,
                    status: 'NORMAL'
                });
            }

            const warnings = await Warning.findByPersonId(person.id);

            // Group warnings by level for timeline
            const timeline = warnings.map(w => ({
                id: w.id,
                level: w.warning_level,
                message: w.message,
                acknowledged: w.acknowledged,
                created_at: w.created_at
            }));

            return response.success(res, {
                warnings: timeline,
                summary: {
                    total: warnings.length,
                    low: warnings.filter(w => w.warning_level === 'LOW').length,
                    medium: warnings.filter(w => w.warning_level === 'MEDIUM').length,
                    high: warnings.filter(w => w.warning_level === 'HIGH').length,
                    unacknowledged: warnings.filter(w => !w.acknowledged).length
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/user/warnings/:id/acknowledge
     * Acknowledge a warning
     */
    async acknowledgeWarning(req, res, next) {
        try {
            const { id } = req.params;

            const warning = await Warning.findById(id);
            if (!warning) {
                return response.notFound(res, 'Warning not found');
            }

            // Verify warning belongs to user
            const person = await Person.findByUserId(req.user.id);
            if (!person || warning.person_id !== person.id) {
                return response.forbidden(res, 'Cannot acknowledge this warning');
            }

            await Warning.acknowledge(id);

            return response.success(res, null, 'Warning acknowledged');
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/user/claim
     * Submit a claim to dispute status
     */
    async submitClaim(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response.validationError(res, errors.array());
            }

            const { reason } = req.body;

            let person = await Person.findByUserId(req.user.id);
            if (!person) {
                person = await Person.create({
                    user_id: req.user.id,
                    name: req.user.name,
                    status: 'NORMAL'
                });
            }

            // Check if user already has pending claim
            const hasPending = await Claim.hasPendingClaim(req.user.id, person.id);
            if (hasPending) {
                return response.error(res, 'You already have a pending claim', 409);
            }

            // Get proof URL if file uploaded
            let proof_url = null;
            if (req.file) {
                proof_url = getFileUrl(req.file.filename, 'claims');
            }

            // Create claim
            const claim = await Claim.create({
                user_id: req.user.id,
                person_id: person.id,
                reason,
                proof_url
            });

            // Notify admins of new claim
            await Notification.notifyAdmins({
                title: 'New Claim Received',
                message: `New claim from ${req.user.name}: ${reason.substring(0, 100)}...`,
                type: 'claim_new',
                related_id: claim.id
            });

            return response.created(res, claim, 'Claim submitted successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/user/claims
     * Get user's claim history
     */
    async getClaims(req, res, next) {
        try {
            const claims = await Claim.findByUserId(req.user.id);

            return response.success(res, claims);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/user/status
     * Get current user status
     */
    async getStatus(req, res, next) {
        try {
            let person = await Person.findByUserId(req.user.id);

            if (!person) {
                person = await Person.create({
                    user_id: req.user.id,
                    name: req.user.name,
                    status: 'NORMAL'
                });
            }

            // Get risk assessment
            let riskAssessment = null;
            try {
                riskAssessment = await RuleEngine.getRiskAssessment(person.id);
            } catch (e) {
                // No criminal records
            }

            // Get pending claims
            const hasPendingClaim = await Claim.hasPendingClaim(req.user.id, person.id);

            return response.success(res, {
                status: person.status,
                hasPendingClaim,
                riskAssessment
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/user/activity
     * Get user's activity history
     */
    async getActivity(req, res, next) {
        try {
            let person = await Person.findByUserId(req.user.id);

            if (!person) {
                person = await Person.create({
                    user_id: req.user.id,
                    name: req.user.name,
                    status: 'NORMAL'
                });
            }

            // Get various activity types
            const [warnings, claims, records] = await Promise.all([
                Warning.findByPersonId(person.id),
                Claim.findByPersonId(person.id),
                CriminalRecord.findByPersonId(person.id)
            ]);

            // Combine into timeline
            const activities = [
                ...warnings.map(w => ({
                    type: 'warning',
                    level: w.warning_level,
                    message: w.message,
                    date: w.created_at
                })),
                ...claims.map(c => ({
                    type: 'claim',
                    status: c.status,
                    reason: c.reason,
                    adminResponse: c.admin_response,
                    date: c.created_at
                })),
                ...records.map(r => ({
                    type: 'record',
                    crimeType: r.crime_type,
                    riskLevel: r.risk_level,
                    date: r.created_at
                }))
            ];

            // Sort by date (newest first)
            activities.sort((a, b) => new Date(b.date) - new Date(a.date));

            return response.success(res, activities);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/user/profile
     * Update user profile
     */
    async updateProfile(req, res, next) {
        try {
            const { age, cnic } = req.body;

            let person = await Person.findByUserId(req.user.id);
            if (!person) {
                person = await Person.create({
                    user_id: req.user.id,
                    name: req.user.name,
                    status: 'NORMAL'
                });
            }

            // Handle image upload
            let image_url = undefined;
            if (req.file) {
                image_url = getFileUrl(req.file.filename, 'claims');
            }

            await Person.update(person.id, {
                age: age ? parseInt(age) : undefined,
                cnic,
                image_url
            });

            const updatedPerson = await Person.findById(person.id);

            return response.success(res, {
                person: {
                    id: updatedPerson.id,
                    name: updatedPerson.name,
                    age: updatedPerson.age,
                    cnic: updatedPerson.cnic,
                    image_url: updatedPerson.image_url,
                    status: updatedPerson.status
                }
            }, 'Profile updated successfully');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = userController;
