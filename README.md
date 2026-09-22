# CypherMax website

Static site built from `CypherMax-Website-Content.md` (spec v2.0). Plain HTML, CSS
and vanilla JS — no build step, no framework, no backend.

## Running it

**Double-click `index.html`.** That is the whole setup — no server, no build step.

Every path in the site is relative, and every internal link ends in an explicit
`index.html`, so the site runs unchanged from:

- a local `file://` double-click,
- a GitHub Pages **user** site (`username.github.io`),
- a GitHub Pages **project** site (`username.github.io/repo/`), where the whole
  site sits under a sub-path,
- any normal web root (Netlify, Cloudflare Pages, nginx, S3).

The chrome that JS injects (header, footer, links) resolves the same way: `site.js`
derives its base from its own `<script src>`, so it never needs to know where the
site is mounted.

### Deploying to GitHub Pages

Push the contents of `site/` to the branch Pages serves (commonly `main` with
"/ (root)", or the `gh-pages` branch). `.nojekyll` is included so Pages serves the
files as-is instead of running them through Jekyll, and `404.html` is picked up
automatically.

Two things to fix when it becomes the real site rather than a preview:

- **Canonical URLs.** Every page carries `<link rel="canonical">` and `og:url`
  pointing at `https://cyphermaxsg.com/...`, which is the production domain in the
  spec. If you attach that custom domain to Pages, they are already correct. If
  Pages is the permanent home instead, rewrite them to the Pages URL — otherwise
  you are telling search engines the real page lives somewhere it does not.
- **Clean URLs.** Links point at `.../index.html` so `file://` works. On Pages the
  directory form (`/solutions/cloudops`) also resolves, so you can drop the
  `index.html` suffix from links if you would rather have the shorter URLs — at
  which point double-clicking stops working. `sitemap.xml` already lists the clean
  form.

## Layout

```
site/
  index.html                       Home
  solutions/index.html             Solutions hub
  solutions/<service>/index.html   6 service pages
  about/  contact/  privacy/  terms/  thank-you/
  404.html  sitemap.xml  robots.txt
  assets/css/style.css             Design system — all tokens on :root
  assets/js/params.js              ← every number and contact detail lives here
  assets/js/marks.js               Brand mark path data
  assets/js/site.js                Header, footer, CTA band, logo/model walls, stats, FAQ, cookie banner
  assets/js/form.js                Contact form validation
  assets/favicon.svg
```

Page copy is static HTML. Only the repeating chrome is injected by `site.js`, so
every page still reads and crawls without JS.

## Changing numbers

**Everything numeric is in `assets/js/params.js`.** Nothing is typed into a page.
Edit that one file and reload — no rebuild.

The empty-parameter rule is implemented and tested: **set a parameter to `''` and
the thing that displays it disappears entirely** — no zero, no dash, no empty tile,
no dangling sentence. Blank all four metrics and the stats band does not render at
all; the CloudOps uptime section and the FinOps target section remove themselves;
the hero sentences that mention them fall back to versions that read correctly
without a figure.

Some labels are load-bearing and must not be shortened to fit a layout — make the
tile bigger instead. `params.js` says which, and why.

## Deliberately not built

These are left out on purpose, not forgotten. Each one is marked with an HTML
comment at the place it would go, explaining what has to be true first.

| Not built | Why |
|---|---|
| Contact form delivery | No backend. The form validates, guards against bots and redirects to `/thank-you`, but **sends nothing**. See the header comment in `form.js` for the five things needed before launch. |
| Capability matrix (Solutions) | Needs actual resale authorisation per product per platform. The spec is explicit: do not guess, and do not mark a cell supported to make the table look complete. |
| GPT card (AIaaS) | Ships `enabled: false`. OpenAI is not one of the six partners, and the usual route is Azure, which is out of scope. Three options in `params.js`; one must be picked. |
| Team section (About) | Directors are named on a public ACRA filing; that is not consent to appear on a website. Ask first. |
| Certifications (About) | A company incorporated in August 2026 holds none yet. A hedged compliance section invites the scrutiny it is trying to avoid. |
| Customer proof (Home) | Built but gated behind `features.customerProof`. Do not enable without a written, approved reference. |
| Analytics | No tool chosen. `loadAnalytics()` in `site.js` is the hook, and it only runs after consent. |

## Deviations from the spec

Deliberate, at the client's request — listed so a reviewer checking against the
spec does not read them as mistakes.

- **Header nav is Solutions · About Us · Contact Us**, centred, all three as plain
  links. Spec 3.1 puts the phone number in the bar and makes Contact a "Talk to
  Us" button. The number is gone from the header and from the expanded mobile
  menu; it is still in the footer and on the Contact page, and every instance is a
  tappable `tel:` link. Note there is now no visually distinct CTA in the header —
  Contact Us reads the same as the other two links.
- **Partner logo walls render on dark, using monochrome marks.** Spec 3.4 asks for
  full-colour marks on a light background, which assumed a light site. If that
  treatment is required, the wall needs its own light section.
- **The partner wall is a moving marquee, not a static grid.** Spec 3.4 asks for a
  2 × 3 grid on mobile specifically so no logo is ever partially cut off; a
  marquee always has partial cells at its edges. The edge mask makes that read as
  intentional, but it is a deliberate departure from the spec's reasoning.

## Before this goes live

