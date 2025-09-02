-- Migration: Flow Builder and Smart Inspection System
-- Created: 2025-01-27
-- Description: Configuração completa do sistema de Flow Builder e Smart Inspection

-- =====================================================
-- 1. TABELAS PARA FLOW BUILDER
-- =====================================================

-- Tabela para nós do fluxo de inspeção
CREATE TABLE IF NOT EXISTS flow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT NOT NULL, -- Mudando para TEXT para compatibilidade com inspection_plans
    node_type TEXT NOT NULL CHECK (node_type IN ('start', 'decision', 'verification', 'action', 'end', 'nc')),
    title TEXT NOT NULL,
    description TEXT,
    instruction TEXT,
    response_type TEXT CHECK (response_type IN ('yes_no', 'text', 'number', 'select', 'photo', 'file')),
    options JSONB DEFAULT '[]',
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    help_media JSONB DEFAULT '{}',
    dynamic_variables JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para conexões entre nós
CREATE TABLE IF NOT EXISTS flow_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT NOT NULL, -- Mudando para TEXT para compatibilidade
    source_node_id UUID NOT NULL REFERENCES flow_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES flow_nodes(id) ON DELETE CASCADE,
    condition_type TEXT CHECK (condition_type IN ('yes', 'no', 'pass', 'fail', 'custom')),
    condition_value TEXT,
    condition_expression TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para planos de fluxo
CREATE TABLE IF NOT EXISTS flow_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT NOT NULL, -- Mudando para TEXT para compatibilidade
    flow_data JSONB NOT NULL DEFAULT '{}',
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELAS PARA BIBLIOTECA DE CRITÉRIOS
-- =====================================================

-- Tabela para blocos de critérios reutilizáveis
CREATE TABLE IF NOT EXISTS criteria_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    standard_instruction TEXT NOT NULL,
    response_type TEXT NOT NULL CHECK (response_type IN ('yes_no', 'text', 'number', 'select', 'photo', 'file')),
    options JSONB DEFAULT '[]',
    help_media JSONB DEFAULT '{}',
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_by TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para categorias de critérios
CREATE TABLE IF NOT EXISTS criteria_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELAS PARA EXECUÇÃO INTELIGENTE
-- =====================================================

-- Tabela para execuções de inspeção inteligente
CREATE TABLE IF NOT EXISTS smart_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id TEXT NOT NULL, -- Mudando para TEXT para compatibilidade
    current_node_id UUID REFERENCES flow_nodes(id),
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    execution_path JSONB DEFAULT '[]',
    step_answers JSONB DEFAULT '{}',
    step_photos JSONB DEFAULT '[]',
    step_notes JSONB DEFAULT '{}',
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'paused', 'completed', 'nc_pending')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    inspector_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para histórico de execução
CREATE TABLE IF NOT EXISTS inspection_execution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    smart_inspection_id UUID NOT NULL REFERENCES smart_inspections(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES flow_nodes(id),
    step_number INTEGER NOT NULL,
    answer TEXT,
    photos JSONB DEFAULT '[]',
    notes TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELAS PARA NOTIFICAÇÕES DE NC
-- =====================================================

-- Tabela para notificações de não conformidade
CREATE TABLE IF NOT EXISTS nc_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id TEXT NOT NULL, -- Mudando para TEXT para compatibilidade
    smart_inspection_id UUID REFERENCES smart_inspections(id),
    node_id UUID REFERENCES flow_nodes(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'escalated')),
    assigned_to TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para detalhes de NC
CREATE TABLE IF NOT EXISTS nc_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nc_notification_id UUID NOT NULL REFERENCES nc_notifications(id) ON DELETE CASCADE,
    defect_type TEXT NOT NULL,
    defect_description TEXT NOT NULL,
    photos JSONB DEFAULT '[]',
    technical_analysis TEXT,
    root_cause TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELAS PARA SISTEMAS CRÍTICOS
-- =====================================================

-- Tabela para monitoramento de saúde do sistema
CREATE TABLE IF NOT EXISTS system_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_type TEXT NOT NULL CHECK (check_type IN ('cpu', 'memory', 'database', 'storage', 'api', 'websocket')),
    status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
    metric_value REAL,
    metric_unit TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para eventos de segurança
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN ('login_attempt', 'rate_limit', 'xss_attempt', 'sql_injection', 'csrf_attempt', 'ip_blocked')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ip_address INET,
    user_id TEXT,
    user_agent TEXT,
    request_path TEXT,
    request_method TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para estatísticas de cache
CREATE TABLE IF NOT EXISTS cache_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_name TEXT NOT NULL,
    hit_count INTEGER DEFAULT 0,
    miss_count INTEGER DEFAULT 0,
    size_bytes BIGINT DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    eviction_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para informações de backup
CREATE TABLE IF NOT EXISTS backup_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'database_only')),
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    checksum TEXT NOT NULL,
    compression_type TEXT DEFAULT 'gzip',
    encryption_enabled BOOLEAN DEFAULT false,
    retention_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para flow_nodes
CREATE INDEX IF NOT EXISTS idx_flow_nodes_plan_id ON flow_nodes(plan_id);
CREATE INDEX IF NOT EXISTS idx_flow_nodes_node_type ON flow_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_flow_nodes_position ON flow_nodes(position_x, position_y);

-- Índices para flow_connections
CREATE INDEX IF NOT EXISTS idx_flow_connections_plan_id ON flow_connections(plan_id);
CREATE INDEX IF NOT EXISTS idx_flow_connections_source ON flow_connections(source_node_id);
CREATE INDEX IF NOT EXISTS idx_flow_connections_target ON flow_connections(target_node_id);

