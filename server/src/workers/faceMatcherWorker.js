/**
 * Face Matcher Worker Thread
 * 
 * Implements Lab Requirements:
 * - Lab 4: Start, Sleep & Stop Threading (async execution, timers, controlled loops)
 * - Lab 5: Multithreading with Synchronization (worker_threads, synchronized access)
 * - Lab 6: Threads & Deadlock Handling (CPU-intensive matching, message passing, timeouts)
 * 
 * This worker handles CPU-intensive face matching operations off the main event loop
 */

const { parentPort, workerData, isMainThread } = require('worker_threads');

// ============================================
// Lab 4: Start, Sleep & Stop Threading
// ============================================

/**
 * Sleep function for controlled delays
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Worker state management
let isRunning = true;
let processingQueue = [];
let isProcessing = false;

// ============================================
// Lab 5: Multithreading with Synchronization
// ============================================

// Mutex-like lock for synchronized access
const lock = {
    locked: false,
    queue: [],

    async acquire() {
        return new Promise(resolve => {
            if (!this.locked) {
                this.locked = true;
                resolve();
            } else {
                this.queue.push(resolve);
            }
        });
    },

    release() {
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            next();
        } else {
            this.locked = false;
        }
    }
};

// ============================================
// Face Matching Logic
// ============================================

/**
 * Calculate Euclidean distance between two descriptors
 * @param {Array<number>} desc1 - First descriptor
 * @param {Array<number>} desc2 - Second descriptor
 * @returns {number} Euclidean distance
 */
const calculateDistance = (desc1, desc2) => {
    if (!desc1 || !desc2 || desc1.length !== desc2.length) {
        return Infinity;
    }

    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        const diff = desc1[i] - desc2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
};

/**
 * Match threshold (< 0.6 = match)
 */
const THRESHOLD = 0.6;

/**
 * Find best match for a descriptor against criminal database
 * CPU-intensive operation executed in worker thread
 * @param {Array<number>} inputDescriptor - Input face descriptor
 * @param {Array<Object>} criminals - Criminal database with descriptors
 * @returns {Object|null} Best match or null
 */
const findMatch = async (inputDescriptor, criminals) => {
    // Lab 5: Acquire lock for synchronized access
    await lock.acquire();

    try {
        let bestMatch = null;
        let bestDistance = Infinity;

        for (const criminal of criminals) {
            if (!criminal.face_descriptor) continue;

            // Lab 4: Allow event loop to breathe during heavy computation
            if (criminals.indexOf(criminal) % 100 === 0) {
                await sleep(1); // Prevent blocking
            }

            const distance = calculateDistance(inputDescriptor, criminal.face_descriptor);

            if (distance < bestDistance && distance < THRESHOLD) {
                bestDistance = distance;
                const confidence = Math.max(0, (1 - distance / THRESHOLD) * 100);

                bestMatch = {
                    id: criminal.id,
                    name: criminal.name,
                    crime_type: criminal.crime_type,
                    risk_level: criminal.risk_level,
                    image_url: criminal.image_url,
                    distance: parseFloat(distance.toFixed(4)),
                    confidence: parseFloat(confidence.toFixed(2))
                };
            }
        }

        return bestMatch;
    } finally {
        // Lab 5: Release lock
        lock.release();
    }
};

// ============================================
// Lab 6: Deadlock Prevention with Timeouts
// ============================================

/**
 * Execute face matching with timeout to prevent deadlocks
 * @param {Object} data - Match request data
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Match result or timeout error
 */
const matchWithTimeout = (data, timeout = 5000) => {
    return Promise.race([
        findMatch(data.descriptor, data.criminals),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Match operation timed out')), timeout)
        )
    ]);
};

// ============================================
// Lab 4: Controlled Detection Loop
// ============================================

/**
 * Process queued match requests in a controlled loop
 */
const processQueue = async () => {
    while (isRunning) {
        if (processingQueue.length > 0 && !isProcessing) {
            isProcessing = true;

            const request = processingQueue.shift();

            try {
                // Lab 6: Use timeout-protected matching
                const result = await matchWithTimeout(request.data, 5000);

                parentPort.postMessage({
                    type: 'MATCH_RESULT',
                    requestId: request.id,
                    success: true,
                    result
                });
            } catch (error) {
                parentPort.postMessage({
                    type: 'MATCH_ERROR',
                    requestId: request.id,
                    success: false,
                    error: error.message
                });
            }

            isProcessing = false;
        }

        // Lab 4: Sleep to prevent busy waiting
        await sleep(10);
    }
};

// ============================================
// Worker Message Handler
// ============================================

if (!isMainThread) {
    console.log('[Worker] Face Matcher Worker started');

    // Handle messages from main thread
    parentPort.on('message', async (message) => {
        switch (message.type) {
            case 'MATCH_REQUEST':
                // Add to processing queue
                processingQueue.push({
                    id: message.requestId,
                    data: message.data
                });
                break;

            case 'BATCH_MATCH':
                // Process batch of descriptors
                const results = [];
                for (const item of message.data.descriptors) {
                    try {
                        const result = await matchWithTimeout({
                            descriptor: item.descriptor,
                            criminals: message.data.criminals
                        }, 3000);
                        results.push({
                            index: item.index,
                            result,
                            success: true
                        });
                    } catch (error) {
                        results.push({
                            index: item.index,
                            error: error.message,
                            success: false
                        });
                    }
                }

                parentPort.postMessage({
                    type: 'BATCH_RESULT',
                    requestId: message.requestId,
                    results
                });
                break;

            case 'STOP':
                // Lab 4: Graceful stop
                console.log('[Worker] Stopping Face Matcher Worker');
                isRunning = false;
                break;

            case 'STATUS':
                // Return current status
                parentPort.postMessage({
                    type: 'STATUS_RESPONSE',
                    isRunning,
                    queueLength: processingQueue.length,
                    isProcessing
                });
                break;

            default:
                console.log('[Worker] Unknown message type:', message.type);
        }
    });

    // Start the processing loop
    processQueue().then(() => {
        console.log('[Worker] Processing loop ended');
        process.exit(0);
    });

    // Handle errors
    parentPort.on('error', (error) => {
        console.error('[Worker] Error:', error);
    });
}

// Export for testing
module.exports = {
    calculateDistance,
    findMatch,
    matchWithTimeout,
    THRESHOLD
};
