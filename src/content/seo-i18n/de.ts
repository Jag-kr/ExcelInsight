export const deSeoUi = {
  categoryFeature: 'Funktionen',
  categoryComparison: 'Vergleiche',
  categoryChart: 'Diagramm-Tools',
  categoryTemplate: 'Dashboard-Vorlagen',
  categoryUsecase: 'Anwendungsfälle',
  seeItInAction: 'In Aktion sehen',
  tryWithYourOwnFile: 'Mit Ihrer eigenen Datei ausprobieren',
  tryItDesc:
    'Kein Konto erforderlich, kein Upload auf einen Server. Öffnen Sie ExcelInsight, laden Sie Ihre Excel- oder CSV-Datei hoch und erhalten Sie in Sekunden ein fertiges Dashboard.',
  frequentlyAskedQuestions: 'Häufig gestellte Fragen',
  relatedTools: 'Ähnliche Tools',
  uploadSpreadsheetFree: 'Tabelle hochladen – kostenlos',
  feature: 'Funktion',
  comparisons: 'Vergleiche',
};

export const de: Record<
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
    h1: 'Kostenloser Online-Dashboard-Ersteller für Excel',
    intro:
      'ExcelInsight ist ein kostenloser Dashboard-Ersteller für Excel, der jede Tabellenkalkulation in Sekunden in ein interaktives Live-Dashboard verwandelt. Laden Sie eine .xlsx- oder .csv-Datei hoch, wählen Sie Ihre Diagramme und ordnen Sie sie per Drag-and-Drop an – keine Formeln, keine Pivot-Tabellen, keine Registrierung.',
    primaryCta: 'Tabelle hochladen – kostenlos',
    sections: [
      {
        heading: 'Dashboards aus jeder Excel- oder CSV-Datei erstellen',
        body: 'ExcelInsight analysiert jede Spalte automatisch – erkennt numerische, kategoriale, Datums- und ID-Spalten – und schlägt die aussagekräftigsten Diagramme vor. Sie starten mit einem fertigen Dashboard, nicht mit einer leeren Arbeitsfläche.',
        bullets: [
          'Automatisch generiertes Dashboard mit den 3–4 nützlichsten Diagrammen',
          'Drag-and-Drop-Layout mit kleinen, mittleren und großen Kacheln',
          'Spaltenstatistiken und Datenqualitäts-Kacheln',
          'Duplizieren, Größe ändern und Entfernen per Klick',
        ],
      },
      {
        heading: 'Warum Teams ExcelInsight den integrierten Excel-Dashboards vorziehen',
        body: 'Native Excel-Dashboards erfordern Pivot-Tabellen, Datenschnitte und viele Klicks. ExcelInsight bietet dieselben Bausteine vollständig clientseitig – auch auf gesperrten Firmen-Laptops, ohne Power BI oder Tableau.',
        bullets: [
          'Keine Installation, keine Lizenz, keine Administratorrechte erforderlich',
          'Funktioniert auf Windows, macOS, Linux, iPad und Chromebook',
          'Dateien verlassen nie Ihr Gerät',
          'Export als mehrseitiges PDF',
        ],
      },
    ],
    faqs: [
      {
        q: 'Kann ich das Dashboard nach dem Laden bearbeiten?',
        a: 'Ja – Sie können Kacheln skalieren, duplizieren und entfernen sowie den Diagrammtyp direkt inline ändern.',
      },
      {
        q: 'Wie groß darf die Datei sein?',
        a: 'Dateien mit bis zu ~100.000 Zeilen funktionieren problemlos.',
      },
      {
        q: 'Ist ExcelInsight kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft im Browser, Ihre Daten verlassen das Gerät nie.',
      },
      {
        q: 'Kann ich das Dashboard exportieren?',
        a: 'Ja, als PDF oder als PNG-Einzeldiagramm.',
      },
    ],
  },

  'csv-visualization-tool': {
    h1: 'Kostenloses Online-CSV-Visualisierungstool',
    intro:
      'ExcelInsight ist ein kostenloses CSV-Visualisierungstool, das kommagetrennte Dateien in reichhaltige, interaktive Dashboards verwandelt. Laden Sie eine .csv-Datei aus Ihrer Datenbank, Ihrem CRM oder Backend hoch – ExcelInsight analysiert jede Spalte, schlägt Diagramme vor und lässt Sie ein individuelles Dashboard aufbauen.',
    sections: [
      {
        heading: 'Jede CSV öffnen und sofort visualisieren',
        body: 'ExcelInsight verarbeitet Standard-, quoted- und unregelmäßige CSVs. Numerische Spalten werden als Histogramme dargestellt, kategoriale Spalten als Aufschlüsselungen und Datumsspalten als Zeitreihen.',
        bullets: [
          'Unterstützt .csv, .xlsx und .xls – auch mehrseitige Arbeitsmappen',
          'Automatische Typenerkennung für alle Spalten',
          'Intelligente Dateneinblicke auf einen Blick',
          'Live-Zeilenfilter für interaktive Analyse',
        ],
      },
      {
        heading: 'Entwickelt für Ingenieure, Analysten und Betriebsteams',
        body: 'Kein Python, kein pandas, kein Jupyter erforderlich – explorative Datenanalyse direkt im Browser, ohne Abhängigkeiten oder Einrichtungsaufwand.',
      },
    ],
    faqs: [
      {
        q: 'Werden quoted Kommas in CSV-Feldern korrekt verarbeitet?',
        a: 'Ja, ExcelInsight folgt dem RFC-4180-Standard für CSV-Parsing.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alle Verarbeitung findet im Browser statt.',
      },
      {
        q: 'Kann ich CSV-Dateien ohne Server visualisieren?',
        a: 'Ja – ExcelInsight arbeitet vollständig clientseitig, ohne Serververbindung.',
      },
    ],
  },


  'excel-report-builder': {
    h1: 'Online-Berichtsersteller für Excel',
    intro:
      'ExcelInsight ist ein kostenloser Berichtsersteller für Excel. Laden Sie eine Tabelle hoch, ordnen Sie Diagramme und Erkenntnisse an und exportieren Sie anschließend ein professionelles, mehrseitiges PDF mit Titelseite, Metadaten und je einem Diagramm pro Abschnitt.',
    sections: [
      {
        heading: 'In drei Schritten von der Tabelle zum fertigen Bericht',
        body: 'ExcelInsight ersetzt das mühsame Kopieren von Diagrammen in Word oder Google Docs. Exportieren Sie direkt ein gebrandetes PDF-Dokument.',
        bullets: [
          'Automatisch generierte Titelseite',
          'Ein Diagramm pro Seite für klare Übersichtlichkeit',
          'Einblicks-Kacheln mit automatisch berechneten Kennzahlen',
          'Der Export läuft in Ihrem Browser – die Tabelle verlässt Ihr Gerät nie',
        ],
      },
      {
        heading: 'Ideal für wiederkehrende Berichtszyklen',
        body: 'Ob wöchentlich, monatlich oder quartalsweise – laden Sie einfach die aktuelle Datei hoch und exportieren Sie den aktualisierten Bericht in Sekunden.',
      },
    ],
    faqs: [
      {
        q: 'Was enthält das exportierte PDF?',
        a: 'Eine Titelseite sowie eine Seite pro Diagramm oder Kachel.',
      },
      {
        q: 'Ist der Berichtsersteller kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – nichts wird auf einen Server hochgeladen.',
      },
      {
        q: 'Kann ich ein Logo hinzufügen?',
        a: 'Logo-Support ist in Planung und wird in einer zukünftigen Version verfügbar sein.',
      },
    ],
  },

  'excel-to-pdf-dashboard': {
    h1: 'Excel-zu-PDF-Dashboard-Konverter',
    intro:
      'ExcelInsight konvertiert Excel- und CSV-Dateien in ein sauberes, exportierbares PDF-Dashboard. Laden Sie Ihre Datei hoch, lassen Sie ExcelInsight die passenden Diagramme auswählen, und exportieren Sie das Ergebnis als eine einzige PDF-Datei.',
    sections: [
      {
        heading: 'Ein echtes Dashboard – kein bloßer Diagramm-Export',
        body: 'ExcelInsight erstellt ein vollständiges Dashboard mit KPI-Kacheln, intelligenten Erkenntnissen und thematisierten Diagrammen – und exportiert das Ganze dann als strukturiertes PDF.',
      },
      {
        heading: 'Privat by Design',
        body: 'Es wird nichts auf einen Server hochgeladen. Das PDF wird direkt im Browser mithilfe von jsPDF generiert – Ihre Daten verlassen das Gerät nie.',
      },
    ],
    faqs: [
      {
        q: 'Wie wird das PDF generiert?',
        a: 'Mithilfe von Canvas und jsPDF vollständig im Browser – kein Server ist beteiligt.',
      },
      {
        q: 'Ist der Konverter kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles geschieht lokal in Ihrem Browser.',
      },
    ],
  },

  'excelinsight-vs-tableau': {
    h1: 'ExcelInsight und Tableau: Für unterschiedliche Workflows entwickelt',
    intro:
      'Beide Werkzeuge helfen Nutzern, das Beste aus ihren Daten herauszuholen – aber für sehr unterschiedliche Workflows. ExcelInsight ist die richtige Wahl für schnelle Tabellenanalysen im Browser; Tableau richtet sich an unternehmensweite BI-Umgebungen mit Live-Datenbankverbindungen.',
    sections: [
      {
        heading: 'Wann ExcelInsight die bessere Wahl ist',
        body: 'Wenn Sie ein Dashboard aus einer einzelnen Datei erstellen, es als PDF exportieren und keine Serverinfrastruktur benötigen, ist ExcelInsight genau das richtige Tool.',
        bullets: [
          'Null Installation – direkt im Browser starten',
          '100 % clientseitig – keine Daten verlassen Ihr Gerät',
          'PDF-Export mit einem Klick',
        ],
      },
      {
        heading: 'Wann Tableau glänzt',
        body: 'Tableau ist die richtige Wahl für Live-Datenbankverbindungen, unternehmensweite Dashboards, rollenbasierte Zugriffskontrollen und Sicherheit auf Zeilenebene.',
      },
    ],
    faqs: [
      {
        q: 'Ist ExcelInsight ähnlich wie Tableau?',
        a: 'Beide erstellen Dashboards, aber für sehr unterschiedliche Workflows. ExcelInsight ist auf dateibasierte Schnellanalyse ausgelegt, Tableau auf unternehmensweite BI.',
      },
      {
        q: 'Ist ExcelInsight kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft clientseitig.',
      },
    ],
  },

  'excelinsight-vs-powerbi': {
    h1: 'ExcelInsight und Power BI: Tabellenkalkulations-Workflows im Vergleich',
    intro:
      'Beide Tools erstellen Dashboards – aber für unterschiedliche Workflows. ExcelInsight eignet sich für schnelle Browser-Analysen einzelner Dateien. Power BI ist die Wahl für unternehmensweites Reporting mit Live-Datenbankintegration.',
    sections: [
      {
        heading: 'Wann ExcelInsight die bessere Wahl ist',
        body: 'Wenn Sie heute ein Dashboard benötigen – ohne Installation, in jedem Browser und auf jedem Betriebssystem – liefert ExcelInsight sofortige Ergebnisse.',
      },
      {
        heading: 'Wann Power BI glänzt',
        body: 'Power BI ist ideal für gesteuertes Reporting gegen einen Data Warehouse, DAX-Measures und geplante Datenaktualisierungen auf Unternehmensebene.',
      },
    ],
    faqs: [
      {
        q: 'ExcelInsight oder Power BI – was soll ich wählen?',
        a: 'Für Ad-hoc-Dashboards aus einer Datei: ExcelInsight. Für unternehmensweites Reporting mit Live-Verbindungen: Power BI.',
      },
      {
        q: 'Ist ExcelInsight kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft clientseitig, ohne Serververbindung.',
      },
    ],
  },

  'tableau-alternative': {
    h1: 'Kostenloses Excel-Dashboard-Tool für Tabellenkalkulations-Workflows',
    intro:
      'Tableau hat eine steile Lernkurve und laufende Lizenzkosten. Wenn Sie Excel- oder CSV-Dateien schnell in ein sauberes Dashboard verwandeln möchten, ist ExcelInsight eine schlanke, kostenlose Alternative – ohne Installation, ohne Registrierung.',
    sections: [
      {
        heading: 'Für unterschiedliche Workflows entwickelt',
        body: 'ExcelInsight deckt genau das ab, was die meisten Tabellen-Nutzer täglich brauchen: Diagramme, KPI-Kacheln, Drag-and-Drop-Layout und PDF-Export.',
      },
      {
        heading: 'Am besten geeignet für',
        body: 'Analysten, Gründer, Studierende, Berater und Operations-Teams, die schnell und unkompliziert Einblicke aus Tabellenkalkulationen gewinnen möchten.',
      },
    ],
    faqs: [
      {
        q: 'Ist ExcelInsight wirklich kostenlos?',
        a: 'Ja, vollständig kostenlos – es gibt keinen kostenpflichtigen Tarif.',
      },
      {
        q: 'Ist ExcelInsight kostenlos?',
        a: 'Ja.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft im Browser, Ihre Daten verlassen das Gerät nie.',
      },
    ],
  },

  'best-excel-dashboard-tool': {
    h1: 'Das beste Excel-Dashboard-Tool 2026',
    intro:
      'Es gibt Dutzende Excel-Dashboard-Tools – von nativen Excel-Pivot-Charts bis zu Tableau, Power BI, Looker Studio, Datawrapper und Flourish. Hier ist ein meinungsstarker Leitfaden, der Ihnen hilft, das richtige Tool für Ihren Anwendungsfall zu finden.',
    sections: [
      {
        heading: 'Die Shortlist: nach Anwendungsfall wählen, nicht nach Marke',
        body: 'Jedes Tool hat seinen idealen Einsatzbereich. Wählen Sie nach Ihrem konkreten Bedarf.',
        bullets: [
          'ExcelInsight – schnelle, private Dashboards aus einer einzelnen Datei',
          'Power BI – gesteuertes Unternehmens-Reporting mit Live-Datenquellen',
          'Tableau – explorative BI für Datenexperten',
          'Looker Studio – kostenlos mit Google-Daten',
          'Datawrapper – publikationsreife Einzeldiagramme',
        ],
      },
      {
        heading: 'Wann ExcelInsight die richtige Wahl ist',
        body: 'Wenn Ihre Daten in einer Tabellenkalkulation liegen, Sie noch heute ein Dashboard benötigen und keine Software installieren oder einen Server einrichten wollen, ist ExcelInsight das passende Tool.',
      },
    ],
    faqs: [
      {
        q: 'Was ist das einfachste Excel-Dashboard-Tool?',
        a: 'ExcelInsight ist das einfachste Tool, wenn Ihre Daten in einer einzelnen Excel-Datei vorliegen.',
      },
      {
        q: 'Ist ExcelInsight kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alle Verarbeitung findet im Browser statt.',
      },
    ],
  },


  'line-chart-maker': {
    h1: 'Kostenloses Online-Liniendiagramm-Tool',
    intro:
      'ExcelInsight ist ein kostenloses Liniendiagramm-Tool für Zeitreihen und Trendanalysen. Laden Sie eine Datei mit einer Datumsspalte und numerischen Spalten hoch und erhalten Sie ein glattes Multi-Series-Liniendiagramm.',
    sections: [
      {
        heading: 'Perfekt für Zeitreihendaten',
        body: 'ExcelInsight erkennt Datumsspalten automatisch und stellt Metriken wie Umsatz über Zeit, täglich aktive Nutzer oder Fehlerquoten als ansprechende Liniendiagramme dar.',
      },
      {
        heading: 'Mehrere Datenreihen auf einen Blick vergleichen',
        body: 'Vergleichen Sie monatlichen Umsatz nach Region, tägliche Anmeldungen nach Kanal oder beliebige andere Multi-Series-Zeitreihen – alles in einem Diagramm.',
      },
    ],
    faqs: [
      {
        q: 'Welche Datumsformate werden unterstützt?',
        a: 'ISO 8601, Excel-Seriennummern, MM/TT/JJJJ und TT/MM/JJJJ werden automatisch erkannt.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft im Browser.',
      },
    ],
  },



  'area-chart-maker': {
    h1: 'Kostenloses Online-Flächendiagramm-Tool',
    intro:
      'ExcelInsight ist ein kostenloses Flächendiagramm-Tool. Kombinieren Sie Datums- und numerische Spalten für ausgefüllte Multi-Series-Flächendiagramme, die die Größe und das Volumen eines Trends anschaulich darstellen.',
    sections: [
      {
        heading: 'Flächendiagramm vs. Liniendiagramm – wann welches?',
        body: 'Wählen Sie ein Flächendiagramm, wenn das Volumen unter der Kurve bedeutsam ist – z. B. bei kumuliertem Umsatz, Gesamtanmeldungen oder kumulierten Downloads.',
      },
      {
        heading: 'Diagrammtyp mit einem Klick wechseln',
        body: 'Erstellen Sie das Diagramm zunächst als Liniendiagramm und wechseln Sie dann mit einem Klick zu Fläche – kein erneutes Hochladen der Datei erforderlich.',
      },
    ],
    faqs: [
      {
        q: 'Können mehrere Datenreihen gestapelt werden?',
        a: 'Halbtransparente Überlagerungen sind bereits verfügbar. Echte gestapelte Flächen sind in Planung.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft im Browser.',
      },
    ],
  },


  'inventory-dashboard-template': {
    h1: 'Kostenlose Inventar-Dashboard-Vorlage',
    intro:
      'ExcelInsight verwandelt jede Inventar-Tabelle in ein vollständiges Inventar-Dashboard. Laden Sie Ihre SKU-Liste hoch und erhalten Sie Lagerbestandsansichten, Top-SKUs, Niedrigbestand-Warnungen und eine Kategorieaufschlüsselung.',
    sections: [
      {
        heading: 'Was automatisch generiert wird',
        body: 'ExcelInsight erkennt automatisch Spalten wie SKU, Produkt, Menge, Nachbestellpunkt, Kategorie und Lager und erstellt daraus ein aussagekräftiges Dashboard.',
        bullets: [
          'Lagermengen nach Kategorie als Balkendiagramm',
          'Top-SKUs nach Menge oder Umsatz',
          'Automatische Erkennung von Artikeln unter dem Mindestbestand',
          'Datenqualitäts-Kachel für fehlende oder inkonsistente Werte',
        ],
      },
      {
        heading: 'Ideal geeignet für',
        body: 'E-Commerce-Betreiber, kleine Lagerhaltungen, Einzelhändler und Supply-Chain-Analysten, die schnell einen Überblick über ihren Bestand benötigen.',
      },
    ],
    faqs: [
      {
        q: 'Können Lagerbewegungen über Zeit verfolgt werden?',
        a: 'Ja – wenn eine Datumsspalte vorhanden ist, wird automatisch ein Liniendiagramm der Bestandsentwicklung generiert.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft im Browser.',
      },
    ],
  },

  'hr-dashboard-template': {
    h1: 'Kostenlose HR-Dashboard-Vorlage',
    intro:
      'ExcelInsight erstellt ein HR-Dashboard aus jeder Mitarbeitertabelle. Laden Sie Kopfzahl, Abteilung, Einstellungsdatum und Fluktuationsdaten hoch – ExcelInsight assembliert die passenden Ansichten direkt im Browser.',
    sections: [
      {
        heading: 'Warum HR-Teams ein privates Tool bevorzugen',
        body: 'Personaldaten sind sensibel. Mit ExcelInsight verlassen Ihre Daten nie den Browser – kein IT-Review, kein Datenschutz-Audit, keine Cloud-Speicherung.',
      },
      {
        heading: 'Was das Dashboard enthält',
        body: 'Kopfzahl nach Abteilung und Standort, durchschnittliche Betriebszugehörigkeit, Fluktuation nach Quartal und benutzerdefinierte HR-KPIs – alles automatisch aus Ihrer Tabelle generiert.',
      },
    ],
    faqs: [
      {
        q: 'Ist ExcelInsight sicher für vertrauliche HR-Daten?',
        a: 'Ja – alles läuft vollständig clientseitig. Ihre Tabelle verlässt nie Ihren Laptop.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – keine Daten werden auf einen Server übertragen.',
      },
    ],
  },

  'finance-reporting-dashboard': {
    h1: 'Kostenloses Finanz-Reporting-Dashboard',
    intro:
      'ExcelInsight gibt Finanzteams in Sekunden ein sauberes, berichtsfähiges Dashboard. Laden Sie GuV, Budget vs. Ist, Cashflow oder AR-Aging hoch und erhalten Sie thematische Diagramme sowie druckfertige PDF-Seiten.',
    sections: [
      {
        heading: 'Für monatliche Berichtszyklen entwickelt',
        body: 'Laden Sie die neueste Datei hoch, das Dashboard aktualisiert sich automatisch und Sie exportieren das PDF direkt in Ihr Vorstandspaket – keine Formeln zu pflegen, keine kaputten Vorlagen.',
      },
      {
        heading: 'Verteidigungsfähige Privatsphäre für Finanzdaten',
        body: 'Ihre GuV und Finanzdaten bleiben auf Ihrem Rechner. ExcelInsight ist vollständig clientseitig – keine Cloud, kein Server.',
      },
    ],
    faqs: [
      {
        q: 'Kann ich Budget vs. Ist darstellen?',
        a: 'Ja – schließen Sie beide Spalten in Ihre Tabelle ein und ExcelInsight erstellt ein Multi-Series Balken- oder Liniendiagramm.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft lokal in Ihrem Browser.',
      },
    ],
  },

  'ecommerce-analytics-dashboard': {
    h1: 'E-Commerce-Analyse-Dashboard',
    intro:
      'ExcelInsight verwandelt jeden Shopify-, WooCommerce-, Amazon- oder Etsy-Export in ein vollständiges E-Commerce-Analyse-Dashboard – mit Umsatz über Zeit, Top-SKUs, AOV-Trend, Traffic-Quellen-Mix und Rückerstattungsquote.',
    sections: [
      {
        heading: 'Entwickelt für Shop-Betreiber',
        body: 'Die richtige Größe für sechsstellige oder siebenstellige Shops: schnell, privat und dauerhaft kostenlos – ohne Abonnement oder komplizierte Einrichtung.',
      },
      {
        heading: 'Kompatibel mit allen großen Plattform-Exports',
        body: 'Shopify, WooCommerce, Amazon Seller Central und Etsy – ExcelInsight verarbeitet deren CSV-Exporte direkt, ohne Vorformatierung.',
      },
    ],
    faqs: [
      {
        q: 'Muss ich den Shopify-Export vor dem Hochladen bereinigen?',
        a: 'Nein – ExcelInsight verarbeitet den Roh-Export automatisch.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft im Browser, keine Daten werden hochgeladen.',
      },
    ],
  },



  'marketing-analytics-dashboard': {
    h1: 'Marketing-Analyse-Dashboard',
    intro:
      'ExcelInsight ist der schnellste Weg, GA4-, Google Ads-, Meta Ads-, HubSpot- oder andere Marketing-Exporte in ein übersichtliches Marketing-Analyse-Dashboard zu verwandeln – mit Kanal-Mix, Kampagnen-ROI, Conversion-Funnel und Lead-Quellen-Aufschlüsselung.',
    sections: [
      {
        heading: 'Ein Dashboard für alle Kanäle',
        body: 'Verwandeln Sie jeden Kanal-Excel-Export in Sekunden in ein sauberes Dashboard – ganz ohne Looker Studio oder aufwendige Datenverbindungen.',
      },
      {
        heading: 'Datenschutz für Lead- und Kundendaten',
        body: 'Lead- und Kundendaten bleiben auf Ihrem Laptop. ExcelInsight ist vollständig clientseitig – ideal für datenschutzkonforme Marketing-Analysen.',
      },
    ],
    faqs: [
      {
        q: 'Kann ich Live-Daten von Google Analytics einbinden?',
        a: 'Nein – ExcelInsight ist dateibasiert. Exportieren Sie Ihren GA4-Bericht als CSV und laden Sie ihn in ExcelInsight.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft im Browser, keine Daten verlassen das Gerät.',
      },
    ],
  },

  'analyse-excel-data': {
    h1: 'Kostenloses Excel-Analyse-Tool',
    intro:
      'ExcelInsight ist ein kostenloses Tool zur Analyse von Excel-Daten. Laden Sie Ihre Tabelle hoch und ExcelInsight führt automatisch eine tiefgehende Datenanalyse durch – erkennt Datentypen, berechnet Statistiken und schlägt aufschlussreiche Diagramme vor.',
    sections: [
      {
        heading: 'Excel-Daten sofort analysieren',
        body: 'Keine komplizierten Formeln, kein Power Query, keine Pivot-Tabellen. ExcelInsight identifiziert numerische Verteilungen, Top-Kategorien und fehlende Werte automatisch.',
        bullets: [
          'Automatische Spaltenerkennung und Typisierung',
          'Deskriptive Statistiken und Datenqualitäts-Score',
          'Ausreißer schnell finden und visualisieren',
        ],
      },
      {
        heading: 'Vollständig browserbasierte Analyse',
        body: 'Komplexe Datenanalyse vollständig im Browser – nichts verlässt Ihr Gerät, keine Cloud, keine Installation.',
      },
    ],
    faqs: [
      {
        q: 'Sind Datenanalyse-Kenntnisse erforderlich?',
        a: 'Nein – ExcelInsight generiert automatisch Diagramme und Erkenntnisse, die für alle verständlich sind.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alle Verarbeitung findet im Browser statt.',
      },
    ],
  },




  'csv-dashboard': {
    h1: 'Kostenloser Online-CSV-Dashboard-Ersteller',
    intro:
      'Müssen Sie kommagetrennte Werte visualisieren? ExcelInsight ist ein schnelles, kostenloses CSV-Dashboard-Tool. Erstellen Sie ein interaktives CSV-Dashboard direkt in Ihrem Browser, ohne Ihre sensiblen Daten in die Cloud hochzuladen.',
    sections: [
      {
        heading: 'Von reinem Text zu reichhaltigen visuellen Inhalten',
        body: 'Eine CSV-Datei ist nur einfacher Text, aber mit unserem CSV-Dashboard-Tool verwandelt sie sich in einen umfassenden visuellen Bericht. Ziehen Sie Kacheln per Drag-and-Drop, untersuchen Sie sich wiederholende Werte und analysieren Sie Trends mühelos.',
        bullets: [
          'Verarbeitet fehlerfreie und unregelmäßige CSV-Dateien nahtlos',
          'Generiert automatisch KPIs und Diagramme',
          'Daten interaktiv über das gesamte Dashboard filtern',
        ],
      },
      {
        heading: 'Keine Programmierkenntnisse erforderlich',
        body: 'Sie müssen kein Python oder Pandas kennen, um eine CSV-Datei zu analysieren. Ziehen Sie sie einfach in ExcelInsight und lassen Sie das automatisierte Spaltenprofiling die harte Arbeit für Sie erledigen.',
      },
    ],
    faqs: [
      {
        q: 'Kann ich ein Dashboard direkt aus einer CSV-Datei erstellen?',
        a: 'Ja, laden Sie einfach Ihre CSV-Datei hoch und ExcelInsight erstellt automatisch ein Dashboard mit Diagrammen, Metriken und Erkenntnissen basierend auf Ihren Daten.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft lokal in Ihrem Browser.',
      },
    ],
  },


  'excel-data-insights': {
    h1: 'Automatisierte Excel-Daten-Erkenntnisse',
    intro:
      'Erschließen Sie leistungsstarke Excel-Dateneinblicke mit ExcelInsight. Dieses kostenlose Tool profiliert Ihre Tabellen automatisch, um fundierte Erkenntnisse zu liefern, die Excel-Benutzer benötigen, von der Erkennung von Anomalien bis hin zur Zusammenfassung der wichtigsten Trends.',
    sections: [
      {
        heading: 'Verborgene Muster entdecken',
        body: 'Sie müssen kein Data Scientist sein, um intelligente Einblicke aus Ihren Daten zu gewinnen. ExcelInsight scannt Ihre Spalten und identifiziert automatisch sich wiederholende Werte, fehlende Daten und Korrelationen.',
        bullets: [
          'Automatisches Spaltenprofiling und Statistiken',
          'Fehlende Werte und Datenqualitätsprobleme hervorheben',
          'Smarte Diagrammvorschläge basierend auf Datentypen',
        ],
      },
      {
        heading: 'Sofortige Datenintelligenz',
        body: 'Gewinnen Sie sofort umsetzbare Intelligenz. Das Tool bietet eine übersichtliche, visuelle Zusammenfassung Ihres Datensatzes, sodass Sie fundierte Entscheidungen treffen können, ohne eine einzige Excel-Formel schreiben zu müssen.',
      },
    ],
    faqs: [
      {
        q: 'Welche Art von Dateneinblicken bietet das Tool?',
        a: 'ExcelInsight liefert Spaltenstatistiken, identifiziert sich wiederholende kategoriale Werte, markiert fehlende Daten und schlägt die relevantesten Diagramme für Ihren Datensatz vor.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft lokal in Ihrem Browser.',
      },
    ],
  },


  'free-excel-data-analysis-tool': {
    h1: 'Kostenloses Online-Tool zur Excel-Datenanalyse',
    intro:
      'ExcelInsight ist ein leistungsstarkes, kostenloses Online-Tool zur Excel-Datenanalyse, mit dem Sie Ihre Datensätze in Sekundenschnelle verstehen können. Führen Sie tiefe Analysen in jeder Tabelle durch, ohne Formeln oder VBA-Code zu schreiben.',
    sections: [
      {
        heading: 'Daten ohne Komplexität analysieren',
        body: 'Hören Sie auf, mit Pivot-Tabellen zu kämpfen. Unser Tool automatisiert den Analyseprozess, indem es Datentypen identifiziert und automatisch umfassende statistische Zusammenfassungen und visuelle Diagramme generiert.',
        bullets: [
          'Sofortige deskriptive Statistiken',
          'Automatisierte Trend- und Korrelationserkennung',
          'Einfach zu bedienende visuelle Benutzeroberfläche',
        ],
      },
      {
        heading: 'Gebaut für Geschwindigkeit und Datenschutz',
        body: 'Da dieses Analysetool vollständig in Ihrem Browser läuft, verarbeitet es Dateien sofort und ohne Server-Uploads. Analysieren Sie vertrauliche Finanz- oder HR-Daten absolut beruhigt.',
      },
    ],
    faqs: [
      {
        q: 'Muss ich eine Software für die Datenanalyse installieren?',
        a: 'Nein, dies ist ein webbasiertes Tool. Es funktioniert direkt in Ihrem Browser auf jedem Betriebssystem, ohne dass Downloads oder Installationen erforderlich sind.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft lokal in Ihrem Browser.',
      },
    ],
  },

  'excel-statistics-tool': {
    h1: 'Excel-Statistik-Tool online',
    intro:
      'ExcelInsight dient als robustes Excel-Statistik-Tool, mit dem Sie Geschäftsstatistiken mit Excel online kostenlos lesen können. Erhalten Sie sofortige statistische Zusammenfassungen und deskriptive Analysen direkt in Ihrem Browser.',
    sections: [
      {
        heading: 'Sofortige deskriptive Statistiken',
        body: 'Das Verständnis der Verteilung Ihrer Daten ist entscheidend. ExcelInsight berechnet automatisch Minimums, Maximums, Durchschnitte und identifiziert Ausreißer für jede numerische Spalte in Ihrer Datei.',
        bullets: [
          'Automatisierte Zusammenfassungsstatistiken',
          'Ausreißererkennung und Datenqualitätsprüfungen',
          'Visuelle Verteilungen über Histogramme und Boxplots',
        ],
      },
      {
        heading: 'Perfekt für Business Analytics',
        body: 'Egal, ob Sie die Vertriebsleistung oder die betriebliche Effizienz analysieren, dieses Tool bietet Ihnen die statistische Grundlage, die Sie benötigen, um datengesteuerte Entscheidungen schnell und genau zu treffen.',
      },
    ],
    faqs: [
      {
        q: 'Kann dieses Tool das Excel-Analyse-Funktionen-Add-In ersetzen?',
        a: 'Für grundlegende deskriptive Statistiken, Verteilungen und Korrelationsvisualisierungen bietet ExcelInsight eine schnellere, benutzerfreundlichere Alternative zu herkömmlichen Excel-Add-Ins.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft lokal in Ihrem Browser.',
      },
    ],
  },




  'excel-link-analysis': {
    h1: 'Link-Analyse in Excel',
    intro:
      'Entdecken Sie verborgene Verbindungen mit unserem kostenlosen Tool zur Link-Analyse in Excel. ExcelInsight ermöglicht es Ihnen, Datenbeziehungen und Entitätsverbindungen in Ihrem Datensatz visuell und direkt in Ihrem Browser zu untersuchen.',
    sections: [
      {
        heading: 'Datenbeziehungen erforschen',
        body: 'Es ist entscheidend zu verstehen, wie verschiedene Entitäten in Ihren Daten zueinander in Beziehung stehen. Obwohl es sich nicht um ein Netzwerkdiagramm-Tool handelt, hilft Ihnen ExcelInsight bei der Durchführung relationaler Analysen, indem es sich wiederholende kategoriale Verbindungen und korrelierende Variablen hervorhebt.',
        bullets: [
          'Gemeinsame Attribute über Datensegmente hinweg identifizieren',
          'Streudiagramme verwenden, um Variablenkorrelationen zu finden',
          'Interaktiv filtern, um Entitätsbeziehungen zu verfolgen',
        ],
      },
      {
        heading: 'Ein visueller Ansatz für Verbindungen',
        body: 'Durch das Cross-Filtering von Diagrammen und die Untersuchung sich wiederholender Werte können Sie Muster und Beziehungen aufdecken, die in einem rohen Raster von Tabellenkalkulationszeilen unmöglich zu erkennen wären.',
      },
    ],
    faqs: [
      {
        q: 'Generiert dieses Tool Node-Link-Netzwerkdiagramme?',
        a: 'Nein, es konzentriert sich auf relationale Datenanalyse durch Cross-Filtering, Korrelationen und kategoriale Aufschlüsselungen anstelle von speziellen Netzwerktopologie-Diagrammen.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft lokal in Ihrem Browser.',
      },
    ],
  },


  'excel-data-visualizer': {
    h1: 'Kostenloser Excel-Daten-Visualisierer',
    intro:
      'Erleben Sie nahtlose Excel-Datenvisualisierung mit ExcelInsight. Dieses kostenlose Online-Visualisierungstool konvertiert Ihre rohen Zeilen und Spalten automatisch in ein umfassendes, interaktives visuelles Dashboard.',
    sections: [
      {
        heading: 'Automatisierte Visualisierung',
        body: 'Sie müssen nicht entscheiden, welches Diagramm am besten zu Ihren Daten passt. Der Excel-Daten-Visualisierer profiliert Ihre Tabelle und wählt automatisch die optimalen Diagramme aus – egal ob Balken-, Linien-, Kreis- oder Streudiagramm.',
        bullets: [
          'Intelligente Diagrammempfehlungen basierend auf Spaltentypen',
          'Interaktive, reaktionsschnelle Visualisierungen',
          'Drag-and-Drop-Dashboard-Anordnung',
        ],
      },
      {
        heading: 'Exportieren Sie Ihre Visualisierungen',
        body: 'Nachdem Sie Ihre Daten visuell erkundet haben, können Sie das gesamte Dashboard als sauberen, mehrseitigen PDF-Bericht exportieren, um Erkenntnisse ganz einfach mit Ihrem Team oder Ihren Stakeholdern zu teilen.',
      },
    ],
    faqs: [
      {
        q: 'Ist die Nutzung dieses Daten-Visualisierers kostenlos?',
        a: 'Ja, ExcelInsight ist völlig kostenlos. Es gibt keine versteckten Kosten oder Abonnementgebühren, um Ihre Daten zu visualisieren und zu exportieren.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft lokal in Ihrem Browser.',
      },
    ],
  },
};
