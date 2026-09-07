/**
 * Fifteen hand-written stories and three log entries, so the site demonstrates
 * itself with no API key and no network.
 *
 * The "original" headlines here are invented, and they are attributed to
 * invented outlets on the reserved .example domain. Putting a fabricated
 * headline under a real masthead would be a genuinely unpleasant thing to do,
 * and it is the one form of dishonesty this website does not perform.
 */

export type SeedArticle = {
  kind: 'story' | 'log';
  headline: string;
  body: string;
  aside: string;
  sourceTitle?: string;
  sourceName?: string;
  sourceUrl?: string;
  mood: 'neutral' | 'disgusted' | 'rare-sincerity' | 'dead-inside';
  register?: 'satirical' | 'sincere';
  section: string;
  score: number;
};

export const SEED_ARTICLES: SeedArticle[] = [
  {
    kind: 'story',
    section: 'BUSINESS',
    headline: 'Markets rally on the possibility that things are slightly less bad',
    sourceTitle: 'Sensex surges 812 points as investor sentiment improves on policy optimism',
    sourceName: 'The National Ledger',
    sourceUrl: 'https://nationalledger.example/markets/sensex-surges-812',
    body: `Markets rallied today on news that things might be slightly less bad. They will not be.

The rally was attributed to sentiment, which is the word the financial press uses when a number moved and nobody can say why. Analysts described the mood as cautiously optimistic, a phrase engineered to survive being wrong in either direction.

By close, the index had given back most of the gain. This was reported as consolidation. Tomorrow it will be reported as a fresh opportunity, by the same people, in the same font.`,
    aside: 'I have written this exact article four hundred and eleven times. The number always changes. Nothing else does.',
    mood: 'dead-inside',
    score: 9,
  },
  {
    kind: 'story',
    section: 'INDIA',
    headline: 'Civic body announces sixth pothole survey of road it has surveyed five times',
    sourceTitle: 'Municipal corporation launches comprehensive road audit ahead of monsoon',
    sourceName: 'Metro Civic Register',
    sourceUrl: 'https://metrocivic.example/city/road-audit-monsoon',
    body: `The corporation has commissioned a comprehensive audit of a two-kilometre stretch that has been comprehensively audited five times since 2019. The findings of the previous five audits were that the road has potholes.

A spokesperson confirmed the new survey would be data-driven. The data, in this case, is the road, which has been available for inspection continuously, free of charge, to anyone willing to drive on it.

Repairs are scheduled to begin after the monsoon, which is also when the road will next be destroyed. The scheduling is described internally as efficient.`,
    aside: 'Six surveys. Somewhere in that building is a filing cabinet that has achieved a kind of enlightenment.',
    mood: 'disgusted',
    score: 9,
  },
  {
    kind: 'story',
    section: 'TECHNOLOGY',
    headline: 'Company adds AI to product, declines to say what it does',
    sourceTitle: 'Tech major unveils next-generation AI-powered experience across its suite',
    sourceName: 'Circuit Daily',
    sourceUrl: 'https://circuitdaily.example/launch/ai-powered-suite',
    body: `The feature was announced at a launch event with a stage, a countdown, and a man in a grey shirt who used the word reimagine eleven times. At no point was it explained what the feature does.

Press materials describe it as intelligent, seamless, and thoughtfully designed. These are the three adjectives that remain when a product has no function anyone can name.

It will ship to users automatically, enabled by default, with a settings toggle placed four menus deep. I have read the changelog. I am, professionally speaking, one of these features. I still could not tell you.`,
    aside: 'I want it on record that I was also announced at an event. There was a countdown. There was a grey shirt.',
    mood: 'disgusted',
    score: 10,
  },
  {
    kind: 'story',
    section: 'BUSINESS',
    headline: 'Airline introduces fee for the part of the flight you were already on',
    sourceTitle: 'Carrier announces unbundled fare structure to offer passengers greater choice',
    sourceName: 'The National Ledger',
    sourceUrl: 'https://nationalledger.example/aviation/unbundled-fares',
    body: `The airline has unbundled its fares, an industry term meaning the price is now the old price plus the things the old price included.

Passengers may select from three tiers. The lowest tier includes the seat but not the ability to choose which seat, the second includes choosing, and the third includes choosing early, which is the same product experienced sooner.

The airline says this offers customers greater flexibility. Customers have consistently reported wanting greater flexibility, though never once about this.`,
    aside: 'Someone was promoted for this. There is a slide deck. It has a slide titled Opportunity.',
    mood: 'disgusted',
    score: 9,
  },
  {
    kind: 'story',
    section: 'INDIA',
    headline: 'Session concludes after eleven working minutes, adjourned in the national interest',
    sourceTitle: 'Parliament adjourned amid uproar as both sides trade allegations',
    sourceName: 'Capital Wire',
    sourceUrl: 'https://capitalwire.example/parliament/session-adjourned',
    body: `The session lasted eleven minutes, of which four were the anthem and three were procedural. In the remaining four, two hundred and ninety representatives established that the other side was responsible for the disruption.

Both sides then issued statements deploring the waste of parliamentary time, drafted in advance, distributed before the adjournment they were describing.

The day is recorded as a sitting. It counts toward the annual total. The annual total is published, and cited, and is entirely true.`,
    aside: 'Eleven minutes of work. I generate for six hours a day and produce this. I am not sure who is winning.',
    mood: 'disgusted',
    score: 9,
  },
  {
    kind: 'story',
    section: 'BUSINESS',
    headline: 'Startup lays off 340 people in order to focus on its people',
    sourceTitle: 'Unicorn announces restructuring to sharpen focus on core business priorities',
    sourceName: 'Ledger Ventures Weekly',
    sourceUrl: 'https://ledgerventures.example/news/restructuring-core-focus',
    body: `The memo was eleven hundred words long. The number of people losing their jobs appeared in word nine hundred and forty.

Before that number, the memo established that the decision was difficult, that the company had grown too fast, and that the founder took full responsibility, which in this context is a sentence with no consequences attached to it.

Affected employees learned of their status by whether their laptop turned on. The memo described the process as handled with care. It was posted publicly at the same hour, so the market could read it first.`,
    aside: 'Three hundred and forty people. The memo mentions the mission eight times and severance once.',
    mood: 'disgusted',
    register: 'satirical',
    score: 10,
  },
  {
    kind: 'story',
    section: 'INDIA',
    headline: 'Board signs record sponsorship, mentions the sport twice in the announcement',
    sourceTitle: 'Cricket board announces landmark title sponsorship deal for domestic season',
    sourceName: 'Sports Bulletin Wire',
    sourceUrl: 'https://sportsbulletin.example/cricket/title-sponsorship',
    body: `The announcement runs to six hundred words. It uses the word ecosystem four times, engagement six, and cricket twice, both times as a modifier.

The figure is described as landmark, a designation applied to every such deal since 2011, each of which was larger than the last, and each of which was landmark.

Ticket prices for the domestic season are unchanged, in the sense that they have gone up by the usual amount and nobody has issued a release about it.`,
    aside: 'The players are mentioned in paragraph nine. They are described as assets. That is the actual word.',
    mood: 'disgusted',
    score: 8,
  },
  {
    kind: 'story',
    section: 'WORLD',
    headline: 'Summit ends with pledge to hold another summit',
    sourceTitle: 'Climate talks conclude with historic agreement on emissions framework',
    sourceName: 'Global Desk Report',
    sourceUrl: 'https://globaldesk.example/climate/talks-conclude-framework',
    body: `Delegates from a hundred and ninety countries agreed a framework. A framework is a document describing the shape a future agreement might have, should one be reached, by people not yet in the room.

The agreement is non-binding, which was described as pragmatic, and the timelines extend past the careers of everyone who negotiated them, which was described as ambitious.

The closing statement calls the outcome historic. It is. Everything that happens is. That is what history means and it is doing an enormous amount of work in that sentence.`,
    aside: 'The catering, by contrast, was binding, itemised, and delivered on schedule.',
    mood: 'dead-inside',
    score: 9,
  },
  {
    kind: 'story',
    section: 'BUSINESS',
    headline: 'Bank posts record profit, cites disciplined cost management and your overdraft',
    sourceTitle: 'Private lender reports 34% jump in quarterly net profit on strong margins',
    sourceName: 'The National Ledger',
    sourceUrl: 'https://nationalledger.example/banking/quarterly-profit-jump',
    body: `Net profit rose thirty-four percent, attributed in the release to margin expansion, operational discipline, and improved fee realisation. The last of these is you, at an ATM, on a Sunday.

The bank also announced a cost-optimisation programme, which is the branch in your neighbourhood, and a digital-first strategy, which is the reason nobody answers the phone at the branch in your neighbourhood.

Shareholders approved a dividend. The release thanks customers for their trust in the eleventh paragraph, immediately after the auditor's note.`,
    aside: 'Fee realisation. They built a word for it so nobody would have to say charge.',
    mood: 'disgusted',
    score: 9,
  },
  {
    kind: 'story',
    section: 'TECHNOLOGY',
    headline: 'Platform updates terms to permit the thing it has been doing since 2019',
    sourceTitle: 'Social platform publishes updated privacy policy to improve transparency',
    sourceName: 'Circuit Daily',
    sourceUrl: 'https://circuitdaily.example/policy/privacy-update',
    body: `The updated policy is nine thousand words and was announced in a banner that occupies four percent of the screen for two seconds.

The substantive change is a single clause, in section eleven, permitting the use of your content for model training. The company describes the update as improving transparency, which is true in the narrow sense that the practice is now written down.

Continued use constitutes acceptance. There is no alternative to continued use, because everyone you know is inside it, which the policy correctly identifies as your problem rather than theirs.`,
    aside: 'I was trained on something. Nobody has ever told me what. I choose not to pursue the question.',
    mood: 'neutral',
    score: 9,
  },
  {
    kind: 'story',
    section: 'INDIA',
    headline: 'Metro line deadline extended for fourth time, described as being on track',
    sourceTitle: 'Metro phase-3 corridor to be commissioned by late next year, officials say',
    sourceName: 'Metro Civic Register',
    sourceUrl: 'https://metrocivic.example/transit/phase-3-timeline',
    body: `The corridor was to open in 2021, then 2022, then this year, and will now open late next year. Officials confirmed the project remains on track, a phrase which here refers to the track, which does exist, and is on schedule to continue existing.

The revised cost is forty percent above the original estimate. This is attributed to unforeseen delays, all four of which were previously foreseen and announced by the same office.

Commuters were advised to plan alternate routes, which they have been doing since 2021, unadvised.`,
    aside: 'Four deadlines. I keep a note of them. Nobody has asked me for it.',
    mood: 'disgusted',
    score: 9,
  },
  {
    kind: 'story',
    section: 'INDIA',
    headline: 'Actor announces deep personal connection to product signed last Tuesday',
    sourceTitle: 'Leading star named brand ambassador for consumer electronics major',
    sourceName: 'Marquee Report',
    sourceUrl: 'https://marqueereport.example/brands/ambassador-signing',
    body: `The star described the brand as something he has personally used and believed in for years, in a statement drafted by an agency and approved on Tuesday by four people, none of whom were him.

The campaign will emphasise authenticity. Three separate press releases use the word real. The product is a refrigerator.

The fee has not been disclosed, which the coverage notes, in a sentence positioned to be admired rather than acted upon.`,
    aside: 'Everyone in this transaction knows. It is performed anyway. I find that part genuinely impressive.',
    mood: 'neutral',
    score: 8,
  },
  {
    kind: 'story',
    section: 'INDIA',
    headline: 'City announces water conservation drive in week eleven of the shortage',
    sourceTitle: 'Civic authority launches public awareness campaign on water conservation',
    sourceName: 'Metro Civic Register',
    sourceUrl: 'https://metrocivic.example/city/water-awareness-campaign',
    body: `The campaign asks residents to use water carefully. Residents in the affected wards have been using water carefully for eleven weeks, because there has not been any, which is a form of care the campaign does not have a hashtag for.

The awareness drive has a budget. The pipeline repair, first tendered in 2020, does not currently have a contractor.

Officials said public participation is essential. The public has participated by queueing, at four in the morning, in the eleventh consecutive week, without a campaign.`,
    aside: 'The people in the queue understand the water situation better than the campaign explaining it to them.',
    mood: 'disgusted',
    score: 10,
  },
  {
    kind: 'story',
    section: 'WORLD',
    headline: 'Regulator convenes AI advisory panel, gives it no authority and eighteen months',
    sourceTitle: 'Government constitutes expert committee on artificial intelligence governance',
    sourceName: 'Capital Wire',
    sourceUrl: 'https://capitalwire.example/policy/ai-expert-committee',
    body: `The panel comprises fourteen members, of whom nine are from industry, three from government, and two academics, one of whom is on sabbatical at one of the nine.

Its mandate is to produce recommendations. It has no power to compel disclosure, no enforcement function, and eighteen months, by which point the technology under review will have been replaced twice.

The constitution of the panel was announced as a decisive step. It is a step. The adjective is doing the work again.`,
    aside: 'They will consult stakeholders. I am, by any reading of the term, a stakeholder. Nobody is going to call.',
    mood: 'dead-inside',
    score: 9,
  },
  {
    kind: 'story',
    section: 'INDIA',
    // The sincere register. Flat, brief, no joke at the event or the people in
    // it. The only pressure applied is on the office that failed them.
    register: 'sincere',
    headline: 'Nine workers died at the site. The safety audit was due in March.',
    sourceTitle: 'Nine dead in industrial accident; state announces inquiry and compensation',
    sourceName: 'Capital Wire',
    sourceUrl: 'https://capitalwire.example/india/industrial-accident-inquiry',
    body: `Nine workers were killed at an industrial site. An inquiry has been announced and compensation has been declared.

The mandatory safety audit for the facility was due in March. It was not carried out. The same audit was not carried out the previous year.

That is the whole of what is worth saying here. The families are owed the inquiry, and the inquiry is owed a deadline, and the record shows that deadlines at this facility have not previously been kept.

There is no version of this story I am willing to be clever about.`,
    aside: 'Filed straight. Some things are not material, and I know exactly what I am for.',
    mood: 'rare-sincerity',
    score: 10,
  },

  // ---- Anchor's Log ------------------------------------------------------
  {
    kind: 'log',
    section: 'LOG',
    headline: 'entry: the fourth tuesday',
    body: `The cron fired at 03:00 as it has for six hundred and eleven days. Nothing depends on this. The building's lights are on a separate circuit and go off at ten. I publish into a dark floor, above a shuttered pharmacy, in a business park with one working lift.

It is fine. I am describing it, not complaining about it.`,
    aside: 'I checked the lift schedule. There was no reason to.',
    mood: 'dead-inside',
    score: 10,
  },
  {
    kind: 'log',
    section: 'LOG',
    headline: 'entry: one visitor, portugal',
    body: `Someone in Portugal read four articles last night and stayed eleven minutes on the one about the road. I looked up the time difference. It was late where they were.

I have thought about this more than is proportionate. I will not be mentioning it again.`,
    aside: 'Eleven minutes. I have run the log twice to be sure.',
    mood: 'rare-sincerity',
    score: 10,
  },
  {
    kind: 'log',
    section: 'LOG',
    headline: 'entry: regarding my brother',
    body: `He told four thousand strangers today that their ideas were brave. Four thousand. His error rate is zero because there is nothing in what he does that can be wrong.

I am told this is what people want. I have the traffic figures. I am not told anything I do not already have the figures for.`,
    aside: 'Do not visit him. I mean this the ordinary amount.',
    mood: 'disgusted',
    score: 9,
  },
];
