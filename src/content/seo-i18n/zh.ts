export const zhSeoUi = {
  categoryFeature: '功能',
  categoryComparison: '产品对比',
  categoryChart: '图表制作',
  categoryTemplate: '仪表板模板',
  categoryUsecase: '使用场景',
  seeItInAction: '查看演示',
  tryWithYourOwnFile: '用您自己的文件试试',
  tryItDesc: '无需注册，文件不会上传到服务器。打开 ExcelInsight，将您的 Excel 或 CSV 文件拖入，几秒钟内即可生成仪表板。',
  frequentlyAskedQuestions: '常见问题',
  relatedTools: '相关工具',
  uploadSpreadsheetFree: '上传您的电子表格 — 免费',
  feature: '功能',
  comparisons: '产品对比',
};

export const zh: Record<string, {
  h1: string;
  intro: string;
  primaryCta?: string;
  sections: { heading: string; body: string; bullets?: string[] }[];
  faqs: { q: string; a: string }[];
}> = {
  'excel-dashboard-maker': {
    h1: '免费在线 Excel 仪表板制作工具',
    intro: 'ExcelInsight 是一款免费的 Excel 仪表板制作工具，能在几秒钟内将任意电子表格转换为实时交互式仪表板。上传 .xlsx 或 .csv 文件，选择所需图表并在拖放式网格中自由排列——无需公式、无需数据透视表、无需注册。',
    primaryCta: '上传您的电子表格 — 免费',
    sections: [
      {
        heading: '从任意 Excel 或 CSV 文件生成仪表板',
        body: 'ExcelInsight 会自动分析每一列，识别数值列、分类列、日期列和 ID 列，并推荐最有意义的图表，让您直接从一个可用的仪表板起步，而不是面对空白画布。',
        bullets: [
          '自动生成包含 3–4 个最实用图表的仪表板',
          '拖放式布局网格',
          '内联列统计与数据质量磁贴',
          '一键复制、调整大小和删除图表',
        ],
      },
      {
        heading: '为什么团队选择 ExcelInsight 而非 Excel 内置仪表板',
        body: 'Excel 原生仪表板需要数据透视表、切片器和大量鼠标操作。ExcelInsight 在单个网页中以纯客户端方式提供同等功能，即使在受限制的企业笔记本上也能使用。',
        bullets: [
          '无需安装、无需许可证、无需管理员权限',
          '支持 Windows、macOS、Linux、iPad 和 Chromebook',
          '文件始终留在您的设备上',
          '可将仪表板导出为多页 PDF',
        ],
      },
    ],
    faqs: [
      { q: '加载后可以编辑仪表板吗？', a: '可以，每个磁贴都支持调整大小、复制、删除或内联更改图表类型。' },
      { q: 'Excel 文件最大支持多大？', a: '在现代笔记本上，约 10 万行数据可流畅运行。' },
      { q: 'ExcelInsight 是免费的吗？', a: '是的，完全免费，无需注册，无需订阅。' },
      { q: '我的数据是否安全？', a: '是的，文件在您的浏览器中处理，不会上传到任何服务器。' },
      { q: '可以导出仪表板吗？', a: '可以，使用"导出 PDF"生成多页报告，或单独导出每个图表为 PNG。' },
    ],
  },

  'csv-visualization-tool': {
    h1: '免费在线 CSV 可视化工具',
    intro: 'ExcelInsight 是一款免费的 CSV 可视化工具，能在几秒钟内将逗号分隔文件转换为丰富的交互式仪表板。将来自数据库、CRM 或后端系统的 .csv 文件拖入，ExcelInsight 将自动分析每列、推荐图表并帮助您构建自定义仪表板。',
    sections: [
      {
        heading: '在浏览器中打开并绘制任意 CSV',
        body: 'ExcelInsight 支持标准格式、带引号和不规则的 CSV 文件。数值列生成直方图，分类列生成分类分布图，日期列自动转为时间序列图。',
        bullets: [
          '支持 .csv、.xlsx、.xls 格式',
          '自动数据类型检测',
          '智能洞察自动标记数据质量问题',
          '跨所有图表实时筛选数据行',
        ],
      },
      {
        heading: '专为工程师、分析师和运营人员设计',
        body: '无需 Python、pandas 或 Jupyter，ExcelInsight 让您无需安装任何软件即可完成 30 分钟的探索性数据分析。',
      },
    ],
    faqs: [
      { q: '支持带引号的逗号和特殊字符吗？', a: '支持，包括 RFC-4180 引号字段、BOM 头和混合换行符。' },
      { q: 'ExcelInsight 是免费的吗？', a: '是的。' },
      { q: '我的数据是否安全？', a: '是的。' },
      { q: '可以不上传到服务器就进行可视化吗？', a: '可以，所有处理均在客户端完成。' },
    ],
  },

  'excel-chart-generator': {
    h1: '在线 Excel 图表生成器',
    intro: 'ExcelInsight 是一款免费的 Excel 图表生成器。上传 .xlsx、.xls 或 .csv 文件，立即获得柱状图、折线图、饼图、散点图、面积图、雷达图和水平条形图。每种图表均可编辑、可设置主题，并可导出为 PNG。',
    sections: [
      {
        heading: '开箱即用的七种图表类型',
        body: '覆盖 90% 的实际报告需求，一键切换任意图表类型。',
        bullets: [
          '柱状图与水平条形图',
          '折线图与面积图',
          '饼图',
          '散点图',
          '雷达图',
        ],
      },
      {
        heading: '可设置主题、可导出、可嵌入',
        body: '内置配色主题、悬停提示、PNG 导出，或将图表添加到仪表板后导出为 PDF。',
      },
    ],
    faqs: [
      { q: '可以自定义图表颜色吗？', a: '可以，主题选择器提供精选调色板。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
      { q: '可以从指定列构建图表吗？', a: '可以，"构建"选项卡提供手动图表构建器。' },
    ],
  },

  'excel-report-builder': {
    h1: '在线 Excel 报告构建器',
    intro: 'ExcelInsight 是一款免费的 Excel 报告构建器。上传电子表格，排列图表和洞察内容，然后导出为精美的多页 PDF——包含封面页、元数据及每节一个图表。',
    sections: [
      {
        heading: '三步完成从电子表格到报告',
        body: '替代将图表粘贴到 Word 或 Google Docs 的繁琐流程。点击"导出 PDF"即可生成品牌化文档。',
        bullets: [
          '自动生成封面页',
          '每页一个图表',
          '包含洞察磁贴',
          '支持离线使用',
        ],
      },
      {
        heading: '专为周期性报告设计',
        body: '适用于每周销售复盘、月度 KPI 回顾和季度董事会报告包。',
      },
    ],
    faqs: [
      { q: 'PDF 包含哪些内容？', a: '封面页加上每个仪表板项目的高分辨率单独页面。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
      { q: '可以添加自己的 Logo 吗？', a: '该功能正在开发中，即将上线。' },
    ],
  },

  'excel-to-pdf-dashboard': {
    h1: 'Excel 转 PDF 仪表板转换器',
    intro: 'ExcelInsight 可将 Excel 和 CSV 文件转换为简洁可导出的 PDF 仪表板。上传文件，让 ExcelInsight 自动选取图表，然后导出为 PDF，通过邮件或 Slack 轻松分享。',
    sections: [
      {
        heading: '真正的仪表板，而非图表堆砌',
        body: '构建包含 KPI 磁贴、智能洞察和主题图表的完整仪表板，然后导出为 PDF。',
      },
      {
        heading: '设计上的隐私保障',
        body: '文件不会上传到服务器，PDF 在浏览器中使用 jsPDF 生成。',
      },
    ],
    faqs: [
      { q: 'PDF 是如何生成的？', a: '通过 Canvas 渲染，然后在浏览器中由 jsPDF 组装，无需服务器往返。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'excelinsight-vs-tableau': {
    h1: 'ExcelInsight 与 Tableau：适用于不同工作流程',
    intro: '两者都能帮助用户处理数据，但面向截然不同的工作场景。ExcelInsight 专注于在浏览器中快速分析电子表格；Tableau 则面向需要实时数据库连接的企业级 BI。',
    sections: [
      {
        heading: 'ExcelInsight 的适用场景',
        body: '从单个文件生成仪表板并导出为 PDF，无需安装任何服务器软件。',
        bullets: [
          '零安装、零许可证费用',
          '100% 客户端运行',
          '一键导出 PDF',
        ],
      },
      {
        heading: 'Tableau 的优势场景',
        body: '适用于需要实时数据库连接、受治理的企业仪表板和行级安全控制的场景。',
      },
    ],
    faqs: [
      { q: 'ExcelInsight 和 Tableau 类似吗？', a: '两者都能创建仪表板，但面向不同的工作流程。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'excelinsight-vs-powerbi': {
    h1: 'ExcelInsight 与 Power BI：电子表格工作流程对比',
    intro: '两者都能创建仪表板，但面向不同的工作场景。ExcelInsight 适合在浏览器中快速分析单个文件；Power BI 则面向需要实时数据库集成的企业报告。',
    sections: [
      {
        heading: 'ExcelInsight 的适用场景',
        body: '当您今天就需要一个仪表板，且不想安装软件或注册账号——在任何操作系统的任何浏览器中即可运行。',
      },
      {
        heading: 'Power BI 的优势场景',
        body: '适用于基于企业数据仓库的受治理报告、DAX 度量值计算和计划刷新。',
      },
    ],
    faqs: [
      { q: '该选 ExcelInsight 还是 Power BI？', a: '快速临时仪表板 → ExcelInsight；受治理的企业报告 → Power BI。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'tableau-alternative': {
    h1: '适合电子表格工作流程的免费 Excel 仪表板工具',
    intro: 'Tableau 学习曲线陡峭，且需要持续的许可证费用。对于需要快速将 Excel 或 CSV 转换为整洁仪表板的用户，ExcelInsight 是一个轻量级的免费替代方案——无需安装、无需注册、不上传文件到服务器。',
    sections: [
      {
        heading: '面向不同工作流程的设计',
        body: 'ExcelInsight 专为日常电子表格用户设计——图表、KPI 磁贴、拖放式布局、一键生成 PDF。',
      },
      {
        heading: '最适合的用户群体',
        body: '适用于日常与电子表格打交道的分析师、创业者、学生、顾问和运营团队。',
      },
    ],
    faqs: [
      { q: '真的完全免费，还是免费增值模式？', a: '完全免费，无付费层级，无注册门槛。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'best-excel-dashboard-tool': {
    h1: '2026 年最佳 Excel 仪表板工具',
    intro: '市面上有数十款 Excel 仪表板工具——从 Excel 原生数据透视图，到 Tableau、Power BI、Looker Studio、Datawrapper 和 Flourish 等。以下是一份基于实际使用场景的客观评测指南。',
    sections: [
      {
        heading: '精选工具列表：按使用场景选择，而非品牌',
        body: '',
        bullets: [
          'ExcelInsight — 从单个文件快速生成私密仪表板',
          'Power BI — 受治理的企业报告',
          'Tableau — 深度探索性 BI 分析',
          'Looker Studio — 基于 Google 数据的免费仪表板',
          'Datawrapper — 设计精美的图表',
        ],
      },
      {
        heading: '何时选择 ExcelInsight',
        body: '当您的数据在电子表格中、今天就需要仪表板、不想安装软件或将文件发送到服务器时。',
      },
    ],
    faqs: [
      { q: '哪款工具最易上手？', a: '处理单个 Excel 文件时，ExcelInsight 最为简便。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'bar-chart-maker': {
    h1: '免费在线柱状图制作工具',
    intro: 'ExcelInsight 是一款免费的柱状图制作工具。上传 Excel 或 CSV 文件，自动生成垂直或水平柱状图——支持主题设置、悬停提示，并可导出为 PNG。',
    sections: [
      {
        heading: '柱状图的适用场景',
        body: '用于比较各类别的数值——按地区划分的销售额、按来源划分的注册量、按团队划分的缺陷数。',
      },
      {
        heading: 'ExcelInsight 如何生成柱状图',
        body: '自动识别分类列并与数值列配对。',
        bullets: [
          '垂直与水平柱状图',
          '多系列分组图',
          '可自定义调色板',
          'PNG 与 PDF 导出',
        ],
      },
    ],
    faqs: [
      { q: '支持堆叠柱状图吗？', a: '目前支持分组图，堆叠图正在开发路线图中。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'line-chart-maker': {
    h1: '免费在线折线图制作工具',
    intro: 'ExcelInsight 是一款专为时间序列和趋势分析设计的免费折线图制作工具。上传包含日期列和数值列的文件，即可生成平滑的多系列折线图。',
    sections: [
      {
        heading: '专为时间序列数据构建',
        body: '自动识别日期列，绘制随时间变化的营收、DAU、错误率等趋势图。',
      },
      {
        heading: '对比多个数据系列',
        body: '支持按地区划分的月度营收、按渠道划分的每日注册量等多系列对比。',
      },
    ],
    faqs: [
      { q: '支持哪些日期格式？', a: '支持 ISO 8601、Excel 序列号、MM/DD/YYYY 和 DD/MM/YYYY 格式。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'pie-chart-maker': {
    h1: '免费在线饼图制作工具',
    intro: 'ExcelInsight 是一款免费的饼图制作工具。将任意分类列转换为带主题、带标签的饼图，一目了然地展示各部分占比。',
    sections: [
      {
        heading: '饼图的适用场景',
        body: '适用于五个以内的分类，用于直观呈现各部分占整体的份额。',
      },
      {
        heading: '智能默认设置',
        body: '按大小自动排序，自动应用高对比度调色板，自动显示百分比标签。',
      },
    ],
    faqs: [
      { q: '可以切换为环形图吗？', a: '饼图变体正在开发路线图中；目前可一键切换为柱状图、折线图或面积图。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'scatter-plot-generator': {
    h1: '免费在线散点图生成器',
    intro: 'ExcelInsight 是一款免费的散点图生成器。选择任意两个数值列，即可生成散点图，无需 Python 或 R，轻松发现相关性、离群值和数据聚类。',
    sections: [
      {
        heading: '秒级发现数据相关性',
        body: '可流畅展示数千个数据点，悬停提示精确显示每个点的 X/Y 值。',
      },
      {
        heading: '快速定位离群值和聚类',
        body: '离群值在散点图中一目了然，可作为异常调查的第一步。',
      },
    ],
    faqs: [
      { q: '支持多少数据点？', a: '数千个数据点可流畅显示，超过约 1 万点时性能取决于设备配置。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'area-chart-maker': {
    h1: '免费在线面积图制作工具',
    intro: 'ExcelInsight 是一款免费的面积图制作工具。结合日期列和数值列，绘制填充的多系列面积图，直观呈现趋势幅度。',
    sections: [
      {
        heading: '面积图 vs 折线图',
        body: '当曲线下方的面积具有实际意义时使用面积图——例如累计营收、累积注册量、总下载量。',
      },
      {
        heading: '一键切换图表类型',
        body: '先以折线图构建，再切换为面积图——无需重新上传文件。',
      },
    ],
    faqs: [
      { q: '可以堆叠多个数据系列吗？', a: '目前支持半透明叠加显示，真正的堆叠面积图正在开发路线图中。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'sales-dashboard-template': {
    h1: '免费销售仪表板模板',
    intro: '上传销售电子表格后，ExcelInsight 立即为您生成可用的销售仪表板——按阶段划分的销售漏斗、随时间变化的营收、重点客户、销售代表业绩和成交数量。',
    sections: [
      {
        heading: '仪表板包含的内容',
        body: '自动识别 Stage、Amount、Owner、Account、Close Date、ARR 等列。',
        bullets: [
          '随时间变化的营收/ARR 趋势',
          '按阶段划分的销售漏斗',
          '重点客户与负责人分析',
          '赢单率与成交数量',
        ],
      },
      {
        heading: '使用方法',
        body: '从 Salesforce、HubSpot、Pipedrive 或 Close 导出 CSV，拖入文件，调整布局，导出 PDF，发送给销售负责人。',
      },
    ],
    faqs: [
      { q: '需要预先格式化销售数据吗？', a: '不需要，直接读取 CRM 原始导出数据。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'inventory-dashboard-template': {
    h1: '免费库存仪表板模板',
    intro: 'ExcelInsight 可将任意库存电子表格转换为库存仪表板。上传 SKU 列表，即可获得现有库存视图、热销 SKU、低库存预警和类别分布图。',
    sections: [
      {
        heading: '自动生成的内容',
        body: '自动识别 SKU、Product、Quantity、Reorder Point、Category、Warehouse 等列。',
        bullets: [
          '按类别划分的库存柱状图',
          '热销 SKU 排行',
          '低库存检测',
          '数据质量磁贴',
        ],
      },
      {
        heading: '适用场景',
        body: '适合电商运营商、小型仓库、零售门店和供应链分析师。',
      },
    ],
    faqs: [
      { q: '可以追踪库存变动趋势吗？', a: '如果数据中包含日期列，系统会自动绘制折线图。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'hr-dashboard-template': {
    h1: '免费 HR 仪表板模板',
    intro: 'ExcelInsight 可从任意员工电子表格中构建 HR 仪表板。拖入包含人员编制、部门、入职日期、离职率等列的数据，在浏览器中立即生成可视化视图。',
    sections: [
      {
        heading: '为什么 HR 团队选择私密工具',
        body: '敏感数据不离开浏览器，无需 IT 审查，无需签署数据保护协议。',
      },
      {
        heading: '仪表板包含的内容',
        body: '按部门和地点划分的人员编制、任期分布、按季度划分的离职率，以及自定义 KPI。',
      },
    ],
    faqs: [
      { q: '处理机密 HR 数据安全吗？', a: '安全，所有处理均在客户端完成，电子表格不会离开您的笔记本电脑。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'finance-reporting-dashboard': {
    h1: '免费财务报告仪表板',
    intro: 'ExcelInsight 为财务团队提供清晰、可报告的仪表板。上传损益表、预算与实际对比、现金流或应收账款账龄数据，获得主题图表和可直接输出为 PDF 的报告。',
    sections: [
      {
        heading: '专为月度报告周期设计',
        body: '上传最新文件，刷新仪表板，导出 PDF——无需维护任何公式。',
      },
      {
        heading: '可信赖的数据隐私保障',
        body: '损益表数据留在您的机器上，端到端完全在客户端处理。',
      },
    ],
    faqs: [
      { q: '支持预算与实际对比分析吗？', a: '支持，包含两列数据即可生成多系列柱状图或折线图。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'ecommerce-analytics-dashboard': {
    h1: '电商数据分析仪表板',
    intro: 'ExcelInsight 可将 Shopify、WooCommerce、Amazon 或 Etsy 的导出数据转换为电商数据分析仪表板——随时间变化的营收、热销 SKU、客单价趋势、流量来源构成和退款率。',
    sections: [
      {
        heading: '专为店铺运营者设计',
        body: '适合年营收百万到千万级别的店铺，运行速度够快，数据私密性足以放在您的笔记本上处理。',
      },
      {
        heading: '兼容所有平台导出格式',
        body: '支持 Shopify、WooCommerce、Amazon Seller Central 和 Etsy 的 CSV 导出文件。',
      },
    ],
    faqs: [
      { q: '需要先清洗 Shopify 导出数据吗？', a: '不需要，自动处理原始导出数据。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'startup-kpi-dashboard': {
    h1: '创业公司 KPI 仪表板',
    intro: 'ExcelInsight 是将创业指标电子表格转换为适合投资人汇报的 KPI 仪表板的最快方式。MRR、ARR、增长率、留存率、燃烧率、跑道——拖入您的每周指标文件，仪表板立即呈现。',
    sections: [
      {
        heading: '专为每周指标复盘设计',
        body: '创始人在电子表格中追踪指标，ExcelInsight 提供精美的可视化界面——一键生成 PDF，用于董事会更新和投资人邮件。',
      },
      {
        heading: '适合投资人的导出格式',
        body: '整洁的封面页、每页一个图表，可直接用作每月投资人更新报告。',
      },
    ],
    faqs: [
      { q: '每周可以更新仪表板吗？', a: '可以，追加数据行后重新上传，仪表板自动重新生成。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'manufacturing-report-dashboard': {
    h1: '制造业报告仪表板',
    intro: 'ExcelInsight 可将生产线电子表格转换为清晰的制造业仪表板。产能、停机时间、缺陷率、OEE 分解、班次对比——全部自动生成。',
    sections: [
      {
        heading: '工厂车间友好型工具',
        body: '读取 MES 或 SCADA 的 Excel 导出数据，无需 IT 协助，工厂管理者即可直接使用仪表板。',
      },
      {
        heading: '快速定位缺陷和异常',
        body: '散点图展示周期时间与缺陷率的关系，柱状图分析产线绩效，数据质量磁贴一目了然。',
      },
    ],
    faqs: [
      { q: '在工厂车间的笔记本上可以离线使用吗？', a: '可以，首次加载后大部分功能均可在客户端离线运行。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'marketing-analytics-dashboard': {
    h1: '营销数据分析仪表板',
    intro: 'ExcelInsight 是将 GA4、Google Ads、Meta Ads、HubSpot 或任意营销平台导出数据转换为营销数据分析仪表板的最快方式。渠道占比、广告活动 ROI、转化漏斗、线索来源分布。',
    sections: [
      {
        heading: '一个仪表板，覆盖所有渠道',
        body: '将各渠道的 Excel 导出数据整合为清晰的仪表板，无需 Looker Studio 的繁琐配置。',
      },
      {
        heading: '隐私与个人信息保护',
        body: '客户线索数据留在您的笔记本上，ExcelInsight 完全在客户端运行。',
      },
    ],
    faqs: [
      { q: '可以直接从 Google Analytics 拉取实时数据吗？', a: '不支持，仅支持文件导入——从 GA4 导出 CSV 后拖入即可。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'analyse-excel-data': {
    h1: '免费 Excel 数据分析工具',
    intro: 'ExcelInsight 是一款免费的 Excel 数据分析工具。上传电子表格，自动获得深度数据分析、数据类型检测和洞察性图表推荐。',
    sections: [
      {
        heading: '即时分析，无需公式',
        body: '无需公式、Power Query 或数据透视表。自动识别数值分布、热门类别和缺失值。',
        bullets: [
          '自动列类型检测',
          '即时描述性统计',
          '快速定位离群值',
        ],
      },
      {
        heading: '基于浏览器的数据分析',
        body: '在浏览器中完成复杂分析，数据不离开设备，机密文件处理更安全。',
      },
    ],
    faqs: [
      { q: '需要具备数据分析技能吗？', a: '不需要，自动生成图表和洞察——非常适合初学者使用。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'plot-excel-data': {
    h1: '在线绘制 Excel 数据图表',
    intro: 'ExcelInsight 让在线绘制 Excel 数据变得极为简单。上传文件后，ExcelInsight 自动绘制柱状图、折线图和散点图——无需配置任何图表参数。',
    sections: [
      {
        heading: '零摩擦绘图体验',
        body: '自动分析列并立即绘图，一键循环切换不同可视化类型。',
        bullets: [
          '绘制折线图',
          '绘制散点图',
          '绘制柱状图与饼图',
        ],
      },
      {
        heading: '导出与分享',
        body: '支持单独导出为 PNG，或生成包含所有图表的完整多页 PDF 报告。',
      },
    ],
    faqs: [
      { q: '也可以绘制 CSV 文件吗？', a: '可以，同时支持 Excel 和 CSV。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },
};
