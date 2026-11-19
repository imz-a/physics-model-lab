/* ============================================================
 * charged-particle-magnetic.js — 带电粒子在磁场中的圆周运动
 * 依赖：无（IIFE + window.ModelLab.modules 注册）
 * 物理：F=qvB（垂直）；r=mv/(|q|B)；ω=|q|B/m；T=2πm/(|q|B) 与 v、r 无关
 *       转向由 q 的符号与 B 的方向共同决定（左手定则）
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
  var saved = { B: 1.0, q: 2, m: 12, v: 3.0, sign: 1, bdir: -1, rev: 0.4, playing: true, W: 0.30, H: 0.46 };
  var QE = 1.602e-19, UU = 1.6605e-27;
  var CIRCLE = Math.PI * 2;
  var VIEW_R = 0.8;                 // 固定显示半径（m），绝不随当前 r 归一化
  var F_REF = QE * 6e6 * 3;         // 洛伦兹力箭头的固定参考量程（N）
  var STYLE_ID = 'ml-cpm-style';

  var CSS = ''
    + '.cpm-wrap{display:flex;flex-direction:column;gap:14px;font-size:16px;color:var(--ink,#3a4250)}'
    + '.cpm-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
    + '.cpm-chip{display:inline-flex;align-items:center;gap:8px;padding:7px 15px;border:1px solid var(--lav,#D0C4E8);border-radius:999px;background:#F7F4FC;color:#7B66A8;font-size:14px;font-weight:600}'
    + '.cpm-chip i{width:8px;height:8px;border-radius:50%;background:#A994D4}'
    + '.cpm-seg{display:inline-flex;padding:3px;border:1px solid var(--line,#e8edf2);border-radius:999px;background:#f6f8fa;gap:3px}'
    + '.cpm-seg button{min-height:36px;padding:6px 14px;border:0;border-radius:999px;background:transparent;color:var(--ink2,#5a6472);font-size:14px}'
    + '.cpm-seg button.is-on{background:#fff;color:var(--ink,#3a4250);font-weight:700;box-shadow:0 1px 5px rgba(88,108,132,.13)}'
    + '.cpm-spacer{flex:1 1 auto}'
    + '.cpm-btn{min-height:40px;padding:8px 17px;border:1px solid var(--line,#dce4ec);border-radius:10px;background:#fff;color:var(--ink2,#5a6472);font-size:15px}'
    + '.cpm-btn:hover{background:#f6f8fa}'
    + '.cpm-btn--primary{border-color:#cbbdea;background:#f5f1fb;color:#6E59A0;font-weight:700}'
    + '.cpm-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr);gap:16px;align-items:stretch}'
    + '@media(max-width:1120px){.cpm-grid{grid-template-columns:1fr}}'
    + '.cpm-card{background:#fff;border:1px solid var(--line,#e8edf2);border-radius:var(--r-lg,18px);box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:17px 19px;min-width:0}'
    + '.cpm-card__t{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:700;margin-bottom:12px}'
    + '.cpm-card__t i{width:9px;height:9px;border-radius:50%;background:var(--lav,#D0C4E8)}'
    + '.cpm-card__hint{font-size:13px;color:var(--ink3,#8b95a3);font-weight:400;margin-left:auto}'
    + '.cpm-canvas{width:100%;height:auto;display:block;border-radius:12px;background:#fcfdfe;border:1px solid #eef2f6}'
    + '.cpm-side{display:flex;flex-direction:column;gap:14px}'
    + '.cpm-ctrl{display:block;margin-bottom:10px}'
    + '.cpm-ctrl__top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:14px;color:var(--ink2,#5a6472)}'
    + '.cpm-ctrl__top output{font-size:15px;font-weight:700;color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}'
    + '.cpm-ctrl input[type=range]{width:100%;margin:5px 0 0;accent-color:#A994D4;cursor:pointer;height:22px}'
    + '.cpm-reads{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.cpm-read{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;padding:9px 11px;border:1px solid var(--line,#eef2f6);border-radius:10px;background:var(--bg,#fafbfc)}'
    + '.cpm-read span{font-size:12px;color:var(--ink3,#8b95a3);flex:1 1 100%}'
    + '.cpm-read strong{font-size:18px;font-weight:700;color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}'
    + '.cpm-read em{font-size:12px;color:var(--ink3,#8b95a3);font-style:normal}'
    + '.cpm-note{margin-top:9px;padding:9px 12px;border-radius:10px;background:#F7F4FC;border:1px solid #e6dcf6;color:#6B5896;font-size:13px;line-height:1.6}'
    + '.cpm-extra{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}'
    + '.cpm-formula{padding:12px 14px;border-radius:10px;background:#F7F4FC;border:1px solid #e6dcf6;font-size:15px;color:#6B5896;line-height:1.9}'
    + '.cpm-formula b{font-size:17px}'
    + '.cpm-rel{display:grid;gap:8px;margin-top:11px}'
    + '.cpm-rel div{display:flex;justify-content:space-between;gap:10px;padding:8px 11px;border-radius:9px;background:#f6f8fa;font-size:14px;color:var(--ink2,#5a6472)}'
    + '.cpm-rel b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}'
    + '.cpm-chart{width:100%;height:auto;display:block;border-radius:10px;border:1px solid #eef2f6;background:#fff}'
    + '.cpm-q{padding:13px 15px;border:1px solid #e6dcf6;border-radius:11px;background:#FBF9FE;font-size:15px;line-height:1.85;color:#5F5382}'
    + '.cpm-q strong{color:#6B5896}'
    + '.cpm-ans{margin-top:11px;padding:12px 15px;border:1px solid #cceede;border-radius:11px;background:#F1FBF6;font-size:14px;color:#3F7A60;line-height:1.9}'
    + '.cpm-ans[hidden]{display:none}'
    + '.cpm-opt{display:grid;gap:7px;margin-top:10px}'
    + '.cpm-opt button{min-height:40px;text-align:left;padding:8px 12px;border:1px solid var(--line,#dce4ec);border-radius:9px;background:#fff;font-size:14px;color:var(--ink2,#5a6472)}'
    + '.cpm-opt button:hover{background:#f6f8fa}'
    + '.cpm-opt button.is-right{border-color:#cbbdea;background:#f5f1fb;color:#6E59A0;font-weight:700}';

  function ensureStyle() {
    if (!doc.getElementById(STYLE_ID)) {
      var st = doc.createElement('style'); st.id = STYLE_ID; st.textContent = CSS; doc.head.appendChild(st);
    }
  }
  function setupCanvas(w, h) {
    var c = doc.createElement('canvas'), dpr = Math.min(global.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.className = 'cpm-canvas';
    var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { el: c, ctx: ctx, w: w, h: h };
  }
  function nf(v) {
    if (!isFinite(v)) return '—';
    var a = Math.abs(v);
    return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : a >= 0.1 ? v.toFixed(2) : v.toFixed(3);
  }
  function on(map, el, type, fn) {
    el.addEventListener(type, fn);
    var a = map[type] || (map[type] = []); a.push([el, fn]);
  }

  /* ---------------- 物理 ---------------- */
  function derive(s) {
    var q = s.sign * s.q * QE;          // C（带符号）
    var m = s.m * UU;                   // kg
    var v = s.v * 1e6;                  // m/s
    var Bz = s.bdir * s.B;              // T（带符号，+ 出纸面）
    var wSigned = q * Bz / m;           // 有符号回旋角速度（顺时针为正）
    var r = v / Math.abs(wSigned);      // m
    var w = Math.abs(wSigned);
    var T = CIRCLE / w;                 // s
    var F = Math.abs(q) * v * Math.abs(Bz);
    return {
      q: q, m: m, v: v, Bz: Bz, wSigned: wSigned, w: w, r: r, T: T, F: F,
      cw: wSigned > 0, slow: w / (CIRCLE * s.rev)
    };
  }
  function arrow(ctx, x1, y1, x2, y2, color, label, lw) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return;
    var ux = dx / len, uy = dy / len, hs = Math.min(10, len * 0.3);
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 2.2; ctx.lineCap = 'round';
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
  function fieldSymbol(ctx, x, y, out, size) {
    ctx.save(); ctx.strokeStyle = '#C9BBE4'; ctx.fillStyle = '#C9BBE4'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y, size, 0, CIRCLE); ctx.stroke();
    if (out) { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, CIRCLE); ctx.fill(); }
    else {
      var d = size * .62;
      ctx.beginPath(); ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d);
      ctx.moveTo(x + d, y - d); ctx.lineTo(x - d, y + d); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------------- 主画布：完整圆周 ---------------- */
  function drawOrbit(view, d, s, theta) {
    var ctx = view.ctx, W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    var pad = 16, pw = W - pad * 2, ph = H - pad * 2;
    // 固定绝对量程：圆在屏幕上的半径 = r × 固定比例，B、v、m、q 一改必然同步变化
    var scale = Math.min(pw / (2 * VIEW_R), ph / (2 * VIEW_R));
    var ox = pad + pw / 2, oy = pad + ph / 2;
    function PX(x) { return ox + x * scale; }
    function PY(y) { return oy - y * scale; }
    var sign = d.wSigned > 0 ? 1 : -1;   // +1：qB>0 顺时针；−1：qB<0 逆时针

    // 坐标轴与固定刻度（单位 m）
    ctx.save(); ctx.strokeStyle = '#e6ecf3'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX(-VIEW_R), oy); ctx.lineTo(PX(VIEW_R), oy);
    ctx.moveTo(ox, PY(-VIEW_R)); ctx.lineTo(ox, PY(VIEW_R)); ctx.stroke(); ctx.restore();
    for (var tk = -4; tk <= 4; tk++) {
      if (!tk) continue;
      var tv = tk * 0.2;
      ctx.save(); ctx.strokeStyle = '#e9eef4';
      ctx.beginPath(); ctx.moveTo(PX(tv), oy - 4); ctx.lineTo(PX(tv), oy + 4);
      ctx.moveTo(ox - 4, PY(tv)); ctx.lineTo(ox + 4, PY(tv)); ctx.stroke(); ctx.restore();
      label(ctx, tv.toFixed(1), PX(tv), oy + 17, C.ink3, 'center');
      label(ctx, tv.toFixed(1), ox - 7, PY(tv) + 4, C.ink3, 'right');
    }
    label(ctx, 'x / m', PX(VIEW_R) - 2, oy + 33, C.ink2, 'right');
    label(ctx, 'y / m', ox + 8, PY(VIEW_R) + 4, C.ink2);

    // 磁场符号网格（固定密度，× 向里 / · 向外）
    for (var gx = -VIEW_R * .93; gx <= VIEW_R * .93; gx += VIEW_R / 5) {
      for (var gy = -VIEW_R * .78; gy <= VIEW_R * .78; gy += VIEW_R / 5) {
        if (Math.abs(Math.sqrt(gx * gx + gy * gy) - d.r) < VIEW_R / 16) continue;
        fieldSymbol(ctx, PX(gx), PY(gy), s.bdir > 0, 6);
      }
    }
    label(ctx, s.bdir > 0 ? 'B 垂直纸面向外（·）' : 'B 垂直纸面向里（×）', 22, 24, C.lavD);
    label(ctx, '动画慢放 ×' + (d.slow >= 1e4 ? (d.slow / 1e6).toFixed(2) + '×10⁶' : nf(d.slow)), W - 20, 24, C.ink3, 'right');

    // 变化前的灰色虚线参考圆（快照，不随当前参数变）
    if (s.refR != null) {
      ctx.save(); ctx.setLineDash([7, 6]); ctx.strokeStyle = '#aeb8c6'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ox, oy, s.refR * scale, 0, CIRCLE); ctx.stroke(); ctx.restore();
      label(ctx, '变化前 r = ' + nf(s.refR) + ' m（灰虚线）', 22, 44, '#8b95a3');
    }
    // 当前理论完整圆（淡紫虚线）
    ctx.save(); ctx.setLineDash([6, 7]); ctx.strokeStyle = '#D8CCEE'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ox, oy, d.r * scale, 0, CIRCLE); ctx.stroke(); ctx.restore();
    if (d.r > VIEW_R) label(ctx, '当前 r 超出固定显示量程 ' + VIEW_R + ' m，圆被画布裁切', W - 20, 44, C.pinkD, 'right');

    // 拖尾圆弧：θ 的增减方向由 qB 符号决定
    ctx.save(); ctx.strokeStyle = C.pinkD; ctx.lineWidth = 5; ctx.lineCap = 'round';
    var span = 2.05, steps = 64;
    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var th = theta - sign * span * (1 - i / steps);
      var x = d.r * Math.sin(th), y = d.r * Math.cos(th);
      if (i === 0) ctx.moveTo(PX(x), PY(y)); else ctx.lineTo(PX(x), PY(y));
    }
    ctx.stroke(); ctx.restore();

    // 圆心与半径
    ctx.save(); ctx.fillStyle = C.ink3;
    ctx.beginPath(); ctx.arc(ox, oy, 3.5, 0, CIRCLE); ctx.fill(); ctx.restore();
    label(ctx, 'O', ox + 8, oy - 7, C.ink3);
    var px = d.r * Math.sin(theta), py = d.r * Math.cos(theta);
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.lavD; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(PX(px), PY(py)); ctx.stroke(); ctx.restore();
    label(ctx, 'r = ' + nf(d.r) + ' m', (ox + PX(px)) / 2 + 6, (oy + PY(py)) / 2 - 5, C.lavD);

    // 入射点：qB>0 从上端水平向右射入（受力向下）；qB<0 从下端水平向右射入（受力向上）
    var entryY = sign > 0 ? d.r : -d.r;
    ctx.save(); ctx.fillStyle = C.mintD;
    ctx.beginPath(); ctx.arc(PX(0), PY(entryY), 4, 0, CIRCLE); ctx.fill(); ctx.restore();
    arrow(ctx, PX(0) - 46, PY(entryY), PX(0) - 7, PY(entryY), C.mintD, 'v₀', 2.2);

    // 粒子、速度、洛伦兹力（力恒指向圆心，与 sign 无关）
    var X = PX(px), Y = PY(py);
    ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.pinkD; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(X, Y, 8, 0, CIRCLE); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.pinkD; ctx.beginPath(); ctx.arc(X, Y, 3.4, 0, CIRCLE); ctx.fill(); ctx.restore();
    var vlen = Math.min(110, 40 + d.v * 12);
    var vx = sign * Math.cos(theta), vy = -sign * Math.sin(theta);
    arrow(ctx, X, Y, X + vx * vlen, Y + vy * vlen, C.mintD, 'v', 2.6);
    var fdirx = -Math.sin(theta), fdiry = -Math.cos(theta);
    var flen = 22 + 60 * Math.min(1, d.F / F_REF);
    arrow(ctx, X, Y, X + fdirx * flen, Y + fdiry * flen, C.pinkD, 'F', 2.4);

    label(ctx, d.cw ? '转向：顺时针' : '转向：逆时针', 22, H - 12, C.lavD);
    label(ctx, '绿：v  粉：F(洛伦兹力)  淡紫虚线：完整圆', W - 20, H - 12, C.ink3, 'right');
  }

  /* ---------------- 边界问题画布 ---------------- */
  function boundaryPath(d, s) {
    var Wf = s.W, Hf = s.H, sign = d.wSigned > 0 ? 1 : -1, r = d.r;
    // 入射速度恒沿 +x：φ 单调增大时 x=r·sinφ 先向右；y 的弯曲方向由 qB 符号决定
    // sign>0（qB>0）受力向下 → y<0；sign<0（qB<0）受力向上 → y>0
    var pts = [], thMax = CIRCLE, N = 420, exitI = -1;
    for (var i = 0; i <= N; i++) {
      var th = thMax * i / N;
      var x = r * Math.sin(th), y = sign * r * (Math.cos(th) - 1);
      pts.push({ x: x, y: y, th: th });
      // x<0 表示转过半圈后从入射边界返回（r 小于场宽/2 时的常规情形）
      if (exitI < 0 && i > 0 && (x > Wf || x < -1e-6 || Math.abs(y) > Hf / 2)) exitI = i;
    }
    if (exitI > 0) pts.length = exitI + 1;
    var last = pts[pts.length - 1];
    // 切线方向：dx/dφ=r·cosφ，dy/dφ=−sign·r·sinφ
    var vx = Math.cos(last.th), vy = -sign * Math.sin(last.th);
    var ext = 0.34, M = 30;
    for (var j = 1; j <= M; j++) pts.push({ x: last.x + vx * ext * j / M, y: last.y + vy * ext * j / M, th: last.th, out: true });
    return { pts: pts, exitI: exitI, exit: last, arcLen: (exitI > 0 ? Math.abs(last.th) * r : 0), dir: { x: vx, y: vy } };
  }
  function drawBoundary(view, d, s, prog, path) {
    var ctx = view.ctx, W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    var pad = 22, pw = W - pad * 2, ph = H - pad * 2;
    var totalW = s.W + 0.46, totalH = Math.max(s.H, 0.5) + 0.16;
    var scale = Math.min(pw / totalW, ph / totalH);
    var ox = pad + (pw - totalW * scale) / 2 + 0.05 * scale;
    var oy = pad + ph / 2;
    function PX(x) { return ox + x * scale; }
    function PY(y) { return oy - y * scale; }

    // 磁场区域
    ctx.save(); ctx.fillStyle = '#F7F4FC'; ctx.strokeStyle = C.lavD; ctx.lineWidth = 2;
    ctx.fillRect(PX(0), PY(s.H / 2), s.W * scale, s.H * scale);
    ctx.strokeRect(PX(0), PY(s.H / 2), s.W * scale, s.H * scale); ctx.restore();
    for (var gx = 0.03; gx < s.W; gx += Math.max(0.045, s.W / 6)) {
      for (var gy = -s.H / 2 + 0.04; gy < s.H / 2; gy += Math.max(0.045, s.H / 5)) {
        fieldSymbol(ctx, PX(gx), PY(gy), s.bdir > 0, 5);
      }
    }
    label(ctx, '有界匀强磁场  ' + s.W.toFixed(2) + ' m × ' + s.H.toFixed(2) + ' m', PX(0), PY(s.H / 2) - 9, C.lavD);
    label(ctx, '无场区', PX(s.W) + 10, PY(s.H / 2) - 9, C.ink3);

    // 变化前轨迹（灰色虚线参考，来自参数快照）
    if (s.ref) {
      var rd = derive({ B: s.ref.B, q: s.ref.q, m: s.ref.m, v: s.ref.v, sign: s.sign, bdir: s.bdir, rev: s.rev });
      var rp = boundaryPath(rd, s).pts;
      ctx.save(); ctx.strokeStyle = '#aeb8c6'; ctx.lineWidth = 2; ctx.setLineDash([5, 6]); ctx.beginPath();
      for (var ri = 0; ri < rp.length; ri++) { if (!ri) ctx.moveTo(PX(rp[ri].x), PY(rp[ri].y)); else ctx.lineTo(PX(rp[ri].x), PY(rp[ri].y)); }
      ctx.stroke(); ctx.restore();
      label(ctx, '变化前 r = ' + nf(rd.r) + ' m（灰虚线）', 22, H - 32, '#8b95a3');
    }

    // 轨迹
    var pts = path.pts, n = pts.length, upto = Math.max(1, Math.floor(prog * (n - 1)));
    ctx.save(); ctx.strokeStyle = '#DED4F0'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (var i = 0; i < n; i++) { if (i === 0) ctx.moveTo(PX(pts[i].x), PY(pts[i].y)); else ctx.lineTo(PX(pts[i].x), PY(pts[i].y)); }
    ctx.stroke(); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.pinkD; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    for (var k = 0; k <= upto; k++) { if (k === 0) ctx.moveTo(PX(pts[k].x), PY(pts[k].y)); else ctx.lineTo(PX(pts[k].x), PY(pts[k].y)); }
    ctx.stroke(); ctx.restore();

    // 出射点
    var e = path.exit;
    ctx.save(); ctx.fillStyle = C.mintD;
    ctx.beginPath(); ctx.arc(PX(e.x), PY(e.y), 5, 0, CIRCLE); ctx.fill(); ctx.restore();
    label(ctx, '出射点', PX(e.x) + 8, PY(e.y) - 10, C.mintD);
    arrow(ctx, PX(e.x), PY(e.y), PX(e.x) + path.dir.x * 52, PY(e.y) - path.dir.y * 52, C.mintD, 'v出', 2.4);

    // 入射
    label(ctx, 'v₀', PX(0) - 30, PY(0) - 10, C.mintD);
    arrow(ctx, PX(-0.13), PY(0), PX(-0.015), PY(0), C.mintD, '', 2.4);
    var cur = pts[Math.min(upto, n - 1)];
    ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.pinkD; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(PX(cur.x), PY(cur.y), 7, 0, CIRCLE); ctx.fill(); ctx.stroke(); ctx.restore();
    label(ctx, '出射偏转 |y| = ' + Math.abs(e.y * 1000).toFixed(1) + ' mm', 22, H - 12, C.lavD);
    label(ctx, '圆心角 = ' + (Math.abs(e.th) * 180 / Math.PI).toFixed(1) + '°', W - 20, H - 12, C.ink3, 'right');
    // 横纵轴单位 + 绝对刻度尺（固定 0.1 m）
    label(ctx, 'x / m（向右）· y / m（向上）', W / 2, H - 12, C.ink3, 'center');
    var barPx = 0.1 * scale, bx0 = W - 20 - barPx;
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(bx0, 20); ctx.lineTo(W - 20, 20);
    ctx.moveTo(bx0, 16); ctx.lineTo(bx0, 24); ctx.moveTo(W - 20, 16); ctx.lineTo(W - 20, 24);
    ctx.stroke(); ctx.restore();
    label(ctx, '0.1 m', W - 20 - barPx / 2, 14, C.ink3, 'center');
  }

  /* ---------------- 关系曲线 ---------------- */
  function drawRelation(view, s, d, key) {
    var ctx = view.ctx, W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    var L = 48, R = W - 18, T = 18, B = H - 34;
    var min, max, cv, fn, title, xt;
    if (key === 'rv') {
      min = 0.5; max = 6; cv = s.v; title = 'r — v 关系（B、m、q 不变）'; xt = 'v / ×10⁶ m/s';
      fn = function (v) { return s.m * UU * v * 1e6 / (s.q * QE * s.B); };
    } else if (key === 'rB') {
      min = 0.2; max = 3; cv = s.B; title = 'r — B 关系（反比例）'; xt = 'B / T';
      fn = function (v) { return s.m * UU * s.v * 1e6 / (s.q * QE * v); };
    } else if (key === 'Tv') {
      min = 0.5; max = 6; cv = s.v; title = 'T — v 关系（水平直线）'; xt = 'v / ×10⁶ m/s';
      fn = function () { return CIRCLE * s.m * UU / (s.q * QE * s.B); };
    } else {
      min = 1; max = 20; cv = s.m; title = 'T — m 关系（正比例）'; xt = 'm / u';
      fn = function (v) { return CIRCLE * v * UU / (s.q * QE * s.B); };
    }
    // 固定绝对量程（不随当前 B、m、q 变）：r 轴 0~6.5 m，T 轴 0~1.4×10⁻⁴ s
    var ymax = (key === 'Tv' || key === 'Tm') ? 1.4e-4 : 6.5;
    function X(v) { return L + (R - L) * (v - min) / (max - min); }
    function Y(v) { return B - (B - T) * Math.min(1.05, v / ymax); }
    function refFn(x) {
      var p = s.ref || s;
      if (key === 'rv') return p.m * UU * x * 1e6 / (p.q * QE * p.B);
      if (key === 'rB') return p.m * UU * p.v * 1e6 / (p.q * QE * x);
      if (key === 'Tv') return CIRCLE * p.m * UU / (p.q * QE * p.B);
      return CIRCLE * x * UU / (p.q * QE * p.B);
    }
    ctx.save(); ctx.strokeStyle = '#e8edf2'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke(); ctx.restore();
    label(ctx, title, L + 4, T + 10, C.lavD);
    label(ctx, key.charAt(0) === 'r' ? 'r / m' : 'T / s', L - 4, T + 2, C.ink3, 'right');
    for (var g = 0; g <= 4; g++) {
      var gy = ymax * g / 4;
      ctx.save(); ctx.strokeStyle = '#f2f5f8'; ctx.beginPath(); ctx.moveTo(L, Y(gy)); ctx.lineTo(R, Y(gy)); ctx.stroke(); ctx.restore();
      label(ctx, key.charAt(0) === 'r' ? nf(gy) : (gy * 1e6).toFixed(1), L - 5, Y(gy) + 4, C.ink3, 'right');
    }
    // 变化前曲线（灰虚线，来自参数快照）
    if (s.ref) {
      ctx.save(); ctx.strokeStyle = '#aeb8c6'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath();
      for (var ri = 0; ri <= 120; ri++) {
        var rv = min + (max - min) * ri / 120;
        if (!ri) ctx.moveTo(X(rv), Y(refFn(rv))); else ctx.lineTo(X(rv), Y(refFn(rv)));
      }
      ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.strokeStyle = C.skyD; ctx.lineWidth = 2.6; ctx.beginPath();
    for (var i = 0; i <= 120; i++) {
      var v = min + (max - min) * i / 120;
      if (i === 0) ctx.moveTo(X(v), Y(fn(v))); else ctx.lineTo(X(v), Y(fn(v)));
    }
    ctx.stroke(); ctx.restore();
    label(ctx, '— 当前   ┄ 变化前', R - 2, T + 10, C.ink3, 'right');
    ctx.save(); ctx.fillStyle = C.pinkD;
    ctx.beginPath(); ctx.arc(X(cv), Y(fn(cv)), 6, 0, CIRCLE); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    label(ctx, xt, R, H - 8, C.ink2, 'right');
    label(ctx, '当前值 ' + nf(cv), L + 4, H - 8, C.pinkD, 'left');
  }

  /* ---------------- HTML ---------------- */
  function slider(key, label, min, max, step, val, unit) {
    return '<label class="cpm-ctrl"><span class="cpm-ctrl__top"><span>' + label + '</span>'
      + '<output data-out="' + key + '">' + nf(val) + ' ' + unit + '</output></span>'
      + '<input type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></label>';
  }
  function read(k, label, unit) {
    return '<div class="cpm-read"><span>' + label + '</span><strong data-read="' + k + '">—</strong><em>' + unit + '</em></div>';
  }
  function seg(name, a, b, curA, va, vb) {
    return '<div class="cpm-seg" data-seg="' + name + '">'
      + '<button type="button" data-val="' + va + '" class="' + (curA === va ? 'is-on' : '') + '">' + a + '</button>'
      + '<button type="button" data-val="' + vb + '" class="' + (curA === vb ? 'is-on' : '') + '">' + b + '</button></div>';
  }

  function buildHtml(idx, s) {
    var extra = '';
    if (idx === 1) {
      extra = '<div class="cpm-card"><div class="cpm-card__t"><i style="background:var(--sky,#BFE3F5)"></i>参数关系曲线'
        + '<span class="cpe-card__hint" style="font-size:13px;color:var(--ink3);margin-left:auto">粉色点为当前参数</span></div>'
        + '<div class="cpm-seg" data-seg="rel" style="margin-bottom:10px;flex-wrap:wrap">'
        + '<button type="button" data-val="rv" class="is-on">r — v</button>'
        + '<button type="button" data-val="rB">r — 1/B</button>'
        + '<button type="button" data-val="Tv">T — v</button>'
        + '<button type="button" data-val="Tm">T — m</button></div>'
        + '<div data-chart></div>'
        + '<div class="cpm-rel">'
        + '<div><span>r = mv / (|q|B)</span><b data-rel="r">—</b></div>'
        + '<div><span>T = 2πm / (|q|B)</span><b data-rel="T">—</b></div>'
        + '<div><span>ω = |q|B / m</span><b data-rel="w">—</b></div>'
        + '</div></div>'
        + '<div class="cpm-card"><div class="cpm-card__t"><i style="background:var(--mint,#B8E8D0)"></i>为什么周期与速度无关？</div>'
        + '<div class="cpm-formula"><b>v 变大 → r 按同比例变大</b><br>'
        + 'T = 2πr / v = 2π(mv/|q|B) / v = <b>2πm / (|q|B)</b><br>'
        + 'v 被约掉：跑得快，圈子也大，转一圈用时不变。'
        + '</div><div class="cpm-note">点「T — v」会看到一条水平直线；这正是回旋加速器能够用固定频率交变电场加速的依据。</div></div>';
    } else if (idx === 2) {
      extra = '<div class="cpm-card"><div class="cpm-card__t"><i style="background:var(--lav,#D0C4E8)"></i>有界磁场 · 出射规律</div>'
        + '<div class="cpm-formula"><b>关键：圆心在入射点的正上（下）方，距离 r</b><br>'
        + '① 若 2r &lt; 场区高度 → 粒子转半圈从入射边返回，侧移 2r<br>'
        + '② 若 r 足够大 → 从对边穿出，偏转角满足 sinθ = 场宽 / r<br>'
        + '③ 出射后沿切线做匀速直线，反向延长过轨迹中点'
        + '</div><div class="cpm-rel">'
        + '<div><span>出射侧移 |y|</span><b data-rel="y">—</b></div>'
        + '<div><span>圆心角</span><b data-rel="ang">—</b></div>'
        + '<div><span>在场内运动时间</span><b data-rel="tt">—</b></div>'
        + '</div></div>'
        + '<div class="cpm-card"><div class="cpm-card__t"><i style="background:var(--peach,#FFD8A8)"></i>边界调节</div>'
        + slider('W', '磁场区域宽度', 0.12, 0.60, 0.02, s.W, 'm')
        + slider('H', '磁场区域高度', 0.20, 0.90, 0.02, s.H, 'm')
        + '<div class="cpm-note">拖动上面两个滑块改变磁场边界，观察粒子是从右边界穿出、上下边界穿出，还是从入射边返回。切回「基本模型」可看完整圆周。</div></div>';
    } else if (idx === 3) {
      extra = '<div class="cpm-card"><div class="cpm-card__t"><i style="background:var(--pink,#FFB3BA)"></i>高考题型 · 质谱仪与比荷</div>'
        + '<div class="cpm-q"><strong>题目</strong>　带电粒子先经电压 U 由静止加速，再垂直进入磁感应强度为 B 的匀强磁场，'
        + '测得轨道半径为 r。求粒子的比荷 q/m。<br><strong>追问</strong>　若换用同种粒子但把加速电压提高到 4U，半径变为多少？</div>'
        + '<button class="cpm-btn cpm-btn--primary" type="button" data-act="ans" style="margin-top:11px">查看解析 ▾</button>'
        + '<div class="cpm-ans" data-ans hidden>'
        + '加速：qU = ½mv² → v = √(2qU/m)<br>'
        + '偏转：r = mv/(qB)，代入得 <b>r = (1/B)·√(2mU/q)</b><br>'
        + '两边平方整理：<b>q/m = 2U / (B²r²)</b><br>'
        + '电压变为 4U：r ∝ √U，故 <b>r′ = 2r</b>（周期 T 与 U、v 均无关，仍为 2πm/qB）。<br>'
        + '按当前参数：r = <b data-a="r">—</b> m，q/m = <b data-a="qm">—</b> C/kg，T = <b data-a="T">—</b> s。'
        + '</div></div>'
        + '<div class="cpm-card"><div class="cpm-card__t"><i style="background:var(--sky,#BFE3F5)"></i>易错辨析 · 选一选</div>'
        + '<div style="font-size:15px;line-height:1.8">同一粒子在同一匀强磁场中运动，下列说法正确的是？</div>'
        + '<div class="cpm-opt"><button type="button" data-opt="a">A. 速度越大，周期越大</button>'
        + '<button type="button" data-opt="b">B. 半径越大，周期越大</button>'
        + '<button type="button" data-opt="c">C. 周期与速度、半径都无关</button></div>'
        + '<div class="cpm-ans" data-optans hidden><b>答案：C。</b>T = 2πm/(|q|B)，只由粒子的比荷与磁感应强度决定，与 v、r 均无关。A、B 都错。</div></div>';
    } else {
      extra = '<div class="cpm-card"><div class="cpm-card__t"><i style="background:var(--lav,#D0C4E8)"></i>核心规律 · 洛伦兹力</div>'
        + '<div class="cpm-formula"><b>F = |q|vB（v ⊥ B 时）</b><br>'
        + '洛伦兹力始终垂直于速度 → <b>不做功，速率不变</b><br>'
        + 'F 提供向心力：|q|vB = mv²/r<br>'
        + '得 <b>r = mv/(|q|B)</b>，<b>T = 2πm/(|q|B)</b></div>'
        + '<div class="cpm-note">力只改变速度方向不改变大小——这就是匀速圆周运动。</div></div>'
        + '<div class="cpm-card"><div class="cpm-card__t"><i style="background:var(--mint,#B8E8D0)"></i>方向判定 · 左手定则</div>'
        + '<div class="cpm-formula">伸开左手让磁感线穿过手心，四指指向<b>正电荷</b>运动方向，'
        + '拇指即洛伦兹力方向；<b>负电荷受力反向</b>。<br>'
        + '图中随电荷符号与磁场方向自动切换，并在右下角标出顺时针 / 逆时针。</div>'
        + '<div class="cpm-note">场向里（×）+ 正电荷 + 向右射入 → 受力向上 → 逆时针；把电荷变负，轨迹立即反向。</div></div>';
    }

    var sliders = slider('B', '磁感应强度 B', 0.2, 3, 0.1, s.B, 'T')
      + slider('q', '电荷量 |q|（×元电荷 e）', 1, 6, 1, s.q, 'e')
      + slider('m', '质量 m（×原子质量单位 u）', 1, 20, 1, s.m, 'u')
      + slider('v', '速度 v（×10⁶ m/s）', 0.5, 6, 0.1, s.v, '×10⁶ m/s')
      + slider('rev', '动画转速', 0.15, 1.2, 0.05, s.rev, '圈/秒');

    return '<div class="cpm-wrap">'
      + '<div class="cpm-bar"><span class="cpm-chip"><i></i>' + (idx === 2 ? '有界磁场 · 出射问题' : idx === 3 ? '题型归纳 · 质谱仪' : idx === 1 ? '定量关系 · r 与 T' : '匀强磁场 · 匀速圆周') + '</span>'
      + seg('sign', '正电荷 +q', '负电荷 −q', s.sign, 1, -1)
      + seg('bdir', 'B 向里 ×', 'B 向外 ·', s.bdir, -1, 1)
      + '<span class="cpm-spacer"></span>'
      + '<button class="cpm-btn cpm-btn--primary" type="button" data-act="play">' + (s.playing ? '⏸ 暂停' : '▶ 播放') + '</button>'
      + '<button class="cpm-btn" type="button" data-act="reset">↺ 重置</button></div>'
      + '<div class="cpm-grid">'
      + '<div class="cpm-card"><div class="cpm-card__t"><i></i>' + (idx === 2 ? '粒子穿出有界磁场' : '磁场中的圆周运动')
      + '<span class="cpm-card__hint">' + (idx === 2 ? '淡紫区为磁场 · 灰虚线为变化前轨迹 · 出射后沿切线匀速' : '淡紫虚线为完整圆 · 灰虚线为变化前参考圆 · 粉色为实际轨迹') + '</span></div>'
      + '<div data-canvas></div></div>'
      + '<div class="cpm-side">'
      + '<div class="cpm-card"><div class="cpm-card__t"><i style="background:var(--pink,#FFB3BA)"></i>参数调节</div>'
      + sliders + '</div>'
      + '<div class="cpm-card"><div class="cpm-card__t"><i style="background:var(--peach,#FFD8A8)"></i>实时读数</div>'
      + '<div class="cpm-reads">'
      + read('r', '轨道半径 r', 'm') + read('T', '周期 T', 's')
      + read('w', '角速度 ω', 'rad/s') + read('F', '洛伦兹力 F', 'N')
      + read('dir', '旋转方向', '') + read('slow', '动画慢放', '倍')
      + '</div><div class="cpm-note" data-status>洛伦兹力始终垂直于速度，只改变方向不做功。</div>'
      + '</div></div></div>'
      + '<div class="cpm-extra">' + extra + '</div>'
      + '</div>';
  }

  /* ---------------- 模块注册 ---------------- */
  NS.modules['charged-particle-magnetic'] = {
    render: function (container, extIndex) {
      ensureStyle();
      var idx = Math.max(0, Math.min(3, Number(extIndex) || 0));
      var s = {
        B: saved.B, q: saved.q, m: saved.m, v: saved.v, sign: saved.sign, bdir: saved.bdir,
        rev: saved.rev, playing: saved.playing, W: saved.W, H: saved.H, rel: 'rv', theta: 0
      };
      // 初始参考快照 = 初始参数本身；入射相位由 qB 符号决定（保证水平入射 + 力指向圆心）
      s.ref = { B: s.B, q: s.q, m: s.m, v: s.v };
      s.refR = derive(s).r;
      s.theta = derive(s).wSigned > 0 ? 0 : Math.PI;
      container.innerHTML = buildHtml(idx, s);
      var view = setupCanvas(1000, 440);
      container.querySelector('[data-canvas]').appendChild(view.el);
      var chartView = idx === 1 ? setupCanvas(560, 220) : null;
      if (chartView) { chartView.el.className = 'cpm-chart'; container.querySelector('[data-chart]').appendChild(chartView.el); }

      var raf = 0, last = 0, prog = 0, dead = false, listeners = Object.create(null);
      var q1 = function (sel) { return container.querySelector(sel); };
      var qa = function (sel) { return container.querySelectorAll(sel); };
      var units = { B: 'T', q: 'e', m: 'u', v: '×10⁶ m/s', rev: '圈/秒', W: 'm', H: 'm' };
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
      function syncSaved() {
        ['B', 'q', 'm', 'v', 'sign', 'bdir', 'rev', 'playing', 'W', 'H'].forEach(function (k) { saved[k] = s[k]; });
      }
      function setRead(k, v) { var e = q1('[data-read="' + k + '"]'); if (e) e.textContent = v; }

      var sl = qa('input[type=range]');
      function snapshot() {
        s.refR = d0().r;
        s.ref = { B: s.B, q: s.q, m: s.m, v: s.v };
      }
      function inputHandler(e) {
        var k = e.target.getAttribute('data-key');
        snapshot();
        s[k] = Number(e.target.value);
        setOutputs(); syncSaved();
      }
      for (var i = 0; i < sl.length; i++) on(listeners, sl[i], 'input', inputHandler);
      var segs = qa('[data-seg]');
      function segHandler(e) {
        var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
        var name = e.currentTarget.getAttribute('data-seg'), val = b.getAttribute('data-val');
        if (name === 'rel') s.rel = val;
        else {
          snapshot();
          s[name] = name === 'sign' || name === 'bdir' ? Number(val) : val;
          if (name === 'sign' || name === 'bdir') s.theta = d0().wSigned > 0 ? 0 : Math.PI;
        }
        setSeg(name, val); syncSaved();
      }
      for (var j = 0; j < segs.length; j++) on(listeners, segs[j], 'click', segHandler);
      var pb = q1('[data-act="play"]');
      on(listeners, pb, 'click', function () { s.playing = !s.playing; pb.textContent = s.playing ? '⏸ 暂停' : '▶ 播放'; syncSaved(); });
      on(listeners, q1('[data-act="reset"]'), 'click', function () { s.theta = d0().wSigned > 0 ? 0 : Math.PI; prog = 0; });
      var ab = q1('[data-act="ans"]');
      if (ab) on(listeners, ab, 'click', function () { var box = q1('[data-ans]'); box.hidden = !box.hidden; ab.textContent = box.hidden ? '查看解析 ▾' : '收起解析 ▴'; });
      var opts = qa('[data-opt]');
      for (var oi = 0; oi < opts.length; oi++) {
        on(listeners, opts[oi], 'click', function (e) {
          for (var z = 0; z < opts.length; z++) opts[z].classList.remove('is-right');
          e.currentTarget.classList.add('is-right'); q1('[data-optans]').hidden = false;
        });
      }

      function update(d, path) {
        setRead('r', nf(d.r));
        setRead('T', d.T < 1e-3 ? (d.T * 1e6).toFixed(2) + ' µs' : d.T.toFixed(4));
        setRead('w', (d.w / 1e6).toFixed(2) + '×10⁶');
        setRead('F', d.F.toExponential(2));
        setRead('dir', d.cw ? '顺时针' : '逆时针');
        setRead('slow', d.slow >= 1e4 ? (d.slow / 1e6).toFixed(2) + '×10⁶' : nf(d.slow));
        var st = q1('[data-status]');
        if (st) st.textContent = d.cw
          ? 'qB > 0（正电荷+B向外，或负电荷+B向里）：从上端水平射入、受力向下，顺时针；灰虚线为变化前。'
          : 'qB < 0（正电荷+B向里，或负电荷+B向外）：从下端水平射入、受力向上，逆时针；周期 T 不受影响。';
        if (idx === 1) {
          var r1 = q1('[data-rel="r"]'), r2 = q1('[data-rel="T"]'), r3 = q1('[data-rel="w"]');
          if (r1) r1.textContent = nf(d.r) + ' m';
          if (r2) r2.textContent = (d.T * 1e6).toFixed(2) + ' µs';
          if (r3) r3.textContent = (d.w / 1e6).toFixed(2) + ' ×10⁶ rad/s';
          drawRelation(chartView, s, d, s.rel);
        }
        if (idx === 2 && path) {
          var e = path.exit;
          var set = function (k, v) { var el = q1('[data-rel="' + k + '"]'); if (el) el.textContent = v; };
          set('y', Math.abs(e.y * 1000).toFixed(1) + ' mm');
          set('ang', (Math.abs(e.th) * 180 / Math.PI).toFixed(1) + '°');
          set('tt', (Math.abs(e.th) / d.w * 1e6).toFixed(2) + ' µs');
        }
        if (idx === 3) {
          var sa = function (k, v) { var el = q1('[data-a="' + k + '"]'); if (el) el.textContent = v; };
          sa('r', nf(d.r)); sa('qm', (Math.abs(d.q) / d.m).toExponential(2)); sa('T', (d.T * 1e6).toFixed(2) + ' µs');
        }
      }

      function frame(ts) {
        if (dead) return;
        if (!last) last = ts;
        var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
        if (s.playing) {
          s.theta += (d0().wSigned > 0 ? 1 : -1) * CIRCLE * s.rev * dt;
          prog += dt / 3.6; if (prog > 1) prog = 0;
        }
        var d = d0();
        if (idx === 2) {
          var path = boundaryPath(d, s);
          drawBoundary(view, d, s, prog, path); update(d, path);
        } else {
          drawOrbit(view, d, s, s.theta); update(d, null);
        }
        raf = global.requestAnimationFrame(frame);
      }
      function d0() { return derive(s); }
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
