const app = document.getElementById("app");

// Set immediately so START works even if script errors later
window.__mathArcadeStart = function () {
  if (typeof startGameFromMenu === "function") startGameFromMenu();
};

const GAME_IDS = {
  MEMORY: "memory",
  GO_FISH: "go-fish",
  HIDE_SEEK: "hide-seek",
  WAR: "war",
  BINGO: "bingo",
  JENGA: "jenga",
};

const GAMES = [
  {
    id: GAME_IDS.MEMORY,
    title: "Memory Match",
    tagline: "Flip to match fact + answer.",
    length: "Short rounds",
  },
  {
    id: GAME_IDS.GO_FISH,
    title: "Math Go Fish",
    tagline: "Ask for the matching fact.",
    length: "5–10 min",
  },
  {
    id: GAME_IDS.HIDE_SEEK,
    title: "Hide & Seek",
    tagline: "Hunt around the classroom grid.",
    length: "Fast play",
  },
  {
    id: GAME_IDS.WAR,
    title: "Math War",
    tagline: "Pick the bigger solution.",
    length: "Race play",
  },
  {
    id: GAME_IDS.BINGO,
    title: "Fact Bingo",
    tagline: "Fill a line with answers.",
    length: "Whole‑group style",
  },
  {
    id: GAME_IDS.JENGA,
    title: "Flashcard Blocks",
    tagline: "Pull a block, solve, restack.",
    length: "Steady focus",
  },
];

/** Carousel games shown on selection screen (Memory, Math War, Bingo only) */
const SELECTION_GAMES = [
  {
    id: GAME_IDS.MEMORY,
    shortTitle: "MEMORY",
    line1: "MASTER THE EQUATIONS",
    line2: "SAVE THE GALAXY",
    level: "01",
  },
  {
    id: GAME_IDS.WAR,
    shortTitle: "MATH WAR",
    line1: "PICK THE BIGGER ANSWER",
    line2: "WIN THE BATTLE",
    level: "02",
  },
  {
    id: GAME_IDS.BINGO,
    shortTitle: "BINGO",
    line1: "FILL A LINE WITH ANSWERS",
    line2: "CALL THE FACTS",
    level: "03",
  },
];

const defaultConfig = {
  operation: "addition",
  maxNumber: 12,
};

const state = {
  view: "menu", // "menu" | "game"
  currentGame: GAME_IDS.MEMORY,
  menuIndex: 0, // 0..2 for selection carousel
  config: { ...defaultConfig },
  stats: {
    minutesPlayed: 0,
    factsSolved: 0,
    streak: 0,
    memoryBestTimeMs: null,
    bingoBestTimeMs: null,
  },
  tickerIndex: 0,
  memory: null,
  war: null,
  bingo: null,
  jenga: null,
  goFish: null,
  hideSeek: null,
};

const tickerMessages = [
  "Practice a little every day to build fluency.",
  "Try mixing operations once facts feel comfortable.",
  "Speed matters less than accuracy for new facts.",
  "Explain how you solved a fact to grow number sense.",
];

