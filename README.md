#  CrimDetect Portability & Migration Guide

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

   cd server
   
## 3. Connect With Xamp
- Open Xamp
- Start Apache and MySQL
- Open phpMyAdmin
- Create a database named `criminal_detection_db`
- Import the schemas from `server/extras`
   - `schema.sql` (Main system schema)
   - `complaints_schema.sql` (Complaints specific schema)
   - `Notification.sql` (Notifications schema)
 
  modals download
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
