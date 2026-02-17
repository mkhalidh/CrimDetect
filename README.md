# Criminal Face Detection & Monitoring System

A production-ready criminal face detection system with real-time face recognition, admin panel, and user management.

## 🚀 Features

### Admin Panel
- Secure JWT authentication
- Criminal record management (CRUD operations)
- Face image upload with descriptor extraction
- Claims management with approve/reject workflow
- Dashboard with statistics and charts

### User Panel
- User registration and login
- Profile management with status display
- Warning timeline visualization
- Claim submission with proof upload
- Activity history

### Face Detection
- Real-time webcam face detection
- 128-D face descriptor matching
- Euclidean distance comparison (threshold < 0.6)
- Visual alerts with match confidence
- Detection logging

### Backend Features
- Worker threads for CPU-intensive face matching
- Rule-based criminal classification
- Warning level progression (LOW → MEDIUM → HIGH)
- MySQL database with proper relations

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Tailwind CSS, shadcn/ui, face-api.js |
| Backend | Node.js, Express.js, JWT, Multer |
| Database | MySQL |
| Concurrency | Worker Threads (Node.js) |

## 📁 Project Structure

```
criminal-face-detection/
├── server/                 # Backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Auth & error middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utilities & rule engine
│   │   ├── workers/       # Worker threads
│   │   └── app.js         # Main application
│   ├── schema.sql         # Database schema
│   ├── package.json
│   └── .env
├── client/                 # Frontend
│   ├── public/
│   │   └── models/        # face-api.js models
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## ⚙️ Installation

### Prerequisites
- Node.js >= 18.x
- MySQL >= 8.0
- npm or yarn

### 1. Clone the repository
```bash
cd "d:/New folder"
```

### 2. Setup Database
```bash
# Login to MySQL and run schema
mysql -u root -p < server/schema.sql
```

### 3. Configure Backend
```bash
cd server

# Install dependencies
npm install

# Update .env file with your MySQL credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=criminal_detection_db
```

### 4. Download face-api.js Models
Download models from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Place in `client/public/models/`:
- ssd_mobilenetv1_model-weights_manifest.json
- ssd_mobilenetv1_model-shard1
- ssd_mobilenetv1_model-shard2
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1
- face_recognition_model-shard2

### 5. Configure Frontend
```bash
cd client
npm install
```

## 🚀 Running the Application

### Start Backend
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

## 🔐 Default Credentials

```
Admin Login:
Email: admin@system.com
Password: admin123
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Get current user |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/criminal | Add criminal |
| GET | /api/admin/criminals | List criminals |
| PUT | /api/admin/criminal/:id | Update criminal |
| DELETE | /api/admin/criminal/:id | Delete criminal |
| GET | /api/admin/claims | Get claims |
| PUT | /api/admin/claim/:id/verify | Verify claim |
| GET | /api/admin/dashboard | Dashboard stats |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/profile | Get profile |
| GET | /api/user/warnings | Get warnings |
| POST | /api/user/claim | Submit claim |
| GET | /api/user/status | Get status |

### Detection
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/detect/face | Match face |
| GET | /api/detect/criminals | Get criminal descriptors |
| POST | /api/detect/log | Log detection |

## 🧵 Worker Threads Implementation

### Lab 4: Start, Sleep & Stop Threading
- Async execution with setTimeout/setInterval
- Controlled detection loops
- Sleep functionality for non-blocking waits

### Lab 5: Multithreading with Synchronization
- Worker threads for parallel face matching
- Mutex-like locking mechanism
- Synchronized access to shared resources

### Lab 6: Deadlock Prevention
- Timeout-based operations
- Message passing architecture
- Non-blocking event loop

## 📝 Business Rules

### Criminal Classification
```
IF violation_count >= 5 AND warnings_ignored = true
THEN status = CRIMINAL
```

### Warning Levels
```
1-2 violations → LOW
3-4 violations → MEDIUM
5+ violations  → HIGH + CRIMINAL status
```

### Claim Approval
```
IF claim approved
THEN status = NORMAL AND violation_count = 0
```

## 🔒 Security Features
- bcrypt password hashing
- JWT middleware protection
- Input validation with express-validator
- File upload sanitization
- CORS configuration

## 📜 License
ISC
