-- DESABILITAR RLS COMPLETAMENTE - SOLUÇÃO IMEDIATA
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS em todas as tabelas importantes
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas
DROP POLICY IF EXISTS "Users can view products" ON public.products;
DROP POLICY IF EXISTS "Users can create products" ON public.products;
DROP POLICY IF EXISTS "Users can update products" ON public.products;
DROP POLICY IF EXISTS "Users can delete products" ON public.products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.products;

-- Verificar se funcionou
SELECT 'RLS DESABILITADO' AS status;
