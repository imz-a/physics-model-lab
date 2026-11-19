/* ============================================================
 * charged-particle-electric.js — 带电粒子在电场中的运动
 * 依赖：无（IIFE + window.ModelLab.modules 注册）
 * 物理：F=qE, a=qE/m；偏转 y=(qE/2mv0^2)x^2；tanθ=qEL/(mv0^2)
 *       加速 v^2=v0^2+2qEd；功能关系 W=qEy=ΔEk
 * 约定：file:// 可直接运行，零外部依赖，cleanup 撤销全部动画与监听。
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

  /* 跨子标签保留的参数（切换标签不清零，体验连续） */
  var saved = { E: 5, q: 5, m: 5, v0: 5, sign: 1, mode: 'deflect', playing: true };

  /* 物理尺度：滑块值 × 单位 = SI 量 */
  var EU = 1000, QU = 5e-7, MU = 1e-6, VU = 10;   // V/m, C, kg, m/s
  var PL = 0.30, GAP = 0.20, DR = 0.12;           // 极板长 / 板间距 / 漂移距离
  var XMIN = -0.05, XMAX = 0.47, YR = 0.125;      // 画布物理视窗

  // 四个子标签的主区专属数据图
  var CHART_TITLE = ['轨迹对比图 · 有 / 无电场', '偏转量 y 随参数的变化曲线', '能量随水平位置 x 的转化图', '偏移几何分解 · 屏上总偏移 Y'];
  var CHART_HINT = ['深色实线为当前轨迹，灰虚线为无电场时的直线', '扫 E / q 为直线，扫 v₀ 为双曲线，当前参数用圆点标出', 'Ekx 恒定、Eky 与 W 同步增长，二者始终相等（本图按偏转电场模型计算）', 'y 为板内偏移，屏上 Y = y + vᵧ·D/v₀'];
  var CIRCLE = Math.PI * 2;

  var STYLE_ID = 'ml-cpe-style';
  var CSS = ''
    + '.cpe-wrap{display:flex;flex-direction:column;gap:14px;font-size:16px;color:var(--ink,#3a4250)}'
    + '.cpe-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
    + '.cpe-chip{display:inline-flex;align-items:center;gap:8px;padding:7px 15px;border:1px solid var(--sky,#BFE3F5);border-radius:999px;background:#F1F8FD;color:#4A7FA0;font-size:14px;font-weight:600}'
    + '.cpe-chip i{width:8px;height:8px;border-radius:50%;background:#8CC6E5}'
    + '.cpe-seg{display:inline-flex;padding:3px;border:1px solid var(--line,#e8edf2);border-radius:999px;background:#f6f8fa;gap:3px}'
    + '.cpe-seg button{min-height:36px;padding:6px 16px;border:0;border-radius:999px;background:transparent;color:var(--ink2,#5a6472);font-size:15px}'
    + '.cpe-seg button.is-on{background:#fff;color:var(--ink,#3a4250);font-weight:700;box-shadow:0 1px 5px rgba(88,108,132,.13)}'
    + '.cpe-spacer{flex:1 1 auto}'
    + '.cpe-btn{min-height:40px;padding:8px 17px;border:1px solid var(--line,#dce4ec);border-radius:10px;background:#fff;color:var(--ink2,#5a6472);font-size:15px}'
    + '.cpe-btn:hover{background:#f6f8fa}'
    + '.cpe-btn--primary{border-color:#a9d9ef;background:#eaf6fc;color:#3E7FA3;font-weight:700}'
    + '.cpe-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr);gap:16px;align-items:stretch}'
    + '@media(max-width:1120px){.cpe-grid{grid-template-columns:1fr}}'
    + '.cpe-card{background:#fff;border:1px solid var(--line,#e8edf2);border-radius:var(--r-lg,18px);box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:17px 19px;min-width:0}'
    + '.cpe-card__t{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:700;margin-bottom:12px}'
    + '.cpe-card__t i{width:9px;height:9px;border-radius:50%;background:var(--sky,#BFE3F5)}'
    + '.cpe-card__hint{font-size:13px;color:var(--ink3,#8b95a3);font-weight:400;margin-left:auto}'
    + '.cpe-canvas{width:100%;height:auto;display:block;border-radius:12px;background:#fcfdfe;border:1px solid #eef2f6}'
    + '.cpe-side{display:flex;flex-direction:column;gap:14px}'
    + '.cpe-ctrl{display:block;margin-bottom:11px}'
    + '.cpe-ctrl__top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:14px;color:var(--ink2,#5a6472)}'
    + '.cpe-ctrl__top output{font-size:15px;font-weight:700;color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}'
    + '.cpe-ctrl input[type=range]{width:100%;margin:5px 0 0;accent-color:#8CC6E5;cursor:pointer;height:22px}'
    + '.cpe-reads{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.cpe-read{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;padding:9px 11px;border:1px solid var(--line,#eef2f6);border-radius:10px;background:var(--bg,#fafbfc)}'
    + '.cpe-read span{font-size:12px;color:var(--ink3,#8b95a3);flex:1 1 100%}'
    + '.cpe-read strong{font-size:18px;font-weight:700;color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}'
    + '.cpe-read em{font-size:12px;color:var(--ink3,#8b95a3);font-style:normal}'
    + '.cpe-note{margin-top:9px;padding:9px 12px;border-radius:10px;background:#FFF8EE;border:1px solid #ffe6c2;color:#8A6637;font-size:13px;line-height:1.6}'
    + '.cpe-extra{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}'
    + '.cpe-formula{padding:12px 14px;border-radius:10px;background:#F7F4FC;border:1px solid #e6dcf6;font-size:15px;color:#6B5896;line-height:1.9}'
    + '.cpe-formula b{font-size:17px}'
    + '.cpe-rel{display:grid;gap:8px;margin-top:11px}'
    + '.cpe-rel div{display:flex;justify-content:space-between;gap:10px;padding:8px 11px;border-radius:9px;background:#f6f8fa;font-size:14px;color:var(--ink2,#5a6472)}'
    + '.cpe-rel b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}'
    + '.cpe-chart{width:100%;height:auto;display:block;border-radius:10px;background:#fff;border:1px solid #eef2f6}'
    + '.cpe-bar{margin-top:11px}'
    + '.cpe-bar__top{display:flex;justify-content:space-between;font-size:13px;color:var(--ink2,#5a6472);margin-bottom:4px}'
    + '.cpe-bar__top b{font-variant-numeric:tabular-nums;color:var(--ink,#3a4250)}'
    + '.cpe-bar__track{height:22px;border-radius:99px;background:#f0f3f7;overflow:hidden}'
    + '.cpe-bar__fill{height:100%;width:0%;border-radius:99px;transition:width .12s linear}'
    + '.cpe-eq{margin-top:12px;padding:10px 13px;border-radius:10px;background:#F1FBF6;border:1px solid #cceede;color:#437F64;font-size:14px;line-height:1.7}'
    + '.cpe-q{padding:13px 15px;border:1px solid #ffe6c2;border-radius:11px;background:#FFFCF0;font-size:15px;line-height:1.85;color:#6d5b36}'
    + '.cpe-q strong{color:#8A6637}'
    + '.cpe-ans{margin-top:11px;padding:12px 15px;border:1px solid #cceede;border-radius:11px;background:#F1FBF6;font-size:14px;color:#3F7A60;line-height:1.9}'
    + '.cpe-ans[hidden]{display:none}'
    + '.cpe-opt{display:grid;gap:7px;margin-top:10px}'
    + '.cpe-opt button{min-height:40px;text-align:left;padding:8px 12px;border:1px solid var(--line,#dce4ec);border-radius:9px;background:#fff;font-size:14px;color:var(--ink2,#5a6472)}'
    + '.cpe-opt button:hover{background:#f6f8fa}'
    + '.cpe-opt button.is-right{border-color:#a9dfc4;background:#effaf4;color:#3F7A60;font-weight:700}';

  function ensureStyle() {
    if (!doc.getElementById(STYLE_ID)) {
      var st = doc.createElement('style');
      st.id = STYLE_ID;
      st.textContent = CSS;
      doc.head.appendChild(st);
    }
  }

  /* 画布按实际显示宽度 1:1 渲染：逻辑像素 == CSS 像素，文字不再被缩小发虚；
     高分屏用 dpr 倍缓冲保证锐利。容器宽度变化时自动重算。 */
  function setupCanvas(w, h) {
    var aspect = w / h;
    var c = doc.createElement('canvas');
    c.className = 'cpe-canvas';
    var ctx = c.getContext('2d');
    var view = { el: c, ctx: ctx, w: w, h: h, aspect: aspect, lastW: 0, lastDpr: 0 };
    view.resize = function () {
      var host = c.parentNode || c;
      var cssW = Math.round(host.clientWidth || c.clientWidth || w);
      if (cssW < 200) cssW = w;
      var cssH = Math.round(cssW / aspect);
      var dpr = Math.min(global.devicePixelRatio || 1, 2);
      if (cssW === view.lastW && dpr === view.lastDpr) return false;
      view.lastW = cssW; view.lastDpr = dpr;
      c.style.width = '100%';
      c.style.height = cssH + 'px';
      c.width = Math.round(cssW * dpr);
      c.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view.w = cssW; view.h = cssH;
      return true;
    };
    return view;
  }

  function nf(v) {
    if (!isFinite(v)) return '—';
    var a = Math.abs(v);
    return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : v.toFixed(2);
  }
  function on(map, el, type, fn) {
    el.addEventListener(type, fn);
    var a = map[type] || (map[type] = []);
    a.push([el, fn]);
  }

  /* ---------------- 物理计算 ---------------- */
  function calcY(E, q, m, v0) {
    var a = q * E / m;
    return 0.5 * a * (PL / v0) * (PL / v0);
  }
  function derive(s) {
    var E = s.E * EU;
    var q = s.sign * s.q * QU;
    var m = s.m * MU;
    var v0 = s.v0 * VU;
    var a = q * E / m;
    var tL = PL / v0;
    var yL = 0.5 * a * tL * tL;
    var vyL = a * tL;
    var vOut = Math.sqrt(v0 * v0 + vyL * vyL);
    var W = q * E * yL;
    var dEk = 0.5 * m * (vOut * vOut - v0 * v0);
    var yScreen = yL + vyL * (DR / v0);
    var hit = Math.abs(yL) > GAP / 2;
    var xHit = hit ? v0 * Math.sqrt(GAP / Math.abs(a)) : PL;
    var U = E * GAP;
    var disc = v0 * v0 + 2 * a * GAP;
    return {
      E: E, q: q, m: m, v0: v0, a: a, tL: tL, yL: yL, vyL: vyL, mode: s.mode,
      vOut: vOut, tan: vyL / v0, W: W, dEk: dEk, yScreen: yScreen,
      hit: hit, xHit: xHit, U: U, disc: disc, vAcc: disc >= 0 ? Math.sqrt(disc) : 0
    };
  }

  /* ---------------- HTML ---------------- */
  function slider(key, label, min, max, step, val, unit) {
    return '<label class="cpe-ctrl"><span class="cpe-ctrl__top"><span>' + label + '</span>'
      + '<output data-out="' + key + '">' + nf(val) + ' ' + unit + '</output></span>'
      + '<input type="range" data-key="' + key + '" min="' + min + '" max="' + max
      + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></label>';
  }
  function read(k, label, unit) {
    return '<div class="cpe-read"><span>' + label + '</span><strong data-read="' + k + '">—</strong><em>' + unit + '</em></div>';
  }
  function signSeg(sign) {
    return '<div class="cpe-seg" data-seg="sign">'
      + '<button type="button" data-val="1" class="' + (sign > 0 ? 'is-on' : '') + '">正电荷 +q</button>'
      + '<button type="button" data-val="-1" class="' + (sign < 0 ? 'is-on' : '') + '">负电荷 −q</button>'
      + '</div>';
  }
  function modeSeg(mode) {
    return '<div class="cpe-seg" data-seg="mode">'
      + '<button type="button" data-val="deflect" class="' + (mode === 'deflect' ? 'is-on' : '') + '">偏转电场</button>'
      + '<button type="button" data-val="accel" class="' + (mode === 'accel' ? 'is-on' : '') + '">加速电场</button>'
      + '</div>';
  }

  function buildHtml(idx, s) {
    var extra = '';
    if (idx === 1) {
      extra = '<div class="cpe-card"><div class="cpe-card__t"><i style="background:var(--peach,#FFD8A8)"></i>偏转分析 · 比例关系'
        + '<span class="cpe-card__hint">横轴为所选物理量，纵轴为极板出口偏移 |y|</span></div>'
        + '<div class="cpe-seg" data-seg="scan" style="margin-bottom:10px">'
        + '<button type="button" data-val="E" class="is-on">扫 E</button>'
        + '<button type="button" data-val="q">扫 q</button>'
        + '<button type="button" data-val="m">扫 m</button>'
        + '<button type="button" data-val="v0">扫 v₀</button></div>'
        + '<div data-chart></div>'
        + '<div class="cpe-rel">'
        + '<div><span>y ∝ qE / (m v₀²)</span><b data-rel="base">—</b></div>'
        + '<div><span>tanθ = vᵧ / v₀ = qEL / (m v₀²)</span><b data-rel="tan">—</b></div>'
        + '<div><span>屏上总偏移 Y = y(1 + 2D/L)</span><b data-rel="screen">—</b></div>'
        + '</div></div>'
        + '<div class="cpe-card"><div class="cpe-card__t"><i style="background:var(--lav,#D0C4E8)"></i>控制变量结论</div>'
        + '<div class="cpe-formula">'
        + '<b>y = (qE / 2m v₀²) · x²</b><br>'
        + '① E 加倍 → y 加倍；② q 加倍 → y 加倍<br>'
        + '③ m 加倍 → y 减半；④ v₀ 加倍 → y 变为 1/4<br>'
        + '⑤ 与板长 L：y ∝ L²，tanθ ∝ L'
        + '</div><div class="cpe-note">提示：点上面的「扫 v₀」可以看到双曲线，而「扫 E / 扫 q」是过原点的直线。当前点用深色标出。</div></div>';
    } else if (idx === 2) {
      extra = '<div class="cpe-card"><div class="cpe-card__t"><i style="background:var(--mint,#B8E8D0)"></i>实时能量条形图'
        + '<span class="cpe-card__hint">单位 mJ，随粒子位置实时变化</span></div>'
        + '<div class="cpe-bar"><div class="cpe-bar__top"><span>水平动能 Eₖₓ = ½mv₀²（不变）</span><b data-barv="kx">—</b></div>'
        + '<div class="cpe-bar__track"><div class="cpe-bar__fill" data-bar="kx" style="background:var(--mint,#B8E8D0)"></div></div></div>'
        + '<div class="cpe-bar"><div class="cpe-bar__top"><span>竖直动能 Eₖᵧ = ½mvᵧ²（随 y 增长）</span><b data-barv="ky">—</b></div>'
        + '<div class="cpe-bar__track"><div class="cpe-bar__fill" data-bar="ky" style="background:var(--peach,#FFD8A8)"></div></div></div>'
        + '<div class="cpe-bar"><div class="cpe-bar__top"><span>电场力做功 W = qEy</span><b data-barv="w">—</b></div>'
        + '<div class="cpe-bar__track"><div class="cpe-bar__fill" data-bar="w" style="background:var(--lav,#D0C4E8)"></div></div></div>'
        + '<div class="cpe-bar"><div class="cpe-bar__top"><span>动能增量 ΔEₖ = ½m(v²−v₀²)</span><b data-barv="dek">—</b></div>'
        + '<div class="cpe-bar__track"><div class="cpe-bar__fill" data-bar="dek" style="background:var(--sky,#BFE3F5)"></div></div></div>'
        + '<div class="cpe-eq">W = qEy = ΔEₖ —— 电场力做多少功，动能就增加多少。'
        + '注意：水平分速度始终为 v₀，增加的动能全部来自竖直方向。</div></div>'
        + '<div class="cpe-card"><div class="cpe-card__t"><i style="background:var(--cream,#FFF3BF)"></i>动能定理推导</div>'
        + '<div class="cpe-formula"><b>vᵧ² = 2ay = 2(qE/m)y</b><br>'
        + '½mvᵧ² = qEy = W<br>'
        + 'v = √(v₀² + vᵧ²)　→　ΔEₖ = ½mvᵧ²</div>'
        + '<div class="cpe-note">加速电场中同一结论写成 qU = ½mv² − ½mv₀²，其中 U = Ed。</div></div>';
    } else if (idx === 3) {
      extra = '<div class="cpe-card"><div class="cpe-card__t"><i style="background:var(--pink,#FFB3BA)"></i>高考题型 · 偏转电场中的类平抛</div>'
        + '<div class="cpe-q"><strong>题目</strong>　一束带电粒子以速度 v₀ 垂直射入板长为 L、板间距为 d 的匀强偏转电场（场强 E），'
        + '粒子质量 m、电荷量 q。不计重力。<br>'
        + '<strong>问</strong>　(1) 粒子在电场中运动的时间；(2) 离开电场时的侧移 y 与偏转角 tanθ；'
        + '(3) 若其后经过距离 D 到达荧光屏，求总偏移量 Y。</div>'
        + '<button class="cpe-btn cpe-btn--primary" type="button" data-act="ans" style="margin-top:11px">查看解析 ▾</button>'
        + '<div class="cpe-ans" data-ans hidden>'
        + '(1) 水平方向匀速：<b>t = L / v₀</b><br>'
        + '(2) 竖直方向 a = qE/m，故 <b>y = ½at² = qEL² / (2mv₀²)</b>；'
        + 'vᵧ = at = qEL/(mv₀)，<b>tanθ = vᵧ/v₀ = qEL/(mv₀²)</b>。<br>'
        + '(3) 出电场后做匀速直线，反向延长线过水平位移中点，故 '
        + '<b>Y = y + vᵧ·D/v₀ = (qEL/(mv₀²))(L/2 + D)</b>。<br>'
        + '代入当前参数：t = <b data-a="t">—</b> s，y = <b data-a="y">—</b> mm，'
        + 'tanθ = <b data-a="tan">—</b>，Y = <b data-a="Y">—</b> mm。'
        + '</div></div>'
        + '<div class="cpe-card"><div class="cpe-card__t"><i style="background:var(--sky,#BFE3F5)"></i>易错辨析 · 选一选</div>'
        + '<div style="font-size:15px;line-height:1.8">若想把屏上总偏移量 Y 减小为原来的一半，下列做法可行的是？</div>'
        + '<div class="cpe-opt"><button type="button" data-opt="a">A. 只把初速度 v₀ 增大为原来的 2 倍</button>'
        + '<button type="button" data-opt="b">B. 只把电场强度 E 减小为原来的一半</button>'
        + '<button type="button" data-opt="c">C. 只把板长 L 减小为原来的一半</button></div>'
        + '<div class="cpe-eq" data-optans hidden><b>答案：B。</b>Y ∝ E，E 减半则 Y 减半。'
        + 'A 错：Y ∝ 1/v₀²，v₀ 加倍 Y 变为 1/4；C 错：Y ∝ L(L/2+D)，L 减半并不是简单减半（漂移段贡献仍在）。</div></div>';
    } else {
      extra = '<div class="cpe-card"><div class="cpe-card__t"><i style="background:var(--sky,#BFE3F5)"></i>核心规律 · 类平抛</div>'
        + '<div class="cpe-formula"><b>F = qE　→　a = qE/m</b><br>'
        + '垂直电场方向：<b>x = v₀t</b>（匀速）<br>'
        + '沿电场方向：<b>y = ½at²</b>（初速为零的匀加速）<br>'
        + '消去 t：<b>y = (qE / 2mv₀²) x²</b> —— 抛物线</div>'
        + '<div class="cpe-note">粒子带负电时受力方向与电场方向相反，轨迹向下弯；图中已按电荷正负自动切换。</div></div>'
        + '<div class="cpe-card"><div class="cpe-card__t"><i style="background:var(--mint,#B8E8D0)"></i>加速电场 · 直线模型</div>'
        + '<div class="cpe-formula"><b>qU = ½mv² − ½mv₀²</b><br>'
        + '其中 U = E·d，d = ' + GAP.toFixed(2) + ' m（加速极板间距）<br>'
        + '若从静止出发：<b>v = √(2qU/m)</b></div>'
        + '<div class="cpe-note">点上方「加速电场」切换：粒子沿直线加速，紫色箭头表示电场，速度矢量随位置增长。</div></div>';
    }

    return '<div class="cpe-wrap">'
      + '<div class="cpe-bar"><span class="cpe-chip"><i></i>' + (idx === 2 ? '功能关系 · 动能定理' : idx === 3 ? '题型归纳 · 类平抛' : '匀强电场 · 匀变速曲线') + '</span>'
      + modeSeg(s.mode)
      + '<span class="cpe-spacer"></span>'
      + '<button class="cpe-btn cpe-btn--primary" type="button" data-act="play">' + (s.playing ? '⏸ 暂停' : '▶ 播放') + '</button>'
      + '<button class="cpe-btn" type="button" data-act="reset">↺ 重置</button></div>'
      + '<div class="cpe-grid">'
      + '<div class="cpe-card"><div class="cpe-card__t"><i></i>运动轨迹与速度分解'
      + '<span class="cpe-card__hint">纵向为等比例显示 · 深色虚线为无碰撞时的延长轨迹</span></div>'
      + '<div data-canvas></div>'
      + '<div class="cpe-card__t" style="margin-top:14px"><i style="background:var(--sky,#BFE3F5)"></i>' + CHART_TITLE[idx]
      + '<span class="cpe-card__hint">' + CHART_HINT[idx] + '</span></div>'
      + '<div data-datachart></div></div>'
      + '<div class="cpe-side">'
      + '<div class="cpe-card"><div class="cpe-card__t"><i style="background:var(--pink,#FFB3BA)"></i>参数调节</div>'
      + slider('E', '电场强度 E（×10³ V/m）', 1, 10, 0.5, s.E, '×10³ V/m')
      + slider('q', '电荷量 |q|（×5×10⁻⁷ C）', 1, 10, 0.5, s.q, '×5×10⁻⁷ C')
      + slider('m', '质量 m（×10⁻⁶ kg）', 1, 10, 0.5, s.m, '×10⁻⁶ kg')
      + slider('v0', '初速度 v₀（×10 m/s）', 2, 10, 0.5, s.v0, '×10 m/s')
      + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px">'
      + '<span style="font-size:13px;color:var(--ink3,#8b95a3)">电荷符号</span>' + signSeg(s.sign) + '</div>'
      + '</div>'
      + '<div class="cpe-card"><div class="cpe-card__t"><i style="background:var(--peach,#FFD8A8)"></i>实时读数</div>'
      + '<div class="cpe-reads">'
      + read('a', '加速度 a', 'm/s²') + read('t', '场内时间 t', 'ms')
      + read('y', '出口偏移 y', 'mm') + read('tan', '偏转角 tanθ', '')
      + read('v', '飞出速度 v', 'm/s') + read('w', '电场力做功 W', 'mJ')
      + read('U', '加速电压 U', 'kV') + read('vacc', '加速末速 v', 'm/s')
      + '</div><div class="cpe-note" data-status>粒子水平射入，沿抛物线偏转。</div>'
      + '</div></div></div>'
      + '<div class="cpe-extra">' + extra + '</div>'
      + '</div>';
  }

  /* ---------------- 绘制 ---------------- */
  function arrow(ctx, x1, y1, x2, y2, color, text, lw, lab) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
    if (len < 3) return;
    var ux = dx / len, uy = dy / len, hs = Math.min(11, len * 0.32);
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * hs - uy * hs * 0.55, y2 - uy * hs + ux * hs * 0.55);
    ctx.lineTo(x2 - ux * hs + uy * hs * 0.55, y2 - uy * hs - ux * hs * 0.55);
    ctx.closePath(); ctx.fill();
    if (text) {
      ctx.font = '600 16px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = lab && lab.align ? lab.align : 'left';
      ctx.fillText(text, x2 + (lab && lab.dx != null ? lab.dx : 7),
        y2 + (lab && lab.dy != null ? lab.dy : -7));
    }
    ctx.restore();
  }
  function label(ctx, text, x, y, color, align, size) {
    ctx.save();
    ctx.font = (size || 15) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = color || C.ink3;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function pointAt(px, d) {
    if (d.mode === 'accel') {
      var x0 = 0.02;
      if (px <= x0) return { x: px, y: 0, vx: d.v0, vy: 0 };
      var dx = px - x0, t;
      if (Math.abs(d.a) < 1e-12) t = dx / d.v0;
      else {
        var disc = d.v0 * d.v0 + 2 * d.a * dx;
        if (disc < 0) return null;
        t = (-d.v0 + Math.sqrt(disc)) / d.a;
      }
      return { x: px, y: 0, vx: d.v0 + d.a * t, vy: 0 };
    }
    if (px <= 0) return { x: px, y: 0, vx: d.v0, vy: 0 };
    if (d.hit && px > d.xHit) return null;
    if (px < PL) {
      var t1 = px / d.v0;
      return { x: px, y: 0.5 * d.a * t1 * t1, vx: d.v0, vy: d.a * t1 };
    }
    var tL = d.tL, yL = d.yL, vyL = d.vyL;
    var td = (px - PL) / d.v0;
    return { x: px, y: yL + vyL * td, vx: d.v0, vy: vyL };
  }

  function drawScene(view, d, s, prog) {
    var ctx = view.ctx, W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    // 底部留独立状态条，避免状态文字与“d / 板长”标注贴边被裁
    var pad = 18, bottom = 32;
    var pw = W - pad * 2, ph = H - pad - bottom;
    var scale = Math.min(pw / (XMAX - XMIN), ph / (2 * YR));
    var midX = (XMIN + XMAX) / 2, cx = pad + pw / 2, cy = pad + ph / 2;
    function PX(x) { return cx + (x - midX) * scale; }
    function PY(y) { return cy - y * scale; }

    ctx.save();
    ctx.strokeStyle = '#f0f4f8'; ctx.lineWidth = 1;
    for (var gx = Math.ceil(XMIN / 0.1) * 0.1; gx < XMAX; gx += 0.1) {
      ctx.beginPath(); ctx.moveTo(PX(gx), pad); ctx.lineTo(PX(gx), H - pad); ctx.stroke();
    }
    for (var gy = -0.1; gy <= 0.101; gy += 0.05) {
      ctx.beginPath(); ctx.moveTo(pad, PY(gy)); ctx.lineTo(W - pad, PY(gy)); ctx.stroke();
    }
    ctx.restore();

    var maxX, endCap;
    if (d.mode === 'accel') {
      maxX = 0.30; endCap = 0.22;
      // 加速极板
      ctx.save();
      ctx.strokeStyle = C.lavD; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(PX(0.02), PY(-0.1)); ctx.lineTo(PX(0.02), PY(0.1)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX(0.22), PY(-0.1)); ctx.lineTo(PX(0.22), PY(0.1)); ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = C.lav; ctx.fillStyle = C.lavD; ctx.lineWidth = 2;
      for (var ax = 0.055; ax < 0.21; ax += 0.04) {
        ctx.beginPath(); ctx.moveTo(PX(ax), PY(0.07)); ctx.lineTo(PX(ax + 0.016), PY(0.07)); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(PX(ax + 0.022), PY(0.07));
        ctx.lineTo(PX(ax + 0.012), PY(0.07) - 5);
        ctx.lineTo(PX(ax + 0.012), PY(0.07) + 5);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      label(ctx, 'U = ' + nf(d.U / 1000) + ' kV', PX(0.12), PY(0.085), C.lavD, 'center');
      label(ctx, '加速电场 E', PX(0.12), PY(-0.082), C.lavD, 'center');
    } else {
      maxX = XMAX; endCap = PL + DR;
      // 偏转极板
      ctx.save();
      ctx.strokeStyle = C.lavD; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(PX(0), PY(GAP / 2)); ctx.lineTo(PX(PL), PY(GAP / 2)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX(0), PY(-GAP / 2)); ctx.lineTo(PX(PL), PY(-GAP / 2)); ctx.stroke();
      ctx.restore();
      // 电场线（向上）
      ctx.save();
      ctx.strokeStyle = C.mintD; ctx.fillStyle = C.mintD; ctx.lineWidth = 1.8;
      for (var ex = 0.045; ex < PL; ex += 0.06) {
        ctx.beginPath(); ctx.moveTo(PX(ex), PY(-0.072)); ctx.lineTo(PX(ex), PY(0.056)); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(PX(ex), PY(0.07));
        ctx.lineTo(PX(ex) - 5, PY(0.052)); ctx.lineTo(PX(ex) + 5, PY(0.052));
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      label(ctx, 'E ↑', PX(PL / 2), PY(0.115), C.mintD, 'center', 14);
      // 荧光屏
      ctx.save();
      ctx.setLineDash([6, 5]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(PX(endCap), PY(0.11)); ctx.lineTo(PX(endCap), PY(-0.11)); ctx.stroke();
      ctx.restore();
      label(ctx, '荧光屏', PX(endCap), PY(-0.115), C.ink3, 'center');
      if (!d.hit) {
        var sy = PY(d.yScreen);
        ctx.save(); ctx.fillStyle = C.pinkD;
        ctx.beginPath(); ctx.arc(PX(endCap), sy, 5, 0, CIRCLE); ctx.fill();
        ctx.restore();
        label(ctx, 'Y=' + nf(d.yScreen * 1000) + 'mm', PX(endCap) - 9, sy - 10, C.pinkD, 'right');
      }
    }

    // 轨迹：虚线全程 + 实线到当前进度
    function trace(until, dashed, color, width) {
      ctx.save();
      if (dashed) ctx.setLineDash([6, 6]);
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round';
      ctx.beginPath();
      var started = false;
      for (var i = 0; i <= 160; i++) {
        var xx = XMIN + (Math.max(XMIN, until) - XMIN) * (i / 160);
        var p = pointAt(xx, d);
        if (!p) break;
        if (!started) { ctx.moveTo(PX(p.x), PY(p.y)); started = true; }
        else ctx.lineTo(PX(p.x), PY(p.y));
      }
      ctx.stroke(); ctx.restore();
    }
    var targetX = XMIN + (maxX - XMIN) * prog;
    if (d.mode !== 'accel' && d.hit) targetX = Math.min(targetX, d.xHit);
    trace(maxX, true, '#dfe6ee', 2);
    trace(targetX, false, d.mode === 'accel' ? C.lavD : C.pinkD, 3.2);

    // 粒子 + 速度分解
    var cur = pointAt(targetX, d);
    if (cur) {
      var px0 = PX(cur.x), py0 = PY(cur.y);
      ctx.save();
      ctx.fillStyle = '#fff'; ctx.strokeStyle = C.pinkD; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px0, py0, 8, 0, CIRCLE); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.pinkD;
      ctx.beginPath(); ctx.arc(px0, py0, 3.4, 0, CIRCLE); ctx.fill();
      ctx.restore();

      var vxLen = cur.vx * 0.0016 * scale;
      var vyLen = cur.vy * 0.0016 * scale;
      // 箭头收在画布内，贴边时不会把标注挤出可视区
      var vxDraw = Math.max(6, Math.min(vxLen, W - 14 - px0));
      var vyRoom = vyLen >= 0 ? py0 - 14 : (H - bottom) - py0 - 14;
      var vyDraw = Math.abs(vyLen) > 0.4
        ? (vyLen >= 0 ? 1 : -1) * Math.min(Math.abs(vyLen), Math.max(6, vyRoom)) : 0;
      // 三个速度标注分开摆放：vₓ 在右、vᵧ 在左、合速度 v 在斜箭头右上；
      // 箭头尖靠近上边缘时标注自动翻到下方；竖直分量很小时省略 v 避免叠字。
      function labFor(tipY, base) { return tipY < 30 ? { dx: base.dx, dy: 15, align: base.align } : base; }
      var vxLab = labFor(py0, { dx: -6, dy: -10, align: 'right' });
      var vyLab = labFor(py0 - vyDraw, { dx: -7, dy: -4, align: 'right' });
      var vLab = labFor(py0 - vyDraw, { dx: 8, dy: -9, align: 'left' });
      arrow(ctx, px0, py0, px0 + vxDraw, py0, C.skyD, 'vₓ', 2.4, vxLab);
      if (Math.abs(vyDraw) > 0.4) arrow(ctx, px0, py0, px0, py0 - vyDraw, C.pinkD, 'vᵧ', 2.4, vyLab);
      arrow(ctx, px0, py0, px0 + vxDraw, py0 - vyDraw, C.mintD,
        Math.abs(vyDraw) > 18 ? 'v' : null, 2.8, vLab);
    }

    // 入射标注
    label(ctx, 'v₀ 水平射入', PX(XMIN) + 4, PY(0) - 12, C.ink2, 'left');
    if (d.mode !== 'accel') {
      label(ctx, '板长 L = ' + PL.toFixed(2) + ' m', PX(PL / 2), PY(-GAP / 2) + 20, C.ink3, 'center', 13);
      label(ctx, 'd = ' + GAP.toFixed(2) + ' m', PX(0), PY(-0.116), C.ink3, 'left', 13);
    }
    var status = d.mode === 'accel'
      ? (d.disc < 0 ? '粒子未能穿出加速区（电场力做负功）' : '直线加速：v² = v₀² + 2qEd')
      : (d.hit ? '⚠ 粒子在极板间发生碰撞，未飞出电场' : '粒子飞出电场，随后做匀速直线运动');
    label(ctx, status, pad + 2, H - 9, d.hit || d.disc < 0 ? C.pinkD : C.ink3, 'left', 13);
    return cur;
  }

  /* ---------------- 副标签图表 ---------------- */
  function drawScan(view, s, d, key) {
    var ctx = view.ctx, W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    var L = 46, R = W - 16, T = 16, B = H - 32;
    ctx.save();
    ctx.strokeStyle = '#e8edf2'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    var maxY = GAP / 2;
    function xv(v, min, max) { return L + (R - L) * (v - min) / (max - min); }
    function yv(y) { return B - (B - T) * Math.min(y, maxY) / maxY; }
    // 撞板区
    ctx.fillStyle = '#FFF4F5'; ctx.fillRect(L, T, R - L, yv(maxY) - T);
    label(ctx, '撞板区', R - 4, T + 15, C.pinkD, 'right');
    label(ctx, '|y| / mm', L - 4, T + 6, C.ink3, 'right');
    for (var ty = 0; ty <= maxY + 1e-9; ty += 0.05) {
      ctx.save(); ctx.strokeStyle = '#f2f5f8';
      ctx.beginPath(); ctx.moveTo(L, yv(ty)); ctx.lineTo(R, yv(ty)); ctx.stroke(); ctx.restore();
      label(ctx, (ty * 1000).toFixed(0), L - 5, yv(ty) + 4, C.ink3, 'right');
    }
    var min = 1, max = 10, cv = s[key], n = 120;
    function val(v) {
      var a = s.E, b = s.q, m = s.m, u = s.v0;
      if (key === 'E') a = v; else if (key === 'q') b = v; else if (key === 'm') m = v; else u = v;
      return Math.abs(calcY(a * EU, b * QU, m * MU, u * VU));
    }
    ctx.save(); ctx.strokeStyle = C.skyD; ctx.lineWidth = 2.6; ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var v = min + (max - min) * i / n;
      var xx = xv(v, min, max), yy = yv(val(v));
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke(); ctx.restore();
    var cxp = xv(cv, min, max), cyp = yv(val(cv));
    ctx.save(); ctx.fillStyle = C.lavD;
    ctx.beginPath(); ctx.arc(cxp, cyp, 6, 0, CIRCLE); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    var names = { E: 'E (×10³ V/m)', q: '|q| (×5×10⁻⁷ C)', m: 'm (×10⁻⁶ kg)', v0: 'v₀ (×10 m/s)' };
    label(ctx, names[key], R, H - 9, C.ink2, 'right');
    label(ctx, '当前 ' + nf(cv) + ' → ' + nf(val(cv) * 1000) + ' mm', L + 4, H - 9, C.lavD, 'left');
  }

  /* ---------------- 子标签主区专属数据图 ---------------- */
  function drawDataChart(view, idx, d, s) {
    var K = global.ChartKit;
    if (!K) return;
    var m = d.m, v0 = d.v0, a = d.a, q = d.q, E = d.E;
    if (idx === 0) {
      var pts = [], line = [];
      for (var i = 0; i <= 60; i++) {
        var x = PL * i / 60, t = x / v0;
        pts.push([x * 100, 0.5 * a * t * t * 1000]);
        line.push([x * 100, 0]);
      }
      var maxAbs = Math.max(2, Math.abs(0.5 * a * (PL / v0) * (PL / v0) * 1000) * 1.15);
      K.line(view, {
        title: '轨迹对比：有 / 无偏转电场', xLabel: '水平位置 x', xUnit: 'cm', yLabel: '竖直偏移 y', yUnit: 'mm',
        xMin: 0, xMax: PL * 100, yMin: -maxAbs, yMax: maxAbs, legend: true,
        series: [
          { name: '无电场（直线）', color: C.ink3, dash: [5, 4], width: 1.6, points: line },
          { name: '有电场（抛物线）', color: C.pinkD, width: 2.6, points: pts }
        ],
        markers: [{ x: PL * 100, y: d.yL * 1000, label: '出口 y=' + nf(d.yL * 1000) + ' mm', color: C.lavD, cross: true }]
      });
    } else if (idx === 1) {
      var fns = [
        { name: '扫 E（y∝E）', color: C.pinkD, fn: function (r) { return r; } },
        { name: '扫 q（y∝q）', color: C.mintD, fn: function (r) { return r; } },
        { name: '扫 m（y∝1/m）', color: C.skyD, fn: function (r) { return 1 / r; } },
        { name: '扫 v₀（y∝1/v₀²）', color: C.lavD, fn: function (r) { return 1 / (r * r); } }
      ];
      var series = fns.map(function (f) {
        var pts2 = [];
        for (var j = 0; j <= 40; j++) { var r = 0.4 + 3.6 * j / 40; pts2.push([r, f.fn(r)]); }
        return { name: f.name, color: f.color, width: 2.2, points: pts2 };
      });
      K.line(view, {
        title: '控制变量：偏移倍数随参数倍数变化', xLabel: '参数变为原来的', xUnit: '倍', yLabel: '偏移 y 变为原来的', yUnit: '倍',
        xMin: 0.4, xMax: 4, yMin: 0, yMax: 4, legend: true, series: series,
        markers: [{ x: 1, y: 1, label: '当前状态', color: C.ink, r: 5, cross: true }],
        hlines: [{ y: 1, label: '基准', color: C.ink3, dash: [4, 4] }]
      });
    } else if (idx === 2) {
      var ekx = 0.5 * m * v0 * v0 * 1e3;
      var sEky = [], sW = [];
      var ekEnd = 0.5 * m * Math.pow(a * PL / v0, 2) * 1e3;
      // 纵轴按 Eky/W 的量程定，让"同步增长"清晰可见；Ekx 恒定值另用文字标注
      var maxE = Math.max(0.01, ekEnd) * 1.2;
      for (var k = 0; k <= 50; k++) {
        var xk = PL * k / 50, tk = xk / v0, vyk = a * tk, yk = 0.5 * a * tk * tk;
        sEky.push([xk * 100, 0.5 * m * vyk * vyk * 1e3]);
        sW.push([xk * 100, q * E * yk * 1e3]);
      }
      K.line(view, {
        title: '能量转化：Eky 与 W 同步增长', xLabel: '水平位置 x', xUnit: 'cm', yLabel: '能量', yUnit: 'mJ',
        xMin: 0, xMax: PL * 100, yMin: 0, yMax: maxE, legend: true,
        series: [
          { name: '竖直动能 Eky', color: C.peachD, width: 2.6, points: sEky },
          { name: '做功 W=qEy', color: C.lavD, width: 2.2, dash: [5, 3], points: sW }
        ],
        markers: [{ x: PL * 100, y: ekEnd, label: '出口 W=Eky', color: C.peachD, r: 5 }]
      });
    } else {
      var yIn = Math.abs(d.yL * 1000), drift = Math.abs(d.vyL * (DR / v0) * 1000), total = Math.abs(d.yScreen * 1000);
      K.bars(view, {
        title: '屏上总偏移 = 板内偏移 + 漂移段偏移', yLabel: '偏移量', yUnit: 'mm',
        yMax: Math.max(1, total * 1.25),
        bars: [
          { label: '板内 y', value: yIn, color: C.pinkD, note: 'qEL²/2mv₀²' },
          { label: '漂移段 Δy', value: drift, color: C.skyD, note: 'vᵧ·D/v₀' },
          { label: '屏上总 Y', value: total, color: C.lavD, note: 'y + Δy' }
        ],
        fmt: function (v) { return nf(v) + ' mm'; }
      });
    }
  }

  /* ---------------- 模块注册 ---------------- */
  NS.modules['charged-particle-electric'] = {
    render: function (container, extIndex) {
      ensureStyle();
      var idx = Math.max(0, Math.min(3, Number(extIndex) || 0));
      var s = {
        E: saved.E, q: saved.q, m: saved.m, v0: saved.v0, sign: saved.sign,
        mode: saved.mode, playing: saved.playing, scan: 'E'
      };
      container.innerHTML = buildHtml(idx, s);

      var view = setupCanvas(1000, 430);
      container.querySelector('[data-canvas]').appendChild(view.el);
      var dataView = setupCanvas(680, 260);
      dataView.el.className = 'cpe-chart';
      container.querySelector('[data-datachart]').appendChild(dataView.el);
      var chartView = idx === 1 ? setupCanvas(560, 210) : null;
      if (chartView) {
        chartView.el.className = 'cpe-chart';
        container.querySelector('[data-chart]').appendChild(chartView.el);
      }

      var raf = 0, last = 0, prog = 0, dead = false;
      var listeners = Object.create(null);
      var q1 = function (sel) { return container.querySelector(sel); };
      var qa = function (sel) { return container.querySelectorAll(sel); };

      // 容器宽度变化（侧栏折叠 / 窗口缩放）时按 1:1 重算画布，保持文字清晰。
      var views = chartView ? [view, dataView, chartView] : [view, dataView];
      function resizeAll() { views.forEach(function (v) { v.resize(); }); }
      resizeAll();
      var ro = global.ResizeObserver ? new global.ResizeObserver(resizeAll) : null;
      if (ro) views.forEach(function (v) { ro.observe(v.el.parentNode); });
      else on(listeners, global, 'resize', resizeAll);

      function setOutputs() {
        var out = qa('[data-out]');
        for (var i = 0; i < out.length; i++) {
          var k = out[i].getAttribute('data-out');
          if (s[k] != null) out[i].textContent = nf(s[k]) + ' ' + (k === 'E' ? '×10³ V/m' : k === 'q' ? '×5×10⁻⁷ C' : k === 'm' ? '×10⁻⁶ kg' : '×10 m/s');
        }
      }
      function setSeg(name, val) {
        var box = q1('[data-seg="' + name + '"]');
        if (!box) return;
        var bs = box.querySelectorAll('button');
        for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('is-on', bs[i].getAttribute('data-val') === String(val));
      }
      function syncSaved() {
        saved.E = s.E; saved.q = s.q; saved.m = s.m; saved.v0 = s.v0;
        saved.sign = s.sign; saved.mode = s.mode; saved.playing = s.playing;
      }
      function setRead(k, v) { var e = q1('[data-read="' + k + '"]'); if (e) e.textContent = v; }
      function setReadVisible(k, show) {
        var e = q1('[data-read="' + k + '"]');
        if (e && e.parentNode) e.parentNode.style.display = show ? '' : 'none';
      }

      var sliders = qa('input[type=range]');
      function inputHandler(e) {
        var key = e.target.getAttribute('data-key');
        s[key] = Number(e.target.value);
        setOutputs(); syncSaved();
      }
      for (var si = 0; si < sliders.length; si++) on(listeners, sliders[si], 'input', inputHandler);

      function segHandler(e) {
        var btn = e.target.closest ? e.target.closest('button') : null;
        if (!btn) return;
        var name = e.currentTarget.getAttribute('data-seg'), val = btn.getAttribute('data-val');
        if (name === 'sign') s.sign = Number(val);
        else if (name === 'mode') { s.mode = val; prog = 0; }
        else if (name === 'scan') s.scan = val;
        setSeg(name, val); syncSaved();
      }
      var segs = qa('[data-seg]');
      for (var gi = 0; gi < segs.length; gi++) on(listeners, segs[gi], 'click', segHandler);

      var playBtn = q1('[data-act="play"]');
      function playHandler() {
        s.playing = !s.playing;
        playBtn.textContent = s.playing ? '⏸ 暂停' : '▶ 播放';
        syncSaved();
      }
      on(listeners, playBtn, 'click', playHandler);
      on(listeners, q1('[data-act="reset"]'), 'click', function () { prog = 0; });
      var ansBtn = q1('[data-act="ans"]');
      if (ansBtn) {
        on(listeners, ansBtn, 'click', function () {
          var box = q1('[data-ans]');
          box.hidden = !box.hidden;
          ansBtn.textContent = box.hidden ? '查看解析 ▾' : '收起解析 ▴';
        });
      }
      var opts = qa('[data-opt]');
      function optHandler(e) {
        for (var i = 0; i < opts.length; i++) opts[i].classList.remove('is-right');
        e.currentTarget.classList.add('is-right');
        q1('[data-optans]').hidden = false;
      }
      for (var oi = 0; oi < opts.length; oi++) on(listeners, opts[oi], 'click', optHandler);

      function updateReadouts(d, cur) {
        // 读数按模式切换：偏转模型无加速电压，加速模型无侧移/偏转角
        var accelMode = d.mode === 'accel';
        ['t', 'y', 'tan', 'w', 'v'].forEach(function (k) { setReadVisible(k, !accelMode); });
        ['U', 'vacc'].forEach(function (k) { setReadVisible(k, accelMode); });
        setRead('a', nf(d.a) + '');
        setRead('t', nf(d.tL * 1000));
        setRead('y', d.hit ? '撞板' : nf(d.yL * 1000));
        setRead('tan', nf(d.tan));
        setRead('v', nf(d.vOut));
        setRead('w', nf(d.W * 1000));
        setRead('U', nf(d.U / 1000));
        setRead('vacc', d.disc < 0 ? '—' : nf(d.vAcc));
        var st = q1('[data-status]');
        if (st) st.textContent = d.mode === 'accel'
          ? (d.disc < 0 ? '加速电压为负向：粒子减速并反向，无法穿出。' : 'U = E·d = ' + nf(d.U / 1000) + ' kV；qU = ΔEk 严格成立。')
          : (d.hit ? '侧移超过 d/2 = ' + (GAP / 2 * 1000).toFixed(0) + ' mm，粒子撞在极板上。' : '出口侧移 ' + nf(d.yL * 1000) + ' mm，屏上总偏移 ' + nf(d.yScreen * 1000) + ' mm。');

        if (idx === 1) {
          var b1 = q1('[data-rel="base"]'), b2 = q1('[data-rel="tan"]'), b3 = q1('[data-rel="screen"]');
          if (b1) b1.textContent = nf(d.yL * 1000) + ' mm';
          if (b2) b2.textContent = nf(d.tan);
          if (b3) b3.textContent = nf(d.yScreen * 1000) + ' mm';
          drawScan(chartView, s, d, s.scan);
        }
        if (idx === 2) {
          var yNow = cur ? cur.y : 0, vyNow = cur ? cur.vy : 0;
          var kx = 0.5 * d.m * d.v0 * d.v0 * 1000;
          var ky = 0.5 * d.m * vyNow * vyNow * 1000;
          var wk = d.q * d.E * yNow * 1000;
          var dek = 0.5 * d.m * (cur ? (cur.vx * cur.vx + cur.vy * cur.vy - d.v0 * d.v0) : 0) * 1000;
          var mx = Math.max(kx, ky, Math.abs(wk), Math.abs(dek), 1e-6);
          [['kx', kx], ['ky', ky], ['w', Math.abs(wk)], ['dek', Math.abs(dek)]].forEach(function (p) {
            var bar = q1('[data-bar="' + p[0] + '"]'), txt = q1('[data-barv="' + p[0] + '"]');
            if (bar) bar.style.width = (Math.min(100, p[1] / mx * 100)).toFixed(1) + '%';
            if (txt) txt.textContent = nf(p[1]) + ' mJ';
          });
        }
        if (idx === 3) {
          var set = function (k, v) { var e = q1('[data-a="' + k + '"]'); if (e) e.textContent = v; };
          set('t', d.tL.toFixed(3)); set('y', nf(d.yL * 1000));
          set('tan', nf(d.tan)); set('Y', nf(d.yScreen * 1000));
        }
      }

      function frame(ts) {
        if (dead) return;
        if (!last) last = ts;
        var dt = Math.min(0.05, (ts - last) / 1000);
        last = ts;
        if (s.playing) { prog += dt / 3.2; if (prog > 1) prog = 0; }
        var d = derive(s);
        var cur = drawScene(view, d, s, prog);
        updateReadouts(d, cur);
        drawDataChart(dataView, idx, d, s);
        raf = global.requestAnimationFrame(frame);
      }
      raf = global.requestAnimationFrame(frame);

      return function cleanup() {
        if (dead) return;
        dead = true;
        global.cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        for (var t in listeners) {
          if (!Object.prototype.hasOwnProperty.call(listeners, t)) continue;
          var arr = listeners[t];
          for (var i = 0; i < arr.length; i++) arr[i][0].removeEventListener(t, arr[i][1]);
        }
      };
    }
  };
})(window);
