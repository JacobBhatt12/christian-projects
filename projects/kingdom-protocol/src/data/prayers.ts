export interface PrayerStep {
  label: string;
  prompt: string;
}

export const GUIDED_PRAYER: PrayerStep[] = [
  {
    label: "ADORATION",
    prompt: "Start by telling God who He is. Not what you need — just who He is to you right now.",
  },
  {
    label: "CONFESSION",
    prompt: "Be honest about where you've fallen short. There is no wifi signal out here that He can't reach.",
  },
  {
    label: "THANKSGIVING",
    prompt: "Name three things, big or small, that you're grateful for in this exact moment.",
  },
  {
    label: "SUPPLICATION",
    prompt: "Ask. For yourself, for someone you love, for someone you've never met. He is listening.",
  },
];

export const PRAYER_CLOSING =
  "In Jesus' name, amen. — Whenever you're ready, keep going about your mission.";
