export const frSeoUi = {
  categoryFeature: 'Fonctionnalités',
  categoryComparison: 'Comparaisons',
  categoryChart: 'Créateurs de graphiques',
  categoryTemplate: 'Modèles de tableau de bord',
  categoryUsecase: "Cas d'utilisation",
  seeItInAction: 'Voir en action',
  tryWithYourOwnFile: 'Essayez avec votre propre fichier',
  tryItDesc:
    "Sans inscription, sans téléchargement vers un serveur. Ouvrez ExcelInsight, déposez votre fichier Excel ou CSV et obtenez un tableau de bord en quelques secondes.",
  frequentlyAskedQuestions: 'Questions fréquemment posées',
  relatedTools: 'Outils associés',
  uploadSpreadsheetFree: 'Importez votre tableur — gratuit',
  feature: 'Fonctionnalité',
  comparisons: 'Comparaisons',
};

export const fr: Record<
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
    h1: 'Créateur de tableau de bord Excel gratuit en ligne',
    intro:
      "ExcelInsight est un créateur de tableaux de bord Excel gratuit qui transforme n'importe quel tableur en tableau de bord interactif en quelques secondes. Importez un fichier .xlsx ou .csv, choisissez vos graphiques et disposez-les sur une grille glisser-déposer — sans formules, sans tableaux croisés dynamiques, sans inscription.",
    primaryCta: 'Importez votre tableur — gratuit',
    sections: [
      {
        heading: "Créez un tableau de bord depuis n'importe quel fichier Excel ou CSV",
        body: "ExcelInsight analyse chaque colonne en détectant automatiquement les colonnes numériques, catégorielles, de dates et d'identifiants, puis suggère les graphiques les plus pertinents.",
        bullets: [
          'Tableau de bord généré automatiquement avec 3 à 4 graphiques les plus utiles',
          'Grille glisser-déposer avec tuiles petites, moyennes et grandes',
          'Tuiles de statistiques par colonne et de qualité des données',
          'Dupliquer, redimensionner ou supprimer en un clic',
        ],
      },
      {
        heading: "Pourquoi les équipes préfèrent ExcelInsight aux tableaux de bord natifs d'Excel",
        body: "Les tableaux de bord natifs Excel nécessitent des tableaux croisés dynamiques, des segments et de nombreuses manipulations. ExcelInsight offre les mêmes fonctionnalités sur une seule page web s'exécutant côté client — utilisable sur des ordinateurs verrouillés sans Power BI ni Tableau.",
        bullets: [
          "Aucune installation, aucune licence, aucune autorisation d'administrateur",
          'Windows, macOS, Linux, iPad, Chromebook',
          "Les fichiers ne quittent jamais votre appareil",
          'Export PDF multi-pages ou PNG par graphique',
        ],
      },
    ],
    faqs: [
      {
        q: "Puis-je modifier le tableau après le chargement ?",
        a: "Oui — redimensionnez, dupliquez, supprimez et changez le type de graphique directement depuis l'interface.",
      },
      {
        q: 'Quelle taille de fichier est supportée ?',
        a: "Les fichiers allant jusqu'à ~100 000 lignes fonctionnent de manière fluide.",
      },
      { q: "Est-ce gratuit ?", a: "Oui, complètement gratuit." },
      {
        q: "Mes données sont-elles privées ?",
        a: "Oui — tout est traité dans le navigateur, rien n'est envoyé à un serveur.",
      },
      {
        q: "Puis-je exporter ?",
        a: "Oui — PDF multi-pages ou PNG par graphique.",
      },
    ],
  },

  'csv-visualization-tool': {
    h1: 'Outil de visualisation CSV gratuit en ligne',
    intro:
      "ExcelInsight est un outil de visualisation CSV gratuit qui transforme les fichiers à valeurs séparées par des virgules en tableaux de bord interactifs. Déposez un fichier .csv issu de votre base de données, CRM ou back-end : ExcelInsight analyse chaque colonne, suggère des graphiques et vous permet de créer un tableau de bord personnalisé.",
    sections: [
      {
        heading: "Ouvrez et visualisez n'importe quel CSV",
        body: "Gère les CSV standard, avec guillemets et irréguliers. Les colonnes numériques deviennent des histogrammes, les colonnes catégorielles des répartitions, les colonnes de dates des séries temporelles.",
        bullets: [
          'Supporte csv, xlsx, xls et les fichiers multi-feuilles',
          'Détection automatique des types de colonnes',
          "Insights intelligents et indicateurs de qualité des données",
          'Filtres de lignes en temps réel',
        ],
      },
      {
        heading: "Conçu pour les ingénieurs, les analystes et les opérateurs",
        body: "Plus besoin de Python, pandas ou Jupyter pour une analyse exploratoire rapide — tout se passe directement dans le navigateur.",
      },
    ],
    faqs: [
      {
        q: "Les virgules dans les guillemets sont-elles gérées ?",
        a: "Oui, conformément à la norme RFC 4180.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      {
        q: "Mes données sont-elles privées ?",
        a: "Oui — traitement entièrement côté client.",
      },
      {
        q: "Puis-je visualiser sans envoyer de données à un serveur ?",
        a: "Oui — ExcelInsight fonctionne entièrement côté client.",
      },
    ],
  },

  'excel-chart-generator': {
    h1: "Générateur de graphiques Excel en ligne",
    intro:
      "ExcelInsight est un générateur de graphiques Excel gratuit. Importez un fichier xlsx, xls ou csv et obtenez instantanément des graphiques à barres, en courbes, en secteurs, en nuage de points, en aires, en radar et à barres horizontales. Modifiables, thématisables et exportables en PNG.",
    sections: [
      {
        heading: "Sept types de graphiques pour 90 % des besoins de reporting",
        body: "Changez de type de graphique en un seul clic sans reconfigurer quoi que ce soit.",
        bullets: [
          'Barres verticales et horizontales',
          'Courbes et aires',
          'Secteurs (camembert)',
          'Nuages de points',
          'Radar',
        ],
      },
      {
        heading: "Thématisables, exportables et intégrables",
        body: "Thèmes de couleurs intégrés, info-bulles interactives, export PNG par graphique et export du tableau de bord complet en PDF.",
      },
    ],
    faqs: [
      {
        q: "Puis-je personnaliser les couleurs ?",
        a: "Oui — via le sélecteur de thème.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
      {
        q: "Puis-je construire un graphique à partir de colonnes spécifiques ?",
        a: "Oui — utilisez l'onglet Construire pour sélectionner les colonnes souhaitées.",
      },
    ],
  },

  'excel-report-builder': {
    h1: "Générateur de rapports Excel en ligne",
    intro:
      "ExcelInsight est un générateur de rapports Excel gratuit. Importez votre tableur, organisez graphiques et insights, puis exportez un PDF soigné de plusieurs pages avec page de couverture, métadonnées et un graphique par section.",
    sections: [
      {
        heading: "Du tableur au rapport en trois clics",
        body: "Fini de copier-coller des graphiques dans Word ou Google Docs. Exportez en PDF pour obtenir un document présentable à vos parties prenantes.",
        bullets: [
          'Page de couverture générée automatiquement',
          'Un graphique par page',
          "Tuiles d'insights",
          'Fonctionne hors ligne',
        ],
      },
      {
        heading: "Conçu pour les rapports récurrents",
        body: "Idéal pour les rapports de ventes hebdomadaires, les KPI mensuels et les bilans trimestriels pour le conseil d'administration.",
      },
    ],
    faqs: [
      {
        q: "Que contient le PDF ?",
        a: "Une page de couverture suivie d'une page par élément du tableau de bord.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
      {
        q: "Puis-je ajouter un logo ?",
        a: "Cette fonctionnalité est sur la feuille de route.",
      },
    ],
  },

  'excel-to-pdf-dashboard': {
    h1: "Convertisseur Excel vers tableau de bord PDF",
    intro:
      "ExcelInsight convertit les fichiers Excel et CSV en un tableau de bord PDF propre et exportable. Importez votre fichier, laissez ExcelInsight sélectionner les graphiques appropriés, puis exportez-le en un seul PDF à partager par e-mail ou Slack.",
    sections: [
      {
        heading: "Un vrai tableau de bord, pas un simple export de graphiques",
        body: "ExcelInsight génère un tableau de bord complet avec tuiles KPI, insights intelligents et graphiques thématisés, puis exporte le tout en PDF.",
      },
      {
        heading: "Privé par conception",
        body: "Rien n'est envoyé à un serveur. Le PDF est généré dans le navigateur à l'aide de jsPDF.",
      },
    ],
    faqs: [
      {
        q: "Comment le PDF est-il généré ?",
        a: "Par rendu canvas et assemblage jsPDF — aucun serveur impliqué.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'excelinsight-vs-tableau': {
    h1: "ExcelInsight et Tableau : conçus pour des workflows différents",
    intro:
      "ExcelInsight et Tableau aident tous deux les utilisateurs à exploiter leurs données, mais ils sont conçus pour des flux de travail très différents. ExcelInsight se concentre sur l'analyse rapide de tableurs dans le navigateur ; Tableau est conçu pour la BI à l'échelle entreprise.",
    sections: [
      {
        heading: "Où ExcelInsight s'intègre naturellement",
        body: "Créez un tableau de bord depuis un seul fichier exporté en PDF, directement dans votre navigateur.",
        bullets: [
          'Zéro installation',
          '100 % côté client',
          'Export PDF en un clic',
        ],
      },
      {
        heading: "Où Tableau excelle",
        body: "Connexions en direct aux bases de données, tableaux de bord gouvernés par la DSI, sécurité au niveau des lignes et partage à l'échelle de l'entreprise.",
      },
    ],
    faqs: [
      {
        q: "ExcelInsight est-il similaire à Tableau ?",
        a: "Il couvre des cas d'usage similaires, mais pour des workflows très différents.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'excelinsight-vs-powerbi': {
    h1: "ExcelInsight et Power BI : comparaison des workflows tableur",
    intro:
      "Les deux outils créent des tableaux de bord, mais pour des workflows différents. ExcelInsight est conçu pour l'analyse rapide de fichiers individuels dans le navigateur ; Power BI est destiné au reporting d'entreprise avec connexions aux bases de données.",
    sections: [
      {
        heading: "Où ExcelInsight est le bon choix",
        body: "Obtenez un tableau de bord dès aujourd'hui — sans installation ni inscription, depuis n'importe quel navigateur.",
      },
      {
        heading: "Où Power BI excelle",
        body: "Reporting gouverné sur un entrepôt de données, modélisation DAX et actualisations planifiées à l'échelle de l'entreprise.",
      },
    ],
    faqs: [
      {
        q: "ExcelInsight ou Power BI ?",
        a: "Tableaux de bord ad hoc → ExcelInsight. Reporting gouverné → Power BI.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'tableau-alternative': {
    h1: "Outil gratuit de tableau de bord Excel pour les workflows tableur",
    intro:
      "Tableau implique une courbe d'apprentissage élevée et des coûts de licence récurrents. Pour transformer rapidement un fichier Excel ou CSV en tableau de bord, ExcelInsight est une alternative légère et entièrement gratuite.",
    sections: [
      {
        heading: "Conçu pour des workflows différents",
        body: "ExcelInsight répond aux besoins de la majorité des utilisateurs : graphiques, tuiles KPI, glisser-déposer et export PDF.",
      },
      {
        heading: "Pour qui c'est le meilleur choix",
        body: "Analystes, fondateurs, étudiants, consultants et équipes opérationnelles qui travaillent avec des fichiers Excel ou CSV.",
      },
    ],
    faqs: [
      {
        q: "Est-ce vraiment gratuit ?",
        a: "Complètement gratuit — aucun abonnement payant.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'best-excel-dashboard-tool': {
    h1: "Meilleur outil de tableau de bord Excel en 2026",
    intro:
      "Des dizaines d'outils existent — d'Excel natif à Tableau, Power BI, Looker Studio, Datawrapper et Flourish. Voici un guide opinioné pour choisir le bon.",
    sections: [
      {
        heading: "La liste courte : choisissez selon votre cas d'usage",
        body: "Chaque outil a ses forces. Voici un résumé rapide :",
        bullets: [
          'ExcelInsight — tableaux de bord rapides et privés depuis un fichier unique',
          "Power BI — reporting gouverné à l'échelle entreprise",
          'Tableau — BI exploratoire avancée',
          'Looker Studio — gratuit, connecté aux données Google',
          'Datawrapper — graphiques soignés pour la publication',
        ],
      },
      {
        heading: "Quand choisir ExcelInsight",
        body: "Vos données sont dans un tableur et vous avez besoin d'un tableau de bord aujourd'hui, sans installer de logiciel ni obtenir d'autorisation.",
      },
    ],
    faqs: [
      {
        q: "Quel est l'outil le plus simple pour un fichier Excel unique ?",
        a: "ExcelInsight — aucune configuration requise.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'bar-chart-maker': {
    h1: "Créateur de graphiques à barres gratuit en ligne",
    intro:
      "ExcelInsight est un créateur de graphiques à barres gratuit. Importez un fichier Excel ou CSV et obtenez automatiquement des graphiques à barres verticales ou horizontales.",
    sections: [
      {
        heading: "Quand utiliser un graphique à barres",
        body: "Comparez une valeur numérique entre plusieurs catégories — par exemple les ventes par région ou les inscriptions par source.",
      },
      {
        heading: "Comment ExcelInsight construit les graphiques à barres",
        body: "ExcelInsight détecte les colonnes catégorielles et les associe automatiquement aux colonnes numériques correspondantes.",
        bullets: [
          'Barres verticales et horizontales',
          'Multi-séries groupées',
          'Palettes de couleurs personnalisables',
          'Export PNG et PDF',
        ],
      },
    ],
    faqs: [
      {
        q: "Les graphiques à barres empilées sont-ils disponibles ?",
        a: "Les barres groupées sont disponibles ; les barres empilées sont en cours de développement.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'line-chart-maker': {
    h1: "Créateur de graphiques linéaires gratuit en ligne",
    intro:
      "ExcelInsight est un créateur de graphiques linéaires gratuit pour l'analyse de séries temporelles. Importez un fichier contenant une colonne de dates et des colonnes numériques et obtenez un graphique multi-séries fluide.",
    sections: [
      {
        heading: "Conçu pour les données temporelles",
        body: "ExcelInsight détecte automatiquement les colonnes de dates et les aligne en axe temporel pour un graphique linéaire prêt à l'emploi.",
      },
      {
        heading: "Comparez plusieurs séries",
        body: "Visualisez par exemple les revenus mensuels par région ou les inscriptions quotidiennes par canal, sur un même graphique multi-séries.",
      },
    ],
    faqs: [
      {
        q: "Quels formats de date sont supportés ?",
        a: "ISO 8601, dates Excel, MM/JJ/AAAA et JJ/MM/AAAA.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'pie-chart-maker': {
    h1: "Créateur de graphiques en secteurs gratuit en ligne",
    intro:
      "ExcelInsight est un créateur de camemberts gratuit. Transformez n'importe quelle colonne catégorielle en camembert étiqueté montrant la part de chaque catégorie dans le total.",
    sections: [
      {
        heading: "Quand un camembert est le bon choix",
        body: "Idéal pour cinq catégories ou moins, lorsque l'objectif est de communiquer la part relative de chaque segment dans un tout.",
      },
      {
        heading: "Valeurs par défaut intelligentes",
        body: "Les tranches sont triées par taille, la palette est contrastée et les étiquettes en pourcentage sont générées automatiquement.",
      },
    ],
    faqs: [
      {
        q: "Puis-je passer en mode donut ?",
        a: "En cours de développement — vous pouvez actuellement basculer vers barre, courbe ou aire.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'scatter-plot-generator': {
    h1: "Générateur de nuages de points gratuit en ligne",
    intro:
      "ExcelInsight est un générateur de nuages de points gratuit. Choisissez deux colonnes numériques et ExcelInsight trace un graphique pour repérer les corrélations, les valeurs aberrantes et les clusters — sans Python, sans R.",
    sections: [
      {
        heading: "Trouvez des corrélations en quelques secondes",
        body: "Gère des milliers de points avec des info-bulles précises pour chaque observation.",
      },
      {
        heading: "Repérez les valeurs aberrantes d'un coup d'œil",
        body: "Les anomalies ressortent immédiatement à la visualisation, sans traitement préalable.",
      },
    ],
    faqs: [
      {
        q: "Combien de points peut-on tracer ?",
        a: "Plusieurs milliers de points s'affichent de manière fluide ; au-delà de ~10 000, les performances dépendent de l'appareil utilisé.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'area-chart-maker': {
    h1: "Créateur de graphiques en aires gratuit en ligne",
    intro:
      "ExcelInsight est un créateur de graphiques en aires gratuit. Combinez une colonne de dates et des colonnes numériques pour tracer des graphiques multi-séries en aires remplies, mettant en valeur l'amplitude d'une tendance dans le temps.",
    sections: [
      {
        heading: "Aire ou courbe — comment choisir",
        body: "Préférez le graphique en aires lorsque le volume sous la courbe est significatif et qu'il apporte une information supplémentaire à la tendance.",
      },
      {
        heading: "Changez de type de graphique en un clic",
        body: "Construisez votre visualisation en mode courbe, puis basculez en aires en un seul clic pour tester le rendu.",
      },
    ],
    faqs: [
      {
        q: "Puis-je empiler plusieurs séries ?",
        a: "Le chevauchement semi-transparent est disponible aujourd'hui ; les aires empilées sont en cours de développement.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'sales-dashboard-template': {
    h1: "Modèle gratuit de tableau de bord commercial",
    intro:
      "ExcelInsight génère un tableau de bord commercial opérationnel dès l'importation — pipeline par étape, revenus dans le temps, top comptes et performances par commercial.",
    sections: [
      {
        heading: "Ce qu'inclut le tableau de bord",
        body: "ExcelInsight analyse automatiquement les colonnes Étape, Montant, Propriétaire, Compte, Date de clôture et ARR.",
        bullets: [
          'Revenus et ARR dans le temps',
          'Pipeline par étape de vente',
          'Top comptes et commerciaux',
          'Taux de gain et volume de deals',
        ],
      },
      {
        heading: "Comment l'utiliser",
        body: "Exportez votre pipeline depuis Salesforce, HubSpot, Pipedrive ou Close en CSV, importez dans ExcelInsight, ajustez si nécessaire, exportez en PDF et partagez.",
      },
    ],
    faqs: [
      {
        q: "Dois-je pré-formater mes données commerciales ?",
        a: "Non — ExcelInsight lit les exports CRM bruts sans transformation préalable.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'inventory-dashboard-template': {
    h1: "Modèle gratuit de tableau de bord inventaire",
    intro:
      "ExcelInsight transforme tout tableur de stock en tableau de bord d'inventaire. Importez votre liste de SKU et obtenez des vues sur le stock disponible, les top SKU et les alertes de rupture.",
    sections: [
      {
        heading: "Ce qui est généré automatiquement",
        body: "ExcelInsight recherche les colonnes SKU, Produit, Quantité, Point de réapprovisionnement, Catégorie et Entrepôt.",
        bullets: [
          'Quantité par catégorie',
          'Top SKUs',
          'Détection des ruptures de stock',
          'Tuile de qualité des données',
        ],
      },
      {
        heading: "Adapté pour",
        body: "E-commerçants, petits entrepôts, détaillants et analystes supply chain.",
      },
    ],
    faqs: [
      {
        q: "Puis-je suivre les mouvements de stock ?",
        a: "Si une colonne de dates est présente, un graphique linéaire est généré automatiquement.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'hr-dashboard-template': {
    h1: "Modèle gratuit de tableau de bord RH",
    intro:
      "ExcelInsight construit un tableau de bord RH depuis tout tableur employé. Importez vos données d'effectifs, de département, de date d'embauche et d'attrition, et ExcelInsight assemble les vues — entièrement dans votre navigateur.",
    sections: [
      {
        heading: "Pourquoi les équipes RH choisissent un outil privé",
        body: "Les données RH sont sensibles. Avec ExcelInsight, rien ne quitte le navigateur — aucune donnée n'est jamais envoyée à un serveur.",
      },
      {
        heading: "Ce qu'inclut le tableau de bord",
        body: "Effectifs par département et par site, distribution de l'ancienneté, attrition par trimestre et KPIs RH personnalisés.",
      },
    ],
    faqs: [
      {
        q: "Est-ce sûr pour les données RH confidentielles ?",
        a: "Oui — tout est traité côté client, aucune donnée n'est jamais transmise.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'finance-reporting-dashboard': {
    h1: "Tableau de bord de reporting financier gratuit",
    intro:
      "ExcelInsight donne aux équipes financières un tableau de bord propre en quelques secondes. Importez votre compte de résultat, votre budget vs réel, vos flux de trésorerie ou votre suivi des créances, et obtenez des graphiques thématisés et des pages PDF prêtes à partager.",
    sections: [
      {
        heading: "Conçu pour le cycle de clôture mensuel",
        body: "Importez le dernier fichier, actualisez le tableau de bord, exportez le PDF. Aucune formule à maintenir d'un mois à l'autre.",
      },
      {
        heading: "Confidentialité défendable",
        body: "Le compte de résultat reste sur votre machine — ExcelInsight fonctionne de bout en bout côté client.",
      },
    ],
    faqs: [
      {
        q: "Puis-je afficher budget vs réel ?",
        a: "Oui — incluez les deux colonnes et ExcelInsight génère un graphique multi-séries.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'ecommerce-analytics-dashboard': {
    h1: "Tableau de bord d'analytique e-commerce",
    intro:
      "ExcelInsight transforme tout export Shopify, WooCommerce, Amazon ou Etsy en tableau de bord d'analytique e-commerce en quelques secondes — revenus dans le temps, top SKUs, tendance du panier moyen et répartition des sources de trafic.",
    sections: [
      {
        heading: "Conçu pour les opérateurs de boutiques",
        body: "Parfaitement adapté aux boutiques réalisant entre six et sept chiffres de chiffre d'affaires : rapide, privé et entièrement gratuit.",
      },
      {
        heading: "Compatible avec tous les exports de plateformes",
        body: "Fonctionne avec les CSV de Shopify, WooCommerce, Amazon Seller Central et Etsy sans transformation préalable.",
      },
    ],
    faqs: [
      {
        q: "Dois-je nettoyer l'export Shopify avant ?",
        a: "Non — ExcelInsight gère l'export brut directement.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'startup-kpi-dashboard': {
    h1: "Tableau de bord KPI startup",
    intro:
      "ExcelInsight est le moyen le plus rapide de transformer un tableur de métriques startup en tableau de bord KPI prêt pour les investisseurs. MRR, ARR, taux de croissance, rétention, burn et runway — déposez votre fichier et le tableau de bord apparaît instantanément.",
    sections: [
      {
        heading: "Conçu pour les revues hebdomadaires de métriques",
        body: "Les fondateurs suivent leurs métriques dans des tableurs. ExcelInsight leur donne un rendu soigné — et génère un PDF instantané pour les mises à jour du conseil.",
      },
      {
        heading: "Exports prêts pour les investisseurs",
        body: "Page de couverture propre, un graphique par page — un artefact réutilisable pour les mises à jour mensuelles des investisseurs.",
      },
    ],
    faqs: [
      {
        q: "Puis-je mettre à jour le tableau chaque semaine ?",
        a: "Oui — ajoutez les nouvelles lignes à votre fichier, réimportez-le et le tableau de bord se régénère automatiquement.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'manufacturing-report-dashboard': {
    h1: "Tableau de bord de rapport de fabrication",
    intro:
      "ExcelInsight transforme les tableurs de ligne de production en tableaux de bord de fabrication clairs et lisibles. Débit, temps d'arrêt, taux de défaut, indicateurs OEE et comparaisons de quarts — tous générés automatiquement.",
    sections: [
      {
        heading: "Adapté aux ateliers",
        body: "Lit les exports Excel issus de MES ou SCADA et donne aux responsables d'usine un tableau de bord opérationnel sans intervention informatique.",
      },
      {
        heading: "Repérez les défauts et anomalies rapidement",
        body: "Nuage de points temps de cycle vs taux de défaut, graphique à barres de performance par ligne de production et tuile de qualité des données.",
      },
    ],
    faqs: [
      {
        q: "Fonctionne-t-il hors ligne en atelier ?",
        a: "Oui — après le premier chargement, ExcelInsight fonctionne entièrement côté client.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'marketing-analytics-dashboard': {
    h1: "Tableau de bord d'analytique marketing",
    intro:
      "ExcelInsight est le moyen le plus rapide de transformer un export GA4, Google Ads, Meta Ads, HubSpot ou tout autre outil marketing en tableau de bord d'analytique. Mix de canaux, ROI par campagne, entonnoir de conversion et répartition des sources de leads.",
    sections: [
      {
        heading: "Un tableau de bord pour tous vos canaux",
        body: "Chaque export Excel par canal devient un tableau de bord clair — sans câblage Looker Studio ni configuration complexe.",
      },
      {
        heading: "Confidentialité et données personnelles",
        body: "Les listes de leads restent sur votre ordinateur. ExcelInsight fonctionne entièrement côté client, sans transfert de données.",
      },
    ],
    faqs: [
      {
        q: "Puis-je connecter des données Google Analytics en direct ?",
        a: "Non — ExcelInsight est basé sur des fichiers. Exportez vos données GA4 en CSV et importez-les.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'analyse-excel-data': {
    h1: "Outil gratuit d'analyse de données Excel",
    intro:
      "ExcelInsight est un outil gratuit pour analyser vos données Excel. Importez votre tableur et ExcelInsight effectue automatiquement une analyse approfondie : détection des types de colonnes, insights sur la qualité des données et suggestions de graphiques pertinents.",
    sections: [
      {
        heading: "Analysez vos données Excel instantanément",
        body: "Sans formules, sans Power Query, sans tableaux croisés dynamiques. ExcelInsight identifie les distributions numériques, les top catégories et les valeurs manquantes.",
        bullets: [
          'Détection automatique des types de colonnes',
          'Statistiques descriptives et indicateurs de qualité',
          'Identification rapide des valeurs aberrantes',
        ],
      },
      {
        heading: "Analyse entièrement dans le navigateur",
        body: "Tout le traitement se fait dans votre navigateur — aucune donnée ne quitte votre appareil.",
      },
    ],
    faqs: [
      {
        q: "Ai-je besoin de compétences en analyse de données ?",
        a: "Non — ExcelInsight génère automatiquement les graphiques et les insights.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'plot-excel-data': {
    h1: "Tracez vos données Excel en ligne",
    intro:
      "ExcelInsight rend incroyablement simple le tracé de données Excel en ligne. Importez votre fichier et ExcelInsight trace automatiquement des graphiques à barres, des courbes et des nuages de points — aucune configuration requise.",
    sections: [
      {
        heading: "Tracez des graphiques sans friction",
        body: "ExcelInsight analyse vos colonnes et trace immédiatement les visualisations les plus pertinentes. Changez de type de graphique en un clic.",
        bullets: [
          'Graphiques linéaires pour les séries temporelles',
          'Nuages de points pour les corrélations',
          'Barres et camemberts pour les données catégorielles',
        ],
      },
      {
        heading: "Exportez et partagez",
        body: "Téléchargez chaque graphique en PNG individuellement ou exportez l'ensemble du tableau de bord en PDF multi-pages.",
      },
    ],
    faqs: [
      {
        q: "Puis-je tracer des fichiers CSV ?",
        a: "Oui — ExcelInsight supporte Excel (.xlsx, .xls) et CSV.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },
};
