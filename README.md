# ControlFlow - Sistema de Gestão de Qualidade Inteligente

## 🚀 Visão Geral

O ControlFlow é uma plataforma avançada de gestão de qualidade que evoluiu de uma ferramenta de registro linear para um sistema proativo e inteligente. Focamos em aprimorar a experiência do Técnico e Analista de Qualidade, fornecendo ferramentas poderosas que simplificam e tornam à prova de erros a experiência do Inspetor.

## ✨ Funcionalidades Principais

### 🎯 Módulo 1: Criação de Planos de Inspeção (Analista)

#### Construtor Visual de Fluxo (Flow Builder)
- **Interface Drag-and-Drop**: Criação visual de fluxos de inspeção com nós e conexões
- **Lógica Condicional**: Ramificações baseadas em decisões (ex: "Produto Liga?" → SIM/NÃO)
- **Canvas Interativo**: Zoom, pan e organização visual dos fluxos
- **Auto-save**: Persistência automática do estado do canvas

#### Biblioteca de Critérios Reutilizáveis
- **Blocos Pré-configurados**: Micro-tarefas com título, instrução padrão e tipo de resposta
- **Categorização**: Organização por tipos e tags para fácil localização
- **Mídia de Ajuda**: Fotos, diagramas e vídeos anexados aos critérios
- **Reutilização**: Arrastar blocos para novos planos

#### Critérios Dinâmicos
- **Variáveis Técnicas**: Sintaxe `{Produto.Atributo.Tensão_Nominal}` para valores dinâmicos
- **Integração com Ficha Técnica**: Busca automática de valores durante inspeção
- **Flexibilidade**: Critérios que se adaptam ao produto específico

#### Assistente de IA Preditiva
- **Sugestões Inteligentes**: Botão "✨ Sugerir Pontos de Falha" para análise automática
- **Detecção de NCs**: Identificação de possíveis não conformidades relacionadas
- **Integração de Fluxo**: Adição automática de sugestões como novos nós

#### Modo de Simulação
- **Validação de Fluxo**: Teste do plano como se fosse o inspetor
- **Verificação de Lógica**: Confirmação de caminhos condicionais
- **Teste de Instruções**: Validação de clareza e completude

### 🔍 Módulo 2: Execução de Inspeção (Inspetor)

#### Execução Guiada e Dinâmica
- **Interface Wizard**: Apresentação passo a passo das etapas
- **Navegação Inteligente**: Próximo passo determinado pela resposta anterior
- **Fluxo Condicional**: Seguimento automático dos caminhos definidos pelo analista

#### Automação de Não Conformidades (NC)
- **Detecção Automática**: Mudança de status para "Pendente com NC"
- **Etapas Específicas**: Formulários dedicados para registro de falhas
- **Notificações Automáticas**: Alerta para gestores de qualidade responsáveis
- **Sistema de Escalação**: Priorização e acompanhamento de NCs

#### Suporte Visual Just-in-Time
- **Ícone de Ajuda**: Acesso imediato à mídia de ajuda em cada etapa
- **Mídia Contextual**: Fotos, diagramas e vídeos específicos do critério
- **Instruções Visuais**: Guias visuais para execução correta

### 🛡️ Sistemas Críticos (NÍVEL 5 - CRÍTICO MÁXIMO)

#### Health Monitor
- **Monitoramento em Tempo Real**: CPU, memória, banco de dados, storage
- **Alertas Automáticos**: Notificações de problemas críticos
- **Métricas de Performance**: Histórico e análise de tendências
- **Dashboard de Status**: Visão geral da saúde do sistema

#### Cache Manager
- **Cache Inteligente**: TTL configurável e evição LRU
- **Cache Especializado**: Produtos, inspeções e dados frequentes
- **Limpeza Automática**: Remoção de dados expirados
- **Estatísticas de Performance**: Métricas de hit/miss ratio

#### Security Manager
- **Middleware de Segurança**: Validação de entrada, XSS, SQL Injection
- **Proteção contra Ataques**: Rate limiting e proteção brute force
- **Auditoria de Segurança**: Logs de eventos e tentativas de acesso
- **Bloqueio de IPs**: Proteção contra IPs maliciosos

#### Backup Manager
- **Backups Automáticos**: Banco de dados, uploads e logs
- **Compressão e Criptografia**: Otimização de espaço e segurança
- **Política de Retenção**: Limpeza automática de backups antigos
- **Restauração Simplificada**: Processo de recuperação guiado

### 🍪 Sistema de Cookies Inteligente

