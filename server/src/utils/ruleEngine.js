/**
 * Rule Engine
 * Implements business logic rules for the criminal detection system
 * 
 * Rules Implemented:
 * 1. Criminal Classification: violation_count >= 5 AND warnings_ignored = true → CRIMINAL
 * 2. Warning Levels: 1-2 → LOW, 3-4 → MEDIUM, 5+ → HIGH
 * 3. Claim Approval: status → NORMAL, violation_count → 0
 */

const Person = require('../models/Person');
const CriminalRecord = require('../models/CriminalRecord');
const Warning = require('../models/Warning');

const RuleEngine = {
    /**
     * Calculate warning level based on violation count
     * Rule: 1-2 → LOW, 3-4 → MEDIUM, 5+ → HIGH
     * @param {number} violationCount - Current violation count
     * @returns {string} Warning level
     */
    calculateWarningLevel(violationCount) {
        if (violationCount >= 5) return 'HIGH';
        if (violationCount >= 3) return 'MEDIUM';
        return 'LOW';
    },

    /**
     * Determine person status based on violations and warnings
     * Rule: violation_count >= 5 AND warnings_ignored → CRIMINAL
     * @param {number} violationCount - Current violation count
     * @param {boolean} warningsIgnored - Whether warnings have been ignored
     * @returns {string} Person status
     */
    determineStatus(violationCount, warningsIgnored = false) {
        if (violationCount >= 5 && warningsIgnored) {
            return 'CRIMINAL';
        }
        if (violationCount >= 3) {
            return 'UNDER_OBSERVATION';
        }
        return 'NORMAL';
    },

    /**
     * Process violation and apply rules
     * Creates warning and updates status if necessary
     * @param {number} personId - Person ID
     * @param {string} message - Warning message
     * @returns {Promise<Object>} Result with new status and warning level
     */
    async processViolation(personId, message = 'Violation detected') {
        // Get person's criminal record
        const records = await CriminalRecord.findByPersonId(personId);

        if (records.length === 0) {
            throw new Error('No criminal record found for this person');
        }

        const record = records[0];

        // Increment violation count
        const newViolationCount = await CriminalRecord.incrementViolation(record.id);

        // Calculate new warning level
        const warningLevel = this.calculateWarningLevel(newViolationCount);

        // Create warning
        await Warning.create({
            person_id: personId,
            warning_level: warningLevel,
            message
        });

        // Check for unacknowledged warnings
        const unacknowledged = await Warning.getUnacknowledged(personId);
        const warningsIgnored = unacknowledged.length >= 3;

        // Determine new status
        const newStatus = this.determineStatus(newViolationCount, warningsIgnored);

        // Update person status if changed
        const person = await Person.findById(personId);
        if (person && person.status !== newStatus) {
            await Person.updateStatus(personId, newStatus);
        }

        return {
            violationCount: newViolationCount,
            warningLevel,
            status: newStatus,
            warningsIgnored
        };
    },

    /**
     * Process claim approval
     * Rule: status → NORMAL, violation_count → 0
     * @param {number} personId - Person ID
     * @returns {Promise<Object>} Reset result
     */
    async processClaimApproval(personId) {
        // Reset violation count
        await CriminalRecord.resetViolationCount(personId);

        // Delete all warnings
        await Warning.deleteByPersonId(personId);

        // Update status to NORMAL
        await Person.updateStatus(personId, 'NORMAL');

        return {
            status: 'NORMAL',
            violationCount: 0,
            warningsCleared: true
        };
    },

    /**
     * Check if person should be classified as criminal
     * @param {number} personId - Person ID
     * @returns {Promise<Object>} Classification result
     */
    async checkCriminalClassification(personId) {
        const records = await CriminalRecord.findByPersonId(personId);

        if (records.length === 0) {
            return { isCriminal: false, reason: 'No criminal records' };
        }

        const totalViolations = records.reduce((sum, r) => sum + r.violation_count, 0);
        const unacknowledged = await Warning.getUnacknowledged(personId);
        const warningsIgnored = unacknowledged.length >= 3;

        if (totalViolations >= 5 && warningsIgnored) {
            return {
                isCriminal: true,
                reason: 'Violation count >= 5 and warnings ignored',
                violationCount: totalViolations,
                ignoredWarnings: unacknowledged.length
            };
        }

        return {
            isCriminal: false,
            reason: 'Does not meet criminal classification criteria',
            violationCount: totalViolations,
            ignoredWarnings: unacknowledged.length
        };
    },

    /**
     * Get person's risk assessment
     * @param {number} personId - Person ID
     * @returns {Promise<Object>} Risk assessment
     */
    async getRiskAssessment(personId) {
        const person = await Person.findById(personId);
        if (!person) {
            throw new Error('Person not found');
        }

        const records = await CriminalRecord.findByPersonId(personId);
        const warnings = await Warning.findByPersonId(personId);

        // Calculate risk factors
        const totalViolations = records.reduce((sum, r) => sum + r.violation_count, 0);
        const highRiskRecords = records.filter(r => r.risk_level === 'HIGH').length;
        const unacknowledgedWarnings = warnings.filter(w => !w.acknowledged).length;

        // Calculate risk score (0-100)
        let riskScore = 0;
        riskScore += Math.min(totalViolations * 10, 40); // Max 40 points
        riskScore += highRiskRecords * 15; // 15 points per high-risk record
        riskScore += unacknowledgedWarnings * 5; // 5 points per ignored warning

        // Determine risk level
        let riskLevel;
        if (riskScore >= 70) riskLevel = 'CRITICAL';
        else if (riskScore >= 50) riskLevel = 'HIGH';
        else if (riskScore >= 30) riskLevel = 'MEDIUM';
        else riskLevel = 'LOW';

        return {
            personId,
            currentStatus: person.status,
            riskScore: Math.min(riskScore, 100),
            riskLevel,
            factors: {
                totalViolations,
                highRiskRecords,
                unacknowledgedWarnings,
                recordCount: records.length
            }
        };
    }
};

module.exports = RuleEngine;
