# Sistema OCR - Documentação Completa

## Visão Geral

O sistema OCR (Reconhecimento Óptico de Caracteres) foi implementado utilizando Tesseract.js com suporte específico para o idioma português. O sistema é integrado ao backend da aplicação e oferece uma API REST protegida por autenticação JWT.

## Arquitetura

### Estrutura de Arquivos

```
src/
├── services/
│   └── ocrService.ts          # Serviço Singleton do OCR
├── pages/api/
│   └── ocr.ts                 # Endpoint da API
├── utils/
│   ├── ocr.ts                 # Utilitário cliente
│   ├── api.ts                 # Configuração do Axios
│   └── logger.ts              # Sistema de logging
├── middleware/
│   └── withAuth.ts            # Middleware de autenticação
├── types/
│   └── tesseract.d.ts         # Tipos TypeScript
└── components/
    └── OcrDemo.tsx            # Componente de demonstração

scripts/
├── download-tesseract-data.ts # Download dos dados de treinamento
├── test-ocr.ts               # Script de teste
└── verify-ocr-setup.ts       # Verificação completa

por.traineddata               # Dados de treinamento em português
```

### Fluxo de Dados

```
Cliente → API → Serviço OCR → Tesseract.js → Texto Reconhecido
```

## Configuração

### 1. Dependências

Todas as dependências necessárias já estão incluídas no `package.json`:

```json
{
  "tesseract.js": "^4.1.1",
  "pino": "^9.9.0",
  "pino-pretty": "^13.1.1",
  "axios": "^1.11.0",
  "jsonwebtoken": "^9.0.2"
}
```

### 2. Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```env
JWT_SECRET="sua-chave-secreta-jwt"
NODE_ENV="development"
```

### 3. Dados de Treinamento

O arquivo `por.traineddata` contém os dados de treinamento para o idioma português. Se não estiver presente, execute:

```bash
npm run setup:ocr
```

## Uso

### 1. Setup Inicial

```bash
# Instalar dependências
npm install

# Configurar dados de treinamento
npm run setup:ocr

# Verificar configuração
npm run verify:ocr

# Testar sistema
npm run test:ocr
```

### 2. API

#### Endpoint: `POST /api/ocr`

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Resposta:**
```json
{
  "text": "Texto reconhecido da imagem"
}
```

### 3. Frontend

```typescript
import { performOcr } from '../utils/ocr';

// Processar imagem
const text = await performOcr(imageBase64);
console.log('Texto reconhecido:', text);
```

### 4. Componente React

```typescript
import { OcrDemo } from '../components/OcrDemo';

// Usar o componente de demonstração
<OcrDemo />
```

## Funcionalidades

### ✅ Implementado

- [x] Serviço OCR Singleton
- [x] API REST protegida
- [x] Suporte ao idioma português
- [x] Sistema de logging
- [x] Tratamento de erros
- [x] Autenticação JWT
- [x] Componente React de demonstração
- [x] Scripts de setup e teste
- [x] Verificação completa do sistema
- [x] Documentação em português

### 🔄 Funcionalidades Futuras

- [ ] Cache de resultados
- [ ] Suporte a múltiplos idiomas
- [ ] Processamento em lote
- [ ] Otimização de performance
- [ ] Métricas de uso
- [ ] Interface administrativa

## Segurança

### Medidas Implementadas

1. **Autenticação JWT**: Todas as requisições requerem token válido
2. **Validação de Entrada**: Verificação de dados de entrada
3. **Sanitização**: Limpeza de dados de saída
4. **Logs de Segurança**: Registro de tentativas de acesso
5. **Tratamento de Erros**: Não exposição de informações sensíveis

### Boas Práticas

- Use HTTPS em produção
- Configure JWT_SECRET seguro
- Monitore logs de acesso
- Atualize dependências regularmente

## Monitoramento

### Logs

O sistema utiliza Pino para logging estruturado:

```typescript
logger.info('OCR service initialized successfully');
logger.error('OCR recognition failed:', error);
```

### Métricas

Para monitorar o sistema:

1. **Performance**: Tempo de resposta do OCR
2. **Uso**: Número de requisições processadas
3. **Erros**: Taxa de falhas e tipos de erro
4. **Recursos**: Uso de memória e CPU

## Manutenção

### Atualizações

1. **Dependências**: Atualize regularmente
2. **Dados de Treinamento**: Verifique novas versões
3. **Segurança**: Aplique patches de segurança

### Backup

- Backup dos dados de treinamento
- Backup da configuração
- Backup dos logs

### Troubleshooting

#### Problemas Comuns

1. **Erro de inicialização**
   ```bash
   npm run setup:ocr
   npm run verify:ocr
   ```

2. **Erro de autenticação**
   - Verificar JWT_SECRET
   - Verificar token de acesso

3. **Erro de processamento**
   - Verificar formato da imagem
   - Verificar tamanho do arquivo

#### Logs de Debug

```bash
# Habilitar logs detalhados
NODE_ENV=development npm run test:ocr
```

## Performance

### Otimizações

1. **Cache**: Modelo de linguagem cacheados
2. **Singleton**: Uma instância do worker
3. **Cleanup**: Liberação automática de recursos
4. **Compressão**: Imagens otimizadas

### Benchmarks

- **Tempo de Inicialização**: ~2-3 segundos
- **Processamento**: ~1-2 segundos por imagem
- **Memória**: ~50-100MB por worker

## Contribuição

### Desenvolvimento

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Adicione testes
5. Documente as mudanças
6. Abra um Pull Request

### Padrões de Código

- Use TypeScript
- Adicione comentários em português
- Siga as convenções de nomenclatura
- Inclua tratamento de erros
- Escreva testes unitários

## Licença

Este sistema OCR está licenciado sob MIT License.

## Suporte

Para suporte técnico:

1. Consulte esta documentação
2. Verifique os logs do sistema
3. Execute os scripts de verificação
4. Abra uma issue no repositório

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0
