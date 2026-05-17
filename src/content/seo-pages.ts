// Programmatic SEO content for ExcelInsight landing pages.
// Each entry becomes a fully indexable route at /{slug} rendered by SeoLanding.tsx.
// Keep copy unique per page (avoid duplicate-content penalties) — vary intros,
// reorder feature wording, and tailor the FAQ to the page intent.

export type SeoCategory = 'feature' | 'comparison' | 'chart' | 'template' | 'usecase';

export interface SeoFaq {
  q: string;
  a: string;
}

export interface SeoSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface ComparisonRow {
  feature: string;
  excelinsight: string;
  competitor: string;
}

export interface SeoPage {
  slug: string;
  category: SeoCategory;
  title: string;          // <title> — 50–60 chars ideal
  description: string;    // meta description — 140–160 chars
  h1: string;
  intro: string;          // 2–4 sentences, keyword-rich
  primaryCta?: string;    // CTA label, defaults to "Upload your spreadsheet"
  sections: SeoSection[]; // 2–4 prose sections, each with optional bullets
  comparison?: {
    competitor: string;
    rows: ComparisonRow[];
  };
  faqs: SeoFaq[];
  related: string[];      // slugs to link in "Related tools" footer block
}

const baseFaq: SeoFaq[] = [
  {
    q: 'Is ExcelInsight free?',
    a: 'Yes. ExcelInsight is completely free with no signup, no subscription, and no usage limits. Upload as many Excel or CSV files as you like.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Files are processed entirely in your browser using client-side JavaScript. Nothing is uploaded to a server, which makes it safe for confidential financial, sales, HR and operational data.',
  },
];

