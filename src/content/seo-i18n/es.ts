export const esSeoUi = {
  categoryFeature: 'Funcionalidades',
  categoryComparison: 'Comparativas',
  categoryChart: 'Tipos de gráfico',
  categoryTemplate: 'Plantillas',
  categoryUsecase: 'Casos de uso',
  seeItInAction: 'Véalo en acción',
  tryWithYourOwnFile: 'Pruébalo con tu propio archivo',
  tryItDesc: 'Sube cualquier archivo Excel o CSV y obtén un panel interactivo en segundos — gratis, sin registro.',
  frequentlyAskedQuestions: 'Preguntas frecuentes',
  relatedTools: 'Herramientas relacionadas',
  uploadSpreadsheetFree: 'Sube tu hoja de cálculo — gratis',
  feature: 'Funcionalidad',
  comparisons: 'Comparativas',
};

export const es: Record<
  string,
  {
    h1: string;
    intro: string;
    primaryCta?: string;
    sections: { heading: string; body: string; bullets?: string[] }[];
    faqs: { q: string; a: string }[];
  }
> = {
  'excel-dashboard-maker': {
    h1: 'Creador de paneles Excel gratuito y online',
    intro:
      'ExcelInsight es un creador de paneles Excel gratuito que convierte cualquier hoja de cálculo en un panel interactivo y en tiempo real en cuestión de segundos. Sube un archivo .xlsx o .csv, elige los gráficos que quieres y organízalos en una cuadrícula de arrastrar y soltar — sin fórmulas, sin tablas dinámicas, sin Power Query, sin registro.',
    primaryCta: 'Sube tu hoja de cálculo — gratis',
    sections: [
      {
        heading: 'Crea un panel a partir de cualquier archivo Excel o CSV',
        body: 'ExcelInsight analiza cada columna en el momento en que tu archivo llega al navegador. Detecta automáticamente columnas numéricas, categóricas, de fecha e ID, y luego sugiere los gráficos más significativos para tus datos — barras, líneas, áreas, circular, dispersión, radar y barras horizontales — para que empieces con un panel funcional en lugar de un lienzo en blanco.',
        bullets: [
          'Panel predeterminado generado automáticamente con los 3 o 4 gráficos más útiles',
          'Cuadrícula de diseño de arrastrar y soltar con mosaicos pequeños, medianos y grandes',
          'Estadísticas de columna en línea con información sobre valores repetidos y calidad de datos',
          'Duplicar, redimensionar y eliminar con un clic cada elemento del panel',
        ],
      },
      {
        heading: 'Por qué los equipos eligen ExcelInsight frente a los paneles integrados de Excel',
        body: 'Los paneles nativos de Excel requieren tablas dinámicas, segmentaciones y muchos clics. ExcelInsight te ofrece los mismos bloques de construcción en una sola página web — y como todo se ejecuta en el lado del cliente, puedes usarlo en portátiles corporativos bloqueados donde no puedes instalar Power BI ni Tableau Desktop.',
        bullets: [
          'Sin instalación, sin licencia, sin permisos de administrador',
          'Funciona en Windows, macOS, Linux, iPad y Chromebook',
          'Los archivos nunca salen de tu dispositivo — seguro para datos confidenciales',
          'Exporta el panel terminado como un informe PDF de varias páginas',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Puedo editar el panel después de cargar el archivo?',
        a: 'Sí. Cada mosaico se puede redimensionar, duplicar, eliminar o cambiar de tipo de gráfico y tema de color directamente.',
      },
      {
        q: '¿Qué tamaño puede tener mi archivo Excel?',
        a: 'Los archivos de hasta aproximadamente 100 000 filas funcionan con fluidez en un portátil moderno.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro, sin suscripción y sin límites de uso.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Los archivos se procesan íntegramente en tu navegador. No se sube nada a ningún servidor.',
      },
      {
        q: '¿Puedo exportar el panel?',
        a: 'Sí. Usa Exportar PDF para descargar el panel completo como un informe elegante de varias páginas.',
      },
    ],
  },

  'csv-visualization-tool': {
    h1: 'Herramienta gratuita y online para visualizar CSV',
    intro:
      'ExcelInsight es una herramienta gratuita para visualizar CSV que convierte archivos de valores separados por comas en paneles interactivos y enriquecidos en segundos. Arrastra un .csv exportado desde tu base de datos, CRM, herramienta de marketing o script de backend, y ExcelInsight analizará cada columna, sugerirá gráficos y te permitirá crear un panel personalizado — todo en el navegador.',
    sections: [
      {
        heading: 'Abre y representa cualquier archivo CSV en tu navegador',
        body: 'ExcelInsight gestiona CSV estándar, con comillas y con campos irregulares sin necesidad de configuración. Las columnas numéricas obtienen histogramas y gráficos de tendencias, las categóricas obtienen desglose de valores, y las de fecha se convierten automáticamente en gráficos de series temporales.',
        bullets: [
          'Compatible con .csv, .xlsx y .xls, incluidos libros de trabajo de varias hojas',
          'Detección automática de tipo: numérico, rango, fecha, ID y categórico',
          'Información inteligente que resalta valores repetidos y problemas de calidad de datos',
          'Filtra filas en tiempo real en todos los gráficos del panel',
        ],
      },
      {
        heading: 'Diseñado para ingenieros, analistas y operadores',
        body: 'No necesitas Python, pandas ni Jupyter para explorar un CSV. ExcelInsight te ofrece los primeros 30 minutos de análisis exploratorio de datos sin instalar nada.',
      },
    ],
    faqs: [
      {
        q: '¿Gestiona ExcelInsight comas entre comillas y caracteres especiales?',
        a: 'Sí. Campos citados según RFC-4180, comas embebidas, comillas escapadas, encabezados BOM y finales de línea mixtos.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
      {
        q: '¿Puedo visualizar un CSV sin subirlo a ningún servidor?',
        a: 'Exactamente eso es lo que hace ExcelInsight. Todo se ejecuta en el lado del cliente — tu CSV nunca sale de tu máquina.',
      },
    ],
  },


  'excel-report-builder': {
    h1: 'Generador de informes Excel online',
    intro:
      'ExcelInsight es un generador de informes Excel gratuito. Sube una hoja de cálculo, organiza gráficos e información en el panel y exporta todo el diseño como un informe PDF de varias páginas — con portada, metadatos y un gráfico por sección.',
    sections: [
      {
        heading: 'De hoja de cálculo a informe en tres clics',
        body: 'La mayoría de los equipos pierde una tarde entera cada semana pegando gráficos de Excel en Word o Google Docs. ExcelInsight reemplaza ese flujo de trabajo — haz clic en Exportar PDF y obtienes un documento con imagen de marca listo para enviar a los responsables.',
        bullets: [
          'Portada generada automáticamente con nombre de archivo, número de filas y columnas',
          'Un gráfico por página en alta resolución',
          'Mosaicos de información incluidos en el PDF',
          'La exportación se ejecuta en tu navegador: la hoja de cálculo nunca sale de tu dispositivo',
        ],
      },
      {
        heading: 'Diseñado para informes recurrentes',
        body: 'Resumen semanal de ventas, revisión mensual de KPI, presentación trimestral al consejo — ExcelInsight está hecho para las hojas de cálculo sobre las que tienes que informar una y otra vez.',
      },
    ],
    faqs: [
      {
        q: '¿Qué incluye el PDF exportado?',
        a: 'Una portada seguida de una página por elemento del panel, renderizada en alta resolución.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
      {
        q: '¿Puedo añadir mi propio logotipo?',
        a: 'La exportación actual usa la imagen de marca de ExcelInsight. Los informes con marca blanca están en la hoja de ruta.',
      },
    ],
  },

  'excel-to-pdf-dashboard': {
    h1: 'Convertidor de Excel a panel PDF',
    intro:
      'ExcelInsight convierte archivos Excel y CSV en un panel PDF limpio y exportable. Sube tu archivo, deja que ExcelInsight elija los gráficos adecuados y exporta todo el diseño como un único PDF que puedes compartir por correo electrónico, Slack o adjuntar a una presentación al consejo.',
    sections: [
      {
        heading: 'Un panel, no un volcado de gráficos',
        body: 'Otras herramientas de Excel a PDF simplemente imprimen la hoja de cálculo. ExcelInsight primero crea un panel real — con mosaicos de KPI, información inteligente y gráficos con temas — y luego lo exporta como PDF.',
      },
      {
        heading: 'Privacidad por diseño',
        body: 'No se sube nada a ningún servidor. Tus datos nunca salen de tu portátil. El PDF se genera en tu navegador usando jsPDF.',
      },
    ],
    faqs: [
      {
        q: '¿Cómo se genera el PDF?',
        a: 'ExcelInsight renderiza cada mosaico en un canvas y luego los ensambla en un PDF de varias páginas usando jsPDF. Sin comunicación con ningún servidor.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },

  'excelinsight-vs-tableau': {
    h1: 'ExcelInsight y Tableau: diseñados para flujos de trabajo distintos',
    intro:
      'Tanto ExcelInsight como Tableau ayudan a los usuarios a trabajar con datos, pero están diseñados para flujos de trabajo muy diferentes. ExcelInsight se centra en el análisis rápido de hojas de cálculo en el navegador; Tableau es para BI a escala empresarial.',
    sections: [
      {
        heading: 'Dónde encaja ExcelInsight de forma natural',
        body: 'Si tu panel parte de un único archivo .xlsx o .csv y entregas el informe en PDF, ExcelInsight es la opción natural.',
        bullets: [
          'Sin instalación y sin licencia',
          '100 % en el lado del cliente — más seguro para datos confidenciales',
          'Exportación a PDF con un clic',
        ],
      },
      {
        heading: 'Dónde destaca Tableau',
        body: 'Tableau es la elección correcta para conexiones a bases de datos en vivo, paneles empresariales gobernados, seguridad a nivel de fila y conjuntos de datos muy grandes.',
      },
    ],
    faqs: [
      {
        q: '¿Es ExcelInsight similar a Tableau?',
        a: 'Ambos crean paneles, pero para flujos de trabajo distintos. ExcelInsight es ligero para archivos individuales. Tableau es para análisis a escala empresarial.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },

  'excelinsight-vs-powerbi': {
    h1: 'ExcelInsight y Power BI: comparación de flujos de trabajo con hojas de cálculo',
    intro:
      'Ambos ayudan a los usuarios a crear paneles, pero para flujos de trabajo distintos. ExcelInsight se centra en el análisis rápido basado en el navegador de archivos Excel o CSV individuales. Power BI es para informes empresariales con integración de bases de datos en vivo.',
    sections: [
      {
        heading: 'Dónde encaja ExcelInsight de forma natural',
        body: 'Si tienes un archivo Excel y necesitas un panel hoy mismo sin instalación ni registro, ExcelInsight funciona en cualquier navegador y en cualquier sistema operativo.',
      },
      {
        heading: 'Dónde destaca Power BI',
        body: 'Power BI es la elección correcta para informes gobernados contra un almacén de datos empresarial, medidas DAX y actualización programada.',
      },
    ],
    faqs: [
      {
        q: '¿Debo usar ExcelInsight o Power BI?',
        a: 'Para paneles ad hoc rápidos a partir de archivos Excel, ExcelInsight encaja perfectamente. Para informes empresariales gobernados, Power BI está diseñado para eso.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },

  'tableau-alternative': {
    h1: 'Herramienta gratuita de paneles Excel para flujos de trabajo con hojas de cálculo',
    intro:
      'Tableau es potente, pero tiene una curva de aprendizaje pronunciada y costes de licencia recurrentes. Si solo necesitas convertir un archivo Excel o CSV en un panel limpio de forma rápida, ExcelInsight es una alternativa ligera y gratuita — sin instalación, sin registro, sin subida a un servidor.',
    sections: [
      {
        heading: 'Diseñado para flujos de trabajo distintos',
        body: 'ExcelInsight se centra en lo que la mayoría de los usuarios de hojas de cálculo necesitan: gráficos limpios, mosaicos de KPI, diseño de arrastrar y soltar y exportación a PDF con un clic.',
      },
      {
        heading: 'El mejor ajuste',
        body: 'ExcelInsight es la alternativa correcta para analistas, fundadores, estudiantes, consultores y equipos de operaciones que viven en hojas de cálculo.',
      },
    ],
    faqs: [
      {
        q: '¿Es ExcelInsight realmente gratuito o es freemium?',
        a: 'Completamente gratuito. Sin nivel de pago, sin muro de registro, sin avisos de mejora.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },

  'best-excel-dashboard-tool': {
    h1: 'La mejor herramienta de paneles Excel en 2026',
    intro:
      'Hay docenas de herramientas de paneles Excel — desde los gráficos dinámicos nativos de Excel hasta Tableau, Power BI, Looker Studio, Datawrapper y Flourish. Aquí tienes una guía con opinión propia.',
    sections: [
      {
        heading: 'La lista corta',
        body: 'Elige según tu caso de uso, no por la marca.',
        bullets: [
          'ExcelInsight — paneles privados y rápidos a partir de un único archivo Excel o CSV',
          'Power BI — informes empresariales gobernados',
          'Tableau — BI exploratorio profundo',
          'Looker Studio — paneles gratuitos sobre datos de Google',
          'Datawrapper — gráficos individuales con un diseño impecable',
        ],
      },
      {
        heading: 'Cuándo elegir ExcelInsight',
        body: 'Si tus datos viven en una hoja de cálculo y quieres un panel hoy mismo sin instalar software ni enviar archivos a un servidor, ExcelInsight es el camino más rápido.',
      },
    ],
    faqs: [
      {
        q: '¿Cuál es la herramienta de paneles Excel más sencilla?',
        a: 'Para un único archivo Excel, ExcelInsight — abre la URL, suelta el archivo y obtén un panel.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },


  'line-chart-maker': {
    h1: 'Creador de gráficos de líneas gratuito y online',
    intro:
      'ExcelInsight es un creador de gráficos de líneas gratuito diseñado para series temporales y análisis de tendencias. Sube un archivo con una columna de fecha y columnas numéricas, y ExcelInsight dibuja un gráfico de líneas suave y multiserie.',
    sections: [
      {
        heading: 'Diseñado para datos de series temporales',
        body: 'ExcelInsight detecta columnas de fecha automáticamente y las usa como eje X. Representa ingresos a lo largo del tiempo, usuarios activos diarios o tasas de error.',
      },
      {
        heading: 'Compara múltiples series a la vez',
        body: 'Añade varias columnas numéricas para comparar tendencias en paralelo — ingresos mensuales por región o registros diarios por canal.',
      },
    ],
    faqs: [
      {
        q: '¿Qué formatos de fecha son compatibles?',
        a: 'ISO 8601, fechas seriales de Excel, MM/DD/AAAA, DD/MM/AAAA y la mayoría de sus variantes.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },



  'area-chart-maker': {
    h1: 'Creador de gráficos de área gratuito y online',
    intro:
      'ExcelInsight es un creador de gráficos de área gratuito. Combina una columna de fecha y columnas numéricas para dibujar gráficos de área multiserie rellenos que resaltan la magnitud de una tendencia.',
    sections: [
      {
        heading: 'Área frente a línea — cuándo elegir cada uno',
        body: 'Usa un gráfico de área cuando el volumen bajo la curva es significativo — ingresos totales acumulados, registros acumulativos, descargas totales.',
      },
      {
        heading: 'Cambia de tipo con un clic',
        body: 'Crea un gráfico como línea y luego cámbialo a área — sin volver a subir el archivo ni volver a vincular las columnas.',
      },
    ],
    faqs: [
      {
        q: '¿Puedo apilar múltiples series?',
        a: 'Los gráficos de área multiserie se superponen con rellenos semitransparentes hoy en día. Las áreas verdaderamente apiladas están en la hoja de ruta.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },


  'inventory-dashboard-template': {
    h1: 'Plantilla gratuita de panel de inventario',
    intro:
      'ExcelInsight convierte cualquier hoja de cálculo de inventario o existencias en un panel de inventario en segundos. Sube tu lista de SKU y ExcelInsight genera automáticamente vistas para el stock disponible, los principales SKU, alertas de bajo stock y desgloses por categoría.',
    sections: [
      {
        heading: 'Qué se genera automáticamente',
        body: 'ExcelInsight busca columnas de SKU, Producto, Cantidad, Punto de Reorden, Categoría y Almacén, y luego construye las vistas más útiles para los equipos de inventario.',
        bullets: [
          'Cantidad disponible por categoría — gráfico de barras',
          'Principales SKU por cantidad o valor',
          'Detección de bajo stock',
          'Mosaico de calidad de datos para datos faltantes',
        ],
      },
      {
        heading: 'Adecuado para',
        body: 'Operadores de comercio electrónico, pequeños almacenes, tiendas minoristas y analistas de cadena de suministro que gestionan el stock en Excel.',
      },
    ],
    faqs: [
      {
        q: '¿Puedo hacer seguimiento de los movimientos de stock a lo largo del tiempo?',
        a: 'Si tu archivo incluye una columna de fecha con instantáneas de stock, ExcelInsight dibuja un gráfico de líneas automáticamente.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },

  'hr-dashboard-template': {
    h1: 'Plantilla gratuita de panel de RRHH',
    intro:
      'ExcelInsight crea un panel de RRHH a partir de cualquier hoja de cálculo de empleados. Suelta un archivo con columnas de plantilla, departamento, fecha de incorporación y rotación, y ExcelInsight monta las vistas — todo en tu navegador.',
    sections: [
      {
        heading: 'Por qué los equipos de RRHH eligen una herramienta privada',
        body: 'Los datos de RRHH son sensibles. ExcelInsight es una opción sólida porque nada sale de tu navegador — sin revisión de TI, sin DPA, sin preocupación por TI en la sombra.',
      },
      {
        heading: 'Qué incluye el panel de RRHH',
        body: 'Plantilla por departamento y ubicación, distribución de antigüedad, rotación por trimestre y cualquier KPI personalizado que construyas.',
      },
    ],
    faqs: [
      {
        q: '¿Es seguro ExcelInsight para datos confidenciales de RRHH?',
        a: 'Sí. Todo el procesamiento es en el lado del cliente. Tu hoja de cálculo nunca sale de tu portátil.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },

  'finance-reporting-dashboard': {
    h1: 'Panel gratuito de informes financieros',
    intro:
      'ExcelInsight proporciona a los equipos financieros un panel limpio y presentable en segundos. Sube tu P&L mensual, presupuesto frente a real, flujo de caja o Excel de antigüedad de cuentas a cobrar, y ExcelInsight lo convierte en gráficos con tema e informes listos para PDF.',
    sections: [
      {
        heading: 'Diseñado para el ciclo mensual de informes',
        body: 'Los paneles financieros viven y mueren por el ciclo de cierre mensual. Sube el último archivo, actualiza el panel, exporta el PDF. Sin fórmulas que mantener, sin plantillas rotas.',
      },
      {
        heading: 'Una privacidad que puedes defender',
        body: 'Los datos financieros no deberían subirse a ninguna herramienta web aleatoria. ExcelInsight es completamente en el lado del cliente — tu P&L permanece en tu máquina.',
      },
    ],
    faqs: [
      {
        q: '¿Puedo informar sobre presupuesto frente a real?',
        a: 'Sí. Incluye columnas de presupuesto y real y ExcelInsight dibuja un gráfico de barras o líneas multiserie.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },

  'ecommerce-analytics-dashboard': {
    h1: 'Panel de analítica de comercio electrónico',
    intro:
      'ExcelInsight convierte cualquier exportación de Shopify, WooCommerce, Amazon o Etsy en un panel de analítica de comercio electrónico en segundos. Ingresos a lo largo del tiempo, principales SKU, tendencia del AOV, combinación de fuentes de tráfico y tasa de devoluciones.',
    sections: [
      {
        heading: 'Diseñado para operadores de tienda',
        body: 'La mayoría de los paneles de comercio electrónico en herramientas de BI son excesivos. ExcelInsight tiene el tamaño adecuado — suficientemente rápido para uso semanal, suficientemente privado para tu portátil, gratuito para siempre.',
      },
      {
        heading: 'Compatible con las exportaciones de todas las plataformas principales',
        body: 'CSV de Shopify, WooCommerce, Amazon Seller Central, Etsy — cualquier plataforma que exporte como Excel o CSV funciona con ExcelInsight.',
      },
    ],
    faqs: [
      {
        q: '¿Necesito limpiar mi exportación de Shopify?',
        a: 'No. ExcelInsight gestiona la exportación bruta, detecta las columnas relevantes y construye un panel automáticamente.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },



  'marketing-analytics-dashboard': {
    h1: 'Panel de analítica de marketing',
    intro:
      'ExcelInsight es la forma más rápida de convertir una exportación de GA4, Google Ads, Meta Ads, HubSpot o cualquier herramienta de marketing en un panel de analítica de marketing. Combinación de canales, ROI por campaña, embudo de conversión, desglose por fuente de leads.',
    sections: [
      {
        heading: 'Un panel para todos los canales',
        body: 'La mayoría de los equipos de marketing exportan informes por canal a Excel. ExcelInsight te permite convertir cada exportación en un panel limpio — sin necesidad de conectar todo en Looker Studio.',
      },
      {
        heading: 'Privacidad e información personal',
        body: 'Los datos de leads y clientes no deberían enviarse a ninguna herramienta de terceros aleatoria. Como ExcelInsight funciona en el lado del cliente, tus listas de leads permanecen en tu portátil.',
      },
    ],
    faqs: [
      {
        q: '¿Puede ExcelInsight obtener datos en tiempo real de Google Analytics?',
        a: 'No — ExcelInsight está basado en archivos y funciona en el lado del cliente. Exporta tu informe de GA4 a CSV y súbelo.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },

  'analyse-excel-data': {
    h1: 'Herramienta gratuita de análisis de datos Excel',
    intro:
      'ExcelInsight es una herramienta gratuita para analizar datos de Excel. Sube tu hoja de cálculo y ExcelInsight realizará automáticamente un análisis profundo de los datos, detectará tipos de datos y sugerirá gráficos informativos.',
    sections: [
      {
        heading: 'Analiza tus datos de Excel al instante',
        body: 'Sin fórmulas complicadas, sin Power Query, sin tablas dinámicas. ExcelInsight identifica distribuciones numéricas, las principales categorías y los valores faltantes en cuestión de segundos.',
        bullets: [
          'Detección y tipado automático de columnas',
          'Estadísticas descriptivas instantáneas y comprobaciones de calidad de datos',
          'Encuentra valores repetidos y atípicos rápidamente',
        ],
      },
      {
        heading: 'Análisis de Excel basado en el navegador',
        body: 'Realiza análisis de datos complejos completamente en tu navegador. Nada sale de tu dispositivo, por lo que puedes analizar de forma segura archivos confidenciales.',
      },
    ],
    faqs: [
      {
        q: '¿Necesito conocimientos de análisis de datos?',
        a: 'No. ExcelInsight genera automáticamente gráficos e información basada en la forma de tus datos — perfecto para principiantes.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },




  'csv-dashboard': {
    h1: 'Creador gratuito de paneles CSV online',
    intro:
      '¿Necesitas visualizar valores separados por comas? ExcelInsight es una herramienta de paneles CSV rápida y gratuita. Construye un panel CSV interactivo directamente en tu navegador sin subir tus datos confidenciales a la nube.',
    sections: [
      {
        heading: 'De texto plano a elementos visuales enriquecidos',
        body: 'Un archivo CSV es solo texto plano, pero con nuestra herramienta de panel CSV, se transforma en un informe visual completo. Arrastra y suelta mosaicos, explora valores repetidos y analiza tendencias sin esfuerzo.',
        bullets: [
          'Analiza archivos CSV estándar y desordenados a la perfección',
          'Genera KPI y gráficos automáticamente',
          'Filtra datos de forma interactiva en todo el panel',
        ],
      },
      {
        heading: 'No requiere código',
        body: 'No necesitas saber Python o Pandas para analizar un archivo CSV. Solo suéltalo en ExcelInsight y deja que el perfilado automático de columnas haga el trabajo pesado por ti.',
      },
    ],
    faqs: [
      {
        q: '¿Puedo construir un panel directamente desde un CSV?',
        a: 'Sí, simplemente sube tu archivo CSV y ExcelInsight construirá automáticamente un panel con gráficos, métricas e información basada en tus datos.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },


  'excel-data-insights': {
    h1: 'Insights automatizados de datos de Excel',
    intro:
      'Desbloquea potentes insights de datos de excel con ExcelInsight. Esta herramienta gratuita perfila automáticamente tus hojas de cálculo para ofrecer la información profunda que necesitan los usuarios de Excel, desde la detección de anomalías hasta el resumen de tendencias clave.',
    sections: [
      {
        heading: 'Descubre patrones ocultos',
        body: 'No necesitas ser un científico de datos para obtener información inteligente de tus datos. ExcelInsight escanea tus columnas, identificando valores repetidos, datos faltantes y correlaciones automáticamente.',
        bullets: [
          'Perfilado automático de columnas y estadísticas',
          'Resalta valores faltantes y problemas de calidad de los datos',
          'Sugerencias inteligentes de gráficos basados en tipos de datos',
        ],
      },
      {
        heading: 'Inteligencia de datos al instante',
        body: 'Obtén inteligencia accionable de inmediato. La herramienta proporciona un resumen visual limpio de tu conjunto de datos para que puedas tomar decisiones informadas sin escribir una sola fórmula de Excel.',
      },
    ],
    faqs: [
      {
        q: '¿Qué tipo de insights de datos proporciona la herramienta?',
        a: 'ExcelInsight proporciona estadísticas de columnas, identifica valores categóricos repetidos, marca datos faltantes y sugiere los gráficos más relevantes para tu conjunto de datos.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },


  'free-excel-data-analysis-tool': {
    h1: 'Herramienta de análisis de datos de Excel online gratuita',
    intro:
      'Utiliza nuestra herramienta de análisis de datos de excel online gratuita para explorar y visualizar tus hojas de cálculo al instante. Sin fórmulas, sin código, totalmente seguro.',
    sections: [
      {
        heading: 'Analiza datos sin la complejidad',
        body: 'Deja de pelear con tablas dinámicas. Nuestra herramienta automatiza el proceso de análisis identificando tipos de datos y generando resúmenes estadísticos completos y gráficos visuales automáticamente.',
        bullets: [
          'Estadísticas descriptivas al instante',
          'Detección automatizada de tendencias y correlaciones',
          'Interfaz visual fácil de usar',
        ],
      },
      {
        heading: 'Diseñado para la velocidad y la privacidad',
        body: 'Como se ejecuta completamente en tu navegador, esta herramienta de análisis procesa archivos al instante sin subidas al servidor. Analiza datos financieros o de RRHH confidenciales con total tranquilidad.',
      },
    ],
    faqs: [
      {
        q: '¿Necesito instalar algún software para el análisis de datos?',
        a: 'No, esta es una herramienta basada en la web. Funciona directamente en tu navegador en cualquier sistema operativo sin necesidad de descargas o instalaciones.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },

  'excel-statistics-tool': {
    h1: 'Herramienta de estadísticas de Excel online',
    intro:
      'ExcelInsight sirve como una sólida herramienta de estadísticas de excel, permitiéndote leer estadísticas de negocios usando excel online de forma gratuita. Obtén resúmenes estadísticos inmediatos y analítica descriptiva directamente en tu navegador.',
    sections: [
      {
        heading: 'Estadísticas descriptivas al instante',
        body: 'Comprender la distribución de tus datos es fundamental. ExcelInsight calcula mínimos, máximos, promedios e identifica valores atípicos automáticamente para cada columna numérica en tu archivo.',
        bullets: [
          'Estadísticas de resumen automatizadas',
          'Detección de valores atípicos y comprobación de la calidad de los datos',
          'Distribuciones visuales mediante histogramas y diagramas de caja',
        ],
      },
      {
        heading: 'Perfecto para análisis de negocios',
        body: 'Ya sea que estés analizando el rendimiento de ventas o la eficiencia operativa, esta herramienta te ofrece la base estadística que necesitas para tomar decisiones basadas en datos de manera rápida y precisa.',
      },
    ],
    faqs: [
      {
        q: '¿Puede esta herramienta reemplazar las Herramientas de análisis de Excel?',
        a: 'Para estadísticas descriptivas básicas, distribuciones y visuales de correlación, ExcelInsight proporciona una alternativa más rápida y fácil de usar a los complementos tradicionales de Excel.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },




  'excel-link-analysis': {
    h1: 'Análisis de enlaces en Excel',
    intro:
      'Descubre conexiones ocultas con nuestra herramienta de análisis de enlaces en excel gratis. ExcelInsight te permite explorar relaciones de datos y conexiones de entidades a través de tu conjunto de datos de forma visual, directamente en tu navegador.',
    sections: [
      {
        heading: 'Explora relaciones de datos',
        body: 'Comprender cómo se relacionan entre sí las diferentes entidades en tus datos es crucial. Aunque no es una herramienta de gráficos de red, ExcelInsight te ayuda a realizar análisis relacional destacando conexiones categóricas repetidas y correlacionando variables.',
        bullets: [
          'Identifica atributos comunes a través de segmentos de datos',
          'Utiliza diagramas de dispersión para encontrar correlaciones de variables',
          'Filtra de forma interactiva para rastrear las relaciones entre entidades',
        ],
      },
      {
        heading: 'Un enfoque visual de las conexiones',
        body: 'Mediante el filtrado cruzado de gráficos y el examen de información de valores repetidos, puedes descubrir patrones y relaciones que serían imposibles de detectar en una cuadrícula de filas de una hoja de cálculo.',
      },
    ],
    faqs: [
      {
        q: '¿Esta herramienta genera gráficos de red de nodo-enlace?',
        a: 'No, se centra en el análisis de datos relacionales a través de filtrado cruzado, correlaciones y desgloses categóricos en lugar de gráficos de topología de red especializados.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },


  'excel-data-visualizer': {
    h1: 'Visualizador de datos de Excel gratuito',
    intro:
      'Experimenta una visualización de datos de excel fluida con ExcelInsight. Esta herramienta de visualización online gratuita convierte automáticamente tus filas y columnas sin procesar en un panel visual interactivo y completo.',
    sections: [
      {
        heading: 'Visualización automatizada',
        body: 'No necesitas elegir qué gráfico se adapta mejor a tus datos. El visualizador de datos de excel perfila tu hoja de cálculo y selecciona automáticamente los gráficos óptimos, ya sea de barras, líneas, circular o de dispersión.',
        bullets: [
          'Recomendaciones de gráficos inteligentes basadas en los tipos de columna',
          'Visualizaciones interactivas y adaptables',
          'Disposición de paneles de arrastrar y soltar',
        ],
      },
      {
        heading: 'Exporta tus visualizaciones',
        body: 'Después de explorar tus datos visualmente, puedes exportar el panel completo como un informe limpio en PDF de varias páginas para compartir ideas fácilmente con tu equipo o stakeholders.',
      },
    ],
    faqs: [
      {
        q: '¿Es este visualizador de datos de uso gratuito?',
        a: 'Sí, ExcelInsight es completamente gratuito. No hay costes ocultos ni cuotas de suscripción para visualizar y exportar tus datos.',
      },
      {
        q: '¿Es gratuito ExcelInsight?',
        a: 'Sí. Completamente gratuito, sin registro.',
      },
      {
        q: '¿Son privados mis datos?',
        a: 'Sí. Todo se ejecuta en tu navegador.',
      },
    ],
  },
};
