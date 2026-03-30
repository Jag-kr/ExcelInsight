import { createContext, useContext } from 'react';

export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // App
    appName: 'DataLens',
    analyticsEngine: 'Analytics Engine',
    uploadSubtitle: 'Upload any Excel file • Instant analytics • Custom dashboards',
    smartDetection: 'Smart Detection',
    smartDetectionDesc: 'Auto-detects data types',
    autoCharts: 'Auto Charts',
    autoChartsDesc: 'Generates insights',
    dashboards: 'Dashboards',
    dashboardsDesc: 'Drag & drop builder',
    rows: 'rows',
    cols: 'cols',

    // Tabs
    dashboard: 'Dashboard',
    explore: 'Auto Charts',
    build: 'Build',
    data: 'Data',
    filter: 'Filter',
    insights: 'Insights',

    // File upload
    dropFile: 'Drop your Excel file here',
    orClickBrowse: 'or click to browse • .xlsx, .xls, .csv',
    processing: 'Processing...',

    // Dashboard
    noDashboardCharts: 'No charts on dashboard yet',
    noDashboardChartsDesc: 'Auto-generated charts and manual charts will appear here',
    addToDashboard: '+ Dashboard',
    exportPng: 'Export PNG',

    // Manual chart builder
    buildCustomChart: 'Build Custom Chart',
    chartType: 'Chart Type',
    xAxisCategory: 'X-Axis / Category',
    yAxisValue: 'Y-Axis / Value (optional)',
    selectColumn: 'Select column',
    countOnly: 'Count only',
    aggregation: 'Aggregation',
    sum: 'Sum',
    average: 'Average',
    count: 'Count',
    addDashboard: 'Add to Dashboard',

    // Column merger
    mergeColumns: 'Merge Columns',
    column1: 'Column 1',
    column2: 'Column 2',
    newColumnName: 'New column name',
    separator: 'Separator',
    merge: 'Merge',

    // Data summary
    columns: 'Columns',
    summableNumeric: 'Summable Numeric',
    categorical: 'Categorical',
    date: 'Date',
    text: 'Text',
    rangeDiscrete: 'Range / Discrete',
    identifier: 'Identifier',

    // Filters
    filterData: 'Filter Data',
    clearAll: 'Clear All',
    selectValue: 'Select value',
    allValues: 'All values',
    activeFilters: 'active filters',
    noFilters: 'No filterable columns found',

    // Smart Analysis / Insights
    smartInsights: 'Smart Insights',
    repeatingValues: 'Repeating Values Detected',
    highRepetition: 'High repetition',
    uniqueValues: 'unique values',
    occurrences: 'occurrences',
    topValues: 'Top values',
    columnStats: 'Column Statistics',
    min: 'Min',
    max: 'Max',
    mean: 'Mean',
    median: 'Median',
    stdDev: 'Std Dev',
    dataQuality: 'Data Quality',
    complete: 'Complete',
    nullValues: 'null values',
    ofRows: 'of rows',

    // Theme
    lightMode: 'Light',
    darkMode: 'Dark',
    theme: 'Theme',
    language: 'Language',
    english: 'English',
    hindi: 'हिन्दी',
    allChartsAdded: 'All charts have been added to the dashboard',
  },
  hi: {
    appName: 'DataLens',
    analyticsEngine: 'एनालिटिक्स इंजन',
    uploadSubtitle: 'कोई भी एक्सेल फ़ाइल अपलोड करें • तुरंत विश्लेषण • कस्टम डैशबोर्ड',
    smartDetection: 'स्मार्ट पहचान',
    smartDetectionDesc: 'डेटा प्रकार स्वतः पहचानता है',
    autoCharts: 'ऑटो चार्ट',
    autoChartsDesc: 'अंतर्दृष्टि उत्पन्न करता है',
    dashboards: 'डैशबोर्ड',
    dashboardsDesc: 'ड्रैग और ड्रॉप बिल्डर',
    rows: 'पंक्तियाँ',
    cols: 'स्तंभ',

    dashboard: 'डैशबोर्ड',
    explore: 'ऑटो चार्ट',
    build: 'बनाएं',
    data: 'डेटा',
    filter: 'फ़िल्टर',
    insights: 'अंतर्दृष्टि',

    dropFile: 'अपनी एक्सेल फ़ाइल यहाँ छोड़ें',
    orClickBrowse: 'या ब्राउज़ करने के लिए क्लिक करें • .xlsx, .xls, .csv',
    processing: 'प्रोसेसिंग...',

    noDashboardCharts: 'डैशबोर्ड पर अभी कोई चार्ट नहीं',
    noDashboardChartsDesc: 'ऑटो-जनरेटेड और मैनुअल चार्ट यहाँ दिखाई देंगे',
    addToDashboard: '+ डैशबोर्ड',
    exportPng: 'PNG निर्यात',

    buildCustomChart: 'कस्टम चार्ट बनाएं',
    chartType: 'चार्ट प्रकार',
    xAxisCategory: 'X-अक्ष / श्रेणी',
    yAxisValue: 'Y-अक्ष / मान (वैकल्पिक)',
    selectColumn: 'स्तंभ चुनें',
    countOnly: 'केवल गिनती',
    aggregation: 'एकत्रीकरण',
    sum: 'योग',
    average: 'औसत',
    count: 'गिनती',
    addDashboard: 'डैशबोर्ड में जोड़ें',

    mergeColumns: 'स्तंभ मर्ज करें',
    column1: 'स्तंभ 1',
    column2: 'स्तंभ 2',
    newColumnName: 'नया स्तंभ नाम',
    separator: 'विभाजक',
    merge: 'मर्ज',

    columns: 'स्तंभ',
    summableNumeric: 'योग्य संख्या',
    categorical: 'श्रेणीबद्ध',
    date: 'तिथि',
    text: 'टेक्स्ट',
    rangeDiscrete: 'रेंज / अलग',
    identifier: 'पहचानकर्ता',

    filterData: 'डेटा फ़िल्टर करें',
    clearAll: 'सब साफ करें',
    selectValue: 'मान चुनें',
    allValues: 'सभी मान',
    activeFilters: 'सक्रिय फ़िल्टर',
    noFilters: 'कोई फ़िल्टर योग्य स्तंभ नहीं मिला',

    smartInsights: 'स्मार्ट अंतर्दृष्टि',
    repeatingValues: 'दोहराए जाने वाले मान पाए गए',
    highRepetition: 'उच्च पुनरावृत्ति',
    uniqueValues: 'अद्वितीय मान',
    occurrences: 'घटनाएँ',
    topValues: 'शीर्ष मान',
    columnStats: 'स्तंभ सांख्यिकी',
    min: 'न्यूनतम',
    max: 'अधिकतम',
    mean: 'मध्यमान',
    median: 'मध्यिका',
    stdDev: 'मानक विचलन',
    dataQuality: 'डेटा गुणवत्ता',
    complete: 'पूर्ण',
    nullValues: 'रिक्त मान',
    ofRows: 'पंक्तियों का',

    lightMode: 'लाइट',
    darkMode: 'डार्क',
    theme: 'थीम',
    language: 'भाषा',
    english: 'English',
    hindi: 'हिन्दी',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translations.en[key],
});

export function useI18n() {
  return useContext(I18nContext);
}
