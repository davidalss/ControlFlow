import { pgTable, text, integer, real, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    role: text("role", { enum: ['admin', 'inspector', 'engineering', 'coordenador', 'block_control', 'temporary_viewer', 'analista', 'assistente', 'lider', 'supervisor', 'p&d', 'tecnico', 'manager'] }).notNull(),
    businessUnit: text("business_unit", { enum: ['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A'] }),
    photo: text("photo"),
    createdAt: timestamp("created_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
    passwordResetToken: text("password_reset_token"),
    passwordResetExpires: timestamp("password_reset_expires"),
});
export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    ean: text("ean"),
    description: text("description").notNull(),
    category: text("category").notNull(),
    businessUnit: text("business_unit", { enum: ['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A'] }).notNull(),
    technicalParameters: text("technical_parameters"), // JSON as text
    // NOVO: Suporte a múltiplas voltagens
    voltageVariants: jsonb("voltage_variants").default('[]'), // Array de variantes de voltagem
    voltageType: text("voltage_type", { enum: ['127V', '220V', 'BIVOLT', 'DUAL', 'MULTIPLE'] }).default('127V'),
    isMultiVoltage: boolean("is_multi_voltage").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});
// Nova tabela para planos de inspeção baseada no documento PCG02.049
export const inspectionPlans = pgTable("inspection_plans", {
    id: uuid("id").primaryKey().defaultRandom(),
    planCode: text("plan_code").notNull().unique(), // Ex: PCG02.049
    planName: text("plan_name").notNull(), // Ex: "Plano de Inspeção - Air Fryer Barbecue"
    planType: text("plan_type", { enum: ['product', 'parts'] }).notNull(), // produto ou peças
    version: text("version").notNull(), // Ex: "Rev. 01"
    status: text("status", { enum: ['active', 'inactive', 'draft'] }).default('draft').notNull(),
    // Informações do produto
    productId: uuid("product_id").references(() => products.id),
    productCode: text("product_code"), // Código do produto (pode ser múltiplos)
    productName: text("product_name").notNull(),
    productFamily: text("product_family"),
    businessUnit: text("business_unit", { enum: ['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A'] }).notNull(),
    // NOVO: Produtos vinculados ao plano
    linkedProducts: jsonb("linked_products").default('[]'), // Array de produtos com voltagens
    // NOVO: Configuração de voltagens
    voltageConfiguration: jsonb("voltage_configuration").default('{}'), // Configuração de voltagens
    // Tipo de inspeção
    inspectionType: text("inspection_type", { enum: ['functional', 'graphic', 'dimensional', 'electrical', 'packaging', 'mixed'] }).notNull(),
    // Critérios de aceite/rejeição
    aqlCritical: real("aql_critical").default(0),
    aqlMajor: real("aql_major").default(2.5),
    aqlMinor: real("aql_minor").default(4.0),
    samplingMethod: text("sampling_method").notNull(), // NBR 5426, 100%, etc.
    inspectionLevel: text("inspection_level", { enum: ['I', 'II', 'III'] }).default('II'),
    // Estrutura do plano
    inspectionSteps: text("inspection_steps").notNull(), // JSON com etapas detalhadas
    checklists: text("checklists").notNull(), // JSON com checklists
    requiredParameters: text("required_parameters").notNull(), // JSON com parâmetros obrigatórios
    requiredPhotos: text("required_photos"), // JSON com fotos obrigatórias
    // NOVO: Perguntas por voltagem com classificação de defeitos
    questionsByVoltage: jsonb("questions_by_voltage").default('{}'), // Perguntas organizadas por voltagem
    // NOVO: Etiquetas por voltagem
    labelsByVoltage: jsonb("labels_by_voltage").default('{}'), // Etiquetas por voltagem
    // Arquivos complementares
    labelFile: text("label_file"), // URL do arquivo de etiqueta
    manualFile: text("manual_file"), // URL do manual
    packagingFile: text("packaging_file"),
    artworkFile: text("artwork_file"),
    additionalFiles: text("additional_files"), // JSON
    // Controle
    createdBy: uuid("created_by").notNull().references(() => users.id),
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at"),
    observations: text("observations"),
    specialInstructions: text("special_instructions"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Histórico de revisões do plano
export const inspectionPlanRevisions = pgTable("inspection_plan_revisions", {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id").notNull().references(() => inspectionPlans.id),
    revision: integer("revision").notNull(), // 1, 2, 3...
    action: text("action").notNull(), // 'created', 'updated', 'archived'
    changedBy: text("changed_by").notNull(),
    changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow(),
    changes: jsonb("changes").default('{}'),
});
// Vinculação de produtos ao plano (muitos para muitos)
export const inspectionPlanProducts = pgTable("inspection_plan_products", {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id").notNull().references(() => inspectionPlans.id),
    productId: uuid("product_id").notNull().references(() => products.id),
    voltage: text("voltage"), // Para produtos com múltiplas voltagens
    variant: text("variant"), // Variação do produto
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
export const acceptanceRecipes = pgTable("acceptance_recipes", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id),
    version: text("version").notNull(),
    parameters: text("parameters").notNull(), // JSON as text
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
// Nova tabela para receitas de perguntas de inspeção
export const questionRecipes = pgTable("question_recipes", {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id").notNull().references(() => inspectionPlans.id),
    questionId: text("question_id").notNull(), // ID da pergunta no plano
    questionName: text("question_name").notNull(), // Nome da pergunta (ex: "Voltagem (V)")
    questionType: text("question_type", { enum: ['number', 'text', 'yes_no', 'ok_nok', 'scale_1_5', 'scale_1_10', 'multiple_choice', 'true_false', 'checklist', 'photo'] }).notNull(),
    minValue: real("min_value"), // Valor mínimo aceitável
    maxValue: real("max_value"), // Valor máximo aceitável
    expectedValue: text("expected_value"), // Valor esperado (para comparação exata)
    tolerance: real("tolerance"), // Tolerância (±)
    unit: text("unit"), // Unidade de medida (V, A, mm, etc.)
    options: text("options"), // JSON com opções para múltipla escolha
    defectType: text("defect_type", { enum: ['MENOR', 'MAIOR', 'CRÍTICO'] }).notNull(),
    isRequired: boolean("is_required").default(true).notNull(),
    description: text("description"), // Descrição adicional da pergunta
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Tabela NQA (Níveis de Qualidade Aceitável)
export const nqaTable = pgTable('nqa_table', {
    id: text('id').primaryKey().$defaultFn(() => `nqa_${crypto.randomUUID()}`),
    lotSize: integer('lot_size').notNull(), // Tamanho do lote
    sampleSize: integer('sample_size').notNull(), // Tamanho da amostra
    acceptanceNumber: integer('acceptance_number').notNull(), // Número de aceitação
    rejectionNumber: integer('rejection_number').notNull(), // Número de rejeição
    aqlLevel: text('aql_level').notNull(), // Nível AQL (ex: 0.65, 1.0, 2.5)
    inspectionLevel: text('inspection_level').notNull(), // Nível de inspeção (I, II, III)
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Tabela de Inspeções (atualizada)
export const inspections = pgTable('inspections', {
    id: uuid('id').primaryKey().defaultRandom(),
    inspectionCode: text('inspection_code').notNull().unique(), // Código da inspeção
    fresNf: text('fres_nf').notNull(), // FRES/NF
    supplier: text('supplier').notNull(), // Fornecedor
    productId: uuid('product_id').notNull(), // ID do produto
    productCode: text('product_code').notNull(), // Código do produto
    productName: text('product_name').notNull(), // Nome do produto
    lotSize: integer('lot_size').notNull(), // Tamanho do lote (quantidade na NF)
    inspectionDate: timestamp('inspection_date').notNull(), // Data da inspeção
    inspectionPlanId: uuid('inspection_plan_id').notNull(), // ID do plano de inspeção
    inspectorId: uuid('inspector_id').notNull(), // ID do inspetor
    inspectorName: text('inspector_name').notNull(), // Nome do inspetor
    // Dados NQA
    nqaId: text('nqa_id').notNull(), // ID da tabela NQA usada
    sampleSize: integer('sample_size').notNull(), // Tamanho da amostra inspecionada
    acceptanceNumber: integer('acceptance_number').notNull(), // Número de aceitação
    rejectionNumber: integer('rejection_number').notNull(), // Número de rejeição
    // Contadores de defeitos
    minorDefects: integer('minor_defects').default(0), // Defeitos menores
    majorDefects: integer('major_defects').default(0), // Defeitos maiores
    criticalDefects: integer('critical_defects').default(0), // Defeitos críticos
    totalDefects: integer('total_defects').default(0), // Total de defeitos
    // Status da inspeção
    status: text('status').notNull().default('in_progress'), // in_progress, completed, approved, rejected
    autoDecision: text('auto_decision'), // auto_approved, auto_rejected, manual_review
    inspectorDecision: text('inspector_decision'), // approved, rejected
    rncType: text('rnc_type'), // registration, corrective_action
    // Dados da RNC
    rncId: text('rnc_id'), // ID da RNC gerada
    rncStatus: text('rnc_status'), // pending, in_treatment, closed
    // Evidências
    photos: jsonb('photos'), // Array de URLs das fotos
    notes: text('notes'), // Observações do inspetor
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Tabela de Resultados da Inspeção (respostas às perguntas)
export const inspectionResults = pgTable('inspection_results', {
    id: text('id').primaryKey().$defaultFn(() => `result_${crypto.randomUUID()}`),
    inspectionId: uuid('inspection_id').notNull(), // ID da inspeção
    questionId: text('question_id').notNull(), // ID da pergunta
    questionText: text('question_text').notNull(), // Texto da pergunta
    answer: text('answer').notNull(), // OK, NOK
    defectType: text('defect_type'), // minor, major, critical
    defectDescription: text('defect_description'), // Descrição do defeito
    photoUrl: text('photo_url'), // URL da foto do defeito
    notes: text('notes'), // Observações específicas
    createdAt: timestamp('created_at').defaultNow(),
});
// Tabela de RNC (Registros de Não Conformidade)
export const rncRecords = pgTable('rnc_records', {
    id: text('id').primaryKey().$defaultFn(() => `rnc_${crypto.randomUUID()}`),
    rncCode: text('rnc_code').notNull().unique(), // Código da RNC
    inspectionId: uuid('inspection_id').notNull(), // ID da inspeção relacionada
    // Informações básicas
    date: timestamp('date').notNull(), // Data da RNC
    inspectorId: text('inspector_id').notNull(), // ID do inspetor
    inspectorName: text('inspector_name').notNull(), // Nome do inspetor
    // Informações do produto
    supplier: text('supplier').notNull(), // Fornecedor
    fresNf: text('fres_nf').notNull(), // FRES/NF
    productCode: text('product_code').notNull(), // Código do produto
    productName: text('product_name').notNull(), // Nome do produto
    lotSize: integer('lot_size').notNull(), // Quantidade na NF do contêiner
    // Dados da inspeção
    inspectionDate: timestamp('inspection_date').notNull(), // Data da inspeção
    inspectedQuantity: integer('inspected_quantity').notNull(), // Quantidade inspecionada (NQA)
    totalNonConformities: integer('total_non_conformities').notNull(), // Total de não conformidades
    // Reincidência
    isRecurring: boolean('is_recurring').default(false), // Sim/não, via histórico
    previousRncCount: integer('previous_rnc_count').default(0), // Número de RNCs anteriores
    // Detalhes dos defeitos
    defectDetails: jsonb('defect_details').notNull(), // Array com quantidade por defeito e descrições
    // Evidências
    evidencePhotos: jsonb('evidence_photos'), // Array de URLs das fotos (boas e ruins)
    // Medidas de contenção
    containmentMeasures: text('containment_measures'), // Medidas de contenção interna (campo livre)
    // Status e tratamento
    status: text('status').notNull().default('pending'), // pending, in_treatment, closed, blocked
    type: text('type').notNull(), // registration, corrective_action
    sgqStatus: text('sgq_status').default('pending_evaluation'), // pending_evaluation, pending_treatment, closed
    // Dados do SGQ
    sgqAssignedTo: text('sgq_assigned_to'), // ID do responsável SGQ
    sgqAssignedToName: text('sgq_assigned_to_name'), // Nome do responsável SGQ
    sgqNotes: text('sgq_notes'), // Observações do SGQ
    sgqCorrectiveActions: text('sgq_corrective_actions'), // Ações corretivas propostas
    sgqAuthorization: text('sgq_authorization'), // authorized, denied
    // Bloqueio do lote
    lotBlocked: boolean('lot_blocked').default(false), // Se o lote está bloqueado
    lotBlockDate: timestamp('lot_block_date'), // Data do bloqueio
    lotUnblockDate: timestamp('lot_unblock_date'), // Data do desbloqueio
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Tabela de Histórico de RNCs por produto/fornecedor
export const rncHistory = pgTable('rnc_history', {
    id: text('id').primaryKey().$defaultFn(() => `history_${crypto.randomUUID()}`),
    productId: text('product_id').notNull(), // ID do produto
    supplier: text('supplier').notNull(), // Fornecedor
    rncId: text('rnc_id').notNull(), // ID da RNC
    date: timestamp('date').notNull(), // Data da RNC
    defectType: text('defect_type').notNull(), // Tipo de defeito
    defectCount: integer('defect_count').notNull(), // Quantidade do defeito
    status: text('status').notNull(), // Status da RNC
    createdAt: timestamp('created_at').defaultNow(),
});
// Tabela de Notificações (atualizada)
export const notifications = pgTable('notifications', {
    id: text('id').primaryKey().$defaultFn(() => `notif_${crypto.randomUUID()}`),
    userId: uuid('user_id').notNull(), // ID do usuário
    title: text('title').notNull(), // Título da notificação
    message: text('message').notNull(), // Mensagem da notificação
    type: text('type').notNull(), // inspection, rnc, sgq, system
    priority: text('priority').notNull().default('normal'), // low, normal, high, urgent
    read: boolean('read').default(false), // Se foi lida
    actionUrl: text('action_url'), // URL para ação (opcional)
    relatedId: text('related_id'), // ID relacionado (inspeção, RNC, etc.)
    createdAt: timestamp('created_at').defaultNow(),
});
// New tables for enhanced user management
export const groups = pgTable("groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    businessUnit: text("business_unit", { enum: ['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A'] }),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
});
export const groupMembers = pgTable("group_members", {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id").notNull().references(() => groups.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    role: text("role", { enum: ['member', 'leader', 'admin'] }).default('member').notNull(),
    joinedAt: timestamp("joined_at").defaultNow(),
});
export const permissions = pgTable("permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    resource: text("resource").notNull(), // e.g., 'users', 'products', 'inspections'
    action: text("action").notNull(), // e.g., 'create', 'read', 'update', 'delete'
    createdAt: timestamp("created_at").defaultNow(),
});
export const rolePermissions = pgTable("role_permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    role: text("role").notNull(),
    permissionId: uuid("permission_id").notNull().references(() => permissions.id),
    granted: boolean("granted").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
export const solicitations = pgTable("solicitations", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    type: text("type", { enum: ['inspection', 'approval', 'block', 'analysis', 'general'] }).notNull(),
    priority: text("priority", { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium').notNull(),
    status: text("status", { enum: ['pending', 'in_progress', 'completed', 'cancelled'] }).default('pending').notNull(),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    assignedTo: uuid("assigned_to").references(() => users.id), // null for group assignments
    assignedGroup: uuid("assigned_group").references(() => groups.id), // null for individual assignments
    productId: uuid("product_id").references(() => products.id),
    dueDate: integer("due_date", { mode: 'timestamp' }),
    startedAt: integer("started_at", { mode: 'timestamp' }),
    completedAt: integer("completed_at", { mode: 'timestamp' }),
    createdAt: timestamp("created_at").defaultNow(),
});
export const solicitationAssignments = pgTable("solicitation_assignments", {
    id: uuid("id").primaryKey().defaultRandom(),
    solicitationId: uuid("solicitation_id").notNull().references(() => solicitations.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    status: text("status", { enum: ['pending', 'accepted', 'declined', 'completed'] }).default('pending').notNull(),
    acceptedAt: integer("accepted_at", { mode: 'timestamp' }),
    completedAt: integer("completed_at", { mode: 'timestamp' }),
    createdAt: timestamp("created_at").defaultNow(),
});
export const approvalDecisions = pgTable("approval_decisions", {
    id: uuid("id").primaryKey().defaultRandom(),
    inspectionId: uuid("inspection_id").notNull().references(() => inspections.id),
    decision: text("decision", { enum: ['approved', 'rejected', 'pending'] }).notNull(),
    engineerId: uuid("engineer_id").notNull().references(() => users.id),
    justification: text("justification").notNull(),
    evidence: text("evidence"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const blocks = pgTable("blocks", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id),
    quantity: integer("quantity").notNull(),
    reason: text("reason").notNull(),
    responsibleUserId: uuid("responsible_user_id").notNull().references(() => users.id),
    requesterId: uuid("requester_id").notNull().references(() => users.id),
    status: text("status", { enum: ['active', 'released'] }).default('active').notNull(),
    justification: text("justification").notNull(),
    evidence: text("evidence"),
    createdAt: timestamp("created_at").defaultNow(),
    releasedAt: integer("released_at"),
});
export const logs = pgTable("logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    timestamp: timestamp("timestamp").defaultNow(),
    userId: uuid("user_id").references(() => users.id),
    userName: text("user_name").notNull(),
    actionType: text("action_type").notNull(),
    description: text("description").notNull(),
    details: text("details"), // JSON as text
});
// Relations
// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
});
export const insertProductSchema = createInsertSchema(products).omit({
    id: true,
    createdAt: true,
});
export const insertInspectionPlanSchema = createInsertSchema(inspectionPlans).omit({
    id: true,
    createdAt: true,
});
export const insertAcceptanceRecipeSchema = createInsertSchema(acceptanceRecipes).omit({
    id: true,
    createdAt: true,
});
export const insertQuestionRecipeSchema = createInsertSchema(questionRecipes).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertInspectionSchema = createInsertSchema(inspections).omit({
    id: true,
    startedAt: true,
    completedAt: true,
});
export const insertApprovalDecisionSchema = createInsertSchema(approvalDecisions).omit({
    id: true,
    createdAt: true,
});
export const insertBlockSchema = createInsertSchema(blocks).omit({
    id: true,
    createdAt: true,
    releasedAt: true,
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({
    id: true,
    createdAt: true,
});
export const insertLogSchema = createInsertSchema(logs).omit({
    id: true,
    timestamp: true,
});
export const insertSolicitationSchema = createInsertSchema(solicitations).omit({
    id: true,
    createdAt: true,
});
// New insert schemas
export const insertGroupSchema = createInsertSchema(groups).omit({
    id: true,
    createdAt: true,
});
export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
    id: true,
    joinedAt: true,
});
export const insertPermissionSchema = createInsertSchema(permissions).omit({
    id: true,
    createdAt: true,
});
export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
    id: true,
    createdAt: true,
});
export const insertSolicitationAssignmentSchema = createInsertSchema(solicitationAssignments).omit({
    id: true,
    createdAt: true,
});
// Tabelas para histórico de chat do Severino
export const chatSessions = pgTable("chat_sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    sessionName: text("session_name"), // Nome opcional da sessão
    status: text("status", { enum: ['active', 'archived'] }).default('active').notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const chatMessages = pgTable("chat_messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => chatSessions.id),
    role: text("role", { enum: ['user', 'assistant'] }).notNull(),
    content: text("content").notNull(), // Mensagem do usuário ou resposta do Severino
    media: text("media"), // JSON com mídia (diagramas, imagens, etc.)
    context: text("context"), // JSON com contexto da mensagem (etiquetas analisadas, etc.)
    metadata: text("metadata"), // JSON com metadados adicionais
    createdAt: timestamp("created_at").defaultNow(),
});
export const chatContexts = pgTable("chat_contexts", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => chatSessions.id),
    contextType: text("context_type", { enum: ['label_analysis', 'product_info', 'inspection_data', 'comparison'] }).notNull(),
    contextData: text("context_data").notNull(), // JSON com dados do contexto
    createdAt: timestamp("created_at").defaultNow(),
});
// Tabelas para Gestão de Fornecedores
export const suppliers = pgTable("suppliers", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(), // Código único do fornecedor
    name: text("name").notNull(), // Nome do fornecedor
    type: text("type", { enum: ['imported', 'national'] }).notNull(), // Importado ou Nacional
    country: text("country").notNull(), // País de origem
    category: text("category").notNull(), // Categoria de produtos
    status: text("status", { enum: ['active', 'suspended', 'under_review', 'blacklisted'] }).default('active').notNull(),
    // Informações de contato
    contactPerson: text("contact_person").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address"),
    website: text("website"),
    // Avaliação e performance
    rating: real("rating").default(0), // Avaliação geral (0-5)
    performance: text("performance"), // JSON com métricas de performance
    // Controle de auditoria
    lastAudit: timestamp("last_audit"),
    nextAudit: timestamp("next_audit"),
    auditScore: real("audit_score").default(0),
    // Metadados
    observations: text("observations"),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Vinculação de produtos aos fornecedores
export const supplierProducts = pgTable("supplier_products", {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
    productId: uuid("product_id").notNull().references(() => products.id),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
// Avaliações de fornecedores
export const supplierEvaluations = pgTable("supplier_evaluations", {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
    evaluationDate: timestamp("evaluation_date").notNull(),
    eventType: text("event_type", { enum: ['container_receipt', 'audit', 'quality_review', 'performance_review'] }).notNull(),
    eventDescription: text("event_description"), // Descrição do evento (ex: "Recebimento Container ABC123")
    // Critérios de avaliação
    qualityScore: real("quality_score").notNull(), // 0-100
    deliveryScore: real("delivery_score").notNull(), // 0-100
    costScore: real("cost_score").notNull(), // 0-100
    communicationScore: real("communication_score").notNull(), // 0-100
    technicalScore: real("technical_score").notNull(), // 0-100
    // Score geral
    overallScore: real("overall_score").notNull(), // 0-100
    // Detalhes da avaliação
    strengths: text("strengths"), // JSON com pontos fortes
    weaknesses: text("weaknesses"), // JSON com pontos fracos
    recommendations: text("recommendations"), // JSON com recomendações
    observations: text("observations"),
    // Metadados
    evaluatedBy: uuid("evaluated_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
});
// Auditorias de fornecedores
export const supplierAudits = pgTable("supplier_audits", {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
    auditDate: timestamp("audit_date").notNull(),
    auditor: text("auditor").notNull(),
    auditType: text("audit_type", { enum: ['initial', 'surveillance', 'recertification', 'follow_up'] }).notNull(),
    // Resultados da auditoria
    score: real("score").notNull(), // 0-100
    status: text("status", { enum: ['passed', 'failed', 'conditional'] }).notNull(),
    // Detalhes
    findings: text("findings"), // JSON com achados
    recommendations: text("recommendations"), // JSON com recomendações
    correctiveActions: text("corrective_actions"), // JSON com ações corretivas
    // Controle
    nextAuditDate: timestamp("next_audit_date"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
// Schemas para inserção
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
    id: true,
    createdAt: true,
});
export const insertChatContextSchema = createInsertSchema(chatContexts).omit({
    id: true,
    createdAt: true,
});
// Schemas para fornecedores
export const insertSupplierSchema = createInsertSchema(suppliers).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertSupplierProductSchema = createInsertSchema(supplierProducts).omit({
    id: true,
    createdAt: true,
});
export const insertSupplierEvaluationSchema = createInsertSchema(supplierEvaluations).omit({
    id: true,
    createdAt: true,
});
export const insertSupplierAuditSchema = createInsertSchema(supplierAudits).omit({
    id: true,
    createdAt: true,
});
// Relations
export const questionRecipesRelations = relations(questionRecipes, ({ one }) => ({
    plan: one(inspectionPlans, {
        fields: [questionRecipes.planId],
        references: [inspectionPlans.id],
    }),
}));
export const inspectionPlansRelations = relations(inspectionPlans, ({ many }) => ({
    questionRecipes: many(questionRecipes),
}));
