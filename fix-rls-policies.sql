-- CORRIGIR POLÍTICAS RLS MANTENDO RLS ATIVO
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. CORRIGIR TABELA PRODUCTS
-- ========================================

-- Manter RLS ativo
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view products" ON public.products;
DROP POLICY IF EXISTS "Users can create products" ON public.products;
DROP POLICY IF EXISTS "Users can update products" ON public.products;
DROP POLICY IF EXISTS "Users can delete products" ON public.products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.products;

-- Criar políticas mais permissivas mas seguras
CREATE POLICY "products_select_policy" ON public.products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "products_insert_policy" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "products_update_policy" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "products_delete_policy" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 2. CORRIGIR TABELA SUPPLIERS
-- ========================================

-- Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers' AND table_schema = 'public') THEN
        CREATE TABLE public.suppliers (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(100),
            category VARCHAR(100),
            status VARCHAR(50) DEFAULT 'active',
            country VARCHAR(100),
            state VARCHAR(100),
            city VARCHAR(100),
            address TEXT,
            contact_person VARCHAR(255),
            contact_email VARCHAR(255),
            contact_phone VARCHAR(50),
            website VARCHAR(255),
            tax_id VARCHAR(50),
            registration_date DATE,
            evaluation_score DECIMAL(3,2),
            last_audit_date DATE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Configurar RLS para suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can create suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.suppliers;

-- Criar políticas para suppliers
CREATE POLICY "suppliers_select_policy" ON public.suppliers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "suppliers_insert_policy" ON public.suppliers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "suppliers_update_policy" ON public.suppliers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "suppliers_delete_policy" ON public.suppliers
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 3. CORRIGIR TABELA USERS
-- ========================================

-- Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        CREATE TABLE public.users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user',
            business_unit VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Configurar RLS para users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view users" ON public.users;
DROP POLICY IF EXISTS "Users can create users" ON public.users;
DROP POLICY IF EXISTS "Users can update users" ON public.users;
DROP POLICY IF EXISTS "Users can delete users" ON public.users;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.users;

-- Criar políticas para users
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "users_insert_policy" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "users_delete_policy" ON public.users
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 4. VERIFICAÇÃO FINAL
-- ========================================

-- Verificar status RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN 'RLS ATIVO - OK'
        ELSE 'RLS DESABILITADO - PROBLEMA!'
    END AS status
FROM pg_tables 
WHERE tablename IN ('products', 'suppliers', 'users')
AND schemaname = 'public';

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('products', 'suppliers', 'users')
ORDER BY tablename, cmd;

-- Contar registros
SELECT 'products' AS table_name, COUNT(*) AS total_records FROM public.products
UNION ALL
SELECT 'suppliers' AS table_name, COUNT(*) AS total_records FROM public.suppliers
UNION ALL
SELECT 'users' AS table_name, COUNT(*) AS total_records FROM public.users;
