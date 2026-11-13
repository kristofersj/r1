// Pixel-art scenes, drawn at 80x50 logical pixels and scaled up 3x with CSS.
// Every scene is a function (ctx, frame) so it can do tiny 2-frame idle animations.
(function () {
  const W = 80, H = 50;

  const P = {
    k: "#2b1e2f",  // ink outline
    w: "#ffffff", W: "#f4f1ea", V: "#cfc8bb",
    sky: "#a8dcf0", sky2: "#cdeef7", cloud: "#ffffff",
    g: "#6cbf5a", G: "#4a9a48", gl: "#9bd86a",
    dirt: "#8a5a3b",
    st: "#9aa0a8", St: "#6b7078", stl: "#c4c8cc",
    r: "#e0453a", rl: "#ff8a7a", stem: "#5c3a28", leaf: "#4a9a48",
    S: "#7a5236", s: "#4f3524", F: "#e8c49a", n: "#2b1e1a",
    Y: "#ffd84a", y: "#e8b22e", O: "#ff9a3c",
    wa: "#4aa3df", wl: "#8fd0f5", wd: "#2f78b8",
    B: "#a0683f", b: "#6e4428", M: "#e2b98a",
    pink: "#ff9fb0", heart: "#ff5d73",
    ss1: "#ffc48a", ss2: "#ff9a8b", ss3: "#c98bb9", ss4: "#8a6bbf", sun: "#ffd95e",
    n1: "#1f2547", n2: "#2e3870", n3: "#3d4a8c", star: "#fff3b0", moon: "#fff7d1",
    tr: "#3f8a4f", trd: "#2f6b3d", trunk: "#7a4e30",
    cave: "#6f6470", caved: "#3a2f3d", cavel: "#8d8290",
    flower1: "#ff7aa2", flower2: "#ffe066", flower3: "#b28dff"
  };

  // --- Sprites -------------------------------------------------------------
  // Each char maps to a palette key; "." is transparent.
  const MAP = {
    k: "k", S: "S", s: "s", F: "F", n: "n", e: "k", p: "pink", w: "w",
    Y: "Y", y: "y", O: "O", W: "W", V: "V", B: "B", b: "b", M: "M",
    r: "r", R: "rl", t: "stem", l: "leaf", h: "heart", z: "w", o: "moon"
  };

  const SPR = {
    hedgehog: [
      "....k.k.k.......",
      "...kSkSkSk......",
      "..kSsSSsSSk.....",
      ".kSSsSSsSsSk....",
      "kSsSSsSSsSSSkk..",
      "kSSsSSsSSsSFFFk.",
      "kSsSSsSSsSFFFeFk",
      "kSSSsSSSSFFFFFFn",
      ".kSSSSSSSFpFFFk.",
      "..kkkkkkkkFFFk..",
      "...kFk..kFk.....",
    ],
    hedgehogHappy: [
      "....k.k.k.......",
      "...kSkSkSk......",
      "..kSsSSsSSk.....",
      ".kSSsSSsSsSk....",
      "kSsSSsSSsSSSkk..",
      "kSSsSSsSSsSFFFk.",
      "kSsSSsSSsSFFkFFk",
      "kSSSsSSSSFFFFFFn",
      ".kSSSSSSSFpFkFk.",
      "..kkkkkkkkFFkk..",
      "...kFk..kFk.....",
    ],
    apple: [
      "...tl..",
      "..tll..",
      ".rrtrr.",
      "rRrrrrr",
      "rRrrrrr",
      "rrrrrrr",
      ".rrrrr.",
      "..r.r..",
    ],
    appleCore: [
      "..t..",
      ".rrr.",
      "..F..",
      "..F..",
      ".rrr.",
    ],
    duckling: [
      "...kkkk...",
      "..kYYYYk..",
      "..kYYeYkk.",
      "..kYYYYOOk",
      "...kYYYkk.",
      ".kkYYYYYk.",
      "kYYyYYYYYk",
      "kYyyYYYYk.",
      ".kYYYYYkk.",
      "..kkOkOk..",
    ],
    ducklingJump: [
      "...kkkk...",
      "..kYYYYk..",
      "..kYYeYkk.",
      "..kYYYYOOk",
      "k..kYYYkk.",
      "kykYYYYYk.",
      "kyyYYYYYYk",
      ".kyYYYYYk.",
      "..kYYYYkk.",
      "...kOkOk..",
    ],
    mamaDuck: [
      ".........kkkk...",
      "........kWWWWk..",
      "........kWWeWkk.",
      "........kWWWWOOk",
      ".........kWWWkk.",
      ".kk.....kWWWWk..",
      "kWWkkkkkWWWWWk..",
      "kWWVVVWWWWWWWk..",
      ".kWWVVVWWWWWk...",
      "..kkWWWWWWkk....",
    ],
    bear: [
      "..kk......kk..",
      ".kBbk....kbBk.",
      ".kBBkkkkkkBBk.",
      "..kBBBBBBBBk..",
      ".kBBBBBBBBBBk.",
      ".kBBeBBBBeBBk.",
      ".kBBBMMMMBBBk.",
      ".kBpBMnnMBpBk.",
      "..kBBMMMMBBk..",
      "...kkBBBBkk...",
      "..kBBBMMBBBk..",
      ".kBBkMMMMkBBk.",
      ".kBBkMMMMkBBk.",
      "..kkBBBBBBkk..",
      "...kBBkkBBk...",
      "...kkk..kkk...",
    ],
    bearYawn: [
      "..kk......kk..",
      ".kBbk....kbBk.",
      ".kBBkkkkkkBBk.",
      "..kBBBBBBBBk..",
      ".kBBBBBBBBBBk.",
      ".kBkkBBBBkkBk.",
      ".kBBBMMMMBBBk.",
      ".kBpMMnnMMpBk.",
      "..kBMkrrkMBk..",
      "...kMkrrkMk...",
      "..kBBMkkMBBk..",
      ".kBBkMMMMkBBk.",
      ".kBBkMMMMkBBk.",
      "..kkBBBBBBkk..",
      "...kBBkkBBk...",
      "...kkk..kkk...",
    ],
    bearSleep: [
      "......kkkkkkkk......",
      "..kk.kBBBBBBBBkk....",
      ".kBbkBBBBBBBBBBBk...",
      ".kBBBBBBBBBBBBBBBk..",
      "kBBBBBBBBBBBBBBBBBk.",
      "kBkkBBBBBBBBBBBBBBk.",
      "kBBBMMMBBBBBBBBBBBBk",
      "kBpMMnMBBBBkkBBBBBBk",
      ".kBMMMMBBBkMMkBBBBBk",
      "..kkkkkkkkkkkkkkkkk.",
    ],
    heart: [
      ".hh.hh.",
      "hhhhhhh",
      "hhhhhhh",
      ".hhhhh.",
      "..hhh..",
      "...h...",
    ],
    q: [".www.", "w...w", "...w.", "..w..", ".....", "..w.."],
    ex: [".w.", ".w.", ".w.", ".w.", "...", ".w."],
    z: ["zzzz", "..z.", ".z..", "zzzz"],
    star: ["..o..", ".ooo.", "ooooo", ".ooo.", "..o.."],
  };

  function px(c, x, y, col) { c.fillStyle = P[col] || col; c.fillRect(x | 0, y | 0, 1, 1); }
  function rect(c, x, y, w, h, col) { c.fillStyle = P[col] || col; c.fillRect(x | 0, y | 0, w | 0, h | 0); }
  function ellipse(c, cx, cy, rx, ry, col) {
    c.fillStyle = P[col] || col;
    for (let y = -ry; y <= ry; y++) {
      const half = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry + 0.0001)));
      c.fillRect(cx - half, cy + y, half * 2 + 1, 1);
    }
  }
  function spr(c, name, x, y, flip, override) {
    const rows = SPR[name];
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === ".") continue;
        const key = (override && override[ch]) || MAP[ch];
        const xi = flip ? x + row.length - 1 - i : x + i;
        px(c, xi, y + j, key);
      }
    });
  }

  // --- Backgrounds ---------------------------------------------------------
  function cloud(c, x, y) {
    rect(c, x + 2, y, 8, 1, "cloud"); rect(c, x, y + 1, 13, 2, "cloud"); rect(c, x + 4, y - 1, 4, 1, "cloud");
  }
  function day(c, f) {
    rect(c, 0, 0, W, H, "sky");
    rect(c, 0, 26, W, 8, "sky2");
    cloud(c, 8 + f, 6); cloud(c, 52 - f, 11);
    // hills
    ellipse(c, 15, 36, 26, 7, "gl"); ellipse(c, 65, 37, 24, 6, "gl");
    rect(c, 0, 36, W, 14, "g");
    // grass speckles
    for (let i = 0; i < 18; i++) { px(c, (i * 37) % 80, 38 + ((i * 7) % 11), "G"); px(c, (i * 23 + 5) % 80, 39 + ((i * 5) % 10), "gl"); }
  }
  function flowers(c, list, f) {
    list.forEach(([x, col], i) => {
      const sway = (f + i) % 2;
      px(c, x, 38, "G"); px(c, x, 37, "G");
      px(c, x + sway - 1, 35, col); px(c, x + sway + 1, 35, col); px(c, x + sway, 34, col); px(c, x + sway, 36, col);
      px(c, x + sway, 35, "flower2");
    });
  }
  function tree(c, x, y) {
    rect(c, x + 3, y + 10, 3, 8, "trunk");
    ellipse(c, x + 4, y + 6, 6, 6, "trd"); ellipse(c, x + 4, y + 5, 5, 5, "tr");
    px(c, x + 2, y + 3, "gl"); px(c, x + 3, y + 2, "gl");
  }
  function pond(c, f) {
    rect(c, 0, 0, W, H, "sky"); rect(c, 0, 22, W, 8, "sky2");
    cloud(c, 10 + f, 5); cloud(c, 55 - f, 9);
    rect(c, 0, 28, W, 22, "g");
    ellipse(c, 50, 40, 34, 10, "wd"); ellipse(c, 50, 40, 32, 9, "wa");
    // shimmer
    for (let i = 0; i < 6; i++) rect(c, 26 + i * 8 + (f ? 2 : 0), 36 + (i % 3) * 3, 3, 1, "wl");
    // reeds
    [[10, 30], [13, 31], [74, 31]].forEach(([x, y]) => { rect(c, x, y, 1, 7, "G"); rect(c, x, y - 2, 1, 3, "stem"); });
  }
  function sunset(c, f, deep) {
    const bands = deep ? ["ss4", "ss3", "ss2", "ss1"] : ["ss3", "ss2", "ss1", "sun"];
    const h = [9, 9, 9, 9];
    let y = 0; bands.forEach((b, i) => { rect(c, 0, y, W, h[i], b); y += h[i]; });
    if (!deep) { ellipse(c, 40, 36, 9, 9, "sun"); }
    else { ellipse(c, 40, 40, 7, 7, "ss1"); }
    // far hills
    ellipse(c, 12, 38, 22, 5, deep ? "trd" : "G"); ellipse(c, 70, 38, 22, 5, deep ? "trd" : "G");
    rect(c, 0, 37, W, 13, deep ? "trd" : "G");
    if (!deep) { tree(c, 2, 20); tree(c, 66, 22); }
  }
  function night(c, f) {
    rect(c, 0, 0, W, H, "n1"); rect(c, 0, 18, W, 12, "n2"); rect(c, 0, 28, W, 10, "n3");
    ellipse(c, 64, 10, 6, 6, "moon"); ellipse(c, 66, 8, 5, 5, "n1"); // crescent
    const stars = [[8, 6], [20, 12], [33, 4], [44, 15], [52, 6], [14, 22], [74, 20], [28, 20]];
    stars.forEach(([x, y], i) => {
      px(c, x, y, "star");
      if ((i + f) % 3 === 0) { px(c, x - 1, y, "star"); px(c, x + 1, y, "star"); px(c, x, y - 1, "star"); px(c, x, y + 1, "star"); }
    });
    ellipse(c, 40, 52, 50, 14, "trd"); rect(c, 0, 42, W, 8, "trd");
  }
  function caveMound(c, x, y, dusk) {
    ellipse(c, x, y, 22, 16, dusk ? "caved" : "St");
    ellipse(c, x, y, 21, 15, dusk ? "cave" : "st");
    ellipse(c, x - 6, y - 8, 4, 2, "cavel");
    ellipse(c, x, y + 6, 9, 9, "caved");
  }

  // --- Scenes --------------------------------------------------------------
  const bob = (f) => (f ? 1 : 0);
  const SCENES = {
    pim1(c, f) { day(c, f); flowers(c, [[8, "flower1"], [70, "flower3"], [62, "flower1"]], f); spr(c, "hedgehog", 32, 30 + bob(f)); },
    pim2(c, f) {
      day(c, f); flowers(c, [[10, "flower3"], [72, "flower1"]], f);
      spr(c, "hedgehog", 22, 30 + bob(f));
      // thought bubble with apple
      ellipse(c, 52, 14, 10, 8, "w"); px(c, 40, 24, "w"); rect(c, 42, 22, 2, 2, "w");
      spr(c, "apple", 49, 10 - bob(f));
    },
    pim3(c, f) {
      day(c, f);
      // big leaf lifted
      ellipse(c, 52, 30, 9, 4, "G"); ellipse(c, 52, 30, 8, 3, "leaf"); rect(c, 44, 30, 16, 1, "G");
      rect(c, 50, 34, 1, 4, "G");
      spr(c, "hedgehog", 24, 30);
      spr(c, "q", 50 + bob(f), 18);
    },
    pim4(c, f) {
      day(c, f);
      ellipse(c, 54, 38, 11, 6, "St"); ellipse(c, 54, 37, 10, 5, "st"); rect(c, 50, 33, 4, 1, "stl");
      spr(c, "apple", 61, 33 - bob(f));
      spr(c, "hedgehog", 18, 30);
      spr(c, "ex", 30, 20 - bob(f)); spr(c, "ex", 34, 20 - bob(f));
    },
    pim5(c, f) {
      day(c, f); flowers(c, [[8, "flower1"], [14, "flower2"], [70, "flower3"]], f);
      spr(c, "hedgehogHappy", 30, 30);
      spr(c, "appleCore", 50, 35);
      spr(c, "heart", 46 - bob(f), 16 - bob(f) * 2); spr(c, "heart", 26 + bob(f), 20);
    },
    ella1(c, f) { pond(c, f); spr(c, "duckling", 14, 26 + bob(f)); },
    ella2(c, f) {
      pond(c, f);
      spr(c, "mamaDuck", 40 + bob(f), 30);
      rect(c, 38, 40, 22, 1, "wl"); rect(c, 34 + bob(f) * 2, 42, 6, 1, "wl");
    },
    ella3(c, f) {
      pond(c, f);
      spr(c, "mamaDuck", 46, 32 + bob(f));
      spr(c, "duckling", 16, 27);
      px(c, 26, 26 + bob(f), "wl"); px(c, 26, 27 + bob(f), "wl"); // nervous drop
    },
    ella4(c, f) {
      pond(c, f);
      spr(c, "ducklingJump", 24, 12 - bob(f) * 2);
      // motion lines
      rect(c, 18, 16, 4, 1, "w"); rect(c, 17, 19, 5, 1, "w");
      // splash ring
      ellipse(c, 34, 38, 6, 1, "wl");
      if (f) { px(c, 28, 35, "wl"); px(c, 40, 35, "wl"); px(c, 30, 33, "w"); px(c, 38, 33, "w"); }
    },
    ella5(c, f) {
      pond(c, f);
      spr(c, "mamaDuck", 50, 30 + bob(f));
      spr(c, "duckling", 32, 32 + (1 - bob(f)), false);
      rect(c, 30, 41, 14, 1, "wl"); rect(c, 48, 39, 18, 1, "wl");
      spr(c, "heart", 40, 16 - bob(f));
      px(c, 26, 22 + bob(f), "w"); px(c, 62, 18 - bob(f), "w");
    },
    bo1(c, f) {
      day(c, f); tree(c, 4, 16); tree(c, 64, 18);
      flowers(c, [[22, "flower2"], [58, "flower1"]], f);
      spr(c, "bear", 33, 24 + bob(f));
    },
    bo2(c, f) { sunset(c, f, false); spr(c, "bear", 18, 30); },
    bo3(c, f) {
      sunset(c, f, true);
      spr(c, f ? "bearYawn" : "bear", 33, 30);
      if (f) { spr(c, "z", 50, 26); }
    },
    bo4(c, f) {
      sunset(c, f, true);
      caveMound(c, 40, 42, true);
      spr(c, "bearSleep", 30, 39);
      if (f) spr(c, "z", 52, 32);
    },
    bo5(c, f) {
      night(c, f);
      caveMound(c, 40, 38, true);
      spr(c, "bearSleep", 30, 33);
      spr(c, "z", 50 + bob(f), 28 - bob(f)); spr(c, "z", 56, 22 + bob(f));
    },
    end(c, f) {
      rect(c, 0, 0, W, H, "ss1"); rect(c, 0, 35, W, 15, "gl");
      spr(c, "hedgehogHappy", 12, 30 + bob(f));
      spr(c, "duckling", 33, 31 + (1 - bob(f)));
      spr(c, "bear", 50, 24 + bob(f));
      spr(c, "heart", 20, 14 - bob(f)); spr(c, "heart", 36, 11 + bob(f)); spr(c, "heart", 56, 15 - bob(f));
    },
  };

  // Tiny 16x16 portrait for menu thumbnails
  const THUMBS = {
    pim(c) { rect(c, 0, 0, 20, 16, "sky"); rect(c, 0, 12, 20, 4, "g"); spr(c, "hedgehog", 2, 4); },
    ella(c) { rect(c, 0, 0, 20, 16, "sky"); rect(c, 0, 11, 20, 5, "wa"); rect(c, 2, 12, 6, 1, "wl"); spr(c, "duckling", 5, 3); },
    bo(c) { rect(c, 0, 0, 20, 16, "n2"); px(c, 2, 2, "star"); px(c, 17, 4, "star"); spr(c, "bear", 3, 0); },
  };

  // Each scene is framed by a 60x37 "camera" window over the 80x50 world,
  // shown at 4x so the animals read big on the r1's small screen.
  const CROP = {
    pim1: [10, 10], pim2: [12, 5], pim3: [12, 8], pim4: [10, 10], pim5: [10, 9],
    ella1: [4, 10], ella2: [14, 10], ella3: [10, 10], ella4: [10, 6], ella5: [14, 8],
    bo1: [10, 8], bo2: [10, 12], bo3: [10, 12], bo4: [10, 13], bo5: [16, 8], end: [8, 8],
  };
  const VW = 60, VH = 37, ZOOM = 4;
  let off;

  window.ART = {
    W: VW * ZOOM, H: VH * ZOOM,
    draw(canvas, scene, frame) {
      if (!off) { off = document.createElement("canvas"); off.width = W; off.height = H; }
      const o = off.getContext("2d");
      o.clearRect(0, 0, W, H);
      (SCENES[scene] || SCENES.end)(o, frame | 0);
      const [x0, y0] = CROP[scene] || [10, 6];
      const c = canvas.getContext("2d");
      c.imageSmoothingEnabled = false;
      c.drawImage(off, x0, y0, VW, VH, 0, 0, VW * ZOOM, VH * ZOOM);
    },
    thumb(canvas, id) {
      const c = canvas.getContext("2d");
      THUMBS[id](c);
    },
  };
})();
