module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Regras de qualidade de código
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'warn',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    
    // Regras de formatação
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    
    // Regras de espaçamento
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'no-multiple-empty-lines': ['error', { max: 2 }],
    
    // Regras de funções
    'func-style': ['error', 'expression'],
    'arrow-spacing': 'error',
    'no-confusing-arrow': 'error',
    
    // Regras de objetos e arrays
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'computed-property-spacing': ['error', 'never'],
    
    // Regras de strings
    'template-curly-spacing': 'error',
    'no-useless-concat': 'error',
    
    // Regras de variáveis
    'no-use-before-define': 'error',
    'no-shadow': 'error',
    'no-undef': 'error',
    
    // Regras de performance
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Regras de segurança
    'no-script-url': 'error',
    'no-unsafe-finally': 'error',
    
    // Regras específicas do projeto
    'max-len': ['warn', { code: 120 }],
    'complexity': ['warn', 10],
    'max-depth': ['warn', 4],
    'max-params': ['warn', 4],
  },
  globals: {
    // Variáveis globais do navegador
    window: 'readonly',
    document: 'readonly',
    console: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    fetch: 'readonly',
    Event: 'readonly',
    CustomEvent: 'readonly',
    
    // Variáveis globais do projeto
    sistemaVendas: 'writable',
    authManager: 'writable',
    uiManager: 'writable',
    dataManager: 'writable',
    routingManager: 'writable',
    moduleLoader: 'writable',
    eventBus: 'writable',
    SystemConfig: 'readonly',
  },
  overrides: [
    {
      files: ['*.html'],
      env: {
        browser: true,
      },
      rules: {
        'no-undef': 'off',
      },
    },
    {
      files: ['scripts/*.js'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
}; 