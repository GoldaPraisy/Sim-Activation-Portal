-- Database schema for SIM Activation Portal
-- MySQL database: sim_activation_db

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS sim_activation_db;
USE sim_activation_db;

-- Drop tables in reverse order of dependencies to reset schema
DROP TABLE IF EXISTS activations;
DROP TABLE IF EXISTS sim_cards;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    id_number VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SIM Cards table
CREATE TABLE IF NOT EXISTS sim_cards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aadhaar_number VARCHAR(12) NOT NULL UNIQUE,
    msisdn VARCHAR(15) NOT NULL UNIQUE,
    network VARCHAR(50) NOT NULL,
    status ENUM('AVAILABLE', 'ACTIVATED', 'DEACTIVATED') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    network_name VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    benefits VARCHAR(255) NOT NULL,
    validity VARCHAR(50) NOT NULL
);

-- Activations table
CREATE TABLE IF NOT EXISTS activations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sim_card_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    plan VARCHAR(100) NOT NULL,
    status ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    activation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sim_card_id) REFERENCES sim_cards(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Indexes for better performance
-- CREATE INDEX idx_sim_cards_iccid ON sim_cards(iccid);
-- CREATE INDEX idx_sim_cards_msisdn ON sim_cards(msisdn);
-- CREATE INDEX idx_customers_email ON customers(email);
-- CREATE INDEX idx_customers_id_number ON customers(id_number);
-- CREATE INDEX idx_activations_sim_card ON activations(sim_card_id);
-- CREATE INDEX idx_activations_customer ON activations(customer_id);