function shuffled(array) {
  return array
    .slice()
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildFact(operation, max) {
  let a = randomInt(0, max);
  let b = randomInt(0, max);
  if (operation === "subtraction") {
    if (a < b) [a, b] = [b, a];
  }
  if (operation === "division") {
    b = randomInt(1, Math.max(1, Math.floor(max / 2)));
    const q = randomInt(0, max);
    a = b * q;
  }
  const label = `${a} ${
    operation === "addition"
      ? "+"
      : operation === "subtraction"
        ? "-"
        : operation === "multiplication"
          ? "×"
          : "÷"
  } ${b}`;

  let answer;
  switch (operation) {
    case "addition":
      answer = a + b;
      break;
    case "subtraction":
      answer = a - b;
      break;
    case "multiplication":
      answer = a * b;
      break;
    case "division":
      answer = b === 0 ? 0 : a / b;
      break;
    default:
      answer = 0;
  }
  return { label, answer };
}

function $(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function getCurrentGameMeta() {
  return GAMES.find((g) => g.id === state.currentGame) || GAMES[0];
}

function getMaterialIcon(gameId) {
  if (gameId === GAME_IDS.MEMORY) return "psychology";
  if (gameId === GAME_IDS.WAR) return "swords";
  if (gameId === GAME_IDS.BINGO) return "grid_on";
  return "sports_esports";
}

function renderApp() {
  if (state.view === "menu") {
    app.classList.remove("math-arcade-game");
    app.classList.add("math-arcade-menu");
    state.currentGame = SELECTION_GAMES[state.menuIndex].id;
    const prevGame = SELECTION_GAMES[(state.menuIndex - 1 + 3) % 3];
    const centerGame = SELECTION_GAMES[state.menuIndex];
    const nextGame = SELECTION_GAMES[(state.menuIndex + 1) % 3];

    const root = document.createElement("div");
    root.className = "sel-frame";

    root.innerHTML = `
      <header class="sel-header">
        <h1 class="sel-header-title">MATH ARCADE</h1>
        <div class="sel-header-line"></div>
      </header>
      <main class="sel-main">
        <div class="sel-starfield"></div>
        <div class="sel-scanline"></div>
        <div class="sel-cards-row">
          <div class="sel-card sel-card--side sel-card--inactive" data-action="prev">
            <span class="material-symbols-outlined">${getMaterialIcon(prevGame.id)}</span>
            <span class="sel-card-title">${prevGame.shortTitle}</span>
          </div>
          <div class="sel-card sel-card--active">
            <div class="sel-card-inner">
              <div class="sel-icon-box">
                <span class="material-symbols-outlined">${getMaterialIcon(centerGame.id)}</span>
              </div>
              <h2 class="sel-card-title">${centerGame.shortTitle}</h2>
            </div>
          </div>
          <div class="sel-card sel-card--side sel-card--inactive" data-action="next">
            <span class="material-symbols-outlined">${getMaterialIcon(nextGame.id)}</span>
            <span class="sel-card-title">${nextGame.shortTitle}</span>
          </div>
        </div>
        <button type="button" id="arcade-start" class="sel-btn-start" onclick="window.__mathArcadeStart && window.__mathArcadeStart(); return false;">
          <span class="material-symbols-outlined">play_arrow</span>
          START GAME
        </button>
        <div class="sel-arrows-wrap">
          <button type="button" id="arcade-prev" class="sel-btn-arrow" aria-label="Previous game">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button type="button" id="arcade-next" class="sel-btn-arrow" aria-label="Next game">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </main>
      <footer class="sel-footer">
        <div class="sel-footer-dots">
          <span class="sel-footer-dot"></span>
          <span class="sel-footer-dot"></span>
          <span class="sel-footer-dot"></span>
        </div>
        <div class="sel-footer-status">System Status: Ready</div>
      </footer>
    `;

    app.replaceChildren(root);

    const startBtn = root.querySelector("#arcade-start");
    if (startBtn) startBtn.addEventListener("click", startGameFromMenu);

    return;
  }

  app.classList.remove("math-arcade-menu");
  app.classList.add("math-arcade-game");
  app.innerHTML = "";

  const root = $(`
    <div class="scanline-container">
      <div class="scanline"></div>
    </div>
  `);

  const frame = document.createElement("div");
  frame.className = "frame";

  const top = document.createElement("div");
  top.className = "frame-top";
  top.innerHTML = `
    <div>
      <div class="title">MATH ARCADE</div>
      <div class="subtitle">Now playing: ${getCurrentGameMeta().title}</div>
    </div>
    <div style="text-align:right;">
      <div class="chip-label">Mode</div>
      <div class="badge">In Game • Practice</div>
    </div>
  `;

  frame.appendChild(top);
    const main = document.createElement("div");
    main.className = "frame-main frame-main-game";

    const gamePanel = document.createElement("section");
    gamePanel.className = "panel";
    const meta = getCurrentGameMeta();
    gamePanel.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">${meta.title}</div>
        <button class="button secondary small" id="back-to-menu">Exit to Menu</button>
      </div>
      <div class="panel-body">
        <div class="game-main" id="game-main"></div>
      </div>
    `;

    const sidePanel = document.createElement("section");
    sidePanel.className = "panel panel-secondary";
    const showMemoryBest = state.currentGame === GAME_IDS.MEMORY;
    const showBingoBest = state.currentGame === GAME_IDS.BINGO;
    const formatBestTime = (ms) => {
      if (ms == null) return "--:--";
      const s = Math.floor(ms / 1000);
      return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    };
    const memoryBestStr = showMemoryBest ? formatBestTime(state.stats.memoryBestTimeMs) : "--:--";
    const bingoBestStr = showBingoBest ? formatBestTime(state.stats.bingoBestTimeMs) : "--:--";
    const statsBlock =
      showMemoryBest
        ? `
        <div class="stats">
          <div class="stat-card">
            <div class="stat-label">Best Time</div>
            <div class="stat-value positive">${memoryBestStr}</div>
          </div>
        </div>`
        : showBingoBest
          ? `
        <div class="stats">
          <div class="stat-card">
            <div class="stat-label">Best Time</div>
            <div class="stat-value positive">${bingoBestStr}</div>
          </div>
        </div>`
          : "";
    sidePanel.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">Stats & Options</div>
        <div class="pixels">
          <div class="pixel-dot"></div>
          <div class="pixel-dot"></div>
          <div class="pixel-dot orange"></div>
        </div>
      </div>
      <div class="panel-body">
        <div class="controls-row">
          <select class="select" id="operation-select">
            <option value="addition">Addition</option>
            <option value="subtraction">Subtraction</option>
            <option value="multiplication">Multiplication</option>
            <option value="division">Division</option>
          </select>
          <select class="select" id="range-select">
            <option value="10">Facts to 10</option>
            <option value="12" selected>Facts to 12</option>
            <option value="20">Facts to 20</option>
          </select>
        </div>
        <div class="controls-row">
          <button class="button primary small" id="play-btn">Restart Game</button>
        </div>
        ${statsBlock}
      </div>
    `;

    main.appendChild(gamePanel);
    main.appendChild(sidePanel);
    frame.appendChild(main);
    root.appendChild(frame);
    app.appendChild(root);

    const backBtn = gamePanel.querySelector("#back-to-menu");
    backBtn.addEventListener("click", () => {
      state.view = "menu";
      resetGames();
      renderApp();
    });

    bindConsoleControls(sidePanel);
    renderCurrentGame();
}

function renderMenu(container) {
  const games = GAMES;
  container.innerHTML = "";
  for (const g of games) {
    const card = $(`
      <button class="menu-card" type="button" data-id="${g.id}">
        <div class="menu-title">${g.title}</div>
        <div class="menu-tagline">${g.tagline}</div>
        <div class="menu-meta">
          <span>${g.length}</span>
          <span>Math Facts</span>
        </div>
      </button>
    `);
    if (g.id === state.currentGame) {
      card.style.borderColor = "#22d3ee";
      card.style.boxShadow =
        "0 0 0 1px rgba(34,211,238,0.9), 0 0 20px rgba(34,211,238,0.9)";
    }
    card.addEventListener("click", () => {
      state.currentGame = g.id;
      renderApp();
    });
    container.appendChild(card);
  }
}

function bindConsoleControls(panel) {
  const opSelect = panel.querySelector("#operation-select");
  const rangeSelect = panel.querySelector("#range-select");
  const playBtn = panel.querySelector("#play-btn");

  opSelect.value = state.config.operation;
  rangeSelect.value = String(state.config.maxNumber);

  opSelect.addEventListener("change", () => {
    state.config.operation = opSelect.value;
    resetGames();
    renderCurrentGame();
  });

  rangeSelect.addEventListener("change", () => {
    state.config.maxNumber = Number(rangeSelect.value);
    resetGames();
    renderCurrentGame();
  });

  playBtn.addEventListener("click", () => {
    resetGames();
    state.view = "game";
    renderApp();
  });
}

function resetGames() {
  if (state.memory && state.memory.timerId) clearInterval(state.memory.timerId);
  state.memory = null;
  state.war = null;
  if (state.bingo && state.bingo.timerId) clearInterval(state.bingo.timerId);
  state.bingo = null;
  state.jenga = null;
  state.goFish = null;
  state.hideSeek = null;
}

function updateTicker() {
  const el = document.getElementById("ticker-text");
  if (!el) return;
  el.textContent = tickerMessages[state.tickerIndex % tickerMessages.length];
  state.tickerIndex += 1;
}

setInterval(updateTicker, 9000);

function renderCurrentGame(fromPlayButton = false) {
  const screen = document.getElementById(
    state.view === "game" ? "game-main" : "game-screen",
  );
  if (!screen) return;

  switch (state.currentGame) {
    case GAME_IDS.MEMORY:
      renderMemoryGame(screen, fromPlayButton);
      break;
    case GAME_IDS.GO_FISH:
      renderGoFishGame(screen, fromPlayButton);
      break;
    case GAME_IDS.HIDE_SEEK:
      renderHideSeekGame(screen, fromPlayButton);
      break;
    case GAME_IDS.WAR:
      renderWarGame(screen, fromPlayButton);
      break;
    case GAME_IDS.BINGO:
      renderBingoGame(screen, fromPlayButton);
      break;
    case GAME_IDS.JENGA:
      renderJengaGame(screen, fromPlayButton);
      break;
    default:
      screen.textContent = "";
  }
}

function renderMemoryGame(screen, fromPlayButton) {
  if (!state.memory || fromPlayButton) {
    const size = 8;
    const facts = [];
    const seen = new Set();
    while (facts.length < size) {
      const fact = buildFact(state.config.operation, state.config.maxNumber);
      const key = `${fact.label}=${fact.answer}`;
      if (!seen.has(key)) {
        seen.add(key);
        facts.push(fact);
      }
    }
    const cards = [];
    facts.forEach((f, idx) => {
      cards.push({
        id: `p-${idx}`,
        type: "problem",
        text: f.label,
        matchKey: f.answer,
      });
      cards.push({
        id: `a-${idx}`,
        type: "answer",
        text: String(f.answer),
        matchKey: f.answer,
      });
    });
    state.memory = {
      cards: shuffled(cards),
      revealedIds: [],
      matchedIds: new Set(),
      moves: 0,
      streak: 0,
      message: "Flip two cards to find a match.",
      locked: false,
      startTime: Date.now(),
      timerId: null,
    };
  }

  const game = state.memory;
  if (game.timerId) clearInterval(game.timerId);
  game.timerId = null;

  function formatTime(ms) {
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const showMatch =
    game.revealedIds.length === 2 &&
    (() => {
      const [c1, c2] = game.revealedIds.map((id) =>
        game.cards.find((c) => c.id === id),
      );
      return (
        c1 &&
        c2 &&
        c1.matchKey === c2.matchKey &&
        c1.type !== c2.type
      );
    })();

  screen.innerHTML = "";

  const root = document.createElement("div");
  root.className = "mem-root";

  const header = document.createElement("div");
  header.className = "mem-header";
  header.innerHTML = `
    <div class="flex items-center gap-6" style="display:flex;align-items:center;gap:1.5rem;">
      <button type="button" class="mem-home-btn" id="mem-home" aria-label="Exit to menu">
        <span class="material-symbols-outlined">home</span>
      </button>
    </div>
    <div class="mem-title-wrap">
      <div class="mem-title-dot"></div>
      <span class="mem-title">MEMORY</span>
    </div>
  `;
  root.appendChild(header);

  const content = document.createElement("div");
  content.className = "mem-content";
  content.innerHTML = `
    <div class="mem-bezel">
      <div class="mem-bezel-inner">
        <div class="mem-digital-grid"></div>
        <div class="mem-lightning mem-lightning--left"></div>
        <div class="mem-lightning mem-lightning--right"></div>
      </div>
      <div class="mem-game-area">
        <div class="mem-time-box">
          <span class="mem-time-label">TIME</span>
          <span class="mem-time-value" id="mem-time">${formatTime(Date.now() - game.startTime)}</span>
        </div>
        <div class="mem-grid-wrap">
          <div class="mem-grid" id="mem-grid"></div>
          ${showMatch ? '<div class="mem-match-overlay"><div class="mem-match-box"><h2 class="mem-match-text">MATCH!</h2></div></div>' : ""}
        </div>
      </div>
    </div>
    <div class="mem-footer">
      <div class="mem-footer-inner">
        <p class="mem-footer-text">Find all the matching math pairs!</p>
      </div>
    </div>
  `;
  root.appendChild(content);

  const gridEl = root.querySelector("#mem-grid");
  const timeEl = root.querySelector("#mem-time");

  game.cards.forEach((card) => {
    const isRevealed = game.revealedIds.includes(card.id);
    const isMatched = game.matchedIds.has(card.id);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "mem-card";
    if (game.locked || isMatched) el.classList.add("disabled");
    if (isRevealed || isMatched) {
      el.classList.add("mem-card--front");
      if (card.type === "problem") {
        const parts = card.text.split(/\s+/);
        const top = parts[0] || "";
        const op = parts[1] || "";
        const bottom = parts[2] || "";
        el.innerHTML = `
          <div class="mem-card-fact">
            <span>${top}</span>
            <div class="mem-card-op"><span>${op}</span><span>${bottom}</span></div>
            <div class="mem-card-line"></div>
          </div>
        `;
      } else {
        el.innerHTML = `<span class="mem-card-answer">${card.text}</span>`;
      }
    } else {
      el.classList.add("mem-card--back");
      el.innerHTML = '<span class="material-symbols-outlined">star</span>';
    }
    el.addEventListener("click", () => {
      if (game.locked || isMatched) return;
      if (game.revealedIds.includes(card.id)) return;
      game.revealedIds.push(card.id);
      if (game.revealedIds.length === 2) {
        game.locked = true;
        game.moves += 1;
        const [c1, c2] = game.revealedIds.map((id) =>
          game.cards.find((c) => c.id === id),
        );
        if (c1 && c2 && c1.matchKey === c2.matchKey && c1.type !== c2.type) {
          game.streak += 1;
          state.stats.factsSolved += 1;
          state.stats.streak = Math.max(state.stats.streak, game.streak);
          setTimeout(() => {
            game.matchedIds.add(c1.id);
            game.matchedIds.add(c2.id);
            game.revealedIds = [];
            game.locked = false;
            if (game.matchedIds.size === game.cards.length) {
              const elapsedMs = Date.now() - game.startTime;
              const prevBest = state.stats.memoryBestTimeMs;
              const isNewBest = prevBest == null || elapsedMs < prevBest;
              if (isNewBest) state.stats.memoryBestTimeMs = elapsedMs;
              game.finished = true;
              game.finishTimeMs = elapsedMs;
              game.newBest = isNewBest;
            }
            renderMemoryGame(screen, false);
          }, 700);
        } else {
          game.message = "Not a match—try again.";
          game.streak = 0;
          setTimeout(() => {
            game.revealedIds = [];
            game.locked = false;
            renderMemoryGame(screen, false);
          }, 650);
        }
      } else {
        game.message = "Flip one more card.";
      }
      renderMemoryGame(screen, false);
    });
    gridEl.appendChild(el);
  });

  root.querySelector("#mem-home").addEventListener("click", () => {
    state.view = "menu";
    resetGames();
    renderApp();
  });

  if (!game.finished) {
    game.timerId = setInterval(() => {
      if (!timeEl) return;
      timeEl.textContent = formatTime(Date.now() - game.startTime);
    }, 1000);
  }

  if (game.finished) {
    const finishTimeStr = formatTime(game.finishTimeMs);
    const bestTimeStr =
      state.stats.memoryBestTimeMs != null
        ? formatTime(state.stats.memoryBestTimeMs)
        : "--:--";
    const overlay = document.createElement("div");
    overlay.className = "mem-finished-overlay";
    overlay.innerHTML = `
      <div class="mem-finished-backdrop"></div>
      <div class="mem-finished-box">
        <h2 class="mem-finished-title">FINISHED!</h2>
        <p class="mem-finished-time">Your time: <strong>${finishTimeStr}</strong></p>
        <p class="mem-finished-best">Best time: <strong>${bestTimeStr}</strong></p>
        ${game.newBest ? '<p class="mem-finished-newbest">YOU SET A NEW PERSONAL BEST TIME!</p>' : ""}
        <div class="mem-finished-actions">
          <button type="button" class="mem-finished-btn mem-finished-btn--primary" id="mem-finished-new">New Game</button>
          <button type="button" class="mem-finished-btn mem-finished-btn--secondary" id="mem-finished-menu">Main Menu</button>
        </div>
      </div>
    `;
    overlay.querySelector("#mem-finished-new").addEventListener("click", () => {
      state.memory = null;
      renderMemoryGame(screen, true);
    });
    overlay.querySelector("#mem-finished-menu").addEventListener("click", () => {
      state.view = "menu";
      resetGames();
      renderApp();
    });
    root.appendChild(overlay);
    if (game.newBest) {
      const sideBest = document.querySelector(".panel-secondary .stat-value");
      if (sideBest) sideBest.textContent = formatTime(state.stats.memoryBestTimeMs);
    }
  }

  screen.appendChild(root);
}

function renderWarGame(screen, fromPlayButton) {
  function makeWarRound(forcedBigger) {
    let left;
    let right;
    let safety = 0;
    do {
      left = buildFact(state.config.operation, state.config.maxNumber);
      right = buildFact(state.config.operation, state.config.maxNumber);
      let inner = 0;
      while (right.answer === left.answer && inner < 10) {
        right = buildFact(state.config.operation, state.config.maxNumber);
        inner += 1;
      }
      const actual =
        left.answer > right.answer
          ? "left"
          : right.answer > left.answer
            ? "right"
            : "tie";
      if (actual === forcedBigger) break;
      safety += 1;
    } while (safety < 50);
    const bigger = forcedBigger;
    let leftDisplay = Math.random() < 0.5 ? "problem" : "number";
    let rightDisplay = Math.random() < 0.5 ? "problem" : "number";
    if (leftDisplay === "number" && rightDisplay === "number") {
      rightDisplay = "problem";
    }
    return {
      left,
      right,
      bigger,
      leftDisplay,
      rightDisplay,
    };
  }

  if (!state.war || fromPlayButton) {
    const totalRounds = randomInt(40, 400);
    const winner = Math.random() < 0.5 ? "you" : "cpu";
    let leftWins;
    let rightWins;
    if (winner === "you") {
      leftWins = Math.floor((totalRounds + 10) / 2);
      rightWins = totalRounds - leftWins;
    } else {
      rightWins = Math.floor((totalRounds + 10) / 2);
      leftWins = totalRounds - rightWins;
    }
    const outcomes = [
      ...Array(leftWins).fill("left"),
      ...Array(rightWins).fill("right"),
    ];

    state.war = {
      round: 1,
      correct: 0,
      streak: 0,
      youCards: 10,
      cpuCards: 10,
      plannedOutcomes: shuffled(outcomes),
      outcomeIndex: 0,
      current: null,
      finished: false,
      winner: null,
    };
    state.war.current = makeWarRound(state.war.plannedOutcomes[0]);
  }

  const game = state.war;

  function applyCardTransfer() {
    if (game.current.bigger === "left") {
      game.youCards += 1;
      game.cpuCards -= 1;
    } else if (game.current.bigger === "right") {
      game.youCards -= 1;
      game.cpuCards += 1;
    }
    if (game.youCards <= 0) {
      game.finished = true;
      game.winner = "cpu";
    }
    if (game.cpuCards <= 0) {
      game.finished = true;
      game.winner = "you";
    }
  }

  function nextRound() {
    game.outcomeIndex += 1;
    game.round += 1;
    if (game.outcomeIndex < game.plannedOutcomes.length) {
      game.current = makeWarRound(game.plannedOutcomes[game.outcomeIndex]);
    }
  }

  function handlePick(side) {
    if (game.finished || game.wrongPopup) return;
    const correctSide = game.current.bigger;
    const correct =
      (side === "left" && correctSide === "left") ||
      (side === "right" && correctSide === "right");
    if (correct) {
      applyCardTransfer();
      if (!game.finished) nextRound();
      renderWarGame(screen, false);
    } else {
      game.wrongPopup = {
        leftLabel: game.current.left.label,
        leftAnswer: game.current.left.answer,
        leftDisplay: game.current.leftDisplay,
        rightLabel: game.current.right.label,
        rightAnswer: game.current.right.answer,
        rightDisplay: game.current.rightDisplay,
        bigger: game.current.bigger,
      };
      renderWarGame(screen, false);
    }
  }

  function handleTie() {
    if (game.finished || game.wrongPopup) return;
    if (game.current.bigger === "tie") {
      applyCardTransfer();
      nextRound();
      renderWarGame(screen, false);
    } else {
      game.wrongPopup = {
        leftLabel: game.current.left.label,
        leftAnswer: game.current.left.answer,
        leftDisplay: game.current.leftDisplay,
        rightLabel: game.current.right.label,
        rightAnswer: game.current.right.answer,
        rightDisplay: game.current.rightDisplay,
        bigger: game.current.bigger,
      };
      renderWarGame(screen, false);
    }
  }

  function dismissWrongPopup() {
    applyCardTransfer();
    nextRound();
    game.wrongPopup = null;
    renderWarGame(screen, false);
  }

  screen.innerHTML = "";

  const root = document.createElement("div");
  root.className = "war-root";

  const header = document.createElement("div");
  header.className = "war-header";
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:1.5rem;">
      <button type="button" class="war-home-btn" id="war-home" aria-label="Exit to menu">
        <span class="material-symbols-outlined">home</span>
      </button>
    </div>
    <div class="war-title-wrap">
      <div class="war-title-dot"></div>
      <span class="war-title">MATH WAR</span>
    </div>
  `;
  root.appendChild(header);

  const leftParts = game.current.left.label.split(/\s+/);
  const leftTop = leftParts[0] || "";
  const leftOp = leftParts[1] || "";
  const leftBot = leftParts[2] || "";
  const rightParts = game.current.right.label.split(/\s+/);
  const rightTop = rightParts[0] || "";
  const rightOp = rightParts[1] || "";
  const rightBot = rightParts[2] || "";

  const youCardHtml =
    game.current.leftDisplay === "problem"
      ? `
              <div class="war-card-vertical-math">
                <span>${leftTop}</span>
                <div class="war-card-op-row"><span>${leftOp}</span><span>${leftBot}</span></div>
                <div class="war-card-line"></div>
              </div>`
      : `<span class="war-card-answer">${game.current.left.answer}</span>`;

  const cpuCardHtml =
    game.current.rightDisplay === "problem"
      ? `
              <div class="war-card-vertical-math">
                <span>${rightTop}</span>
                <div class="war-card-op-row"><span>${rightOp}</span><span>${rightBot}</span></div>
                <div class="war-card-line"></div>
              </div>`
      : `<span class="war-card-answer">${game.current.right.answer}</span>`;

  const content = document.createElement("div");
  content.className = "war-content";
  content.innerHTML = `
    <div class="war-bezel">
      <div class="war-bezel-inner">
        <div class="war-digital-grid"></div>
        <div class="war-lightning war-lightning--left"></div>
        <div class="war-lightning war-lightning--right"></div>
      </div>
      <div class="war-game-area">
        <div class="war-cards-row">
          <div class="war-side">
            <span class="war-side-label war-side-label--you">YOU</span>
            <div class="war-card" data-side="left" id="war-card-you">
              ${youCardHtml}
            </div>
            <div class="war-card-count-wrap">
              <span class="war-card-count-label">CARDS</span>
              <span class="war-card-count-value war-card-count-value--you" id="war-you-count">${game.youCards}</span>
            </div>
          </div>
          <div class="war-side" style="gap:1rem;">
            <span class="war-vs">VS</span>
          </div>
          <div class="war-side">
            <span class="war-side-label war-side-label--cpu">CPU</span>
            <div class="war-card" data-side="right" id="war-card-cpu">
              ${cpuCardHtml}
            </div>
            <div class="war-card-count-wrap">
              <span class="war-card-count-label">CARDS</span>
              <span class="war-card-count-value war-card-count-value--cpu" id="war-cpu-count">${game.cpuCards}</span>
            </div>
          </div>
        </div>
        <div class="war-bottom">
          <button type="button" class="war-equals-btn" id="war-equals">=</button>
          <div class="war-instruction">
            <p class="war-instruction-text">TAP THE HIGHER VALUE CARD OR PRESS THE = BUTTON</p>
          </div>
        </div>
      </div>
    </div>
  `;
  root.appendChild(content);

  root.querySelector("#war-home").addEventListener("click", () => {
    state.view = "menu";
    resetGames();
    renderApp();
  });

  if (!game.finished && !game.wrongPopup) {
    root.querySelector("#war-card-you").addEventListener("click", () => handlePick("left"));
    root.querySelector("#war-card-cpu").addEventListener("click", () => handlePick("right"));
    root.querySelector("#war-equals").addEventListener("click", handleTie);
  }

  if (game.wrongPopup) {
    const pop = game.wrongPopup;
    const leftParts = pop.leftLabel.split(/\s+/);
    const leftTop = leftParts[0] || "";
    const leftOp = leftParts[1] || "";
    const leftBot = leftParts[2] || "";
    const rightParts = pop.rightLabel.split(/\s+/);
    const rightTop = rightParts[0] || "";
    const rightOp = rightParts[1] || "";
    const rightBot = rightParts[2] || "";

    const leftCardHtml =
      pop.leftDisplay !== "number"
        ? `
      <div class="war-card-vertical-math">
        <span>${leftTop}</span>
        <div class="war-card-op-row"><span>${leftOp}</span><span>${leftBot}</span></div>
        <div class="war-card-line"></div>
        <span class="war-wrong-answer">${pop.leftAnswer}</span>
      </div>
    `
        : `<span class="war-wrong-answer war-wrong-answer--only">${pop.leftAnswer}</span>`;

    const rightCardHtml =
      pop.rightDisplay !== "number"
        ? `
      <div class="war-card-vertical-math">
        <span>${rightTop}</span>
        <div class="war-card-op-row"><span>${rightOp}</span><span>${rightBot}</span></div>
        <div class="war-card-line"></div>
        <span class="war-wrong-answer">${pop.rightAnswer}</span>
      </div>
    `
        : `<span class="war-wrong-answer war-wrong-answer--only">${pop.rightAnswer}</span>`;
    const compareSymbol = pop.bigger === "left" ? "&gt;" : pop.bigger === "right" ? "&lt;" : "=";
    const wrongOverlay = document.createElement("div");
    wrongOverlay.className = "war-wrong-overlay";
    wrongOverlay.innerHTML = `
      <div class="war-wrong-backdrop"></div>
      <div class="war-wrong-box">
        <button type="button" class="war-wrong-close" id="war-wrong-close" aria-label="Close">×</button>
        <div class="war-wrong-cards">
          <div class="war-wrong-card">
            ${leftCardHtml}
          </div>
          <span class="war-wrong-symbol" aria-hidden="true">${compareSymbol}</span>
          <div class="war-wrong-card">
            ${rightCardHtml}
          </div>
        </div>
        <div class="war-wrong-banner">WHOOPS!</div>
      </div>
    `;
    wrongOverlay.querySelector("#war-wrong-close").addEventListener("click", dismissWrongPopup);
    root.appendChild(wrongOverlay);
  }

  if (game.finished) {
    const overlay = document.createElement("div");
    overlay.className = "war-finished-overlay";
    const winMsg = game.winner === "you" ? "YOU WIN!" : "CPU WINS!";
    overlay.innerHTML = `
      <div class="war-finished-backdrop"></div>
      <div class="war-finished-box">
        <h2 class="war-finished-title">${winMsg}</h2>
        <div class="war-finished-actions">
          <button type="button" class="war-finished-btn war-finished-btn--primary" id="war-finished-new">New Game</button>
          <button type="button" class="war-finished-btn war-finished-btn--secondary" id="war-finished-menu">Main Menu</button>
        </div>
      </div>
    `;
    overlay.querySelector("#war-finished-new").addEventListener("click", () => {
      state.war = null;
      renderWarGame(screen, true);
    });
    overlay.querySelector("#war-finished-menu").addEventListener("click", () => {
      state.view = "menu";
      resetGames();
      renderApp();
    });
    root.appendChild(overlay);
  }

  screen.appendChild(root);
}

function renderBingoGame(screen, fromPlayButton) {
  if (!state.bingo || fromPlayButton) {
    const facts = [];
    const seen = new Set();
    while (facts.length < 24) {
      const fact = buildFact(state.config.operation, state.config.maxNumber);
      const key = `${fact.answer}`;
      if (!seen.has(key)) {
        seen.add(key);
        facts.push(fact);
      }
    }
    const answers = facts.map((f) => f.answer);
    const boardAnswers = [];
    let idx = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r === 2 && c === 2) {
          boardAnswers.push("FREE");
        } else {
          boardAnswers.push(answers[idx++]);
        }
      }
    }
    const problems = shuffled(
      facts.map((f) => ({
        problem: f.label,
        answer: f.answer,
      })),
    );

    state.bingo = {
      board: boardAnswers,
      marked: new Set(["2-2"]),
      calledIndex: 0,
      problems,
      lastCall: problems[0],
      won: false,
      finished: false,
      finishTimeMs: null,
      newBest: false,
      startTime: Date.now(),
      timerId: null,
      wrongPopup: null,
    };
  }

  const game = state.bingo;
  if (game.timerId) clearInterval(game.timerId);
  game.timerId = null;

  function formatTime(ms) {
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function answerIsOnBoard() {
    const ans = game.lastCall.answer;
    return game.board.some(
      (v) => v !== "FREE" && (Number(v) === ans || String(v) === String(ans)),
    );
  }

  function advanceToNextProblem() {
    if (game.calledIndex >= game.problems.length - 1) return;
    game.calledIndex += 1;
    game.lastCall = game.problems[game.calledIndex];
  }

  function handleCellClick(r, c) {
    if (game.finished || game.wrongPopup) return;
    if (r === 2 && c === 2) return; // free space
    const key = `${r}-${c}`;
    if (game.marked.has(key)) return; // already correct
    const cellValue = game.board[r * 5 + c];
    if (cellValue === "FREE") return;
    const correctAnswer = game.lastCall.answer;
    const isCorrect =
      Number(cellValue) === correctAnswer || String(cellValue) === String(correctAnswer);
    if (isCorrect) {
      game.marked.add(key);
      state.stats.factsSolved += 1;
      advanceToNextProblem();
      if (checkBingoWin(game)) {
        game.won = true;
        game.finished = true;
        const elapsedMs = Date.now() - game.startTime;
        game.finishTimeMs = elapsedMs;
        const prevBest = state.stats.bingoBestTimeMs;
        const isNewBest = prevBest == null || elapsedMs < prevBest;
        if (isNewBest) state.stats.bingoBestTimeMs = elapsedMs;
        game.newBest = isNewBest;
      }
      renderBingoGame(screen, false);
    } else {
      game.wrongPopup = {
        problem: game.lastCall.problem,
        answer: game.lastCall.answer,
      };
      renderBingoGame(screen, false);
    }
  }

  function handleNoMatch() {
    if (game.finished || game.wrongPopup) return;
    if (answerIsOnBoard()) {
      game.wrongPopup = {
        problem: game.lastCall.problem,
        answer: game.lastCall.answer,
      };
      renderBingoGame(screen, false);
    } else {
      advanceToNextProblem();
      renderBingoGame(screen, false);
    }
  }

  function dismissWhOops() {
    game.wrongPopup = null;
    renderBingoGame(screen, false);
  }

  screen.innerHTML = "";

  const root = document.createElement("div");
  root.className = "bingo-root";

  const elapsedMs = game.finished ? game.finishTimeMs : Date.now() - game.startTime;
  const timeStr = formatTime(elapsedMs);

  const header = document.createElement("div");
  header.className = "bingo-header";
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:1.5rem;">
      <button type="button" class="bingo-home-btn" id="bingo-home" aria-label="Exit to menu">
        <span class="material-symbols-outlined">home</span>
      </button>
    </div>
    <div class="bingo-title-wrap">
      <div class="bingo-title-dot"></div>
      <span class="bingo-title">BINGO</span>
    </div>
    <div style="display:flex;align-items:center;gap:1rem;">
      <button type="button" class="bingo-new-card-btn" id="bingo-new-card">New Card</button>
      <div class="bingo-time-box">
        <span class="bingo-time-label">TIME</span>
        <span class="bingo-time-value" id="bingo-time">${timeStr}</span>
      </div>
    </div>
  `;
  root.appendChild(header);
  root.querySelector("#bingo-new-card").addEventListener("click", () => {
    state.bingo = null;
    renderBingoGame(screen, true);
  });

  const parts = game.lastCall.problem.split(/\s+/);
  const probTop = parts[0] || "";
  const probOp = parts[1] || "";
  const probBot = parts[2] || "";

  const gridCells = game.board
    .map((val, index) => {
      const r = Math.floor(index / 5);
      const c = index % 5;
      const key = `${r}-${c}`;
      const isFree = val === "FREE";
      const marked = game.marked.has(key);
      const cellClass =
        "bingo-cell" +
        (isFree ? " bingo-cell--free" : "") +
        (marked ? " bingo-cell--marked bingo-cell--correct" : "");
      const text = isFree ? "FREE SPACE" : String(val);
      const check = marked ? '<span class="bingo-cell-check" aria-hidden="true">✓</span>' : "";
      return `<button type="button" class="${cellClass}" data-r="${r}" data-c="${c}">${check || text}</button>`;
    })
    .join("");

  const content = document.createElement("div");
  content.className = "bingo-content";
  content.innerHTML = `
    <div class="bingo-bezel">
      <div class="bingo-bezel-inner">
        <div class="bingo-digital-grid"></div>
        <div class="bingo-lightning bingo-lightning--left"></div>
        <div class="bingo-lightning bingo-lightning--right"></div>
      </div>
      <div class="bingo-game-area">
        <div class="bingo-main-row">
          <div class="bingo-problem-panel">
            <div class="bingo-problem-box">
              <div class="bingo-problem-vertical">
                <span>${probTop}</span>
                <div class="bingo-problem-op-row"><span>${probOp}</span><span>${probBot}</span></div>
                <div class="bingo-problem-line"></div>
              </div>
            </div>
            ${!game.finished ? '<button type="button" class="bingo-no-match-btn" id="bingo-no-match">NO MATCH!</button>' : ""}
          </div>
          <div class="bingo-grid-wrap">
            <div class="bingo-grid" id="bingo-grid">${gridCells}</div>
          </div>
        </div>
        <div class="bingo-bottom">
          <div class="bingo-instruction">
            <p class="bingo-instruction-text">CLICK THE ANSWER ON YOUR CARD. USE NO MATCH! IF IT'S NOT ON YOUR BOARD.</p>
          </div>
        </div>
      </div>
    </div>
  `;
  root.appendChild(content);

  root.querySelector("#bingo-home").addEventListener("click", () => {
    state.view = "menu";
    resetGames();
    renderApp();
  });
  const noMatchBtn = content.querySelector("#bingo-no-match");
  if (noMatchBtn) noMatchBtn.addEventListener("click", handleNoMatch);
  content.querySelector("#bingo-grid").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-r][data-c]");
    if (!btn) return;
    const r = parseInt(btn.getAttribute("data-r"), 10);
    const c = parseInt(btn.getAttribute("data-c"), 10);
    handleCellClick(r, c);
  });

  if (!game.finished) {
    const timeEl = root.querySelector("#bingo-time");
    game.timerId = setInterval(() => {
      if (!timeEl) return;
      timeEl.textContent = formatTime(Date.now() - game.startTime);
    }, 1000);
  }

  if (game.wrongPopup) {
    const pop = game.wrongPopup;
    const wrongParts = pop.problem.split(/\s+/);
    const wTop = wrongParts[0] || "";
    const wOp = wrongParts[1] || "";
    const wBot = wrongParts[2] || "";
    const wrongOverlay = document.createElement("div");
    wrongOverlay.className = "bingo-wrong-overlay";
    wrongOverlay.innerHTML = `
      <div class="bingo-wrong-backdrop"></div>
      <div class="bingo-wrong-box">
        <button type="button" class="bingo-wrong-close" id="bingo-wrong-close" aria-label="Close">×</button>
        <div class="bingo-wrong-content">
          <div class="bingo-wrong-problem">
            <div class="bingo-wrong-vertical">
              <span>${wTop}</span>
              <div class="bingo-wrong-op-row"><span>${wOp}</span><span>${wBot}</span></div>
              <div class="bingo-wrong-line"></div>
            </div>
          </div>
          <p class="bingo-wrong-answer-label">Answer: <strong>${pop.answer}</strong></p>
        </div>
        <div class="bingo-wrong-banner">WHOOPS!</div>
      </div>
    `;
    wrongOverlay.querySelector("#bingo-wrong-close").addEventListener("click", dismissWhOops);
    root.appendChild(wrongOverlay);
  }

  if (game.finished) {
    const finishTimeStr = formatTime(game.finishTimeMs);
    const bestTimeStr =
      state.stats.bingoBestTimeMs != null
        ? formatTime(state.stats.bingoBestTimeMs)
        : "--:--";
    const overlay = document.createElement("div");
    overlay.className = "bingo-finished-overlay";
    overlay.innerHTML = `
      <div class="bingo-finished-backdrop"></div>
      <div class="bingo-finished-box">
        <h2 class="bingo-finished-title">BINGO!</h2>
        <p class="bingo-finished-time">Your time: <strong>${finishTimeStr}</strong></p>
        <p class="bingo-finished-best">Best time: <strong>${bestTimeStr}</strong></p>
        ${game.newBest ? '<p class="bingo-finished-newbest">YOU SET A NEW PERSONAL BEST TIME!</p>' : ""}
        <div class="bingo-finished-actions">
          <button type="button" class="bingo-finished-btn bingo-finished-btn--primary" id="bingo-finished-new">New Game</button>
          <button type="button" class="bingo-finished-btn bingo-finished-btn--secondary" id="bingo-finished-menu">Main Menu</button>
        </div>
      </div>
    `;
    overlay.querySelector("#bingo-finished-new").addEventListener("click", () => {
      state.bingo = null;
      renderBingoGame(screen, true);
    });
    overlay.querySelector("#bingo-finished-menu").addEventListener("click", () => {
      state.view = "menu";
      resetGames();
      renderApp();
    });
    root.appendChild(overlay);
    const sideBest = document.querySelector(".panel-secondary .stat-value");
    if (sideBest && game.newBest)
      sideBest.textContent = formatTime(state.stats.bingoBestTimeMs);
  }

  screen.appendChild(root);
}

