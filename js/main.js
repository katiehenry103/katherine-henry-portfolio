(function () {
  "use strict";

  const windows = document.querySelectorAll(".win95-window");
  const desktopIcons = document.querySelectorAll(".desktop-icon[data-window]");
  const startBtn = document.getElementById("startBtn");
  const startMenu = document.getElementById("startMenu");
  const startItems = document.querySelectorAll(".start-item[data-window]");
  const taskbarWindows = document.getElementById("taskbarWindows");
  const clock = document.getElementById("clock");
  const visitorCount = document.getElementById("visitorCount");
  const shutdownBtn = document.getElementById("startShutdown");
  const shutdownOverlay = document.getElementById("shutdownOverlay");
  const shutdownOk = document.getElementById("shutdownOk");
  const desktop = document.getElementById("desktop");
  const panicBtn = document.getElementById("panicBtn");
  const panicBsod = document.getElementById("panicBsod");
  const panicOk = document.getElementById("panicOk");

  let zIndex = 100;
  let openWindows = new Set();
  let panicking = false;

  /* Visitor counter */
  (function initCounter() {
    if (!visitorCount) return;
    let count = parseInt(localStorage.getItem("visitorCount") || "41", 10);
    count += 1;
    localStorage.setItem("visitorCount", String(count));
    visitorCount.textContent = String(count).padStart(6, "0");
  })();

  /* Clock */
  function updateClock() {
    if (!clock) return;
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    clock.textContent = h + ":" + m + " " + ampm;
  }

  updateClock();
  setInterval(updateClock, 30000);

  function focusWindow(id) {
    const win = document.getElementById("win-" + id);
    if (!win) return;

    windows.forEach(function (w) {
      w.classList.remove("focused");
    });

    win.classList.add("focused");
    win.style.zIndex = String(++zIndex);
    updateTaskbar();
  }

  function openWindow(id) {
    const win = document.getElementById("win-" + id);
    if (!win) return;

    win.classList.add("open");
    win.classList.remove("minimized");
    openWindows.add(id);
    focusWindow(id);
    updateTaskbar();
  }

  function closeWindow(id) {
    const win = document.getElementById("win-" + id);
    if (!win) return;

    win.classList.remove("open", "focused", "minimized");
    openWindows.delete(id);
    updateTaskbar();
  }

  function minimizeWindow(id) {
    const win = document.getElementById("win-" + id);
    if (!win) return;

    win.classList.add("minimized");
    win.classList.remove("focused");
    updateTaskbar();
  }

  function updateTaskbar() {
    if (!taskbarWindows) return;
    taskbarWindows.innerHTML = "";

    openWindows.forEach(function (id) {
      const win = document.getElementById("win-" + id);
      if (!win) return;

      const btn = document.createElement("button");
      btn.className = "taskbar-btn";
      if (win.classList.contains("focused") && !win.classList.contains("minimized")) {
        btn.classList.add("active");
      }
      const titleEl = win.querySelector(".titlebar-text");
      btn.textContent = titleEl ? titleEl.textContent : id;
      btn.addEventListener("click", function () {
        if (win.classList.contains("minimized")) {
          win.classList.remove("minimized");
          focusWindow(id);
        } else if (win.classList.contains("focused")) {
          minimizeWindow(id);
        } else {
          focusWindow(id);
        }
      });
      taskbarWindows.appendChild(btn);
    });
  }

  desktopIcons.forEach(function (icon) {
    icon.addEventListener("dblclick", function () {
      openWindow(this.dataset.window);
    });
    icon.addEventListener("click", function () {
      desktopIcons.forEach(function (i) { i.classList.remove("selected"); });
      this.classList.add("selected");
    });
  });

  document.querySelectorAll(".explorer-item[data-window], .link-btn[data-window], .win95-btn[data-window]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openWindow(this.dataset.window);
    });
  });

  startItems.forEach(function (item) {
    item.addEventListener("click", function () {
      openWindow(this.dataset.window);
      startMenu.classList.add("hidden");
      startBtn.classList.remove("active");
    });
  });

  startBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    startMenu.classList.toggle("hidden");
    startBtn.classList.toggle("active");
  });

  document.addEventListener("click", function () {
    startMenu.classList.add("hidden");
    startBtn.classList.remove("active");
  });

  startMenu.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  windows.forEach(function (win) {
    win.addEventListener("mousedown", function () {
      focusWindow(win.dataset.window);
    });

    win.querySelectorAll('[data-action="close"]').forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        closeWindow(win.dataset.window);
      });
    });

    win.querySelectorAll('[data-action="minimize"]').forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        minimizeWindow(win.dataset.window);
      });
    });
  });

  /* Draggable windows */
  document.querySelectorAll("[data-drag]").forEach(function (titlebar) {
    const winId = titlebar.dataset.drag;
    const win = document.getElementById(winId);
    if (!win) return;

    let dragging = false;
    let startX, startY, startLeft, startTop;

    titlebar.addEventListener("mousedown", function (e) {
      if (e.target.closest(".title-btn")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = win.offsetLeft;
      startTop = win.offsetTop;
      e.preventDefault();
    });

    document.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.left = Math.max(0, startLeft + dx) + "px";
      win.style.top = Math.max(0, startTop + dy) + "px";
    });

    document.addEventListener("mouseup", function () {
      dragging = false;
    });
  });

  shutdownBtn.addEventListener("click", function () {
    shutdownOverlay.classList.remove("hidden");
    startMenu.classList.add("hidden");
  });

  shutdownOk.addEventListener("click", function () {
    shutdownOverlay.classList.add("hidden");
  });

  function triggerPanic() {
    if (panicking || document.body.classList.contains("booting")) return;
    panicking = true;
    document.body.classList.add("panic-mode");
    panicBsod.classList.remove("hidden");
    startMenu.classList.add("hidden");
    startBtn.classList.remove("active");
  }

  function endPanic() {
    if (!panicking) return;
    panicking = false;
    document.body.classList.remove("panic-mode");
    panicBsod.classList.add("hidden");
  }

  if (panicBtn) {
    panicBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      triggerPanic();
    });
  }

  if (panicOk) {
    panicOk.addEventListener("click", endPanic);
  }

  document.addEventListener("keydown", function (e) {
    if (panicking && e.key === "Escape") {
      endPanic();
    }
  });

  desktop.addEventListener("click", function (e) {
    if (e.target === desktop) {
      document.querySelectorAll(".desktop-icon").forEach(function (i) { i.classList.remove("selected"); });
    }
  });

  /* Open About + Breadboard after boot sequence */
  window.addEventListener("portfolio:boot-complete", function () {
    openWindow("about");
    openWindow("breadboard");
  });
})();
