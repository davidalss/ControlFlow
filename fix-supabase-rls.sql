-- 1) Desabilitar RLS nas tabelas principais (temporário para destravar o app)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inspection_plans DISABLE ROW LEVEL SECURITY;

-- 2) Ajustar permissões (GRANTs) para papéis usados pelo PostgREST
--    service_role = chave de serviço (backend); authenticated = usuários logados
GRANT USAGE ON SCHEMA public TO service_role, authenticated;


GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role, authenticated;

-- Garantir que novos objetos herdem os privilégios acima
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO service_role, authenticated;

-- 3) (Opcional) Se preferir manter RLS, crie políticas adequadas e depois reabilite o RLS
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

-- 4) Verificações rápidas
-- 4.1) Conferir status do RLS nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users','products','logs','inspection_plans')
ORDER BY tablename;

-- 4.2) Conferir contagem de dados
SELECT 'users' AS table_name, COUNT(*) AS count FROM public.users
UNION ALL
SELECT 'products' AS table_name, COUNT(*) AS count FROM public.products
UNION ALL
SELECT 'logs' AS table_name, COUNT(*) AS count FROM public.logs
UNION ALL
SELECT 'inspection_plans' AS table_name, COUNT(*) AS count FROM public.inspection_plans;

-- 4.3) Estrutura da tabela users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';