function checkBingoWin(game) {
  const size = 5;
  const m = game.marked;

  for (let r = 0; r < size; r++) {
    let ok = true;
    for (let c = 0; c < size; c++) {
      if (!(r === 2 && c === 2) && !m.has(`${r}-${c}`)) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }

  for (let c = 0; c < size; c++) {
    let ok = true;
    for (let r = 0; r < size; r++) {
      if (!(r === 2 && c === 2) && !m.has(`${r}-${c}`)) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }

  let okMain = true;
  for (let i = 0; i < size; i++) {
    if (!(i === 2 && i === 2) && !m.has(`${i}-${i}`)) {
      okMain = false;
      break;
    }
  }
  if (okMain) return true;

  let okOther = true;
  for (let i = 0; i < size; i++) {
    const r = i;
    const c = size - 1 - i;
    if (!(r === 2 && c === 2) && !m.has(`${r}-${c}`)) {
      okOther = false;
      break;
    }
  }
  if (okOther) return true;

  return false;
}

function renderJengaGame(screen, fromPlayButton) {
  if (!state.jenga || fromPlayButton) {
    const blocks = [];
    const used = new Set();
    for (let i = 0; i < 18; i++) {
      let fact;
      let key;
      let safety = 0;
      do {
        fact = buildFact(state.config.operation, state.config.maxNumber);
        key = `${fact.label}=${fact.answer}`;
        safety += 1;
      } while (used.has(key) && safety < 20);
      used.add(key);
      blocks.push({
        id: `b-${i}`,
        fact,
        used: false,
      });
    }
    state.jenga = {
      blocks,
      current: null,
      message: "Pull a block to reveal a fact.",
      wobble: false,
      solvedThisRound: false,
    };
  }

  const game = state.jenga;

  function pullBlock(block) {
    if (block.used) return;
    game.current = block;
    game.solvedThisRound = false;
    game.message = "Say the answer, then type it in.";
    game.wobble = false;
    renderJengaGame(screen, false);
  }

  function checkAnswer(inputValue) {
    if (!game.current) return;
    const answer = Number(inputValue);
    if (Number.isNaN(answer)) return;
    if (answer === game.current.fact.answer) {
      game.message =
        "Nice steady pull! The block balances perfectly. Choose a new block.";
      game.current.used = true;
      game.solvedThisRound = true;
      game.wobble = false;
      state.stats.factsSolved += 1;
    } else {
      game.message =
        "Uh‑oh, the tower wobbles! Check your strategy and try another fact.";
      game.wobble = true;
    }
    renderJengaGame(screen, false);
  }

  screen.innerHTML = "";
  const header = $(`
    <div class="game-header-row">
      <div>
        <div class="game-title">Flashcard Blocks</div>
        <div class="game-meta">Pull a block, solve the fact, stack it on top.</div>
      </div>
      <button class="button secondary small" type="button">Reset Tower</button>
    </div>
  `);
  header.querySelector("button").addEventListener("click", () => {
    state.jenga = null;
    renderJengaGame(screen, true);
  });
  screen.appendChild(header);

  const row = document.createElement("div");
  row.className = "game-row";
  const left = document.createElement("div");
  const right = document.createElement("div");

  const stack = document.createElement("div");
  stack.className = "stack-jenga";
  if (game.wobble) {
    stack.style.transform = "rotate(-0.4deg)";
  } else {
    stack.style.transform = "none";
  }

  game.blocks.forEach((block) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "jenga-block";
    if (block.used) el.classList.add("used");
    el.innerHTML = `<div class="jenga-block-label">${
      block.used ? "" : "PULL"
    }</div>`;
    el.addEventListener("click", () => pullBlock(block));
    stack.appendChild(el);
  });

  left.appendChild(stack);
  const towerHint = document.createElement("div");
  towerHint.className = "hint-text";
  towerHint.textContent =
    "Idea: in small groups, children take turns choosing a block while everyone solves the fact together.";
  left.appendChild(towerHint);

  const consoleBox = document.createElement("div");
  consoleBox.className = "card-stack";
  consoleBox.style.alignItems = "stretch";

  if (game.current) {
    consoleBox.innerHTML = `
      <div class="card-label">Current Block</div>
      <div class="card-value">${game.current.fact.label}</div>
    `;
    const inputRow = document.createElement("div");
    inputRow.className = "input-row";
    const input = document.createElement("input");
    input.type = "number";
    input.className = "input";
    input.placeholder = "?";
    const submit = document.createElement("button");
    submit.type = "button";
    submit.className = "button primary small";
    submit.textContent = "Check";
    submit.addEventListener("click", () => checkAnswer(input.value));
    inputRow.appendChild(input);
    inputRow.appendChild(submit);
    consoleBox.appendChild(inputRow);
  } else {
    consoleBox.innerHTML = `
      <div class="card-label">How to Play</div>
      <div class="hint-text" style="margin-top:4px;">
        Tap a block to pull it out. Solve the fact before the tower gets too wobbly!
      </div>
    `;
  }

  const message = document.createElement("div");
  message.className = `message${game.wobble ? " error" : ""}`;
  message.style.marginTop = "8px";
  message.textContent = game.message;

  consoleBox.appendChild(message);
  right.appendChild(consoleBox);

  row.appendChild(left);
  row.appendChild(right);
  screen.appendChild(row);
}

function renderGoFishGame(screen, fromPlayButton) {
  if (!state.goFish || fromPlayButton) {
    const deck = [];
    const seen = new Set();
    while (deck.length < 12) {
      const fact = buildFact(state.config.operation, state.config.maxNumber);
      const key = `${fact.label}=${fact.answer}`;
      if (!seen.has(key)) {
        seen.add(key);
        deck.push(fact);
      }
    }
    const playerHand = shuffled(deck).slice(0, 6);
    const pond = deck.slice(6);
    state.goFish = {
      playerHand,
      pond,
      matches: [],
      lastAsk: null,
      message: "Tap a card in your hand to ask the pond for that answer.",
      log: [],
    };
  }

  const game = state.goFish;

  function askFor(card) {
    const answer = card.answer;
    const matches = [];
    const remaining = [];
    for (const fish of game.pond) {
      if (fish.answer === answer) {
        matches.push(fish);
      } else {
        remaining.push(fish);
      }
    }
    game.pond = remaining;
    game.lastAsk = answer;

    if (matches.length > 0) {
      game.matches.push(...matches, card);
      game.playerHand = game.playerHand.filter((c) => c !== card);
      game.message = `You caught ${matches.length} matching card${
        matches.length > 1 ? "s" : ""
      } for answer ${answer}!`;
      game.log.unshift(
        `Caught ${matches.length} card(s) for ${answer}. Total matches: ${game.matches.length}.`,
      );
      state.stats.factsSolved += matches.length;
    } else {
      if (game.pond.length === 0) {
        game.message =
          "No match and the pond is empty! Sort through your catches and start a new round.";
        game.log.unshift("Pond empty—round over.");
      } else {
        const drawn = game.pond.shift();
        game.playerHand.push(drawn);
        game.message =
          "No match—Go Fish! You drew a new fact into your hand.";
        game.log.unshift(
          `Go Fish: drew ${drawn.label} (answer ${drawn.answer}).`,
        );
      }
    }

    renderGoFishGame(screen, false);
  }

  screen.innerHTML = "";
  const header = $(`
    <div class="game-header-row">
      <div>
        <div class="game-title">Math Go Fish</div>
        <div class="game-meta">Ask for a fact with the answer you need.</div>
      </div>
      <button class="button secondary small" type="button">New Round</button>
    </div>
  `);
  header.querySelector("button").addEventListener("click", () => {
    state.goFish = null;
    renderGoFishGame(screen, true);
  });
  screen.appendChild(header);

  const row = document.createElement("div");
  row.className = "game-row";
  const left = document.createElement("div");
  const right = document.createElement("div");

  const handLabel = document.createElement("div");
  handLabel.className = "card-label";
  handLabel.textContent = "Your Hand (tap a fact to ask for its answer)";

  const hand = document.createElement("div");
  hand.className = "go-fish-hand";
  game.playerHand.forEach((card) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "fish-card";
    if (game.lastAsk != null && game.lastAsk === card.answer) {
      el.classList.add("match");
    }
    el.textContent = `${card.label} = ?`;
    el.addEventListener("click", () => askFor(card));
    hand.appendChild(el);
  });

  left.appendChild(handLabel);
  left.appendChild(hand);

  const info = document.createElement("div");
  info.innerHTML = `
    <div class="status-row" style="margin-top:8px;">
      <div class="status-chip">Cards in pond: ${game.pond.length}</div>
      <div class="status-chip highlight">Matches caught: ${game.matches.length}</div>
    </div>
    <div class="message" style="margin-top:6px;">${game.message}</div>
    <p class="hint-text">
      Partner play idea: one player is the pond and answers out loud when asked, while the other keeps track of matches.
    </p>
  `;
  left.appendChild(info);

  const pondBox = document.createElement("div");
  pondBox.className = "card-stack";
  pondBox.innerHTML = `
    <div class="card-label">Pond</div>
    <div class="card-value">${
      game.pond.length > 0 ? "???" : "Empty"
    }</div>
  `;

  const log = document.createElement("div");
  log.className = "log";
  game.log.forEach((entry) => {
    const line = document.createElement("div");
    line.className = "log-entry";
    line.textContent = entry;
    log.appendChild(line);
  });

  right.appendChild(pondBox);
  right.appendChild(log);

  row.appendChild(left);
  row.appendChild(right);
  screen.appendChild(row);
}

