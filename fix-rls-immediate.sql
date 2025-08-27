-- Script URGENTE para corrigir RLS na tabela products
-- Execute este script IMEDIATAMENTE no SQL Editor do Supabase

-- ========================================
-- SOLUÇÃO IMEDIATA: DESABILITAR RLS COMPLETAMENTE
-- ========================================

-- 1. Desabilitar RLS na tabela products
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view products" ON public.products;
DROP POLICY IF EXISTS "Users can create products" ON public.products;
DROP POLICY IF EXISTS "Users can update products" ON public.products;
DROP POLICY IF EXISTS "Users can delete products" ON public.products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.products;

-- 3. Verificar se RLS está desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'products' 
AND schemaname = 'public';

-- 4. Verificar se não há políticas
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'products';

-- 5. Verificar dados da tabela
SELECT 
    'products' AS table_name,
    COUNT(*) AS total_records
FROM public.products;

-- ========================================
-- VERIFICAR OUTRAS TABELAS IMPORTANTES
-- ========================================

-- Verificar se suppliers existe
SELECT 
    'suppliers' AS table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'suppliers' 
        AND table_schema = 'public'
    ) AS table_exists;

-- Verificar se users existe
SELECT 
    'users' AS table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
    ) AS table_exists;

-- ========================================
-- CRIAR TABELA SUPPLIERS SE NÃO EXISTIR
-- ========================================

CREATE TABLE IF NOT EXISTS public.suppliers (
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

-- Desabilitar RLS na tabela suppliers também
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;

-- ========================================
-- CRIAR TABELA USERS SE NÃO EXISTIR
-- ========================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    business_unit VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS na tabela users também
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar status de todas as tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN 'RLS ATIVO - PROBLEMA!'
        ELSE 'RLS DESABILITADO - OK'
    END AS status
FROM pg_tables 
WHERE tablename IN ('products', 'suppliers', 'users')
AND schemaname = 'public';

-- Contar registros em cada tabela
SELECT 'products' AS table_name, COUNT(*) AS total_records FROM public.products
UNION ALL
SELECT 'suppliers' AS table_name, COUNT(*) AS total_records FROM public.suppliers
UNION ALL
SELECT 'users' AS table_name, COUNT(*) AS total_records FROM public.users;
