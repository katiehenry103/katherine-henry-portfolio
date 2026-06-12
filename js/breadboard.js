(function () {
  "use strict";

  const oledArt = document.getElementById("oledArt");
  const pcbResistors = document.getElementById("pcbResistors");
  const pcbTraces = document.getElementById("pcbTraces");

  const NAME_LINES = [
    { id: "pcbLine1", word: "KATHERINE" },
    { id: "pcbLine2", word: "R", mid: true },
    { id: "pcbLine3", word: "HENRY" }
  ];

  const LETTER_GAP = 3;
  const ROWS = 7;
  const COLS = 5;

  /* 5×7 dot-matrix font */
  const FONT5 = {
    K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
    A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
    N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
    Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."]
  };

  function renderWord(container, word) {
    if (!container) return;
    container.innerHTML = "";

    word.split("").forEach(function (char) {
      const glyph = FONT5[char];
      if (!glyph) return;

      const letterEl = document.createElement("div");
      letterEl.className = "pcb-letter";
      letterEl.setAttribute("aria-label", char);

      for (let row = 0; row < ROWS; row++) {
        const rowEl = document.createElement("div");
        rowEl.className = "pcb-row";
        const rowStr = glyph[row] || ".....";
        for (let col = 0; col < COLS; col++) {
          const cell = document.createElement("div");
          cell.className = "pcb-cell" + (rowStr[col] === "#" ? " pcb-led-on" : "");
          rowEl.appendChild(cell);
        }
        letterEl.appendChild(rowEl);
      }

      container.appendChild(letterEl);
    });
  }

  function renderAllNames() {
    NAME_LINES.forEach(function (line) {
      const el = document.getElementById(line.id);
      if (line.mid) {
        el.classList.add("pcb-name-line-mid");
      }
      renderWord(el, line.word);
    });
  }

  function renderResistors() {
    if (!pcbResistors) return;
    pcbResistors.innerHTML = "";
    for (let i = 0; i < 8; i++) {
      const r = document.createElement("div");
      r.className = "pcb-smd-resistor";
      r.innerHTML = '<span class="smd-body"></span><span class="smd-label">220Ω</span>';
      pcbResistors.appendChild(r);
    }
  }

  function drawTraces() {
    if (!pcbTraces) return;
    pcbTraces.innerHTML =
      '<path class="trace trace-power" d="M4 8 H516"/>' +
      '<path class="trace trace-gnd" d="M4 248 H516"/>' +
      '<path class="trace" d="M24 72 H496"/>' +
      '<path class="trace" d="M24 168 H496"/>' +
      '<path class="trace trace-via" d="M80 72 V120"/>' +
      '<path class="trace trace-via" d="M160 72 V120"/>' +
      '<path class="trace trace-via" d="M240 72 V120"/>' +
      '<path class="trace trace-via" d="M320 72 V120"/>' +
      '<path class="trace trace-via" d="M400 72 V120"/>' +
      '<path class="trace trace-via" d="M480 72 V120"/>' +
      '<path class="trace trace-via" d="M120 148 V196"/>' +
      '<path class="trace trace-via" d="M200 148 V196"/>' +
      '<path class="trace trace-via" d="M280 148 V196"/>' +
      '<path class="trace trace-via" d="M360 148 V196"/>' +
      '<circle class="pcb-via" cx="80" cy="120" r="3"/>' +
      '<circle class="pcb-via" cx="240" cy="120" r="3"/>' +
      '<circle class="pcb-via" cx="400" cy="120" r="3"/>' +
      '<circle class="pcb-via" cx="200" cy="196" r="3"/>' +
      '<circle class="pcb-via" cx="360" cy="196" r="3"/>';
  }

  const PX = 2;
  const OLED_W = 16;
  const OLED_H = 10;
  const PALETTE = {
    ".": null,
    W: "#00ff41",
    A: "#1b5e20"
  };

  function buildScopeFrame(phase) {
    const rows = [];
    const axisRow = OLED_H - 2;
    const midY = 3.5;
    const amplitude = 2.8;

    for (let y = 0; y < OLED_H; y++) {
      let row = "";
      for (let x = 0; x < OLED_W; x++) {
        row += ".";
      }
      rows.push(row.split(""));
    }

    for (let x = 0; x < OLED_W; x++) {
      rows[axisRow][x] = "A";
    }

    for (let x = 0; x < OLED_W; x++) {
      const y = Math.round(midY - amplitude * Math.sin((x + phase) * 0.55));
      if (y >= 0 && y < axisRow) {
        rows[y][x] = "W";
      }
    }

    return rows.map(function (row) {
      return row.join("");
    });
  }

  function renderOledFrame(rows) {
    if (!oledArt) return;
    oledArt.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "oled-grid";
    grid.style.gridTemplateColumns = "repeat(" + rows[0].length + ", " + PX + "px)";

    rows.forEach(function (row) {
      for (let i = 0; i < row.length; i++) {
        const cell = document.createElement("div");
        cell.className = "oled-pixel";
        const color = PALETTE[row[i]];
        if (color) {
          cell.style.background = color;
        } else {
          cell.classList.add("oled-off");
        }
        grid.appendChild(cell);
      }
    });

    oledArt.appendChild(grid);
  }

  function startOledAnimation() {
    let phase = 0;
    renderOledFrame(buildScopeFrame(phase));
    setInterval(function () {
      phase += 0.45;
      renderOledFrame(buildScopeFrame(phase));
    }, 100);
  }

  renderAllNames();
  renderResistors();
  drawTraces();
  startOledAnimation();
})();
