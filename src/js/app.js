// src/js/app.js
import { getFullVocabulary, shuffleArray } from './words.js';
import { SRSEngine } from './srs.js';

class App {
  constructor() {
    this.srs = new SRSEngine();
    this.allWords = getFullVocabulary();
    this.currentLevel = 1;
    this.activeMode = 1; // 1: Pares, 2: Multiple Choice, etc.
    this.levelWords = [];
    this.selectedCard = null;
    this.startTime = Date.now();

    this.initTTS();
    this.bindEvents();
    this.loadLevel(1);
    this.renderStats();
  }

  // Inicializa el motor de audio sin conexión
  initTTS() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        this.englishVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en')) || null;
      };
    }
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      if (this.englishVoice) utterance.voice = this.englishVoice;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Carga un nivel priorizando las palabras más difíciles registradas
  loadLevel(levelNum) {
    this.currentLevel = levelNum;
    const startIdx = (levelNum - 1) * 100;
    const rawLevelSubset = this.allWords.slice(startIdx, startIdx + 100);

    // REGLA FUNDAMENTAL: Se ordenan con el algoritmo SRS (las más difíciles primero)
    this.levelWords = this.srs.sortWordsForLevel(rawLevelSubset);
    this.startMode1(); // Inicia Modo 1 (Pares) por defecto
  }

  // MODO 1: Selecciona los Pares
  startMode1() {
    const stage = document.getElementById("game-stage");
    stage.innerHTML = "";

    // Tomamos lotes de 5 pares para el juego visual dinámico
    const currentBatch = this.levelWords.slice(0, 5);
    
    let englishCards = currentBatch.map(w => ({ id: w.id, text: w.en, sub: `(${w.ph})`, type: "en", raw: w }));
    let spanishCards = currentBatch.map(w => ({ id: w.id, text: w.es, sub: `(${w.alt})`, type: "es", raw: w }));

    // Ambas columnas completamente desordenadas
    englishCards = shuffleArray(englishCards);
    spanishCards = shuffleArray(spanishCards);

    const grid = document.createElement("div");
    grid.className = "match-grid";

    // Generación del tablero 2 columnas
    for (let i = 0; i < 5; i++) {
      [englishCards[i], spanishCards[i]].forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.id = item.id;
        card.dataset.type = item.type;
        card.innerHTML = `
          <div class="main-text">${item.text}</div>
          <div class="sub-text">${item.sub}</div>
        `;
        card.onclick = () => this.handlePairClick(card, item);
        grid.appendChild(card);
      });
    }

    stage.appendChild(grid);
    this.startTime = Date.now();
  }

  handlePairClick(cardElem, item) {
    if (cardElem.classList.contains("correct")) return;

    if (item.type === "en") this.speak(item.text);

    if (!this.selectedCard) {
      this.selectedCard = { elem: cardElem, item };
      cardElem.classList.add("selected");
      return;
    }

    const first = this.selectedCard;
    if (first.elem === cardElem) {
      cardElem.classList.remove("selected");
      this.selectedCard = null;
      return;
    }

    const elapsed = Date.now() - this.startTime;

    // Validación de coincidencia
    if (first.item.id === item.item.id && first.item.type !== item.type) {
      // Acierto
      first.elem.classList.remove("selected");
      first.elem.classList.add("correct");
      cardElem.classList.add("correct");
      this.srs.recordResult(item.id, true, elapsed);
      this.selectedCard = null;
      this.checkPairCompletion();
    } else {
      // Error
      cardElem.classList.add("wrong");
      first.elem.classList.add("wrong");
      this.srs.recordResult(item.id, false, elapsed);

      setTimeout(() => {
        first.elem.classList.remove("selected", "wrong");
        cardElem.classList.remove("wrong");
        this.selectedCard = null;
      }, 500);
    }

    this.renderStats();
  }

  checkPairCompletion() {
    const remaining = document.querySelectorAll(".card:not(.correct)");
    if (remaining.length === 0) {
      setTimeout(() => {
        alert("¡Excelente lote completado!");
        this.startMode1(); // Pasa al siguiente set
      }, 400);
    }
  }

  renderStats() {
    const stats = this.srs.getGlobalProgress();
    document.getElementById("progress-fill").style.width = `${stats.percentage}%`;
    document.getElementById("stat-text").innerText = 
      `PALABRAS DOMINADAS: ${stats.mastered}/900 (${stats.percentage}%) | MONEDAS: ${stats.coins}`;
  }

  bindEvents() {
    // Escucha de cambio de vistas y modos
    window.switchMode = (modeNumber) => {
      this.activeMode = modeNumber;
      if (modeNumber === 1) this.startMode1();
      if (modeNumber === 2) this.startMode2();
      if (modeNumber === 9) this.renderDictionary();
    };
  }

  // MODO 2: Selecciona la traducción (Ejemplo de Multiple Choice)
  startMode2() {
    const stage = document.getElementById("game-stage");
    stage.innerHTML = "";

    const word = this.levelWords[Math.floor(Math.random() * this.levelWords.length)];
    const distractors = shuffleArray(this.allWords.filter(w => w.id !== word.id)).slice(0, 3);
    const options = shuffleArray([word, ...distractors]);

    const container = document.createElement("div");
    container.className = "quiz-container";

    container.innerHTML = `
      <div class="target-card">
        <div class="main-text" style="font-size: 1.8rem;">${word.en}</div>
        <div class="sub-text">(${word.ph})</div>
        <button class="speaker-btn" onclick="app.speak('${word.en}')">🔊</button>
      </div>
    `;

    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerHTML = `<strong>${opt.es}</strong> <span class="sub-text">(${opt.alt})</span>`;
      btn.onclick = () => {
        if (opt.id === word.id) {
          btn.style.borderColor = "var(--accent-green)";
          this.srs.recordResult(word.id, true);
          setTimeout(() => this.startMode2(), 600);
        } else {
          btn.style.borderColor = "var(--accent-red)";
          this.srs.recordResult(word.id, false);
        }
        this.renderStats();
      };
      container.appendChild(btn);
    });

    stage.appendChild(container);
  }

  // DICCIONARIO: Buscador instantáneo sin conexión
  renderDictionary() {
    const stage = document.getElementById("game-stage");
    stage.innerHTML = `
      <div style="padding: 16px;">
        <input type="text" id="dict-search" placeholder="Buscar entre las 900 palabras..." 
          style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--card-border); background: var(--card-bg); color: #fff; margin-bottom: 12px;">
        <div id="dict-list" style="max-height: 70vh; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;"></div>
      </div>
    `;

    const searchInput = document.getElementById("dict-search");
    const listElem = document.getElementById("dict-list");

    const renderList = (term = "") => {
      listElem.innerHTML = "";
      const filtered = this.allWords.filter(w => 
        w.en.toLowerCase().includes(term.toLowerCase()) || 
        w.es.toLowerCase().includes(term.toLowerCase())
      );

      filtered.forEach(w => {
        const item = document.createElement("div");
        item.style = "background: var(--card-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border); display: flex; justify-content: space-between; align-items: center;";
        item.innerHTML = `
          <div>
            <div style="font-weight: bold; color: var(--text-white);">${w.en} <span style="font-size: 0.8rem; color: var(--text-dim);">(${w.ph})</span></div>
            <div style="color: var(--accent-purple); font-size: 0.9rem;">${w.es} <span style="color: var(--text-dim); font-size: 0.75rem;">(${w.alt})</span></div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">"${w.exEn}"</div>
          </div>
          <button style="background: none; border: none; font-size: 1.3rem; cursor: pointer;" onclick="app.speak('${w.en}')">🔊</button>
        `;
        listElem.appendChild(item);
      });
    };

    searchInput.oninput = (e) => renderList(e.target.value);
    renderList();
  }
}

// Inicialización global
window.app = new App();