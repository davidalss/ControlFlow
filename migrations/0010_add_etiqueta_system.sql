-- Criar tabelas para sistema de etiquetas
CREATE TABLE IF NOT EXISTS etiqueta_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_plan_id UUID REFERENCES inspection_plans(id),
    step_id UUID,
    tipo_etiqueta VARCHAR(50), -- EAN, DUN, ENCE, etc
    arquivo_referencia TEXT NOT NULL, -- URL da etiqueta de referência
    limite_aprovacao DECIMAL(5,4), -- % mínimo para aprovação (ex: 0.9000 = 90%)
    pdf_original_url TEXT, -- URL do arquivo original (PDF/PNG/JPEG)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS etiqueta_inspection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etiqueta_question_id UUID REFERENCES etiqueta_questions(id),
    inspection_session_id VARCHAR(255),
    foto_enviada TEXT NOT NULL,
    percentual_similaridade DECIMAL(5,4), -- Score de 0.0000 a 1.0000
    resultado_final VARCHAR(20), -- 'APROVADO' ou 'REPROVADO'
    detalhes_comparacao JSONB, -- Detalhes do OCR e comparação
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- ID do usuário que fez a inspeção
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_etiqueta_questions_plan_id 
ON etiqueta_questions(inspection_plan_id);

CREATE INDEX IF NOT EXISTS idx_etiqueta_questions_step_id 
ON etiqueta_questions(step_id);

CREATE INDEX IF NOT EXISTS idx_etiqueta_inspection_results_question_id 
ON etiqueta_inspection_results(etiqueta_question_id);

-- Criar políticas RLS
ALTER TABLE etiqueta_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE etiqueta_inspection_results ENABLE ROW LEVEL SECURITY;

-- Políticas para etiqueta_questions
CREATE POLICY "Usuários autenticados podem ler perguntas"
ON etiqueta_questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas admins podem criar perguntas"
ON etiqueta_questions FOR INSERT
TO authenticated
USING ((SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

-- Políticas para etiqueta_inspection_results
CREATE POLICY "Usuários podem ver seus próprios resultados"
ON etiqueta_inspection_results FOR SELECT
TO authenticated
USING (created_by = auth.uid() OR 
      (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Usuários podem criar resultados"
ON etiqueta_inspection_results FOR INSERT
TO authenticated
WITH CHECK (true);

-- Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('ENSOS', 'ENSOS', true)
ON CONFLICT (id) DO NOTHING;
