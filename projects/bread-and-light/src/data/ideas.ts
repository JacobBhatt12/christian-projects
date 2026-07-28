import type { ServiceIdea, TimeCategory } from '../types'

interface Context {
  id: string
  name: string
  person: string
  place: string
  detail: string
}

interface IdeaTemplate {
  id: string
  title: (context: Context) => string
  introduction: (context: Context) => string
  steps: (context: Context) => [string, string]
  scripture: string
  scriptureReference: string
  safetyNote?: (context: Context) => string
}

const scriptures = {
  deed: {
    scripture: '“My little children, let us not love in word, neither in tongue; but in deed and in truth.”',
    scriptureReference: '1 John 3:18 (KJV)',
  },
  burdens: {
    scripture: '“Bear ye one another’s burdens, and so fulfil the law of Christ.”',
    scriptureReference: 'Galatians 6:2 (KJV)',
  },
  others: {
    scripture: '“Look not every man on his own things, but every man also on the things of others.”',
    scriptureReference: 'Philippians 2:4 (KJV)',
  },
  good: {
    scripture: '“But to do good and to communicate forget not: for with such sacrifices God is well pleased.”',
    scriptureReference: 'Hebrews 13:16 (KJV)',
  },
  gift: {
    scripture: '“As every man hath received the gift, even so minister the same one to another.”',
    scriptureReference: '1 Peter 4:10 (KJV)',
  },
  withhold: {
    scripture: '“Withhold not good from them to whom it is due, when it is in the power of thine hand to do it.”',
    scriptureReference: 'Proverbs 3:27 (KJV)',
  },
  honour: {
    scripture: '“Be kindly affectioned one to another with brotherly love; in honour preferring one another.”',
    scriptureReference: 'Romans 12:10 (KJV)',
  },
  work: {
    scripture: '“And whatsoever ye do, do it heartily, as to the Lord, and not unto men.”',
    scriptureReference: 'Colossians 3:23 (KJV)',
  },
  together: {
    scripture: '“Two are better than one; because they have a good reward for their labour.”',
    scriptureReference: 'Ecclesiastes 4:9 (KJV)',
  },
  hear: {
    scripture: '“Let every man be swift to hear, slow to speak, slow to wrath.”',
    scriptureReference: 'James 1:19 (KJV)',
  },
} as const

const fifteenContexts: Context[] = [
  { id: 'older-relative', name: 'an older relative', person: 'an older relative you know well', place: 'their home', detail: 'something that would make today feel less hurried' },
  { id: 'nearby-neighbor', name: 'a nearby neighbor', person: 'a neighbor you already know', place: 'your shared street or building', detail: 'one ordinary need around home' },
  { id: 'caregiver', name: 'a caregiver', person: 'a caregiver in your circle', place: 'their usual routine', detail: 'a small pressure they are carrying today' },
  { id: 'church-member', name: 'a church member', person: 'someone from your church community', place: 'your church community', detail: 'a practical concern they have mentioned' },
  { id: 'coworker', name: 'a coworker', person: 'a coworker you interact with', place: 'your workplace', detail: 'one task or encouragement that fits your role' },
  { id: 'teacher', name: 'a teacher', person: 'a teacher you know', place: 'their classroom or school', detail: 'one concrete way their work has mattered' },
  { id: 'student', name: 'a student', person: 'a student you know appropriately', place: 'their school routine', detail: 'a school need they have already named' },
  { id: 'new-parent', name: 'a new parent', person: 'a new parent in your circle', place: 'their home routine', detail: 'a tiny task that may lighten the day' },
  { id: 'friend-in-change', name: 'a friend in transition', person: 'a friend going through a change', place: 'their present season', detail: 'one detail they shared recently' },
  { id: 'local-volunteer', name: 'a local volunteer', person: 'a volunteer at an organization you trust', place: 'their regular place of service', detail: 'a specific contribution you have noticed' },
]

