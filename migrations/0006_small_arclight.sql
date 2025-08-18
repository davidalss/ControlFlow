CREATE TABLE "inspection_results" (
	"id" text PRIMARY KEY NOT NULL,
	"inspection_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"question_text" text NOT NULL,
	"answer" text NOT NULL,
	"defect_type" text,
	"defect_description" text,
	"photo_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nqa_table" (
	"id" text PRIMARY KEY NOT NULL,
	"lot_size" integer NOT NULL,
	"sample_size" integer NOT NULL,
	"acceptance_number" integer NOT NULL,
	"rejection_number" integer NOT NULL,
	"aql_level" text NOT NULL,
	"inspection_level" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rnc_history" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"supplier" text NOT NULL,
	"rnc_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"defect_type" text NOT NULL,
	"defect_count" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rnc_records" (
	"id" text PRIMARY KEY NOT NULL,
	"rnc_code" text NOT NULL,
	"inspection_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"inspector_id" text NOT NULL,
	"inspector_name" text NOT NULL,
	"supplier" text NOT NULL,
	"fres_nf" text NOT NULL,
	"product_code" text NOT NULL,
	"product_name" text NOT NULL,
	"lot_size" integer NOT NULL,
	"inspection_date" timestamp NOT NULL,
	"inspected_quantity" integer NOT NULL,
	"total_non_conformities" integer NOT NULL,
	"is_recurring" boolean DEFAULT false,
	"previous_rnc_count" integer DEFAULT 0,
	"defect_details" jsonb NOT NULL,
	"evidence_photos" jsonb,
	"containment_measures" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"type" text NOT NULL,
	"sgq_status" text DEFAULT 'pending_evaluation',
	"sgq_assigned_to" text,
	"sgq_assigned_to_name" text,
	"sgq_notes" text,
	"sgq_corrective_actions" text,
	"sgq_authorization" text,
	"lot_blocked" boolean DEFAULT false,
	"lot_block_date" timestamp,
	"lot_unblock_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rnc_records_rnc_code_unique" UNIQUE("rnc_code")
);
--> statement-breakpoint
CREATE TABLE "supplier_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"audit_date" timestamp NOT NULL,
	"auditor" text NOT NULL,
	"audit_type" text NOT NULL,
	"score" real NOT NULL,
	"status" text NOT NULL,
	"findings" text,
	"recommendations" text,
	"corrective_actions" text,
	"next_audit_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"evaluation_date" timestamp NOT NULL,
	"event_type" text NOT NULL,
	"event_description" text,
	"quality_score" real NOT NULL,
	"delivery_score" real NOT NULL,
	"cost_score" real NOT NULL,
	"communication_score" real NOT NULL,
	"technical_score" real NOT NULL,
	"overall_score" real NOT NULL,
	"strengths" text,
	"weaknesses" text,
	"recommendations" text,
	"observations" text,
	"evaluated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"country" text NOT NULL,
	"category" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"contact_person" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"website" text,
	"rating" real DEFAULT 0,
	"performance" text,
	"last_audit" timestamp,
	"next_audit" timestamp,
	"audit_score" real DEFAULT 0,
	"observations" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "suppliers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "inspections" DROP CONSTRAINT "inspections_inspection_id_unique";--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" DROP CONSTRAINT "inspection_plan_revisions_changed_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" DROP CONSTRAINT "inspection_plan_revisions_approved_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "inspections" DROP CONSTRAINT "inspections_inspector_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "inspections" DROP CONSTRAINT "inspections_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "inspections" DROP CONSTRAINT "inspections_plan_id_inspection_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "inspections" DROP CONSTRAINT "inspections_recipe_id_acceptance_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_recipes" ALTER COLUMN "product_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "approval_decisions" ALTER COLUMN "inspection_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "approval_decisions" ALTER COLUMN "engineer_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "product_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "responsible_user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "requester_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "chat_contexts" ALTER COLUMN "session_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "session_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "chat_sessions" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "group_members" ALTER COLUMN "group_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "group_members" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "groups" ALTER COLUMN "created_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inspection_plan_products" ALTER COLUMN "plan_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inspection_plan_products" ALTER COLUMN "product_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" ALTER COLUMN "plan_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" ALTER COLUMN "changes" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" ALTER COLUMN "changes" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" ALTER COLUMN "changes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inspection_plans" ALTER COLUMN "product_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inspection_plans" ALTER COLUMN "created_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inspection_plans" ALTER COLUMN "approved_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inspection_plans" ALTER COLUMN "approved_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "inspections" ALTER COLUMN "inspector_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inspections" ALTER COLUMN "product_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inspections" ALTER COLUMN "status" SET DEFAULT 'in_progress';--> statement-breakpoint
ALTER TABLE "inspections" ALTER COLUMN "photos" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "logs" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "permission_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "solicitation_assignments" ALTER COLUMN "solicitation_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "solicitation_assignments" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "solicitations" ALTER COLUMN "created_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "solicitations" ALTER COLUMN "assigned_to" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "solicitations" ALTER COLUMN "assigned_group" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "solicitations" ALTER COLUMN "product_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" ADD COLUMN "revision" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" ADD COLUMN "action" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" ADD COLUMN "changed_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "inspection_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "fres_nf" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "supplier" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "product_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "product_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "lot_size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "inspection_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "inspection_plan_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "inspector_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "nqa_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "sample_size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "acceptance_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "rejection_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "minor_defects" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "major_defects" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "critical_defects" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "total_defects" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "auto_decision" text;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "inspector_decision" text;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "rnc_type" text;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "rnc_id" text;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "rnc_status" text;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "priority" text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "read" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "action_url" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "related_id" text;--> statement-breakpoint
ALTER TABLE "supplier_audits" ADD CONSTRAINT "supplier_audits_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_evaluations" ADD CONSTRAINT "supplier_evaluations_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_evaluations" ADD CONSTRAINT "supplier_evaluations_evaluated_by_users_id_fk" FOREIGN KEY ("evaluated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" DROP COLUMN "version";--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" DROP COLUMN "revision_number";--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" DROP COLUMN "approved_by";--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" DROP COLUMN "approved_at";--> statement-breakpoint
ALTER TABLE "inspection_plan_revisions" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "inspection_id";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "plan_id";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "plan_version";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "recipe_id";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "serial_number";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "technical_parameters";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "visual_checks";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "videos";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "observations";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "defect_type";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "started_at";--> statement-breakpoint
ALTER TABLE "inspections" DROP COLUMN "completed_at";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "is_read";--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspection_code_unique" UNIQUE("inspection_code");