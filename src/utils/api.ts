import axios from 'axios';

/**
 * Instância configurada do Axios para requisições à API
 * Configura URL base e headers padrão
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisição para adicionar autenticação
 * Adiciona automaticamente o token JWT do localStorage aos headers
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
