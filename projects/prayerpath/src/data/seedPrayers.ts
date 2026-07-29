import type { Prayer } from '../types'

const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const seedPrayers: Prayer[] = [
  {
    id: 'seed-1',
    title: "Mom's knee surgery",
    request:
      "Praying her surgery next week goes smoothly and that the recovery afterward isn't too painful.",
    category: 'health',
    note: "She's more nervous than she's letting on. Trying to remind her (and myself) that God's been faithful through the harder stuff before.",
    createdAt: daysAgo(6),
    answered: false,
  },
  {
    id: 'seed-2',
    title: 'Patience with my brother',
    request:
      "Lord, help me be more patient with my brother. We've been arguing more than usual lately and I want to respond better than I have been.",
    category: 'family',
    note: "Still working on this one. Some days are better than others.",
    createdAt: daysAgo(11),
    answered: false,
  },
  {
    id: 'seed-3',
    title: 'A youth pastor for the church',
    request: 'Praying our church finds the right person to lead the youth group this year.',
    category: 'church',
    note: 'The search committee meets again in two weeks. Hoping for clarity, not just candidates.',
    createdAt: daysAgo(20),
    answered: false,
  },
  {
    id: 'seed-4',
    title: 'Interview at Hendricks',
    request:
      "Asking for peace before Thursday's interview, and that it goes well if it's actually the right fit for us.",
    category: 'work',
    note: 'Trying hard not to spiral about money while we wait.',
    createdAt: daysAgo(45),
    answered: true,
    answeredAt: daysAgo(30),
    answerNote:
      "Got the offer the following Monday. Started three weeks later. Still can't quite believe how it came together.",
  },
  {
    id: 'seed-5',
    title: 'Grateful for this apartment',
    request:
      "Just want to say thank you for helping us find this place after months of looking and almost giving up.",
    category: 'gratitude',
    note: 'Writing this down so I remember how anxious we were before it worked out.',
    createdAt: daysAgo(60),
    answered: false,
  },
]
