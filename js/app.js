/* ============================================================
 * app.js — 渲染与切换逻辑（最后加载）
 * 依赖：catalog.js → window.ModelLab.catalog
 * 职责：侧栏分组渲染 / 模型切换 / 拓展子标签切换 / 分类折叠 /
 *       搜索过滤 / 窄屏抽屉 / 禁用复制拖拽 / hash 状态同步
 * ============================================================ */
(function (global) {
  'use strict';

  var NS = global.ModelLab;
  if (!NS || !NS.catalog) {
    throw new Error('[ModelLab] catalog.js 必须在 app.js 之前加载');
  }

  var doc = global.document;
  var catalog = NS.catalog;

  var state = {
    modelId: NS.models[0].id,
    extensionIndex: 0,
    query: '',
    collapsed: Object.create(null)
  };

  var els = {};
  var STATUS_TEXT = { done: '交互完备', todo: '待建设' };

  // 当前活动交互模块的清理函数；每次 renderPanel 重渲染前统一执行
  var currentCleanup = null;

  /* ---------------- 工具 ---------------- */
  function byId(id) { return doc.getElementById(id); }

  function currentModel() { return NS.modelById[state.modelId]; }

  // 模块契约：NS.modules[<modelId>].render 必须是函数
  function moduleOf(model) {
    var mod = NS.modules && NS.modules[model.id];
    return (mod && typeof mod.render === 'function') ? mod : null;
  }

  // 显示层覆盖：有有效交互模块即视为完工；否则沿用 catalog.js 的 status 数据
  function displayStatus(m) {
    return moduleOf(m) ? 'done' : m.status;
  }

  function statusTag(m) {
    var s = displayStatus(m);
    return '<span class="model-item__tag ' + (s === 'done' ? 'tag--done' : 'tag--todo') + '">'
      + STATUS_TEXT[s] + '</span>';
  }

  function validIndex(model, n) {
    n = Number(n);
    var max = model.extensions.length - 1;
    return (!isFinite(n) || n < 0 || n > max) ? 0 : (n | 0);
  }

  /* ---------------- hash：可分享 / 可回退 ---------------- */
  function parseHash() {
    var raw = (global.location.hash || '').replace(/^#\/?/, '');
    var parts = raw.split('/');
    if (!parts[0] || !NS.modelById[parts[0]]) return null;
    return {
      modelId: parts[0],
      extensionIndex: validIndex(NS.modelById[parts[0]], parts[1])
    };
  }

  function syncHash() {
    var target = '#/' + state.modelId + '/' + state.extensionIndex;
    if (global.location.hash !== target) global.location.hash = target;
  }

  global.addEventListener('hashchange', function () {
    var route = parseHash();
    if (!route) return;
    if (route.modelId === state.modelId && route.extensionIndex === state.extensionIndex) return;
    state.modelId = route.modelId;
    state.extensionIndex = route.extensionIndex;
    state.query = '';
    els.search.value = '';
    renderSidebar();
    renderHeader();
    renderTabs();
    renderPanel();
  });

  /* ---------------- 侧栏 ---------------- */
  function renderSidebar() {
    var q = state.query.trim().toLowerCase();
    var html = '';
    var total = 0;

    catalog.forEach(function (cat) {
      var matched = cat.models.filter(function (m) {
        return !q || (m.name + ' ' + m.categoryName + ' ' + m.brief).toLowerCase().indexOf(q) !== -1;
      });
      if (!matched.length) return;
      total += matched.length;

      // 搜索时强制展开，便于看到命中结果
      var expanded = q ? true : !state.collapsed[cat.id];
      html += '<section class="cat c-' + cat.color + '">'
        + '<button type="button" class="cat__head" data-cat="' + cat.id + '" aria-expanded="' + expanded + '">'
        + '<span class="cat__dot" aria-hidden="true"></span>'
        + '<span>' + cat.name + '</span>'
        + '<span class="cat__count">' + matched.length + '</span>'
        + '<span class="cat__chevron" aria-hidden="true">▼</span>'
        + '</button>'
        + '<div class="cat__list"' + (expanded ? '' : ' hidden') + '>';

      matched.forEach(function (m) {
        var active = m.id === state.modelId;
        html += '<button type="button" class="model-item' + (active ? ' is-active' : '') + '"'
          + ' data-model-id="' + m.id + '" title="' + m.name + '"'
          + (active ? ' aria-current="true"' : '') + '>'
          + '<span class="model-item__name">' + m.name + '</span>'
          + statusTag(m)
          + '</button>';
      });
      html += '</div></section>';
    });

    if (!total) {
      html = '<div class="empty">没有找到匹配的模型<br>换个关键词试试</div>';
    }

    els.modelList.innerHTML = html;
    els.modelCounter.textContent = q
      ? '找到 ' + total + ' 个模型'
      : NS.models.length + ' 个模型 · ' + catalog.length + ' 个分类';
    els.sidebarHint.textContent = q
      ? '搜索「' + state.query.trim() + '」的结果'
      : '点击分类标题可展开 / 收起';
  }

  // 模型切换时只同步高亮，不重建侧栏（保住键盘焦点与滚动位置）
  function syncSidebarActive() {
    var items = els.modelList.querySelectorAll('[data-model-id]');
    for (var i = 0; i < items.length; i++) {
      var active = items[i].getAttribute('data-model-id') === state.modelId;
      items[i].classList.toggle('is-active', active);
      if (active) items[i].setAttribute('aria-current', 'true');
      else items[i].removeAttribute('aria-current');
    }
  }

  /* ---------------- 主区 ---------------- */
  function renderHeader() {
    var m = currentModel();
    var cat = NS.categoryById[m.categoryId];
    els.mainInner.className = 'main__inner c-' + cat.color;

    els.modelHeader.innerHTML = '<div>'
      + '<div class="model-header__meta">'
      + '<span class="subject-tag">' + cat.name + '</span>'
      + statusTag(m)
      + '</div>'
      + '<h2 class="model-header__title" id="modelTitle">' + m.name + '</h2>'
      + '<p class="model-header__brief">' + m.brief + '</p>'
      + '</div>'
      + (moduleOf(m)
        ? '<span class="draft-chip is-live">交互可用</span>'
        : '<span class="draft-chip">框架草案 · 内容待填充</span>');
  }

  function renderTabs() {
    var m = currentModel();
    var html = '<span class="subtabs__label">拓展模型</span>';
    m.extensions.forEach(function (ext, i) {
      var active = i === state.extensionIndex;
      html += '<button type="button" class="tab' + (active ? ' is-active' : '') + '"'
        + ' role="tab" id="tab-' + i + '" data-ext-index="' + i + '"'
        + ' aria-selected="' + active + '" aria-controls="panel"'
        + ' tabindex="' + (active ? '0' : '-1') + '">' + ext + '</button>';
    });
    els.subTabs.innerHTML = html;
  }

  // 无交互模块时的降级视图（模块文件尚未产出 / 渲染抛错时使用）
  function renderPlaceholder(m) {
    var ext = m.extensions[state.extensionIndex];
    var slots = [
      { n: '01', t: '核心概念', d: '概念讲解 / 公式推导' },
      { n: '02', t: '交互模拟', d: '参数调节 / 动态演示' },
      { n: '03', t: '拓展应用', d: '题型归纳 / 实验迁移' }
    ];

    var slotHtml = slots.map(function (s) {
      return '<div class="slot">'
        + '<span class="slot__num">SLOT ' + s.n + '</span>'
        + '<h4>' + s.t + '</h4>'
        + '<p>' + s.d + '</p>'
        + '<div class="slot__lines" aria-hidden="true">'
        + '<span class="slot__line"></span><span class="slot__line"></span><span class="slot__line"></span>'
        + '</div></div>';
    }).join('');

    els.panel.innerHTML = '<div class="placeholder">'
      + '<span class="placeholder__badge">内容槽位 · 待填充</span>'
      + '<h3 class="placeholder__title">《' + m.name + ' · ' + ext + '》—— 模型内容待填充</h3>'
      + '<p class="placeholder__desc">这里将承载该拓展模型的完整教学内容。当前版本仅演示框架与交互（切换模型 / 切换拓展模型），物理计算、动画与题目将在后续版本逐项填充。</p>'
      + '<div class="slot-grid">' + slotHtml + '</div>'
      + '</div>';
  }

  /*
   * 统一的模块生命周期入口：切换模型 / 切换子标签 / hashchange 最终都会走到这里。
   * 先清理上一个模块（rAF、定时器、事件监听），再渲染新模块，避免叠加泄漏。
   */
  function renderPanel() {
    var m = currentModel();
    var mod = moduleOf(m);

    if (currentCleanup) {
      try { currentCleanup(); }
      catch (err) { console.warn('[ModelLab] 模块 cleanup 执行失败', err); }
      currentCleanup = null;
    }

    els.panel.setAttribute('aria-labelledby', 'tab-' + state.extensionIndex);

    if (mod) {
      els.panel.classList.add('is-live');
      try {
        var cleanup = mod.render(els.panel, state.extensionIndex);
        currentCleanup = typeof cleanup === 'function' ? cleanup : null;
        enhanceRanges(els.panel);
      } catch (err) {
        // 单个模块出错不应让页面白屏：清理现场后退回占位卡片
        currentCleanup = null;
        els.panel.classList.remove('is-live');
        renderPlaceholder(m);
        console.error('[ModelLab] 模块渲染失败：' + m.id, err);
      }
      try { postProcessFolds(); } catch (err) { console.warn('[ModelLab] 内容折叠后处理跳过', err); }
      return;
    }

    els.panel.classList.remove('is-live');
    renderPlaceholder(m);

    // 通用后处理对所有模块一视同仁；失败绝不阻断主流程
    try { postProcessFolds(); } catch (err) { console.warn('[ModelLab] 内容折叠后处理跳过', err); }
  }

  /* ============================================================
   * 触控增强：框架 JS 在渲染后注入一次全局 <style>。
   * 模块自带 <style> 位于 #panel 内，按其原样加载；这里用 #panel 前缀
   * 提升特异性，确保按钮/滑块的触控热区覆盖模块原样式。
   * 选择器只命中 button / [role=button] / 常见按钮属性 / range，
   * 不含 canvas、svg，故不会误伤画布元素。
   * ============================================================ */
  var TOUCH_STYLE = `<style id="ml-touch-enhance">
#panel button,
#panel [role="button"],
#panel summary,
#panel [data-act],
#panel [data-btn],
#panel [data-opt],
#panel [data-seg],
#panel [data-q],
#panel [data-qo],
#panel [data-qs],
#panel [data-qt],
#panel [data-qp],
#panel [data-o],
#panel [class*="btn"],
#panel [class*="opt"],
#panel [class*="seg"] {
  min-height: 44px;
  min-width: 44px;
  padding: 8px 14px;
  touch-action: manipulation;
}
#panel button:active,
#panel [role="button"]:active,
#panel [class*="btn"]:active,
#panel [class*="opt"]:active,
#panel [data-act]:active { transform: translateY(1px); }
/* --- 统一拖动条：白底马卡龙风格，填充度由 --fill（JS 写入）驱动 --- */
#panel input[type="range"] {
  -webkit-appearance: none !important;
  appearance: none !important;
  height: 30px !important;
  background: transparent !important;
  cursor: pointer;
  touch-action: manipulation;
  --ml-accent: #7FB3D5;
  --ml-track: #E8EDF5;
}
#panel input[type="range"]::-webkit-slider-runnable-track {
  -webkit-appearance: none !important;
  appearance: none !important;
  height: 8px !important;
  border: 0 !important;
  border-radius: 999px !important;
  background: linear-gradient(to right, var(--ml-accent) 0%, var(--ml-accent) var(--fill, 50%), var(--ml-track) var(--fill, 50%), var(--ml-track) 100%) !important;
  box-shadow: inset 0 1px 2px rgba(88,108,132,.06);
}
#panel input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  appearance: none !important;
  box-sizing: border-box !important;
  width: 18px !important;
  height: 18px !important;
  margin-top: -5px !important;
  border: 2px solid #fff !important;
  border-radius: 50% !important;
  background: var(--ml-accent) !important;
  box-shadow: 0 2px 6px rgba(88,108,132,.28) !important;
  cursor: grab !important;
}
#panel input[type="range"]:active::-webkit-slider-thumb {
  cursor: grabbing !important;
  transform: scale(1.1) !important;
}
#panel input[type="range"]::-moz-range-track {
  height: 8px !important;
  border: 0 !important;
  border-radius: 999px !important;
  background: linear-gradient(to right, var(--ml-accent) 0%, var(--ml-accent) var(--fill, 50%), var(--ml-track) var(--fill, 50%), var(--ml-track) 100%) !important;
}
#panel input[type="range"]::-moz-range-thumb {
  box-sizing: border-box !important;
  width: 18px !important;
  height: 18px !important;
  border: 2px solid #fff !important;
  border-radius: 50% !important;
  background: var(--ml-accent) !important;
  box-shadow: 0 2px 6px rgba(88,108,132,.28) !important;
  cursor: grab !important;
}
</style>`;

  function ensureTouchStyle() {
    if (doc.getElementById('ml-touch-enhance')) return;
    var box = doc.createElement('div');
    box.innerHTML = TOUCH_STYLE;
    if (box.firstChild) (doc.head || doc.documentElement).appendChild(box.firstChild);
  }

  /* ============================================================
   * 拖动条填充反馈：为每个 range 写入 --fill 百分比，驱动轨道渐变。
   * 监听直接绑在 range 元素上，元素随模块 innerHTML 重建自然回收，
   * 无需在 cleanup 中解绑，也绝不把监听挂到 window/document。
   * ============================================================ */
  function enhanceRanges(panel) {
    var ranges = panel.querySelectorAll('input[type="range"]');
    for (var i = 0; i < ranges.length; i++) {
      (function (el) {
        function update() {
          var min = parseFloat(el.min), max = parseFloat(el.max), val = parseFloat(el.value);
          if (!isFinite(min) || !isFinite(max) || max <= min) return;
          var pct = (val - min) / (max - min) * 100;
          if (pct < 0) pct = 0; else if (pct > 100) pct = 100;
          el.style.setProperty('--fill', pct + '%');
        }
        update();
        el.addEventListener('input', update);
      })(ranges[i]);
    }
  }

  /* ============================================================
   * 内容折叠：通用、宽松、保守的框架层后处理。
   * 原则：
   *  1) 只对 #panel 内“卡片级”块包裹原生 <details>，不重建 innerHTML、不把
   *     元素移出 #panel —— 模块 render 时绑定的事件与持有的 DOM 引用全部保留。
   *  2) 含 canvas / svg / range / [data-cv] / [data-slider] / [data-read] 的块
   *     一律不折叠：主画布、控制滑块、核心读数始终在首屏。
   *  3) 仅折叠命中考题 / 解析 / 实验 / 公式信号的块，宁可少折叠也不错折叠。
   * ============================================================ */
  var PRIMARY_SEL = 'canvas, svg, input[type="range"], [data-cv], [data-slider], [data-read]';
  var TITLE_SEL = 'h3, h4, h5, [class*="__t"], [class*="__title"], [class*="-hd"], [class*="-head"], [class*="-title"]';
  var BLOCK_SEL = 'div[class], section[class], article[class]';
  var RE_BLOCKISH = /(card|box|acc|exam|quiz|extra|detail|section|blk|block|tile|opts|note|formula|table|题)/i;
  var RE_QUIZ = /(题型|随堂|题目|选择|判断|作答|选项|解析|辨析|第\s*\d+\s*题)/;
  var RE_EXP = /(拓展|实验|数据|表格|分析|推导|说明|结论|视角|规律|核心|提示)/;

  function textOf(el) {
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  // 取块自身的标题：直接子标题优先；标题若包在 header 行内则取该行文本
  function titleOf(block) {
    var kids = block.children;
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (c.matches && c.matches(TITLE_SEL)) return textOf(c);
      if (c.querySelector && c.querySelectorAll(TITLE_SEL).length <= 2) {
        var t = c.querySelector(TITLE_SEL);
        if (t) return textOf(c);
      }
    }
    return '';
  }

  function depthOf(el) {
    var d = 0, p = el;
    while (p && p !== els.panel) { d++; p = p.parentElement; }
    return d;
  }

  // 核心读数卡硬保护：标题 / 类名 / 内部读数节点命中即永不折叠
  function isReadoutBlock(block, title) {
    if (/(读数|实时|measure|meter|\bread\b)/i.test(title || '')) return true;
    if (/(read|readout|meter|meas|实时)/i.test(block.className || '')) return true;
    if (block.querySelector('[data-read],[class*="read"],[class*="meter"],[class*="meas"]')) return true;
    return false;
  }

  // 折叠后可见文本长度：innerText 天然排除 <details> 收起时的内容
  function visibleTextLen() {
    return (els.panel.innerText || '').replace(/\s+/g, '').length;
  }

  // 返回折叠标签；空字符串表示不折叠
  function classifyBlock(block, title) {
    var cls = block.className || '';
    if (isReadoutBlock(block, title)) return ''; // 双重保险：核心读数绝不进入任何折叠分支
    var hasQuiz = block.querySelector('[data-q],[data-qex],[data-qfb],[data-qexp],[data-qp],[data-qs],[data-qt],[data-qo],[data-fb],[data-ans],[data-opt],[data-o]');
    var hasTable = !!block.querySelector('table');
    var hasExp = block.querySelector('[data-exp],[data-expbody],[data-expres],[data-a]');
    // 收窄 formula：不能因为卡内嵌一个公式条就折掉整张核心卡；
    // 必须标题 / 类名本身是公式或推导主题，且无读数节点。
    var hasFormula = !!block.querySelector('[class*="formula"],[class*="derive"]')
      && (/(公式|推导|演算)/.test(title || '') || /(formula|derive)/i.test(cls));
    var hasRich = block.querySelector('[class*="note"],[class*="exp"],[class*="table"],[class*="ans"],[class*="sol"],[class*="parse"],[class*="tip"]');
    if (hasQuiz || RE_QUIZ.test(title) || /(quiz|exam|opt|ans|题)/i.test(cls)) return '题目与解析';
    if (hasTable || hasExp) return '实验与数据';
    if (hasFormula) return '公式与推导';
    if (hasRich || RE_EXP.test(title) || /(exp|table|formula|note)/i.test(cls)) return '讲解与拓展';
    return '';
  }

  function updateFoldAllBtn() {
    if (!els.panelToolbar || !els.foldAllBtn) return;
    var folds = els.panel.querySelectorAll('details.ml-fold');
    var n = folds.length;
    if (!n) { els.panelToolbar.hidden = true; return; }
    els.panelToolbar.hidden = false;
    var anyClosed = false;
    for (var i = 0; i < n; i++) {
      if (!folds[i].open) { anyClosed = true; break; }
    }
    els.foldAllBtn.textContent = anyClosed ? '全部展开' : '全部收起';
    if (els.foldHint) els.foldHint.textContent = '已折叠 ' + n + ' 处次要内容 · 点标题展开';
  }

  function wrapFold(block, label, title) {
    var details = doc.createElement('details');
    details.className = 'ml-fold';

    var summary = doc.createElement('summary');
    summary.className = 'ml-fold__summary';
    var mark = doc.createElement('span');
    mark.className = 'ml-fold__mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '▸';
    var lab = doc.createElement('span');
    lab.className = 'ml-fold__label';
    lab.textContent = label;
    var ttl = doc.createElement('span');
    ttl.className = 'ml-fold__title';
    ttl.textContent = title || '点击展开查看';
    summary.appendChild(mark);
    summary.appendChild(lab);
    summary.appendChild(ttl);

    var body = doc.createElement('div');
    body.className = 'ml-fold__body';
    details.appendChild(summary);
    details.appendChild(body);

    block.parentNode.insertBefore(details, block);
    body.appendChild(block); // 原地包裹，元素仍是 #panel 后代，事件与引用保留

    details.addEventListener('toggle', function () {
      // 兜底：展开后通知模块重绘（模块普遍监听 resize 重算画布尺寸）
      if (details.open) global.dispatchEvent(new Event('resize'));
      updateFoldAllBtn();
    });
    return details;
  }

  function postProcessFolds() {
    var panel = els.panel;
    var blocks = panel.querySelectorAll(BLOCK_SEL);
    // 纯概念页（无画布 / 滑块 / 按钮）：一屏可读，折叠只会藏起核心讲解，
    // 仅允许折叠标题明确是题目 / 高考 / 题型 / 实验拓展的块。
    var interactive = !!panel.querySelector('canvas, input[type="range"], button, [role="button"]');
    var baseline = visibleTextLen();
    var list = [];

    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (!b.parentNode) continue;
      if (b.closest && b.closest('.ml-fold')) continue; // 已在折叠内部
      if (b.querySelector('.ml-fold')) continue;        // 内部已有折叠，跳过外层
      if (b.querySelector(PRIMARY_SEL)) continue;       // 核心画布/滑块/读数，绝不折叠

      var title = titleOf(b);
      if (isReadoutBlock(b, title)) continue;           // 核心读数卡，绝不折叠
      var label = classifyBlock(b, title);
      if (!label || textOf(b).length < 24) continue;
      if (!interactive && !/(题目|高考|题型|随堂|实验拓展|实验)/.test(title + ' ' + label)) continue;
      list.push({ el: b, depth: depthOf(b), label: label, title: title });
    }

    // 先折深层块，避免父块把已折叠的子块重复包裹
    list.sort(function (a, b) { return b.depth - a.depth; });
    for (var j = 0; j < list.length; j++) {
      var it = list[j];
      if (!it.el.parentNode || it.el.querySelector('.ml-fold') || it.el.querySelector(PRIMARY_SEL)) continue;
      if (baseline < 120) break; // 基线可见文本已不足 120 字，一律不折

      var details = wrapFold(it.el, it.label, it.title);
      // 通用硬护栏：折叠后可见文本不得低于 120 字，否则原样还原
      if (visibleTextLen() < 120) {
        var host = details.parentNode;
        if (host) {
          host.insertBefore(it.el, details);
          host.removeChild(details);
        }
      }
    }
    updateFoldAllBtn();
  }

  /* ---------------- 动作 ---------------- */
  function selectModel(id) {
    if (!NS.modelById[id]) return;
    var changed = id !== state.modelId;
    state.modelId = id;
    state.extensionIndex = 0; // 换模型回到第一个拓展
    syncSidebarActive();
    renderHeader();
    renderTabs();
    renderPanel();
    if (changed) syncHash();
    closeDrawer();
  }

  function selectExtension(index) {
    var m = currentModel();
    var next = validIndex(m, index);
    if (next === state.extensionIndex) return;
    state.extensionIndex = next;
    renderTabs();
    renderPanel();
    syncHash();
  }

  function toggleCategory(catId, keepFocus) {
    state.collapsed[catId] = !state.collapsed[catId];
    renderSidebar();
    if (keepFocus) {
      var head = els.modelList.querySelector('[data-cat="' + catId + '"]');
      if (head) head.focus();
    }
  }

  /* ---------------- 抽屉 ---------------- */
  function openDrawer() {
    els.sidebar.classList.add('is-open');
    els.overlay.classList.add('is-visible');
    els.menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    els.sidebar.classList.remove('is-open');
    els.overlay.classList.remove('is-visible');
    els.menuToggle.setAttribute('aria-expanded', 'false');
  }

  /* ---------------- 事件绑定 ---------------- */
  function bindEvents() {
    els.modelList.addEventListener('click', function (e) {
      if (!(e.target instanceof Element)) return;
      var head = e.target.closest('.cat__head');
      if (head) {
        toggleCategory(head.getAttribute('data-cat'), true);
        return;
      }
      var item = e.target.closest('.model-item');
      if (item) selectModel(item.getAttribute('data-model-id'));
    });

    els.subTabs.addEventListener('click', function (e) {
      if (!(e.target instanceof Element)) return;
      var tab = e.target.closest('.tab');
      if (tab) selectExtension(tab.getAttribute('data-ext-index'));
    });

    // 子标签键盘走查：← → / Home / End
    els.subTabs.addEventListener('keydown', function (e) {
      var keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (keys.indexOf(e.key) === -1) return;
      var tabs = els.subTabs.querySelectorAll('.tab');
      var i = Array.prototype.indexOf.call(tabs, doc.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var next = e.key === 'Home' ? 0
        : e.key === 'End' ? tabs.length - 1
          : e.key === 'ArrowRight' ? (i + 1) % tabs.length
            : (i - 1 + tabs.length) % tabs.length;
      selectExtension(next);
      var refreshed = els.subTabs.querySelectorAll('.tab');
      if (refreshed[next]) refreshed[next].focus();
    });

    els.search.addEventListener('input', function () {
      state.query = els.search.value;
      renderSidebar();
    });

    els.menuToggle.addEventListener('click', function () {
      if (els.sidebar.classList.contains('is-open')) closeDrawer();
      else openDrawer();
    });
    els.overlay.addEventListener('click', closeDrawer);

    // 折叠工具条：一键展开 / 收起全部折叠块
    if (els.foldAllBtn) els.foldAllBtn.addEventListener('click', function () {
      var folds = els.panel.querySelectorAll('details.ml-fold');
      if (!folds.length) return;
      var anyClosed = false;
      for (var i = 0; i < folds.length; i++) {
        if (!folds[i].open) { anyClosed = true; break; }
      }
      for (var k = 0; k < folds.length; k++) folds[k].open = anyClosed;
      updateFoldAllBtn();
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
    global.addEventListener('resize', function () {
      if (global.innerWidth > 900) closeDrawer();
    });

    // 禁用复制 / 剪切 / 拖动，避免后续交互模型时被浏览器默认行为打断
    ['copy', 'cut', 'dragstart'].forEach(function (type) {
      doc.addEventListener(type, function (e) { e.preventDefault(); }, true);
    });
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    els = {
      menuToggle: byId('menuToggle'),
      search: byId('modelSearch'),
      modelCounter: byId('modelCounter'),
      sidebar: byId('sidebar'),
      sidebarHint: byId('sidebarHint'),
      modelList: byId('modelList'),
      mainInner: byId('mainInner'),
      modelHeader: byId('modelHeader'),
      subTabs: byId('subTabs'),
      panelToolbar: byId('panelToolbar'),
      foldHint: byId('foldHint'),
      foldAllBtn: byId('foldAllBtn'),
      panel: byId('panel'),
      overlay: byId('drawerOverlay')
    };

    ensureTouchStyle();

    var route = parseHash();
    if (route) {
      state.modelId = route.modelId;
      state.extensionIndex = route.extensionIndex;
    }

    renderSidebar();
    renderHeader();
    renderTabs();
    renderPanel();
    bindEvents();
    syncHash();

    // 暴露给控制台 / 后续接入使用
    NS.api = {
      getState: function () {
        return {
          modelId: state.modelId,
          modelName: currentModel().name,
          extensionIndex: state.extensionIndex,
          extensionName: currentModel().extensions[state.extensionIndex],
          query: state.query
        };
      },
      selectModel: selectModel,
      selectExtension: selectExtension,
      models: NS.models
    };
    doc.documentElement.setAttribute('data-model-lab-ready', 'true');
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
