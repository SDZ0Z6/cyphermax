/* CypherMax — contact enquiry form.
 *
 * ============================ READ THIS FIRST ============================
 * THIS FORM DOES NOT DELIVER ANYWHERE YET. There is no backend in this
 * release, so `submitEnquiry` below validates, then redirects to /thank-you
 * without sending anything.
 *
 * Spec 16.3 requires all of the following before this can go live, and none of
 * them can be done in the browser:
 *   - delivery to contact.salesEmail (never a personal mailbox)
 *   - server-side validation of every field (client-side is a convenience,
 *     not a control)
 *   - rate limiting per IP on the submission endpoint
 *   - recording the consent state, the timestamp and the privacy-policy
 *     version with each submission — if consent is ever questioned, that
 *     record is the only useful answer
 *   - a decision on where submissions are stored and for how long, consistent
 *     with Privacy 14.7
 *
 * To wire it up, replace the body of `submitEnquiry` with a POST and keep
 * everything else. The payload it already assembles is the payload to send.
 * ========================================================================
 */
(function () {
  'use strict';

  var P = window.CYPHERMAX_PARAMS;

  // Bump when the privacy policy changes, so stored consent records say which
  // version the person actually agreed to.
  var PRIVACY_POLICY_VERSION = '2026-09-22';

  // Domains we warn about but never block — a disposable address is a weak
  // signal, and hard-blocking costs real enquiries (spec 16.1).
  var DISPOSABLE = [
    'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
    'throwawaymail.com', 'yopmail.com', 'trashmail.com', 'getnada.com'
  ];

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function field(input) { return input.closest('.field'); }

  function setError(input, message) {
    var wrap = field(input);
    if (!wrap) return;
    var slot = wrap.querySelector('.field__error');
    wrap.classList.toggle('is-invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (slot) slot.textContent = message || '';
  }

  function setWarning(input, message) {
    var wrap = field(input);
    if (!wrap) return;
    var slot = wrap.querySelector('.field__warning');
    wrap.classList.toggle('has-warning', !!message);
    if (slot) slot.textContent = message || '';
  }

  /* Error messages are specific — "Enter a valid email address", never
     "Invalid input" (spec 16.1 design note). */
  function validate(input) {
    var value = (input.value || '').trim();
    var name = input.name;

    if (name === 'name') {
      if (!value) return 'Enter your name.';
      if (value.length > 100) return 'Your name must be 100 characters or fewer.';
    }

    if (name === 'email') {
      if (!value) return 'Enter your work email address.';
      if (!EMAIL_RE.test(value)) return 'Enter a valid email address, like you@company.com.';
    }

    if (name === 'company') {
      if (!value) return 'Enter your company name.';
      if (value.length > 150) return 'Company name must be 150 characters or fewer.';
    }

    if (name === 'country' && !value) return 'Choose the country you are based in.';

    if (name === 'interest' && !value) {
      return 'Choose what we can help with. If you are not sure, pick "Not sure yet".';
    }

    if (name === 'message') {
      if (!value) return 'Tell us a little about your setup.';
      if (value.length < 20) return 'Please give us at least a sentence — 20 characters or more.';
      if (value.length > 2000) return 'Please keep this under 2000 characters.';
    }

    return '';
  }

  function validateConsent(input) {
    var wrap = input.closest('.checkbox');
    var slot = document.getElementById('consent-error');
    var ok = input.checked;
    if (wrap) wrap.classList.toggle('is-invalid', !ok);
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (slot) slot.textContent = ok ? '' : 'Please confirm you agree before sending.';
    return ok;
  }

  /* Replace this with a real POST once an endpoint exists. Resolve on success,
     reject on failure — the caller preserves everything the user typed either
     way (spec 16.1: never clear a completed form on error). */
  function submitEnquiry(payload) {
    // TODO (backend): POST `payload` to the enquiry endpoint, which must route
    // to params.contact.salesEmail, validate server-side, rate-limit per IP and
    // persist the consent record. Until then this resolves without sending.
    if (window.console && window.console.info) {
      window.console.info('[CypherMax] Enquiry not sent — no backend configured. Payload:', payload);
    }
    return Promise.resolve({ ok: true, delivered: false });
  }

  function init() {
    var form = document.getElementById('enquiry-form');
    // Idempotent: site.js calls this during mount, and the fallback below calls
    // it again if this file happened to load after mount had already run.
    if (!form || form.dataset.wired === 'true') return;
    form.dataset.wired = 'true';

    // Marketing consent is never bundled with enquiry consent, and ships hidden
    // until there is a genuine mailing programme behind it (spec 16.2).
    var marketing = form.querySelector('[data-marketing-field]');
    if (marketing && !P.features.marketingOptIn) marketing.remove();

    // Timestamp check: a form completed in under a couple of seconds is a bot.
    var loadedAt = Date.now();
    var status = form.querySelector('.form__status');
    var consent = form.querySelector('[name="consent"]');
    var inputs = Array.prototype.slice.call(
      form.querySelectorAll('input[name], select[name], textarea[name]')
    ).filter(function (el) {
      return el.type !== 'checkbox' && el.name !== 'website';
    });

    // Validate on blur, not on every keystroke (spec 16.1 design note).
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        setError(input, validate(input));
        if (input.name === 'email') {
          var domain = (input.value.split('@')[1] || '').toLowerCase();
          setWarning(input, DISPOSABLE.indexOf(domain) > -1
            ? 'That looks like a temporary address. We will reply to it, but a work address reaches you more reliably.'
            : '');
        }
      });
      // Clear the error as soon as the person starts fixing it.
      input.addEventListener('input', function () {
        if (field(input) && field(input).classList.contains('is-invalid')) setError(input, '');
      });
    });

    if (consent) {
      consent.addEventListener('change', function () { validateConsent(consent); });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) { status.classList.remove('is-visible'); status.textContent = ''; }

      var firstBad = null;
      inputs.forEach(function (input) {
        var message = validate(input);
        setError(input, message);
        if (message && !firstBad) firstBad = input;
      });

      var consentOk = consent ? validateConsent(consent) : true;
      if (!consentOk && !firstBad) firstBad = consent;

      if (firstBad) {
        firstBad.focus();
        firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }

      // Honeypot: hidden from people, filled in by naive bots. Fail silently —
      // telling a bot why it was rejected only helps it.
      var honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) return;
      if (Date.now() - loadedAt < 2500) return;

      var data = new FormData(form);
      var payload = {
        name: (data.get('name') || '').trim(),
        email: (data.get('email') || '').trim(),
        company: (data.get('company') || '').trim(),
        country: data.get('country') || '',
        phone: (data.get('phone') || '').trim(),
        interest: data.get('interest') || '',
        message: (data.get('message') || '').trim(),
        // The consent record: state, timestamp and policy version together.
        consent: {
          given: !!(consent && consent.checked),
          marketing: !!data.get('marketing'),
          timestamp: new Date().toISOString(),
          policyVersion: PRIVACY_POLICY_VERSION
        }
      };

      var button = form.querySelector('[type="submit"]');
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }

      submitEnquiry(payload).then(function () {
        // Resolved against site.js's BASE so the redirect works from file://,
        // from a GitHub Pages project path and from a domain root alike.
        var base = (window.CypherMax && window.CypherMax.base) || '../';
        window.location.href = base + 'thank-you/index.html';
      }).catch(function () {
        // Inline error, and the form keeps everything the user typed.
        if (button) { button.disabled = false; button.textContent = 'Send enquiry'; }
        if (status) {
          status.textContent = 'Something went wrong sending your message. Please try again, or email us directly at ' +
            P.contact.salesEmail + '.';
          status.classList.add('is-visible');
          status.focus();
        }
      });
    });
  }

  window.CypherMaxForm = { init: init, submitEnquiry: submitEnquiry };

  // Fallback in case this file loads after site.js has already mounted.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
