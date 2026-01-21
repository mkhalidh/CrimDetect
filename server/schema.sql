-- ============================================
-- Criminal Face Detection System - Database Schema
-- MySQL Database Schema with all required tables
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS criminal_detection_db;
USE criminal_detection_db;

-- ============================================
-- Users Table
-- Stores admin and user accounts
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Persons Table
-- Stores personal information and face descriptors
-- ============================================
CREATE TABLE IF NOT EXISTS persons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    name VARCHAR(255) NOT NULL,
    age INT,
    cnic VARCHAR(50),
    image_url VARCHAR(500),
    face_descriptor JSON,
    status ENUM('NORMAL', 'UNDER_OBSERVATION', 'CRIMINAL') DEFAULT 'NORMAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_cnic (cnic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Criminal Records Table
-- Stores crime details for persons marked as criminals
-- ============================================
CREATE TABLE IF NOT EXISTS criminal_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    person_id INT NOT NULL,
    crime_type VARCHAR(100) NOT NULL,
    description TEXT,
    risk_level ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'LOW',
    violation_count INT DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    INDEX idx_crime_type (crime_type),
    INDEX idx_risk_level (risk_level),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Warnings Table
-- Tracks warning history for persons
-- ============================================
CREATE TABLE IF NOT EXISTS warnings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    person_id INT NOT NULL,
    warning_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    message TEXT,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    INDEX idx_warning_level (warning_level),
    INDEX idx_person_id (person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Claims Table
-- Stores user appeals/claims for status disputes
-- ============================================
CREATE TABLE IF NOT EXISTS claims (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    person_id INT NOT NULL,
    reason TEXT NOT NULL,
    proof_url VARCHAR(500),
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Detection Logs Table
-- Records all face detection events
-- ============================================
CREATE TABLE IF NOT EXISTS detection_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    person_id INT NOT NULL,
    confidence DECIMAL(5, 4),
    location VARCHAR(255),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    INDEX idx_person_id (person_id),
    INDEX idx_detected_at (detected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert default admin user
-- Password: admin123 (bcrypt hashed)
-- ============================================
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@system.com', '$2a$10$5K8QhQ5.WNqNHPLCx5M7R.KjZ9kL5xqGq6l2T5cXZxv6JqZ.Qz/Gy', 'admin')
ON DUPLICATE KEY UPDATE name = name;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- Uncomment below to add sample criminal data

/*
INSERT INTO persons (name, age, cnic, status) VALUES 
('John Doe', 35, '12345-6789012-3', 'CRIMINAL'),
('Jane Smith', 28, '98765-4321098-7', 'UNDER_OBSERVATION');

INSERT INTO criminal_records (person_id, crime_type, description, risk_level, violation_count, verified) VALUES 
(1, 'Theft', 'Multiple theft incidents in downtown area', 'HIGH', 5, TRUE),
(2, 'Fraud', 'Financial fraud investigation', 'MEDIUM', 2, FALSE);
*/