Blocking items from the spec's TBD register, in rough order of lead time:

1. **DPO name and a monitored `dpo@` address** — the Privacy Policy cannot publish
   without it (PDPA requires publicly available DPO contact info).
2. **Legal review of `/privacy` and `/terms`**, and a liability clause drafted by a
   Singapore-qualified lawyer. Both pages carry a visible "draft" banner until then;
   clear it with `features.legalDraftNotice: false`.
3. **Uptime commitment** — measurement window, exclusions and remedy, confirmed in
   the service agreement and supported by the partner SLAs beneath it. If it cannot
   be met, set `metrics.uptimeSla` to `''` and everything that quotes it disappears.
4. **Partner logo compliance.** The marks in `marks.js` come from Simple Icons, not
   from each partner's brand centre. Confirm each against its owner's current
   guidelines and swap in the official asset. Tencent Cloud and BytePlus have no
   mark and render as wordmarks; the AI model brands are a separate permission
   question from the six cloud partners.
5. **Real logo assets.** The shield in `site.js` and `favicon.svg` is a redraw of
   the supplied JPG, not the designer's artwork. Replace when the SVG arrives,
   along with a proper favicon set and a 1200×630 OG image at
   `/assets/og-image.png` (referenced but not yet present).
6. **SSIC codes vs. the DDoS offering** — registered activity excludes
   cybersecurity. Raise with the corporate secretary.
7. **SPF, DKIM and DMARC** on `cyphermaxsg.com` before any mail is sent from it.

## Notes on the build

- **Type:** Space Grotesk (headings) + Inter (body), from Google Fonts. The
  reference site uses Rebond Grotesque, which is a licensed commercial face and
  cannot be used without buying it. Consider self-hosting both before launch — the
  spec flags data-protection questions with font CDNs in some jurisdictions.
- **Colour:** deep violet-black (`#0a0118`) with a `#713dff` accent, following the
  reference directly. All tokens are on `:root` in `style.css`. Note this is warmer
  than the navy shield mark — the brand hex values are still unconfirmed (B8), and
  when they land expect to retune `--accent` and the hero glow together, since the
  glow is built from the accent family.
- **The home hero horizon** is four stacked layers in `.hero__sky`: a starfield,
  concentric rings, the dark disc, and a bloom on its apex. The disc is anchored by
  `--horizon-apex` (72% down on desktop, 80% at tablet, 88% on phones, and lower
  again on inner pages), so its rim always lands below the CTAs. The disc fill is
  deliberately darker than the page — that contrast is what makes the rim read as
  a lit edge.
- **Starfield:** three tiled layers at co-prime sizes so the repeat never reads as
  a grid. Layer 1 is static dust; layers 2 and 3 twinkle on different cycles, and
  layer 3's dots are larger with a wide violet halo. Density is set by the tile
  sizes — smaller tiles mean more stars.
- **No seam under the horizon.** The hero clips its sky, which would otherwise cut
  the disc and its glow off with a hard horizontal line. Rather than covering that
  with a fixed-height gradient, `.hero__sky` is masked out entirely before it
  reaches the hero's bottom edge, keyed to the same `--horizon-apex` the disc is
  positioned with — so there is nothing left to cut at any apex or viewport. Inner
  pages additionally drop the disc's fill, leaving only the lit arc.
- **The horizon light animates:** the bloom breathes on a 9s cycle, and a second
  highlight glides along the rim on an 11s cycle. The two periods are deliberately
  not multiples of each other, so the motion never visibly loops.
- **Controls are frosted glass:** translucent fill, `backdrop-filter` blur, a
  hairline border and an inset top highlight. The primary button is the same
  treatment with a violet tint rather than a flat opaque fill.
- **Light travels around button borders:** a conic gradient rotated via an
  `@property`-registered angle, masked down to the 1px border ring with
  `mask-composite`. The primary CTA flows continuously; quieter buttons flow on
  hover/focus, so a page full of buttons does not shimmer at once. Where
  `@property` or `mask-composite` is missing the effect is skipped entirely and
  the static glass border remains.
- **Card hover** lifts the card 6px, warms the border, pools a violet glow beneath
  it, sweeps the top-edge highlight open, and runs a soft spotlight that follows
  the cursor. The spotlight is a *background* layer, not an overlay, so it never
  sits on top of the text; `initCardSpotlight()` feeds it `--mx`/`--my` from one
  delegated `pointermove` written inside rAF, and skips touch devices entirely.
- **The partner wall scrolls leftwards.** The set of six is emitted twice and the
  track translated by exactly one set's width plus one gap, which is what makes
  the loop seamless — a flat `-50%` would drift by half a gap each cycle. The
  second copy is `aria-hidden`, the edges are masked so cells fade rather than
  being chopped, and the animation pauses on hover.

  Note the reveal-on-scroll animation uses the independent `translate` property
  rather than `transform`. That is deliberate: `[data-reveal].is-visible` and
  `.card--hover:hover` have identical specificity, so a `transform: none` there
  silently cancelled the hover lift. Keep them on separate properties.

All of the above stops under `prefers-reduced-motion: reduce`, and every animation
ends on a sensible static frame.
- Accessibility: skip link, visible focus, labelled fields, errors announced not
  just coloured, heading order checked, 44px tap targets, `prefers-reduced-motion`
  honoured, no horizontal scroll at 375px.
