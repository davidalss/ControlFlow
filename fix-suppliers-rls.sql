-- Script para corrigir as políticas RLS da tabela suppliers
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Manter RLS ativo e apenas corrigir as políticas

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

-- 4. Garantir que RLS está ativo (NÃO desabilitar!)
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

-- 7. Se não houver dados, inserir dados de exemplo
INSERT INTO suppliers (
    code, name, type, country, category, status, 
    contact_person, email, phone, address, website,
    rating, audit_score, observations, is_active, created_by
) 
SELECT 
    'SUP001', 'Fornecedor Nacional A', 'national', 'Brasil', 'Eletrônicos', 'active', 
    'João Silva', 'joao@fornecedor.com', '(11) 99999-9999', 'Rua A, 123', 'www.fornecedor.com',
    4.5, 85.0, 'Fornecedor confiável', true, 'd85610ef-6430-4493-9ae2-8db20aa26d4e'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE code = 'SUP001');

INSERT INTO suppliers (
    code, name, type, country, category, status, 
    contact_person, email, phone, address, website,
    rating, audit_score, observations, is_active, created_by
) 
SELECT 
    'SUP002', 'Fornecedor Importado B', 'imported', 'China', 'Componentes', 'active',
    'Maria Santos', 'maria@importador.com', '(11) 88888-8888', 'Rua B, 456', 'www.importador.com',
    4.2, 78.0, 'Fornecedor internacional', true, 'd85610ef-6430-4493-9ae2-8db20aa26d4e'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE code = 'SUP002');

-- 8. Verificar dados após inserção
SELECT 
    code, 
    name, 
    type, 
    country, 
    category, 
    status,
    created_at
FROM suppliers 
ORDER BY created_at DESC;

-- 9. Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. Verificar políticas criadas
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

-- 11. Status final
SELECT 
    'Tabela suppliers corrigida' as status,
    COUNT(*) as total_suppliers,
    'RLS ATIVO com políticas corretas' as rls_status
FROM suppliers;
