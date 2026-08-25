// Global Application State Manager

class StateStore {
  constructor() {
    this.state = {
      lang: 'id',
      audioEnabled: false,
      audioVolume: 0.5,
      activeChapter: 'chapter-01',
      activeModal: null,
      filterMapEra: 'all',
      filterArchiveCategory: 'all',
      selectedLandmark: null,
      selectedArtifact: null,
      quizStep: 0,
      quizAnswers: {},
      quizCompleted: false
    };
    this.listeners = new Map();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    const oldValue = this.state[key];
    if (oldValue === value) return;
    this.state[key] = value;
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach((cb) => cb(value, oldValue));
    }
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => this.listeners.get(key).delete(callback);
  }
}

export const appState = new StateStore();
