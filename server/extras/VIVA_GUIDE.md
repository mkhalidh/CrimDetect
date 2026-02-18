# 🎓 VIVA & Exhibition Guide: CrimDetect System


## 🏗️ 1. Project Overview (The "Why")
**CrimDetect** ek automated surveillance system hai jo real-time face recognition use karta hai criminals ko pehchanne ke liye. Iska maqsad manual monitoring ko khatam karna aur database-driven alerts generate karna hai.

---

## 💻 2. SCD Concepts (Threads & Sync)
Exhibitors aur Examiners **Software Construction & Development (SCD)** ke concepts zarur pochen ge. Hamne ye features `server/src/workers/` me implement kiye hain:

### A. Worker Threads (Multi-threading)
*   **File**: `faceMatcherWorker.js`
*   **Kyun?**: Face matching (Euclidean distance calculate karna) CPU ke liye bohot heavy kaam hai. Agar ye main thread par hota, to poora server "hang" (block) ho jata.
*   **Kaise?**: Humne `worker_threads` module use kar ke matching process ko background me daal diya hai. Main server sirf request leta hai, worker kaam karta hai, aur result wapis bhejta hai.

### B. Synchronization (Mutex Lock)
*   **Concept**: Jab multiple requests ek saath aati hain, to shared resources (like current processing state) ko bachane ke liye humne **Locking** use ki hai.
*   **Implementation**: `lock.acquire()` aur `lock.release()` functions ensure karte hain ke ek waqt me ek hi heavy matching task execute ho, taake race conditions na hon.

### C. Deadlock Prevention
*   **Concept**: Agar koi process kabhi khatam na ho to pura thread phans jata hai (Deadlock).
*   **Fix**: Humne **Timeouts** use kiye hain (`Promise.race`). Agar matching 5 seconds se zyada le rahi hai, to system usay "Time Out" kar deta hai taake thread free ho jaye.

### D. Sleep/Stop (Controlled Loops)
*   **Lab 4 Requirement**: Humne `sleep()` function banaya hai (using Promises) jo background loop ko "saans lene" (breathe) ka mauka deta hai, taake CPU 100% heat up na ho.

---

## 📂 3. File-by-File Explanation

### 📁 Backend (Server Side)
1.  **`app.js` / `server.js`**: Ye entry points hain. Yahan Express middleware aur routes register hote hain.
2.  **`models/Stats.js`**: Database queries handle karta hai. Humne yahan **Normalization** dali hai taake area names "Jamshaid Town" ki tarah clean save hon.
3.  **`utils/geoUtils.js`**: Ye "Geography Expert" hai. Ye `@turf/turf` library use kar ke batata hai ke Latitude/Longitude kis Town ke andar girte hain.
4.  **`controllers/complaintController.js`**: Jab admin complaint approve karta hai, yahan se logic chalta hai jo Stats update karta hai aur User ko Notification bhejta hai.

### 📁 Frontend (Client Side)
1.  **`FaceDetection.jsx`**: Ye sab se important file hai. 
    - `face-api.js` use kar ke models load karti hai.
    - Webcam stream ko process kar ke face descriptors (numbers) nikalti hai.
    - In numbers ko backend se match karti hai.
2.  **`AnalyticsDashboard.jsx`**: 
    - **Charts**: `recharts` use hote hain.
    - **Maps**: `react-leaflet` use hota hai.
    - **Heatmap**: `getColor(count)` logic se map ke colors change hote hain (Red = High Crime).

---

## 🎨 4. Map Colors Logic (Heatmap)
User puchen ge: *"Map par color kaise aa raha hai?"*
- Hum database se har area ki crime count lete hain.
- **Color Scale**:
    - Low (1-2): Yellow
    - Medium (3-5): Orange 
    - High (6-10): Red
    - Critical (10+): Dark Red

---

## 🚀 5. Future Scope (Agle Qadam)
Viva me hamesha pucha jata hai: *"Isay future me kahan le ja sakte ho?"*

1.  **Mobile App Integration**: Abhi ye Web par hai, future me React Native app bana kar field officers (police) ke mobile par alerts bheje ja sakte hain.
2.  **Better ML Models**: `face-api.js` ke bajae Python's **DeepFace** ya **ArcFace** server-side use kar ke accuracy 99.9% ki ja sakti hai.
3.  **CCTV Stream Integration**: Abhi sirf webcam hai, future me IP Cameras (CCTV) ka live RTSP feed connect kiya ja sakta hai.
4.  **Predictive Analytics**: Past data ko use kar ke Machine Learning se ye predict karna ke agla crime kis area me hone ke chances hain (**Police Patrol Optimization**).

---

**Tip**: Viva me confident raho! Agar puchen ke Node.js kyun? To kehna *"Non-blocking I/O aur Worker Threads ki wajah se ye highly scalable hai."*
Good luck for your Exhibition! 🏆