const fifteenTemplates: IdeaTemplate[] = [
  {
    id: 'call',
    title: (c) => `Make a listening call to ${c.name}`,
    introduction: (c) => `A brief call can give ${c.person} room to feel remembered, without needing to solve anything.`,
    steps: (c) => [`Call ${c.person} and ask whether now is a good time for a short check-in.`, `Ask about ${c.detail}, then listen without rushing to offer an answer.`],
    ...scriptures.hear,
    safetyNote: () => 'Keep personal information private, and respect it if the person does not have time to talk.',
  },
  {
    id: 'message',
    title: (c) => `Send ${c.name} a thoughtful message`,
    introduction: () => `A specific, unhurried sentence can be more sustaining than a broad “thinking of you.”`,
    steps: (c) => [`Write one sincere sentence naming ${c.detail}.`, `Send it without expecting an immediate response or turning it into advice.`],
    ...scriptures.honour,
    safetyNote: () => 'Use a communication channel you already share, and do not include sensitive details.',
  },
  {
    id: 'voice-note',
    title: (c) => `Record a kind voice note for ${c.name}`,
    introduction: () => `Hearing a familiar voice can carry warmth that a hurried text sometimes misses.`,
    steps: (c) => [`Record a voice note under two minutes for ${c.person}.`, `Mention ${c.detail} and close with one simple word of care.`],
    ...scriptures.good,
    safetyNote: () => 'Share only through a familiar private channel and avoid recording anyone else without permission.',
  },
  {
    id: 'pray',
    title: (c) => `Pray attentively for ${c.name}`,
    introduction: () => `Quiet attention before God can move care from a vague intention toward faithful presence.`,
    steps: (c) => [`Set aside distractions and name ${c.person} before God.`, `Pray specifically for ${c.detail}, then note one respectful way you might follow up.`],
    ...scriptures.burdens,
  },
  {
    id: 'thanks',
    title: (c) => `Give specific thanks to ${c.name}`,
    introduction: () => `Gratitude becomes a form of care when it names what another person has quietly given.`,
    steps: (c) => [`Choose one true example connected to ${c.place}.`, `Tell ${c.person} what you noticed and why it mattered, without adding a request.`],
    ...scriptures.honour,
  },
  {
    id: 'small-favor',
    title: (c) => `Offer one small favor to ${c.name}`,
    introduction: () => `A clearly bounded offer is easier to receive than a general promise to help sometime.`,
    steps: (c) => [`Think of one safe task related to ${c.detail} that takes no more than fifteen minutes.`, `Offer that exact task to ${c.person}, and gladly accept yes or no.`],
    ...scriptures.withhold,
    safetyNote: () => 'Offer only work you can do safely, and let the other person set the boundary.',
  },
  {
    id: 'useful-item',
    title: (c) => `Share one useful item with ${c.name}`,
    introduction: () => `Something already on hand may meet a small need without creating more work or expense.`,
    steps: (c) => [`Choose a clean, useful item that connects naturally to ${c.detail}.`, `Ask ${c.person} whether it would help before bringing or sending it.`],
    ...scriptures.good,
    safetyNote: () => 'Check food ingredients, expiration dates, cleanliness, and personal preferences before sharing.',
  },
  {
    id: 'digital-help',
    title: (c) => `Help ${c.name} with one safe digital task`,
    introduction: () => `A familiar setting or small online task can be a needless point of friction for someone else.`,
    steps: (c) => [`Ask ${c.person} to name one non-sensitive digital task they would like help understanding.`, `Talk them through it while they keep control of the device and all passwords.`],
    ...scriptures.gift,
    safetyNote: () => 'Never request passwords, financial details, private messages, or remote access. Let the device owner make every sensitive choice.',
  },
  {
    id: 'shared-space',
    title: (c) => `Care for a space used by ${c.name}`,
    introduction: () => `A small act of order can quietly honor the people who use a place every day.`,
    steps: (c) => [`Choose one permitted surface or shared area at ${c.place}.`, `Spend fifteen minutes tidying, wiping, or returning items where they belong.`],
    ...scriptures.work,
    safetyNote: () => 'Get permission, use familiar cleaning products, and avoid hazardous waste, heavy lifting, or private belongings.',
  },
  {
    id: 'resource',
    title: (c) => `Find one reliable resource for ${c.name}`,
    introduction: () => `A verified phone number, schedule, or local service can remove one small barrier without overstepping.`,
    steps: (c) => [`Look for one official resource related to ${c.detail}.`, `Send ${c.person} the source and a short note explaining what you verified, leaving the decision with them.`],
    ...scriptures.others,
    safetyNote: () => 'Use official sources, do not submit information for someone else, and never share their private details.',
  },
]

