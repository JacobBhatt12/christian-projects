import type { Testimony } from "../types";

export const TESTIMONIES: Testimony[] = [
  {
    callsign: "FIELD AGENT // NARROW-PATH-04",
    text: "I lost my job two winters ago and thought the silence from heaven meant I'd been forgotten. A stranger paid for my groceries and left a note with Matthew 6:26 on it. I still carry that note. Provision doesn't always look like what you asked for.",
  },
  {
    callsign: "FIELD AGENT // LIGHTBEARER-11",
    text: "I grew up certain God only had patience for people who had it together. It took a hospital room and a chaplain who never once looked at me like a project to learn that grace was never about qualifying.",
  },
  {
    callsign: "FIELD AGENT // WATCHMAN-22",
    text: "Anxiety used to run my mornings before my feet hit the floor. What changed wasn't the absence of fear — it was learning to say the fear out loud to God before I said it to anyone else.",
  },
  {
    callsign: "FIELD AGENT // SOWER-07",
    text: "I prayed for a friend's healing for six years. She's still walking with a limp, and she's still walking with joy nobody can explain. Some prayers get answered in the endurance, not the ending.",
  },
  {
    callsign: "FIELD AGENT // HARBOR-03",
    text: "I came back to church after a decade away expecting judgment. I got a casserole and a seat saved for me the next week without being asked. That's the whole gospel in a crockpot.",
  },
];

export function randomTestimony(): Testimony {
  return TESTIMONIES[Math.floor(Math.random() * TESTIMONIES.length)];
}
