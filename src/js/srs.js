// src/js/srs.js

const STORAGE_KEY = "EN900_PROGRESS_STORE";

export class SRSEngine {
  constructor() {
    this.data = this.load();
  }

  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      stats: { coins: 0, streak: 0, totalAnswered: 0, totalCorrect: 0 },
      words: {} // wordId -> { errors: 0, hits: 0, consecutive: 0, lastTested: null, avgTime: 0 }
    };
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  getWordStats(wordId) {
    if (!this.data.words[wordId]) {
      this.data.words[wordId] = {
        errors: 0,
        hits: 0,
        consecutive: 0,
        lastTested: null,
        totalTimeMs: 0,
        attempts: 0
      };
    }
    return this.data.words[wordId];
  }

  recordResult(wordId, isCorrect, elapsedMs = 1500) {
    const stats = this.getWordStats(wordId);
    stats.attempts++;
    stats.lastTested = Date.now();
    stats.totalTimeMs += elapsedMs;

    this.data.stats.totalAnswered++;

    if (isCorrect) {
      stats.hits++;
      stats.consecutive++;
      this.data.stats.totalCorrect++;
      this.data.stats.coins += 10;
      this.data.stats.streak++;
    } else {
      stats.errors += 2; // Penalización que incrementa fuertemente su prioridad
      stats.consecutive = 0;
      this.data.stats.streak = 0;
    }

    this.save();
  }

  // Calcula el factor de urgencia/dificultad. Mayor puntaje = mayor prioridad
  getUrgencyScore(wordId) {
    const st = this.data.words[wordId];
    if (!st || st.attempts === 0) return 100; // Palabras nunca vistas tienen prioridad neutra-alta

    const daysSince = st.lastTested ? (Date.now() - st.lastTested) / (1000 * 60 * 60 * 24) : 10;
    const avgTimeSec = (st.totalTimeMs / st.attempts) / 1000;

    // Fórmula: Errores pesan positivo, aciertos consecutivos restan urgencia, tiempo de demora suma
    let score = (st.errors * 15) - (st.consecutive * 8) + (avgTimeSec * 2) + (daysSince * 3);
    return score;
  }

  // Ordena las palabras para un nivel: primero las difíciles según el historial
  sortWordsForLevel(words) {
    return [...words].sort((a, b) => this.getUrgencyScore(b.id) - this.getUrgencyScore(a.id));
  }

  getGlobalProgress(totalWords = 900) {
    let mastered = 0;
    let difficult = 0;

    Object.keys(this.data.words).forEach(id => {
      const st = this.data.words[id];
      if (st.consecutive >= 3) mastered++;
      if (st.errors > st.hits) difficult++;
    });

    return {
      mastered,
      pending: totalWords - mastered,
      difficult,
      percentage: Math.round((mastered / totalWords) * 100),
      streak: this.data.stats.streak,
      coins: this.data.stats.coins
    };
  }
}