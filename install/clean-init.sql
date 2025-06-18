


-- ============================================
-- SISTEMA DE MEDIDORES - INICIALIZAÇÃO LIMPA
-- ============================================
-- Execute este script para inicializar o banco sem dados de exemplo
-- ============================================

-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS meter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meter;

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
    FOREIGN KEY (reader_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_reading_per_date (meter_id, reading_date)
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Criar índices para melhor performance
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
-- LIMPEZA DE DADOS EXISTENTES (se houver)
-- ============================================

-- Limpar todas as tabelas na ordem correta
DELETE FROM readings;
DELETE FROM meters;
DELETE FROM units;
DELETE FROM buildings;
DELETE FROM users;

-- ============================================
-- USUÁRIO ADMINISTRADOR PRINCIPAL
-- ============================================

-- Senha padrão: admin123 (hash bcrypt)
INSERT INTO users (id, name, email, password_hash, role) VALUES 
('admin-main', 'Administrador Principal', 'admin@medidores.local', '$2a$10$rXKXaELQz5e4zKZ3YxKq7OzBGzYLl9xZ7BhU/8.Y7X9QWERTYUIOP', 'admin');

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar instalação
SELECT 
    'BANCO LIMPO E INICIALIZADO' as status,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as administradores,
    (SELECT COUNT(*) FROM buildings) as edificios,
    (SELECT COUNT(*) FROM units) as unidades,
    (SELECT COUNT(*) FROM meters) as medidores,
    (SELECT COUNT(*) FROM readings) as leituras;

-- Mostrar usuário admin criado
SELECT 'ADMIN CRIADO:' as info, id, name, email, role, created_at FROM users WHERE role = 'admin';

COMMIT;


