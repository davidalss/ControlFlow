import pino from 'pino';

/**
 * Instância configurada do logger Pino
 * Configura níveis de log baseados no ambiente
 * Inclui formatação colorida para desenvolvimento
 */
export const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});
