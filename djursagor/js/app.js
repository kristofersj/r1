(function () {
  const $ = (id) => document.getElementById(id);
  const S = window.STORIES, UI = window.UI;

  const state = { view: "menu", lang: "sv", sel: 0, story: 0, page: 0, frame: 0 };
  const audio = new Audio();
  audio.preload = "auto";

  // ---------- Preferences (r1 creationStorage, falls back to localStorage) ----------
  async function loadLang() {
    try {
      if (window.creationStorage) {
        const v = await window.creationStorage.plain.getItem("lang");
        if (v) return atob(v);
      }
    } catch (e) {}
    try { return localStorage.getItem("lang"); } catch (e) { return null; }
  }
  function saveLang(l) {
    try { window.creationStorage && window.creationStorage.plain.setItem("lang", btoa(l)); } catch (e) {}
    try { localStorage.setItem("lang", l); } catch (e) {}
  }

  // Remember where the reader was, so a reopened creation resumes on the same page.
  function savePos(v) {
    try { window.creationStorage && window.creationStorage.plain.setItem("pos", btoa(v)); } catch (e) {}
    try { localStorage.setItem("pos", v); } catch (e) {}
  }
  async function loadPos() {
    try {
      if (window.creationStorage) {
        const v = await window.creationStorage.plain.getItem("pos");
        if (v) return atob(v);
      }
    } catch (e) {}
    try { return localStorage.getItem("pos"); } catch (e) { return null; }
  }

  // ---------- Audio ----------
  function audioSrc() {
    const s = S[state.story];
    if (state.page >= s.pages.length) return `audio/end-${state.lang}.mp3`;
    return `audio/${s.id}-${state.page + 1}-${state.lang}.mp3`;
  }
  function play() {
    audio.pause();
    audio.src = audioSrc();
    audio.currentTime = 0;
    const p = audio.play();
    if (p && p.catch) p.catch(() => setSpeaker("ask")); // autoplay blocked → nudge to tap
  }
  function stop() { audio.pause(); setSpeaker(""); }
  function setSpeaker(mode) { $("speaker").className = "speaker" + (mode ? " " + mode : ""); }
  audio.addEventListener("playing", () => setSpeaker("playing"));
  audio.addEventListener("ended", () => setSpeaker(""));
  audio.addEventListener("pause", () => { if ($("speaker").className.includes("playing")) setSpeaker(""); });

  // ---------- Rendering ----------
  function renderTabs() {
    document.querySelectorAll(".tab").forEach((t) => {
      const on = t.dataset.lang === state.lang;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", on);
    });
    document.documentElement.lang = state.lang;
  }

  function renderMenu() {
    $("pickTitle").textContent = UI[state.lang].pick;
    $("menuHint").textContent = UI[state.lang].scroll;
    const list = $("list");
    if (!list.children.length) {
      S.forEach((s, i) => {
        const li = document.createElement("li");
        li.className = "card";
        li.style.setProperty("--sel", s.color + "55");
        const cv = document.createElement("canvas");
        cv.width = 20; cv.height = 16;
        ART.thumb(cv, s.id);
        li.appendChild(cv);
        li.appendChild(document.createElement("span"));
        li.addEventListener("click", () => { state.sel = i; openStory(i); });
        list.appendChild(li);
      });
    }
    [...list.children].forEach((li, i) => {
      li.querySelector("span").textContent = S[i].title[state.lang];
      li.classList.toggle("sel", i === state.sel);
    });
    $("counter").textContent = "";
    $("home").classList.add("off");
  }

  function sceneId() {
    const s = S[state.story];
    return state.page < s.pages.length ? s.pages[state.page].scene : "end";
  }

  // Shrink the font until the page text fits the text box.
  function fitText(t) {
    const sizes = [[16, 19], [15, 17], [14, 16], [13, 15], [12, 14]];
    for (const [fs, lh] of sizes) {
      t.style.fontSize = fs + "px"; t.style.lineHeight = lh + "px";
      if (t.scrollHeight <= t.clientHeight + 1) return;
    }
  }

  function renderReader(dir) {
    const s = S[state.story];
    const n = s.pages.length;
    const end = state.page >= n;
    ART.draw($("scene"), sceneId(), state.frame);

    const t = $("text");
    if (end) {
      t.innerHTML = ""; t.style.fontSize = ""; t.style.lineHeight = "";
      const b = document.createElement("div");
      b.textContent = UI[state.lang].end;
      b.style.cssText = "font-size:24px;font-weight:700;margin-bottom:4px";
      const again = document.createElement("button");
      again.className = "again";
      again.textContent = UI[state.lang].again;
      again.addEventListener("click", (e) => { e.stopPropagation(); goMenu(); });
      t.append(b, again);
    } else {
      t.textContent = s.pages[state.page][state.lang];
      fitText(t);
    }

    $("counter").textContent = end ? "♥" : `${state.page + 1}/${n}`;
    $("home").classList.remove("off");
    document.documentElement.style.setProperty("--accent", s.color);

    const dots = $("dots");
    dots.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const d = document.createElement("i");
      d.className = "dot" + (i === state.page ? " on" : "");
      dots.appendChild(d);
    }

    const r = $("reader");
    r.classList.remove("turn-next", "turn-prev");
    if (dir) { void r.offsetWidth; r.classList.add(dir > 0 ? "turn-next" : "turn-prev"); }
  }

  function show(view) {
    state.view = view;
    $("menu").classList.toggle("hidden", view !== "menu");
    $("reader").classList.toggle("hidden", view !== "reader");
  }

  // ---------- Navigation ----------
  function openStory(i) {
    state.story = i; state.page = 0; window.__endStory = S[i].id;
    savePos(i + ":0");
    show("reader"); renderReader(1); play();
  }
  function goMenu() {
    stop(); savePos(""); show("menu"); renderMenu();
    document.documentElement.style.setProperty("--accent", "#e8734a");
  }
  function turn(dir) {
    const last = S[state.story].pages.length; // index of end card
    const next = state.page + dir;
    if (next < 0) return;
    if (next > last) { goMenu(); return; }
    state.page = next; savePos(state.story + ":" + next);
    renderReader(dir); play();
  }
  function setLang(l) {
    if (l === state.lang) return;
    state.lang = l; saveLang(l); renderTabs();
    if (state.view === "menu") renderMenu();
    else { renderReader(0); play(); }
  }

  // ---------- Input: r1 hardware ----------
  function onDown() {
    if (state.view === "menu") { state.sel = (state.sel + 1) % S.length; renderMenu(); }
    else turn(1);
  }
  function onUp() {
    if (state.view === "menu") { state.sel = (state.sel - 1 + S.length) % S.length; renderMenu(); }
    else turn(-1);
  }
  function onSide() {
    if (state.view === "menu") openStory(state.sel);
    else if (state.page >= S[state.story].pages.length) goMenu();
    else play(); // replay the page
  }
  window.addEventListener("scrollDown", onDown);
  window.addEventListener("scrollUp", onUp);
  window.addEventListener("sideClick", onSide);

  // Long-press the side button to flip language
  window.addEventListener("longPressStart", () => setLang(state.lang === "sv" ? "fr" : "sv"));

  // ---------- Input: touch + desktop testing ----------
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => setLang(t.dataset.lang)));
  $("home").addEventListener("click", goMenu);
  $("scene").addEventListener("click", () => play());
  $("speaker").addEventListener("click", () => play());
  $("text").addEventListener("click", () => { if (state.page < S[state.story].pages.length) play(); });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") onDown();
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") onUp();
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSide(); }
    else if (e.key === "Escape") goMenu();
  });
  let wheelLock = 0;
  document.addEventListener("wheel", (e) => {
    const now = Date.now();
    if (now - wheelLock < 250) return;
    wheelLock = now;
    e.deltaY > 0 ? onDown() : onUp();
  }, { passive: true });

  // ---------- Idle animation (2 frames, cheap) ----------
  setInterval(() => {
    if (document.hidden || state.view !== "reader") return;
    state.frame ^= 1;
    ART.draw($("scene"), sceneId(), state.frame);
  }, 650);

  // ---------- Boot ----------
  (async function boot() {
    const l = await loadLang();
    if (l === "sv" || l === "fr") state.lang = l;
    renderTabs(); renderMenu(); show("menu");
    const pos = await loadPos();
    const m = pos && pos.match(/^(\d+):(\d+)$/);
    if (m && S[+m[1]] && +m[2] <= S[+m[1]].pages.length) {
      state.story = +m[1]; state.page = +m[2]; state.sel = +m[1]; window.__endStory = S[state.story].id;
      show("reader"); renderReader(0);
    }
    // Warm the font so first paint is crisp
    if (document.fonts && document.fonts.load) document.fonts.load('16px "Pixelify"').then(() => (state.view === "menu" ? renderMenu() : renderReader(0)));
  })();

  // Expose for debugging in a desktop browser
  window.__djur = { state, turn, openStory, goMenu, setLang };
})();
