-- VERIFICAR STATUS DA AUTENTICAÇÃO E RLS
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. VERIFICAR FUNÇÃO DE AUTENTICAÇÃO
-- ========================================

-- Verificar se a função auth.role() está funcionando
SELECT 
    'auth.role()' AS function_name,
    auth.role() AS current_role;

-- Verificar se auth.uid() está funcionando
SELECT 
    'auth.uid()' AS function_name,
    auth.uid() AS current_user_id;

-- ========================================
-- 2. VERIFICAR STATUS RLS DAS TABELAS
-- ========================================

-- Verificar se RLS está ativo nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN 'RLS ATIVO'
        ELSE 'RLS DESABILITADO'
    END AS status
FROM pg_tables 
WHERE tablename IN ('products', 'suppliers', 'users')
AND schemaname = 'public';

-- ========================================
-- 3. VERIFICAR POLÍTICAS EXISTENTES
-- ========================================

-- Verificar políticas da tabela products
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
WHERE tablename = 'products'
ORDER BY cmd;

-- ========================================
-- 4. TESTAR ACESSO À TABELA PRODUCTS
-- ========================================

-- Tentar fazer um SELECT simples
SELECT 
    'SELECT test' AS operation,
    COUNT(*) AS record_count
FROM public.products
LIMIT 1;

-- ========================================
-- 5. VERIFICAR ESTRUTURA DA TABELA
-- ========================================

-- Verificar se a tabela products tem a estrutura correta
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 6. VERIFICAR DADOS EXISTENTES
-- ========================================

-- Verificar quantos produtos existem
SELECT 
    'products' AS table_name,
    COUNT(*) AS total_records,
    COUNT(DISTINCT code) AS unique_codes
FROM public.products;

-- ========================================
-- 7. TESTAR INSERÇÃO SIMPLES
-- ========================================

-- Tentar inserir um produto de teste (será revertido)
BEGIN;

-- Inserir produto de teste
INSERT INTO public.products (code, description, category, business_unit)
VALUES ('TEST001', 'Produto de Teste', 'Teste', 'TEST');

-- Verificar se foi inserido
SELECT 
    'INSERT test' AS operation,
    COUNT(*) AS record_count
FROM public.products 
WHERE code = 'TEST001';

-- Reverter a inserção
ROLLBACK;

-- ========================================
-- 8. VERIFICAR LOGS DE ERRO
-- ========================================

-- Verificar se há logs de erro recentes
SELECT 
    'No logs available in this context' AS note;
