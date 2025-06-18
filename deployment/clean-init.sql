

-- ============================================
-- SISTEMA DE MEDIDORES - INICIALIZAÇÃO LIMPA
-- ============================================
-- Execute este script para inicializar o banco sem dados de exemplo
-- ============================================

-- Usar o banco de dados
USE meter;

-- ============================================
-- LIMPEZA DE DADOS EXISTENTES
-- ============================================

-- Limpar todas as tabelas na ordem correta (respeitando foreign keys)
DELETE FROM readings;
DELETE FROM meters;
DELETE FROM units;
DELETE FROM buildings;
DELETE FROM users WHERE role != 'admin' OR email NOT LIKE '%@medidores.local';

-- ============================================
-- RESETAR AUTO_INCREMENT (se necessário)
-- ============================================

-- Resetar contadores se usar auto_increment
-- ALTER TABLE readings AUTO_INCREMENT = 1;
-- ALTER TABLE meters AUTO_INCREMENT = 1;
-- ALTER TABLE units AUTO_INCREMENT = 1;
-- ALTER TABLE buildings AUTO_INCREMENT = 1;

-- ============================================
-- USUÁRIO ADMINISTRADOR PRINCIPAL
-- ============================================

-- Criar usuário admin principal (senha: admin123)
INSERT INTO users (id, name, email, password_hash, role) VALUES 
('admin-main', 'Administrador Principal', 'admin@medidores.local', '$2a$10$rXKXaELQz5e4zKZ3YxKq7OzBGzYLl9xZ7BhU/8.Y7X9QWERTYUIOP', 'admin')
ON DUPLICATE KEY UPDATE 
name = VALUES(name),
password_hash = VALUES(password_hash),
role = VALUES(role);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar estado do banco
SELECT 
    'BANCO LIMPO E PRONTO' as status,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as administradores,
    (SELECT COUNT(*) FROM buildings) as edificios,
    (SELECT COUNT(*) FROM units) as unidades,
    (SELECT COUNT(*) FROM meters) as medidores,
    (SELECT COUNT(*) FROM readings) as leituras;

-- Mostrar admin criado
SELECT 'ADMINISTRADOR DISPONÍVEL:' as info, id, name, email, role, created_at FROM users WHERE role = 'admin';

COMMIT;

