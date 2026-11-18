/* ============================================================
 * spring-oscillator.js — 弹簧振子交互模块
 * 契约：IIFE + window.ModelLab.modules['spring-oscillator']
 * render(container, extIndex) -> cleanup()
 * 零外部依赖；数值为示意值（用 N/kg/m 的量纲关系演示规律）
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};

  var STYLE = `
<style>
.sm-wrap{color:var(--ink,#3a4250);font-size:15px}
.sm-grid{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(296px,.88fr);gap:16px;align-items:start}
@media(max-width:1080px){.sm-grid{grid-template-columns:1fr}}
.sm-card{background:var(--surface,#fff);border:1px solid var(--line-2,#dce4ec);border-radius:16px;box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:14px 16px}
.sm-card+.sm-card{margin-top:14px}
.sm-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.sm-hd h4{font-size:16px;font-weight:700;line-height:1.4}
.sm-hd small{font-size:12px;color:var(--ink-3,#8b95a3);white-space:nowrap}
canvas.sm-cv{display:block;width:100%;height:196px;border-radius:10px;background:#fcfdfe;border:1px solid var(--line,#e8edf2)}
canvas.sm-cv.chart{height:152px}
canvas.sm-cv.energy{height:172px}
.sm-intro{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center}
.sm-chip{padding:5px 11px;border:1px solid var(--line-2,#dce4ec);border-radius:999px;background:#fff;font-size:13px;color:var(--ink-2,#5a6472)}
.sm-chip b{color:var(--ink,#3a4250)}
.sm-chip.hot{background:#FFF4F5;border-color:#FFB3BA}
.sm-ctrl{margin-top:10px}
.sm-ctrl label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-2,#5a6472);margin-bottom:2px}
.sm-ctrl label b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}
input.sm-range{width:100%;height:22px;margin:0;background:transparent;border:0;-webkit-appearance:none;appearance:none;cursor:pointer}
input.sm-range::-webkit-slider-runnable-track{height:6px;background:#e8edf2;border-radius:99px}
input.sm-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-6px;border-radius:50%;background:#FFB3BA;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
input.sm-range::-moz-range-track{height:6px;background:#e8edf2;border-radius:99px}
input.sm-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#FFB3BA;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
.sm-btns{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.sm-btn{min-height:38px;padding:7px 14px;border:1px solid var(--line-2,#dce4ec);border-radius:9px;background:#fff;color:var(--ink,#3a4250);font-size:13px;font-weight:600}
.sm-btn:hover{background:#FFF4F5;border-color:#FFB3BA}
.sm-btn.main{background:#FFF4F5;border-color:#FFB3BA}
.sm-btn.on{background:#F1FBF6;border-color:#B8E8D0}
.sm-reads{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.sm-read{padding:8px 10px;background:#fafbfc;border:1px solid var(--line,#e8edf2);border-radius:9px;min-width:0}
.sm-read span{display:block;font-size:11px;color:var(--ink-3,#8b95a3);white-space:nowrap}
.sm-read b{font-size:16px;font-variant-numeric:tabular-nums;white-space:nowrap}
.sm-read.hl{background:#FFF4F5;border-color:#FFD8DE}
.sm-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--ink-2,#5a6472);margin-top:8px}
.sm-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.sm-bars{margin-top:12px}
.sm-barrow{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.sm-barrow>span{flex:0 0 66px;font-size:12px;color:var(--ink-2,#5a6472)}
.sm-bartrack{flex:1;height:20px;background:#f2f5f8;border-radius:6px;overflow:hidden;position:relative}
.sm-barfill{height:100%;width:0%;border-radius:6px;transition:width .08s linear}
.sm-barval{flex:0 0 62px;text-align:right;font-size:13px;font-variant-numeric:tabular-nums}
.sm-tip{margin-top:10px;padding:9px 12px;background:#F1F8FD;border:1px solid #BFE3F5;border-radius:9px;font-size:12.5px;color:var(--ink-2,#5a6472);line-height:1.6}
.sm-quiz{border-top:1px dashed var(--line-2,#dce4ec);margin-top:14px;padding-top:12px}
.sm-quiz h5{font-size:14px;margin:0 0 8px;font-weight:700}
.sm-quiz p{font-size:13px;color:var(--ink-2,#5a6472);line-height:1.6;margin:0 0 8px}
.sm-opts{display:flex;gap:7px;flex-wrap:wrap}
.sm-opt{padding:6px 12px;border:1px solid var(--line-2,#dce4ec);border-radius:8px;background:#fff;font-size:13px;min-height:36px}
.sm-opt:hover{border-color:#FFB3BA;background:#FFF4F5}
.sm-fb{margin-top:8px;font-size:12.5px;line-height:1.6;min-height:20px;color:var(--ink-2,#5a6472)}
.sm-fb.ok{color:#2f8f68}
.sm-fb.no{color:#c26b7a}
.sm-table{width:100%;border-collapse:collapse;margin-top:10px;font-size:12.5px}
.sm-table th,.sm-table td{padding:5px 6px;border-bottom:1px solid var(--line,#e8edf2);text-align:center;font-variant-numeric:tabular-nums}
.sm-table th{color:var(--ink-3,#8b95a3);font-weight:600}
.sm-expres{margin-top:10px;padding:9px 12px;background:#F7F4FC;border:1px solid #D0C4E8;border-radius:9px;font-size:13px;line-height:1.7}
.sm-expres b{color:#7b62a8}
</style>`;

  /* ---------- 静态 HTML 片段 ---------- */
  function introHTML(ext) {
    var focus = [
      '胡克定律 <b>F = −kx</b> · 简谐运动 <b>x = A·sin(ωt)</b>',
      '周期 <b>T = 2π√(m/k)</b> · 与振幅无关',
      '总能量 <b>E = ½kA²</b> · 动能与势能守恒',
      '由 <b>T = 2π√(m/k)</b> 判断参量变化',
      '作图法测劲度系数：<b>T² = 4π²m/k</b>'
    ][ext] || '胡克定律 <b>F = −kx</b>';
    return '<div class="sm-intro"><span class="sm-chip hot">' + focus + '</span>'
      + '<span class="sm-chip">ω = √(k/m)</span>'
      + '<span class="sm-chip">读数均为<b>示意值</b></span></div>';
  }

  function stageCard() {
    return '<div class="sm-card"><div class="sm-hd"><h4>运动演示</h4>'
      + '<small>拖动小球改变振幅，松手释放</small></div>'
      + '<canvas class="sm-cv" data-cv="stage"></canvas>'
      + '<div class="sm-legend">'
      + '<span><i style="background:#FFB3BA"></i>弹簧振子</span>'
      + '<span><i style="background:#BFE3F5"></i>平衡位置</span>'
      + '<span><i style="background:#FFD8A8"></i>速度 v</span>'
      + '<span><i style="background:#B8E8D0"></i>回复力 F</span>'
      + '</div></div>';
  }

  function chartCard(ext) {
    var title = ['x–t 位移—时间图像', 'T 与 m / k 的关系', '动能与势能此消彼长', '当前参数的 x–t 图像', 'T²–m 实验图线'][ext];
    var cls = ext === 2 ? 'energy' : 'chart';
    return '<div class="sm-card"><div class="sm-hd"><h4>' + title + '</h4>'
      + '<small>' + (ext === 1 ? '描点随滑块实时移动' : ext === 2 ? '总量守恒' : ext === 4 ? '点击采集，斜率拟合劲度系数' : '游标与振子同步') + '</small></div>'
      + '<canvas class="sm-cv ' + cls + '" data-cv="chart"></canvas></div>';
  }

  function ctrlHTML() {
    function row(key, label, min, max, step, val, unit) {
      return '<div class="sm-ctrl"><label><span>' + label + '</span><b><span data-out="' + key + '">' + val + '</span> ' + unit + '</b></label>'
        + '<input class="sm-range" type="range" data-slider="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></div>';
    }
    return '<div class="sm-card"><div class="sm-hd"><h4>参数调节</h4><small>拖动即时改变运动</small></div>'
      + row('k', '劲度系数 k', 10, 200, 5, 80, 'N/m')
      + row('m', '质量 m', 0.2, 4, 0.1, 1.0, 'kg')
      + row('A', '振幅 A', 0.2, 3, 0.1, 1.6, 'm')
      + '<div class="sm-btns">'
      + '<button type="button" class="sm-btn main" data-btn="toggle">暂停</button>'
      + '<button type="button" class="sm-btn" data-btn="reset">复位</button>'
      + '<button type="button" class="sm-btn" data-btn="push">推一下</button>'
      + '</div></div>';
  }

  function readsHTML() {
    function r(key, label, hl) {
      return '<div class="sm-read' + (hl ? ' hl' : '') + '"><span>' + label + '</span><b data-read="' + key + '">—</b></div>';
    }
    return '<div class="sm-card"><div class="sm-hd"><h4>实时读数</h4><small>随运动刷新</small></div>'
      + '<div class="sm-reads">'
      + r('x', '位移 x / m', true) + r('v', '速度 v / (m/s)', true) + r('a', '加速度 a / (m/s²)', true)
      + r('T', '周期 T / s', false) + r('f', '频率 f / Hz', false) + r('E', '总能量 E / J', false)
      + '</div><div class="sm-tip">ω = √(k/m)，a = −(k/m)x；动能与势能之和保持不变。</div></div>';
  }

  function energyBarsHTML() {
    return '<div class="sm-card"><div class="sm-hd"><h4>能量转化</h4><small>此消彼长 · 总量不变</small></div>'
      + '<div class="sm-bars">'
      + '<div class="sm-barrow"><span>动能 Ek</span><div class="sm-bartrack"><div class="sm-barfill" data-bar="ek" style="background:#FFD8A8"></div></div><b class="sm-barval" data-barval="ek">—</b></div>'
      + '<div class="sm-barrow"><span>势能 Ep</span><div class="sm-bartrack"><div class="sm-barfill" data-bar="ep" style="background:#B8E8D0"></div></div><b class="sm-barval" data-barval="ep">—</b></div>'
      + '<div class="sm-barrow"><span>总能量</span><div class="sm-bartrack"><div class="sm-barfill" data-bar="et" style="background:#D0C4E8"></div></div><b class="sm-barval" data-barval="et">—</b></div>'
      + '</div><div class="sm-tip">平衡位置处 Ek 最大、Ep 为零；最大位移处相反。总能量 = ½kA²，始终不变。</div></div>';
  }

  function quizHTML() {
    function q(id, title, opts, right) {
      return '<div class="sm-quiz"><h5>' + title + '</h5><p>' + (id === 'q1'
        ? '把同一振子的振幅增大到原来的 2 倍（仍在弹性限度内），它的周期将如何变化？'
        : '保持质量 m 不变，把弹簧的劲度系数 k 增大为原来的 4 倍，周期变为原来的多少？') + '</p>'
        + '<div class="sm-opts">' + opts.map(function (o, i) {
          return '<button type="button" class="sm-opt" data-q="' + id + '" data-i="' + i + '">' + o + '</button>';
        }).join('') + '</div><div class="sm-fb" data-fb="' + id + '"></div></div>';
    }
    return '<div class="sm-card"><div class="sm-hd"><h4>高考题型 · 随堂练</h4><small>点选项看解析</small></div>'
      + q('q1', '① 振幅与周期', ['变大', '不变', '变小'], 1)
      + q('q2', '② 劲度系数与周期', ['2 倍', '1/2 倍', '4 倍'], 1)
      + '</div>';
  }

  function expHTML() {
    return '<div class="sm-card"><div class="sm-hd"><h4>实验拓展 · 测劲度系数</h4><small>模拟打点计时</small></div>'
      + '<p class="sm-note">逐次更换钩码质量，测量 20 次全振动的时间取平均，得到周期 T。由 T² = (4π²/k)·m 作图，斜率可求 k。</p>'
      + '<div class="sm-btns"><button type="button" class="sm-btn main" data-btn="collect">采集一组数据</button>'
      + '<button type="button" class="sm-btn" data-btn="cleardata">清空</button></div>'
      + '<table class="sm-table"><thead><tr><th>次数</th><th>m / kg</th><th>20T / s</th><th>T / s</th></tr></thead>'
      + '<tbody data-expbody><tr><td colspan="4" style="color:#8b95a3">尚未采集</td></tr></tbody></table>'
      + '<div class="sm-expres" data-expres>采集 3 组以上数据后，这里给出拟合结果。</div></div>';
  }

  /* ---------- 画布工具 ---------- */
  function mkCanvas(el) {
    return { el: el, ctx: el.getContext('2d'), w: 0, h: 0, dpr: 0 };
  }
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
    var x = c.ctx || c;
    x.save(); x.beginPath();
    if (dash) x.setLineDash(dash);
    x.strokeStyle = color; x.lineWidth = width || 1;
    x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); x.restore();
  }
  function text(c, s, x, y, color, size, align) {
    var g = c.ctx || c;
    g.save(); g.fillStyle = color || '#8b95a3';
    g.font = (size || 12) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    g.textAlign = align || 'left'; g.textBaseline = 'middle';
    g.fillText(s, x, y); g.restore();
  }
  function dot(c, x, y, r, fill, stroke) {
    var g = c.ctx || c;
    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = fill; g.fill();
    if (stroke) { g.lineWidth = 2; g.strokeStyle = stroke; g.stroke(); }
    g.restore();
  }

  NS.modules['spring-oscillator'] = {
    render: function (container, extIndex) {
      extIndex = (extIndex | 0);
      if (extIndex < 0 || extIndex > 4) extIndex = 0;

      var sideExtra = extIndex === 2 ? energyBarsHTML()
        : extIndex === 3 ? quizHTML()
          : extIndex === 4 ? expHTML() : '';

      container.innerHTML = STYLE + '<div class="sm-wrap">'
        + introHTML(extIndex)
        + '<div class="sm-grid"><div>' + stageCard() + chartCard(extIndex) + '</div>'
        + '<div>' + ctrlHTML() + readsHTML() + sideExtra + '</div></div></div>';

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
        k: 80, m: 1, A: 1.6,
        phase: 0, running: true, dragging: false,
        dragX: 0, last: 0, t: 0,
        data: [], dataN: 0
      };
      function omega() { return Math.sqrt(state.k / state.m); }
      function period() { return 2 * Math.PI / omega(); }
      function curX() { return state.A * Math.sin(state.phase); }
      function curV() { return state.A * omega() * Math.cos(state.phase); }
      function curA() { return -omega() * omega() * curX(); }

      /* ---------- 控件绑定 ---------- */
      qa('[data-slider]').forEach(function (el) {
        var key = el.getAttribute('data-slider');
        on(el, 'input', function () {
          var v = parseFloat(el.value);
          state[key] = v;
          var out = q1('[data-out="' + key + '"]');
          if (out) out.textContent = (key === 'm' ? v.toFixed(1) : key === 'A' ? v.toFixed(1) : String(v));
          if (key === 'A' && state.dragging === false) state.phase = Math.PI / 2;
        });
      });

      var toggleBtn = q1('[data-btn="toggle"]');
      on(toggleBtn, 'click', function () {
        state.running = !state.running;
        toggleBtn.textContent = state.running ? '暂停' : '继续';
        toggleBtn.classList.toggle('main', state.running);
      });
      on(q1('[data-btn="reset"]'), 'click', function () {
        state.phase = 0; state.t = 0; state.k = 80; state.m = 1; state.A = 1.6;
        qa('[data-slider]').forEach(function (el) {
          var key = el.getAttribute('data-slider');
          el.value = state[key];
          var out = q1('[data-out="' + key + '"]');
          if (out) out.textContent = (key === 'm' || key === 'A' ? state[key].toFixed(1) : String(state[key]));
        });
      });
      on(q1('[data-btn="push"]'), 'click', function () {
        state.t = 0;
        state.phase = Math.PI / 2; // 从正最大位移由静止释放
        state.running = true; toggleBtn.textContent = '暂停';
      });

      /* 画布拖动：拉动小球设定振幅后释放 */
      function pointerX(e) {
        var rect = stage.el.getBoundingClientRect();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        return clientX - rect.left;
      }
      function startDrag(e) {
        var w = stage.w || stage.el.clientWidth;
        var cx = w * 0.5;
        var px = pointerX(e);
        if (Math.abs(px - cx) > w * 0.34) return; // 只在小球附近可拖
        state.dragging = true;
        state.running = false;
        moveDrag(e);
        e.preventDefault();
      }
      function moveDrag(e) {
        if (!state.dragging) return;
        var w = stage.w || stage.el.clientWidth;
        var cx = w * 0.5;
        var scale = (w * 0.34) / 3.2;
        var x = Math.max(-3, Math.min(3, (pointerX(e) - cx) / scale));
        state.dragX = x;
        e.preventDefault();
      }
      function endDrag() {
        if (!state.dragging) return;
        state.dragging = false;
        state.A = Math.max(0.2, Math.min(3, Math.abs(state.dragX)));
        var slider = q1('[data-slider="A"]');
        slider.value = state.A;
        q1('[data-out="A"]').textContent = state.A.toFixed(1);
        state.phase = state.dragX >= 0 ? Math.PI / 2 : -Math.PI / 2;
        state.t = 0;
        state.running = true;
        toggleBtn.textContent = '暂停';
      }
      on(stage.el, 'mousedown', startDrag);
      on(global, 'mousemove', moveDrag);
      on(global, 'mouseup', endDrag);
      on(stage.el, 'touchstart', startDrag, { passive: false });
      on(global, 'touchmove', moveDrag, { passive: false });
      on(global, 'touchend', endDrag);

      /* 高考题 */
      var answers = { q1: 1, q2: 1 };
      var explain = {
        q1: '正确。T = 2π√(m/k) 与振幅 A 无关，加大振幅只增大总能量 ½kA² 和最大速度。',
        q2: '正确。T ∝ 1/√k，k 变为 4 倍则 T 变为原来的 1/2（频率变为 2 倍）。'
      };
      qa('[data-q]').forEach(function (btn) {
        on(btn, 'click', function () {
          var id = btn.getAttribute('data-q');
          var i = parseInt(btn.getAttribute('data-i'), 10);
          var fb = q1('[data-fb="' + id + '"]');
          var ok = i === answers[id];
          fb.className = 'sm-fb ' + (ok ? 'ok' : 'no');
          fb.textContent = (ok ? '✓ ' : '✗ ') + explain[id];
        });
      });

      /* 实验采集 */
      var collectBtn = q1('[data-btn="collect"]');
      if (collectBtn) {
        on(collectBtn, 'click', function () {
          state.dataN++;
          var m = Math.min(4, 0.4 + (state.dataN - 1) * 0.7);
          // 该组钩码对应的真实周期，叠加约 ±1% 的测量误差
          var T = 2 * Math.PI * Math.sqrt(m / state.k) * (1 + (Math.random() - 0.5) * 0.02);
          var twenty = T * 20;
          state.data.push({ m: m, T: T, twenty: twenty });
          renderTable();
        });
        on(q1('[data-btn="cleardata"]'), 'click', function () {
          state.data = []; state.dataN = 0; renderTable();
        });
      }
      function renderTable() {
        var body = q1('[data-expbody]');
        var res = q1('[data-expres]');
        if (!body) return;
        if (!state.data.length) {
          body.innerHTML = '<tr><td colspan="4" style="color:#8b95a3">尚未采集</td></tr>';
          res.innerHTML = '采集 3 组以上数据后，这里给出拟合结果。';
          return;
        }
        body.innerHTML = state.data.map(function (d, i) {
          return '<tr><td>' + (i + 1) + '</td><td>' + d.m.toFixed(1) + '</td><td>' + d.twenty.toFixed(2)
            + '</td><td>' + d.T.toFixed(3) + '</td></tr>';
        }).join('');
        if (state.data.length >= 3) {
          var n = state.data.length, sm = 0, sy = 0, smm = 0, smy = 0;
          state.data.forEach(function (d) {
            var y = d.T * d.T; sm += d.m; sy += y; smm += d.m * d.m; smy += d.m * y;
          });
          var slope = (n * smy - sm * sy) / (n * smm - sm * sm);
          var kfit = 4 * Math.PI * Math.PI / slope;
          res.innerHTML = '拟合斜率 ≈ <b>' + slope.toFixed(2) + '</b> s²/kg，'
            + '由 k = 4π²/斜率 得 <b>k ≈ ' + kfit.toFixed(1) + ' N/m</b>（当前设定 ' + state.k + ' N/m）。';
        } else {
          res.innerHTML = '已采集 ' + state.data.length + ' 组，再采集 ' + (3 - state.data.length) + ' 组即可拟合。';
        }
      }

      /* ---------- 绘制 ---------- */
      function drawStage() {
        fit(stage);
        var c = stage.ctx, w = stage.w, h = stage.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var cy = h * 0.56;
        var cx = w * 0.5;
        var scale = (w * 0.34) / 3.2;
        var x = state.dragging ? state.dragX : curX();
        var bx = cx + x * scale;

        // 轨道与刻度
        line(c, 20, cy + 34, w - 20, cy + 34, '#e8edf2', 1);
        for (var i = -3; i <= 3; i += 0.5) {
          var tx = cx + i * scale;
          if (tx < 16 || tx > w - 16) continue;
          var major = Math.abs(i % 1) < 0.01;
          line(c, tx, cy + 28, tx, cy + (major ? 42 : 37), major ? '#cbd6e2' : '#e8edf2', 1);
        }
        // 平衡位置
        line(c, cx, cy - 46, cx, cy + 44, '#BFE3F5', 2, [5, 5]);
        text(c, '平衡位置', cx + 6, cy - 54, '#8b95a3', 11);

        // 固定墙
        var wallX = 30;
        c.save();
        c.fillStyle = '#eef2f6';
        c.fillRect(wallX - 12, cy - 38, 12, 76);
        c.strokeStyle = '#cbd6e2'; c.lineWidth = 1;
        for (var yy = cy - 36; yy < cy + 38; yy += 9) {
          c.beginPath(); c.moveTo(wallX - 12, yy); c.lineTo(wallX - 20, yy + 6); c.stroke();
        }
        c.restore();

        // 弹簧（锯齿，圈数固定、长度随伸缩变化）
        var sx = wallX, ex = bx - 17;
        var coils = 12, amp = 11;
        c.save(); c.beginPath(); c.moveTo(sx, cy);
        var seg = (ex - sx) / (coils * 2);
        for (var s = 1; s <= coils * 2; s++) {
          var xx = sx + seg * s;
          c.lineTo(xx, cy + (s % 2 ? -amp : amp));
        }
        c.lineTo(ex, cy);
        c.strokeStyle = '#FFB3BA'; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke();
        c.restore();

        // 小球
        dot(c, bx, cy, 17, '#FFB3BA', '#f28f9a');
        text(c, 'm', bx, cy - 1, '#fff', 13, 'center');

        // 速度箭头（橙）
        if (!state.dragging) {
          var v = curV();
          var vlen = Math.max(-70, Math.min(70, v * 12));
          if (Math.abs(vlen) > 5) {
            var vy = cy - 40;
            line(c, bx, vy, bx + vlen, vy, '#FFD8A8', 3);
            var dir = vlen > 0 ? 1 : -1;
            c.save(); c.beginPath();
            c.moveTo(bx + vlen, vy); c.lineTo(bx + vlen - 8 * dir, vy - 5);
            c.lineTo(bx + vlen - 8 * dir, vy + 5); c.closePath();
            c.fillStyle = '#FFD8A8'; c.fill(); c.restore();
            text(c, 'v', bx + vlen + (dir > 0 ? 8 : -8), vy, '#e0a458', 12, dir > 0 ? 'left' : 'right');
          }
          // 回复力箭头（绿）
          var f = -state.k * x;
          var flen = Math.max(-60, Math.min(60, f / 6));
          if (Math.abs(flen) > 5) {
            var fy = cy + 62;
            line(c, bx, fy, bx + flen, fy, '#B8E8D0', 3);
            var fd = flen > 0 ? 1 : -1;
            c.save(); c.beginPath();
            c.moveTo(bx + flen, fy); c.lineTo(bx + flen - 8 * fd, fy - 5);
            c.lineTo(bx + flen - 8 * fd, fy + 5); c.closePath();
            c.fillStyle = '#B8E8D0'; c.fill(); c.restore();
            text(c, 'F', bx + flen + (fd > 0 ? 8 : -8), fy, '#5cae86', 12, fd > 0 ? 'left' : 'right');
          }
        }
        text(c, 'x = ' + x.toFixed(2) + ' m', w - 16, 20, '#5a6472', 13, 'right');
      }

      function axes(c, w, h, pad) {
        c.clearRect(0, 0, w, h);
        line(c, pad.l, h - pad.b, w - pad.r, h - pad.b, '#cbd6e2', 1);
        line(c, pad.l, pad.t, pad.l, h - pad.b, '#cbd6e2', 1);
      }

      function drawXT() {
        fit(chart);
        var c = chart.ctx, w = chart.w, h = chart.h;
        if (!w || !h) return;
        var pad = { l: 34, r: 14, t: 14, b: 22 };
        axes(c, w, h, pad);
        var midY = (pad.t + h - pad.b) / 2;
        var T = period();
        line(c, pad.l, midY, w - pad.r, midY, '#e8edf2', 1, [4, 4]);
        text(c, '0', pad.l - 8, midY, '#8b95a3', 11, 'right');
        text(c, '+' + state.A.toFixed(1), pad.l - 8, pad.t + 6, '#8b95a3', 11, 'right');
        text(c, 't/s', w - pad.r, h - 6, '#8b95a3', 11, 'right');
        text(c, 'x/m', pad.l + 2, pad.t + 4, '#8b95a3', 11);
        var x0 = pad.l, x1 = w - pad.r;
        var tMax = T * 3;
        var yScale = (midY - pad.t - 6) / Math.max(0.2, state.A);
        c.save(); c.beginPath();
        for (var px = 0; px <= x1 - x0; px += 2) {
          var tt = px / (x1 - x0) * tMax;
          var yy = midY - state.A * Math.sin(omega() * tt + 0) * yScale;
          if (px === 0) c.moveTo(x0 + px, yy); else c.lineTo(x0 + px, yy);
        }
        c.strokeStyle = '#FFB3BA'; c.lineWidth = 2; c.stroke(); c.restore();
        // 游标：按当前相位折算到 3 周期窗口内
        var phaseIn = ((state.phase % (Math.PI * 6)) + Math.PI * 6) % (Math.PI * 6);
        var tCur = phaseIn / omega();
        var cx = x0 + tCur / tMax * (x1 - x0);
        var cyv = midY - curX() * yScale;
        line(c, cx, pad.t, cx, h - pad.b, '#BFE3F5', 1, [3, 3]);
        dot(c, cx, cyv, 5, '#FFB3BA', '#fff');
      }

      function drawPeriod() {
        fit(chart);
        var c = chart.ctx, w = chart.w, h = chart.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var half = w / 2;
        drawMini(c, 12, half - 20, h, 'T 随 m 增大而变长', 'm', state.m, 0.2, 4, function (v) {
          return 2 * Math.PI * Math.sqrt(v / state.k);
        }, '#BFE3F5');
        drawMini(c, half + 8, w - 12, h, 'T 随 k 增大而变短', 'k', state.k, 10, 200, function (v) {
          return 2 * Math.PI * Math.sqrt(state.m / v);
        }, '#D0C4E8');
        line(c, half, 8, half, h - 12, '#e8edf2', 1);
      }
      function drawMini(c, x0, x1, h, title, xlabel, cur, lo, hi, fn, color) {
        var top = 26, bot = h - 26;
        text(c, title, (x0 + x1) / 2, 12, '#5a6472', 12, 'center');
        line(c, x0, bot, x1, bot, '#cbd6e2', 1);
        var vals = [];
        for (var i = 0; i <= 60; i++) {
          var v = lo + (hi - lo) * i / 60;
          vals.push(fn(v));
        }
        var vmax = Math.max.apply(null, vals) * 1.05;
        c.save(); c.beginPath();
        vals.forEach(function (y, i) {
          var px = x0 + i / 60 * (x1 - x0);
          var py = bot - y / vmax * (bot - top);
          if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
        });
        c.strokeStyle = color; c.lineWidth = 2.5; c.stroke(); c.restore();
        var yc = fn(cur);
        var cx = x0 + (cur - lo) / (hi - lo) * (x1 - x0);
        var cy = bot - yc / vmax * (bot - top);
        line(c, cx, top, cx, bot, '#e8edf2', 1, [3, 3]);
        dot(c, cx, cy, 5, color, '#fff');
        text(c, xlabel + '=' + (cur >= 10 ? cur.toFixed(0) : cur.toFixed(1)), cx, bot + 12, '#8b95a3', 11, 'center');
        text(c, yc.toFixed(2) + 's', cx, Math.max(top - 4, cy - 12), '#5a6472', 11, 'center');
      }

      function drawEnergyChart() {
        fit(chart);
        var c = chart.ctx, w = chart.w, h = chart.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var pad = { l: 34, r: 14, t: 14, b: 22 };
        var E = 0.5 * state.k * state.A * state.A;
        var maxE = Math.max(E, 0.001);
        text(c, 'E/J', pad.l + 2, pad.t + 4, '#8b95a3', 11);
        text(c, 't/s', w - pad.r, h - 6, '#8b95a3', 11);
        line(c, pad.l, h - pad.b, w - pad.r, h - pad.b, '#cbd6e2', 1);
        var T = period();
        var x0 = pad.l, x1 = w - pad.r, top = pad.t + 6, bot = h - pad.b;
        function plot(fn, color) {
          c.save(); c.beginPath();
          for (var px = 0; px <= x1 - x0; px += 2) {
            var tt = px / (x1 - x0) * T * 2;
            var y = bot - fn(tt) / maxE * (bot - top);
            if (px === 0) c.moveTo(x0 + px, y); else c.lineTo(x0 + px, y);
          }
          c.strokeStyle = color; c.lineWidth = 2.5; c.stroke(); c.restore();
        }
        plot(function (t) { return 0.5 * state.m * Math.pow(state.A * omega() * Math.cos(omega() * t), 2); }, '#FFD8A8');
        plot(function (t) { return 0.5 * state.k * Math.pow(state.A * Math.sin(omega() * t), 2); }, '#B8E8D0');
        line(c, x0, bot - (bot - top), x1, bot - (bot - top), '#D0C4E8', 1, [5, 4]);
        text(c, '总量', x1 - 2, bot - (bot - top) - 8, '#8b6fb0', 11, 'right');
      }

      function drawExpChart() {
        fit(chart);
        var c = chart.ctx, w = chart.w, h = chart.h;
        if (!w || !h) return;
        c.clearRect(0, 0, w, h);
        var pad = { l: 42, r: 16, t: 16, b: 28 };
        line(c, pad.l, h - pad.b, w - pad.r, h - pad.b, '#cbd6e2', 1);
        line(c, pad.l, pad.t, pad.l, h - pad.b, '#cbd6e2', 1);
        text(c, 'T²/s²', pad.l + 2, pad.t + 4, '#8b95a3', 11);
        text(c, 'm/kg', w - pad.r, h - 8, '#8b95a3', 11, 'right');
        var maxM = 4, maxY = Math.max(4, 4 * Math.PI * Math.PI * maxM / state.k * 1.1);
        for (var i = 1; i <= 4; i++) {
          var gy = h - pad.b - i / 4 * (h - pad.b - pad.t);
          line(c, pad.l, gy, w - pad.r, gy, '#f0f3f6', 1);
          text(c, (i / 4 * maxY).toFixed(1), pad.l - 6, gy, '#b5bec9', 10, 'right');
        }
        var ideal = 4 * Math.PI * Math.PI / state.k;
        line(c, pad.l, h - pad.b, w - pad.r, h - pad.b - (ideal * maxM / maxY) * (h - pad.b - pad.t), '#D0C4E8', 2, [5, 4]);
        text(c, '理论线', w - pad.r - 4, pad.t + 8, '#8b6fb0', 11, 'right');
        state.data.forEach(function (d) {
          var px = pad.l + d.m / maxM * (w - pad.r - pad.l);
          var py = h - pad.b - (d.T * d.T) / maxY * (h - pad.b - pad.t);
          dot(c, px, py, 4, '#FFB3BA', '#fff');
        });
      }

      function updateReads() {
        var x = curX(), v = curV(), a = curA(), T = period();
        var E = 0.5 * state.k * state.A * state.A;
        function set(k, val) {
          var el = q1('[data-read="' + k + '"]');
          if (el) el.textContent = val;
        }
        set('x', x.toFixed(2));
        set('v', v.toFixed(2));
        set('a', a.toFixed(2));
        set('T', T.toFixed(2));
        set('f', (1 / T).toFixed(2));
        set('E', E.toFixed(1));
        if (extIndex === 2) {
          var ek = 0.5 * state.m * v * v;
          var ep = 0.5 * state.k * x * x;
          var bk = q1('[data-bar="ek"]'), bp = q1('[data-bar="ep"]'), bt = q1('[data-bar="et"]');
          if (bk) bk.style.width = (ek / E * 100).toFixed(1) + '%';
          if (bp) bp.style.width = (ep / E * 100).toFixed(1) + '%';
          if (bt) bt.style.width = '100%';
          var vk = q1('[data-barval="ek"]'), vp = q1('[data-barval="ep"]'), vt = q1('[data-barval="et"]');
          if (vk) vk.textContent = ek.toFixed(1);
          if (vp) vp.textContent = ep.toFixed(1);
          if (vt) vt.textContent = E.toFixed(1);
        }
      }

      /* ---------- 主动画 ---------- */
      var raf = 0;
      function loop(now) {
        if (!state.last) state.last = now;
        var dt = Math.min(0.05, (now - state.last) / 1000);
        state.last = now;
        if (state.running && !state.dragging) {
          state.phase += omega() * dt;
          state.t += dt;
        }
        drawStage();
        if (extIndex === 0 || extIndex === 3) drawXT();
        else if (extIndex === 1) drawPeriod();
        else if (extIndex === 2) { drawEnergyChart(); }
        else if (extIndex === 4) drawExpChart();
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
