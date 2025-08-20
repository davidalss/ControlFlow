-- Script completo para configurar RLS (Row Level Security) em TODAS as tabelas do Supabase
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. TABELA: acceptance_recipes
-- ========================================
ALTER TABLE public.acceptance_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view acceptance recipes" ON public.acceptance_recipes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create acceptance recipes" ON public.acceptance_recipes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update acceptance recipes" ON public.acceptance_recipes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete acceptance recipes" ON public.acceptance_recipes
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 2. TABELA: approval_decisions
-- ========================================
ALTER TABLE public.approval_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approval decisions" ON public.approval_decisions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create approval decisions" ON public.approval_decisions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update approval decisions" ON public.approval_decisions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete approval decisions" ON public.approval_decisions
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 3. TABELA: Blocos
-- ========================================
ALTER TABLE public."Blocos" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view Blocos" ON public."Blocos"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create Blocos" ON public."Blocos"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update Blocos" ON public."Blocos"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete Blocos" ON public."Blocos"
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 4. TABELA: chat_contexts
-- ========================================
ALTER TABLE public.chat_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat contexts" ON public.chat_contexts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create chat contexts" ON public.chat_contexts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update chat contexts" ON public.chat_contexts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete chat contexts" ON public.chat_contexts
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 5. TABELA: chat_messages
-- ========================================
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat messages" ON public.chat_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update chat messages" ON public.chat_messages
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete chat messages" ON public.chat_messages
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 6. TABELA: chat_sessions
-- ========================================
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat sessions" ON public.chat_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create chat sessions" ON public.chat_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update chat sessions" ON public.chat_sessions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete chat sessions" ON public.chat_sessions
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 7. TABELA: group_members
-- ========================================
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group members" ON public.group_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create group members" ON public.group_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update group members" ON public.group_members
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete group members" ON public.group_members
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 8. TABELA: Grupos
-- ========================================
ALTER TABLE public."Grupos" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view Grupos" ON public."Grupos"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create Grupos" ON public."Grupos"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update Grupos" ON public."Grupos"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete Grupos" ON public."Grupos"
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 9. TABELA: inspection_plan_products
-- ========================================
ALTER TABLE public.inspection_plan_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inspection plan products" ON public.inspection_plan_products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create inspection plan products" ON public.inspection_plan_products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update inspection plan products" ON public.inspection_plan_products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete inspection plan products" ON public.inspection_plan_products
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 10. TABELA: inspection_plan_revisions
-- ========================================
ALTER TABLE public.inspection_plan_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inspection plan revisions" ON public.inspection_plan_revisions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create inspection plan revisions" ON public.inspection_plan_revisions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update inspection plan revisions" ON public.inspection_plan_revisions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete inspection plan revisions" ON public.inspection_plan_revisions
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 11. TABELA: inspection_plans
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
-- 12. TABELA: inspection_results
-- ========================================
ALTER TABLE public.inspection_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inspection results" ON public.inspection_results
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create inspection results" ON public.inspection_results
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update inspection results" ON public.inspection_results
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete inspection results" ON public.inspection_results
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 13. TABELA: Inspecções
-- ========================================
ALTER TABLE public."Inspecções" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view Inspecções" ON public."Inspecções"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create Inspecções" ON public."Inspecções"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update Inspecções" ON public."Inspecções"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete Inspecções" ON public."Inspecções"
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 14. TABELA: Logs
-- ========================================
ALTER TABLE public."Logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view Logs" ON public."Logs"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create Logs" ON public."Logs"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- 15. TABELA: Notificações
-- ========================================
ALTER TABLE public."Notificações" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view Notificações" ON public."Notificações"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create Notificações" ON public."Notificações"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update Notificações" ON public."Notificações"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete Notificações" ON public."Notificações"
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 16. TABELA: nqa_table
-- ========================================
ALTER TABLE public.nqa_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view nqa table" ON public.nqa_table
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create nqa table" ON public.nqa_table
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update nqa table" ON public.nqa_table
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete nqa table" ON public.nqa_table
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 17. TABELA: Permissões
-- ========================================
ALTER TABLE public."Permissões" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view Permissões" ON public."Permissões"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create Permissões" ON public."Permissões"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update Permissões" ON public."Permissões"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete Permissões" ON public."Permissões"
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 18. TABELA: Produtos
-- ========================================
ALTER TABLE public."Produtos" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view Produtos" ON public."Produtos"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create Produtos" ON public."Produtos"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update Produtos" ON public."Produtos"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete Produtos" ON public."Produtos"
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 19. TABELA: rnc_history
-- ========================================
ALTER TABLE public.rnc_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rnc history" ON public.rnc_history
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create rnc history" ON public.rnc_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update rnc history" ON public.rnc_history
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete rnc history" ON public.rnc_history
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 20. TABELA: rnc_records
-- ========================================
ALTER TABLE public.rnc_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rnc records" ON public.rnc_records
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create rnc records" ON public.rnc_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update rnc records" ON public.rnc_records
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete rnc records" ON public.rnc_records
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 21. TABELA: role_permissions
-- ========================================
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view role permissions" ON public.role_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create role permissions" ON public.role_permissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update role permissions" ON public.role_permissions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete role permissions" ON public.role_permissions
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 22. TABELA: solicitation_assignments
-- ========================================
ALTER TABLE public.solicitation_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view solicitation assignments" ON public.solicitation_assignments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create solicitation assignments" ON public.solicitation_assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update solicitation assignments" ON public.solicitation_assignments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete solicitation assignments" ON public.solicitation_assignments
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 23. TABELA: Solicitações
-- ========================================
ALTER TABLE public."Solicitações" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view Solicitações" ON public."Solicitações"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create Solicitações" ON public."Solicitações"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update Solicitações" ON public."Solicitações"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete Solicitações" ON public."Solicitações"
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 24. TABELA: supplier_audits
-- ========================================
ALTER TABLE public.supplier_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view supplier audits" ON public.supplier_audits
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create supplier audits" ON public.supplier_audits
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update supplier audits" ON public.supplier_audits
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete supplier audits" ON public.supplier_audits
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 25. TABELA: supplier_evaluations
-- ========================================
ALTER TABLE public.supplier_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view supplier evaluations" ON public.supplier_evaluations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create supplier evaluations" ON public.supplier_evaluations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update supplier evaluations" ON public.supplier_evaluations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete supplier evaluations" ON public.supplier_evaluations
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 26. TABELA: supplier_products
-- ========================================
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view supplier products" ON public.supplier_products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create supplier products" ON public.supplier_products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update supplier products" ON public.supplier_products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete supplier products" ON public.supplier_products
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 27. TABELA: Fornecedores
-- ========================================
ALTER TABLE public."Fornecedores" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view Fornecedores" ON public."Fornecedores"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create Fornecedores" ON public."Fornecedores"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update Fornecedores" ON public."Fornecedores"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete Fornecedores" ON public."Fornecedores"
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 28. TABELA: Usuários
-- ========================================
ALTER TABLE public."Usuários" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view Usuários" ON public."Usuários"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create Usuários" ON public."Usuários"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update Usuários" ON public."Usuários"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete Usuários" ON public."Usuários"
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
