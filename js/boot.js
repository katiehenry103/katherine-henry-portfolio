(function () {
  "use strict";

  const bootScreen = document.getElementById("bootScreen");
  const bootLog = document.getElementById("bootLog");
  const bootCursor = document.getElementById("bootCursor");
  const bootBios = document.getElementById("bootBios");
  const bootWin95 = document.getElementById("bootWin95");
  const bootProgressBar = document.getElementById("bootProgressBar");

  if (!bootScreen) {
    window.dispatchEvent(new Event("portfolio:boot-complete"));
    return;
  }

  const BOOT_LINES = [
    "HENRY-PC BIOS (TM) v2026 — Portfolio Edition",
    "Copyright (C) 2026 Katherine R. Henry",
    "",
    "CPU  : Katherine Core CE-Engineering .... OK",
    "RAM  : 32768K Portfolio Memory .......... OK",
    "HDD  : Primary Master  PORTFOLIO.DSK .... OK",
    "HDD  : Primary Slave   RESUME.PDF ........ OK",
    "PCI  : PCB Display Controller ............ OK",
    "PCI  : SSD1306 OLED Interface ............ OK",
    "NET  : Dial-Up Modem (56k) ............... OK",
    "",
    "Boot sequence complete.",
    "Starting operating system..."
  ];

  let skipped = false;
  let timers = [];

  function schedule(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function clearAllTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function finishBoot() {
    if (skipped) return;
    skipped = true;
    clearAllTimers();

    bootScreen.classList.add("boot-fade-out");
    document.body.classList.remove("booting");

    schedule(function () {
      bootScreen.classList.add("hidden");
      window.dispatchEvent(new Event("portfolio:boot-complete"));
    }, 500);
  }

  function skipBoot() {
    if (skipped) return;
    finishBoot();
  }

  function typeBiosLines(index) {
    if (skipped || index >= BOOT_LINES.length) {
      schedule(showWin95Splash, skipped ? 0 : 400);
      return;
    }

    bootLog.textContent += BOOT_LINES[index] + "\n";
    bootLog.scrollTop = bootLog.scrollHeight;

    schedule(function () {
      typeBiosLines(index + 1);
    }, BOOT_LINES[index] === "" ? 80 : 120);
  }

  function showWin95Splash() {
    if (skipped) return;

    bootBios.classList.add("hidden");
    bootWin95.classList.remove("hidden");
    if (bootCursor) bootCursor.classList.add("hidden");

    let progress = 0;
    const step = function () {
      if (skipped) return;
      progress += 4 + Math.random() * 8;
      if (progress >= 100) {
        progress = 100;
        bootProgressBar.style.width = "100%";
        finishBoot();
        return;
      }
      bootProgressBar.style.width = progress + "%";
      schedule(step, 90 + Math.random() * 80);
    };

    schedule(step, 200);
  }

  bootScreen.addEventListener("click", skipBoot);
  document.addEventListener("keydown", skipBoot);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    schedule(finishBoot, 100);
    return;
  }

  schedule(function () {
    typeBiosLines(0);
  }, 300);
})();
