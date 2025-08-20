-- Script para habilitar RLS nas tabelas restantes
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- VERIFICAR TABELAS QUE AINDA ESTÃO COM RLS DESABILITADO
-- ========================================

-- Listar todas as tabelas com RLS desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    'RLS DESABILITADO' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false
ORDER BY tablename;

-- ========================================
-- HABILITAR RLS NAS TABELAS ESPECÍFICAS
-- ========================================

-- 1. TABELA: block (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'block') THEN
        ALTER TABLE public.block ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela: block';
        
        -- Criar políticas
        BEGIN
            CREATE POLICY "Users can view block" ON public.block FOR SELECT USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política SELECT criada para block';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política SELECT já existe para block';
        END;
        
        BEGIN
            CREATE POLICY "Users can create block" ON public.block FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            RAISE NOTICE 'Política INSERT criada para block';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política INSERT já existe para block';
        END;
        
        BEGIN
            CREATE POLICY "Users can update block" ON public.block FOR UPDATE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política UPDATE criada para block';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política UPDATE já existe para block';
        END;
        
        BEGIN
            CREATE POLICY "Users can delete block" ON public.block FOR DELETE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política DELETE criada para block';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política DELETE já existe para block';
        END;
    ELSE
        RAISE NOTICE 'Tabela block não encontrada';
    END IF;
END $$;

