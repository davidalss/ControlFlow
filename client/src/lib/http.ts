// src/lib/http.ts
import { log, generateCorrelationId, sanitizeData } from "./logger";

export type HttpError = Error & {
  status?: number;
  correlationId?: string;
  cause?: unknown;
  response?: Response;
  url?: string;
  method?: string;
};

export type HttpRequestMeta = {
  feature: string;
  action: string;
  correlationId?: string;
  timeout?: number;
};

export type HttpResponse<T = unknown> = {
  data: T;
  status: number;
  headers: Record<string, string>;
  url: string;
  correlationId: string;
  duration: number;
};

// Headers sensíveis que devem ser redacted
const REDACT_HEADERS = [
  "authorization", 
  "cookie", 
  "set-cookie", 
  "x-auth-token",
  "x-api-key",
  "bearer",
  "basic"
];

/**
 * Sanitiza headers removendo informações sensíveis
 */
function safeHeaders(headers: HeadersInit | Headers | undefined): Record<string, string> {
  if (!headers) return {};
  
  const out: Record<string, string> = {};
  const h = new Headers(headers as any);
  
  h.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    const shouldRedact = REDACT_HEADERS.some(redactKey => 
      lowerKey.includes(redactKey)
    );
    out[key] = shouldRedact ? "***REDACTED***" : value;
  });
  
  return out;
}

/**
 * Tenta fazer parse de JSON, retorna string se falhar
 */
function tryParseJson(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Faz parse do corpo da resposta baseado no Content-Type
 */
function parseByContentType(text: string, contentType: string): unknown {
  if (contentType.includes("application/json")) {
    return tryParseJson(text) ?? {};
  }
  return text;
}

/**
 * Cria preview truncado do conteúdo para logs
 */
function createPreview(body: unknown, maxLength: number = 1000): unknown {
  if (body === undefined || body === null) return body;
  
  const str = typeof body === "string" ? body : JSON.stringify(body, null, 2);
  
  if (str.length <= maxLength) return body;
  
  return {
    preview: `${str.slice(0, maxLength)}...`,
    truncated: true,
    originalLength: str.length
  };
}

/**
 * Cria erro HTTP enriquecido com contexto
 */
function createHttpError(
  message: string,
  response?: Response,
  correlationId?: string,
  cause?: unknown,
  url?: string,
  method?: string
): HttpError {
  const error = new Error(message) as HttpError;
  error.status = response?.status;
  error.correlationId = correlationId;
  error.cause = cause;
  error.response = response;
  error.url = url;
  error.method = method;
  return error;
}

/**
 * Detecta tipo de erro e fornece dica de diagnóstico
 */
function diagnoseError(error: any, url: string): string {
  // Erro de rede/CORS
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return "Possível erro de CORS ou conectividade de rede. Verifique se o servidor está acessível e configurado para aceitar requisições desta origem.";
  }
  
  // Erro de timeout
  if (error.name === 'AbortError') {
    return "Timeout da requisição. O servidor pode estar sobrecarregado ou indisponível.";
  }
  
  // Erro de SSL/HTTPS
  if (error.message?.includes('SSL') || error.message?.includes('certificate')) {
    return "Erro de certificado SSL/TLS. Verifique a configuração HTTPS do servidor.";
  }
  
  // Erro de DNS
  if (error.message?.includes('DNS') || error.message?.includes('getaddrinfo')) {
    return "Erro de resolução DNS. Verifique se a URL está correta e acessível.";
  }
  
  return "Erro de rede não identificado. Verifique conectividade e configurações do servidor.";
}

/**
 * Função principal para fazer requisições HTTP com logging detalhado
 */
