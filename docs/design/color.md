# Colour

## The idea

One brand hue — **spreadsheet emerald**, `152°` — against a neutral field that is
cool-tinted rather than grey. Light mode is cool paper (`210 25% 97%`), dark mode is
off-black with a violet-blue bias (`240 8% 6%`) rather than neutral `#000`. The 210°
and 240° neutrals are what make the emerald read as *ink on a ledger* instead of
*startup green on grey*.

Emerald appears at two lightnesses: `32%` in light so it can carry white text, `50%`
in dark so it can carry near-black text. That inversion is the whole trick behind the
primary button working in both themes.

## Semantic roles

Pick by **meaning**, never by how the colour looks:

| Role | Use it for | Don't |
|---|---|---|
| `primary` / `accent` | the single most important action in a view; active nav; focus ring | secondary buttons, decorative fills, large tinted areas |
| `secondary` | neutral filled controls sitting next to a primary one | anything that must read as an action |
| `muted` / `muted-foreground` | surface of an inert region; captions, labels, units, helper text | body copy the user must read carefully |
| `destructive` | delete, clear, remove — *and only after* a confirm step | validation warnings, "over budget" data |
| `warning` | recoverable problems; data-quality flags | destructive actions |
| `info` | neutral notices, tips | success |
| `success` | completed work — parse done, export written | primary CTAs (it is nearly `primary`) |
| `chart-1..8` | data marks only | UI chrome, text, borders |

`accent` is an alias of `primary`, so `hover:bg-accent` on a ghost button and the
brand colour are the same hue. If you need a hover that is *not* branded, use
`hover:bg-foreground/5` (what `Button variant="outline"` does).

## Composing with alpha

Tokens are bare channels, so any of these work:

```css
background: hsl(var(--primary) / 0.12);   /* active nav pill */
border-color: hsl(var(--border) / 0.5);   /* hairline that recedes */
color: hsl(var(--foreground) / 0.85);     /* de-emphasised on glass */
```

```tsx
className="bg-primary/12 border-border/50 text-foreground/85"
```

Prefer `text-muted-foreground` over `text-foreground/60` for text: the muted token is
tuned per theme and contrast-checked, an arbitrary alpha is not.

## Measured contrast

WCAG 2.x ratios computed from the token values in `app/globals.css`
(sRGB relative luminance). **Thresholds:** 4.5:1 normal text, 3:1 large text
(≥24px, or ≥18.66px bold) and non-text UI/graphics.

### Light

| Pair | Ratio | |
|---|---|---|
| `foreground` on `background` | **16.71** | ✅ |
| `muted-foreground` on `background` | **5.27** | ✅ |
| `muted-foreground` on `card` | **5.64** | ✅ |
| `primary-foreground` on `primary` (the primary button) | **4.54** | ✅ AA |
| `primary` **as text** on `background` | **4.24** | ⚠️ large text / icons only |
| `destructive-foreground` on `destructive` | **5.60** | ✅ |
| `success-foreground` on `success` | **4.50** | ✅ (exactly at the line) |
| `info-foreground` on `info` | **4.57** | ✅ |
| `warning-foreground` on `warning` | **6.46** | ✅ |

### Dark

| Pair | Ratio | |
|---|---|---|
| `foreground` on `background` | **17.60** | ✅ |
| `muted-foreground` on `background` | **7.35** | ✅ |
| `muted-foreground` on `card` | **6.94** | ✅ |
| `primary-foreground` on `primary` | **10.18** | ✅ |
| `primary` **as text** on `background` | **10.16** | ✅ |
| `destructive-foreground` (white) on `destructive` | **3.73** | ⚠️ fails AA for normal text |

### Default chart palette on the page background

| | light | dark |
|---|---|---|
| `chart-1` emerald | 4.44 | 10.41 |
| `chart-2` sky | 4.27 | 9.11 |
| `chart-3` amber | **3.36** | 11.18 |
| `chart-4` violet | 6.43 | 5.61 |
| `chart-5` rose | 5.51 | 5.61 |
| `chart-6` slate blue | 4.72 | 7.54 |
| `chart-7` orange | 4.24 | 8.22 |
| `chart-8` neutral | 4.36 | 8.52 |

All eight clear 3:1 in both themes, so they are safe as bars, lines and points.
Several sit below 4.5:1 in light mode — **do not print a value label in the series
colour**; use `text-foreground` or `text-muted-foreground` for labels and let colour
carry only the series identity.

### Two things to know about these numbers

- **They describe tokens, not composites.** `hover:bg-primary/90`, `.glass-card`
  (`--card` at 60% over whatever is behind it) and anything on `--gradient-hero`
  composite at runtime and can land lower. Check those in the browser.
- **The August 2026 audit's 2.88:1 primary-button finding is fixed.** That
  measurement predates the theme revamp; light `--primary` is now `152 65% 32%`,
  giving 4.54:1 against white. See [accessibility.md](accessibility.md).

## Recomputing after a change

```bash
node -e 'const h=(H,S,L)=>{H/=360;S/=100;L/=100;const k=(p,q,t)=>{t<0&&(t+=1);t>1&&(t-=1);return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p};const q=L<.5?L*(1+S):L+S-L*S,p=2*L-q;return S?[k(p,q,H+1/3),k(p,q,H),k(p,q,H-1/3)]:[L,L,L]};const l=c=>{const f=v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4;return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};const r=(a,b)=>{const x=l(h(...a)),y=l(h(...b)),hi=Math.max(x,y),lo=Math.min(x,y);return ((hi+.05)/(lo+.05)).toFixed(2)};console.log(r([152,65,32],[0,0,100]))'
```

Swap the two HSL triples for the pair you changed, then update the tables above.
