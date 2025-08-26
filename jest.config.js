/**
 * Configuração Jest para testes automatizados
 * 
 * Uso:
 * npm test -- --testPathPattern=healthcheck.test.js
 * npm test -- --testPathPattern=contract.test.js
 * npm test -- --testPathPattern=smoke.test.js
 * npm test -- --testPathPattern=auth-cors.test.js
 * npm test -- --testPathPattern=performance.test.js
 * npm test -- --testPathPattern=boundary.test.js
 * npm test -- --testPathPattern=logging-capture.test.js
 */

export default {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Extensões de arquivo
  extensionsToTreatAsEsm: ['.js'],
  
  // Transformações
  transform: {},
  
  // Módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Configurações globais
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  
  // Timeout padrão
  testTimeout: 30000,
  
  // Setup e teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Cobertura
  collectCoverage: false,
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/node_modules/**',
    '!server/tests/**',
  ],
  
  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true,
    }],
  ],
  
  // Configurações específicas para diferentes tipos de teste
  projects: [
    {
      displayName: 'healthcheck',
      testMatch: ['<rootDir>/tests/healthcheck.test.js'],
      testTimeout: 60000,
    },
    {
      displayName: 'contract',
      testMatch: ['<rootDir>/tests/contract.test.js'],
      testTimeout: 60000,
    },
    {
      displayName: 'smoke',
      testMatch: ['<rootDir>/tests/smoke.test.js'],
      testTimeout: 120000,
    },
    {
      displayName: 'auth-cors',
      testMatch: ['<rootDir>/tests/auth-cors.test.js'],
      testTimeout: 60000,
    },
    {
      displayName: 'performance',
      testMatch: ['<rootDir>/tests/performance.test.js'],
      testTimeout: 120000,
    },
    {
      displayName: 'boundary',
      testMatch: ['<rootDir>/tests/boundary.test.js'],
      testTimeout: 60000,
    },
    {
      displayName: 'logging-capture',
      testMatch: ['<rootDir>/tests/logging-capture.test.js'],
      testTimeout: 60000,
    },
  ],
  
  // Configurações de ambiente
  testEnvironmentOptions: {
    url: 'https://enso-backend-0aa1.onrender.com',
  },
  
  // Verbose
  verbose: true,
  
  // Silenciar logs desnecessários
  silent: false,
  
  // Configurações de watch
  watchPathIgnorePatterns: [
    'node_modules',
    'coverage',
    '.git',
  ],
};
