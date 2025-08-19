-- Adicionar colunas de voltagem na tabela products
ALTER TABLE "products" ADD COLUMN "voltage_variants" jsonb DEFAULT '[]';
ALTER TABLE "products" ADD COLUMN "voltage_type" text DEFAULT '127V';
ALTER TABLE "products" ADD COLUMN "is_multi_voltage" boolean DEFAULT false;
