/*
  Talent Marketing Impact Dashboard: YOUR SETTINGS
  ================================================
  This is the file to change when you make the dashboard your own.
  You (or your AI assistant) can change the words, colors and names below.
  Keep the structure: text between quotes, a comma after each line, and the brackets as they are.

  Things people pick in "Make it yours" on the page (company name, logo, colors, currency)
  are saved in their own browser and win over the defaults below.
*/
window.DASHBOARD_SETTINGS = {

  /* ---------- Your brand (defaults for everyone who opens your copy) ---------- */
  brand: {
    companyName: '',             // e.g. 'Lumora Tech'. Empty shows "Your company".
    brandColor: '#6CB1A3',       // the header band
    accentColor: '#2BFF9E',      // buttons and the selected period
    logo: '',                    // an image in the img folder, e.g. 'img/my-logo.png'. Empty shows "Add your logo".
    currency: 'USD',             // USD, EUR, GBP, CHF, SEK, DKK, NOK or PLN
    headingFont: 'Arial',        // names and numbers: company name, stage names, metric values. Bold.
    font: ''                     // all other text. Empty = the computer's own system font (very readable).
                                 // Or a font installed on your computers, e.g. 'Calibri'.
                                 // A font file of your own: put it in a "fonts" folder and see AGENTS.md.
  },

  // The fonts people can pick in "Make it yours" for names and numbers. Only fonts that are already
  // installed on most computers, so nothing is downloaded. If one is missing on a computer, Arial is used.
  fontChoices: ['Arial', 'Calibri', 'Segoe UI', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Georgia', 'Times New Roman'],

  /* ---------- Words on the page ---------- */
  text: {
    pageTitle: 'Talent Marketing Impact Dashboard',
    subtitle: 'Talent marketing impact across the Talent Marketing Engine™',
    legend: "% = progress toward our own target. RAG = how we compare with what good looks like (the benchmark). They can disagree, and that's useful.",
    exampleNote: "The sample scorecard with made-up numbers. Load yours to see your own numbers.",
    leadershipView: 'Leadership view',
    fullYear: 'Full year'
  },

  /* ---------- Where the numbers come from in your Excel file ---------- */
  source: {
    dataTab: 'Google Sheets input',          // the tab the dashboard reads
    detailsTab: 'TOTAL Impact Scorecard'     // optional: Direction and benchmarks are read from here
  },

  /* ---------- The eight stages of the Talent Marketing Engine™ ---------- */
  // The colors are used when your Excel file doesn't give a "TME Stage color".
  stages: [
    { name: 'Unaware',    color: '#EDE8DC' },
    { name: 'Aware',      color: '#E1F5EE' },
    { name: 'Engaged',    color: '#E6F1FB' },
    { name: 'Convinced',  color: '#EDE9FE' },
    { name: 'Employed',   color: '#FAEEDA' },
    { name: 'Invested',   color: '#FAECE7' },
    { name: 'Ambassador', color: '#EAF3DE' },
    { name: 'Alumni',     color: '#FBEAF0' }
  ],
  // How the stages are grouped on the page.
  stageGroups: [
    { label: 'Talent attraction · stages 1–4', from: 1, to: 4 },
    { label: 'Talent retention · stages 5–8',  from: 5, to: 8 }
  ],
  // The order of the cards inside a stage (two cards per row). Use the metric names from your Excel file.
  // Metrics you don't list here follow in the order of your Excel file.
  cardOrder: {
    5: ['Offer Acceptance Rate', 'Total Hires from TM', 'Cost-per-hire', 'Early Attrition %'],
    7: ['Ambassador Program Growth Rate', 'Referral Hire Rate']
  },
  // The two RAG tables.
  ragTables: [
    { title: 'Conversion indicators',          hint: 'Stages 1 to 5, against what good looks like.', from: 1, to: 5 },
    { title: 'Employee experience indicators', hint: '',                                            from: 6, to: 8 }
  ],

  /* ---------- Metric details ---------- */
  // Used when your Excel file doesn't say. direction: 'UP' = higher is better, 'DOWN' = lower is better.
  metrics: {
    'Cost-per-hire':              { direction: 'DOWN', currency: true },
    'Early Attrition %':          { direction: 'DOWN' },
    'Voluntary Attrition %':      { direction: 'DOWN' },
    'Share of Voice':             { benchmark: 'Establish your baseline vs. 3–5 direct competitors' },
    'Application Quality Score':  { benchmark: '30–50% screening pass rate indicates good persona targeting' },
    'Offer Acceptance Rate':      { benchmark: '85–90%+ should be the target' },
    'eNPS Score':                 { benchmark: '10–30 good, 30–50 great, 50+ excellent' },
    'Ambassador Program Growth Rate': { benchmark: 'Aim for consistent monthly growth of 5–10% after launch' },
    'Referral Hire Rate':         { benchmark: '34–37%, roughly 17x higher than the ~2% conversion rate of the overall applicant pool' },
    'Alumni Boomerang Hire Rate': { benchmark: 'Aim for 10% boomerang hire rate min' }
  },
  // For metrics not listed above: words in the name that mean "lower is better" or "this is money".
  lowerIsBetterWords: ['cost', 'attrition', 'turnover', 'time to'],
  currencyWords: ['cost', 'spend', 'budget', 'salary'],

  /* ---------- The candidate journey ---------- */
  // Which metric is which step. "match" = words in the metric name, "not" = words it must not have.
  journey: [
    { step: 'impressions',  match: 'impression' },
    { step: 'traffic',      match: 'career site' },
    { step: 'engagements',  match: 'engagement' },
    { step: 'community',    match: 'community', not: 'alumni' },
    { step: 'applications', match: 'application' },
    { step: 'hires',        match: 'hires', not: 'cost|rate' }
  ],
  // The conversions between steps, and what to improve when one falls behind the plan.
  conversions: [
    { from: 'impressions', to: 'traffic',      verb: 'reached the career site',     fix: 'the ads and posts that should bring people to the career site' },
    { from: 'impressions', to: 'engagements',  verb: 'engaged with the content',    fix: 'the content, so more of the right people stop and react' },
    { from: 'engagements', to: 'community',    verb: 'joined the talent community', fix: 'the reasons to join the talent community' },
    { from: 'engagements', to: 'applications', verb: 'applied',                     fix: 'the way people apply (job ads, apply button, application form)' },
    { from: 'applications', to: 'hires',       verb: 'were hired',                  fix: 'screening, interviews and offers, together with TA' }
  ],

  /* ---------- When something counts as a problem ---------- */
  thresholds: {
    leakBelowPlan: 0.9,   // a conversion below 90% of the plan is a leak
    reachOnTarget: 0.95,  // reach at 95% of target or more counts as on target
    lensesAgree: 0.95,    // "almost at target" for the two-lenses check
    bigDrop: -0.5,        // flag a metric that more than halves...
    bigRise: 1.0          // ...or more than doubles compared with the previous quarter
  },

  /* ---------- The three lines for leadership ---------- */
  // Words in {curly brackets} are filled in by the dashboard. Keep them as they are.
  story: {
    beat:        '{metric} beat target at {value} ({pct} of target).',
    under:       '{metric} came in under target at {value} ({pct} of target).',
    shortOf:     '{metric} fell short of target at {value} ({pct} of target).',
    over:        '{metric} ran over target at {value} ({pct} of target).',
    hires:       '{metric}: {value}, {pct} of target.',
    noTargets:   'add targets to your scorecard to compare your results.',
    leak:        'The biggest drop against plan is from {from} to {to}: {actual} {verb}, against {plan} in the plan.',
    leakReachOk: "Reach is on or above target, so this looks like an engagement problem: people arrive, but they don't move on.",
    leakReachLow:'Reach is also below target, so check both traffic and engagement.',
    optimize:    "So we'll optimize {fix}, before we add budget.",
    traffic:     'The funnel converts as planned, but reach is below target. That looks like a traffic problem: not enough of the right people reach us yet.',
    trafficMove: "So we'll lean in on the channels that bring the right people, and reallocate budget from the ones that don't.",
    steady:      'No step in the funnel is far below plan, and reach is on target.',
    leanIn:      "So we'll lean in on what's working, starting with {metric} ({pct} of target).",
    keepPlan:    "So we'll keep the plan and lean in on what's working."
  },

  /* ---------- The AI prompts on the page ---------- */
  // {dashboard}, {periods} and {funnel} are filled in with your numbers.
  prompts: {
    cfo: "I'm a [role] at a [type of company].\nI want to stress-test my leadership dashboard before I present it, by having you act as a skeptical CFO who sees it for the first time.\nHere is the dashboard as text. The figures are anonymized.\n\n{dashboard}\n\nPlease give me the result as a table with one row per metric: what you think it's telling you, the question a skeptical CFO would ask about it, which decision it supports (lean in, optimize or reallocate), and whether you'd keep, change or cut it.\nTell me what you assumed, and what I should double-check.",
    funnel: "I'm a [role] at a [type of company].\nI want to find where my candidate funnel loses the most people, and whether it's a traffic or an engagement problem.\nHere is my funnel by stage for {periods}:\n{funnel}\nPlease give me the result as a table with the conversion between each stage, the biggest drop, whether it looks like a traffic or an engagement problem, and one suggested move: lean in, optimize or reallocate.\nTell me what you assumed, and what I should double-check."
  }
};
