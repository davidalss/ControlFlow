import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const BUCKET_NAME = 'ENSOS';
export const PLANOS_FOLDER = 'PLANOS';

export async function uploadEtiquetaReferencia(file: File, etiquetaId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${etiquetaId}.${fileExt}`;
  const filePath = `${PLANOS_FOLDER}/etiquetas/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  // Gerar URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadEtiquetaInspecao(file: File, inspectionId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${inspectionId}_${Date.now()}.${fileExt}`;
  const filePath = `${PLANOS_FOLDER}/inspecoes/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrl;
}
