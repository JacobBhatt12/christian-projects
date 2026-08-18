import type { Mission } from "../types";

export const MISSIONS: Mission[] = [
  {
    title: "SEND ENCOURAGEMENT",
    detail: "Text or call someone who feels forgotten today. Tell them exactly why you're grateful for them.",
  },
  {
    title: "FEED THE HUNGRY",
    detail: "Volunteer a few hours at a local food pantry or shelter this week, or donate a bag of groceries.",
  },
  {
    title: "WRITE A LETTER",
    detail: "Write a handwritten note of hope to someone who is sick, grieving, or far from home.",
  },
  {
    title: "FORGIVE QUIETLY",
    detail: "Let go of one grudge today. Pray for the person by name before the sun sets.",
  },
  {
    title: "GIVE ANONYMOUSLY",
    detail: "Cover a stranger's coffee, meal, or bill today and leave before they can thank you.",
  },
  {
    title: "VISIT THE LONELY",
    detail: "Spend an hour at a nursing home or hospital. Bring your presence, not just a gift.",
  },
  {
    title: "MENTOR SOMEONE",
    detail: "Offer to teach a skill you have — coding, budgeting, reading — to someone who wants to learn.",
  },
  {
    title: "SERVE YOUR CHURCH",
    detail: "Ask your local church what quiet, unglamorous need you could fill this month.",
  },
  {
    title: "OPEN YOUR TABLE",
    detail: "Invite someone who is new or isolated to share a meal with your family this week.",
  },
  {
    title: "PRAY ON SIGHT",
    detail: "The next time someone shares a struggle with you, ask if you can pray for them right then.",
  },
  {
    title: "RESTORE A RELATIONSHIP",
    detail: "Reach out first to someone you've drifted from. Extend the olive branch without conditions.",
  },
  {
    title: "SHARE YOUR STORY",
    detail: "Tell one honest sentence about how your faith has carried you through a hard season.",
  },
];

export function randomMission(): Mission {
  return MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
}
