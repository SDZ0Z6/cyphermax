/* CypherMax — configurable content parameters.
 *
 * This is the single source of truth for every number, figure and contact
 * detail on the site (spec section 1.8, hard rule #1). Nothing numeric is
 * hard-coded into a page.
 *
 * THE EMPTY-PARAMETER RULE: an empty string renders NOTHING — not the number,
 * not the label, not an empty tile, not a zero, not a dash. Components that
 * consume these values are built to skip empties entirely. Sentences that use
 * an inline parameter carry a `*Fallback` string, used verbatim when the
 * parameter is empty.
 *
 * Editing this file is the whole job — no template changes, no rebuild.
 */
window.CYPHERMAX_PARAMS = {
  metrics: {
    uptimeSla: '99.9%',
    savingsRange: '15–30%',
    customerCount: '',
    teamYearsExperience: '10'
  },

  commitments: {
    enquiryResponse: '',
    consultationDuration: '',
    exitNoticePeriod: ''
  },

  contact: {
    phoneDisplay: '+65 6596 1253',
    phoneLink: '+6565961253',
    salesEmail: 'sales@cyphermaxsg.com',
    supportEmail: 'support@cyphermaxsg.com',
    businessHours: ''
  },

  features: {
    // Ships off: with the blog out of scope there is currently nothing to send.
    marketingOptIn: false,
    // Ships off: no approved customer reference exists yet (spec 4.9).
    customerProof: false,
    /* Shows the "draft, pending legal review" notice on /privacy and /terms.
     * Both pages are working drafts (spec 14, 15) and neither may be published
     * as-is: they need review by a Singapore-qualified adviser, and the blocking
     * items in the TBD register resolved (B1 DPO, B2 review, B3 liability).
     * Set to false only once that review is done — at which point the pages are
     * no longer drafts. */
    legalDraftNotice: false
  },

  company: {
    legalName: 'CYPHER MAX PTE. LTD.',
    brandName: 'CypherMax',
    uen: '202637936N',
    addressLines: ['60 Paya Lebar Road, #06-28', 'Paya Lebar Square', 'Singapore 409051'],
    copyrightYear: '2026'
  },

  /* Label wording here is load-bearing and must not be shortened to fit a
   * layout — make the tile bigger instead (spec 4.5):
   *   - "commitment", not "uptime": a promise about the future, not a measurement.
   *   - "we target", not "we deliver" or "customers save".
   *   - "in our team": the company was incorporated in August 2026; the
   *     engineers in it have been doing this far longer. That distinction is
   *     what makes the number true, so it stays in the label. */
  /* Named sets, selected per page with <div data-component="stats" data-set="…">.
   * An entry with `key` reads metrics.<key> and is skipped when that parameter
   * is empty. An entry with `value` is a literal fact, not a parameter, and
   * always renders. */
  statsSets: {
    home: [
      { key: 'uptimeSla', label: 'Uptime commitment on managed environments' },
      { key: 'savingsRange', label: 'Cloud cost reduction we target in a FinOps engagement' },
      { key: 'teamYearsExperience', suffix: '+ years', label: 'Cloud infrastructure experience in our team' },
      { key: 'customerCount', label: 'Businesses supported across Asia-Pacific' }
    ],
    about: [
      { key: 'teamYearsExperience', suffix: '+ years', label: 'Cloud infrastructure experience in our team' },
      /* Six is a fact, not a parameter — it is the number of partner platforms
       * in the `partners` list above. If a seventh is added, both change. */
      { value: '6', label: 'Cloud platforms we collaborate with' },
      { key: 'uptimeSla', label: 'Uptime commitment on managed environments' },
      { key: 'customerCount', label: 'Businesses supported across Asia-Pacific' }
    ]
  },

  /* The six cloud platforms CypherMax collaborates with.
   * Names are legally sensitive (spec 1.5) — use verbatim, never abbreviate.
   * `mark` refers to a key in marks.js; entries without one render as a text
   * wordmark, which is the trademark-safe fallback. */
  partners: [
    { name: 'Amazon Web Services', short: 'AWS', mark: 'aws' },
    { name: 'Google Cloud', mark: 'googlecloud' },
    { name: 'Alibaba Cloud', mark: 'alibabacloud' },
    { name: 'Tencent Cloud', mark: null },
    { name: 'Huawei Cloud', mark: 'huawei' },
    { name: 'BytePlus', mark: null }
  ],

  /* AIaaS model wall (spec 11.4). Only entries with `enabled: true` render.
   * GPT ships disabled: the usual enterprise route to OpenAI models is Azure
   * OpenAI Service, and Azure is out of scope for this release (spec 1.6).
   * Turning it on requires resolving B5 — a real routing decision, not a
   * copy change. */
  aiModels: [
    {
      name: 'Qwen', developer: 'Alibaba Cloud',
      via: 'Alibaba Cloud',
      modality: 'Text and multimodal', mark: 'qwen', enabled: true,
      note: 'Strong Chinese-language performance; available in the region'
    },
    {
      name: 'Claude', developer: 'Anthropic',
      via: 'Amazon Web Services and Google Cloud',
      modality: 'Text and multimodal', mark: 'claude', enabled: true,
      note: 'Two independent routes, which helps with availability and commercial flexibility'
    },
    {
      name: 'Gemini', developer: 'Google',
      via: 'Google Cloud',
      modality: 'Text and multimodal', mark: 'gemini', enabled: true,
      note: 'Tight integration with the rest of Google Cloud'
    },
    {
      name: 'Seedance', developer: 'ByteDance',
      via: 'BytePlus',
      modality: 'Video generation', mark: null, enabled: true,
      note: 'A different modality from the others — for video, not chat or text'
    },
    {
      /* Ships disabled, and must stay that way until B5 is decided.
       * GPT models are OpenAI's, and OpenAI is not one of the six platforms
       * CypherMax collaborates with. The usual enterprise route is
       * Azure OpenAI Service, and Azure is out of scope for this release
       * (spec 1.6). Three options, one of which has to be picked:
       *   1. a direct commercial relationship with OpenAI — workable, but then
       *      it is not "partner-powered" in the sense this site uses the term,
       *      so the card, the delivery-model tag, the hero and the meta copy
       *      all need rewording to "provisioned directly";
       *   2. bring Azure into scope — reverses the 1.6 decision and means
       *      adding Microsoft to the platform list, capability matrix and logo
       *      wall. Much larger than one card on one page;
       *   3. drop GPT and ship four models across four platforms we collaborate with,
       *      which is a coherent story on its own.
       * Showing a model on this wall is a representation that you can supply
       * it. Do not enable this to look more complete. */
      name: 'GPT', developer: 'OpenAI', via: '',
      modality: 'Text and multimodal', mark: null, enabled: false, note: ''
    }
  ]
};