export async function request<T = unknown>(
  input: string,
  init: RequestInit = {},
  meta: HttpRequestMeta
): Promise<T> {
  const correlationId = meta.correlationId ?? generateCorrelationId();
  const start = performance.now();
  const method = (init.method || "GET").toUpperCase();
  
  // Preparar headers
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  
  // Se há body e não há Content-Type, assume JSON
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  // Preparar informações da requisição para log
  const requestInfo = {
    url: input,
    method,
    headers: safeHeaders(headers),
    body: init.body ? sanitizeData(tryParseJson(init.body as string)) : undefined,
    timestamp: new Date().toISOString()
  };

  // Iniciar grupo de logs
  log.group(`📡 ${method} ${input} — ${meta.feature}/${meta.action}`);
  
  // Log da requisição
  log.info({
    feature: meta.feature,
    action: `${meta.action}:request`,
    correlationId,
    details: {
      ...requestInfo,
      preview: createPreview(requestInfo.body, 500)
    }
  });

  let response: Response | undefined;
  let responseText: string | undefined;
  let abortController: AbortController | undefined;

  try {
    // Setup de timeout se especificado
    if (meta.timeout) {
      abortController = new AbortController();
      setTimeout(() => abortController?.abort(), meta.timeout);
      init.signal = abortController.signal;
    }

    // Fazer a requisição
    response = await fetch(input, { ...init, headers });
    
    // Ler resposta
    const duration = Math.round(performance.now() - start);
    const contentType = response.headers.get("content-type") || "";
    responseText = await response.text();
    const parsedBody = parseByContentType(responseText, contentType);

    // Log da resposta
    const responseDetails = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: safeHeaders(response.headers),
      contentType,
      durationMs: duration,
      bodySize: responseText.length,
      body: createPreview(parsedBody, 800),
      timestamp: new Date().toISOString()
    };

    if (response.ok) {
      log.info({
        feature: meta.feature,
        action: `${meta.action}:success`,
        correlationId,
        details: responseDetails
      });
    } else {
      log.error({
        feature: meta.feature,
        action: `${meta.action}:http_error`,
        correlationId,
        details: {
          ...responseDetails,
          errorBody: parsedBody
        }
      });
    }

    // Se não está OK, lançar erro
    if (!response.ok) {
      throw createHttpError(
        `HTTP ${response.status} ${response.statusText} for ${method} ${input}`,
        response,
        correlationId,
        parsedBody,
        input,
        method
      );
    }

    log.groupEnd();
    return parsedBody as T;

  } catch (error: any) {
    const duration = Math.round(performance.now() - start);
    const isNetworkError = error instanceof TypeError && /fetch/i.test(error.message);
    const isTimeoutError = error.name === 'AbortError';
    
    const errorDetails = {
      message: error?.message || String(error),
      name: error?.name,
      status: error?.status || response?.status,
      durationMs: duration,
      isNetworkError,
      isTimeoutError,
      diagnosis: diagnoseError(error, input),
      responsePreview: responseText ? createPreview(tryParseJson(responseText), 500) : undefined,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    };

    log.error({
      feature: meta.feature,
      action: `${meta.action}:error`,
      correlationId,
      details: errorDetails
    });

    // Enriquecer erro com contexto
    const httpError = error as HttpError;
    httpError.correlationId = httpError.correlationId ?? correlationId;
    httpError.url = input;
    httpError.method = method;
    
    // Se é erro de rede, adicionar dica de CORS
    if (isNetworkError) {
      httpError.message = `${httpError.message}\n\nDica: ${diagnoseError(error, input)}`;
    }

    throw httpError;
  } finally {
    log.groupEnd();
    
    // Cleanup
    if (abortController) {
      abortController.abort();
    }
  }
}

/**
 * Helpers para métodos HTTP específicos
 */
export const http = {
  get<T = unknown>(url: string, meta: HttpRequestMeta): Promise<T> {
    return request<T>(url, { method: 'GET' }, meta);
  },

  post<T = unknown>(url: string, data?: unknown, meta?: HttpRequestMeta): Promise<T> {
    return request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, meta!);
  },

  put<T = unknown>(url: string, data?: unknown, meta?: HttpRequestMeta): Promise<T> {
    return request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, meta!);
  },

  patch<T = unknown>(url: string, data?: unknown, meta?: HttpRequestMeta): Promise<T> {
    return request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, meta!);
  },

  delete<T = unknown>(url: string, meta: HttpRequestMeta): Promise<T> {
    return request<T>(url, { method: 'DELETE' }, meta);
  },

  request,
};

/**
 * Configuração global para requests
 */
export const httpConfig = {
  baseURL: '',
  timeout: 30000,
  defaultHeaders: {} as Record<string, string>,
  
  setBaseURL(url: string) {
    this.baseURL = url;
  },
  
  setTimeout(ms: number) {
    this.timeout = ms;
  },
  
  setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...headers };
  }
};

export default http;
