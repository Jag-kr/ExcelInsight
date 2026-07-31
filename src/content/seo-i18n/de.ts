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

  'excel-chart-generator': {
    h1: 'Online-Diagrammgenerator für Excel',
    intro:
      'ExcelInsight ist ein kostenloser Diagrammgenerator für Excel. Laden Sie eine .xlsx-, .xls- oder .csv-Datei hoch und erhalten Sie sofort Balken-, Linien-, Kreis-, Streu-, Flächen-, Radar- und horizontale Balkendiagramme. Anpassbar, thematisierbar und als PNG exportierbar.',
    sections: [
      {
        heading: 'Sieben Diagrammtypen für 90 % aller Reporting-Anforderungen',
        body: 'ExcelInsight unterstützt die wichtigsten Diagrammtypen, die in Berichten und Präsentationen benötigt werden.',
        bullets: [
          'Balkendiagramm und horizontales Balkendiagramm',
          'Liniendiagramm und Flächendiagramm',
          'Kreisdiagramm',
          'Streudiagramm',
          'Radardiagramm',
        ],
      },
      {
        heading: 'Thematisiert, exportierbar und einbettbar',
        body: 'Integrierte Farbpaletten, Hover-Tooltips und direkter Export als PNG oder PDF machen ExcelInsight zur vollständigen Lösung für Diagrammerstellung und Präsentation.',
      },
    ],
    faqs: [
      {
        q: 'Kann ich Farben anpassen?',
        a: 'Ja – wählen Sie aus integrierten Farbpaletten.',
      },
      {
        q: 'Ist der Diagrammgenerator kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alle Verarbeitung erfolgt lokal im Browser.',
      },
      {
        q: 'Kann ich Diagramme aus bestimmten Spalten erstellen?',
        a: 'Ja – wählen Sie im Tab „Erstellen" gezielt Spalten für X- und Y-Achse aus.',
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
          'Funktioniert auch offline – kein Server erforderlich',
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

  'bar-chart-maker': {
    h1: 'Kostenloses Online-Balkendiagramm-Tool',
    intro:
      'ExcelInsight ist ein kostenloses Balkendiagramm-Tool. Laden Sie eine Excel- oder CSV-Datei hoch und ExcelInsight erstellt automatisch vertikale oder horizontale Balkendiagramme aus Ihren Daten.',
    sections: [
      {
        heading: 'Wann ein Balkendiagramm die richtige Wahl ist',
        body: 'Balkendiagramme eignen sich ideal, um einen numerischen Wert über Kategorien hinweg zu vergleichen – zum Beispiel Umsatz nach Region oder Anmeldungen nach Quelle.',
      },
      {
        heading: 'So erstellt ExcelInsight Balkendiagramme',
        body: 'ExcelInsight erkennt automatisch kategoriale Spalten und kombiniert sie mit numerischen Spalten zu aussagekräftigen Balkendiagrammen.',
        bullets: [
          'Vertikal und horizontal – je nach Datenmenge und Leserlichkeit',
          'Multi-Series gruppiert für Vergleiche über mehrere Kategorien',
          'Auswählbare Farbpaletten für professionelle Optik',
          'Export als PNG oder PDF',
        ],
      },
    ],
    faqs: [
      {
        q: 'Kann ich gestapelte Balkendiagramme erstellen?',
        a: 'Gruppierte Balkendiagramme sind bereits verfügbar; gestapelte Balken sind in Planung.',
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

  'pie-chart-maker': {
    h1: 'Kostenloses Online-Kreisdiagramm-Tool',
    intro:
      'ExcelInsight ist ein kostenloses Kreisdiagramm-Tool. Verwandeln Sie jede kategoriale Spalte in ein beschriftetes Kreisdiagramm, das den Anteil am Ganzen auf einen Blick zeigt.',
    sections: [
      {
        heading: 'Wann ein Kreisdiagramm die richtige Wahl ist',
        body: 'Kreisdiagramme funktionieren am besten mit fünf oder weniger Kategorien und wenn Sie den Anteil einzelner Segmente am Gesamtwert kommunizieren möchten.',
      },
      {
        heading: 'Intelligente Standardwerte für sofortige Lesbarkeit',
        body: 'Segmente werden automatisch nach Größe geordnet, hohe Kontrastfarben gewährleisten gute Lesbarkeit, und Prozentbeschriftungen werden automatisch gesetzt.',
      },
    ],
    faqs: [
      {
        q: 'Kann ich zu einem Donut-Diagramm wechseln?',
        a: 'Donut-Varianten sind in Planung. Heute können Sie das Kreisdiagramm mit einem Klick in ein Balken-, Linien- oder Flächendiagramm umwandeln.',
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

  'scatter-plot-generator': {
    h1: 'Kostenloses Online-Streudiagramm-Tool',
    intro:
      'ExcelInsight ist ein kostenloses Streudiagramm-Tool. Wählen Sie zwei numerische Spalten aus und ExcelInsight zeichnet sofort ein Streudiagramm, mit dem Sie Korrelationen, Ausreißer und Cluster erkennen können – ganz ohne Python oder R.',
    sections: [
      {
        heading: 'Korrelationen in Sekunden finden',
        body: 'Tausende Datenpunkte werden flüssig gerendert. Hover-Tooltips zeigen die genauen X/Y-Werte jedes Punktes für eine präzise Datenanalyse.',
      },
      {
        heading: 'Ausreißer und Cluster auf einen Blick erkennen',
        body: 'Anomalien und Muster in Ihren Daten springen visuell ins Auge – ohne aufwendige statistische Vorarbeit.',
      },
    ],
    faqs: [
      {
        q: 'Wie viele Datenpunkte werden unterstützt?',
        a: 'Mehrere Tausend Punkte laufen flüssig. Bei mehr als ~10.000 Punkten hängt die Performance vom verwendeten Gerät ab.',
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

  'sales-dashboard-template': {
    h1: 'Kostenlose Sales-Dashboard-Vorlage',
    intro:
      'ExcelInsight erstellt automatisch ein funktionierendes Sales-Dashboard, sobald Sie eine Sales-Tabelle hochladen – mit Pipeline nach Stufe, Umsatz über Zeit, Top-Accounts, Vertreter-Performance und Deal-Anzahl.',
    sections: [
      {
        heading: 'Was das Dashboard enthält',
        body: 'ExcelInsight sucht automatisch nach Spalten wie Stage, Amount, Owner, Account, Close Date und ARR und erstellt daraus ein vollständiges Sales-Dashboard.',
        bullets: [
          'Umsatz und ARR über Zeit als Liniendiagramm',
          'Pipeline-Verteilung nach Stufe',
          'Top-Accounts und leistungsstärkste Vertreter',
          'Win Rate und Deal-Anzahl als KPI-Kacheln',
        ],
      },
      {
        heading: 'So verwenden Sie die Vorlage',
        body: 'Exportieren Sie Ihre Daten aus Salesforce, HubSpot, Pipedrive oder Close als CSV, laden Sie die Datei in ExcelInsight, passen Sie das Layout an und exportieren Sie das PDF für Ihr nächstes Meeting.',
      },
    ],
    faqs: [
      {
        q: 'Muss ich meine Sales-Daten vor dem Hochladen formatieren?',
        a: 'Nein – ExcelInsight verarbeitet rohe CRM-Exporte direkt, ohne Vorformatierung.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft im Browser, Ihre Daten verlassen das Gerät nie.',
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

  'startup-kpi-dashboard': {
    h1: 'Startup-KPI-Dashboard',
    intro:
      'ExcelInsight ist der schnellste Weg, eine Startup-Metriken-Tabelle in ein investorenreifes KPI-Dashboard zu verwandeln. MRR, ARR, Wachstumsrate, Retention, Burn und Runway – laden Sie Ihre wöchentliche Metriken-Datei hoch und das Dashboard erscheint sofort.',
    sections: [
      {
        heading: 'Für wöchentliche Metriken-Reviews',
        body: 'Gründer verfolgen Metriken in Tabellen – ExcelInsight liefert eine professionelle Ansicht für Board-Updates und Investor-Calls. Exportieren Sie in Sekunden ein PDF für Ihre nächste Präsentation.',
      },
      {
        heading: 'Investorenreife Exports',
        body: 'Saubere Titelseite, ein Diagramm pro Seite – ein professionell wirkendes Artefakt für monatliche Investor-Updates, das in Minuten erstellt ist.',
      },
    ],
    faqs: [
      {
        q: 'Kann ich das Dashboard jede Woche aktualisieren?',
        a: 'Ja – fügen Sie neue Zeilen in Ihre Tabelle ein, laden Sie die Datei erneut hoch und das Dashboard wird automatisch regeneriert.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft im Browser, Ihre Daten verlassen das Gerät nie.',
      },
    ],
  },

  'manufacturing-report-dashboard': {
    h1: 'Fertigungs-Bericht-Dashboard',
    intro:
      'ExcelInsight verwandelt Produktionsliniendaten in saubere Fertigungs-Dashboards. Durchsatz, Ausfallzeit, Fehlerquote, OEE-Aufschlüsselungen und Schichtvergleiche – automatisch aus Ihrem täglichen oder wöchentlichen Produktions-Export generiert.',
    sections: [
      {
        heading: 'Hallentauglich ohne IT-Unterstützung',
        body: 'Fertigungsdaten liegen oft in Excel-Sheets aus MES- oder SCADA-Systemen vor. ExcelInsight liest diese Exports und gibt Werksleitern ein sofort nutzbares Dashboard – ohne IT-Ticket, ohne Wartezeit.',
      },
      {
        heading: 'Fehler und Ausreißer schnell erkennen',
        body: 'Streudiagramm für Zykluszeit vs. Fehlerquote, Balkendiagramm für Linienleistung und eine Datenqualitäts-Kachel helfen, Probleme auf einen Blick zu identifizieren.',
      },
    ],
    faqs: [
      {
        q: 'Funktioniert ExcelInsight offline auf einem Hallenlaptop?',
        a: 'Ja – nach dem ersten Laden läuft ExcelInsight vollständig clientseitig, auch ohne Internetverbindung.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alles läuft lokal im Browser.',
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

  'plot-excel-data': {
    h1: 'Excel-Daten online darstellen',
    intro:
      'ExcelInsight macht es unglaublich einfach, Excel-Daten online darzustellen. Laden Sie Ihre Datei hoch und ExcelInsight stellt automatisch Balkendiagramme, Liniendiagramme und Streudiagramme dar – keine Diagrammeinstellungen zu konfigurieren.',
    sections: [
      {
        heading: 'Diagramme ohne Aufwand erstellen',
        body: 'ExcelInsight analysiert Ihre Spalten und wählt sofort die passende Visualisierung aus. Probieren Sie verschiedene Diagrammtypen per Klick durch, ohne die Datei erneut hochladen zu müssen.',
        bullets: [
          'Liniendiagramme für Zeitreihen und Trendverläufe',
          'Streudiagramme zur Korrelationsanalyse',
          'Balken- und Kreisdiagramme für kategoriale Vergleiche',
        ],
      },
      {
        heading: 'Exportieren und teilen',
        body: 'Exportieren Sie einzelne Diagramme als PNG oder das gesamte Dashboard als mehrseitiges PDF – für Präsentationen, Berichte oder schnelle Weitergabe.',
      },
    ],
    faqs: [
      {
        q: 'Können auch CSV-Dateien dargestellt werden?',
        a: 'Ja – ExcelInsight unterstützt sowohl Excel-Dateien (.xlsx, .xls) als auch CSV.',
      },
      {
        q: 'Ist das Tool kostenlos?',
        a: 'Ja, vollständig kostenlos.',
      },
      {
        q: 'Sind meine Daten privat?',
        a: 'Ja – alle Verarbeitung findet lokal im Browser statt.',
      },
    ],
  },

  'make-bar-graph-from-excel': {
    h1: 'Balkendiagramm aus Excel erstellen',
    intro:
      'Fragen Sie sich, wie Sie online kostenlos ein Balkendiagramm aus Excel erstellen können? ExcelInsight macht es unglaublich einfach. Ziehen Sie einfach Ihre Excel-Datei in Ihren Browser und sehen Sie zu, wie in Sekundenschnelle atemberaubende Balkendiagramme ohne komplexe Einrichtung automatisch generiert werden.',
    sections: [
      {
        heading: 'Balkendiagramme mühelos erstellen',
        body: 'Sie müssen keine Stunden mehr damit verbringen, Achseneinstellungen in Excel zu konfigurieren. ExcelInsight analysiert Ihre Daten automatisch und strukturiert das perfekte Balkendiagramm für jede kategoriale Aufschlüsselung.',
        bullets: [
          'Erstellen Sie sofort ein Balkendiagramm aus Excel',
          'Automatische Spaltenerkennung für Kategorien und Werte',
          'Exportieren Sie direkt nach PNG oder als vollständigen PDF-Bericht',
        ],
      },
      {
        heading: '100 % privat und sicher',
        body: 'Ihre Datenprivatsphäre ist garantiert. Da ExcelInsight vollständig in Ihrem Browser läuft, können Sie sensible Tabellen sicher visualisieren, ohne dass sie jemals auf einen Server hochgeladen werden.',
      },
    ],
    faqs: [
      {
        q: 'Wie erstelle ich ein Balkendiagramm aus einer Excel-Datei?',
        a: 'Laden Sie einfach Ihre .xlsx- oder .csv-Datei in ExcelInsight hoch. Es erkennt sofort Ihre Spalten und generiert wunderschöne Balkendiagramme ohne Formeln oder Pivot-Tabellen.',
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

  'excel-chart-maker': {
    h1: 'Kostenloser Online-Excel-Diagrammersteller',
    intro:
      'ExcelInsight ist ein leistungsstarker Excel-Diagrammersteller. Egal, ob Sie Balken-, Linien-, Kreis- oder Streudiagramme benötigen, Sie können diese sofort erstellen, indem Sie Ihre Tabelle in unser sicheres, browserbasiertes Tool hochladen.',
    sections: [
      {
        heading: 'Diagramme ohne Aufwand erstellen',
        body: 'Überspringen Sie die steile Lernkurve herkömmlicher Tabellenkalkulationssoftware. Unser Excel-Diagrammersteller ordnet Ihre Daten automatisch den am besten geeigneten visuellen Formaten zu und spart Ihnen so Zeit und Mühe.',
        bullets: [
          'Unterstützt alle wichtigen Diagrammtypen: Balken, Linie, Kreis, Fläche und Streu',
          'Keine Formeln, keine Pivot-Tabellen erforderlich',
          'Anpassbare Designs und Farben',
        ],
      },
      {
        heading: 'Perfekt für Präsentationen',
        body: 'Benötigen Sie ein Diagramm für ein Foliendeck oder einen Bericht? Nutzen Sie diesen Diagrammersteller, um schnell professionell aussehende Grafiken zu generieren und sie mit nur einem Klick in hoher Auflösung zu exportieren.',
      },
    ],
    faqs: [
      {
        q: 'Was macht dies zum besten Excel-Diagrammersteller?',
        a: 'Es erfordert keine Einrichtung, läuft aus Datenschutzgründen vollständig lokal in Ihrem Browser und wählt automatisch die besten Diagrammtypen für Ihre Daten aus.',
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

  'csv-to-line-graph': {
    h1: 'CSV in Liniendiagramm online konvertieren',
    intro:
      'Möchten Sie eine CSV online in ein Liniendiagramm konvertieren? ExcelInsight parst Ihre kommagetrennten Werte und stellt sie als wunderschöne Multi-Series-Liniendiagramme in Ihrem Browser dar, und das völlig kostenlos.',
    sections: [
      {
        heading: 'Zeitreihendaten sofort darstellen',
        body: 'Wenn Ihre CSV eine Datumsspalte und numerische Werte enthält, erkennt ExcelInsight diese automatisch. Es zeichnet glatte Liniendiagramme, sodass Sie Trends, Website-Verkehr oder finanzielle Leistung im Zeitverlauf verfolgen können.',
        bullets: [
          'Automatische Erkennung von Datumsformaten',
          'Mehrere numerische Reihen in einem Diagramm vergleichen',
          'Interaktive Hover-Tooltips für genaue Werte',
        ],
      },
      {
        heading: 'Exportieren und teilen',
        body: 'Sobald Sie Ihre CSV in ein Liniendiagramm konvertiert haben, können Sie die Visualisierung ganz einfach als PNG-Bild exportieren oder in einen vollständigen PDF-Dashboard-Bericht integrieren.',
      },
    ],
    faqs: [
      {
        q: 'Wie konvertiere ich eine CSV in ein Liniendiagramm?',
        a: 'Ziehen Sie einfach Ihre CSV-Datei in ExcelInsight. Das Tool identifiziert Datums- und numerische Spalten, um automatisch ein interaktives Liniendiagramm zu generieren.',
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

  'free-dashboard-software-excel': {
    h1: 'Kostenlose Dashboard-Software für Excel',
    intro:
      'Wenn Sie nach kostenloser Dashboard-Software für Excel suchen, ist ExcelInsight die perfekte Lösung. Es läuft vollständig in Ihrem Browser und erfordert keine Installation, keine Anmeldung und keine kostenpflichtigen Lizenzen.',
    sections: [
      {
        heading: 'Eine leichtgewichtige BI-Alternative',
        body: 'Enterprise-BI-Tools sind teuer und komplex einzurichten. ExcelInsight bietet die wesentlichen Dashboarding-Funktionen, die Sie benötigen – Drag-and-Drop-Layout, mehrere Diagrammtypen und Filterung – und das alles kostenlos.',
        bullets: [
          'Keine Installation erforderlich',
          'Funktioniert unter Windows, Mac und Linux',
          '100 % kostenlos ohne versteckte Paywalls',
        ],
      },
      {
        heading: 'Sicher und privat',
        body: 'Im Gegensatz zu anderer Cloud-Dashboard-Software verarbeitet ExcelInsight alles clientseitig. Ihre Excel-Daten bleiben strikt auf Ihrem Gerät und gewährleisten absolute Privatsphäre für sensible Geschäftsinformationen.',
      },
    ],
    faqs: [
      {
        q: 'Ist diese Dashboard-Software wirklich kostenlos?',
        a: 'Ja, ExcelInsight kann völlig kostenlos genutzt werden. Es gibt keine Premium-Stufen, Abonnements oder Funktionseinschränkungen.',
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

  'learn-excel-data-analysis': {
    h1: 'Excel-Datenanalyse kostenlos lernen',
    intro:
      'Wenn Sie Excel-Datenanalyse kostenlos lernen möchten, ist ExcelInsight die perfekte Sandbox-Umgebung. Laden Sie einen Datensatz hoch und lernen Sie interaktiv, wie verschiedene Datentypen in aussagekräftige Diagramme und Erkenntnisse übersetzt werden.',
    sections: [
      {
        heading: 'Eine praxisnahe Lernerfahrung',
        body: 'Der beste Weg, Datenanalyse zu lernen, ist durch Handeln. Wenn Sie eine Tabelle in ExcelInsight ablegen, sehen Sie sofort, wie rohe Zeilen und Spalten in umsetzbare Business Intelligence transformiert werden.',
        bullets: [
          'Sehen Sie, wie sich Datenstrukturen auf Visualisierungsoptionen auswirken',
          'Lernen Sie, Trends und Ausreißer visuell zu identifizieren',
          'Korrelation durch Streudiagramme verstehen',
        ],
      },
      {
        heading: 'Kein Risiko, Formeln zu zerstören',
        body: 'Im Gegensatz zur Arbeit in einer komplexen Mastertabelle bietet ExcelInsight eine schreibgeschützte visuelle Ebene über Ihren Daten. Sie können mit verschiedenen Diagrammtypen und Aggregationen experimentieren, ohne Ihre Quelldatei zu verändern.',
      },
    ],
    faqs: [
      {
        q: 'Eignet sich dieses Tool für Schüler, die Datenanalyse lernen?',
        a: 'Absolut. Es bietet eine intuitive, visuelle Möglichkeit, Datenverteilungen, Beziehungen und grundlegende Statistiken zu verstehen, ohne vorher komplexe Software erlernen zu müssen.',
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

  'line-graph-maker-excel': {
    h1: 'Liniendiagramm-Ersteller für Excel',
    intro:
      'ExcelInsight ist ein dedizierter Liniendiagramm-Ersteller für Excel. Es ermöglicht Ihnen, präzise, mehrreihige Liniendiagramme direkt aus Ihren Tabellenkalkulationen in Sekundenschnelle zu erstellen, ohne dass Software-Downloads erforderlich sind.',
    sections: [
      {
        heading: 'Perfekt für die Verfolgung von Trends',
        body: 'Liniendiagramme sind der Standard für die Visualisierung von Veränderungen im Laufe der Zeit. Unser Tool analysiert Datumsspalten automatisch und zeichnet Ihre Metriken nahtlos, sodass Sie sich auf die Analyse des Trends anstatt auf die Formatierung der Achse konzentrieren können.',
        bullets: [
          'Verarbeitet mehrere Datumsformate automatisch',
          'Zeichnet mehrere numerische Spalten in einem einzigen Diagramm',
          'Saubere, anpassbare Designs',
        ],
      },
      {
        heading: 'Mit Leichtigkeit exportieren',
        body: 'Sobald Sie Ihr Liniendiagramm angepasst haben, können Sie es als hochwertiges PNG für Ihre Präsentationen herunterladen oder als Teil eines umfassenden PDF-Dashboard-Berichts einfügen.',
      },
    ],
    faqs: [
      {
        q: 'Wie geht der Liniendiagramm-Ersteller mit verschiedenen Datumsformaten um?',
        a: 'Das Tool verfügt über einen robusten Parser, der gängige Datumsformate (wie TT.MM.JJJJ oder ISO 8601) automatisch erkennt und standardisiert, um eine genaue chronologische Achse zu erstellen.',
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

  'hr-analytics-excel': {
    h1: 'Kostenlose HR-Analytics-Excel-Vorlage',
    intro:
      'Visualisieren Sie Ihre Belegschaftsdaten sofort mit unserer Excel-Vorlage für HR-Analytics. ExcelInsight verwandelt Ihre standardmäßigen HR-Exporte in ein umfassendes People-Analytics-Dashboard und hält Ihre Daten dabei streng geheim.',
    sections: [
      {
        heading: 'Optimieren Sie Ihre People Analytics',
        body: 'Laden Sie Ihre Mitarbeiterliste hoch und generieren Sie sofort Diagramme, die die Personalstärke, die Abteilungsverteilung und die Bindungsraten verfolgen. Es fungiert als dynamische HR-Analytics-Excel-Vorlage ohne die anfälligen Formeln.',
        bullets: [
          'Personalstärke und Abteilungswachstum verfolgen',
          'Verweildauer- und Fluktuationstrends analysieren',
          'Diversitätskennzahlen visuell identifizieren',
        ],
      },
      {
        heading: '100 % sicher für sensible Daten',
        body: 'HR-Daten sind streng vertraulich. Da ExcelInsight alles clientseitig in Ihrem Browser verarbeitet, werden Ihre Mitarbeiterinformationen niemals auf einen externen Server hochgeladen.',
      },
    ],
    faqs: [
      {
        q: 'Muss ich meine HR-Daten auf eine bestimmte Weise formatieren?',
        a: 'Stellen Sie einfach sicher, dass Ihre Datei eindeutige Spaltenüberschriften wie Abteilung, Einstellungsdatum oder Status hat. Das Tool ordnet sie automatisch den besten Visualisierungen zu.',
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

  'radar-chart-maker': {
    h1: 'Kostenloser Online-Radardiagramm-Ersteller',
    intro:
      'ExcelInsight verfügt über einen leistungsstarken Radardiagramm-Ersteller (oder Netzdiagramm) zum gleichzeitigen Vergleich mehrerer Variablen. Laden Sie Ihre Daten hoch, um detaillierte Radardiagramme zu generieren, die Leistungsprofile und mehrdimensionale Metriken hervorheben.',
    sections: [
      {
        heading: 'Mehrdimensionale Daten visualisieren',
        body: 'Radardiagramme (oder Netzdiagramme) eignen sich ideal, um eine Entität über mehrere verschiedene Kategorien hinweg gleichzeitig zu vergleichen, z. B. bei der Bewertung von Mitarbeiterfähigkeiten, Produktfunktionen oder Umfrageergebnissen.',
        bullets: [
          'Mehrere Profile in einem einzigen Diagramm vergleichen',
          'Skaliert Achsen automatisch für eine ausgewogene Visualisierung',
          'Anpassbare Farben und Designs',
        ],
      },
      {
        heading: 'Schnelle und private Generierung',
        body: 'Erstellen Sie Ihre Radardiagramme sicher in Ihrem Browser. Da keine Server-Uploads erforderlich sind, können Sie proprietäre Geschäftsprofile sicher analysieren und die Ergebnisse als PDF oder PNG exportieren.',
      },
    ],
    faqs: [
      {
        q: 'Wann sollte ich ein Radardiagramm verwenden?',
        a: 'Radardiagramme werden am besten verwendet, wenn Sie multivariate Daten in Form eines zweidimensionalen Diagramms von drei oder mehr quantitativen Variablen darstellen müssen, die auf Achsen dargestellt werden, die vom selben Punkt ausgehen.',
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