const hourContexts: Context[] = [
  { id: 'relative-home', name: 'a relative’s household', person: 'a relative who welcomes your help', place: 'their home', detail: 'a household task they have named' },
  { id: 'older-neighbor', name: 'an older neighbor', person: 'an older neighbor you know', place: 'their home or yard', detail: 'one light task that has become inconvenient' },
  { id: 'church-family', name: 'a church family', person: 'a family from your church', place: 'their home or church', detail: 'a practical need they have shared' },
  { id: 'busy-coworker', name: 'a busy coworker', person: 'a coworker who has welcomed help', place: 'your shared workplace', detail: 'one ordinary task within your role' },
  { id: 'family-caregiver', name: 'a family caregiver', person: 'a caregiver you know well', place: 'their home routine', detail: 'one responsibility that can be safely shared' },
  { id: 'local-teacher', name: 'a local teacher', person: 'a teacher who has asked for support', place: 'their classroom or school', detail: 'an approved classroom need' },
  { id: 'college-student', name: 'a college student', person: 'a student in your circle', place: 'their home or campus routine', detail: 'one practical pressure they have mentioned' },
  { id: 'food-pantry', name: 'an established food pantry', person: 'the pantry coordinator', place: 'an established food pantry', detail: 'a current need listed by the pantry' },
  { id: 'public-library', name: 'a public library', person: 'the library staff', place: 'your public library', detail: 'an approved volunteer or supply need' },
  { id: 'clothing-closet', name: 'a verified clothing closet', person: 'the closet coordinator', place: 'a verified clothing closet', detail: 'their current sorting or preparation need' },
]

