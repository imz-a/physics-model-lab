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
      } catch (err) {
        // 单个模块出错不应让页面白屏：清理现场后退回占位卡片
        currentCleanup = null;
        els.panel.classList.remove('is-live');
        renderPlaceholder(m);
        console.error('[ModelLab] 模块渲染失败：' + m.id, err);
      }
      return;
    }

    els.panel.classList.remove('is-live');
    renderPlaceholder(m);
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
      panel: byId('panel'),
      overlay: byId('drawerOverlay')
    };

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
