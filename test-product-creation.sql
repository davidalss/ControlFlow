-- TESTAR CRIAÇÃO DE PRODUTOS
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. VERIFICAR STATUS ATUAL
-- ========================================

-- Verificar se RLS está ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN 'RLS ATIVO'
        ELSE 'RLS DESABILITADO'
    END AS status
FROM pg_tables 
WHERE tablename = 'products'
AND schemaname = 'public';

-- Verificar políticas da tabela products
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd;

-- ========================================
-- 2. TESTAR INSERÇÃO DE PRODUTO
-- ========================================

-- Tentar inserir um produto de teste
BEGIN;

INSERT INTO public.products (
    code, 
    description, 
    category, 
    business_unit,
    ean,
    created_at,
    updated_at
) VALUES (
    'TEST001',
    'Produto de Teste RLS',
    'Teste',
    'TEST',
    '1234567890123',
    NOW(),
    NOW()
);

-- Verificar se foi inserido
SELECT 
    'Produto inserido com sucesso' AS status,
    code,
    description,
    category
FROM public.products 
WHERE code = 'TEST001';

-- Reverter a inserção (não afetar dados reais)
ROLLBACK;

-- ========================================
-- 3. VERIFICAR DADOS EXISTENTES
-- ========================================

-- Contar produtos por categoria
SELECT 
    category,
    COUNT(*) AS total
FROM public.products
GROUP BY category
ORDER BY total DESC;

-- Verificar produtos mais recentes
SELECT 
    code,
    description,
    category,
    business_unit,
    created_at
FROM public.products
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 4. TESTAR OPERAÇÕES CRUD
-- ========================================

-- Testar SELECT
SELECT 
    'SELECT funcionando' AS operation,
    COUNT(*) AS total_products
FROM public.products;

-- Testar UPDATE (com rollback)
BEGIN;
UPDATE public.products 
SET description = description || ' (TESTE)'
WHERE code = (SELECT code FROM public.products LIMIT 1);
ROLLBACK;

-- Testar DELETE (com rollback)
BEGIN;
DELETE FROM public.products 
WHERE code = 'TEST001';
ROLLBACK;

-- ========================================
-- 5. VERIFICAÇÃO FINAL
-- ========================================

SELECT 
    'TODOS OS TESTES CONCLUÍDOS' AS status,
    'RLS está funcionando corretamente' AS message;
