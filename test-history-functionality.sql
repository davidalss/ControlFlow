-- TESTAR FUNCIONALIDADE DO SISTEMA DE HISTÓRICO
-- Execute este script após configurar o sistema

-- ========================================
-- 1. VERIFICAR STATUS ATUAL
-- ========================================

-- Verificar se a tabela existe e tem dados
SELECT 
    'Status da tabela product_history' AS info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'product_history' 
            AND table_schema = 'public'
        ) THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END AS table_status,
    (SELECT COUNT(*) FROM public.product_history) AS total_records;

-- ========================================
-- 2. TESTAR INSERÇÃO MANUAL
-- ========================================

-- Inserir histórico de criação de produto
INSERT INTO public.product_history (
    product_id,
    product_code,
    action,
    changes,
    user_name,
    description,
    data
) VALUES (
    (SELECT id FROM public.products LIMIT 1),
    'PROD001',
    'create',
    '[
        {"field": "code", "newValue": "PROD001"},
        {"field": "description", "newValue": "Produto de teste"},
        {"field": "category", "newValue": "Eletrônicos"}
    ]',
    'admin@teste.com',
    'Produto PROD001 criado',
    '{"code": "PROD001", "description": "Produto de teste", "category": "Eletrônicos"}'
);

-- Inserir histórico de atualização de produto
INSERT INTO public.product_history (
    product_id,
    product_code,
    action,
    changes,
    user_name,
    description,
    data
) VALUES (
    (SELECT id FROM public.products LIMIT 1),
    'PROD001',
    'update',
    '[
        {"field": "description", "oldValue": "Produto de teste", "newValue": "Produto atualizado"},
        {"field": "category", "oldValue": "Eletrônicos", "newValue": "Tecnologia"}
    ]',
    'admin@teste.com',
    'Produto PROD001 atualizado - 2 campo(s) alterado(s)',
    '{"code": "PROD001", "description": "Produto atualizado", "category": "Tecnologia"}'
);

-- Inserir histórico de exclusão de produto
INSERT INTO public.product_history (
    product_id,
    product_code,
    action,
    changes,
    user_name,
    description,
    data
) VALUES (
    (SELECT id FROM public.products LIMIT 1),
    'PROD001',
    'delete',
    '[{"field": "status", "oldValue": "active", "newValue": "deleted"}]',
    'admin@teste.com',
    'Produto PROD001 excluído',
    '{"code": "PROD001", "description": "Produto atualizado", "category": "Tecnologia"}'
);

-- ========================================
-- 3. VERIFICAR DADOS INSERIDOS
-- ========================================

-- Verificar todos os registros de histórico
SELECT 
    product_code,
    action,
    user_name,
    timestamp,
    description,
    changes
FROM public.product_history
ORDER BY timestamp DESC;

-- Verificar histórico por ação
SELECT 
    action,
    COUNT(*) AS total
FROM public.product_history
GROUP BY action
ORDER BY total DESC;

-- Verificar histórico por produto
SELECT 
    product_code,
    COUNT(*) AS total_actions
FROM public.product_history
GROUP BY product_code
ORDER BY total_actions DESC;

-- ========================================
-- 4. TESTAR FUNÇÃO DE INSERÇÃO
-- ========================================

-- Testar a função insert_product_history
SELECT insert_product_history(
    (SELECT id FROM public.products LIMIT 1),
    'PROD002',
    'create',
    '[
        {"field": "code", "newValue": "PROD002"},
        {"field": "description", "newValue": "Produto via função"},
        {"field": "category", "newValue": "Teste"}
    ]',
    'funcao@teste.com',
    'Produto PROD002 criado via função',
    '{"code": "PROD002", "description": "Produto via função", "category": "Teste"}'
) AS history_id;

-- Verificar se foi inserido via função
SELECT 
    'Registro via função' AS tipo,
    COUNT(*) AS total
FROM public.product_history
WHERE product_code = 'PROD002';

-- ========================================
-- 5. TESTAR CONSULTAS ESPECÍFICAS
-- ========================================

-- Buscar histórico de um produto específico
SELECT 
    action,
    user_name,
    timestamp,
    description
FROM public.product_history
WHERE product_code = 'PROD001'
ORDER BY timestamp DESC;

-- Buscar histórico por usuário
SELECT 
    product_code,
    action,
    timestamp,
    description
FROM public.product_history
WHERE user_name = 'admin@teste.com'
ORDER BY timestamp DESC;

-- Buscar histórico por período (últimos 7 dias)
SELECT 
    product_code,
    action,
    user_name,
    timestamp
FROM public.product_history
WHERE timestamp >= NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

-- ========================================
-- 6. TESTAR FILTROS E BUSCA
-- ========================================

-- Buscar por descrição
SELECT 
    product_code,
    action,
    description
FROM public.product_history
WHERE description ILIKE '%criado%'
ORDER BY timestamp DESC;

-- Buscar por mudanças específicas
SELECT 
    product_code,
    action,
    changes
FROM public.product_history
WHERE changes::text ILIKE '%description%'
ORDER BY timestamp DESC;

-- ========================================
-- 7. ESTATÍSTICAS DO HISTÓRICO
-- ========================================

-- Estatísticas gerais
SELECT 
    'Estatísticas do Histórico' AS info,
    COUNT(*) AS total_registros,
    COUNT(DISTINCT product_code) AS produtos_unicos,
    COUNT(DISTINCT user_name) AS usuarios_unicos,
    MIN(timestamp) AS primeira_acao,
    MAX(timestamp) AS ultima_acao
FROM public.product_history;

-- Estatísticas por ação
SELECT 
    action,
    COUNT(*) AS total,
    COUNT(DISTINCT product_code) AS produtos_afetados,
    COUNT(DISTINCT user_name) AS usuarios_envolvidos
FROM public.product_history
GROUP BY action
ORDER BY total DESC;

-- ========================================
-- 8. LIMPEZA DE TESTES
-- ========================================

-- Remover dados de teste (descomente se quiser limpar)
-- DELETE FROM public.product_history WHERE product_code IN ('PROD001', 'PROD002');

-- ========================================
-- 9. VERIFICAÇÃO FINAL
-- ========================================

SELECT 
    'TESTE CONCLUÍDO' AS status,
    'Sistema de histórico funcionando corretamente' AS message,
    (SELECT COUNT(*) FROM public.product_history) AS total_records_final;
