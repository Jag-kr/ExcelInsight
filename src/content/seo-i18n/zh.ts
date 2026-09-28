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
          '导出在您的浏览器中完成 — 电子表格不会离开您的设备',
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



  'csv-dashboard': {
    h1: '免费在线 CSV 仪表板构建器',
    intro: '需要可视化逗号分隔值？ExcelInsight 是一款快速且免费的 CSV 仪表板工具。直接在浏览器中构建交互式 CSV 仪表板，无需将敏感数据上传到云端。',
    sections: [
      {
        heading: '从原始文本到丰富的可视化',
        body: 'CSV 文件只是纯文本，但借助我们的 CSV 仪表板工具，它能转化为全面的可视化报告。轻松拖放磁贴，探索重复值并分析趋势。',
        bullets: [
          '无缝解析标准和不规则的 CSV 文件',
          '自动生成 KPI 和图表',
          '跨整个仪表板交互式筛选数据',
        ],
      },
      {
        heading: '无需编写代码',
        body: '您无需了解 Python 或 Pandas 即可分析 CSV 文件。只需将其拖入 ExcelInsight，让自动列分析功能为您完成繁重的工作。',
      },
    ],
    faqs: [
      { q: '我可以直接从 CSV 构建仪表板吗？', a: '可以，只需上传您的 CSV 文件，ExcelInsight 就会自动构建一个包含图表、指标和数据洞察的仪表板。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },


  'excel-data-insights': {
    h1: '自动化的 Excel 数据洞察',
    intro: '使用 ExcelInsight 解锁强大的 Excel 数据洞察。这款免费工具会自动分析您的电子表格，提供 Excel 用户所需的深度洞察，从异常检测到关键趋势总结应有尽有。',
    sections: [
      {
        heading: '发现隐藏模式',
        body: '您无需成为数据科学家即可从数据中获得智能洞察。ExcelInsight 会扫描您的列，自动识别重复值、缺失数据和相关性。',
        bullets: [
          '自动列分析与统计',
          '突出显示缺失值和数据质量问题',
          '根据数据类型智能推荐图表',
        ],
      },
      {
        heading: '即时数据智能',
        body: '立即获得可付诸行动的情报。该工具提供清晰的数据集可视化摘要，让您无需编写任何 Excel 公式即可做出明智决策。',
      },
    ],
    faqs: [
      { q: '该工具提供哪些数据洞察？', a: 'ExcelInsight 提供列统计信息，识别重复的分类值，标记缺失数据，并为您的数据集推荐最相关的图表。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },


  'free-excel-data-analysis-tool': {
    h1: '免费在线 Excel 数据分析工具',
    intro: 'ExcelInsight 是一款功能强大的免费在线 Excel 数据分析工具，帮助您在几秒钟内了解您的数据集。无需编写公式或 VBA 代码，即可对任何电子表格进行深度分析。',
    sections: [
      {
        heading: '化繁为简的数据分析',
        body: '告别繁琐的数据透视表。我们的工具通过识别数据类型、自动生成全面的统计摘要和可视化图表，使分析过程自动化。',
        bullets: [
          '即时描述性统计',
          '自动趋势和相关性检测',
          '易于使用的可视化界面',
        ],
      },
      {
        heading: '为速度与隐私而生',
        body: '因为它完全在您的浏览器中运行，该分析工具无需上传服务器即可即时处理文件。让您绝对安心地分析机密的财务或 HR 数据。',
      },
    ],
    faqs: [
      { q: '我需要安装任何软件来进行数据分析吗？', a: '不需要，这是一个基于 Web 的工具。它直接在任何操作系统的浏览器中运行，无需下载或安装。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },

  'excel-statistics-tool': {
    h1: '在线 Excel 统计工具',
    intro: 'ExcelInsight 是一款强大的 Excel 统计工具，让您免费在线读取商业统计数据。直接在浏览器中获得即时的统计摘要和描述性分析。',
    sections: [
      {
        heading: '即时描述性统计',
        body: '了解数据的分布至关重要。ExcelInsight 会自动计算文件中每个数值列的最小值、最大值、平均值并识别离群值。',
        bullets: [
          '自动生成摘要统计信息',
          '离群值检测与数据质量检查',
          '通过直方图和箱线图可视化分布',
        ],
      },
      {
        heading: '商业数据分析的完美之选',
        body: '无论您是在分析销售业绩还是运营效率，该工具都能为您提供快速、准确地做出数据驱动决策所需的统计基础。',
      },
    ],
    faqs: [
      { q: '这款工具可以替代 Excel 的分析工具库吗？', a: '对于基本的描述性统计、分布和相关性可视化，ExcelInsight 提供了比传统 Excel 加载项更快速、更用户友好的替代方案。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },




  'excel-link-analysis': {
    h1: 'Excel 中的链接分析',
    intro: '使用我们免费的 Excel 链接分析工具发现隐藏的联系。ExcelInsight 允许您直接在浏览器中，直观地探索数据集中的数据关系和实体连接。',
    sections: [
      {
        heading: '探索数据关系',
        body: '了解数据中不同实体之间的关系至关重要。虽然不是一个网络图工具，ExcelInsight 通过突出显示重复的分类连接和相关变量，帮助您进行关系分析。',
        bullets: [
          '识别数据段之间的共同属性',
          '使用散点图寻找变量相关性',
          '交互式筛选以追踪实体关系',
        ],
      },
      {
        heading: '连接的可视化方法',
        body: '通过交叉筛选图表和检查重复值洞察，您可以发现原始电子表格数据行中无法察觉的模式和关系。',
      },
    ],
    faqs: [
      { q: '此工具会生成节点-链接的网络图吗？', a: '不会，它侧重于通过交叉筛选、相关性和分类细分进行关系数据分析，而不是专门的网络拓扑图。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },


  'excel-data-visualizer': {
    h1: '免费 Excel 数据可视化工具',
    intro: '通过 ExcelInsight 体验无缝的 Excel 数据可视化。这款免费在线可视化工具会自动将您原始的行和列转换为全面、交互式的可视化仪表板。',
    sections: [
      {
        heading: '自动化的可视化',
        body: '您无需选择哪种图表最适合您的数据。Excel 数据可视化工具会分析您的电子表格，并自动选择最佳图表——无论是柱状图、折线图、饼图还是散点图。',
        bullets: [
          '根据列类型智能推荐图表',
          '交互式的响应式可视化',
          '拖放式仪表板布局',
        ],
      },
      {
        heading: '导出您的可视化结果',
        body: '在直观地探索数据后，您可以将整个仪表板导出为干净的多页 PDF 报告，以轻松地与您的团队或利益相关者分享数据洞察。',
      },
    ],
    faqs: [
      { q: '这个数据可视化工具免费吗？', a: '是的，ExcelInsight 完全免费。没有隐藏费用或订阅费来可视化和导出您的数据。' },
      { q: '免费吗？', a: '是的。' },
      { q: '数据是否私密？', a: '是的。' },
    ],
  },
};
