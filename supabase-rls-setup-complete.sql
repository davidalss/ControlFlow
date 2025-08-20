-- Script completo para configurar RLS (Row Level Security) no Supabase
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. TABELA: inspection_plans
-- ========================================
ALTER TABLE public.inspection_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inspection plans" ON public.inspection_plans
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create inspection plans" ON public.inspection_plans
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update inspection plans" ON public.inspection_plans
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete inspection plans" ON public.inspection_plans
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 2. TABELA: products
-- ========================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view products" ON public.products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create products" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update products" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete products" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 3. TABELA: users
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create users" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update users" ON public.users
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete users" ON public.users
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 4. TABELA: inspections
-- ========================================
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inspections" ON public.inspections
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create inspections" ON public.inspections
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update inspections" ON public.inspections
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete inspections" ON public.inspections
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 5. TABELA: question_recipes
-- ========================================
ALTER TABLE public.question_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view question recipes" ON public.question_recipes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create question recipes" ON public.question_recipes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update question recipes" ON public.question_recipes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete question recipes" ON public.question_recipes
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 6. TABELA: logs
-- ========================================
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs" ON public.logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create logs" ON public.logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- 7. TABELA: suppliers
-- ========================================
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view suppliers" ON public.suppliers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create suppliers" ON public.suppliers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update suppliers" ON public.suppliers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete suppliers" ON public.suppliers
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 8. TABELA: groups
-- ========================================
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view groups" ON public.groups
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create groups" ON public.groups
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update groups" ON public.groups
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete groups" ON public.groups
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 9. TABELA: rnc
-- ========================================
ALTER TABLE public.rnc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rnc" ON public.rnc
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create rnc" ON public.rnc
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update rnc" ON public.rnc
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete rnc" ON public.rnc
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 10. TABELA: sgq
-- ========================================
ALTER TABLE public.sgq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sgq" ON public.sgq
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create sgq" ON public.sgq
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update sgq" ON public.sgq
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete sgq" ON public.sgq
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar todas as políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Verificar tabelas com RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'inspection_plans',
    'products', 
    'users',
    'inspections',
    'question_recipes',
    'logs',
    'suppliers',
    'groups',
    'rnc',
    'sgq'
)
ORDER BY tablename;

-- ========================================
-- DADOS DE TESTE (OPCIONAL)
-- ========================================

-- Inserir plano de inspeção de teste
INSERT INTO public.inspection_plans (
    plan_code,
    plan_name,
    plan_type,
    version,
    product_name,
    business_unit,
    inspection_type,
    sampling_method,
    inspection_steps,
    checklists,
    required_parameters,
    created_by
) VALUES (
    'PCG02.049',
    'Plano de Inspeção - Air Fryer 5L',
    'product',
    'Rev. 01',
    'Air Fryer 5L Digital',
    'KITCHEN_BEAUTY',
    'mixed',
    'Normal',
    '[]',
    '[]',
    '[]',
    '0ed6d5df-2838-4126-b9e9-cade6d47667a'
) ON CONFLICT (plan_code) DO NOTHING;

-- Inserir produto de teste
INSERT INTO public.products (
    code,
    name,
    description,
    business_unit,
    category,
    created_by
) VALUES (
    'AF-5L-001',
    'Air Fryer 5L Digital',
    'Fritadeira elétrica 5L com controle digital',
    'KITCHEN_BEAUTY',
    'Eletrodomésticos',
    '0ed6d5df-2838-4126-b9e9-cade6d47667a'
) ON CONFLICT (code) DO NOTHING;
