// Setup para testes Jest
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Mock de jsPDF
global.jspdf = {
  jsPDF: class {
    constructor() {}
    text() {}
    addPage() {}
    save() {}
  }
};
