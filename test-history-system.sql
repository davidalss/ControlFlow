-- TESTAR SISTEMA DE HISTÓRICO DE PRODUTOS
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. VERIFICAR SE EXISTE TABELA DE HISTÓRICO
-- ========================================

-- Verificar se existe tabela de histórico
SELECT 
    table_name,
    table_schema,
    CASE 
        WHEN table_name IS NOT NULL THEN 'TABELA EXISTE'
        ELSE 'TABELA NÃO EXISTE'
    END AS status
FROM information_schema.tables 
WHERE table_name LIKE '%history%' 
AND table_schema = 'public';

-- Verificar se existe tabela de logs
SELECT 
    table_name,
    table_schema,
    CASE 
        WHEN table_name IS NOT NULL THEN 'TABELA EXISTE'
        ELSE 'TABELA NÃO EXISTE'
    END AS status
FROM information_schema.tables 
WHERE table_name LIKE '%log%' 
AND table_schema = 'public';

-- ========================================
-- 2. VERIFICAR ESTRUTURA DA TABELA LOGS
-- ========================================

-- Verificar estrutura da tabela logs (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'logs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 3. VERIFICAR DADOS DE LOGS
-- ========================================

-- Verificar logs relacionados a produtos
SELECT 
    'logs' AS table_name,
    COUNT(*) AS total_logs
FROM public.logs
WHERE url LIKE '%product%';

-- Verificar logs recentes de produtos
SELECT 
    url,
    method,
    status,
    created_at,
    body
FROM public.logs
WHERE url LIKE '%product%'
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- 4. CRIAR TABELA DE HISTÓRICO SE NÃO EXISTIR
-- ========================================

-- Criar tabela de histórico de produtos se não existir
CREATE TABLE IF NOT EXISTS public.product_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_product_history_product_id ON public.product_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_history_action ON public.product_history(action);
CREATE INDEX IF NOT EXISTS idx_product_history_timestamp ON public.product_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_product_history_user_id ON public.product_history(user_id);

-- Configurar RLS
ALTER TABLE public.product_history ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "product_history_select_policy" ON public.product_history
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "product_history_insert_policy" ON public.product_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- 5. VERIFICAR DADOS DE HISTÓRICO
-- ========================================

-- Verificar se há dados de histórico
SELECT 
    'product_history' AS table_name,
    COUNT(*) AS total_records
FROM public.product_history;

-- Verificar histórico por ação
SELECT 
    action,
    COUNT(*) AS total
FROM public.product_history
GROUP BY action
ORDER BY total DESC;

-- Verificar histórico recente
SELECT 
    product_code,
    action,
    user_name,
    timestamp,
    description
FROM public.product_history
ORDER BY timestamp DESC
LIMIT 10;

-- ========================================
-- 6. TESTAR INSERÇÃO DE HISTÓRICO
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

-- Limpar dados de teste
DELETE FROM public.product_history WHERE product_code = 'TEST001';

-- ========================================
-- 7. VERIFICAÇÃO FINAL
-- ========================================

SELECT 
    'SISTEMA DE HISTÓRICO VERIFICADO' AS status,
    'Tabela product_history criada e configurada' AS message;