#### Persistência de Estado
- **Preferências do Usuário**: Tema, idioma, configurações de interface
- **Estado do Flow Builder**: Posição do canvas, zoom, nós selecionados
- **Sessões de Inspeção**: Progresso atual e dados temporários
- **Cache Inteligente**: Dados frequentes com TTL configurável

#### Auto-save e Restauração
- **Salvamento Automático**: Baseado em preferências do usuário
- **Restauração de Estado**: Recuperação de posições e configurações
- **Sincronização**: Manutenção de estado entre sessões
- **Configurações Avançadas**: Controle granular de comportamento

## 🏗️ Arquitetura Técnica

### Frontend
- **React 18**: Interface moderna e responsiva
- **TypeScript**: Tipagem estática para maior confiabilidade
- **Shadcn/ui**: Componentes de UI consistentes e acessíveis
- **Framer Motion**: Animações suaves e transições
- **Hooks Customizados**: Gerenciamento de estado e lógica de negócio

### Backend
- **Node.js + Express**: API REST robusta e escalável
- **Supabase**: Banco de dados PostgreSQL com autenticação
- **Drizzle ORM**: Mapeamento objeto-relacional type-safe
- **Sistema de Logs**: Rastreamento completo de operações
- **Middleware de Segurança**: Proteção em múltiplas camadas

### Banco de Dados
- **PostgreSQL**: Banco relacional robusto
- **Row Level Security (RLS)**: Controle granular de acesso
- **Índices Otimizados**: Performance para consultas complexas
- **Triggers Automáticos**: Atualização de timestamps e auditoria

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Supabase (conta e projeto configurado)

### Configuração Local
```bash
# Clone o repositório
git clone <repository-url>
cd ControlFlow

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute o banco de dados local (opcional)
docker-compose up -d postgres

# Inicie o servidor de desenvolvimento
npm run dev
```

### Configuração Docker
```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### Configuração Supabase
1. Crie um projeto no Supabase
2. Execute as migrações SQL fornecidas
3. Configure as variáveis de ambiente
4. Teste a conexão com `npm run test:supabase`

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `inspection_plans`: Planos de inspeção base
- `flow_nodes`: Nós do fluxo de inspeção
- `flow_connections`: Conexões entre nós
- `flow_plans`: Planos de fluxo completos
- `criteria_blocks`: Blocos de critérios reutilizáveis
- `smart_inspections`: Execuções inteligentes de inspeção
- `nc_notifications`: Sistema de notificações de NC
- `system_health_logs`: Logs de saúde do sistema
- `security_events`: Eventos de segurança
- `backup_info`: Informações de backup

## 🧪 Testes

### Testes Automatizados
```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes específicos
npm run test:critical-systems
npm run test:cookie-system
npm run test:supabase
```

### Scripts de Teste
- `test-critical-systems.js`: Testa sistemas críticos
- `test-cookie-system.js`: Valida sistema de cookies
- `test-supabase-connection.js`: Verifica conexão com Supabase

## 📚 Documentação Adicional

- [Configuração do Supabase](./docs/SUPABASE_SETUP.md)
- [Sistema de Cookies](./docs/COOKIE_SYSTEM.md)
- [Sistemas Críticos](./docs/CRITICAL_SYSTEMS.md)
- [Flow Builder](./docs/FLOW_BUILDER.md)
- [Smart Inspection](./docs/SMART_INSPECTION.md)
- [Deploy no Render](./docs/RENDER_DEPLOY.md)

## 🔧 Configurações Avançadas

### Variáveis de Ambiente
```bash
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Sistema
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret

# Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Cache
CACHE_TTL=3600
CACHE_MAX_SIZE=100

# Backup
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
```

### Configurações de Performance
- **Cache TTL**: Tempo de vida dos dados em cache
- **Rate Limiting**: Limites de requisições por IP
- **Upload Limits**: Tamanho máximo de arquivos
- **Backup Frequency**: Frequência de backups automáticos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Issues**: Use o sistema de issues do GitHub
- **Documentação**: Consulte a pasta `docs/`
- **Testes**: Execute os scripts de teste para diagnóstico
- **Logs**: Verifique os logs do sistema para troubleshooting

## 🎯 Roadmap

### Próximas Versões
- [ ] Integração com sistemas externos de qualidade
- [ ] Relatórios avançados e analytics
- [ ] Mobile app nativo
- [ ] Machine Learning para sugestões de NC
- [ ] Integração com IoT para inspeções automatizadas

### Melhorias Contínuas
- [ ] Otimização de performance
- [ ] Novos tipos de critérios
- [ ] Sistema de templates de planos
- [ ] Integração com calendário
- [ ] Notificações push

---

**ControlFlow** - Transformando a gestão de qualidade em uma experiência inteligente e proativa. 🚀
