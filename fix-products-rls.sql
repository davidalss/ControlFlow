-- Script para corrigir problemas de RLS na tabela products
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente na tabela products
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view products" ON public.products;
DROP POLICY IF EXISTS "Users can create products" ON public.products;
DROP POLICY IF EXISTS "Users can update products" ON public.products;
DROP POLICY IF EXISTS "Users can delete products" ON public.products;

-- 3. Reabilitar RLS com políticas mais permissivas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas mais permissivas
CREATE POLICY "Enable all operations for authenticated users" ON public.products
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 5. Verificar se a tabela products existe e tem dados
SELECT 
    'products' AS table_name,
    COUNT(*) AS total_records,
    COUNT(DISTINCT code) AS unique_codes
FROM public.products;

-- 6. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;