const hourTemplates: IdeaTemplate[] = [
  {
    id: 'household-task',
    title: (c) => `Complete one practical task for ${c.name}`,
    introduction: (c) => `Finishing one ordinary job can return a little attention to ${c.person}.`,
    steps: (c) => [`Confirm one task connected to ${c.detail} and gather only the supplies it requires.`, `Complete the task at ${c.place}, then leave the space ready to use.`],
    ...scriptures.deed,
    safetyNote: () => 'Get permission and avoid heights, hazardous materials, heavy lifting, or work that requires licensed training.',
  },
  {
    id: 'simple-meal',
    title: (c) => `Prepare a simple meal for ${c.name}`,
    introduction: () => `A modest, familiar meal can make one demanding day easier without needing to be elaborate.`,
    steps: (c) => [`Ask ${c.person} about allergies, dietary needs, timing, and whether a meal would be welcome.`, `Prepare or purchase a simple dish, label its ingredients, and arrange a convenient handoff at ${c.place}.`],
    ...scriptures.good,
    safetyNote: () => 'Follow food-safety guidance, disclose ingredients, respect dietary restrictions, and keep hot or cold food at safe temperatures.',
  },
  {
    id: 'care-package',
    title: (c) => `Make a useful care package for ${c.name}`,
    introduction: () => `A few chosen necessities can communicate attention without becoming a display.`,
    steps: (c) => [`Check what would actually support ${c.detail} before choosing items.`, `Pack a few clean, appropriate items with a short note, then arrange delivery with ${c.person}.`],
    ...scriptures.others,
    safetyNote: () => 'Confirm allergies, organizational rules, and delivery preferences. Do not include unrequested medicines or personal data.',
  },
  {
    id: 'nearby-errand',
    title: (c) => `Run one nearby errand for ${c.name}`,
    introduction: () => `One clearly defined errand can remove a real piece of friction from the day.`,
    steps: (c) => [`Ask ${c.person} for one nearby errand related to ${c.detail}, including the exact budget and handoff plan.`, `Complete only the agreed errand, keep the receipt, and return change or payment details clearly.`],
    ...scriptures.withhold,
    safetyNote: () => 'Use safe transportation, do not handle accounts or sensitive documents, and agree on costs before leaving.',
  },
  {
    id: 'technology',
    title: (c) => `Untangle one technology task for ${c.name}`,
    introduction: () => `Patient guidance can make a familiar device feel usable again while preserving the owner’s control.`,
    steps: (c) => [`Invite ${c.person} to choose one non-sensitive device task they want to learn.`, `Explain each step slowly, write down the process, and let them enter all passwords or private information.`],
    ...scriptures.gift,
    safetyNote: () => 'Do not access banking, medical records, private messages, passwords, or unknown downloads. Keep the owner present and in control.',
  },
  {
    id: 'outdoor-job',
    title: (c) => `Do one light outdoor job for ${c.name}`,
    introduction: () => `Simple work outside can ease a burden when it stays within your ability and the weather.`,
    steps: (c) => [`Agree on one light job at ${c.place}, such as sweeping a walk, watering, or gathering small branches.`, `Use familiar tools for up to one hour and leave anything heavy, elevated, electrical, or chemical to a professional.`],
    ...scriptures.work,
    safetyNote: () => 'Check weather and footing, wear appropriate protection, and stop if the work, tools, heat, or lifting become unsafe.',
  },
  {
    id: 'listening-hour',
    title: (c) => `Give an unhurried hour to ${c.name}`,
    introduction: () => `Focused listening can be practical care when another person has carried too much alone.`,
    steps: (c) => [`Ask ${c.person} whether they would welcome a quiet conversation at a familiar place.`, `Listen to what they want to share about ${c.detail}; ask before offering advice or prayer.`],
    ...scriptures.hear,
    safetyNote: () => 'Meet in a familiar, appropriate setting, preserve privacy, and seek qualified help if someone may be in immediate danger.',
  },
  {
    id: 'verified-donation',
    title: (c) => `Sort a verified donation for ${c.name}`,
    introduction: () => `Useful giving begins with what is requested, clean, complete, and ready for someone else to use.`,
    steps: (c) => [`Check the current donation guidelines for ${c.place} or ask ${c.person}.`, `Sort, clean, label, and pack only accepted items connected to ${c.detail}.`],
    ...scriptures.good,
    safetyNote: () => 'Use current official guidelines. Do not donate recalled, expired, opened, broken, stained, or unsafe goods.',
  },
  {
    id: 'volunteer-prep',
    title: (c) => `Prepare for service with ${c.name}`,
    introduction: () => `Quiet preparation helps a future commitment begin with steadiness rather than hurry.`,
    steps: (c) => [`Confirm the approved need, schedule, contact person, and any requirements with ${c.person}.`, `Spend the remaining time gathering permitted supplies, planning transportation, and writing down what you need to know.`],
    ...scriptures.together,
    safetyNote: () => 'Use verified contact information, complete required screening, and do not arrive or bring supplies without approval.',
  },
  {
    id: 'ordinary-organization',
    title: (c) => `Organize one ordinary task for ${c.name}`,
    introduction: () => `A small amount of order can make the next necessary step easier to see.`,
    steps: (c) => [`Ask ${c.person} to choose one non-sensitive task tied to ${c.detail}, such as a supply shelf or shared checklist.`, `Work beside them or follow their directions, labeling only what they approve and stopping after one hour.`],
    ...scriptures.burdens,
    safetyNote: () => 'Do not handle financial, medical, legal, personnel, or other confidential records. Let the owner decide what is kept or discarded.',
  },
]

const afternoonContexts: Context[] = [
  { id: 'recovering-friend', name: 'a friend who is recovering', person: 'a friend recovering from illness or a difficult season', place: 'a place they choose', detail: 'a practical need they have named' },
  { id: 'extended-family', name: 'an extended-family household', person: 'relatives who have welcomed your help', place: 'their home or neighborhood', detail: 'one shared responsibility' },
  { id: 'trusted-neighbor', name: 'a trusted neighbor', person: 'a neighbor you already know', place: 'your neighborhood', detail: 'a visible, ordinary need nearby' },
  { id: 'known-caregiver', name: 'a caregiver you know', person: 'a caregiver in an established relationship', place: 'their familiar routine', detail: 'one approved responsibility that offers real breathing room' },
  { id: 'church-ministry', name: 'a church ministry', person: 'the ministry leader', place: 'your church', detail: 'a current, approved ministry need' },
  { id: 'verified-pantry', name: 'a verified food pantry', person: 'the volunteer coordinator', place: 'a verified food pantry', detail: 'the pantry’s current priority' },
  { id: 'community-library', name: 'a community library', person: 'the library volunteer coordinator', place: 'a public or community library', detail: 'an approved program or preparation need' },
  { id: 'senior-center', name: 'an established senior center', person: 'the center’s volunteer coordinator', place: 'an established senior center', detail: 'a scheduled activity or practical need' },
  { id: 'community-garden', name: 'a community garden', person: 'the garden coordinator', place: 'an established community garden', detail: 'a posted seasonal task' },
  { id: 'outreach-program', name: 'a verified outreach program', person: 'the program’s volunteer coordinator', place: 'a verified outreach program', detail: 'one approved service assignment' },
]

