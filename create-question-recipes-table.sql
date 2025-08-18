-- Script para criar a tabela question_recipes no Supabase
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela já existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'question_recipes') THEN
        -- Criar a tabela question_recipes
        CREATE TABLE question_recipes (
            id SERIAL PRIMARY KEY,
            plan_id INTEGER NOT NULL,
            question_id VARCHAR(255) NOT NULL,
            question_name VARCHAR(500) NOT NULL,
            question_type VARCHAR(50) NOT NULL,
            min_value DECIMAL(10,2),
            max_value DECIMAL(10,2),
            expected_value DECIMAL(10,2),
            tolerance DECIMAL(10,2),
            unit VARCHAR(50),
            options JSONB,
            defect_type VARCHAR(100) NOT NULL,
            is_required BOOLEAN DEFAULT true,
            description TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Criar índice para melhor performance
        CREATE INDEX idx_question_recipes_plan_id ON question_recipes(plan_id);
        CREATE INDEX idx_question_recipes_question_id ON question_recipes(question_id);
        CREATE INDEX idx_question_recipes_active ON question_recipes(is_active);

        -- Adicionar foreign key constraint
        ALTER TABLE question_recipes 
        ADD CONSTRAINT fk_question_recipes_plan_id 
        FOREIGN KEY (plan_id) REFERENCES inspection_plans(id) ON DELETE CASCADE;

        -- Criar trigger para atualizar updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_question_recipes_updated_at 
        BEFORE UPDATE ON question_recipes 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Tabela question_recipes criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela question_recipes já existe!';
    END IF;
END $$;

-- Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'question_recipes'
ORDER BY ordinal_position;
