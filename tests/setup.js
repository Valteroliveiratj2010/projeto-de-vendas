/**
 * 🧪 Setup dos Testes
 * Configurações globais para todos os testes
 */

// Mock do DOM para testes
global.window = global;

// Mock do localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock do sessionStorage
global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock do fetch
global.fetch = jest.fn();

// Mock do console para testes
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock do Event e CustomEvent
global.Event = class Event {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = options.bubbles || false;
    this.cancelable = options.cancelable || false;
  }
};

global.CustomEvent = class CustomEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail || null;
  }
};

// Mock do navigator
global.navigator = {
  onLine: true,
  userAgent: 'jest-test-environment',
};

// Mock do location
global.location = {
  href: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
};

// Mock do history
global.history = {
  pushState: jest.fn(),
  replaceState: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  go: jest.fn(),
};

// Mock do performance
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
};

// Mock do IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock do ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock do MutationObserver
global.MutationObserver = class MutationObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

// Mock do getComputedStyle
global.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => ''),
}));

// Mock do matchMedia
global.matchMedia = jest.fn(() => ({
  matches: false,
  addListener: jest.fn(),
  removeListener: jest.fn(),
}));

// Mock do requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 0);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

// Mock do setTimeout e setInterval
global.setTimeout = jest.fn((callback, delay) => {
  if (typeof callback === 'function') {
    return setTimeout(callback, delay);
  }
  return 1;
});

global.setInterval = jest.fn((callback, delay) => {
  if (typeof callback === 'function') {
    return setInterval(callback, delay);
  }
  return 1;
});

global.clearTimeout = jest.fn();
global.clearInterval = jest.fn();

// Mock do URLSearchParams
global.URLSearchParams = class URLSearchParams {
  constructor(init) {
    this.params = new Map();
    if (init) {
      if (typeof init === 'string') {
        init = init.replace('?', '');
        const pairs = init.split('&');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          this.params.set(key, value);
        });
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => {
          this.params.set(key, value);
        });
      } else if (init instanceof URLSearchParams) {
        init.params.forEach((value, key) => {
          this.params.set(key, value);
        });
      }
    }
  }
  
  get(key) {
    return this.params.get(key) || null;
  }
  
  getAll(key) {
    return this.params.has(key) ? [this.params.get(key)] : [];
  }
  
  has(key) {
    return this.params.has(key);
  }
  
  set(key, value) {
    this.params.set(key, value);
  }
  
  append(key, value) {
    if (this.params.has(key)) {
      const existing = this.params.get(key);
      this.params.set(key, existing + ',' + value);
    } else {
      this.params.set(key, value);
    }
  }
  
  delete(key) {
    this.params.delete(key);
  }
  
  toString() {
    const pairs = [];
    this.params.forEach((value, key) => {
      pairs.push(`${key}=${value}`);
    });
    return pairs.join('&');
  }
  
  forEach(callback) {
    this.params.forEach(callback);
  }
  
  keys() {
    return this.params.keys();
  }
  
  values() {
    return this.params.values();
  }
  
  entries() {
    return this.params.entries();
  }
};

// Mock do URL
global.URL = class URL {
  constructor(url, base) {
    if (base) {
      this.href = new URL(base).href + url;
    } else {
      this.href = url;
    }
    
    const urlObj = new URL(url, base);
    this.protocol = urlObj.protocol;
    this.host = urlObj.host;
    this.hostname = urlObj.hostname;
    this.port = urlObj.port;
    this.pathname = urlObj.pathname;
    this.search = urlObj.search;
    this.hash = urlObj.hash;
    this.origin = urlObj.origin;
  }
  
  toString() {
    return this.href;
  }
};

// Mock do process.env
global.process = {
  ...global.process,
  env: {
    NODE_ENV: 'test',
    ...global.process.env,
  },
};

// Função utilitária para limpar mocks
global.clearAllMocks = () => {
  jest.clearAllMocks();
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
  localStorage.removeItem.mockClear();
  localStorage.clear.mockClear();
  sessionStorage.getItem.mockClear();
  sessionStorage.setItem.mockClear();
  sessionStorage.removeItem.mockClear();
  sessionStorage.clear.mockClear();
  fetch.mockClear();
  console.log.mockClear();
  console.warn.mockClear();
  console.error.mockClear();
  console.info.mockClear();
  console.debug.mockClear();
};

// Função utilitária para simular eventos
global.simulateEvent = (element, eventType, options = {}) => {
  const event = new Event(eventType, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  
  Object.assign(event, options);
  element.dispatchEvent(event);
  return event;
};

// Função utilitária para simular eventos customizados
global.simulateCustomEvent = (element, eventType, detail = {}) => {
  const event = new CustomEvent(eventType, {
    bubbles: true,
    cancelable: true,
    detail,
  });
  
  element.dispatchEvent(event);
  return event;
};

// Função utilitária para simular mudança de tamanho da janela
global.simulateResize = (width, height) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  window.dispatchEvent(new Event('resize'));
};

// Função utilitária para simular mudança de hash
global.simulateHashChange = (hash) => {
  window.location.hash = hash;
  window.dispatchEvent(new Event('hashchange'));
};

// Função utilitária para simular mudança de online/offline
global.simulateOnlineStatus = (isOnline) => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    configurable: true,
    value: isOnline,
  });
  
  const eventType = isOnline ? 'online' : 'offline';
  window.dispatchEvent(new Event(eventType));
};

console.log('🧪 Setup dos testes configurado'); 