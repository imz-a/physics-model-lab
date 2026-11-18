/* ============================================================
 * pendulum.js — 单摆交互模块
 * 契约：IIFE + window.ModelLab.modules['pendulum']
 * render(container, extIndex) -> cleanup()
 * 小角度：θ=θ₀cos(ωt), ω=√(g/L)；大角度：RK4 数值积分 + AGM 精确周期
 * 读数均为示意值
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};

  var STYLE = `
<style>
.pd-wrap{color:var(--ink,#3a4250);font-size:15px}
.pd-grid{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(296px,.88fr);gap:16px;align-items:start}
@media(max-width:1080px){.pd-grid{grid-template-columns:1fr}}
.pd-card{background:var(--surface,#fff);border:1px solid var(--line-2,#dce4ec);border-radius:16px;box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:14px 16px}
.pd-card+.pd-card{margin-top:14px}
.pd-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.pd-hd h4{font-size:16px;font-weight:700;line-height:1.4}
.pd-hd small{font-size:12px;color:var(--ink-3,#8b95a3);white-space:nowrap}
canvas.pd-cv{display:block;width:100%;height:214px;border-radius:10px;background:#fcfdfe;border:1px solid var(--line,#e8edf2)}
canvas.pd-cv.chart{height:150px}
.pd-intro{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center}
.pd-chip{padding:5px 11px;border:1px solid var(--line-2,#dce4ec);border-radius:999px;background:#fff;font-size:13px;color:var(--ink-2,#5a6472)}
.pd-chip b{color:var(--ink,#3a4250)}
.pd-chip.hot{background:#FFF4F5;border-color:#FFB3BA}
.pd-ctrl{margin-top:10px}
.pd-ctrl label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-2,#5a6472);margin-bottom:2px}
.pd-ctrl label b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}
input.pd-range{width:100%;height:22px;margin:0;background:transparent;border:0;-webkit-appearance:none;appearance:none;cursor:pointer}
input.pd-range::-webkit-slider-runnable-track{height:6px;background:#e8edf2;border-radius:99px}
input.pd-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-6px;border-radius:50%;background:#D0C4E8;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
input.pd-range::-moz-range-track{height:6px;background:#e8edf2;border-radius:99px}
input.pd-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#D0C4E8;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
.pd-btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.pd-btn{min-height:38px;padding:7px 13px;border:1px solid var(--line-2,#dce4ec);border-radius:9px;background:#fff;color:var(--ink,#3a4250);font-size:13px;font-weight:600}
.pd-btn:hover{background:#F7F4FC;border-color:#D0C4E8}
.pd-btn.main{background:#FFF4F5;border-color:#FFB3BA}
.pd-btn.seg{background:#fff}
.pd-btn.seg.on{background:#F7F4FC;border-color:#D0C4E8;color:#6e57a0}
.pd-reads{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.pd-read{padding:8px 10px;background:#fafbfc;border:1px solid var(--line,#e8edf2);border-radius:9px;min-width:0}
.pd-read span{display:block;font-size:11px;color:var(--ink-3,#8b95a3);white-space:nowrap}
.pd-read b{font-size:16px;font-variant-numeric:tabular-nums;white-space:nowrap}
.pd-read.hl{background:#F7F4FC;border-color:#DED2EE}
.pd-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--ink-2,#5a6472);margin-top:8px}
.pd-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.pd-tip{margin-top:10px;padding:9px 12px;background:#F1F8FD;border:1px solid #BFE3F5;border-radius:9px;font-size:12.5px;color:var(--ink-2,#5a6472);line-height:1.6}
.pd-tip.warn{background:#FFF8EE;border-color:#FFD8A8}
.pd-barrow{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.pd-barrow>span{flex:0 0 66px;font-size:12px;color:var(--ink-2,#5a6472)}
.pd-bartrack{flex:1;height:20px;background:#f2f5f8;border-radius:6px;overflow:hidden}
.pd-barfill{height:100%;width:0%;border-radius:6px;transition:width .08s linear}
.pd-barval{flex:0 0 62px;text-align:right;font-size:13px;font-variant-numeric:tabular-nums}
.pd-quiz{border-top:1px dashed var(--line-2,#dce4ec);margin-top:14px;padding-top:12px}
.pd-quiz h5{font-size:14px;margin:0 0 8px;font-weight:700}
.pd-quiz p{font-size:13px;color:var(--ink-2,#5a6472);line-height:1.6;margin:0 0 8px}
.pd-opts{display:flex;gap:7px;flex-wrap:wrap}
.pd-opt{padding:6px 12px;border:1px solid var(--line-2,#dce4ec);border-radius:8px;background:#fff;font-size:13px;min-height:36px}
.pd-opt:hover{border-color:#D0C4E8;background:#F7F4FC}
.pd-fb{margin-top:8px;font-size:12.5px;line-height:1.6;min-height:20px;color:var(--ink-2,#5a6472)}
.pd-fb.ok{color:#2f8f68}
.pd-fb.no{color:#c26b7a}
</style>`;

  /* ---------- 物理工具 ---------- */
  function agm(a, b) {
    for (var i = 0; i < 40; i++) {
      var na = (a + b) / 2, nb = Math.sqrt(a * b);
      if (Math.abs(na - nb) < 1e-13) return na;
      a = na; b = nb;
    }
    return a;
  }

  function introHTML(ext) {
    var focus = [
      '小角度 <b>T = 2π√(L/g)</b> · 与 m、A 无关',
      '摆长 L 决定周期：<b>T ∝ √L</b>',
      '机械能守恒：<b>Ep + Ek = 常量</b>',
      '重力分量提供回复力 <b>F = −mg·sinθ</b>'
    ][ext];
    return '<div class="pd-intro"><span class="pd-chip hot">' + focus + '</span>'
      + '<span class="pd-chip">θ &lt; 5° 时近似简谐</span>'
      + '<span class="pd-chip">读数为<b>示意值</b></span></div>';
  }

  function stageCard() {
    return '<div class="pd-card"><div class="pd-hd"><h4>摆动演示</h4>'
      + '<small>拖动摆球改变初始摆角，松手释放</small></div>'
      + '<canvas class="pd-cv" data-cv="stage"></canvas>'
      + '<div class="pd-legend">'
      + '<span><i style="background:#FFB3BA"></i>摆球</span>'
      + '<span><i style="background:#D0C4E8"></i>摆线 / 轨迹</span>'
      + '<span><i style="background:#BFE3F5"></i>重力 mg</span>'
      + '<span><i style="background:#FFD8A8"></i>速度 v</span>'
      + '</div></div>';
  }
  function chartCard(ext) {
    var title = ['θ–t 角位移图像', 'T 与 L / g 的关系', '动能与势能此消彼长', 'θ–t 图像（当前摆角）'][ext];
    return '<div class="pd-card"><div class="pd-hd"><h4>' + title + '</h4>'
      + '<small>' + (ext === 1 ? '描点随滑块移动' : ext === 2 ? '总量守恒' : '游标随摆球同步') + '</small></div>'
      + '<canvas class="pd-cv chart" data-cv="chart"></canvas></div>';
  }

  function ctrlHTML(ext) {
    function row(key, label, min, max, step, val, unit) {
      return '<div class="pd-ctrl"><label><span>' + label + '</span><b><span data-out="' + key + '">' + val + '</span> ' + unit + '</b></label>'
        + '<input class="pd-range" type="range" data-slider="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></div>';
    }
    var massRow = (ext === 1 || ext === 2) ? row('mass', '摆球质量 m', 0.2, 4, 0.1, 1.0, 'kg') : '';
    return '<div class="pd-card"><div class="pd-hd"><h4>参数调节</h4><small>拖动即时改变摆动</small></div>'
      + row('L', '摆长 L', 0.3, 3, 0.1, 1.6, 'm')
      + row('g', '重力加速度 g', 1, 20, 0.1, 9.8, 'm/s²')
      + row('theta', '初始摆角 θ₀', 1, 60, 1, 4, '°')
      + massRow
      + '<div class="pd-btns">'
      + '<button type="button" class="pd-btn main" data-btn="toggle">暂停</button>'
      + '<button type="button" class="pd-btn" data-btn="reset">复位</button>'
      + '</div><div class="pd-btns" style="margin-top:8px">'
      + '<button type="button" class="pd-btn seg on" data-mode="small">小角度模型</button>'
      + '<button type="button" class="pd-btn seg" data-mode="large">大角度对比</button>'
      + '</div></div>';
  }

  function readsHTML(ext) {
    function r(key, label, hl) {
      return '<div class="pd-read' + (hl ? ' hl' : '') + '"><span>' + label + '</span><b data-read="' + key + '">—</b></div>';
    }
    var extra = ext === 1 ? r('mindep', '换质量 T / s', false) : ext === 2 ? r('mass', '摆球质量 m / kg', false) : r('omega', '角速度 ω / (rad/s)', false);
    return '<div class="pd-card"><div class="pd-hd"><h4>实时读数</h4><small>随运动刷新</small></div>'
      + '<div class="pd-reads">'
      + r('T', '周期 T / s', true) + r('thetaNow', '当前摆角 / °', true) + r('v', '当前速度 / (m/s)', true)
      + r('vmax', '最低点速度 / (m/s)', false) + r('vtop', '最高点速度 / (m/s)', false) + extra
      + '</div><div class="pd-tip' + (ext === 0 ? '' : '') + '" data-tip>ω = √(g/L)；小角度下 T 与摆球质量、振幅均无关。</div></div>';
  }

  function energyBarsHTML() {
    return '<div class="pd-card"><div class="pd-hd"><h4>能量视角</h4><small>以最低点为零势能面</small></div>'
      + '<div class="pd-barrow"><span>重力势能</span><div class="pd-bartrack"><div class="pd-barfill" data-bar="ep" style="background:#B8E8D0"></div></div><b class="pd-barval" data-barval="ep">—</b></div>'
      + '<div class="pd-barrow"><span>动能</span><div class="pd-bartrack"><div class="pd-barfill" data-bar="ek" style="background:#FFD8A8"></div></div><b class="pd-barval" data-barval="ek">—</b></div>'
      + '<div class="pd-barrow"><span>机械能</span><div class="pd-bartrack"><div class="pd-barfill" data-bar="et" style="background:#D0C4E8"></div></div><b class="pd-barval" data-barval="et">—</b></div>'
      + '<div class="pd-tip">最高点 Ep 最大、Ek = 0；最低点速度最大、Ep = 0。机械能守恒。</div></div>';
  }

  function quizHTML() {
    var qs = [
      { id: 'q1', title: '① 摆长改变', desc: '把摆长 L 增大为原来的 4 倍（小角度），周期变为原来的？', opts: ['2 倍', '4 倍', '1/2 倍'], right: 0,
        ex: '正确。T = 2π√(L/g) ∝ √L，L 变为 4 倍，T 变为 2 倍。' },
      { id: 'q2', title: '② 质量与振幅', desc: '换用质量大 2 倍、初始摆角 8°（仍属小角度）的摆球，周期如何？', opts: ['变大', '不变', '变小'], right: 1,
        ex: '正确。小角度下 T 与摆球质量 m、振幅 θ₀ 都无关，只由 L 与 g 决定。' }
    ];
    return '<div class="pd-card"><div class="pd-hd"><h4>高考题型 · 随堂练</h4><small>点选项看解析</small></div>'
      + qs.map(function (q) {
        return '<div class="pd-quiz"><h5>' + q.title + '</h5><p>' + q.desc + '</p>'
          + '<div class="pd-opts">' + q.opts.map(function (o, i) {
            return '<button type="button" class="pd-opt" data-q="' + q.id + '" data-i="' + i + '">' + o + '</button>';
          }).join('') + '</div><div class="pd-fb" data-fb="' + q.id + '"></div></div>';
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

  NS.modules['pendulum'] = {
    render: function (container, extIndex) {
      extIndex = (extIndex | 0);
      if (extIndex < 0 || extIndex > 3) extIndex = 0;

      var sideExtra = extIndex === 2 ? energyBarsHTML() : extIndex === 3 ? quizHTML() : '';

      container.innerHTML = STYLE + '<div class="pd-wrap">'
        + introHTML(extIndex)
        + '<div class="pd-grid"><div>' + stageCard() + chartCard(extIndex) + '</div>'
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
        L: 1.6, g: 9.8, theta0: 4, mass: 1, dir: 1,
        mode: 'small', running: true, dragging: false,
        phase: 0, th: 0, wv: 0, last: 0, t: 0, history: []
      };
      function thetaRad0() { return state.dir * state.theta0 * Math.PI / 180; }
      function Tsmall() { return 2 * Math.PI * Math.sqrt(state.L / state.g); }
      function Texact() {
        var th = Math.abs(thetaRad0());
        var b = Math.cos(th / 2);
        return Tsmall() / agm(1, b);
      }
      function omega0() { return Math.sqrt(state.g / state.L); }
      function resetMotion() {
        state.phase = 0;
        state.th = thetaRad0();
        state.wv = 0;
        state.t = 0;
        state.history = [];
      }
      resetMotion();

      function curTheta() {
        return state.mode === 'small'
          ? thetaRad0() * Math.cos(state.phase)
          : state.th;
      }
      function curOmega() {
        return state.mode === 'small'
          ? -thetaRad0() * omega0() * Math.sin(state.phase)
          : state.wv;
      }
      function acc(th) { return -(state.g / state.L) * Math.sin(th); }
      function rk4(h) {
        var th = state.th, w = state.wv;
        var k1t = w, k1w = acc(th);
        var k2t = w + k1w * h / 2, k2w = acc(th + k1t * h / 2);
        var k3t = w + k2w * h / 2, k3w = acc(th + k2t * h / 2);
        var k4t = w + k3w * h, k4w = acc(th + k3t * h);
        state.th += h / 6 * (k1t + 2 * k2t + 2 * k3t + k4t);
        state.wv += h / 6 * (k1w + 2 * k2w + 2 * k3w + k4w);
      }

      /* ---------- 控件 ---------- */
      qa('[data-slider]').forEach(function (el) {
        var key = el.getAttribute('data-slider');
        on(el, 'input', function () {
          var v = parseFloat(el.value);
          if (key === 'theta') { state.theta0 = v; state.dir = 1; }
          else state[key] = v;
          var out = q1('[data-out="' + key + '"]');
          if (out) out.textContent = key === 'theta' ? String(v) : (key === 'mass' ? v.toFixed(1) : v.toFixed(1));
          resetMotion();
        });
      });

      var toggleBtn = q1('[data-btn="toggle"]');
      on(toggleBtn, 'click', function () {
        state.running = !state.running;
        toggleBtn.textContent = state.running ? '暂停' : '继续';
        toggleBtn.classList.toggle('main', state.running);
      });
      on(q1('[data-btn="reset"]'), 'click', function () {
        state.L = 1.6; state.g = 9.8; state.theta0 = 4; state.mass = 1; state.dir = 1;
        qa('[data-slider]').forEach(function (el) {
          var key = el.getAttribute('data-slider');
          el.value = state[key];
          var out = q1('[data-out="' + key + '"]');
          if (out) out.textContent = (key === 'theta' ? String(state[key]) : state[key].toFixed(1));
        });
        resetMotion();
      });
      qa('[data-mode]').forEach(function (el) {
        on(el, 'click', function () {
          state.mode = el.getAttribute('data-mode');
          qa('[data-mode]').forEach(function (b) { b.classList.toggle('on', b === el); });
          resetMotion();
          var tip = q1('[data-tip]');
          if (tip) {
            tip.className = 'pd-tip' + (state.mode === 'large' ? ' warn' : '');
            tip.textContent = state.mode === 'large'
              ? '大角度下摆动不再是简谐运动：周期变长，可用 T = 2π√(L/g)/AGM(1,cos(θ₀/2)) 精确求得；动画采用 RK4 数值积分。'
              : 'ω = √(g/L)；小角度下 T 与摆球质量、振幅均无关。';
          }
        });
      });

      /* 拖动摆球 */
      function localPos(e) {
        var rect = stage.el.getBoundingClientRect();
        var p = e.touches ? e.touches[0] : e;
        return { x: p.clientX - rect.left, y: p.clientY - rect.top };
      }
      function bobPos() {
        var w = stage.w || stage.el.clientWidth, h = stage.h || stage.el.clientHeight;
        var px = w * 0.5, py = 24;
        var scale = (h - 70) / 3.0;
        var R = state.L * scale;
        var th = state.dragging ? state.dragTh : curTheta();
        return { px: px, py: py, R: R, x: px + R * Math.sin(th), y: py + R * Math.cos(th) };
      }
      function startDrag(e) {
        var p = localPos(e), b = bobPos();
        if (Math.hypot(p.x - b.x, p.y - b.y) > 40) return;
        state.dragging = true; state.running = false;
        moveDrag(e); e.preventDefault();
      }
      function moveDrag(e) {
        if (!state.dragging) return;
        var p = localPos(e), b = bobPos();
        var a = Math.atan2(p.x - b.px, Math.max(8, p.y - b.py));
        a = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, a));
        state.dragTh = a;
        e.preventDefault();
      }
      function endDrag() {
        if (!state.dragging) return;
        state.dragging = false;
        state.theta0 = Math.max(1, Math.min(60, Math.round(Math.abs(state.dragTh) * 180 / Math.PI)));
        state.dir = state.dragTh >= 0 ? 1 : -1;
        var s = q1('[data-slider="theta"]');
        s.value = state.theta0;
        q1('[data-out="theta"]').textContent = String(state.theta0);
        resetMotion();
        state.running = true; toggleBtn.textContent = '暂停';
      }
      on(stage.el, 'mousedown', startDrag);
      on(global, 'mousemove', moveDrag);
      on(global, 'mouseup', endDrag);
      on(stage.el, 'touchstart', startDrag, { passive: false });
      on(global, 'touchmove', moveDrag, { passive: false });
      on(global, 'touchend', endDrag);

      /* 高考题 */
      var rightAns = { q1: 0, q2: 1 };
      var exMap = {
        q1: '正确。T ∝ √L，L 变为 4 倍，T 变为 2 倍。',
        q2: '正确。小角度下 T 与 m、θ₀ 无关。'
      };
      qa('[data-q]').forEach(function (btn) {
        on(btn, 'click', function () {
          var id = btn.getAttribute('data-q'), i = parseInt(btn.getAttribute('data-i'), 10);
          var fb = q1('[data-fb="' + id + '"]');
          var ok = i === rightAns[id];
          fb.className = 'pd-fb ' + (ok ? 'ok' : 'no');
          fb.textContent = (ok ? '✓ ' : '✗ ') + exMap[id];
        });
      });

      /* ---------- 绘制 ---------- */
      function drawStage() {
        fit(stage);
        var c = stage.ctx, w = stage.w, h = stage.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var px = w * 0.5, py = 24;
        var scale = (h - 70) / 3.0;
        var R = Math.max(40, state.L * scale);
        var th = state.dragging ? state.dragTh : curTheta();
        var bx = px + R * Math.sin(th), by = py + R * Math.cos(th);
        var th0 = Math.abs(thetaRad0());

        // 支架
        line(c, px - 54, py, px + 54, py, '#cbd6e2', 3);
        for (var i = -4; i <= 4; i++) line(c, px + i * 12, py - 7, px + i * 12 + 4, py, '#e8edf2', 1);
        dot(c, px, py, 4, '#8b95a3');

        // 轨迹弧
        c.save(); c.beginPath();
        c.arc(px, py, R, Math.PI / 2 - th0, Math.PI / 2 + th0);
        c.strokeStyle = '#e6dffa'; c.lineWidth = 1.5; c.setLineDash([4, 5]); c.stroke(); c.restore();

        // 最低点参考
        line(c, px, py, px, py + R + 14, '#eef2f6', 1, [3, 5]);
        text(c, '最低点', px + 6, py + R + 12, '#b5bec9', 11);

        // 角度弧
        c.save(); c.beginPath();
        var ar = 34;
        c.arc(px, py, ar, Math.PI / 2 - Math.abs(th), Math.PI / 2);
        c.strokeStyle = '#D0C4E8'; c.lineWidth = 2; c.stroke(); c.restore();
        text(c, (th * 180 / Math.PI).toFixed(0) + '°', px + 8 + (th > 0 ? 30 : -34), py + 24, '#8b6fb0', 12);

        // 摆线
        line(c, px, py, bx, by, '#B7A0DC', 2.5);
        // 摆球
        dot(c, bx, by, 16, '#FFB3BA', '#f28f9a');
        text(c, 'm', bx, by - 1, '#fff', 13, 'center');

        // 重力箭头
        line(c, bx, by + 16, bx, by + 50, '#BFE3F5', 2.5);
        c.save(); c.beginPath(); c.moveTo(bx, by + 52); c.lineTo(bx - 5, by + 43); c.lineTo(bx + 5, by + 43);
        c.closePath(); c.fillStyle = '#BFE3F5'; c.fill(); c.restore();
        text(c, 'mg', bx + 8, by + 44, '#7fb4d3', 11);

        // 速度箭头（切向）
        if (!state.dragging) {
          var v = R * curOmega();
          var vlen = Math.max(-64, Math.min(64, v * 14));
          if (Math.abs(vlen) > 5) {
            var tx = Math.cos(th), ty = -Math.sin(th);
            var dir = vlen > 0 ? 1 : -1;
            var ex = bx + tx * vlen, ey = by + ty * vlen;
            line(c, bx, by, ex, ey, '#FFD8A8', 3);
            c.save(); c.beginPath(); c.moveTo(ex, ey);
            c.lineTo(ex - tx * 8 * dir - ty * 5, ey - ty * 8 * dir + tx * 5);
            c.lineTo(ex - tx * 8 * dir + ty * 5, ey - ty * 8 * dir - tx * 5);
            c.closePath(); c.fillStyle = '#FFD8A8'; c.fill(); c.restore();
            text(c, 'v', ex + 8, ey, '#e0a458', 12);
          }
        }
        text(c, 'L = ' + state.L.toFixed(1) + ' m   θ₀ = ' + state.theta0 + '°', w - 14, 18, '#5a6472', 12, 'right');
        if (state.mode === 'large') text(c, '大角度 · 数值积分', 14, 18, '#8b6fb0', 12);
      }

      function drawThetaChart() {
        fit(chart);
        var c = chart.ctx, w = chart.w, h = chart.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var pad = { l: 38, r: 14, t: 14, b: 22 };
        var mid = (pad.t + h - pad.b) / 2;
        line(c, pad.l, h - pad.b, w - pad.r, h - pad.b, '#cbd6e2', 1);
        line(c, pad.l, pad.t, pad.l, h - pad.b, '#cbd6e2', 1);
        line(c, pad.l, mid, w - pad.r, mid, '#e8edf2', 1, [4, 4]);
        text(c, 'θ', pad.l + 2, pad.t + 4, '#8b95a3', 11);
        text(c, 't/s', w - pad.r, h - 6, '#8b95a3', 11, 'right');
        text(c, '0', pad.l - 8, mid, '#8b95a3', 11, 'right');
        var T = Texact(), x0 = pad.l, x1 = w - pad.r, tMax = T * 3;
        var maxTh = Math.max(0.05, thetaRad0());
        var ys = (mid - pad.t - 6) / maxTh;
        c.save(); c.beginPath();
        for (var p = 0; p <= x1 - x0; p += 2) {
          var tt = p / (x1 - x0) * tMax;
          var val;
          if (state.mode === 'small') val = thetaRad0() * Math.cos(omega0() * tt);
          else val = thetaRad0() * Math.cos(2 * Math.PI / T * tt); // 大角度近似形状（周期用精确值）
          var yy = mid - val * ys;
          if (p === 0) c.moveTo(x0 + p, yy); else c.lineTo(x0 + p, yy);
        }
        c.strokeStyle = '#D0C4E8'; c.lineWidth = 2.5; c.stroke(); c.restore();
        var tt2 = state.t % tMax;
        var cx = x0 + tt2 / tMax * (x1 - x0);
        var cy = mid - curTheta() * ys;
        line(c, cx, pad.t, cx, h - pad.b, '#BFE3F5', 1, [3, 3]);
        dot(c, cx, cy, 5, '#FFB3BA', '#fff');
      }

      function drawPeriodChart() {
        fit(chart);
        var c = chart.ctx, w = chart.w, h = chart.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var half = w / 2;
        drawMini(c, 12, half - 18, h, 'T 随 L 增大而变长', 'L', state.L, 0.3, 3,
          function (v) { return 2 * Math.PI * Math.sqrt(v / state.g); }, '#BFE3F5');
        drawMini(c, half + 8, w - 12, h, 'T 随 g 增大而变短', 'g', state.g, 1, 20,
          function (v) { return 2 * Math.PI * Math.sqrt(state.L / v); }, '#D0C4E8');
        line(c, half, 10, half, h - 12, '#e8edf2', 1);
      }
      function drawMini(c, x0, x1, h, title, xlabel, cur, lo, hi, fn, color) {
        var top = 28, bot = h - 26;
        text(c, title, (x0 + x1) / 2, 12, '#5a6472', 12, 'center');
        line(c, x0, bot, x1, bot, '#cbd6e2', 1);
        var vals = [];
        for (var i = 0; i <= 60; i++) vals.push(fn(lo + (hi - lo) * i / 60));
        var vmax = Math.max.apply(null, vals) * 1.05;
        c.save(); c.beginPath();
        vals.forEach(function (y, i) {
          var px = x0 + i / 60 * (x1 - x0), py = bot - y / vmax * (bot - top);
          if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
        });
        c.strokeStyle = color; c.lineWidth = 2.5; c.stroke(); c.restore();
        var yc = fn(cur);
        var cx = x0 + (cur - lo) / (hi - lo) * (x1 - x0), cy = bot - yc / vmax * (bot - top);
        line(c, cx, top, cx, bot, '#e8edf2', 1, [3, 3]);
        dot(c, cx, cy, 5, color, '#fff');
        text(c, xlabel + '=' + cur.toFixed(1), cx, bot + 12, '#8b95a3', 11, 'center');
        text(c, yc.toFixed(2) + 's', cx, Math.max(top - 4, cy - 12), '#5a6472', 11, 'center');
      }

      function drawEnergyChart() {
        fit(chart);
        var c = chart.ctx, w = chart.w, h = chart.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var pad = { l: 38, r: 14, t: 14, b: 22 };
        var T = Texact(), top = pad.t + 6, bot = h - pad.b, x0 = pad.l, x1 = w - pad.r;
        var etot = state.mass * state.g * state.L * (1 - Math.cos(thetaRad0()));
        var maxE = Math.max(etot, 0.001);
        text(c, 'E/J', pad.l + 2, pad.t + 4, '#8b95a3', 11);
        text(c, 't/s', w - pad.r, h - 6, '#8b95a3', 11, 'right');
        line(c, x0, bot, x1, bot, '#cbd6e2', 1);
        function plot(fn, color) {
          c.save(); c.beginPath();
          for (var p = 0; p <= x1 - x0; p += 2) {
            var tt = p / (x1 - x0) * T * 2;
            var th = thetaRad0() * Math.cos(2 * Math.PI / T * tt);
            var v = Math.abs(thetaRad0()) * Math.sqrt(state.g * state.L) * Math.abs(Math.sin(2 * Math.PI / T * tt));
            var y = bot - fn(th, v) / maxE * (bot - top);
            if (p === 0) c.moveTo(x0 + p, y); else c.lineTo(x0 + p, y);
          }
          c.strokeStyle = color; c.lineWidth = 2.5; c.stroke(); c.restore();
        }
        plot(function (th) { return state.mass * state.g * state.L * (1 - Math.cos(th)); }, '#B8E8D0');
        plot(function (th, v) { return 0.5 * state.mass * v * v; }, '#FFD8A8');
        line(c, x0, top, x1, top, '#D0C4E8', 1, [5, 4]);
        text(c, '机械能', x1 - 2, top + 8, '#8b6fb0', 11, 'right');
      }

      function updateReads() {
        var cur = curTheta(), wv = curOmega();
        var v = Math.abs(state.L * wv);
        var vmax = Math.sqrt(2 * state.g * state.L * (1 - Math.cos(thetaRad0())));
        var T = Texact();
        function set(k, val) { var el = q1('[data-read="' + k + '"]'); if (el) el.textContent = val; }
        set('T', T.toFixed(2));
        set('thetaNow', (cur * 180 / Math.PI).toFixed(1));
        set('v', v.toFixed(2));
        set('vmax', vmax.toFixed(2));
        set('vtop', '0.00');
        if (extIndex === 1) set('mindep', (2 * Math.PI * Math.sqrt(state.L / state.g)).toFixed(2));
        else if (extIndex === 2) set('mass', state.mass.toFixed(1));
        else set('omega', wv.toFixed(2));
        if (extIndex === 2) {
          var ep = state.mass * state.g * state.L * (1 - Math.cos(cur));
          var ek = 0.5 * state.mass * v * v;
          var et = state.mass * state.g * state.L * (1 - Math.cos(thetaRad0()));
          var a = q1('[data-bar="ep"]'), b = q1('[data-bar="ek"]'), d = q1('[data-bar="et"]');
          if (a) a.style.width = (ep / et * 100).toFixed(1) + '%';
          if (b) b.style.width = (ek / et * 100).toFixed(1) + '%';
          if (d) d.style.width = '100%';
          var va = q1('[data-barval="ep"]'), vb = q1('[data-barval="ek"]'), vd = q1('[data-barval="et"]');
          if (va) va.textContent = ep.toFixed(2);
          if (vb) vb.textContent = ek.toFixed(2);
          if (vd) vd.textContent = et.toFixed(2);
        }
      }

      /* ---------- 主动画 ---------- */
      var raf = 0;
      function loop(now) {
        if (!state.last) state.last = now;
        var dt = Math.min(0.04, (now - state.last) / 1000);
        state.last = now;
        if (state.running && !state.dragging) {
          state.t += dt;
          if (state.mode === 'small') state.phase += omega0() * dt;
          else {
            var n = Math.max(1, Math.ceil(dt / 0.004));
            for (var i = 0; i < n; i++) rk4(dt / n);
          }
        }
        drawStage();
        if (extIndex === 1) drawPeriodChart();
        else if (extIndex === 2) drawEnergyChart();
        else drawThetaChart();
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
