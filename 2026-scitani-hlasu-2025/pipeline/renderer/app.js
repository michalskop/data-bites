// Counting of the 2025 Chamber election, one dot per precinct, 16:9 slide. Params: mode=size|ano|speed, pct=5 (share of valid votes counted) or t=minutes after 14:00
(async () => {
  const P = new URLSearchParams(location.search), MODE = P.get("mode") || "size", PCT = +(P.get("pct") || 5);
  const DT = { page: "#fdfbf7", card: "#f8f6f0", border: "#e8e8dc", ink: "#101432", text: "#333333", head: "#1a1a1a", navy: "#6267a3", midnight: "#272a59", teal: "#0e839e", orange: "#f76800", crimson: "#de1743", indigo: "#4a51ab" };
  const SANS = '"IBM Plex Sans"', SERIF = '"IBM Plex Serif"', COND = '"Roboto Condensed"';
  const W = 1920, H = 1080, L = 1170, R = 1872;
  const cv = document.getElementById("c"); cv.width = W; cv.height = H; const ctx = cv.getContext("2d");
  const D = await (await fetch("data.json")).json();
  const base = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = "base.png"; });
  await Promise.all(["400", "600", "700"].flatMap((w) => ["IBM Plex Sans", "IBM Plex Serif", "Roboto Condensed"].map((f) => document.fonts.load(`${w} 24px "${f}"`, "Aa 0123 ěščřžýáíéůúňďť ĚŠČŘŽ"))));
  const N = D.x.length, T0 = Date.UTC(2025, 9, 4, 12, 0);   // polls closed 14:00 CEST = 12:00 UTC; t = minutes after that
  const rrect = (a, b, c, d, r) => { ctx.beginPath(); ctx.roundRect(a, b, c - a, d - b, r); };
  const text = (s, x, y, f, col, al = "left", bl = "middle", tr = 0) => { ctx.font = f; ctx.fillStyle = col; ctx.textAlign = al; ctx.textBaseline = bl; ctx.letterSpacing = tr ? tr + "px" : "0px"; ctx.fillText(s, x, y); ctx.letterSpacing = "0px"; };
  const width = (s, f, tr = 0) => { ctx.font = f; ctx.letterSpacing = tr ? tr + "px" : "0px"; const w = ctx.measureText(s).width; ctx.letterSpacing = "0px"; return w; };
  const pc = (v) => Math.round(v * 100) + " %", pc1 = (v) => (v * 100).toFixed(1).replace(".", ",") + " %", cs = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const hm = (m) => { const c = new Date(T0 + m * 60000 + 2 * 3600000); return String(c.getUTCHours()).padStart(2, "0") + ":" + String(c.getUTCMinutes()).padStart(2, "0"); };

  const mark = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="112 112 276 276"><defs><linearGradient id="g" x1="1" x2="0.25" y1="0.5" y2="1"><stop offset="0%" stop-color="#ffdc33" stop-opacity="0"/><stop offset="50%" stop-color="#ffdc33" stop-opacity="0"/><stop offset="50%" stop-color="#ffdc33" stop-opacity="1"/><stop offset="100%" stop-color="#ffdc33" stop-opacity="1"/></linearGradient></defs><g transform="rotate(-30 250 250)"><path fill="none" stroke="#ffdc33" stroke-width="76" stroke-linecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300"/><path fill="none" stroke="#f76800" stroke-width="76" stroke-linecap="round" d="M 336.6025403784439 300 A 100 100 0 0 0 250 150"/><path fill="none" stroke="#de1743" stroke-width="76" stroke-linecap="round" d="M 250 150 A 100 100 0 0 0 250 350"/><path fill="none" stroke="url(#g)" stroke-width="76" stroke-linecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300"/></g></svg>`); });
  let tInit = D.t[D.cum.findIndex((c) => c >= PCT / 100)];   // time at which PCT % of the final valid votes were counted
  if (P.has("t")) tInit = +P.get("t");
  function render(tcut, popMin = 0) {
  const SPEED = MODE === "speed";
  const scale = [[0, [255, 214, 10]], [45, [247, 104, 0]], [90, [222, 23, 67]], [150, [74, 81, 171]], [300, [39, 42, 89]]];   // minutes after 14:00 -> colour
  const colAt = (m) => { for (let k = 1; k < scale.length; k++) if (m <= scale[k][0] || k === scale.length - 1) { const [m0, c0] = scale[k - 1], [m1, c1] = scale[k], f = Math.max(0, Math.min(1, (m - m0) / (m1 - m0))); return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * f)).join(",")})`; } };
  let cumNow = 0; for (let i = 0; i < N; i++) if (D.t[i] <= tcut) cumNow = Math.max(cumNow, D.cum[i]);
  const pctNow = Math.round(cumNow * 100);

  const G = SPEED ? { key: D.size, order: [1, 0, 2], colors: [DT.teal, "#8f95cf", DT.crimson], pick: [], ta: "Jak rychle", tb: " se sčítalo", sub: "Každá tečka je jeden volební okrsek, barva ukazuje čas jeho sečtení.", rows: [] }
  : MODE === "size" ? { key: D.size, order: [1, 0, 2], colors: [DT.teal, "#8f95cf", DT.crimson], pick: [0, 2], legend: ["20 % nejmenších obcí", "Praha"], other: "ostatní obce",
    ta: "Malé obce", tb: " se sečetly dřív než Praha", sub: "Každá tečka je jeden volební okrsek. Barevně ty, které jsou už sečtené.",
    rows: [[0, "20 % nejmenších obcí", `obce do ${Math.floor(D.q20)} voličů`], [2, "Praha", "všechny pražské okrsky"]] }
  : { key: D.ano, order: [1, 0, 2], colors: [DT.midnight, "#9aa0d0", DT.orange], pick: [2, 0], legend: ["nejvíc ANO (10 % okrsků)", "nejméně ANO (10 % okrsků)"], other: "ostatní okrsky",
    ta: "Okrsky s ANO", tb: " se sčítaly dřív", sub: "Každá tečka je jeden volební okrsek. Barevně ty, které jsou už sečtené.",
    rows: [[2, "10 % okrsků s nejvíc ANO", "podle konečného výsledku"], [0, "10 % okrsků s nejméně ANO", "podle konečného výsledku"]] };
  const stat = (g) => { let n = 0, c = 0; for (let i = 0; i < N; i++) if (G.key[i] === g) { n++; if (D.t[i] <= tcut) c++; } return { n, c, f: c / n }; };
  let allC = 0; for (let i = 0; i < N; i++) if (D.t[i] <= tcut) allC++;


  function drawMap(x0, y0, x1, y1) {
    const sx = (x1 - x0) / D.bw;
    ctx.fillStyle = DT.card; ctx.strokeStyle = DT.border; ctx.lineWidth = 2; rrect(x0 - 2, y0 - 2, x1 + 2, y1 + 2, 10); ctx.fill(); ctx.stroke();
    ctx.save(); rrect(x0, y0, x1, y1, 8); ctx.clip(); ctx.drawImage(base, x0, y0, x1 - x0, y1 - y0);
    ctx.fillStyle = "rgba(150,148,130,.38)"; ctx.beginPath();     // not yet counted: small pale dots so the country keeps its shape
    for (let i = 0; i < N; i++) if (D.t[i] > tcut) { const X = x0 + D.x[i] * sx, Y = y0 + D.y[i] * sx; ctx.moveTo(X + 1.3, Y); ctx.arc(X, Y, 1.3, 0, 6.2832); }
    ctx.fill();
    const dot = (idx, r, fill) => { ctx.beginPath(); ctx.fillStyle = fill; for (const i of idx) { const X = x0 + D.x[i] * sx, Y = y0 + D.y[i] * sx; ctx.moveTo(X + r, Y); ctx.arc(X, Y, r, 0, 6.2832); } ctx.fill(); };
    if (SPEED) {
      const NB = 60, buckets = Array.from({ length: NB }, () => []);
      for (let i = 0; i < N; i++) if (D.t[i] <= tcut) buckets[Math.min(NB - 1, Math.floor(D.t[i] / 300 * NB))].push(i);
      for (const pass of [0, 1]) buckets.forEach((idx, b) => dot(idx, pass ? 3.6 : 4.8, pass ? colAt((b + .5) * 300 / NB) : "rgba(253,251,247,.95)"));
    } else for (const g of G.order) {
      const idx = []; for (let i = 0; i < N; i++) if (G.key[i] === g && D.t[i] <= tcut) idx.push(i);
      const hl = G.pick.includes(g), r = hl ? 4.8 : 3.4; dot(idx, r + 1.3, "rgba(253,251,247,.95)"); dot(idx, r, G.colors[g]);
    }
    if (popMin > 0) {   // video: a ring that expands and fades around each precinct counted in the last popMin minutes
      ctx.lineWidth = 2.5; let k = D.t.findIndex((t) => t > tcut - popMin); if (k < 0) k = N;
      for (let i = k; i < N && D.t[i] <= tcut; i++) {
        const age = (tcut - D.t[i]) / popMin, X = x0 + D.x[i] * sx, Y = y0 + D.y[i] * sx;
        ctx.globalAlpha = 0.85 * (1 - age); ctx.strokeStyle = SPEED ? colAt(D.t[i]) : G.colors[G.key[i]]; ctx.beginPath(); ctx.arc(X, Y, 5 + 16 * age, 0, 6.2832); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // chart helpers
  const axes = (x0, x1, y0, y1, TM, yticks, yfmt, xstep) => {
    const X = (m) => x0 + m / TM * (x1 - x0);
    ctx.strokeStyle = DT.border; ctx.lineWidth = 1.5;
    yticks.forEach((v) => { const Y = y1 - (v - yticks[0]) / (yticks[yticks.length - 1] - yticks[0]) * (y1 - y0); ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); text(yfmt(v), x0 - 10, Y, `400 18px ${COND}`, DT.navy, "right"); });
    for (let m = 0; m <= TM; m += xstep) text(hm(m), X(m), y1 + 22, `400 18px ${COND}`, DT.navy, "center");
    return X;
  };

  ctx.fillStyle = DT.page; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = DT.card; ctx.strokeStyle = DT.border; ctx.lineWidth = 2; rrect(24, 24, W - 24, H - 24, 18); ctx.fill(); ctx.stroke();
  text("VOLBY 2025 · SČÍTÁNÍ HLASŮ", 60, 78, `600 24px ${SANS}`, DT.crimson, "left", "middle", 2.8);
  const lw = width("DataTimes.cz", `700 32px ${SANS}`), lx = R - lw - 50;
  if (mark) ctx.drawImage(mark, lx, 56, 40, 40); text("DataTimes.cz", lx + 50, 78, `700 32px ${SANS}`, DT.ink);
  const ft = `700 64px ${SANS}`, wa = width(G.ta, ft); text(G.ta, 60, 150, ft, DT.crimson); text(G.tb, 60 + wa, 150, ft, DT.head);
  text(G.sub, 60, 206, `400 27px ${SERIF}`, DT.text);

  // right column: clock, pill
  text(hm(tcut), L - 6, 200, `700 140px ${COND}`, DT.ink);
  const pf = `600 25px ${SANS}`, pt = `${pctNow} % HLASŮ SEČTENO`, pw = width(pt, pf, 1.5) + 46, px0 = L + 340;
  ctx.fillStyle = DT.crimson; rrect(px0, 200 - 19, px0 + pw, 200 + 19, 19); ctx.fill(); text(pt, px0 + pw / 2 + .75, 201, pf, "#fff", "center", "middle", 1.5);

  drawMap(60, 244, 1140, 244 + D.bh);
  const ly = 244 + D.bh + 44;     // legend row under the map
  if (SPEED) {
    const gx0 = 60, gw = 420; for (let k = 0; k < gw; k++) { ctx.fillStyle = colAt(k / (gw - 1) * 240); ctx.fillRect(gx0 + k, ly - 10, 1.4, 20); }
    [[0, "14:00"], [60, "15:00"], [120, "16:00"], [180, "17:00"], [240, "18:00+"]].forEach(([m, l], k) => text(l, gx0 + m / 240 * gw, ly + 32, `400 20px ${COND}`, DT.text, k === 0 ? "left" : k === 4 ? "right" : "center"));
    text("čas sečtení okrsku", gx0 + gw + 24, ly, `400 22px ${COND}`, DT.navy);
  } else {
    const leg = [...G.pick.map((g, k) => [G.colors[g], G.legend[k]]), [G.colors[1], G.other]]; let lx2 = 60;
    leg.forEach(([col, lab]) => { ctx.fillStyle = col; rrect(lx2, ly - 9, lx2 + 20, ly + 9, 4); ctx.fill(); text(lab, lx2 + 30, ly, `400 25px ${COND}`, DT.text); lx2 += 30 + width(lab, `400 25px ${COND}`) + 36; });
    text("světlé tečky = ještě nesečteno".replace(/.*/, ""), 0, 0, "1px x", DT.card);
  }

  // right column, upper block: bars (snapshots) or counted-precinct curves (speed)
  const TM = 420;
  if (SPEED) {
    const x0 = L + 54, x1 = R - 6, y0 = 322, y1 = 500, X = axes(x0, x1, y0, y1, TM, [0, .5, 1], (v) => Math.round(v * 100) + " %", 60);
    text("PODÍL SEČTENÝCH OKRSKŮ", L, 282, `600 19px ${COND}`, DT.text, "left", "middle", 1.6);
    const curve = (sel, col, lw) => { const idx = []; for (let i = 0; i < N; i++) if (sel(i)) idx.push(i); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X(0), y1); let c = 0;
      idx.forEach((i, k) => { if (D.t[i] <= tcut) { c = k + 1; ctx.lineTo(X(D.t[i]), y1 - c / idx.length * (y1 - y0)); } }); ctx.lineTo(X(tcut), y1 - c / idx.length * (y1 - y0)); ctx.stroke(); };
    curve((i) => D.size[i] === 1, "#8f95cf", 3); curve((i) => D.size[i] === 0, DT.teal, 4); curve((i) => D.size[i] === 2, DT.crimson, 4);
    let lx3 = L + 300; [[DT.teal, "20 % nejmenších obcí"], [DT.crimson, "Praha"], ["#8f95cf", "ostatní"]].forEach(([c, l]) => { ctx.fillStyle = c; rrect(lx3, 273, lx3 + 16, 289, 4); ctx.fill(); text(l, lx3 + 24, 281, `400 20px ${COND}`, DT.text); lx3 += 40 + width(l, `400 20px ${COND}`) + 14; });
    ctx.strokeStyle = DT.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(tcut), y0); ctx.lineTo(X(tcut), y1); ctx.stroke();
  } else {
    const rows = G.rows.map(([g, lab, sub]) => ({ ...stat(g), lab, sub, col: G.colors[g] })).concat([{ n: N, c: allC, f: allC / N, lab: "všechny okrsky", sub: "celá ČR bez zahraničí", col: "#9a9a8c" }]);
    text("PODÍL OKRSKŮ, KTERÉ JSOU SEČTENÉ", L, 282, `600 19px ${COND}`, DT.text, "left", "middle", 1.6);
    rows.forEach((r, k) => {
      const yy = 326 + k * 80;
      text(r.lab, L, yy, `600 27px ${COND}`, DT.ink); text(r.sub, L + width(r.lab, `600 27px ${COND}`) + 14, yy + 2, `400 19px ${COND}`, DT.navy);
      text(pc(r.f), R, yy + 2, `700 44px ${COND}`, r.col === "#9a9a8c" ? DT.midnight : r.col, "right");
      ctx.fillStyle = "#ece8de"; rrect(L, yy + 24, R - 120, yy + 42, 9); ctx.fill();
      ctx.fillStyle = r.col; rrect(L, yy + 24, L + Math.max(18, (R - 120 - L) * r.f), yy + 42, 9); ctx.fill();
      text(`${cs(r.c)} z ${cs(r.n)}`, R, yy + 36, `400 17px ${COND}`, DT.navy, "right");
    });
  }

  // right column, lower block: ANO support over time (result so far, and the latest ten minutes)
  {
    const x0 = L + 54, x1 = R - 6, y0 = 640, y1 = 930, lo = .1, hi = .5, Y = (v) => y1 - (v - lo) / (hi - lo) * (y1 - y0);
    text("PODPORA ANO V ČASE SČÍTÁNÍ", L, 596, `600 19px ${COND}`, DT.text, "left", "middle", 1.6);
    const X = axes(x0, x1, y0, y1, TM, [.1, .2, .3, .4, .5], (v) => Math.round(v * 100) + " %", 60);
    const Av = new Float64Array(TM + 1), Vv = new Float64Array(TM + 1); let fa = 0, fv = 0;
    for (let i = 0; i < N; i++) { fa += D.av[i]; fv += D.v[i]; if (D.t[i] <= tcut) { const m = Math.min(TM, Math.floor(D.t[i])); Av[m] += D.av[i]; Vv[m] += D.v[i]; } }
    const fin = fa / fv; ctx.setLineDash([6, 6]); ctx.strokeStyle = DT.navy; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, Y(fin)); ctx.lineTo(x1, Y(fin)); ctx.stroke(); ctx.setLineDash([]);
    const leftFree = X(tcut) > (x0 + x1) / 2; text(`konečný výsledek ${pc1(fin)}`, leftFree ? x0 + 8 : x1, Y(fin) + 18, `400 19px ${COND}`, DT.navy, leftFree ? "left" : "right");
    const mEnd = Math.floor(tcut), WIN = 10, MINV = 8000; const cumPts = [], winPts = []; let ca = 0, cvv = 0;
    for (let m = 0; m <= mEnd; m++) {
      ca += Av[m]; cvv += Vv[m]; let wa_ = 0, wv = 0; for (let k = m; k >= 0 && (m - k < WIN || wv < MINV); k--) { wa_ += Av[k]; wv += Vv[k]; }   // last 10 minutes, extended back until it holds enough votes
      if (cvv >= 1500) cumPts.push([m, ca / cvv]); if (wv >= 1500) winPts.push([m, Math.max(lo + .004, wa_ / wv)]);
    }
    const line = (pts, col, lw) => { if (pts.length < 2) return; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = "round"; ctx.beginPath(); pts.forEach(([m, v], k) => (k ? ctx.lineTo(X(m), Y(v)) : ctx.moveTo(X(m), Y(v)))); ctx.stroke(); };
    line(winPts, DT.midnight, 2.5); line(cumPts, DT.orange, 5);
    const end = (pts, col, lab, dy) => { if (!pts.length) return; const [m, v] = pts[pts.length - 1]; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(m), Y(v), 6.5, 0, 6.2832); ctx.fill(); ctx.strokeStyle = DT.card; ctx.lineWidth = 2.5; ctx.stroke();
      text(lab, Math.min(X(m) + 14, x1 - 150), Math.min(Y(v) + dy, y1 - 12), `700 24px ${COND}`, col, "left"); };
    end(cumPts, DT.orange, pc1(cumPts.length ? cumPts[cumPts.length - 1][1] : 0), -20);
    end(winPts, DT.midnight, pc1(winPts.length ? winPts[winPts.length - 1][1] : 0), 22);
    let lgx = L + 54; [[DT.orange, 5, "výsledek dosud sečtených okrsků"], [DT.midnight, 2.5, "nejnověji sečtené okrsky"]].forEach(([c, w_, l]) => { ctx.strokeStyle = c; ctx.lineWidth = w_; ctx.beginPath(); ctx.moveTo(lgx, 620); ctx.lineTo(lgx + 30, 620); ctx.stroke(); text(l, lgx + 40, 620, `400 20px ${COND}`, DT.text); lgx += 60 + width(l, `400 20px ${COND}`) + 16; });
    ctx.strokeStyle = DT.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(tcut), y0); ctx.lineTo(X(tcut), y1); ctx.stroke();
  }

  const fy = H - 112;
  text("• autoři: Kateřina Mahdalová & Michal Škop", 60, fy, `400 19px ${COND}`, DT.text);
  text("• data: ČSÚ (volby.cz), průběžné výsledky voleb do Poslanecké sněmovny 4. 10. 2025; okrsky v zahraničí nejsou zahrnuty", 60, fy + 26, `400 19px ${COND}`, DT.text);
  text(MODE === "ano" ? "• poznámka: část rozdílu vysvětluje velikost okrsku – malé okrsky se sčítají rychleji a ANO v nich častěji vedlo" : "• poznámka: čas = okamžik zpracování okrsku (ČSÚ); poloha okrsku podle hranic volebních okrsků RÚIAN (ČÚZK)", 60, fy + 52, `400 19px ${COND}`, DT.text);
  }
  window.render = render; render(tInit);
  document.title = "ready"; window.READY = true;
})();
