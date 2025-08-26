/**
 * Cliente Supabase para logs de testes automatizados
 * Conecta usando SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 * 
 * Uso:
 * const supabase = require('./lib/supabase-client');
 * await supabase.insert('system_logs', logData);
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente Supabase não configuradas:');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  throw new Error('Configuração Supabase incompleta');
}

// Criar cliente Supabase com service role key (acesso total)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função para inserir log no Supabase
export async function insertSystemLog(logData) {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .insert([logData])
      .select();

    if (error) {
      console.error('❌ Erro ao inserir log no Supabase:', error);
      throw error;
    }

    console.log('✅ Log inserido no Supabase:', data[0].id);
    return data[0];
  } catch (error) {
    console.error('❌ Falha ao inserir log:', error);
    throw error;
  }
}

// Função para buscar logs com filtros
export async function getSystemLogs(filters = {}) {
  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.suite) {
      query = query.eq('test_suite', filters.suite);
    }
    if (filters.route) {
      query = query.eq('route', filters.route);
    }
    if (filters.status_code) {
      query = query.eq('status_code', filters.status_code);
    }
    if (filters.passed !== undefined) {
      query = query.eq('passed', filters.passed);
    }
    if (filters.from) {
      query = query.gte('created_at', filters.from);
    }
    if (filters.to) {
      query = query.lte('created_at', filters.to);
    }

    // Limitar resultados
    const limit = filters.limit || 100;
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar logs:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Falha ao buscar logs:', error);
    throw error;
  }
}

// Função para limpar logs antigos
export async function cleanOldLogs(daysToKeep = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('system_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('❌ Erro ao limpar logs antigos:', error);
      throw error;
    }

    console.log(`✅ Logs antigos removidos (antes de ${cutoffDate.toISOString()})`);
    return data;
  } catch (error) {
    console.error('❌ Falha ao limpar logs antigos:', error);
    throw error;
  }
}

// Função para obter estatísticas
export async function getSystemLogsStats() {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('test_suite, passed, status_code, response_time_ms, created_at');

    if (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw error;
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const stats = {
      total: data.length,
      passed: data.filter(log => log.passed).length,
      failed: data.filter(log => !log.passed).length,
      last24h: data.filter(log => new Date(log.created_at) >= last24h).length,
      bySuite: {},
      avgResponseTime: 0,
      errorCodes: {}
    };

    // Calcular estatísticas por suíte
    data.forEach(log => {
      stats.bySuite[log.test_suite] = (stats.bySuite[log.test_suite] || 0) + 1;
      if (log.status_code >= 400) {
        stats.errorCodes[log.status_code] = (stats.errorCodes[log.status_code] || 0) + 1;
      }
    });

    // Calcular tempo médio de resposta
    const responseTimes = data.filter(log => log.response_time_ms).map(log => log.response_time_ms);
    if (responseTimes.length > 0) {
      stats.avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }

    return stats;
  } catch (error) {
    console.error('❌ Falha ao obter estatísticas:', error);
    throw error;
  }
}

export default supabase;