export const seoPages: SeoPage[] = [
  // ───────────────────────── FEATURE PAGES ─────────────────────────
  {
    slug: 'excel-dashboard-maker',
    category: 'feature',
    title: 'Excel Dashboard Maker — Free Online Dashboard Builder',
    description: 'Build interactive Excel dashboards online in seconds. Drag-and-drop charts, KPIs and tables from any .xlsx or CSV file. Free, private, no signup.',
    h1: 'Free online Excel dashboard maker',
    intro:
      'ExcelInsight is a free Excel dashboard maker that turns any spreadsheet into a live, interactive dashboard in seconds. Upload an .xlsx or .csv file, pick the charts you want, and arrange them on a drag-and-drop grid — no formulas, no pivot tables, no Power Query, no signup.',
    sections: [
      {
        heading: 'Build a dashboard from any Excel or CSV file',
        body: 'ExcelInsight analyses every column the moment your file lands in the browser. It detects numeric, categorical, date and ID columns automatically, then suggests the most meaningful charts for your data — bar, line, area, pie, scatter, radar and horizontal bar — so you start with a working dashboard instead of a blank canvas.',
        bullets: [
          'Auto-generated default dashboard with the 3–4 most useful charts',
          'Drag-and-drop layout grid with small, medium and large tiles',
          'Inline column statistics, repeating-value insights and data quality tiles',
          'One-click duplicate, resize and remove for every dashboard item',
        ],
      },
      {
        heading: 'Why teams pick ExcelInsight over Excel’s built-in dashboards',
        body: 'Native Excel dashboards need pivot tables, slicers and a lot of mouse clicks. ExcelInsight gives you the same building blocks in a single web page — and because everything runs client-side, you can use it on locked-down work laptops where you can’t install Power BI or Tableau Desktop.',
        bullets: [
          'No installation, no licence, no admin permissions required',
          'Works on Windows, macOS, Linux, iPad and Chromebook',
          'Files never leave your device — safe for confidential data',
          'Export the finished dashboard to a single multi-page PDF report',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I edit the dashboard after the file is loaded?',
        a: 'Yes. Every tile can be resized (small/medium/large), duplicated, removed, or have its chart type and colour theme changed inline. You can also add new charts from the Explore tab or build custom ones from the Build tab.',
      },
      {
        q: 'How big can my Excel file be?',
        a: 'Because processing runs in your browser, file size depends on your device. Files with up to roughly 100,000 rows work smoothly on a modern laptop. Larger files still load — performance just scales with your hardware.',
      },
      ...baseFaq,
      {
        q: 'Can I export the dashboard?',
        a: 'Yes. Use Export PDF to download the entire dashboard as a polished multi-page report, or use the Export PNG button on any chart to download just that visualization.',
      },
    ],
    related: ['csv-visualization-tool', 'excel-chart-generator', 'excel-report-builder', 'sales-dashboard-template'],
  },
  {
    slug: 'csv-visualization-tool',
    category: 'feature',
    title: 'CSV Visualization Tool — Free Online CSV Chart Maker',
    description: 'Visualize CSV files online — upload any .csv and instantly get charts, dashboards and reports in your browser. Free, private, no signup required.',
    h1: 'Free online CSV visualization tool',
    intro:
      'ExcelInsight is a free CSV visualization tool that turns plain comma-separated files into rich, interactive dashboards in seconds. Drop a .csv exported from your database, CRM, marketing tool or backend script and ExcelInsight will profile every column, suggest charts and let you build a custom dashboard — all in the browser.',
    sections: [
      {
        heading: 'Open and chart any CSV file in your browser',
        body: 'ExcelInsight handles standard, quoted and ragged CSVs out of the box. Numeric columns get histograms and trend charts, categorical columns get breakdowns and repeating-value insights, and date columns become time-series plots automatically.',
        bullets: [
          'Supports .csv, .xlsx and .xls — including multi-sheet workbooks',
          'Auto type detection (numeric, range, date, ID, categorical)',
          'Smart insights highlight repeating values and data quality issues',
          'Filter rows live across every chart on the dashboard',
        ],
      },
      {
        heading: 'Built for engineers, analysts and operators',
        body: 'You don’t need Python, pandas or Jupyter to explore a CSV. ExcelInsight gives you the same first 30 minutes of exploratory data analysis you’d do in a notebook — column profiling, distribution charts, top-N breakdowns — without installing anything.',
      },
    ],
    faqs: [
      {
        q: 'Does ExcelInsight handle quoted commas and special characters?',
        a: 'Yes. The CSV parser handles RFC-4180 quoted fields, embedded commas, escaped quotes, BOM headers and mixed line endings.',
      },
      ...baseFaq,
      {
        q: 'Can I visualize a CSV without uploading it to a server?',
        a: 'That is exactly what ExcelInsight does. Parsing, charting, filtering and export all run client-side in your browser — your CSV never leaves your machine.',
      },
    ],
    related: ['excel-dashboard-maker', 'excel-chart-generator', 'bar-chart-maker', 'startup-kpi-dashboard'],
  },
  {
    slug: 'excel-chart-generator',
    category: 'feature',
    title: 'Excel Chart Generator — Make Charts Online from XLSX',
    description: 'Generate beautiful charts from Excel files online. Bar, line, pie, scatter, area and radar — all free, all in the browser. No signup.',
    h1: 'Online Excel chart generator',
    intro:
      'ExcelInsight is a free Excel chart generator. Upload an .xlsx, .xls or .csv file and instantly get bar, line, pie, scatter, area, radar and horizontal-bar charts based on the columns it detects. Every chart is editable, themable and exportable as PNG.',
    sections: [
      {
        heading: 'Seven chart types out of the box',
        body: 'ExcelInsight ships with a curated set of chart types that cover 90% of real reporting needs. You can switch any chart between types in one click — the data binding stays the same, so you can compare a bar and a line view of the same metric without re-uploading.',
        bullets: [
          'Bar and horizontal bar — comparisons across categories',
          'Line and area — trends over time',
          'Pie — share of total',
          'Scatter — correlations between two numeric columns',
          'Radar — multi-axis profile comparisons',
        ],
      },
      {
        heading: 'Themed, exportable, embeddable',
        body: 'Every chart picks up one of several built-in colour themes that match the ExcelInsight design system. Hover for tooltips, click the export icon to download a PNG, or add the chart to a dashboard for a combined PDF report.',
      },
    ],
    faqs: [
      {
        q: 'Can I customize chart colours?',
        a: 'Yes. Each chart has a theme picker with multiple curated palettes designed for legibility in both light and dark mode.',
      },
      ...baseFaq,
      {
        q: 'Can I build a chart from specific columns?',
        a: 'Yes. The Build tab includes a manual chart builder where you pick the X axis, Y axis (or multiple Y series), chart type and theme.',
      },
    ],
    related: ['excel-dashboard-maker', 'bar-chart-maker', 'pie-chart-maker', 'scatter-plot-generator'],
  },
  {
    slug: 'excel-report-builder',
    category: 'feature',
    title: 'Excel Report Builder — Generate PDF Reports from Excel',
    description: 'Turn Excel files into professional PDF reports online. Add charts, KPIs and insights, then export the whole dashboard to PDF in one click.',
    h1: 'Online Excel report builder',
    intro:
      'ExcelInsight is a free Excel report builder. Upload a spreadsheet, arrange charts and insights on the dashboard, then export the entire layout as a polished multi-page PDF report — complete with title page, metadata, and one chart per section.',
    sections: [
      {
        heading: 'From spreadsheet to report in three clicks',
        body: 'Most teams burn an afternoon every week pasting Excel charts into Word or Google Docs. ExcelInsight replaces that workflow: the dashboard you build is the report you ship. Click Export PDF and you get a branded document ready to send to stakeholders.',
        bullets: [
          'Auto-generated title page with file name, row count and column count',
          'One chart per page at high resolution',
          'Insight tiles (stats, repeating values, data quality) included in the PDF',
          'Works offline once the page is loaded',
        ],
      },
      {
        heading: 'Designed for recurring reporting',
        body: 'Weekly sales recap, monthly KPI review, quarterly board pack — ExcelInsight is built for the spreadsheets you have to report on again and again. Keep the same upload-and-export workflow and your report stays consistent week over week.',
      },
    ],
    faqs: [
      {
        q: 'What does the exported PDF include?',
        a: 'A cover page (filename, row/column counts, chart/table/insight counts and logo), followed by one page per dashboard item rendered at high resolution.',
      },
      ...baseFaq,
      {
        q: 'Can I add my own logo to the report?',
        a: 'The current export uses the ExcelInsight branding. White-labelled reports are on the roadmap — let us know if you need them.',
      },
    ],
    related: ['excel-dashboard-maker', 'excel-to-pdf-dashboard', 'finance-reporting-dashboard', 'sales-dashboard-template'],
  },
  {
    slug: 'excel-to-pdf-dashboard',
    category: 'feature',
    title: 'Excel to PDF Dashboard — Export Dashboards as PDF',
    description: 'Convert Excel and CSV files into a PDF dashboard online. Auto-generated charts, insights and a clean cover page — free and private.',
    h1: 'Excel to PDF dashboard converter',
    intro:
      'ExcelInsight converts Excel and CSV files into a clean, exportable PDF dashboard. Upload your file, let ExcelInsight pick the right charts, then export the whole layout as a single PDF you can share by email, Slack or attach to a board pack.',
    sections: [
      {
        heading: 'A dashboard, not a chart dump',
        body: 'Other Excel-to-PDF tools just print the spreadsheet. ExcelInsight builds a real dashboard first — with KPI tiles, smart insights and themed charts — then exports that dashboard as a PDF. The result reads like a report, not a printout.',
      },
      {
        heading: 'Private by design',
        body: 'Because nothing is uploaded to a server, your data never leaves your laptop. The PDF is generated in your browser using jsPDF and rendered from the live DOM, so what you see on screen is exactly what lands in the PDF.',
      },
    ],
    faqs: [
      {
        q: 'How is the PDF generated?',
        a: 'ExcelInsight renders each dashboard tile to a high-resolution canvas in your browser, then assembles the canvases into a multi-page PDF using jsPDF. No server round-trip is involved.',
      },
      ...baseFaq,
    ],
    related: ['excel-report-builder', 'excel-dashboard-maker', 'finance-reporting-dashboard'],
  },

  // ───────────────────────── COMPARISON PAGES ─────────────────────────
  {
    slug: 'excelinsight-vs-tableau',
    category: 'comparison',
    title: 'ExcelInsight and Tableau: Built for Different Workflows',
    description: 'Compare ExcelInsight and Tableau for Excel and CSV analysis. Learn which tool fits quick charting, private local analysis, or advanced reporting workflows.',
    h1: 'ExcelInsight and Tableau: Built for Different Workflows',
    intro:
      'Both ExcelInsight and Tableau help users work with data, but they are designed for very different workflows. ExcelInsight focuses on quick spreadsheet analysis directly in the browser, while Tableau is designed for enterprise-scale BI, live database connections and governed analytics.',
    sections: [
      {
        heading: 'Where ExcelInsight Fits Naturally',
        body: `If your dashboard starts from one .xlsx or .csv file, you don't want a server install, and you ship the report as a PDF, ExcelInsight is the natural fit. You skip Tableau's data-source connection, calculated fields and publish step.`,
        bullets: [
          'Zero install and zero licence — open the URL and upload',
          '100% client-side — safer for confidential data',
          'PDF export of the whole dashboard in one click',
        ],
      },
      {
        heading: 'Where Tableau Shines',
        body: 'Tableau is the right choice for live database connections, governed enterprise dashboards, row-level security and very large datasets. If you need real-time queries against Snowflake or BigQuery, Tableau is designed for that workflow.',
      },
    ],
    comparison: {
      competitor: 'Tableau',
      rows: [
        { feature: 'Price', excelinsight: 'Free, unlimited', competitor: '$70+/user/month' },
        { feature: 'Setup', excelinsight: 'Open URL — done', competitor: 'Install Desktop or provision Cloud' },
        { feature: 'Data privacy', excelinsight: '100% client-side', competitor: 'Data uploaded to Tableau Cloud / server' },
        { feature: 'Account required', excelinsight: 'No signup', competitor: 'Account + licence' },
        { feature: 'File formats', excelinsight: '.xlsx, .xls, .csv', competitor: 'Many — incl. live DB connectors' },
        { feature: 'PDF export', excelinsight: 'One click, multi-page', competitor: 'Yes' },
        { feature: 'Live DB connections', excelinsight: 'No', competitor: 'Yes' },
        { feature: 'Learning curve', excelinsight: 'Minutes', competitor: 'Days to weeks' },
      ],
    },
    faqs: [
      {
        q: 'Is ExcelInsight similar to Tableau?',
        a: `Both tools help create dashboards from data, but they're built for different workflows. ExcelInsight is lightweight and instant for single Excel or CSV files. Tableau is designed for enterprise-scale analytics with live database connections and governed access.`,
      },
      ...baseFaq,
    ],
    related: ['excelinsight-vs-powerbi', 'tableau-alternative', 'best-excel-dashboard-tool', 'excel-dashboard-maker'],
  },
  {
    slug: 'excelinsight-vs-powerbi',
    category: 'comparison',
    title: 'ExcelInsight and Power BI: Comparing Spreadsheet Workflows',
    description: 'Compare ExcelInsight and Power BI for Excel and CSV analysis. Learn which tool fits quick charting, private local analysis, or advanced reporting workflows.',
    h1: 'ExcelInsight and Power BI: Comparing Spreadsheet Workflows',
    intro:
      `Both ExcelInsight and Power BI help users create dashboards from data, but they're built for different workflows. ExcelInsight focuses on quick browser-based analysis of single Excel or CSV files. Power BI is designed for enterprise reporting, governance and live database integration.`,
    sections: [
      {
        heading: 'Where ExcelInsight Fits Naturally',
        body: 'If you have an Excel or CSV file and need a dashboard today without installation or signup, ExcelInsight is the natural fit. It runs in any browser on any OS and exports the dashboard as a PDF you can attach to an email.',
      },
      {
        heading: 'Where Power BI Shines',
        body: 'Power BI is the right choice for governed reporting against an enterprise data warehouse, DAX measures, scheduled refresh and tight Microsoft Entra ID integration.',
      },
    ],
    comparison: {
      competitor: 'Power BI',
      rows: [
        { feature: 'Price', excelinsight: 'Free, unlimited', competitor: 'Free desktop, Pro $14/user/month for sharing' },
        { feature: 'OS support', excelinsight: 'Any browser, any OS', competitor: 'Desktop is Windows-only' },
        { feature: 'Data privacy', excelinsight: '100% client-side', competitor: 'Data uploaded to Power BI Service for sharing' },
        { feature: 'Account required', excelinsight: 'No signup', competitor: 'Microsoft account' },
        { feature: 'Learning curve', excelinsight: 'Minutes', competitor: 'DAX, M, modelling concepts' },
        { feature: 'Excel/CSV upload', excelinsight: 'Drag-and-drop, instant charts', competitor: 'Yes — via Power Query' },
        { feature: 'PDF export', excelinsight: 'One click, multi-page', competitor: 'Yes' },
      ],
    },
    faqs: [
      {
        q: 'Should I use ExcelInsight or Power BI?',
        a: 'It depends on your workflow. For quick ad-hoc and recurring dashboards from Excel files without installation or signup, ExcelInsight fits naturally. For shared, governed enterprise reporting against a data warehouse with live connections, Power BI is designed for that.',
      },
      ...baseFaq,
    ],
    related: ['excelinsight-vs-tableau', 'tableau-alternative', 'best-excel-dashboard-tool', 'excel-dashboard-maker'],
  },
  {
    slug: 'tableau-alternative',
    category: 'comparison',
    title: 'Free Excel Dashboard Tool — Built for Spreadsheet Workflows',
    description: 'Need a fast, free way to turn Excel or CSV files into dashboards? ExcelInsight is a browser-based tool designed for quick spreadsheet analysis — no licence, no install, 100% private.',
    h1: 'Free Excel dashboard tool for spreadsheet workflows',
    intro:
      'Tableau is powerful but designed for enterprise-scale BI with a steep learning curve and ongoing licence costs. If you just need to turn an Excel or CSV file into a clean dashboard quickly, ExcelInsight is a lightweight, free alternative — no install, no signup, no upload to a server.',
    sections: [
      {
        heading: 'Designed for Different Workflows',
        body: 'ExcelInsight focuses on what most spreadsheet users need day to day: clean charts, KPI tiles, drag-and-drop layout, themed colours and a one-click PDF export. Tableau is designed for live database connections, governed publishing and deep statistical exploration — features optimized for large-scale enterprise teams.',
      },
      {
        heading: 'Best fit',
        body: 'ExcelInsight is the right Tableau alternative for analysts, founders, students, consultants and operations teams who live in spreadsheets and need a clean visual answer fast.',
      },
    ],
    faqs: [
      {
        q: 'Is ExcelInsight really free, or freemium?',
        a: 'Completely free. No paid tier, no signup wall, no upgrade prompts.',
      },
      ...baseFaq,
    ],
    related: ['excelinsight-vs-tableau', 'excelinsight-vs-powerbi', 'best-excel-dashboard-tool', 'excel-dashboard-maker'],
  },
  {
    slug: 'best-excel-dashboard-tool',
    category: 'comparison',
    title: 'Best Excel Dashboard Tool — Free Online Dashboard Builder',
    description: 'Looking for the best Excel dashboard tool? Compare the top options and see why ExcelInsight is the fastest free, private, browser-based pick.',
    h1: 'Best Excel dashboard tool in 2026',
    intro:
      `There are dozens of Excel dashboard tools — from native Excel pivot charts to Tableau, Power BI, Looker Studio, Datawrapper and Flourish. This page is a short, opinionated take on which one to pick depending on what you're actually trying to do.`,
    sections: [
      {
        heading: 'The shortlist',
        body: 'Pick by use case, not by brand. Each tool below is the right answer for a different problem.',
        bullets: [
          'ExcelInsight — quick, private dashboards from a single Excel or CSV file',
          'Power BI — governed enterprise reporting against a warehouse',
          'Tableau — deep, exploratory BI with live data sources',
          'Looker Studio — free dashboards on top of Google data (GA4, BigQuery, Sheets)',
          'Datawrapper — single, beautifully designed charts for the web',
        ],
      },
      {
        heading: 'When to pick ExcelInsight',
        body: 'If your data lives in a spreadsheet, you want a dashboard today, and you’d rather not install software or send your file to a third-party server, ExcelInsight is the fastest path. Upload, arrange, export PDF.',
      },
    ],
    faqs: [
      {
        q: 'What is the easiest Excel dashboard tool?',
        a: 'For pure ease of use on a single Excel file, ExcelInsight — open the URL, drop the file, get a dashboard. For shared enterprise dashboards, Power BI or Looker Studio are easier than Tableau.',
      },
      ...baseFaq,
    ],
    related: ['excelinsight-vs-tableau', 'excelinsight-vs-powerbi', 'tableau-alternative', 'excel-dashboard-maker'],
  },

  // ───────────────────────── CHART TYPE PAGES ─────────────────────────
  {
    slug: 'bar-chart-maker',
    category: 'chart',
    title: 'Bar Chart Maker — Free Online Bar Graph Generator',
    description: 'Make bar charts online from Excel or CSV. Vertical and horizontal bars, themable colours, export as PNG. Free, private, no signup.',
    h1: 'Free online bar chart maker',
    intro:
      'ExcelInsight is a free bar chart maker. Upload an Excel or CSV file and ExcelInsight automatically generates vertical or horizontal bar charts from your categorical and numeric columns — themable, tooltipped and one-click exportable to PNG.',
    sections: [
      {
        heading: 'When to use a bar chart',
        body: 'Bar charts are the right pick whenever you need to compare a single numeric value across categories — sales by region, signups by source, defects by team. Use horizontal bars when category labels are long.',
      },
      {
        heading: 'How ExcelInsight builds bar charts',
        body: 'ExcelInsight automatically detects categorical columns (low-cardinality text) and pairs them with numeric columns to produce meaningful bar charts. You can also build a bar chart manually from any two columns in the Build tab.',
        bullets: [
          'Vertical and horizontal orientation',
          'Multi-series (grouped) bar charts from multiple numeric columns',
          'Themable colour palettes for light and dark mode',
          'PNG export per chart and PDF export for the whole dashboard',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I make a stacked bar chart?',
        a: 'Today ExcelInsight supports grouped (side-by-side) bar charts with multiple numeric series. Stacked bars are on the roadmap.',
      },
      ...baseFaq,
    ],
    related: ['line-chart-maker', 'pie-chart-maker', 'excel-chart-generator', 'excel-dashboard-maker'],
  },
  {
    slug: 'line-chart-maker',
    category: 'chart',
    title: 'Line Chart Maker — Free Online Line Graph Generator',
    description: 'Generate line charts online from Excel or CSV files. Perfect for time series, trends and KPIs. Free, browser-based, no signup.',
    h1: 'Free online line chart maker',
    intro:
      'ExcelInsight is a free line chart maker designed for time series and trend analysis. Upload a file with a date column and one or more numeric columns and ExcelInsight will draw a smooth, multi-series line chart in seconds.',
    sections: [
      {
        heading: 'Built for time-series data',
        body: 'ExcelInsight detects date columns automatically (ISO strings, Excel serial dates, MM/DD/YYYY and DD/MM/YYYY) and uses them as the X axis. Plot revenue over time, daily active users, error rates, anything that changes day by day.',
      },
      {
        heading: 'Compare multiple series at once',
        body: 'Add multiple numeric columns to the same line chart to compare trends side by side — for example, monthly revenue per region or daily signups by acquisition channel.',
      },
    ],
    faqs: [
      {
        q: 'What date formats are supported?',
        a: 'ISO 8601 (YYYY-MM-DD), Excel serial dates, MM/DD/YYYY, DD/MM/YYYY and most common variants. ExcelInsight normalizes them on import.',
      },
      ...baseFaq,
    ],
    related: ['bar-chart-maker', 'area-chart-maker', 'excel-chart-generator', 'startup-kpi-dashboard'],
  },
  {
    slug: 'pie-chart-maker',
    category: 'chart',
    title: 'Pie Chart Maker — Free Online Pie Chart Generator',
    description: 'Create pie charts online from Excel or CSV. Show share of total with clean, themable slices. Free, private, no signup needed.',
    h1: 'Free online pie chart maker',
    intro:
      'ExcelInsight is a free pie chart maker. Upload an Excel or CSV file and turn any categorical column into a themed, labelled pie chart that shows share of total at a glance.',
    sections: [
      {
        heading: 'When a pie chart is the right call',
        body: 'Pie charts work best when you have five or fewer categories and you want to communicate share of a whole — market share, traffic source mix, expense breakdown. For more categories, use a horizontal bar chart instead.',
      },
      {
        heading: 'Smart defaults',
        body: 'ExcelInsight orders slices by size, applies a high-contrast palette, and adds percentage labels automatically so the chart is readable both on screen and in the exported PDF.',
      },
    ],
    faqs: [
      {
        q: 'Can I switch a pie chart to a donut?',
        a: 'Pie variants are on the roadmap. For now you can switch any chart to another type (bar, horizontal bar, line, area) with one click.',
      },
      ...baseFaq,
    ],
    related: ['bar-chart-maker', 'excel-chart-generator', 'excel-dashboard-maker', 'ecommerce-analytics-dashboard'],
  },
  {
    slug: 'scatter-plot-generator',
    category: 'chart',
    title: 'Scatter Plot Generator — Free Online Scatter Chart Tool',
    description: 'Generate scatter plots online from Excel or CSV. Visualize correlation between two numeric columns. Free, private, no signup.',
    h1: 'Free online scatter plot generator',
    intro:
      'ExcelInsight is a free scatter plot generator. Pick any two numeric columns and ExcelInsight will draw a scatter chart you can use to spot correlations, outliers and clusters in your data — no Python, no R, no notebooks.',
    sections: [
      {
        heading: 'Find correlations in seconds',
        body: 'Scatter plots are the fastest way to see whether two variables move together. ExcelInsight handles thousands of points smoothly and gives you a hover tooltip showing the exact X/Y values for any dot.',
      },
      {
        heading: 'Spot outliers and clusters',
        body: 'Outliers jump out visually on a scatter plot in a way they never do in a table. Use ExcelInsight scatter charts as the first step of any anomaly investigation on a fresh dataset.',
      },
    ],
    faqs: [
      {
        q: 'How many points can a scatter plot handle?',
        a: 'Several thousand points render smoothly in modern browsers. Beyond ~10k points, performance depends on your device.',
      },
      ...baseFaq,
    ],
    related: ['line-chart-maker', 'bar-chart-maker', 'excel-chart-generator', 'manufacturing-report-dashboard'],
  },
  {
    slug: 'area-chart-maker',
    category: 'chart',
    title: 'Area Chart Maker — Free Online Area Graph Generator',
    description: 'Create area charts online from Excel or CSV. Show cumulative trends with smooth, filled areas. Free, private, no signup.',
    h1: 'Free online area chart maker',
    intro:
      'ExcelInsight is a free area chart maker. Combine a date column and one or more numeric columns to draw filled, multi-series area charts that highlight the magnitude of a trend, not just its direction.',
    sections: [
      {
        heading: 'Area vs line — when to pick which',
        body: 'Lines are best for comparing trends; areas are best for showing the absolute size of those trends. Use an area chart when the volume under the curve is itself meaningful — total revenue accumulated, cumulative signups, total downloads.',
      },
      {
        heading: 'Switch types in one click',
        body: 'Every ExcelInsight chart has a type switcher. Build a chart as a line first, then flip it to an area chart to see which reads better — no re-uploading, no rebinding columns.',
      },
    ],
    faqs: [
      {
        q: 'Can I stack multiple series in an area chart?',
        a: 'Multi-series area charts overlay multiple series with semi-transparent fills today. True stacked areas are on the roadmap.',
      },
      ...baseFaq,
    ],
    related: ['line-chart-maker', 'bar-chart-maker', 'excel-chart-generator', 'finance-reporting-dashboard'],
  },

  // ───────────────────────── TEMPLATE PAGES ─────────────────────────
  {
    slug: 'sales-dashboard-template',
    category: 'template',
    title: 'Sales Dashboard Template — Free Excel Sales Dashboard',
    description: 'Free sales dashboard template — upload your sales Excel file and get pipeline, revenue and rep performance charts instantly. Browser-based, private.',
    h1: 'Free sales dashboard template',
    intro:
      'ExcelInsight gives you a working sales dashboard the moment you upload a sales spreadsheet — pipeline by stage, revenue over time, top accounts, rep performance, and deal counts. No template downloads, no formulas, no XLSX templates to maintain.',
    sections: [
      {
        heading: 'What the sales dashboard includes',
        body: 'ExcelInsight inspects your columns and assembles the most useful views for sales data automatically. Typical files include Stage, Amount, Owner, Account, Close Date and ARR — ExcelInsight builds a default dashboard around them.',
        bullets: [
          'Revenue or ARR over time as a line chart',
          'Pipeline by stage as a horizontal bar chart',
          'Top accounts and top owners ranked',
          'Win rate and deal counts as KPI tiles',
        ],
      },
      {
        heading: 'How to use it',
        body: 'Export your pipeline from Salesforce, HubSpot, Pipedrive or Close as CSV. Drop the file into ExcelInsight. Edit the dashboard layout if needed. Export to PDF and send to your sales leader. Repeat next week.',
      },
    ],
    faqs: [
      {
        q: 'Do I need to pre-format my sales data?',
        a: 'No. ExcelInsight reads the raw export from most CRMs as-is. The cleaner your column headers, the better the auto-suggested charts.',
      },
      ...baseFaq,
    ],
    related: ['excel-dashboard-maker', 'startup-kpi-dashboard', 'finance-reporting-dashboard', 'excel-report-builder'],
  },
  {
    slug: 'inventory-dashboard-template',
    category: 'template',
    title: 'Inventory Dashboard Template — Free Stock Tracker Online',
    description: 'Free inventory dashboard template — upload your stock Excel and get SKU breakdowns, stock-out alerts and reorder views instantly.',
    h1: 'Free inventory dashboard template',
    intro:
      'ExcelInsight turns any inventory or stock spreadsheet into an inventory dashboard in seconds. Upload your SKU list with quantities and ExcelInsight will auto-build views for stock on hand, top SKUs, low-stock warnings and category breakdowns.',
    sections: [
      {
        heading: 'What gets generated automatically',
        body: 'ExcelInsight looks for columns like SKU, Product, Quantity, Reorder Point, Category and Warehouse, then builds the most useful views for inventory teams.',
        bullets: [
          'Quantity on hand by category — bar chart',
          'Top SKUs by quantity or value — horizontal bar',
          'Low-stock detection via the repeating-value insight',
          'Data quality tile for missing SKU, category or warehouse data',
        ],
      },
      {
        heading: 'Good fit for',
        body: 'E-commerce operators, small warehouses, retail stores, and supply chain analysts who track stock in Excel or Google Sheets and don’t want to plug a full WMS into their workflow.',
      },
    ],
    faqs: [
      {
        q: 'Can I track stock movements over time?',
        a: 'If your file includes a date column with snapshots of stock levels, ExcelInsight will draw a line chart of stock over time automatically.',
      },
      ...baseFaq,
    ],
    related: ['sales-dashboard-template', 'manufacturing-report-dashboard', 'excel-dashboard-maker', 'excel-report-builder'],
  },
  {
    slug: 'hr-dashboard-template',
    category: 'template',
    title: 'HR Dashboard Template — Free People Analytics Online',
    description: 'Free HR dashboard template — upload an employee Excel file and instantly get headcount, attrition and diversity charts. 100% private.',
    h1: 'Free HR dashboard template',
    intro:
      'ExcelInsight builds an HR dashboard from any employee spreadsheet. Drop a file with headcount, department, hire date and attrition columns and ExcelInsight will assemble headcount by department, tenure distribution, attrition trends and diversity views — all in your browser.',
    sections: [
      {
        heading: 'Why HR teams pick a private tool',
        body: 'HR data is sensitive. ExcelInsight is a strong fit because nothing leaves your browser — no IT review, no DPA, no shadow-IT concern. Open the URL, drop the file, build the dashboard.',
      },
      {
        heading: 'What the HR dashboard includes',
        body: 'Headcount by department and location, tenure distribution, time-to-hire if you include offer/start dates, attrition by quarter, and any custom KPI you build in the Build tab.',
      },
    ],
    faqs: [
      {
        q: 'Is ExcelInsight safe for confidential HR data?',
        a: 'Yes. All processing is client-side. Your spreadsheet never leaves your laptop and is never uploaded to ExcelInsight or any third-party server.',
      },
      ...baseFaq,
    ],
    related: ['excel-dashboard-maker', 'finance-reporting-dashboard', 'startup-kpi-dashboard', 'excel-report-builder'],
  },
  {
    slug: 'finance-reporting-dashboard',
    category: 'template',
    title: 'Finance Reporting Dashboard — Free Excel Finance Template',
    description: 'Free finance reporting dashboard — turn your finance Excel into P&L, cash flow and budget vs actual views instantly. Private, no signup.',
    h1: 'Free finance reporting dashboard',
    intro:
      'ExcelInsight gives finance teams a clean, reportable dashboard in seconds. Upload your monthly P&L, budget vs actual, cash flow or AR aging Excel and ExcelInsight will turn it into themed charts and PDF-ready report pages.',
    sections: [
      {
        heading: 'Built for monthly reporting cadence',
        body: 'Finance dashboards live and die by the monthly close cycle. ExcelInsight is purpose-built for that cadence: upload the latest file, refresh the dashboard, export the PDF for the board pack. No formulas to maintain, no broken templates.',
      },
      {
        heading: 'Privacy you can defend',
        body: 'Finance data should never be uploaded to a random web tool. ExcelInsight is client-side end to end — your P&L stays on your machine, and you can demonstrate that to your CFO and your security team.',
      },
    ],
    faqs: [
      {
        q: 'Can I report budget vs actual?',
        a: 'Yes. Include both budget and actual numeric columns and ExcelInsight will draw them as a multi-series bar or line chart, side by side.',
      },
      ...baseFaq,
    ],
    related: ['excel-dashboard-maker', 'excel-report-builder', 'excel-to-pdf-dashboard', 'sales-dashboard-template'],
  },

  // ───────────────────────── USE CASE PAGES ─────────────────────────
  {
    slug: 'ecommerce-analytics-dashboard',
    category: 'usecase',
    title: 'Ecommerce Analytics Dashboard — Free Online Tool',
    description: 'Free ecommerce analytics dashboard — upload your Shopify or WooCommerce CSV and get revenue, AOV and top-product charts instantly.',
    h1: 'Ecommerce analytics dashboard',
    intro:
      'ExcelInsight turns any Shopify, WooCommerce, Amazon or Etsy export into an ecommerce analytics dashboard in seconds. Revenue over time, top SKUs, AOV trend, traffic source mix and refund rate — all from the export file you already have.',
    sections: [
      {
        heading: 'Built for store operators',
        body: 'Most ecommerce dashboards in BI tools are overkill for a store doing six or seven figures. ExcelInsight is the right size — fast enough to use weekly, private enough to use on your laptop, free enough to use forever.',
      },
      {
        heading: 'Works with every major platform export',
        body: 'Shopify orders, WooCommerce orders, Amazon Seller Central reports, Etsy CSVs — anything that exports as Excel or CSV will work with ExcelInsight out of the box.',
      },
    ],
    faqs: [
      {
        q: 'Do I need to clean my Shopify export first?',
        a: 'No. ExcelInsight handles the raw export, detects the relevant columns and builds a dashboard automatically.',
      },
      ...baseFaq,
    ],
    related: ['startup-kpi-dashboard', 'sales-dashboard-template', 'excel-dashboard-maker', 'pie-chart-maker'],
  },
  {
    slug: 'startup-kpi-dashboard',
    category: 'usecase',
    title: 'Startup KPI Dashboard — Free Online Metrics Tracker',
    description: 'Free startup KPI dashboard — upload your weekly metrics Excel and get MRR, growth, retention and burn charts instantly. Browser-based.',
    h1: 'Startup KPI dashboard',
    intro:
      'ExcelInsight is the fastest way to turn a startup metrics spreadsheet into an investor-ready KPI dashboard. MRR, ARR, growth rate, retention, burn, runway, customer count — drop your weekly metrics file and the dashboard appears.',
    sections: [
      {
        heading: 'Designed for weekly metrics reviews',
        body: 'Founders and operators already track metrics in a spreadsheet. ExcelInsight gives that spreadsheet a polished face — same source of truth, much better visualisation, instant PDF for board updates and investor emails.',
      },
      {
        heading: 'Investor-ready exports',
        body: 'The PDF export gives you a clean cover page, one chart per page, and ExcelInsight branding (white-label coming). It’s a usable artifact for monthly investor updates without any extra formatting work.',
      },
    ],
    faqs: [
      {
        q: 'Can I update the dashboard each week?',
        a: 'Yes. Append the latest week’s row(s) to your file, re-upload, and the dashboard regenerates from scratch with the latest data.',
      },
      ...baseFaq,
    ],
    related: ['sales-dashboard-template', 'finance-reporting-dashboard', 'excel-dashboard-maker', 'excel-report-builder'],
  },
  {
    slug: 'manufacturing-report-dashboard',
    category: 'usecase',
    title: 'Manufacturing Report Dashboard — Free Excel OEE Tool',
    description: 'Free manufacturing dashboard — upload production Excel and get OEE, downtime, defect and throughput charts instantly. Private, no signup.',
    h1: 'Manufacturing report dashboard',
    intro:
      'ExcelInsight turns production line spreadsheets into clean manufacturing dashboards. Throughput, downtime, defect rate, OEE-style breakdowns, shift comparisons — all generated automatically from your daily or weekly production export.',
    sections: [
      {
        heading: 'Plant-floor friendly',
        body: 'Manufacturing data often lives in Excel sheets exported from MES or SCADA systems. ExcelInsight reads those exports as-is and gives plant managers a dashboard without needing IT to build a Power BI report.',
      },
      {
        heading: 'Spot defects and outliers fast',
        body: 'Use the scatter chart to plot cycle time vs defect rate, the bar chart to compare line performance, and the data quality tile to spot missing readings before they corrupt your reporting.',
      },
    ],
    faqs: [
      {
        q: 'Does it work offline on a plant-floor laptop?',
        a: 'After the first load, most functionality works without an internet connection because everything runs client-side.',
      },
      ...baseFaq,
    ],
    related: ['inventory-dashboard-template', 'scatter-plot-generator', 'excel-dashboard-maker', 'excel-report-builder'],
  },
  {
    slug: 'marketing-analytics-dashboard',
    category: 'usecase',
    title: 'Marketing Analytics Dashboard — Free Online Tool',
    description: 'Free marketing analytics dashboard — turn GA4, ads or CRM Excel exports into channel, campaign and conversion charts instantly.',
    h1: 'Marketing analytics dashboard',
    intro:
      'ExcelInsight is the fastest way to turn GA4, Google Ads, Meta Ads, HubSpot or any marketing export into a marketing analytics dashboard. Channel mix, campaign ROI, conversion funnel, lead source breakdown — all from a single uploaded file.',
    sections: [
      {
        heading: 'One dashboard, every channel',
        body: 'Most marketing teams already export per-channel reports to Excel. ExcelInsight lets you turn each of those exports into a clean dashboard in seconds — no need to wire everything into Looker Studio or pay for a paid dashboard SaaS.',
      },
      {
        heading: 'Privacy and PII',
        body: 'Lead and customer data shouldn’t go to a random third-party dashboard tool. Because ExcelInsight is client-side, your lead lists stay on your laptop.',
      },
    ],
    faqs: [
      {
        q: 'Can ExcelInsight pull data live from Google Analytics?',
        a: 'No — ExcelInsight is intentionally file-based and client-side. Export your GA4 report to CSV and drop it in.',
      },
      ...baseFaq,
    ],
    related: ['startup-kpi-dashboard', 'ecommerce-analytics-dashboard', 'excel-dashboard-maker', 'pie-chart-maker'],
  },
];

export const seoPageMap: Record<string, SeoPage> = Object.fromEntries(
  seoPages.map((p) => [p.slug, p]),
);

export const seoPagesByCategory: Record<SeoCategory, SeoPage[]> = {
  feature: seoPages.filter((p) => p.category === 'feature'),
  comparison: seoPages.filter((p) => p.category === 'comparison'),
  chart: seoPages.filter((p) => p.category === 'chart'),
  template: seoPages.filter((p) => p.category === 'template'),
  usecase: seoPages.filter((p) => p.category === 'usecase'),
};

export const categoryLabel: Record<SeoCategory, string> = {
  feature: 'Features',
  comparison: 'Comparisons',
  chart: 'Chart makers',
  template: 'Dashboard templates',
  usecase: 'Use cases',
};
