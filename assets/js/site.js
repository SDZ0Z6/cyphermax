/* CypherMax — shared components and behaviour.
 *
 * Renders the chrome that repeats across pages (header, footer, CTA band,
 * partner wall, stats band) from the single config in params.js, and wires up
 * the interactive bits (dropdown, mobile nav, FAQ, cookie banner, form).
 *
 * Page content itself lives in static HTML — only the chrome is injected — so
 * every page is still readable and crawlable without executing this file.
 */
(function () {
  'use strict';

  var P = window.CYPHERMAX_PARAMS;
  var MARKS = window.CYPHERMAX_MARKS || {};

  /* Every injected link is built from BASE, which is derived from this file's
     own <script src>. That src is already written relative to the page, so the
     site works identically from a file:// double-click, from a GitHub Pages
     project site under /repo/, and from a domain root — with no configuration.
     Links end in an explicit index.html because file:// does not serve
     directory indexes. */
  var BASE = (function () {
    var el = document.currentScript;
    if (!el) {
      var all = document.getElementsByTagName('script');
      el = all[all.length - 1];
    }
    return (el && el.src) ? el.src.replace(/assets\/js\/site\.js(\?.*)?$/, '') : '';
  })();

  function url(path) { return BASE + path; }

  /* ---------------------------------------------------------------------
     Helpers
     --------------------------------------------------------------------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Reads a dotted path out of the params object. Returns '' for anything
     missing, so callers only ever have to test for an empty string. */
  function param(path) {
    var value = path.split('.').reduce(function (acc, key) {
      return acc == null ? undefined : acc[key];
    }, P);
    return value == null ? '' : String(value);
  }

  /* Renders a brand mark as inline SVG so it inherits `currentColor`, or
     returns null when we hold no mark for that brand. */
  function markSvg(key, cls, label) {
    if (!key || !MARKS[key]) return null;
    return '<svg class="' + cls + '" viewBox="0 0 24 24" fill="currentColor" role="img" ' +
      'aria-label="' + esc(label) + '"><path d="' + MARKS[key] + '"/></svg>';
  }

  var ARROW = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
    '<path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" stroke-width="1.5" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CHEVRON = '<svg viewBox="0 0 12 8" fill="none" aria-hidden="true">' +
    '<path d="M1 1.5 6 6.5l5-5" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* The CypherMax shield monogram, redrawn as vector.
   *
   * INTERIM ASSET (spec 1.10 / B8): this is a redraw of the supplied JPG, not
   * the designer's original artwork. It is here so the site has a transparent,
   * scalable, ~1KB mark instead of a 1.3MB JPEG with a baked-in background.
   * Replace with the official SVG when the designer delivers it. */
  var SHIELD =
    '<svg class="logo__mark" viewBox="0 0 64 72" fill="none" aria-hidden="true" focusable="false">' +
    // Shield outline
    '<path d="M32 3.5 58.5 13v24.2c0 13.9-11.2 24.9-26.5 31.3C16.7 62.1 5.5 51.1 5.5 37.2V13L32 3.5Z" ' +
    'stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>' +
    // "C" monogram: an arc opening to the right, with squared terminals
    '<path d="M43 24.5a13.5 13.5 0 1 0 0 20" stroke="currentColor" stroke-width="3" ' +
    'stroke-linecap="square"/>' +
    '<path d="M43 24.5h-7M43 44.5h-7" stroke="currentColor" stroke-width="3" stroke-linecap="square"/>' +
    // Radiating arcs at the base, echoing the horizon motif in the mark
    '<path d="M21 50.5a11 11 0 0 1 22 0" stroke="currentColor" stroke-width="2.4"/>' +
    '<path d="M32 39.5v21M24.5 42.5 32 50m7.5-7.5L32 50" stroke="currentColor" stroke-width="2.4" ' +
    'stroke-linecap="round"/>' +
    '</svg>';

  /* Canonical service list — drives the dropdown, the footer and the
     solutions grid, so the labels in spec 1.7 exist in exactly one place. */
  var SERVICES = [
    { group: 'Build & Run', slug: 'cloud-migration', nav: 'Cloud Migration', tease: 'Move to the right cloud, without the downtime' },
    { group: 'Build & Run', slug: 'cloudops', nav: 'CloudOps', tease: 'Day-to-day operations, handled' },
    { group: 'Build & Run', slug: 'finops', nav: 'FinOps', tease: 'Understand and reduce your cloud bill' },
    { group: 'Deliver & Protect', slug: 'cdn', nav: 'CDN', tease: 'Fast delivery across Asia-Pacific' },
    { group: 'Deliver & Protect', slug: 'ddos-protection', nav: 'DDoS Protection', tease: 'Stay online under attack' },
    { group: 'Deliver & Protect', slug: 'aiaas', nav: 'AIaaS', tease: 'Ship AI features without building the platform' }
  ];

  /* ---------------------------------------------------------------------
     Header
     --------------------------------------------------------------------- */

  function dropdownColumn(group) {
    var items = SERVICES.filter(function (s) { return s.group === group; });
    return '<div><p class="dropdown__group-title">' + esc(group) + '</p>' +
      items.map(function (s) {
        return '<a class="dropdown__item" href="' + url('solutions/' + s.slug + '/index.html') + '">' +
          '<span class="dropdown__item-name">' + esc(s.nav) + '</span>' +
          '<span class="dropdown__item-desc">' + esc(s.tease) + '</span></a>';
      }).join('') + '</div>';
  }

  /* Header nav is Solutions · About Us · Contact Us.
   *
   * Deviates from spec 3.1 at the client's request: the phone number has been
   * removed from both the desktop bar and the expanded mobile menu, and the
   * CTA reads "Contact Us" rather than "Talk to Us". The number is still on
   * the Contact page and in the footer, and every instance of it is still a
   * tappable tel: link, so nothing is lost on mobile. */
  function renderHeader(el) {
    var active = el.getAttribute('data-active') || '';

    el.outerHTML =
      '<header class="site-header">' +
        '<div class="container site-header__inner">' +
          '<a class="logo" href="' + url('index.html') + '" aria-label="CypherMax — home">' + SHIELD +
            '<span class="logo__word">CypherMax</span></a>' +

          '<nav class="site-nav" aria-label="Main">' +
            '<div class="has-dropdown">' +
              '<a class="site-nav__link" href="' + url('solutions/index.html') + '"' +
                (active === 'solutions' ? ' aria-current="page"' : '') +
                ' aria-haspopup="true" aria-expanded="false">Solutions' + CHEVRON + '</a>' +
              '<div class="dropdown">' +
                '<div class="dropdown__cols">' +
                  dropdownColumn('Build & Run') + dropdownColumn('Deliver & Protect') +
                '</div>' +
                '<div class="dropdown__foot">' +
                  '<a class="link-arrow" href="' + url('solutions/index.html') + '">See all solutions' + ARROW + '</a>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<a class="site-nav__link" href="' + url('about/index.html') + '"' +
              (active === 'about' ? ' aria-current="page"' : '') + '>About Us</a>' +
            '<a class="site-nav__link" href="' + url('contact/index.html') + '"' +
              (active === 'contact' ? ' aria-current="page"' : '') + '>Contact Us</a>' +
          '</nav>' +

          '<div class="site-header__actions">' +
            '<button class="nav-toggle" type="button" aria-expanded="false" ' +
              'aria-controls="mobile-nav" aria-label="Open menu">' +
              '<svg class="icon-open" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
              '<svg class="icon-close" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 4l10 10M14 4 4 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +

        '<div class="mobile-nav" id="mobile-nav">' +
          '<div class="mobile-acc">' +
            '<button class="mobile-acc__trigger" type="button" aria-expanded="false" ' +
              'aria-controls="mobile-solutions">Solutions' + CHEVRON + '</button>' +
            '<div class="mobile-acc__panel" id="mobile-solutions">' +
              '<a href="' + url('solutions/index.html') + '">All solutions</a>' +
              SERVICES.map(function (s) {
                return '<a href="' + url('solutions/' + s.slug + '/index.html') + '">' + esc(s.nav) + '</a>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<a class="mobile-nav__link" href="' + url('about/index.html') + '">About Us</a>' +
          '<a class="mobile-nav__link" href="' + url('contact/index.html') + '">Contact Us</a>' +
          '<div class="mobile-nav__actions">' +
            '<a class="btn btn--primary btn--lg btn--block" href="' + url('contact/index.html') + '">Contact Us</a>' +
          '</div>' +
        '</div>' +
      '</header>';
  }

  /* ---------------------------------------------------------------------
     Footer
     --------------------------------------------------------------------- */

  function renderFooter(el) {
    var c = P.company;
    var hours = param('contact.businessHours');
    var sales = param('contact.salesEmail');
    var support = param('contact.supportEmail');
    var phone = param('contact.phoneDisplay');

    var partnerRow = P.partners.map(function (p) {
      var mark = markSvg(p.mark, '', p.name);
      return '<span class="site-footer__partner">' + (mark || '') + esc(p.name) + '</span>';
    }).join('');

    el.outerHTML =
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="site-footer__cols">' +

            '<div class="site-footer__brand">' +
              '<a class="logo" href="' + url('index.html') + '" aria-label="CypherMax — home">' + SHIELD +
                '<span class="logo__word">CypherMax</span></a>' +
              '<p class="site-footer__tagline">Maximize Your Potential</p>' +
              '<address class="site-footer__entity">' +
                '<strong>' + esc(c.legalName) + '</strong><br>' +
                'UEN ' + esc(c.uen) + '<br>' +
                c.addressLines.map(esc).join('<br>') +
              '</address>' +
            '</div>' +

            '<div>' +
              '<h2 class="site-footer__title">Solutions</h2>' +
              '<ul class="site-footer__list">' +
                SERVICES.map(function (s) {
                  return '<li><a href="' + url('solutions/' + s.slug + '/index.html') + '">' + esc(s.nav) + '</a></li>';
                }).join('') +
              '</ul>' +
            '</div>' +

            '<div>' +
              '<h2 class="site-footer__title">Company</h2>' +
              '<ul class="site-footer__list">' +
                '<li><a href="' + url('about/index.html') + '">About Us</a></li>' +
                '<li><a href="' + url('contact/index.html') + '">Contact Us</a></li>' +
                '<li><a href="' + url('privacy/index.html') + '">Privacy Policy</a></li>' +
                '<li><a href="' + url('terms/index.html') + '">Terms of Service</a></li>' +
              '</ul>' +
            '</div>' +

            '<div>' +
              '<h2 class="site-footer__title">Get in touch</h2>' +
              '<div class="site-footer__contact">' +
                '<p><span>Sales:</span> <a href="mailto:' + esc(sales) + '">' + esc(sales) + '</a></p>' +
                '<p><span>Support:</span> <a href="mailto:' + esc(support) + '">' + esc(support) + '</a></p>' +
                '<p><span>Phone:</span> <a href="tel:' + esc(param('contact.phoneLink')) + '">' + esc(phone) + '</a></p>' +
                // Omitted entirely when the parameter is empty (spec 3.2).
                (hours ? '<p><span>' + esc(hours) + '</span></p>' : '') +
              '</div>' +
            '</div>' +

          '</div>' +

          '<div class="site-footer__partners">' +
            '<div class="site-footer__partner-row">' + partnerRow + '</div>' +
            '<p class="site-footer__partner-caption">We collaborate with Alibaba Cloud, ' +
              'Tencent Cloud, Amazon Web Services, Google Cloud, BytePlus and Huawei Cloud.</p>' +
          '</div>' +

          '<div class="site-footer__legal">' +
            '<div class="site-footer__legal-top">' +
              '<span>&copy; ' + esc(c.copyrightYear) + ' ' + esc(c.legalName) + ' All rights reserved.</span>' +
              '<a href="' + url('privacy/index.html') + '">Privacy Policy</a>' +
              '<a href="' + url('terms/index.html') + '">Terms of Service</a>' +
              // Persistent cookie-settings control, so a consent choice can be
              // changed at any time (spec 14.10). The Privacy Policy points here.
              '<button class="site-footer__linkbtn" type="button" data-cookie-settings>Cookie settings</button>' +
            '</div>' +
            '<p class="site-footer__trademark">All third-party product names, logos and trademarks ' +
              'are the property of their respective owners. Use of these names, logos and trademarks ' +
              'does not imply endorsement.</p>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /* ---------------------------------------------------------------------
     Reusable content blocks
     --------------------------------------------------------------------- */

  function renderCtaBand(el) {
    var sales = param('contact.salesEmail');
    el.outerHTML =
      '<section class="cta-band">' +
        '<div class="container">' +
          '<div class="cta-band__inner" data-reveal>' +
            '<h2 class="grad-text">Not sure where to start?</h2>' +
            '<p>Tell us what you are running today and what is not working. We will come back ' +
              'with an honest read on whether we can help &mdash; and if we cannot, we will say so.</p>' +
            '<div class="btn-row btn-row--center">' +
              '<a class="btn btn--primary btn--lg" href="' + url('contact/index.html') + '">Book a free consultation</a>' +
              '<a class="btn btn--ghost btn--lg" href="mailto:' + esc(sales) + '">Email ' + esc(sales) + '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  /* Partner logo wall. Brands we hold a mark for show the mark plus the name;
     brands we do not show a wordmark cell. Both are trademark-conservative and
     swap to an official asset by adding a `mark` entry in params.js. */
  /* The wall scrolls continuously leftwards. The set of six is emitted twice
     and the track translated by exactly one set's width, which makes the loop
     seamless. The second copy is aria-hidden so the partner names are not
     announced twice, and the whole track is aria-hidden anyway because the
     caption beneath already names all six in a sentence. */
  function renderPartnerWall(el) {
    var cells = P.partners.map(function (p) {
      var mark = markSvg(p.mark, 'logo-wall__mark', p.name);
      return '<div class="logo-wall__cell' + (mark ? '' : ' logo-wall__cell--word') + '">' +
        (mark || '') +
        '<span class="logo-wall__name">' + esc(p.name) + '</span>' +
      '</div>';
    }).join('');

    el.outerHTML =
      '<section class="section section--tight">' +
        '<div class="container">' +
          '<p class="eyebrow eyebrow--center" style="display:flex;justify-content:center">' +
            'We collaborate with six cloud platforms</p>' +
        '</div>' +
        '<div class="logo-marquee" data-reveal>' +
          '<div class="logo-marquee__track">' +
            '<div class="logo-marquee__set">' + cells + '</div>' +
            '<div class="logo-marquee__set" aria-hidden="true">' + cells + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="container">' +
          '<p class="logo-wall__caption">CypherMax collaborates with Alibaba Cloud, ' +
            'Tencent Cloud, Amazon Web Services, Google Cloud, BytePlus and Huawei Cloud.</p>' +
        '</div>' +
      '</section>';
  }

  /* AIaaS model wall. Driven entirely by params.aiModels — model availability,
     naming and routing change faster than anything else on this site, so a
     model is added, removed or re-routed without touching a template.
     Only entries with `enabled: true` render.

     LOGO GUARDRAIL (spec 11.4 / B6): these marks belong to Alibaba Cloud,
     Anthropic, Google, ByteDance and OpenAI — different companies from the six
     cloud partners, with their own brand guidelines, several of which restrict
     logo use to actual customers or partners. Check each company's current
     guidelines before shipping its mark, and do not imply endorsement: the wall
     says what CypherMax can provision, not that these companies recommend
     CypherMax. Any brand whose mark cannot be used renders as a wordmark
     instead, which is a perfectly good design and removes the problem. */
  function renderModelWall(el) {
    var cards = P.aiModels.filter(function (m) { return m.enabled; }).map(function (m) {
      var mark = markSvg(m.mark, '', m.name);
      var badge = mark
        ? '<span class="model-card__mark">' + mark + '</span>'
        : '<span class="model-card__mark model-card__mark--word" aria-hidden="true">' +
          esc(m.name.charAt(0)) + '</span>';

      return '<article class="card model-card" data-reveal>' +
        '<div class="model-card__head">' + badge +
          '<div><span class="model-card__name">' + esc(m.name) + '</span>' +
          '<span class="model-card__dev">by ' + esc(m.developer) + '</span></div>' +
        '</div>' +
        '<p class="card__body">' + esc(m.note) + '</p>' +
        '<dl class="model-card__meta">' +
          '<div class="model-card__row"><dt>Via</dt><dd>' + esc(m.via) + '</dd></div>' +
          '<div class="model-card__row"><dt>Modality</dt><dd>' + esc(m.modality) + '</dd></div>' +
        '</dl>' +
      '</article>';
    }).join('');

    el.outerHTML = '<div class="model-wall">' + cards + '</div>';
  }

  /* Stats band. THE EMPTY-PARAMETER RULE: a tile is rendered only when its
     parameter has a value — never a zero, a dash or an empty tile. If nothing
     is configured, the whole band disappears rather than leaving a gap. */
  function renderStats(el) {
    var set = P.statsSets[el.getAttribute('data-set') || 'home'] || [];

    var tiles = set.filter(function (s) {
      // Literal facts always render; parameter-backed tiles only when filled.
      return s.value != null || param('metrics.' + s.key) !== '';
    }).map(function (s) {
      var value = (s.value != null ? s.value : param('metrics.' + s.key)) + (s.suffix || '');
      return '<div class="stats__tile">' +
        // Number and label are exposed together, so a screen reader never
        // announces a bare figure without its qualification (spec 19).
        '<span class="stats__value grad-text">' + esc(value) + '</span>' +
        '<span class="stats__label">' + esc(s.label) + '</span>' +
      '</div>';
    });

    if (!tiles.length) { el.remove(); return; }

    var heading = el.getAttribute('data-heading');
    el.outerHTML =
      '<section class="section section--tight">' +
        '<div class="container">' +
          (heading ? '<div class="section-head section-head--center"><h2 class="grad-text">' + esc(heading) + '</h2></div>' : '') +
          '<div class="stats" data-reveal>' + tiles.join('') + '</div>' +
        '</div>' +
      '</section>';
  }

  /* ---------------------------------------------------------------------
     Parameter interpolation in static copy
     --------------------------------------------------------------------- */

  /* <span data-param="contact.phoneDisplay"></span> fills in a value.
     Elements carrying data-param-if / data-param-else implement the inline
     fallback rule: the first is used when the parameter has a value, the
     second when it is empty. */
  function fillParams(root) {
    root.querySelectorAll('[data-param]').forEach(function (node) {
      node.textContent = param(node.getAttribute('data-param'));
    });

    root.querySelectorAll('[data-param-if]').forEach(function (node) {
      if (param(node.getAttribute('data-param-if')) === '') node.remove();
    });

    root.querySelectorAll('[data-param-else]').forEach(function (node) {
      if (param(node.getAttribute('data-param-else')) !== '') node.remove();
    });

    // Feature flags: <div data-feature="customerProof"> is removed when off.
    root.querySelectorAll('[data-feature]').forEach(function (node) {
      if (!P.features[node.getAttribute('data-feature')]) node.remove();
    });
  }

  /* ---------------------------------------------------------------------
     Behaviour
     --------------------------------------------------------------------- */

  function initHeaderBehaviour() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    // The bar is not sticky — it scrolls away with the page — so there is no
    // scroll listener here. Spec 3.1 asks for a sticky header that shrinks
    // after 80px; removed at the client's request.

    // Keyboard support for the Solutions dropdown, which otherwise only
    // opens on hover.
    var dd = header.querySelector('.has-dropdown');
    if (dd) {
      var trigger = dd.querySelector('.site-nav__link');
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          dd.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          // Focus on the next tick, once the panel is actually visible —
          // focus() is a no-op on a visibility:hidden element. setTimeout
          // rather than rAF, which does not fire on a backgrounded tab.
          window.setTimeout(function () {
            var first = dd.querySelector('.dropdown__item');
            if (first) first.focus();
          }, 0);
        }
      });
      dd.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          dd.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
      dd.addEventListener('focusout', function () {
        window.setTimeout(function () {
          if (!dd.contains(document.activeElement)) {
            dd.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
          }
        }, 0);
      });
    }

    var toggle = header.querySelector('.nav-toggle');
    var menu = header.querySelector('.mobile-nav');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
        menu.classList.toggle('is-open', !open);
        document.body.style.overflow = open ? '' : 'hidden';
      });

      var acc = menu.querySelector('.mobile-acc__trigger');
      var panel = menu.querySelector('.mobile-acc__panel');
      if (acc && panel) {
        acc.addEventListener('click', function () {
          var open = acc.getAttribute('aria-expanded') === 'true';
          acc.setAttribute('aria-expanded', String(!open));
          panel.classList.toggle('is-open', !open);
        });
      }
    }
  }

  function initFaq(root) {
    root.querySelectorAll('.faq__q').forEach(function (q) {
      q.addEventListener('click', function () {
        var open = q.getAttribute('aria-expanded') === 'true';
        var answer = document.getElementById(q.getAttribute('aria-controls'));
        q.setAttribute('aria-expanded', String(!open));
        if (answer) answer.setAttribute('data-open', String(!open));
      });
    });
  }

  /* Feeds each hover card the cursor position, which CSS turns into a soft
     spotlight on the card's background. Uses one delegated pointermove on the
     document and writes inside rAF, so moving the mouse never triggers a
     layout-thrash per card. Skipped entirely for people who asked for reduced
     motion, and for coarse pointers, where there is no cursor to follow. */
  function initCardSpotlight() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var pending = null;

    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.card--hover');
      if (!card) return;
      if (pending) return;
      pending = window.requestAnimationFrame(function () {
        pending = null;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    }, { passive: true });
  }

  function initReveal(root) {
    var nodes = root.querySelectorAll('[data-reveal]');
    if (!nodes.length) return;

    // Honour prefers-reduced-motion: show everything, animate nothing.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });

    nodes.forEach(function (n) { io.observe(n); });
  }

  /* Cookie banner. No non-essential cookie may fire before consent is given
     (spec 3.6) — hence the analytics hook below rather than a script tag.
     Injected on every page, so the markup lives in exactly one place. */
  function initCookieBanner() {
    var KEY = 'cyphermax.consent';

    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-title');
    banner.innerHTML =
      '<h2 id="cookie-title">We use cookies</h2>' +
      '<p>We use essential cookies to run this site. With your consent, we also ' +
        'use analytics cookies to understand how the site is used. You can change ' +
        'your choice at any time.</p>' +
      '<div class="btn-row">' +
        // "Essential only" carries the same size and weight as "Accept" — it is
        // not a de-emphasised text link (spec 3.6).
        '<button class="btn btn--primary" type="button" data-consent="analytics">Accept analytics cookies</button>' +
        '<button class="btn btn--ghost" type="button" data-consent="essential">Essential only</button>' +
      '</div>' +
      '<p class="mt-24" style="margin-bottom:0">' +
        '<a class="link-arrow" href="' + url('privacy/index.html') + '">Read our Privacy Policy' + ARROW + '</a>' +
      '</p>';
    document.body.appendChild(banner);
    var stored = null;
    try { stored = window.localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }

    banner.querySelectorAll('[data-consent]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var choice = btn.getAttribute('data-consent');
        try { window.localStorage.setItem(KEY, choice); } catch (e) { /* storage blocked */ }
        banner.classList.remove('is-visible');
        if (choice === 'analytics') loadAnalytics();
      });
    });

    // Reopen the banner from any "Cookie settings" control on the page.
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (!trigger) return;
      e.preventDefault();
      banner.classList.add('is-visible');
      var first = banner.querySelector('[data-consent]');
      if (first) first.focus();
    });

    if (stored) {
      if (stored === 'analytics') loadAnalytics();
      return;
    }

    window.setTimeout(function () { banner.classList.add('is-visible'); }, 900);
  }

  function loadAnalytics() {
    /* TODO (spec B9): analytics tooling has not been chosen yet. When it is,
       inject the tag here — this function only runs after the visitor has
       accepted analytics cookies, which is what keeps the banner honest.
       Whatever is chosen must also be disclosed in Privacy 14.10. */
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */

  function mount() {
    var doc = document;

    doc.querySelectorAll('[data-component]').forEach(function (el) {
      switch (el.getAttribute('data-component')) {
        case 'header':       renderHeader(el); break;
        case 'footer':       renderFooter(el); break;
        case 'cta-band':     renderCtaBand(el); break;
        case 'partner-wall': renderPartnerWall(el); break;
        case 'model-wall':   renderModelWall(el); break;
        case 'stats':        renderStats(el); break;
      }
    });

    fillParams(doc);
    initHeaderBehaviour();
    initFaq(doc);
    initReveal(doc);
    initCardSpotlight();
    initCookieBanner();

    if (window.CypherMaxForm) window.CypherMaxForm.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // Exposed for the contact page's own script.
  window.CypherMax = { param: param, esc: esc, params: P, base: BASE, url: url };
})();
