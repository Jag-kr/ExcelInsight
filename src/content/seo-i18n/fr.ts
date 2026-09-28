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
          'L’export s’exécute dans votre navigateur : le fichier ne quitte jamais votre appareil',
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




  'csv-dashboard': {
    h1: "Créateur de tableau de bord CSV gratuit en ligne",
    intro:
      "Besoin de visualiser des valeurs séparées par des virgules ? ExcelInsight est un outil de tableau de bord CSV rapide et gratuit. Créez un tableau de bord CSV interactif directement dans votre navigateur sans envoyer vos données sensibles dans le cloud.",
    sections: [
      {
        heading: "Du texte brut aux visuels riches",
        body: "Un fichier CSV n'est que du texte brut, mais avec notre outil de tableau de bord CSV, il se transforme en un rapport visuel complet. Glissez-déposez des tuiles, explorez les valeurs récurrentes et analysez les tendances sans effort.",
        bullets: [
          "Analyse les fichiers CSV standard et irréguliers de manière fluide",
          "Génère automatiquement des KPI et des graphiques",
          "Filtrez les données de manière interactive sur l'ensemble du tableau de bord",
        ],
      },
      {
        heading: "Aucune compétence en codage requise",
        body: "Vous n'avez pas besoin de connaître Python ou Pandas pour analyser un fichier CSV. Déposez-le simplement dans ExcelInsight et laissez le profilage automatique des colonnes faire le gros du travail pour vous.",
      },
    ],
    faqs: [
      {
        q: "Puis-je créer un tableau de bord directement à partir d'un CSV ?",
        a: "Oui, importez simplement votre fichier CSV et ExcelInsight créera automatiquement un tableau de bord avec des graphiques, des métriques et des insights basés sur vos données.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },


  'excel-data-insights': {
    h1: "Insights automatisés sur les données Excel",
    intro:
      "Débloquez de puissants insights de données Excel avec ExcelInsight. Cet outil gratuit profile automatiquement vos tableurs pour fournir des insights profonds dont les utilisateurs d'Excel ont besoin, de la détection d'anomalies au résumé des tendances clés.",
    sections: [
      {
        heading: "Découvrez des modèles cachés",
        body: "Vous n'avez pas besoin d'être un data scientist pour obtenir des insights intelligents à partir de vos données. ExcelInsight analyse vos colonnes, identifiant automatiquement les valeurs récurrentes, les données manquantes et les corrélations.",
        bullets: [
          "Profilage automatique des colonnes et statistiques",
          "Mettez en évidence les valeurs manquantes et les problèmes de qualité des données",
          "Suggestions intelligentes de graphiques basées sur les types de données",
        ],
      },
      {
        heading: "Intelligence de données instantanée",
        body: "Obtenez une intelligence exploitable immédiatement. L'outil fournit un résumé visuel clair de votre jeu de données afin que vous puissiez prendre des décisions éclairées sans écrire une seule formule Excel.",
      },
    ],
    faqs: [
      {
        q: "Quel type d'insights de données l'outil fournit-il ?",
        a: "ExcelInsight fournit des statistiques de colonnes, identifie les valeurs catégorielles récurrentes, signale les données manquantes et suggère les graphiques les plus pertinents pour votre jeu de données.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },


  'free-excel-data-analysis-tool': {
    h1: "Outil gratuit d'analyse de données Excel en ligne",
    intro:
      "ExcelInsight est un puissant outil gratuit d'analyse de données Excel en ligne qui vous aide à comprendre vos jeux de données en quelques secondes. Effectuez des analyses approfondies sur n'importe quel tableur sans écrire de formules ou de code VBA.",
    sections: [
      {
        heading: "Analysez les données sans la complexité",
        body: "Arrêtez de vous battre avec les tableaux croisés dynamiques. Notre outil automatise le processus d'analyse en identifiant les types de données et en générant automatiquement des résumés statistiques complets et des graphiques visuels.",
        bullets: [
          "Statistiques descriptives instantanées",
          "Détection automatisée des tendances et des corrélations",
          "Interface visuelle facile à utiliser",
        ],
      },
      {
        heading: "Conçu pour la rapidité et la confidentialité",
        body: "Parce qu'il s'exécute entièrement dans votre navigateur, cet outil d'analyse traite les fichiers instantanément sans aucun envoi vers un serveur. Analysez vos données financières ou RH confidentielles en toute tranquillité d'esprit.",
      },
    ],
    faqs: [
      {
        q: "Dois-je installer un logiciel pour analyser les données ?",
        a: "Non, c'est un outil basé sur le web. Il fonctionne directement dans votre navigateur sur n'importe quel système d'exploitation sans nécessiter de téléchargements ou d'installations.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },

  'excel-statistics-tool': {
    h1: "Outil de statistiques Excel en ligne",
    intro:
      "ExcelInsight sert d'outil de statistiques Excel robuste, vous permettant de lire des statistiques commerciales avec Excel en ligne gratuitement. Obtenez des résumés statistiques immédiats et des analyses descriptives directement dans votre navigateur.",
    sections: [
      {
        heading: "Statistiques descriptives instantanées",
        body: "Comprendre la distribution de vos données est essentiel. ExcelInsight calcule les minimums, les maximums, les moyennes et identifie automatiquement les valeurs aberrantes pour chaque colonne numérique de votre fichier.",
        bullets: [
          "Statistiques récapitulatives automatisées",
          "Détection des valeurs aberrantes et vérification de la qualité des données",
          "Distributions visuelles via des histogrammes et des boîtes à moustaches",
        ],
      },
      {
        heading: "Parfait pour l'analytique commerciale",
        body: "Que vous analysiez les performances de vente ou l'efficacité opérationnelle, cet outil vous donne les bases statistiques dont vous avez besoin pour prendre des décisions basées sur les données rapidement et précisément.",
      },
    ],
    faqs: [
      {
        q: "Cet outil peut-il remplacer l'utilitaire d'analyse Excel ?",
        a: "Pour les statistiques descriptives de base, les distributions et les visuels de corrélation, ExcelInsight offre une alternative plus rapide et plus conviviale aux compléments Excel traditionnels.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },




  'excel-link-analysis': {
    h1: "Analyse des liens dans Excel",
    intro:
      "Découvrez des connexions cachées avec notre outil gratuit d'analyse de liens dans Excel. ExcelInsight vous permet d'explorer visuellement les relations de données et les connexions d'entités à travers votre jeu de données, directement dans votre navigateur.",
    sections: [
      {
        heading: "Explorez les relations de données",
        body: "Comprendre comment différentes entités de vos données sont liées les unes aux autres est crucial. Bien qu'il ne s'agisse pas d'un outil de graphes de réseau, ExcelInsight vous aide à effectuer des analyses relationnelles en mettant en évidence les connexions catégorielles récurrentes et les corrélations de variables.",
        bullets: [
          "Identifiez les attributs communs à travers les segments de données",
          "Utilisez des nuages de points pour trouver des corrélations de variables",
          "Filtrez de manière interactive pour tracer les relations entre les entités",
        ],
      },
      {
        heading: "Une approche visuelle des connexions",
        body: "En croisant les filtres des graphiques et en examinant les insights sur les valeurs récurrentes, vous pouvez découvrir des modèles et des relations qu'il serait impossible de repérer dans une grille brute de lignes de tableur.",
      },
    ],
    faqs: [
      {
        q: "Cet outil génère-t-il des graphes de réseau nœud-lien ?",
        a: "Non, il se concentre sur l'analyse de données relationnelles à travers le filtrage croisé, les corrélations et les répartitions catégorielles plutôt que sur les graphiques spécialisés de topologie de réseau.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },


  'excel-data-visualizer': {
    h1: "Visualisateur de données Excel gratuit",
    intro:
      "Profitez d'une visualisation fluide des données Excel avec ExcelInsight. Cet outil gratuit de visualisation en ligne convertit automatiquement vos lignes et colonnes brutes en un tableau de bord visuel, complet et interactif.",
    sections: [
      {
        heading: "Visualisation automatisée",
        body: "Vous n'avez pas besoin de choisir quel graphique correspond le mieux à vos données. Le visualisateur de données Excel profile votre tableur et sélectionne automatiquement les graphiques optimaux — qu'il s'agisse d'un graphique à barres, en courbes, en secteurs ou d'un nuage de points.",
        bullets: [
          "Recommandations intelligentes de graphiques basées sur les types de colonnes",
          "Visualisations interactives et réactives",
          "Disposition du tableau de bord par glisser-déposer",
        ],
      },
      {
        heading: "Exportez vos visualisations",
        body: "Après avoir exploré visuellement vos données, vous pouvez exporter l'intégralité du tableau de bord sous forme de rapport PDF propre et multipage pour partager facilement des insights avec votre équipe ou vos parties prenantes.",
      },
    ],
    faqs: [
      {
        q: "Ce visualisateur de données est-il gratuit ?",
        a: "Oui, ExcelInsight est entièrement gratuit. Il n'y a pas de frais cachés ni d'abonnements pour visualiser et exporter vos données.",
      },
      { q: "Est-ce gratuit ?", a: "Oui." },
      { q: "Mes données sont-elles privées ?", a: "Oui." },
    ],
  },
};

