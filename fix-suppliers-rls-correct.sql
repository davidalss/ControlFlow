-- Script para corrigir as políticas RLS da tabela suppliers
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: NÃO desabilitar o RLS, apenas corrigir as políticas

-- 1. Verificar status atual
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN 'RLS ATIVO ✅'
        ELSE 'RLS DESABILITADO ❌'
    END AS status
FROM pg_tables 
WHERE tablename = 'suppliers' AND schemaname = 'public';

-- 2. Verificar políticas atuais
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'suppliers' AND schemaname = 'public';

-- 3. Remover políticas antigas que podem estar causando problemas
DROP POLICY IF EXISTS "suppliers_delete_policy" ON suppliers;
DROP POLICY IF EXISTS "suppliers_insert_policy" ON suppliers;
DROP POLICY IF EXISTS "suppliers_select_policy" ON suppliers;
DROP POLICY IF EXISTS "suppliers_update_policy" ON suppliers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON suppliers;
DROP POLICY IF EXISTS "suppliers_all_policy" ON suppliers;

-- 4. Garantir que RLS está ativo
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas corretas para usuários autenticados
CREATE POLICY "suppliers_select_policy" ON suppliers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "suppliers_insert_policy" ON suppliers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "suppliers_update_policy" ON suppliers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "suppliers_delete_policy" ON suppliers
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Verificar se há dados na tabela
SELECT COUNT(*) as total_suppliers FROM suppliers;

-- 7. Verificar políticas criadas
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'suppliers' AND schemaname = 'public'
ORDER BY cmd;

-- 8. Status final
SELECT 
    'Tabela suppliers corrigida' as status,
    COUNT(*) as total_suppliers,
    'RLS ATIVO com políticas corretas' as rls_status
FROM suppliers;
