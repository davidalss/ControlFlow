-- Migração para adicionar suporte a perguntas do tipo ETIQUETA
-- Data: 2024-01-XX

-- Tabela para armazenar perguntas de etiqueta
CREATE TABLE IF NOT EXISTS etiqueta_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_plan_id UUID REFERENCES inspection_plans(id) ON DELETE CASCADE,
    step_id VARCHAR(255) NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    arquivo_referencia TEXT NOT NULL, -- URL da imagem extraída do PDF
    limite_aprovacao DECIMAL(3,2) NOT NULL DEFAULT 0.9, -- Percentual mínimo para aprovação (0.00 a 1.00)
    pdf_original_url TEXT, -- URL do PDF original (opcional, para referência)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar resultados de inspeção de etiquetas
CREATE TABLE IF NOT EXISTS etiqueta_inspection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etiqueta_question_id UUID REFERENCES etiqueta_questions(id) ON DELETE CASCADE,
    inspection_session_id VARCHAR(255), -- ID da sessão de inspeção
    foto_enviada TEXT NOT NULL, -- URL da foto enviada pelo usuário
    percentual_similaridade DECIMAL(5,4) NOT NULL, -- Score de similaridade (0.0000 a 1.0000)
    resultado_final VARCHAR(20) NOT NULL, -- 'APROVADO' ou 'REPROVADO'
    detalhes_comparacao JSONB, -- Detalhes técnicos da comparação (opcional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- ID do usuário que fez a inspeção
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_etiqueta_questions_plan_id ON etiqueta_questions(inspection_plan_id);
CREATE INDEX IF NOT EXISTS idx_etiqueta_questions_step_id ON etiqueta_questions(step_id);
CREATE INDEX IF NOT EXISTS idx_etiqueta_results_question_id ON etiqueta_inspection_results(etiqueta_question_id);
CREATE INDEX IF NOT EXISTS idx_etiqueta_results_session_id ON etiqueta_inspection_results(inspection_session_id);
CREATE INDEX IF NOT EXISTS idx_etiqueta_results_created_at ON etiqueta_inspection_results(created_at);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_etiqueta_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER trigger_update_etiqueta_questions_updated_at
    BEFORE UPDATE ON etiqueta_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_etiqueta_questions_updated_at();

-- Comentários para documentação
COMMENT ON TABLE etiqueta_questions IS 'Armazena perguntas do tipo ETIQUETA nos planos de inspeção';
COMMENT ON TABLE etiqueta_inspection_results IS 'Armazena resultados de inspeção de etiquetas com comparação de imagens';
COMMENT ON COLUMN etiqueta_questions.limite_aprovacao IS 'Percentual mínimo de similaridade para aprovação (0.00 a 1.00)';
COMMENT ON COLUMN etiqueta_inspection_results.percentual_similaridade IS 'Score de similaridade calculado pela comparação de imagens';
COMMENT ON COLUMN etiqueta_inspection_results.resultado_final IS 'Resultado final: APROVADO ou REPROVADO';