-- 1.1. TABELA: blocks (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blocks') THEN
        ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela: blocks';
        
        -- Criar políticas
        BEGIN
            CREATE POLICY "Users can view blocks" ON public.blocks FOR SELECT USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política SELECT criada para blocks';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política SELECT já existe para blocks';
        END;
        
        BEGIN
            CREATE POLICY "Users can create blocks" ON public.blocks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            RAISE NOTICE 'Política INSERT criada para blocks';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política INSERT já existe para blocks';
        END;
        
        BEGIN
            CREATE POLICY "Users can update blocks" ON public.blocks FOR UPDATE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política UPDATE criada para blocks';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política UPDATE já existe para blocks';
        END;
        
        BEGIN
            CREATE POLICY "Users can delete blocks" ON public.blocks FOR DELETE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política DELETE criada para blocks';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política DELETE já existe para blocks';
        END;
    ELSE
        RAISE NOTICE 'Tabela blocks não encontrada';
    END IF;
END $$;

-- 2. TABELA: inspections (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inspections') THEN
        ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela: inspections';
        
        -- Criar políticas
        BEGIN
            CREATE POLICY "Users can view inspections" ON public.inspections FOR SELECT USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política SELECT criada para inspections';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política SELECT já existe para inspections';
        END;
        
        BEGIN
            CREATE POLICY "Users can create inspections" ON public.inspections FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            RAISE NOTICE 'Política INSERT criada para inspections';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política INSERT já existe para inspections';
        END;
        
        BEGIN
            CREATE POLICY "Users can update inspections" ON public.inspections FOR UPDATE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política UPDATE criada para inspections';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política UPDATE já existe para inspections';
        END;
        
        BEGIN
            CREATE POLICY "Users can delete inspections" ON public.inspections FOR DELETE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política DELETE criada para inspections';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política DELETE já existe para inspections';
        END;
    ELSE
        RAISE NOTICE 'Tabela inspections não encontrada';
    END IF;
END $$;

-- 3. TABELA: notifications (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela: notifications';
        
        -- Criar políticas
        BEGIN
            CREATE POLICY "Users can view notifications" ON public.notifications FOR SELECT USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política SELECT criada para notifications';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política SELECT já existe para notifications';
        END;
        
        BEGIN
            CREATE POLICY "Users can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            RAISE NOTICE 'Política INSERT criada para notifications';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política INSERT já existe para notifications';
        END;
        
        BEGIN
            CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política UPDATE criada para notifications';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política UPDATE já existe para notifications';
        END;
        
        BEGIN
            CREATE POLICY "Users can delete notifications" ON public.notifications FOR DELETE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política DELETE criada para notifications';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política DELETE já existe para notifications';
        END;
    ELSE
        RAISE NOTICE 'Tabela notifications não encontrada';
    END IF;
END $$;

-- 4. TABELA: permissions (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'permissions') THEN
        ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela: permissions';
        
        -- Criar políticas
        BEGIN
            CREATE POLICY "Users can view permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política SELECT criada para permissions';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política SELECT já existe para permissions';
        END;
        
        BEGIN
            CREATE POLICY "Users can create permissions" ON public.permissions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            RAISE NOTICE 'Política INSERT criada para permissions';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política INSERT já existe para permissions';
        END;
        
        BEGIN
            CREATE POLICY "Users can update permissions" ON public.permissions FOR UPDATE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política UPDATE criada para permissions';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política UPDATE já existe para permissions';
        END;
        
        BEGIN
            CREATE POLICY "Users can delete permissions" ON public.permissions FOR DELETE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política DELETE criada para permissions';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política DELETE já existe para permissions';
        END;
    ELSE
        RAISE NOTICE 'Tabela permissions não encontrada';
    END IF;
END $$;

-- 5. TABELA: solicitations (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'solicitations') THEN
        ALTER TABLE public.solicitations ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela: solicitations';
        
        -- Criar políticas
        BEGIN
            CREATE POLICY "Users can view solicitations" ON public.solicitations FOR SELECT USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política SELECT criada para solicitations';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política SELECT já existe para solicitations';
        END;
        
        BEGIN
            CREATE POLICY "Users can create solicitations" ON public.solicitations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            RAISE NOTICE 'Política INSERT criada para solicitations';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política INSERT já existe para solicitations';
        END;
        
        BEGIN
            CREATE POLICY "Users can update solicitations" ON public.solicitations FOR UPDATE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política UPDATE criada para solicitations';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política UPDATE já existe para solicitations';
        END;
        
        BEGIN
            CREATE POLICY "Users can delete solicitations" ON public.solicitations FOR DELETE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política DELETE criada para solicitations';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política DELETE já existe para solicitations';
        END;
    ELSE
        RAISE NOTICE 'Tabela solicitations não encontrada';
    END IF;
END $$;

-- 6. TABELA: suppliers (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'suppliers') THEN
        ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela: suppliers';
        
        -- Criar políticas
        BEGIN
            CREATE POLICY "Users can view suppliers" ON public.suppliers FOR SELECT USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política SELECT criada para suppliers';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política SELECT já existe para suppliers';
        END;
        
        BEGIN
            CREATE POLICY "Users can create suppliers" ON public.suppliers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            RAISE NOTICE 'Política INSERT criada para suppliers';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política INSERT já existe para suppliers';
        END;
        
        BEGIN
            CREATE POLICY "Users can update suppliers" ON public.suppliers FOR UPDATE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política UPDATE criada para suppliers';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política UPDATE já existe para suppliers';
        END;
        
        BEGIN
            CREATE POLICY "Users can delete suppliers" ON public.suppliers FOR DELETE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política DELETE criada para suppliers';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política DELETE já existe para suppliers';
        END;
    ELSE
        RAISE NOTICE 'Tabela suppliers não encontrada';
    END IF;
END $$;

-- 7. TABELA: groups (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'groups') THEN
        ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela: groups';
        
        -- Criar políticas
        BEGIN
            CREATE POLICY "Users can view groups" ON public.groups FOR SELECT USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política SELECT criada para groups';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política SELECT já existe para groups';
        END;
        
        BEGIN
            CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            RAISE NOTICE 'Política INSERT criada para groups';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política INSERT já existe para groups';
        END;
        
        BEGIN
            CREATE POLICY "Users can update groups" ON public.groups FOR UPDATE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política UPDATE criada para groups';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política UPDATE já existe para groups';
        END;
        
        BEGIN
            CREATE POLICY "Users can delete groups" ON public.groups FOR DELETE USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política DELETE criada para groups';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Política DELETE já existe para groups';
        END;
    ELSE
        RAISE NOTICE 'Tabela groups não encontrada';
    END IF;
END $$;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar todas as tabelas com RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN 'RLS HABILITADO'
        ELSE 'RLS DESABILITADO'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
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