const afternoonTemplates: IdeaTemplate[] = [
  {
    id: 'volunteer-shift',
    title: (c) => `Serve a verified shift with ${c.name}`,
    introduction: () => `Showing up for a defined role can strengthen work that trusted people are already doing well.`,
    steps: (c) => [`Contact ${c.person} through an official channel and confirm a suitable afternoon assignment tied to ${c.detail}.`, `Complete the approved orientation and shift at ${c.place}, following staff direction from beginning to end.`],
    ...scriptures.gift,
    safetyNote: () => 'Volunteer only through verified organizations, follow screening and supervision rules, and do not work alone with unfamiliar or vulnerable people.',
  },
  {
    id: 'unhurried-visit',
    title: (c) => `Make an unhurried visit with ${c.name}`,
    introduction: () => `Presence becomes a gift when the other person chooses the time, place, and pace.`,
    steps: (c) => [`Ask ${c.person} whether a visit would be welcome and let them choose ${c.place} and the length.`, `Bring only what was requested, listen well, and leave while the visit still feels helpful.`],
    ...scriptures.honour,
    safetyNote: () => 'Visit only in a familiar, appropriate setting. Respect health precautions, privacy, household boundaries, and a changed answer.',
  },
  {
    id: 'caregiver-relief',
    title: (c) => `Give practical breathing room to ${c.name}`,
    introduction: () => `A few dependable hours can help someone rest, attend to errands, or simply be quiet.`,
    steps: (c) => [`Ask ${c.person} which approved task connected to ${c.detail} would create meaningful breathing room.`, `Follow their written routine and boundaries exactly, and remain reachable until they return or the agreed time ends.`],
    ...scriptures.burdens,
    safetyNote: () => 'Only provide caregiving you are known, authorized, and competent to give. Never administer medicine or perform personal care without proper training and consent.',
  },
  {
    id: 'community-cleanup',
    title: (c) => `Join an approved cleanup for ${c.name}`,
    introduction: () => `Caring for a shared place can serve many people quietly and without needing recognition.`,
    steps: (c) => [`Confirm an organized cleanup or obtain permission from ${c.person} for a specific area at ${c.place}.`, `Wear suitable protection, follow disposal rules, and work only on ordinary litter, leaves, or light garden debris.`],
    ...scriptures.work,
    safetyNote: () => 'Do not touch needles, chemicals, broken glass, human waste, traffic hazards, or unknown materials. Alert the responsible authority instead.',
  },
  {
    id: 'batch-cook',
    title: (c) => `Batch-cook simple meals for ${c.name}`,
    introduction: () => `Several modest portions can make future days gentler when they are prepared around real needs.`,
    steps: (c) => [`Confirm quantity, allergies, storage space, dietary needs, and delivery timing with ${c.person}.`, `Prepare a simple approved recipe, label ingredients and dates, cool and store it safely, then arrange the handoff.`],
    ...scriptures.deed,
    safetyNote: () => 'Follow current food-safety guidance, prevent cross-contamination, disclose every ingredient, and maintain safe temperatures during delivery.',
  },
  {
    id: 'donation-project',
    title: (c) => `Organize a requested donation for ${c.name}`,
    introduction: () => `A focused collection is useful when it begins with the recipient’s current list rather than assumed needs.`,
    steps: (c) => [`Get a current written list and delivery instructions from ${c.person} for ${c.detail}.`, `Collect or sort only accepted items, inspect and label them, then deliver at the scheduled time to ${c.place}.`],
    ...scriptures.others,
    safetyNote: () => 'Do not collect money without authorization. Follow official guidelines and reject expired, opened, recalled, damaged, or unrequested goods.',
  },
  {
    id: 'safe-repair',
    title: (c) => `Help with a safe repair for ${c.name}`,
    introduction: () => `A small, familiar repair can restore usefulness when it stays well inside your experience.`,
    steps: (c) => [`Ask ${c.person} to identify one low-risk repair related to ${c.detail}, such as sewing a hem or tightening accessible hardware.`, `Use familiar hand tools, protect the work area, and stop if the repair reveals electrical, structural, gas, plumbing, height, or hazardous-material concerns.`],
    ...scriptures.withhold,
    safetyNote: () => 'Attempt only work you already know how to do safely. Leave licensed, structural, powered, elevated, or hazardous work to qualified professionals.',
  },
  {
    id: 'gathering-prep',
    title: (c) => `Prepare a gathering with ${c.name}`,
    introduction: () => `Behind-the-scenes preparation can let staff and guests give their attention to people instead of loose ends.`,
    steps: (c) => [`Confirm the schedule and one approved setup assignment with ${c.person}.`, `Arrange permitted materials at ${c.place}, complete the task to their plan, and leave clear notes about anything unfinished.`],
    ...scriptures.together,
    safetyNote: () => 'Follow facility rules, use lifting help and proper equipment, and do not handle keys, private records, food, or electrical systems without authorization.',
  },
  {
    id: 'appointment-support',
    title: (c) => `Support an ordinary appointment for ${c.name}`,
    introduction: () => `A calm companion can make transportation, waiting, and remembering next steps less burdensome.`,
    steps: (c) => [`Ask ${c.person} what support they want, such as a ride, company in the waiting area, or help carrying ordinary items.`, `Confirm the route and timing, preserve their privacy, and let them lead every conversation and decision.`],
    ...scriptures.others,
    safetyNote: () => 'Use safe transportation and proper insurance. Do not interpret medical, legal, or financial advice, sign documents, or enter private consultations without explicit invitation.',
  },
  {
    id: 'neighborhood-project',
    title: (c) => `Complete a trusted service project for ${c.name}`,
    introduction: () => `One defined project can meet a real local need when responsibility and permission are clear.`,
    steps: (c) => [`Agree with ${c.person} on one afternoon-sized project connected to ${c.detail}, including supplies, boundaries, and the finish point.`, `Work with at least one trusted person where appropriate, follow the plan, and leave ${c.place} safe and orderly.`],
    ...scriptures.together,
    safetyNote: () => 'Do not enter unsafe or private areas, work alone with strangers, use unfamiliar tools, or continue beyond your physical ability and the agreed scope.',
  },
]

