/* ============================================================
 * projectile-motion.js — 平抛与类平抛交互模块
 * 契约：IIFE + window.ModelLab.modules['projectile-motion']
 * render(container, extIndex) -> cleanup()
 * 水平 x=v₀t 匀速；竖直 y=½at² 匀加速；类平抛 a=qE/m
 * 读数均为示意值
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};

  var STYLE = `
<style>
.pj-wrap{color:var(--ink,#3a4250);font-size:15px}
.pj-grid{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(296px,.88fr);gap:16px;align-items:start}
@media(max-width:1080px){.pj-grid{grid-template-columns:1fr}}
.pj-card{background:var(--surface,#fff);border:1px solid var(--line-2,#dce4ec);border-radius:16px;box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:14px 16px}
.pj-card+.pj-card{margin-top:14px}
.pj-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.pj-hd h4{font-size:16px;font-weight:700;line-height:1.4}
.pj-hd small{font-size:12px;color:var(--ink-3,#8b95a3);white-space:nowrap}
canvas.pj-cv{display:block;width:100%;height:216px;border-radius:10px;background:#fcfdfe;border:1px solid var(--line,#e8edf2)}
canvas.pj-cv.chart{height:152px}
.pj-intro{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center}
.pj-chip{padding:5px 11px;border:1px solid var(--line-2,#dce4ec);border-radius:999px;background:#fff;font-size:13px;color:var(--ink-2,#5a6472)}
.pj-chip b{color:var(--ink,#3a4250)}
.pj-chip.hot{background:#FFF8EE;border-color:#FFD8A8}
.pj-ctrl{margin-top:10px}
.pj-ctrl label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-2,#5a6472);margin-bottom:2px}
.pj-ctrl label b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}
input.pj-range{width:100%;height:22px;margin:0;background:transparent;border:0;-webkit-appearance:none;appearance:none;cursor:pointer}
input.pj-range::-webkit-slider-runnable-track{height:6px;background:#e8edf2;border-radius:99px}
input.pj-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-6px;border-radius:50%;background:#FFD8A8;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
input.pj-range::-moz-range-track{height:6px;background:#e8edf2;border-radius:99px}
input.pj-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#FFD8A8;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
.pj-btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.pj-btn{min-height:38px;padding:7px 14px;border:1px solid var(--line-2,#dce4ec);border-radius:9px;background:#fff;color:var(--ink,#3a4250);font-size:13px;font-weight:600}
.pj-btn:hover{background:#FFF8EE;border-color:#FFD8A8}
.pj-btn.main{background:#FFF8EE;border-color:#FFD8A8}
.pj-btn.seg.on{background:#F1F8FD;border-color:#BFE3F5;color:#3f7fa5}
.pj-reads{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.pj-read{padding:8px 10px;background:#fafbfc;border:1px solid var(--line,#e8edf2);border-radius:9px;min-width:0}
.pj-read span{display:block;font-size:11px;color:var(--ink-3,#8b95a3);white-space:nowrap}
.pj-read b{font-size:16px;font-variant-numeric:tabular-nums;white-space:nowrap}
.pj-read.hl{background:#FFF8EE;border-color:#F2D9B6}
.pj-legend{display:flex;gap:13px;flex-wrap:wrap;font-size:12px;color:var(--ink-2,#5a6472);margin-top:8px}
.pj-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.pj-tip{margin-top:10px;padding:9px 12px;background:#F1F8FD;border:1px solid #BFE3F5;border-radius:9px;font-size:12.5px;color:var(--ink-2,#5a6472);line-height:1.6}
.pj-decomp{margin-top:12px}
.pj-drow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 11px;border:1px solid var(--line,#e8edf2);border-radius:9px;background:#fafbfc;margin-bottom:7px}
.pj-drow span{font-size:13px;color:var(--ink-2,#5a6472)}
.pj-drow b{font-size:14px}
.pj-drow .arr{color:#e0a458}
.pj-drow .arrb{color:#6fa9cc}
.pj-eq{padding:9px 12px;background:#F7F4FC;border:1px solid #D0C4E8;border-radius:9px;font-size:13px;line-height:1.7;color:#6e57a0}
.pj-quiz{border-top:1px dashed var(--line-2,#dce4ec);margin-top:14px;padding-top:12px}
.pj-quiz h5{font-size:14px;margin:0 0 8px;font-weight:700}
.pj-quiz p{font-size:13px;color:var(--ink-2,#5a6472);line-height:1.6;margin:0 0 8px}
.pj-opts{display:flex;gap:7px;flex-wrap:wrap}
.pj-opt{padding:6px 12px;border:1px solid var(--line-2,#dce4ec);border-radius:8px;background:#fff;font-size:13px;min-height:36px}
.pj-opt:hover{border-color:#FFD8A8;background:#FFF8EE}
.pj-fb{margin-top:8px;font-size:12.5px;line-height:1.6;min-height:20px;color:var(--ink-2,#5a6472)}
.pj-fb.ok{color:#2f8f68}
.pj-fb.no{color:#c26b7a}
.pj-mode{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
</style>`;

  function introHTML(ext) {
    var focus = [
      '水平 <b>x = v₀t</b> 匀速 · 竖直 <b>y = ½gt²</b> 自由落体',
      '分运动独立：<b>vx 不变，vy = at 增大</b>',
      '类平抛：<b>a = qE/m</b> 取代 g',
      '轨迹 <b>y = (a / 2v₀²)x²</b> 为抛物线'
    ][ext];
    return '<div class="pj-intro"><span class="pj-chip hot">' + focus + '</span>'
      + '<span class="pj-chip">飞行时间 <b>t = √(2h/a)</b></span>'
      + '<span class="pj-chip">读数为<b>示意值</b></span></div>';
  }

  function stageCard() {
    return '<div class="pj-card"><div class="pj-hd"><h4>抛体运动演示</h4>'
      + '<small>小球沿抛物线飞行，箭头为分速度</small></div>'
      + '<canvas class="pj-cv" data-cv="stage"></canvas>'
      + '<div class="pj-legend">'
      + '<span><i style="background:#FFD8A8"></i>水平分速度 vx</span>'
      + '<span><i style="background:#BFE3F5"></i>竖直分速度 vy</span>'
      + '<span><i style="background:#FFB3BA"></i>合速度 v</span>'
      + '<span><i style="background:#D0C4E8"></i>预测轨迹</span>'
      + '</div></div>';
  }
  function chartCard(ext) {
    var title = ['轨迹预览 y–x', '分速度与分位移图线', '不同场的轨迹对比', '轨迹预览 y–x'][ext];
    return '<div class="pj-card"><div class="pj-hd"><h4>' + title + '</h4>'
      + '<small>' + (ext === 2 ? '虚线为对照情形' : ext === 1 ? 'vx 恒定，vy 线性增大' : '游标与小球同步') + '</small></div>'
      + '<canvas class="pj-cv chart" data-cv="chart"></canvas></div>';
  }

  function row(key, label, min, max, step, val, unit) {
    return '<div class="pj-ctrl"><label><span>' + label + '</span><b><span data-out="' + key + '">' + val + '</span> ' + unit + '</b></label>'
      + '<input class="pj-range" type="range" data-slider="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></div>';
  }
  function ctrlHTML(ext) {
    var elec = ext === 2 ? (
      row('E', '电场强度 E', 1, 20, 1, 8, 'N/C')
      + row('qch', '电荷量 q', 0.1, 2, 0.1, 0.8, 'C')
      + row('mm', '粒子质量 m', 0.5, 4, 0.1, 1.0, 'kg')) : '';
    var modeBtns = ext === 2 ? (
      '<div class="pj-mode">'
      + '<button type="button" class="pj-btn seg on" data-field="both">重力+电场</button>'
      + '<button type="button" class="pj-btn seg" data-field="gravity">仅重力</button>'
      + '<button type="button" class="pj-btn seg" data-field="electric">仅电场</button>'
      + '</div>') : '';
    return '<div class="pj-card"><div class="pj-hd"><h4>参数调节</h4><small>拖动即时改变轨迹</small></div>'
      + row('v0', '初速度 v₀', 2, 30, 1, 12, 'm/s')
      + row('h', '下落高度 h', 2, 20, 1, 10, 'm')
      + row('g', '重力加速度 g', 1, 20, 0.1, 9.8, 'm/s²')
      + elec + modeBtns
      + '<div class="pj-btns">'
      + '<button type="button" class="pj-btn main" data-btn="toggle">暂停</button>'
      + '<button type="button" class="pj-btn" data-btn="relaunch">重新发射</button>'
      + '</div></div>';
  }

  function readsHTML(ext) {
    function r(key, label, hl) {
      return '<div class="pj-read' + (hl ? ' hl' : '') + '"><span>' + label + '</span><b data-read="' + key + '">—</b></div>';
    }
    var sixth = ext === 2 ? r('ae', '等效加速度 a / (m/s²)', false) : r('vy', '竖直速度 vy / (m/s)', false);
    return '<div class="pj-card"><div class="pj-hd"><h4>实时读数</h4><small>随小球刷新</small></div>'
      + '<div class="pj-reads">'
      + r('t', '飞行时间 t / s', true) + r('x', '水平位移 x / m', true) + r('y', '竖直位移 y / m', true)
      + r('Tf', '落地时间 / s', false) + r('R', '水平射程 / m', false) + sixth
      + '</div><div class="pj-tip">落地速度 v = √(v₀² + 2ah)；飞行时间只由 h 与 a 决定，与 v₀ 无关。</div></div>';
  }

  function decompHTML() {
    return '<div class="pj-card"><div class="pj-hd"><h4>分解与合成</h4><small>两个方向互不干扰</small></div>'
      + '<div class="pj-decomp">'
      + '<div class="pj-drow"><span>水平方向</span><b class="arr">vx = v₀（恒定） →</b></div>'
      + '<div class="pj-drow"><span>竖直方向</span><b class="arrb">vy = at（均匀增大） ↓</b></div>'
      + '<div class="pj-eq">任一时刻：<b>vx 恒定、vy 增大</b>；合速度 v = √(vx² + vy²)，位移 x = v₀t、y = ½at²。水平与竖直分运动彼此独立、等时。</div>'
      + '</div></div>';
  }

  function quizHTML() {
    var qs = [
      { id: 'q1', title: '① 高度与飞行时间', desc: '保持 v₀、g 不变，把高度 h 增大为原来的 4 倍，飞行时间变为？', opts: ['2 倍', '4 倍', '不变'], right: 0,
        ex: '正确。t = √(2h/g) ∝ √h，h 变为 4 倍，t 变为 2 倍。' },
      { id: 'q2', title: '② 初速度与射程', desc: '保持 h、g 不变，把初速度 v₀ 加倍，水平射程变为？', opts: ['不变', '1/2 倍', '2 倍'], right: 2,
        ex: '正确。t 不变，射程 x = v₀t ∝ v₀，所以变为 2 倍。' }
    ];
    return '<div class="pj-card"><div class="pj-hd"><h4>高考题型 · 随堂练</h4><small>点选项看解析</small></div>'
      + qs.map(function (q) {
        return '<div class="pj-quiz"><h5>' + q.title + '</h5><p>' + q.desc + '</p>'
          + '<div class="pj-opts">' + q.opts.map(function (o, i) {
            return '<button type="button" class="pj-opt" data-q="' + q.id + '" data-i="' + i + '">' + o + '</button>';
          }).join('') + '</div><div class="pj-fb" data-fb="' + q.id + '"></div></div>';
      }).join('') + '</div>';
  }

  /* ---------- 画布工具 ---------- */
  function mkCanvas(el) { return { el: el, ctx: el.getContext('2d'), w: 0, h: 0, dpr: 0 }; }
  function fit(c) {
    var w = c.el.clientWidth, h = c.el.clientHeight;
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    if (!w || !h) return c;
    if (w !== c.w || h !== c.h || dpr !== c.dpr) {
      c.w = w; c.h = h; c.dpr = dpr;
      c.el.width = Math.round(w * dpr); c.el.height = Math.round(h * dpr);
      c.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    return c;
  }
  function line(c, x1, y1, x2, y2, color, width, dash) {
    var x = c.ctx || c; x.save(); x.beginPath();
    if (dash) x.setLineDash(dash);
    x.strokeStyle = color; x.lineWidth = width || 1;
    x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); x.restore();
  }
  function text(c, s, x, y, color, size, align) {
    var g = c.ctx || c; g.save(); g.fillStyle = color || '#8b95a3';
    g.font = (size || 12) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    g.textAlign = align || 'left'; g.textBaseline = 'middle'; g.fillText(s, x, y); g.restore();
  }
  function dot(c, x, y, r, fill, stroke) {
    var g = c.ctx || c; g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = fill; g.fill();
    if (stroke) { g.lineWidth = 2; g.strokeStyle = stroke; g.stroke(); }
    g.restore();
  }

  NS.modules['projectile-motion'] = {
    render: function (container, extIndex) {
      extIndex = (extIndex | 0);
      if (extIndex < 0 || extIndex > 3) extIndex = 0;

      var sideExtra = extIndex === 1 ? decompHTML() : extIndex === 3 ? quizHTML() : '';

      container.innerHTML = STYLE + '<div class="pj-wrap">'
        + introHTML(extIndex)
        + '<div class="pj-grid"><div>' + stageCard() + chartCard(extIndex) + '</div>'
        + '<div>' + ctrlHTML(extIndex) + readsHTML(extIndex) + sideExtra + '</div></div></div>';

      var q1 = function (s) { return container.querySelector(s); };
      var qa = function (s) { return container.querySelectorAll(s); };
      var stage = mkCanvas(q1('[data-cv="stage"]'));
      var chart = mkCanvas(q1('[data-cv="chart"]'));
      var disposers = [];
      function on(target, type, fn, opt) {
        target.addEventListener(type, fn, opt);
        disposers.push(function () { target.removeEventListener(type, fn, opt); });
      }

      var state = {
        v0: 12, h: 10, g: 9.8, E: 8, qch: 0.8, mm: 1,
        field: 'both', fieldLabel: '重力+电场', running: true, t: 0, hold: 0, last: 0
      };
      var FIELD_LABEL = { both: '重力+电场', gravity: '仅重力', electric: '仅电场' };
      function aGravity() { return state.g; }
      function aElectric() { return state.qch * state.E / state.mm; }
      function accel() {
        if (extIndex !== 2) return aGravity();
        if (state.field === 'gravity') return aGravity();
        if (state.field === 'electric') return aElectric();
        return aGravity() + aElectric();
      }
      function Tf() { return Math.sqrt(2 * state.h / Math.max(0.1, accel())); }
      function range() { return state.v0 * Tf(); }
      function relaunch() { state.t = 0; state.hold = 0; state.running = true; var b = q1('[data-btn="toggle"]'); if (b) b.textContent = '暂停'; }

      /* ---------- 控件 ---------- */
      // 变化前的完整轨迹参数，舞台与 y–x 图都用灰虚线叠加对照
      var refPath = { v0: state.v0, a: accel(), tf: Tf() };
      qa('[data-slider]').forEach(function (el) {
        var key = el.getAttribute('data-slider');
        on(el, 'input', function () {
          var v = parseFloat(el.value);
          refPath = { v0: state.v0, a: accel(), tf: Tf() };
          state[key] = v;
          var out = q1('[data-out="' + key + '"]');
          if (out) out.textContent = (key === 'g' || key === 'qch' || key === 'mm') ? v.toFixed(1) : String(v);
          relaunch();
        });
      });
      var toggleBtn = q1('[data-btn="toggle"]');
      on(toggleBtn, 'click', function () {
        state.running = !state.running;
        toggleBtn.textContent = state.running ? '暂停' : '继续';
        toggleBtn.classList.toggle('main', state.running);
      });
      on(q1('[data-btn="relaunch"]'), 'click', relaunch);
      qa('[data-field]').forEach(function (el) {
        on(el, 'click', function () {
          refPath = { v0: state.v0, a: accel(), tf: Tf() };
          state.field = el.getAttribute('data-field');
          state.fieldLabel = FIELD_LABEL[state.field] || state.field;
          qa('[data-field]').forEach(function (b) { b.classList.toggle('on', b === el); });
          relaunch();
        });
      });

      var rightAns = { q1: 0, q2: 2 };
      var exMap = {
        q1: '正确。t ∝ √h，h 变为 4 倍，t 变为 2 倍。',
        q2: '正确。t 不变，x = v₀t ∝ v₀，射程变为 2 倍。'
      };
      qa('[data-q]').forEach(function (btn) {
        on(btn, 'click', function () {
          var id = btn.getAttribute('data-q'), i = parseInt(btn.getAttribute('data-i'), 10);
          var fb = q1('[data-fb="' + id + '"]');
          var ok = i === rightAns[id];
          fb.className = 'pj-fb ' + (ok ? 'ok' : 'no');
          fb.textContent = (ok ? '✓ ' : '✗ ') + exMap[id];
        });
      });

      /* ---------- 几何 ---------- */
      function geom() {
        var w = stage.w, h = stage.h;
        // 固定物理量程：视野 x=0~60 m、y=0~20 m（不随射程/高度自归一化）
        var padL = 42, padR = 18, padT = 24, padB = 34;
        var availW = w - padL - padR, availH = h - padT - padB;
        var Xref = 60, Yref = 20;
        var s = Math.min(availW / Xref, availH / Yref);
        var tf = Tf(), r = range();
        var ox = padL, oy = (h - padB) - state.h * s;
        return { s: s, ox: ox, oy: oy, tf: tf, r: r, Xref: Xref, Yref: Yref };
      }

      function drawStage() {
        fit(stage);
        var c = stage.ctx, w = stage.w, h = stage.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var G = geom();
        var ox = G.ox, oy = G.oy, s = G.s;
        var a = accel();
        var tf = Tf();

        // 地面与高度标尺
        line(c, 16, oy + state.h * s, w - 16, oy + state.h * s, '#cbd6e2', 2);
        for (var gx = 20; gx < w - 20; gx += 16) line(c, gx, oy + state.h * s + 2, gx - 7, oy + state.h * s + 9, '#e8edf2', 1);
        line(c, ox - 6, oy, ox - 6, oy + state.h * s, '#e8edf2', 1, [3, 4]);
        text(c, 'h = ' + state.h + ' m', ox - 10, oy + state.h * s / 2, '#8b95a3', 11, 'right');
        // 发射台
        c.save(); c.fillStyle = '#f0f4f8'; c.fillRect(ox - 20, oy - 2, 24, 6); c.restore();
        text(c, 'v₀ = ' + state.v0 + ' m/s →', ox + 4, oy - 16, '#e0a458', 12);

        // 完整预测轨迹（淡紫虚线）
        c.save(); c.beginPath();
        for (var p = 0; p <= 120; p++) {
          var tt = p / 120 * tf;
          var X = ox + state.v0 * tt * s, Y = oy + 0.5 * a * tt * tt * s;
          if (p === 0) c.moveTo(X, Y); else c.lineTo(X, Y);
        }
        c.strokeStyle = '#D0C4E8'; c.lineWidth = 1.5; c.setLineDash([5, 5]); c.stroke(); c.restore();
        // 变化前轨迹（固定量程下的灰虚线基准）
        c.save(); c.beginPath();
        for (var pr = 0; pr <= 120; pr++) {
          var tr = pr / 120 * refPath.tf;
          var Xr = ox + refPath.v0 * tr * s, Yr = oy + 0.5 * refPath.a * tr * tr * s;
          if (pr === 0) c.moveTo(Xr, Yr); else c.lineTo(Xr, Yr);
        }
        c.strokeStyle = '#c9d4e0'; c.lineWidth = 1.5; c.setLineDash([3, 4]); c.stroke(); c.restore();
        text(c, '灰虚线 = 变化前', w - 16, 20, '#9aa4b0', 10, 'right');
        // 固定绝对刻度（m）
        [0, 20, 40, 60].forEach(function (xm) {
          var Xt = ox + xm * s;
          if (Xt > w - 12) return;
          line(c, Xt, oy + state.h * s, Xt, oy + state.h * s + 4, '#cbd6e2', 1);
          text(c, String(xm), Xt, oy + state.h * s + 14, '#aab4c0', 10, 'center');
        });

        // 已飞过轨迹（粉）
        var tcur = Math.min(state.t, tf);
        c.save(); c.beginPath();
        for (var p2 = 0; p2 <= 120; p2++) {
          var tt2 = p2 / 120 * tcur;
          var X2 = ox + state.v0 * tt2 * s, Y2 = oy + 0.5 * a * tt2 * tt2 * s;
          if (p2 === 0) c.moveTo(X2, Y2); else c.lineTo(X2, Y2);
        }
        c.strokeStyle = '#FFB3BA'; c.lineWidth = 2.5; c.stroke(); c.restore();

        // 类平抛对比轨迹
        if (extIndex === 2) {
          var modes = [
            { a: aGravity(), color: '#BFE3F5', dash: [4, 4], label: '仅重力' },
            { a: aElectric(), color: '#B8E8D0', dash: [5, 4], label: '仅电场' }
          ];
          modes.forEach(function (m) {
            var ttf = Math.sqrt(2 * state.h / Math.max(0.1, m.a));
            c.save(); c.beginPath();
            for (var p3 = 0; p3 <= 100; p3++) {
              var t3 = p3 / 100 * ttf;
              var X3 = ox + state.v0 * t3 * s, Y3 = oy + 0.5 * m.a * t3 * t3 * s;
              if (p3 === 0) c.moveTo(X3, Y3); else c.lineTo(X3, Y3);
            }
            c.strokeStyle = m.color; c.lineWidth = 1.6; c.setLineDash(m.dash); c.stroke(); c.restore();
          });
          text(c, '粉：重力+电场　蓝：仅重力　绿：仅电场', 14, h - 12, '#8b95a3', 11);
        }

        // 小球与分速度箭头
        var bx = ox + state.v0 * tcur * s;
        var by = oy + 0.5 * a * tcur * tcur * s;
        if (state.hold <= 0 || tcur < tf) {
          dot(c, bx, by, 9, '#FFB3BA', '#f28f9a');
          var vx = state.v0, vy = a * tcur;
          var vxLen = Math.min(80, vx * 3.2), vyLen = Math.min(80, vy * 3.2);
          line(c, bx, by, bx + vxLen, by, '#FFD8A8', 3);
          c.save(); c.beginPath(); c.moveTo(bx + vxLen, by); c.lineTo(bx + vxLen - 8, by - 5);
          c.lineTo(bx + vxLen - 8, by + 5); c.closePath(); c.fillStyle = '#FFD8A8'; c.fill(); c.restore();
          text(c, 'vx=' + vx.toFixed(1), bx + vxLen / 2, by - 12, '#e0a458', 11, 'center');
          if (vyLen > 3) {
            line(c, bx, by, bx, by + vyLen, '#BFE3F5', 3);
            c.save(); c.beginPath(); c.moveTo(bx, by + vyLen); c.lineTo(bx - 5, by + vyLen - 8);
            c.lineTo(bx + 5, by + vyLen - 8); c.closePath(); c.fillStyle = '#BFE3F5'; c.fill(); c.restore();
            text(c, 'vy=' + vy.toFixed(1), bx + 10, by + vyLen / 2, '#6fa9cc', 11);
          }
          var vlen = Math.min(96, Math.sqrt(vx * vx + vy * vy) * 2.6);
          var ang = Math.atan2(vy, vx);
          line(c, bx, by, bx + vlen * Math.cos(ang), by + vlen * Math.sin(ang), '#FFB3BA', 1.5, [4, 3]);
        } else {
          dot(c, ox + range() * s, oy + state.h * s, 8, '#FFB3BA', '#f28f9a');
        }
        text(c, 't = ' + tcur.toFixed(2) + ' s', w - 14, 18, '#5a6472', 12, 'right');
      }

      function drawChart() {
        if (extIndex === 1) drawDecompChart();
        else if (extIndex === 2) drawCompareChart();
        else drawTrackChart();
      }

      function drawTrackChart() {
        fit(chart);
        var c = chart.ctx, w = chart.w, h = chart.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var pad = { l: 38, r: 16, t: 14, b: 26 };
        var a = accel(), tf = Tf(), R = range();
        var x0 = pad.l, x1 = w - pad.r, top = pad.t + 4, bot = h - pad.b;
        line(c, x0, bot, x1, bot, '#cbd6e2', 1);
        line(c, x0, top, x0, bot, '#cbd6e2', 1);
        text(c, 'y / m（向下）', x0 + 2, top + 4, '#8b95a3', 11);
        text(c, 'x / m', x1, h - 8, '#8b95a3', 11, 'right');
        var scale = Math.min((x1 - x0) / 60, (bot - top) / 20);   // 固定量程 x 60 m、y 20 m
        for (var xm = 0; xm <= 60; xm += 20) {
          var Xg = x0 + xm * scale;
          line(c, Xg, top, Xg, bot, '#f0f4f8', 1);
          text(c, String(xm), Xg, bot + 12, '#aab4c0', 10, 'center');
        }
        for (var ym = 0; ym <= 20; ym += 5) {
          var Yg = bot - ym * scale;
          line(c, x0, Yg, x1, Yg, '#f0f4f8', 1);
          text(c, String(ym), x0 - 6, Yg, '#aab4c0', 10, 'right');
        }
        c.save(); c.beginPath();
        for (var pr = 0; pr <= 120; pr++) {
          var tr = pr / 120 * refPath.tf, pxr = refPath.v0 * tr;
          var Xr = x0 + pxr * scale, Yr = bot - 0.5 * refPath.a * tr * tr * scale;
          if (pr === 0) c.moveTo(Xr, Yr); else c.lineTo(Xr, Yr);
        }
        c.strokeStyle = '#c9d4e0'; c.lineWidth = 1.6; c.setLineDash([4, 4]); c.stroke(); c.restore();
        c.save(); c.beginPath();
        for (var p = 0; p <= 120; p++) {
          var px = p / 120 * R, py = a * px * px / (2 * state.v0 * state.v0);
          var X = x0 + px * scale, Y = bot - py * scale;
          if (p === 0) c.moveTo(X, Y); else c.lineTo(X, Y);
        }
        c.strokeStyle = '#FFB3BA'; c.lineWidth = 2.5; c.stroke(); c.restore();
        var tcur = Math.min(state.t, tf);
        var cx = x0 + state.v0 * tcur * scale;
        var cy = bot - 0.5 * a * tcur * tcur * scale;
        dot(c, cx, cy, 5, '#FFB3BA', '#fff');
        text(c, '射程 ' + R.toFixed(1) + ' m（灰虚线 = 变化前）', x1 - 4, top + 8, '#8b6a72', 11, 'right');
      }

      function drawDecompChart() {
        fit(chart);
        var c = chart.ctx, w = chart.w, h = chart.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var half = w / 2;
        var a = accel(), tf = Tf();
        drawMini(c, 12, half - 16, h, 'vx 恒定 / vy 线性增大', tf, function (t) { return state.v0; }, '#FFD8A8', function (t) { return a * t; }, '#BFE3F5', Math.max(a * tf, state.v0));
        drawMini(c, half + 10, w - 12, h, 'x 线性 / y 二次增长', tf, function (t) { return state.v0 * t; }, '#FFD8A8', function (t) { return 0.5 * a * t * t; }, '#BFE3F5', Math.max(state.v0 * tf, 0.5 * a * tf * tf));
        line(c, half, 8, half, h - 12, '#e8edf2', 1);
      }
      function drawMini(c, x0, x1, h, title, tf, f1, c1, f2, c2, vmax) {
        var top = 28, bot = h - 26;
        text(c, title, (x0 + x1) / 2, 12, '#5a6472', 12, 'center');
        line(c, x0, bot, x1, bot, '#cbd6e2', 1);
        function plot(fn, color) {
          c.save(); c.beginPath();
          for (var i = 0; i <= 60; i++) {
            var t = tf * i / 60, px = x0 + i / 60 * (x1 - x0), py = bot - fn(t) / vmax * (bot - top);
            if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
          }
          c.strokeStyle = color; c.lineWidth = 2.4; c.stroke(); c.restore();
        }
        plot(f1, c1); plot(f2, c2);
        var tcur = Math.min(state.t, tf);
        var cx = x0 + tcur / tf * (x1 - x0);
        line(c, cx, top, cx, bot, '#e8edf2', 1, [3, 3]);
        dot(c, cx, bot - f1(tcur) / vmax * (bot - top), 4, c1, '#fff');
        dot(c, cx, bot - f2(tcur) / vmax * (bot - top), 4, c2, '#fff');
        text(c, 't=0', x0, bot + 12, '#8b95a3', 10);
        text(c, 't=' + tf.toFixed(2), x1, bot + 12, '#8b95a3', 10, 'right');
      }

      function drawCompareChart() {
        fit(chart);
        var c = chart.ctx, w = chart.w, h = chart.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var pad = { l: 38, r: 16, t: 14, b: 26 };
        var x0 = pad.l, x1 = w - pad.r, top = pad.t + 4, bot = h - pad.b;
        line(c, x0, bot, x1, bot, '#cbd6e2', 1);
        line(c, x0, top, x0, bot, '#cbd6e2', 1);
        text(c, 'y / m（向下）', x0 + 2, top + 4, '#8b95a3', 11);
        text(c, 'x / m', x1, h - 8, '#8b95a3', 11, 'right');
        var modes = [
          { a: aGravity() + aElectric(), color: '#FFB3BA', label: '重力+电场' },
          { a: aGravity(), color: '#BFE3F5', label: '仅重力' },
          { a: aElectric(), color: '#B8E8D0', label: '仅电场' }
        ];
        // 固定量程 x 60 m、y 20 m；三条曲线随 a 真实分开/合拢
        var scale = Math.min((x1 - x0) / 60, (bot - top) / 20);
        for (var xm = 0; xm <= 60; xm += 20) {
          var Xg = x0 + xm * scale;
          line(c, Xg, top, Xg, bot, '#f0f4f8', 1);
          text(c, String(xm), Xg, bot + 12, '#aab4c0', 10, 'center');
        }
        for (var ym = 0; ym <= 20; ym += 5) {
          var Yg = bot - ym * scale;
          line(c, x0, Yg, x1, Yg, '#f0f4f8', 1);
          text(c, String(ym), x0 - 6, Yg, '#aab4c0', 10, 'right');
        }
        modes.forEach(function (m) {
          var R = state.v0 * Math.sqrt(2 * state.h / Math.max(0.1, m.a));
          c.save(); c.beginPath();
          for (var p = 0; p <= 100; p++) {
            var px = p / 100 * R, py = m.a * px * px / (2 * state.v0 * state.v0);
            if (p === 0) c.moveTo(x0 + px * scale, bot - py * scale);
            else c.lineTo(x0 + px * scale, bot - py * scale);
          }
          c.strokeStyle = m.color; c.lineWidth = 2.2;
          if (m.label !== state.fieldLabel) c.setLineDash([5, 4]);
          c.stroke(); c.restore();
        });
        text(c, '粉：重力+电场　蓝：仅重力　绿：仅电场', (x0 + x1) / 2, h - 8, '#8b95a3', 10, 'center');
        text(c, '实线：' + state.fieldLabel, x1 - 4, top + 8, '#8b6fb0', 10, 'right');
      }

      function updateReads() {
        var a = accel(), tf = Tf();
        var t = Math.min(state.t, tf);
        var x = state.v0 * t, y = 0.5 * a * t * t;
        var vy = a * t;
        function set(k, val) { var el = q1('[data-read="' + k + '"]'); if (el) el.textContent = val; }
        set('t', t.toFixed(2));
        set('x', x.toFixed(2));
        set('y', y.toFixed(2));
        set('Tf', tf.toFixed(2));
        set('R', range().toFixed(2));
        if (extIndex === 2) set('ae', a.toFixed(2)); else set('vy', vy.toFixed(2));
      }

      /* ---------- 主动画 ---------- */
      var raf = 0;
      function loop(now) {
        if (!state.last) state.last = now;
        var dt = Math.min(0.05, (now - state.last) / 1000);
        state.last = now;
        if (state.running) {
          if (state.hold > 0) {
            state.hold -= dt;
            if (state.hold <= 0) state.t = 0;
          } else {
            state.t += dt;
            if (state.t >= Tf()) { state.t = Tf(); state.hold = 0.7; }
          }
        }
        drawStage();
        drawChart();
        updateReads();
        raf = global.requestAnimationFrame(loop);
      }
      raf = global.requestAnimationFrame(loop);

      return function cleanup() {
        global.cancelAnimationFrame(raf);
        disposers.forEach(function (fn) { fn(); });
        disposers.length = 0;
        container.innerHTML = '';
      };
    }
  };
})(window);
