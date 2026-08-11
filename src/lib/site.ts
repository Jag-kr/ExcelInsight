/**
 * Canonical site-wide constants.
 *
 * SITE_URL was previously written as a literal in both app/layout.tsx and
 * app/[slug]/page.tsx; it lives here now so metadata, structured data and the
 * footer cannot drift apart.
 */
export const SITE_URL = 'https://excelinsight.xyz';

/** Public contact address, shown in the footer and named in the legal pages. */
export const CONTACT_EMAIL = 'hello@excelinsight.xyz';

/** Public source repository — ExcelInsight is open source. */
export const GITHUB_URL = 'https://github.com/Jag-kr/ExcelInsight';
