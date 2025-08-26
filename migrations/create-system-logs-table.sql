-- Migração para criar tabela system_logs
-- Executar: psql -d enso_db -f migrations/create-system-logs-table.sql

CREATE TABLE IF NOT EXISTS system_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_suite text NOT NULL,
    test_name text NOT NULL,
    route text NOT NULL,
    status_code integer,
    response_time_ms integer,
    cors_ok boolean DEFAULT false,
    passed boolean DEFAULT false,
    error_message text,
    meta jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_test_suite ON system_logs(test_suite);
CREATE INDEX IF NOT EXISTS idx_system_logs_route ON system_logs(route);
CREATE INDEX IF NOT EXISTS idx_system_logs_passed ON system_logs(passed);
CREATE INDEX IF NOT EXISTS idx_system_logs_status_code ON system_logs(status_code);

-- Comentários para documentação
COMMENT ON TABLE system_logs IS 'Logs de testes automatizados e healthchecks do sistema';
COMMENT ON COLUMN system_logs.test_suite IS 'Nome da suíte de testes (ex: healthcheck, contract, smoke)';
COMMENT ON COLUMN system_logs.test_name IS 'Nome específico do teste';
COMMENT ON COLUMN system_logs.route IS 'Rota da API testada';
COMMENT ON COLUMN system_logs.status_code IS 'Código de status HTTP retornado';
COMMENT ON COLUMN system_logs.response_time_ms IS 'Tempo de resposta em milissegundos';
COMMENT ON COLUMN system_logs.cors_ok IS 'Se os headers CORS estão corretos';
COMMENT ON COLUMN system_logs.passed IS 'Se o teste passou (true) ou falhou (false)';
COMMENT ON COLUMN system_logs.error_message IS 'Mensagem de erro se o teste falhou';
COMMENT ON COLUMN system_logs.meta IS 'Dados adicionais em formato JSON';
COMMENT ON COLUMN system_logs.created_at IS 'Timestamp de criação do log';
