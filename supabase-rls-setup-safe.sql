-- Script seguro para configurar RLS (Row Level Security) no Supabase
-- Execute este script no SQL Editor do Supabase
-- Este script verifica se cada tabela existe antes de tentar habilitar RLS

-- ========================================
-- FUNÇÃO AUXILIAR PARA VERIFICAR SE TABELA EXISTE
-- ========================================
CREATE OR REPLACE FUNCTION table_exists(p_table_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = p_table_name
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FUNÇÃO AUXILIAR PARA HABILITAR RLS EM TABELA
-- ========================================
CREATE OR REPLACE FUNCTION enable_rls_safe(p_table_name text)
RETURNS void AS $$
BEGIN
    IF table_exists(p_table_name) THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table_name);
        RAISE NOTICE 'RLS habilitado na tabela: %', p_table_name;
    ELSE
        RAISE NOTICE 'Tabela não encontrada: %', p_table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FUNÇÃO AUXILIAR PARA CRIAR POLÍTICAS
-- ========================================
CREATE OR REPLACE FUNCTION create_policies_safe(p_table_name text)
RETURNS void AS $$
BEGIN
    IF table_exists(p_table_name) THEN
        -- Política de SELECT
        BEGIN
            EXECUTE format('
                CREATE POLICY "Users can view %s" ON public.%I
                FOR SELECT USING (auth.role() = ''authenticated'')
            ', p_table_name, p_table_name);
            RAISE NOTICE 'Política SELECT criada para tabela: %', p_table_name;
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política SELECT já existe para tabela: %', p_table_name;
        END;
        
        -- Política de INSERT
        BEGIN
            EXECUTE format('
                CREATE POLICY "Users can create %s" ON public.%I
                FOR INSERT WITH CHECK (auth.role() = ''authenticated'')
            ', p_table_name, p_table_name);
            RAISE NOTICE 'Política INSERT criada para tabela: %', p_table_name;
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política INSERT já existe para tabela: %', p_table_name;
        END;
        
        -- Política de UPDATE
        BEGIN
            EXECUTE format('
                CREATE POLICY "Users can update %s" ON public.%I
                FOR UPDATE USING (auth.role() = ''authenticated'')
            ', p_table_name, p_table_name);
            RAISE NOTICE 'Política UPDATE criada para tabela: %', p_table_name;
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política UPDATE já existe para tabela: %', p_table_name;
        END;
        
        -- Política de DELETE
        BEGIN
            EXECUTE format('
                CREATE POLICY "Users can delete %s" ON public.%I
                FOR DELETE USING (auth.role() = ''authenticated'')
            ', p_table_name, p_table_name);
            RAISE NOTICE 'Política DELETE criada para tabela: %', p_table_name;
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política DELETE já existe para tabela: %', p_table_name;
        END;
        
        RAISE NOTICE 'Todas as políticas criadas para tabela: %', p_table_name;
    ELSE
        RAISE NOTICE 'Tabela não encontrada para políticas: %', p_table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- LISTA DE TABELAS PARA VERIFICAR
-- ========================================
DO $$
DECLARE
    table_list text[] := ARRAY[
        'acceptance_recipes',
        'approval_decisions',
        'Blocos',
        'chat_contexts',
        'chat_messages',
        'chat_sessions',
        'group_members',
        'Grupos',
        'inspection_plan_products',
        'inspection_plan_revisions',
        'inspection_plans',
        'inspection_results',
        'Inspecções',
        'Logs',
        'Notificações',
        'nqa_table',
        'Permissões',
        'Produtos',
        'rnc_history',
        'rnc_records',
        'role_permissions',
        'solicitation_assignments',
        'Solicitações',
        'supplier_audits',
        'supplier_evaluations',
        'supplier_products',
        'Fornecedores',
        'Usuários'
    ];
    table_name text;
BEGIN
    RAISE NOTICE '=== INICIANDO CONFIGURAÇÃO DE RLS ===';
    
    -- Primeiro, listar todas as tabelas que existem
    RAISE NOTICE '=== TABELAS EXISTENTES ===';
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = ANY(table_list)
        ORDER BY tablename
    LOOP
        RAISE NOTICE 'Tabela encontrada: %', table_name;
    END LOOP;
    
    -- Habilitar RLS apenas nas tabelas que existem
    RAISE NOTICE '=== HABILITANDO RLS ===';
    FOREACH table_name IN ARRAY table_list
    LOOP
        PERFORM enable_rls_safe(table_name);
    END LOOP;
    
    -- Criar políticas apenas nas tabelas que existem
    RAISE NOTICE '=== CRIANDO POLÍTICAS ===';
    FOREACH table_name IN ARRAY table_list
    LOOP
        PERFORM create_policies_safe(table_name);
    END LOOP;
    
    RAISE NOTICE '=== CONFIGURAÇÃO CONCLUÍDA ===';
END $$;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar tabelas com RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ========================================
-- LIMPEZA (OPCIONAL - REMOVER FUNÇÕES AUXILIARES)
-- ========================================
-- Descomente as linhas abaixo se quiser remover as funções auxiliares
-- DROP FUNCTION IF EXISTS table_exists(text);
-- DROP FUNCTION IF EXISTS enable_rls_safe(text);
-- DROP FUNCTION IF EXISTS create_policies_safe(text);