function buildPool(
  timeCategory: TimeCategory,
  timeLabel: string,
  templates: IdeaTemplate[],
  contexts: Context[],
): ServiceIdea[] {
  return templates.flatMap((template) =>
    contexts.map((context) => ({
      id: `${timeCategory}-${template.id}-${context.id}`,
      timeCategory,
      timeLabel,
      title: template.title(context),
      introduction: template.introduction(context),
      steps: template.steps(context),
      scripture: template.scripture,
      scriptureReference: template.scriptureReference,
      safetyNote: template.safetyNote?.(context),
    })),
  )
}

export const ideasByTime: Record<TimeCategory, ServiceIdea[]> = {
  fifteen: buildPool('fifteen', '15 minutes', fifteenTemplates, fifteenContexts),
  hour: buildPool('hour', 'One hour', hourTemplates, hourContexts),
  afternoon: buildPool('afternoon', 'One afternoon', afternoonTemplates, afternoonContexts),
}

for (const [category, pool] of Object.entries(ideasByTime)) {
  if (pool.length !== 100) {
    throw new Error(`Bread & Light data error: ${category} must contain exactly 100 ideas, but contains ${pool.length}.`)
  }
}

export const totalIdeaCount = Object.values(ideasByTime).reduce((total, pool) => total + pool.length, 0)
