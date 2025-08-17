#!/bin/bash

# 🚀 ControlFlow - Setup Automatizado
# Este script configura automaticamente o ControlFlow em uma nova máquina

set -e  # Para o script se houver erro

echo "🚀 Iniciando setup do ControlFlow..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se o Docker está instalado
check_docker() {
    print_status "Verificando se o Docker está instalado..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi
    
    print_success "Docker e Docker Compose encontrados!"
}

# Verificar se o Git está instalado
check_git() {
    print_status "Verificando se o Git está instalado..."
    if ! command -v git &> /dev/null; then
        print_error "Git não está instalado. Por favor, instale o Git primeiro."
        exit 1
    fi
    print_success "Git encontrado!"
}

# Configurar arquivo .env
setup_env() {
    print_status "Configurando variáveis de ambiente..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Arquivo .env criado a partir do env.example"
        else
            print_warning "Arquivo env.example não encontrado. Criando .env básico..."
            cat > .env << EOF
# Database
DATABASE_URL=postgresql://controlflow_db:123@localhost:5432/controlflow_db

# JWT
JWT_SECRET=controlflow-jwt-secret-key-2024-development
SESSION_SECRET=controlflow-session-secret-2024

# Server
PORT=5002
NODE_ENV=development

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
EOF
            print_success "Arquivo .env criado com configurações básicas"
        fi
    else
        print_warning "Arquivo .env já existe. Mantendo configurações atuais."
    fi
}

# Criar diretórios necessários
create_directories() {
    print_status "Criando diretórios necessários..."
    
    mkdir -p uploads
    mkdir -p logs
    print_success "Diretórios criados!"
}

# Verificar se as portas estão disponíveis
check_ports() {
    print_status "Verificando se as portas necessárias estão disponíveis..."
    
    if lsof -Pi :5002 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Porta 5002 já está em uso. Verifique se não há outra instância rodando."
        read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Porta 5432 (PostgreSQL) já está em uso. Verifique se não há outro PostgreSQL rodando."
        read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_success "Portas verificadas!"
}

# Build e inicialização do Docker
setup_docker() {
    print_status "Iniciando build das imagens Docker..."
    
    # Parar containers existentes se houver
    docker-compose down 2>/dev/null || true
    
    # Build das imagens
    docker-compose build
    
    print_success "Build das imagens concluído!"
}

# Iniciar serviços
start_services() {
    print_status "Iniciando serviços..."
    
    docker-compose up -d
    
    print_success "Serviços iniciados!"
}

# Aguardar serviços ficarem prontos
wait_for_services() {
    print_status "Aguardando serviços ficarem prontos..."
    
    # Aguardar PostgreSQL
    print_status "Aguardando PostgreSQL..."
    timeout=60
    counter=0
    while ! docker-compose exec -T controlflow_postgres pg_isready -U controlflow_db >/dev/null 2>&1; do
        sleep 1
        counter=$((counter + 1))
        if [ $counter -ge $timeout ]; then
            print_error "Timeout aguardando PostgreSQL ficar pronto"
            exit 1
        fi
    done
    print_success "PostgreSQL está pronto!"
    
    # Aguardar aplicação
    print_status "Aguardando aplicação..."
    timeout=120
    counter=0
    while ! curl -f http://localhost:5002/health >/dev/null 2>&1; do
        sleep 2
        counter=$((counter + 2))
        if [ $counter -ge $timeout ]; then
            print_error "Timeout aguardando aplicação ficar pronta"
            print_status "Verificando logs da aplicação..."
            docker-compose logs controlflow_app
            exit 1
        fi
    done
    print_success "Aplicação está pronta!"
}

# Verificar status dos serviços
check_services() {
    print_status "Verificando status dos serviços..."
    
    if docker-compose ps | grep -q "Up"; then
        print_success "Todos os serviços estão rodando!"
    else
        print_error "Alguns serviços não estão rodando. Verifique os logs:"
        docker-compose logs
        exit 1
    fi
}

# Mostrar informações finais
show_final_info() {
    echo
    echo "🎉 Setup concluído com sucesso!"
    echo
    echo "📋 Informações importantes:"
    echo "   • Frontend: http://localhost:5002"
    echo "   • API: http://localhost:5002/api"
    echo "   • Health Check: http://localhost:5002/health"
    echo
    echo "🔧 Comandos úteis:"
    echo "   • Ver logs: docker-compose logs -f"
    echo "   • Parar serviços: docker-compose down"
    echo "   • Reiniciar: docker-compose restart"
    echo "   • Rebuild: docker-compose up --build"
    echo
    echo "📚 Documentação:"
    echo "   • Setup completo: docs/SETUP_COMPLETO.md"
    echo "   • README: README.md"
    echo
    echo "🚀 O ControlFlow está pronto para uso!"
}

# Função principal
main() {
    echo "🚀 ControlFlow - Setup Automatizado"
    echo "=================================="
    echo
    
    check_docker
    check_git
    setup_env
    create_directories
    check_ports
    setup_docker
    start_services
    wait_for_services
    check_services
    show_final_info
}

# Executar função principal
main "$@"
