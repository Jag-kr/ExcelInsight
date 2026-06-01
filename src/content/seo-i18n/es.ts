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

  'excel-chart-generator': {
    h1: 'Generador de gráficos Excel online',
    intro:
      'ExcelInsight es un generador de gráficos Excel gratuito. Sube un archivo .xlsx, .xls o .csv y obtén al instante gráficos de barras, líneas, circular, dispersión, área, radar y barras horizontales basados en las columnas que detecta. Cada gráfico es editable, personalizable en tema y exportable como PNG.',
    sections: [
      {
        heading: 'Siete tipos de gráfico disponibles desde el primer momento',
        body: 'ExcelInsight incluye un conjunto curado de tipos de gráfico que cubren el 90 % de las necesidades reales de informes. Cambia cualquier gráfico entre tipos con un solo clic.',
        bullets: [
          'Barras y barras horizontales — comparaciones entre categorías',
          'Líneas y áreas — tendencias a lo largo del tiempo',
          'Circular — proporción del total',
          'Dispersión — correlaciones entre dos columnas numéricas',
          'Radar — comparaciones de perfiles multidimensionales',
        ],
      },
      {
        heading: 'Con temas, exportable e integrable',
        body: 'Cada gráfico adopta uno de los varios temas de color integrados. Pasa el cursor para ver las etiquetas emergentes, haz clic en el icono de exportación para descargar un PNG, o añade el gráfico a un panel para un informe PDF combinado.',
      },
    ],
    faqs: [
      {
        q: '¿Puedo personalizar los colores del gráfico?',
        a: 'Sí. Cada gráfico dispone de un selector de temas con múltiples paletas curadas.',
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
        q: '¿Puedo crear un gráfico a partir de columnas específicas?',
        a: 'Sí. La pestaña Construir incluye un creador de gráficos manual.',
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
          'Funciona sin conexión una vez cargada la página',
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

  'bar-chart-maker': {
    h1: 'Creador de gráficos de barras gratuito y online',
    intro:
      'ExcelInsight es un creador de gráficos de barras gratuito. Sube un archivo Excel o CSV y ExcelInsight genera automáticamente gráficos de barras verticales u horizontales a partir de tus columnas categóricas y numéricas.',
    sections: [
      {
        heading: 'Cuándo usar un gráfico de barras',
        body: 'Los gráficos de barras son la elección correcta cuando necesitas comparar un valor numérico entre categorías — ventas por región, registros por fuente, defectos por equipo.',
      },
      {
        heading: 'Cómo ExcelInsight crea gráficos de barras',
        body: 'ExcelInsight detecta columnas categóricas y las combina con columnas numéricas para producir gráficos de barras. Créalos manualmente desde cualquier par de columnas en la pestaña Construir.',
        bullets: [
          'Orientación vertical y horizontal',
          'Gráficos de barras agrupadas multiserie',
          'Paletas de colores personalizables',
          'Exportación como PNG y PDF',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Puedo crear un gráfico de barras apiladas?',
        a: 'Los gráficos de barras agrupadas están disponibles hoy. Las barras apiladas están en la hoja de ruta.',
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

  'pie-chart-maker': {
    h1: 'Creador de gráficos circulares gratuito y online',
    intro:
      'ExcelInsight es un creador de gráficos circulares gratuito. Sube un archivo Excel o CSV y convierte cualquier columna categórica en un gráfico circular etiquetado y con tema de color.',
    sections: [
      {
        heading: 'Cuándo un gráfico circular es la opción correcta',
        body: 'Los gráficos circulares funcionan mejor con cinco categorías o menos para representar la proporción de un total — cuota de mercado, combinación de fuentes de tráfico, desglose de gastos.',
      },
      {
        heading: 'Valores predeterminados inteligentes',
        body: 'ExcelInsight ordena los sectores por tamaño, aplica una paleta de alto contraste y añade etiquetas de porcentaje automáticamente.',
      },
    ],
    faqs: [
      {
        q: '¿Puedo convertir un gráfico circular en un gráfico de anillo?',
        a: 'Las variantes circulares están en la hoja de ruta. Por ahora, cambia cualquier gráfico a barras, líneas o área con un clic.',
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

  'scatter-plot-generator': {
    h1: 'Generador de diagramas de dispersión gratuito y online',
    intro:
      'ExcelInsight es un generador de diagramas de dispersión gratuito. Elige dos columnas numéricas cualesquiera y ExcelInsight dibuja un gráfico de dispersión para detectar correlaciones, valores atípicos y agrupaciones — sin Python, sin R, sin notebooks.',
    sections: [
      {
        heading: 'Encuentra correlaciones en segundos',
        body: 'Los diagramas de dispersión son la forma más rápida de ver si dos variables se mueven juntas. ExcelInsight gestiona miles de puntos con etiquetas emergentes al pasar el cursor que muestran los valores exactos de X/Y.',
      },
      {
        heading: 'Detecta valores atípicos y agrupaciones',
        body: 'Los valores atípicos destacan visualmente en un diagrama de dispersión. Usa los gráficos de dispersión de ExcelInsight como primer paso en cualquier investigación de anomalías.',
      },
    ],
    faqs: [
      {
        q: '¿Cuántos puntos puede gestionar un diagrama de dispersión?',
        a: 'Varios miles de puntos se renderizan con fluidez. A partir de unos 10 000, el rendimiento depende de tu dispositivo.',
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

  'sales-dashboard-template': {
    h1: 'Plantilla gratuita de panel de ventas',
    intro:
      'ExcelInsight te proporciona un panel de ventas funcional en el momento en que subes una hoja de cálculo de ventas — pipeline por etapa, ingresos a lo largo del tiempo, principales cuentas, rendimiento por representante y recuento de oportunidades.',
    sections: [
      {
        heading: 'Qué incluye el panel de ventas',
        body: 'ExcelInsight inspecciona las columnas y monta automáticamente las vistas más útiles para datos de ventas.',
        bullets: [
          'Ingresos o ARR a lo largo del tiempo como gráfico de líneas',
          'Pipeline por etapa como gráfico de barras horizontales',
          'Principales cuentas y propietarios clasificados',
          'Tasa de cierre y recuentos de oportunidades como mosaicos de KPI',
        ],
      },
      {
        heading: 'Cómo utilizarla',
        body: 'Exporta tu pipeline desde Salesforce, HubSpot, Pipedrive o Close como CSV. Suéltalo en ExcelInsight. Exporta a PDF y envíaselo a tu director de ventas.',
      },
    ],
    faqs: [
      {
        q: '¿Necesito formatear previamente mis datos de ventas?',
        a: 'No. ExcelInsight lee la exportación bruta de la mayoría de los CRM tal como está.',
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

  'startup-kpi-dashboard': {
    h1: 'Panel de KPI para startups',
    intro:
      'ExcelInsight es la forma más rápida de convertir una hoja de cálculo de métricas de startup en un panel de KPI listo para inversores. MRR, ARR, tasa de crecimiento, retención, burn, runway, número de clientes — suelta tu archivo de métricas semanal y el panel aparece.',
    sections: [
      {
        heading: 'Diseñado para revisiones semanales de métricas',
        body: 'Los fundadores y operadores hacen seguimiento de métricas en una hoja de cálculo. ExcelInsight le da a esa hoja de cálculo una cara pulida — la misma fuente de verdad, mucho mejor visualización, PDF instantáneo para las actualizaciones al consejo.',
      },
      {
        heading: 'Exportaciones listas para inversores',
        body: 'La exportación PDF te proporciona una portada limpia, un gráfico por página y el branding de ExcelInsight. Un artefacto utilizable para las actualizaciones mensuales a inversores.',
      },
    ],
    faqs: [
      {
        q: '¿Puedo actualizar el panel cada semana?',
        a: 'Sí. Añade las últimas filas, vuelve a subir y el panel se regenera con los datos más recientes.',
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

  'manufacturing-report-dashboard': {
    h1: 'Panel de informes de fabricación',
    intro:
      'ExcelInsight convierte las hojas de cálculo de líneas de producción en paneles de fabricación limpios. Rendimiento, tiempo de inactividad, tasa de defectos, desglose al estilo OEE, comparaciones de turnos — todo generado automáticamente.',
    sections: [
      {
        heading: 'Adaptado al entorno de planta',
        body: 'Los datos de fabricación suelen encontrarse en hojas Excel provenientes de sistemas MES o SCADA. ExcelInsight lee esas exportaciones y proporciona a los responsables de planta un panel sin necesitar que TI construya un informe en Power BI.',
      },
      {
        heading: 'Detecta defectos y valores atípicos rápidamente',
        body: 'Usa el gráfico de dispersión para representar el tiempo de ciclo frente a la tasa de defectos, el gráfico de barras para comparar el rendimiento por línea y el mosaico de calidad de datos para detectar lecturas faltantes.',
      },
    ],
    faqs: [
      {
        q: '¿Funciona sin conexión en un portátil de planta?',
        a: 'Tras la primera carga, la mayor parte de la funcionalidad funciona sin conexión a internet porque todo se ejecuta en el lado del cliente.',
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

  'plot-excel-data': {
    h1: 'Representa gráficamente datos de Excel online',
    intro:
      'ExcelInsight hace que sea increíblemente sencillo representar gráficamente datos de Excel online. Sube tu archivo y deja que ExcelInsight trace automáticamente gráficos de barras, gráficos de líneas y diagramas de dispersión — sin configuración de gráficos.',
    sections: [
      {
        heading: 'Traza gráficos sin ninguna fricción',
        body: 'ExcelInsight analiza tus columnas y las representa gráficamente de inmediato, permitiéndote alternar entre diferentes visualizaciones con un solo clic.',
        bullets: [
          'Traza gráficos de líneas para datos de series temporales',
          'Traza diagramas de dispersión para descubrir correlaciones',
          'Traza gráficos de barras y circulares para desgloses categóricos',
        ],
      },
      {
        heading: 'Exporta y comparte tus gráficos',
        body: 'Exporta gráficos individuales como PNG en alta resolución o todo el conjunto como un informe PDF de varias páginas.',
      },
    ],
    faqs: [
      {
        q: '¿Puedo representar gráficamente archivos CSV también?',
        a: 'Sí. ExcelInsight representa gráficamente tanto archivos Excel (.xlsx, .xls) como CSV.',
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
