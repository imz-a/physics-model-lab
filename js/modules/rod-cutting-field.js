/* ============================================================
 * rod-cutting-field.js — 导体棒切割磁感线
 * 依赖：无（IIFE + window.ModelLab.modules 注册）
 * 物理：ε=BLv；I=ε/R；F安=BIL=B²L²v/R（阻碍运动）；
 *       P外=F安·v=I²R=ε²/R=P热，机械能全部转化为电热
 * ============================================================ */
(function (global) {
  'use strict';

  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};
  var doc = global.document;

  var C = {
    ink: '#3a4250', ink2: '#5a6472', ink3: '#8b95a3', line: '#e8edf2',
    pink: '#FFB3BA', pinkD: '#E27886', peach: '#FFD8A8', peachD: '#D69A55',
    cream: '#FFF3BF', creamD: '#C7A62F', mint: '#B8E8D0', mintD: '#57A47F',
    sky: '#BFE3F5', skyD: '#5B9BC4', lav: '#D0C4E8', lavD: '#8A76BB'
  };
  var saved = { B: 0.8, L: 0.5, v: 2.0, R: 2.0, bdir: -1, vdir: 1, playing: true, maintain: true };
  var DEFAULTS = { B: 0.8, L: 0.5, v: 2.0, R: 2.0, bdir: -1, vdir: 1, playing: true, maintain: true };
  var SCALE_X = 0.5;   // 图纸 1 横坐标单位 = 0.5 m（用于把 x 换算成米代入 Φ=B·L·x）
  var ROD_RES_X = 0.10; // 电阻所在的图纸横坐标，棒到电阻的距离 = (xr-ROD_RES_X)*SCALE_X
  var CIRCLE = Math.PI * 2;
  var STYLE_ID = 'ml-cpr-style';

  var CSS = ''
    + '.cpr-wrap{display:flex;flex-direction:column;gap:14px;font-size:16px;color:var(--ink,#3a4250)}'
    + '.cpr-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
    + '.cpr-chip{display:inline-flex;align-items:center;gap:8px;padding:7px 15px;border:1px solid var(--mint,#B8E8D0);border-radius:999px;background:#F1FBF6;color:#4C9071;font-size:14px;font-weight:600}'
    + '.cpr-chip i{width:8px;height:8px;border-radius:50%;background:#8ED6B4}'
    + '.cpr-seg{display:inline-flex;padding:3px;border:1px solid var(--line,#e8edf2);border-radius:999px;background:#f6f8fa;gap:3px}'
    + '.cpr-seg button{min-height:36px;padding:6px 14px;border:0;border-radius:999px;background:transparent;color:var(--ink2,#5a6472);font-size:14px}'
    + '.cpr-seg button.is-on{background:#fff;color:var(--ink,#3a4250);font-weight:700;box-shadow:0 1px 5px rgba(88,108,132,.13)}'
    + '.cpr-spacer{flex:1 1 auto}'
    + '.cpr-btn{min-height:40px;padding:8px 17px;border:1px solid var(--line,#dce4ec);border-radius:10px;background:#fff;color:var(--ink2,#5a6472);font-size:15px}'
    + '.cpr-btn:hover{background:#f6f8fa}'
    + '.cpr-btn--primary{border-color:#a9dfc4;background:#eef9f3;color:#438562;font-weight:700}'
    + '.cpr-btn--warn{border-color:#ffe0b2;background:#FFF8EE;color:#9A6D32;font-weight:700}'
    + '.cpr-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr);gap:16px;align-items:stretch}'
    + '@media(max-width:1120px){.cpr-grid{grid-template-columns:1fr}}'
    + '.cpr-card{background:#fff;border:1px solid var(--line,#e8edf2);border-radius:var(--r-lg,18px);box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:17px 19px;min-width:0}'
    + '.cpr-card__t{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:700;margin-bottom:12px}'
    + '.cpr-card__t i{width:9px;height:9px;border-radius:50%;background:var(--mint,#B8E8D0)}'
    + '.cpr-card__hint{font-size:13px;color:var(--ink3,#8b95a3);font-weight:400;margin-left:auto}'
    + '.cpr-canvas{width:100%;height:auto;display:block;border-radius:12px;background:#fcfdfe;border:1px solid #eef2f6}'
    + '.cpr-side{display:flex;flex-direction:column;gap:14px}'
    + '.cpr-ctrl{display:block;margin-bottom:10px}'
    + '.cpr-ctrl__top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:14px;color:var(--ink2,#5a6472)}'
    + '.cpr-ctrl__top output{font-size:15px;font-weight:700;color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}'
    + '.cpr-ctrl input[type=range]{width:100%;margin:5px 0 0;accent-color:#8ED6B4;cursor:pointer;height:22px}'
    + '.cpr-reads{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.cpr-read{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;padding:9px 11px;border:1px solid var(--line,#eef2f6);border-radius:10px;background:var(--bg,#fafbfc)}'
    + '.cpr-read span{font-size:12px;color:var(--ink3,#8b95a3);flex:1 1 100%}'
    + '.cpr-read strong{font-size:18px;font-weight:700;color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}'
    + '.cpr-read em{font-size:12px;color:var(--ink3,#8b95a3);font-style:normal}'
    + '.cpr-note{margin-top:9px;padding:9px 12px;border-radius:10px;background:#F1FBF6;border:1px solid #cceede;color:#437F64;font-size:13px;line-height:1.6}'
    + '.cpr-extra{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}'
    + '.cpr-formula{padding:12px 14px;border-radius:10px;background:#F1FBF6;border:1px solid #cceede;font-size:15px;color:#437F64;line-height:1.9}'
    + '.cpr-formula b{font-size:17px}'
    + '.cpr-rel{display:grid;gap:8px;margin-top:11px}'
    + '.cpr-rel div{display:flex;justify-content:space-between;gap:10px;padding:8px 11px;border-radius:9px;background:#f6f8fa;font-size:14px;color:var(--ink2,#5a6472)}'
    + '.cpr-rel b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}'
    + '.cpr-chart{width:100%;height:auto;display:block;border-radius:10px;border:1px solid #eef2f6;background:#fff}'
    + '.cpr-bar{margin-top:11px}'
    + '.cpr-bar__top{display:flex;justify-content:space-between;font-size:13px;color:var(--ink2,#5a6472);margin-bottom:4px}'
    + '.cpr-bar__top b{font-variant-numeric:tabular-nums;color:var(--ink,#3a4250)}'
    + '.cpr-bar__track{height:22px;border-radius:99px;background:#f0f3f7;overflow:hidden}'
    + '.cpr-bar__fill{height:100%;width:0%;border-radius:99px;transition:width .12s linear}'
    + '.cpr-q{padding:13px 15px;border:1px solid #cceede;border-radius:11px;background:#F8FCFA;font-size:15px;line-height:1.85;color:#4E755F}'
    + '.cpr-q strong{color:#437F64}'
    + '.cpr-ans{margin-top:11px;padding:12px 15px;border:1px solid #cceede;border-radius:11px;background:#F1FBF6;font-size:14px;color:#3F7A60;line-height:1.9}'
    + '.cpr-ans[hidden]{display:none}'
    + '.cpr-opt{display:grid;gap:7px;margin-top:10px}'
    + '.cpr-opt button{min-height:40px;text-align:left;padding:8px 12px;border:1px solid var(--line,#dce4ec);border-radius:9px;background:#fff;font-size:14px;color:var(--ink2,#5a6472)}'
    + '.cpr-opt button:hover{background:#f6f8fa}'
    + '.cpr-opt button.is-right{border-color:#a9dfc4;background:#effaf4;color:#3F7A60;font-weight:700}'
    + '.cpr-opt button.is-wrong{border-color:#ffc9cf;background:#fff3f4;color:#c1616c}';

  function ensureStyle() {
    if (!doc.getElementById(STYLE_ID)) {
      var st = doc.createElement('style'); st.id = STYLE_ID; st.textContent = CSS; doc.head.appendChild(st);
    }
  }
  function setupCanvas(w, h) {
    var c = doc.createElement('canvas'), dpr = Math.min(global.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.className = 'cpr-canvas';
    var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { el: c, ctx: ctx, w: w, h: h };
  }
  function nf(v) {
    if (!isFinite(v)) return '—';
    var a = Math.abs(v);
    return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : a >= 0.1 ? v.toFixed(2) : v.toFixed(3);
  }
  function on(map, el, type, fn) {
    el.addEventListener(type, fn); var a = map[type] || (map[type] = []); a.push([el, fn]);
  }

  /* ---------------- 物理 ---------------- */
  function derive(s, vNow) {
    var v = vNow == null ? s.v : vNow;
    var emf = s.B * s.L * v;
    var I = emf / s.R;
    var F = s.B * I * s.L;
    var P = F * v;
    var Ph = I * I * s.R;
    var k = s.B * s.B * s.L * s.L / (s.R * 0.5); // 撤去外力时的速度衰减系数（m棒=0.5kg）
    return {
      B: s.B, L: s.L, R: s.R, v: v, emf: emf, I: I, F: F, P: P, Ph: Ph, k: k,
      ccw: (s.vdir * s.bdir) < 0, fluxRate: s.B * s.L * v
    };
  }
  function arrow(ctx, x1, y1, x2, y2, color, label, lw) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return;
    var ux = dx / len, uy = dy / len, hs = Math.min(11, len * .3);
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * hs - uy * hs * .55, y2 - uy * hs + ux * hs * .55);
    ctx.lineTo(x2 - ux * hs + uy * hs * .55, y2 - uy * hs - ux * hs * .55);
    ctx.closePath(); ctx.fill();
    if (label) { ctx.font = '600 16px "PingFang SC","Microsoft YaHei",sans-serif'; ctx.fillText(label, x2 + 7, y2 - 6); }
    ctx.restore();
  }
  function label(ctx, t, x, y, color, align) {
    ctx.save(); ctx.font = '15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = color || C.ink3; ctx.textAlign = align || 'left'; ctx.fillText(t, x, y); ctx.restore();
  }
  function symbol(ctx, x, y, out, size) {
    ctx.save(); ctx.strokeStyle = '#B9DFCC'; ctx.fillStyle = '#B9DFCC'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y, size, 0, CIRCLE); ctx.stroke();
    if (out) { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, CIRCLE); ctx.fill(); }
    else {
      var d = size * .62;
      ctx.beginPath(); ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d);
      ctx.moveTo(x + d, y - d); ctx.lineTo(x - d, y + d); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------------- 主画布 ---------------- */
  function drawRails(view, s, d, xr, flow, vNow) {
    var ctx = view.ctx, W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    var pad = 18, pw = W - pad * 2, ph = H - pad * 2;
    var scale = Math.min(pw / 1.12, ph / (s.L + 0.24));
    var ox = pad + (pw - 1.12 * scale) / 2 + 0.03 * scale, oy = pad + ph / 2;
    function PX(x) { return ox + x * scale; }
    function PY(y) { return oy - y * scale; }
    var half = s.L / 2, xrRes = 0.10;

    // 磁场区域
    ctx.save(); ctx.fillStyle = '#F6FCF9';
    ctx.fillRect(PX(0.17), PY(half + 0.02), (1.0 - 0.17) * scale, (s.L + 0.04) * scale);
    ctx.restore();
    for (var gx = 0.22; gx < 1.0; gx += 0.09) {
      for (var gy = -half + 0.045; gy < half; gy += 0.075) symbol(ctx, PX(gx), PY(gy), s.bdir > 0, 5);
    }
    label(ctx, s.bdir > 0 ? 'B 向外 ·' : 'B 向里 ×', PX(0.22), PY(half) - 10, C.mintD);

    // U 型导轨
    ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(PX(0), PY(half)); ctx.lineTo(PX(1.02), PY(half)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX(0), PY(-half)); ctx.lineTo(PX(1.02), PY(-half)); ctx.stroke();
    ctx.restore();
    // 左侧电阻（锯齿）
    ctx.save(); ctx.strokeStyle = C.lavD; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath();
    ctx.moveTo(PX(xrRes), PY(half));
    var z0 = PY(half), z1 = PY(-half), seg = 7;
    for (var i = 1; i < seg; i++) ctx.lineTo(PX(xrRes) + (i % 2 ? 9 : -9), z0 + (z1 - z0) * i / seg);
    ctx.lineTo(PX(xrRes), z1); ctx.stroke(); ctx.restore();
    label(ctx, 'R = ' + nf(s.R) + ' Ω', PX(xrRes) - 14, oy + 4, C.lavD, 'right');

    // 感应电流方向的环形点流
    var segs = [
      [xrRes, -half, xr, -half], [xr, -half, xr, half],
      [xr, half, xrRes, half], [xrRes, half, xrRes, -half]
    ];
    var nd = 4;
    for (var si = 0; si < 4; si++) {
      var sg = segs[si];
      for (var j = 0; j < nd; j++) {
        var t = (flow + j / nd) % 1;
        if (!d.ccw) t = 1 - t;
        var x = sg[0] + (sg[2] - sg[0]) * t, y = sg[1] + (sg[3] - sg[1]) * t;
        if (si === 3 && Math.abs(y) < half * .45) continue;
        ctx.save(); ctx.fillStyle = C.peachD;
        ctx.beginPath(); ctx.arc(PX(x), PY(y), 3.4, 0, CIRCLE); ctx.fill(); ctx.restore();
      }
    }
    // 电流箭头
    var iMid = (xr + xrRes) / 2;
    // 坐标约定：PY(half) 为上导轨、PY(-half) 为下导轨（PY(y)=oy−y*scale，y 越大越靠上）。
    // 默认 B 向里、棒向右 → qv×B 向上 → 棒中电流向上，回路逆时针：下导轨→、棒↑、上导轨←。
    // 三点流 segs 亦按此顺序（下导轨 xrRes→xr、棒 −half→half、上导轨 xr→xrRes），故箭头须与之一致。
    if (d.ccw) {
      arrow(ctx, PX(iMid - 0.05), PY(-half), PX(iMid + 0.06), PY(-half), C.peachD, 'I', 2.2); // 下导轨 →
      arrow(ctx, PX(iMid + 0.06), PY(half), PX(iMid - 0.05), PY(half), C.peachD, '', 2.2);    // 上导轨 ←
      arrow(ctx, PX(xr), PY(-half + .08), PX(xr), PY(half - .1), C.peachD, '', 2.2);          // 棒：下→上
    } else {
      arrow(ctx, PX(iMid + 0.06), PY(-half), PX(iMid - 0.05), PY(-half), C.peachD, 'I', 2.2); // 下导轨 ←
      arrow(ctx, PX(iMid - 0.05), PY(half), PX(iMid + 0.06), PY(half), C.peachD, '', 2.2);    // 上导轨 →
      arrow(ctx, PX(xr), PY(half - .08), PX(xr), PY(-half + .1), C.peachD, '', 2.2);          // 棒：上→下
    }

    // 导体棒
    ctx.save(); ctx.strokeStyle = C.pinkD; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(PX(xr), PY(-half)); ctx.lineTo(PX(xr), PY(half)); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.pinkD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(PX(xr), oy, 6, 0, CIRCLE); ctx.fill(); ctx.stroke(); ctx.restore();
    label(ctx, '导体棒', PX(xr), PY(half) - 12, C.pinkD, 'center');

    // 速度 / 安培力 / 外力
    var sgn = s.vdir, midY = oy;
    var vLen = 42 + vNow * 17;
    arrow(ctx, PX(xr), midY, PX(xr) + sgn * vLen, midY - 22, C.skyD, 'v', 2.6);
    var fLen = Math.min(105, 24 + d.F * 7);
    arrow(ctx, PX(xr), midY + 20, PX(xr) - sgn * fLen, midY + 20, C.pinkD, 'F安', 2.6);
    if (s.maintain) arrow(ctx, PX(xr), midY + 42, PX(xr) + sgn * fLen, midY + 42, C.lavD, 'F外', 2.4);

    label(ctx, 'ε = BLv = ' + nf(d.emf) + ' V', PX(xr) + sgn * 14, PY(-half) + 24, C.mintD, sgn > 0 ? 'left' : 'right');
    label(ctx, d.ccw ? '感应电流：逆时针（楞次定律）' : '感应电流：顺时针（楞次定律）', 22, H - 12, C.peachD);
    label(ctx, s.maintain ? '外力与安培力平衡 → 匀速' : '撤去外力 → 安培力使棒减速', W - 20, H - 12, s.maintain ? C.lavD : C.pinkD, 'right');
  }

  /* ---------------- 关系曲线 ---------------- */
  function drawRelation(view, s, key) {
    var ctx = view.ctx, W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    var L = 48, R = W - 18, T = 18, B = H - 34;
    var min, max, cv, fn, title, xt, yt;
    if (key === 'v') {
      min = 0; max = 5; cv = s.v; title = 'ε — v（B、L 不变）'; xt = 'v / (m/s)'; yt = 'ε / V';
      fn = function (x) { return s.B * s.L * x; };
    } else if (key === 'B') {
      min = 0; max = 2; cv = s.B; title = 'ε — B（L、v 不变）'; xt = 'B / T'; yt = 'ε / V';
      fn = function (x) { return x * s.L * s.v; };
    } else {
      min = 0; max = 0.8; cv = s.L; title = 'ε — L（B、v 不变）', xt = 'L / m'; yt = 'ε / V';
      fn = function (x) { return s.B * x * s.v; };
    }
    var ymax = fn(max) * 1.18 || 1;
    function X(v) { return L + (R - L) * (v - min) / (max - min); }
    function Y(v) { return B - (B - T) * v / ymax; }
    ctx.save(); ctx.strokeStyle = '#e8edf2'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke(); ctx.restore();
    label(ctx, title, L + 4, T + 10, C.mintD);
    label(ctx, yt, L - 4, T + 2, C.ink3, 'right');
    for (var g = 0; g <= 4; g++) {
      var gy = ymax * g / 4;
      ctx.save(); ctx.strokeStyle = '#f2f5f8'; ctx.beginPath(); ctx.moveTo(L, Y(gy)); ctx.lineTo(R, Y(gy)); ctx.stroke(); ctx.restore();
      label(ctx, nf(gy), L - 5, Y(gy) + 4, C.ink3, 'right');
    }
    ctx.save(); ctx.strokeStyle = C.mintD; ctx.lineWidth = 2.6; ctx.beginPath();
    ctx.moveTo(X(min), Y(fn(min))); ctx.lineTo(X(max), Y(fn(max))); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.fillStyle = C.pinkD;
    ctx.beginPath(); ctx.arc(X(cv), Y(fn(cv)), 6, 0, CIRCLE); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    label(ctx, xt, R, H - 8, C.ink2, 'right');
    label(ctx, '当前 ' + nf(cv) + ' → ε = ' + nf(fn(cv)) + ' V', L + 4, H - 8, C.pinkD, 'left');
  }
  function drawDecay(view, s, d, prog) {
    var ctx = view.ctx, W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    var L = 46, R = W - 18, T = 18, B = H - 34;
    ctx.save(); ctx.strokeStyle = '#e8edf2'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke(); ctx.restore();
    label(ctx, s.maintain ? '有外力维持：v 恒定' : '撤去外力：v = v₀e⁻ᵏᵗ（k = B²L²/Rm）', L + 4, T + 10, C.mintD);
    label(ctx, 'v', L - 4, T + 2, C.ink3, 'right');
    function X(t) { return L + (R - L) * t / 3; }
    function Y(v) { return B - (B - T) * v / (s.v * 1.12); }
    ctx.save(); ctx.strokeStyle = C.mintD; ctx.lineWidth = 2.6; ctx.beginPath();
    for (var i = 0; i <= 120; i++) {
      var t = 3 * i / 120, v = s.maintain ? s.v : s.v * Math.exp(-d.k * t);
      if (i === 0) ctx.moveTo(X(t), Y(v)); else ctx.lineTo(X(t), Y(v));
    }
    ctx.stroke(); ctx.restore();
    var tnow = prog * 3, vnow = s.maintain ? s.v : s.v * Math.exp(-d.k * tnow);
    ctx.save(); ctx.fillStyle = C.pinkD;
    ctx.beginPath(); ctx.arc(X(tnow), Y(vnow), 6, 0, CIRCLE); ctx.fill(); ctx.restore();
    label(ctx, 't / s', R, H - 8, C.ink2, 'right');
    label(ctx, 'k = ' + nf(d.k) + ' s⁻¹', L + 4, H - 8, C.pinkD);
  }

  /* ---------------- HTML ---------------- */
  function slider(key, label, min, max, step, val, unit) {
    return '<label class="cpr-ctrl"><span class="cpr-ctrl__top"><span>' + label + '</span>'
      + '<output data-out="' + key + '">' + nf(val) + ' ' + unit + '</output></span>'
      + '<input type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></label>';
  }
  function read(k, label, unit) {
    return '<div class="cpr-read"><span>' + label + '</span><strong data-read="' + k + '">—</strong><em>' + unit + '</em></div>';
  }
  function seg(name, a, b, cur, va, vb) {
    return '<div class="cpr-seg" data-seg="' + name + '">'
      + '<button type="button" data-val="' + va + '" class="' + (cur === va ? 'is-on' : '') + '">' + a + '</button>'
      + '<button type="button" data-val="' + vb + '" class="' + (cur === vb ? 'is-on' : '') + '">' + b + '</button></div>';
  }

  function buildHtml(idx, s) {
    var extra = '';
    if (idx === 1) {
      extra = '<div class="cpr-card"><div class="cpr-card__t"><i style="background:var(--sky,#BFE3F5)"></i>感应电动势 · 线性关系'
        + '<span class="cpe-card__hint" style="font-size:13px;color:var(--ink3);margin-left:auto">粉色点为当前参数</span></div>'
        + '<div class="cpr-seg" data-seg="rel" style="margin-bottom:10px">'
        + '<button type="button" data-val="v" class="is-on">ε — v</button>'
        + '<button type="button" data-val="B">ε — B</button>'
        + '<button type="button" data-val="L">ε — L</button></div>'
        + '<div data-chart></div>'
        + '<div class="cpr-rel">'
        + '<div><span>磁通量变化率 dΦ/dt</span><b data-rel="flux">—</b></div>'
        + '<div><span>当前磁通量 Φ = B·L·x</span><b data-rel="phi">—</b></div>'
        + '<div><span>感应电动势 ε</span><b data-rel="emf">—</b></div>'
        + '</div></div>'
        + '<div class="cpr-card"><div class="cpr-card__t"><i style="background:var(--mint,#B8E8D0)"></i>法拉第电磁感应定律</div>'
        + '<div class="cpr-formula"><b>Φ = BS = B·L·x</b><br>'
        + 'x 为导体棒到电阻的距离，棒以速度 v 运动：<br>'
        + '<b>ε = |dΦ/dt| = B·L·(dx/dt) = BLv</b><br>'
        + '三个量任一加倍，ε 都加倍——图像都是过原点的直线。'
        + '</div><div class="cpr-note">若棒与导轨不垂直或速度与棒不垂直，应取垂直分量：ε = BLv⊥。</div></div>';
    } else if (idx === 2) {
      extra = '<div class="cpr-card"><div class="cpr-card__t"><i style="background:var(--pink,#FFB3BA)"></i>安培力 · 阻碍运动'
        + '<button class="cpr-btn cpr-btn--warn" type="button" data-act="maintain" style="margin-left:auto;min-height:34px;font-size:13px">撤去外力</button></div>'
        + '<div data-decay></div>'
        + '<div class="cpr-bar"><div class="cpr-bar__top"><span>外力功率 P外 = F安·v</span><b data-barv="pext">—</b></div>'
        + '<div class="cpr-bar__track"><div class="cpr-bar__fill" data-bar="pext" style="background:var(--lav,#D0C4E8)"></div></div></div>'
        + '<div class="cpr-bar"><div class="cpr-bar__top"><span>热功率 P热 = I²R = ε²/R</span><b data-barv="pheat">—</b></div>'
        + '<div class="cpr-bar__track"><div class="cpr-bar__fill" data-bar="pheat" style="background:var(--peach,#FFD8A8)"></div></div></div>'
        + '<div class="cpr-eq" style="margin-top:12px;padding:10px 13px;border-radius:10px;background:#F1FBF6;border:1px solid #cceede;color:#437F64;font-size:14px">'
        + '匀速时外力与安培力等大反向：<b>F外 = F安 = B²L²v/R</b>，因此 <b>P外 = P热</b>，机械能全部变成焦耳热。'
        + '撤去外力后安培力做负功，棒减速，v 按指数规律衰减。</div></div>'
        + '<div class="cpr-card"><div class="cpr-card__t"><i style="background:var(--lav,#D0C4E8)"></i>安培力的“阻碍”含义</div>'
        + '<div class="cpr-formula"><b>F安 = BIL = B²L²v/R</b><br>'
        + '方向总与棒的运动方向相反（楞次定律的力学表现）<br>'
        + 'v 越大 → ε 越大 → I 越大 → F安越大<br>'
        + '故衰减满足 <b>m·dv/dt = −(B²L²/R)v</b>，速度按 e⁻ᵏᵗ 下降。'
        + '</div><div class="cpr-note">这里取导体棒质量 m = 0.5 kg 用于演示减速过程；切换上方按钮可恢复匀速状态。</div></div>';
    } else if (idx === 3) {
      extra = '<div class="cpr-card"><div class="cpr-card__t"><i style="background:var(--pink,#FFB3BA)"></i>高考题型 · 电磁感应中的能量</div>'
        + '<div class="cpr-q"><strong>题目</strong>　光滑平行导轨间距 L，处于磁感应强度 B 的匀强磁场中，'
        + '导体棒电阻可忽略，外接电阻 R。用水平外力使棒以速度 v <b data-qdir>向右</b>匀速运动。<br>'
        + '<strong>求</strong>　(1) 感应电动势与电流方向；(2) 安培力大小与方向；'
        + '(3) 外力功率；(4) 时间 t 内电阻产生的焦耳热。</div>'
        + '<button class="cpr-btn cpr-btn--primary" type="button" data-act="ans" style="margin-top:11px">查看解析 ▾</button>'
        + '<div class="cpr-ans" data-ans hidden>'
        + '(1) <b>ε = BLv</b>，由右手定则判断电流方向（本图为<b data-a="dir">—</b>）。<br>'
        + '(2) <b>I = BLv/R</b>，<b>F安 = BIL = B²L²v/R</b>，方向<b data-fdir>向左</b>、阻碍运动。<br>'
        + '(3) 匀速时 F外 = F安，<b>P外 = F安·v = B²L²v²/R</b>。<br>'
        + '(4) <b>Q = I²Rt = (BLv)²t/R</b>，恰好等于外力做的功 W = P外·t。<br>'
        + '代入当前参数：ε = <b data-a="emf">—</b> V，I = <b data-a="I">—</b> A，'
        + 'F安 = <b data-a="F">—</b> N，P = <b data-a="P">—</b> W。'
        + '</div></div>'
        + '<div class="cpr-card"><div class="cpr-card__t"><i style="background:var(--sky,#BFE3F5)"></i>易错辨析 · 选一选</div>'
        + '<div style="font-size:15px;line-height:1.8">导体棒匀速切割磁感线时，外力做功的去向是？</div>'
        + '<div class="cpr-opt"><button type="button" data-opt="a">A. 全部转化为导体棒的动能</button>'
        + '<button type="button" data-opt="b">B. 全部转化为电路中的焦耳热</button>'
        + '<button type="button" data-opt="c">C. 一半变成动能，一半变成热</button></div>'
        + '<div class="cpr-ans" data-optans hidden><b>答案：B。</b>匀速意味着动能不变，安培力做的负功与外力做的正功抵消，'
        '外力做的功通过感应电流全部转化为电阻上的焦耳热：W = P外·t = I²Rt = Q。</div></div>';
    } else {
      extra = '<div class="cpr-card"><div class="cpr-card__t"><i style="background:var(--mint,#B8E8D0)"></i>核心规律 · 切割磁感线</div>'
        + '<div class="cpr-formula"><b>ε = BLv</b>　（B、L、v 两两垂直）<br>'
        + '闭合电路：<b>I = ε / R = BLv / R</b><br>'
        + '安培力：<b>F安 = BIL = B²L²v / R</b><br>'
        + '能量：<b>P外 = F安 v = ε²/R = I²R = P热</b></div>'
        + '<div class="cpr-note">右手定则：手心迎着磁感线，拇指指向导体运动方向，四指即感应电流（电源内部）方向。</div></div>'
        + '<div class="cpr-card"><div class="cpr-card__t"><i style="background:var(--lav,#D0C4E8)"></i>两个方向判定</div>'
        + '<div class="cpr-formula"><b>右手定则</b>定感应电流：本图默认 B 向里、棒向右 → '
        + '棒中正电荷受力向上 → 电流沿棒向上，整个回路为逆时针。<br>'
        + '<b>楞次定律</b>定安培力：感应电流的效果总要阻碍相对运动 → F安与 v 反向。'
        + '</div><div class="cpr-note">试着切换上方的 B 方向或运动方向，电流箭头会整体翻转，但安培力始终与速度反向。</div></div>';
    }

    return '<div class="cpr-wrap">'
      + '<div class="cpr-bar"><span class="cpr-chip"><i></i>' + (idx === 2 ? '动力学 · 安培力与能量' : idx === 3 ? '题型归纳 · 能量守恒' : idx === 1 ? '定量关系 · 感应电动势' : '电磁感应 · 切割磁感线') + '</span>'
      + seg('bdir', 'B 向里 ×', 'B 向外 ·', s.bdir, -1, 1)
      + seg('vdir', '棒向右 →', '棒向左 ←', s.vdir, 1, -1)
      + '<span class="cpr-spacer"></span>'
      + '<button class="cpr-btn cpr-btn--primary" type="button" data-act="play">' + (s.playing ? '⏸ 暂停' : '▶ 播放') + '</button>'
      + '<button class="cpr-btn" type="button" data-act="reset">↺ 重置</button></div>'
      + '<div class="cpr-grid">'
      + '<div class="cpr-card"><div class="cpr-card__t"><i></i>U 型导轨中的导体棒'
      + '<span class="cpr-card__hint">橙色小点表示感应电流方向 · 棒长随 L 实时变化</span></div>'
      + '<div data-canvas></div></div>'
      + '<div class="cpr-side">'
      + '<div class="cpr-card"><div class="cpr-card__t"><i style="background:var(--pink,#FFB3BA)"></i>参数调节</div>'
      + slider('B', '磁感应强度 B', 0.2, 2, 0.1, s.B, 'T')
      + slider('L', '导体棒长度 L', 0.2, 0.8, 0.05, s.L, 'm')
      + slider('v', '运动速度 v', 0.5, 5, 0.1, s.v, 'm/s')
      + slider('R', '回路电阻 R', 0.5, 10, 0.5, s.R, 'Ω')
      + '</div>'
      + '<div class="cpr-card"><div class="cpr-card__t"><i style="background:var(--peach,#FFD8A8)"></i>实时读数</div>'
      + '<div class="cpr-reads">'
      + read('emf', '感应电动势 ε', 'V') + read('I', '感应电流 I', 'A')
      + read('F', '安培力 F', 'N') + read('p', '功率 P外 = P热', 'W')
      + read('flux', 'dΦ/dt', 'Wb/s') + read('v', '当前速度 v', 'm/s')
      + '</div><div class="cpr-note" data-status>外力克服安培力做功，机械能转化为电能再变成焦耳热。</div>'
      + '</div></div></div>'
      + '<div class="cpr-extra">' + extra + '</div>'
      + '</div>';
  }

  /* ---------------- 模块注册 ---------------- */
  NS.modules['rod-cutting-field'] = {
    render: function (container, extIndex) {
      ensureStyle();
      var idx = Math.max(0, Math.min(3, Number(extIndex) || 0));
      var s = {
        B: saved.B, L: saved.L, v: saved.v, R: saved.R, bdir: saved.bdir,
        vdir: saved.vdir, playing: saved.playing, maintain: saved.maintain, rel: 'v'
      };
      container.innerHTML = buildHtml(idx, s);
      var view = setupCanvas(1000, 430);
      container.querySelector('[data-canvas]').appendChild(view.el);
      var chartView = idx === 1 ? setupCanvas(560, 210) : null;
      var decayView = idx === 2 ? setupCanvas(560, 200) : null;
      if (chartView) { chartView.el.className = 'cpr-chart'; container.querySelector('[data-chart]').appendChild(chartView.el); }
      if (decayView) { decayView.el.className = 'cpr-chart'; container.querySelector('[data-decay]').appendChild(decayView.el); }

      var raf = 0, last = 0, prog = 0, dead = false, listeners = Object.create(null);
      var slideX = 0.38;   // 棒的图纸横坐标（撤外力后由衰减速度积分推进）
      var curXr = 0.38;    // 当前帧棒位置（供切换 maintain 时衔接）
      var decayT = 0;      // 撤外力后累计时间（s）
      var q1 = function (sel) { return container.querySelector(sel); };
      var qa = function (sel) { return container.querySelectorAll(sel); };
      var units = { B: 'T', L: 'm', v: 'm/s', R: 'Ω' };
      function setOutputs() {
        var o = qa('[data-out]');
        for (var i = 0; i < o.length; i++) {
          var k = o[i].getAttribute('data-out');
          if (s[k] != null) o[i].textContent = nf(s[k]) + ' ' + (units[k] || '');
        }
      }
      function setSeg(name, val) {
        var box = q1('[data-seg="' + name + '"]'); if (!box) return;
        var bs = box.querySelectorAll('button');
        for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('is-on', bs[i].getAttribute('data-val') === String(val));
      }
      function syncSaved() { ['B', 'L', 'v', 'R', 'bdir', 'vdir', 'playing', 'maintain'].forEach(function (k) { saved[k] = s[k]; }); }
      function setRead(k, v) { var e = q1('[data-read="' + k + '"]'); if (e) e.textContent = v; }

      var sl = qa('input[type=range]');
      for (var i = 0; i < sl.length; i++) {
        on(listeners, sl[i], 'input', function (e) {
          var k = e.target.getAttribute('data-key'); s[k] = Number(e.target.value); setOutputs(); syncSaved();
        });
      }
      var segs = qa('[data-seg]');
      for (var j = 0; j < segs.length; j++) {
        on(listeners, segs[j], 'click', function (e) {
          var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
          var name = e.currentTarget.getAttribute('data-seg'), raw = b.getAttribute('data-val');
          // rel 分段的值是字符串 'v'/'B'/'L'；bdir/vdir 才是 ±1 数字。统一用字符串存与比较高亮。
          var val = (name === 'rel') ? String(raw) : Number(raw);
          s[name] = val; setSeg(name, val); syncSaved();
        });
      }
      var pb = q1('[data-act="play"]');
      on(listeners, pb, 'click', function () { s.playing = !s.playing; pb.textContent = s.playing ? '⏸ 暂停' : '▶ 播放'; syncSaved(); });
      on(listeners, q1('[data-act="reset"]'), 'click', function () {
        // 恢复全部默认参数与方向，并同步滑块读数、分段高亮与动画进度
        for (var dk in DEFAULTS) if (DEFAULTS.hasOwnProperty(dk)) s[dk] = DEFAULTS[dk];
        for (var sk in DEFAULTS) if (DEFAULTS.hasOwnProperty(sk)) saved[sk] = DEFAULTS[sk];
        prog = 0; slideX = 0.38; curXr = 0.38; decayT = 0;
        setOutputs();
        setSeg('bdir', s.bdir); setSeg('vdir', s.vdir);
        pb.textContent = s.playing ? '⏸ 暂停' : '▶ 播放';
        if (mb) { mb.textContent = '撤去外力'; mb.className = 'cpr-btn cpr-btn--warn'; }
      });
      var mb = q1('[data-act="maintain"]');
      if (mb) on(listeners, mb, 'click', function () {
        s.maintain = !s.maintain;
        mb.textContent = s.maintain ? '撤去外力' : '恢复外力（匀速）';
        mb.className = 'cpr-btn ' + (s.maintain ? 'cpr-btn--warn' : 'cpr-btn--primary');
        if (s.maintain) { prog = 0; }
        else { decayT = 0; slideX = curXr; } // 从当前位置开始减速滑行
        syncSaved();
      });
      var ab = q1('[data-act="ans"]');
      if (ab) on(listeners, ab, 'click', function () { var box = q1('[data-ans]'); box.hidden = !box.hidden; ab.textContent = box.hidden ? '查看解析 ▾' : '收起解析 ▴'; });
      var opts = qa('[data-opt]');
      for (var oi = 0; oi < opts.length; oi++) {
        on(listeners, opts[oi], 'click', function (e) {
          for (var z = 0; z < opts.length; z++) opts[z].classList.remove('is-right', 'is-wrong');
          var isCorrect = e.currentTarget.getAttribute('data-opt') === 'b'; // 唯一正确项 B
          e.currentTarget.classList.add(isCorrect ? 'is-right' : 'is-wrong');
          q1('[data-optans]').hidden = false;
        });
      }

      function update(d, vNow, xr) {
        setRead('emf', nf(d.emf)); setRead('I', nf(d.I));
        setRead('F', nf(d.F)); setRead('p', nf(d.P));
        setRead('flux', nf(d.fluxRate)); setRead('v', nf(vNow));
        var st = q1('[data-status]');
        if (st) st.textContent = s.maintain
          ? '匀速：P外 = F安·v = ' + nf(d.P) + ' W = I²R = P热，能量守恒。'
          : '撤去外力：安培力做负功，速度按 v₀e⁻ᵏᵗ 衰减（k = ' + nf(d.k) + ' s⁻¹）。';
        if (idx === 1) {
          var set = function (k, v) { var el = q1('[data-rel="' + k + '"]'); if (el) el.textContent = v; };
          set('flux', nf(d.fluxRate) + ' Wb/s');
          // x 为棒到电阻的实际距离（m）= 图纸横坐标差 × SCALE_X，不再把归一化坐标直接当米
          set('phi', nf(s.B * s.L * Math.max(0, xr - ROD_RES_X) * SCALE_X) + ' Wb');
          set('emf', nf(d.emf) + ' V');
          drawRelation(chartView, s, s.rel);
        }
        if (idx === 2) {
          var setBar = function (k, v) {
            var bar = q1('[data-bar="' + k + '"]'), txt = q1('[data-barv="' + k + '"]');
            if (bar) bar.style.width = Math.min(100, v / Math.max(d.P, d.Ph, 1e-6) * 100).toFixed(1) + '%';
            if (txt) txt.textContent = nf(v) + ' W';
          };
          setBar('pext', d.P); setBar('pheat', d.Ph);
          drawDecay(decayView, s, d, prog);
        }
        if (idx === 3) {
          var sa = function (k, v) { var el = q1('[data-a="' + k + '"]'); if (el) el.textContent = v; };
          sa('dir', d.ccw ? '逆时针' : '顺时针'); sa('emf', nf(d.emf));
          sa('I', nf(d.I)); sa('F', nf(d.F)); sa('P', nf(d.P));
          // 题干运动方向与解析中安培力方向随 vdir 实时翻转
          var qd = q1('[data-qdir]'); if (qd) qd.textContent = s.vdir > 0 ? '向右' : '向左';
          var fd = q1('[data-fdir]'); if (fd) fd.textContent = s.vdir > 0 ? '向左' : '向右';
        }
      }

      function frame(ts) {
        if (dead) return;
        if (!last) last = ts;
        var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
        var xr, vNow;
        if (s.maintain) {
          // 单向锯齿波：棒始终沿 vdir 方向匀速运动，到边界后重置回起点。
          // 避免原三角波返程时速度反向、而安培力/外力箭头仍按固定 vdir 绘制，违背楞次定律。
          if (s.playing) { prog += dt / 3.4; if (prog > 1) prog = 0; }
          xr = s.vdir > 0 ? (0.38 + 0.52 * prog) : (0.90 - 0.52 * prog);
          vNow = s.v;
          slideX = xr;
        } else {
          // 撤外力：速度按 v=v0·e^(-kt) 指数衰减，位置对速度积分推进（不再等幅三角波往复）
          if (s.playing) decayT += dt;
          vNow = s.v * Math.exp(-derive(s).k * decayT);
          var vxr = 0.30 * (vNow / s.v) * s.vdir; // 图纸速度与真实速度同比例衰减
          slideX = clamp(slideX + vxr * dt, 0.38, 0.90); // 到达右端即停
          xr = slideX;
          prog = decayT / 3.4;
        }
        curXr = xr;
        var d = derive(s, vNow);
        var alpha = Math.min(1, prog / 0.06, (1 - prog) / 0.06);
        view.ctx.save(); view.ctx.globalAlpha = Math.max(0, alpha);
        drawRails(view, s, d, xr, (prog * (0.5 + Math.min(2, d.I * 0.1))) % 1, vNow);
        view.ctx.restore();
        update(d, vNow, xr);
        raf = global.requestAnimationFrame(frame);
      }
      raf = global.requestAnimationFrame(frame);

      return function cleanup() {
        if (dead) return; dead = true;
        global.cancelAnimationFrame(raf);
        for (var t in listeners) {
          if (!Object.prototype.hasOwnProperty.call(listeners, t)) continue;
          var a = listeners[t];
          for (var k = 0; k < a.length; k++) a[k][0].removeEventListener(t, a[k][1]);
        }
      };
    }
  };
})(window);
