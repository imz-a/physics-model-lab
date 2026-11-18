/* ============================================================
 * catalog.js — 模型目录数据（分类 → 模型 → 拓展模型）
 * 纯数据文件，挂到 window.ModelLab.catalog，供 app.js 消费。
 * 所有拓展名称目前均为占位，后续可逐项替换为真实内容。
 * ============================================================ */
(function (global) {
  'use strict';

  var NS = (global.ModelLab = global.ModelLab || {});

  function model(id, name, status, brief, extensions) {
    return {
      id: id,
      name: name,
      status: status, // 'done' = 样板已完工 | 'todo' = 待建设
      brief: brief,
      extensions: extensions
    };
  }

  NS.catalog = [
    {
      id: 'mechanics',
      name: '力学',
      color: 'pink',
      models: [
        model('spring-oscillator', '弹簧振子', 'done',
          '研究弹簧弹力与位移关系下的简谐运动规律。',
          ['基本模型', '周期与频率', '能量转化', '高考题型', '实验拓展']),
        model('pendulum', '单摆', 'done',
          '从小角度摆动出发，认识简谐运动与周期公式。',
          ['基本模型', '周期公式', '能量视角', '高考题型']),
        model('inclined-block', '斜面滑块', 'todo',
          '分析斜面上物块的受力、加速度与能量变化。',
          ['基本模型', '受力分析', '能量视角', '高考题型']),
        model('conveyor-belt', '传送带', 'todo',
          '讨论物块与传送带相对运动过程中的摩擦与能量。',
          ['基本模型', '相对运动', '能量损耗', '高考题型']),
        model('connected-bodies', '连接体', 'todo',
          '用整体法与隔离法处理多个物体的关联运动。',
          ['基本模型', '整体与隔离', '临界问题', '高考题型']),
        model('circular-motion', '圆周运动', 'todo',
          '围绕向心力、临界条件展开的典型圆周运动问题。',
          ['基本模型', '向心力分析', '临界问题', '高考题型']),
        model('projectile-motion', '平抛与类平抛', 'done',
          '用运动的合成与分解处理平抛及类平抛轨迹。',
          ['基本模型', '分解与合成', '类平抛拓展', '高考题型']),
        model('collision', '碰撞', 'todo',
          '结合动量守恒与能量关系分析各类碰撞过程。',
          ['基本模型', '动量守恒', '能量损失', '高考题型']),
        model('block-plate', '板块模型', 'todo',
          '研究板块间相对滑动的动力学与图像特征。',
          ['基本模型', '相对滑动', '图像分析', '高考题型'])
      ]
    },
    {
      id: 'electric-field',
      name: '电场',
      color: 'sky',
      models: [
        model('capacitor', '电容器', 'done',
          '从充放电过程理解电容、电压与电荷量的关系（样板页面已完工）。',
          ['核心概念', '动态模拟', '充放电实验', '拓展模型']),
        model('charged-particle-electric', '带电粒子在电场中的运动', 'done',
          '分析带电粒子在匀强电场中的加速与偏转。',
          ['基本模型', '偏转分析', '能量视角', '高考题型']),
        model('equipotential', '等势面与电场线', 'todo',
          '借助电场线与等势面直观判断场强与电势。',
          ['基本模型', '图像识别', '电势比较', '高考题型']),
        model('electrostatic-induction', '静电感应与静电平衡', 'todo',
          '讨论导体在电场中的电荷分布与静电屏蔽。',
          ['基本模型', '导体与电荷', '静电屏蔽', '高考题型'])
      ]
    },
    {
      id: 'magnetic-field',
      name: '磁场',
      color: 'lavender',
      models: [
        model('charged-particle-magnetic', '带电粒子在磁场中的圆周运动', 'done',
          '由洛伦兹力出发分析粒子在磁场中的轨迹与半径。',
          ['基本模型', '半径与周期', '边界问题', '高考题型']),
        model('velocity-selector', '速度选择器', 'todo',
          '利用电场力与洛伦兹力平衡筛选特定速度的粒子。',
          ['基本模型', '受力平衡', '应用拓展', '高考题型']),
        model('mass-spectrometer', '质谱仪', 'todo',
          '结合加速与偏转过程测定粒子的比荷。',
          ['基本模型', '比荷测定', '图像分析', '高考题型']),
        model('cyclotron', '回旋加速器', 'todo',
          '理解交变电场加速与磁场偏转的周期匹配。',
          ['基本模型', '加速原理', '周期匹配', '高考题型']),
        model('electromagnetic-flowmeter', '电磁流量计', 'todo',
          '从导电液体切割磁感线理解流量测量原理。',
          ['基本模型', '电势差分析', '应用拓展', '高考题型'])
      ]
    },
    {
      id: 'induction',
      name: '电磁感应',
      color: 'mint',
      models: [
        model('rod-cutting-field', '导体棒切割磁感线', 'done',
          '分析导体棒运动产生感应电动势与安培力的过程。',
          ['基本模型', '感应电动势', '安培力', '高考题型']),
        model('loop-entering-field', '线框进出磁场', 'todo',
          '研究线框穿越磁场边界时的电流与能量变化。',
          ['基本模型', '图像分析', '能量转化', '高考题型']),
        model('self-mutual-induction', '自感与互感', 'todo',
          '认识线圈中电流变化引起的自感与互感现象。',
          ['基本模型', '暂态过程', '能量视角', '高考题型']),
        model('lc-oscillation', 'LC 振荡电路', 'todo',
          '观察电场能与磁场能在 LC 回路中的周期性转化。',
          ['基本模型', '周期公式', '能量转化', '高考题型'])
      ]
    },
    {
      id: 'thermodynamics',
      name: '热学',
      color: 'peach',
      models: [
        model('ideal-gas', '理想气体状态变化', 'done',
          '结合状态方程与图像分析理想气体的变化过程。',
          ['基本模型', '图像分析', '微观解释', '高考题型'])
      ]
    },
    {
      id: 'optics',
      name: '光学',
      color: 'cream',
      models: [
        model('refraction-total-reflection', '光的折射与全反射', 'todo',
          '从折射定律出发理解临界角与全反射条件。',
          ['基本模型', '折射率', '全反射条件', '高考题型']),
        model('double-slit', '双缝干涉', 'done',
          '通过条纹间距认识光的波动性与干涉规律。',
          ['基本模型', '条纹间距', '实验拓展', '高考题型'])
      ]
    },
    {
      id: 'modern-physics',
      name: '近代物理',
      color: 'mauve',
      models: [
        model('photoelectric-effect', '光电效应', 'done',
          '用光子说解释逸出功、截止频率与遏止电压。',
          ['基本模型', '爱因斯坦方程', '图像分析', '高考题型']),
        model('nuclear-decay', '原子核衰变', 'todo',
          '掌握衰变规律、半衰期与核反应方程的书写。',
          ['基本模型', '半衰期', '核反应方程', '高考题型'])
      ]
    }
  ];

  /* 便捷索引：避免在渲染层反复遍历 */
  NS.models = [];
  NS.modelById = Object.create(null);
  NS.categoryById = Object.create(null);

  NS.catalog.forEach(function (cat) {
    NS.categoryById[cat.id] = cat;
    cat.models.forEach(function (m) {
      m.categoryId = cat.id;
      m.categoryName = cat.name;
      m.categoryColor = cat.color;
      NS.models.push(m);
      NS.modelById[m.id] = m;
    });
  });
})(window);
