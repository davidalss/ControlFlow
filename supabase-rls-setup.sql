-- Script para configurar RLS (Row Level Security) no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar RLS na tabela inspection_plans
ALTER TABLE public.inspection_plans ENABLE ROW LEVEL SECURITY;

-- 2. Criar política para permitir acesso autenticado
CREATE POLICY "Users can view inspection plans" ON public.inspection_plans
    FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Criar política para permitir inserção por usuários autenticados
CREATE POLICY "Users can create inspection plans" ON public.inspection_plans
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Criar política para permitir atualização por usuários autenticados
CREATE POLICY "Users can update inspection plans" ON public.inspection_plans
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Criar política para permitir exclusão por usuários autenticados
CREATE POLICY "Users can delete inspection plans" ON public.inspection_plans
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'inspection_plans';

-- 7. Inserir dados de teste (opcional)
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
    '0ed6d5df-2838-4126-b9e9-cade6d47667a' -- ID do usuário admin
);
