CREATE TABLE "question_recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"question_name" text NOT NULL,
	"question_type" text NOT NULL,
	"min_value" real,
	"max_value" real,
	"expected_value" text,
	"tolerance" real,
	"unit" text,
	"options" text,
	"defect_type" text NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "question_recipes" ADD CONSTRAINT "question_recipes_plan_id_inspection_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."inspection_plans"("id") ON DELETE no action ON UPDATE no action;