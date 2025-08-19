-- Script para corrigir políticas RLS do Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS na tabela users (temporariamente)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Ou, se preferir manter RLS, criar políticas adequadas:
-- Habilitar RLS
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados leiam seus próprios dados
-- CREATE POLICY "Users can read own profile" ON public.users
--   FOR SELECT USING (auth.uid() = id);

-- Política para permitir que admins leiam todos os usuários
-- CREATE POLICY "Admins can read all users" ON public.users
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.users 
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- Política para permitir que usuários atualizem seus próprios dados
-- CREATE POLICY "Users can update own profile" ON public.users
--   FOR UPDATE USING (auth.uid() = id);

-- Política para permitir que admins criem usuários
-- CREATE POLICY "Admins can create users" ON public.users
--   FOR INSERT WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM public.users 
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- 3. Verificar se a tabela users tem dados
SELECT COUNT(*) FROM public.users;

-- 4. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';
