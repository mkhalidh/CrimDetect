# Understanding Labs 4, 5, and 6 Implementation

Aey yrr, chalo simple example ke sath samajhte hain ke ye system kaam kaise kar raha hai.

Socho hamare paas **10,000 criminals** ka data database mein hai. Agar hum main thread (jo server chala raha hai) uspar matching shuru karenge, to server hang ho jayega jab tak matching puri nahi hoti. Is wajah se hum **"Threads"** use karte hain.

---

## 1. Lab 4: Start, Sleep & Stop (Control)
**Goal:** Thread ko control karna—use chalana, thodi der ke liye pause karna (sleep), aur band karna.

- **Start:** `processQueue` loop ([faceMatcherWorker.js:161](file:///c:/khalid/Language/React/New%20folder/server/src/workers/faceMatcherWorker.js#L161)) hamesha chalta rahta hai (jese ek standby guard).
- **Sleep:** `await sleep(1)` ([faceMatcherWorker.js:107](file:///c:/khalid/Language/React/New%20folder/server/src/workers/faceMatcherWorker.js#L107)).
    - *Example:* Jab worker 10,000 criminals ko check kar raha hota hai, to har 100 criminals ke baad wo 1 millisecond ke liye sota (sleep) hai. Isse CPU overheated nahi hota aur system ko dusre chote kaam karne ka moka milta hai.
- **Stop:** `isRunning = false` ([faceMatcherWorker.js:246](file:///c:/khalid/Language/React/New%20folder/server/src/workers/faceMatcherWorker.js#L246)). Jab server band hota hai, hum thread ko message bhejte hain "Bhai ab chutti karo".

---

## 2. Lab 5: Multithreading & Synchronization (Locks)
**Goal:** Ek sath multiple kaam karna aur resources ko safely handle karna.

- **Multithreading:** `WorkerManager.js` mein hum `maxWorkers = 2` rakhte hain. Iska matlab server 2 alag-alag background threads chala sakta hai.
- **Synchronization (Lock):** `lock.acquire()` aur `release()` ([faceMatcherWorker.js:96-131](file:///c:/khalid/Language/React/New%20folder/server/src/workers/faceMatcherWorker.js#L96-L131)).
    - *Example:* Socho database se data read karna ek "Special Door" hai. `lock.acquire()` karne wala worker pehle door lock karega, Matching karega, phir `lock.release()` karke door kholega. Isse data corrupt nahi hota.

---

## 3. Lab 6: Deadlock Prevention (Timeouts)
**Goal:** Agar koi kaam phans jaye (deadlock), to use automatically cancel karna.

- **Timeout:** `matchWithTimeout` ([faceMatcherWorker.js:145](file:///c:/khalid/Language/React/New%20folder/server/src/workers/faceMatcherWorker.js#L145)).
- **Dry Run Example:**
    1. Aapne ek photo scan ki.
    2. Worker thread matching shuru karta hai.
    3. Lekin somehow data bohot zyada hai ya logic phans gaya hai.
    4. Hamne server mein **5 Seconds** ka timeout lagaya hai.
    5. Agar 5 seconds mein match nahi hua, to `Promise.race` trigger hoga aur wo matching ko "Kill" (Failure) kar dega. Server stuck nahi hoga!

---

## 🚀 Dry Run: Step-by-Step Example

Chalo dekhte hain jab aap **"Detect Face"** click karte hain to kya hota hai:

1. **Request (Admin Dashboard):** Aap ek face descriptor bhejte hain API ko (`/api/detect/face`).
2. **Controller (Main Thread):** `detectionController.js` request receive karta hai aur `workerManager.matchFace()` ko call karta hai.
3. **Manager:** `workerManager` ek "Ticket Number" (RequestId) banata hai aur use queue mein daal deta hai.
4. **Worker Thread Pickup:** Agar koi Worker free hai (e.g., Worker #1), to manager use data bhej deta hai.
5. **Matching Activity (Inside Worker #1):**
    - Worker door lock karta hai (`lock.acquire()`). **[Lab 5]**
    - Wo 1st criminal ko check karta hai... 2nd... 100th...
    - 100th criminal par pahunchte hi wo 1ms ke liye break leta hai (`sleep(1)`). **[Lab 4]**
    - Matching continues...
6. **Safety Check:** Background mein ek ghadi (timer) chal rahi hai. Agar matching 5s se upar gayi, to "Timeout" error aa jayega. **[Lab 6]**
7. **Result:** Jaise hi match milta hai (e.g., "Criminal: Khalid"), worker main thread ko result bhejta hai aur door unlock kar deta hai (`lock.release()`).
8. **Toast/Alert:** Aapke screen par red alert aa jata hai: **"CRIMINAL DETECTED! Khalid"**.

---

## Summary Table

| Requirement | Code Location | Key Function | Purpose |
| :--- | :--- | :--- | :--- |
| **Lab 4 (Sleep)** | [faceMatcherWorker.js:107](file:///c:/khalid/Language/React/New%20folder/server/src/workers/faceMatcherWorker.js#L107) | `sleep(1)` | Prevention of long-running CPU blocking. |
| **Lab 5 (Sync)** | [faceMatcherWorker.js:34](file:///c:/khalid/Language/React/New%20folder/server/src/workers/faceMatcherWorker.js#L34) | `lock` object | Mutex logic for safe data processing. |
| **Lab 6 (Timeout)** | [faceMatcherWorker.js:145](file:///c:/khalid/Language/React/New%20folder/server/src/workers/faceMatcherWorker.js#L145) | `matchWithTimeout` | Prevention of infinite loops/stuck threads. |