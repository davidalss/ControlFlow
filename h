[1mdiff --git a/client/src/hooks/use-auth.tsx b/client/src/hooks/use-auth.tsx[m
[1mindex 514bafc..127b27d 100644[m
[1m--- a/client/src/hooks/use-auth.tsx[m
[1m+++ b/client/src/hooks/use-auth.tsx[m
[36m@@ -31,31 +31,26 @@[m [mexport function AuthProvider({ children }: { children: React.ReactNode }) {[m
   const fetchUserProfile = async (userId: string) => {[m
     console.log('Buscando perfil do usuário:', userId);[m
     try {[m
[31m-      // Adiciona timeout para evitar travamento[m
[31m-      const timeoutPromise = new Promise((_, reject) => [m
[31m-        setTimeout(() => reject(new Error('Timeout')), 5000)[m
[31m-      );[m
[31m-[m
[31m-      const profilePromise = supabase[m
[32m+[m[32m      const { data: profile, error } = await supabase[m
         .from('users')[m
[31m-        .select('*')[m
[32m+[m[32m        .select('name, role, photo, business_unit')[m
         .eq('id', userId)[m
[31m-        .single();[m
[31m-[m
[31m-      const { data: profile, error: profileError } = await Promise.race([[m
[31m-        profilePromise,[m
[31m-        timeoutPromise[m
[31m-      ]) as any;[m
[32m+[m[32m        .maybeSingle();[m
 [m
[31m-      console.log('Resposta da busca de perfil:', { profile, profileError });[m
[32m+[m[32m      // 42501 (permission denied) ou 403: tabela protegida por RLS sem policy para usuário[m
[32m+[m[32m      if (error && (error.code === '42501' || (error as any).status === 403)) {[m
[32m+[m[32m        console.warn('Sem permissão para ler a tabela users (RLS). Usando dados básicos do auth.');[m
[32m+[m[32m        return null;[m
[32m+[m[32m      }[m
 [m
[31m-      if (profileError && profileError.code !== 'PGRST116') {[m
[31m-        console.warn('Erro ao buscar perfil do usuário:', profileError);[m
[32m+[m[32m      if (error && error.code !== 'PGRST116') {[m
[32m+[m[32m        console.warn('Erro ao buscar perfil do usuário:', error);[m
       }[m
 [m
[31m-      return profile;[m
[31m-    } catch (error) {[m
[31m-      console.warn('Erro ao buscar perfil do usuário (usando fallback):', error);[m
[32m+[m[32m      console.log('Resposta da busca de perfil:', { profile });[m
[32m+[m[32m      return profile ?? null;[m
[32m+[m[32m    } catch (err) {[m
[32m+[m[32m      console.warn('Erro inesperado ao buscar perfil do usuário. Usando fallback.', err);[m
       return null;[m
     }[m
   };[m
