
-- Adicionar campos para reset de senha na tabela users
ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_token_expiry DATETIME NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_users_reset_token ON users(reset_token);
CREATE INDEX idx_users_email ON users(email);
