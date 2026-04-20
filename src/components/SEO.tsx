import { Helmet } from 'react-helmet-async';
import { useI18n, type Language } from '@/lib/i18n';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string;
}

const langToLocale: Record<Language, string> = {
  en: 'en_US',
  hi: 'hi_IN',
  es: 'es_ES',
  zh: 'zh_CN',
  fr: 'fr_FR',
  de: 'de_DE',
};

const SITE_URL = 'https://excelinsight.xyz';

const defaultsByLang: Record<Language, { title: string; description: string }> = {
  en: {
    title: 'ExcelInsight – Free Excel Analytics, Visualization & Dashboard Builder',
    description: 'Upload Excel or CSV files to instantly create Excel charts, graphs, plots, reports, and interactive dashboards. Free Excel analytics & visualization tool, 100% private.',
  },
  hi: {
    title: 'ExcelInsight – मुफ्त Excel एनालिटिक्स, विज़ुअलाइज़ेशन और डैशबोर्ड बिल्डर',
    description: 'Excel या CSV फ़ाइलें अपलोड करें और तुरंत चार्ट, ग्राफ़, प्लॉट, रिपोर्ट और इंटरैक्टिव डैशबोर्ड बनाएँ। मुफ़्त, निजी, ब्राउज़र-आधारित।',
  },
  es: {
    title: 'ExcelInsight – Análisis, Visualización y Dashboards de Excel Gratis',
    description: 'Sube archivos Excel o CSV y crea al instante gráficos, visualizaciones, informes y dashboards interactivos. Herramienta gratuita y privada.',
  },
  zh: {
    title: 'ExcelInsight – 免费 Excel 分析、可视化与仪表板构建器',
    description: '上传 Excel 或 CSV 文件，即刻生成图表、可视化、报表和交互式仪表板。免费、私密、纯浏览器运行。',
  },
  fr: {
    title: 'ExcelInsight – Analyse, Visualisation et Tableaux de Bord Excel Gratuits',
    description: 'Importez vos fichiers Excel ou CSV pour créer instantanément des graphiques, visualisations, rapports et tableaux de bord interactifs. Gratuit et privé.',
  },
  de: {
    title: 'ExcelInsight – Kostenlose Excel Analyse, Visualisierung & Dashboards',
    description: 'Laden Sie Excel- oder CSV-Dateien hoch und erstellen Sie sofort Diagramme, Visualisierungen, Berichte und interaktive Dashboards. Kostenlos und privat.',
  },
};

export function SEO({ title, description, path = '/', keywords }: SEOProps) {
  const { lang } = useI18n();
  const defaults = defaultsByLang[lang];
  const finalTitle = title || defaults.title;
  const finalDescription = description || defaults.description;
  const url = `${SITE_URL}${path}`;
  const finalKeywords = keywords || 'excel insights, excel visual, excel visualization, excel graph, excel dashboard, excel analytics, excel plot, excel report, excel chart maker, csv visualization, free excel analyzer';

  return (
    <Helmet>
      <html lang={lang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:locale" content={langToLocale[lang]} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
    </Helmet>
  );
}