-- Índices para criteria_blocks
CREATE INDEX IF NOT EXISTS idx_criteria_blocks_category ON criteria_blocks(category);
CREATE INDEX IF NOT EXISTS idx_criteria_blocks_tags ON criteria_blocks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_criteria_blocks_public ON criteria_blocks(is_public);

-- Índices para smart_inspections
CREATE INDEX IF NOT EXISTS idx_smart_inspections_inspection_id ON smart_inspections(inspection_id);
CREATE INDEX IF NOT EXISTS idx_smart_inspections_status ON smart_inspections(status);
CREATE INDEX IF NOT EXISTS idx_smart_inspections_inspector ON smart_inspections(inspector_id);

-- Índices para nc_notifications
CREATE INDEX IF NOT EXISTS idx_nc_notifications_inspection_id ON nc_notifications(inspection_id);
CREATE INDEX IF NOT EXISTS idx_nc_notifications_status ON nc_notifications(status);
CREATE INDEX IF NOT EXISTS idx_nc_notifications_severity ON nc_notifications(severity);
CREATE INDEX IF NOT EXISTS idx_nc_notifications_assigned_to ON nc_notifications(assigned_to);

-- Índices para sistemas críticos
CREATE INDEX IF NOT EXISTS idx_system_health_logs_check_type ON system_health_logs(check_type);
CREATE INDEX IF NOT EXISTS idx_system_health_logs_status ON system_health_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_health_logs_created_at ON system_health_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- =====================================================
-- 7. TRIGGERS E FUNÇÕES
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_flow_nodes_updated_at 
    BEFORE UPDATE ON flow_nodes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flow_plans_updated_at 
    BEFORE UPDATE ON flow_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_criteria_blocks_updated_at 
    BEFORE UPDATE ON criteria_blocks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_inspections_updated_at 
    BEFORE UPDATE ON smart_inspections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nc_notifications_updated_at 
    BEFORE UPDATE ON nc_notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar contador de uso de critérios
CREATE OR REPLACE FUNCTION increment_criteria_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE criteria_blocks 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.criteria_block_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 8. DADOS INICIAIS
-- =====================================================

-- Inserir categorias padrão de critérios
INSERT INTO criteria_categories (name, description, color) VALUES
('Visual', 'Inspeções visuais e verificações de aparência', '#10B981'),
('Funcional', 'Testes funcionais e operacionais', '#3B82F6'),
('Dimensional', 'Medições e verificações dimensionais', '#F59E0B'),
('Documental', 'Verificação de documentos e especificações', '#8B5CF6'),
('Segurança', 'Verificações de segurança e conformidade', '#EF4444'),
('Qualidade', 'Controle de qualidade geral', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- Inserir critérios padrão
INSERT INTO criteria_blocks (title, description, standard_instruction, response_type, category, is_public, created_by) VALUES
('Verificar Aparência', 'Inspeção visual da aparência geral do produto', 'Verifique se o produto apresenta aparência adequada, sem riscos, manchas ou deformações visíveis', 'yes_no', 'Visual', true, 'system'),
('Testar Funcionamento', 'Verificação básica de funcionamento', 'Ligue o produto e verifique se todas as funções básicas estão operando corretamente', 'yes_no', 'Funcional', true, 'system'),
('Verificar Dimensões', 'Medição de dimensões críticas', 'Utilize o paquímetro para medir as dimensões especificadas na ficha técnica', 'number', 'Dimensional', true, 'system'),
('Conferir Documentação', 'Verificação de documentos', 'Confirme se todos os documentos obrigatórios estão presentes e corretos', 'yes_no', 'Documental', true, 'system'),
('Verificar Segurança', 'Verificações de segurança', 'Confirme se todos os dispositivos de segurança estão funcionando e instalados corretamente', 'yes_no', 'Segurança', true, 'system')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. POLÍTICAS RLS (ROW LEVEL SECURITY) - SIMPLIFICADAS
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_execution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nc_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nc_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_info ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para permitir acesso (você pode configurar políticas mais específicas depois)
CREATE POLICY "Allow all operations for now" ON flow_nodes FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON flow_connections FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON flow_plans FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON criteria_blocks FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON smart_inspections FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON inspection_execution_history FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON nc_notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON nc_details FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON system_health_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON security_events FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON cache_stats FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON backup_info FOR ALL USING (true);

-- NOTA: Estas políticas permitem acesso total. Configure políticas mais restritivas conforme necessário.

-- =====================================================
-- 10. COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE flow_nodes IS 'Nós do fluxo de inspeção com posições e tipos';
COMMENT ON TABLE flow_connections IS 'Conexões entre nós do fluxo com condições';
COMMENT ON TABLE flow_plans IS 'Planos de fluxo completos com dados JSON';
COMMENT ON TABLE criteria_blocks IS 'Blocos de critérios reutilizáveis';
COMMENT ON TABLE smart_inspections IS 'Execuções inteligentes de inspeção';
COMMENT ON TABLE nc_notifications IS 'Notificações de não conformidade';
COMMENT ON TABLE system_health_logs IS 'Logs de monitoramento de saúde do sistema';
COMMENT ON TABLE security_events IS 'Eventos de segurança do sistema';
COMMENT ON TABLE cache_stats IS 'Estatísticas de cache do sistema';
COMMENT ON TABLE backup_info IS 'Informações de backup do sistema';

-- =====================================================
-- MIGRAÇÃO CONCLUÍDA
-- =====================================================
