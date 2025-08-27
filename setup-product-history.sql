-- CONFIGURAR SISTEMA DE HISTÓRICO DE PRODUTOS
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ========================================

-- Verificar todas as tabelas do schema public
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ========================================
-- 2. VERIFICAR SE EXISTE TABELA DE HISTÓRICO
-- ========================================

-- Verificar se existe tabela product_history
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'product_history' 
            AND table_schema = 'public'
        ) THEN 'TABELA product_history EXISTE'
        ELSE 'TABELA product_history NÃO EXISTE'
    END AS status;

-- ========================================
-- 3. CRIAR TABELA DE HISTÓRICO
-- ========================================

-- Criar tabela de histórico de produtos
CREATE TABLE IF NOT EXISTS public.product_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    changes JSONB,
    user_id UUID,
    user_name VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_product_history_product_id ON public.product_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_history_action ON public.product_history(action);
CREATE INDEX IF NOT EXISTS idx_product_history_timestamp ON public.product_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_product_history_user_id ON public.product_history(user_id);
CREATE INDEX IF NOT EXISTS idx_product_history_product_code ON public.product_history(product_code);

-- ========================================
-- 5. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ========================================

-- Habilitar RLS na tabela
ALTER TABLE public.product_history ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "product_history_select_policy" ON public.product_history;
DROP POLICY IF EXISTS "product_history_insert_policy" ON public.product_history;
DROP POLICY IF EXISTS "product_history_update_policy" ON public.product_history;
DROP POLICY IF EXISTS "product_history_delete_policy" ON public.product_history;

-- Criar políticas RLS
CREATE POLICY "product_history_select_policy" ON public.product_history
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "product_history_insert_policy" ON public.product_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "product_history_update_policy" ON public.product_history
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "product_history_delete_policy" ON public.product_history
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 6. VERIFICAR CONFIGURAÇÃO
-- ========================================

-- Verificar se a tabela foi criada
SELECT 
    'product_history' AS table_name,
    COUNT(*) AS total_records
FROM public.product_history;

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'product_history';

-- ========================================
-- 7. TESTAR INSERÇÃO
-- ========================================

-- Inserir registro de teste
INSERT INTO public.product_history (
    product_id,
    product_code,
    action,
    changes,
    user_name,
    description,
    data
) VALUES (
    (SELECT id FROM public.products LIMIT 1),
    'TEST001',
    'create',
    '{"field": "code", "newValue": "TEST001"}',
    'Usuário Teste',
    'Produto de teste criado',
    '{"code": "TEST001", "description": "Produto de teste"}'
);

-- Verificar se foi inserido
SELECT 
    'Teste de inserção' AS status,
    COUNT(*) AS records_inserted
FROM public.product_history
WHERE product_code = 'TEST001';

-- ========================================
-- 8. CRIAR FUNÇÃO PARA INSERIR HISTÓRICO
-- ========================================

-- Função para inserir histórico automaticamente
CREATE OR REPLACE FUNCTION insert_product_history(
    p_product_id UUID,
    p_product_code VARCHAR(50),
    p_action VARCHAR(20),
    p_changes JSONB,
    p_user_name VARCHAR(255),
    p_description TEXT,
    p_data JSONB
) RETURNS UUID AS $$
DECLARE
    history_id UUID;
BEGIN
    INSERT INTO public.product_history (
        product_id,
        product_code,
        action,
        changes,
        user_name,
        description,
        data
    ) VALUES (
        p_product_id,
        p_product_code,
        p_action,
        p_changes,
        p_user_name,
        p_description,
        p_data
    ) RETURNING id INTO history_id;
    
    RETURN history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. VERIFICAÇÃO FINAL
-- ========================================

-- Limpar dados de teste
DELETE FROM public.product_history WHERE product_code = 'TEST001';

-- Status final
SELECT 
    'SISTEMA DE HISTÓRICO CONFIGURADO' AS status,
    'Tabela product_history criada e configurada com RLS' AS message,
    (SELECT COUNT(*) FROM public.product_history) AS total_records;
