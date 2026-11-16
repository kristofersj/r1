// Djursagor art engine v2.
// Scenes are drawn at 60x37 and shown at 4x (240x148) on the r1.
// Style: flat background colours, chunky animals built from shaded shapes,
// an automatic dark-brown outline, and a soft drop shadow.
(function () {
  const VW = 60, VH = 37, ZOOM = 4;

  // ---------- Palette ----------
  const C = {
    ink: "#3b2a2a", inkSoft: "#5a4242", white: "#fffaf0", shine: "#ffffff",
    // mouse
    mo: "#c9bcb0", moD: "#9c8d82", moL: "#e2d8cd", pink: "#f2a3a0", pinkD: "#d97f80",
    scarf: "#d8433a", scarfD: "#a32f2c",
    // squirrel / fox
    sq: "#c8682e", sqD: "#9a4a1f", sqL: "#e48d4f", cream: "#f6e6cf", creamD: "#dcc6a6",
    // winter
    snow: "#f4f1ec", snowD: "#d3dae3", snowB: "#b9c4d2", skyW: "#a9c3d6", skyW2: "#c6d7e3",
    earth: "#7a5038", earthD: "#5e3c2a", earthL: "#946247", straw: "#e8c070", strawD: "#c49a4c",
    fir: "#3e7a5a", firD: "#2c5c44", firL: "#5c9a72", trunk: "#6e4a32",
    rock: "#8f96a3", rockD: "#6c7380",
    dawn: "#f6c9a0", dawn2: "#f3b07c", sunO: "#f08a3c", sun: "#ffcf4a", sunD: "#f2a93a", sunL: "#ffe58c",
    // spring
    grass: "#8cc66a", grassD: "#6aa553", grassL: "#b2dc8a", spring: "#e9f2d8",
    flowerW: "#ffffff", flowerY: "#ffd84a", flowerP: "#f7a8c4", leaf: "#4f9a52",
    heart: "#ef5b6b",
    // hare
    ha: "#b88d68", haD: "#8e6a4c", haL: "#d6b08a",
    // forest morning
    morn: "#f6ead2", morn2: "#f2dcb6", leafy: "#6fae5c", leafyD: "#4f8a45", leafyL: "#95c97a", bark: "#7a5236", barkD: "#5b3c27",
    // birds and bugs
    tit: "#5d8fd1", titD: "#3f6aa6", titY: "#f6d04d", titYD: "#d9ad2c", wp: "#3a3438", wpD: "#262125", wpR: "#d8433a", beak: "#e89a3c",
    bee: "#f6c63b", beeD: "#d79f22",
    // night lake
    nightA: "#2c3a66", nightB: "#3b4c80", nightC: "#4d5f96", lake: "#25507a", lakeD: "#1c3d60", lakeL: "#3f6f9c",
    moon: "#fbeeb0", moonD: "#e5cf7e", moonL: "#fff9dc", star: "#fff3c4",
    frog: "#6dbb5a", frogD: "#4b9142", frogL: "#a5dc7f", pad: "#3f8f5a", padD: "#2c6b42", reedG: "#4c7a52",
    nightGrass: "#3e6b54", nightGrassD: "#2d5240", firefly: "#fff27a",
  };
  const col = (k) => C[k] || k;

  // ---------- Sprite buffer ----------
  // A small pixel grid we draw shapes into, then outline and stamp onto a scene.
  function Buf(w, h) {
    const d = Array.from({ length: h }, () => Array(w).fill(null));
    const b = {
      w, h, d,
      px(x, y, k) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) d[y][x] = k; },
      get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? d[y][x] : null; },
      rect(x, y, rw, rh, k) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) b.px(x + i, y + j, k); },
      // filled ellipse; returns the set of pixels it covered
      ell(cx, cy, rx, ry, k, only) {
        const hit = [];
        for (let y = -ry; y <= ry; y++) {
          const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / ((ry + 0.35) * (ry + 0.35)))));
          for (let x = -half; x <= half; x++) {
            const X = cx + x, Y = cy + y;
            if (only && !only.has(X + "," + Y)) continue;
            b.px(X, Y, k); hit.push(X + "," + Y);
          }
        }
        return new Set(hit);
      },
      // shaded blob: dark base, light body shifted up-left, optional highlight
      blob(cx, cy, rx, ry, base, dark, light) {
        const m = b.ell(cx, cy, rx, ry, dark);
        b.ell(cx - 1, cy - 1, rx, ry, base, m);
        if (light && rx > 2 && ry > 2) b.ell(cx - Math.ceil(rx / 3), cy - Math.ceil(ry / 3), Math.max(1, rx >> 2), Math.max(0, ry >> 2), light, m);
        return m;
      },
      line(pts, k) { pts.forEach(([x, y]) => b.px(x, y, k)); },
      // draw a part into its own buffer, outline it, then lay it over this one
      layer(fn, k = "ink") {
        const t = Buf(w, h); fn(t); t.outline(k);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (t.d[y][x]) d[y][x] = t.d[y][x];
        return b;
      },
      // outer outline in ink
      outline(k = "ink") {
        const add = [];
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          if (d[y][x]) continue;
          if (b.get(x - 1, y) && b.get(x - 1, y) !== k || b.get(x + 1, y) && b.get(x + 1, y) !== k ||
              b.get(x, y - 1) && b.get(x, y - 1) !== k || b.get(x, y + 1) && b.get(x, y + 1) !== k) add.push([x, y]);
        }
        add.forEach(([x, y]) => (d[y][x] = k));
        return b;
      },
    };
    return b;
  }

  function stamp(c, buf, x, y, flip) {
    for (let j = 0; j < buf.h; j++) for (let i = 0; i < buf.w; i++) {
      const k = buf.d[j][i]; if (!k) continue;
      c.fillStyle = col(k);
      c.fillRect((flip ? x + buf.w - 1 - i : x + i) | 0, (y + j) | 0, 1, 1);
    }
  }

  // ---------- Scene helpers ----------
  function rect(c, x, y, w, h, k) { c.fillStyle = col(k); c.fillRect(x | 0, y | 0, w | 0, h | 0); }
  function px(c, x, y, k) { rect(c, x, y, 1, 1, k); }
  function line(c, pts, k) { pts.forEach(([x, y]) => px(c, x, y, k)); }
  function ell(c, cx, cy, rx, ry, k) {
    c.fillStyle = col(k);
    for (let y = -ry; y <= ry; y++) {
      const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / ((ry + 0.35) * (ry + 0.35)))));
      c.fillRect(cx - half, cy + y, half * 2 + 1, 1);
    }
  }
  const shadow = (c, cx, cy, rx, k) => ell(c, cx, cy, rx, 1, k);
  function heart(c, x, y, k = "heart") {
    [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 2], [2, 2], [3, 2], [2, 3]].forEach(([i, j]) => px(c, x + i, y + j, k));
  }
  function heartOutline(c, x, y, k = "white") {
    [[1, 0], [3, 0], [0, 1], [2, 1], [4, 1], [0, 2], [4, 2], [1, 3], [3, 3], [2, 4]].forEach(([i, j]) => px(c, x + i, y + j, k));
  }
  function note(c, x, y, k = "ink") {
    [[2, 0], [3, 0], [2, 1], [4, 1], [2, 2], [2, 3], [0, 4], [1, 4], [2, 4], [0, 5], [1, 5]].forEach(([i, j]) => px(c, x + i, y + j, k));
  }
  function zee(c, x, y, k = "white") { rect(c, x, y, 5, 1, k); px(c, x + 3, y + 1, k); px(c, x + 2, y + 2, k); px(c, x + 1, y + 3, k); rect(c, x, y + 4, 5, 1, k); }
  function snowflakes(c, f, k = "white", seed = 0) {
    for (let i = 0; i < 14; i++) {
      const x = (i * 23 + seed * 7) % VW, y = ((i * 13 + seed * 5) + f * 2) % VH;
      px(c, x, y, k);
    }
  }

  // ---------- Characters ----------
  // Mira the mouse, facing right. Built in outlined layers so head, ear and body read separately.
  function mouse(o = {}) {
    const b = Buf(26, 20);
    const lift = o.walk && o.f ? 1 : 0;
    const up = o.up ? 1 : 0;
    const hx = 17, hy = 8 - up;
    // body
    b.layer((t) => { t.blob(10, 13, 6, 4, "mo", "moD"); t.ell(11, 15, 3, 1, "moL"); });
    // feet
    b.layer((t) => { t.rect(7, 17, 2, 1, "pinkD"); t.rect(13, 17 - lift, 2, 1, "pinkD"); });
    // ear (behind head)
    b.layer((t) => { t.blob(hx - 3, hy - 4, 3, 3, "mo", "moD"); t.ell(hx - 3, hy - 4, 1, 1, "pink"); t.px(hx - 4, hy - 3, "pink"); });
    // head
    b.layer((t) => {
      t.blob(hx, hy, 5, 4, "mo", "moD");
      t.rect(hx + 4, hy + 1 - up, 3, 2, "mo"); t.px(hx + 6, hy + 2 - up, "moD");
    });
    // face details
    if (o.happy) b.line([[hx, hy], [hx + 1, hy - 1], [hx + 2, hy - 1], [hx + 3, hy]], "ink");
    else { b.rect(hx + 1, hy - 1 - up, 2, 2, "ink"); b.px(hx + 1, hy - 1 - up, "shine"); }
    b.px(hx + 7, hy + 1 - up, o.coldNose ? "scarf" : "pinkD");
    b.px(hx + 1, hy + 2, "pink"); b.px(hx + 2, hy + 2, "pink");
    if (o.shout) { b.rect(hx + 4, hy + 2, 2, 2, "ink"); b.px(hx + 5, hy + 3, "pinkD"); }
    // scarf
    if (o.scarf !== false) {
      const sway = o.f ? 1 : 0;
      b.layer((t) => {
        t.rect(hx - 5, hy + 3, 5, 2, "scarf"); t.px(hx - 1, hy + 4, "scarfD");
        t.rect(hx - 7 - sway, hy + 4, 2, 3, "scarf"); t.px(hx - 7 - sway, hy + 6, "scarfD");
      });
    }
    // arms raised
    if (o.arms) b.layer((t) => { t.rect(hx - 1, hy - 7, 1, 3, "mo"); t.rect(hx + 3, hy - 7, 1, 3, "mo"); });
    // tail: thin line, drawn last so it stays 1px
    const tw = o.f ? 1 : 0;
    b.line([[4, 14], [3, 14], [2, 13], [1, 12], [1, 11 - tw], [2, 10 - tw]], "pinkD");
    return b;
  }

  // Squirrel, facing left, sitting. Layered: tail, body, head.
  function squirrel(o = {}) {
    const b = Buf(22, 24);
    b.layer((t) => { t.blob(15, 13, 4, 6, "sq", "sqD"); t.blob(15, 5, 4, 4, "sq", "sqD"); t.blob(12, 2, 2, 1, "sq", "sqD"); t.px(14, 4, "sqL"); t.px(15, 10, "sqL"); });
    b.layer((t) => { t.blob(9, 17, 4, 4, "sq", "sqD"); t.ell(8, 17, 2, 3, "cream"); t.rect(7, 21, 2, 1, "sqD"); t.rect(10, 21, 2, 1, "sqD"); });
    b.layer((t) => { t.line([[9, 5], [9, 4], [10, 3]], "sq"); });
    b.layer((t) => {
      t.blob(7, 10, 4, 4, "sq", "sqD");
      t.rect(2, 11, 3, 2, "sq"); t.px(2, 12, "sqD");
      t.ell(6, 13, 2, 0, "cream");
    });
    b.rect(5, 9, 2, 2, "ink"); b.px(5, 9, "shine"); b.px(1, 11, "ink");
    if (o.point) b.layer((t) => t.line([[6, 16], [5, 15], [4, 15 - (o.f ? 1 : 0)], [3, 14 - (o.f ? 1 : 0)]], "sq"));
    else b.layer((t) => t.rect(6, 15, 2, 1, "sq"));
    return b;
  }

  // Fir tree with a side branch to sit on. ~26x37.
  function fir(snowy = true) {
    const b = Buf(28, 38);
    b.rect(12, 31, 4, 7, "trunk"); b.px(13, 33, "earthD");
    [[14, 6, 4, 4], [14, 13, 7, 4], [14, 20, 9, 5], [14, 27, 12, 5]].forEach(([cx, cy, rx, ry]) => {
      b.layer((t) => { t.blob(cx, cy, rx, ry, "fir", "firD"); if (snowy) t.ell(cx - 1, cy - ry + 1, Math.max(1, rx - 2), 0, "snow"); }, "firD");
    });
    b.px(14, 1, "fir"); b.px(14, 2, "fir");
    return b;
  }


  // Hugo the hare, facing right.
  function hare(o = {}) {
    const b = Buf(28, 26);
    const hop = o.hop && o.f ? 1 : 0;
    const hx = 19, hy = 13 - hop;
    b.layer((t) => t.blob(4, 16 - hop, 2, 2, "white", "snowD"));
    b.layer((t) => { t.blob(11, 17 - hop, 7, 4, "ha", "haD"); t.ell(13, 19 - hop, 3, 1, "haL"); });
    b.layer((t) => { t.rect(6, 22 - hop * 2, 5, 1, "haD"); t.rect(14 + hop, 22 - hop, 2, 1, "haD"); });
    // ears
    const ears = o.ears === "listen" ? [[hx - 3, hy - 8, 0], [hx + 1, hy - 9, 0]] : [[hx - 3, hy - 8, 0], [hx - 1, hy - 9, 0]];
    ears.forEach(([x, y]) => b.layer((t) => { t.blob(x, y, 1, 5, "ha", "haD"); t.rect(x, y - 3, 1, 6, "pink"); }));
    b.layer((t) => { t.blob(hx, hy, 5, 4, "ha", "haD"); t.rect(hx + 4, hy + 1, 2, 2, "ha"); t.ell(hx + 3, hy + 2, 1, 1, "haL"); });
    if (o.happy) b.line([[hx, hy - 1], [hx + 1, hy - 2], [hx + 2, hy - 2], [hx + 3, hy - 1]], "ink");
    else if (o.sad) { b.rect(hx + 1, hy - 1, 2, 2, "ink"); b.px(hx + 1, hy - 1, "shine"); b.line([[hx, hy - 3], [hx + 1, hy - 3]], "ink"); }
    else { b.rect(hx + 1, hy - 2, 2, 2, "ink"); b.px(hx + 1, hy - 2, "shine"); }
    b.px(hx + 6, hy + 1, "pinkD"); b.px(hx + 1, hy + 1, "pink"); b.px(hx + 2, hy + 1, "pink");
    if (o.sing) { b.rect(hx + 4, hy + 3, 2, 1, "ink"); }
    return b;
  }

  // Pip, a little blue tit, facing left.
  function tit(o = {}) {
    const b = Buf(14, 13);
    b.layer((t) => { t.rect(10, 6, 3, 2, "tit"); t.px(12, 7, "titD"); });
    b.layer((t) => { t.blob(7, 7, 4, 3, "titY", "titYD"); });
    b.layer((t) => { t.blob(8, 7, 2, 2, "tit", "titD"); });
    b.layer((t) => { t.blob(5, 4, 3, 3, "white", "snowD"); t.rect(3, 1, 5, 2, "tit"); t.px(8, 3, "tit"); });
    b.px(1, 4, "beak"); b.px(2, 4, "beak");
    if (o.sad) b.line([[3, 5], [4, 5]], "ink"); else { b.rect(3, 4, 1, 2, "ink"); }
    b.px(3, 3, "titD"); b.px(4, 3, "titD");
    if (o.sing) { b.px(1, 5, "beak"); b.px(2, 5, "ink"); }
    b.line([[6, 11], [8, 11]], "beak");
    return b;
  }

  // Woodpecker clinging to a trunk, facing left.
  function woodpecker(o = {}) {
    const b = Buf(14, 18);
    b.layer((t) => { t.rect(9, 12, 2, 4, "wpD"); });
    b.layer((t) => { t.blob(8, 9, 3, 5, "wp", "wpD"); t.rect(7, 8, 1, 3, "white"); t.rect(9, 10, 1, 2, "white"); });
    b.layer((t) => { t.blob(6, 4, 3, 3, "wp", "wpD"); t.rect(4, 1, 4, 2, "wpR"); t.ell(5, 5, 1, 1, "white"); });
    const peck = o.f ? 1 : 0;
    b.rect(0 + peck, 4, 3, 1, "stl"); b.px(0 + peck, 4, "rockD");
    b.px(5, 4, "ink");
    b.rect(10, 14, 2, 1, "beak");
    return b;
  }

  function bee() {
    const b = Buf(12, 10);
    b.layer((t) => { t.blob(6, 6, 4, 2, "bee", "beeD"); t.rect(5, 4, 1, 5, "ink"); t.rect(8, 4, 1, 5, "ink"); });
    b.layer((t) => { t.rect(5, 1, 2, 2, "white"); t.rect(8, 1, 2, 2, "white"); });
    b.px(3, 5, "ink"); b.px(3, 6, "shine");
    return b;
  }

  // Ruben the fox cub, facing right.
  function fox(o = {}) {
    const b = Buf(30, 24);
    const hx = 21, hy = o.up ? 9 : 10;
    if (o.sleep) {
      b.layer((t) => { t.blob(14, 16, 9, 5, "sq", "sqD"); t.ell(14, 19, 6, 1, "sqL"); });
      b.layer((t) => { t.blob(10, 18, 6, 3, "sq", "sqD"); t.ell(5, 18, 2, 2, "cream"); });
      b.layer((t) => { t.blob(20, 14, 4, 3, "sq", "sqD"); t.rect(23, 15, 3, 2, "cream"); t.rect(17, 10, 2, 2, "sq"); t.rect(21, 10, 2, 2, "sq"); });
      b.line([[19, 14], [20, 14]], "ink"); b.px(26, 15, "ink");
      return b;
    }
    // tail with white tip
    const sw = o.f ? 1 : 0;
    b.layer((t) => { t.blob(6, 13 - sw, 5, 3, "sq", "sqD"); t.ell(2, 12 - sw, 2, 2, "cream"); });
    // body
    b.layer((t) => { t.blob(13, 15, 6, 4, "sq", "sqD"); t.ell(17, 15, 2, 3, "cream"); });
    // legs (dark socks)
    b.layer((t) => { t.rect(9, 19, 2, 2, "ink"); t.rect(16, 19, 2, 2, "ink"); });
    // ears
    b.layer((t) => { t.rect(hx - 3, hy - 6, 2, 3, "sq"); t.px(hx - 3, hy - 7, "sq"); t.px(hx - 2, hy - 5, "inkSoft"); t.rect(hx + 1, hy - 6, 2, 3, "sq"); t.px(hx + 2, hy - 7, "sq"); t.px(hx + 1, hy - 5, "inkSoft"); });
    // head + snout
    b.layer((t) => { t.blob(hx, hy, 5, 4, "sq", "sqD"); t.rect(hx + 3, hy + 1, 4, 2, "cream"); t.rect(hx - 2, hy + 2, 3, 2, "cream"); });
    b.px(hx + 7, hy + 1, "ink");
    if (o.happy) b.line([[hx, hy - 1], [hx + 1, hy - 2], [hx + 2, hy - 1]], "ink");
    else if (o.scared) { b.rect(hx, hy - 2, 3, 3, "white"); b.px(hx + 1, hy - 1, "ink"); }
    else { b.rect(hx + 1, hy - 2 - (o.up ? 1 : 0), 2, 2, "ink"); b.px(hx + 1, hy - 2 - (o.up ? 1 : 0), "shine"); }
    if (o.yawn) b.rect(hx + 4, hy + 2, 2, 2, "ink");
    if (o.stick) b.layer((t) => t.line([[19, 16], [20, 16], [21, 16], [22, 17], [23, 17], [24, 17], [25, 18], [26, 18], [27, 18], [28, 19], [29, 19]], "bark"));
    return b;
  }

  function frog(o = {}) {
    const b = Buf(18, 13);
    b.layer((t) => { t.blob(9, 8, 6, 3, "frog", "frogD"); t.ell(9, 9, 3, 1, "frogL"); });
    b.layer((t) => t.blob(5, 4, 2, 2, "frog", "frogD"));
    b.layer((t) => t.blob(12, 4, 2, 2, "frog", "frogD"));
    b.rect(5, 3, 1, 2, "ink"); b.rect(12, 3, 1, 2, "ink"); b.px(5, 3, "shine"); b.px(12, 3, "shine");
    if (o.shh) { b.rect(8, 8, 1, 1, "ink"); b.rect(8, 6, 1, 3, "frogD"); } else b.line([[6, 8], [7, 9], [8, 9], [9, 9], [10, 9], [11, 8]], "ink");
    b.px(6, 7, "pink"); b.px(12, 7, "pink");
    return b;
  }

  function moonFace(c, cx, cy, r, f, sleepy) {
    ell(c, cx, cy, r + 1, r + 1, "moonD"); ell(c, cx - 1, cy - 1, r, r, "moon");
    ell(c, cx - 3, cy - 3, 1, 1, "moonL");
    px(c, cx + 3, cy - 4, "moonD"); px(c, cx - 4, cy + 3, "moonD");
    if (sleepy) { rect(c, cx - 4, cy - 1, 3, 1, "ink"); rect(c, cx + 1, cy - 1, 3, 1, "ink"); }
    else { rect(c, cx - 3, cy - 2, 2, 2, "ink"); rect(c, cx + 2, cy - 2, 2, 2, "ink"); }
    rect(c, cx - 1, cy + 2, 3, 1, "ink"); px(c, cx - 2, cy + 1, "ink"); px(c, cx + 2, cy + 1, "ink");
    px(c, cx - 5, cy + 1, "pink"); px(c, cx + 4, cy + 1, "pink");
  }

  function roundTree(c, x, y, r) {
    rect(c, x - 1, y + r - 1, 3, 14, "bark"); rect(c, x + 1, y + r - 1, 1, 14, "barkD");
    ell(c, x, y, r + 1, r, "leafyD"); ell(c, x - 1, y - 1, r, r - 1, "leafy"); ell(c, x - 3, y - 3, 2, 1, "leafyL");
  }
  function meadow(c, f, y = 28) {
    rect(c, 0, y, VW, VH - y, "grass");
    for (let i = 0; i < 10; i++) px(c, (i * 13 + 4) % VW, y + 2 + (i * 3) % 6, "grassD");
  }
  function lakeScene(c, f, calm = true) {
    rect(c, 0, 0, VW, VH, "nightA"); rect(c, 0, 12, VW, 8, "nightB");
    [[5, 3], [16, 7], [29, 2], [47, 5], [55, 10], [38, 9]].forEach(([x, y], i) => { px(c, x, y, "star"); if ((i + f) % 3 === 0) { px(c, x - 1, y, "star"); px(c, x + 1, y, "star"); } });
    ell(c, 30, 20, 40, 4, "nightGrass");
    rect(c, 0, 20, VW, 5, "lake");
    rect(c, 0, 25, VW, 12, "lake");
    if (calm) for (let i = 0; i < 6; i++) rect(c, (i * 11 + (f ? 2 : 0)) % VW, 23 + (i * 3) % 10, 4, 1, "lakeL");
  }

  // Smiling sun, peeking. r = radius.
  function sunFace(c, cx, cy, r, f, sleepy) {
    // rays
    const rays = 8;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2 + (f ? 0.2 : 0);
      for (let k = r + 2; k <= r + 4; k++) px(c, Math.round(cx + Math.cos(a) * k), Math.round(cy + Math.sin(a) * k), "sun");
    }
    ell(c, cx, cy, r + 1, r + 1, "sunD");
    ell(c, cx - 1, cy - 1, r, r, "sun");
    ell(c, cx - 3, cy - 3, 2, 1, "sunL");
    // face
    if (sleepy) { rect(c, cx - 4, cy - 1, 3, 1, "ink"); rect(c, cx + 2, cy - 1, 3, 1, "ink"); }
    else { rect(c, cx - 4, cy - 2, 2, 2, "ink"); rect(c, cx + 2, cy - 2, 2, 2, "ink"); px(c, cx - 4, cy - 2, "shine"); px(c, cx + 2, cy - 2, "shine"); }
    px(c, cx - 2, cy + 2, "ink"); rect(c, cx - 1, cy + 3, 3, 1, "ink"); px(c, cx + 2, cy + 2, "ink");
    px(c, cx - 5, cy + 1, "sunO"); px(c, cx + 5, cy + 1, "sunO");
  }

  function snowdrop(c, x, y, f, k = "flowerW") {
    const s = f ? 1 : 0;
    rect(c, x, y, 1, 4, "leaf"); px(c, x - 1, y + 2, "leaf");
    px(c, x + s, y - 1, k); px(c, x - 1 + s, y, k); px(c, x + 1 + s, y, k); px(c, x + s, y, "flowerY");
  }

  // ---------- Backgrounds ----------
  function snowGround(c, y, k = "snow", kd = "snowD") {
    rect(c, 0, y, VW, VH - y, k);
    for (let i = 0; i < 8; i++) rect(c, (i * 17 + 3) % VW, y + 3 + (i * 5) % (VH - y - 2), 3, 1, kd);
  }
  function hill(c, cx, cy, rx, ry, k, kd) { ell(c, cx, cy, rx, ry, kd); ell(c, cx - 1, cy - 1, rx, ry, k); }

  // ---------- Scenes ----------
  const bob = (f) => (f ? 1 : 0);
  const SCENES = {
    // 1. Mira at home in her warm nest under the snow
    mira1(c, f) {
      rect(c, 0, 0, VW, VH, "earth");
      rect(c, 0, 0, VW, 4, "skyW");
      rect(c, 0, 4, VW, 6, "snow");
      for (let x = 0; x < VW; x += 6) ell(c, x + 3, 9, 4, 1, "snow");
      rect(c, 0, 11, VW, 1, "earthD");
      // pebbles + roots
      [[4, 16], [52, 14], [8, 31], [55, 30], [48, 34]].forEach(([x, y]) => { rect(c, x, y, 2, 1, "earthL"); });
      [[20, 12], [21, 13], [21, 14], [40, 12], [39, 13]].forEach(([x, y]) => px(c, x, y, "earthD"));
      // round den
      ell(c, 30, 25, 20, 10, "earthD");
      ell(c, 30, 26, 19, 9, "#8a5c40");
      // nest
      ell(c, 30, 32, 14, 3, "strawD");
      ell(c, 30, 31, 13, 3, "straw");
      for (let i = 0; i < 7; i++) px(c, 19 + i * 4, 30 + (i % 2), "strawD");
      stamp(c, mouse({ happy: true, f, scarf: false }), 17, 13 + bob(f));
      // a little hanging berry lantern
      rect(c, 49, 12, 1, 5, "earthD"); ell(c, 49, 19, 2, 2, "sunD"); px(c, 49, 18, "sunL");
      if (f) { px(c, 46, 19, "sunD"); px(c, 52, 19, "sunD"); }
    },
    // 2. Peeking out: grey winter, no sun
    mira2(c, f) {
      rect(c, 0, 0, VW, VH, "skyW");
      rect(c, 0, 0, VW, 8, "skyW2");
      hill(c, 12, 30, 22, 8, "snow", "snowD");
      hill(c, 50, 31, 20, 7, "snow", "snowD");
      snowGround(c, 28);
      // hole in snow
      ell(c, 27, 31, 10, 3, "snowB"); ell(c, 27, 32, 9, 2, "earthD");
      stamp(c, mouse({ up: true, scarf: false, f }), 13, 19 - bob(f));
      rect(c, 10, 31, 30, 6, "snow"); ell(c, 26, 31, 10, 1, "snowD");
      // question mark
      const q = [[1, 0], [2, 0], [3, 0], [0, 1], [4, 1], [3, 2], [2, 3], [2, 5]];
      q.forEach(([i, j]) => px(c, 44 + i, 6 + j - bob(f), "ink"));
      snowflakes(c, f, "white", 1);
    },
    // 3. Mira sets off with her red scarf
    mira3(c, f) {
      rect(c, 0, 0, VW, VH, "skyW2");
      hill(c, 48, 27, 26, 9, "snow", "snowD");
      snowGround(c, 27);
      // footprints behind
      [[4, 31], [9, 32], [14, 31]].forEach(([x, y]) => { rect(c, x, y, 2, 1, "snowB"); });
      // her door
      ell(c, 6, 27, 6, 3, "snowD"); ell(c, 6, 28, 4, 2, "earthD");
      shadow(c, 31, 32, 9, "snowD");
      stamp(c, mouse({ walk: true, f, coldNose: true }), 18, 15 - bob(f));
      snowflakes(c, f, "white", 2);
    },
    // 4. The squirrel in the fir tree points the way
    mira4(c, f) {
      rect(c, 0, 0, VW, VH, "skyW");
      // far mountain
      ell(c, 12, 30, 16, 14, "snowD"); ell(c, 11, 29, 14, 13, "skyW2");
      for (let i = 0; i < 5; i++) rect(c, 6 + i, 18 + i, 12 - i * 2, 1, "snow");
      snowGround(c, 29);
      stamp(c, fir(true), 38, 0);
      // branch reaching out to the left
      rect(c, 30, 23, 14, 2, "trunk"); rect(c, 30, 23, 14, 1, "#8a5e40"); rect(c, 31, 22, 9, 1, "snow");
      px(c, 29, 23, "ink"); px(c, 29, 24, "ink"); rect(c, 30, 25, 14, 1, "ink");
      stamp(c, squirrel({ point: true, f }), 24, 1);
      shadow(c, 14, 33, 8, "snowD");
      stamp(c, mouse({ up: true, f: 0 }), -1, 16);
      // speech dots
      if (f) { px(c, 31, 6, "ink"); px(c, 29, 7, "ink"); px(c, 27, 8, "ink"); }
    },
    // 5. Deep snow, little legs
    mira5(c, f) {
      rect(c, 0, 0, VW, VH, "skyW2");
      // mountain ahead
      ell(c, 46, 34, 22, 20, "snowD"); ell(c, 45, 33, 20, 19, "snow");
      rect(c, 40, 16, 10, 1, "snowB"); rect(c, 42, 18, 3, 1, "snowB");
      snowGround(c, 28);
      // mira half-buried in a drift
      stamp(c, mouse({ walk: true, f, coldNose: true }), 5, 14 + bob(f));
      hill(c, 18, 34, 14, 5, "snow", "snowD");
      // effort puffs
      if (f) { px(c, 30, 18, "white"); px(c, 31, 17, "white"); px(c, 33, 18, "white"); }
      snowflakes(c, f, "white", 3);
    },
    // 6. On the top: "Hallå, solen! Vakna!"
    mira6(c, f) {
      rect(c, 0, 0, VW, VH, "dawn");
      rect(c, 0, 22, VW, 15, "dawn2");
      // peak
      ell(c, 22, 44, 26, 18, "snowD"); ell(c, 21, 43, 25, 17, "snow");
      shadow(c, 20, 27, 6, "snowD");
      stamp(c, mouse({ up: true, shout: true, f }), 7, 9 - bob(f));
      // shout lines
      const s = f ? 1 : 0;
      rect(c, 33 + s, 8, 3, 1, "ink"); rect(c, 34 + s, 12, 4, 1, "ink"); rect(c, 33 + s, 16, 3, 1, "ink");
      // far peaks
      ell(c, 52, 40, 12, 10, "snowD");
    },
    // 7. The sun slowly rises and warms her nose
    mira7(c, f) {
      rect(c, 0, 0, VW, VH, "sunO");
      rect(c, 0, 0, VW, 10, "dawn2");
      sunFace(c, 42, 24 - bob(f), 9, f);
      ell(c, 22, 44, 26, 18, "snowD"); ell(c, 21, 43, 25, 17, "snow");
      ell(c, 55, 41, 12, 9, "snowD");
      shadow(c, 18, 27, 6, "snowD");
      stamp(c, mouse({ happy: true, f, coldNose: true }), 5, 9);
      heartOutline(c, 30, 6 - bob(f), "white");
    },
    // 8. Snow melts, flowers peek out. Spring!
    mira8(c, f) {
      rect(c, 0, 0, VW, VH, "spring");
      sunFace(c, 52, 7, 5, f);
      hill(c, 44, 30, 26, 8, "grass", "grassD");
      rect(c, 0, 28, VW, 9, "grass");
      for (let i = 0; i < 10; i++) px(c, (i * 13 + 4) % VW, 30 + (i * 3) % 6, "grassL");
      // last bits of snow
      ell(c, 6, 33, 5, 1, "snow"); ell(c, 54, 34, 4, 1, "snow");
      [[30, 27], [36, 28], [42, 26], [48, 28], [12, 28]].forEach(([x, y], i) => snowdrop(c, x, y, (f + i) % 2, i % 2 ? "flowerW" : "flowerP"));
      shadow(c, 19, 33, 8, "grassD");
      stamp(c, mouse({ happy: true, f, scarf: true }), 5, 16 + bob(f));
      heart(c, 30, 12 - bob(f)); heart(c, 38, 17 + bob(f), "flowerP");
    },

    // ---- Hugo ----
    hugo1(c, f) {
      rect(c, 0, 0, VW, VH, "morn"); rect(c, 0, 18, VW, 10, "morn2");
      roundTree(c, 8, 12, 7); roundTree(c, 52, 10, 8);
      meadow(c, f);
      shadow(c, 26, 32, 8, "grassD");
      stamp(c, hare({ ears: "listen", f }), 11, 9);
      if (f) { px(c, 36, 2, "ink"); px(c, 37, 3, "ink"); px(c, 38, 2, "ink"); } else { px(c, 36, 4, "ink"); px(c, 37, 3, "ink"); }
      snowdrop(c, 46, 29, f, "flowerP"); snowdrop(c, 6, 30, 1 - f, "flowerY");
    },
    hugo2(c, f) {
      rect(c, 0, 0, VW, VH, "morn2");
      roundTree(c, 44, 8, 9);
      rect(c, 26, 15, 18, 2, "bark"); rect(c, 26, 16, 18, 1, "barkD");
      meadow(c, f, 30);
      stamp(c, tit({ sad: true }), 28, 3 + bob(f));
      // empty speech bubble
      ell(c, 21, 6, 5, 3, "white"); px(c, 25, 9, "white");
      [[18, 6], [21, 6], [24, 6]].forEach(([x, y]) => px(c, x, y, "inkSoft"));
      shadow(c, 13, 34, 7, "grassD");
      stamp(c, hare({ sad: true, ears: "listen" }), -1, 11);
    },
    hugo3(c, f) {
      rect(c, 0, 0, VW, VH, "morn");
      roundTree(c, 50, 11, 7);
      meadow(c, f);
      shadow(c, 26, 33, f ? 6 : 8, "grassD");
      stamp(c, hare({ hop: true, f, happy: true }), 12, 8 - bob(f) * 3);
      rect(c, 4, 16, 5, 1, "inkSoft"); rect(c, 2, 20, 6, 1, "inkSoft");
    },
    hugo4(c, f) {
      rect(c, 0, 0, VW, VH, "morn");
      // big trunk
      rect(c, 42, 0, 10, VH, "bark"); rect(c, 49, 0, 3, VH, "barkD"); rect(c, 44, 8, 1, 4, "barkD"); rect(c, 46, 22, 1, 3, "barkD");
      meadow(c, f, 30);
      rect(c, 42, 30, 10, 7, "bark");
      stamp(c, woodpecker({ f }), 41, 6);
      if (f) { rect(c, 36, 6, 2, 1, "ink"); rect(c, 35, 9, 3, 1, "ink"); }
      shadow(c, 16, 34, 8, "grassD");
      stamp(c, hare({ ears: "listen" }), 2, 11);
    },
    hugo5(c, f) {
      rect(c, 0, 0, VW, VH, "morn");
      meadow(c, f, 28);
      [[34, 26], [40, 28], [47, 25], [53, 27]].forEach(([x, y], i) => snowdrop(c, x, y, (f + i) % 2, i % 2 ? "flowerY" : "flowerP"));
      // dotted flight path
      [[30, 14], [33, 11], [37, 10], [41, 12], [43, 16]].forEach(([x, y]) => px(c, x, y, "inkSoft"));
      stamp(c, bee(), 43 + bob(f), 15 - bob(f));
      if (f) { px(c, 54, 14, "ink"); px(c, 55, 13, "ink"); px(c, 56, 14, "ink"); }
      shadow(c, 15, 33, 8, "grassD");
      stamp(c, hare({ ears: "listen" }), 0, 10);
    },
    hugo6(c, f) {
      rect(c, 0, 0, VW, VH, "morn"); rect(c, 0, 20, VW, 8, "morn2");
      roundTree(c, 50, 10, 8);
      meadow(c, f);
      shadow(c, 22, 32, 8, "grassD");
      stamp(c, hare({ happy: true, sing: true, f }), 7, 9);
      note(c, 33, 8 - bob(f)); note(c, 39, 4 + bob(f), "inkSoft");
    },
    hugo7(c, f) {
      rect(c, 0, 0, VW, VH, "morn");
      roundTree(c, 46, 7, 8);
      rect(c, 30, 15, 16, 2, "bark"); rect(c, 30, 16, 16, 1, "barkD");
      meadow(c, f);
      stamp(c, tit({ sing: true }), 32, 3 - bob(f));
      note(c, 26, 3 + bob(f), "titD"); note(c, 21, 8 - bob(f), "titD");
      shadow(c, 13, 32, 7, "grassD");
      stamp(c, hare({ happy: true, sing: true, ears: "listen" }), -1, 9);
    },
    hugo8(c, f) {
      rect(c, 0, 0, VW, VH, "spring");
      sunFace(c, 50, 7, 5, f);
      roundTree(c, 8, 10, 7);
      meadow(c, f);
      [[38, 29], [44, 27], [52, 30]].forEach(([x, y], i) => snowdrop(c, x, y, (f + i) % 2, i % 2 ? "flowerY" : "flowerP"));
      shadow(c, 26, 33, 8, "grassD");
      stamp(c, hare({ happy: true, sing: true, f }), 12, 10);
      stamp(c, tit({ sing: true }), 11, 0 + bob(f));
      note(c, 38, 10 - bob(f)); note(c, 2, 16 + bob(f), "titD"); note(c, 44, 16 + bob(f), "titD");
    },

    // ---- Ruben ----
    ruben1(c, f) {
      lakeScene(c, f);
      rect(c, 0, 26, VW, 11, "nightGrass"); ell(c, 30, 26, 34, 2, "nightGrass");
      for (let i = 0; i < 8; i++) px(c, (i * 9 + 3) % VW, 29 + (i * 3) % 7, "nightGrassD");
      shadow(c, 27, 33, 10, "nightGrassD");
      stamp(c, fox({ f }), 12, 12);
      px(c, 46, 14 + bob(f), "firefly"); px(c, 52, 21 - bob(f), "firefly"); px(c, 6, 9 + bob(f), "firefly");
    },
    ruben2(c, f) {
      lakeScene(c, f);
      // moon reflection
      ell(c, 42, 30, 5, 2, "moonD"); ell(c, 42, 29, 4, 1, "moon");
      rect(c, 0, 26, 22, 11, "nightGrass"); ell(c, 10, 26, 13, 2, "nightGrass");
      stamp(c, fox({ scared: true }), -6, 12);
      rect(c, 30, 8 - bob(f), 1, 4, "white"); px(c, 30, 13 - bob(f), "white"); rect(c, 33, 7 - bob(f), 1, 4, "white"); px(c, 33, 12 - bob(f), "white");
    },
    ruben3(c, f) {
      lakeScene(c, f);
      ell(c, 48, 30, 5, 2, "moonD"); ell(c, 48, 29, 4, 1, "moon");
      rect(c, 0, 26, 30, 11, "nightGrass"); ell(c, 15, 26, 16, 2, "nightGrass");
      shadow(c, 17, 33, 10, "nightGrassD");
      stamp(c, fox({ stick: true, f }), 2, 12);
    },
    ruben4(c, f) {
      lakeScene(c, f, false);
      // broken reflection
      [[40, 28], [46, 31], [51, 27], [44, 25], [53, 32]].forEach(([x, y], i) => rect(c, x + (f && i % 2 ? 1 : 0), y, 3, 1, i % 2 ? "moonD" : "moon"));
      ell(c, 47, 29, 11, 4, "lakeL"); ell(c, 47, 29, 10, 3, "lake");
      [[40, 28], [46, 31], [51, 27], [44, 26], [53, 31]].forEach(([x, y], i) => rect(c, x + (f && i % 2 ? 1 : 0), y, 3, 1, i % 2 ? "moonD" : "moon"));
      if (f) { px(c, 38, 22, "white"); px(c, 56, 23, "white"); px(c, 47, 20, "white"); }
      rect(c, 0, 26, 28, 11, "nightGrass"); ell(c, 14, 26, 15, 2, "nightGrass");
      stamp(c, fox({ scared: true, f }), -2, 12);
      line(c, [[28, 22], [31, 24], [34, 26]], "bark");
    },
    ruben5(c, f) {
      lakeScene(c, f);
      ell(c, 42, 31, 8, 2, "padD"); ell(c, 42, 30, 7, 2, "pad"); px(c, 46, 30, "lake"); px(c, 47, 30, "lake");
      stamp(c, frog({ shh: true }), 33, 19 + bob(f));
      rect(c, 0, 26, 24, 11, "nightGrass"); ell(c, 10, 26, 13, 2, "nightGrass");
      stamp(c, fox({}), -7, 12);
    },
    ruben6(c, f) {
      lakeScene(c, f);
      ell(c, 42, 30, 6, 3, "moonD"); ell(c, 42, 29, 5, 2, "moon"); px(c, 40, 28, "moonL");
      ell(c, 26, 33, 6, 1, "padD"); ell(c, 26, 32, 5, 1, "pad");
      stamp(c, frog({}), 17, 21);
      rect(c, 0, 26, 14, 11, "nightGrass");
      stamp(c, fox({ happy: true }), -12, 12);
    },
    ruben7(c, f) {
      lakeScene(c, f);
      moonFace(c, 44, 8, 6, f);
      ell(c, 44, 31, 4, 1, "moonD"); ell(c, 44, 30, 3, 1, "moon");
      rect(c, 0, 26, 30, 11, "nightGrass"); ell(c, 15, 26, 16, 2, "nightGrass");
      shadow(c, 16, 33, 10, "nightGrassD");
      stamp(c, fox({ up: true, f }), 1, 12);
      stamp(c, frog({}), 22, 23);
    },
    ruben8(c, f) {
      rect(c, 0, 0, VW, VH, "nightA"); rect(c, 0, 14, VW, 10, "nightB");
      [[6, 4], [14, 9], [24, 3], [34, 8], [56, 14]].forEach(([x, y], i) => { px(c, x, y, "star"); if ((i + f) % 2) { px(c, x, y - 1, "star"); px(c, x, y + 1, "star"); } });
      moonFace(c, 47, 9, 6, f, true);
      rect(c, 0, 26, VW, 11, "nightGrass"); ell(c, 30, 26, 34, 3, "nightGrass");
      shadow(c, 22, 33, 11, "nightGrassD");
      stamp(c, fox({ sleep: true }), 6, 12);
      zee(c, 30, 18 - bob(f)); zee(c, 37, 12 + bob(f));
    },

    end(c, f) {
      rect(c, 0, 0, VW, VH, "dawn");
      rect(c, 0, 28, VW, 9, "grass");
      const id = (window.__endStory || "mira");
      shadow(c, 24, 33, 9, "grassD");
      if (id === "hugo") { stamp(c, hare({ happy: true, f }), 10, 9 + bob(f)); stamp(c, tit({ sing: true }), 34, 4 - bob(f)); }
      else if (id === "ruben") { stamp(c, fox({ happy: true, f }), 6, 12 + bob(f)); stamp(c, frog({}), 38, 22); }
      else stamp(c, mouse({ happy: true, f }), 11, 16 + bob(f));
      heart(c, 36, 10 - bob(f)); heart(c, 44, 15 + bob(f), "flowerP"); heart(c, 28, 4 + bob(f), "sunD");
    },
  };

  // 20x16 menu thumbnails
  function thumbFrom(c, buf, sx, sy, bg, ground, gy) {
    rect(c, 0, 0, 20, 16, bg); rect(c, 0, gy, 20, 16 - gy, ground);
    const o = document.createElement("canvas"); o.width = buf.w; o.height = buf.h;
    stamp(o.getContext("2d"), buf, 0, 0);
    c.imageSmoothingEnabled = false; c.drawImage(o, sx, sy, 20, 16, 0, 0, 20, 16);
  }
  const THUMBS = {
    hugo(c) { thumbFrom(c, hare({}), 9, 2, "morn", "grass", 13); },
    ruben(c) { thumbFrom(c, fox({}), 11, 2, "nightA", "nightGrass", 13); },
    mira(c) {
      rect(c, 0, 0, 20, 16, "skyW"); rect(c, 0, 12, 20, 4, "snow");
      const m = mouse({ happy: false });
      // crop the head region of the mouse
      const o = document.createElement("canvas"); o.width = 26; o.height = 20;
      stamp(o.getContext("2d"), m, 0, 0);
      c.imageSmoothingEnabled = false; c.drawImage(o, 6, 1, 20, 16, 0, 0, 20, 16);
    },
  };

  let off;
  window.ART = {
    W: VW * ZOOM, H: VH * ZOOM,
    draw(canvas, scene, frame) {
      if (!off) { off = document.createElement("canvas"); off.width = VW; off.height = VH; }
      const o = off.getContext("2d");
      o.clearRect(0, 0, VW, VH);
      (SCENES[scene] || SCENES.end)(o, frame | 0);
      const c = canvas.getContext("2d");
      c.imageSmoothingEnabled = false;
      c.drawImage(off, 0, 0, VW, VH, 0, 0, VW * ZOOM, VH * ZOOM);
    },
    thumb(canvas, id) {
      const c = canvas.getContext("2d");
      (THUMBS[id] || THUMBS.mira)(c);
    },
    scenes: () => Object.keys(SCENES),
  };
})();
