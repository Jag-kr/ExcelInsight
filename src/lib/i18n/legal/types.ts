export interface LegalSection {
  heading: string;
  body: string; // may contain simple HTML (<strong>, <a>, <code>, <ul><li>)
}

export interface LegalDoc {
  title: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  sections: LegalSection[];
  backToApp: string;
  otherDocLinkLabel: string; // label for the cross-link at the bottom
}

export interface LegalContent {
  privacy: LegalDoc;
  terms: LegalDoc;
}
