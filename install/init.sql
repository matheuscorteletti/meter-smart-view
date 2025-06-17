
-- ============================================
-- SISTEMA DE MEDIDORES - SCRIPT DE INSTALAÇÃO
-- ============================================
-- Execute este script no seu servidor MySQL
-- Host: 192.168.100.240
-- ============================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS meter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meter;

-- Criar usuário específico para a aplicação
CREATE USER IF NOT EXISTS 'meter'@'%' IDENTIFIED BY 'MeterSystem2024!';
GRANT ALL PRIVILEGES ON meter.* TO 'meter'@'%';
FLUSH PRIVILEGES;

-- ============================================
-- ESTRUTURA DAS TABELAS
-- ============================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    building_id VARCHAR(36) NULL,
    unit_id VARCHAR(36) NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de edifícios
CREATE TABLE IF NOT EXISTS buildings (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    contact_phone VARCHAR(20) NULL,
    contact_email VARCHAR(100) NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de unidades
CREATE TABLE IF NOT EXISTS units (
    id VARCHAR(36) PRIMARY KEY,
    building_id VARCHAR(36) NOT NULL,
    number VARCHAR(50) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    owner_name VARCHAR(255) NULL,
    owner_email VARCHAR(100) NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_unit_per_building (building_id, number)
);

-- Tabela de medidores
CREATE TABLE IF NOT EXISTS meters (
    id VARCHAR(36) PRIMARY KEY,
    unit_id VARCHAR(36) NOT NULL,
    type ENUM('water', 'energy') NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    brand VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    total_digits INT NOT NULL DEFAULT 8,
    calculation_digits INT NOT NULL DEFAULT 5,
    initial_reading DECIMAL(12,5) NOT NULL DEFAULT 0,
    threshold DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    active BOOLEAN DEFAULT TRUE,
    installation_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

-- Tabela de leituras
CREATE TABLE IF NOT EXISTS readings (
    id VARCHAR(36) PRIMARY KEY,
    meter_id VARCHAR(36) NOT NULL,
    reading DECIMAL(12,5) NOT NULL,
    consumption DECIMAL(12,5) NOT NULL DEFAULT 0,
    reading_date DATE NOT NULL,
    is_alert BOOLEAN DEFAULT FALSE,
    alert_reason VARCHAR(255) NULL,
    notes TEXT NULL,
    reader_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (meter_id) REFERENCES meters(id) ON DELETE CASCADE,
    FOREIGN KEY (reader_id) REFERENCES users(id) ON SET NULL,
    UNIQUE KEY unique_reading_per_date (meter_id, reading_date)
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_building ON users(building_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_units_building ON units(building_id);
CREATE INDEX idx_meters_unit ON meters(unit_id);
CREATE INDEX idx_meters_type ON meters(type);
CREATE INDEX idx_readings_meter ON readings(meter_id);
CREATE INDEX idx_readings_date ON readings(reading_date);
CREATE INDEX idx_readings_alert ON readings(is_alert);

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Usuário administrador padrão
INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES 
('admin-001', 'Administrador Sistema', 'admin@medidores.local', '$2b$10$exemplo_hash_trocar_por_hash_real', 'admin');

-- Edifício de exemplo
INSERT IGNORE INTO buildings (id, name, address, contact_phone, contact_email) VALUES 
('building-001', 'Edifício Exemplo', 'Rua das Flores, 123 - Centro', '(11) 99999-9999', 'contato@edificio.com');

-- Unidade de exemplo
INSERT IGNORE INTO units (id, building_id, number, floor, owner_name, owner_email) VALUES 
('unit-001', 'building-001', '101', '1º Andar', 'João Silva', 'joao@email.com');

-- Medidores de exemplo
INSERT IGNORE INTO meters (id, unit_id, type, serial_number, brand, model, initial_reading, threshold) VALUES 
('meter-001', 'unit-001', 'water', 'H2O-001-2024', 'AquaMeter', 'AM-500', 12345.50000, 50.00),
('meter-002', 'unit-001', 'energy', 'ELE-001-2024', 'EnergyTech', 'ET-300', 54321.00000, 100.00);

-- ============================================
-- VERIFICAÇÃO DA INSTALAÇÃO
-- ============================================

-- Mostrar resumo da instalação
SELECT 'INSTALAÇÃO CONCLUÍDA' as status;
SELECT 'Usuários cadastrados:' as info, COUNT(*) as total FROM users;
SELECT 'Edifícios cadastrados:' as info, COUNT(*) as total FROM buildings;
SELECT 'Unidades cadastradas:' as info, COUNT(*) as total FROM units;
SELECT 'Medidores cadastrados:' as info, COUNT(*) as total FROM meters;

-- ============================================
-- COMANDOS ÚTEIS PARA ADMINISTRAÇÃO
-- ============================================

-- Para criar um novo usuário admin:
-- INSERT INTO users (id, name, email, password_hash, role) VALUES 
-- (UUID(), 'Seu Nome', 'seu@email.com', '$2b$10$hash_da_senha', 'admin');

-- Para resetar senha do admin (execute separadamente):
-- UPDATE users SET password_hash = '$2b$10$novo_hash_aqui' WHERE email = 'admin@medidores.local';

-- Para backup da base:
-- mysqldump -h 192.168.100.240 -u meter -p meter > backup_medidores.sql

COMMIT;
