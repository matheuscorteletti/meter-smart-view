
-- Script de inicialização do banco MySQL
-- Execute isso quando configurar o banco na sua infraestrutura

CREATE DATABASE IF NOT EXISTS meter;
USE meter;

-- Usuários
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL,
    building_id VARCHAR(36) NULL,
    unit_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Edifícios
CREATE TABLE buildings (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Unidades
CREATE TABLE units (
    id VARCHAR(36) PRIMARY KEY,
    building_id VARCHAR(36) NOT NULL,
    number VARCHAR(50) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_unit_per_building (building_id, number)
);

-- Medidores
CREATE TABLE meters (
    id VARCHAR(36) PRIMARY KEY,
    unit_id VARCHAR(36) NOT NULL,
    type ENUM('water', 'energy') NOT NULL,
    total_digits INT NOT NULL,
    calculation_digits INT NOT NULL,
    initial_reading DECIMAL(10,2) NOT NULL,
    threshold DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    UNIQUE KEY unique_meter_per_unit (unit_id, type)
);

-- Leituras
CREATE TABLE readings (
    id VARCHAR(36) PRIMARY KEY,
    meter_id VARCHAR(36) NOT NULL,
    reading DECIMAL(10,2) NOT NULL,
    consumption DECIMAL(10,2) NOT NULL,
    date TIMESTAMP NOT NULL,
    is_alert BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (meter_id) REFERENCES meters(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_building ON users(building_id);
CREATE INDEX idx_users_unit ON users(unit_id);
CREATE INDEX idx_units_building ON units(building_id);
CREATE INDEX idx_meters_unit ON meters(unit_id);
CREATE INDEX idx_meters_type ON meters(type);
CREATE INDEX idx_readings_meter ON readings(meter_id);
CREATE INDEX idx_readings_date ON readings(date);
CREATE INDEX idx_readings_alert ON readings(is_alert);

-- Dados de exemplo (usuário admin)
INSERT INTO users (id, name, email, password, role) VALUES 
('admin-1', 'Administrador', 'admin@demo.com', '$2b$10$exemplo_hash_aqui', 'admin');

-- Edifício exemplo
INSERT INTO buildings (id, name, address) VALUES 
('building-1', 'Edifício Central', 'Rua das Flores, 123');

-- Unidade exemplo
INSERT INTO units (id, building_id, number, floor) VALUES 
('unit-1', 'building-1', '101', '1');

-- Medidor exemplo
INSERT INTO meters (id, unit_id, type, total_digits, calculation_digits, initial_reading, threshold) VALUES 
('meter-1', 'unit-1', 'water', 8, 5, 12345.00, 50.00);

-- Leitura exemplo
INSERT INTO readings (id, meter_id, reading, consumption, date, is_alert) VALUES 
('reading-1', 'meter-1', 12395.00, 50.00, '2024-01-15 10:00:00', false);
