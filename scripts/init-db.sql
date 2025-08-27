-- Script de inicialização do banco de dados para desenvolvimento local
-- Este script é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    business_unit VARCHAR(50),
    photo VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE
);

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs do sistema
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    ean VARCHAR(50),
    category VARCHAR(100),
    business_unit VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de inspeções
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    inspector_id UUID REFERENCES users(id),
    inspection_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    result JSONB,
    photos TEXT[],
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de planos de inspeção
CREATE TABLE IF NOT EXISTS inspection_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'draft',
    config JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_inspections_product_id ON inspections(product_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspection_plans_name ON inspection_plans(name);

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO users (email, password, name, role) 
VALUES (
    'admin@enso.com',
    crypt('admin123', gen_salt('bf')),
    'Administrador',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Inserir usuário de teste (senha: test123)
INSERT INTO users (email, name, password_hash, role) 
VALUES (
    'test@enso.com',
    'Usuário Teste',
    crypt('test123', gen_salt('bf')),
    'user'
) ON CONFLICT (email) DO NOTHING;

-- Inserir alguns produtos de exemplo
INSERT INTO products (code, description, ean, category, business_unit) 
VALUES 
    ('PROD001', 'Ventilador de Mesa 30cm', '7891234567890', 'Ventiladores', 'MOTOR_COMFORT'),
    ('PROD002', 'Aspirador de Pó Portátil', '7891234567891', 'Aspiradores', 'DIY'),
    ('PROD003', 'Liquidificador Profissional', '7891234567892', 'Eletrodomésticos', 'KITCHEN_BEAUTY')
ON CONFLICT (code) DO NOTHING;

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_plans_updated_at BEFORE UPDATE ON inspection_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configurar RLS (Row Level Security) se necessário
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_plans ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view all products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Users can view inspections they created" ON inspections
    FOR SELECT USING (auth.uid() = inspector_id);

CREATE POLICY "Users can view all inspection plans" ON inspection_plans
    FOR SELECT USING (true);