function renderHideSeekGame(screen, fromPlayButton) {
  if (!state.hideSeek || fromPlayButton) {
    const tiles = [];
    const facts = [];
    const seen = new Set();
    while (facts.length < 10) {
      const fact = buildFact(state.config.operation, state.config.maxNumber);
      const key = `${fact.label}=${fact.answer}`;
      if (!seen.has(key)) {
        seen.add(key);
        facts.push(fact);
      }
    }
    const answers = facts.map((f) => f.answer);
    const hiddenSpots = shuffled(
      Array.from({ length: 25 }, (_, i) => i),
    ).slice(0, answers.length);
    for (let i = 0; i < 25; i++) {
      const idx = hiddenSpots.indexOf(i);
      tiles.push({
        id: `t-${i}`,
        hasCard: idx !== -1,
        fact: idx !== -1 ? facts[idx] : null,
        found: false,
      });
    }
    state.hideSeek = {
      tiles,
      remaining: answers.length,
      message:
        "Click around the classroom grid to find hidden math cards. Solve as you go.",
    };
  }

  const game = state.hideSeek;

  function reveal(tile) {
    if (tile.found) return;
    if (tile.hasCard) {
      tile.found = true;
      game.remaining -= 1;
      state.stats.factsSolved += 1;
      game.message = `Found: ${tile.fact.label} = ${tile.fact.answer}. ${
        game.remaining > 0
          ? `Keep searching for ${game.remaining} more.`
          : "All cards found! Shuffle for a new hide and seek."
      }`;
    } else {
      game.message =
        "Empty space—try another part of the room. Scan in rows or columns to be systematic.";
    }
    renderHideSeekGame(screen, false);
  }

  screen.innerHTML = "";
  const header = $(`
    <div class="game-header-row">
      <div>
        <div class="game-title">Hide & Seek</div>
        <div class="game-meta">Imagine cards hidden around the classroom grid.</div>
      </div>
      <button class="button secondary small" type="button">Hide New Cards</button>
    </div>
  `);
  header.querySelector("button").addEventListener("click", () => {
    state.hideSeek = null;
    renderHideSeekGame(screen, true);
  });
  screen.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "hide-grid";

  game.tiles.forEach((tile) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "hide-tile";
    if (!tile.hasCard) el.classList.add("empty");
    if (tile.found) el.classList.add("found");
    const content = document.createElement("div");
    content.className = "hide-tile-content";
    if (tile.found && tile.fact) {
      content.textContent = `${tile.fact.label} = ${tile.fact.answer}`;
    } else if (tile.hasCard) {
      content.textContent = "?";
    } else {
      content.textContent = "";
    }
    el.appendChild(content);
    el.addEventListener("click", () => reveal(tile));
    grid.appendChild(el);
  });

  screen.appendChild(grid);

  const status = document.createElement("div");
  status.className = "status-row";
  status.innerHTML = `
    <div class="status-chip highlight">Cards left: ${game.remaining}</div>
  `;
  screen.appendChild(status);

  const msg = document.createElement("div");
  msg.className = "message";
  msg.textContent = game.message;
  screen.appendChild(msg);
}

