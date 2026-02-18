# 🚀 CrimDetect Portability & Migration Guide

Follow these steps to set up the project on a new laptop.

## 1. Prerequisites
- **Node.js**: Install version 18.x or higher.
- **MySQL**: Install MySQL 8.0+.
- **Git**: Ensure Git is installed for cloning (or copy the folder directly).

## 2. Database Setup (SQL)
You need to create the database and run the schema scripts.

1. **Create Database**:
   ```sql
   CREATE DATABASE criminal_detection_db;
   ```
2. **Import Schemas**:
   Run these files from the `server/extras` folder in your MySQL client:
   - `schema.sql` (Main system schema)
   - `complaints_schema.sql` (Complaints specific schema)
   - `Notification.sql` (Notifications schema)

3. **Run Migration Scripts** (Optional/Correction):
   If you need to migrate historical data or normalize area names:
   ```bash
   cd server
   node scripts/migrate_complaints.js
   node src/scripts/migrate_areas.js
   ```

## 3. Environment Variables (.env)
Create a `.env` file in the `server` directory with the following content:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=criminal_detection_db
JWT_SECRET=your_secret_key_here
```

## 4. Extra Steps (Facial Recognition Models) ⚠️
The project uses `face-api.js`, but the model files are often large and might be missing if they weren't part of the git repo.

1. Download the following models from [here](https://github.com/justadudewhohacks/face-api.js/tree/master/weights):
   - `ssd_mobilenetv1_model-weights_manifest.json`
   - `ssd_mobilenetv1_model-shard1`
   - `ssd_mobilenetv1_model-shard2`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`

2. Place these files in: `client/public/models/` (create the directory if it doesn't exist).

## 5. Running the Project
1. **Install Dependencies**:
   ```bash
   # In /server
   npm install
   # In /client (or root if using Vite/React)
   npm install
   ```
2. **Start Backend**:
   ```bash
   cd server
   npm run dev
   ```
3. **Start Frontend**:
   ```bash
   cd client
   npm run dev
   ```

## 🛠 Support Notes
- If the migration script fails, check if the `server/extras` folder exists and contains the `.sql` files.
- Ensure your MySQL user has permission to create and update tables.
