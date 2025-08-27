-- Adicionar 'etiqueta' ao enum de question_type
ALTER TYPE question_type_enum ADD VALUE IF NOT EXISTS 'etiqueta';

-- Verificar se a coluna question_type existe e atualizar se necessário
DO $$
BEGIN
    -- Verificar se a coluna question_type existe na tabela inspection_plan_revisions
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inspection_plan_revisions' 
        AND column_name = 'question_type'
    ) THEN
        -- Atualizar a constraint para incluir 'etiqueta'
        ALTER TABLE inspection_plan_revisions 
        DROP CONSTRAINT IF EXISTS inspection_plan_revisions_question_type_check;
        
        ALTER TABLE inspection_plan_revisions 
        ADD CONSTRAINT inspection_plan_revisions_question_type_check 
        CHECK (question_type IN ('number', 'text', 'yes_no', 'ok_nok', 'scale_1_5', 'scale_1_10', 'multiple_choice', 'true_false', 'checklist', 'photo', 'etiqueta'));
    END IF;
END $$;
