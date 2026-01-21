/**
 * Worker Manager
 * Manages worker threads for CPU-intensive operations
 * 
 * Implements:
 * - Worker pool management
 * - Message passing to/from workers
 * - Request queuing and result handling
 */

const { Worker } = require('worker_threads');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class WorkerManager {
    constructor() {
        this.workers = [];
        this.maxWorkers = 2; // Maximum concurrent workers
        this.pendingRequests = new Map();
        this.requestQueue = [];
    }

    /**
     * Initialize worker pool
     */
    initialize() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.createWorker(i);
        }
        console.log(`[WorkerManager] Initialized ${this.maxWorkers} workers`);
    }

    /**
     * Create a new worker
     * @param {number} id - Worker ID
     */
    createWorker(id) {
        const workerPath = path.join(__dirname, 'faceMatcherWorker.js');
        const worker = new Worker(workerPath);

        worker.on('message', (message) => this.handleWorkerMessage(id, message));
        worker.on('error', (error) => this.handleWorkerError(id, error));
        worker.on('exit', (code) => this.handleWorkerExit(id, code));

        this.workers[id] = {
            worker,
            busy: false,
            id
        };
    }

    /**
     * Handle message from worker
     * @param {number} workerId - Worker ID
     * @param {Object} message - Worker message
     */
    handleWorkerMessage(workerId, message) {
        const { requestId, type, result, results, success, error } = message;

        if (type === 'STATUS_RESPONSE') {
            console.log(`[Worker ${workerId}] Status:`, message);
            return;
        }

        // Resolve pending request
        const pending = this.pendingRequests.get(requestId);
        if (pending) {
            this.pendingRequests.delete(requestId);

            if (success) {
                pending.resolve(result || results);
            } else {
                pending.reject(new Error(error || 'Worker error'));
            }
        }

        // Mark worker as available
        this.workers[workerId].busy = false;

        // Process next request in queue
        this.processQueue();
    }

    /**
     * Handle worker error
     * @param {number} workerId - Worker ID
     * @param {Error} error - Error object
     */
    handleWorkerError(workerId, error) {
        console.error(`[WorkerManager] Worker ${workerId} error:`, error);

        // Recreate worker
        this.createWorker(workerId);
    }

    /**
     * Handle worker exit
     * @param {number} workerId - Worker ID
     * @param {number} code - Exit code
     */
    handleWorkerExit(workerId, code) {
        console.log(`[WorkerManager] Worker ${workerId} exited with code ${code}`);

        if (code !== 0) {
            // Recreate worker if it crashed
            this.createWorker(workerId);
        }
    }

    /**
     * Get an available worker
     * @returns {Object|null} Available worker or null
     */
    getAvailableWorker() {
        return this.workers.find(w => !w.busy) || null;
    }

    /**
     * Queue a match request
     * @param {Array<number>} descriptor - Face descriptor
     * @param {Array<Object>} criminals - Criminal database
     * @returns {Promise<Object>} Match result
     */
    async matchFace(descriptor, criminals) {
        return new Promise((resolve, reject) => {
            const requestId = uuidv4();

            this.requestQueue.push({
                id: requestId,
                type: 'MATCH_REQUEST',
                data: { descriptor, criminals },
                resolve,
                reject
            });

            this.processQueue();
        });
    }

    /**
     * Queue a batch match request
     * @param {Array<Object>} descriptors - Array of {index, descriptor}
     * @param {Array<Object>} criminals - Criminal database
     * @returns {Promise<Array>} Batch results
     */
    async batchMatch(descriptors, criminals) {
        return new Promise((resolve, reject) => {
            const requestId = uuidv4();

            this.requestQueue.push({
                id: requestId,
                type: 'BATCH_MATCH',
                data: { descriptors, criminals },
                resolve,
                reject
            });

            this.processQueue();
        });
    }

    /**
     * Process queued requests
     */
    processQueue() {
        while (this.requestQueue.length > 0) {
            const worker = this.getAvailableWorker();
            if (!worker) break;

            const request = this.requestQueue.shift();
            worker.busy = true;

            // Store pending request
            this.pendingRequests.set(request.id, {
                resolve: request.resolve,
                reject: request.reject
            });

            // Send to worker
            worker.worker.postMessage({
                type: request.type,
                requestId: request.id,
                data: request.data
            });
        }
    }

    /**
     * Get worker pool status
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            totalWorkers: this.workers.length,
            availableWorkers: this.workers.filter(w => !w.busy).length,
            queuedRequests: this.requestQueue.length,
            pendingRequests: this.pendingRequests.size
        };
    }

    /**
     * Shutdown all workers
     */
    async shutdown() {
        console.log('[WorkerManager] Shutting down workers...');

        for (const workerInfo of this.workers) {
            workerInfo.worker.postMessage({ type: 'STOP' });
        }

        // Wait for workers to exit
        await new Promise(resolve => setTimeout(resolve, 1000));

        for (const workerInfo of this.workers) {
            workerInfo.worker.terminate();
        }

        console.log('[WorkerManager] All workers terminated');
    }
}

// Singleton instance
const workerManager = new WorkerManager();

module.exports = workerManager;