// Menu: handle arrow and start clicks via delegation (capture phase so we run first)
function startGameFromMenu() {
  if (!app) return;
  if (state.view !== "menu") return;
  // Immediate feedback so we know the handler ran
  app.classList.remove("math-arcade-menu");
  app.innerHTML = "<div style=\"padding:2rem;color:#fff;font-family:system-ui;text-align:center;\">Starting game...</div>";
  function doStart() {
    try {
      if (app.dataset.menuIndex != null && app.dataset.menuIndex !== "") {
        const i = parseInt(app.dataset.menuIndex, 10);
        if (!isNaN(i) && i >= 0 && i <= 2) state.menuIndex = i;
      }
      state.currentGame = SELECTION_GAMES[state.menuIndex].id;
      state.view = "game";
      renderApp();
    } catch (err) {
      app.innerHTML = "<div style=\"padding:2rem;color:#fff;font-family:system-ui;\"><h2>Error starting game</h2><pre>" + String(err.message) + "</pre><pre>" + String(err.stack) + "</pre></div>";
      console.error(err);
    }
  }
  setTimeout(doStart, 0);
}

function onMenuClick(e) {
  if (!app || !app.contains(e.target)) return;
  if (state.view !== "menu") return;
  const prev = e.target.closest("#arcade-prev, [data-action=prev]");
  const next = e.target.closest("#arcade-next, [data-action=next]");
  const start = e.target.closest("#arcade-start");
  if (prev) {
    state.menuIndex = (state.menuIndex - 1 + 3) % 3;
    app.dataset.menuIndex = state.menuIndex;
    renderApp();
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  if (next) {
    state.menuIndex = (state.menuIndex + 1) % 3;
    app.dataset.menuIndex = state.menuIndex;
    renderApp();
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  if (start) {
    e.preventDefault();
    e.stopPropagation();
    startGameFromMenu();
  }
}
document.addEventListener("click", onMenuClick, true);

renderApp();

